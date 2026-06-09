import scoringRulesV1 from "../../scoring_rules_v1.json";

// ---- Types ----

export interface ScoringInput {
  companySize?: string;
  techStackMatch?: string;
  painSignalStrength?: string;
  decisionMakerAccess?: string;
  engagementSignals?: string;
  segmentFit?: string;
}

export interface ScoringResult {
  totalScore: number;
  breakdown: Record<string, number>;
  rulesVersion: number;
  maxScore: number;
  tier: ScoreTier;
}

export interface ScoreTier {
  label: string;
  description: string;
}

export interface ScoringRules {
  version: number;
  maxScore: number;
  thresholds: Record<string, number>;
  scoreRanges: Array<{
    min: number;
    max: number;
    label: string;
    description: string;
  }>;
  factors: Array<{
    name: string;
    weight: number;
    description: string;
    levels: Record<string, number>;
  }>;
}

/** Raw lead enrichment attributes from DB */
export interface LeadAttributes {
  employeeCount?: number | null;
  techStack?: string | null;
  isHiringReact?: boolean | null;
  hasActiveBlog?: boolean | null;
  recentFunding?: string | null;
  activeOnLinkedIn?: boolean | null;
  title?: string | null;
  segment?: string | null;
}

// ---- Core scoring ----

export function calculateScore(
  input: ScoringInput,
  rules: ScoringRules = scoringRulesV1 as ScoringRules
): ScoringResult {
  const breakdown: Record<string, number> = {};
  let totalScore = 0;

  for (const factor of rules.factors) {
    const inputKey = factor.name as keyof ScoringInput;
    const level = input[inputKey] || "unknown";
    const levels = factor.levels as Record<string, number>;
    const score = levels[level] ?? 0;
    breakdown[factor.name] = score;
    totalScore += score;
  }

  const capped = Math.min(totalScore, rules.maxScore);

  return {
    totalScore: capped,
    breakdown,
    rulesVersion: rules.version,
    maxScore: rules.maxScore,
    tier: classifyScore(capped, rules),
  };
}

// ---- Score classification ----

export function classifyScore(
  score: number,
  rules: ScoringRules = scoringRulesV1 as ScoringRules
): ScoreTier {
  if (!rules.scoreRanges || !Array.isArray(rules.scoreRanges)) {
    return { label: "unknown", description: "No score ranges defined" };
  }
  for (const range of rules.scoreRanges) {
    if (score >= range.min && score <= range.max) {
      return { label: range.label, description: range.description };
    }
  }
  // Fallback
  return { label: "unknown", description: "Score out of range" };
}

// ---- Lead attribute → scoring input mapper ----

/**
 * Maps raw lead enrichment data to scoring factor levels.
 * This is the deterministic bridge between DB fields and the scoring rubric.
 */
export function mapLeadAttributesToScoringInput(
  attrs: LeadAttributes
): ScoringInput {
  return {
    companySize: inferCompanySize(attrs.employeeCount),
    techStackMatch: inferTechStackMatch(attrs.techStack, attrs.isHiringReact),
    painSignalStrength: inferPainSignalStrength(
      attrs.recentFunding,
      attrs.isHiringReact
    ),
    decisionMakerAccess: inferDecisionMakerAccess(attrs.title),
    engagementSignals: inferEngagementSignals(
      attrs.activeOnLinkedIn,
      attrs.hasActiveBlog
    ),
    segmentFit: inferSegmentFit(attrs.segment),
  };
}

// ---- Enrichment → factor level inference functions ----

export function inferCompanySize(
  employeeCount?: number | null
): string {
  if (employeeCount == null) return "unknown";
  if (employeeCount >= 1000) return "enterprise";
  if (employeeCount >= 200) return "midMarket";
  if (employeeCount >= 50) return "smb";
  if (employeeCount >= 1) return "startup";
  return "unknown";
}

export function inferTechStackMatch(
  techStack?: string | null,
  isHiringReact?: boolean | null
): string {
  if (!techStack) return "unknown";
  const stack = techStack.toLowerCase();
  const hasReact = stack.includes("react");
  const hasNext = stack.includes("next");
  const hasTypeScript = stack.includes("typescript") || stack.includes("ts");
  const hasNode = stack.includes("node");

  const matchCount =
    (hasReact ? 1 : 0) +
    (hasNext ? 1 : 0) +
    (hasTypeScript ? 1 : 0) +
    (hasNode ? 1 : 0) +
    (isHiringReact ? 1 : 0);

  if (matchCount >= 4) return "perfect";
  if (matchCount >= 3) return "strong";
  if (matchCount >= 2) return "partial";
  if (matchCount >= 1) return "weak";
  return "unknown";
}

export function inferPainSignalStrength(
  recentFunding?: string | null,
  isHiringReact?: boolean | null
): string {
  const signals =
    (recentFunding ? 1 : 0) + (isHiringReact ? 1 : 0);

  if (signals >= 2) return "strong";
  if (signals >= 1) return "moderate";
  return "none";
}

export function inferDecisionMakerAccess(
  title?: string | null
): string {
  if (!title) return "unknown";
  const t = title.toLowerCase();
  // Use word-boundary regex for C-level to avoid "director" matching "cto" substring
  if (
    /\bceo\b/.test(t) ||
    /\bcto\b/.test(t) ||
    /\bcfo\b/.test(t) ||
    /\bcoo\b/.test(t) ||
    t.includes("founder") ||
    /\bvp\b/.test(t) ||
    t.includes("head of")
  ) {
    return "direct";
  }
  if (t.includes("director") || t.includes("manager")) {
    return "identified";
  }
  return "unknown";
}

export function inferEngagementSignals(
  activeOnLinkedIn?: boolean | null,
  hasActiveBlog?: boolean | null
): string {
  const signals =
    (activeOnLinkedIn ? 1 : 0) + (hasActiveBlog ? 1 : 0);

  if (signals >= 2) return "active";
  if (signals >= 1) return "warm";
  return "none";
}

export function inferSegmentFit(segment?: string | null): string {
  if (!segment) return "unknown";
  const s = segment.toLowerCase();
  if (s === "startup" || s === "enterprise") return "ideal";
  if (s === "agency" || s === "midmarket") return "good";
  if (s === "smb") return "marginal";
  return "poor";
}

// ---- Score a lead end-to-end from raw attributes ----

/**
 * Score a lead from its raw DB enrichment attributes.
 * Maps attributes → factor levels → score.
 */
export function scoreLeadFromAttributes(
  attrs: LeadAttributes,
  rules?: ScoringRules
): ScoringResult {
  const input = mapLeadAttributesToScoringInput(attrs);
  return calculateScore(input, rules);
}

// ---- Rubric access ----

export function getScoringRules(version?: number): ScoringRules {
  // For now only v1, but extensible
  if (version !== undefined && version !== 1) {
    throw new Error(`Scoring rules version ${version} not found`);
  }
  return scoringRulesV1 as ScoringRules;
}

export function getFactorLevels(factorName: string): string[] {
  const factor = scoringRulesV1.factors.find((f) => f.name === factorName);
  if (!factor) return [];
  return Object.keys(factor.levels);
}

// ---- Rubric validation ----

export function validateScoringRules(rules: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!rules || typeof rules !== "object") {
    return { valid: false, errors: ["Rules must be an object"] };
  }

  const r = rules as Record<string, unknown>;

  if (typeof r.version !== "number" || r.version < 1) {
    errors.push("version must be a positive integer");
  }

  if (typeof r.maxScore !== "number" || r.maxScore <= 0) {
    errors.push("maxScore must be a positive number");
  }

  if (!r.thresholds || typeof r.thresholds !== "object") {
    errors.push("thresholds must be an object");
  }

  if (!Array.isArray(r.scoreRanges) || r.scoreRanges.length === 0) {
    errors.push("scoreRanges must be a non-empty array");
  }

  if (!Array.isArray(r.factors) || r.factors.length === 0) {
    errors.push("factors must be a non-empty array");
  } else {
    let totalWeight = 0;
    for (const f of r.factors as Array<Record<string, unknown>>) {
      if (!f.name || typeof f.name !== "string") {
        errors.push("Each factor must have a string name");
      }
      if (typeof f.weight !== "number" || f.weight <= 0) {
        errors.push(`Factor ${f.name}: weight must be a positive number`);
      } else {
        totalWeight += f.weight;
      }
      if (!f.levels || typeof f.levels !== "object") {
        errors.push(`Factor ${f.name}: must have levels object`);
      }
    }
    if (
      typeof r.maxScore === "number" &&
      totalWeight !== r.maxScore
    ) {
      errors.push(
        `Total factor weights (${totalWeight}) should equal maxScore (${r.maxScore})`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}
