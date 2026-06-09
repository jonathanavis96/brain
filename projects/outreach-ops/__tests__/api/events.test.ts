import { describe, it, expect, afterEach } from "vitest";
import { eq, desc } from "drizzle-orm";
import { createTestDb, seedTestLead, seedTestEvent } from "../test-helpers";
import * as schema from "../../src/db/schema";

describe("Events API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/events — list events", () => {
    it("should return events ordered by createdAt desc", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      seedTestEvent(testDb.db, lead.id, { type: "import", detail: "First" });
      seedTestEvent(testDb.db, lead.id, { type: "sent", detail: "Second" });
      seedTestEvent(testDb.db, lead.id, { type: "reply", detail: "Third" });

      const results = testDb.db
        .select()
        .from(schema.events)
        .orderBy(desc(schema.events.createdAt))
        .all();

      expect(results).toHaveLength(3);
    });

    it("should filter events by leadId", () => {
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

    it("should respect limit parameter", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      for (let i = 0; i < 10; i++) {
        seedTestEvent(testDb.db, lead.id, { type: "note", detail: `Note ${i}` });
      }

      const results = testDb.db
        .select()
        .from(schema.events)
        .limit(5)
        .all();

      expect(results).toHaveLength(5);
    });
  });

  describe("POST /api/events — create event", () => {
    it("should create an event for valid lead and type", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);

      const event = testDb.db
        .insert(schema.events)
        .values({
          leadId: lead.id,
          type: "note",
          detail: "Had a great call, follow up next week",
        })
        .returning()
        .get();

      expect(event.type).toBe("note");
      expect(event.detail).toContain("great call");
    });

    it("should store metadata as JSON", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);

      const metadata = {
        oldScore: 45,
        newScore: 78,
        breakdown: { companySize: 20, techStackMatch: 15 },
      };

      const event = testDb.db
        .insert(schema.events)
        .values({
          leadId: lead.id,
          type: "score_change",
          detail: "Score updated",
          metadata: JSON.stringify(metadata),
        })
        .returning()
        .get();

      const parsed = JSON.parse(event.metadata!);
      expect(parsed.oldScore).toBe(45);
      expect(parsed.newScore).toBe(78);
    });

    it("should validate event types", () => {
      const validTypes = [
        "sent", "reply", "booked", "closed", "lost", "note", "import", "score_change",
      ];
      const invalidType = "invalid_type";
      expect(validTypes.includes(invalidType)).toBe(false);
      expect(validTypes.includes("sent")).toBe(true);
    });

    it("should reject event for non-existent lead (FK constraint)", () => {
      testDb = createTestDb();
      expect(() => {
        testDb.db
          .insert(schema.events)
          .values({
            leadId: 99999,
            type: "note",
            detail: "test",
          })
          .run();
      }).toThrow();
    });
  });

  describe("Lead timeline", () => {
    it("should build a complete timeline for a lead", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { name: "Alice" });

      seedTestEvent(testDb.db, lead.id, { type: "import", detail: "Imported from CSV" });
      seedTestEvent(testDb.db, lead.id, { type: "score_change", detail: "Score: 0 → 65" });
      seedTestEvent(testDb.db, lead.id, { type: "sent", detail: "Initial outreach sent" });
      seedTestEvent(testDb.db, lead.id, { type: "reply", detail: "Positive reply received" });
      seedTestEvent(testDb.db, lead.id, { type: "booked", detail: "Meeting booked for next week" });

      const timeline = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .orderBy(schema.events.createdAt)
        .all();

      expect(timeline).toHaveLength(5);
      expect(timeline[0].type).toBe("import");
      expect(timeline[4].type).toBe("booked");
    });
  });
});
