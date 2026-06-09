import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import {
  listProjects,
  projectExists,
  isValidSlug,
  nameToSlug,
} from "@/lib/projects";
import { initializeDb, closeProjectDb, getDbPath } from "@/db";

const DATA_DIR = path.join(process.cwd(), "data");

function cleanupTestProjects(slugs: string[]) {
  for (const slug of slugs) {
    // Close any open DB connections first
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

describe("lib/projects", () => {
  const testSlugs = [
    "test-proj-a",
    "test-proj-b",
    "test-rename-old",
    "test-rename-new",
    "test-delete-me",
  ];

  beforeEach(() => {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    cleanupTestProjects(testSlugs);
  });

  afterEach(() => {
    cleanupTestProjects(testSlugs);
  });

  describe("isValidSlug", () => {
    it("accepts valid slugs", () => {
      expect(isValidSlug("my-project")).toBe(true);
      expect(isValidSlug("project123")).toBe(true);
      expect(isValidSlug("a")).toBe(true);
      expect(isValidSlug("a-b")).toBe(true);
      expect(isValidSlug("project_name")).toBe(true);
    });

    it("rejects invalid slugs", () => {
      expect(isValidSlug("")).toBe(false);
      expect(isValidSlug("-starts-with-dash")).toBe(false);
      expect(isValidSlug("ends-with-dash-")).toBe(false);
      expect(isValidSlug("has spaces")).toBe(false);
      expect(isValidSlug("UPPERCASE")).toBe(false);
      expect(isValidSlug("special!chars")).toBe(false);
    });
  });

  describe("nameToSlug", () => {
    it("converts display names to slugs", () => {
      expect(nameToSlug("Acme Corp")).toBe("acme-corp");
      expect(nameToSlug("My Project")).toBe("my-project");
      expect(nameToSlug("Hello World 123")).toBe("hello-world-123");
    });

    it("handles edge cases", () => {
      expect(nameToSlug("   spaces   ")).toBe("spaces");
      expect(nameToSlug("special!@#chars")).toBe("special-chars");
    });
  });

  describe("projectExists", () => {
    it("returns false for non-existent project", () => {
      expect(projectExists("nonexistent-project-xyz")).toBe(false);
    });

    it("returns true after project is created", () => {
      initializeDb("test-proj-a");
      expect(projectExists("test-proj-a")).toBe(true);
    });
  });

  describe("listProjects", () => {
    it("returns empty array when no projects exist", () => {
      const projects = listProjects();
      const testProjects = projects.filter((p) =>
        testSlugs.includes(p.slug)
      );
      expect(testProjects).toHaveLength(0);
    });

    it("lists created projects", () => {
      initializeDb("test-proj-a");
      initializeDb("test-proj-b");

      const projects = listProjects();
      const testProjects = projects.filter((p) =>
        testSlugs.includes(p.slug)
      );

      expect(testProjects).toHaveLength(2);
      const slugs = testProjects.map((p) => p.slug).sort();
      expect(slugs).toEqual(["test-proj-a", "test-proj-b"]);
    });

    it("returns correct project metadata", () => {
      initializeDb("test-proj-a");

      const projects = listProjects();
      const proj = projects.find((p) => p.slug === "test-proj-a");

      expect(proj).toBeDefined();
      expect(proj!.name).toBe("Test Proj A");
      expect(proj!.sizeBytes).toBeGreaterThan(0);
      expect(proj!.createdAt).toBeTruthy();
    });
  });

  describe("project file renaming", () => {
    it("can rename a project by renaming the DB file", () => {
      initializeDb("test-rename-old");
      expect(projectExists("test-rename-old")).toBe(true);

      // Close the connection before renaming
      closeProjectDb("test-rename-old");

      const oldPath = getDbPath("test-rename-old");
      const newPath = getDbPath("test-rename-new");

      // Rename the file
      fs.renameSync(oldPath, newPath);

      expect(projectExists("test-rename-old")).toBe(false);
      expect(projectExists("test-rename-new")).toBe(true);
    });
  });

  describe("project file deletion", () => {
    it("can delete a project by removing its DB file", () => {
      initializeDb("test-delete-me");
      expect(projectExists("test-delete-me")).toBe(true);

      // Close the connection before deleting
      closeProjectDb("test-delete-me");

      const dbPath = getDbPath("test-delete-me");
      // Remove DB and companions
      for (const ext of ["", "-wal", "-shm"]) {
        const filePath = `${dbPath}${ext}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      expect(projectExists("test-delete-me")).toBe(false);
    });
  });
});
