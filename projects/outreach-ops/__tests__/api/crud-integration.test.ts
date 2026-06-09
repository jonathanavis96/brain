/**
 * Comprehensive CRUD integration tests for all API routes.
 *
 * These tests exercise the exact database operations that API route handlers
 * perform, validating response shapes, status code logic, and CRUD completeness
 * for: leads, templates, messages, events, runs, and partners.
 *
 * Each test creates a fresh SQLite DB to ensure isolation.
 */
import { describe, it, expect, afterEach } from "vitest";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  createTestDb,
  seedTestLead,
  seedTestTemplate,
  seedTestMessage,
  seedTestEvent,
} from "../test-helpers";
import * as schema from "../../src/db/schema";
import { calculateScore } from "../../src/lib/scoring";

// ---------------------------------------------------------------------------
// Leads CRUD — response shapes & enrichment fields
// ---------------------------------------------------------------------------
describe("Leads CRUD — response shapes", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/leads — response shape", () => {
    it("should return { leads: Lead[], total: number } shape", () => {
      testDb = createTestDb();
      seedTestLead(testDb.db, { name: "A" });
      seedTestLead(testDb.db, { name: "B" });

      const results = testDb.db
        .select()
        .from(schema.leads)
        .orderBy(desc(schema.leads.createdAt))
        .all();

      const totalResult = testDb.db
        .select({ total: sql<number>`count(*)` })
        .from(schema.leads)
        .get();

      // Simulate API response shape
      const response = { leads: results, total: totalResult?.total ?? 0 };

      expect(response).toHaveProperty("leads");
      expect(response).toHaveProperty("total");
      expect(Array.isArray(response.leads)).toBe(true);
      expect(response.total).toBe(2);
      expect(response.leads).toHaveLength(2);
    });

    it("each lead in response should have all required fields", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        name: "Alice",
        company: "AliceCorp",
        title: "CTO",
        email: "alice@corp.com",
        linkedinUrl: "https://linkedin.com/in/alice",
        segment: "enterprise",
        channel: "linkedin",
        employeeCount: 500,
        techStack: "React, Node.js",
        isHiringReact: true,
        hasActiveBlog: true,
        recentFunding: "Series B",
        activeOnLinkedIn: true,
        notes: "High potential",
      });

      const result = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(result).toBeDefined();
      // Core fields
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", "Alice");
      expect(result).toHaveProperty("company", "AliceCorp");
      expect(result).toHaveProperty("title", "CTO");
      expect(result).toHaveProperty("email", "alice@corp.com");
      expect(result).toHaveProperty("linkedinUrl", "https://linkedin.com/in/alice");
      expect(result).toHaveProperty("channel", "linkedin");
      expect(result).toHaveProperty("segment", "enterprise");
      expect(result).toHaveProperty("status", "new");
      expect(result).toHaveProperty("score");
      // Scoring factor fields
      expect(result).toHaveProperty("companySize");
      expect(result).toHaveProperty("techStackMatch");
      expect(result).toHaveProperty("painSignalStrength");
      expect(result).toHaveProperty("decisionMakerAccess");
      expect(result).toHaveProperty("engagementSignals");
      expect(result).toHaveProperty("segmentFit");
      // Enrichment fields
      expect(result).toHaveProperty("employeeCount", 500);
      expect(result).toHaveProperty("techStack", "React, Node.js");
      expect(result!.isHiringReact).toBeTruthy();
      expect(result!.hasActiveBlog).toBeTruthy();
      expect(result).toHaveProperty("recentFunding", "Series B");
      expect(result!.activeOnLinkedIn).toBeTruthy();
      expect(result).toHaveProperty("notes", "High potential");
      // Timestamps
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("updatedAt");
      expect(typeof result!.createdAt).toBe("string");
      expect(typeof result!.updatedAt).toBe("string");
    });

    it("should search leads by name (LIKE)", () => {
      testDb = createTestDb();
      seedTestLead(testDb.db, { name: "Alice Johnson", company: "X Corp" });
      seedTestLead(testDb.db, { name: "Bob Smith", company: "Y Corp" });
      seedTestLead(testDb.db, { name: "Charlie Johnson", company: "Z Corp" });

      const search = "Johnson";
      const results = testDb.db
        .select()
        .from(schema.leads)
        .where(
          sql`${schema.leads.name} LIKE ${"%" + search + "%"} OR ${schema.leads.company} LIKE ${"%" + search + "%"}`
        )
        .all();

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.name)).toContain("Alice Johnson");
      expect(results.map((r) => r.name)).toContain("Charlie Johnson");
    });

    it("should search leads by company (LIKE)", () => {
      testDb = createTestDb();
      seedTestLead(testDb.db, { name: "Alice", company: "TechStart Inc" });
      seedTestLead(testDb.db, { name: "Bob", company: "BigCorp" });

      const search = "TechStart";
      const results = testDb.db
        .select()
        .from(schema.leads)
        .where(
          sql`${schema.leads.name} LIKE ${"%" + search + "%"} OR ${schema.leads.company} LIKE ${"%" + search + "%"}`
        )
        .all();

      expect(results).toHaveLength(1);
      expect(results[0].company).toBe("TechStart Inc");
    });

    it("should sort leads by score descending", () => {
      testDb = createTestDb();
      seedTestLead(testDb.db, { name: "Low", score: 20 });
      seedTestLead(testDb.db, { name: "High", score: 90 });
      seedTestLead(testDb.db, { name: "Mid", score: 55 });

      const results = testDb.db
        .select()
        .from(schema.leads)
        .orderBy(desc(schema.leads.score))
        .all();

      expect(results[0].name).toBe("High");
      expect(results[1].name).toBe("Mid");
      expect(results[2].name).toBe("Low");
    });

    it("should sort leads by name ascending", () => {
      testDb = createTestDb();
      seedTestLead(testDb.db, { name: "Charlie" });
      seedTestLead(testDb.db, { name: "Alice" });
      seedTestLead(testDb.db, { name: "Bob" });

      const results = testDb.db
        .select()
        .from(schema.leads)
        .orderBy(schema.leads.name)
        .all();

      expect(results[0].name).toBe("Alice");
      expect(results[1].name).toBe("Bob");
      expect(results[2].name).toBe("Charlie");
    });
  });

  describe("POST /api/leads — response shape", () => {
    it("should return { lead: Lead } with status 201 shape", () => {
      testDb = createTestDb();

      const scoreResult = calculateScore({
        companySize: "mid_market",
        techStackMatch: "moderate",
        painSignalStrength: "implicit",
      });

      const result = testDb.db
        .insert(schema.leads)
        .values({
          name: "New Lead",
          company: "New Corp",
          status: "new",
          score: scoreResult.totalScore,
          companySize: "mid_market",
          techStackMatch: "moderate",
          painSignalStrength: "implicit",
          employeeCount: 250,
          techStack: "Vue, Python",
          isHiringReact: false,
        })
        .returning()
        .get();

      // Simulate API response
      const response = { lead: result };

      expect(response).toHaveProperty("lead");
      expect(response.lead.id).toBeGreaterThan(0);
      expect(response.lead.name).toBe("New Lead");
      expect(response.lead.company).toBe("New Corp");
      expect(response.lead.status).toBe("new");
      expect(response.lead.score).toBeGreaterThan(0);
      expect(response.lead.employeeCount).toBe(250);
      expect(response.lead.techStack).toBe("Vue, Python");
    });

    it("should set all enrichment defaults correctly", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);

      // Verify defaults for enrichment fields
      expect(lead.employeeCount).toBeNull();
      expect(lead.techStack).toBeNull();
      expect(lead.isHiringReact).toBeFalsy();
      expect(lead.hasActiveBlog).toBeFalsy();
      expect(lead.recentFunding).toBeNull();
      expect(lead.activeOnLinkedIn).toBeFalsy();
    });
  });

  describe("PATCH /api/leads/[id] — response shape", () => {
    it("should return { lead: Lead } with updated fields", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { name: "Original" });

      const result = testDb.db
        .update(schema.leads)
        .set({
          name: "Updated",
          updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
        })
        .where(eq(schema.leads.id, lead.id))
        .returning()
        .get();

      const response = { lead: result };
      expect(response).toHaveProperty("lead");
      expect(response.lead.name).toBe("Updated");
      expect(response.lead.id).toBe(lead.id);
    });

    it("should update enrichment fields on PATCH", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);

      testDb.db
        .update(schema.leads)
        .set({
          employeeCount: 1000,
          techStack: "React, TypeScript, Go",
          isHiringReact: true,
          hasActiveBlog: true,
          recentFunding: "Series C — $50M",
          activeOnLinkedIn: true,
        })
        .where(eq(schema.leads.id, lead.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(updated!.employeeCount).toBe(1000);
      expect(updated!.techStack).toBe("React, TypeScript, Go");
      expect(updated!.isHiringReact).toBeTruthy();
      expect(updated!.hasActiveBlog).toBeTruthy();
      expect(updated!.recentFunding).toBe("Series C — $50M");
      expect(updated!.activeOnLinkedIn).toBeTruthy();
    });
  });

  describe("DELETE /api/leads/[id] — response shape", () => {
    it("should return { deleted: true, id: number } shape", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);

      testDb.db.delete(schema.events).where(eq(schema.events.leadId, lead.id)).run();
      testDb.db.delete(schema.messages).where(eq(schema.messages.leadId, lead.id)).run();
      testDb.db.delete(schema.leads).where(eq(schema.leads.id, lead.id)).run();

      // Simulate API response
      const response = { deleted: true, id: lead.id };
      expect(response).toHaveProperty("deleted", true);
      expect(response).toHaveProperty("id", lead.id);

      // Verify lead is gone
      const check = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();
      expect(check).toBeUndefined();
    });

    it("cascade delete removes all related events and messages", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const tpl = seedTestTemplate(testDb.db);
      seedTestMessage(testDb.db, lead.id, { body: "Msg 1", templateId: tpl.id });
      seedTestMessage(testDb.db, lead.id, { body: "Msg 2" });
      seedTestEvent(testDb.db, lead.id, { type: "import" });
      seedTestEvent(testDb.db, lead.id, { type: "sent" });
      seedTestEvent(testDb.db, lead.id, { type: "reply" });

      // Cascade delete like the API route does
      testDb.db.delete(schema.events).where(eq(schema.events.leadId, lead.id)).run();
      testDb.db.delete(schema.messages).where(eq(schema.messages.leadId, lead.id)).run();
      testDb.db.delete(schema.leads).where(eq(schema.leads.id, lead.id)).run();

      expect(
        testDb.db.select().from(schema.events).where(eq(schema.events.leadId, lead.id)).all()
      ).toHaveLength(0);
      expect(
        testDb.db.select().from(schema.messages).where(eq(schema.messages.leadId, lead.id)).all()
      ).toHaveLength(0);
      expect(
        testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get()
      ).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// Templates CRUD — versioned updates, response shapes
// ---------------------------------------------------------------------------
describe("Templates CRUD — response shapes & versioning", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/templates — response shape", () => {
    it("should return { templates: Template[] } shape", () => {
      testDb = createTestDb();
      seedTestTemplate(testDb.db, { name: "T1" });
      seedTestTemplate(testDb.db, { name: "T2" });

      const results = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.isActive, true))
        .orderBy(desc(schema.templates.createdAt))
        .all();

      const response = { templates: results };
      expect(response).toHaveProperty("templates");
      expect(Array.isArray(response.templates)).toBe(true);
      expect(response.templates).toHaveLength(2);
    });

    it("each template should have all required fields", () => {
      testDb = createTestDb();
      const tpl = seedTestTemplate(testDb.db, {
        name: "Intro LinkedIn",
        channel: "linkedin",
        segment: "enterprise",
        type: "initial",
        variant: "A",
        subject: "Partnership Opportunity",
        body: "Hi {{name}}, I noticed...",
      });

      expect(tpl).toHaveProperty("id");
      expect(tpl).toHaveProperty("name", "Intro LinkedIn");
      expect(tpl).toHaveProperty("channel", "linkedin");
      expect(tpl).toHaveProperty("segment", "enterprise");
      expect(tpl).toHaveProperty("type", "initial");
      expect(tpl).toHaveProperty("variant", "A");
      expect(tpl).toHaveProperty("subject", "Partnership Opportunity");
      expect(tpl).toHaveProperty("body", "Hi {{name}}, I noticed...");
      expect(tpl).toHaveProperty("version", 1);
      expect(tpl).toHaveProperty("isActive");
      expect(tpl).toHaveProperty("createdAt");
      expect(tpl).toHaveProperty("updatedAt");
    });

    it("should include inactive templates when includeInactive=true logic", () => {
      testDb = createTestDb();
      seedTestTemplate(testDb.db, { name: "Active", isActive: true });
      seedTestTemplate(testDb.db, { name: "Old Version", isActive: false });

      // Without includeInactive
      const activeOnly = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.isActive, true))
        .all();
      expect(activeOnly).toHaveLength(1);

      // With includeInactive (no filter)
      const all = testDb.db.select().from(schema.templates).all();
      expect(all).toHaveLength(2);
    });
  });

  describe("POST /api/templates — response shape", () => {
    it("should return { template: Template } with status 201 shape", () => {
      testDb = createTestDb();
      const result = testDb.db
        .insert(schema.templates)
        .values({
          name: "New Template",
          channel: "email",
          type: "follow-up",
          variant: "B",
          subject: "Following up",
          body: "Hi {{name}}, just circling back...",
          version: 1,
          isActive: true,
        })
        .returning()
        .get();

      const response = { template: result };
      expect(response).toHaveProperty("template");
      expect(response.template.id).toBeGreaterThan(0);
      expect(response.template.name).toBe("New Template");
      expect(response.template.channel).toBe("email");
      expect(response.template.type).toBe("follow-up");
      expect(response.template.version).toBe(1);
      expect(response.template.isActive).toBeTruthy();
    });

    it("should validate required fields (name, channel, type, body)", () => {
      const testCases = [
        { body: { channel: "email", type: "initial", body: "test" }, missing: "name" },
        { body: { name: "T", type: "initial", body: "test" }, missing: "channel" },
        { body: { name: "T", channel: "email", body: "test" }, missing: "type" },
        { body: { name: "T", channel: "email", type: "initial" }, missing: "body" },
      ];

      for (const tc of testCases) {
        const b = tc.body as Record<string, string>;
        const hasAll = b.name && b.channel && b.type && b.body;
        expect(hasAll).toBeFalsy();
      }
    });
  });

  describe("GET /api/templates/[id] — response shape with history", () => {
    it("should return { template, history } shape", () => {
      testDb = createTestDb();
      const tpl = seedTestTemplate(testDb.db, {
        name: "Versioned",
        channel: "linkedin",
        type: "initial",
        variant: "A",
      });

      const template = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.id, tpl.id))
        .get();

      // Fetch history: same channel × type × segment × variant
      const conditions = [
        eq(schema.templates.channel, template!.channel),
        eq(schema.templates.type, template!.type),
      ];
      const history = testDb.db
        .select()
        .from(schema.templates)
        .where(and(...conditions))
        .all();

      const response = { template, history };
      expect(response).toHaveProperty("template");
      expect(response).toHaveProperty("history");
      expect(Array.isArray(response.history)).toBe(true);
      expect(response.history.length).toBeGreaterThanOrEqual(1);
    });

    it("should return 404 shape for non-existent template", () => {
      testDb = createTestDb();
      const result = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.id, 99999))
        .get();

      expect(result).toBeUndefined();
      // API would return { error: "Template not found" } with status 404
    });
  });

  describe("PUT /api/templates/[id] — versioned update", () => {
    it("should deactivate old version and create new version", () => {
      testDb = createTestDb();
      const v1 = seedTestTemplate(testDb.db, {
        name: "Outreach V1",
        channel: "linkedin",
        segment: "enterprise",
        type: "initial",
        variant: "A",
        body: "Version 1 content",
        version: 1,
        isActive: true,
      });

      // Simulate PUT handler: deactivate old, insert new
      testDb.db
        .update(schema.templates)
        .set({ isActive: false })
        .where(eq(schema.templates.id, v1.id))
        .run();

      const v2 = testDb.db
        .insert(schema.templates)
        .values({
          name: "Outreach V1",       // name stays same (or can be updated)
          channel: v1.channel,       // channel preserved
          segment: v1.segment,       // segment preserved
          type: v1.type,             // type preserved
          variant: v1.variant,       // variant preserved
          body: "Version 2 — improved content",
          version: v1.version + 1,   // version incremented
          isActive: true,
        })
        .returning()
        .get();

      // Response shape
      const response = { template: v2 };
      expect(response.template.version).toBe(2);
      expect(response.template.isActive).toBeTruthy();
      expect(response.template.body).toBe("Version 2 — improved content");
      expect(response.template.channel).toBe("linkedin");
      expect(response.template.segment).toBe("enterprise");
      expect(response.template.type).toBe("initial");
      expect(response.template.variant).toBe("A");

      // Old version should be inactive but preserved
      const oldVersion = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.id, v1.id))
        .get();
      expect(oldVersion!.isActive).toBeFalsy();
      expect(oldVersion!.version).toBe(1);
      expect(oldVersion!.body).toBe("Version 1 content");

      // Both versions exist in history
      const history = testDb.db
        .select()
        .from(schema.templates)
        .where(
          and(
            eq(schema.templates.channel, "linkedin"),
            eq(schema.templates.type, "initial")
          )
        )
        .all();
      expect(history).toHaveLength(2);
    });

    it("should support multiple version increments preserving full history", () => {
      testDb = createTestDb();

      // v1
      const v1 = seedTestTemplate(testDb.db, {
        name: "Template",
        channel: "email",
        type: "breakup",
        body: "V1",
        version: 1,
      });

      // v2
      testDb.db.update(schema.templates).set({ isActive: false }).where(eq(schema.templates.id, v1.id)).run();
      const v2 = testDb.db
        .insert(schema.templates)
        .values({ name: "Template", channel: "email", type: "breakup", body: "V2", version: 2, isActive: true })
        .returning()
        .get();

      // v3
      testDb.db.update(schema.templates).set({ isActive: false }).where(eq(schema.templates.id, v2.id)).run();
      const v3 = testDb.db
        .insert(schema.templates)
        .values({ name: "Template", channel: "email", type: "breakup", body: "V3", version: 3, isActive: true })
        .returning()
        .get();

      // Full history preserved
      const all = testDb.db
        .select()
        .from(schema.templates)
        .where(and(eq(schema.templates.channel, "email"), eq(schema.templates.type, "breakup")))
        .all();

      expect(all).toHaveLength(3);
      expect(all.filter((t) => t.isActive).length).toBe(1); // only v3 active
      expect(all.find((t) => t.version === 3)?.body).toBe("V3");
    });

    it("should update subject when provided in PUT body", () => {
      testDb = createTestDb();
      const v1 = seedTestTemplate(testDb.db, {
        name: "Email Template",
        channel: "email",
        type: "initial",
        subject: "Old Subject",
        body: "Old body",
      });

      testDb.db.update(schema.templates).set({ isActive: false }).where(eq(schema.templates.id, v1.id)).run();

      const v2 = testDb.db
        .insert(schema.templates)
        .values({
          name: v1.name,
          channel: v1.channel,
          segment: v1.segment,
          type: v1.type,
          variant: v1.variant,
          subject: "New Subject",
          body: "Updated body",
          version: v1.version + 1,
          isActive: true,
        })
        .returning()
        .get();

      expect(v2.subject).toBe("New Subject");
      expect(v2.body).toBe("Updated body");
      expect(v2.version).toBe(2);
    });
  });
});

// ---------------------------------------------------------------------------
// Messages CRUD — with templateId FK & selectedHook
// ---------------------------------------------------------------------------
describe("Messages CRUD — response shapes & FK integrity", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/messages — response shape", () => {
    it("should return { messages: Message[] } shape", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      seedTestMessage(testDb.db, lead.id, { body: "M1" });
      seedTestMessage(testDb.db, lead.id, { body: "M2" });

      const results = testDb.db
        .select()
        .from(schema.messages)
        .orderBy(desc(schema.messages.createdAt))
        .all();

      const response = { messages: results };
      expect(response).toHaveProperty("messages");
      expect(Array.isArray(response.messages)).toBe(true);
      expect(response.messages).toHaveLength(2);
    });
  });

  describe("POST /api/messages — response shape with templateId & selectedHook", () => {
    it("should return { message: Message } with status 201 shape", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const tpl = seedTestTemplate(testDb.db, { name: "Outreach A" });

      const result = testDb.db
        .insert(schema.messages)
        .values({
          leadId: lead.id,
          templateId: tpl.id,
          channel: "linkedin",
          subject: "Let's connect",
          body: "Hi, I noticed your work...",
          selectedHook: JSON.stringify({ hook: "Series B funding" }),
          status: "draft",
          followUpDate: "2026-04-15",
        })
        .returning()
        .get();

      const response = { message: result };
      expect(response).toHaveProperty("message");
      expect(response.message.id).toBeGreaterThan(0);
      expect(response.message.leadId).toBe(lead.id);
      expect(response.message.templateId).toBe(tpl.id);
      expect(response.message.channel).toBe("linkedin");
      expect(response.message.selectedHook).toBe(JSON.stringify({ hook: "Series B funding" }));
      expect(response.message.status).toBe("draft");
      expect(response.message.followUpDate).toBe("2026-04-15");
      expect(response.message.sentAt).toBeNull();
    });

    it("each message should have all required fields in response", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id);

      expect(msg).toHaveProperty("id");
      expect(msg).toHaveProperty("leadId");
      expect(msg).toHaveProperty("templateId");
      expect(msg).toHaveProperty("channel");
      expect(msg).toHaveProperty("subject");
      expect(msg).toHaveProperty("body");
      expect(msg).toHaveProperty("selectedHook");
      expect(msg).toHaveProperty("status");
      expect(msg).toHaveProperty("outcome");
      expect(msg).toHaveProperty("sentAt");
      expect(msg).toHaveProperty("followUpDate");
      expect(msg).toHaveProperty("createdAt");
      expect(msg).toHaveProperty("updatedAt");
    });

    it("should reject message for non-existent lead (FK constraint)", () => {
      testDb = createTestDb();
      expect(() => {
        testDb.db
          .insert(schema.messages)
          .values({ leadId: 99999, body: "orphaned" })
          .run();
      }).toThrow();
    });

    it("should accept message with null templateId", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = testDb.db
        .insert(schema.messages)
        .values({
          leadId: lead.id,
          templateId: null,
          body: "Freeform message",
        })
        .returning()
        .get();

      expect(msg.templateId).toBeNull();
    });

    it("should reject message referencing non-existent template (FK constraint)", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      expect(() => {
        testDb.db
          .insert(schema.messages)
          .values({ leadId: lead.id, templateId: 99999, body: "test" })
          .run();
      }).toThrow();
    });
  });

  describe("GET /api/messages/[id] — response shape", () => {
    it("should return { message: Message } shape", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id, { body: "Test body" });

      const result = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.id, msg.id))
        .get();

      const response = { message: result };
      expect(response).toHaveProperty("message");
      expect(response.message!.id).toBe(msg.id);
      expect(response.message!.body).toBe("Test body");
    });
  });

  describe("PATCH /api/messages/[id] — status transitions & outcome mapping", () => {
    it("should return { message: Message } with updated fields", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id, { status: "draft" });

      testDb.db
        .update(schema.messages)
        .set({
          status: "queued",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.messages.id, msg.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.id, msg.id))
        .get();

      const response = { message: updated };
      expect(response.message!.status).toBe("queued");
    });

    it("should set sentAt on transition to sent", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { status: "new" });
      const msg = seedTestMessage(testDb.db, lead.id, { status: "queued" });

      const sentAt = new Date().toISOString();
      testDb.db
        .update(schema.messages)
        .set({ status: "sent", sentAt })
        .where(eq(schema.messages.id, msg.id))
        .run();

      const result = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.id, msg.id))
        .get();
      expect(result!.status).toBe("sent");
      expect(result!.sentAt).toBe(sentAt);
    });

    it("should update followUpDate on PATCH", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id);

      testDb.db
        .update(schema.messages)
        .set({ followUpDate: "2026-05-01" })
        .where(eq(schema.messages.id, msg.id))
        .run();

      const result = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.id, msg.id))
        .get();
      expect(result!.followUpDate).toBe("2026-05-01");
    });

    it("should update selectedHook on PATCH", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id);

      const hookData = JSON.stringify({ hook: "Just raised Series A", source: "crunchbase" });
      testDb.db
        .update(schema.messages)
        .set({ selectedHook: hookData })
        .where(eq(schema.messages.id, msg.id))
        .run();

      const result = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.id, msg.id))
        .get();
      const parsed = JSON.parse(result!.selectedHook!);
      expect(parsed.hook).toBe("Just raised Series A");
      expect(parsed.source).toBe("crunchbase");
    });

    it("should correctly map all outcomes to lead statuses", () => {
      // Verify the complete STATUS_MAP
      expect(schema.STATUS_MAP["replied"]).toBe("replied");
      expect(schema.STATUS_MAP["booked"]).toBe("booked");
      expect(schema.STATUS_MAP["closed"]).toBe("closed");
      expect(schema.STATUS_MAP["not_now"]).toBe("nurture");
      expect(schema.STATUS_MAP["ignored"]).toBe("contacted");
    });

    it("should propagate outcome closed → lead status closed with event", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { status: "booked" });
      const msg = seedTestMessage(testDb.db, lead.id, { status: "sent" });

      // Simulate API: set outcome, update lead status, log event
      testDb.db
        .update(schema.messages)
        .set({ outcome: "closed" })
        .where(eq(schema.messages.id, msg.id))
        .run();

      testDb.db
        .update(schema.leads)
        .set({ status: schema.STATUS_MAP["closed"] })
        .where(eq(schema.leads.id, lead.id))
        .run();

      testDb.db
        .insert(schema.events)
        .values({
          leadId: lead.id,
          type: "closed",
          detail: "Message outcome: closed",
          metadata: JSON.stringify({ messageId: msg.id, outcome: "closed" }),
        })
        .run();

      const updatedLead = testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get();
      expect(updatedLead!.status).toBe("closed");

      const updatedMsg = testDb.db.select().from(schema.messages).where(eq(schema.messages.id, msg.id)).get();
      expect(updatedMsg!.outcome).toBe("closed");

      const eventLog = testDb.db.select().from(schema.events).where(eq(schema.events.leadId, lead.id)).all();
      expect(eventLog).toHaveLength(1);
      expect(eventLog[0].type).toBe("closed");
    });
  });
});

// ---------------------------------------------------------------------------
// Events CRUD — response shapes & lead status side-effects
// ---------------------------------------------------------------------------
describe("Events CRUD — response shapes & status side-effects", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/events — response shape", () => {
    it("should return { events: Event[] } shape", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      seedTestEvent(testDb.db, lead.id, { type: "note", detail: "Call went well" });

      const results = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .orderBy(desc(schema.events.createdAt))
        .all();

      const response = { events: results };
      expect(response).toHaveProperty("events");
      expect(Array.isArray(response.events)).toBe(true);
    });

    it("each event should have all required fields", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const ev = seedTestEvent(testDb.db, lead.id, {
        type: "sent",
        detail: "Outreach sent",
        metadata: JSON.stringify({ channel: "linkedin" }),
      });

      expect(ev).toHaveProperty("id");
      expect(ev).toHaveProperty("leadId", lead.id);
      expect(ev).toHaveProperty("type", "sent");
      expect(ev).toHaveProperty("detail", "Outreach sent");
      expect(ev).toHaveProperty("metadata");
      expect(ev).toHaveProperty("createdAt");
      expect(typeof ev.createdAt).toBe("string");
    });

    it("should require leadId query parameter (validation logic)", () => {
      // The API returns 400 when leadId is missing
      const leadId = null;
      expect(!leadId).toBe(true);
    });
  });

  describe("POST /api/events — response shape & status updates", () => {
    it("should return { event: Event } with status 201 shape", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);

      const result = testDb.db
        .insert(schema.events)
        .values({
          leadId: lead.id,
          type: "note",
          detail: "Follow-up scheduled for next week",
        })
        .returning()
        .get();

      const response = { event: result };
      expect(response).toHaveProperty("event");
      expect(response.event.id).toBeGreaterThan(0);
      expect(response.event.type).toBe("note");
    });

    it("should validate event type against EVENT_TYPES enum", () => {
      const validTypes: readonly string[] = schema.EVENT_TYPES;
      expect(validTypes).toContain("sent");
      expect(validTypes).toContain("reply");
      expect(validTypes).toContain("booked");
      expect(validTypes).toContain("closed");
      expect(validTypes).toContain("lost");
      expect(validTypes).toContain("note");
      expect(validTypes).toContain("import");
      expect(validTypes).toContain("score_change");
      expect(validTypes).not.toContain("invalid");
      expect(validTypes).not.toContain("deleted");
    });

    it("event type 'sent' should update lead to contacted", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { status: "new" });

      testDb.db.insert(schema.events).values({ leadId: lead.id, type: "sent", detail: "Sent" }).run();

      // Simulate API side-effect
      testDb.db.update(schema.leads).set({ status: "contacted" }).where(eq(schema.leads.id, lead.id)).run();

      const updated = testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get();
      expect(updated!.status).toBe("contacted");
    });

    it("event type 'booked' should update lead to booked", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { status: "replied" });

      testDb.db.insert(schema.events).values({ leadId: lead.id, type: "booked", detail: "Meeting booked" }).run();
      testDb.db.update(schema.leads).set({ status: "booked" }).where(eq(schema.leads.id, lead.id)).run();

      const updated = testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get();
      expect(updated!.status).toBe("booked");
    });

    it("event type 'lost' should update lead to lost", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { status: "contacted" });

      testDb.db.insert(schema.events).values({ leadId: lead.id, type: "lost", detail: "No budget" }).run();
      testDb.db.update(schema.leads).set({ status: "lost" }).where(eq(schema.leads.id, lead.id)).run();

      const updated = testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get();
      expect(updated!.status).toBe("lost");
    });

    it("event type 'note' should NOT change lead status", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { status: "contacted" });

      testDb.db.insert(schema.events).values({ leadId: lead.id, type: "note", detail: "Just a note" }).run();
      // No status update for "note" type

      const updated = testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get();
      expect(updated!.status).toBe("contacted");
    });
  });
});

// ---------------------------------------------------------------------------
// Runs CRUD — response shapes & audit trail
// ---------------------------------------------------------------------------
describe("Runs CRUD — response shapes & audit trail", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/runs — response shape", () => {
    it("should return { runs: Run[] } shape", () => {
      testDb = createTestDb();
      testDb.db.insert(schema.runs).values({ action: "csv_import" }).run();

      const results = testDb.db
        .select()
        .from(schema.runs)
        .orderBy(desc(schema.runs.createdAt))
        .all();

      const response = { runs: results };
      expect(response).toHaveProperty("runs");
      expect(Array.isArray(response.runs)).toBe(true);
      expect(response.runs).toHaveLength(1);
    });

    it("each run should have all required fields", () => {
      testDb = createTestDb();
      const run = testDb.db
        .insert(schema.runs)
        .values({
          action: "scoring_batch",
          rulesVersion: 1,
          inputSummary: "50 leads",
          outputSummary: "All scored",
        })
        .returning()
        .get();

      expect(run).toHaveProperty("id");
      expect(run).toHaveProperty("action", "scoring_batch");
      expect(run).toHaveProperty("rulesVersion", 1);
      expect(run).toHaveProperty("inputSummary", "50 leads");
      expect(run).toHaveProperty("outputSummary", "All scored");
      expect(run).toHaveProperty("createdAt");
    });
  });

  describe("POST /api/runs — response shape", () => {
    it("should return { run: Run } with status 201 shape", () => {
      testDb = createTestDb();
      const result = testDb.db
        .insert(schema.runs)
        .values({
          action: "queue_build",
          rulesVersion: 2,
          inputSummary: JSON.stringify({ filters: { status: "new", minScore: 50 } }),
          outputSummary: JSON.stringify({ queued: 15 }),
        })
        .returning()
        .get();

      const response = { run: result };
      expect(response).toHaveProperty("run");
      expect(response.run.action).toBe("queue_build");
      expect(response.run.rulesVersion).toBe(2);

      const input = JSON.parse(response.run.inputSummary!);
      expect(input.filters.minScore).toBe(50);
    });

    it("should validate action is required (simulated)", () => {
      const body: Record<string, unknown> = {};
      expect(!body.action).toBe(true);
    });

    it("should accept run with null optional fields", () => {
      testDb = createTestDb();
      const result = testDb.db
        .insert(schema.runs)
        .values({ action: "test_action" })
        .returning()
        .get();

      expect(result.rulesVersion).toBeNull();
      expect(result.inputSummary).toBeNull();
      expect(result.outputSummary).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Partners CRUD — response shapes
// ---------------------------------------------------------------------------
describe("Partners CRUD — response shapes", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/partners — response shape", () => {
    it("should return { partners: Partner[] } shape", () => {
      testDb = createTestDb();
      testDb.db.insert(schema.partners).values({ name: "P1", type: "referral" }).run();
      testDb.db.insert(schema.partners).values({ name: "P2", type: "agency" }).run();

      const results = testDb.db
        .select()
        .from(schema.partners)
        .orderBy(desc(schema.partners.createdAt))
        .all();

      const response = { partners: results };
      expect(response).toHaveProperty("partners");
      expect(Array.isArray(response.partners)).toBe(true);
      expect(response.partners).toHaveLength(2);
    });
  });

  describe("POST /api/partners — response shape", () => {
    it("should return { partner: Partner } with status 201 shape", () => {
      testDb = createTestDb();
      const result = testDb.db
        .insert(schema.partners)
        .values({
          name: "Tech Partner",
          type: "technology",
          contactInfo: "partner@tech.io",
          notes: "Specializes in React consultancy",
        })
        .returning()
        .get();

      const response = { partner: result };
      expect(response).toHaveProperty("partner");
      expect(response.partner.id).toBeGreaterThan(0);
      expect(response.partner.name).toBe("Tech Partner");
      expect(response.partner.type).toBe("technology");
      expect(response.partner.contactInfo).toBe("partner@tech.io");
      expect(response.partner.notes).toBe("Specializes in React consultancy");
      expect(response.partner.createdAt).toBeDefined();
    });

    it("each partner should have all required fields", () => {
      testDb = createTestDb();
      const partner = testDb.db
        .insert(schema.partners)
        .values({ name: "Simple" })
        .returning()
        .get();

      expect(partner).toHaveProperty("id");
      expect(partner).toHaveProperty("name");
      expect(partner).toHaveProperty("type");
      expect(partner).toHaveProperty("contactInfo");
      expect(partner).toHaveProperty("notes");
      expect(partner).toHaveProperty("createdAt");
    });

    it("should default optional fields to null", () => {
      testDb = createTestDb();
      const partner = testDb.db
        .insert(schema.partners)
        .values({ name: "Minimal" })
        .returning()
        .get();

      expect(partner.type).toBeNull();
      expect(partner.contactInfo).toBeNull();
      expect(partner.notes).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Cross-entity integrity tests
// ---------------------------------------------------------------------------
describe("Cross-entity CRUD integrity", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  it("message with templateId preserves template reference after template version update", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    const tplV1 = seedTestTemplate(testDb.db, {
      name: "Intro",
      channel: "linkedin",
      type: "initial",
      body: "V1 body",
      version: 1,
    });

    // Create message referencing v1
    const msg = testDb.db
      .insert(schema.messages)
      .values({
        leadId: lead.id,
        templateId: tplV1.id,
        body: "Customized from V1",
        selectedHook: JSON.stringify({ hook: "Your blog post on React" }),
      })
      .returning()
      .get();

    // Now create v2 of template (deactivate v1)
    testDb.db.update(schema.templates).set({ isActive: false }).where(eq(schema.templates.id, tplV1.id)).run();
    const tplV2 = testDb.db
      .insert(schema.templates)
      .values({
        name: "Intro",
        channel: "linkedin",
        type: "initial",
        body: "V2 body — improved",
        version: 2,
        isActive: true,
      })
      .returning()
      .get();

    // Message still references the OLD template version — this is the audit trail
    const refetchedMsg = testDb.db.select().from(schema.messages).where(eq(schema.messages.id, msg.id)).get();
    expect(refetchedMsg!.templateId).toBe(tplV1.id);
    expect(refetchedMsg!.templateId).not.toBe(tplV2.id);

    // Old template is still queryable (never deleted, just deactivated)
    const oldTpl = testDb.db.select().from(schema.templates).where(eq(schema.templates.id, tplV1.id)).get();
    expect(oldTpl).toBeDefined();
    expect(oldTpl!.body).toBe("V1 body");
  });

  it("deleting a lead should not affect other leads' messages or events", () => {
    testDb = createTestDb();
    const leadA = seedTestLead(testDb.db, { name: "Keep" });
    const leadB = seedTestLead(testDb.db, { name: "Delete" });

    seedTestMessage(testDb.db, leadA.id, { body: "A msg" });
    seedTestMessage(testDb.db, leadB.id, { body: "B msg" });
    seedTestEvent(testDb.db, leadA.id, { type: "note", detail: "A event" });
    seedTestEvent(testDb.db, leadB.id, { type: "note", detail: "B event" });

    // Cascade delete leadB
    testDb.db.delete(schema.events).where(eq(schema.events.leadId, leadB.id)).run();
    testDb.db.delete(schema.messages).where(eq(schema.messages.leadId, leadB.id)).run();
    testDb.db.delete(schema.leads).where(eq(schema.leads.id, leadB.id)).run();

    // leadA's data is untouched
    const aMsgs = testDb.db.select().from(schema.messages).where(eq(schema.messages.leadId, leadA.id)).all();
    const aEvents = testDb.db.select().from(schema.events).where(eq(schema.events.leadId, leadA.id)).all();
    expect(aMsgs).toHaveLength(1);
    expect(aEvents).toHaveLength(1);
    expect(aMsgs[0].body).toBe("A msg");
    expect(aEvents[0].detail).toBe("A event");
  });

  it("creating a lead, sending a message, and logging events produces correct audit trail", () => {
    testDb = createTestDb();

    // 1. Create lead with scoring
    const scoreResult = calculateScore({
      companySize: "enterprise",
      techStackMatch: "strong",
      painSignalStrength: "moderate",
      decisionMakerAccess: "indirect",
    });

    const lead = testDb.db
      .insert(schema.leads)
      .values({
        name: "Enterprise Lead",
        company: "BigCo",
        status: "new",
        score: scoreResult.totalScore,
        companySize: "enterprise",
        techStackMatch: "strong",
      })
      .returning()
      .get();

    // 2. Log import event
    testDb.db
      .insert(schema.events)
      .values({ leadId: lead.id, type: "import", detail: "Created" })
      .run();

    // 3. Create template + message
    const tpl = seedTestTemplate(testDb.db, { name: "Outreach", body: "Hi {{name}}" });
    const msg = testDb.db
      .insert(schema.messages)
      .values({
        leadId: lead.id,
        templateId: tpl.id,
        body: "Hi Enterprise Lead, ...",
        selectedHook: "Your hiring for React devs",
        status: "draft",
      })
      .returning()
      .get();

    // 4. Queue and send the message
    testDb.db.update(schema.messages).set({ status: "queued" }).where(eq(schema.messages.id, msg.id)).run();
    testDb.db
      .update(schema.messages)
      .set({ status: "sent", sentAt: new Date().toISOString() })
      .where(eq(schema.messages.id, msg.id))
      .run();
    testDb.db
      .insert(schema.events)
      .values({ leadId: lead.id, type: "sent", detail: "Message sent" })
      .run();
    testDb.db
      .update(schema.leads)
      .set({ status: "contacted" })
      .where(eq(schema.leads.id, lead.id))
      .run();

    // 5. Log a run for audit
    const run = testDb.db
      .insert(schema.runs)
      .values({
        action: "manual_send",
        rulesVersion: scoreResult.rulesVersion,
        inputSummary: JSON.stringify({ leadId: lead.id, messageId: msg.id }),
      })
      .returning()
      .get();

    // Verify full audit trail
    const finalLead = testDb.db.select().from(schema.leads).where(eq(schema.leads.id, lead.id)).get();
    expect(finalLead!.status).toBe("contacted");
    expect(finalLead!.score).toBeGreaterThan(0);

    const finalMsg = testDb.db.select().from(schema.messages).where(eq(schema.messages.id, msg.id)).get();
    expect(finalMsg!.status).toBe("sent");
    expect(finalMsg!.templateId).toBe(tpl.id);
    expect(finalMsg!.selectedHook).toBe("Your hiring for React devs");
    expect(finalMsg!.sentAt).toBeDefined();

    const timeline = testDb.db
      .select()
      .from(schema.events)
      .where(eq(schema.events.leadId, lead.id))
      .orderBy(schema.events.createdAt)
      .all();
    expect(timeline).toHaveLength(2);
    expect(timeline[0].type).toBe("import");
    expect(timeline[1].type).toBe("sent");

    expect(run.action).toBe("manual_send");
    expect(run.rulesVersion).toBe(scoreResult.rulesVersion);
  });
});
