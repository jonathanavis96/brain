# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-24 (Plan Mode - Iteration 1)

**Current Status:** Phase 12 in progress (RollFlow Analyzer + Documentation Maintenance)

---

## Phase 0-Infra: Verifier Infrastructure Issue

**Goal:** Resolve verifier hanging issue preventing validation.

- [ ] **0-Infra.1** Investigate verifier.sh hanging during execution (HIGH PRIORITY)
  - Verifier runs but produces no output and hangs indefinitely
  - Shellcheck passes on all files (loop.sh, verifier.sh, current_ralph_tasks.sh, thunk_ralph_tasks.sh)
  - Likely issue in AC.rules parsing loop or command execution
  - **AC:** `bash workers/ralph/verifier.sh` completes within 30 seconds and produces report
  - **Status:** HUMAN INTERVENTION REQUIRED - Protected file infrastructure issue

---

## Phase 12: RollFlow Log Analyzer

**Goal:** Build a system that parses Ralph/RollFlow loop logs, detects tool calls, labels PASS/FAIL, computes cache keys, and produces JSON reports + cache advice for loop efficiency.

**Status:** Phases 12.1, 12.2 complete. Working on Phase 12.3 (CLI).

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

## Phase 13: Documentation Maintenance

**Goal:** Fix markdown linting issues and maintain documentation quality.

- [ ] **13.1** Fix MD056 table column count errors in workers/ralph/THUNK.md
  - Line 520: Expected 5 columns, got 6
  - Line 547: Expected 5 columns, got 7
  - **AC:** `markdownlint workers/ralph/THUNK.md` passes with no MD056 errors

**Phase AC:** `markdownlint workers/ralph/*.md` shows no errors

---

## Maintenance: RollFlow Analyzer (run every few iterations)

**Checklist:**

- [ ] Confirm marker lines still being emitted (no accidental removal)
- [ ] Review top 3 failing tools in latest report; add better error classification
- [ ] Watch for cache thrash (lots of misses due to unstable keys)
  - Fix by normalizing args + excluding volatile fields from cache_key
- [ ] Order expensive steps after stable steps to avoid miss cascades

---

## Completed Phases

**Phase 11:** ✅ Verifier False Positive Fixes - All regex fixes applied, shellcheck passes
**Phase 10:** ✅ Sync Script Bug Fix - Fixed empty .last_sync crash
**Phase 9:** ✅ Template Sync & Verification - All templates synced
**Phase 8:** ✅ ETA Timer Implementation - Full ETA display in current_ralph_tasks.sh
**Phase 7:** ✅ Protected File Handling - WARN gate for protected changes
**Phase 6:** ✅ Documentation Updates - All path references fixed
**Phase 5:** ✅ Template Path Updates - Changed ralph/ to workers/ralph/
**Phase 3:** ✅ Runner Cleanup - Removed cerebras from ralph, rovodev from cerebras
**Phase 2:** ✅ Monitor Scripts - Dual monitors (current/thunk) operational
**Phase 1:** ✅ Task Status System - Checkbox format standardized
**Phase 0:** ✅ Repository Reorganization - Moved ralph/ to workers/ralph/

See `workers/ralph/THUNK.md` for complete task history (550+ completed tasks).
