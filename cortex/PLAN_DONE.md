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

### Archived on 2026-01-26 (Batch 11)

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

### Archived on 2026-01-26 (Batch 12)

| Date | Task ID | Description |
|------|---------|-------------|

### Archived on 2026-01-27 (Batch 13)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 0.L.1 | - [x] **0.L.1** Fix MD024 in cortex/PLAN_DONE.md (duplicate heading "Archived on 2026-01-26") |
| 2026-01-27 | 0.L.2 | - [x] **0.L.2** Fix MD056 table column count errors in TEMPLATE_DRIFT_REPORT.md |
| 2026-01-27 | 0.L.3 | - [x] **0.L.3** Fix MD032 blank line errors in TEMPLATE_DRIFT_REPORT.md |
| 2026-01-27 | 0.L.4 | - [x] **0.L.4** Fix MD009 trailing spaces in TEMPLATE_DRIFT_REPORT.md |
| 2026-01-27 | 0.L.5 | - [x] **0.L.5** Fix MD040 missing language in TEMPLATE_DRIFT_REPORT.md |
| 2026-01-27 | 0.L.6 | - [x] **0.L.6** Fix MD056 table column count errors in workers/ralph/THUNK.md |
| 2026-01-27 | 25.1.1 | - [x] **25.1.1** Scaffold Brain Map app workspace (frontend + backend skeleton) |
| 2026-01-27 | 25.1.2 | - [x] **25.1.2** Define Markdown note discovery + loading (scan notes root) |
| 2026-01-27 | 25.1.3 | - [x] **25.1.3** Implement canonical frontmatter parser and validator |
| 2026-01-27 | 25.1.4 | - [x] **25.1.4** Build SQLite schema and deterministic index rebuild |
| 2026-01-27 | 25.1.5 | - [x] **25.1.5** Implement `/search` endpoint using the index (fast global search) |
| 2026-01-27 | 25.1.6 | - [x] **25.1.6** Implement `/graph` endpoint (graph snapshot for UI) |
| 2026-01-27 | 25.1.7 | - [x] **25.1.7** Implement `/node/{id}` read endpoint |
| 2026-01-27 | 25.1.8 | - [x] **25.1.8** Implement node create (`POST /node`) with markdown-first write + reindex |
| 2026-01-27 | 25.1.9 | - [x] **25.1.9** Implement node update (`PUT /node/{id}`) with atomic write + reindex |
| 2026-01-27 | 25.1.10 | - [x] **25.1.10** Implement `/generate-plan` endpoint (deterministic markdown + optional write) |
| 2026-01-27 | 25.1.11 | - [x] **25.1.11** Frontend: Graph view rendering from `/graph` (sigma.js) |
| 2026-01-27 | 25.1.12 | - [x] **25.1.12** Frontend: Node detail panel (read + edit + save) |
| 2026-01-27 | 25.1.13 | - [x] **25.1.13** Frontend: Search palette (Ctrl+K) via `/search` |
| 2026-01-27 | 25.1.14 | - [x] **25.1.14** Frontend: Basic recency heat overlay toggle |
| 2026-01-27 | 25.1.15 | - [x] **25.1.15** Frontend: Generate plan wizard (minimal) using `/generate-plan` |
| 2026-01-27 | 25.2.1 | - [x] **25.2.1** Backend: compute and return recency heat deterministically |
| 2026-01-27 | 25.2.2 | - [x] **25.2.2** Backend: density heat (degree + clustering coefficient) with caching |
| 2026-01-27 | 25.2.3 | - [x] **25.2.3** Backend: task heat based on TaskContract neighborhood |
| 2026-01-27 | 25.2.4 | - [x] **25.2.4** Frontend: hotspots / insights panel (top N) |
| 2026-01-27 | 25.2.5 | - [x] **25.2.5** Frontend: filtering controls (type/status/tags/recency) |
| 2026-01-27 | 25.2.6 | - [x] **25.2.6** Backend: file watcher + incremental reindex |
| 2026-01-27 | 25.3.1 | - [x] **25.3.1** Frontend: semantic zoom + clustering (supernodes) |
| 2026-01-27 | 25.3.2 | - [x] **25.3.2** Backend: dependency analysis (cycles, critical path hints) |
| 2026-01-27 | 25.3.3 | - [x] **25.3.3** Plan generator improvements (toposort, richer dependency sections) |
| 2026-01-27 | 24.5.1 | - [x] **24.5.1** Decide + (if approved) template `render_ac_status.sh` |
| 2026-01-27 | 24.6.1 | - [x] **24.6.1** Align model-header single-source-of-truth + prompt batching rule across canonical files |
| 2026-01-27 | 24.7.1 | - [x] **24.7.1** Backport `loop.sh` scoped staging improvements into templates (without Brain-specific paths) |
| 2026-01-27 | 24.8.1 | - [x] **24.8.1** Backport verifier caching into templates without regressing A1 root/path logic |
| 2026-01-27 | 24.9.1 | - [x] **24.9.1** Backport `current_ralph_tasks.sh` parsing improvements into templates |

### Archived on 2026-01-27 (Batch 14)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 26.2 | - [x] **26.2** Verify all Brain Map backend tests pass |
| 2026-01-27 | 26.3 | - [x] **26.3** Add Brain Map test running to verifier (optional check) |
| 2026-01-27 | 26.4 | - [x] **26.4** Document Brain Map development workflow |
| 2026-01-27 | 27.1 | - [x] **27.1** Review GAP_BACKLOG for P0/P1 items ready for promotion |
| 2026-01-27 | 27.2 | - [x] **27.2** Promote "Custom Semantic Code Review Tool (LLM-Based Linting)" gap |
| 2026-01-27 | 28.1 | - [x] **28.1** Audit templates for post-Phase-24 drift |

### Archived on 2026-01-27 (Warnings)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | WARN.MD024.cortex/PLAN_DONE.md | - [x] **WARN.MD024.cortex/PLAN_DONE.md** - Fix MD024/no-duplicate-heading in cortex/PLAN_DONE.md line 323 |
| 2026-01-27 | WARN.MD024.workers/PLAN_DONE.md | - [x] **WARN.MD024.workers/PLAN_DONE.md** - Fix MD024/no-duplicate-heading in workers/PLAN_DONE.md line 265 |

### Archived on 2026-01-27 (Batch 1)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 29.1.1 | - [x] **29.1.1** Remove `zoomLevel` from `useEffect` dependency array in `GraphView.jsx` |

### Archived on 2026-01-27 (Batch 2)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 29.1.2 | - [x] **29.1.2** Add derived state for cluster mode toggle |
| 2026-01-27 | 29.2.1 | - [x] **29.2.1** Add `labelRenderedSizeThreshold` to Sigma config |
| 2026-01-27 | 29.3.1 | - [x] **29.3.1** Make Hotspots collapsible using `<details>` element |
| 2026-01-27 | 30.1.1 | - [x] **30.1.1** Refactor cluster rebuild to use `showClusters` boolean |

### Archived on 2026-01-27 (Batch 3)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 30.2.1 | - [x] **30.2.1** Add "Fit to Screen" button |
| 2026-01-27 | 30.2.2 | - [x] **30.2.2** Add zoom controls (+/- buttons) |

### Archived on 2026-01-27 (Batch 4)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 30.2.3 | - [x] **30.2.3** Add minimap or breadcrumb indicator |
| 2026-01-27 | 30.3.1 | - [x] **30.3.1** Implement hover-only label mode - Custom label reducer that renders labels only for `data.highlighted` or `data.hovered` nodes, add enterNode/leaveNode handlers to set hovered attribute. AC: Labels appear only on hover. Verification: Mouse over to label appears; move away to disappears. If Blocked: Lower priority; 29.2.1 threshold sufficient |
| 2026-01-27 | 30.3.2 | - [x] **30.3.2** Zoom-based label sizing - Set `labelSize: Math.max(10, Math.min(16, 12 * zoomLevel))` to scale font size with zoom level. AC: Labels grow/shrink as user zooms in/out. Verification: Zoom in → bigger labels; zoom out → smaller labels. If Blocked: Skip; static size fine for MVP |
| 2026-01-27 | 30.4.1 | - [x] **30.4.1** Fix `InsightsPanel` positioning (remove `position: fixed`) |

### Archived on 2026-01-27 (Batch 5)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 34.1.1 | - [x] **34.1.1** Create `bin/discord-post` with stdin input and chunking |
| 2026-01-27 | 34.1.2 | - [x] **34.1.2** Add `generate_iteration_summary` function to `loop.sh` |
| 2026-01-27 | - [x] MVP complete: Discord posts after every iteration | - [x] MVP complete: Discord posts after every iteration |
| 2026-01-27 | - [x] Long summaries chunk correctly (≤2000 chars per message) | - [x] Long summaries chunk correctly (≤2000 chars per message) |
| 2026-01-27 | - [x] Missing/invalid webhook doesn't crash loop | - [x] Missing/invalid webhook doesn't crash loop |
| 2026-01-27 | - [x] Dry-run mode works for testing | - [x] Dry-run mode works for testing |
| 2026-01-27 | 31.1.1 | - [x] **31.1.1** Enforce canonical `type` + `status` enums end-to-end - Backend validation: `type ∈ {Inbox, Concept, System, Decision, TaskContract, Artifact}` and `status ∈ {idea, planned, active, blocked, done, archived}` with clear 400 errors; frontend dropdowns use exact values; node creation defaults: `type=Inbox`, `status=idea` when omitted. AC: Creating/updating node with invalid type/status returns 400 with allowed values; UI only allows allowed values. Verification: Try POST invalid type → 400; Quick Add shows dropdowns with exact enums. If Blocked: Add frontend dropdowns first, backend validation second |

### Archived on 2026-01-27

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 32.1.2 | - [x] **32.1.2** Implement shortest path algorithm - Backend endpoint `/path?from={id}&to={id}` returns shortest path using BFS/Dijkstra on edge graph. AC: Returns array of node IDs in path order. Verification: Request path between known nodes → correct path returned. If Blocked: Use graphology `shortestPath()` client-side |
| 2026-01-27 | 32.1.3 | - [x] **32.1.3** Highlight path on graph - Render path nodes with glow effect, edges in path with bright color (e.g., cyan), fade non-path elements. AC: Path visually distinct. Verification: Find path → highlighted nodes/edges clear. If Blocked: Just zoom to fit path nodes |
| 2026-01-27 | 32.1.4 | - [x] **32.1.4** Show path metadata - Display path length, intermediate nodes, estimated "semantic distance" (based on edge weights). AC: Path info panel shows details. Verification: Find path → see "4 hops via Node X, Y, Z". If Blocked: Just show node count |
| 2026-01-27 | 32.2.1 | - [x] **32.2.1** Implement auto-tagging suggestions - Backend analyzes node body text, suggests tags using keyword extraction (TF-IDF or simple regex). AC: API endpoint `/node/{id}/suggest-tags` returns tag array. Verification: Request suggestions for sample note → relevant tags returned. If Blocked: Use predefined tag dictionary matching |
| 2026-01-27 | 32.2.2 | - [x] **32.2.2** Orphan node detection - Backend identifies nodes with zero edges (in/out degree = 0), returns list via `/insights/orphans`. AC: Orphans endpoint works. Verification: Create isolated node → appears in orphans list. If Blocked: Client-side filter (graph.nodes.filter(n => graph.degree(n) === 0)) |

### Archived on 2026-01-27 (Batch 6)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 0.1 | - [x] **0.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md:43 (Expected: 2; Actual: 3) |
| 2026-01-27 | 0.2 | - [x] **0.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md:44 (Expected: 2; Actual: 4) |
| 2026-01-27 | 0.3 | - [x] **0.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md:45 (Expected: 2; Actual: 5) |
| 2026-01-27 | 0.4 | - [x] **0.4** Fix MD012 in workers/IMPLEMENTATION_PLAN.md:51 (Expected: 2; Actual: 3) |
| 2026-01-27 | 32.2.3 | - [x] **32.2.3** Bridge node identification - Calculate betweenness centrality (nodes that connect disparate clusters), highlight top 5 in UI. AC: Bridge nodes marked with icon. Verification: Manually create bridge topology → correct nodes identified. If Blocked: Skip betweenness, use degree centrality (most connected) |
| 2026-01-27 | 32.2.4 | - [x] **32.2.4** Stale note alerts - Flag nodes with `updated_at > 90 days`, show in insights panel with "Update recommended". AC: Stale nodes listed. Verification: Create old note → appears in stale list. If Blocked: Use recency metric already implemented |
| 2026-01-27 | 32.3.1 | - [x] **32.3.1** Add "Save View" button - Captures current filter state + zoom + camera position, stores in localStorage with user-defined name. AC: Save View → prompts for name → saved. Verification: Save view "My Project" → appears in views list. If Blocked: Save filters only (not camera state) |
| 2026-01-27 | 32.3.2 | - [x] **32.3.2** Create Views dropdown in header - List of saved views, click to load (applies filters, restores camera). AC: Dropdown shows saved views. Verification: Load saved view → graph state restored. If Blocked: Use bookmarks panel in sidebar |
| 2026-01-27 | 32.3.3 | - [x] **32.3.3** Implement view sharing - "Share View" generates URL with encoded filter params (e.g., `/graph?view=base64encodedstate`). AC: Copy link, open in new tab → same view. Verification: Share link to another user → they see same filtered graph. If Blocked: Copy filter JSON to clipboard |
| 2026-01-27 | 32.3.4 | - [x] **32.3.4** Add default views - Preset views: "All Tasks", "Blocked Items", "Recent Activity (7d)", "Orphans". AC: Default views available on first load. Verification: Fresh session → 4 default views shown. If Blocked: Just document filter examples in help |

### Archived on 2026-01-28 (Phase 32-33 Tasks)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-28 | 32.4.3 | - [x] **32.4.3** Add filter preview count - Show "X nodes match" before applying filter. AC: Preview count updates as chips change. Verification: Adjust filter → count updates live. If Blocked: Apply-then-count (no preview) |
| 2026-01-28 | 32.4.4 | - [x] **32.4.4** Save filter as named view - "Save as View" button in query builder creates reusable saved view. AC: Query builder state saved. Verification: Build complex query → save → reload → works. If Blocked: Manual JSON export |
| 2026-01-28 | 33.1.1 | - [x] **33.1.1** Add timeline scrubber component - Slider at bottom of graph showing date range (earliest to latest `created_at`), drag to filter nodes by date. AC: Scrubber renders with correct date range. Verification: Drag slider → nodes fade in/out. If Blocked: Use discrete buttons (Today, This Week, This Month, All Time) |
| 2026-01-28 | 33.1.2 | - [x] **33.1.2** Implement time-based filtering - As scrubber moves, filter nodes where `created_at <= selected_date`, animate nodes appearing/disappearing. AC: Time travel works. Verification: Scrub to past date → older nodes hidden. If Blocked: Show all nodes, just highlight time-filtered subset |
| 2026-01-28 | 33.1.3 | - [x] **33.1.3** Add "Play" animation - Auto-advance scrubber from start to end (1 second per week), show graph growing over time. AC: Play button animates timeline. Verification: Click Play → graph evolves. If Blocked: Manual scrub only |
| 2026-01-28 | 33.1.4 | - [x] **33.1.4** Activity heatmap calendar - GitHub-style contribution calendar showing days with most creates/updates. AC: Calendar renders with activity data. Verification: Click date → filters graph to that day. If Blocked: Skip calendar, use histogram chart |
| 2026-01-28 | 33.2.1 | - [x] **33.2.1** Add Comments tab to InsightsPanel - New tab (next to Details tab) showing threaded comments for selected node. AC: Tab switcher works. Verification: Click Comments → shows comment list. If Blocked: Single comment field (no threading) |
| 2026-01-28 | 33.2.2 | - [x] **33.2.2** Backend: Store comments in frontmatter - `comments: [{author, text, timestamp, replies: [...]}]` array in markdown. POST to `/node/{id}/comments`. AC: Comments persisted. Verification: Add comment → markdown updated. If Blocked: Use separate JSON file per node |
| 2026-01-28 | 33.2.3 | - [x] **33.2.3** Frontend: Render comment threads - Show comments in nested list, reply button adds to thread. AC: Threading works. Verification: Reply to comment → indented reply shown. If Blocked: Flat list (no replies) |
| 2026-01-28 | 33.2.4 | - [x] **33.2.4** Add mentions (@username) - Detect `@username` in comment text, notify mentioned user (if multi-user setup). AC: Mentions highlighted. Verification: Type @alice → suggestion appears. If Blocked: Plain text only |
| 2026-01-28 | 33.3.1 | - [x] **33.3.1** Export graph as PNG - Button in header "Export → PNG", renders current graph view to canvas, downloads as image file. AC: PNG export works. Verification: Click Export PNG → file downloads. If Blocked: Use screenshot library (html2canvas) |
| 2026-01-28 | 33.3.2 | - [x] **33.3.2** Export graph as SVG - Vector format export for high-quality prints/presentations. AC: SVG export works. Verification: Open SVG in Inkscape → editable vectors. If Blocked: PNG-only for MVP |
| 2026-01-28 | 33.3.3 | - [x] **33.3.3** Export as GraphML/GEXF - Standard graph formats for Gephi/Cytoscape import. AC: GraphML file valid. Verification: Import into Gephi → graph loads. If Blocked: Export JSON only |
| 2026-01-28 | 33.3.4 | - [x] **33.3.4** Markdown table export - Export filtered nodes as markdown table (ID, Title, Type, Status, Tags). AC: Table export works. Verification: Open in markdown editor → table renders. If Blocked: CSV export instead |
| 2026-01-28 | 33.4.1 | - [x] **33.4.1** Add "Present" button - Enters full-screen mode, hides UI panels, shows graph + navigation controls only. AC: Presentation mode toggles. Verification: Click Present → full-screen graph. If Blocked: Just hide sidebars (not true full-screen) |
| 2026-01-28 | 33.4.2 | - [x] **33.4.2** Keyboard navigation - Arrow keys navigate between connected nodes (follow edges), space bar zooms to focused node. AC: Keyboard nav works. Verification: Press Right → moves to connected node. If Blocked: Click-only navigation |

### Archived on 2026-01-28 (Batch 1)

| Date | Task ID | Description |
|------|---------|-------------|

### Archived on 2026-01-28 (Batch 3)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-28 | 0.W.MD012.workers/PLAN_DONE.md | - [x] **0.W.MD012.workers/PLAN_DONE.md** Fix MD012 in workers/PLAN_DONE.md |

### Archived on 2026-01-28 (Lint Fixes)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-28 | 0-Lint.1.1 | - [x] **0-Lint.1.1** Fix MD004/ul-style errors in cortex/docs/MindMerge_MindMerge-PR.md |
| 2026-01-28 | 36.1.2 | - [x] **36.1.2** Remove hover/zoom label duplication by matching default placement and ensuring hover "upgrades" the same label |

### Archived on 2026-01-28

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-28 | 0.1.1 | - [x] **0.1.1** Fix MD004 in cortex/docs/MindMerge_MindMerge-PR.md |
