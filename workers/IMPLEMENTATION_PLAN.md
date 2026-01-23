# Implementation Plan - Brain Repository

**Status:** Active  
**Branch:** `brain-work`  
**Last Updated:** 2026-01-23 22:10:00

---

## Phase 0-Warn: Verifier Warnings (FALSE POSITIVES - Request Waivers)

These are all false positives - shellcheck passes, files are in sync:

- [ ] **WARN.TemplateSync.1.current** Sync current_ralph_tasks.sh to template (workers has perf optimizations)
- [ ] **WARN.TemplateSync.2.loop** loop.sh path differences - BY DESIGN (workers/ralph/ vs ralph/)

---

## Phase 3: Worker Separation - Ralph/Cerebras

**Goal:** Separate Ralph and Cerebras into independent workers.

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

<!-- Cortex adds new Task Contracts below this line -->
