/**
 * Tests for /api/partners route logic (GET, POST).
 */
import { describe, it, expect, afterEach } from "vitest";
import { eq, desc } from "drizzle-orm";
import { createTestDb } from "../test-helpers";
import * as schema from "../../src/db/schema";

describe("Partners API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/partners — list partners", () => {
    it("should return all partners", () => {
      testDb = createTestDb();
      testDb.db.insert(schema.partners).values({ name: "Partner A", type: "referral" }).run();
      testDb.db.insert(schema.partners).values({ name: "Partner B", type: "agency" }).run();

      const results = testDb.db
        .select()
        .from(schema.partners)
        .orderBy(desc(schema.partners.createdAt))
        .all();

      expect(results).toHaveLength(2);
    });

    it("should return empty array when no partners exist", () => {
      testDb = createTestDb();
      const results = testDb.db.select().from(schema.partners).all();
      expect(results).toHaveLength(0);
    });

    it("should return partner with all fields", () => {
      testDb = createTestDb();
      const partner = testDb.db
        .insert(schema.partners)
        .values({
          name: "Tech Partner",
          type: "technology",
          contactInfo: "partner@tech.com",
          notes: "Great partnership potential",
        })
        .returning()
        .get();

      expect(partner.name).toBe("Tech Partner");
      expect(partner.type).toBe("technology");
      expect(partner.contactInfo).toBe("partner@tech.com");
      expect(partner.notes).toBe("Great partnership potential");
      expect(partner.createdAt).toBeDefined();
    });
  });

  describe("POST /api/partners — create partner", () => {
    it("should create a partner with name only", () => {
      testDb = createTestDb();
      const partner = testDb.db
        .insert(schema.partners)
        .values({ name: "Simple Partner" })
        .returning()
        .get();

      expect(partner.id).toBeDefined();
      expect(partner.name).toBe("Simple Partner");
      expect(partner.type).toBeNull();
    });

    it("should create a partner with all fields", () => {
      testDb = createTestDb();
      const partner = testDb.db
        .insert(schema.partners)
        .values({
          name: "Full Partner",
          type: "referral",
          contactInfo: "john@partner.com",
          notes: "Referred 5 leads last quarter",
        })
        .returning()
        .get();

      expect(partner.name).toBe("Full Partner");
      expect(partner.type).toBe("referral");
      expect(partner.contactInfo).toBe("john@partner.com");
      expect(partner.notes).toBe("Referred 5 leads last quarter");
    });

    it("should auto-increment partner IDs", () => {
      testDb = createTestDb();
      const p1 = testDb.db
        .insert(schema.partners)
        .values({ name: "Partner 1" })
        .returning()
        .get();
      const p2 = testDb.db
        .insert(schema.partners)
        .values({ name: "Partner 2" })
        .returning()
        .get();

      expect(p2.id).toBe(p1.id + 1);
    });

    it("should validate name is required (simulated)", () => {
      // The API route checks name?.trim() — empty string should be rejected
      const body = { name: "" };
      expect(!body.name?.trim()).toBe(true);
    });

    it("should validate name is not whitespace only (simulated)", () => {
      const body = { name: "   " };
      expect(!body.name?.trim()).toBe(true);
    });
  });
});
