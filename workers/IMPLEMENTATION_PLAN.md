# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-26 15:45:00

**Current Status:** Phase 23 (Loop Efficiency & Correctness) COMPLETE. All 6/6 tasks done.

**Active Phases:**

- **Phase 23: Loop Efficiency & Correctness Fixes (✅ 6/6 tasks complete)**
- Phase 21: Token Efficiency & Tool Consolidation (1 task remaining)
- Phase CR-6: CodeRabbit PR6 Fixes (✅ COMPLETED)
- Phase POST-CR6: Prevention Systems (✅ COMPLETED - all 7 tasks)
- Phase 10: RovoDev Parser & Observability (✅ COMPLETED - all 3 tasks)
- Phase 11: Thread Persistence & Search (✅ COMPLETED - all 4 tasks)
- Phase 12: Observability Improvements (🔄 IN PROGRESS - 1/4 tasks complete)
- Phases 13-20: Meta-tooling & Self-improvement (queued)

<!-- Cortex adds new Task Contracts below this line -->

## Phase 23: Loop Efficiency & Correctness Fixes

**Goal:** Fix bugs and inefficiencies in the Ralph loop that waste tokens and cause drift.

**Priority:** HIGH (correctness + biggest remaining efficiency wins)

**Reference:** Analysis of iteration logs showing repeated failures and unnecessary work.

### Phase 23.1: Correctness Fixes (HIGH)

- [x] **23.1.1** Fix `sync_completions_to_cortex.sh` unbound variable **[HIGH]**
  - **Goal:** Sync never fails when no completions exist
  - **Root Cause:** `${#completed_tasks[@]}` on empty associative array triggers "unbound variable" with `set -u`
  - **Fix:** Initialize properly and add guard for empty case
  - **AC:** No "unbound variable" errors; prints "0 completions" and exits 0 when none found; sync works when completions exist

- [x] **23.1.2** Untrack rollflow cache sqlite files and ensure ignored **[HIGH]**
  - **Goal:** Cache DBs don't show up in git status and don't get staged
  - **Root Cause:** Files are tracked (in git index) even though `.gitignore` has patterns
  - **Fix:** `git rm --cached` for any tracked cache files; verify `.gitignore` patterns
  - **AC:** `git status` clean after runs; caches regenerate locally; `git ls-files` shows no cache.sqlite under rollflow_cache

### Phase 23.2: Staging Efficiency (HIGH - protected file)

- [x] **23.2.1** Replace `git add -A` with scoped staging allowlist/denylist **[HIGH]**
  - **Goal:** Only stage intended task files; avoid artifacts/cortex copies/caches by default
  - **Root Cause:** Broad staging pulls in unrelated files, triggering fix-markdown/pre-commit/verifier unnecessarily
  - **Fix:** Change staging logic in loop.sh to use explicit paths
  - **Always stage:** `workers/IMPLEMENTATION_PLAN.md`, `workers/ralph/THUNK.md`, task-specific files
  - **Never auto-stage:** `artifacts/**`, `cortex/IMPLEMENTATION_PLAN.md`, `cortex/PLAN_DONE.md`, `**/rollflow_cache/**`
  - **AC:** After typical task, staged diff contains only: workers plan, THUNK, and files touched by task; artifacts/cortex/cache excluded unless explicitly requested
  - **Note:** Protected file - requires human approval
  - **Implementation Guide:**
    1. In loop.sh, find the `git add -A` call(s) in the BUILD commit section
    2. Replace with: `git add workers/IMPLEMENTATION_PLAN.md workers/ralph/THUNK.md`
    3. Add logic to stage task-specific files (from git diff --name-only, excluding deny patterns)
    4. Deny patterns: `artifacts/*`, `cortex/IMPLEMENTATION_PLAN.md`, `cortex/PLAN_DONE.md`, `**/rollflow_cache/*`
    5. Update hash in `.verify/loop.sha256` after changes
  - **Verification checklist:**
    - [x] `git add -A` no longer used
    - [x] Core files always staged (IMPLEMENTATION_PLAN.md, THUNK.md)
    - [x] Artifacts excluded by default
    - [x] Cortex copies excluded by default
    - [x] Cache files excluded by default
    - [x] Hash regenerated in all `.verify/` directories

- [ ] **23.2.2** End-of-loop cleanup when no unchecked tasks remain **[MEDIUM]**
  - **Goal:** When the loop is about to exit and there are 0 `- [ ]` tasks left, automatically leave the repo in a clean, consistent state.
  - **Behavior (must):**
    1. If there are no unchecked tasks, run the same cleanup routine used at PLAN start to remove `[x]` items from `workers/IMPLEMENTATION_PLAN.md` (so the plan ends clean).
    2. Do a final read-only review step (summary only): list remaining unchecked tasks (should be 0), show `git status --short`, show last commit, and stop. **No new tasks created.**
    3. If there are staged changes at this point, batch them into one final commit using the scoped staging rules (plan + THUNK + task files only; never artifacts/cortex copies/caches by default).
  - **AC:**
    - On a run that finishes all tasks, the plan contains no leftover `[x]` clutter (or only what cleanup policy allows).
    - Repo ends clean (`git status --short` empty) unless artifacts are intentionally left modified and are not staged.
    - No new tasks are appended during the final review step.
  - **Notes:** Must respect protected-file policy; if implementation touches protected files, human must approve + update hashes.

### Phase 23.3: Tool Efficiency (MEDIUM)

- [x] **23.3.1** Make `cortex/snapshot.sh` avoid regenerating dashboard/metrics by default **[MEDIUM]**
  - **Goal:** Running snapshot for inspection shouldn't dirty artifacts unless requested
  - **Root Cause:** Dashboard regeneration happens unconditionally, creating unrelated diffs
  - **Fix:** Search for existing flags/env toggles; if none exist, add `--no-dashboard` option
  - **AC:** Snapshot can run without modifying `artifacts/dashboard.html` / `artifacts/brain_metrics.json`

- [x] **23.3.2** Pass changed `.md` files to fix-markdown instead of scanning repo root **[MEDIUM]**
  - **Goal:** Reduce fix-markdown time when there are few changed markdown files
  - **Root Cause:** Loop passes `.` (whole repo) even when only specific files changed
  - **Fix:** Update fix-markdown to accept file arguments; update loop.sh to pass only changed `.md` paths
  - **AC:** fix-markdown processes only changed `.md` paths; no "Issues before: 0" full-repo runs

### Phase 23.4: Workflow Efficiency (LOW)

- [x] **23.4.1** Add PROMPT instruction: check THUNK before re-validating tasks **[LOW]**
  - **Goal:** Avoid redoing already-completed work
  - **Root Cause:** Ralph sometimes investigates tasks that THUNK already shows as done
  - **Fix:** Add instruction to BUILD task-selection step: check THUNK via existing search tool first
  - **AC:** When task already present in THUNK, Ralph marks it complete without deep investigation

**Phase AC:**
- sync_completions_to_cortex.sh runs without errors (0 completions case and real completions)
- No cache.sqlite files tracked in git
- Staging excludes artifacts/cortex/cache by default
- snapshot.sh has option to skip dashboard regeneration
- fix-markdown can process specific file list

---

## Phase 9C: Task Optimization (Batching + Decomposition)

**Goal:** Use Phase 0 structured logs to identify batching and decomposition opportunities, reducing task overhead and improving iteration success rate.

**Artifacts:** `artifacts/optimization_hints.md` (analysis output)

### Phase 9C.0: Prerequisites (Marker Pipeline Fix)

- [x] **9C.0.3** Document RovoDev tool instrumentation limitation
  - **Goal:** Clarify that RovoDev's native tools bypass shell wrapper
  - **AC:** `artifacts/optimization_hints.md` has "Limitations" section explaining tool visibility gap
  - **Note:** RovoDev bash/grep/find_and_replace_code don't go through `log_tool_start()`

### Phase 9C.1: Batching Infrastructure

- [x] **9C.1.1** Enhance `cortex/snapshot.sh` with batching hints
  - **Goal:** Show "⚡ Batching opportunities: X" when ≥3 similar pending tasks detected
  - **AC:** Snapshot output shows batching hints section when opportunities exist
  - **Detection:** Same error code (MDxxx, SCxxxx), same directory prefix, same file type

- [x] **9C.1.2** Document `[S/M/L]` complexity convention for task estimation
  - **Goal:** Standard complexity labels for task estimation
  - **AC:** PROMPT_REFERENCE.md has "Task Complexity" section with realistic time estimates (S=2-3min, M=5-10min, L=10-20min)

### Phase 9C.2: Apply Batching to Current Backlog

- [x] **9C.2.1** Create batch task template in `templates/ralph/PROMPT.md`
  - **Goal:** Standard format for batched tasks with multi-file scope
  - **AC:** Template shows batch task example with glob patterns and verification

- [x] **9C.2.2** BATCH: Create missing language templates (javascript, go, website)
  - **Scope:** Create `templates/javascript/`, `templates/go/`, `templates/website/`
  - **Steps:**
    1. Define standard template structure (AGENTS.md, NEURONS.md, VALIDATION_CRITERIA.md)
    2. Create all three directories with standard files in one pass
    3. **Templates contain pointers to brain skills, NOT duplicated content**
    4. Verify each directory has required files
  - **AC:** All three template directories exist with standard structure and skill references
  - **Replaces:** 6.1.1, 6.1.2, 6.3.1
  - **Status:** 6.1.1 and 6.1.2 complete, 6.3.1 pending

- [x] **9C.2.B2** BATCH: Update skills documentation (combines 7.2.1, 7.2.2)
  - **Scope:** `skills/index.md` + `skills/SUMMARY.md`
  - **Steps:**
    1. Scan `skills/domains/` and `skills/playbooks/` for all files
    2. Update `skills/index.md` with any missing entries
    3. Update `skills/SUMMARY.md` error reference and playbooks section
  - **AC:** Both index files list all current skills, SUMMARY includes playbooks
  - **Replaces:** 7.2.1, 7.2.2

- [x] **9C.2.B3** BATCH: Improve onboarding docs (combines 7.1.1, 7.1.2)
  - **Scope:** Root `README.md` + new `CONTRIBUTING.md`
  - **Steps:**
    1. Enhance README.md onboarding flow (quick start, navigation)
    2. Create CONTRIBUTING.md with guidelines
    3. Cross-link between files
  - **AC:** README has clear onboarding, CONTRIBUTING.md exists
  - **Replaces:** 7.1.1, 7.1.2

### Phase 9C.3: Decomposition Detection

- [x] **9C.3.1** Add duration tracking to `current_ralph_tasks.sh` footer
  - **Goal:** Show when current task exceeds 2x median (⚠️ warning)
  - **AC:** Footer shows "⚠️ Current task exceeding median" when appropriate

- [x] **9C.3.2** Create decomposition checklist in `skills/playbooks/`
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

<!-- NOTE: Recurring processes moved to cortex/docs/RUNBOOK.md - not tasks -->

---

## Phase 21: Token Efficiency & Tool Consolidation

**Status:** Phase 21.1, 21.2, and 21.3.1-21.3.2 COMPLETE. One task remaining.

- [ ] **21.3.3** Add tools reference to `skills/index.md` [LOW]
  - **Goal:** Include tools in searchable skills index
  - **AC:** Index has entry pointing to `docs/TOOLS.md`

---

## Phase 22: Markdown Lint Fixes

**Goal:** Fix manual markdown lint errors that auto-fix cannot resolve.

**Reference:** Markdown lint errors from pre-commit hook output.

**Priority:** HIGH (blocks clean pre-commit runs)

### Phase 22.2: THUNK.md Table Fixes

- [x] **22.2.3** Fix MD056 in workers/ralph/THUNK.md line 801 (escape pipes)
  - **Goal:** Escape unescaped pipe characters in table row description
  - **Error:** Line 801:401 - Table has 10 columns instead of 5
  - **Root Cause:** Description contains `"collect_metrics.sh | generate"` and `"| 2026-01-26 |"` with unescaped pipes
  - **AC:** `markdownlint workers/ralph/THUNK.md` passes (no MD056 errors)

---
