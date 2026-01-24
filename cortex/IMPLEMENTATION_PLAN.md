# Cortex Implementation Plan

**Purpose:** Task Contracts for Ralph workers. Each contract defines an atomic task with clear goals and acceptance criteria.

**Workflow:**

1. Cortex creates/updates Task Contracts here
2. Ralph's `loop.sh` syncs this file via `sync_cortex_plan.sh`
3. Ralph works through tasks, marking them complete
4. Cortex reviews progress and creates new contracts

---

## Current Status

**Last Updated:** 2026-01-25 00:45:00  
**Progress:** Phases 1-3 complete, Phase 4 pending (6 tasks)

---

## Completed Phases

Phases 0-12 completed - see `workers/ralph/THUNK.md` for details.

Key milestones:

- Phase 1: Scope-based cache redesign ✅
- Phase 2: Verifier-specific caching ✅
- Phase 3: Per-agent cache isolation ✅

---

<!-- Cortex adds new Task Contracts below this line -->

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
