-- Thread Storage Schema for Brain Repository
-- Purpose: Unified storage for threads, work items, and tool executions
-- Created: 2026-01-26
-- Reference: cortex/docs/research/thread-persistence-research.md Section 3.2

-- Core thread storage (represents a run_id or era)
CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY,           -- UUID or run_id
    started_at TEXT NOT NULL,
    ended_at TEXT,
    era TEXT,                      -- Era name from THUNK (e.g., "Era 4: Template Sync")
    status TEXT DEFAULT 'active',  -- active, completed, abandoned
    summary TEXT,                  -- AI-generated summary of work done
    CHECK (status IN ('active', 'completed', 'abandoned'))
);

-- Individual work items (tasks from IMPLEMENTATION_PLAN.md and THUNK.md)
CREATE TABLE IF NOT EXISTS work_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id TEXT REFERENCES threads(id),
    thunk_num INTEGER,             -- THUNK # if completed (sequential ID from THUNK.md)
    original_id TEXT,              -- Task ID from IMPLEMENTATION_PLAN.md (e.g., "9C.2.1", "POST-CR6.1")
    priority TEXT,                 -- HIGH, MEDIUM, LOW, CRITICAL
    description TEXT NOT NULL,     -- Task description + completion notes
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, blocked
    created_at TEXT NOT NULL,
    completed_at TEXT,
    commit_sha TEXT,               -- Link to git commit (7-char short SHA)
    UNIQUE(thread_id, thunk_num),
    CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW', 'CRITICAL'))
);

-- Tool executions (extends rollflow_cache concept)
CREATE TABLE IF NOT EXISTS tool_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_item_id INTEGER REFERENCES work_items(id),
    cache_key TEXT,                -- Cache key from rollflow_cache
    tool_name TEXT NOT NULL,       -- Tool name (e.g., "bash", "grep", "open_files")
    status TEXT NOT NULL,          -- PASS, FAIL, SKIPPED
    started_at TEXT,               -- ISO 8601 timestamp
    ended_at TEXT,                 -- ISO 8601 timestamp
    duration_ms INTEGER,           -- Duration in milliseconds
    exit_code INTEGER,             -- Exit code (for bash commands)
    error_excerpt TEXT,            -- First 500 chars of error output
    CHECK (status IN ('PASS', 'FAIL', 'SKIPPED'))
);

-- Full-text search index for work items
-- Enables fast text search across task descriptions
CREATE VIRTUAL TABLE IF NOT EXISTS work_items_fts USING fts5(
    description,
    content='work_items',
    content_rowid='id'
);

-- Triggers to keep FTS index in sync with work_items table
CREATE TRIGGER IF NOT EXISTS work_items_ai AFTER INSERT ON work_items BEGIN
    INSERT INTO work_items_fts(rowid, description) VALUES (new.id, new.description);
END;

CREATE TRIGGER IF NOT EXISTS work_items_ad AFTER DELETE ON work_items BEGIN
    INSERT INTO work_items_fts(work_items_fts, rowid, description) VALUES('delete', old.id, old.description);
END;

CREATE TRIGGER IF NOT EXISTS work_items_au AFTER UPDATE ON work_items BEGIN
    INSERT INTO work_items_fts(work_items_fts, rowid, description) VALUES('delete', old.id, old.description);
    INSERT INTO work_items_fts(rowid, description) VALUES (new.id, new.description);
END;

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_work_items_thread ON work_items(thread_id);
CREATE INDEX IF NOT EXISTS idx_work_items_status ON work_items(status);
CREATE INDEX IF NOT EXISTS idx_work_items_completed_at ON work_items(completed_at);
CREATE INDEX IF NOT EXISTS idx_work_items_priority ON work_items(priority);
CREATE INDEX IF NOT EXISTS idx_tool_executions_work_item ON tool_executions(work_item_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_tool_name ON tool_executions(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_executions_status ON tool_executions(status);

-- Example queries for common use cases:

-- Search for tasks by keyword (full-text search)
-- SELECT work_items.* FROM work_items_fts
-- JOIN work_items ON work_items.id = work_items_fts.rowid
-- WHERE work_items_fts MATCH 'shellcheck'
-- ORDER BY work_items.completed_at DESC;

-- Find all tasks in a specific era
-- SELECT * FROM work_items
-- WHERE thread_id IN (SELECT id FROM threads WHERE era LIKE '%Template Sync%')
-- ORDER BY thunk_num;

-- Find slow tool executions
-- SELECT tool_name, AVG(duration_ms) as avg_ms, COUNT(*) as count
-- FROM tool_executions
-- WHERE status = 'PASS'
-- GROUP BY tool_name
-- ORDER BY avg_ms DESC
-- LIMIT 10;

-- Find tasks completed on a specific date
-- SELECT original_id, description, completed_at
-- FROM work_items
-- WHERE DATE(completed_at) = '2026-01-26'
-- ORDER BY thunk_num;

-- Find all failed tool executions for a work item
-- SELECT te.tool_name, te.exit_code, te.error_excerpt
-- FROM tool_executions te
-- JOIN work_items wi ON te.work_item_id = wi.id
-- WHERE wi.original_id = 'POST-CR6.1' AND te.status = 'FAIL';
