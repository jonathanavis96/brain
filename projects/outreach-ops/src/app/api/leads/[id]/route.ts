import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { leads, events, messages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { SCORING_FIELDS, recalculateLeadScore } from "@/lib/score-lead";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = resolveProjectDb(request);
    const { id } = await params;
    const leadId = parseInt(id);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 });
    }

    const lead = db.select().from(leads).where(eq(leads.id, leadId)).get();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Fetch recent events for this lead
    const recentEvents = await db
      .select()
      .from(events)
      .where(eq(events.leadId, leadId))
      .orderBy(desc(events.createdAt))
      .limit(20);

    return NextResponse.json({ lead, events: recentEvents });
  } catch (error) {
    console.error("GET /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = resolveProjectDb(request);
    const { id } = await params;
    const leadId = parseInt(id);

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

    // Build update values
    const updateValues: Record<string, unknown> = {
      updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
    };

    // Only set fields that are provided in the body
    const allowedFields = [
      "name",
      "company",
      "title",
      "email",
      "linkedinUrl",
      "channel",
      "segment",
      "status",
      "companySize",
      "techStackMatch",
      "painSignalStrength",
      "decisionMakerAccess",
      "engagementSignals",
      "segmentFit",
      "employeeCount",
      "techStack",
      "isHiringReact",
      "hasActiveBlog",
      "recentFunding",
      "activeOnLinkedIn",
      "notes",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateValues[field] = body[field];
      }
    }

    // Auto-recalculate score via shared utility (handles event logging)
    const { scoreResult } = recalculateLeadScore(db, leadId, body);
    if (scoreResult) {
      updateValues.score = scoreResult.totalScore;
    }

    const result = db
      .update(leads)
      .set(updateValues)
      .where(eq(leads.id, leadId))
      .returning()
      .get();

    return NextResponse.json({ lead: result });
  } catch (error) {
    console.error("PATCH /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = resolveProjectDb(request);
    const { id } = await params;
    const leadId = parseInt(id);

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

    // Cascade delete: events and messages for this lead
    db.delete(events).where(eq(events.leadId, leadId)).run();
    db.delete(messages).where(eq(messages.leadId, leadId)).run();
    db.delete(leads).where(eq(leads.id, leadId)).run();

    return NextResponse.json({ deleted: true, id: leadId });
  } catch (error) {
    console.error("DELETE /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
