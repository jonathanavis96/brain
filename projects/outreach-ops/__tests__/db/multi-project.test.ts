import { describe, it, expect, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { getDb, getDbPath, initializeDb, closeProjectDb } from "@/db";
import * as schema from "@/db/schema";

const DATA_DIR = path.join(process.cwd(), "data");
const testSlugs = ["test-mp-alpha", "test-mp-beta"];

function cleanup() {
  for (const slug of testSlugs) {
    try { closeProjectDb(slug); } catch { /* ignore */ }
    for (const ext of ["", "-wal", "-shm"]) {
      const f = path.join(DATA_DIR, `${slug}.db${ext}`);
      if (fs.existsSync(f)) {
        try { fs.unlinkSync(f); } catch { /* ignore */ }
      }
    }
  }
}

describe("Multi-project database isolation", () => {
  afterEach(cleanup);

  it("creates separate DB files per project slug", () => {
    initializeDb("test-mp-alpha");
    initializeDb("test-mp-beta");

    const pathA = getDbPath("test-mp-alpha");
    const pathB = getDbPath("test-mp-beta");

    expect(pathA).not.toBe(pathB);
    expect(fs.existsSync(pathA)).toBe(true);
    expect(fs.existsSync(pathB)).toBe(true);
    expect(pathA).toContain("test-mp-alpha.db");
    expect(pathB).toContain("test-mp-beta.db");
  });

  it("maintains data isolation between projects", () => {
    const dbA = initializeDb("test-mp-alpha");
    const dbB = initializeDb("test-mp-beta");

    // Insert a lead into project alpha
    dbA.insert(schema.leads).values({
      name: "Alpha Lead",
      company: "Alpha Corp",
      status: "new",
    }).run();

    // Insert a different lead into project beta
    dbB.insert(schema.leads).values({
      name: "Beta Lead",
      company: "Beta Corp",
      status: "contacted",
    }).run();

    // Verify isolation
    const alphaLeads = dbA.select().from(schema.leads).all();
    const betaLeads = dbB.select().from(schema.leads).all();

    expect(alphaLeads).toHaveLength(1);
    expect(alphaLeads[0].name).toBe("Alpha Lead");
    expect(alphaLeads[0].company).toBe("Alpha Corp");

    expect(betaLeads).toHaveLength(1);
    expect(betaLeads[0].name).toBe("Beta Lead");
    expect(betaLeads[0].company).toBe("Beta Corp");
  });

  it("getDb returns a working connection for any project", () => {
    initializeDb("test-mp-alpha");
    const db = getDb("test-mp-alpha");

    db.insert(schema.leads).values({
      name: "Test",
      company: "Test Co",
      status: "new",
    }).run();

    const results = db.select().from(schema.leads).all();
    expect(results).toHaveLength(1);
  });

  it("switching project connections does not leak data", () => {
    const dbA = initializeDb("test-mp-alpha");
    const dbB = initializeDb("test-mp-beta");

    // Work with project A
    dbA.insert(schema.leads).values({
      name: "A-Only",
      company: "A Corp",
      status: "new",
    }).run();

    // Switch to project B
    const leadsInB = dbB.select().from(schema.leads).all();
    expect(leadsInB).toHaveLength(0); // B should be empty

    // Switch back to A
    const freshDbA = getDb("test-mp-alpha");
    const leadsInA = freshDbA.select().from(schema.leads).all();
    expect(leadsInA).toHaveLength(1);
    expect(leadsInA[0].name).toBe("A-Only");
  });
});
