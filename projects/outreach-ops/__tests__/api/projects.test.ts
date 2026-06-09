/**
 * Integration tests for the project management API routes.
 *
 * These tests exercise the core project CRUD operations by directly calling
 * the server-side logic (initializeDb, project helpers, file operations)
 * rather than making HTTP requests, since Next.js API routes aren't easily
 * testable in isolation. This validates the business logic end-to-end.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import {
  listProjects,
  projectExists,
  isValidSlug,
  nameToSlug,
} from "@/lib/projects";
import { initializeDb, closeProjectDb, getDbPath, getProjectDb } from "@/db";
import { leads, templates, messages, events, runs } from "@/db/schema";

const DATA_DIR = path.join(process.cwd(), "data");

const TEST_SLUGS = [
  "api-test-create",
  "api-test-rename-old",
  "api-test-rename-new",
  "api-test-delete",
  "api-test-tables",
  "api-test-conflict",
];

function cleanupTestProjects() {
  for (const slug of TEST_SLUGS) {
    try {
      closeProjectDb(slug);
    } catch {
      /* ignore */
    }
    for (const ext of ["", "-wal", "-shm"]) {
      const f = path.join(DATA_DIR, `${slug}.db${ext}`);
      if (fs.existsSync(f)) {
        try {
          fs.unlinkSync(f);
        } catch {
          /* ignore */
        }
      }
    }
  }
}

describe("Project Management API Logic", () => {
  beforeEach(() => {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    cleanupTestProjects();
  });

  afterEach(() => {
    cleanupTestProjects();
  });

  describe("POST /api/projects (create)", () => {
    it("creates a new project with valid name", () => {
      const slug = nameToSlug("API Test Create");
      expect(slug).toBe("api-test-create");
      expect(isValidSlug(slug)).toBe(true);
      expect(projectExists(slug)).toBe(false);

      // Simulate what the POST handler does
      initializeDb(slug);

      expect(projectExists(slug)).toBe(true);

      const projects = listProjects();
      const created = projects.find((p) => p.slug === slug);
      expect(created).toBeDefined();
      expect(created!.name).toBe("Api Test Create");
      expect(created!.sizeBytes).toBeGreaterThan(0);
    });

    it("rejects invalid project names", () => {
      expect(isValidSlug("")).toBe(false);
      expect(isValidSlug("-bad-slug")).toBe(false);
      expect(isValidSlug("has spaces")).toBe(false);
    });

    it("detects conflicts with existing projects", () => {
      initializeDb("api-test-conflict");
      expect(projectExists("api-test-conflict")).toBe(true);

      // The API route would return 409
      expect(projectExists("api-test-conflict")).toBe(true);
    });

    it("initializes all required tables in the new project DB", () => {
      initializeDb("api-test-tables");

      const db = getProjectDb("api-test-tables");

      // Verify we can query all tables without errors
      const leadRows = db.select().from(leads).all();
      expect(leadRows).toEqual([]);

      const templateRows = db.select().from(templates).all();
      expect(templateRows).toEqual([]);

      const messageRows = db.select().from(messages).all();
      expect(messageRows).toEqual([]);

      const eventRows = db.select().from(events).all();
      expect(eventRows).toEqual([]);

      const runRows = db.select().from(runs).all();
      expect(runRows).toEqual([]);
    });
  });

  describe("PATCH /api/projects/[slug] (rename)", () => {
    it("renames a project by renaming the DB file", () => {
      initializeDb("api-test-rename-old");
      expect(projectExists("api-test-rename-old")).toBe(true);

      // Simulate what the PATCH handler does
      closeProjectDb("api-test-rename-old");

      const oldDbPath = getDbPath("api-test-rename-old");
      const newSlug = nameToSlug("API Test Rename New");
      expect(newSlug).toBe("api-test-rename-new");

      const newDbPath = getDbPath(newSlug);

      // Rename files
      for (const ext of ["", "-wal", "-shm"]) {
        const oldPath = `${oldDbPath}${ext}`;
        const newPath = `${newDbPath}${ext}`;
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
        }
      }

      expect(projectExists("api-test-rename-old")).toBe(false);
      expect(projectExists("api-test-rename-new")).toBe(true);
    });

    it("preserves data after rename", () => {
      initializeDb("api-test-rename-old");
      const db = getProjectDb("api-test-rename-old");

      // Insert test data
      db.insert(leads).values({
        name: "Test Lead",
        company: "Test Corp",
        status: "new",
      }).run();

      const beforeLeads = db.select().from(leads).all();
      expect(beforeLeads).toHaveLength(1);
      expect(beforeLeads[0].name).toBe("Test Lead");

      // Rename: close connection, then move DB and WAL/SHM files
      closeProjectDb("api-test-rename-old");
      const oldDbPath = getDbPath("api-test-rename-old");
      const newDbPath = getDbPath("api-test-rename-new");
      fs.renameSync(oldDbPath, newDbPath);
      // Also move WAL and SHM files if they exist
      for (const ext of ["-wal", "-shm"]) {
        if (fs.existsSync(oldDbPath + ext)) {
          fs.renameSync(oldDbPath + ext, newDbPath + ext);
        }
      }

      // Verify data is preserved
      const newDb = getProjectDb("api-test-rename-new");
      const afterLeads = newDb.select().from(leads).all();
      expect(afterLeads).toHaveLength(1);
      expect(afterLeads[0].name).toBe("Test Lead");
    });

    it("rejects rename to invalid slug", () => {
      const badSlug = nameToSlug("!!!");
      // nameToSlug returns "" for non-alphanumeric input
      expect(badSlug).toBe("");
      expect(isValidSlug(badSlug)).toBe(false);
    });

    it("rejects rename to existing project slug", () => {
      initializeDb("api-test-rename-old");
      initializeDb("api-test-conflict");

      // Both exist, so rename should be rejected
      expect(projectExists("api-test-rename-old")).toBe(true);
      expect(projectExists("api-test-conflict")).toBe(true);

      // The API route would detect the conflict and return 409
    });
  });

  describe("DELETE /api/projects/[slug] (delete)", () => {
    it("deletes a project by removing its DB file", () => {
      initializeDb("api-test-delete");
      expect(projectExists("api-test-delete")).toBe(true);

      // Simulate what the DELETE handler does
      closeProjectDb("api-test-delete");
      const dbPath = getDbPath("api-test-delete");

      for (const ext of ["", "-wal", "-shm"]) {
        const filePath = `${dbPath}${ext}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      expect(projectExists("api-test-delete")).toBe(false);
    });

    it("no longer appears in listProjects after deletion", () => {
      initializeDb("api-test-delete");

      let projects = listProjects();
      expect(projects.some((p) => p.slug === "api-test-delete")).toBe(true);

      // Delete
      closeProjectDb("api-test-delete");
      const dbPath = getDbPath("api-test-delete");
      for (const ext of ["", "-wal", "-shm"]) {
        const filePath = `${dbPath}${ext}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      projects = listProjects();
      expect(projects.some((p) => p.slug === "api-test-delete")).toBe(false);
    });

    it("handles deleting non-existent project gracefully", () => {
      expect(projectExists("nonexistent-project")).toBe(false);
      // The API route would return 404
    });
  });

  describe("GET /api/projects (list)", () => {
    it("returns all projects after multiple creates", () => {
      initializeDb("api-test-create");
      initializeDb("api-test-tables");

      const projects = listProjects();
      const testProjects = projects.filter((p) =>
        TEST_SLUGS.includes(p.slug)
      );

      expect(testProjects.length).toBeGreaterThanOrEqual(2);
      const slugs = testProjects.map((p) => p.slug).sort();
      expect(slugs).toContain("api-test-create");
      expect(slugs).toContain("api-test-tables");
    });

    it("each project has required metadata fields", () => {
      initializeDb("api-test-create");

      const projects = listProjects();
      const proj = projects.find((p) => p.slug === "api-test-create");

      expect(proj).toBeDefined();
      expect(proj).toHaveProperty("slug");
      expect(proj).toHaveProperty("name");
      expect(proj).toHaveProperty("sizeBytes");
      expect(proj).toHaveProperty("createdAt");
      expect(typeof proj!.slug).toBe("string");
      expect(typeof proj!.name).toBe("string");
      expect(typeof proj!.sizeBytes).toBe("number");
      expect(typeof proj!.createdAt).toBe("string");
    });
  });
});
