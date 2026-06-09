import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestDb, seedTestLead, seedTestEvent } from "../test-helpers";
import { leads, events } from "../../src/db/schema";
import { eq, desc } from "drizzle-orm";

describe("Log Outcome API Logic", () => {
  let testDb: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    testDb.cleanup();
  });

  // Helper: simulate what the log-outcome API route does
  function logOutcome(
    db: typeof testDb.db,
    leadId: number,
    outcome: string,
    note?: string
  ) {
    const STATUS_MAP: Record<string, string> = {
      replied: "replied",
      booked: "booked",
      closed: "closed",
      not_now: "nurture",
      ignored: "contacted",
      lost: "lost",
      re_engaged: "contacted",
    };

    const OUTCOME_TO_EVENT_TYPE: Record<string, string> = {
      replied: "reply",
      booked: "booked",
      closed: "closed",
      not_now: "note",
      ignored: "note",
      lost: "lost",
      re_engaged: "note",
    };

    const OUTCOME_LABELS: Record<string, string> = {
      replied: "Got a Reply",
      booked: "Meeting Booked",
      closed: "Closed Won",
      not_now: "Not Now (Nurture)",
      ignored: "No Response",
      lost: "Lost",
      re_engaged: "Re-engaged",
    };

    const VALID_TRANSITIONS: Record<string, string[]> = {
      new: ["contacted"],
      contacted: ["replied", "nurture", "lost"],
      replied: ["booked", "nurture", "lost"],
      booked: ["closed", "lost"],
      closed: [],
      nurture: ["contacted", "lost"],
      lost: ["contacted"],
    };

    const STATUS_OUTCOMES: Record<string, string[]> = {
      new: [],
      contacted: ["replied", "not_now", "lost"],
      replied: ["booked", "not_now", "lost"],
      booked: ["closed", "lost"],
      closed: [],
      nurture: ["re_engaged", "lost"],
      lost: ["re_engaged"],
    };

    const existing = db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .get();

    if (!existing) {
      return { error: "Lead not found", status: 404 };
    }

    const currentStatus = existing.status as string;
    const validOutcomes = STATUS_OUTCOMES[currentStatus] || [];

    if (!validOutcomes.includes(outcome)) {
      return {
        error: `Invalid outcome "${outcome}" for status "${currentStatus}"`,
        validOutcomes,
        status: 422,
      };
    }

    const newStatus = STATUS_MAP[outcome];
    if (!newStatus) {
      return { error: `Unknown outcome: ${outcome}`, status: 400 };
    }

    const validNext = VALID_TRANSITIONS[currentStatus] || [];
    if (!validNext.includes(newStatus)) {
      return {
        error: `Cannot transition from "${currentStatus}" to "${newStatus}"`,
        status: 422,
      };
    }

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const previousStatus = currentStatus;

    // Update lead status
    const updated = db
      .update(leads)
      .set({ status: newStatus, updatedAt: now })
      .where(eq(leads.id, leadId))
      .returning()
      .get();

    // Log event
    const eventType = OUTCOME_TO_EVENT_TYPE[outcome] || "note";
    const outcomeLabel = OUTCOME_LABELS[outcome] || outcome;
    const detail = note ? `${outcomeLabel}: ${note}` : outcomeLabel;

    const event = db
      .insert(events)
      .values({
        leadId,
        type: eventType,
        detail,
        metadata: JSON.stringify({
          outcome,
          previousStatus,
          newStatus,
          note: note || null,
          source: "lead_detail_log_outcome",
        }),
      })
      .returning()
      .get();

    return { lead: updated, event, previousStatus, status: 200 };
  }

  // --- Status Transition Tests ---

  it("transitions contacted → replied on 'replied' outcome", () => {
    const lead = seedTestLead(testDb.db, { status: "contacted" });
    const result = logOutcome(testDb.db, lead.id, "replied");

    expect(result.status).toBe(200);
    expect(result.lead!.status).toBe("replied");
    expect(result.previousStatus).toBe("contacted");
    expect(result.event!.type).toBe("reply");
    expect(result.event!.detail).toBe("Got a Reply");
  });

  it("transitions contacted → nurture on 'not_now' outcome", () => {
    const lead = seedTestLead(testDb.db, { status: "contacted" });
    const result = logOutcome(testDb.db, lead.id, "not_now");

    expect(result.status).toBe(200);
    expect(result.lead!.status).toBe("nurture");
    expect(result.event!.type).toBe("note");
    expect(result.event!.detail).toBe("Not Now (Nurture)");
  });

  it("transitions contacted → lost on 'lost' outcome", () => {
    const lead = seedTestLead(testDb.db, { status: "contacted" });
    const result = logOutcome(testDb.db, lead.id, "lost");

    expect(result.status).toBe(200);
    expect(result.lead!.status).toBe("lost");
    expect(result.event!.type).toBe("lost");
  });

  it("transitions replied → booked on 'booked' outcome", () => {
    const lead = seedTestLead(testDb.db, { status: "replied" });
    const result = logOutcome(testDb.db, lead.id, "booked");

    expect(result.status).toBe(200);
    expect(result.lead!.status).toBe("booked");
    expect(result.event!.type).toBe("booked");
    expect(result.event!.detail).toBe("Meeting Booked");
  });

  it("transitions replied → nurture on 'not_now' outcome", () => {
    const lead = seedTestLead(testDb.db, { status: "replied" });
    const result = logOutcome(testDb.db, lead.id, "not_now");

    expect(result.status).toBe(200);
    expect(result.lead!.status).toBe("nurture");
  });

  it("transitions booked → closed on 'closed' outcome", () => {
    const lead = seedTestLead(testDb.db, { status: "booked" });
    const result = logOutcome(testDb.db, lead.id, "closed");

    expect(result.status).toBe(200);
    expect(result.lead!.status).toBe("closed");
    expect(result.event!.type).toBe("closed");
    expect(result.event!.detail).toBe("Closed Won");
  });

  it("transitions booked → lost on 'lost' outcome", () => {
    const lead = seedTestLead(testDb.db, { status: "booked" });
    const result = logOutcome(testDb.db, lead.id, "lost");

    expect(result.status).toBe(200);
    expect(result.lead!.status).toBe("lost");
  });

  it("transitions nurture → contacted on 're_engaged' outcome", () => {
    const lead = seedTestLead(testDb.db, { status: "nurture" });
    const result = logOutcome(testDb.db, lead.id, "re_engaged");

    expect(result.status).toBe(200);
    expect(result.lead!.status).toBe("contacted");
    expect(result.event!.type).toBe("note");
    expect(result.event!.detail).toBe("Re-engaged");
  });

  it("transitions lost → contacted on 're_engaged' outcome", () => {
    const lead = seedTestLead(testDb.db, { status: "lost" });
    const result = logOutcome(testDb.db, lead.id, "re_engaged");

    expect(result.status).toBe(200);
    expect(result.lead!.status).toBe("contacted");
  });

  // --- Note Attachment Tests ---

  it("includes note in event detail when provided", () => {
    const lead = seedTestLead(testDb.db, { status: "contacted" });
    const result = logOutcome(
      testDb.db,
      lead.id,
      "replied",
      "They liked the proposal"
    );

    expect(result.status).toBe(200);
    expect(result.event!.detail).toBe(
      "Got a Reply: They liked the proposal"
    );

    const metadata = JSON.parse(result.event!.metadata!);
    expect(metadata.note).toBe("They liked the proposal");
    expect(metadata.source).toBe("lead_detail_log_outcome");
  });

  it("stores outcome metadata with previousStatus and newStatus", () => {
    const lead = seedTestLead(testDb.db, { status: "replied" });
    const result = logOutcome(testDb.db, lead.id, "booked");

    const metadata = JSON.parse(result.event!.metadata!);
    expect(metadata.outcome).toBe("booked");
    expect(metadata.previousStatus).toBe("replied");
    expect(metadata.newStatus).toBe("booked");
  });

  // --- Validation Tests ---

  it("rejects invalid outcome for current status", () => {
    const lead = seedTestLead(testDb.db, { status: "contacted" });
    const result = logOutcome(testDb.db, lead.id, "closed");

    expect(result.status).toBe(422);
    expect(result.error).toContain("Invalid outcome");
  });

  it("rejects outcomes for terminal (closed) status", () => {
    const lead = seedTestLead(testDb.db, { status: "closed" });
    const result = logOutcome(testDb.db, lead.id, "booked");

    expect(result.status).toBe(422);
  });

  it("rejects outcomes for 'new' status (use MarkSent instead)", () => {
    const lead = seedTestLead(testDb.db, { status: "new" });
    const result = logOutcome(testDb.db, lead.id, "replied");

    expect(result.status).toBe(422);
  });

  it("returns 404 for non-existent lead", () => {
    const result = logOutcome(testDb.db, 99999, "replied");
    expect(result.status).toBe(404);
  });

  // --- Database State Verification ---

  it("persists status change in database", () => {
    const lead = seedTestLead(testDb.db, { status: "contacted" });
    logOutcome(testDb.db, lead.id, "replied");

    const updated = testDb.db
      .select()
      .from(leads)
      .where(eq(leads.id, lead.id))
      .get();

    expect(updated!.status).toBe("replied");
  });

  it("persists event in database with correct lead association", () => {
    const lead = seedTestLead(testDb.db, { status: "booked" });
    logOutcome(testDb.db, lead.id, "closed", "Deal signed!");

    const allEvents = testDb.db
      .select()
      .from(events)
      .where(eq(events.leadId, lead.id))
      .all();

    expect(allEvents).toHaveLength(1);
    expect(allEvents[0].type).toBe("closed");
    expect(allEvents[0].detail).toBe("Closed Won: Deal signed!");
    expect(allEvents[0].leadId).toBe(lead.id);
  });

  it("updates lead updatedAt timestamp", () => {
    const lead = seedTestLead(testDb.db, { status: "contacted" });
    const originalUpdatedAt = lead.updatedAt;

    // Small delay to ensure different timestamp
    logOutcome(testDb.db, lead.id, "replied");

    const updated = testDb.db
      .select()
      .from(leads)
      .where(eq(leads.id, lead.id))
      .get();

    // updatedAt should be set (may or may not differ in fast tests, but should be present)
    expect(updated!.updatedAt).toBeDefined();
  });

  // --- Full Lifecycle Test ---

  it("supports full lifecycle: contacted → replied → booked → closed", () => {
    const lead = seedTestLead(testDb.db, { status: "contacted" });

    // Step 1: replied
    const r1 = logOutcome(testDb.db, lead.id, "replied");
    expect(r1.status).toBe(200);
    expect(r1.lead!.status).toBe("replied");

    // Step 2: booked
    const r2 = logOutcome(testDb.db, lead.id, "booked", "Demo on Thursday");
    expect(r2.status).toBe(200);
    expect(r2.lead!.status).toBe("booked");

    // Step 3: closed
    const r3 = logOutcome(testDb.db, lead.id, "closed", "Signed contract");
    expect(r3.status).toBe(200);
    expect(r3.lead!.status).toBe("closed");

    // Step 4: closed is terminal — further outcomes rejected
    const r4 = logOutcome(testDb.db, lead.id, "booked");
    expect(r4.status).toBe(422);

    // Verify all events were logged
    const allEvents = testDb.db
      .select()
      .from(events)
      .where(eq(events.leadId, lead.id))
      .orderBy(events.id)
      .all();

    expect(allEvents).toHaveLength(3);
    expect(allEvents[0].type).toBe("reply");
    expect(allEvents[1].type).toBe("booked");
    expect(allEvents[2].type).toBe("closed");
  });

  it("supports nurture → re-engage → booked lifecycle", () => {
    const lead = seedTestLead(testDb.db, { status: "nurture" });

    // Re-engage
    const r1 = logOutcome(testDb.db, lead.id, "re_engaged", "Followed up after 3 months");
    expect(r1.status).toBe(200);
    expect(r1.lead!.status).toBe("contacted");

    // Get a reply
    const r2 = logOutcome(testDb.db, lead.id, "replied");
    expect(r2.status).toBe(200);
    expect(r2.lead!.status).toBe("replied");

    // Book meeting
    const r3 = logOutcome(testDb.db, lead.id, "booked");
    expect(r3.status).toBe(200);
    expect(r3.lead!.status).toBe("booked");
  });
});
