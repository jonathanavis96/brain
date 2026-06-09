import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { templates } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const db = resolveProjectDb(request);
    const { id } = await context.params;
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
    }

    const template = db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .get();

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Also fetch version history for this template family
    const conditions = [
      eq(templates.channel, template.channel),
      eq(templates.type, template.type),
    ];
    if (template.segment) {
      conditions.push(eq(templates.segment, template.segment));
    }
    if (template.variant) {
      conditions.push(eq(templates.variant, template.variant));
    }

    const history = db
      .select()
      .from(templates)
      .where(and(...conditions))
      .all();

    return NextResponse.json({ template, history });
  } catch (error) {
    console.error("GET /api/templates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/templates/[id]
 *
 * Versioned update: deactivates the old row and inserts a new row with
 * incremented version. Old versions are preserved for audit trail.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const db = resolveProjectDb(request);
    const { id } = await context.params;
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
    }

    const existing = db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .get();

    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const body = await request.json();

    // Deactivate the old version
    db.update(templates)
      .set({ isActive: false })
      .where(eq(templates.id, templateId))
      .run();

    // Insert new version with incremented version number
    const newTemplate = db
      .insert(templates)
      .values({
        name: body.name ?? existing.name,
        channel: existing.channel,
        segment: existing.segment,
        type: existing.type,
        variant: existing.variant,
        subject: body.subject !== undefined ? body.subject : existing.subject,
        body: body.body ?? existing.body,
        version: existing.version + 1,
        isActive: true,
      })
      .returning()
      .get();

    return NextResponse.json({ template: newTemplate });
  } catch (error) {
    console.error("PUT /api/templates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}
