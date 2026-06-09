import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { messages, leads } from "@/db/schema";
import { eq, and, lte, isNotNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const searchParams = request.nextUrl.searchParams;
    const before = searchParams.get("before"); // date string

    const conditions = [
      isNotNull(messages.followUpDate),
      eq(messages.status, "sent"),
    ];

    if (before) {
      conditions.push(lte(messages.followUpDate, before));
    }

    const results = await db
      .select({
        message: messages,
        lead: leads,
      })
      .from(messages)
      .innerJoin(leads, eq(messages.leadId, leads.id))
      .where(and(...conditions))
      .orderBy(messages.followUpDate);

    return NextResponse.json({ followUps: results });
  } catch (error) {
    console.error("GET /api/follow-ups error:", error);
    return NextResponse.json(
      { error: "Failed to fetch follow-ups" },
      { status: 500 }
    );
  }
}
