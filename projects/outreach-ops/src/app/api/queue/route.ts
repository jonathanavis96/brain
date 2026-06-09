import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { messages, leads } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "queued";

    const results = await db
      .select({
        message: messages,
        lead: leads,
      })
      .from(messages)
      .innerJoin(leads, eq(messages.leadId, leads.id))
      .where(eq(messages.status, status))
      .orderBy(desc(messages.createdAt));

    return NextResponse.json({ queue: results });
  } catch (error) {
    console.error("GET /api/queue error:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const body = await request.json();

    if (!body.leadId || !body.body) {
      return NextResponse.json(
        { error: "leadId and body are required" },
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

    const result = db
      .insert(messages)
      .values({
        leadId: body.leadId,
        templateId: body.templateId || null,
        channel: body.channel || lead.channel || "linkedin",
        subject: body.subject || null,
        body: body.body,
        selectedHook: body.selectedHook || null,
        status: "queued",
        followUpDate: body.followUpDate || null,
      })
      .returning()
      .get();

    return NextResponse.json({ message: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/queue error:", error);
    return NextResponse.json(
      { error: "Failed to add to queue" },
      { status: 500 }
    );
  }
}
