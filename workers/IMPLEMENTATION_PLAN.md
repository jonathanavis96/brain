# Implementation Plan - Brain Repository

**Status:** Ready for BUILD execution  
**Branch:** `brain-work`  
**Last Updated:** 2026-01-23 18:34:00  
**Progress:** Phases 0-Warn + 1-5 active

---

## Phase 0-Warn: Verifier Warnings (54 tasks)

**Goal:** Fix markdownlint violations discovered by pre-commit

### Skills Files (26 files)

- [x] **WARN.MD.01.skills** Fix MD violations in `skills/domains/infrastructure/deployment-patterns.md`
- [x] **WARN.MD.02.skills** Fix MD violations in `skills/domains/infrastructure/security-patterns.md`
- [x] **WARN.MD.03.skills** Fix MD violations in `skills/domains/infrastructure/state-management-patterns.md`
- [ ] **WARN.MD.04.skills** Fix MD violations in `skills/domains/languages/python/python-patterns.md`
- [ ] **WARN.MD.05.skills** Fix MD violations in `skills/domains/languages/shell/README.md`
- [ ] **WARN.MD.06.skills** Fix MD violations in `skills/domains/ralph/ralph-patterns.md`
- [ ] **WARN.MD.07.skills** Fix MD violations in `skills/domains/websites/README.md`
- [ ] **WARN.MD.08.skills** Fix MD violations in `skills/domains/websites/architecture/section-composer.md`
- [ ] **WARN.MD.09.skills** Fix MD violations in `skills/domains/websites/architecture/tech-stack-chooser.md`
- [ ] **WARN.MD.10.skills** Fix MD violations in `skills/domains/websites/build/component-development.md`
- [ ] **WARN.MD.11.skills** Fix MD violations in `skills/domains/websites/build/forms-integration.md`
- [ ] **WARN.MD.12.skills** Fix MD violations in `skills/domains/websites/build/mobile-first.md`
- [ ] **WARN.MD.13.skills** Fix MD violations in `skills/domains/websites/build/seo-foundations.md`
- [ ] **WARN.MD.14.skills** Fix MD violations in `skills/domains/websites/copywriting/cta-optimizer.md`
- [ ] **WARN.MD.15.skills** Fix MD violations in `skills/domains/websites/copywriting/objection-handler.md`
- [ ] **WARN.MD.16.skills** Fix MD violations in `skills/domains/websites/copywriting/value-proposition.md`
- [ ] **WARN.MD.17.skills** Fix MD violations in `skills/domains/websites/design/color-system.md`
- [ ] **WARN.MD.18.skills** Fix MD violations in `skills/domains/websites/design/design-direction.md`
- [ ] **WARN.MD.19.skills** Fix MD violations in `skills/domains/websites/design/spacing-layout.md`
- [ ] **WARN.MD.20.skills** Fix MD violations in `skills/domains/websites/design/typography-system.md`
- [ ] **WARN.MD.21.skills** Fix MD violations in `skills/domains/websites/discovery/audience-mapping.md`
- [ ] **WARN.MD.22.skills** Fix MD violations in `skills/domains/websites/discovery/requirements-distiller.md`
- [ ] **WARN.MD.23.skills** Fix MD violations in `skills/domains/websites/discovery/scope-control.md`
- [ ] **WARN.MD.24.skills** Fix MD violations in `skills/domains/websites/launch/deployment.md`
- [ ] **WARN.MD.25.skills** Fix MD violations in `skills/domains/websites/launch/finishing-pass.md`
- [ ] **WARN.MD.26.skills** Fix MD violations in `skills/domains/websites/qa/acceptance-criteria.md`

### Template Files (28 files)

- [ ] **WARN.MD.27.templates** Fix MD violations in `templates/AGENTS.project.md`
- [ ] **WARN.MD.28.templates** Fix MD violations in `templates/NEURONS.project.md`
- [ ] **WARN.MD.29.templates** Fix MD violations in `templates/NEW_PROJECT_IDEA.template.md`
- [ ] **WARN.MD.30.templates** Fix MD violations in `templates/README.md`
- [ ] **WARN.MD.31.templates** Fix MD violations in `templates/THOUGHTS.project.md`
- [ ] **WARN.MD.32.templates** Fix MD violations in `templates/backend/AGENTS.project.md`
- [ ] **WARN.MD.33.templates** Fix MD violations in `templates/backend/NEURONS.project.md`
- [ ] **WARN.MD.34.templates** Fix MD violations in `templates/backend/THOUGHTS.project.md`
- [ ] **WARN.MD.35.templates** Fix MD violations in `templates/backend/VALIDATION_CRITERIA.project.md`
- [ ] **WARN.MD.36.templates** Fix MD violations in `templates/cortex/AGENTS.project.md`
- [ ] **WARN.MD.37.templates** Fix MD violations in `templates/cortex/CORTEX_SYSTEM_PROMPT.project.md`
- [ ] **WARN.MD.38.templates** Fix MD violations in `templates/cortex/DECISIONS.project.md`
- [ ] **WARN.MD.39.templates** Fix MD violations in `templates/cortex/THOUGHTS.project.md`
- [ ] **WARN.MD.40.templates** Fix MD violations in `templates/fix_plan.md`
- [ ] **WARN.MD.41.templates** Fix MD violations in `templates/python/AGENTS.project.md`
- [ ] **WARN.MD.42.templates** Fix MD violations in `templates/python/NEURONS.project.md`
- [ ] **WARN.MD.43.templates** Fix MD violations in `templates/python/THOUGHTS.project.md`
- [ ] **WARN.MD.44.templates** Fix MD violations in `templates/python/VALIDATION_CRITERIA.project.md`
- [ ] **WARN.MD.45.templates** Fix MD violations in `templates/ralph-cleanup-fix.md`
- [ ] **WARN.MD.46.templates** Fix MD violations in `templates/ralph/IMPLEMENTATION_PLAN.project.md`
- [ ] **WARN.MD.47.templates** Fix MD violations in `templates/ralph/RALPH.md`
- [ ] **WARN.MD.48.templates** Fix MD violations in `templates/ralph/SKILL_TEMPLATE.md`
- [ ] **WARN.MD.49.templates** Fix MD violations in `templates/ralph/THUNK.project.md`
- [ ] **WARN.MD.50.templates** Fix MD violations in `templates/ralph/VALIDATION_CRITERIA.project.md`
- [ ] **WARN.MD.51.templates** Fix MD violations in `templates/ralph/docs/WAIVER_PROTOCOL.md`

**AC:** `pre-commit run --all-files` exits with code 0 (markdownlint passes)

---

## Phase 0-CRITICAL: Fix Broken Task Monitor & Sync (5 tasks)

**Goal:** Fix `current_ralph_tasks.sh` (broken path) and sync script issues.

### 0-C.1: Fix Path References

- [x] **0.C.1** Fix `workers/ralph/current_ralph_tasks.sh` line 25 - change `PLAN_FILE="$RALPH_DIR/IMPLEMENTATION_PLAN.md"` to `PLAN_FILE="$RALPH_DIR/../IMPLEMENTATION_PLAN.md"`
- [x] **0.C.2** Fix `templates/ralph/current_ralph_tasks.sh` - same path fix for template

### 0-C.2: Rewrite Sync Script

- [x] **0.C.3** Rewrite `workers/ralph/sync_cortex_plan.sh`:
  - Fix timestamp: `$(date +%Y-%m-%d)` → `$(date '+%Y-%m-%d %H:%M:%S')`
  - Remove per-task `<!-- SYNCED_FROM_CORTEX -->` markers
  - Single marker at section header only
  - Append-only model (never touch existing tasks)
- [ ] **0.C.4** Fix `templates/ralph/sync_cortex_plan.sh` - same rewrite

**AC:** `bash current_ralph_tasks.sh` shows tasks; sync markers only at section headers

---

## Phase 1-Quick: Quick Reference Tables (5 tasks)

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

- [ ] **2.5.1** Fix shfmt formatting in `workers/ralph/current_ralph_tasks.sh`
- [ ] **2.5.2** Fix shfmt formatting in `workers/ralph/thunk_ralph_tasks.sh`

### Phase 2.6: Final Verification (1 task)

- [ ] **2.6.1** Run full pre-commit and verify all pass
  - **AC:** `pre-commit run --all-files` exits with code 0

---

## Phase 3: Worker Separation - Ralph/Cerebras (29 tasks)

**Goal:** Separate workers into `workers/ralph/` (rovodev/opencode) and `workers/cerebras/` (cerebras API).

### Phase 3.1: Create Shared Infrastructure in `/workers/` (3 tasks)

- [ ] **3.1.1** Move `workers/ralph/VALIDATION_CRITERIA.md` → `workers/VALIDATION_CRITERIA.md`
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

## Phase 6: Markdown Lint Cleanup (60 tasks)

**Goal:** Fix remaining markdown lint violations from pre-commit scan.

### Skills Files (26 tasks)

- [ ] **WARN.MD.31.skills** Fix MD violations in `skills/domains/infrastructure/deployment-patterns.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.32.skills** Fix MD violations in `skills/domains/infrastructure/security-patterns.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.33.skills** Fix MD violations in `skills/domains/infrastructure/state-management-patterns.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.34.skills** Fix MD violations in `skills/domains/languages/python/python-patterns.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.35.skills** Fix MD violations in `skills/domains/languages/shell/README.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.36.skills** Fix MD violations in `skills/domains/ralph/ralph-patterns.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.37.skills** Fix MD violations in `skills/domains/websites/README.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.38.skills** Fix MD violations in `skills/domains/websites/architecture/section-composer.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.39.skills** Fix MD violations in `skills/domains/websites/architecture/tech-stack-chooser.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.40.skills** Fix MD violations in `skills/domains/websites/build/component-development.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.41.skills** Fix MD violations in `skills/domains/websites/build/forms-integration.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.42.skills** Fix MD violations in `skills/domains/websites/build/mobile-first.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.44.skills** Fix MD violations in `skills/domains/websites/build/seo-foundations.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.45.skills** Fix MD violations in `skills/domains/websites/copywriting/cta-optimizer.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.46.skills** Fix MD violations in `skills/domains/websites/copywriting/objection-handler.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.47.skills** Fix MD violations in `skills/domains/websites/copywriting/value-proposition.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.48.skills** Fix MD violations in `skills/domains/websites/design/color-system.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.49.skills** Fix MD violations in `skills/domains/websites/design/design-direction.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.50.skills** Fix MD violations in `skills/domains/websites/design/spacing-layout.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.51.skills** Fix MD violations in `skills/domains/websites/design/typography-system.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.52.skills** Fix MD violations in `skills/domains/websites/discovery/audience-mapping.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.53.skills** Fix MD violations in `skills/domains/websites/discovery/requirements-distiller.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.54.skills** Fix MD violations in `skills/domains/websites/discovery/scope-control.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.55.skills** Fix MD violations in `skills/domains/websites/launch/deployment.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.56.skills** Fix MD violations in `skills/domains/websites/launch/finishing-pass.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.57.skills** Fix MD violations in `skills/domains/websites/qa/accessibility.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.58.skills** Fix MD violations in `skills/domains/websites/qa/visual-qa.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.59.skills** Fix MD violations in `skills/index.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.60.skills** Fix MD violations in `skills/projects/brain-example.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.61.skills** Fix MD violations in `skills/self-improvement/GAP_BACKLOG.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.62.skills** Fix MD violations in `skills/self-improvement/README.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.63.skills** Fix MD violations in `skills/self-improvement/SKILL_BACKLOG.md` - MD032, MD022, MD031 violations

### Template Files (25 tasks)

- [ ] **WARN.MD.64.templates** Fix MD violations in `templates/cortex/AGENTS.project.md` - MD022, MD032, MD031, MD034 violations
- [ ] **WARN.MD.65.templates** Fix MD violations in `templates/AGENTS.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.66.templates** Fix MD violations in `templates/NEURONS.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.67.templates** Fix MD violations in `templates/NEW_PROJECT_IDEA.template.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.68.templates** Fix MD violations in `templates/README.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.69.templates** Fix MD violations in `templates/THOUGHTS.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.70.templates** Fix MD violations in `templates/backend/AGENTS.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.71.templates** Fix MD violations in `templates/backend/NEURONS.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.72.templates** Fix MD violations in `templates/backend/THOUGHTS.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.73.templates** Fix MD violations in `templates/backend/VALIDATION_CRITERIA.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.74.templates** Fix MD violations in `templates/cortex/CORTEX_SYSTEM_PROMPT.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.75.templates** Fix MD violations in `templates/cortex/DECISIONS.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.76.templates** Fix MD violations in `templates/cortex/THOUGHTS.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.77.templates** Fix MD violations in `templates/fix_plan.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.78.templates** Fix MD violations in `templates/python/AGENTS.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.79.templates** Fix MD violations in `templates/python/NEURONS.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.80.templates** Fix MD violations in `templates/python/THOUGHTS.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.81.templates** Fix MD violations in `templates/python/VALIDATION_CRITERIA.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.82.templates** Fix MD violations in `templates/ralph-cleanup-fix.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.83.templates** Fix MD violations in `templates/ralph/IMPLEMENTATION_PLAN.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.84.templates** Fix MD violations in `templates/ralph/RALPH.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.85.templates** Fix MD violations in `templates/ralph/SKILL_TEMPLATE.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.86.templates** Fix MD violations in `templates/ralph/THUNK.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.87.templates** Fix MD violations in `templates/ralph/VALIDATION_CRITERIA.project.md` - MD032, MD022, MD031 violations
- [ ] **WARN.MD.88.templates** Fix MD violations in `templates/ralph/docs/WAIVER_PROTOCOL.md` - MD022, MD032, MD031 violations

### Docs Files (2 tasks)

- [ ] **WARN.MD.89.docs** Fix MD violations in `docs/BOOTSTRAPPING.md` - MD022, MD032, MD040 violations
- [ ] **WARN.MD.90.docs** Fix MD violations in `docs/TEST_SCENARIOS.md` - MD022, MD032 violations

**AC:** `markdownlint **/*.md` passes with 0 errors

---

<!-- Cortex adds new tasks above this line via sync_cortex_plan.sh -->
## Phase 1-Cortex: Quick Reference Tables (5 tasks)
<!-- SYNCED_FROM_CORTEX: 2026-01-23 18:33:47 -->

Add Quick Reference tables to skills files following SUMMARY.md pattern.

- [x] **1.1** Add Quick Reference table to `skills/domains/code-quality/code-hygiene.md`
- [x] **1.2** Add Quick Reference table to `skills/domains/languages/shell/common-pitfalls.md`
- [x] **1.3** Add Quick Reference table to `skills/domains/languages/shell/strict-mode.md`
- [x] **1.4** Add Quick Reference table to `skills/domains/languages/shell/variable-patterns.md`
- [x] **1.5** Add Quick Reference table to `skills/domains/backend/database-patterns.md`

**AC:** Each file has a Quick Reference section  
**Commit:** `docs(skills): add Quick Reference tables`

---

## Phase 2-Cortex: Shell Script Linting (25 tasks)
<!-- SYNCED_FROM_CORTEX: 2026-01-23 18:33:47 -->

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

- [ ] **2.5.1** Fix shfmt formatting in `workers/ralph/current_ralph_tasks.sh`
  - **Fix:** Run `shfmt -w -i 2 workers/ralph/current_ralph_tasks.sh`
- [ ] **2.5.2** Fix shfmt formatting in `workers/ralph/thunk_ralph_tasks.sh`
  - **Fix:** Run `shfmt -w -i 2 workers/ralph/thunk_ralph_tasks.sh`

### Phase 2.6: Final Verification (1 task)

- [ ] **2.6.1** Run full pre-commit and verify all pass
  - **AC:** `pre-commit run --all-files` exits with code 0

---

## Phase 3-Cortex: Worker Separation - Ralph/Cerebras (29 tasks)
<!-- SYNCED_FROM_CORTEX: 2026-01-23 18:33:47 -->

**Goal:** Separate workers into `workers/ralph/` (rovodev/opencode) and `workers/cerebras/` (cerebras API).

### Phase 3.1: Create Shared Infrastructure in `/workers/` (3 tasks)

- [ ] **3.1.1** Move `workers/ralph/VALIDATION_CRITERIA.md` → `workers/VALIDATION_CRITERIA.md`
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

## Phase 4-Cortex: Shell Script Formatting Consistency (1 task)
<!-- SYNCED_FROM_CORTEX: 2026-01-23 18:33:47 -->

- [ ] **4.1** Run `shfmt -w -i 2 workers/ralph/*.sh templates/ralph/*.sh` to normalize all shell scripts
  - **AC:** `shfmt -d workers/ralph/*.sh templates/ralph/*.sh` returns no diff

---

## Phase 5-Cortex: Documentation & Terminology (6 tasks)
<!-- SYNCED_FROM_CORTEX: 2026-01-23 18:33:47 -->

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

<!-- Cortex will add new Task Contracts above this line -->
