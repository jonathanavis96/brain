import { describe, it, expect, afterEach } from "vitest";
import { createTestDb } from "../test-helpers";
import { seedNewProject, starterTemplates, scoringRulesV1 } from "../../src/db/seed-project";
import * as schema from "../../src/db/schema";
import { count } from "drizzle-orm";

describe("seedNewProject", () => {
  const cleanups: (() => void)[] = [];

  function makeDb() {
    const ctx = createTestDb();
    cleanups.push(ctx.cleanup);
    return ctx;
  }

  afterEach(() => {
    cleanups.forEach((fn) => fn());
    cleanups.length = 0;
  });

  it("inserts all starter templates", () => {
    const { db } = makeDb();
    seedNewProject(db);

    const rows = db.select().from(schema.templates).all();
    expect(rows).toHaveLength(starterTemplates.length);
  });

  it("does NOT insert any leads", () => {
    const { db } = makeDb();
    seedNewProject(db);

    const [result] = db.select({ total: count() }).from(schema.leads).all();
    expect(result.total).toBe(0);
  });

  it("does NOT insert any messages", () => {
    const { db } = makeDb();
    seedNewProject(db);

    const [result] = db.select({ total: count() }).from(schema.messages).all();
    expect(result.total).toBe(0);
  });

  it("does NOT insert any events", () => {
    const { db } = makeDb();
    seedNewProject(db);

    const [result] = db.select({ total: count() }).from(schema.events).all();
    expect(result.total).toBe(0);
  });

  it("records a seed_project run with scoring rules version", () => {
    const { db } = makeDb();
    seedNewProject(db);

    const runs = db.select().from(schema.runs).all();
    expect(runs).toHaveLength(1);
    expect(runs[0].action).toBe("seed_project");
    expect(runs[0].rulesVersion).toBe(scoringRulesV1.version);
  });

  it("run inputSummary contains scoring factors list", () => {
    const { db } = makeDb();
    seedNewProject(db);

    const runs = db.select().from(schema.runs).all();
    const input = JSON.parse(runs[0].inputSummary!);
    expect(input.scoringFactors).toEqual(
      scoringRulesV1.factors.map((f) => f.name)
    );
    expect(input.templatesCount).toBe(starterTemplates.length);
    expect(input.scoringRulesVersion).toBe(1);
  });

  it("returns correct seed result summary", () => {
    const { db } = makeDb();
    const result = seedNewProject(db);

    expect(result.templatesInserted).toBe(starterTemplates.length);
    expect(result.scoringRulesVersion).toBe(1);
  });

  it("seeds templates with correct channels and types", () => {
    const { db } = makeDb();
    seedNewProject(db);

    const rows = db.select().from(schema.templates).all();

    // Check we have both channels
    const channels = [...new Set(rows.map((r) => r.channel))];
    expect(channels).toContain("linkedin");
    expect(channels).toContain("email");

    // Check we have all three types
    const types = [...new Set(rows.map((r) => r.type))];
    expect(types).toContain("initial");
    expect(types).toContain("follow_up");
    expect(types).toContain("breakup");
  });

  it("all seeded templates are active with version 1", () => {
    const { db } = makeDb();
    seedNewProject(db);

    const rows = db.select().from(schema.templates).all();
    for (const row of rows) {
      expect(row.isActive).toBeTruthy();
      expect(row.version).toBe(1);
    }
  });

  it("templates include A/B/C variants for startup initial", () => {
    const { db } = makeDb();
    seedNewProject(db);

    const rows = db.select().from(schema.templates).all();
    const startupInitials = rows.filter(
      (r) => r.segment === "startup" && r.type === "initial"
    );

    expect(startupInitials).toHaveLength(3);
    const variants = startupInitials.map((r) => r.variant).sort();
    expect(variants).toEqual(["A", "B", "C"]);
  });
});
