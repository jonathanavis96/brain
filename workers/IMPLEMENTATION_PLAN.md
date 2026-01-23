# Implementation Plan - Brain Repository

**Status:** Active  
**Branch:** `brain-work`  
**Last Updated:** 2026-01-24 00:37:44

---

<!-- Cortex adds new Task Contracts below this line -->

## Phase 10: Sync Script Bug Fix

**Goal:** Fix sync_cortex_plan.sh crash when .last_sync is empty.

- [x] **10.1** Fix empty `.last_sync` file causing "bad array subscript" error
  - In `sync_cortex_plan.sh`, skip empty lines when reading `.last_sync`
  - Add: `[[ -z "$header_line" ]] && continue` inside the while loop
  - **AC:** `echo "" > .last_sync && bash sync_cortex_plan.sh --verbose` runs without error

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

- [ ] **9.2.1** Fix shellcheck issues in `workers/ralph/loop.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/loop.sh` returns 0 warnings
  - **Fixes:** Lint.Shellcheck.LoopSh
  - **Note:** Protected file - will need hash baseline update after

- [ ] **9.2.2** Fix shellcheck issues in `workers/ralph/verifier.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/verifier.sh` returns 0 warnings
  - **Fixes:** Lint.Shellcheck.VerifierSh
  - **Note:** Protected file - will need hash baseline update after

- [ ] **9.2.3** Fix shellcheck issues in `workers/ralph/current_ralph_tasks.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/current_ralph_tasks.sh` returns 0 warnings
  - **Fixes:** Lint.Shellcheck.CurrentRalphTasks

- [ ] **9.2.4** Fix shellcheck issues in `workers/ralph/thunk_ralph_tasks.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/thunk_ralph_tasks.sh` returns 0 warnings
  - **Fixes:** Lint.Shellcheck.ThunkRalphTasks

### Phase 9.3: Markdown Fence Balance Warnings

- [ ] **9.3.1** Fix unbalanced code fences in `NEURONS.md`
  - Add missing closing ``` fences (currently 20 opens, 0 closes)
  - **AC:** `grep -c "^\`\`\`[a-z]" NEURONS.md` equals `grep -c "^\`\`\`$" NEURONS.md`
  - **Fixes:** Lint.Markdown.NeuronsBalancedFences

- [ ] **9.3.2** Fix unbalanced code fences in `THOUGHTS.md`
  - Add missing closing ``` fences (currently 4 opens, 0 closes)
  - **AC:** `grep -c "^\`\`\`[a-z]" THOUGHTS.md` equals `grep -c "^\`\`\`$" THOUGHTS.md`
  - **Fixes:** Lint.Markdown.ThoughtsBalancedFences

**Phase AC:** `bash workers/ralph/verifier.sh` shows WARN: 0
