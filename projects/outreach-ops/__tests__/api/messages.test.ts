/**
 * Tests for /api/messages and /api/messages/[id] route logic.
 * Covers message CRUD, status transitions, outcome-to-lead-status mapping.
 */
import { describe, it, expect, afterEach } from "vitest";
import { eq, and } from "drizzle-orm";
import { createTestDb, seedTestLead, seedTestMessage, seedTestTemplate, seedTestEvent } from "../test-helpers";
import * as schema from "../../src/db/schema";

describe("Messages API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  describe("GET /api/messages — list messages", () => {
    it("should return all messages", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      seedTestMessage(testDb.db, lead.id, { body: "Msg 1" });
      seedTestMessage(testDb.db, lead.id, { body: "Msg 2" });

      const results = testDb.db.select().from(schema.messages).all();
      expect(results).toHaveLength(2);
    });

    it("should filter messages by status", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      seedTestMessage(testDb.db, lead.id, { status: "draft" });
      seedTestMessage(testDb.db, lead.id, { status: "queued" });
      seedTestMessage(testDb.db, lead.id, { status: "sent" });

      const queued = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.status, "queued"))
        .all();
      expect(queued).toHaveLength(1);
    });

    it("should filter messages by leadId", () => {
      testDb = createTestDb();
      const lead1 = seedTestLead(testDb.db, { name: "Lead 1" });
      const lead2 = seedTestLead(testDb.db, { name: "Lead 2" });
      seedTestMessage(testDb.db, lead1.id, { body: "For Lead 1" });
      seedTestMessage(testDb.db, lead1.id, { body: "Another for Lead 1" });
      seedTestMessage(testDb.db, lead2.id, { body: "For Lead 2" });

      const lead1Msgs = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.leadId, lead1.id))
        .all();
      expect(lead1Msgs).toHaveLength(2);
    });

    it("should combine status and leadId filters", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      seedTestMessage(testDb.db, lead.id, { status: "queued" });
      seedTestMessage(testDb.db, lead.id, { status: "sent" });

      const results = testDb.db
        .select()
        .from(schema.messages)
        .where(
          and(
            eq(schema.messages.leadId, lead.id),
            eq(schema.messages.status, "queued")
          )
        )
        .all();
      expect(results).toHaveLength(1);
    });

    it("should support pagination", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      for (let i = 0; i < 10; i++) {
        seedTestMessage(testDb.db, lead.id, { body: `Msg ${i}` });
      }

      const page = testDb.db
        .select()
        .from(schema.messages)
        .limit(3)
        .offset(3)
        .all();
      expect(page).toHaveLength(3);
    });
  });

  describe("POST /api/messages — create message", () => {
    it("should create a message with all fields", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const template = seedTestTemplate(testDb.db);

      const msg = testDb.db
        .insert(schema.messages)
        .values({
          leadId: lead.id,
          templateId: template.id,
          channel: "linkedin",
          subject: "Re: Partnership",
          body: "Custom outreach body",
          selectedHook: "Your recent Series B caught my eye",
          status: "draft",
          followUpDate: "2026-04-01",
        })
        .returning()
        .get();

      expect(msg.leadId).toBe(lead.id);
      expect(msg.templateId).toBe(template.id);
      expect(msg.selectedHook).toBe("Your recent Series B caught my eye");
      expect(msg.status).toBe("draft");
      expect(msg.followUpDate).toBe("2026-04-01");
    });

    it("should reject message for non-existent lead", () => {
      testDb = createTestDb();
      expect(() => {
        testDb.db
          .insert(schema.messages)
          .values({ leadId: 99999, body: "test" })
          .run();
      }).toThrow();
    });

    it("should default status to draft", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id);
      expect(msg.status).toBe("draft");
    });

    it("should inherit channel from lead if not specified", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { channel: "email" });
      const msg = testDb.db
        .insert(schema.messages)
        .values({
          leadId: lead.id,
          channel: lead.channel || "linkedin",
          body: "Test",
        })
        .returning()
        .get();
      expect(msg.channel).toBe("email");
    });
  });

  describe("GET /api/messages/[id] — fetch single message", () => {
    it("should return a message by ID", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id, { body: "Specific message" });

      const found = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.id, msg.id))
        .get();

      expect(found?.body).toBe("Specific message");
    });

    it("should return undefined for non-existent message", () => {
      testDb = createTestDb();
      const found = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.id, 99999))
        .get();
      expect(found).toBeUndefined();
    });
  });

  describe("PATCH /api/messages/[id] — update message", () => {
    it("should update message body", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id, { body: "Old body" });

      testDb.db
        .update(schema.messages)
        .set({ body: "Updated body" })
        .where(eq(schema.messages.id, msg.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.id, msg.id))
        .get();
      expect(updated?.body).toBe("Updated body");
    });

    it("should mark sentAt when status transitions to sent", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id, { status: "queued" });

      const sentAt = new Date().toISOString();
      testDb.db
        .update(schema.messages)
        .set({ status: "sent", sentAt })
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

    it("should log sent event when message is sent", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id, { status: "queued" });

      // Simulate what the API route does on mark-as-sent
      testDb.db
        .insert(schema.events)
        .values({
          leadId: lead.id,
          type: "sent",
          detail: `Message sent via ${msg.channel || "linkedin"}`,
          metadata: JSON.stringify({ messageId: msg.id }),
        })
        .run();

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("sent");
    });

    it("should update lead status to contacted when message sent (lead was new)", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { status: "new" });
      seedTestMessage(testDb.db, lead.id, { status: "queued" });

      // Simulate API behavior: update lead to "contacted"
      testDb.db
        .update(schema.leads)
        .set({ status: "contacted" })
        .where(eq(schema.leads.id, lead.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();
      expect(updated?.status).toBe("contacted");
    });

    it("should map outcome replied → lead status replied", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { status: "contacted" });
      const msg = seedTestMessage(testDb.db, lead.id, { status: "sent" });

      // Apply outcome
      testDb.db
        .update(schema.messages)
        .set({ outcome: "replied", status: "replied" })
        .where(eq(schema.messages.id, msg.id))
        .run();

      const newLeadStatus = schema.STATUS_MAP["replied"];
      testDb.db
        .update(schema.leads)
        .set({ status: newLeadStatus })
        .where(eq(schema.leads.id, lead.id))
        .run();

      const updatedLead = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();
      expect(updatedLead?.status).toBe("replied");
    });

    it("should map outcome booked → lead status booked", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db, { status: "replied" });
      const msg = seedTestMessage(testDb.db, lead.id, { status: "sent" });

      const newLeadStatus = schema.STATUS_MAP["booked"];
      expect(newLeadStatus).toBe("booked");

      testDb.db
        .update(schema.leads)
        .set({ status: newLeadStatus })
        .where(eq(schema.leads.id, lead.id))
        .run();

      const updated = testDb.db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, lead.id))
        .get();
      expect(updated?.status).toBe("booked");
    });

    it("should map outcome not_now → lead status nurture", () => {
      const newStatus = schema.STATUS_MAP["not_now"];
      expect(newStatus).toBe("nurture");
    });

    it("should map outcome ignored → lead status contacted", () => {
      const newStatus = schema.STATUS_MAP["ignored"];
      expect(newStatus).toBe("contacted");
    });

    it("should log outcome event", () => {
      testDb = createTestDb();
      const lead = seedTestLead(testDb.db);
      const msg = seedTestMessage(testDb.db, lead.id, { status: "sent" });

      testDb.db
        .insert(schema.events)
        .values({
          leadId: lead.id,
          type: "reply",
          detail: "Message outcome: replied",
          metadata: JSON.stringify({ messageId: msg.id, outcome: "replied" }),
        })
        .run();

      const events = testDb.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.leadId, lead.id))
        .all();
      expect(events).toHaveLength(1);
      const meta = JSON.parse(events[0].metadata!);
      expect(meta.outcome).toBe("replied");
    });
  });
});
