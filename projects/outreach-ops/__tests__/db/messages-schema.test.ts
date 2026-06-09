import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, seedTestLead, seedTestTemplate, seedTestMessage } from "../test-helpers";
import * as schema from "../../src/db/schema";

describe("messages table — templateId FK and selectedHook JSON", () => {
  let testDb: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    testDb.cleanup();
  });

  // ── templateId FK ──────────────────────────────────────────────

  it("allows creating a message without templateId (nullable FK)", () => {
    const lead = seedTestLead(testDb.db);
    const msg = seedTestMessage(testDb.db, lead.id, {
      body: "Free-form message without template",
    });

    expect(msg.templateId).toBeNull();
    expect(msg.body).toBe("Free-form message without template");
  });

  it("stores templateId referencing a valid template", () => {
    const lead = seedTestLead(testDb.db);
    const template = seedTestTemplate(testDb.db, {
      name: "Initial Outreach A",
      channel: "linkedin",
      type: "initial",
      variant: "A",
      body: "Hi {{name}}, noticed {{company}} ships React...",
    });

    const msg = seedTestMessage(testDb.db, lead.id, {
      templateId: template.id,
      body: "Hi Test Lead, noticed Test Corp ships React...",
    });

    expect(msg.templateId).toBe(template.id);

    // Re-read from DB to confirm persistence
    const fetched = testDb.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.id, msg.id))
      .get();

    expect(fetched).toBeDefined();
    expect(fetched!.templateId).toBe(template.id);
  });

  it("enforces templateId FK constraint — rejects invalid template reference", () => {
    const lead = seedTestLead(testDb.db);

    expect(() => {
      testDb.db
        .insert(schema.messages)
        .values({
          leadId: lead.id,
          templateId: 99999, // Non-existent template
          body: "Should fail",
          status: "draft",
        })
        .run();
    }).toThrow(); // FOREIGN KEY constraint failed
  });

  it("preserves templateId when template is still referenced", () => {
    const lead = seedTestLead(testDb.db);
    const template = seedTestTemplate(testDb.db);

    const msg = seedTestMessage(testDb.db, lead.id, {
      templateId: template.id,
      body: "Based on template",
    });

    // Update template's active status (soft deactivation, not delete)
    testDb.db
      .update(schema.templates)
      .set({ isActive: false })
      .where(eq(schema.templates.id, template.id))
      .run();

    // Message still references the template
    const fetched = testDb.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.id, msg.id))
      .get();

    expect(fetched!.templateId).toBe(template.id);
  });

  it("can query messages by templateId to trace audit trail", () => {
    const lead = seedTestLead(testDb.db);
    const templateA = seedTestTemplate(testDb.db, {
      name: "Template A",
      variant: "A",
      body: "Variant A body",
    });
    const templateB = seedTestTemplate(testDb.db, {
      name: "Template B",
      variant: "B",
      body: "Variant B body",
    });

    seedTestMessage(testDb.db, lead.id, { templateId: templateA.id, body: "From A" });
    seedTestMessage(testDb.db, lead.id, { templateId: templateA.id, body: "From A again" });
    seedTestMessage(testDb.db, lead.id, { templateId: templateB.id, body: "From B" });
    seedTestMessage(testDb.db, lead.id, { body: "Freeform" }); // No template

    const msgsFromA = testDb.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.templateId, templateA.id))
      .all();

    expect(msgsFromA).toHaveLength(2);
    expect(msgsFromA.every((m) => m.templateId === templateA.id)).toBe(true);
  });

  // ── selectedHook JSON ──────────────────────────────────────────

  it("allows creating a message without selectedHook (nullable)", () => {
    const lead = seedTestLead(testDb.db);
    const msg = seedTestMessage(testDb.db, lead.id);

    expect(msg.selectedHook).toBeNull();
  });

  it("stores selectedHook as JSON string", () => {
    const lead = seedTestLead(testDb.db);
    const hookData = {
      type: "pain_signal",
      text: "Noticed your team posted about scaling challenges on LinkedIn",
      source: "linkedin_post",
      capturedAt: "2026-03-20T10:00:00Z",
    };

    const msg = seedTestMessage(testDb.db, lead.id, {
      selectedHook: JSON.stringify(hookData),
      body: "Hi, noticed your team posted about scaling challenges...",
    });

    expect(msg.selectedHook).toBe(JSON.stringify(hookData));

    // Parse back and verify structure
    const parsed = JSON.parse(msg.selectedHook!);
    expect(parsed.type).toBe("pain_signal");
    expect(parsed.text).toContain("scaling challenges");
    expect(parsed.source).toBe("linkedin_post");
    expect(parsed.capturedAt).toBe("2026-03-20T10:00:00Z");
  });

  it("round-trips complex hook JSON through database", () => {
    const lead = seedTestLead(testDb.db);
    const hookData = {
      type: "hiring_signal",
      text: "Company hiring 5 React developers",
      source: "careers_page",
      capturedAt: "2026-03-15T08:30:00Z",
      metadata: {
        jobCount: 5,
        roles: ["Senior React Dev", "React Lead"],
        urgency: "high",
      },
    };

    const msg = seedTestMessage(testDb.db, lead.id, {
      selectedHook: JSON.stringify(hookData),
      body: "I see you're hiring React engineers...",
    });

    // Re-read from DB
    const fetched = testDb.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.id, msg.id))
      .get();

    const parsed = JSON.parse(fetched!.selectedHook!);
    expect(parsed.metadata.jobCount).toBe(5);
    expect(parsed.metadata.roles).toHaveLength(2);
    expect(parsed.metadata.urgency).toBe("high");
  });

  // ── Combined: templateId + selectedHook for full audit trail ──

  it("stores both templateId and selectedHook for full outreach reproducibility", () => {
    const lead = seedTestLead(testDb.db, {
      name: "Jane Doe",
      company: "Acme Corp",
      segment: "mid-market",
    });

    const template = seedTestTemplate(testDb.db, {
      name: "React Pain Signal",
      channel: "linkedin",
      segment: "mid-market",
      type: "initial",
      variant: "A",
      version: 3,
      body: "Hi {{name}}, I noticed {{hook}}. At {{company}}, this often means...",
    });

    const hookSnapshot = {
      type: "blog_post",
      text: "Published article about migrating from Angular to React",
      source: "company_blog",
      capturedAt: "2026-03-18T14:00:00Z",
    };

    const msg = seedTestMessage(testDb.db, lead.id, {
      templateId: template.id,
      selectedHook: JSON.stringify(hookSnapshot),
      channel: "linkedin",
      body: "Hi Jane, I noticed you published an article about migrating from Angular to React. At Acme Corp, this often means...",
      status: "queued",
    });

    // Verify complete audit trail
    const fetched = testDb.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.id, msg.id))
      .get();

    expect(fetched!.templateId).toBe(template.id);
    expect(fetched!.selectedHook).toBeTruthy();

    // Can trace back to exact template version
    const usedTemplate = testDb.db
      .select()
      .from(schema.templates)
      .where(eq(schema.templates.id, fetched!.templateId!))
      .get();

    expect(usedTemplate!.version).toBe(3);
    expect(usedTemplate!.variant).toBe("A");

    // Can recover exact hook used
    const usedHook = JSON.parse(fetched!.selectedHook!);
    expect(usedHook.type).toBe("blog_post");
    expect(usedHook.capturedAt).toBe("2026-03-18T14:00:00Z");
  });

  it("supports the full message lifecycle with template + hook tracking", () => {
    const lead = seedTestLead(testDb.db);
    const template = seedTestTemplate(testDb.db);

    const hookJson = JSON.stringify({
      type: "engagement",
      text: "Liked our post about TypeScript migration",
    });

    // Create draft
    const draft = seedTestMessage(testDb.db, lead.id, {
      templateId: template.id,
      selectedHook: hookJson,
      status: "draft",
      body: "Draft message...",
    });

    expect(draft.status).toBe("draft");

    // Move to queued
    testDb.db
      .update(schema.messages)
      .set({ status: "queued" })
      .where(eq(schema.messages.id, draft.id))
      .run();

    // Move to sent
    testDb.db
      .update(schema.messages)
      .set({ status: "sent", sentAt: new Date().toISOString() })
      .where(eq(schema.messages.id, draft.id))
      .run();

    // Verify templateId and selectedHook are preserved across status transitions
    const sent = testDb.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.id, draft.id))
      .get();

    expect(sent!.status).toBe("sent");
    expect(sent!.templateId).toBe(template.id);
    expect(sent!.selectedHook).toBe(hookJson);
    expect(sent!.sentAt).toBeTruthy();
  });

  // ── Schema correctness ──────────────────────────────────────────

  it("templateId column has correct type and is nullable", () => {
    const lead = seedTestLead(testDb.db);

    // Insert with null templateId
    const msgNoTemplate = seedTestMessage(testDb.db, lead.id, { body: "No template" });
    expect(msgNoTemplate.templateId).toBeNull();

    // Insert with valid templateId
    const template = seedTestTemplate(testDb.db);
    const msgWithTemplate = seedTestMessage(testDb.db, lead.id, {
      templateId: template.id,
      body: "With template",
    });
    expect(msgWithTemplate.templateId).toBe(template.id);
  });

  it("selectedHook column accepts null, empty string, and large JSON", () => {
    const lead = seedTestLead(testDb.db);

    // Null
    const msg1 = seedTestMessage(testDb.db, lead.id, { selectedHook: null as any });
    expect(msg1.selectedHook).toBeNull();

    // Large JSON
    const largeHook = JSON.stringify({
      type: "composite",
      signals: Array.from({ length: 50 }, (_, i) => ({
        id: i,
        text: `Signal ${i}: ${"x".repeat(100)}`,
        weight: Math.random(),
      })),
    });
    const msg3 = seedTestMessage(testDb.db, lead.id, { selectedHook: largeHook, body: "Large hook" });
    const parsed = JSON.parse(msg3.selectedHook!);
    expect(parsed.signals).toHaveLength(50);
  });
});
