import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { messages, leads, events, STATUS_MAP } from "@/db/schema";
import { eq } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const db = resolveProjectDb(request);
    const { id } = await context.params;

    const message = db
      .select()
      .from(messages)
      .where(eq(messages.id, parseInt(id)))
      .get();

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("GET /api/messages/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const db = resolveProjectDb(request);
    const { id } = await context.params;
    const body = await request.json();
    const messageId = parseInt(id);

    const existing = db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.status !== undefined) updates.status = body.status;
    if (body.outcome !== undefined) updates.outcome = body.outcome;
    if (body.body !== undefined) updates.body = body.body;
    if (body.subject !== undefined) updates.subject = body.subject;
    if (body.followUpDate !== undefined) updates.followUpDate = body.followUpDate;
    if (body.selectedHook !== undefined) updates.selectedHook = body.selectedHook;

    // Mark sent timestamp when status transitions to "sent"
    if (body.status === "sent" && existing.status !== "sent") {
      updates.sentAt = new Date().toISOString();

      // Log sent event
      db.insert(events)
        .values({
          leadId: existing.leadId,
          type: "sent",
          detail: `Message sent via ${existing.channel}`,
          metadata: JSON.stringify({
            messageId,
            templateId: existing.templateId,
            selectedHook: existing.selectedHook,
          }),
        })
        .run();

      // Update lead status to "contacted" if currently "new"
      const lead = db
        .select()
        .from(leads)
        .where(eq(leads.id, existing.leadId))
        .get();

      if (lead && lead.status === "new") {
        db.update(leads)
          .set({ status: "contacted", updatedAt: new Date().toISOString() })
          .where(eq(leads.id, existing.leadId))
          .run();
      }
    }

    // Handle outcome → lead status mapping
    if (body.outcome && STATUS_MAP[body.outcome]) {
      const newLeadStatus = STATUS_MAP[body.outcome];
      db.update(leads)
        .set({ status: newLeadStatus, updatedAt: new Date().toISOString() })
        .where(eq(leads.id, existing.leadId))
        .run();

      // Log the outcome event
      db.insert(events)
        .values({
          leadId: existing.leadId,
          type: body.outcome === "replied" ? "reply" : body.outcome,
          detail: `Message outcome: ${body.outcome}`,
          metadata: JSON.stringify({ messageId, outcome: body.outcome }),
        })
        .run();
    }

    db.update(messages)
      .set(updates)
      .where(eq(messages.id, messageId))
      .run();

    const updated = db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .get();

    return NextResponse.json({ message: updated });
  } catch (error) {
    console.error("PATCH /api/messages/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
