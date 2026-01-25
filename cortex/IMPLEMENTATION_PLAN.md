# Cortex Implementation Plan

**Purpose:** Task Contracts for Ralph workers. Each contract defines an atomic task with clear goals and acceptance criteria.

**Workflow:**

1. Cortex creates/updates Task Contracts here
2. Ralph's `loop.sh` syncs this file via `sync_cortex_plan.sh`
3. Ralph works through tasks, marking them complete
4. Cortex reviews progress and creates new contracts

---

## Current Status

**Last Updated:** 2026-01-25 22:50:00  
**Progress:** Added Phases 10-13 based on Loom feature delta research. Focus on observability, persistence, and tooling.

**Active Phases:**

- Phase 10: RovoDev Parser (3 tasks) - parse ANSI tool output
- Phase 11: Thread Persistence (4 tasks) - search & storage
- Phase 12: Observability (4 tasks) - marker schema & tooling
- Phase 13: Tool Registry (3 tasks) - declarative tool config
- Phase 9C: Task Optimization (11 tasks) - batching & decomposition
- Phase 0-Warn: Verifier Warnings (2 tasks) - human intervention required

---

## Completed Phases

See `workers/ralph/THUNK.md` for complete task history (550+ completed tasks).

**Completed:** Phases 0-5, 6 (Housekeeping), 7 (Gap Radar), 8 (Playbooks), X (Structured Logging)

---

<!-- Cortex adds new Task Contracts below this line -->

## Phase 10: RovoDev Parser & Observability

**Goal:** Build parser for RovoDev's ANSI tool output to enable complete tool visibility.

**Context:** RovoDev emits tool calls in logs (`⬡ Calling <tool>:` / `⬢ Called <tool>:`), but rollflow_analyze doesn't parse this format yet.

### Phase 10.1: RovoDev Parser

- [ ] **10.1.1** Create RovoDev ANSI parser in `tools/rollflow_analyze/src/rollflow_analyze/parsers/`
  - **Goal:** Parse RovoDev tool output format from logs
  - **Input format:** `⬡ Calling <tool>:` (start), `⬢ Called <tool>:` (end), optional `N seconds` duration
  - **Output:** ToolCall objects matching existing model
  - **AC:** Parser extracts tool_name, start/end markers, duration from sample log
  - **Test:** Add test file with sample RovoDev output

- [ ] **10.1.2** Integrate RovoDev parser into rollflow_analyze pipeline
  - **Goal:** Unified parsing across :::MARKER::: and RovoDev formats
  - **AC:** `rollflow_analyze` reports include RovoDev tool calls
  - **Depends on:** 10.1.1

### Phase 10.2: Documentation

- [ ] **10.2.1** Update docs/events.md with RovoDev format section
  - **Goal:** Document RovoDev's tool output format alongside :::MARKER::: format
  - **AC:** events.md has "RovoDev Format" section with examples

---

## Phase 11: Thread Persistence & Search

**Goal:** Enable searchable, queryable thread storage for agent work history.

**Context:** THUNK.md is append-only markdown; rollflow_cache is SQLite. Need unified search across both.

**Research:** `cortex/docs/research/thread-persistence-research.md`

### Phase 11.1: Documentation & Skills

- [ ] **11.1.1** Create `skills/domains/ralph/thread-search-patterns.md`
  - **Goal:** Document search patterns for THUNK, git, and cache
  - **AC:** Skill includes grep patterns for THUNK.md, git log examples, sqlite queries
  - **Priority:** HIGH

- [ ] **11.1.2** Build THUNK.md parser (Python script)
  - **Goal:** Extract structured data from THUNK.md markdown table
  - **Output:** JSON or SQLite with thunk_num, task_id, priority, description, date
  - **AC:** Parser handles current THUNK format (800+ entries), outputs valid JSON
  - **Priority:** MEDIUM

### Phase 11.2: Tooling

- [ ] **11.1.3** Create SQLite schema for unified thread storage
  - **Goal:** Single database for threads, work_items, tool_executions
  - **Schema:** See `cortex/docs/research/thread-persistence-research.md` Section 3.2
  - **AC:** Schema created with FTS5 index on descriptions
  - **Priority:** MEDIUM

- [ ] **11.2.1** Build `bin/brain-search` CLI tool
  - **Goal:** Quick lookups across THUNK, git, cache
  - **Usage:** `brain-search "shellcheck"` → shows matching tasks, commits, tool calls
  - **AC:** CLI returns results from at least 2 sources (THUNK + git)
  - **Priority:** LOW

---

## Phase 12: Observability Improvements

**Goal:** Formalize event schemas and improve observability tooling.

**Context:** Brain has multiple event formats (:::MARKER:::, JSONL, RovoDev ANSI). Need unified documentation and tooling.

**Research:** `cortex/docs/research/agent-observability-research.md`

### Phase 12.1: Documentation & Skills

- [ ] **12.1.1** Create `skills/domains/infrastructure/agent-observability-patterns.md`
  - **Goal:** Document how to add observability to new tools/scripts
  - **AC:** Skill covers marker emission, JSONL events, log correlation
  - **Priority:** HIGH

- [ ] **12.1.2** Create `docs/MARKER_SCHEMA.md` - formal spec for all markers
  - **Goal:** Single source of truth for :::MARKER::: format
  - **Content:** All marker types, fields, examples, versioning policy
  - **AC:** Schema doc covers all markers in loop.sh, includes validation rules
  - **Priority:** HIGH

### Phase 12.2: Tooling

- [ ] **12.2.1** Add real-time event watcher `bin/brain-event --watch`
  - **Goal:** Live tail of events with filtering
  - **Usage:** `brain-event --watch --filter="phase_end"`
  - **AC:** Watcher shows new events in real-time from state/events.jsonl
  - **Priority:** LOW

- [ ] **12.2.2** Create cross-run aggregation queries for cache.sqlite
  - **Goal:** Query patterns for analyzing tool performance across runs
  - **Output:** Add to `skills/domains/ralph/cache-debugging.md`
  - **AC:** At least 5 useful queries documented (slowest tools, fail rates, etc.)
  - **Priority:** LOW

---

## Phase 13: Tool Registry

**Goal:** Move from implicit tool definitions to declarative registry.

**Context:** Tool cacheability is hardcoded in `case` statement. No discovery or permission model.

**Research:** `cortex/docs/research/tool-registry-research.md`

### Phase 13.1: Documentation & Skills

- [ ] **13.1.1** Create `skills/domains/ralph/tool-wrapper-patterns.md`
  - **Goal:** Document run_tool() usage, cache key generation, error handling
  - **AC:** Skill covers wrapper API, cacheability rules, trap-based cleanup
  - **Priority:** HIGH

- [ ] **13.1.2** Extract non-cacheable tools to config file
  - **Goal:** Move from hardcoded `case` to `config/non_cacheable_tools.txt`
  - **Change:** Update `is_non_cacheable()` in loop.sh to read from file
  - **AC:** Config file exists, loop.sh reads it, behavior unchanged
  - **Priority:** MEDIUM

### Phase 13.2: Registry Foundation

- [ ] **13.2.1** Prototype YAML tool registry schema
  - **Goal:** Define registry format with 10 common tools as examples
  - **Location:** `config/tool-registry.yaml`
  - **Content:** Tool definitions with type, command, cacheable, tags
  - **AC:** Valid YAML with schema documented, covers shellcheck/markdownlint/git tools
  - **Priority:** LOW

---

## Phase 9C: Task Optimization (Batching + Decomposition)

**Goal:** Use Phase 0 structured logs to identify batching and decomposition opportunities, reducing task overhead and improving iteration success rate.

**Artifacts:** `artifacts/optimization_hints.md` (analysis output)

### Phase 9C.0: Prerequisites (Marker Pipeline Fix)

- [ ] **9C.0.3** Document RovoDev tool instrumentation limitation
  - **Goal:** Clarify that RovoDev's native tools bypass shell wrapper
  - **AC:** `artifacts/optimization_hints.md` has "Limitations" section explaining tool visibility gap
  - **Note:** RovoDev bash/grep/find_and_replace_code don't go through `log_tool_start()`

### Phase 9C.1: Batching Infrastructure

- [ ] **9C.1.1** Enhance `cortex/snapshot.sh` with batching hints
  - **Goal:** Show "⚡ Batching opportunities: X" when ≥3 similar pending tasks detected
  - **AC:** Snapshot output shows batching hints section when opportunities exist
  - **Detection:** Same error code (MDxxx, SCxxxx), same directory prefix, same file type

  - **Goal:** Document `[S/M/L]` complexity convention for task estimation
  - **AC:** PROMPT_REFERENCE.md has "Task Complexity" section with realistic time estimates (S=2-3min, M=5-10min, L=10-20min)

### Phase 9C.2: Apply Batching to Current Backlog

- [ ] **9C.2.1** Create batch task template in `templates/ralph/PROMPT.md`
  - **Goal:** Standard format for batched tasks with multi-file scope
  - **AC:** Template shows batch task example with glob patterns and verification

  - **Scope:** Create `templates/javascript/`, `templates/go/`, `templates/website/`
  - **Steps:**
    1. Define standard template structure (AGENTS.md, NEURONS.md, VALIDATION_CRITERIA.md)
    2. Create all three directories with standard files in one pass
    3. **Templates contain pointers to brain skills, NOT duplicated content**
    4. Verify each directory has required files
  - **AC:** All three template directories exist with standard structure and skill references
  - **Replaces:** 6.1.1, 6.1.2, 6.3.1
  - **Status:** 6.1.1 and 6.1.2 complete, 6.3.1 pending

- [ ] **9C.2.B2** BATCH: Update skills documentation (combines 7.2.1, 7.2.2)
  - **Scope:** `skills/index.md` + `skills/SUMMARY.md`
  - **Steps:**
    1. Scan `skills/domains/` and `skills/playbooks/` for all files
    2. Update `skills/index.md` with any missing entries
    3. Update `skills/SUMMARY.md` error reference and playbooks section
  - **AC:** Both index files list all current skills, SUMMARY includes playbooks
  - **Replaces:** 7.2.1, 7.2.2

- [ ] **9C.2.B3** BATCH: Improve onboarding docs (combines 7.1.1, 7.1.2)
  - **Scope:** Root `README.md` + new `CONTRIBUTING.md`
  - **Steps:**
    1. Enhance README.md onboarding flow (quick start, navigation)
    2. Create CONTRIBUTING.md with guidelines
    3. Cross-link between files
  - **AC:** README has clear onboarding, CONTRIBUTING.md exists
  - **Replaces:** 7.1.1, 7.1.2

### Phase 9C.3: Decomposition Detection

- [ ] **9C.3.1** Add duration tracking to `current_ralph_tasks.sh` footer
  - **Goal:** Show when current task exceeds 2x median (⚠️ warning)
  - **AC:** Footer shows "⚠️ Current task exceeding median" when appropriate

- [ ] **9C.3.2** Create decomposition checklist in `skills/playbooks/`
  - **Goal:** Playbook for breaking down oversized tasks
  - **AC:** `skills/playbooks/decompose-large-tasks.md` exists with decision criteria

### Phase 9C.4: Validation

- [ ] **9C.4.1** Validate batching recommendations against next 5 iterations
  - **Goal:** Measure if batched tasks reduce total time vs individual tasks
  - **AC:** Update `artifacts/optimization_hints.md` with before/after comparison

**Phase AC:**

- `artifacts/optimization_hints.md` updates from iter artifacts
- ≥3 batching opportunities identified with evidence
- ≥2 decomposition opportunities documented

---

## Phase 0-Warn: Verifier Warnings

**Goal:** Resolve verifier warnings from latest run.

**Status:** 2 warnings present - both require HUMAN INTERVENTION (protected file changes).

- [ ] **WARN.Protected.1** - Protected file changed (human review required) - HUMAN INTERVENTION REQUIRED
- [ ] **WARN.Protected.2** - Protected file changed (human review required) - HUMAN INTERVENTION REQUIRED

---

## Recurring: Performance Monitoring

**Goal:** Continuously scan logs and identify performance optimization opportunities.

**Frequency:** Every 5 Ralph iterations (or when Cortex reviews progress)

**Process:**

1. **Scan iteration logs** in `artifacts/rollflow_cache/` for:
   - Tasks exceeding 10 minutes (decomposition candidates)
   - Repeated similar errors (skill gap candidates)
   - Multiple file edits in same directory (batching candidates)

2. **Update `artifacts/optimization_hints.md`** with:
   - New batching opportunities discovered
   - Decomposition recommendations
   - Skill gaps to fill

3. **Check gap radar output** from `bin/gap-radar --dry-run`:
   - New error patterns not covered by skills
   - Promote significant gaps to SKILL_BACKLOG.md

**Trigger:** Cortex should run `bash cortex/snapshot.sh` which shows batching hints when ≥3 similar tasks detected.

**AC:** `artifacts/optimization_hints.md` updated at least every 5 iterations with actionable insights.

---
