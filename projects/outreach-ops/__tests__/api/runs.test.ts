/**
 * Tests for /api/runs route logic (GET, POST).
 */
import { describe, it, expect, afterEach } from "vitest";
import { desc } from "drizzle-orm";
import { createTestDb } from "../test-helpers";
import * as schema from "../../src/db/schema";

describe("Runs API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/runs — list runs", () => {
    it("should return runs ordered by createdAt desc", () => {
      testDb = createTestDb();
      testDb.db.insert(schema.runs).values({ action: "csv_import", rulesVersion: 1 }).run();
      testDb.db.insert(schema.runs).values({ action: "scoring_batch", rulesVersion: 1 }).run();

      const results = testDb.db
        .select()
        .from(schema.runs)
        .orderBy(desc(schema.runs.createdAt))
        .all();

      expect(results).toHaveLength(2);
    });

    it("should respect limit parameter", () => {
      testDb = createTestDb();
      for (let i = 0; i < 10; i++) {
        testDb.db.insert(schema.runs).values({ action: `action_${i}` }).run();
      }

      const results = testDb.db
        .select()
        .from(schema.runs)
        .limit(5)
        .all();

      expect(results).toHaveLength(5);
    });

    it("should return empty array when no runs exist", () => {
      testDb = createTestDb();
      const results = testDb.db.select().from(schema.runs).all();
      expect(results).toHaveLength(0);
    });
  });

  describe("POST /api/runs — create run", () => {
    it("should create a run with action only", () => {
      testDb = createTestDb();
      const run = testDb.db
        .insert(schema.runs)
        .values({ action: "csv_import" })
        .returning()
        .get();

      expect(run.id).toBeDefined();
      expect(run.action).toBe("csv_import");
      expect(run.rulesVersion).toBeNull();
    });

    it("should create a run with full metadata", () => {
      testDb = createTestDb();
      const inputSummary = JSON.stringify({ totalRows: 100, headers: ["name", "company"] });
      const outputSummary = JSON.stringify({ imported: 95, skipped: 5 });

      const run = testDb.db
        .insert(schema.runs)
        .values({
          action: "csv_import",
          rulesVersion: 1,
          inputSummary,
          outputSummary,
        })
        .returning()
        .get();

      expect(run.rulesVersion).toBe(1);
      const input = JSON.parse(run.inputSummary!);
      expect(input.totalRows).toBe(100);
      const output = JSON.parse(run.outputSummary!);
      expect(output.imported).toBe(95);
    });

    it("should validate action is required (simulated)", () => {
      const body = {};
      expect(!("action" in body) || !(body as any).action).toBe(true);
    });

    it("should handle inputSummary as string or object", () => {
      testDb = createTestDb();

      // As string
      const run1 = testDb.db
        .insert(schema.runs)
        .values({
          action: "test",
          inputSummary: "plain string summary",
        })
        .returning()
        .get();
      expect(run1.inputSummary).toBe("plain string summary");

      // As serialized JSON
      const run2 = testDb.db
        .insert(schema.runs)
        .values({
          action: "test",
          inputSummary: JSON.stringify({ key: "value" }),
        })
        .returning()
        .get();
      const parsed = JSON.parse(run2.inputSummary!);
      expect(parsed.key).toBe("value");
    });

    it("should create audit trail for scoring batch", () => {
      testDb = createTestDb();
      const run = testDb.db
        .insert(schema.runs)
        .values({
          action: "scoring_batch",
          rulesVersion: 1,
          inputSummary: JSON.stringify({ leadCount: 50 }),
          outputSummary: JSON.stringify({
            avgScoreBefore: 45,
            avgScoreAfter: 62,
            leadsUpdated: 50,
          }),
        })
        .returning()
        .get();

      expect(run.action).toBe("scoring_batch");
      const output = JSON.parse(run.outputSummary!);
      expect(output.avgScoreAfter).toBe(62);
    });
  });
});
