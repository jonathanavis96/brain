import { describe, it, expect, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, seedTestLead } from "../test-helpers";
import * as schema from "../../src/db/schema";
import {
  insertScoredLead,
  recalculateLeadScore,
  computeLeadScore,
  extractScoringInput,
  SCORING_FIELDS,
} from "../../src/lib/score-lead";

describe("score-lead shared utility", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("computeLeadScore (pure)", () => {
    it("computes max score for perfect factors", () => {
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
      expect(result.maxScore).toBe(100);
    });

    it("computes low score when no factors provided", () => {
      const result = computeLeadScore({});
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThan(30);
    });

    it("includes breakdown for each factor", () => {
      const result = computeLeadScore({
        companySize: "enterprise",
        techStackMatch: "strong",
      });
      expect(result.breakdown).toHaveProperty("companySize", 20);
      expect(result.breakdown).toHaveProperty("techStackMatch", 15);
    });
  });

  describe("extractScoringInput", () => {
    it("extracts only scoring fields", () => {
      const input = extractScoringInput({
        name: "Alice",
        company: "Corp",
        companySize: "enterprise",
        techStackMatch: "perfect",
        irrelevantField: "ignored",
      });
      expect(input.companySize).toBe("enterprise");
      expect(input.techStackMatch).toBe("perfect");
      expect((input as Record<string, unknown>)["name"]).toBeUndefined();
    });

    it("returns undefined for missing fields", () => {
      const input = extractScoringInput({});
      expect(input.companySize).toBeUndefined();
      expect(input.painSignalStrength).toBeUndefined();
    });
  });

  describe("insertScoredLead", () => {
    it("auto-computes score and persists it on the lead", () => {
      testDb = createTestDb();
      const { lead, scoreResult } = insertScoredLead(testDb.db, {
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
      expect(scoreResult.totalScore).toBe(100);
      expect(scoreResult.rulesVersion).toBe(1);

      // Verify persisted in DB
      const fromDb = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();
      expect(fromDb!.score).toBe(100);
    });

    it("persists scoreBreakdown and scoreRulesVersion on the lead row", () => {
      testDb = createTestDb();
      const { lead } = insertScoredLead(testDb.db, {
        name: "Bob",
        company: "BobCorp",
        companySize: "midMarket",
        techStackMatch: "strong",
      });

      expect(lead.scoreBreakdown).toBeDefined();
      const breakdown = JSON.parse(lead.scoreBreakdown!);
      expect(breakdown.companySize).toBe(15);
      expect(breakdown.techStackMatch).toBe(15);
      expect(lead.scoreRulesVersion).toBe(1);
    });

    it("creates an import event with full score metadata", () => {
      testDb = createTestDb();
      const { lead, scoreResult } = insertScoredLead(testDb.db, {
        name: "Charlie",
        company: "CharlieCorp",
        companySize: "smb",
      });

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("import");
      expect(events[0].detail).toContain("Charlie");
      expect(events[0].detail).toContain("CharlieCorp");

      const meta = JSON.parse(events[0].metadata!);
      expect(meta.score).toBe(scoreResult.totalScore);
      expect(meta.breakdown).toBeDefined();
      expect(meta.rulesVersion).toBe(1);
      expect(meta.maxScore).toBe(100);
    });

    it("uses custom event detail when provided", () => {
      testDb = createTestDb();
      const { lead } = insertScoredLead(
        testDb.db,
        { name: "Dave", company: "DaveCorp" },
        "Imported from CSV batch #42"
      );

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      expect(events[0].detail).toBe("Imported from CSV batch #42");
    });

    it("defaults status to new and channel to linkedin", () => {
      testDb = createTestDb();
      const { lead } = insertScoredLead(testDb.db, {
        name: "Eve",
        company: "EveCorp",
      });

      expect(lead.status).toBe("new");
      expect(lead.channel).toBe("linkedin");
    });

    it("scores with partial factors — missing factors get default/unknown scores", () => {
      testDb = createTestDb();
      const { lead } = insertScoredLead(testDb.db, {
        name: "Frank",
        company: "FrankCorp",
        companySize: "enterprise",
        // only one factor provided
      });

      // enterprise = 20 + unknown defaults for other factors
      expect(lead.score).toBeGreaterThan(0);
      expect(lead.score).toBeLessThan(50);
    });

    it("persists enrichment fields alongside score", () => {
      testDb = createTestDb();
      const { lead } = insertScoredLead(testDb.db, {
        name: "Grace",
        company: "GraceCorp",
        employeeCount: 500,
        techStack: "React, Node.js",
        isHiringReact: true,
        hasActiveBlog: true,
        recentFunding: "Series B",
        activeOnLinkedIn: true,
      });

      expect(lead.employeeCount).toBe(500);
      expect(lead.techStack).toBe("React, Node.js");
      expect(lead.isHiringReact).toBe(true);
      expect(lead.hasActiveBlog).toBe(true);
      expect(lead.recentFunding).toBe("Series B");
      expect(lead.activeOnLinkedIn).toBe(true);
    });
  });

  describe("recalculateLeadScore", () => {
    it("recalculates and updates score when scoring fields change", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        score: 10,
        companySize: "startup",
        techStackMatch: "weak",
      });

      const { lead: updated, scoreResult, changed } = recalculateLeadScore(
        testDb.db,
        lead.id,
        { companySize: "enterprise", techStackMatch: "perfect" }
      );

      expect(changed).toBe(true);
      expect(scoreResult).not.toBeNull();
      expect(updated!.score).toBeGreaterThan(lead.score!);
    });

    it("does NOT recalculate when no scoring fields change", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        score: 50,
        companySize: "enterprise",
      });

      const { scoreResult, changed } = recalculateLeadScore(
        testDb.db,
        lead.id,
        { name: "Updated Name" } // non-scoring field
      );

      expect(changed).toBe(false);
      expect(scoreResult).toBeNull();
    });

    it("logs score_change event when score changes", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        score: 5,
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

      const meta = JSON.parse(scoreEvent!.metadata!);
      expect(meta.previousScore).toBe(5);
      expect(meta.newScore).toBeGreaterThan(5);
      expect(meta.breakdown).toBeDefined();
      expect(meta.rulesVersion).toBe(1);
    });

    it("does NOT log event when score stays the same", () => {
      testDb = createTestDb();
      // Create lead with enterprise company size
      const lead = seedTestLead(testDb.db, {
        companySize: "enterprise",
      });

      // "Recalculate" with same value — score shouldn't change
      const { changed } = recalculateLeadScore(testDb.db, lead.id, {
        companySize: "enterprise",
      });

      // Since the value is the same, scoringFieldChanged should be false
      expect(changed).toBe(false);

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();
      const scoreEvents = events.filter((e) => e.type === "score_change");
      expect(scoreEvents).toHaveLength(0);
    });

    it("throws for non-existent lead", () => {
      testDb = createTestDb();
      expect(() =>
        recalculateLeadScore(testDb.db, 99999, { companySize: "enterprise" })
      ).toThrow("Lead 99999 not found");
    });

    it("updates scoreBreakdown and scoreRulesVersion on recalculation", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, {
        score: 0,
        companySize: "startup",
      });

      recalculateLeadScore(testDb.db, lead.id, {
        companySize: "enterprise",
        segmentFit: "ideal",
      });

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();

      expect(updated!.scoreBreakdown).toBeDefined();
      const breakdown = JSON.parse(updated!.scoreBreakdown!);
      expect(breakdown.companySize).toBe(20);
      expect(breakdown.segmentFit).toBe(10);
      expect(updated!.scoreRulesVersion).toBe(1);
    });
  });

  describe("SCORING_FIELDS constant", () => {
    it("contains all 6 scoring factors", () => {
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
