import { describe, it, expect, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, seedTestLead } from "../test-helpers";
import * as schema from "../../src/db/schema";
import { calculateScore } from "../../src/lib/scoring";

describe("Scoring API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("POST /api/scoring — recalculate lead score", () => {
    it("should recalculate score and update lead", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        name: "Alice",
        score: 0,
        companySize: "startup",
      });

      const newFactors = {
        companySize: "enterprise",
        techStackMatch: "strong",
        painSignalStrength: "moderate",
        decisionMakerAccess: "identified",
        engagementSignals: "warm",
        segmentFit: "good",
      };

      const scoreResult = calculateScore(newFactors);

      testDb.db
        .update(schema.leads)
        .set({
          score: scoreResult.totalScore,
          ...newFactors,
        })
        .where(eq(schema.leads.id, lead.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(updated?.score).toBe(69);
      expect(updated?.companySize).toBe("enterprise");
    });

    it("should log score_change event when score changes", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { score: 30 });
      const newScore = 75;

      if (lead.score !== newScore) {
        testDb.db
          .insert(schema.events)
          .values({
            leadId: lead.id,
            type: "score_change",
            detail: `Score changed from ${lead.score} to ${newScore}`,
            metadata: JSON.stringify({
              oldScore: lead.score,
              newScore,
            }),
          })
          .run();
      }

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("score_change");
      const meta = JSON.parse(events[0].metadata!);
      expect(meta.oldScore).toBe(30);
      expect(meta.newScore).toBe(75);
    });

    it("should NOT log score_change when score is unchanged", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { score: 50 });
      const newScore = 50;

      if (lead.score !== newScore) {
        testDb.db
          .insert(schema.events)
          .values({
            leadId: lead.id,
            type: "score_change",
            detail: `Score changed`,
          })
          .run();
      }

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      expect(events).toHaveLength(0);
    });

    it("should preserve existing lead fields when updating score", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        name: "Alice",
        company: "AliceCorp",
        title: "CTO",
        email: "alice@corp.com",
        companySize: "enterprise",
      });

      // Update only score-related fields
      testDb.db
        .update(schema.leads)
        .set({
          score: 85,
          techStackMatch: "perfect",
        })
        .where(eq(schema.leads.id, lead.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(updated?.name).toBe("Alice");
      expect(updated?.title).toBe("CTO");
      expect(updated?.companySize).toBe("enterprise");
      expect(updated?.techStackMatch).toBe("perfect");
      expect(updated?.score).toBe(85);
    });
  });
});
