import { describe, it, expect, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb } from "../test-helpers";
import * as schema from "../../src/db/schema";
import { parseCsvRows } from "../../src/lib/csv-import";
import { calculateScore } from "../../src/lib/scoring";

describe("Import API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  it("should import leads from parsed CSV data with auto-scoring", () => {
    testDb = createTestDb();
    const headers = ["name", "company", "email", "company_size", "tech_stack_match"];
    const rows = [
      ["Alice Smith", "AliceCorp", "alice@corp.com", "enterprise", "perfect"],
      ["Bob Jones", "BobInc", "bob@inc.com", "smb", "weak"],
    ];

    const { leads: parsedLeads, result } = parseCsvRows(headers, rows);
    expect(result.imported).toBe(2);

    for (const lead of parsedLeads) {
      const scoreResult = calculateScore({
        companySize: lead.companySize,
        techStackMatch: lead.techStackMatch,
      });

      testDb.db
        .insert(schema.leads)
        .values({
          name: lead.name,
          company: lead.company,
          email: lead.email || null,
          status: "new",
          score: scoreResult.totalScore,
          companySize: lead.companySize || null,
          techStackMatch: lead.techStackMatch || null,
        })
        .run();
    }

    const allLeads = testDb.db.select().from(schema.leads).all();
    expect(allLeads).toHaveLength(2);

    // Alice with enterprise + perfect should score higher
    const alice = allLeads.find((l) => l.name === "Alice Smith");
    const bob = allLeads.find((l) => l.name === "Bob Jones");
    expect(alice!.score).toBeGreaterThan(bob!.score);
  });

  it("should create import events for each lead", () => {
    testDb = createTestDb();
    const lead = testDb.db
      .insert(schema.leads)
      .values({ name: "Imported Lead", company: "Corp" })
      .returning()
      .get();

    testDb.db
      .insert(schema.events)
      .values({
        leadId: lead.id,
        type: "import",
        detail: `Imported from CSV: ${lead.name} at ${lead.company}`,
      })
      .run();

    const events = testDb.db
      .select()
      .from(schema.events)
      .where(eq(schema.events.leadId, lead.id))
      .all();

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("import");
  });

  it("should log the import run", () => {
    testDb = createTestDb();

    const run = testDb.db
      .insert(schema.runs)
      .values({
        action: "csv_import",
        rulesVersion: 1,
        inputSummary: JSON.stringify({ totalRows: 5, headers: ["name", "company"] }),
        outputSummary: JSON.stringify({ imported: 4, skipped: 1, errors: [] }),
      })
      .returning()
      .get();

    expect(run.action).toBe("csv_import");
    expect(run.rulesVersion).toBe(1);
    const input = JSON.parse(run.inputSummary!);
    expect(input.totalRows).toBe(5);
    const output = JSON.parse(run.outputSummary!);
    expect(output.imported).toBe(4);
  });

  it("should handle import with mixed valid/invalid rows", () => {
    const headers = ["name", "company", "email"];
    const rows = [
      ["Alice", "AliceCorp", "alice@corp.com"],
      ["", "NoName", ""],  // invalid: no name
      ["Charlie", "", ""],  // invalid: no company
      ["Dave", "DaveCorp", "invalid-email"],  // invalid email
      ["Eve", "EveCorp", "eve@corp.com"],
    ];

    const { leads: parsedLeads, result } = parseCsvRows(headers, rows);
    expect(result.imported).toBe(2);  // Alice and Eve
    expect(result.skipped).toBe(3);
    expect(result.errors).toHaveLength(3);
  });

  it("should handle empty CSV import", () => {
    const { leads, result } = parseCsvRows(["name", "company"], []);
    expect(leads).toHaveLength(0);
    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(0);
  });
});
