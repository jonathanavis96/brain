/**
 * Integration tests for POST /api/leads/[id]/mark-lost
 *
 * Tests the mark-as-lost logic directly against a real SQLite test DB
 * (mirrors the API route behaviour without Next.js request plumbing).
 */
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { eq, desc } from "drizzle-orm";
import { createTestDb, seedTestLead } from "../test-helpers";
import { leads, events } from "../../src/db/schema";

let ctx: ReturnType<typeof createTestDb>;

beforeEach(() => {
  // Fresh DB per test to avoid cross-contamination
  if (ctx) ctx.cleanup();
  ctx = createTestDb();
});

afterAll(() => {
  if (ctx) ctx.cleanup();
});

/**
 * Simulates the mark-lost route logic in-process:
 *  1. Checks lead exists and is not already lost
 *  2. Updates status to "lost"
 *  3. Logs a "lost" event with optional reason
 */
function markAsLost(
  db: typeof ctx.db,
  leadId: number,
  reason?: string
): { success: boolean; error?: string; lead?: typeof leads.$inferSelect } {
  const existing = db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .get();

  if (!existing) return { success: false, error: "Lead not found" };
  if (existing.status === "lost")
    return { success: false, error: "Lead is already marked as lost" };

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const previousStatus = existing.status;

  const updated = db
    .update(leads)
    .set({ status: "lost", updatedAt: now })
    .where(eq(leads.id, leadId))
    .returning()
    .get();

  const detail = reason ? `Marked as lost: ${reason}` : "Marked as lost";

  db.insert(events)
    .values({
      leadId,
      type: "lost",
      detail,
      metadata: JSON.stringify({
        previousStatus,
        reason: reason || null,
      }),
    })
    .run();

  return { success: true, lead: updated };
}

describe("Mark as Lost", () => {
  it("sets lead status to lost and logs event without reason", () => {
    const lead = seedTestLead(ctx.db, { status: "contacted" });

    const result = markAsLost(ctx.db, lead.id);

    expect(result.success).toBe(true);
    expect(result.lead!.status).toBe("lost");

    // Verify in DB
    const refreshed = ctx.db
      .select()
      .from(leads)
      .where(eq(leads.id, lead.id))
      .get();
    expect(refreshed!.status).toBe("lost");

    // Check event was logged
    const evts = ctx.db
      .select()
      .from(events)
      .where(eq(events.leadId, lead.id))
      .all();
    expect(evts).toHaveLength(1);
    expect(evts[0].type).toBe("lost");
    expect(evts[0].detail).toBe("Marked as lost");

    const meta = JSON.parse(evts[0].metadata!);
    expect(meta.previousStatus).toBe("contacted");
    expect(meta.reason).toBeNull();
  });

  it("includes reason in event detail and metadata", () => {
    const lead = seedTestLead(ctx.db, { status: "replied" });
    const reason = "Went with competitor";

    const result = markAsLost(ctx.db, lead.id, reason);

    expect(result.success).toBe(true);

    const evts = ctx.db
      .select()
      .from(events)
      .where(eq(events.leadId, lead.id))
      .all();
    expect(evts[0].detail).toBe(`Marked as lost: ${reason}`);

    const meta = JSON.parse(evts[0].metadata!);
    expect(meta.reason).toBe(reason);
    expect(meta.previousStatus).toBe("replied");
  });

  it("rejects marking an already-lost lead", () => {
    const lead = seedTestLead(ctx.db, { status: "lost" });

    const result = markAsLost(ctx.db, lead.id);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Lead is already marked as lost");

    // No event should be created
    const evts = ctx.db
      .select()
      .from(events)
      .where(eq(events.leadId, lead.id))
      .all();
    expect(evts).toHaveLength(0);
  });

  it("returns error for non-existent lead", () => {
    const result = markAsLost(ctx.db, 99999);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Lead not found");
  });

  it("works for leads in any non-lost status", () => {
    const statuses = ["new", "contacted", "replied", "booked", "nurture"] as const;

    for (const status of statuses) {
      const testCtx = createTestDb();
      const lead = seedTestLead(testCtx.db, { status });

      const result = markAsLost(testCtx.db, lead.id);
      expect(result.success).toBe(true);
      expect(result.lead!.status).toBe("lost");

      const meta = JSON.parse(
        testCtx.db
          .select()
          .from(events)
          .where(eq(events.leadId, lead.id))
          .get()!.metadata!
      );
      expect(meta.previousStatus).toBe(status);

      testCtx.cleanup();
    }
  });

  it("preserves other lead fields when marking as lost", () => {
    const lead = seedTestLead(ctx.db, {
      status: "contacted",
      name: "Jane Doe",
      company: "Acme Corp",
      email: "jane@acme.com",
      score: 75,
      notes: "Very promising lead",
    });

    markAsLost(ctx.db, lead.id, "Budget cut");

    const refreshed = ctx.db
      .select()
      .from(leads)
      .where(eq(leads.id, lead.id))
      .get()!;

    expect(refreshed.status).toBe("lost");
    expect(refreshed.name).toBe("Jane Doe");
    expect(refreshed.company).toBe("Acme Corp");
    expect(refreshed.email).toBe("jane@acme.com");
    expect(refreshed.score).toBe(75);
    expect(refreshed.notes).toBe("Very promising lead");
  });
});
