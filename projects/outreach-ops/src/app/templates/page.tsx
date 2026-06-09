import { getActiveProjectDb } from "@/lib/server-project";
import { templates, CHANNELS } from "@/db/schema";
import { desc } from "drizzle-orm";
import TemplateGrid from "./TemplateGrid";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const db = await getActiveProjectDb();

  // Fetch all templates (including inactive for version history context)
  const allTemplates = await db
    .select()
    .from(templates)
    .orderBy(desc(templates.createdAt));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Editor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage outreach templates organized by segment, type, and A/B/C
            variants. Edits create new versions — history is preserved.
          </p>
        </div>
        <span className="text-sm text-gray-500">
          {allTemplates.filter((t) => t.isActive).length} active template
          {allTemplates.filter((t) => t.isActive).length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <TemplateGrid initialTemplates={allTemplates} channels={CHANNELS} />
    </div>
  );
}
