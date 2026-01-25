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

## Phase 5: CodeRabbit PR #5 Fixes

**Goal:** Fix all issues identified by CodeRabbit in PR #5.  
**Reference:** `docs/CODERABBIT_PR5_ALL_ISSUES.md`  
**Total Issues:** 40+ (8 critical, 8 high, 12 medium, 12+ low)

### Phase 5.1: Git Hygiene (Ralph)

- [ ] **5.1.1** Add `*.egg-info/` to `.gitignore`
  - **AC:** `grep -q 'egg-info' .gitignore` returns 0

- [ ] **5.1.2** Remove committed egg-info directory
  - Run `git rm -r tools/rollflow_analyze/src/rollflow_analyze.egg-info/`
  - **AC:** Directory removed from repo

- [ ] **5.1.3** Fix waiver request reason in `WVR-2026-01-24-003.json`
  - Update reason field to match actual evidence (files are identical)
  - **AC:** Reason field accurately reflects diff -q output

### Phase 5.2: Logic Bug Fixes (Ralph)

- [ ] **5.2.1** Fix `cleanup()` not called in `cleanup_and_emit` (loop.sh:154-172)
  - Call `cleanup()` before releasing lock to remove TEMP_CONFIG
  - **AC:** TEMP_CONFIG removed on all exit paths

- [ ] **5.2.2** Fix `lookup_cache_pass` missing tool argument (loop.sh:1037-1038)
  - Add tool name as 3rd argument to lookup_cache_pass calls
  - **AC:** `non_cacheable_tools` check works correctly

- [ ] **5.2.3** Fix cache-hit early return leaves temp file (loop.sh:1056-1068)
  - Add `rm -f "$prompt_with_mode"` before each cache-hit return
  - **AC:** No orphaned temp files after cache hits

- [ ] **5.2.4** Fix CACHE_SKIP only accepts literal "true" (loop.sh:341-360)
  - Accept truthy values: 1, true, yes, y, on (case-insensitive)
  - **AC:** `CACHE_SKIP=1` and `CACHE_SKIP=yes` both work

- [ ] **5.2.5** Fix `approve_waiver_totp.py` deletes request file (lines 83-90)
  - Keep request file or move to archive instead of deleting
  - **AC:** `check_waiver.sh` can still compute REQUEST_SHA256

- [ ] **5.2.6** Fix verifier.sh cache key inconsistency (lines 344-385)
  - Compute ac_rules_hash before CACHE_MODE check, not just in "use" mode
  - **AC:** Cache keys consistent between record and use modes

- [ ] **5.2.7** Fix `bin/brain-event` unbound variable (lines 84-117)
  - Guard `$2` access with `${2-}` or `$# -ge 2` checks
  - **AC:** `shellcheck bin/brain-event` passes, no unbound errors

- [ ] **5.2.8** Fix `cerebras_agent.py` state reinjection (lines 1021-1038)
  - Insert state_msg after user message (index 2) not at index 1
  - **AC:** `_prune_messages` preserves system+user correctly

### Phase 5.3: Documentation Fixes (Ralph)

- [ ] **5.3.1** Create `skills/domains/languages/typescript/README.md`
  - Fixes broken links from frontend/README.md and javascript/README.md
  - **AC:** File exists, links resolve

- [ ] **5.3.2** Update `skills/index.md` entries in SUMMARY.md
  - Add research-patterns, research-cheatsheet, token-efficiency
  - Add frontend section entries
  - **AC:** All index.md entries have SUMMARY.md counterparts

- [ ] **5.3.3** Fix incorrect dates (2026-01-25 → 2026-01-24)
  - Files: `workers/IMPLEMENTATION_PLAN.md`, `skills/domains/languages/typescript/README.md`
  - **AC:** No future dates in Last Updated fields

- [ ] **5.3.4** Fix `workers/IMPLEMENTATION_PLAN.md` status mismatches
  - Phase 2.1.2: Change "remains" to "COMPLETE"
  - Phase 12.4.2-12.4.3: Reconcile "deferred" text with checked boxes
  - **AC:** Status text matches checkbox state

- [ ] **5.3.5** Fix markdown formatting in `workers/ralph/THUNK.md`
  - Escape pipe characters in table rows: `|` → `\|` or wrap in backticks
  - **AC:** Markdown renders correctly

- [ ] **5.3.6** Fix stray fence in `observability-patterns.md` (lines 584-585)
  - Remove duplicate closing backticks
  - **AC:** No orphan code fences

### Phase 5.4: Code Example Fixes (Ralph)

- [ ] **5.4.1** Fix `deployment-patterns.md` - add `import time`
  - **AC:** Python example runs without NameError

- [ ] **5.4.2** Fix `deployment-patterns.md` - `isEnabledForPercentage` userId
  - Add userId parameter to function signature
  - **AC:** TypeScript compiles

- [ ] **5.4.3** Fix `observability-patterns.md` - JsonFormatter.format
  - Use correct LogRecord attribute access
  - **AC:** Python example runs

- [ ] **5.4.4** Fix `observability-patterns.md` - metricsMiddleware status
  - Capture actual status code instead of hardcoding "200"
  - **AC:** Go example compiles

- [ ] **5.4.5** Fix `observability-patterns.md` - SQL injection in span
  - Use parameterized query format in example
  - **AC:** Example shows secure pattern

- [ ] **5.4.6** Fix `disaster-recovery-patterns.md` - PostgreSQL 12+ recovery
  - Replace recovery.conf with postgresql.conf + recovery.signal
  - **AC:** Example works with modern PostgreSQL

- [ ] **5.4.7** Fix `javascript/README.md` - undefined userId
  - Add `const userId = 42` before sql usage
  - **AC:** Example is self-contained

- [ ] **5.4.8** Fix `test-coverage-patterns.md` - Jest flags
  - Replace `--collectCoverageFrom` with `--findRelatedTests`
  - Handle empty changed_files.txt
  - **AC:** Script works correctly

- [ ] **5.4.9** Fix `test-coverage-patterns.md` - artifacts endpoint
  - Use correct GitHub Actions artifacts API
  - Add Authorization header
  - **AC:** API call format is correct

- [ ] **5.4.10** Fix `deployment-patterns.md` - grammar
  - "backward compatible" → "backward-compatible"
  - **AC:** Hyphenated compound adjective

### Phase 5.5: Shell Script Fixes (Ralph)

- [ ] **5.5.1** Fix `current_ralph_tasks.sh` - Archive header handling
  - Treat Archive headers as section terminators
  - **AC:** Archive sections properly delimit task sections

- [ ] **5.5.2** Fix `templates/ralph/loop.sh` - cache key JSON
  - Use content_hash helper instead of raw JSON string
  - **AC:** Cache key generation doesn't fail under set -euo

### Phase 5.0: Hash Regeneration (HUMAN ONLY - Do First) ✅ COMPLETE

> ✅ **Completed 2026-01-25 by Cortex**

- [x] **5.0.1** Regenerate `.verify/loop.sha256`
- [x] **5.0.2** Regenerate `.verify/ac.sha256` - was already correct
- [x] **5.0.3** Regenerate `.verify/verifier.sha256` - was already correct
- [x] **5.0.4** Regenerate `workers/ralph/.verify/loop.sha256`
- [x] **5.0.5** Regenerate `workers/ralph/.verify/prompt.sha256` - was already correct
- [x] **5.0.6** Regenerate `workers/ralph/.verify/verifier.sha256` - was already correct
- [x] **5.0.7** Regenerate `templates/ralph/.verify/loop.sha256`
- [x] **5.0.8** Create SPEC_CHANGE_REQUEST.md - not needed, hashes updated directly

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
