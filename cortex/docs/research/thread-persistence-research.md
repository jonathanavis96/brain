# Research: Thread Persistence & Search in Brain

**Research Question:** How does Brain persist agent work history, and what capabilities are needed for searchable, queryable thread storage?

**Scope:** THUNK.md, rollflow cache, conversation history, search patterns
**Out of Scope:** Full-text search engines (Elasticsearch), cloud storage
**Success Criteria:** Map current persistence → identify gaps → propose schema evolution
**Confidence:** High (based on codebase analysis)

---

## 1. Current State

### 1.1 THUNK.md - Completed Task Log

**Location:** `workers/ralph/THUNK.md`

**Purpose:** Append-only record of all completed tasks across iterations.

**Structure:**

```markdown
# THUNK - Completed Task Log

Project: brain
Created: 2026-01-18

---

## Era: THUNK Monitor + KB→Skills Migration

Started: 2026-01-18

| THUNK # | Original # | Priority | Description | Completed |
|---------|------------|----------|-------------|-----------|
| 1 | T1.1 | HIGH | Rename watch_ralph_tasks.sh → current_ralph_tasks.sh | 2026-01-18 |
| 2 | T1.2 | HIGH | Update heading in current_ralph_tasks.sh | 2026-01-18 |
...
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| THUNK # | Integer | Sequential ID (auto-incremented) |
| Original # | String | Task ID from IMPLEMENTATION_PLAN.md |
| Priority | Enum | HIGH, MEDIUM, LOW |
| Description | String | Task description + completion notes |
| Completed | Date | YYYY-MM-DD format |

**Era System:** Tasks grouped by logical phases (e.g., "Era 4: Template Sync")

### 1.2 Rollflow Cache - Tool Call History

**Location:** `artifacts/rollflow_cache/cache.sqlite`

**Schema:**

```sql
CREATE TABLE pass_cache (
    cache_key TEXT PRIMARY KEY,
    tool_name TEXT NOT NULL,
    last_pass_ts TEXT NOT NULL,
    last_duration_ms INTEGER,
    meta_json TEXT
);

CREATE TABLE fail_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    ts TEXT NOT NULL,
    exit_code INTEGER,
    err_hash TEXT,
    err_excerpt TEXT
);
```

**Purpose:** Track tool execution results for cache decisions.

### 1.3 IMPLEMENTATION_PLAN.md - Active Tasks

**Location:** `workers/IMPLEMENTATION_PLAN.md` (synced from `cortex/IMPLEMENTATION_PLAN.md`)

**Format:** Markdown checkboxes with task contracts

```markdown
- [ ] **1.1** Task description
  - **Goal:** What to achieve
  - **AC:** Acceptance criteria
```

**States:** `[ ]` pending, `[x]` complete, `[?]` blocked/uncertain

### 1.4 Git History - Implicit Thread

Every commit represents work done. Commit messages follow conventions:

- `feat(scope): description` - New features
- `fix(scope): description` - Bug fixes
- `docs(scope): description` - Documentation

**Queryable via:** `git log --oneline`, `git log --grep="pattern"`

---

## 2. Gap Analysis

### 2.1 What Works Well

| Capability | Maturity | Notes |
|------------|----------|-------|
| Task completion log | ✅ Mature | THUNK.md is reliable, sequential |
| Era grouping | ✅ Mature | Logical phases preserved |
| Tool cache | ✅ Mature | SQLite with pass/fail tracking |
| Git history | ✅ Mature | Full audit trail |

### 2.2 Gaps

| Gap | Severity | Description |
|-----|----------|-------------|
| **G1: No full-text search** | HIGH | Can't search THUNK.md efficiently |
| **G2: No cross-file correlation** | HIGH | THUNK ↔ commits ↔ cache not linked |
| **G3: Markdown-only format** | MEDIUM | THUNK.md not queryable like SQLite |
| **G4: No conversation persistence** | MEDIUM | Agent reasoning not stored |
| **G5: No semantic search** | LOW | Can't search by concept/intent |
| **G6: No retention policy** | LOW | THUNK.md grows indefinitely |

---

## 3. Data Model Analysis

### 3.1 Current Entity Relationships

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ IMPLEMENTATION  │────▶│    THUNK.md      │────▶│   Git Commit    │
│   _PLAN.md      │     │  (completed)     │     │   (artifact)    │
│  - [ ] tasks    │     │  - THUNK #       │     │  - sha          │
│  - [x] tasks    │     │  - description   │     │  - message      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                │ (no link currently)
                                ▼
                        ┌──────────────────┐
                        │  rollflow_cache  │
                        │  - cache_key     │
                        │  - tool_name     │
                        │  - duration_ms   │
                        └──────────────────┘
```

### 3.2 Proposed Unified Schema

```sql
-- Core thread storage
CREATE TABLE threads (
    id TEXT PRIMARY KEY,           -- UUID or run_id
    started_at TEXT NOT NULL,
    ended_at TEXT,
    era TEXT,                      -- Era name from THUNK
    status TEXT DEFAULT 'active',  -- active, completed, abandoned
    summary TEXT                   -- AI-generated summary
);

-- Individual work items (tasks)
CREATE TABLE work_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id TEXT REFERENCES threads(id),
    thunk_num INTEGER,             -- THUNK # if completed
    original_id TEXT,              -- Task ID (e.g., "9C.2.1")
    priority TEXT,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, blocked
    created_at TEXT NOT NULL,
    completed_at TEXT,
    commit_sha TEXT,               -- Link to git commit
    UNIQUE(thread_id, thunk_num)
);

-- Tool executions (extends rollflow_cache)
CREATE TABLE tool_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_item_id INTEGER REFERENCES work_items(id),
    cache_key TEXT,
    tool_name TEXT NOT NULL,
    status TEXT NOT NULL,          -- PASS, FAIL, SKIPPED
    started_at TEXT,
    ended_at TEXT,
    duration_ms INTEGER,
    exit_code INTEGER,
    error_excerpt TEXT
);

-- Full-text search index
CREATE VIRTUAL TABLE work_items_fts USING fts5(
    description,
    content='work_items',
    content_rowid='id'
);

-- Indexes
CREATE INDEX idx_work_items_thread ON work_items(thread_id);
CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_tool_executions_work_item ON tool_executions(work_item_id);
```

---

## 4. Future State Vision

### 4.1 Short-Term (Documentation + Patterns)

**Goal:** Formalize schema, document search patterns, enable manual queries.

1. **THUNK Schema Doc** - Document markdown structure formally
2. **Search Patterns Skill** - `skills/domains/ralph/thread-search-patterns.md`
3. **Git Query Cheatsheet** - Common `git log` patterns for finding work

### 4.2 Medium-Term (Tooling Improvements)

**Goal:** Unified queryable storage.

1. **THUNK → SQLite Sync** - Parse THUNK.md into SQLite on startup
2. **FTS Index** - Full-text search across descriptions
3. **Cross-Reference Links** - THUNK # → commit SHA → tool calls
4. **Query CLI** - `bin/brain-search "pattern"` for quick lookups

### 4.3 Long-Term (Platform Capabilities)

**Goal:** Semantic search and intelligent retrieval.

1. **Embedding Storage** - Vector embeddings for semantic search
2. **Conversation Persistence** - Store agent reasoning chains
3. **Auto-Summarization** - AI-generated summaries per era/thread
4. **Retention Policies** - Archive old eras, keep recent searchable

---

## 5. Search Patterns (Current Workarounds)

### 5.1 Search THUNK.md

```bash
# Find task by keyword
grep -i "shellcheck" workers/ralph/THUNK.md

# Find tasks in date range
grep "2026-01-25" workers/ralph/THUNK.md

# Count tasks by era
grep -c "^|" workers/ralph/THUNK.md
```

### 5.2 Search Git History

```bash
# Find commits by task ID
git log --oneline --grep="9C.2.1"

# Find commits by file
git log --oneline -- "skills/domains/shell/*.md"

# Find commits in date range
git log --oneline --since="2026-01-24" --until="2026-01-26"
```

### 5.3 Query Rollflow Cache

```bash
# List all cached passes
sqlite3 artifacts/rollflow_cache/cache.sqlite \
  "SELECT tool_name, COUNT(*) FROM pass_cache GROUP BY tool_name"

# Find slow tools
sqlite3 artifacts/rollflow_cache/cache.sqlite \
  "SELECT tool_name, last_duration_ms FROM pass_cache ORDER BY last_duration_ms DESC LIMIT 10"
```

---

## 6. Recommendations

### 6.1 Immediate Actions (No Code)

| Action | Owner | Deliverable |
|--------|-------|-------------|
| Document THUNK.md schema | Ralph | Add schema section to README |
| Create search patterns skill | Ralph | `skills/domains/ralph/thread-search-patterns.md` |
| Add git log examples | Ralph | `skills/domains/code-quality/research-cheatsheet.md` |

### 6.2 Phase A Implementation (Loom Delta)

From `cortex/docs/loom_brain_feature_deltas.md`:

1. **Thread Persistence Spec** → Schema design above
2. **Search/Indexing** → SQLite FTS5 for text search
3. **Query Interface** → CLI tool or bash functions

### 6.3 Decision Points

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Storage format | Markdown vs SQLite vs Both | **Both** - Markdown human-readable, SQLite queryable |
| Sync direction | THUNK → SQLite vs bidirectional | **THUNK → SQLite** (THUNK is source of truth) |
| Search technology | grep vs FTS5 vs Embeddings | **FTS5 first**, embeddings later |
| Conversation storage | Yes/No | **Defer** - high complexity, unclear value |

---

## 7. Sources

| Source | Relevance | Trust |
|--------|-----------|-------|
| `workers/ralph/THUNK.md` | Primary - task history | High |
| `tools/rollflow_analyze/src/rollflow_analyze/cache_db.py` | Primary - cache schema | High |
| `workers/IMPLEMENTATION_PLAN.md` | Primary - active tasks | High |
| Git history | Supporting - commit trail | High |
| Loom feature deltas | Context - inspiration | Medium |

---

## 8. Next Steps

1. **Create thread-search-patterns.md skill** with grep/git/sqlite patterns
2. **Prototype THUNK parser** - Python script to extract structured data
3. **Evaluate FTS5 performance** on typical THUNK sizes (800+ entries)
4. **Design CLI interface** for brain-search tool

---

*Research completed: 2026-01-25*
*Confidence: High*
