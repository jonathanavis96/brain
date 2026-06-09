import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { leads } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { insertScoredLead } from "@/lib/score-lead";

export async function GET(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "createdAt";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = db.select().from(leads);

    if (status && status !== "all") {
      query = query.where(eq(leads.status, status)) as typeof query;
    }

    if (search) {
      query = query.where(
        sql`${leads.name} LIKE ${"%" + search + "%"} OR ${leads.company} LIKE ${"%" + search + "%"}`
      ) as typeof query;
    }

    // Determine sort order
    let orderBy;
    switch (sort) {
      case "score":
        orderBy = desc(leads.score);
        break;
      case "name":
        orderBy = leads.name;
        break;
      case "company":
        orderBy = leads.company;
        break;
      case "status":
        orderBy = leads.status;
        break;
      case "updatedAt":
        orderBy = desc(leads.updatedAt);
        break;
      default:
        orderBy = desc(leads.createdAt);
    }

    const results = await query.orderBy(orderBy).limit(limit).offset(offset);

    // Get total count for pagination
    const totalResult = db
      .select({ total: sql<number>`count(*)` })
      .from(leads)
      .get();

    return NextResponse.json({
      leads: results,
      total: totalResult?.total ?? results.length,
    });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const body = await request.json();

    if (!body.name || !body.company) {
      return NextResponse.json(
        { error: "name and company are required" },
        { status: 400 }
      );
    }

    // Auto-score and insert via shared utility — ensures deterministic audit trail
    const { lead: result } = insertScoredLead(db, {
      name: body.name,
      company: body.company,
      title: body.title || null,
      email: body.email || null,
      linkedinUrl: body.linkedinUrl || null,
      channel: body.channel || "linkedin",
      segment: body.segment || null,
      companySize: body.companySize || null,
      techStackMatch: body.techStackMatch || null,
      painSignalStrength: body.painSignalStrength || null,
      decisionMakerAccess: body.decisionMakerAccess || null,
      engagementSignals: body.engagementSignals || null,
      segmentFit: body.segmentFit || null,
      employeeCount: body.employeeCount ?? null,
      techStack: body.techStack || null,
      isHiringReact: body.isHiringReact ?? false,
      hasActiveBlog: body.hasActiveBlog ?? false,
      recentFunding: body.recentFunding || null,
      activeOnLinkedIn: body.activeOnLinkedIn ?? false,
      notes: body.notes || null,
    });

    return NextResponse.json({ lead: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
