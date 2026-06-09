import { describe, it, expect, afterEach } from "vitest";
import { eq, count, avg } from "drizzle-orm";
import { createTestDb, seedTestLead, seedTestMessage, seedTestEvent } from "../test-helpers";
import * as schema from "../../src/db/schema";

describe("Dashboard API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  it("should compute status breakdown from leads", () => {
    testDb = createTestDb();
    seedTestLead(testDb.db, { status: "new" });
    seedTestLead(testDb.db, { status: "new" });
    seedTestLead(testDb.db, { status: "contacted" });
    seedTestLead(testDb.db, { status: "replied" });
    seedTestLead(testDb.db, { status: "booked" });

    const statusCounts = testDb.db
      .select({
        status: schema.leads.status,
        count: count(),
      })
      .from(schema.leads)
      .groupBy(schema.leads.status)
      .all();

    const statusMap: Record<string, number> = {};
    for (const sc of statusCounts) {
      statusMap[sc.status] = sc.count;
    }

    expect(statusMap.new).toBe(2);
    expect(statusMap.contacted).toBe(1);
    expect(statusMap.replied).toBe(1);
    expect(statusMap.booked).toBe(1);
    expect(statusMap.closed).toBeUndefined();
  });

  it("should compute total leads count", () => {
    testDb = createTestDb();
    for (let i = 0; i < 7; i++) {
      seedTestLead(testDb.db, { name: `Lead ${i}` });
    }

    const statusCounts = testDb.db
      .select({ count: count() })
      .from(schema.leads)
      .get();

    expect(statusCounts?.count).toBe(7);
  });

  it("should compute average score", () => {
    testDb = createTestDb();
    seedTestLead(testDb.db, { score: 60 });
    seedTestLead(testDb.db, { score: 80 });
    seedTestLead(testDb.db, { score: 40 });

    const result = testDb.db
      .select({ avgScore: avg(schema.leads.score) })
      .from(schema.leads)
      .get();

    expect(Math.round(Number(result?.avgScore))).toBe(60);
  });

  it("should count queued messages", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    seedTestMessage(testDb.db, lead.id, { status: "queued" });
    seedTestMessage(testDb.db, lead.id, { status: "queued" });
    seedTestMessage(testDb.db, lead.id, { status: "sent" });

    const result = testDb.db
      .select({ count: count() })
      .from(schema.messages)
      .where(eq(schema.messages.status, "queued"))
      .get();

    expect(result?.count).toBe(2);
  });

  it("should return empty stats for empty database", () => {
    testDb = createTestDb();

    const statusCounts = testDb.db
      .select({
        status: schema.leads.status,
        count: count(),
      })
      .from(schema.leads)
      .groupBy(schema.leads.status)
      .all();

    const totalLeads = statusCounts.reduce((sum, s) => sum + s.count, 0);
    expect(totalLeads).toBe(0);
    expect(statusCounts).toHaveLength(0);
  });

  it("should fetch recent events", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    for (let i = 0; i < 15; i++) {
      seedTestEvent(testDb.db, lead.id, { type: "note", detail: `Event ${i}` });
    }

    const recentEvents = testDb.db
      .select()
      .from(schema.events)
      .orderBy(schema.events.createdAt)
      .limit(10)
      .all();

    expect(recentEvents).toHaveLength(10);
  });
});
