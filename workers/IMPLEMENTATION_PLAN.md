# Implementation Plan - Brain Repository

**Status:** Active  
**Branch:** `brain-work`  
**Last Updated:** 2026-01-23 23:12:15

---

## Phase 0-Warn: Verifier Warnings

### Immediate Fixes (9 warnings)

- [x] **0.W.1** Fix NEURONS.md unbalanced code fences - 20 opens, 0 closes (likely using ````markdown blocks)
- [x] **0.W.2** Fix THOUGHTS.md unbalanced code fences - 4 opens, 0 closes (likely using ````text blocks)
- [x] **0.W.3** Sync current_ralph_tasks.sh to templates/ralph/ (Hygiene.TemplateSync.1)
- [x] **0.W.4** Fix SC issues in templates/ralph/loop.sh (Lint.Shellcheck.LoopSh) - FALSE POSITIVE: shellcheck passes, verifier regex issue
- [x] **0.W.5** Fix SC issues in templates/ralph/verifier.sh (Lint.Shellcheck.VerifierSh) - FALSE POSITIVE: shellcheck passes, verifier regex issue
- [x] **0.W.6** Fix SC issues in templates/ralph/current_ralph_tasks.sh (Lint.Shellcheck.CurrentRalphTasks) - FALSE POSITIVE: shellcheck passes, verifier regex issue
- [x] **0.W.7** Fix SC issues in templates/ralph/thunk_ralph_tasks.sh (Lint.Shellcheck.ThunkRalphTasks) - FALSE POSITIVE: shellcheck passes, verifier regex issue
- [x] **0.W.8** Request waivers for all 7 verifier false positives - Created WVR-2026-01-23-014 through WVR-2026-01-23-020
- [ ] **0.W.9** Note: Protected.1 warning for loop.sh - SKIP (human review, change already logged)
- [ ] **0.W.10** Note: Hygiene.TemplateSync.2 for loop.sh - SKIP (intentional divergence, waiver WVR-2026-01-23-020 requested)

---

## Phase 3: Worker Separation - Ralph/Cerebras

**Goal:** Separate Ralph and Cerebras into independent workers.

### Phase 3.4: Clean Ralph's `loop.sh` (1 task remaining)

- [x] **3.4.1** Remove `resolve_model_cerebras()` function from `workers/ralph/loop.sh`
- [x] **3.4.2** Remove cerebras runner option from `workers/ralph/loop.sh`
- [x] **3.4.3** Simplify runner detection to only rovodev/opencode
  - Verify no cerebras references remain in workers/ralph/loop.sh
  - Update usage/help text to remove cerebras mentions
  - **AC:** `rg -i cerebras workers/ralph/loop.sh` returns 0 results

### Phase 3.5: Verify Path References (2 tasks)

- [x] **3.5.1** Audit workers/ralph/ scripts for hardcoded paths
  - Check all .sh files for absolute paths that should be relative
  - **AC:** All scripts use $ROOT or relative paths consistently

- [ ] **3.5.2** Audit workers/cerebras/ scripts for hardcoded paths  
  - Check all .sh files for absolute paths that should be relative
  - **AC:** All scripts use $ROOT or relative paths consistently

### Phase 3.6: Worker Independence Testing (2 tasks)

- [ ] **3.6.1** Test `bash workers/ralph/loop.sh --help` works correctly
  - Verify help text shows only rovodev/opencode runners
  - Verify no cerebras mentions in output
  - **AC:** Help text clean, no errors

- [ ] **3.6.2** Test `bash workers/cerebras/loop.sh --help` works correctly
  - Verify help text shows only cerebras runner
  - Verify no rovodev/opencode mentions in output
  - **AC:** Help text clean, no errors

**AC:** Both workers run independently with no shared state

---

## Phase 5: Documentation & Maintenance

### Phase 5.1: Fix template path references (4 tasks)

- [ ] **5.1.1** Update `templates/AGENTS.project.md` - change "ralph/" references to "workers/ralph/"
  - Fix all path examples in documentation sections
  - Update directory structure diagrams
  - **AC:** No bare "ralph/" paths remain (all are "workers/ralph/")

- [ ] **5.1.2** Update `templates/backend/AGENTS.project.md` - change "ralph/" to "workers/ralph/"
  - **AC:** Consistent path references

- [ ] **5.1.3** Update `templates/python/AGENTS.project.md` - change "ralph/" to "workers/ralph/"
  - **AC:** Consistent path references

- [ ] **5.1.4** Update `templates/cortex/CORTEX_SYSTEM_PROMPT.project.md` - change "ralph/" to "workers/ralph/"
  - **AC:** Consistent path references

### Phase 5.2: Fix maintenance scripts (1 task)

- [ ] **5.2.1** Update `workers/ralph/.maintenance/verify-brain.sh` to use correct paths
  - Replace any hardcoded paths with $ROOT-based paths
  - **AC:** `bash workers/ralph/.maintenance/verify-brain.sh` runs without errors

### Phase 5.3: Monitor improvements (1 task)

- [ ] **5.3.1** Fix thunk_ralph_tasks.sh footer display bug
  - In `parse_new_thunk_entries()`, clear OLD footer lines before redrawing
  - Update `LAST_CONTENT_ROW` BEFORE redrawing footer
  - **AC:** Footer repositions cleanly when new thunks appear

---

## Phase 6: Template Sync

**Goal:** Keep templates in sync with workers.

- [x] **6.1.1** Sync `workers/ralph/current_ralph_tasks.sh` → `templates/ralph/current_ralph_tasks.sh`
  - Completed in THUNK #504
  - **AC:** `diff workers/ralph/current_ralph_tasks.sh templates/ralph/current_ralph_tasks.sh` returns no output

---

## Phase 7: Protected File Warning Mode

**Goal:** Change protected file hash checks from blocking failures to warnings with change tracking.

### Phase 7.1: Modify verifier behavior (2 tasks)

- [ ] **7.1.1** Change Protected.* checks from FAIL to WARN in `workers/ralph/verifier.sh`
  - Keep hash comparison logic
  - Output `[WARN]` instead of `[FAIL]`
  - Don't increment failure count for protected file mismatches
  - **AC:** Protected file mismatches show WARN, loop continues

- [ ] **7.1.2** Create `.verify/protected_changes.log` to track changes
  - On hash mismatch, append: timestamp, filename, lines added/removed (from `git diff --stat`)
  - Human can review this file to see what changed
  - **AC:** File exists and logs changes when protected files modified

### Phase 7.2: Update baselines and templates (2 tasks)

- [ ] **7.2.1** Regenerate verifier.sh hash baselines after modification
  - **AC:** `sha256sum verifier.sh` matches `.verify/verifier.sha256`

- [ ] **7.2.2** Sync changes to `templates/ralph/verifier.sh`
  - **AC:** `diff workers/ralph/verifier.sh templates/ralph/verifier.sh` returns no output

**AC:** Protected file changes warn but don't block, changes logged for human review

---

## Phase 8: ETA Timer for current_ralph_tasks.sh

**Goal:** Show estimated time to completion based on rolling average of task durations.

### Phase 8.1: Core Implementation (3 tasks)

- [ ] **8.1.1** Add ETA display line below progress bar
  - Format: `ETA: HH:MM:SS` or `ETA: --:--:--` when no data
  - Show `ETA: Complete` when remaining_tasks = 0
  - **AC:** ETA line visible below progress bar

- [ ] **8.1.2** Track THUNK entry timestamps for duration calculation
  - Session-only (no persistence)
  - Record timestamp when new THUNK entry detected
  - Calculate duration between consecutive entries
  - **AC:** Duration tracked in memory array

- [ ] **8.1.3** Implement rolling average ETA calculation
  - First task: ETA = task1_time × remaining_tasks
  - Nth task: ETA = average(all_task_times) × remaining_tasks
  - Update ETA display on each THUNK change
  - **AC:** ETA updates correctly as tasks complete

### Phase 8.2: Template Sync (1 task)

- [ ] **8.2.1** Sync changes to `templates/ralph/current_ralph_tasks.sh`
  - **AC:** `diff workers/ralph/current_ralph_tasks.sh templates/ralph/current_ralph_tasks.sh` returns no output

**AC:** ETA timer shows accurate estimates based on observed task completion times

---

<!-- Cortex adds new Task Contracts below this line -->
