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

### Archived on 2026-01-26 (Batch 0)

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

### Archived on 2026-01-26 (Batch 5)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | CR-6.1 | - [x] **CR-6.1** Fix LOGS_DIR reference in templates/ralph/loop.sh - ✅ FIXED |
| 2026-01-26 | CR-6.2 | - [x] **CR-6.2** Fix brain-event flag parsing - ✅ FIXED |
| 2026-01-26 | CR-6.3 | - [x] **CR-6.3** Fix THUNK.md table column count (MD056) - ✅ FIXED (2026-01-26) |
| 2026-01-26 | CR-6.4 | - [x] **CR-6.4** Verify shfmt config in shell/README.md matches .pre-commit-config.yaml - ✅ VERIFIED (docs match config) |
| 2026-01-26 | CR-6.5 | - [x] **CR-6.5** Review code-review-patterns.md line 286 code example - ✅ VERIFIED (no issues) |
| 2026-01-26 | CR-6.6 | - [x] **CR-6.6** Review README.md line 326 documentation - ✅ VERIFIED (only 1 Contributing section) |
| 2026-01-26 | CR-6.7 | - [x] **CR-6.7** Fix observability-patterns.md code examples - ✅ VERIFIED (no hardcoded secrets) |
| 2026-01-26 | CR-6.8 | - [x] **CR-6.8** Fix TypeScript README links - ✅ FIXED (file created) |
| 2026-01-26 | CR-6.9 | - [x] **CR-6.9** Fix deployment-patterns.md import time - ✅ FIXED |
| 2026-01-26 | CR-6.10 | - [x] **CR-6.10** Fix JavaScript examples (userId, Jest flag) - ✅ VERIFIED (userId defined, Jest flags correct) |
| 2026-01-26 | CR-6.11 | - [x] **CR-6.11** Fix archive header parsing in current_ralph_tasks.sh - ✅ FIXED (THUNK #773) |
| 2026-01-26 | CR-6.H1 | - [x] **CR-6.H1** Update SHA256 hashes after all fixes |
| 2026-01-26 | POST-CR6.1 | - [x] **POST-CR6.1** Implement hash validation pre-commit hook - Completed 2026-01-26 (THUNK #818) |
| 2026-01-26 | POST-CR6.2 | - [x] **POST-CR6.2** Create shell script unit test framework |
| 2026-01-26 | POST-CR6.6 | - [x] **POST-CR6.6** Expand semantic code review skill - Completed 2026-01-26 (THUNK #820) |
| 2026-01-26 | POST-CR6.3 | - [x] **POST-CR6.3** Implement documentation link validation - Completed 2026-01-26 (THUNK #821) |
| 2026-01-26 | POST-CR6.4 | - [x] **POST-CR6.4** Create code example validation system - Completed 2026-01-26 (THUNK #822) |
| 2026-01-26 | POST-CR6.7 | - [x] **POST-CR6.7** Document prevention system architecture - Completed 2026-01-26 (THUNK #824) |
| 2026-01-26 | POST-CR6.5 | - [x] **POST-CR6.5** Implement documentation-config sync validation |
| 2026-01-26 | 10.1.1 | - [x] **10.1.1** Create RovoDev ANSI parser in `tools/rollflow_analyze/src/rollflow_analyze/parsers/` - Completed 2026-01-26 (THUNK #827) |
| 2026-01-26 | 10.1.2 | - [x] **10.1.2** Integrate RovoDev parser into rollflow_analyze pipeline - Completed 2026-01-26 (THUNK #827) |
| 2026-01-26 | 10.2.1 | - [x] **10.2.1** Update docs/events.md with RovoDev format section - Completed 2026-01-26 (THUNK #827) |
| 2026-01-26 | 11.1.1 | - [x] **11.1.1** Create `skills/domains/ralph/thread-search-patterns.md` |
| 2026-01-26 | 11.1.2 | - [x] **11.1.2** Build THUNK.md parser (Python script) |
| 2026-01-26 | 11.1.3 | - [x] **11.1.3** Create SQLite schema for unified thread storage - Completed 2026-01-26 (THUNK #830) |
| 2026-01-26 | 11.2.1 | - [x] **11.2.1** Build `bin/brain-search` CLI tool |
| 2026-01-26 | 12.1.1 | - [x] **12.1.1** Create `skills/domains/infrastructure/agent-observability-patterns.md` |
| 2026-01-26 | 12.1.2 | - [x] **12.1.2** Create `docs/MARKER_SCHEMA.md` - formal spec for all markers |
| 2026-01-26 | 12.2.1 | - [x] **12.2.1** Add real-time event watcher `bin/brain-event --watch` |
| 2026-01-26 | 12.2.2 | - [x] **12.2.2** Create cross-run aggregation queries for cache.sqlite |
| 2026-01-26 | 21.2.1 | - [x] **21.2.1** Add "Read Budget" section to `workers/ralph/PROMPT.md` [HIGH] |
| 2026-01-26 | 21.2.2 | - [x] **21.2.2** Add "Required Startup Procedure" to PROMPT.md [MEDIUM] |
| 2026-01-26 | 21.2.3 | - [x] **21.2.3** Update `templates/ralph/PROMPT.md` with same changes [MEDIUM] |
| 2026-01-26 | 21.3.1 | - [x] **21.3.1** Update `skills/domains/ralph/thread-search-patterns.md` [MEDIUM] |
| 2026-01-26 | 21.3.2 | - [x] **21.3.2** Update `NEURONS.md` to reference `docs/TOOLS.md` [LOW] |

### Archived on 2026-01-26 (Batch 6)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 13.1.1 | - [x] **13.1.1** Create `skills/domains/ralph/tool-wrapper-patterns.md` |
| 2026-01-26 | 13.1.2 | - [x] **13.1.2** Extract non-cacheable tools to config file |
| 2026-01-26 | 13.2.1 | - [x] **13.2.1** Prototype YAML tool registry schema |
| 2026-01-26 | 14.1.1 | - [x] **14.1.1** Add idempotency check to `cortex/cleanup_cortex_plan.sh` [HIGH] |
| 2026-01-26 | 14.2.1 | - [x] **14.2.1** Create `tools/thunk_dedup.sh` one-time cleanup script [HIGH] |
| 2026-01-26 | 14.2.2 | - [x] **14.2.2** Run dedup on `workers/ralph/THUNK.md` [MEDIUM] |
| 2026-01-26 | 15.1.1 | - [x] **15.1.1** Create `tools/skill_graph/extract_links.py` [HIGH] |
| 2026-01-26 | 15.2.1 | - [x] **15.2.1** Create `tools/skill_graph/generate_graph.py` [MEDIUM] |
| 2026-01-26 | 15.2.2 | - [x] **15.2.2** Create `tools/skill_graph/skill_graph.sh` wrapper [LOW] |
| 2026-01-26 | 15.3.1 | - [x] **15.3.1** Create `tools/skill_graph/README.md` [LOW] |
| 2026-01-26 | 16.1.1 | - [x] **16.1.1** Create `skills/domains/anti-patterns/README.md` [HIGH] |
| 2026-01-26 | 16.2.1 | - [x] **16.2.1** Create `skills/domains/anti-patterns/shell-anti-patterns.md` [HIGH] |
| 2026-01-26 | 16.3.1 | - [x] **16.3.1** Create `skills/domains/anti-patterns/markdown-anti-patterns.md` [MEDIUM] |
| 2026-01-26 | 16.3.2 | - [x] **16.3.2** Create `skills/domains/anti-patterns/ralph-anti-patterns.md` [MEDIUM] |
| 2026-01-26 | 16.3.3 | - [x] **16.3.3** Create `skills/domains/anti-patterns/documentation-anti-patterns.md` [LOW] |
| 2026-01-26 | 16.4.1 | - [x] **16.4.1** Update `skills/index.md` and `skills/SUMMARY.md` with anti-patterns [LOW] |
| 2026-01-26 | 17.1.1 | - [x] **17.1.1** Create `tools/brain_dashboard/collect_metrics.sh` [HIGH] |
| 2026-01-26 | 17.2.1 | - [x] **17.2.1** Create `tools/brain_dashboard/generate_dashboard.py` [HIGH] |
| 2026-01-26 | 17.2.2 | - [x] **17.2.2** Create dashboard HTML template with charts [MEDIUM] |
| 2026-01-26 | 17.3.1 | - [x] **17.3.1** Create `tools/brain_dashboard/README.md` [LOW] |
| 2026-01-26 | 17.3.2 | - [x] **17.3.2** Add dashboard generation to `cortex/snapshot.sh` (optional) [LOW] |
| 2026-01-26 | 18.1.1 | - [x] **18.1.1** Create `tools/skill_freshness.sh` [HIGH] |
| 2026-01-26 | 18.1.2 | - [x] **18.1.2** Add `--days N` threshold flag [MEDIUM] |
| 2026-01-26 | 18.1.3 | - [x] **18.1.3** Add CI-friendly exit code [LOW] |
| 2026-01-26 | 18.2.1 | - [x] **18.2.1** Add freshness summary to `skills/SUMMARY.md` [LOW] |
| 2026-01-26 | 19.1.1 | - [x] **19.1.1** Create `tools/pattern_miner/mine_patterns.sh` [HIGH] |
| 2026-01-26 | 19.1.2 | - [x] **19.1.2** Create `tools/pattern_miner/analyze_commits.py` [HIGH] |
| 2026-01-26 | 19.2.1 | - [x] **19.2.1** Create `tools/pattern_miner/README.md` [LOW] |
| 2026-01-26 | 20.1.1 | - [x] **20.1.1** Create `tools/skill_quiz/extract_scenarios.py` [MEDIUM] |
| 2026-01-26 | 20.2.1 | - [x] **20.2.1** Create `tools/skill_quiz/quiz.sh` interactive wrapper [MEDIUM] |
| 2026-01-26 | 20.2.2 | - [x] **20.2.2** Add score tracking across rounds [LOW] |
| 2026-01-26 | 20.3.1 | - [x] **20.3.1** Create `tools/skill_quiz/README.md` [LOW] |
| 2026-01-26 | 21.1.1 | - [x] **21.1.1** Rename `bin/thunk-parse` → `tools/thunk_parser.py` [MEDIUM] |
| 2026-01-26 | 21.1.2 | - [x] **21.1.2** Add `--query-id` option to thunk_parser.py [HIGH] |
| 2026-01-26 | 21.1.3 | - [x] **21.1.3** Add `--last-id` option to thunk_parser.py [HIGH] |
| 2026-01-26 | 21.1.4 | - [x] **21.1.4** Add `--search` option with keyword matching [MEDIUM] |

### Archived on 2026-01-26 (Batch 7)

| Date | Task ID | Description |
|------|---------|-------------|

### Archived on 2026-01-26 (Batch 8)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 23.1.1 | - [x] **23.1.1** Fix `sync_completions_to_cortex.sh` unbound variable **[HIGH]** |
| 2026-01-26 | 23.1.2 | - [x] **23.1.2** Untrack rollflow cache sqlite files and ensure ignored **[HIGH]** |
| 2026-01-26 | 23.2.1 | - [x] **23.2.1** Replace `git add -A` with scoped staging allowlist/denylist **[HIGH]** |
| 2026-01-26 |     - [x] `git add -A` no longer used |     - [x] `git add -A` no longer used |
| 2026-01-26 |     - [x] Core files always staged (IMPLEMENTATION_PLAN.md, THUNK.md) |     - [x] Core files always staged (IMPLEMENTATION_PLAN.md, THUNK.md) |
| 2026-01-26 |     - [x] Artifacts excluded by default |     - [x] Artifacts excluded by default |
| 2026-01-26 |     - [x] Cortex copies excluded by default |     - [x] Cortex copies excluded by default |
| 2026-01-26 |     - [x] Cache files excluded by default |     - [x] Cache files excluded by default |
| 2026-01-26 |     - [x] Hash regenerated in all `.verify/` directories |     - [x] Hash regenerated in all `.verify/` directories |
| 2026-01-26 | 23.3.1 | - [x] **23.3.1** Make `cortex/snapshot.sh` avoid regenerating dashboard/metrics by default **[MEDIUM]** |
| 2026-01-26 | 23.3.2 | - [x] **23.3.2** Pass changed `.md` files to fix-markdown instead of scanning repo root **[MEDIUM]** |
| 2026-01-26 | 23.4.1 | - [x] **23.4.1** Add PROMPT instruction: check THUNK before re-validating tasks **[LOW]** |
| 2026-01-26 | 9C.2.1 | - [x] **9C.2.1** Create batch task template in `templates/ralph/PROMPT.md` |
| 2026-01-26 | 9C.2.2 | - [x] **9C.2.2** BATCH: Create missing language templates (javascript, go, website) |
| 2026-01-26 | 9C.2.B2 | - [x] **9C.2.B2** BATCH: Update skills documentation (combines 7.2.1, 7.2.2) |
| 2026-01-26 | 9C.2.B3 | - [x] **9C.2.B3** BATCH: Improve onboarding docs (combines 7.1.1, 7.1.2) |
| 2026-01-26 | 9C.3.1 | - [x] **9C.3.1** Add duration tracking to `current_ralph_tasks.sh` footer |
| 2026-01-26 | 9C.3.2 | - [x] **9C.3.2** Create decomposition checklist in `skills/playbooks/` |
| 2026-01-26 | 22.2.3 | - [x] **22.2.3** Fix MD056 in workers/ralph/THUNK.md line 801 (escape pipes) |

### Archived on 2026-01-26 (Batch 9)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 |     - [x] `git add -A` no longer used |     - [x] `git add -A` no longer used |
| 2026-01-26 |     - [x] Core files always staged (IMPLEMENTATION_PLAN.md, THUNK.md) |     - [x] Core files always staged (IMPLEMENTATION_PLAN.md, THUNK.md) |
| 2026-01-26 |     - [x] Artifacts excluded by default |     - [x] Artifacts excluded by default |
| 2026-01-26 |     - [x] Cortex copies excluded by default |     - [x] Cortex copies excluded by default |
| 2026-01-26 |     - [x] Cache files excluded by default |     - [x] Cache files excluded by default |
| 2026-01-26 |     - [x] Hash regenerated in all `.verify/` directories |     - [x] Hash regenerated in all `.verify/` directories |

### Archived on 2026-01-26 (Batch 10)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 |     - [x] `git add -A` no longer used |     - [x] `git add -A` no longer used |
| 2026-01-26 |     - [x] Core files always staged (IMPLEMENTATION_PLAN.md, THUNK.md) |     - [x] Core files always staged (IMPLEMENTATION_PLAN.md, THUNK.md) |
| 2026-01-26 |     - [x] Artifacts excluded by default |     - [x] Artifacts excluded by default |
| 2026-01-26 |     - [x] Cortex copies excluded by default |     - [x] Cortex copies excluded by default |
| 2026-01-26 |     - [x] Cache files excluded by default |     - [x] Cache files excluded by default |
| 2026-01-26 |     - [x] Hash regenerated in all `.verify/` directories |     - [x] Hash regenerated in all `.verify/` directories |

### Archived on 2026-01-26

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 24.1.1 | - [x] **24.1.1** Find exact emitter of "Session termination failed: 404" **[HIGH]** |
| 2026-01-26 | 24.1.2 | - [x] **24.1.2** Trace session lifecycle and termination call path **[HIGH]** |
| 2026-01-26 | 24.1.3 | - [x] **24.1.3** Capture minimal reproduction log snippet **[HIGH]** |
| 2026-01-26 | 24.1.4 | - [x] **24.1.4** Classify 404 as harmless-noise vs actionable-bug **[HIGH]** |
| 2026-01-26 | 24.2.1 | - [x] **24.2.1** Instrument emitter with contextual info **[MEDIUM]** |
| 2026-01-26 | 24.2.2 | - [x] **24.2.2** Add dedupe/throttle for repeated identical errors **[MEDIUM]** |
| 2026-01-26 | 24.2.3 | - [x] **24.2.3** Add DEBUG/VERBOSE toggle for full error output **[LOW]** |
| 2026-01-26 | 24.3.1 | - [x] **24.3.1** FIX IF: Double-termination / already-cleaned session **[MEDIUM]** |
| 2026-01-26 | 24.3.2 | - [x] **24.3.2** FIX IF: Stale/invalid session ID **[MEDIUM]** |
| 2026-01-26 | 24.3.3 | - [x] **24.3.3** FIX IF: Wrong endpoint/path **[MEDIUM]** |
| 2026-01-26 | 24.3.4 | - [x] **24.3.4** FIX IF: External best-effort cleanup (expected 404) **[MEDIUM]** |
| 2026-01-26 | 24.4.1 | - [x] **24.4.1** Document PLAN-ONLY boundary rules in AGENTS.md **[HIGH]** |
| 2026-01-26 | 24.4.2 | - [x] **24.4.2** Add PLAN-ONLY guard function to shared lib **[MEDIUM]** |
| 2026-01-26 | 24.4.4 | - [x] **24.4.4** Add acceptance test proving PLAN-ONLY mode is respected **[HIGH]** |
| 2026-01-26 | 23.2.3 | - [x] **23.2.3** Fix cleanup_plan.sh to reliably locate workers/IMPLEMENTATION_PLAN.md **[HIGH]** |
| 2026-01-26 | 23.2.2 | - [x] **23.2.2** End-of-loop cleanup when no unchecked tasks remain **[MEDIUM]** |
| 2026-01-26 | 21.3.3 | - [x] **21.3.3** Add tools reference to `skills/index.md` [LOW] |
| 2026-01-26 | 22.3.1 | - [x] **22.3.1** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 159 |
| 2026-01-26 | 22.3.2 | - [x] **22.3.2** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 241 |
| 2026-01-26 | 22.3.3 | - [x] **22.3.3** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 295 |
| 2026-01-26 | 22.4.1 | - [x] **22.4.1** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 159 |
| 2026-01-26 | 22.4.2 | - [x] **22.4.2** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 241 |
| 2026-01-26 | 22.4.3 | - [x] **22.4.3** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 295 |
| 2026-01-26 | 22.4B.1 | - [x] **22.4B.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 261 |
| 2026-01-26 | 22.4B.2 | - [x] **22.4B.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 290 |
| 2026-01-26 | 22.4B.3 | - [x] **22.4B.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 315 |
| 2026-01-26 | 22.4B.4 | - [x] **22.4B.4** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 319 |
| 2026-01-26 | 22.4B.5 | - [x] **22.4B.5** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 320 |
| 2026-01-26 | 22.4B.6 | - [x] **22.4B.6** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 321 |
| 2026-01-26 | 22.4B.7 | - [x] **22.4B.7** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 325 |
| 2026-01-26 | 22.4C.1 | - [x] **22.4C.1** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 261 |
| 2026-01-26 | 22.4C.2 | - [x] **22.4C.2** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 290 |
| 2026-01-26 | 22.4C.3 | - [x] **22.4C.3** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 315 |
| 2026-01-26 | 22.4C.4 | - [x] **22.4C.4** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 319 |
| 2026-01-26 | 22.4C.5 | - [x] **22.4C.5** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 320 |
| 2026-01-26 | 22.4C.6 | - [x] **22.4C.6** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 321 |
| 2026-01-26 | 22.4C.7 | - [x] **22.4C.7** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 325 |
| 2026-01-26 | 22.5.1 | - [x] **22.5.1** Fix MD024 in cortex/PLAN_DONE.md line 186 |
| 2026-01-26 | 22.5.2 | - [x] **22.5.2** Fix MD024 in cortex/PLAN_DONE.md line 210 |
| 2026-01-26 | 22.5.3 | - [x] **22.5.3** Fix MD024 in cortex/PLAN_DONE.md line 221 |
| 2026-01-26 | 22.6.1 | - [x] **22.6.1** Fix MD001 in workers/PLAN_DONE.md line 7 |

### Archived on 2026-01-26

| Date | Task ID | Description |
|------|---------|-------------|
