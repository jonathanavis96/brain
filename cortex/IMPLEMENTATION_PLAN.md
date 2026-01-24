# Cortex Implementation Plan

**Purpose:** Task Contracts for Ralph workers. Each contract defines an atomic task with clear goals and acceptance criteria.

**Workflow:**

1. Cortex creates/updates Task Contracts here
2. Ralph's `loop.sh` syncs this file via `sync_cortex_plan.sh`
3. Ralph works through tasks, marking them complete
4. Cortex reviews progress and creates new contracts

---

## Current Status

**Last Updated:** 2026-01-24 00:30:00  
**Progress:** 9 pending tasks in Phase 9

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

- [ ] **9.1.2** Update `loop.sh` hash baseline (human approved change)
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
