# Cortex Implementation Plan

**Purpose:** Task Contracts for Ralph workers. Each contract defines an atomic task with clear goals and acceptance criteria.

**Workflow:**

1. Cortex creates/updates Task Contracts here
2. Ralph's `loop.sh` syncs this file via `sync_cortex_plan.sh`
3. Ralph works through tasks, marking them complete
4. Cortex reviews progress and creates new contracts

---

## Current Status

**Last Updated:** 2026-01-24 20:45:00  
**Progress:** Phase 1 - Scope-based cache redesign (20 tasks)

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

## Phase 1: Scope-Based Cache Redesign

**Goal:** Replace iteration-level caching with input-based caching that only skips idempotent operations.

**Core Rule:** Cache things that are idempotent (same inputs = same outputs). Never cache BUILD/task execution.

**What to cache:**

- ✅ Verifiers: shellcheck, grep, lint (keyed by file hashes)
- ✅ Read operations: file reads, directory listings (keyed by path + mtime)
- ✅ Read-only LLM phases: reports, analysis, summaries (explicit opt-in)
- ❌ BUILD/PLAN phases: Never cache (these advance state)

### Phase 1.1: Design and Document

- [x] **1.1.1** Create `docs/CACHE_DESIGN.md` with scope definitions
  - Define scopes: `verify`, `read`, `llm_ro` (read-only LLM)
  - Document phase-to-scope mapping
  - Explain why BUILD/PLAN never get LLM caching
  - **AC:** Design doc exists, reviewed

- [x] **1.1.2** Define phase-to-scope mapping in code comments
  - `PLAN` → no LLM cache (creates new tasks)
  - `BUILD` → no LLM cache (executes tasks, changes files)
  - `VERIFY` → `verify` scope (shellcheck, lint - cacheable)
  - `REPORT` → `llm_ro` scope (read-only analysis - cacheable)
  - **AC:** Mapping documented in loop.sh header

### Phase 1.2: Input-Based Cache Keys

- [x] **1.2.1** Add `file_content_hash()` function to `common.sh`
  - `file_content_hash <path>` → sha256 of file contents
  - **AC:** Function exists, returns consistent hash for same content

- [x] **1.2.2** Add `tree_hash()` function to `common.sh`
  - `tree_hash <dir>` → hash of directory tree state (files + mtimes)
  - **AC:** Function exists, changes when any file in dir changes

- [x] **1.2.3** Refactor `cache_key()` for verifier tools
  - New signature: `cache_key <tool> <target_file_or_dir>`
  - Key = `tool_name + file_content_hash(target)`
  - **AC:** Same file = same key, regardless of iteration

### Phase 1.3: Implement CACHE_MODE and CACHE_SCOPE

- [x] **1.3.1** Add `CACHE_MODE=off|record|use` to loop.sh
  - `off` = no caching at all (current default)
  - `record` = run everything, store PASS results
  - `use` = check cache first, skip on hit, record misses
  - **AC:** All three modes work correctly

- [x] **1.3.2** Add `CACHE_SCOPE=verify,read,llm_ro` to loop.sh
  - Comma-separated list of active cache types
  - Default: `verify,read` (safe defaults, no LLM caching)
  - **AC:** Scopes correctly filter which caches are checked

- [x] **1.3.3** Hard-block `llm_ro` scope for BUILD/PLAN phases
  - Even if user sets `CACHE_SCOPE=llm_ro`, ignore for BUILD/PLAN
  - Log warning: "llm_ro scope ignored for BUILD phase"
  - **AC:** BUILD phase always calls LLM

### Phase 1.4: Safety Guards

- [x] **1.4.1** Add pending task check before any cache skip
  - If `IMPLEMENTATION_PLAN.md` has `- [ ]` tasks and phase=BUILD → force run
  - **AC:** BUILD with pending tasks always executes

- [x] **1.4.2** Add `--force-fresh` flag
  - Bypasses all caching regardless of CACHE_MODE/SCOPE
  - Useful for debugging stale cache issues
  - **AC:** Flag works, all operations run fresh

- [x] **1.4.3** Deprecate `CACHE_SKIP` with migration path
  - Map `CACHE_SKIP=1` → `CACHE_MODE=use CACHE_SCOPE=verify,read`
  - Log: "CACHE_SKIP is deprecated, use CACHE_MODE and CACHE_SCOPE"
  - **AC:** Old flag still works with warning

### Phase 1.5: Update Both Workers

- [x] **1.5.1** Update `workers/ralph/loop.sh` with new cache logic
  - Remove iteration-level LLM caching
  - Add phase guards
  - **AC:** Ralph respects new cache design

- [x] **1.5.2** Update `workers/cerebras/loop.sh` with new cache logic
  - Same changes as Ralph
  - **AC:** Cerebras respects new cache design

- [x] **1.5.3** Update `workers/shared/common.sh` with new functions
  - Add file_content_hash, tree_hash
  - Update cache_key signature
  - **AC:** Shared functions available to all workers

### Phase 1.6: Testing

- [x] **1.6.1** Test verifier caching works
  - Run verifier twice on unchanged repo → expect cache hits
  - Modify a file → expect cache miss for that file's checks
  - **AC:** Verifier cache behaves correctly

- [x] **1.6.2** Test BUILD phase never skips LLM
  - Set `CACHE_MODE=use CACHE_SCOPE=verify,read,llm_ro`
  - Run BUILD with pending task
  - **AC:** LLM still called (llm_ro blocked for BUILD)

- [x] **1.6.3** Test task queue safety guard
  - With pending tasks, cache should not prevent execution
  - **AC:** Pending tasks always trigger BUILD execution

**Phase AC:** Caching accelerates checks/analysis but never suppresses work

---

## Phase 2: Verifier-Specific Caching (Optional Enhancement)

**Goal:** Apply caching specifically to verifier.sh checks for faster verification loops.

**Depends on:** Phase 1 complete

### Phase 2.1: Verifier Cache Integration

- [x] **2.1.1** Update verifier.sh to use input-based cache keys
  - Each AC check computes key from: `check_id + target_file_hash`
  - On cache hit: reuse prior PASS/FAIL result
  - **AC:** Unchanged files skip re-verification

- [x] **2.1.2** Add cache invalidation on rule change
  - Include `rules/AC.rules` hash in cache key
  - Rule change → all checks re-run
  - **AC:** Editing AC.rules invalidates all cached results

**Phase AC:** Verifier runs faster on unchanged files

---

## Phase 3: Per-Agent Cache Isolation (If Needed)

**Goal:** Prevent cache cross-talk between workers.

**Depends on:** Phase 1 complete

**Decision:** Evaluate after Phase 1 testing whether isolation is needed.

### Phase 3.1: Evaluate Need

- [x] **3.1.1** Check if current design already isolates agents
  - Cache key includes tool name (ralph vs cerebras)
  - If keys already differ → no isolation needed
  - **AC:** Decision documented

### Phase 3.2: Implement If Needed

- [x] **3.2.1** Option A: Physical separation — **SKIPPED**
  - Decision: Not needed per 3.1.1 evaluation
  - Logical separation already exists via agent prefix in cache keys

- [x] **3.2.2** Option B: Logical separation — **ALREADY IMPLEMENTED**
  - Ralph uses `${RUNNER,,}` prefix, Cerebras uses `"cerebras"` prefix
  - Keys already differ: `rovodev|phase|hash|sha` vs `cerebras|phase|hash|sha`
  - **Note:** RUNNER-based isolation is fragile; Phase 4 will fix with explicit AGENT_NAME

**Phase AC:** ✅ Cache isolation documented as already implemented (logical separation via agent prefix)

---

## Phase 4: Shared Cache Library + Cortex Support (Safety Net)

**Goal:** Extract caching into shared infrastructure for waste-prevention + reliability across all runners.

**Rationale:** Caching won't save huge tokens for "new thinking" work, but prevents waste from:

- Reruns after crashes / network / rate-limit issues
- Accidental double-runs
- Retries where input didn't change
- Repeated setup/analysis steps

### Phase 4.1: Extract Cache Functions


- [ ] **4.1.1** Create `workers/shared/cache.sh` with extracted functions
  - Move from loop.sh: cache key generation, lookup/store, log helpers
  - Export interface: `cache_should_use`, `cache_make_key`, `cache_try_load`, `cache_store`
  - Include env parsing for `CACHE_MODE`, `CACHE_SCOPE`, `--force-fresh`
  - **AC:** File exists, functions are callable, shellcheck passes

### Phase 4.2: Refactor loop.sh to Use Shared Library

- [ ] **4.2.1** Update `workers/ralph/loop.sh` to source shared cache library
  - Replace inline cache logic with calls to `workers/shared/cache.sh`
  - Keep exact semantics: `CACHE_MODE`, `CACHE_SCOPE`, BUILD/PLAN blocking
  - **AC:** Before/after run shows identical cache hits/misses

- [ ] **4.2.2** Update `workers/cerebras/loop.sh` to source shared cache library
  - Same refactor as Ralph
  - **AC:** Cerebras caching unchanged behaviorally

### Phase 4.3: Add Cortex Caching

- [ ] **4.3.1** Update `cortex/one-shot.sh` to source shared cache library
  - Add `source workers/shared/cache.sh`
  - Set `AGENT_NAME=cortex` explicitly
  - Wrap `acli rovodev run` call with cache check/store
  - **AC:** Same one-shot twice with no repo changes → Run 1: miss+store, Run 2: hit+skip

### Phase 4.4: Fix Agent Isolation

- [ ] **4.4.1** Replace RUNNER dependency with AGENT_NAME in cache keys
  - Cache key "agent" field uses `AGENT_NAME` not `RUNNER`
  - Fall back sanely if `AGENT_NAME` missing (log warning)
  - **AC:** Ralph/Cortex/Cerebras with identical prompts don't share cache entries

### Phase 4.5: Smoke Test

- [ ] **4.5.1** Create `scripts/test_cache_smoke.sh` for cache correctness
  - Test: same prompt + git state → cache hit on 2nd run
  - Test: change git_sha → cache miss
  - Test: `--force-fresh` → bypass even if entry exists
  - Test: `CACHE_SCOPE=llm_ro` blocked during BUILD/PLAN
  - **AC:** One command verifies caching works for loop.sh and one-shot.sh

**Phase AC:** Cortex has safety-net caching, loop.sh uses shared infra, agent isolation is explicit
