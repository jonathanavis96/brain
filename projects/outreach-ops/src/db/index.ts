/**
 * Dynamic per-project database connection factory.
 *
 * Each project gets its own SQLite file under data/<slug>.db.
 * Connections are cached so repeated calls reuse the same Drizzle instance.
 *
 * Uses `libsql` (synchronous, better-sqlite3-compatible API) as the SQLite driver.
 */
import Database from "libsql";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// ── Types ──────────────────────────────────────────────────────────────────
export type ProjectDb = BetterSQLite3Database<typeof schema>;

// ── Connection cache ───────────────────────────────────────────────────────
const connectionCache = new Map<
  string,
  { db: ProjectDb; sqlite: InstanceType<typeof Database> }
>();

const DATA_DIR = path.join(process.cwd(), "data");

export function getDbPath(projectSlug: string = "default"): string {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  return path.join(DATA_DIR, `${projectSlug}.db`);
}

/**
 * Get or create a cached Drizzle DB instance for the given project slug.
 * This is the primary entry point — all API routes should use this
 * (via resolveProjectDb in project-context.ts).
 */
export function getProjectDb(projectSlug: string = "default"): ProjectDb {
  const cached = connectionCache.get(projectSlug);
  if (cached) return cached.db;

  const dbPath = getDbPath(projectSlug);
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });

  // Auto-create tables on first access
  initializeTables(sqlite);

  connectionCache.set(projectSlug, { db, sqlite });
  return db;
}

/** Legacy alias — kept for backward compatibility with initializeDb() calls */
export function initializeDb(projectSlug: string = "default"): ProjectDb {
  return getProjectDb(projectSlug);
}

/** Convenience alias for simple usage */
export function getDb(projectSlug: string = "default"): ProjectDb {
  return getProjectDb(projectSlug);
}

/** Close a specific project's database connection and remove from cache */
export function closeProjectDb(projectSlug: string): void {
  const cached = connectionCache.get(projectSlug);
  if (cached) {
    cached.sqlite.close();
    connectionCache.delete(projectSlug);
  }
}

/** Close all cached database connections */
export function closeAllDbs(): void {
  for (const [, { sqlite }] of connectionCache) {
    sqlite.close();
  }
  connectionCache.clear();
}

// ── Schema bootstrap ───────────────────────────────────────────────────────
function initializeTables(sqlite: InstanceType<typeof Database>): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      title TEXT,
      email TEXT,
      linkedin_url TEXT,
      channel TEXT DEFAULT 'linkedin',
      segment TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      score INTEGER DEFAULT 0,
      score_breakdown TEXT,
      score_rules_version INTEGER,
      company_size TEXT,
      tech_stack_match TEXT,
      pain_signal_strength TEXT,
      decision_maker_access TEXT,
      engagement_signals TEXT,
      segment_fit TEXT,
      employee_count INTEGER,
      tech_stack TEXT,
      is_hiring_react INTEGER DEFAULT 0,
      has_active_blog INTEGER DEFAULT 0,
      recent_funding TEXT,
      active_on_linkedin INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      channel TEXT NOT NULL,
      segment TEXT,
      type TEXT NOT NULL,
      variant TEXT,
      subject TEXT,
      body TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL REFERENCES leads(id),
      template_id INTEGER REFERENCES templates(id),
      channel TEXT DEFAULT 'linkedin',
      subject TEXT,
      body TEXT NOT NULL,
      selected_hook TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      outcome TEXT,
      sent_at TEXT,
      follow_up_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL REFERENCES leads(id),
      type TEXT NOT NULL,
      detail TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      rules_version INTEGER,
      input_summary TEXT,
      output_summary TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS metric_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_leads INTEGER DEFAULT 0,
      contacted INTEGER DEFAULT 0,
      replied INTEGER DEFAULT 0,
      booked INTEGER DEFAULT 0,
      closed INTEGER DEFAULT 0,
      avg_score REAL DEFAULT 0,
      snapshot_date TEXT NOT NULL DEFAULT (date('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      contact_info TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migrate existing databases: add enrichment columns if missing
  migrateLeadsEnrichmentColumns(sqlite);
}

/** Add enrichment columns to leads table for existing databases */
function migrateLeadsEnrichmentColumns(sqlite: InstanceType<typeof Database>): void {
  const columns = sqlite.pragma("table_info(leads)") as { name: string }[];
  const columnNames = new Set(columns.map((c) => c.name));

  const newColumns: [string, string][] = [
    ["score_breakdown", "TEXT"],
    ["score_rules_version", "INTEGER"],
    ["employee_count", "INTEGER"],
    ["tech_stack", "TEXT"],
    ["is_hiring_react", "INTEGER DEFAULT 0"],
    ["has_active_blog", "INTEGER DEFAULT 0"],
    ["recent_funding", "TEXT"],
    ["active_on_linkedin", "INTEGER DEFAULT 0"],
  ];

  for (const [colName, colDef] of newColumns) {
    if (!columnNames.has(colName)) {
      sqlite.exec(`ALTER TABLE leads ADD COLUMN ${colName} ${colDef}`);
    }
  }
}
