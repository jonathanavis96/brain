import { describe, it, expect, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, seedTestLead, seedTestTemplate, seedTestMessage, seedTestEvent } from "../test-helpers";
import * as schema from "../../src/db/schema";

describe("Database Schema Integration", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("leads table", () => {
    it("should create a lead with defaults", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      expect(lead.id).toBeDefined();
      expect(lead.name).toBe("Test Lead");
      expect(lead.company).toBe("Test Corp");
      expect(lead.status).toBe("new");
      expect(lead.score).toBe(0);
      expect(lead.createdAt).toBeDefined();
    });

    it("should create a lead with all fields", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        name: "Jane Doe",
        company: "Acme Inc",
        title: "CTO",
        email: "jane@acme.com",
        linkedinUrl: "https://linkedin.com/in/jane",
        channel: "email",
        segment: "enterprise",
        score: 85,
        companySize: "enterprise",
        techStackMatch: "perfect",
        painSignalStrength: "explicit",
        decisionMakerAccess: "direct",
        engagementSignals: "active",
        segmentFit: "ideal",
        notes: "Met at conference",
      });
      expect(lead.title).toBe("CTO");
      expect(lead.email).toBe("jane@acme.com");
      expect(lead.score).toBe(85);
      expect(lead.companySize).toBe("enterprise");
    });

    it("should auto-increment lead IDs", () => {
      testDb = createTestDb();
      const lead1 = seedTestLead(testDb.db, { name: "Lead 1" });
      const lead2 = seedTestLead(testDb.db, { name: "Lead 2" });
      expect(lead2.id).toBe(lead1.id + 1);
    });

    it("should update a lead", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      testDb.db
        .update(schema.leads)
        .set({ status: "contacted", score: 50 })
        .where(eq(schema.leads.id, lead.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();
      expect(updated?.status).toBe("contacted");
      expect(updated?.score).toBe(50);
    });

    it("should delete a lead", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      testDb.db
        .delete(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .run();

      const deleted = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();
      expect(deleted).toBeUndefined();
    });

    it("should query leads by status", () => {
      testDb = createTestDb();
      seedTestLead(testDb.db, { name: "Lead A", status: "new" });
      seedTestLead(testDb.db, { name: "Lead B", status: "contacted" });
      seedTestLead(testDb.db, { name: "Lead C", status: "new" });

      const newLeads = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.status, "new"))
        .all();
      expect(newLeads).toHaveLength(2);
    });
  });

  describe("templates table", () => {
    it("should create a template with defaults", () => {
      testDb = createTestDb();
      const template = seedTestTemplate(testDb.db);
      expect(template.id).toBeDefined();
      expect(template.version).toBe(1);
      expect(template.isActive).toBeTruthy();
    });

    it("should create templates with different variants", () => {
      testDb = createTestDb();
      const tplA = seedTestTemplate(testDb.db, { name: "Intro A", variant: "A" });
      const tplB = seedTestTemplate(testDb.db, { name: "Intro B", variant: "B" });
      const tplC = seedTestTemplate(testDb.db, { name: "Intro C", variant: "C" });
      expect(tplA.variant).toBe("A");
      expect(tplB.variant).toBe("B");
      expect(tplC.variant).toBe("C");
    });

    it("should filter active templates", () => {
      testDb = createTestDb();
      seedTestTemplate(testDb.db, { name: "Active", isActive: true });
      seedTestTemplate(testDb.db, { name: "Inactive", isActive: false });

      const active = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.isActive, true))
        .all();
      expect(active).toHaveLength(1);
      expect(active[0].name).toBe("Active");
    });
  });

  describe("messages table", () => {
    it("should create a message linked to a lead", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const message = seedTestMessage(testDb.db, lead.id);
      expect(message.leadId).toBe(lead.id);
      expect(message.status).toBe("draft");
    });

    it("should create a message with template reference", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const template = seedTestTemplate(testDb.db);
      const message = seedTestMessage(testDb.db, lead.id, {
        templateId: template.id,
        selectedHook: "Custom hook for this lead",
      });
      expect(message.templateId).toBe(template.id);
      expect(message.selectedHook).toBe("Custom hook for this lead");
    });

    it("should support follow-up date", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const message = seedTestMessage(testDb.db, lead.id, {
        status: "sent",
        followUpDate: "2026-04-01",
        sentAt: "2026-03-24T10:00:00Z",
      });
      expect(message.followUpDate).toBe("2026-04-01");
      expect(message.sentAt).toBe("2026-03-24T10:00:00Z");
    });

    it("should query messages by status", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      seedTestMessage(testDb.db, lead.id, { status: "queued" });
      seedTestMessage(testDb.db, lead.id, { status: "queued" });
      seedTestMessage(testDb.db, lead.id, { status: "sent" });

      const queued = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.status, "queued"))
        .all();
      expect(queued).toHaveLength(2);
    });

    it("should enforce foreign key on leadId", () => {
      testDb = createTestDb();
      expect(() => {
        testDb.db
          .insert(schema.messages)
          .values({
            leadId: 99999,
            body: "test",
            status: "draft",
          })
          .run();
      }).toThrow();
    });
  });

  describe("events table", () => {
    it("should create an event linked to a lead", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const event = seedTestEvent(testDb.db, lead.id, {
        type: "sent",
        detail: "Initial outreach sent",
      });
      expect(event.leadId).toBe(lead.id);
      expect(event.type).toBe("sent");
    });

    it("should store metadata as JSON string", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const metadata = JSON.stringify({ oldScore: 30, newScore: 75 });
      const event = seedTestEvent(testDb.db, lead.id, {
        type: "score_change",
        metadata,
      });
      expect(event.metadata).toBe(metadata);
      const parsed = JSON.parse(event.metadata!);
      expect(parsed.oldScore).toBe(30);
    });

    it("should query events by lead", () => {
      testDb = createTestDb();
      const lead1 = seedTestLead(testDb.db, { name: "Lead 1" });
      const lead2 = seedTestLead(testDb.db, { name: "Lead 2" });
      seedTestEvent(testDb.db, lead1.id, { type: "sent" });
      seedTestEvent(testDb.db, lead1.id, { type: "reply" });
      seedTestEvent(testDb.db, lead2.id, { type: "note" });

      const lead1Events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead1.id))
        .all();
      expect(lead1Events).toHaveLength(2);
    });

    it("should enforce foreign key on leadId", () => {
      testDb = createTestDb();
      expect(() => {
        testDb.db
          .insert(schema.events)
          .values({
            leadId: 99999,
            type: "note",
          })
          .run();
      }).toThrow();
    });
  });

  describe("runs table", () => {
    it("should log a run with metadata", () => {
      testDb = createTestDb();
      const run = testDb.db
        .insert(schema.runs)
        .values({
          action: "csv_import",
          rulesVersion: 1,
          inputSummary: JSON.stringify({ rows: 50 }),
          outputSummary: JSON.stringify({ imported: 48, skipped: 2 }),
        })
        .returning()
        .get();
      expect(run.action).toBe("csv_import");
      expect(run.rulesVersion).toBe(1);
      const input = JSON.parse(run.inputSummary!);
      expect(input.rows).toBe(50);
    });
  });

  describe("metric_snapshots table", () => {
    it("should store a metric snapshot", () => {
      testDb = createTestDb();
      const snapshot = testDb.db
        .insert(schema.metricSnapshots)
        .values({
          totalLeads: 100,
          contacted: 40,
          replied: 20,
          booked: 10,
          closed: 5,
          avgScore: 67.5,
        })
        .returning()
        .get();
      expect(snapshot.totalLeads).toBe(100);
      expect(snapshot.avgScore).toBe(67.5);
      expect(snapshot.snapshotDate).toBeDefined();
    });
  });

  describe("partners table", () => {
    it("should create a partner", () => {
      testDb = createTestDb();
      const partner = testDb.db
        .insert(schema.partners)
        .values({
          name: "Tech Partner",
          type: "referral",
          contactInfo: "partner@tech.com",
          notes: "Referred 3 leads",
        })
        .returning()
        .get();
      expect(partner.name).toBe("Tech Partner");
      expect(partner.type).toBe("referral");
    });
  });

  describe("cross-table queries", () => {
    it("should join messages with leads", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { name: "Alice", company: "AliceCorp" });
      seedTestMessage(testDb.db, lead.id, { body: "Hello Alice", status: "queued" });

      const results = testDb.db
        .select({
          message: schema.messages,
          lead: schema.leads,
        })
        .from(schema.messages)
        .innerJoin(schema.leads, eq(schema.messages.leadId, schema.leads.id))
        .all();

      expect(results).toHaveLength(1);
      expect(results[0].lead.name).toBe("Alice");
      expect(results[0].message.body).toBe("Hello Alice");
    });

    it("should join messages with templates", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const template = seedTestTemplate(testDb.db, { name: "Intro Template" });
      seedTestMessage(testDb.db, lead.id, { templateId: template.id });

      const results = testDb.db
        .select({
          message: schema.messages,
          template: schema.templates,
        })
        .from(schema.messages)
        .innerJoin(
          schema.templates,
          eq(schema.messages.templateId, schema.templates.id)
        )
        .all();

      expect(results).toHaveLength(1);
      expect(results[0].template.name).toBe("Intro Template");
    });
  });
});
