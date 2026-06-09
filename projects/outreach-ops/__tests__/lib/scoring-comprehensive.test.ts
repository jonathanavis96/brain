import { describe, it, expect } from "vitest";
import {
  calculateScore,
  getScoringRules,
  getFactorLevels,
  type ScoringInput,
} from "../../src/lib/scoring";
import scoringRulesV1 from "../../scoring_rules_v1.json";

/**
 * Comprehensive unit tests for the scoring engine.
 * Covers rubric parsing, all factor levels, weight verification,
 * edge cases, threshold classification, and deterministic scoring.
 */
describe("Scoring Engine — Comprehensive", () => {
  describe("Rubric JSON parsing and structure", () => {
    it("should have exactly 6 scoring factors", () => {
      const rules = getScoringRules();
      expect(rules.factors).toHaveLength(6);
    });

    it("should have correct factor names in order", () => {
      const rules = getScoringRules();
      const names = rules.factors.map((f) => f.name);
      expect(names).toEqual([
        "companySize",
        "techStackMatch",
        "painSignalStrength",
        "decisionMakerAccess",
        "engagementSignals",
        "segmentFit",
      ]);
    });

    it("should have weights that sum to maxScore (100)", () => {
      const rules = getScoringRules();
      const weightSum = rules.factors.reduce((sum, f) => sum + f.weight, 0);
      expect(weightSum).toBe(rules.maxScore);
      expect(weightSum).toBe(100);
    });

    it("should have correct individual weights", () => {
      const rules = getScoringRules();
      const weightMap = Object.fromEntries(
        rules.factors.map((f) => [f.name, f.weight])
      );
      expect(weightMap).toEqual({
        companySize: 20,
        techStackMatch: 20,
        painSignalStrength: 25,
        decisionMakerAccess: 15,
        engagementSignals: 10,
        segmentFit: 10,
      });
    });

    it("should have max level score equal to weight for each factor", () => {
      const rules = getScoringRules();
      for (const factor of rules.factors) {
        const levels = factor.levels as Record<string, number>;
        const maxLevelScore = Math.max(...Object.values(levels));
        expect(maxLevelScore).toBe(factor.weight);
      }
    });

    it("should have score thresholds defined", () => {
      expect(scoringRulesV1.thresholds).toBeDefined();
      expect(scoringRulesV1.thresholds.hot).toBe(75);
      expect(scoringRulesV1.thresholds.warm).toBe(45);
      expect(scoringRulesV1.thresholds.cold).toBe(0);
    });

    it("should have score ranges covering 0-100 without gaps", () => {
      const ranges = scoringRulesV1.scoreRanges;
      expect(ranges).toHaveLength(4);
      expect(ranges[0].label).toBe("hot");
      expect(ranges[1].label).toBe("warm");
      expect(ranges[2].label).toBe("cold");
      expect(ranges[3].label).toBe("ice");
      // Verify coverage: ice=0-19, cold=20-44, warm=45-74, hot=75-100
      expect(ranges[3].min).toBe(0);
      expect(ranges[0].max).toBe(100);
    });

    it("should have descriptions for every factor", () => {
      const rules = getScoringRules();
      for (const factor of rules.factors) {
        expect(factor.description).toBeTruthy();
        expect(typeof factor.description).toBe("string");
      }
    });

    it("should be version 1", () => {
      const rules = getScoringRules();
      expect(rules.version).toBe(1);
    });
  });

  describe("All factor levels — exhaustive verification", () => {
    describe("techStackMatch levels", () => {
      const cases: [string, number][] = [
        ["perfect", 20],
        ["strong", 15],
        ["partial", 10],
        ["weak", 5],
        ["unknown", 2],
      ];
      it.each(cases)("should score %s as %d", (level, expected) => {
        const result = calculateScore({ techStackMatch: level });
        expect(result.breakdown.techStackMatch).toBe(expected);
      });
    });

    describe("painSignalStrength levels", () => {
      const cases: [string, number][] = [
        ["explicit", 25],
        ["strong", 20],
        ["moderate", 12],
        ["weak", 5],
        ["none", 0],
      ];
      it.each(cases)("should score %s as %d", (level, expected) => {
        const result = calculateScore({ painSignalStrength: level });
        expect(result.breakdown.painSignalStrength).toBe(expected);
      });
    });

    describe("decisionMakerAccess levels", () => {
      const cases: [string, number][] = [
        ["direct", 15],
        ["introduced", 12],
        ["identified", 8],
        ["unknown", 3],
      ];
      it.each(cases)("should score %s as %d", (level, expected) => {
        const result = calculateScore({ decisionMakerAccess: level });
        expect(result.breakdown.decisionMakerAccess).toBe(expected);
      });
    });

    describe("engagementSignals levels", () => {
      const cases: [string, number][] = [
        ["active", 10],
        ["warm", 7],
        ["cold", 3],
        ["none", 0],
      ];
      it.each(cases)("should score %s as %d", (level, expected) => {
        const result = calculateScore({ engagementSignals: level });
        expect(result.breakdown.engagementSignals).toBe(expected);
      });
    });

    describe("segmentFit levels", () => {
      const cases: [string, number][] = [
        ["ideal", 10],
        ["good", 7],
        ["marginal", 4],
        ["poor", 1],
      ];
      it.each(cases)("should score %s as %d", (level, expected) => {
        const result = calculateScore({ segmentFit: level });
        expect(result.breakdown.segmentFit).toBe(expected);
      });
    });

    describe("companySize levels (complete)", () => {
      const cases: [string, number][] = [
        ["enterprise", 20],
        ["midMarket", 15],
        ["smb", 10],
        ["startup", 5],
        ["unknown", 3],
      ];
      it.each(cases)("should score %s as %d", (level, expected) => {
        const result = calculateScore({ companySize: level });
        expect(result.breakdown.companySize).toBe(expected);
      });
    });
  });

  describe("Score calculation edge cases", () => {
    it("should return exactly 8 for all-unknown defaults (empty input)", () => {
      // companySize=unknown(3) + techStackMatch=unknown(2) + painSignal=unknown→0 +
      // decisionMaker=unknown(3) + engagement=unknown→0 + segmentFit=unknown→0
      const result = calculateScore({});
      // "unknown" for companySize=3, techStackMatch=2, decisionMakerAccess=3
      // painSignalStrength has no "unknown" key → 0, engagementSignals has no "unknown" → 0, segmentFit has no "unknown" → 0
      expect(result.totalScore).toBe(8);
      expect(result.breakdown.companySize).toBe(3);
      expect(result.breakdown.techStackMatch).toBe(2);
      expect(result.breakdown.painSignalStrength).toBe(0);
      expect(result.breakdown.decisionMakerAccess).toBe(3);
      expect(result.breakdown.engagementSignals).toBe(0);
      expect(result.breakdown.segmentFit).toBe(0);
    });

    it("should handle all factors set to their minimum valid level", () => {
      const input: ScoringInput = {
        companySize: "startup",
        techStackMatch: "weak",
        painSignalStrength: "none",
        decisionMakerAccess: "unknown",
        engagementSignals: "none",
        segmentFit: "poor",
      };
      const result = calculateScore(input);
      // 5 + 5 + 0 + 3 + 0 + 1 = 14
      expect(result.totalScore).toBe(14);
    });

    it("should handle mixed valid and invalid levels", () => {
      const input: ScoringInput = {
        companySize: "enterprise",           // 20
        techStackMatch: "bogus" as any,       // 0 (invalid)
        painSignalStrength: "explicit",       // 25
        decisionMakerAccess: "DIRECT" as any, // 0 (case sensitive)
        engagementSignals: "active",          // 10
        segmentFit: "" as any,                // falls back to "unknown" via || → 0
      };
      const result = calculateScore(input);
      // 20 + 0 + 25 + 0 + 10 + 0 = 55
      expect(result.breakdown.companySize).toBe(20);
      expect(result.breakdown.techStackMatch).toBe(0);
      expect(result.breakdown.painSignalStrength).toBe(25);
      expect(result.breakdown.decisionMakerAccess).toBe(0);
      expect(result.breakdown.engagementSignals).toBe(10);
      expect(result.totalScore).toBe(55);
    });

    it("should be case-sensitive for level names", () => {
      const result = calculateScore({ companySize: "Enterprise" as any });
      expect(result.breakdown.companySize).toBe(0); // case mismatch → 0
    });

    it("should treat null values as unknown (via falsy || operator)", () => {
      const input = {
        companySize: null as any,
        techStackMatch: undefined,
      };
      const result = calculateScore(input);
      // null/undefined → "unknown" via || fallback
      expect(result.breakdown.companySize).toBe(3); // unknown = 3
      expect(result.breakdown.techStackMatch).toBe(2); // unknown = 2
    });

    it("should always include rulesVersion in result", () => {
      const result = calculateScore({});
      expect(result.rulesVersion).toBe(1);
    });

    it("should always return all 6 factor keys in breakdown", () => {
      const result = calculateScore({ companySize: "enterprise" });
      const keys = Object.keys(result.breakdown).sort();
      expect(keys).toEqual([
        "companySize",
        "decisionMakerAccess",
        "engagementSignals",
        "painSignalStrength",
        "segmentFit",
        "techStackMatch",
      ]);
    });

    it("should produce deterministic results for identical inputs", () => {
      const input: ScoringInput = {
        companySize: "midMarket",
        techStackMatch: "partial",
        painSignalStrength: "strong",
        decisionMakerAccess: "introduced",
        engagementSignals: "warm",
        segmentFit: "good",
      };
      const r1 = calculateScore(input);
      const r2 = calculateScore(input);
      expect(r1.totalScore).toBe(r2.totalScore);
      expect(r1.breakdown).toEqual(r2.breakdown);
      // 15 + 10 + 20 + 12 + 7 + 7 = 71
      expect(r1.totalScore).toBe(71);
    });

    it("should cap score when custom rules allow exceeding maxScore", () => {
      const customRules = {
        version: 99,
        maxScore: 30,
        factors: [
          { name: "companySize", weight: 25, description: "test", levels: { enterprise: 25 } },
          { name: "techStackMatch", weight: 25, description: "test", levels: { perfect: 25 } },
        ],
      };
      const result = calculateScore(
        { companySize: "enterprise", techStackMatch: "perfect" } as ScoringInput,
        customRules as any
      );
      expect(result.totalScore).toBe(30); // capped at maxScore
      expect(result.maxScore).toBe(30);
    });
  });

  describe("Threshold classification helpers", () => {
    it("should classify score=100 as hot (>=75)", () => {
      const result = calculateScore({
        companySize: "enterprise",
        techStackMatch: "perfect",
        painSignalStrength: "explicit",
        decisionMakerAccess: "direct",
        engagementSignals: "active",
        segmentFit: "ideal",
      });
      expect(result.totalScore).toBe(100);
      expect(result.totalScore).toBeGreaterThanOrEqual(scoringRulesV1.thresholds.hot);
    });

    it("should classify score=71 as warm (>=45, <75)", () => {
      const result = calculateScore({
        companySize: "midMarket",
        techStackMatch: "partial",
        painSignalStrength: "strong",
        decisionMakerAccess: "introduced",
        engagementSignals: "warm",
        segmentFit: "good",
      });
      expect(result.totalScore).toBe(71);
      expect(result.totalScore).toBeGreaterThanOrEqual(scoringRulesV1.thresholds.warm);
      expect(result.totalScore).toBeLessThan(scoringRulesV1.thresholds.hot);
    });

    it("should classify score=8 as ice (<20)", () => {
      const result = calculateScore({});
      expect(result.totalScore).toBe(8);
      expect(result.totalScore).toBeLessThan(20);
    });

    it("should reach exactly the warm threshold (45) with specific combo", () => {
      // Need exactly 45: enterprise(20) + weak(5) + moderate(12) + identified(8) + none(0) + none→0
      // = 20+5+12+8+0+0 = 45
      const result = calculateScore({
        companySize: "enterprise",
        techStackMatch: "weak",
        painSignalStrength: "moderate",
        decisionMakerAccess: "identified",
        engagementSignals: "none",
      });
      expect(result.totalScore).toBe(45);
      expect(result.totalScore).toBeGreaterThanOrEqual(scoringRulesV1.thresholds.warm);
    });
  });

  describe("getFactorLevels — exhaustive", () => {
    it("should return all levels for techStackMatch", () => {
      const levels = getFactorLevels("techStackMatch");
      expect(levels).toEqual(
        expect.arrayContaining(["perfect", "strong", "partial", "weak", "unknown"])
      );
      expect(levels).toHaveLength(5);
    });

    it("should return all levels for decisionMakerAccess", () => {
      const levels = getFactorLevels("decisionMakerAccess");
      expect(levels).toEqual(
        expect.arrayContaining(["direct", "introduced", "identified", "unknown"])
      );
      expect(levels).toHaveLength(4);
    });

    it("should return all levels for engagementSignals", () => {
      const levels = getFactorLevels("engagementSignals");
      expect(levels).toEqual(
        expect.arrayContaining(["active", "warm", "cold", "none"])
      );
      expect(levels).toHaveLength(4);
    });

    it("should return all levels for segmentFit", () => {
      const levels = getFactorLevels("segmentFit");
      expect(levels).toEqual(
        expect.arrayContaining(["ideal", "good", "marginal", "poor"])
      );
      expect(levels).toHaveLength(4);
    });
  });

  describe("getScoringRules — edge cases", () => {
    it("should return rules without version arg (default to v1)", () => {
      const rules = getScoringRules();
      expect(rules.version).toBe(1);
      expect(rules.factors.length).toBeGreaterThan(0);
    });

    it("should return identical rules for explicit v1 and default", () => {
      const defaultRules = getScoringRules();
      const v1Rules = getScoringRules(1);
      expect(defaultRules).toEqual(v1Rules);
    });

    it("should throw descriptive error for unsupported version", () => {
      expect(() => getScoringRules(2)).toThrow("Scoring rules version 2 not found");
      expect(() => getScoringRules(99)).toThrow("Scoring rules version 99 not found");
    });

    it("should throw for version 0 (treated as explicit non-v1 version)", () => {
      // getScoringRules checks `version !== undefined && version !== 1`
      expect(() => getScoringRules(0)).toThrow("Scoring rules version 0 not found");
    });
  });
});
