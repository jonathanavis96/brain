import Database from "libsql";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../src/db/schema";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");

export function createTestDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const dbPath = path.join(DATA_DIR, `test_${randomUUID().slice(0, 8)}.db`);
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  // Create tables
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

  const db = drizzle(sqlite, { schema });

  return {
    db,
    sqlite,
    dbPath,
    cleanup: () => {
      try {
        sqlite.close();
      } catch { /* ignore */ }
      for (const ext of ["", "-wal", "-shm"]) {
        const f = dbPath + ext;
        if (fs.existsSync(f)) {
          try { fs.unlinkSync(f); } catch { /* ignore */ }
        }
      }
    },
  };
}

export function seedTestLead(db: ReturnType<typeof createTestDb>["db"], overrides: Partial<typeof schema.leads.$inferInsert> = {}) {
  return db
    .insert(schema.leads)
    .values({
      name: "Test Lead",
      company: "Test Corp",
      status: "new",
      score: 0,
      ...overrides,
    })
    .returning()
    .get();
}

export function seedTestTemplate(db: ReturnType<typeof createTestDb>["db"], overrides: Partial<typeof schema.templates.$inferInsert> = {}) {
  return db
    .insert(schema.templates)
    .values({
      name: "Test Template",
      channel: "linkedin",
      type: "initial",
      body: "Hello {{name}}, I noticed {{company}} is...",
      version: 1,
      isActive: true,
      ...overrides,
    })
    .returning()
    .get();
}

export function seedTestMessage(db: ReturnType<typeof createTestDb>["db"], leadId: number, overrides: Partial<typeof schema.messages.$inferInsert> = {}) {
  return db
    .insert(schema.messages)
    .values({
      leadId,
      body: "Test message body",
      status: "draft",
      ...overrides,
    })
    .returning()
    .get();
}

export function seedTestEvent(db: ReturnType<typeof createTestDb>["db"], leadId: number, overrides: Partial<typeof schema.events.$inferInsert> = {}) {
  return db
    .insert(schema.events)
    .values({
      leadId,
      type: "note",
      detail: "Test event",
      ...overrides,
    })
    .returning()
    .get();
}
