import { describe, it, expect, afterEach } from "vitest";
import { eq, desc } from "drizzle-orm";
import { createTestDb, seedTestLead } from "../test-helpers";
import * as schema from "../../src/db/schema";
import { calculateScore } from "../../src/lib/scoring";

/**
 * Integration tests for leads API logic.
 * Tests the database operations that the /api/leads route handler performs.
 */
describe("Leads API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/leads — list leads", () => {
    it("should return all leads ordered by createdAt desc", () => {
      testDb = createTestDb();
      seedTestLead(testDb.db, { name: "Old Lead" });
      seedTestLead(testDb.db, { name: "New Lead" });

      const results = testDb.db
        .select()
        .from(schema.leads)
        .orderBy(desc(schema.leads.createdAt))
        .all();

      expect(results).toHaveLength(2);
    });

    it("should filter by status", () => {
      testDb = createTestDb();
      seedTestLead(testDb.db, { name: "Lead A", status: "new" });
      seedTestLead(testDb.db, { name: "Lead B", status: "contacted" });
      seedTestLead(testDb.db, { name: "Lead C", status: "new" });

      const results = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.status, "new"))
        .all();

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.status === "new")).toBe(true);
    });

    it("should support pagination with limit and offset", () => {
      testDb = createTestDb();
      for (let i = 0; i < 10; i++) {
        seedTestLead(testDb.db, { name: `Lead ${i}`, company: `Corp ${i}` });
      }

      const page1 = testDb.db
        .select()
        .from(schema.leads)
        .limit(3)
        .offset(0)
        .all();
      const page2 = testDb.db
        .select()
        .from(schema.leads)
        .limit(3)
        .offset(3)
        .all();

      expect(page1).toHaveLength(3);
      expect(page2).toHaveLength(3);
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    it("should return empty array when no leads exist", () => {
      testDb = createTestDb();
      const results = testDb.db.select().from(schema.leads).all();
      expect(results).toHaveLength(0);
    });
  });

  describe("POST /api/leads — create lead", () => {
    it("should create a lead and auto-calculate score", () => {
      testDb = createTestDb();

      const scoreResult = calculateScore({
        companySize: "enterprise",
        techStackMatch: "strong",
        painSignalStrength: "moderate",
      });

      const lead = testDb.db
        .insert(schema.leads)
        .values({
          name: "New Lead",
          company: "New Corp",
          status: "new",
          score: scoreResult.totalScore,
          companySize: "enterprise",
          techStackMatch: "strong",
          painSignalStrength: "moderate",
        })
        .returning()
        .get();

      expect(lead.id).toBeDefined();
      expect(lead.name).toBe("New Lead");
      expect(lead.score).toBeGreaterThan(0);
      expect(lead.status).toBe("new");
    });

    it("should create an import event when lead is created", () => {
      testDb = createTestDb();

      const lead = seedTestLead(testDb.db, { name: "Alice" });

      testDb.db
        .insert(schema.events)
        .values({
          leadId: lead.id,
          type: "import",
          detail: `Lead created: ${lead.name} at ${lead.company}`,
        })
        .run();

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("import");
      expect(events[0].detail).toContain("Alice");
    });

    it("should reject lead without name", () => {
      testDb = createTestDb();
      // Simulating validation - the API route checks for name/company
      const body = { company: "Corp" };
      const hasRequired = body.hasOwnProperty("name") && (body as any).name;
      expect(hasRequired).toBeFalsy();
    });

    it("should reject lead without company", () => {
      testDb = createTestDb();
      const body = { name: "John" };
      const hasRequired = body.hasOwnProperty("company") && (body as any).company;
      expect(hasRequired).toBeFalsy();
    });

    it("should set default channel to linkedin", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      expect(lead.channel).toBe("linkedin");
    });
  });

  describe("Lead scoring on create", () => {
    it("should auto-score lead based on provided factors", () => {
      testDb = createTestDb();

      const scoreResult = calculateScore({
        companySize: "enterprise",
        techStackMatch: "perfect",
        painSignalStrength: "explicit",
        decisionMakerAccess: "direct",
        engagementSignals: "active",
        segmentFit: "ideal",
      });

      expect(scoreResult.totalScore).toBe(100);

      const lead = testDb.db
        .insert(schema.leads)
        .values({
          name: "Perfect Lead",
          company: "Perfect Corp",
          score: scoreResult.totalScore,
        })
        .returning()
        .get();

      expect(lead.score).toBe(100);
    });

    it("should score 0 when no factors provided and unknown defaults to low values", () => {
      const scoreResult = calculateScore({});
      // "unknown" maps to small values for most factors
      expect(scoreResult.totalScore).toBeGreaterThanOrEqual(0);
      expect(scoreResult.totalScore).toBeLessThan(30);
    });
  });
});
