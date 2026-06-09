import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Lead status FSM: new → contacted → replied → booked → closed / nurture / lost
export const LEAD_STATUSES = [
  "new",
  "contacted",
  "replied",
  "booked",
  "closed",
  "nurture",
  "lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

// Message lifecycle: draft → queued → sent → replied → archived
export const MESSAGE_STATUSES = [
  "draft",
  "queued",
  "sent",
  "replied",
  "archived",
] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

// Message outcomes mapped to lead status
export const STATUS_MAP: Record<string, LeadStatus> = {
  replied: "replied",
  booked: "booked",
  closed: "closed",
  not_now: "nurture",
  ignored: "contacted",
};

export const EVENT_TYPES = [
  "sent",
  "reply",
  "booked",
  "closed",
  "lost",
  "note",
  "import",
  "score_change",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const CHANNELS = ["linkedin", "email", "twitter"] as const;
export type Channel = (typeof CHANNELS)[number];

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  company: text("company").notNull(),
  title: text("title"),
  email: text("email"),
  linkedinUrl: text("linkedin_url"),
  channel: text("channel").default("linkedin"),
  segment: text("segment"),
  status: text("status").default("new").notNull(),
  score: integer("score").default(0),
  scoreBreakdown: text("score_breakdown"), // JSON string of per-factor scores
  scoreRulesVersion: integer("score_rules_version"),
  companySize: text("company_size"),
  techStackMatch: text("tech_stack_match"),
  painSignalStrength: text("pain_signal_strength"),
  decisionMakerAccess: text("decision_maker_access"),
  engagementSignals: text("engagement_signals"),
  segmentFit: text("segment_fit"),
  // Enrichment / signal columns for scoring engine
  employeeCount: integer("employee_count"),
  techStack: text("tech_stack"),
  isHiringReact: integer("is_hiring_react", { mode: "boolean" }).default(false),
  hasActiveBlog: integer("has_active_blog", { mode: "boolean" }).default(false),
  recentFunding: text("recent_funding"),
  activeOnLinkedIn: integer("active_on_linkedin", { mode: "boolean" }).default(false),
  notes: text("notes"),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  leadId: integer("lead_id")
    .notNull()
    .references(() => leads.id),
  templateId: integer("template_id").references(() => templates.id),
  channel: text("channel").default("linkedin"),
  subject: text("subject"),
  body: text("body").notNull(),
  selectedHook: text("selected_hook"),
  status: text("status").default("draft").notNull(),
  outcome: text("outcome"),
  sentAt: text("sent_at"),
  followUpDate: text("follow_up_date"),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

export const templates = sqliteTable("templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  channel: text("channel").notNull(),
  segment: text("segment"),
  type: text("type").notNull(), // initial, follow-up, breakup
  variant: text("variant"), // A, B, C
  subject: text("subject"),
  body: text("body").notNull(),
  version: integer("version").default(1).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  leadId: integer("lead_id")
    .notNull()
    .references(() => leads.id),
  type: text("type").notNull(),
  detail: text("detail"),
  metadata: text("metadata"), // JSON string
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

export const runs = sqliteTable("runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  action: text("action").notNull(),
  rulesVersion: integer("rules_version"),
  inputSummary: text("input_summary"),
  outputSummary: text("output_summary"),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

export const metricSnapshots = sqliteTable("metric_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  totalLeads: integer("total_leads").default(0),
  contacted: integer("contacted").default(0),
  replied: integer("replied").default(0),
  booked: integer("booked").default(0),
  closed: integer("closed").default(0),
  avgScore: real("avg_score").default(0),
  snapshotDate: text("snapshot_date")
    .default(sql`(date('now'))`)
    .notNull(),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

export const partners = sqliteTable("partners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type"),
  contactInfo: text("contact_info"),
  notes: text("notes"),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});
