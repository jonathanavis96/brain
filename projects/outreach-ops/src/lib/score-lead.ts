/**
 * Shared utility for scoring leads and persisting results.
 *
 * Encapsulates the score-compute → insert/update → event-log pattern
 * used by lead create, import, and update flows. Ensures every lead
 * score is traced to its exact scoring rules version and factor breakdown.
 */
import { leads, events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { calculateScore, type ScoringInput, type ScoringResult } from "./scoring";
import type { ProjectDb } from "@/db/index";

/** Fields on a lead that feed into the scoring engine */
export const SCORING_FIELDS = [
  "companySize",
  "techStackMatch",
  "painSignalStrength",
  "decisionMakerAccess",
  "engagementSignals",
  "segmentFit",
] as const;

export type ScoringField = (typeof SCORING_FIELDS)[number];

/** Extract scoring input from an object (lead record or request body) */
export function extractScoringInput(data: Record<string, unknown>): ScoringInput {
  return {
    companySize: (data.companySize as string) || undefined,
    techStackMatch: (data.techStackMatch as string) || undefined,
    painSignalStrength: (data.painSignalStrength as string) || undefined,
    decisionMakerAccess: (data.decisionMakerAccess as string) || undefined,
    engagementSignals: (data.engagementSignals as string) || undefined,
    segmentFit: (data.segmentFit as string) || undefined,
  };
}

/**
 * Compute the score for a lead and return the result.
 * Pure function — does not touch the database.
 */
export function computeLeadScore(data: Record<string, unknown>): ScoringResult {
  return calculateScore(extractScoringInput(data));
}

/**
 * Insert a new lead with auto-computed score and log an import event.
 * Returns the inserted lead row.
 *
 * Used by both POST /api/leads (single create) and POST /api/leads/import (batch).
 */
export function insertScoredLead(
  db: ProjectDb,
  data: {
    name: string;
    company: string;
    title?: string | null;
    email?: string | null;
    linkedinUrl?: string | null;
    channel?: string | null;
    segment?: string | null;
    companySize?: string | null;
    techStackMatch?: string | null;
    painSignalStrength?: string | null;
    decisionMakerAccess?: string | null;
    engagementSignals?: string | null;
    segmentFit?: string | null;
    employeeCount?: number | null;
    techStack?: string | null;
    isHiringReact?: boolean;
    hasActiveBlog?: boolean;
    recentFunding?: string | null;
    activeOnLinkedIn?: boolean;
    notes?: string | null;
  },
  eventDetail?: string
) {
  const scoreResult = computeLeadScore(data as Record<string, unknown>);

  const inserted = db
    .insert(leads)
    .values({
      name: data.name,
      company: data.company,
      title: data.title || null,
      email: data.email || null,
      linkedinUrl: data.linkedinUrl || null,
      channel: data.channel || "linkedin",
      segment: data.segment || null,
      status: "new",
      score: scoreResult.totalScore,
      scoreBreakdown: JSON.stringify(scoreResult.breakdown),
      scoreRulesVersion: scoreResult.rulesVersion,
      companySize: data.companySize || null,
      techStackMatch: data.techStackMatch || null,
      painSignalStrength: data.painSignalStrength || null,
      decisionMakerAccess: data.decisionMakerAccess || null,
      engagementSignals: data.engagementSignals || null,
      segmentFit: data.segmentFit || null,
      employeeCount: data.employeeCount ?? null,
      techStack: data.techStack || null,
      isHiringReact: data.isHiringReact ?? false,
      hasActiveBlog: data.hasActiveBlog ?? false,
      recentFunding: data.recentFunding || null,
      activeOnLinkedIn: data.activeOnLinkedIn ?? false,
      notes: data.notes || null,
    })
    .returning()
    .get();

  // Log import event with full score audit trail
  db.insert(events)
    .values({
      leadId: inserted.id,
      type: "import",
      detail: eventDetail || `Lead created: ${inserted.name} at ${inserted.company}`,
      metadata: JSON.stringify({
        score: scoreResult.totalScore,
        breakdown: scoreResult.breakdown,
        rulesVersion: scoreResult.rulesVersion,
        maxScore: scoreResult.maxScore,
      }),
    })
    .run();

  return { lead: inserted, scoreResult };
}

/**
 * Recalculate a lead's score after field updates.
 * Merges incoming changes with existing lead data, computes new score,
 * updates the lead, and logs a score_change event if the score changed.
 *
 * Returns the updated lead and score result.
 */
export function recalculateLeadScore(
  db: ProjectDb,
  leadId: number,
  updates: Record<string, unknown>
) {
  const existing = db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .get();

  if (!existing) {
    throw new Error(`Lead ${leadId} not found`);
  }

  // Check if any scoring fields changed
  const scoringFieldChanged = SCORING_FIELDS.some(
    (field) => updates[field] !== undefined && updates[field] !== existing[field]
  );

  if (!scoringFieldChanged) {
    return { lead: existing, scoreResult: null, changed: false };
  }

  // Merge existing + updates for scoring input
  const merged: Record<string, unknown> = {};
  for (const field of SCORING_FIELDS) {
    merged[field] = updates[field] ?? existing[field];
  }

  const scoreResult = computeLeadScore(merged);
  const oldScore = existing.score;

  // Update the score, breakdown, and rules version on the lead
  const updated = db
    .update(leads)
    .set({
      score: scoreResult.totalScore,
      scoreBreakdown: JSON.stringify(scoreResult.breakdown),
      scoreRulesVersion: scoreResult.rulesVersion,
      updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
    })
    .where(eq(leads.id, leadId))
    .returning()
    .get();

  // Log score_change event if score actually changed
  if (oldScore !== scoreResult.totalScore) {
    db.insert(events)
      .values({
        leadId,
        type: "score_change",
        detail: `Score changed from ${oldScore} to ${scoreResult.totalScore}`,
        metadata: JSON.stringify({
          previousScore: oldScore,
          newScore: scoreResult.totalScore,
          breakdown: scoreResult.breakdown,
          rulesVersion: scoreResult.rulesVersion,
        }),
      })
      .run();
  }

  return { lead: updated, scoreResult, changed: oldScore !== scoreResult.totalScore };
}
