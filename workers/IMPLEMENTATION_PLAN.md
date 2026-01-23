# Implementation Plan - Brain Repository

**Status:** Ready for BUILD execution  
**Branch:** `brain-work`  
**Last Updated:** 2026-01-23 20:14:00  
**Progress:** Phase 0-CRITICAL complete, Phase 3 (Worker Separation) pending, Phase 5 (Documentation) pending

---

## Completed Phases (see THUNK.md for details)

| Phase | Description | THUNK # |
|-------|-------------|---------|
| 0-Warn | Markdown lint violations (110 tasks) | #474 |
| 1-Quick | Quick Reference Tables (5 tasks) | #475 |
| 2 | Shell Script Linting (25 tasks) | #475 |
| 3.7 | Shellcheck Fixes (10 tasks) | #476 |
| 4 | Shell Formatting (1 task) | #477 |

---

## Phase 0-CRITICAL: Fix Broken Task Monitor & Sync (COMPLETE)

- [x] **0.C.4** Fix `templates/ralph/sync_cortex_plan.sh` - same rewrite as workers version

**AC:** Sync markers only at section headers

---

## Phase 2.5: Skills Catalog Maintenance (2 tasks)

**Goal:** Fix broken links and missing entries in skills catalog.

- [x] **2.5.1** Add `bulk-edit-patterns.md` to `skills/index.md`
- [x] **2.5.2** Add `bulk-edit-patterns.md` to `skills/SUMMARY.md`
- [x] **2.5.3** Fix broken links in `skills/SUMMARY.md` (change `domains/X` to `domains/Y/X` paths)

**AC:** `bash workers/ralph/.maintenance/verify-brain.sh` reports 0 broken link issues

---

## Phase 3: Worker Separation - Ralph/Cerebras (18 tasks)

**Goal:** Separate Ralph and Cerebras into independent workers.

### Phase 3.1: Create Shared Infrastructure in `/workers/` (3 tasks)

- [ ] **3.1.1** Create `workers/shared/` directory for common functions
- [ ] **3.1.2** Extract common functions from `loop.sh` to `workers/shared/common.sh`
- [ ] **3.1.3** Create `workers/shared/verifier_common.sh` for shared verification logic

### Phase 3.2: Create `workers/cerebras/` Directory (3 tasks)

- [ ] **3.2.1** Create `workers/cerebras/` directory structure
- [ ] **3.2.2** Copy `loop.sh` template to `workers/cerebras/loop.sh`
- [ ] **3.2.3** Create `workers/cerebras/PROMPT.md` for Cerebras-specific instructions

### Phase 3.3: Create Cerebras-specific `loop.sh` (3 tasks)

- [ ] **3.3.1** Remove rovodev runner code from `workers/cerebras/loop.sh`
- [ ] **3.3.2** Remove opencode runner code from `workers/cerebras/loop.sh`
- [ ] **3.3.3** Set default runner to `cerebras` (remove runner selection logic)

### Phase 3.4: Clean Ralph's `loop.sh` (3 tasks)

- [ ] **3.4.1** Remove `resolve_model_cerebras()` function from `workers/ralph/loop.sh`
- [ ] **3.4.2** Remove cerebras runner option from `workers/ralph/loop.sh`
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

## Phase 5: Documentation & Terminology (5 remaining)

### Task 5.1: Update README.md with setup instructions

- [ ] **5.1.1** Add Quick Start section to README.md
- [ ] **5.1.2** Document what setup.sh does
- [ ] **5.1.3** Add available commands examples

### Task 5.2: Fix AGENTS.md template paths (4 tasks)

- [ ] **5.2.1** Update `templates/AGENTS.project.md`
- [ ] **5.2.2** Update `templates/backend/AGENTS.project.md`
- [ ] **5.2.3** Update `templates/python/AGENTS.project.md`
- [ ] **5.2.4** Update `templates/cortex/AGENTS.project.md`

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

<!-- Cortex adds new Task Contracts below this line -->
