import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { events, leads, EVENT_TYPES } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Map event types to lead status changes
const EVENT_TO_STATUS: Record<string, string> = {
  sent: "contacted",
  reply: "replied",
  booked: "booked",
  closed: "closed",
  lost: "lost",
};

export async function GET(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get("leadId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!leadId) {
      return NextResponse.json(
        { error: "leadId query parameter is required" },
        { status: 400 }
      );
    }

    const results = await db
      .select()
      .from(events)
      .where(eq(events.leadId, parseInt(leadId)))
      .orderBy(desc(events.createdAt))
      .limit(limit);

    return NextResponse.json({ events: results });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const body = await request.json();

    if (!body.leadId || !body.type) {
      return NextResponse.json(
        { error: "leadId and type are required" },
        { status: 400 }
      );
    }

    // Verify lead exists
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

    // Validate event type
    const validTypes: readonly string[] = EVENT_TYPES;
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          error: `Invalid event type. Must be one of: ${EVENT_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const result = db
      .insert(events)
      .values({
        leadId: body.leadId,
        type: body.type,
        detail: body.detail || null,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      })
      .returning()
      .get();

    // Update lead status if event type maps to a status change
    const newStatus = EVENT_TO_STATUS[body.type];
    if (newStatus) {
      db.update(leads)
        .set({
          status: newStatus,
          updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
        })
        .where(eq(leads.id, body.leadId))
        .run();
    }

    return NextResponse.json({ event: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
