import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { leads, events } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/leads/[id]/mark-lost
 *
 * Atomically sets a lead's status to "lost" and logs a "lost" event
 * with an optional reason in the detail field.
 *
 * Body (optional): { reason?: string }
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

    if (existing.status === "lost") {
      return NextResponse.json(
        { error: "Lead is already marked as lost" },
        { status: 409 }
      );
    }

    // Parse optional reason from body
    let reason: string | null = null;
    try {
      const body = await request.json();
      if (body.reason && typeof body.reason === "string") {
        reason = body.reason.trim() || null;
      }
    } catch {
      // Empty body is fine — reason is optional
    }

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const previousStatus = existing.status;

    // Update lead status to lost
    const updated = db
      .update(leads)
      .set({ status: "lost", updatedAt: now })
      .where(eq(leads.id, leadId))
      .returning()
      .get();

    // Log a "lost" event with reason and previous status
    const detail = reason
      ? `Marked as lost: ${reason}`
      : "Marked as lost";

    db.insert(events)
      .values({
        leadId,
        type: "lost",
        detail,
        metadata: JSON.stringify({
          previousStatus,
          reason: reason || null,
        }),
      })
      .run();

    return NextResponse.json({ lead: updated });
  } catch (error) {
    console.error("POST /api/leads/[id]/mark-lost error:", error);
    return NextResponse.json(
      { error: "Failed to mark lead as lost" },
      { status: 500 }
    );
  }
}
