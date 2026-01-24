# Cortex Implementation Plan

**Purpose:** Task Contracts for Ralph workers. Each contract defines an atomic task with clear goals and acceptance criteria.

**Workflow:**

1. Cortex creates/updates Task Contracts here
2. Ralph's `loop.sh` syncs this file via `sync_cortex_plan.sh`
3. Ralph works through tasks, marking them complete
4. Cortex reviews progress and creates new contracts

---

## Current Status

**Last Updated:** 2026-01-24 20:10:00  
**Progress:** Fresh start - awaiting new phase definition

---

## Completed Phases

Phases 0-12 completed - see `workers/ralph/THUNK.md` for details.

Key milestones:

- Phase 9: Verifier warnings cleanup
- Phase 10: Sync script bug fixes
- Phase 11: False positive fixes
- Phase 12: RollFlow cache system implemented

---

<!-- Cortex adds new Task Contracts below this line -->

## Phase 1: Cache System End-to-End Testing

**Goal:** Prove the RollFlow cache pipeline works before locking in semantics or architecture.

**Definition of Done:** Two Ralph runs demonstrate cache population (run 1) and cache hits/skips (run 2), with verifiable differences in tool execution counts.

**Test Strategy:**

- Run 1: Execute deterministic tool calls, populate cache DB
- Run 2: Same calls should hit cache and skip execution
- Verify: Analyzer report shows hits/misses, DB has entries, outcomes identical

### Phase 1.1: Create Minimal Test Task

- [ ] **1.1.1** Create `workers/ralph/test_cache_task.md` - a minimal prompt
  - Task: Read 3 specific files, run `git status`, output a summary
  - Files: `README.md`, `AGENTS.md`, `NEURONS.md` (stable, always exist)
  - **AC:** Prompt file exists, is under 50 lines, produces deterministic tool calls
  - **Note:** This is a throwaway test prompt, not production

- [ ] **1.1.2** Add `--test-cache` flag to loop.sh
  - When set: Use `test_cache_task.md` as prompt, run exactly 1 iteration
  - Skip verifier (test-only mode)
  - **AC:** `bash loop.sh --test-cache` runs without error, produces log with TOOL markers

### Phase 1.2: Run Cache Population Test (Record Mode)

- [ ] **1.2.1** Execute first test run (cache miss expected)
  - Command: `CACHE_SKIP=1 bash loop.sh --test-cache`
  - Expected: All `::CACHE_MISS::` markers, no `::CACHE_HIT::`
  - **AC:** Log shows 4+ TOOL_CALL_START/END pairs, all CACHE_MISS

- [ ] **1.2.2** Verify cache DB populated after run 1
  - Check: `sqlite3 artifacts/rollflow_cache/cache.sqlite "SELECT COUNT(*) FROM pass_cache"`
  - Expected: At least 1 entry (ideally 4+ for our test tools)
  - **AC:** pass_cache has entries, fail_log is empty or minimal

### Phase 1.3: Run Cache Hit Test (Use Mode)

- [ ] **1.3.1** Execute second test run (cache hits expected)
  - Command: `CACHE_SKIP=1 bash loop.sh --test-cache` (same as before)
  - Expected: Some `::CACHE_HIT::` markers, fewer tool executions
  - **AC:** Log shows at least 1 CACHE_HIT, total TOOL_CALL count reduced vs run 1

- [ ] **1.3.2** Compare run 1 vs run 2 metrics
  - Use analyzer: `rollflow_analyze --log-dir workers/ralph/logs --out /tmp/test_report.json`
  - Compare: tool call counts, cache hit ratio, time saved estimate
  - **AC:** Report shows cache_advice.potential_skips > 0, time_saved_ms > 0

### Phase 1.4: Verify Correctness

- [ ] **1.4.1** Confirm outcomes identical between runs
  - Both runs should produce same "pass" result (no false failures from caching)
  - **AC:** Exit code 0 on both runs, no verifier regressions

- [ ] **1.4.2** Test cache invalidation on git SHA change
  - Make a trivial commit (e.g., touch a file, commit)
  - Run again with `CACHE_SKIP=1`
  - Expected: Cache misses (SHA changed invalidates cache)
  - **AC:** CACHE_MISS on all calls after SHA change

- [ ] **1.4.3** Cleanup test artifacts
  - Remove `test_cache_task.md`
  - Clear test entries from cache DB (or document as acceptable test data)
  - **AC:** No test-only files left in repo

**Phase AC:** Cache system demonstrated working with measurable skip behavior

---

## Phase 2: Rename Cache Flag (After Testing)

**Goal:** Replace confusing `CACHE_SKIP` with clearer semantics.

**Depends on:** Phase 1 complete (need to see actual behavior before naming)

**Options to evaluate:**

- Option A: `CACHE_MODE=off|record|use` (most flexible)
- Option B: `USE_CACHE=1` + `CACHE_RECORD=1` (boolean pair)
- Option C: `CACHE_ENABLED=1` (simple toggle)

### Phase 2.1: Implement New Flag

- [ ] **2.1.1** Choose flag semantics based on Phase 1 learnings
  - Document decision in `cortex/DECISIONS.md`
  - **AC:** Decision recorded with rationale

- [ ] **2.1.2** Update `loop.sh` to use new flag name
  - Keep `CACHE_SKIP` as deprecated alias (warn on use)
  - **AC:** New flag works, old flag warns but still functions

- [ ] **2.1.3** Update `workers/shared/common.sh` cache functions
  - Align function names/behavior with new semantics
  - **AC:** No references to old naming in new code

- [ ] **2.1.4** Update documentation
  - `loop.sh --help`, `README.md`, any skill docs mentioning cache
  - **AC:** All docs use new naming consistently

**Phase AC:** New cache flag in use, `CACHE_SKIP` deprecated with warning

---

## Phase 3: Per-Agent Cache Isolation (If Needed)

**Goal:** Prevent cache cross-talk between workers if Phase 1 reveals issues.

**Depends on:** Phase 1 complete (may not be needed if logical separation suffices)

**Decision point:** After Phase 1, evaluate:

- Did Ralph/Cerebras cache entries conflict?
- Is agent dimension already in cache key sufficient?
- Do different workers need different TTL/config?

### Phase 3.1: Evaluate Isolation Need

- [ ] **3.1.1** Analyze cache keys from Phase 1 test
  - Check if agent/worker is already part of key
  - **AC:** Decision documented: physical vs logical vs none

### Phase 3.2: Implement Isolation (if chosen)

- [ ] **3.2.1** Option A: Physical separation
  - Move cache to `workers/<agent>/cache/cache.sqlite`
  - Update `CACHE_DB` path resolution in common.sh
  - **AC:** Each worker has own cache directory

- [ ] **3.2.2** Option B: Logical separation (namespace keys)
  - Add `agent=<name>` to cache key computation
  - Keep single DB but keys won't collide
  - **AC:** Same tool+args for different agents = different keys

**Phase AC:** Cache isolation strategy implemented (or documented as unnecessary)
