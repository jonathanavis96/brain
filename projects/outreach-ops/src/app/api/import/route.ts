import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { leads, events, runs } from "@/db/schema";
import { calculateScore } from "@/lib/scoring";
import { parseCsvRows } from "@/lib/csv-import";

export async function POST(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const body = await request.json();

    if (!body.headers || !body.rows) {
      return NextResponse.json(
        { error: "headers and rows are required" },
        { status: 400 }
      );
    }

    const { leads: parsedLeads, result } = parseCsvRows(body.headers, body.rows);

    // Insert leads with scoring
    const insertedIds: number[] = [];
    for (const lead of parsedLeads) {
      const scoreResult = calculateScore({
        companySize: lead.companySize,
        techStackMatch: lead.techStackMatch,
        painSignalStrength: lead.painSignalStrength,
        decisionMakerAccess: lead.decisionMakerAccess,
        engagementSignals: lead.engagementSignals,
        segmentFit: lead.segmentFit,
      });

      const inserted = db
        .insert(leads)
        .values({
          name: lead.name,
          company: lead.company,
          title: lead.title || null,
          email: lead.email || null,
          linkedinUrl: lead.linkedinUrl || null,
          channel: lead.channel || "linkedin",
          segment: lead.segment || null,
          status: "new",
          score: scoreResult.totalScore,
          companySize: lead.companySize || null,
          techStackMatch: lead.techStackMatch || null,
          painSignalStrength: lead.painSignalStrength || null,
          decisionMakerAccess: lead.decisionMakerAccess || null,
          engagementSignals: lead.engagementSignals || null,
          segmentFit: lead.segmentFit || null,
          notes: lead.notes || null,
        })
        .returning()
        .get();

      insertedIds.push(inserted.id);

      db.insert(events)
        .values({
          leadId: inserted.id,
          type: "import",
          detail: `Imported from CSV: ${inserted.name} at ${inserted.company}`,
        })
        .run();
    }

    // Log the import run
    db.insert(runs)
      .values({
        action: "csv_import",
        rulesVersion: 1,
        inputSummary: JSON.stringify({
          totalRows: body.rows.length,
          headers: body.headers,
        }),
        outputSummary: JSON.stringify(result),
      })
      .run();

    return NextResponse.json({
      result,
      insertedIds,
    });
  } catch (error) {
    console.error("POST /api/import error:", error);
    return NextResponse.json(
      { error: "Failed to import leads" },
      { status: 500 }
    );
  }
}
