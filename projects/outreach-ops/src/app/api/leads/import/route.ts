import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { runs } from "@/db/schema";
import { insertScoredLead } from "@/lib/score-lead";
import { getScoringRules } from "@/lib/scoring";

interface CsvLeadRow {
  name: string;
  company: string;
  title?: string;
  email?: string;
  linkedinUrl?: string;
  channel?: string;
  segment?: string;
  companySize?: string;
  techStackMatch?: string;
  painSignalStrength?: string;
  decisionMakerAccess?: string;
  engagementSignals?: string;
  segmentFit?: string;
  employeeCount?: string;
  techStack?: string;
  isHiringReact?: string;
  hasActiveBlog?: string;
  recentFunding?: string;
  activeOnLinkedIn?: string;
  notes?: string;
}

const HEADER_MAP: Record<string, keyof CsvLeadRow> = {
  name: "name",
  full_name: "name",
  fullname: "name",
  company: "company",
  company_name: "company",
  companyname: "company",
  title: "title",
  job_title: "title",
  jobtitle: "title",
  email: "email",
  email_address: "email",
  linkedin_url: "linkedinUrl",
  linkedinurl: "linkedinUrl",
  linkedin: "linkedinUrl",
  channel: "channel",
  segment: "segment",
  company_size: "companySize",
  companysize: "companySize",
  tech_stack_match: "techStackMatch",
  techstackmatch: "techStackMatch",
  pain_signal_strength: "painSignalStrength",
  painsignalstrength: "painSignalStrength",
  decision_maker_access: "decisionMakerAccess",
  decisionmakeraccess: "decisionMakerAccess",
  engagement_signals: "engagementSignals",
  engagementsignals: "engagementSignals",
  segment_fit: "segmentFit",
  segmentfit: "segmentFit",
  employee_count: "employeeCount",
  employeecount: "employeeCount",
  employees: "employeeCount",
  tech_stack: "techStack",
  techstack: "techStack",
  is_hiring_react: "isHiringReact",
  ishiringreact: "isHiringReact",
  hiring_react: "isHiringReact",
  has_active_blog: "hasActiveBlog",
  hasactiveblog: "hasActiveBlog",
  active_blog: "hasActiveBlog",
  recent_funding: "recentFunding",
  recentfunding: "recentFunding",
  funding: "recentFunding",
  active_on_linkedin: "activeOnLinkedIn",
  activeonlinkedin: "activeOnLinkedIn",
  linkedin_active: "activeOnLinkedIn",
  notes: "notes",
};

function normalizeHeader(header: string): keyof CsvLeadRow | null {
  const normalized = header.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return HEADER_MAP[normalized] ?? null;
}

function parseCsvString(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) =>
    line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))
  );

  return { headers, rows };
}

function importLead(
  db: ReturnType<typeof resolveProjectDb>,
  lead: CsvLeadRow,
  detail: string
): number {
  const { lead: inserted } = insertScoredLead(
    db,
    {
      name: lead.name,
      company: lead.company,
      title: lead.title || null,
      email: lead.email || null,
      linkedinUrl: lead.linkedinUrl || null,
      channel: lead.channel || "linkedin",
      segment: lead.segment || null,
      companySize: lead.companySize || null,
      techStackMatch: lead.techStackMatch || null,
      painSignalStrength: lead.painSignalStrength || null,
      decisionMakerAccess: lead.decisionMakerAccess || null,
      engagementSignals: lead.engagementSignals || null,
      segmentFit: lead.segmentFit || null,
      employeeCount: lead.employeeCount ? parseInt(lead.employeeCount, 10) || null : null,
      techStack: lead.techStack || null,
      isHiringReact: lead.isHiringReact === "true" || lead.isHiringReact === "1",
      hasActiveBlog: lead.hasActiveBlog === "true" || lead.hasActiveBlog === "1",
      recentFunding: lead.recentFunding || null,
      activeOnLinkedIn: lead.activeOnLinkedIn === "true" || lead.activeOnLinkedIn === "1",
      notes: lead.notes || null,
    },
    detail
  );

  return inserted.id;
}

export async function POST(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);
    const contentType = request.headers.get("content-type") || "";

    let headers: string[] = [];
    let rows: string[][] = [];
    let jsonLeads: CsvLeadRow[] | null = null;

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart CSV file upload
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: "No CSV file provided in form data" },
          { status: 400 }
        );
      }
      const csvText = await file.text();
      const parsed = parseCsvString(csvText);
      headers = parsed.headers;
      rows = parsed.rows;
    } else {
      // Handle JSON body: either { headers, rows } or array of lead objects
      const body = await request.json();

      if (Array.isArray(body)) {
        jsonLeads = body as CsvLeadRow[];
      } else if (body.csv && typeof body.csv === "string") {
        const parsed = parseCsvString(body.csv);
        headers = parsed.headers;
        rows = parsed.rows;
      } else if (body.headers && body.rows) {
        headers = body.headers;
        rows = body.rows;
      } else {
        return NextResponse.json(
          { error: "Provide a CSV file, { headers, rows }, { csv: string }, or a JSON array of leads" },
          { status: 400 }
        );
      }
    }

    const imported: number[] = [];
    const errors: string[] = [];

    if (jsonLeads) {
      for (let i = 0; i < jsonLeads.length; i++) {
        const lead = jsonLeads[i];
        if (!lead.name || !lead.company) {
          errors.push(`Row ${i + 1}: name and company are required`);
          continue;
        }
        try {
          const id = importLead(db, lead, `Imported: ${lead.name} at ${lead.company}`);
          imported.push(id);
        } catch (err) {
          errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "insert failed"}`);
        }
      }
    } else {
      const mappedHeaders = headers.map(normalizeHeader);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const record: Record<string, string> = {};

        for (let j = 0; j < mappedHeaders.length; j++) {
          const field = mappedHeaders[j];
          if (field && row[j] !== undefined) {
            record[field] = row[j].trim();
          }
        }

        if (!record.name || !record.company) {
          errors.push(`Row ${i + 2}: name and company are required`);
          continue;
        }

        try {
          const id = importLead(
            db,
            record as unknown as CsvLeadRow,
            `Imported from CSV: ${record.name} at ${record.company}`
          );
          imported.push(id);
        } catch (err) {
          errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : "insert failed"}`);
        }
      }
    }

    // Create a run record with import summary (use actual rules version for audit trail)
    const currentRules = getScoringRules();
    db.insert(runs)
      .values({
        action: "csv_import",
        rulesVersion: currentRules.version,
        inputSummary: JSON.stringify({
          totalRows: jsonLeads ? jsonLeads.length : rows.length,
          format: jsonLeads ? "json_array" : "csv",
        }),
        outputSummary: JSON.stringify({
          imported: imported.length,
          errors: errors.length,
          errorDetails: errors,
        }),
      })
      .run();

    return NextResponse.json({
      imported: imported.length,
      errors,
      insertedIds: imported,
    });
  } catch (error) {
    console.error("POST /api/leads/import error:", error);
    return NextResponse.json(
      { error: "Failed to import leads" },
      { status: 500 }
    );
  }
}
