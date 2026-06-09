import { describe, it, expect, afterEach } from "vitest";
import { eq, and, lte, isNotNull } from "drizzle-orm";
import { createTestDb, seedTestLead, seedTestMessage } from "../test-helpers";
import * as schema from "../../src/db/schema";

describe("Follow-ups API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  it("should return sent messages with follow-up dates", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { name: "Alice" });
    seedTestMessage(testDb.db, lead.id, {
      status: "sent",
      followUpDate: "2026-04-01",
      body: "Follow up needed",
    });
    seedTestMessage(testDb.db, lead.id, {
      status: "sent",
      followUpDate: null, // no follow-up
      body: "No follow up",
    });
    seedTestMessage(testDb.db, lead.id, {
      status: "draft", // not sent yet
      followUpDate: "2026-04-01",
      body: "Draft",
    });

    const results = testDb.db
      .select({
        message: schema.messages,
        lead: schema.leads,
      })
      .from(schema.messages)
      .innerJoin(schema.leads, eq(schema.messages.leadId, schema.leads.id))
      .where(
        and(
          isNotNull(schema.messages.followUpDate),
          eq(schema.messages.status, "sent")
        )
      )
      .all();

    expect(results).toHaveLength(1);
    expect(results[0].message.body).toBe("Follow up needed");
    expect(results[0].lead.name).toBe("Alice");
  });

  it("should filter follow-ups by date (due before)", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    seedTestMessage(testDb.db, lead.id, {
      status: "sent",
      followUpDate: "2026-03-25",
      body: "Due soon",
    });
    seedTestMessage(testDb.db, lead.id, {
      status: "sent",
      followUpDate: "2026-04-15",
      body: "Due later",
    });

    const before = "2026-04-01";
    const results = testDb.db
      .select()
      .from(schema.messages)
      .where(
        and(
          isNotNull(schema.messages.followUpDate),
          eq(schema.messages.status, "sent"),
          lte(schema.messages.followUpDate, before)
        )
      )
      .all();

    expect(results).toHaveLength(1);
    expect(results[0].body).toBe("Due soon");
  });

  it("should return empty when no follow-ups exist", () => {
    testDb = createTestDb();

    const results = testDb.db
      .select()
      .from(schema.messages)
      .where(
        and(
          isNotNull(schema.messages.followUpDate),
          eq(schema.messages.status, "sent")
        )
      )
      .all();

    expect(results).toHaveLength(0);
  });

  it("should order follow-ups by follow_up_date asc", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db);
    seedTestMessage(testDb.db, lead.id, {
      status: "sent",
      followUpDate: "2026-04-10",
      body: "Later",
    });
    seedTestMessage(testDb.db, lead.id, {
      status: "sent",
      followUpDate: "2026-03-28",
      body: "Sooner",
    });

    const results = testDb.db
      .select()
      .from(schema.messages)
      .where(
        and(
          isNotNull(schema.messages.followUpDate),
          eq(schema.messages.status, "sent")
        )
      )
      .orderBy(schema.messages.followUpDate)
      .all();

    expect(results).toHaveLength(2);
    expect(results[0].body).toBe("Sooner");
    expect(results[1].body).toBe("Later");
  });
});
