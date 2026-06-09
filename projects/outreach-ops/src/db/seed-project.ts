/**
 * Seed a new project database with default templates and scoring rules.
 *
 * This is called automatically when a new project is created via the API.
 * It inserts starter templates (A/B/C variants across channels, segments,
 * and types) and records the active scoring rules version — but NO leads,
 * so the user starts with a clean slate for real data.
 */
import { type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import scoringRulesV1 from "../../scoring_rules_v1.json";

export type SeedableDb = BetterSQLite3Database<typeof schema>;

// ── Starter templates ──────────────────────────────────────────────────────
// Same set used in the CLI seed script, minus the demo leads.
const starterTemplates: (typeof schema.templates.$inferInsert)[] = [
  {
    name: "LinkedIn Initial - Startup A",
    channel: "linkedin",
    segment: "startup",
    type: "initial",
    variant: "A",
    body: "Hi {{name}}, I noticed {{company}} is tackling {{pain_point}}. We've helped similar startups cut their delivery time by 40%. Worth a quick chat?",
    version: 1,
    isActive: true,
  },
  {
    name: "LinkedIn Initial - Startup B",
    channel: "linkedin",
    segment: "startup",
    type: "initial",
    variant: "B",
    body: "{{name}}, congrats on the recent growth at {{company}}! I work with founders scaling their dev teams. Open to connecting?",
    version: 1,
    isActive: true,
  },
  {
    name: "LinkedIn Initial - Startup C",
    channel: "linkedin",
    segment: "startup",
    type: "initial",
    variant: "C",
    body: "Hey {{name}}, I saw your post about {{hook}}. We've solved that exact problem for 3 other {{segment}} companies. Mind if I share how?",
    version: 1,
    isActive: true,
  },
  {
    name: "Email Initial - Enterprise A",
    channel: "email",
    segment: "enterprise",
    type: "initial",
    variant: "A",
    subject:
      "Quick question about {{company}}'s tech roadmap",
    body: "Hi {{name}},\n\nI've been following {{company}}'s expansion and noticed you might be evaluating new approaches to {{pain_point}}.\n\nWe recently helped [similar company] achieve [specific result]. Would you be open to a 15-minute call to explore if we could help?\n\nBest,\n{{sender}}",
    version: 1,
    isActive: true,
  },
  {
    name: "LinkedIn Follow-up",
    channel: "linkedin",
    segment: "startup",
    type: "follow_up",
    variant: "A",
    body: "Hi {{name}}, just circling back on my earlier message. I understand timing is everything — would next week work better for a quick chat?",
    version: 1,
    isActive: true,
  },
  {
    name: "Email Breakup",
    channel: "email",
    segment: "enterprise",
    type: "breakup",
    variant: "A",
    subject: "Closing the loop",
    body: "Hi {{name}},\n\nI've reached out a few times and want to respect your time. I'll close this thread, but if {{company}} ever needs help with {{pain_point}}, I'm just a reply away.\n\nWishing you all the best,\n{{sender}}",
    version: 1,
    isActive: true,
  },
];

// ── Public API ──────────────────────────────────────────────────────────────

export interface SeedResult {
  templatesInserted: number;
  scoringRulesVersion: number;
}

/**
 * Seed a fresh project database with starter templates and scoring rules.
 * Returns a summary of what was inserted.
 *
 * Safe to call on an already-seeded DB — uses INSERT so rows are appended.
 * The caller should only invoke this once at project-creation time.
 */
export function seedNewProject(db: SeedableDb): SeedResult {
  // 1. Insert starter templates
  for (const tmpl of starterTemplates) {
    db.insert(schema.templates).values(tmpl).run();
  }

  // 2. Record a "seed" run with the scoring rules version for audit trail
  db.insert(schema.runs)
    .values({
      action: "seed_project",
      rulesVersion: scoringRulesV1.version,
      inputSummary: JSON.stringify({
        templatesCount: starterTemplates.length,
        scoringRulesVersion: scoringRulesV1.version,
        scoringFactors: scoringRulesV1.factors.map((f) => f.name),
      }),
      outputSummary: `Seeded ${starterTemplates.length} templates with scoring rules v${scoringRulesV1.version}`,
    })
    .run();

  return {
    templatesInserted: starterTemplates.length,
    scoringRulesVersion: scoringRulesV1.version,
  };
}

/** Re-export for convenience — lets callers inspect what would be seeded */
export { starterTemplates, scoringRulesV1 };
