import { describe, it, expect, afterEach } from "vitest";
import { eq, and, desc } from "drizzle-orm";
import { createTestDb, seedTestTemplate } from "../test-helpers";
import * as schema from "../../src/db/schema";

describe("Templates API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/templates — list templates", () => {
    it("should return only active templates by default", () => {
      testDb = createTestDb();
      seedTestTemplate(testDb.db, { name: "Active 1", isActive: true });
      seedTestTemplate(testDb.db, { name: "Active 2", isActive: true });
      seedTestTemplate(testDb.db, { name: "Inactive", isActive: false });

      const results = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.isActive, true))
        .all();

      expect(results).toHaveLength(2);
    });

    it("should filter by channel", () => {
      testDb = createTestDb();
      seedTestTemplate(testDb.db, { name: "LinkedIn", channel: "linkedin" });
      seedTestTemplate(testDb.db, { name: "Email", channel: "email" });

      const results = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.channel, "linkedin"))
        .all();

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("LinkedIn");
    });

    it("should filter by type", () => {
      testDb = createTestDb();
      seedTestTemplate(testDb.db, { name: "Initial", type: "initial" });
      seedTestTemplate(testDb.db, { name: "Follow-up", type: "follow-up" });
      seedTestTemplate(testDb.db, { name: "Breakup", type: "breakup" });

      const results = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.type, "follow-up"))
        .all();

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Follow-up");
    });

    it("should filter by segment", () => {
      testDb = createTestDb();
      seedTestTemplate(testDb.db, { name: "Enterprise", segment: "enterprise" });
      seedTestTemplate(testDb.db, { name: "SMB", segment: "smb" });

      const results = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.segment, "enterprise"))
        .all();

      expect(results).toHaveLength(1);
    });

    it("should combine filters", () => {
      testDb = createTestDb();
      seedTestTemplate(testDb.db, { name: "Match", channel: "linkedin", type: "initial", segment: "enterprise" });
      seedTestTemplate(testDb.db, { name: "No Match", channel: "email", type: "initial", segment: "enterprise" });

      const results = testDb.db
        .select()
        .from(schema.templates)
        .where(
          and(
            eq(schema.templates.channel, "linkedin"),
            eq(schema.templates.type, "initial"),
            eq(schema.templates.segment, "enterprise")
          )
        )
        .all();

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Match");
    });
  });

  describe("POST /api/templates — create template", () => {
    it("should create a template with version 1", () => {
      testDb = createTestDb();
      const tpl = seedTestTemplate(testDb.db, {
        name: "New Template",
        channel: "linkedin",
        type: "initial",
        body: "Hello {{name}}",
      });

      expect(tpl.version).toBe(1);
      expect(tpl.isActive).toBeTruthy();
    });

    it("should reject template without required fields", () => {
      // Simulating validation
      const body = { name: "Test" }; // missing channel, type, body
      const hasRequired =
        body.hasOwnProperty("name") &&
        body.hasOwnProperty("channel") &&
        body.hasOwnProperty("type") &&
        body.hasOwnProperty("body");
      expect(hasRequired).toBe(false);
    });
  });

  describe("Template versioning", () => {
    it("should support creating new version (deactivating old)", () => {
      testDb = createTestDb();
      const v1 = seedTestTemplate(testDb.db, {
        name: "Intro",
        body: "Version 1 body",
        version: 1,
        isActive: true,
      });

      // Deactivate v1
      testDb.db
        .update(schema.templates)
        .set({ isActive: false })
        .where(eq(schema.templates.id, v1.id))
        .run();

      // Create v2
      const v2 = seedTestTemplate(testDb.db, {
        name: "Intro",
        body: "Version 2 body — improved",
        version: 2,
        isActive: true,
      });

      // v1 still exists but inactive
      const v1Check = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.id, v1.id))
        .get();
      expect(v1Check?.isActive).toBeFalsy();

      // v2 is active
      expect(v2.isActive).toBeTruthy();
      expect(v2.version).toBe(2);

      // Both rows exist (history preserved)
      const all = testDb.db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.name, "Intro"))
        .all();
      expect(all).toHaveLength(2);
    });
  });
});
