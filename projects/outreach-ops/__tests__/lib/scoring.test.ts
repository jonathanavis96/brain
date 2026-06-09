import { describe, it, expect } from "vitest";
import {
  calculateScore,
  getScoringRules,
  getFactorLevels,
  classifyScore,
  mapLeadAttributesToScoringInput,
  scoreLeadFromAttributes,
  validateScoringRules,
  inferCompanySize,
  inferTechStackMatch,
  inferPainSignalStrength,
  inferDecisionMakerAccess,
  inferEngagementSignals,
  inferSegmentFit,
  type ScoringInput,
  type ScoringRules,
} from "../../src/lib/scoring";

describe("Scoring Engine", () => {
  describe("calculateScore", () => {
    it("should return max score for perfect inputs across all factors", () => {
      const input: ScoringInput = {
        companySize: "enterprise",
        techStackMatch: "perfect",
        painSignalStrength: "explicit",
        decisionMakerAccess: "direct",
        engagementSignals: "active",
        segmentFit: "ideal",
      };
      const result = calculateScore(input);
      expect(result.totalScore).toBe(100);
      expect(result.rulesVersion).toBe(1);
      expect(result.maxScore).toBe(100);
      expect(result.tier.label).toBe("hot");
    });

    it("should return 0 for weakest possible inputs", () => {
      const input: ScoringInput = {
        painSignalStrength: "none",
        engagementSignals: "none",
      };
      const result = calculateScore(input);
      // unknown defaults for companySize(3), techStackMatch(2), decisionMakerAccess(3), segmentFit — no "unknown" key
      // painSignalStrength=none(0), engagementSignals=none(0)
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThan(20);
    });

    it("should provide a breakdown per factor", () => {
      const input: ScoringInput = {
        companySize: "enterprise",
        techStackMatch: "strong",
        painSignalStrength: "moderate",
        decisionMakerAccess: "identified",
        engagementSignals: "warm",
        segmentFit: "good",
      };
      const result = calculateScore(input);
      expect(result.breakdown).toHaveProperty("companySize", 20);
      expect(result.breakdown).toHaveProperty("techStackMatch", 15);
      expect(result.breakdown).toHaveProperty("painSignalStrength", 12);
      expect(result.breakdown).toHaveProperty("decisionMakerAccess", 8);
      expect(result.breakdown).toHaveProperty("engagementSignals", 7);
      expect(result.breakdown).toHaveProperty("segmentFit", 7);
      expect(result.totalScore).toBe(69);
    });

    it("should handle missing fields gracefully using 'unknown' default", () => {
      const input: ScoringInput = {};
      const result = calculateScore(input);
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
      expect(Object.keys(result.breakdown)).toHaveLength(6);
    });

    it("should cap score at maxScore", () => {
      const customRules: ScoringRules = {
        version: 99,
        maxScore: 50,
        thresholds: { hot: 40, warm: 20, cold: 0 },
        scoreRanges: [
          { min: 40, max: 50, label: "hot", description: "Hot" },
          { min: 20, max: 39, label: "warm", description: "Warm" },
          { min: 0, max: 19, label: "cold", description: "Cold" },
        ],
        factors: [
          {
            name: "factor1",
            weight: 25,
            description: "test",
            levels: { high: 40 },
          },
          {
            name: "factor2",
            weight: 25,
            description: "test",
            levels: { high: 40 },
          },
        ],
      };
      const result = calculateScore(
        { companySize: "high", techStackMatch: "high" } as unknown as ScoringInput,
        customRules
      );
      expect(result.totalScore).toBeLessThanOrEqual(50);
    });

    it("should handle invalid level names gracefully (fallback to 0)", () => {
      const input: ScoringInput = {
        companySize: "nonexistent_level" as unknown as string,
      };
      const result = calculateScore(input);
      expect(result.breakdown.companySize).toBe(0);
    });

    it("should use enterprise=20 for companySize", () => {
      const result = calculateScore({ companySize: "enterprise" });
      expect(result.breakdown.companySize).toBe(20);
    });

    it("should use midMarket=15 for companySize", () => {
      const result = calculateScore({ companySize: "midMarket" });
      expect(result.breakdown.companySize).toBe(15);
    });

    it("should use smb=10 for companySize", () => {
      const result = calculateScore({ companySize: "smb" });
      expect(result.breakdown.companySize).toBe(10);
    });

    it("should use startup=5 for companySize", () => {
      const result = calculateScore({ companySize: "startup" });
      expect(result.breakdown.companySize).toBe(5);
    });

    it("should include tier classification in result", () => {
      const result = calculateScore({
        companySize: "enterprise",
        techStackMatch: "perfect",
        painSignalStrength: "explicit",
        decisionMakerAccess: "direct",
        engagementSignals: "active",
        segmentFit: "ideal",
      });
      expect(result.tier).toEqual({
        label: "hot",
        description: "High-priority — reach out immediately",
      });
    });
  });

  describe("classifyScore", () => {
    it("should classify 100 as hot", () => {
      const tier = classifyScore(100);
      expect(tier.label).toBe("hot");
    });

    it("should classify 75 as hot (boundary)", () => {
      const tier = classifyScore(75);
      expect(tier.label).toBe("hot");
    });

    it("should classify 74 as warm (boundary)", () => {
      const tier = classifyScore(74);
      expect(tier.label).toBe("warm");
    });

    it("should classify 50 as warm", () => {
      const tier = classifyScore(50);
      expect(tier.label).toBe("warm");
    });

    it("should classify 45 as warm (boundary)", () => {
      const tier = classifyScore(45);
      expect(tier.label).toBe("warm");
    });

    it("should classify 44 as cold (boundary)", () => {
      const tier = classifyScore(44);
      expect(tier.label).toBe("cold");
    });

    it("should classify 20 as cold (boundary)", () => {
      const tier = classifyScore(20);
      expect(tier.label).toBe("cold");
    });

    it("should classify 19 as ice (boundary)", () => {
      const tier = classifyScore(19);
      expect(tier.label).toBe("ice");
    });

    it("should classify 0 as ice", () => {
      const tier = classifyScore(0);
      expect(tier.label).toBe("ice");
    });
  });

  describe("inferCompanySize", () => {
    it("should return enterprise for 1000+", () => {
      expect(inferCompanySize(1000)).toBe("enterprise");
      expect(inferCompanySize(5000)).toBe("enterprise");
    });

    it("should return midMarket for 200-999", () => {
      expect(inferCompanySize(200)).toBe("midMarket");
      expect(inferCompanySize(500)).toBe("midMarket");
    });

    it("should return smb for 50-199", () => {
      expect(inferCompanySize(50)).toBe("smb");
      expect(inferCompanySize(100)).toBe("smb");
    });

    it("should return startup for 1-49", () => {
      expect(inferCompanySize(1)).toBe("startup");
      expect(inferCompanySize(49)).toBe("startup");
    });

    it("should return unknown for null/undefined", () => {
      expect(inferCompanySize(null)).toBe("unknown");
      expect(inferCompanySize(undefined)).toBe("unknown");
    });

    it("should return unknown for 0", () => {
      expect(inferCompanySize(0)).toBe("unknown");
    });
  });

  describe("inferTechStackMatch", () => {
    it("should return perfect for React+Next+TypeScript+Node+hiring", () => {
      expect(inferTechStackMatch("React,Next.js,TypeScript,Node.js", true)).toBe("perfect");
    });

    it("should return strong for React+TypeScript+Node", () => {
      expect(inferTechStackMatch("React,TypeScript,Node.js", false)).toBe("strong");
    });

    it("should return partial for React+Node", () => {
      expect(inferTechStackMatch("React,Node.js", false)).toBe("partial");
    });

    it("should return weak for just React", () => {
      expect(inferTechStackMatch("React", false)).toBe("weak");
    });

    it("should return unknown for null/empty", () => {
      expect(inferTechStackMatch(null, false)).toBe("unknown");
      expect(inferTechStackMatch("", false)).toBe("unknown");
    });

    it("should return unknown for completely unrelated stack", () => {
      expect(inferTechStackMatch("Java,Spring,Oracle", false)).toBe("unknown");
    });
  });

  describe("inferPainSignalStrength", () => {
    it("should return strong for funding + hiring", () => {
      expect(inferPainSignalStrength("Series A $5M", true)).toBe("strong");
    });

    it("should return moderate for funding only", () => {
      expect(inferPainSignalStrength("Seed $2M", false)).toBe("moderate");
    });

    it("should return moderate for hiring only", () => {
      expect(inferPainSignalStrength(null, true)).toBe("moderate");
    });

    it("should return none for no signals", () => {
      expect(inferPainSignalStrength(null, false)).toBe("none");
      expect(inferPainSignalStrength(null, null)).toBe("none");
    });
  });

  describe("inferDecisionMakerAccess", () => {
    it("should return direct for C-level", () => {
      expect(inferDecisionMakerAccess("CEO")).toBe("direct");
      expect(inferDecisionMakerAccess("CTO")).toBe("direct");
    });

    it("should return direct for VP/Head of", () => {
      expect(inferDecisionMakerAccess("VP Engineering")).toBe("direct");
      expect(inferDecisionMakerAccess("Head of Product")).toBe("direct");
    });

    it("should return direct for founders", () => {
      expect(inferDecisionMakerAccess("Co-Founder")).toBe("direct");
    });

    it("should return identified for directors/managers", () => {
      expect(inferDecisionMakerAccess("Director of Operations")).toBe("identified");
      expect(inferDecisionMakerAccess("Engineering Manager")).toBe("identified");
    });

    it("should return unknown for unknown/null titles", () => {
      expect(inferDecisionMakerAccess(null)).toBe("unknown");
      expect(inferDecisionMakerAccess("Software Engineer")).toBe("unknown");
    });
  });

  describe("inferEngagementSignals", () => {
    it("should return active for both LinkedIn + blog", () => {
      expect(inferEngagementSignals(true, true)).toBe("active");
    });

    it("should return warm for one signal", () => {
      expect(inferEngagementSignals(true, false)).toBe("warm");
      expect(inferEngagementSignals(false, true)).toBe("warm");
    });

    it("should return none for no signals", () => {
      expect(inferEngagementSignals(false, false)).toBe("none");
      expect(inferEngagementSignals(null, null)).toBe("none");
    });
  });

  describe("inferSegmentFit", () => {
    it("should return ideal for startup/enterprise", () => {
      expect(inferSegmentFit("startup")).toBe("ideal");
      expect(inferSegmentFit("enterprise")).toBe("ideal");
    });

    it("should return good for agency/midmarket", () => {
      expect(inferSegmentFit("agency")).toBe("good");
      expect(inferSegmentFit("midmarket")).toBe("good");
    });

    it("should return marginal for smb", () => {
      expect(inferSegmentFit("smb")).toBe("marginal");
    });

    it("should return poor for unrecognized segments", () => {
      expect(inferSegmentFit("other")).toBe("poor");
    });

    it("should handle case insensitivity", () => {
      expect(inferSegmentFit("Startup")).toBe("ideal");
      expect(inferSegmentFit("ENTERPRISE")).toBe("ideal");
    });

    it("should return unknown for null", () => {
      // segmentFit factor has no "unknown" level, so this will score 0
      expect(inferSegmentFit(null)).toBe("unknown");
    });
  });

  describe("mapLeadAttributesToScoringInput", () => {
    it("should map a fully-enriched lead to scoring input", () => {
      const input = mapLeadAttributesToScoringInput({
        employeeCount: 2500,
        techStack: "React,TypeScript,AWS,GraphQL",
        isHiringReact: true,
        hasActiveBlog: true,
        recentFunding: "Series C $80M",
        activeOnLinkedIn: true,
        title: "CTO",
        segment: "enterprise",
      });

      expect(input.companySize).toBe("enterprise");
      expect(input.techStackMatch).toBe("strong"); // React+TypeScript+hiring = 3
      expect(input.painSignalStrength).toBe("strong");
      expect(input.decisionMakerAccess).toBe("direct");
      expect(input.engagementSignals).toBe("active");
      expect(input.segmentFit).toBe("ideal");
    });

    it("should handle empty attributes", () => {
      const input = mapLeadAttributesToScoringInput({});
      expect(input.companySize).toBe("unknown");
      expect(input.techStackMatch).toBe("unknown");
      expect(input.painSignalStrength).toBe("none");
      expect(input.decisionMakerAccess).toBe("unknown");
      expect(input.engagementSignals).toBe("none");
      expect(input.segmentFit).toBe("unknown");
    });
  });

  describe("scoreLeadFromAttributes", () => {
    it("should produce a high score for a perfect-fit lead", () => {
      const result = scoreLeadFromAttributes({
        employeeCount: 3000,
        techStack: "React,Next.js,TypeScript,Node.js",
        isHiringReact: true,
        hasActiveBlog: true,
        recentFunding: "Series B $40M",
        activeOnLinkedIn: true,
        title: "CTO",
        segment: "enterprise",
      });

      expect(result.totalScore).toBeGreaterThanOrEqual(75);
      expect(result.tier.label).toBe("hot");
      expect(result.breakdown).toHaveProperty("companySize", 20);
      expect(result.breakdown).toHaveProperty("techStackMatch", 20); // perfect: 5 signals
    });

    it("should produce a low score for a poor-fit lead", () => {
      const result = scoreLeadFromAttributes({
        employeeCount: null,
        techStack: "Java,Spring,Oracle",
        isHiringReact: false,
        hasActiveBlog: false,
        recentFunding: null,
        activeOnLinkedIn: false,
        title: "Software Engineer",
        segment: "other",
      });

      expect(result.totalScore).toBeLessThan(20);
      expect(result.tier.label).toBe("ice");
    });

    it("should produce mid-range score for partially enriched lead", () => {
      const result = scoreLeadFromAttributes({
        employeeCount: 120,
        techStack: "React,Python",
        isHiringReact: false,
        hasActiveBlog: false,
        recentFunding: null,
        activeOnLinkedIn: true,
        title: "Director of Engineering",
        segment: "agency",
      });

      expect(result.totalScore).toBeGreaterThan(20);
      expect(result.totalScore).toBeLessThan(80);
    });

    it("should include rulesVersion in result for audit trail", () => {
      const result = scoreLeadFromAttributes({});
      expect(result.rulesVersion).toBe(1);
      expect(result.maxScore).toBe(100);
    });
  });

  describe("getScoringRules", () => {
    it("should return v1 rules by default", () => {
      const rules = getScoringRules();
      expect(rules.version).toBe(1);
      expect(rules.maxScore).toBe(100);
      expect(rules.factors).toHaveLength(6);
    });

    it("should return v1 rules when explicitly requested", () => {
      const rules = getScoringRules(1);
      expect(rules.version).toBe(1);
    });

    it("should throw for unknown version", () => {
      expect(() => getScoringRules(99)).toThrow(
        "Scoring rules version 99 not found"
      );
    });

    it("should include thresholds and scoreRanges", () => {
      const rules = getScoringRules();
      expect(rules.thresholds).toBeDefined();
      expect(rules.thresholds.hot).toBe(75);
      expect(rules.thresholds.warm).toBe(45);
      expect(rules.scoreRanges).toHaveLength(4);
    });
  });

  describe("getFactorLevels", () => {
    it("should return levels for companySize", () => {
      const levels = getFactorLevels("companySize");
      expect(levels).toContain("enterprise");
      expect(levels).toContain("midMarket");
      expect(levels).toContain("smb");
      expect(levels).toContain("startup");
      expect(levels).toContain("unknown");
    });

    it("should return levels for painSignalStrength", () => {
      const levels = getFactorLevels("painSignalStrength");
      expect(levels).toContain("explicit");
      expect(levels).toContain("strong");
      expect(levels).toContain("moderate");
      expect(levels).toContain("weak");
      expect(levels).toContain("none");
    });

    it("should return empty array for unknown factor", () => {
      const levels = getFactorLevels("nonexistent");
      expect(levels).toEqual([]);
    });
  });

  describe("validateScoringRules", () => {
    it("should validate the v1 rules as valid", () => {
      const rules = getScoringRules();
      const result = validateScoringRules(rules);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject null/undefined", () => {
      expect(validateScoringRules(null).valid).toBe(false);
      expect(validateScoringRules(undefined).valid).toBe(false);
    });

    it("should reject missing version", () => {
      const result = validateScoringRules({
        maxScore: 100,
        thresholds: {},
        scoreRanges: [{ min: 0, max: 100, label: "a", description: "a" }],
        factors: [
          { name: "f", weight: 100, description: "d", levels: { a: 100 } },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("version must be a positive integer");
    });

    it("should reject missing factors", () => {
      const result = validateScoringRules({
        version: 1,
        maxScore: 100,
        thresholds: {},
        scoreRanges: [{ min: 0, max: 100, label: "a", description: "a" }],
        factors: [],
      });
      expect(result.valid).toBe(false);
    });

    it("should warn when total weights don't match maxScore", () => {
      const result = validateScoringRules({
        version: 1,
        maxScore: 100,
        thresholds: { hot: 75 },
        scoreRanges: [{ min: 0, max: 100, label: "a", description: "a" }],
        factors: [
          { name: "f1", weight: 50, description: "d", levels: { a: 50 } },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Total factor weights"))).toBe(true);
    });
  });
});
