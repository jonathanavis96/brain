# Cortex Plan - Completed Tasks Archive

This file archives completed tasks from `cortex/IMPLEMENTATION_PLAN.md` to keep the active plan lean.

**Purpose:** Reduce token overhead when Cortex reads its implementation plan.

**Format:** Tasks are archived with their original phase context and completion date.

---

## Archived Tasks

<!-- Tasks are appended here by cleanup_cortex_plan.sh -->


### Archived on 2026-01-25 (Phase 10, 9C, 6, 7)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-25 | 10.1.1 | - [x] **10.1.1** Create `workers/ralph/cleanup_plan.sh` |
| 2026-01-25 | 10.1.2 | - [x] **10.1.2** Add `--archive` flag to append removed tasks to THUNK.md |
| 2026-01-25 | 10.1.3 | - [x] **10.1.3** Add phase collapse detection |
| 2026-01-25 | 10.2.1 | - [x] **10.2.1** Add cleanup hook to `sync_cortex_plan.sh` |
| 2026-01-25 | 10.2.2 | - [x] **10.2.2** Add `--no-cleanup` flag to sync script |
| 2026-01-25 | 10.3.1 | - [x] **10.3.1** Create `tools/test_plan_cleanup.sh` test script |
| 2026-01-25 | 9C.2.B1 | - [x] **9C.2.B1** BATCH: Create language project templates (combines 6.1.1, 6.1.2, 6.3.1) |
| 2026-01-25 | 6.1.1 | - [x] **6.1.1** Create `templates/javascript/` directory with JS/TS project template |
| 2026-01-25 | 6.1.2 | - [x] **6.1.2** Create `templates/go/` directory with Go project template |
| 2026-01-25 | 6.3.1 | - [x] **6.3.1** Create `templates/website/` with project scaffolding (pointers only) |
| 2026-01-25 | 7.1.1 | - [x] **7.1.1** Enhance root `README.md` with better onboarding flow |
| 2026-01-25 | 7.1.2 | - [x] **7.1.2** Create `CONTRIBUTING.md` with contribution guidelines |
| 2026-01-25 | 7.2.1 | - [x] **7.2.1** Update `skills/index.md` with new skill files from Phase 5 |
| 2026-01-25 | 7.2.2 | - [x] **7.2.2** Update `skills/SUMMARY.md` with enhanced error reference |
| 2026-01-25 | 7.3.1 | - [x] **7.3.1** Request AC.rules update for shellcheck regex |

### Archived on 2026-01-25 (9C.1.2)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-25 | 9C.1.2 | - [x] **9C.1.2** Add task complexity tags to PROMPT_REFERENCE.md |

### CodeRabbit PR#5 Completed - 2026-01-25

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-25 | CR-1.5 | - [x] **CR-1.5** Fix `approve_waiver_totp.py` race condition |
| 2026-01-25 | CR-1.7 | - [x] **CR-1.7** Fix `bin/brain-event` unbound variable |
| 2026-01-25 | CR-1.8 | - [x] **CR-1.8** Verify `cerebras_agent.py` state reinjection (already correct) |
| 2026-01-25 | CR-2.1 | - [x] **CR-2.1** Verify TypeScript README links (all valid) |
| 2026-01-25 | CR-2.2 | - [x] **CR-2.2** Update skills/index.md with missing entries |
| 2026-01-25 | CR-2.3 | - [x] **CR-2.3** Fix markdown formatting in observability-patterns.md |
| 2026-01-25 | CR-3.1 | - [x] **CR-3.1** Fix Python examples in deployment-patterns.md |
| 2026-01-25 | CR-3.2 | - [x] **CR-3.2** Fix Python examples in observability-patterns.md |
| 2026-01-25 | CR-3.3 | - [x] **CR-3.3** Verify disaster-recovery PostgreSQL example (already correct) |
| 2026-01-25 | CR-3.4 | - [x] **CR-3.4** Fix Jest flag in test-coverage-patterns.md |
| 2026-01-25 | CR-3.5 | - [x] **CR-3.5** Verify "backward-compatible" grammar (already correct) |
| 2026-01-25 | CR-4.1 | - [x] **CR-4.1** Create code-review-patterns.md skill |
| 2026-01-25 | CR-4.2 | - [x] **CR-4.2** Add pre-PR checklist to AGENTS.md |
| 2026-01-25 | CR-4.3 | - [x] **CR-4.3** Add LLM-based semantic linting gap to GAP_BACKLOG.md |
| 2026-01-25 | 9C.0.3 | - [x] **9C.0.3** Document RovoDev tool instrumentation limitation ✓ DONE |
| 2026-01-25 | 9C.1.1 | - [x] **9C.1.1** Enhance `cortex/snapshot.sh` with batching hints ✓ DONE |
| 2026-01-25 | 9C.1.2 | - [x] **9C.1.2** Add task complexity tags to PROMPT_REFERENCE.md ✓ DONE |

### Archived on 2026-01-26

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | CR-6.1 | - [x] **CR-6.1** Fix `LOGS_DIR` → `LOGDIR` typo in templates/ralph/loop.sh (M9) |
| 2026-01-26 | CR-6.2 | - [x] **CR-6.2** Fix bin/brain-event flag parsing (M1) |
| 2026-01-26 | CR-6.3 | - [x] **CR-6.3** Fix THUNK.md table column mismatch (M10) |
| 2026-01-26 | CR-6.4 | - [x] **CR-6.4** Fix shell README config mismatch (C2) |
| 2026-01-26 | CR-6.5 | - [x] **CR-6.5** Fix code-review-patterns.md example bugs (M11) |
| 2026-01-26 | CR-6.6 | - [x] **CR-6.6** Fix README.md documentation issue (M12) |
| 2026-01-26 | CR-6.7 | - [x] **CR-6.7** Fix observability-patterns.md issues (m1) |
| 2026-01-26 | CR-6.8 | - [x] **CR-6.8** Fix broken documentation links (m3) |
| 2026-01-26 | CR-6.9 | - [x] **CR-6.9** Fix deployment-patterns.md missing imports (m5) |
| 2026-01-26 | CR-6.10 | - [x] **CR-6.10** Fix JavaScript example issues (m6) |
| 2026-01-26 | CR-6.11 | - [x] **CR-6.11** Fix archive header parsing in current_ralph_tasks.sh (from CR-5) - Completed 2026-01-25 (THUNK #773) |
| 2026-01-26 | CR-6.H1 | - [x] **CR-6.H1** Update SHA256 hashes after all fixes |

### Archived on 2026-01-26 (Batch 1)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 10.1.1 | - [x] **10.1.1** Create RovoDev ANSI parser in `tools/rollflow_analyze/src/rollflow_analyze/parsers/` |
| 2026-01-26 | 10.1.2 | - [x] **10.1.2** Integrate RovoDev parser into rollflow_analyze pipeline |
| 2026-01-26 | 10.2.1 | - [x] **10.2.1** Update docs/events.md with RovoDev format section |
| 2026-01-26 | 11.1.1 | - [x] **11.1.1** Create `skills/domains/ralph/thread-search-patterns.md` |

### Archived on 2026-01-26 (Batch 2)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 11.1.2 | - [x] **11.1.2** Build THUNK.md parser (Python script) |
| 2026-01-26 | 11.1.3 | - [x] **11.1.3** Create SQLite schema for unified thread storage |
| 2026-01-26 | 11.2.1 | - [x] **11.2.1** Build `bin/brain-search` CLI tool |
| 2026-01-26 | 12.1.1 | - [x] **12.1.1** Create `skills/domains/infrastructure/agent-observability-patterns.md` |
| 2026-01-26 | 12.1.2 | - [x] **12.1.2** Create `docs/MARKER_SCHEMA.md` - formal spec for all markers |
