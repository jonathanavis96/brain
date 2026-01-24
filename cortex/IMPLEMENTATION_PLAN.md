# Cortex Implementation Plan

**Purpose:** Task Contracts for Ralph workers. Each contract defines an atomic task with clear goals and acceptance criteria.

**Workflow:**

1. Cortex creates/updates Task Contracts here
2. Ralph's `loop.sh` syncs this file via `sync_cortex_plan.sh`
3. Ralph works through tasks, marking them complete
4. Cortex reviews progress and creates new contracts

---

## Current Status

**Last Updated:** 2026-01-24 13:45:00  
**Progress:** 17 pending tasks in Phase 12 (RollFlow Log Analyzer) - scaffold ready

---

## Completed Phases

Phases 0, 2, 3, 4, 5, 6 completed - see `workers/ralph/THUNK.md` for details.

---

<!-- Cortex adds new Task Contracts below this line -->

## Phase 9: Verifier Warnings Cleanup

**Goal:** Resolve all WARN items from verifier to achieve 0 warnings.

### Phase 9.1: Template Sync Warnings

- [x] **9.1.1** Sync `thunk_ralph_tasks.sh` to template
  - Copy `workers/ralph/thunk_ralph_tasks.sh` → `templates/ralph/thunk_ralph_tasks.sh`
  - **AC:** `diff -q workers/ralph/thunk_ralph_tasks.sh templates/ralph/thunk_ralph_tasks.sh` shows "match"
  - **Fixes:** Template.1

- [x] **9.1.2** Update `loop.sh` hash baseline (human approved change)
  - Run: `cd workers/ralph && sha256sum loop.sh | cut -d' ' -f1 > .verify/loop.sha256`
  - Also update: `../../.verify/loop.sha256`
  - **AC:** Protected.1 check passes
  - **Fixes:** Protected.1
  - **Note:** This is a HUMAN task - Ralph cannot modify hash baselines

- [x] **9.1.3** Sync `loop.sh` template with workers version
  - **AC:** Hygiene.TemplateSync.2 check passes
  - **Fixes:** Hygiene.TemplateSync.2

### Phase 9.2: Shellcheck Warnings in Protected Files

- [x] **9.2.1** Fix shellcheck issues in `workers/ralph/loop.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/loop.sh` returns 0 warnings
  - **Fixes:** Lint.Shellcheck.LoopSh
  - **Note:** Protected file - will need hash baseline update after

- [x] **9.2.2** Fix shellcheck issues in `workers/ralph/verifier.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/verifier.sh` returns 0 warnings
  - **Fixes:** Lint.Shellcheck.VerifierSh
  - **Note:** Protected file - will need hash baseline update after

- [x] **9.2.3** Fix shellcheck issues in `workers/ralph/current_ralph_tasks.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/current_ralph_tasks.sh` returns 0 warnings
  - **Fixes:** Lint.Shellcheck.CurrentRalphTasks

- [x] **9.2.4** Fix shellcheck issues in `workers/ralph/thunk_ralph_tasks.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/thunk_ralph_tasks.sh` returns 0 warnings
  - **Fixes:** Lint.Shellcheck.ThunkRalphTasks

### Phase 9.3: Markdown Fence Balance Warnings

- [x] **9.3.1** Fix unbalanced code fences in `NEURONS.md`
  - Add missing closing ``` fences (currently 20 opens, 0 closes)
  - **AC:** `grep -c "^\`\`\`[a-z]" NEURONS.md` equals `grep -c "^\`\`\`$" NEURONS.md`
  - **Fixes:** Lint.Markdown.NeuronsBalancedFences

- [x] **9.3.2** Fix unbalanced code fences in `THOUGHTS.md`
  - Add missing closing ``` fences (currently 4 opens, 0 closes)
  - **AC:** `grep -c "^\`\`\`[a-z]" THOUGHTS.md` equals `grep -c "^\`\`\`$" THOUGHTS.md`
  - **Fixes:** Lint.Markdown.ThoughtsBalancedFences

**Phase AC:** `bash workers/ralph/verifier.sh` shows WARN: 0

---

## Phase 10: Sync Script Bug Fix

**Goal:** Fix sync_cortex_plan.sh crash when .last_sync is empty.

- [x] **10.1** Fix empty `.last_sync` file causing "bad array subscript" error
  - In `sync_cortex_plan.sh`, skip empty lines when reading `.last_sync`
  - Add: `[[ -z "$header_line" ]] && continue` inside the while loop
  - **AC:** `echo "" > .last_sync && bash sync_cortex_plan.sh --verbose` runs without error

---

## Phase 11: Verifier False Positive Fixes

**Goal:** Fix verifier checks that produce false positives, eliminating need for 23 waiver requests.

### Phase 11.1: Template Sync Detection

- [x] **11.1.1** Fix Hygiene.TemplateSync.1 and Hygiene.TemplateSync.2 checks
  - Current: Diff check reports mismatch when files are identical
  - Fix: Use `diff -q` exit code instead of parsing output
  - **AC:** Identical files report PASS, different files report WARN

- [x] **11.1.2** Fix Template.1 check (thunk_ralph_tasks.sh sync)
  - Same issue as above - false positive on identical files
  - **AC:** `diff -q workers/ralph/thunk_ralph_tasks.sh templates/ralph/thunk_ralph_tasks.sh` matches verifier result

### Phase 11.2: Shellcheck Detection

- [x] **11.2.1** Fix Lint.Shellcheck.* checks regex
  - Current: Verifier regex incorrectly detects shellcheck issues
  - Fix: Check shellcheck exit code (0 = pass) instead of parsing output
  - **AC:** Files that pass `shellcheck -e SC1091 <file>` with exit 0 report PASS

### Phase 11.3: Markdown Fence Counting

- [x] **11.3.1** Fix Lint.Markdown.*BalancedFences regex
  - Current: `^```[a-z]` matches directory tree lines with backticks (e.g., `├── .verify/`)
  - Fix: Use `^```[a-z]+$` or `^```[a-z]+ *$` to match only fence lines
  - **AC:** NEURONS.md and THOUGHTS.md report balanced fences

### Phase 11.4: Cleanup Stale Waivers

- [x] **11.4.1** Delete all waiver requests in `.verify/waiver_requests/`
  - These are all false positives that will be fixed by 11.1-11.3
  - **AC:** `.verify/waiver_requests/` directory is empty or contains only new valid requests

**Phase AC:** `bash workers/ralph/verifier.sh` shows WARN: 0 without any waivers

---

## Phase 12: RollFlow Log Analyzer

**Goal:** Build a system that parses Ralph/RollFlow loop logs, detects tool calls, labels PASS/FAIL, computes cache keys, and produces JSON reports + cache advice for loop efficiency.

**Definition of Done:** Running `python -m tools.rollflow_analyze --log-dir workers/ralph/logs --out artifacts/rollflow_reports/latest.json` produces a valid JSON report with tool calls, aggregates, and cache_advice. Optional `CACHE_SKIP=1` in loop.sh skips previously-passed identical tool calls.

**Warnings (read first):**

- Do not cache failures - A "FAIL" tool run must never be written into cache
- Cache keys must be stable - Exclude volatile data (timestamps, random IDs) from keys
- Logs are source of truth - This is read-only over logs, writes only cache artifacts + reports
- Fail-fast remains - Loop can still fail-fast on tool failure; analyzer runs after iterations

**Output Artifacts:**

- `artifacts/rollflow_reports/latest.json`
- `artifacts/rollflow_reports/<run_id>.json`
- `artifacts/rollflow_cache/cache.sqlite` (or JSONL fallback)

### Phase 12.1: Log Markers (Quick Wins)

**Goal:** Add minimal log markers so tool calls become reliable to parse.

- [x] **12.1.1** Add standardized START/END markers around tool calls in loop.sh
  - Add 2 log lines around every tool call:
    - `::TOOL_CALL_START:: id=<uuid> name=<tool> key=<cache_key> ts=<iso> git=<sha>`
    - `::TOOL_CALL_END:: id=<uuid> status=PASS|FAIL exit=<code> duration_ms=<n> err=<short>`
  - **AC:** Single iteration produces at least one well-formed START + END pair in logs
  - **If Blocked:** Start with simpler markers without cache_key, add key computation later

- [x] **12.1.2** Implement `cache_key` function in `workers/shared/common.sh`
  - cache_key = sha256 of: tool name + normalized args JSON + git SHA (optional)
  - **Goal:** Deterministic key for same tool+args across runs
  - **AC:** `source workers/shared/common.sh && cache_key "tool" '{"a":1}' == cache_key "tool" '{"a":1}'`
  - **If Blocked:** Use simple concatenation first, add JSON normalization later

- [x] **12.1.3** Add run_id and iteration_id markers to loop.sh
  - Write one header line per run + per iteration:
    - `::RUN:: id=<run_id> ts=<iso>`
    - `::ITER:: id=<iter_id> run_id=<run_id> ts=<iso>`
  - **Depends on:** None (optional enhancement, improves reporting grouping)
  - **AC:** Reports can group calls per run/iteration without guessing
  - **If Blocked:** Check existing RUN_ID export in loop.sh, extend rather than duplicate

### Phase 12.2: Data Model and Parser

**Goal:** Define internal schema and parsing approach for tool call analysis.

- [x] **12.2.1** Create project skeleton at `tools/rollflow_analyze/`
  - Scaffold already created with stub files (see `tools/rollflow_analyze/`)
  - Verify: `__init__.py`, `cli.py`, `models.py`, `report.py`, `cache_db.py`, `parsers/`
  - **AC:** `python -m tools.rollflow_analyze --help` works
  - **If Blocked:** Check PYTHONPATH includes tools/ directory

- [x] **12.2.2** Create `parsers/marker_parser.py`
  - Read logs line-by-line, match START/END markers, yield ToolCall objects
  - **Depends on:** 12.1.1, 12.2.1
  - **Goal:** Parse marker logs with >95% accuracy
  - **AC:** Unit test with sample log containing 5 tool calls passes
  - **If Blocked:** Use regex-based parsing, handle edge cases iteratively

- [x] **12.2.3** Create `parsers/heuristic_parser.py` with hardcoded patterns
  - Implement fallback parser with default regex patterns for unmarked logs
  - **Depends on:** 12.2.1
  - **Goal:** Fallback for logs without explicit markers
  - **AC:** Can detect basic PASS/FAIL in unmarked legacy logs using built-in patterns
  - **If Blocked:** Start with simple patterns, iterate on accuracy

- [x] **12.2.4** Add config-driven patterns loader for heuristic parser
  - Load patterns from `config/patterns.yaml` with JSON schema validation
  - **Depends on:** 12.2.3
  - **Goal:** Make heuristic patterns configurable without code changes
  - **AC:** Custom patterns in YAML override defaults, schema rejects invalid configs
  - **If Blocked:** Keep hardcoded defaults as fallback when no config exists

### Phase 12.3: Analyzer CLI

**Goal:** Implement CLI that produces reports from logs and updates cache DB.

- [ ] **12.3.1** Implement report writer in `tools/rollflow_analyze/report.py`
  - JSON output with tool_calls array + aggregates
  - Optional markdown summary
  - **Depends on:** 12.2.2 (or 12.2.3 for fallback)
  - **AC:** Running on sample logs outputs valid JSON to `artifacts/rollflow_reports/`
  - **If Blocked:** Start with minimal JSON schema, add fields iteratively

- [ ] **12.3.2** Implement aggregates + cache_advice in report
  - Calculate: pass_rate, fail_rate, top_failures_by_tool, slowest_tools
  - Count PASS calls with duplicate cache_key for potential skips
  - Estimate time saved from cached durations
  - **Depends on:** 12.3.1
  - **AC:** Report includes non-empty `aggregates` and `cache_advice` sections
  - **If Blocked:** Start with pass/fail counts only, add complex aggregates later

- [ ] **12.3.3** Wire up CLI with streaming log processing
  - Command: `rollflow_analyze --log-dir logs/ --out artifacts/rollflow_reports/latest.json`
  - Process file-by-file, line-by-line (never load huge logs into memory)
  - **Depends on:** 12.2.2, 12.3.1
  - **AC:** Can process 100MB log directory without memory errors
  - **If Blocked:** Test with smaller logs first, add streaming iteratively

### Phase 12.4: Cache DB + Skip Logic

**Goal:** Use PASS results to avoid rerunning identical tool calls.

- [ ] **12.4.1** Implement SQLite cache DB in `tools/rollflow_analyze/cache_db.py`
  - Tables: `pass_cache(cache_key PK, tool_name, last_pass_ts, last_duration_ms, meta_json)`
  - Tables: `fail_log(id PK, cache_key, tool_name, ts, exit_code, err_hash, err_excerpt)`
  - **Depends on:** 12.2.1, 12.3.1
  - **AC:** Analyzer updates DB after processing logs
  - **If Blocked:** Use JSONL file as simpler alternative to SQLite

- [ ] **12.4.2** Add `CACHE_SKIP=1` flag support to loop.sh
  - Before calling tool: compute cache_key, check pass_cache
  - If hit: log `::CACHE_HIT:: key=<key> tool=<tool>`, skip tool call
  - If miss: log `::CACHE_MISS:: key=<key> tool=<tool>`, run normally
  - **Depends on:** 12.1.2, 12.4.1
  - **AC:** Repeated run shows at least one skip for previously PASS call
  - **If Blocked:** Start with logging only (no actual skip), add skip logic after validation

- [ ] **12.4.3** Add safety bypasses for cache skip
  - Don't skip if: args include "force", git SHA changed, tool marked non-cacheable
  - Config: `rollflow_cache.yml` with `non_cacheable_tools: [...]`
  - **Depends on:** 12.4.2
  - **AC:** Can mark tools as non-cacheable via config, force flag bypasses cache
  - **If Blocked:** Hardcode safety list first, make configurable later

### Phase 12.5: Verification and Tests

**Goal:** Prevent regressions and maintain stability as log formats evolve.

- [ ] **12.5.1** Add unit tests for parsing in `tools/rollflow_analyze/tests/`
  - Test cases: marker PASS, marker FAIL, missing END, interleaved calls, heuristic-only
  - **Depends on:** 12.2.2, 12.2.3
  - **AC:** `pytest tools/rollflow_analyze/tests/` passes
  - **If Blocked:** Start with happy-path tests, add edge cases iteratively

- [ ] **12.5.2** Add golden report test
  - Store sample log + expected JSON structure (not exact timestamps)
  - **Depends on:** 12.3.1
  - **AC:** Analyzer output matches expected structure + key fields
  - **If Blocked:** Use snapshot testing approach, update golden on intentional changes

- [ ] **12.5.3** Add README for extending regex patterns
  - Document how to tune heuristic parsing without code changes
  - Include examples and troubleshooting checklist
  - **Depends on:** 12.3.x, 12.4.x (enough is real)
  - **AC:** README at `tools/rollflow_analyze/README.md` with pattern extension guide
  - **If Blocked:** Start with inline comments, extract to README later

**Phase AC:** `python -m tools.rollflow_analyze --log-dir workers/ralph/logs --out artifacts/rollflow_reports/latest.json` produces valid report

---

## Maintenance: RollFlow Analyzer (run every few iterations)

**Checklist:**

- [ ] Confirm marker lines still being emitted (no accidental removal)
- [ ] Review top 3 failing tools in latest report; add better error classification
- [ ] Watch for cache thrash (lots of misses due to unstable keys)
  - Fix by normalizing args + excluding volatile fields from cache_key
- [ ] Order expensive steps after stable steps to avoid miss cascades
