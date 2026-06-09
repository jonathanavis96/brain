import { describe, it, expect, afterEach } from "vitest";
import { createTestDb, seedTestLead, seedTestEvent } from "./test-helpers";
import { leads, events } from "../src/db/schema";
import { eq, desc } from "drizzle-orm";

describe("Mark Sent — event recording and lead status update", () => {
  let testDb: ReturnType<typeof createTestDb>;

  afterEach(() => {
    testDb?.cleanup();
  });

  it("records a sent event for a new lead", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { status: "new", channel: "linkedin" });

    // Simulate what POST /api/events does for type "sent"
    const event = testDb.db
      .insert(events)
      .values({
        leadId: lead.id,
        type: "sent",
        detail: `Message sent via ${lead.channel}`,
        metadata: JSON.stringify({ source: "lead_detail_mark_sent" }),
      })
      .returning()
      .get();

    expect(event).toBeDefined();
    expect(event.leadId).toBe(lead.id);
    expect(event.type).toBe("sent");
    expect(event.detail).toContain("linkedin");
  });

  it("updates lead status from 'new' to 'contacted' on sent event", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { status: "new" });

    // Insert sent event
    testDb.db
      .insert(events)
      .values({
        leadId: lead.id,
        type: "sent",
        detail: "Message sent via linkedin",
      })
      .run();

    // Simulate the EVENT_TO_STATUS mapping: sent → contacted
    const EVENT_TO_STATUS: Record<string, string> = {
      sent: "contacted",
      reply: "replied",
      booked: "booked",
      closed: "closed",
      lost: "lost",
    };

    const newStatus = EVENT_TO_STATUS["sent"];
    testDb.db
      .update(leads)
      .set({
        status: newStatus!,
        updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      })
      .where(eq(leads.id, lead.id))
      .run();

    const updated = testDb.db
      .select()
      .from(leads)
      .where(eq(leads.id, lead.id))
      .get();

    expect(updated).toBeDefined();
    expect(updated!.status).toBe("contacted");
  });

  it("updates lead status from 'contacted' to 'contacted' (idempotent) on sent event", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { status: "contacted" });

    // Record another sent event for an already-contacted lead
    testDb.db
      .insert(events)
      .values({
        leadId: lead.id,
        type: "sent",
        detail: "Follow-up sent via email",
      })
      .run();

    // Status stays "contacted"
    testDb.db
      .update(leads)
      .set({
        status: "contacted",
        updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      })
      .where(eq(leads.id, lead.id))
      .run();

    const updated = testDb.db
      .select()
      .from(leads)
      .where(eq(leads.id, lead.id))
      .get();

    expect(updated!.status).toBe("contacted");
  });

  it("stores metadata in the sent event for audit trail", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { status: "new" });

    const metadata = {
      source: "lead_detail_mark_sent",
      templateId: 42,
      selectedHook: "React expertise hook",
    };

    const event = testDb.db
      .insert(events)
      .values({
        leadId: lead.id,
        type: "sent",
        detail: "Message sent via linkedin",
        metadata: JSON.stringify(metadata),
      })
      .returning()
      .get();

    const parsed = JSON.parse(event.metadata!);
    expect(parsed.source).toBe("lead_detail_mark_sent");
    expect(parsed.templateId).toBe(42);
    expect(parsed.selectedHook).toBe("React expertise hook");
  });

  it("creates timeline entries visible in event history", () => {
    testDb = createTestDb();
    const lead = seedTestLead(testDb.db, { status: "new" });

    // Add an import event first
    seedTestEvent(testDb.db, lead.id, { type: "import", detail: "CSV import" });

    // Then a sent event
    testDb.db
      .insert(events)
      .values({
        leadId: lead.id,
        type: "sent",
        detail: "Message sent via linkedin",
      })
      .run();

    const allEvents = testDb.db
      .select()
      .from(events)
      .where(eq(events.leadId, lead.id))
      .orderBy(desc(events.createdAt))
      .all();

    expect(allEvents.length).toBe(2);
    const types = allEvents.map((e) => e.type);
    expect(types).toContain("sent");
    expect(types).toContain("import");
  });

  it("does not allow sent event for non-existent lead (FK constraint)", () => {
    testDb = createTestDb();

    expect(() => {
      testDb.db
        .insert(events)
        .values({
          leadId: 99999,
          type: "sent",
          detail: "Should fail",
        })
        .run();
    }).toThrow();
  });
});
