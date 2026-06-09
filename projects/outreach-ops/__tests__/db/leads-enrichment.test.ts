import { describe, it, expect, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, seedTestLead } from "../test-helpers";
import * as schema from "../../src/db/schema";

describe("Leads Enrichment Columns", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  it("should create a lead with all enrichment fields", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, {
      name: "Enriched Lead",
      company: "TechCo",
      employeeCount: 250,
      techStack: "React,TypeScript,Node.js",
      isHiringReact: true,
      hasActiveBlog: true,
      recentFunding: "Series A $10M",
      activeOnLinkedIn: true,
    });

    expect(lead.employeeCount).toBe(250);
    expect(lead.techStack).toBe("React,TypeScript,Node.js");
    expect(lead.isHiringReact).toBe(true);
    expect(lead.hasActiveBlog).toBe(true);
    expect(lead.recentFunding).toBe("Series A $10M");
    expect(lead.activeOnLinkedIn).toBe(true);
  });

  it("should default boolean enrichment fields to false", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, {
      name: "Minimal Lead",
      company: "BasicCo",
    });

    // Boolean columns default to false (0 in SQLite)
    expect(lead.isHiringReact).toBeFalsy();
    expect(lead.hasActiveBlog).toBeFalsy();
    expect(lead.activeOnLinkedIn).toBeFalsy();
    // Nullable fields default to null
    expect(lead.employeeCount).toBeNull();
    expect(lead.techStack).toBeNull();
    expect(lead.recentFunding).toBeNull();
  });

  it("should update enrichment fields on an existing lead", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, {
      name: "Updatable Lead",
      company: "UpdateCo",
      employeeCount: 50,
      isHiringReact: false,
    });

    expect(lead.employeeCount).toBe(50);
    expect(lead.isHiringReact).toBeFalsy();

    testDb.db
      .update(schema.leads)
      .set({
        employeeCount: 200,
        isHiringReact: true,
        techStack: "React,Next.js,Tailwind",
        recentFunding: "Series B $25M",
      })
      .where(eq(schema.leads.id, lead.id))
      .run();

    const updated = testDb.db
      .select()
      .from(schema.leads)
      .where(eq(schema.leads.id, lead.id))
      .get();

    expect(updated?.employeeCount).toBe(200);
    expect(updated?.isHiringReact).toBe(true);
    expect(updated?.techStack).toBe("React,Next.js,Tailwind");
    expect(updated?.recentFunding).toBe("Series B $25M");
  });

  it("should store employeeCount as an integer", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, {
      name: "Big Corp Lead",
      company: "MegaCorp",
      employeeCount: 10000,
    });

    expect(typeof lead.employeeCount).toBe("number");
    expect(lead.employeeCount).toBe(10000);
  });

  it("should query leads by enrichment boolean fields", () => {
    testDb = createTestDb();
    seedTestLead(testDb.db, {
      name: "Hiring React",
      company: "ReactCo",
      isHiringReact: true,
    });
    seedTestLead(testDb.db, {
      name: "Not Hiring React",
      company: "JavaCo",
      isHiringReact: false,
    });
    seedTestLead(testDb.db, {
      name: "Also Hiring React",
      company: "NextCo",
      isHiringReact: true,
    });

    const hiringReact = testDb.db
      .select()
      .from(schema.leads)
      .where(eq(schema.leads.isHiringReact, true))
      .all();

    expect(hiringReact).toHaveLength(2);
    expect(hiringReact.map((l) => l.company).sort()).toEqual(["NextCo", "ReactCo"]);
  });

  it("should coexist with existing scoring rubric fields", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, {
      name: "Full Lead",
      company: "FullCo",
      // Scoring rubric fields
      companySize: "enterprise",
      techStackMatch: "perfect",
      painSignalStrength: "explicit",
      decisionMakerAccess: "direct",
      engagementSignals: "active",
      segmentFit: "ideal",
      score: 95,
      // Enrichment fields
      employeeCount: 3000,
      techStack: "React,TypeScript,GraphQL,AWS",
      isHiringReact: true,
      hasActiveBlog: true,
      recentFunding: "Series C $100M",
      activeOnLinkedIn: true,
    });

    expect(lead.companySize).toBe("enterprise");
    expect(lead.score).toBe(95);
    expect(lead.employeeCount).toBe(3000);
    expect(lead.techStack).toBe("React,TypeScript,GraphQL,AWS");
    expect(lead.isHiringReact).toBe(true);
    expect(lead.hasActiveBlog).toBe(true);
    expect(lead.recentFunding).toBe("Series C $100M");
    expect(lead.activeOnLinkedIn).toBe(true);
  });

  it("should support techStack as comma-separated string", () => {
    testDb = createTestDb();
    const techStack = "React,Next.js,TypeScript,Tailwind,PostgreSQL";
    const lead = seedTestLead(testDb.db, {
      name: "Tech Lead",
      company: "StackCo",
      techStack,
    });

    expect(lead.techStack).toBe(techStack);
    expect(lead.techStack!.split(",")).toHaveLength(5);
    expect(lead.techStack!.split(",")).toContain("React");
  });
});
