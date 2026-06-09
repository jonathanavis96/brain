import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { messages, leads } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const leadId = searchParams.get("leadId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = db.select().from(messages);
    const conditions = [];

    if (status) {
      conditions.push(eq(messages.status, status));
    }

    if (leadId) {
      conditions.push(eq(messages.leadId, parseInt(leadId)));
    }

    if (conditions.length > 0) {
      query = query.where(
        conditions.length === 1 ? conditions[0] : and(...conditions)
      ) as typeof query;
    }

    const results = await query
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ messages: results });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
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

    // Validate lead exists
    const lead = db
      .select()
      .from(leads)
      .where(eq(leads.id, body.leadId))
      .get();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
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
        status: body.status || "draft",
        outcome: body.outcome || null,
        sentAt: body.sentAt || null,
        followUpDate: body.followUpDate || null,
      })
      .returning()
      .get();

    return NextResponse.json({ message: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
