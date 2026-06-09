import { describe, it, expect, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, seedTestLead } from "../test-helpers";
import * as schema from "../../src/db/schema";
import { calculateScore, type ScoringInput } from "../../src/lib/scoring";
import { parseCsvRows } from "../../src/lib/csv-import";

/**
 * Integration tests verifying auto-recalculation triggers.
 * Tests the full flow: create → score → edit → recalculate → event audit trail.
 * These mirror what the API routes do (calculateScore + DB write + event log).
 */

const SCORING_FIELDS = [
  "companySize",
  "techStackMatch",
  "painSignalStrength",
  "decisionMakerAccess",
  "engagementSignals",
  "segmentFit",
] as const;

/** Simulate the API route's auto-score-on-create logic */
function createLeadWithAutoScore(
  db: ReturnType<typeof createTestDb>["db"],
  leadData: {
    name: string;
    company: string;
    email?: string;
    companySize?: string;
    techStackMatch?: string;
    painSignalStrength?: string;
    decisionMakerAccess?: string;
    engagementSignals?: string;
    segmentFit?: string;
  }
) {
  const scoringInput: ScoringInput = {
    companySize: leadData.companySize,
    techStackMatch: leadData.techStackMatch,
    painSignalStrength: leadData.painSignalStrength,
    decisionMakerAccess: leadData.decisionMakerAccess,
    engagementSignals: leadData.engagementSignals,
    segmentFit: leadData.segmentFit,
  };
  const scoreResult = calculateScore(scoringInput);

  const lead = db
    .insert(schema.leads)
    .values({
      name: leadData.name,
      company: leadData.company,
      email: leadData.email || null,
      status: "new",
      score: scoreResult.totalScore,
      companySize: leadData.companySize || null,
      techStackMatch: leadData.techStackMatch || null,
      painSignalStrength: leadData.painSignalStrength || null,
      decisionMakerAccess: leadData.decisionMakerAccess || null,
      engagementSignals: leadData.engagementSignals || null,
      segmentFit: leadData.segmentFit || null,
    })
    .returning()
    .get();

  // Log import event with score metadata (as the API does)
  db.insert(schema.events)
    .values({
      leadId: lead.id,
      type: "import",
      detail: `Lead created: ${lead.name} at ${lead.company}`,
      metadata: JSON.stringify({
        score: scoreResult.totalScore,
        breakdown: scoreResult.breakdown,
        rulesVersion: scoreResult.rulesVersion,
      }),
    })
    .run();

  return { lead, scoreResult };
}

/** Simulate the API route's edit-with-recalculate logic */
function editLeadWithRecalc(
  db: ReturnType<typeof createTestDb>["db"],
  leadId: number,
  updates: Partial<typeof schema.leads.$inferInsert>
) {
  // Get current lead
  const current = db
    .select()
    .from(schema.leads)
    .where(eq(schema.leads.id, leadId))
    .get()!;

  // Check if any scoring field changed
  const scoringFieldChanged = SCORING_FIELDS.some(
    (f) => updates[f] !== undefined && updates[f] !== current[f]
  );

  let newScore = current.score;
  let scoreResult = null;

  if (scoringFieldChanged) {
    // Build merged scoring input
    const scoringInput: ScoringInput = {};
    for (const f of SCORING_FIELDS) {
      (scoringInput as any)[f] = updates[f] ?? current[f] ?? undefined;
    }
    scoreResult = calculateScore(scoringInput);
    newScore = scoreResult.totalScore;
  }

  // Apply all updates + recalculated score
  db.update(schema.leads)
    .set({
      ...updates,
      ...(scoringFieldChanged ? { score: newScore } : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.leads.id, leadId))
    .run();

  // Log score_change event only if score actually changed
  if (scoringFieldChanged && newScore !== current.score) {
    db.insert(schema.events)
      .values({
        leadId,
        type: "score_change",
        detail: `Score changed from ${current.score} to ${newScore}`,
        metadata: JSON.stringify({
          previousScore: current.score,
          newScore,
          breakdown: scoreResult!.breakdown,
          rulesVersion: scoreResult!.rulesVersion,
        }),
      })
      .run();
  }

  return {
    previousScore: current.score!,
    newScore: newScore!,
    changed: newScore !== current.score,
  };
}

describe("Scoring Auto-Recalculation — Integration Tests", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("Auto-score on lead creation", () => {
    it("should auto-calculate score with all 6 factors on create", () => {
      testDb = createTestDb();
      const { lead, scoreResult } = createLeadWithAutoScore(testDb.db, {
        name: "Alice",
        company: "AliceCorp",
        companySize: "enterprise",
        techStackMatch: "perfect",
        painSignalStrength: "explicit",
        decisionMakerAccess: "direct",
        engagementSignals: "active",
        segmentFit: "ideal",
      });

      expect(lead.score).toBe(100);
      expect(scoreResult.rulesVersion).toBe(1);

      // Verify all scoring fields persisted
      const stored = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get()!;
      expect(stored.companySize).toBe("enterprise");
      expect(stored.techStackMatch).toBe("perfect");
      expect(stored.painSignalStrength).toBe("explicit");
      expect(stored.decisionMakerAccess).toBe("direct");
      expect(stored.engagementSignals).toBe("active");
      expect(stored.segmentFit).toBe("ideal");
    });

    it("should auto-calculate with partial scoring factors", () => {
      testDb = createTestDb();
      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "Bob",
        company: "BobInc",
        companySize: "smb",
        painSignalStrength: "weak",
      });

      // smb(10) + unknown(2) + weak(5) + unknown(3) + unknown→0 + unknown→0 = 20
      expect(lead.score).toBe(20);
    });

    it("should score 8 for lead with no scoring factors", () => {
      testDb = createTestDb();
      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "Charlie",
        company: "CharlieCo",
      });

      // All unknown defaults: 3+2+0+3+0+0 = 8
      expect(lead.score).toBe(8);
    });

    it("should log import event with score breakdown metadata", () => {
      testDb = createTestDb();
      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "Diana",
        company: "DianaCorp",
        companySize: "midMarket",
        techStackMatch: "strong",
      });

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("import");

      const meta = JSON.parse(events[0].metadata!);
      expect(meta.score).toBe(lead.score);
      expect(meta.rulesVersion).toBe(1);
      expect(meta.breakdown).toBeDefined();
      expect(meta.breakdown.companySize).toBe(15); // midMarket
      expect(meta.breakdown.techStackMatch).toBe(15); // strong
    });
  });

  describe("Auto-recalculation on lead edit", () => {
    it("should recalculate score when a single scoring field changes", () => {
      testDb = createTestDb();
      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "Eve",
        company: "EveCorp",
        companySize: "startup", // 5
      });

      const initialScore = lead.score;
      const result = editLeadWithRecalc(testDb.db, lead.id, {
        companySize: "enterprise", // 20 — gain of 15
      });

      expect(result.changed).toBe(true);
      expect(result.newScore).toBe(initialScore + 15);

      // Verify DB updated
      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get()!;
      expect(updated.score).toBe(result.newScore);
      expect(updated.companySize).toBe("enterprise");
    });

    it("should recalculate when multiple scoring fields change at once", () => {
      testDb = createTestDb();
      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "Frank",
        company: "FrankCo",
        companySize: "startup",      // 5
        techStackMatch: "weak",       // 5
        painSignalStrength: "none",   // 0
      });

      editLeadWithRecalc(testDb.db, lead.id, {
        companySize: "enterprise",        // 5→20
        techStackMatch: "perfect",        // 5→20
        painSignalStrength: "explicit",   // 0→25
      });

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get()!;

      // enterprise(20) + perfect(20) + explicit(25) + unknown(3) + unknown→0 + unknown→0 = 68
      expect(updated.score).toBe(68);
    });

    it("should NOT recalculate when only non-scoring fields change", () => {
      testDb = createTestDb();
      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "Grace",
        company: "GraceCorp",
        companySize: "enterprise",
      });

      const result = editLeadWithRecalc(testDb.db, lead.id, {
        name: "Grace Updated",
        title: "CEO",
        email: "grace@new.com",
        notes: "Important client",
      });

      expect(result.changed).toBe(false);
      expect(result.newScore).toBe(result.previousScore);

      // No score_change event
      const scoreEvents = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all()
        .filter((e) => e.type === "score_change");
      expect(scoreEvents).toHaveLength(0);
    });

    it("should NOT log score_change event when scoring field changes but score stays same", () => {
      testDb = createTestDb();
      // Create lead with factors that sum the same after swap
      // This can happen when two factors have same score at different levels
      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "Heidi",
        company: "HeidiCo",
        companySize: "enterprise",    // 20
        techStackMatch: "perfect",    // 20
        painSignalStrength: "none",   // 0
        decisionMakerAccess: "unknown", // 3
        engagementSignals: "none",    // 0
        segmentFit: "poor",           // 1
      });
      // Total = 20+20+0+3+0+1 = 44

      // Change decisionMakerAccess from unknown(3) to identified(8) but also
      // reduce techStackMatch from perfect(20) to strong(15):
      // Net change: +5-5 = 0
      const result = editLeadWithRecalc(testDb.db, lead.id, {
        decisionMakerAccess: "identified",  // 3→8 (+5)
        techStackMatch: "strong",           // 20→15 (-5)
      });

      expect(result.changed).toBe(false);
      expect(result.newScore).toBe(44);

      const scoreEvents = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all()
        .filter((e) => e.type === "score_change");
      expect(scoreEvents).toHaveLength(0);
    });

    it("should log score_change event with full metadata when score changes", () => {
      testDb = createTestDb();
      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "Ivan",
        company: "IvanCo",
        companySize: "startup",  // score = 5+2+0+3+0+0 = 10
      });

      editLeadWithRecalc(testDb.db, lead.id, {
        companySize: "enterprise",        // 5→20
        painSignalStrength: "explicit",   // 0→25
      });

      const scoreEvents = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all()
        .filter((e) => e.type === "score_change");

      expect(scoreEvents).toHaveLength(1);
      const meta = JSON.parse(scoreEvents[0].metadata!);
      expect(meta.previousScore).toBe(10);
      expect(meta.newScore).toBe(50); // 20+2+25+3+0+0
      expect(meta.rulesVersion).toBe(1);
      expect(meta.breakdown).toBeDefined();
      expect(meta.breakdown.companySize).toBe(20);
      expect(meta.breakdown.painSignalStrength).toBe(25);
    });

    it("should preserve existing scoring factors when editing only one", () => {
      testDb = createTestDb();
      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "Judy",
        company: "JudyCo",
        companySize: "enterprise",
        techStackMatch: "perfect",
        painSignalStrength: "explicit",
        decisionMakerAccess: "direct",
        engagementSignals: "active",
        segmentFit: "ideal",
      });
      expect(lead.score).toBe(100);

      // Only change one field
      editLeadWithRecalc(testDb.db, lead.id, {
        segmentFit: "poor",  // 10→1
      });

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get()!;

      expect(updated.score).toBe(91); // 100 - 9
      expect(updated.companySize).toBe("enterprise"); // preserved
      expect(updated.techStackMatch).toBe("perfect");  // preserved
      expect(updated.segmentFit).toBe("poor");          // changed
    });
  });

  describe("Auto-score on CSV import", () => {
    it("should auto-calculate scores for all imported leads", () => {
      testDb = createTestDb();

      const headers = [
        "name", "company", "email",
        "company_size", "tech_stack_match", "pain_signal_strength",
        "decision_maker_access", "engagement_signals", "segment_fit",
      ];
      const rows = [
        ["Alice", "AliceCorp", "alice@corp.com", "enterprise", "perfect", "explicit", "direct", "active", "ideal"],
        ["Bob", "BobInc", "bob@inc.com", "startup", "weak", "none", "unknown", "none", "poor"],
        ["Charlie", "CharlieCo", "charlie@co.com", "", "", "", "", "", ""],
      ];

      const { leads: parsedLeads, result } = parseCsvRows(headers, rows);
      expect(result.imported).toBe(3);

      const insertedIds: number[] = [];
      for (const row of parsedLeads) {
        const { lead } = createLeadWithAutoScore(testDb.db, {
          name: row.name,
          company: row.company,
          email: row.email,
          companySize: row.companySize || undefined,
          techStackMatch: row.techStackMatch || undefined,
          painSignalStrength: row.painSignalStrength || undefined,
          decisionMakerAccess: row.decisionMakerAccess || undefined,
          engagementSignals: row.engagementSignals || undefined,
          segmentFit: row.segmentFit || undefined,
        });
        insertedIds.push(lead.id);
      }

      const allLeads = testDb.db.select().from(schema.leads).all();
      expect(allLeads).toHaveLength(3);

      const alice = allLeads.find((l) => l.name === "Alice")!;
      const bob = allLeads.find((l) => l.name === "Bob")!;
      const charlie = allLeads.find((l) => l.name === "Charlie")!;

      expect(alice.score).toBe(100);  // all perfect
      expect(bob.score).toBe(14);     // startup(5)+weak(5)+none(0)+unknown(3)+none(0)+poor(1)=14
      expect(charlie.score).toBe(8);  // all unknown defaults
    });

    it("should create import events with score metadata for each imported lead", () => {
      testDb = createTestDb();

      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "ImportedLead",
        company: "ImportCo",
        companySize: "midMarket",
      });

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("import");
      const meta = JSON.parse(events[0].metadata!);
      expect(meta.score).toBeDefined();
      expect(meta.breakdown).toBeDefined();
      expect(meta.rulesVersion).toBe(1);
    });

    it("should create a run record for batch import with score audit data", () => {
      testDb = createTestDb();

      const headers = ["name", "company", "company_size"];
      const rows = [
        ["Lead1", "Corp1", "enterprise"],
        ["Lead2", "Corp2", "smb"],
        ["", "NoName", "startup"],  // invalid
      ];

      const { leads: parsedLeads, result } = parseCsvRows(headers, rows);

      // Insert valid leads
      const insertedIds: number[] = [];
      for (const row of parsedLeads) {
        const { lead } = createLeadWithAutoScore(testDb.db, {
          name: row.name,
          company: row.company,
          companySize: row.companySize || undefined,
        });
        insertedIds.push(lead.id);
      }

      // Create run record (as the import API does)
      const run = testDb.db
        .insert(schema.runs)
        .values({
          action: "csv_import",
          rulesVersion: 1,
          inputSummary: JSON.stringify({
            totalRows: rows.length,
            headers,
          }),
          outputSummary: JSON.stringify({
            imported: result.imported,
            skipped: result.skipped,
            errors: result.errors,
            insertedIds,
          }),
        })
        .returning()
        .get();

      expect(run.action).toBe("csv_import");
      expect(run.rulesVersion).toBe(1);
      const output = JSON.parse(run.outputSummary!);
      expect(output.imported).toBe(2);
      expect(output.skipped).toBe(1);
    });
  });

  describe("Sequential score changes — audit trail", () => {
    it("should create multiple score_change events for sequential edits", () => {
      testDb = createTestDb();

      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "Multi-Edit",
        company: "MultiCo",
        companySize: "startup",       // score = 5+2+0+3+0+0 = 10
      });
      expect(lead.score).toBe(10);

      // Edit 1: upgrade companySize
      editLeadWithRecalc(testDb.db, lead.id, { companySize: "midMarket" }); // 15+2+0+3+0+0 = 20

      // Edit 2: add techStackMatch
      editLeadWithRecalc(testDb.db, lead.id, { techStackMatch: "strong" }); // 15+15+0+3+0+0 = 33

      // Edit 3: add painSignalStrength
      editLeadWithRecalc(testDb.db, lead.id, { painSignalStrength: "explicit" }); // 15+15+25+3+0+0 = 58

      const scoreEvents = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all()
        .filter((e) => e.type === "score_change");

      expect(scoreEvents).toHaveLength(3);

      // Verify audit trail progression
      const scores = scoreEvents.map((e) => {
        const m = JSON.parse(e.metadata!);
        return { prev: m.previousScore, next: m.newScore };
      });

      expect(scores[0]).toEqual({ prev: 10, next: 20 });
      expect(scores[1]).toEqual({ prev: 20, next: 33 });
      expect(scores[2]).toEqual({ prev: 33, next: 58 });
    });

    it("should maintain correct final score after multiple edits", () => {
      testDb = createTestDb();

      const { lead } = createLeadWithAutoScore(testDb.db, {
        name: "Final Score",
        company: "FinalCo",
      });

      // Series of upgrades
      editLeadWithRecalc(testDb.db, lead.id, {
        companySize: "enterprise",
        techStackMatch: "perfect",
      });
      editLeadWithRecalc(testDb.db, lead.id, {
        painSignalStrength: "explicit",
        decisionMakerAccess: "direct",
      });
      editLeadWithRecalc(testDb.db, lead.id, {
        engagementSignals: "active",
        segmentFit: "ideal",
      });

      const final = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get()!;

      expect(final.score).toBe(100);
    });
  });

  describe("Cross-lead isolation", () => {
    it("should not affect other leads when recalculating one", () => {
      testDb = createTestDb();

      const { lead: lead1 } = createLeadWithAutoScore(testDb.db, {
        name: "Lead1",
        company: "Corp1",
        companySize: "enterprise",
      });
      const { lead: lead2 } = createLeadWithAutoScore(testDb.db, {
        name: "Lead2",
        company: "Corp2",
        companySize: "startup",
      });

      const lead2OriginalScore = lead2.score;

      // Edit lead1 only
      editLeadWithRecalc(testDb.db, lead1.id, {
        painSignalStrength: "explicit",
      });

      // Verify lead2 unchanged
      const lead2After = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead2.id))
        .get()!;

      expect(lead2After.score).toBe(lead2OriginalScore);

      // lead2 should have no score_change events
      const lead2ScoreEvents = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead2.id))
        .all()
        .filter((e) => e.type === "score_change");
      expect(lead2ScoreEvents).toHaveLength(0);
    });
  });
});
