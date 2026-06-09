import { describe, it, expect, afterEach } from "vitest";
import { eq, and, desc } from "drizzle-orm";
import { createTestDb, seedTestLead, seedTestMessage, seedTestTemplate } from "../test-helpers";
import * as schema from "../../src/db/schema";

describe("Queue API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/queue — list queued messages", () => {
    it("should return only queued messages with lead data", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { name: "Alice" });
      seedTestMessage(testDb.db, lead.id, { status: "queued", body: "Hello Alice" });
      seedTestMessage(testDb.db, lead.id, { status: "draft", body: "Draft msg" });
      seedTestMessage(testDb.db, lead.id, { status: "sent", body: "Sent msg" });

      const results = testDb.db
        .select({
          message: schema.messages,
          lead: schema.leads,
        })
        .from(schema.messages)
        .innerJoin(schema.leads, eq(schema.messages.leadId, schema.leads.id))
        .where(eq(schema.messages.status, "queued"))
        .all();

      expect(results).toHaveLength(1);
      expect(results[0].message.body).toBe("Hello Alice");
      expect(results[0].lead.name).toBe("Alice");
    });

    it("should filter by custom status", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      seedTestMessage(testDb.db, lead.id, { status: "sent" });
      seedTestMessage(testDb.db, lead.id, { status: "sent" });

      const results = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.status, "sent"))
        .all();

      expect(results).toHaveLength(2);
    });
  });

  describe("POST /api/queue — add message to queue", () => {
    it("should create a queued message for a valid lead", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);

      const msg = testDb.db
        .insert(schema.messages)
        .values({
          leadId: lead.id,
          body: "Outreach message for you",
          status: "queued",
          channel: lead.channel || "linkedin",
        })
        .returning()
        .get();

      expect(msg.status).toBe("queued");
      expect(msg.leadId).toBe(lead.id);
    });

    it("should set template reference and selectedHook", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const template = seedTestTemplate(testDb.db);

      const msg = testDb.db
        .insert(schema.messages)
        .values({
          leadId: lead.id,
          templateId: template.id,
          body: "Generated from template",
          selectedHook: "Noticed your recent Series B funding",
          status: "queued",
        })
        .returning()
        .get();

      expect(msg.templateId).toBe(template.id);
      expect(msg.selectedHook).toBe("Noticed your recent Series B funding");
    });

    it("should reject message for non-existent lead (FK constraint)", () => {
      testDb = createTestDb();
      expect(() => {
        testDb.db
          .insert(schema.messages)
          .values({
            leadId: 99999,
            body: "test",
            status: "queued",
          })
          .run();
      }).toThrow();
    });

    it("should support setting follow-up date", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id, {
        status: "queued",
        followUpDate: "2026-04-07",
      });
      expect(msg.followUpDate).toBe("2026-04-07");
    });
  });

  describe("Message lifecycle", () => {
    it("should transition from queued → sent", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id, { status: "queued" });

      testDb.db
        .update(schema.messages)
        .set({
          status: "sent",
          sentAt: new Date().toISOString(),
        })
        .where(eq(schema.messages.id, msg.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.id, msg.id))
        .get();

      expect(updated?.status).toBe("sent");
      expect(updated?.sentAt).toBeDefined();
    });

    it("should transition from sent → replied with outcome", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id, { status: "sent" });

      testDb.db
        .update(schema.messages)
        .set({
          status: "replied",
          outcome: "replied",
        })
        .where(eq(schema.messages.id, msg.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.id, msg.id))
        .get();

      expect(updated?.status).toBe("replied");
      expect(updated?.outcome).toBe("replied");
    });

    it("should support archiving messages", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id, { status: "sent" });

      testDb.db
        .update(schema.messages)
        .set({ status: "archived" })
        .where(eq(schema.messages.id, msg.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.id, msg.id))
        .get();

      expect(updated?.status).toBe("archived");
    });
  });
});
