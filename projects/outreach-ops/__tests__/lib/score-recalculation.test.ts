/**
 * Integration tests for auto-recalculation of lead scores.
 *
 * Verifies that the scoring engine is correctly hooked into:
 * 1. Lead creation (insertScoredLead)
 * 2. Lead update (recalculateLeadScore)
 * 3. Event logging on score changes
 * 4. Persistence of scoreBreakdown and scoreRulesVersion
 */
import { describe, it, expect, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, seedTestLead } from "../test-helpers";
import * as schema from "../../src/db/schema";
import {
  insertScoredLead,
  recalculateLeadScore,
  computeLeadScore,
  SCORING_FIELDS,
} from "../../src/lib/score-lead";
import { calculateScore } from "../../src/lib/scoring";

describe("Score Auto-Recalculation Integration", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("insertScoredLead — auto-score on creation", () => {
    it("should compute and persist score on lead creation", () => {
      testDb = createTestDb();
      const { lead, scoreResult } = insertScoredLead(testDb.db, {
        name: "Alice",
        company: "TechCorp",
        companySize: "enterprise",
        techStackMatch: "perfect",
        painSignalStrength: "explicit",
        decisionMakerAccess: "direct",
        engagementSignals: "active",
        segmentFit: "ideal",
      });

      expect(lead.score).toBe(100);
      expect(scoreResult.totalScore).toBe(100);
      expect(scoreResult.rulesVersion).toBe(1);

      // Verify breakdown is persisted on lead record
      expect(lead.scoreBreakdown).toBeDefined();
      const breakdown = JSON.parse(lead.scoreBreakdown!);
      expect(breakdown.companySize).toBe(20);
      expect(breakdown.techStackMatch).toBe(20);
      expect(breakdown.painSignalStrength).toBe(25);

      // Verify rules version is persisted
      expect(lead.scoreRulesVersion).toBe(1);
    });

    it("should compute score with partial scoring fields", () => {
      testDb = createTestDb();
      const { lead } = insertScoredLead(testDb.db, {
        name: "Bob",
        company: "StartupInc",
        companySize: "startup",
        techStackMatch: "weak",
      });

      // startup=5, weak=5, unknowns for rest
      expect(lead.score).toBeGreaterThan(0);
      expect(lead.score).toBeLessThan(50);
      expect(lead.scoreBreakdown).toBeDefined();
    });

    it("should compute score with no scoring fields (all unknowns)", () => {
      testDb = createTestDb();
      const { lead } = insertScoredLead(testDb.db, {
        name: "Charlie",
        company: "NoInfo LLC",
      });

      // All unknown defaults: companySize(3) + techStackMatch(2) + painSignalStrength(0*) + decisionMakerAccess(3) + engagementSignals(0*) + segmentFit(0*)
      // *no "unknown" key for these factors, so they get 0
      expect(lead.score).toBeGreaterThanOrEqual(0);
      expect(lead.scoreRulesVersion).toBe(1);
    });

    it("should log import event with score audit trail", () => {
      testDb = createTestDb();
      const { lead } = insertScoredLead(testDb.db, {
        name: "Diana",
        company: "AuditCorp",
        companySize: "midMarket",
      });

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("import");

      const metadata = JSON.parse(events[0].metadata!);
      expect(metadata.score).toBeDefined();
      expect(metadata.breakdown).toBeDefined();
      expect(metadata.rulesVersion).toBe(1);
    });
  });

  describe("recalculateLeadScore — auto-recalculate on update", () => {
    it("should recalculate score when scoring field changes", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        score: 5,
        companySize: "startup",
      });

      const result = recalculateLeadScore(testDb.db, lead.id, {
        companySize: "enterprise",
      });

      expect(result.changed).toBe(true);
      expect(result.scoreResult).toBeDefined();
      expect(result.scoreResult!.totalScore).toBeGreaterThan(5);

      // Verify persisted in DB
      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(updated!.score).toBe(result.scoreResult!.totalScore);
      expect(updated!.scoreBreakdown).toBeDefined();
      expect(updated!.scoreRulesVersion).toBe(1);

      const breakdown = JSON.parse(updated!.scoreBreakdown!);
      expect(breakdown.companySize).toBe(20); // enterprise = 20
    });

    it("should not recalculate when non-scoring fields change", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        score: 42,
        companySize: "smb",
      });

      const result = recalculateLeadScore(testDb.db, lead.id, {
        name: "Updated Name",
        email: "new@email.com",
      });

      expect(result.changed).toBe(false);
      expect(result.scoreResult).toBeNull();

      // Score should be unchanged
      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(updated!.score).toBe(42);
    });

    it("should log score_change event when score changes", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        score: 10,
        companySize: "startup",
      });

      recalculateLeadScore(testDb.db, lead.id, {
        companySize: "enterprise",
        techStackMatch: "perfect",
        painSignalStrength: "explicit",
      });

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      const scoreEvent = events.find((e) => e.type === "score_change");
      expect(scoreEvent).toBeDefined();
      expect(scoreEvent!.detail).toContain("Score changed from");

      const metadata = JSON.parse(scoreEvent!.metadata!);
      expect(metadata.previousScore).toBe(10);
      expect(metadata.newScore).toBeGreaterThan(10);
      expect(metadata.breakdown).toBeDefined();
      expect(metadata.rulesVersion).toBe(1);
    });

    it("should NOT log score_change event when score stays the same", () => {
      testDb = createTestDb();

      // Create lead with known score
      const scoreResult = calculateScore({ companySize: "enterprise" });
      const lead = seedTestLead(testDb.db, {
        score: scoreResult.totalScore,
        companySize: "enterprise",
      });

      // "Update" with same value
      recalculateLeadScore(testDb.db, lead.id, {
        companySize: "enterprise",
      });

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      const scoreEvents = events.filter((e) => e.type === "score_change");
      expect(scoreEvents).toHaveLength(0);
    });

    it("should merge existing fields with updates for complete scoring", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        companySize: "enterprise",
        techStackMatch: "strong",
        painSignalStrength: "moderate",
        decisionMakerAccess: "direct",
        engagementSignals: "warm",
        segmentFit: "good",
        score: 0,
      });

      // Only update one field — the rest should be preserved from existing
      const result = recalculateLeadScore(testDb.db, lead.id, {
        painSignalStrength: "explicit",
      });

      expect(result.changed).toBe(true);
      const breakdown = result.scoreResult!.breakdown;

      // Enterprise stays from existing
      expect(breakdown.companySize).toBe(20);
      // Strong stays from existing
      expect(breakdown.techStackMatch).toBe(15);
      // Updated to explicit
      expect(breakdown.painSignalStrength).toBe(25);
      // Direct stays from existing
      expect(breakdown.decisionMakerAccess).toBe(15);
      // Warm stays from existing
      expect(breakdown.engagementSignals).toBe(7);
      // Good stays from existing
      expect(breakdown.segmentFit).toBe(7);
    });

    it("should throw for non-existent lead", () => {
      testDb = createTestDb();

      expect(() =>
        recalculateLeadScore(testDb.db, 99999, { companySize: "enterprise" })
      ).toThrow("Lead 99999 not found");
    });

    it("should handle multiple sequential updates correctly", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        score: 0,
        companySize: "startup",
      });

      // First update
      const r1 = recalculateLeadScore(testDb.db, lead.id, {
        companySize: "smb",
      });
      expect(r1.changed).toBe(true);

      // Second update
      const r2 = recalculateLeadScore(testDb.db, lead.id, {
        companySize: "enterprise",
      });
      expect(r2.changed).toBe(true);
      expect(r2.scoreResult!.totalScore).toBeGreaterThan(r1.scoreResult!.totalScore);

      // Should have 2 score_change events
      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      const scoreEvents = events.filter((e) => e.type === "score_change");
      expect(scoreEvents).toHaveLength(2);
    });
  });

  describe("computeLeadScore — pure computation", () => {
    it("should return max score for ideal inputs", () => {
      const result = computeLeadScore({
        companySize: "enterprise",
        techStackMatch: "perfect",
        painSignalStrength: "explicit",
        decisionMakerAccess: "direct",
        engagementSignals: "active",
        segmentFit: "ideal",
      });

      expect(result.totalScore).toBe(100);
      expect(result.rulesVersion).toBe(1);
    });

    it("should return consistent results for same inputs", () => {
      const input = {
        companySize: "midMarket",
        techStackMatch: "strong",
        painSignalStrength: "moderate",
      };

      const r1 = computeLeadScore(input);
      const r2 = computeLeadScore(input);

      expect(r1.totalScore).toBe(r2.totalScore);
      expect(JSON.stringify(r1.breakdown)).toBe(JSON.stringify(r2.breakdown));
    });
  });

  describe("SCORING_FIELDS constant", () => {
    it("should contain all 6 scoring factors", () => {
      expect(SCORING_FIELDS).toHaveLength(6);
      expect(SCORING_FIELDS).toContain("companySize");
      expect(SCORING_FIELDS).toContain("techStackMatch");
      expect(SCORING_FIELDS).toContain("painSignalStrength");
      expect(SCORING_FIELDS).toContain("decisionMakerAccess");
      expect(SCORING_FIELDS).toContain("engagementSignals");
      expect(SCORING_FIELDS).toContain("segmentFit");
    });
  });
});
