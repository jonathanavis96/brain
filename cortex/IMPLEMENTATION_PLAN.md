# Cortex Implementation Plan

**Purpose:** Task Contracts for Ralph workers. Each contract defines an atomic task with clear goals and acceptance criteria.

**Workflow:**

1. Cortex creates/updates Task Contracts here
2. Ralph's `loop.sh` syncs this file via `sync_cortex_plan.sh`
3. Ralph works through tasks, marking them complete
4. Cortex reviews progress and creates new contracts

---

## Current Status

**Last Updated:** 2026-01-25 16:15:00  
**Progress:** Cleaned plan - completed tasks removed. ~26 pending tasks across Phases 10, 9C, 0-Warn, 6, 7.

**Active Phases:**

- Phase 10: Plan Auto-Cleanup (6 tasks) - **NEW** automated task archival
- Phase 9C: Task Optimization (11 tasks) - batching & decomposition
- Phase 0-Warn: Verifier Warnings (2 tasks) - human intervention required
- Phase 6: Template Improvements (3 tasks) - language templates
- Phase 7: Documentation (5 tasks) - onboarding improvements

---

## Completed Phases

See `workers/ralph/THUNK.md` for complete task history (550+ completed tasks).

**Completed:** Phases 0-5, 6 (Housekeeping), 7 (Gap Radar), 8 (Playbooks), X (Structured Logging)

---

<!-- Cortex adds new Task Contracts below this line -->

## Phase 10: Plan Auto-Cleanup System

**Goal:** Automate removal of completed tasks from IMPLEMENTATION_PLAN.md to reduce agent reading time.

**Why:** Agents spend excessive tokens reading completed tasks. Auto-cleanup keeps plans lean.

### Phase 10.1: Cleanup Script

- [x] **10.1.1** Create `workers/ralph/cleanup_plan.sh`
  - **Goal:** Script that removes `[x]` lines and empty phase sections from IMPLEMENTATION_PLAN.md
  - **AC:** Running `bash cleanup_plan.sh --dry-run` shows what would be removed
  - **Constraints:** Preserve phase headers if they have pending tasks, preserve marker line

- [ ] **10.1.2** Add `--archive` flag to append removed tasks to THUNK.md
  - **Goal:** Before deletion, append task summaries to THUNK.md with timestamp
  - **AC:** `bash cleanup_plan.sh --archive` moves tasks to THUNK.md then removes from plan
  - **Format:** `| YYYY-MM-DD | Task ID | Description | auto-cleanup |`

- [ ] **10.1.3** Add phase collapse detection
  - **Goal:** Remove entire phase section when all tasks are `[x]`
  - **AC:** Empty phases (all complete) are removed, phases with pending tasks preserved

### Phase 10.2: Integration

- [ ] **10.2.1** Add cleanup hook to `sync_cortex_plan.sh`
  - **Goal:** After syncing from cortex, run cleanup on workers plan
  - **AC:** `sync_cortex_plan.sh` calls `cleanup_plan.sh --archive` automatically

- [ ] **10.2.2** Add `--no-cleanup` flag to sync script
  - **Goal:** Allow skipping auto-cleanup when needed for debugging
  - **AC:** `sync_cortex_plan.sh --no-cleanup` preserves completed tasks

### Phase 10.3: Safety & Validation

- [ ] **10.3.1** Create `tools/test_plan_cleanup.sh` test script
  - **Goal:** Verify cleanup preserves pending tasks and removes only completed
  - **AC:** Test creates sample plan, runs cleanup, verifies correct output

**Phase AC:** Cleanup script exists, integrates with sync, tested

---

## Phase 9C: Task Optimization (Batching + Decomposition)

**Goal:** Use Phase 0 structured logs to identify batching and decomposition opportunities, reducing task overhead and improving iteration success rate.

**Artifacts:** `artifacts/optimization_hints.md` (analysis output)

### Phase 9C.0: Prerequisites (Marker Pipeline Fix)

- [ ] **9C.0.3** Document RovoDev tool instrumentation limitation
  - **Goal:** Clarify that RovoDev's native tools bypass shell wrapper
  - **AC:** `artifacts/optimization_hints.md` has "Limitations" section explaining tool visibility gap
  - **Note:** RovoDev bash/grep/find_and_replace_code don't go through `log_tool_start()`

### Phase 9C.1: Batching Infrastructure

- [ ] **9C.1.1** Enhance `cortex/snapshot.sh` with batching hints
  - **Goal:** Show "⚡ Batching opportunities: X" when ≥3 similar pending tasks detected
  - **AC:** Snapshot output shows batching hints section when opportunities exist
  - **Detection:** Same error code (MDxxx, SCxxxx), same directory prefix, same file type

- [ ] **9C.1.2** Add task complexity tags to PROMPT_REFERENCE.md
  - **Goal:** Document `[S/M/L]` complexity convention for task estimation
  - **AC:** PROMPT_REFERENCE.md has "Task Complexity" section with S=~90s, M=~300s, L=~600s guidelines

### Phase 9C.2: Apply Batching to Current Backlog

- [ ] **9C.2.1** Create batch task template in `templates/ralph/PROMPT.md`
  - **Goal:** Standard format for batched tasks with multi-file scope
  - **AC:** Template shows batch task example with glob patterns and verification

- [ ] **9C.2.B1** BATCH: Create language project templates (combines 6.1.1, 6.1.2, 6.3.1)
  - **Scope:** Create `templates/javascript/`, `templates/go/`, expand `templates/website/`
  - **Steps:**
    1. Define standard template structure (AGENTS.md, NEURONS.md, THOUGHTS.md, VALIDATION_CRITERIA.md)
    2. Create all three directories with standard files in one pass
    3. Verify each directory has required files
  - **AC:** All three template directories exist with standard structure
  - **Replaces:** 6.1.1, 6.1.2, 6.3.1

- [ ] **9C.2.B2** BATCH: Update skills documentation (combines 7.2.1, 7.2.2)
  - **Scope:** `skills/index.md` + `skills/SUMMARY.md`
  - **Steps:**
    1. Scan `skills/domains/` and `skills/playbooks/` for all files
    2. Update `skills/index.md` with any missing entries
    3. Update `skills/SUMMARY.md` error reference and playbooks section
  - **AC:** Both index files list all current skills, SUMMARY includes playbooks
  - **Replaces:** 7.2.1, 7.2.2

- [ ] **9C.2.B3** BATCH: Improve onboarding docs (combines 7.1.1, 7.1.2)
  - **Scope:** Root `README.md` + new `CONTRIBUTING.md`
  - **Steps:**
    1. Enhance README.md onboarding flow (quick start, navigation)
    2. Create CONTRIBUTING.md with guidelines
    3. Cross-link between files
  - **AC:** README has clear onboarding, CONTRIBUTING.md exists
  - **Replaces:** 7.1.1, 7.1.2

### Phase 9C.3: Decomposition Detection

- [ ] **9C.3.1** Add duration tracking to `current_ralph_tasks.sh` footer
  - **Goal:** Show when current task exceeds 2x median (⚠️ warning)
  - **AC:** Footer shows "⚠️ Current task exceeding median" when appropriate

- [ ] **9C.3.2** Create decomposition checklist in `skills/playbooks/`
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

## Phase 0-Warn: Verifier Warnings

**Goal:** Resolve verifier warnings from latest run.

**Status:** 2 warnings present - both require HUMAN INTERVENTION (protected file changes).

- [ ] **WARN.Protected.1** - Protected file changed (human review required) - HUMAN INTERVENTION REQUIRED
- [ ] **WARN.Protected.2** - Protected file changed (human review required) - HUMAN INTERVENTION REQUIRED

---

## Phase 6: Template Improvements (Pending)

**Goal:** Enhance project templates with better defaults and more comprehensive coverage.

- [ ] **6.1.1** Create `templates/javascript/` directory with JS/TS project template
  - AGENTS.project.md, NEURONS.project.md, VALIDATION_CRITERIA.project.md
  - package.json template with common scripts
  - ESLint and Prettier configs
  - **AC:** Directory exists with 5+ files

- [ ] **6.1.2** Create `templates/go/` directory with Go project template
  - AGENTS.project.md, NEURONS.project.md, VALIDATION_CRITERIA.project.md
  - go.mod template and project structure
  - golangci-lint config
  - **AC:** Directory exists with 5+ files

- [ ] **6.3.1** Expand `templates/website/` with more comprehensive starter
  - Review existing website skills in skills/domains/websites/
  - Add section-based composition templates
  - Include SEO and analytics guidance
  - **AC:** templates/website/ has enhanced structure

---

## Phase 7: Documentation and Maintenance (Pending)

**Goal:** Improve documentation quality and maintain existing files.

- [ ] **7.1.1** Enhance root `README.md` with better onboarding flow
- [ ] **7.1.2** Create `CONTRIBUTING.md` with contribution guidelines
- [ ] **7.2.1** Update `skills/index.md` with new skill files from Phase 5
- [ ] **7.2.2** Update `skills/SUMMARY.md` with enhanced error reference
- [ ] **7.3.1** Request AC.rules update for shellcheck regex
