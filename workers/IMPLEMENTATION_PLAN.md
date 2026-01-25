# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-25 16:05:00

**Current Status:** Cleaned plan with only pending tasks. Completed tasks archived to THUNK.md.

<!-- Cortex adds new Task Contracts below this line -->

## Phase 10: Plan Auto-Cleanup System

**Goal:** Automate removal of completed tasks from IMPLEMENTATION_PLAN.md to reduce agent reading time.

**Why:** Agents spend excessive tokens reading completed tasks. Auto-cleanup keeps plans lean.

### Phase 10.1: Cleanup Script

- [x] **10.1.1** Create `workers/ralph/cleanup_plan.sh`
  - **Goal:** Script that removes `[x]` lines and empty phase sections from IMPLEMENTATION_PLAN.md
  - **AC:** Running `bash cleanup_plan.sh --dry-run` shows what would be removed
  - **Constraints:** Preserve phase headers if they have pending tasks, preserve marker line

- [x] **10.1.2** Add `--archive` flag to append removed tasks to THUNK.md
  - **Goal:** Before deletion, append task summaries to THUNK.md with timestamp
  - **AC:** `bash cleanup_plan.sh --archive` moves tasks to THUNK.md then removes from plan
  - **Format:** `| YYYY-MM-DD | Task ID | Description | auto-cleanup |`

- [x] **10.1.3** Add phase collapse detection
  - **Goal:** Remove entire phase section when all tasks are `[x]`
  - **AC:** Empty phases (all complete) are removed, phases with pending tasks preserved

### Phase 10.2: Integration

- [x] **10.2.1** Add cleanup hook to `sync_cortex_plan.sh`
  - **Goal:** After syncing from cortex, run cleanup on workers plan
  - **AC:** `sync_cortex_plan.sh` calls `cleanup_plan.sh --archive` automatically

- [x] **10.2.2** Add `--no-cleanup` flag to sync script
  - **Goal:** Allow skipping auto-cleanup when needed for debugging
  - **AC:** `sync_cortex_plan.sh --no-cleanup` preserves completed tasks

### Phase 10.3: Safety & Validation

- [x] **10.3.1** Create `tools/test_plan_cleanup.sh` test script
  - **Goal:** Verify cleanup preserves pending tasks and removes only completed
  - **AC:** Test creates sample plan, runs cleanup, verifies correct output

**Phase AC:** Cleanup script exists, integrates with sync, tested

---


## Phase 0-Warn: Verifier Warnings

**Goal:** Resolve verifier warnings from latest run.

**Status:** 2 warnings present - both require HUMAN INTERVENTION (protected file changes).

- [ ] **WARN.Protected.1** - Protected file changed (human review required) - HUMAN INTERVENTION REQUIRED
- [ ] **WARN.Protected.2** - Protected file changed (human review required) - HUMAN INTERVENTION REQUIRED

---


## Phase 6: Template Improvements (Pending)

**Goal:** Enhance project templates with better defaults and more comprehensive coverage.

- [x] **6.1.1** Create `templates/javascript/` directory with JS/TS project template
  - AGENTS.project.md, NEURONS.project.md, VALIDATION_CRITERIA.project.md
  - package.json template with common scripts
  - ESLint and Prettier configs
  - **AC:** Directory exists with 5+ files

- [x] **6.1.2** Create `templates/go/` directory with Go project template
  - AGENTS.project.md, NEURONS.project.md, VALIDATION_CRITERIA.project.md
  - go.mod template and project structure
  - golangci-lint config
  - **AC:** Directory exists with 5+ files

- [x] **6.3.1** Create `templates/website/` with project scaffolding (pointers only)
  - Create AGENTS.project.md, NEURONS.project.md, VALIDATION_CRITERIA.project.md
  - Include references to `skills/domains/websites/` and `skills/domains/marketing/`
  - **DO NOT duplicate skills content** - templates should point to brain, not copy it
  - **AC:** templates/website/ has standard project files with skill references
  - **Fixed:** 2026-01-25 - Slimmed docs/ from 1425 to 229 lines (references only)

---


## Phase 7: Documentation and Maintenance (Pending)

**Goal:** Improve documentation quality and maintain existing files.

- [x] **7.1.1** Enhance root `README.md` with better onboarding flow
- [ ] **7.1.2** Create `CONTRIBUTING.md` with contribution guidelines
- [ ] **7.2.1** Update `skills/index.md` with new skill files from Phase 5
- [ ] **7.2.2** Update `skills/SUMMARY.md` with enhanced error reference
- [ ] **7.3.1** Request AC.rules update for shellcheck regex

- [ ] **7.3.1** Request AC.rules update for shellcheck regex

---

## Completed Phases

See `workers/ralph/THUNK.md` for complete task history (550+ completed tasks).

**Completed:** Phases 0-5 (most tasks), 6 (Housekeeping), 7 (Gap Radar), 8 (Playbooks), X (Structured Logging)
