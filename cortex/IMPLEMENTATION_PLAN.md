# Cortex Implementation Plan

**Purpose:** Task Contracts for Ralph workers. Each contract defines an atomic task with clear goals and acceptance criteria.

**Workflow:**

1. Cortex creates/updates Task Contracts here
2. Ralph's `loop.sh` syncs this file via `sync_cortex_plan.sh`
3. Ralph works through tasks, marking them complete
4. Cortex reviews progress and creates new contracts

---

## Current Status

**Last Updated:** 2026-01-23 21:00:00  
**Progress:** 57 pending tasks across 6 phases

---

## Phase 0-CRITICAL: Fix Broken Task Monitor & Sync Issues

### Phase 0-C.2: Rewrite Sync Script (Append-Only, Clean Format)

- [ ] **0.C.5** Clean up `workers/IMPLEMENTATION_PLAN.md`:
  - Remove duplicate "Phase 0-Synced" sections (merge into one)
  - Remove all inline `<!-- SYNCED_FROM_CORTEX -->` comments
  - Preserve Ralph's completed checkboxes `[x]`
  - **AC:** Only one "Phase 0-Synced" section exists, no inline sync markers

### Phase 0-C.3: Fix Sync Script Duplicate Detection Bug

- [x] **0.C.9** Test sync end-to-end:
  - Add dummy `## Phase 99: Test Sync (1 task)` to Cortex plan
  - Run sync, verify only Phase 99 appears in Ralph's plan (no duplicates)
  - Remove test phase from both plans
  - **AC:** No duplicate sections created, sync log shows "1 sections added"

---

## Phase 2: Lint Issues (Dynamic)

**Note:** Auto-fix runs before each BUILD iteration. Check verifier output for remaining issues.

- [ ] **2.1** Fix any `[WARN]` items from verifier output
  - **AC:** `bash verifier.sh` shows 0 WARN items
  - **Note:** Focus on non-auto-fixable issues (shellcheck in protected files, MD040 language tags)

---

## Phase 3: Worker Separation - Ralph/Cerebras

**Goal:** Separate workers into `workers/ralph/` (rovodev/opencode) and `workers/cerebras/` (cerebras API).

### Phase 3.2: Create `workers/cerebras/` Directory

- [x] **3.2.1** Create `workers/cerebras/` directory structure
- [x] **3.2.2** Copy `loop.sh` template to `workers/cerebras/loop.sh`
- [x] **3.2.3** Create `workers/cerebras/NEURONS.md` (cerebras-specific structure map)

### Phase 3.3: Create Cerebras-specific `loop.sh`

- [x] **3.3.1** Copy `workers/ralph/loop.sh` → `workers/cerebras/loop.sh`
- [x] **3.3.2** Remove opencode runner code from `workers/cerebras/loop.sh`
- [x] **3.3.3** Set default runner to `cerebras` (remove runner selection logic)

### Phase 3.4: Clean Ralph's `loop.sh`

- [x] **3.4.1** Remove `resolve_model_cerebras()` function from `workers/ralph/loop.sh`
- [x] **3.4.2** Remove cerebras runner dispatch code from `workers/ralph/loop.sh`
- [x] **3.4.3** Remove `--runner cerebras` option from help text and argument parsing

### Phase 3.5: Update All Path References

- [x] **3.5.2** Update `workers/ralph/pr-batch.sh` path references if needed
- [ ] **3.5.3** Update `cortex/snapshot.sh` to reference new shared paths
- [ ] **3.5.4** Update root `AGENTS.md` with new worker structure documentation

### Phase 3.6: Verification & Cleanup

- [x] **3.6.1** Run `bash workers/verifier.sh` and confirm all checks pass
- [ ] **3.6.2** Test `bash workers/cerebras/loop.sh --help` works correctly
- [ ] **3.6.3** Update hash baselines in `workers/.verify/` for moved files

### Phase 3.7: Additional Shellcheck Fixes for Separation

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

## Phase 4: Shell Script Formatting Consistency

- [ ] **4.1** Run `shfmt -w -i 2 workers/ralph/*.sh templates/ralph/*.sh` to normalize all shell scripts
  - **AC:** `shfmt -d workers/ralph/*.sh templates/ralph/*.sh` returns no diff

---

## Phase 5: Documentation & Terminology

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

## Phase 6: Template Sync & Cleanup

**Goal:** Ensure templates stay in sync with workers.

### Phase 6.1: Template Sync Issues

- [x] **6.1.1** Sync `workers/ralph/current_ralph_tasks.sh` with `templates/ralph/current_ralph_tasks.sh`
  - **AC:** `diff workers/ralph/current_ralph_tasks.sh templates/ralph/current_ralph_tasks.sh` returns no output
  - **Note:** Determine which is authoritative (likely workers/), then copy to template

- [ ] **6.1.2** Sync `workers/ralph/loop.sh` core logic with `templates/ralph/loop.sh`
  - **AC:** Hygiene.TemplateSync.2 check passes
  - **Note:** This is a PROTECTED file - may need hash baseline update after sync

**Note:** Lint issues (shellcheck, markdownlint) are handled dynamically by Phase 2. Check verifier output for current state.

---

<!-- Cortex adds new Task Contracts below this line -->
