/**
 * Tests for /api/leads/[id] route logic (GET, PATCH, DELETE).
 * Tests the database operations that the individual lead route performs.
 */
import { describe, it, expect, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, seedTestLead, seedTestMessage, seedTestEvent } from "../test-helpers";
import * as schema from "../../src/db/schema";
import { calculateScore } from "../../src/lib/scoring";

describe("Lead Detail API Logic (/api/leads/[id])", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET — fetch individual lead with events", () => {
    it("should return lead by ID", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { name: "Alice", company: "AliceCorp" });

      const result = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(result).toBeDefined();
      expect(result?.name).toBe("Alice");
      expect(result?.company).toBe("AliceCorp");
    });

    it("should return undefined for non-existent lead", () => {
      testDb = createTestDb();
      const result = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, 99999))
        .get();

      expect(result).toBeUndefined();
    });

    it("should include recent events for the lead", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { name: "Alice" });
      seedTestEvent(testDb.db, lead.id, { type: "import", detail: "Imported" });
      seedTestEvent(testDb.db, lead.id, { type: "sent", detail: "First contact" });
      seedTestEvent(testDb.db, lead.id, { type: "reply", detail: "Got reply" });

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      expect(events).toHaveLength(3);
    });

    it("should not include events from other leads", () => {
      testDb = createTestDb();
      const lead1 = seedTestLead(testDb.db, { name: "Lead 1" });
      const lead2 = seedTestLead(testDb.db, { name: "Lead 2" });
      seedTestEvent(testDb.db, lead1.id, { type: "sent" });
      seedTestEvent(testDb.db, lead2.id, { type: "note" });

      const lead1Events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead1.id))
        .all();

      expect(lead1Events).toHaveLength(1);
      expect(lead1Events[0].type).toBe("sent");
    });
  });

  describe("PATCH — update lead fields", () => {
    it("should update basic lead fields", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        name: "Old Name",
        company: "Old Corp",
      });

      testDb.db
        .update(schema.leads)
        .set({
          name: "New Name",
          company: "New Corp",
          title: "CEO",
          email: "ceo@newcorp.com",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.leads.id, lead.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(updated?.name).toBe("New Name");
      expect(updated?.company).toBe("New Corp");
      expect(updated?.title).toBe("CEO");
      expect(updated?.email).toBe("ceo@newcorp.com");
    });

    it("should update status field", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { status: "new" });

      testDb.db
        .update(schema.leads)
        .set({ status: "contacted" })
        .where(eq(schema.leads.id, lead.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(updated?.status).toBe("contacted");
    });

    it("should recalculate score when scoring fields change", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        score: 10,
        companySize: "startup",
      });

      const newInput = {
        companySize: "enterprise",
        techStackMatch: "perfect",
        painSignalStrength: "explicit",
        decisionMakerAccess: "direct",
        engagementSignals: "active",
        segmentFit: "ideal",
      };

      const scoreResult = calculateScore(newInput);

      testDb.db
        .update(schema.leads)
        .set({
          score: scoreResult.totalScore,
          ...newInput,
        })
        .where(eq(schema.leads.id, lead.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(updated?.score).toBe(100);
      expect(updated?.companySize).toBe("enterprise");
    });

    it("should log score_change event on score update", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { score: 30 });
      const newScore = 85;

      testDb.db
        .insert(schema.events)
        .values({
          leadId: lead.id,
          type: "score_change",
          detail: `Score changed from ${lead.score} to ${newScore}`,
          metadata: JSON.stringify({
            previousScore: lead.score,
            newScore,
            rulesVersion: 1,
          }),
        })
        .run();

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("score_change");
      const meta = JSON.parse(events[0].metadata!);
      expect(meta.previousScore).toBe(30);
      expect(meta.newScore).toBe(85);
    });

    it("should preserve untouched fields on partial update", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        name: "Alice",
        company: "AliceCorp",
        title: "CTO",
        email: "alice@corp.com",
        notes: "Important lead",
      });

      // Only update the title
      testDb.db
        .update(schema.leads)
        .set({ title: "VP Engineering" })
        .where(eq(schema.leads.id, lead.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(updated?.name).toBe("Alice");
      expect(updated?.company).toBe("AliceCorp");
      expect(updated?.title).toBe("VP Engineering");
      expect(updated?.email).toBe("alice@corp.com");
      expect(updated?.notes).toBe("Important lead");
    });
  });

  describe("DELETE — cascade delete lead", () => {
    it("should delete a lead by ID", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);

      testDb.db
        .delete(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .run();

      const result = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(result).toBeUndefined();
    });

    it("should cascade delete events for the lead", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      seedTestEvent(testDb.db, lead.id, { type: "sent" });
      seedTestEvent(testDb.db, lead.id, { type: "reply" });

      // First delete events, then lead (as the API does)
      testDb.db
        .delete(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .run();
      testDb.db
        .delete(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .run();

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();
      expect(events).toHaveLength(0);
    });

    it("should cascade delete messages for the lead", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      seedTestMessage(testDb.db, lead.id, { body: "Hello" });
      seedTestMessage(testDb.db, lead.id, { body: "Follow up" });

      // Cascade delete
      testDb.db
        .delete(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .run();
      testDb.db
        .delete(schema.messages)
        .where(eq(schema.messages.leadId, lead.id))
        .run();
      testDb.db
        .delete(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .run();

      const messages = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.leadId, lead.id))
        .all();
      expect(messages).toHaveLength(0);
    });

    it("should not affect other leads when deleting one", () => {
      testDb = createTestDb();
      const lead1 = seedTestLead(testDb.db, { name: "Keep" });
      const lead2 = seedTestLead(testDb.db, { name: "Delete" });
      seedTestEvent(testDb.db, lead1.id, { type: "note" });
      seedTestEvent(testDb.db, lead2.id, { type: "note" });

      // Delete lead2 cascade
      testDb.db
        .delete(schema.events)
        .where(eq(schema.events.leadId, lead2.id))
        .run();
      testDb.db
        .delete(schema.leads)
        .where(eq(schema.leads.id, lead2.id))
        .run();

      // lead1 should still exist
      const remaining = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead1.id))
        .get();
      expect(remaining?.name).toBe("Keep");

      const remainingEvents = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead1.id))
        .all();
      expect(remainingEvents).toHaveLength(1);
    });
  });
});
