import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { templates } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const searchParams = request.nextUrl.searchParams;
    const channel = searchParams.get("channel");
    const segment = searchParams.get("segment");
    const type = searchParams.get("type");
    const includeInactive = searchParams.get("includeInactive") === "true";

    let query = db.select().from(templates);
    const conditions = [];

    if (!includeInactive) {
      conditions.push(eq(templates.isActive, true));
    }
    if (channel) {
      conditions.push(eq(templates.channel, channel));
    }
    if (segment) {
      conditions.push(eq(templates.segment, segment));
    }
    if (type) {
      conditions.push(eq(templates.type, type));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const results = await query.orderBy(desc(templates.createdAt));

    return NextResponse.json({ templates: results });
  } catch (error) {
    console.error("GET /api/templates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const body = await request.json();

    if (!body.name || !body.channel || !body.type || !body.body) {
      return NextResponse.json(
        { error: "name, channel, type, and body are required" },
        { status: 400 }
      );
    }

    const result = db
      .insert(templates)
      .values({
        name: body.name,
        channel: body.channel,
        segment: body.segment || null,
        type: body.type,
        variant: body.variant || null,
        subject: body.subject || null,
        body: body.body,
        version: body.version || 1,
        isActive: body.isActive !== undefined ? body.isActive : true,
      })
      .returning()
      .get();

    return NextResponse.json({ template: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/templates error:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
