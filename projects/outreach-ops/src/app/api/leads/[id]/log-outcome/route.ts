import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { leads, events, STATUS_MAP } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  canTransition,
  getValidNextStatuses,
  mapOutcomeToStatus,
  validateStatus,
} from "@/lib/lead-status";
import type { LeadStatus } from "@/db/schema";

/**
 * Outcome labels mapping outcome keys to human-readable labels.
 * These are the outcomes a user can log from the Lead Detail page.
 */
const OUTCOME_LABELS: Record<string, string> = {
  replied: "Got a Reply",
  booked: "Meeting Booked",
  closed: "Closed Won",
  not_now: "Not Now (Nurture)",
  ignored: "No Response",
  lost: "Lost",
  re_engaged: "Re-engaged",
};

/**
 * Maps outcome keys to event types for the events table.
 */
const OUTCOME_TO_EVENT_TYPE: Record<string, string> = {
  replied: "reply",
  booked: "booked",
  closed: "closed",
  not_now: "note",
  ignored: "note",
  lost: "lost",
  re_engaged: "note",
};

/**
 * Maps outcome keys to the resulting lead status.
 * Extends STATUS_MAP with additional outcomes not covered by message outcomes.
 */
const OUTCOME_TO_STATUS: Record<string, LeadStatus> = {
  ...STATUS_MAP,
  lost: "lost",
  re_engaged: "contacted",
};

/**
 * Given a lead's current status, return the valid outcome keys.
 */
function getValidOutcomes(currentStatus: LeadStatus): string[] {
  const validNextStatuses = getValidNextStatuses(currentStatus);
  const outcomes: string[] = [];

  // Map each valid next status back to the outcome keys that produce it
  const statusToOutcomes: Record<string, string[]> = {
    contacted: ["re_engaged"],
    replied: ["replied"],
    booked: ["booked"],
    closed: ["closed"],
    nurture: ["not_now"],
    lost: ["lost"],
  };

  for (const nextStatus of validNextStatuses) {
    const possibleOutcomes = statusToOutcomes[nextStatus] || [];
    outcomes.push(...possibleOutcomes);
  }

  return outcomes;
}

/**
 * POST /api/leads/[id]/log-outcome
 *
 * Logs an outcome for a lead, auto-advancing its status based on the FSM.
 *
 * Body: { outcome: string, note?: string }
 *
 * Returns: { lead, event, previousStatus }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = resolveProjectDb(request);
    const { id } = await params;
    const leadId = parseInt(id, 10);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 });
    }

    const existing = db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .get();

    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const body = await request.json();

    if (!body.outcome || typeof body.outcome !== "string") {
      return NextResponse.json(
        { error: "outcome is required" },
        { status: 400 }
      );
    }

    const { outcome, note } = body;
    const currentStatus = existing.status as LeadStatus;

    // Validate the outcome is valid for the current status
    const validOutcomes = getValidOutcomes(currentStatus);
    if (!validOutcomes.includes(outcome)) {
      return NextResponse.json(
        {
          error: `Invalid outcome "${outcome}" for lead in "${currentStatus}" status. Valid outcomes: ${validOutcomes.join(", ")}`,
          validOutcomes,
        },
        { status: 422 }
      );
    }

    const newStatus = OUTCOME_TO_STATUS[outcome];
    if (!newStatus) {
      return NextResponse.json(
        { error: `Unknown outcome: ${outcome}` },
        { status: 400 }
      );
    }

    // Validate FSM transition
    if (!canTransition(currentStatus, newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from "${currentStatus}" to "${newStatus}"`,
        },
        { status: 422 }
      );
    }

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const previousStatus = currentStatus;

    // Update lead status
    const updated = db
      .update(leads)
      .set({ status: newStatus, updatedAt: now })
      .where(eq(leads.id, leadId))
      .returning()
      .get();

    // Log event
    const eventType = OUTCOME_TO_EVENT_TYPE[outcome] || "note";
    const outcomeLabel = OUTCOME_LABELS[outcome] || outcome;
    const detail = note
      ? `${outcomeLabel}: ${note}`
      : outcomeLabel;

    const event = db
      .insert(events)
      .values({
        leadId,
        type: eventType,
        detail,
        metadata: JSON.stringify({
          outcome,
          previousStatus,
          newStatus,
          note: note || null,
          source: "lead_detail_log_outcome",
        }),
      })
      .returning()
      .get();

    return NextResponse.json(
      { lead: updated, event, previousStatus },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/leads/[id]/log-outcome error:", error);
    return NextResponse.json(
      { error: "Failed to log outcome" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads/[id]/log-outcome
 *
 * Returns the valid outcomes for a lead's current status.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = resolveProjectDb(request);
    const { id } = await params;
    const leadId = parseInt(id, 10);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 });
    }

    const existing = db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .get();

    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const currentStatus = existing.status as LeadStatus;
    const validOutcomes = getValidOutcomes(currentStatus);

    return NextResponse.json({
      currentStatus,
      outcomes: validOutcomes.map((key) => ({
        key,
        label: OUTCOME_LABELS[key] || key,
        nextStatus: OUTCOME_TO_STATUS[key],
      })),
    });
  } catch (error) {
    console.error("GET /api/leads/[id]/log-outcome error:", error);
    return NextResponse.json(
      { error: "Failed to get valid outcomes" },
      { status: 500 }
    );
  }
}
