# Cortex Implementation Plan

## Phase 0-CRITICAL: Fix Broken Task Monitor & Sync Issues (8 tasks)

**Goal:** Fix `current_ralph_tasks.sh` (broken due to path change) and fix sync timestamp format.

### Phase 0-C.1: Fix Path References (2 tasks)

- [x] **0.C.1** Fix `workers/ralph/current_ralph_tasks.sh` line 25 - change `PLAN_FILE="$RALPH_DIR/IMPLEMENTATION_PLAN.md"` to `PLAN_FILE="$RALPH_DIR/../IMPLEMENTATION_PLAN.md"`
  - **AC:** `bash workers/ralph/current_ralph_tasks.sh` shows tasks instead of "Error: IMPLEMENTATION_PLAN.md not found"
- [x] **0.C.2** Fix `templates/ralph/current_ralph_tasks.sh` line 26 - same fix for template consistency
  - **AC:** Template matches worker file path reference

**Root Cause:** Task 9.1.3 moved `workers/ralph/IMPLEMENTATION_PLAN.md` → `workers/IMPLEMENTATION_PLAN.md` but didn't update the path in `current_ralph_tasks.sh`.

### Phase 0-C.2: Rewrite Sync Script (Append-Only, Clean Format) (3 tasks)

**Goal:** Fix sync to use append-only model with clean format. No per-task markers, no overwriting Ralph's progress.

- [x] **0.C.3** Rewrite `workers/ralph/sync_cortex_plan.sh` with these changes:
  - Fix timestamp: `$(date +%Y-%m-%d)` → `$(date '+%Y-%m-%d %H:%M:%S')`
  - Remove per-task `<!-- SYNCED_FROM_CORTEX -->` markers (lines 78, 130)
  - Add single marker at section header only: `## Phase 0-Synced: Tasks from Cortex (synced: 2026-01-23 16:45:00)`
  - Ensure script only APPENDS new tasks, never touches existing tasks/checkboxes
  - Flatten Cortex grouped format into atomic tasks for Ralph
  - **AC:** `bash sync_cortex_plan.sh --dry-run` shows clean output without per-task markers
- [x] **0.C.4** Fix `templates/ralph/sync_cortex_plan.sh` - same rewrite for template consistency
  - **AC:** Template matches worker file
- [ ] **0.C.5** Clean up `workers/IMPLEMENTATION_PLAN.md`:
  - Remove duplicate "Phase 0-Synced" sections (merge into one)
  - Remove all inline `<!-- SYNCED_FROM_CORTEX -->` comments
  - Preserve Ralph's completed checkboxes `[x]`
  - **AC:** Only one "Phase 0-Synced" section exists, no inline sync markers

### Phase 0-C.3: Fix Sync Script Duplicate Detection Bug (4 tasks)

**Problem:** Sync script copies entire Cortex plan instead of just new sections. It matches sections by Phase ID regex but titles/counts differ between plans, causing false "new section" detection.

**Solution:** Use exact full-header-line matching + track synced headers in `.last_sync` file.

- [ ] **0.C.6** Rewrite sync detection logic in `workers/ralph/sync_cortex_plan.sh`:
  - Create `workers/ralph/.last_sync` file to track synced section headers (full lines)
  - Match sections by **exact header line** (not regex-extracted Phase ID)
  - Only append sections whose headers don't exist in Ralph's plan
  - Update `.last_sync` after successful sync
  - **AC:** `bash sync_cortex_plan.sh --dry-run` on unchanged plans shows "No new sections"
  - **AC:** Adding new Phase to Cortex plan syncs ONLY that phase

- [ ] **0.C.7** Add `--reset` flag to sync script:
  - Clears `.last_sync` file
  - Allows re-bootstrapping if plans diverge
  - **AC:** `bash sync_cortex_plan.sh --reset` clears state and reports success

- [ ] **0.C.8** Sync template: Copy fixed `workers/ralph/sync_cortex_plan.sh` to `templates/ralph/sync_cortex_plan.sh`
  - **AC:** `diff workers/ralph/sync_cortex_plan.sh templates/ralph/sync_cortex_plan.sh` returns no output

- [ ] **0.C.9** Test sync end-to-end:
  - Add dummy `## Phase 99: Test Sync (1 task)` to Cortex plan
  - Run sync, verify only Phase 99 appears in Ralph's plan (no duplicates)
  - Remove test phase from both plans
  - **AC:** No duplicate sections created, sync log shows "1 sections added"

**Sync Model:** ONE-WAY append-only (Cortex → Ralph). Ralph owns his checkboxes. Track synced headers in `.last_sync`.

---

**Purpose:** Task Contracts for Ralph workers. Each contract defines an atomic task with clear goals and acceptance criteria.

**Workflow:**

1. Cortex creates/updates Task Contracts here
2. Ralph's `loop.sh` syncs this file via `sync_cortex_plan.sh`
3. Ralph works through tasks, marking them complete
4. Cortex reviews progress and creates new contracts

---

## Current Status

**Last Updated:** 2026-01-23 20:45:00  
**Progress:** 73 pending tasks across 6 phases  
**Verifier:** 52 PASS, 0 FAIL, 9 WARN

---

## Phase 1: Quick Reference Tables (5 tasks)

Add Quick Reference tables to skills files following SUMMARY.md pattern.

- [x] **1.1** Add Quick Reference table to `skills/domains/code-quality/code-hygiene.md`
- [x] **1.2** Add Quick Reference table to `skills/domains/languages/shell/common-pitfalls.md`
- [x] **1.3** Add Quick Reference table to `skills/domains/languages/shell/strict-mode.md`
- [x] **1.4** Add Quick Reference table to `skills/domains/languages/shell/variable-patterns.md`
- [x] **1.5** Add Quick Reference table to `skills/domains/backend/database-patterns.md`

**AC:** Each file has a Quick Reference section  
**Commit:** `docs(skills): add Quick Reference tables`

---

## Phase 2: Shell Script Linting (25 tasks)

### Phase 2.1: setup.sh Issues (3 tasks)

- [x] **2.1.1** Fix SC2016 in `setup.sh` line 70 - grep pattern with literal $HOME
  - **Note:** False positive - single quotes intentional for literal string search
- [x] **2.1.2** Fix SC2129 in `setup.sh` line 75 - consolidate multiple redirects
  - **Fix:** Combine echo statements into single redirect block
- [x] **2.1.3** Fix SC2016 in `setup.sh` line 77 - echo with literal $HOME
  - **Note:** Intentional - we want literal $HOME in .bashrc

### Phase 2.2: Template Shellcheck Issues (10 tasks)

- [x] **2.2.1** Fix SC2034 (unused RUNNER) in `templates/cortex/cortex.bash` line 64
- [ ] **2.2.2** Fix SC2034 (unused CONFIG_FLAG) in `templates/cortex/cortex.bash` line 107
- [ ] **2.2.3** Fix SC2086 (unquoted CONFIG_FLAG) in `templates/cortex/one-shot.sh` lines 257, 261
- [ ] **2.2.4** Fix SC2162 (read without -r) in `templates/ralph/current_ralph_tasks.sh` lines 261, 558
- [ ] **2.2.5** Fix SC2162 (read without -r) in `templates/ralph/loop.sh` lines 457, 498
- [ ] **2.2.6** Fix SC2002 (useless cat) in `templates/ralph/loop.sh` line 666
- [ ] **2.2.7** Fix SC2086 (unquoted attach_flag) in `templates/ralph/loop.sh` line 765
- [ ] **2.2.8** Fix SC2034 (unused week_num) in `templates/ralph/pr-batch.sh` line 103
- [ ] **2.2.9** Fix SC2162 (read without -r) in `templates/ralph/pr-batch.sh` line 191
- [ ] **2.2.10** Fix SC2162 (read without -r) in `templates/ralph/thunk_ralph_tasks.sh` line 379

### Phase 2.3: workers/ralph/ Shellcheck Issues (8 tasks)

- [ ] **2.3.1** Fix SC2034 (unused week_num) in `workers/ralph/pr-batch.sh` line 102
- [ ] **2.3.2** Fix SC2162 (read without -r) in `workers/ralph/pr-batch.sh` line 190
- [ ] **2.3.3** Fix SC2155 (declare/assign separately) in `workers/ralph/render_ac_status.sh` lines 25,26,29,30,31,32,111,114
- [ ] **2.3.4** Fix SC2129 (consolidate redirects) in `workers/ralph/sync_cortex_plan.sh` line 160
- [ ] **2.3.5** Fix SC2086 (quote variable) in `workers/ralph/sync_cortex_plan.sh` line 164
- [ ] **2.3.6** Fix SC2129 (consolidate redirects) in `workers/ralph/sync_cortex_plan.sh` line 168
- [ ] **2.3.7** Fix SC2162 (read without -r) in `workers/ralph/thunk_ralph_tasks.sh` line 379
- [ ] **2.3.8** Fix SC2094 (read/write same file) in `workers/ralph/verifier.sh` lines 395-396 - **PROTECTED FILE**

### Phase 2.4: Markdownlint Issues (3 tasks)

- [ ] **2.4.1** Fix MD032 (blank lines around lists) in markdown files
- [ ] **2.4.2** Fix MD031 (blank lines around fences) in markdown files
- [ ] **2.4.3** Fix MD022 (blank lines around headings) in markdown files

### Phase 2.5: shfmt Formatting (2 tasks)

- [x] **2.5.1** Fix shfmt formatting in `workers/ralph/current_ralph_tasks.sh`
  - **Fix:** Run `shfmt -w -i 2 workers/ralph/current_ralph_tasks.sh`
- [x] **2.5.2** Fix shfmt formatting in `workers/ralph/thunk_ralph_tasks.sh`
  - **Fix:** Run `shfmt -w -i 2 workers/ralph/thunk_ralph_tasks.sh`

### Phase 2.6: Final Verification (1 task)

- [ ] **2.6.1** Run full pre-commit and verify all pass
  - **AC:** `pre-commit run --all-files` exits with code 0

---

## Phase 3: Worker Separation - Ralph/Cerebras (29 tasks)

**Goal:** Separate workers into `workers/ralph/` (rovodev/opencode) and `workers/cerebras/` (cerebras API).

### Phase 3.1: Create Shared Infrastructure in `/workers/` (3 tasks)

- [x] **3.1.1** Move `workers/ralph/VALIDATION_CRITERIA.md` → `workers/VALIDATION_CRITERIA.md`
- [ ] **3.1.2** Move `workers/ralph/sync_cortex_plan.sh` → `workers/sync_cortex_plan.sh`
- [ ] **3.1.3** Move `workers/ralph/render_ac_status.sh` → `workers/render_ac_status.md`

### Phase 3.2: Create `workers/cerebras/` Directory (3 tasks)

- [ ] **3.2.1** Create `workers/cerebras/` directory
- [ ] **3.2.2** Move `workers/ralph/PROMPT_cerebras.md` → `workers/cerebras/PROMPT_cerebras.md`
- [ ] **3.2.3** Create `workers/cerebras/NEURONS.md` (cerebras-specific structure map)

### Phase 3.3: Create Cerebras-specific `loop.sh` (3 tasks)

- [ ] **3.3.1** Copy `workers/ralph/loop.sh` → `workers/cerebras/loop.sh`
- [ ] **3.3.2** Remove opencode runner code from `workers/cerebras/loop.sh`
- [ ] **3.3.3** Set default runner to `cerebras` (remove runner selection logic)

### Phase 3.4: Clean Ralph's `loop.sh` (3 tasks)

- [ ] **3.4.1** Remove `resolve_model_cerebras()` function from `workers/ralph/loop.sh`
- [ ] **3.4.2** Remove cerebras runner dispatch code from `workers/ralph/loop.sh`
- [ ] **3.4.3** Remove `--runner cerebras` option from help text and argument parsing

### Phase 3.5: Update All Path References (3 tasks)

- [x] **3.5.1** Update `workers/ralph/current_ralph_tasks.sh` to reference `../IMPLEMENTATION_PLAN.md` → **MOVED to Phase 0-CRITICAL as 0.C.1**
- [ ] **3.5.2** Update `workers/ralph/pr-batch.sh` path references if needed
- [ ] **3.5.3** Update `cortex/snapshot.sh` to reference new shared paths
- [ ] **3.5.4** Update root `AGENTS.md` with new worker structure documentation

### Phase 3.6: Verification & Cleanup (3 tasks)

- [ ] **3.6.1** Run `bash workers/verifier.sh` and confirm all checks pass
- [ ] **3.6.2** Test `bash workers/cerebras/loop.sh --help` works correctly
- [ ] **3.6.3** Update hash baselines in `workers/.verify/` for moved files

### Phase 3.7: Additional Shellcheck Fixes for Separation (10 tasks)

- [ ] **3.7.1** Fix SC2034 (unused SECTION_HEADER) in `workers/ralph/current_ralph_tasks.sh` line 53
- [ ] **3.7.2** Fix SC2034 (unused FIRST_RUN) in `workers/ralph/current_ralph_tasks.sh` line 90
- [ ] **3.7.3** Fix SC2086 (unquoted var) in `workers/ralph/current_ralph_tasks.sh` line 488
- [ ] **3.7.4** Fix SC2155 (local/assign) in `workers/ralph/current_ralph_tasks.sh` line 509
- [ ] **3.7.5** Fix SC2086 (unquoted phase7_line) in `workers/ralph/current_ralph_tasks.sh` line 515
- [ ] **3.7.6** Fix SC2155 (local/assign) in `workers/ralph/pr-batch.sh` lines 102, 190
- [ ] **3.7.7** Fix SC2162 (read -r) in `workers/ralph/current_ralph_tasks.sh` lines 261, 558
- [ ] **3.7.8** Fix SC2162 (read -r) in `workers/ralph/loop.sh` lines 457, 498
- [ ] **3.7.9** Fix SC2002 (useless cat) in `workers/ralph/loop.sh` line 666
- [ ] **3.7.10** Fix SC2086 (unquoted attach_flag) in `workers/ralph/loop.sh` line 765

**Acceptance Criteria:**

- [ ] `workers/ralph/loop.sh` only has rovodev and opencode runners
- [ ] `workers/cerebras/loop.sh` only has cerebras runner
- [ ] Shared files exist in `workers/`
- [ ] `bash workers/verifier.sh` passes all checks

---

## Phase 4: Shell Script Formatting Consistency (1 task)

- [ ] **4.1** Run `shfmt -w -i 2 workers/ralph/*.sh templates/ralph/*.sh` to normalize all shell scripts
  - **AC:** `shfmt -d workers/ralph/*.sh templates/ralph/*.sh` returns no diff

---

## Phase 5: Documentation & Terminology (6 tasks)

### Task 5.1: Update README.md with setup instructions

- [ ] **5.1.1** Add Quick Start section to README.md
- [ ] **5.1.2** Document what setup.sh does
- [ ] **5.1.3** Add available commands examples

**AC:** README.md has clear Quick Start and setup documentation

### Task 5.2: Fix KB→Skills terminology in templates

- [ ] **5.2.1** Update `templates/AGENTS.project.md`
- [ ] **5.2.2** Update `templates/backend/AGENTS.project.md`
- [ ] **5.2.3** Update `templates/python/AGENTS.project.md`
- [ ] **5.2.4** Update `templates/cortex/AGENTS.project.md`

**AC:** `grep -r "Knowledge Base\|KB lookups" templates/` returns no matches

### Task 5.3: Copy SKILL_TEMPLATE to templates

- [ ] **5.3.1** Copy `skills/self-improvement/SKILL_TEMPLATE.md` to `templates/ralph/SKILL_TEMPLATE.md`

**AC:** File exists and matches source

### Task 5.4: Fix "Brain KB" terminology

- [ ] **5.4.1** Edit `templates/NEURONS.project.md` - replace "Brain KB" with "Brain Skills"

**AC:** `rg "Brain KB" templates/ | wc -l` returns 0

### Task 5.5: Fix thunk_ralph_tasks.sh footer display bug

- [ ] **5.5.1** In `parse_new_thunk_entries()`, clear OLD footer lines before redrawing
- [ ] **5.5.2** Update `LAST_CONTENT_ROW` BEFORE redrawing footer

**AC:** Footer repositions cleanly when new thunks appear

### Task 5.6: Fix maintenance script paths

- [ ] **5.6.1** Update `workers/ralph/.maintenance/verify-brain.sh` to use correct paths

**AC:** `bash workers/ralph/.maintenance/verify-brain.sh` reports 0 issues

---

## Phase 6: Fix Verifier WARNs (9 tasks)

**Goal:** Resolve all 9 WARN-level checks from verifier so they pass cleanly.

### Phase 6.1: Template Sync Issues (2 tasks)

- [ ] **6.1.1** Sync `workers/ralph/current_ralph_tasks.sh` with `templates/ralph/current_ralph_tasks.sh`
  - **AC:** `diff workers/ralph/current_ralph_tasks.sh templates/ralph/current_ralph_tasks.sh` returns no output
  - **Note:** Determine which is authoritative (likely workers/), then copy to template

- [ ] **6.1.2** Sync `workers/ralph/loop.sh` core logic with `templates/ralph/loop.sh`
  - **AC:** Hygiene.TemplateSync.2 check passes
  - **Note:** This is a PROTECTED file - may need hash baseline update after sync

### Phase 6.2: Markdown Balanced Fences (3 tasks)

- [ ] **6.2.1** Fix unbalanced code fences in `workers/ralph/NEURONS.md`
  - **AC:** `grep -c "^\`\`\`[a-z]" workers/ralph/NEURONS.md` equals `grep -c "^\`\`\`$" workers/ralph/NEURONS.md`
  - **Fix:** Ensure every opening fence has a matching closing fence

- [ ] **6.2.2** Fix unbalanced code fences in `workers/ralph/AGENTS.md`
  - **AC:** Opens equals closes for code fences
  - **Note:** This is a PROTECTED file - will need hash baseline update

- [ ] **6.2.3** Fix unbalanced code fences in `workers/ralph/THOUGHTS.md`
  - **AC:** Opens equals closes for code fences

### Phase 6.3: Shellcheck Issues (4 tasks)

- [ ] **6.3.1** Fix shellcheck issues in `workers/ralph/loop.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/loop.sh` returns 0 errors
  - **Note:** PROTECTED file - needs human approval for changes + hash update

- [ ] **6.3.2** Fix shellcheck issues in `workers/ralph/verifier.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/verifier.sh` returns 0 errors
  - **Note:** PROTECTED file - needs human approval for changes + hash update

- [ ] **6.3.3** Fix shellcheck issues in `workers/ralph/current_ralph_tasks.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/current_ralph_tasks.sh` returns 0 errors

- [ ] **6.3.4** Fix shellcheck issues in `workers/ralph/thunk_ralph_tasks.sh`
  - **AC:** `shellcheck -e SC1091 workers/ralph/thunk_ralph_tasks.sh` returns 0 errors

**Acceptance Criteria for Phase 6:**

- [ ] `bash workers/ralph/verifier.sh` shows 0 WARN (all checks PASS)

---

<!-- Cortex will add new Task Contracts above this line -->
