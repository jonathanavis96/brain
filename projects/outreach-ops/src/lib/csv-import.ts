export interface CsvLeadRow {
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
  notes?: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
}

const REQUIRED_FIELDS = ["name", "company"] as const;

// Map common CSV header variations to our field names
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
  notes: "notes",
};

export function normalizeHeader(header: string): keyof CsvLeadRow | null {
  const normalized = header.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return HEADER_MAP[normalized] ?? null;
}

export function validateRow(
  row: Record<string, unknown>,
  rowIndex: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (!row[field] || String(row[field]).trim() === "") {
      errors.push(`Missing required field: ${field}`);
    }
  }
  if (row.email && typeof row.email === "string") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) {
      errors.push(`Invalid email format: ${row.email}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export function parseCsvRows(
  headers: string[],
  rows: string[][]
): { leads: CsvLeadRow[]; result: ImportResult } {
  const mappedHeaders = headers.map(normalizeHeader);
  const leads: CsvLeadRow[] = [];
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const record: Record<string, unknown> = {};

    for (let j = 0; j < mappedHeaders.length; j++) {
      const field = mappedHeaders[j];
      if (field && row[j] !== undefined) {
        record[field] = row[j].trim();
      }
    }

    const validation = validateRow(record, i + 2); // +2 for header row + 1-based
    if (!validation.valid) {
      result.skipped++;
      result.errors.push({
        row: i + 2,
        error: validation.errors.join("; "),
      });
      continue;
    }

    leads.push(record as unknown as CsvLeadRow);
    result.imported++;
  }

  return { leads, result };
}
