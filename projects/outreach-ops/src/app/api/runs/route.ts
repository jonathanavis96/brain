import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { runs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");

    const results = await db
      .select()
      .from(runs)
      .orderBy(desc(runs.createdAt))
      .limit(limit);

    return NextResponse.json({ runs: results });
  } catch (error) {
    console.error("GET /api/runs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch runs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const body = await request.json();

    if (!body.action) {
      return NextResponse.json(
        { error: "action is required" },
        { status: 400 }
      );
    }

    const result = db
      .insert(runs)
      .values({
        action: body.action,
        rulesVersion: body.rulesVersion || null,
        inputSummary: body.inputSummary
          ? typeof body.inputSummary === "string"
            ? body.inputSummary
            : JSON.stringify(body.inputSummary)
          : null,
        outputSummary: body.outputSummary
          ? typeof body.outputSummary === "string"
            ? body.outputSummary
            : JSON.stringify(body.outputSummary)
          : null,
      })
      .returning()
      .get();

    return NextResponse.json({ run: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/runs error:", error);
    return NextResponse.json(
      { error: "Failed to create run" },
      { status: 500 }
    );
  }
}
