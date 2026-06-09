import { NextRequest, NextResponse } from "next/server";
import { getProjectDb } from "@/db/index";
import { partners } from "@/db/schema";
import { desc } from "drizzle-orm";

function resolveProjectDb(request: NextRequest) {
  const slug =
    request.cookies.get("active_project")?.value?.trim() || "default";
  return getProjectDb(slug);
}

export async function GET(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const allPartners = db.select().from(partners).orderBy(desc(partners.createdAt)).all();
    return NextResponse.json({ partners: allPartners });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const body = await request.json();

    const { name, type, contactInfo, notes } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Partner name is required" },
        { status: 400 }
      );
    }

    const result = db
      .insert(partners)
      .values({
        name: name.trim(),
        type: type?.trim() || null,
        contactInfo: contactInfo?.trim() || null,
        notes: notes?.trim() || null,
      })
      .returning()
      .get();

    return NextResponse.json({ partner: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create partner" },
      { status: 500 }
    );
  }
}
