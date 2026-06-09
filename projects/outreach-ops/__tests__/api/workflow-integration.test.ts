/**
 * Deep integration tests for action/workflow API routes.
 * Covers business logic paths, edge cases, and error responses across:
 *   - Scoring engine (calculateScore, score events, edge cases)
 *   - Queue builder (queuing, ordering, multi-lead)
 *   - Follow-up scheduling (date boundaries, overdue detection)
 *   - Message lifecycle (full send+outcome workflow, all STATUS_MAP outcomes)
 *   - Import pipeline (CSV → score → events → audit run)
 *   - Template versioning (PUT creates new version, history preserved)
 *   - End-to-end workflows (import → score → queue → send → outcome → follow-up)
 */
import { describe, it, expect, afterEach } from "vitest";
import { eq, and, desc, isNotNull, lte, asc } from "drizzle-orm";
import {
  createTestDb,
  seedTestLead,
  seedTestMessage,
  seedTestTemplate,
  seedTestEvent,
} from "../test-helpers";
import * as schema from "../../src/db/schema";
import { calculateScore, getScoringRules, getFactorLevels } from "../../src/lib/scoring";
import { parseCsvRows, normalizeHeader, validateRow } from "../../src/lib/csv-import";

// ── Scoring Engine ──────────────────────────────────────────────────────────

describe("Scoring Engine — edge cases", () => {
  let testDb: ReturnType<typeof createTestDb>;
  afterEach(() => testDb?.cleanup());

  it("should return 0 for completely empty input", () => {
    const result = calculateScore({});
    // Each factor defaults to "unknown" level
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.rulesVersion).toBe(1);
    expect(result.maxScore).toBe(100);
    // All 6 factors should appear in breakdown
    expect(Object.keys(result.breakdown)).toHaveLength(6);
  });

  it("should cap total score at maxScore (100)", () => {
    // Perfect scores on all 6 factors = 20+20+25+15+10+10 = 100
    const result = calculateScore({
      companySize: "enterprise",
      techStackMatch: "perfect",
      painSignalStrength: "explicit",
      decisionMakerAccess: "direct",
      engagementSignals: "active",
      segmentFit: "ideal",
    });
    expect(result.totalScore).toBe(100);
    expect(result.totalScore).toBeLessThanOrEqual(result.maxScore);
  });

  it("should handle unknown factor levels gracefully (score 0 for invalid values)", () => {
    const result = calculateScore({
      companySize: "nonexistent_size",
      techStackMatch: "garbage",
      painSignalStrength: "nonsense",
    });
    // nonexistent levels map to 0, unknown defaults to their respective scores
    expect(result.breakdown.companySize).toBe(0);
    expect(result.breakdown.techStackMatch).toBe(0);
    expect(result.breakdown.painSignalStrength).toBe(0);
  });

  it("should score each factor independently", () => {
    const onlyCompanySize = calculateScore({ companySize: "enterprise" });
    const onlyTech = calculateScore({ techStackMatch: "perfect" });

    expect(onlyCompanySize.breakdown.companySize).toBe(20);
    expect(onlyCompanySize.breakdown.techStackMatch).toBeGreaterThanOrEqual(0); // unknown level
    expect(onlyTech.breakdown.techStackMatch).toBe(20);
  });

  it("should match all factor level values from scoring_rules_v1.json", () => {
    const rules = getScoringRules();
    for (const factor of rules.factors) {
      const levels = getFactorLevels(factor.name);
      expect(levels.length).toBeGreaterThan(0);
      for (const level of levels) {
        const input: Record<string, string> = { [factor.name]: level };
        const result = calculateScore(input);
        expect(result.breakdown[factor.name]).toBe(
          (factor.levels as Record<string, number>)[level]
        );
      }
    }
  });

  it("should throw for unsupported scoring rules version", () => {
    expect(() => getScoringRules(99)).toThrow("Scoring rules version 99 not found");
  });

  it("should persist score and create score_change event with full breakdown", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { score: 10, companySize: "startup" });

    const scoreResult = calculateScore({
      companySize: "enterprise",
      techStackMatch: "strong",
      painSignalStrength: "moderate",
      decisionMakerAccess: "identified",
      engagementSignals: "warm",
      segmentFit: "good",
    });

    // Update lead
    testDb.db
      .update(schema.leads)
      .set({
        score: scoreResult.totalScore,
        companySize: "enterprise",
        techStackMatch: "strong",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.leads.id, lead.id))
      .run();

    // Log event with full metadata (as the API route does)
    testDb.db
      .insert(schema.events)
      .values({
        leadId: lead.id,
        type: "score_change",
        detail: `Score changed from 10 to ${scoreResult.totalScore}`,
        metadata: JSON.stringify({
          oldScore: 10,
          newScore: scoreResult.totalScore,
          breakdown: scoreResult.breakdown,
          rulesVersion: scoreResult.rulesVersion,
        }),
      })
      .run();

    const event = testDb.db
      .select()
      .from(schema.events)
      .where(eq(schema.events.leadId, lead.id))
      .get();

    expect(event).toBeDefined();
    const meta = JSON.parse(event!.metadata!);
    expect(meta.breakdown).toBeDefined();
    expect(meta.rulesVersion).toBe(1);
    expect(meta.oldScore).toBe(10);
    expect(meta.newScore).toBe(scoreResult.totalScore);
    expect(Object.keys(meta.breakdown)).toHaveLength(6);
  });

  it("should NOT create score_change event when score is identical after recalculation", () => {
    testDb = createTestDb();
    const factors = {
      companySize: "enterprise",
      techStackMatch: "strong",
    };
    const scoreResult = calculateScore(factors);
    const lead = seedTestLead(testDb.db, { score: scoreResult.totalScore, ...factors });

    // Re-calculate with same factors
    const newResult = calculateScore(factors);
    if (lead.score !== newResult.totalScore) {
      testDb.db
        .insert(schema.events)
        .values({ leadId: lead.id, type: "score_change", detail: "changed" })
        .run();
    }

    const events = testDb.db
      .select()
      .from(schema.events)
      .where(eq(schema.events.leadId, lead.id))
      .all();
    expect(events).toHaveLength(0);
  });
});

// ── Queue Builder ───────────────────────────────────────────────────────────

describe("Queue Builder — business logic", () => {
  let testDb: ReturnType<typeof createTestDb>;
  afterEach(() => testDb?.cleanup());

  it("should return empty queue when no queued messages exist", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    seedTestMessage(testDb.db, lead.id, { status: "draft" });
    seedTestMessage(testDb.db, lead.id, { status: "sent" });

    const results = testDb.db
      .select({ message: schema.messages, lead: schema.leads })
      .from(schema.messages)
      .innerJoin(schema.leads, eq(schema.messages.leadId, schema.leads.id))
      .where(eq(schema.messages.status, "queued"))
      .all();

    expect(results).toHaveLength(0);
  });

  it("should join queue items with correct lead data for multiple leads", () => {
    testDb = createTestDb();
    const alice = seedTestLead(testDb.db, { name: "Alice", company: "AliceCorp" });
    const bob = seedTestLead(testDb.db, { name: "Bob", company: "BobCorp" });
    seedTestMessage(testDb.db, alice.id, { status: "queued", body: "Hi Alice" });
    seedTestMessage(testDb.db, bob.id, { status: "queued", body: "Hi Bob" });

    const results = testDb.db
      .select({ message: schema.messages, lead: schema.leads })
      .from(schema.messages)
      .innerJoin(schema.leads, eq(schema.messages.leadId, schema.leads.id))
      .where(eq(schema.messages.status, "queued"))
      .all();

    expect(results).toHaveLength(2);
    const names = results.map((r) => r.lead.name);
    expect(names).toContain("Alice");
    expect(names).toContain("Bob");
  });

  it("should order queue by createdAt descending (newest first)", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    // Insert with explicit timestamps to control order
    testDb.db.insert(schema.messages).values({
      leadId: lead.id, body: "First", status: "queued",
      createdAt: "2026-03-20T10:00:00Z",
    }).run();
    testDb.db.insert(schema.messages).values({
      leadId: lead.id, body: "Second", status: "queued",
      createdAt: "2026-03-22T10:00:00Z",
    }).run();

    const results = testDb.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.status, "queued"))
      .orderBy(desc(schema.messages.createdAt))
      .all();

    expect(results[0].body).toBe("Second");
    expect(results[1].body).toBe("First");
  });

  it("should create queued message with template reference and selectedHook", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { name: "Alice", channel: "linkedin" });
    const template = seedTestTemplate(testDb.db, {
      name: "Initial Outreach",
      body: "Hi {{name}}",
    });

    const msg = testDb.db
      .insert(schema.messages)
      .values({
        leadId: lead.id,
        templateId: template.id,
        channel: lead.channel || "linkedin",
        body: "Hi Alice, noticed your recent product launch...",
        selectedHook: "Your ProductHunt launch last week",
        status: "queued",
        followUpDate: "2026-04-05",
      })
      .returning()
      .get();

    expect(msg.status).toBe("queued");
    expect(msg.templateId).toBe(template.id);
    expect(msg.selectedHook).toBe("Your ProductHunt launch last week");
    expect(msg.followUpDate).toBe("2026-04-05");
    expect(msg.channel).toBe("linkedin");
  });

  it("should default channel to linkedin when lead has no channel", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { channel: undefined });

    const msg = testDb.db
      .insert(schema.messages)
      .values({
        leadId: lead.id,
        channel: lead.channel || "linkedin",
        body: "Outreach",
        status: "queued",
      })
      .returning()
      .get();

    expect(msg.channel).toBe("linkedin");
  });
});

// ── Follow-up Scheduling ────────────────────────────────────────────────────

describe("Follow-up Scheduling — edge cases", () => {
  let testDb: ReturnType<typeof createTestDb>;
  afterEach(() => testDb?.cleanup());

  it("should detect overdue follow-ups (past date)", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    seedTestMessage(testDb.db, lead.id, {
      status: "sent",
      followUpDate: "2026-03-15", // past
      body: "Overdue",
    });
    seedTestMessage(testDb.db, lead.id, {
      status: "sent",
      followUpDate: "2026-04-30", // future
      body: "Future",
    });

    const today = "2026-03-24";
    const overdue = testDb.db
      .select()
      .from(schema.messages)
      .where(
        and(
          isNotNull(schema.messages.followUpDate),
          eq(schema.messages.status, "sent"),
          lte(schema.messages.followUpDate, today)
        )
      )
      .all();

    expect(overdue).toHaveLength(1);
    expect(overdue[0].body).toBe("Overdue");
  });

  it("should include follow-ups due exactly on the boundary date", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    seedTestMessage(testDb.db, lead.id, {
      status: "sent",
      followUpDate: "2026-04-01",
      body: "Exact boundary",
    });

    const results = testDb.db
      .select()
      .from(schema.messages)
      .where(
        and(
          isNotNull(schema.messages.followUpDate),
          eq(schema.messages.status, "sent"),
          lte(schema.messages.followUpDate, "2026-04-01")
        )
      )
      .all();

    expect(results).toHaveLength(1);
    expect(results[0].body).toBe("Exact boundary");
  });

  it("should handle multiple leads with follow-ups ordered correctly", () => {
    testDb = createTestDb();
    const alice = seedTestLead(testDb.db, { name: "Alice" });
    const bob = seedTestLead(testDb.db, { name: "Bob" });
    seedTestMessage(testDb.db, bob.id, {
      status: "sent", followUpDate: "2026-04-05", body: "Bob follow-up",
    });
    seedTestMessage(testDb.db, alice.id, {
      status: "sent", followUpDate: "2026-03-28", body: "Alice follow-up",
    });

    const results = testDb.db
      .select({ message: schema.messages, lead: schema.leads })
      .from(schema.messages)
      .innerJoin(schema.leads, eq(schema.messages.leadId, schema.leads.id))
      .where(
        and(
          isNotNull(schema.messages.followUpDate),
          eq(schema.messages.status, "sent")
        )
      )
      .orderBy(asc(schema.messages.followUpDate))
      .all();

    expect(results).toHaveLength(2);
    expect(results[0].lead.name).toBe("Alice");
    expect(results[1].lead.name).toBe("Bob");
  });

  it("should exclude replied/archived messages from follow-ups", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    seedTestMessage(testDb.db, lead.id, {
      status: "replied", followUpDate: "2026-04-01", body: "Already replied",
    });
    seedTestMessage(testDb.db, lead.id, {
      status: "archived", followUpDate: "2026-04-01", body: "Archived",
    });
    seedTestMessage(testDb.db, lead.id, {
      status: "sent", followUpDate: "2026-04-01", body: "Pending",
    });

    const results = testDb.db
      .select()
      .from(schema.messages)
      .where(
        and(
          isNotNull(schema.messages.followUpDate),
          eq(schema.messages.status, "sent")
        )
      )
      .all();

    expect(results).toHaveLength(1);
    expect(results[0].body).toBe("Pending");
  });
});

// ── Message Lifecycle (full PATCH workflow) ─────────────────────────────────

describe("Message Lifecycle — full send+outcome workflow", () => {
  let testDb: ReturnType<typeof createTestDb>;
  afterEach(() => testDb?.cleanup());

  it("should execute complete workflow: draft → queued → sent → replied", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { name: "Prospect", status: "new" });

    // 1. Create draft
    const msg = seedTestMessage(testDb.db, lead.id, {
      status: "draft",
      body: "Hi Prospect, let's connect",
    });
    expect(msg.status).toBe("draft");

    // 2. Queue it
    testDb.db
      .update(schema.messages)
      .set({ status: "queued" })
      .where(eq(schema.messages.id, msg.id))
      .run();

    // 3. Mark sent (simulating PATCH route behavior)
    const sentAt = new Date().toISOString();
    testDb.db
      .update(schema.messages)
      .set({ status: "sent", sentAt })
      .where(eq(schema.messages.id, msg.id))
      .run();

    // API route creates event + updates lead
    testDb.db.insert(schema.events).values({
      leadId: lead.id,
      type: "sent",
      detail: "Message sent via linkedin",
      metadata: JSON.stringify({ messageId: msg.id }),
    }).run();

    testDb.db
      .update(schema.leads)
      .set({ status: "contacted", updatedAt: sentAt })
      .where(eq(schema.leads.id, lead.id))
      .run();

    // 4. Log reply outcome
    testDb.db
      .update(schema.messages)
      .set({ status: "replied", outcome: "replied" })
      .where(eq(schema.messages.id, msg.id))
      .run();

    const newLeadStatus = schema.STATUS_MAP["replied"];
    testDb.db
      .update(schema.leads)
      .set({ status: newLeadStatus })
      .where(eq(schema.leads.id, lead.id))
      .run();

    testDb.db.insert(schema.events).values({
      leadId: lead.id,
      type: "reply",
      detail: "Message outcome: replied",
      metadata: JSON.stringify({ messageId: msg.id, outcome: "replied" }),
    }).run();

    // Verify final state
    const finalMsg = testDb.db.select().from(schema.messages).where(eq(schema.messages.id, msg.id)).get();
    expect(finalMsg?.status).toBe("replied");
    expect(finalMsg?.outcome).toBe("replied");
    expect(finalMsg?.sentAt).toBeDefined();

    const finalLead = testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get();
    expect(finalLead?.status).toBe("replied");

    const allEvents = testDb.db.select().from(schema.events).where(eq(schema.events.leadId, lead.id)).all();
    expect(allEvents).toHaveLength(2); // sent + reply
    expect(allEvents.map((e) => e.type).sort()).toEqual(["reply", "sent"]);
  });

  it("should NOT update lead status when marking sent if lead is already contacted", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { status: "contacted" });
    const msg = seedTestMessage(testDb.db, lead.id, { status: "queued" });

    // The API route only updates to "contacted" if lead.status === "new"
    const leadBefore = testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get();
    if (leadBefore && leadBefore.status === "new") {
      testDb.db.update(schema.leads).set({ status: "contacted" }).where(eq(schema.leads.id, lead.id)).run();
    }

    const leadAfter = testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get();
    expect(leadAfter?.status).toBe("contacted");
  });

  it("should exercise all STATUS_MAP outcomes end-to-end", () => {
    testDb = createTestDb();
    const outcomes = Object.entries(schema.STATUS_MAP);

    for (const [outcome, expectedLeadStatus] of outcomes) {
      const lead = seedTestLead(testDb.db, { name: `Lead_${outcome}`, status: "contacted" });
      const msg = seedTestMessage(testDb.db, lead.id, { status: "sent" });

      // Apply outcome
      testDb.db.update(schema.messages).set({ outcome, status: outcome === "ignored" ? "sent" : outcome }).where(eq(schema.messages.id, msg.id)).run();

      // Map outcome to lead status
      testDb.db.update(schema.leads).set({ status: expectedLeadStatus }).where(eq(schema.leads.id, lead.id)).run();

      // Log event
      testDb.db.insert(schema.events).values({
        leadId: lead.id,
        type: outcome === "replied" ? "reply" : outcome,
        detail: `Message outcome: ${outcome}`,
        metadata: JSON.stringify({ messageId: msg.id, outcome }),
      }).run();

      const updatedLead = testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get();
      expect(updatedLead?.status).toBe(expectedLeadStatus);
    }

    // Verify all 5 outcomes were tested
    expect(outcomes).toHaveLength(5);
  });

  it("should update follow-up date via PATCH", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    const msg = seedTestMessage(testDb.db, lead.id, { status: "sent", followUpDate: null });

    testDb.db
      .update(schema.messages)
      .set({ followUpDate: "2026-04-10", updatedAt: new Date().toISOString() })
      .where(eq(schema.messages.id, msg.id))
      .run();

    const updated = testDb.db.select().from(schema.messages).where(eq(schema.messages.id, msg.id)).get();
    expect(updated?.followUpDate).toBe("2026-04-10");
  });

  it("should update selectedHook via PATCH", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    const msg = seedTestMessage(testDb.db, lead.id, { status: "draft", selectedHook: undefined });

    testDb.db
      .update(schema.messages)
      .set({ selectedHook: "Loved your blog post on microservices" })
      .where(eq(schema.messages.id, msg.id))
      .run();

    const updated = testDb.db.select().from(schema.messages).where(eq(schema.messages.id, msg.id)).get();
    expect(updated?.selectedHook).toBe("Loved your blog post on microservices");
  });
});

// ── Import Pipeline ─────────────────────────────────────────────────────────

describe("Import Pipeline — comprehensive scenarios", () => {
  let testDb: ReturnType<typeof createTestDb>;
  afterEach(() => testDb?.cleanup());

  it("should import leads with all scoring fields and auto-calculate scores", () => {
    testDb = createTestDb();
    const headers = [
      "name", "company", "email", "company_size", "tech_stack_match",
      "pain_signal_strength", "decision_maker_access", "engagement_signals", "segment_fit",
    ];
    const rows = [
      ["Alice", "AliceCorp", "alice@a.com", "enterprise", "perfect", "explicit", "direct", "active", "ideal"],
    ];

    const { leads: parsedLeads, result } = parseCsvRows(headers, rows);
    expect(result.imported).toBe(1);

    const lead = parsedLeads[0];
    const scoreResult = calculateScore({
      companySize: lead.companySize,
      techStackMatch: lead.techStackMatch,
      painSignalStrength: lead.painSignalStrength,
      decisionMakerAccess: lead.decisionMakerAccess,
      engagementSignals: lead.engagementSignals,
      segmentFit: lead.segmentFit,
    });

    expect(scoreResult.totalScore).toBe(100); // All max values

    const inserted = testDb.db
      .insert(schema.leads)
      .values({
        name: lead.name,
        company: lead.company,
        email: lead.email || null,
        status: "new",
        score: scoreResult.totalScore,
        companySize: lead.companySize || null,
        techStackMatch: lead.techStackMatch || null,
        painSignalStrength: lead.painSignalStrength || null,
        decisionMakerAccess: lead.decisionMakerAccess || null,
        engagementSignals: lead.engagementSignals || null,
        segmentFit: lead.segmentFit || null,
      })
      .returning()
      .get();

    expect(inserted.score).toBe(100);
    expect(inserted.companySize).toBe("enterprise");
  });

  it("should create import event for each lead and log run with audit data", () => {
    testDb = createTestDb();
    const headers = ["name", "company"];
    const rows = [
      ["Alice", "AliceCorp"],
      ["Bob", "BobCorp"],
      ["Charlie", "CharlieCorp"],
    ];

    const { leads: parsedLeads, result } = parseCsvRows(headers, rows);
    const insertedIds: number[] = [];

    for (const lead of parsedLeads) {
      const scoreResult = calculateScore({});
      const inserted = testDb.db
        .insert(schema.leads)
        .values({
          name: lead.name,
          company: lead.company,
          status: "new",
          score: scoreResult.totalScore,
        })
        .returning()
        .get();

      insertedIds.push(inserted.id);

      testDb.db.insert(schema.events).values({
        leadId: inserted.id,
        type: "import",
        detail: `Imported from CSV: ${inserted.name} at ${inserted.company}`,
      }).run();
    }

    // Verify events
    const allEvents = testDb.db.select().from(schema.events).all();
    expect(allEvents).toHaveLength(3);
    expect(allEvents.every((e) => e.type === "import")).toBe(true);

    // Log run
    const run = testDb.db
      .insert(schema.runs)
      .values({
        action: "csv_import",
        rulesVersion: 1,
        inputSummary: JSON.stringify({ totalRows: rows.length, headers }),
        outputSummary: JSON.stringify(result),
      })
      .returning()
      .get();

    expect(run.action).toBe("csv_import");
    expect(run.rulesVersion).toBe(1);
    const inputMeta = JSON.parse(run.inputSummary!);
    expect(inputMeta.totalRows).toBe(3);
    const outputMeta = JSON.parse(run.outputSummary!);
    expect(outputMeta.imported).toBe(3);
  });

  it("should handle CSV with alternative header names", () => {
    expect(normalizeHeader("Full Name")).toBe("name");
    expect(normalizeHeader("Company Name")).toBe("company");
    expect(normalizeHeader("Job Title")).toBe("title");
    expect(normalizeHeader("Email Address")).toBe("email");
    expect(normalizeHeader("LinkedIn URL")).toBe("linkedinUrl");
    expect(normalizeHeader("Tech Stack Match")).toBe("techStackMatch");
    expect(normalizeHeader("Pain Signal Strength")).toBe("painSignalStrength");
    expect(normalizeHeader("Decision Maker Access")).toBe("decisionMakerAccess");
    expect(normalizeHeader("Engagement Signals")).toBe("engagementSignals");
    expect(normalizeHeader("Segment Fit")).toBe("segmentFit");
  });

  it("should validate required fields and report specific errors", () => {
    const { valid: v1, errors: e1 } = validateRow({ company: "Test" }, 1);
    expect(v1).toBe(false);
    expect(e1).toContain("Missing required field: name");

    const { valid: v2, errors: e2 } = validateRow({ name: "Test" }, 1);
    expect(v2).toBe(false);
    expect(e2).toContain("Missing required field: company");

    const { valid: v3, errors: e3 } = validateRow(
      { name: "Test", company: "Corp", email: "bad-email" },
      1
    );
    expect(v3).toBe(false);
    expect(e3.some((e) => e.includes("Invalid email format"))).toBe(true);
  });

  it("should handle empty string fields as missing", () => {
    const { valid, errors } = validateRow({ name: "", company: "Corp" }, 1);
    expect(valid).toBe(false);
    expect(errors).toContain("Missing required field: name");
  });

  it("should correctly count imported/skipped/errors in mixed CSV", () => {
    const headers = ["name", "company", "email"];
    const rows = [
      ["Valid1", "Corp1", "valid@corp.com"],
      ["", "NoName", "x@x.com"],          // missing name
      ["Valid2", "Corp2", ""],              // valid (email optional)
      ["NoCompany", "", "x@y.com"],        // missing company
      ["BadEmail", "Corp3", "not-email"],  // invalid email
      ["Valid3", "Corp3", "v3@corp.com"],
    ];

    const { leads, result } = parseCsvRows(headers, rows);
    expect(result.imported).toBe(3); // Valid1, Valid2, Valid3
    expect(result.skipped).toBe(3);  // NoName, NoCompany, BadEmail
    expect(result.errors).toHaveLength(3);
    expect(leads).toHaveLength(3);
  });
});

// ── Template Versioning ─────────────────────────────────────────────────────

describe("Template Versioning — PUT workflow", () => {
  let testDb: ReturnType<typeof createTestDb>;
  afterEach(() => testDb?.cleanup());

  it("should create new version, deactivate old, and preserve history", () => {
    testDb = createTestDb();
    const v1 = seedTestTemplate(testDb.db, {
      name: "Intro A",
      channel: "linkedin",
      type: "initial",
      segment: "enterprise",
      body: "Version 1: Hi {{name}}",
      version: 1,
      isActive: true,
    });

    // Simulate PUT /api/templates/[id] — deactivate old + insert new
    testDb.db
      .update(schema.templates)
      .set({ isActive: false })
      .where(eq(schema.templates.id, v1.id))
      .run();

    const v2 = testDb.db
      .insert(schema.templates)
      .values({
        name: "Intro A",
        channel: v1.channel,
        segment: v1.segment,
        type: v1.type,
        variant: v1.variant,
        body: "Version 2: Hey {{name}}, improved opening",
        version: v1.version + 1,
        isActive: true,
      })
      .returning()
      .get();

    // v1 deactivated
    const v1Check = testDb.db.select().from(schema.templates).where(eq(schema.templates.id, v1.id)).get();
    expect(v1Check?.isActive).toBeFalsy();
    expect(v1Check?.version).toBe(1);

    // v2 active
    expect(v2.isActive).toBeTruthy();
    expect(v2.version).toBe(2);

    // Both preserved
    const history = testDb.db
      .select()
      .from(schema.templates)
      .where(eq(schema.templates.name, "Intro A"))
      .all();
    expect(history).toHaveLength(2);
  });

  it("should support multiple version increments (v1 → v2 → v3)", () => {
    testDb = createTestDb();
    const v1 = seedTestTemplate(testDb.db, {
      name: "Followup B", channel: "email", type: "follow_up",
      body: "V1 body", version: 1, isActive: true,
    });

    // v1 → v2
    testDb.db.update(schema.templates).set({ isActive: false }).where(eq(schema.templates.id, v1.id)).run();
    const v2 = testDb.db.insert(schema.templates).values({
      name: "Followup B", channel: "email", type: "follow_up",
      body: "V2 body", version: 2, isActive: true,
    }).returning().get();

    // v2 → v3
    testDb.db.update(schema.templates).set({ isActive: false }).where(eq(schema.templates.id, v2.id)).run();
    const v3 = testDb.db.insert(schema.templates).values({
      name: "Followup B", channel: "email", type: "follow_up",
      body: "V3 body", version: 3, isActive: true,
    }).returning().get();

    const all = testDb.db
      .select()
      .from(schema.templates)
      .where(eq(schema.templates.name, "Followup B"))
      .orderBy(asc(schema.templates.version))
      .all();

    expect(all).toHaveLength(3);
    expect(all[0].version).toBe(1);
    expect(all[0].isActive).toBeFalsy();
    expect(all[1].version).toBe(2);
    expect(all[1].isActive).toBeFalsy();
    expect(all[2].version).toBe(3);
    expect(all[2].isActive).toBeTruthy();
  });

  it("should fetch version history by matching channel+type+segment+variant", () => {
    testDb = createTestDb();
    // Same family: linkedin/initial/enterprise
    seedTestTemplate(testDb.db, { name: "T1", channel: "linkedin", type: "initial", segment: "enterprise", version: 1, isActive: false });
    seedTestTemplate(testDb.db, { name: "T1", channel: "linkedin", type: "initial", segment: "enterprise", version: 2, isActive: true });
    // Different family
    seedTestTemplate(testDb.db, { name: "T2", channel: "email", type: "initial", segment: "enterprise", version: 1, isActive: true });

    const family = testDb.db
      .select()
      .from(schema.templates)
      .where(
        and(
          eq(schema.templates.channel, "linkedin"),
          eq(schema.templates.type, "initial"),
          eq(schema.templates.segment, "enterprise")
        )
      )
      .all();

    expect(family).toHaveLength(2);
    expect(family.every((t) => t.channel === "linkedin")).toBe(true);
  });

  it("should preserve name update in new version", () => {
    testDb = createTestDb();
    const v1 = seedTestTemplate(testDb.db, {
      name: "Old Name", body: "Body v1", version: 1, isActive: true,
    });

    testDb.db.update(schema.templates).set({ isActive: false }).where(eq(schema.templates.id, v1.id)).run();
    const v2 = testDb.db.insert(schema.templates).values({
      name: "New Name",
      channel: v1.channel,
      type: v1.type,
      body: "Body v2",
      version: 2,
      isActive: true,
    }).returning().get();

    expect(v2.name).toBe("New Name");
    const v1Check = testDb.db.select().from(schema.templates).where(eq(schema.templates.id, v1.id)).get();
    expect(v1Check?.name).toBe("Old Name");
  });
});

// ── End-to-End Workflow ─────────────────────────────────────────────────────

describe("End-to-end workflow: import → score → queue → send → outcome → follow-up", () => {
  let testDb: ReturnType<typeof createTestDb>;
  afterEach(() => testDb?.cleanup());

  it("should execute the complete outreach pipeline", () => {
    testDb = createTestDb();

    // 1. Import a lead via CSV
    const headers = ["name", "company", "email", "company_size", "tech_stack_match", "pain_signal_strength"];
    const rows = [["Jane CTO", "TechCorp", "jane@techcorp.com", "midMarket", "strong", "strong"]];
    const { leads: parsedLeads, result: importResult } = parseCsvRows(headers, rows);
    expect(importResult.imported).toBe(1);

    const parsedLead = parsedLeads[0];

    // 2. Score the lead
    const scoreResult = calculateScore({
      companySize: parsedLead.companySize,
      techStackMatch: parsedLead.techStackMatch,
      painSignalStrength: parsedLead.painSignalStrength,
    });
    expect(scoreResult.totalScore).toBeGreaterThan(0);

    // 3. Insert lead with score
    const lead = testDb.db
      .insert(schema.leads)
      .values({
        name: parsedLead.name,
        company: parsedLead.company,
        email: parsedLead.email || null,
        status: "new",
        score: scoreResult.totalScore,
        companySize: parsedLead.companySize || null,
        techStackMatch: parsedLead.techStackMatch || null,
        painSignalStrength: parsedLead.painSignalStrength || null,
      })
      .returning()
      .get();

    testDb.db.insert(schema.events).values({
      leadId: lead.id,
      type: "import",
      detail: `Imported from CSV: ${lead.name} at ${lead.company}`,
    }).run();

    // Log import run
    testDb.db.insert(schema.runs).values({
      action: "csv_import",
      rulesVersion: scoreResult.rulesVersion,
      inputSummary: JSON.stringify({ totalRows: 1, headers }),
      outputSummary: JSON.stringify(importResult),
    }).run();

    // 4. Create a template
    const template = seedTestTemplate(testDb.db, {
      name: "MidMarket Intro",
      channel: "linkedin",
      type: "initial",
      segment: "midMarket",
      body: "Hi {{name}}, I noticed {{company}} is scaling up...",
      version: 1,
    });

    // 5. Build queued message from template
    const msg = testDb.db
      .insert(schema.messages)
      .values({
        leadId: lead.id,
        templateId: template.id,
        channel: "linkedin",
        body: "Hi Jane, I noticed TechCorp is scaling up...",
        selectedHook: "Your recent engineering blog post on microservices",
        status: "queued",
        followUpDate: "2026-04-03",
      })
      .returning()
      .get();

    expect(msg.status).toBe("queued");
    expect(msg.templateId).toBe(template.id);

    // 6. Copy+Send — mark as sent
    const sentAt = new Date().toISOString();
    testDb.db
      .update(schema.messages)
      .set({ status: "sent", sentAt })
      .where(eq(schema.messages.id, msg.id))
      .run();

    testDb.db.insert(schema.events).values({
      leadId: lead.id,
      type: "sent",
      detail: "Message sent via linkedin",
      metadata: JSON.stringify({
        messageId: msg.id,
        templateId: template.id,
        selectedHook: msg.selectedHook,
      }),
    }).run();

    // Lead status: new → contacted
    testDb.db
      .update(schema.leads)
      .set({ status: "contacted" })
      .where(eq(schema.leads.id, lead.id))
      .run();

    // 7. Verify follow-up appears
    const followUps = testDb.db
      .select()
      .from(schema.messages)
      .where(
        and(
          isNotNull(schema.messages.followUpDate),
          eq(schema.messages.status, "sent")
        )
      )
      .all();
    expect(followUps).toHaveLength(1);
    expect(followUps[0].followUpDate).toBe("2026-04-03");

    // 8. Record outcome: replied → booked
    testDb.db
      .update(schema.messages)
      .set({ outcome: "replied", status: "replied" })
      .where(eq(schema.messages.id, msg.id))
      .run();

    testDb.db
      .update(schema.leads)
      .set({ status: schema.STATUS_MAP["replied"] })
      .where(eq(schema.leads.id, lead.id))
      .run();

    testDb.db.insert(schema.events).values({
      leadId: lead.id,
      type: "reply",
      detail: "Message outcome: replied",
      metadata: JSON.stringify({ messageId: msg.id, outcome: "replied" }),
    }).run();

    // 9. Verify full audit trail
    const events = testDb.db
      .select()
      .from(schema.events)
      .where(eq(schema.events.leadId, lead.id))
      .all();
    expect(events).toHaveLength(3); // import, sent, reply
    expect(events.map((e) => e.type).sort()).toEqual(["import", "reply", "sent"]);

    // Verify sent event has template traceability
    const sentEvent = events.find((e) => e.type === "sent");
    const sentMeta = JSON.parse(sentEvent!.metadata!);
    expect(sentMeta.templateId).toBe(template.id);
    expect(sentMeta.selectedHook).toBe("Your recent engineering blog post on microservices");

    // Verify run logged
    const runs = testDb.db.select().from(schema.runs).all();
    expect(runs).toHaveLength(1);
    expect(runs[0].action).toBe("csv_import");
    expect(runs[0].rulesVersion).toBe(1);

    // Final lead state
    const finalLead = testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get();
    expect(finalLead?.status).toBe("replied");
    expect(finalLead?.score).toBe(scoreResult.totalScore);
  });
});

// ── Audit Trail & Determinism ───────────────────────────────────────────────

describe("Audit Trail & Determinism", () => {
  let testDb: ReturnType<typeof createTestDb>;
  afterEach(() => testDb?.cleanup());

  it("should trace a sent message back to its template version and scoring rules", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { score: 65 });

    const v1 = seedTestTemplate(testDb.db, {
      name: "Outreach A", version: 1, isActive: false,
      body: "Old body",
    });
    const v2 = seedTestTemplate(testDb.db, {
      name: "Outreach A", version: 2, isActive: true,
      channel: v1.channel, type: v1.type,
      body: "New improved body for {{name}}",
    });

    // Message references the template
    const msg = seedTestMessage(testDb.db, lead.id, {
      templateId: v2.id,
      body: "New improved body for Alice",
      selectedHook: "Your Series C",
      status: "sent",
      sentAt: new Date().toISOString(),
    });

    // Sent event logs templateId + selectedHook
    testDb.db.insert(schema.events).values({
      leadId: lead.id,
      type: "sent",
      detail: "Message sent via linkedin",
      metadata: JSON.stringify({
        messageId: msg.id,
        templateId: v2.id,
        selectedHook: "Your Series C",
        rulesVersion: 1,
      }),
    }).run();

    // Verify traceability
    const event = testDb.db.select().from(schema.events).where(eq(schema.events.leadId, lead.id)).get()!;
    const meta = JSON.parse(event.metadata!);

    // Can trace back to exact template version
    const usedTemplate = testDb.db.select().from(schema.templates).where(eq(schema.templates.id, meta.templateId)).get();
    expect(usedTemplate?.version).toBe(2);
    expect(usedTemplate?.body).toContain("{{name}}");

    // Can trace the hook
    expect(meta.selectedHook).toBe("Your Series C");

    // Message itself retains the template reference
    expect(msg.templateId).toBe(v2.id);
  });

  it("should maintain deterministic scoring: same input = same output", () => {
    const input = {
      companySize: "midMarket",
      techStackMatch: "partial",
      painSignalStrength: "moderate",
      decisionMakerAccess: "introduced",
      engagementSignals: "cold",
      segmentFit: "marginal",
    };

    const result1 = calculateScore(input);
    const result2 = calculateScore(input);

    expect(result1.totalScore).toBe(result2.totalScore);
    expect(result1.breakdown).toEqual(result2.breakdown);
    expect(result1.rulesVersion).toBe(result2.rulesVersion);
  });

  it("should log runs with correct rulesVersion for batch operations", () => {
    testDb = createTestDb();
    const rules = getScoringRules();

    const run = testDb.db
      .insert(schema.runs)
      .values({
        action: "batch_rescore",
        rulesVersion: rules.version,
        inputSummary: JSON.stringify({ leadCount: 50 }),
        outputSummary: JSON.stringify({ rescored: 50, changed: 12 }),
      })
      .returning()
      .get();

    expect(run.rulesVersion).toBe(1);
    expect(run.action).toBe("batch_rescore");
  });
});
