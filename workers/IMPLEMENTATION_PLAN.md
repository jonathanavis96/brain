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
- [x] **0.W.4** Fix SC issues in templates/ralph/loop.sh (Lint.Shellcheck.LoopSh)
- [x] **0.W.5** Fix SC issues in templates/ralph/verifier.sh (Lint.Shellcheck.VerifierSh)
- [x] **0.W.6** Fix SC issues in templates/ralph/current_ralph_tasks.sh (Lint.Shellcheck.CurrentRalphTasks)
- [x] **0.W.7** Fix SC issues in templates/ralph/thunk_ralph_tasks.sh (Lint.Shellcheck.ThunkRalphTasks)
- [ ] **0.W.8** Note: Protected.1 warning for loop.sh - SKIP (human review, change already logged)
- [ ] **0.W.9** Note: Hygiene.TemplateSync.2 for loop.sh - SKIP (intentional divergence, covered by 0.W.4)

---

## Phase 3: Worker Separation - Ralph/Cerebras

**Goal:** Separate Ralph and Cerebras into independent workers.

### Phase 3.3: Create Cerebras-specific `loop.sh` (3 tasks)

- [x] **3.3.1** Remove rovodev runner code from `workers/cerebras/loop.sh`
- [x] **3.3.2** Remove opencode runner code from `workers/cerebras/loop.sh`
- [x] **3.3.3** Set default runner to `cerebras` (remove runner selection logic)

### Phase 3.4: Clean Ralph's `loop.sh` (3 tasks)

- [x] **3.4.1** Remove `resolve_model_cerebras()` function from `workers/ralph/loop.sh`
- [x] **3.4.2** Remove cerebras runner option from `workers/ralph/loop.sh`
- [ ] **3.4.3** Simplify runner detection to only rovodev/opencode

### Phase 3.5: Update All Path References (3 tasks)

- [ ] **3.5.1** Update `workers/ralph/` scripts to use relative paths
- [ ] **3.5.2** Update `workers/cerebras/` scripts to use relative paths
- [ ] **3.5.3** Update any hardcoded paths in templates

### Phase 3.6: Verification & Cleanup (3 tasks)

- [ ] **3.6.1** Verify `workers/ralph/loop.sh` works independently
- [ ] **3.6.2** Verify `workers/cerebras/loop.sh` works independently
- [ ] **3.6.3** Remove any remaining duplicate code

**AC:** Both workers run independently with no shared state

---

## Phase 5: Documentation & Terminology

### Phase 5.1: Update README.md with setup instructions

- [ ] **5.1.1** Add Quick Start section to README.md
- [ ] **5.1.2** Document what setup.sh does
- [ ] **5.1.3** Add available commands examples

### Phase 5.2: Fix AGENTS.md template paths

- [ ] **5.2.1** Update `templates/AGENTS.project.md`
- [ ] **5.2.2** Update `templates/backend/AGENTS.project.md`
- [ ] **5.2.3** Update `templates/python/AGENTS.project.md`
- [ ] **5.2.4** Update `templates/cortex/AGENTS.project.md`

### Phase 5.4: Fix "Brain KB" terminology

- [ ] **5.4.1** Edit `templates/NEURONS.project.md` - replace "Brain KB" with "Brain Skills"

**AC:** `rg "Brain KB" templates/ | wc -l` returns 0

### Phase 5.5: Fix thunk_ralph_tasks.sh footer display bug

- [ ] **5.5.1** In `parse_new_thunk_entries()`, clear OLD footer lines before redrawing
- [ ] **5.5.2** Update `LAST_CONTENT_ROW` BEFORE redrawing footer

**AC:** Footer repositions cleanly when new thunks appear

### Phase 5.6: Fix maintenance script paths

- [ ] **5.6.1** Update `workers/ralph/.maintenance/verify-brain.sh` to use correct paths

**AC:** `bash workers/ralph/.maintenance/verify-brain.sh` reports 0 issues

---

## Phase 6: Template Sync

**Goal:** Keep templates in sync with workers.

- [ ] **6.1.1** Sync `workers/ralph/current_ralph_tasks.sh` → `templates/ralph/current_ralph_tasks.sh`
  - **AC:** `diff workers/ralph/current_ralph_tasks.sh templates/ralph/current_ralph_tasks.sh` returns no output
  - **Note:** Workers version has performance optimizations (pure bash vs sed/cut)

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
