import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { leads } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getScoringRules } from "@/lib/scoring";
import { recalculateLeadScore } from "@/lib/score-lead";

export async function GET() {
  try {
    const rules = getScoringRules();
    return NextResponse.json({ rules });
  } catch (error) {
    console.error("GET /api/scoring error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scoring rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const body = await request.json();

    if (!body.leadId) {
      return NextResponse.json(
        { error: "leadId is required" },
        { status: 400 }
      );
    }

    const lead = db
      .select()
      .from(leads)
      .where(eq(leads.id, body.leadId))
      .get();

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Also update scoring fields on the lead if provided
    const scoringFieldUpdates: Record<string, unknown> = {};
    for (const field of ["companySize", "techStackMatch", "painSignalStrength", "decisionMakerAccess", "engagementSignals", "segmentFit"]) {
      if (body[field] !== undefined) {
        scoringFieldUpdates[field] = body[field];
      }
    }

    // Update scoring fields on lead first if any provided
    if (Object.keys(scoringFieldUpdates).length > 0) {
      db.update(leads)
        .set({
          ...scoringFieldUpdates,
          updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
        })
        .where(eq(leads.id, body.leadId))
        .run();
    }

    // Auto-recalculate via shared utility (handles event logging)
    const { scoreResult, changed } = recalculateLeadScore(db, body.leadId, scoringFieldUpdates);

    return NextResponse.json({
      leadId: body.leadId,
      score: scoreResult,
      previousScore: lead.score,
      changed,
    });
  } catch (error) {
    console.error("POST /api/scoring error:", error);
    return NextResponse.json(
      { error: "Failed to calculate score" },
      { status: 500 }
    );
  }
}
