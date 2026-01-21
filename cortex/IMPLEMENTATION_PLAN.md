# Cortex Implementation Plan

**Purpose:** This file contains high-level Task Contracts that Cortex creates for Ralph workers. Each contract defines a complete, atomic task with clear goals, constraints, inputs, and acceptance criteria.

**Workflow:**
1. Cortex creates/updates Task Contracts in this file
2. Ralph's `loop.sh` syncs this file to `workers/ralph/IMPLEMENTATION_PLAN.md` at startup
3. Ralph works through tasks, marking them complete in his local copy
4. Cortex reviews Ralph's progress and creates new contracts as needed

---

## Task Contract Template

Use this format when creating new Task Contracts:

### Task: [Short descriptive title]

**Goal:** What Ralph should achieve (one clear outcome)

**Subtasks:**
- [ ] Subtask 1 description
- [ ] Subtask 2 description
- [ ] Subtask 3 description

**Constraints:**
- Constraint 1 (e.g., "Do not modify protected files")
- Constraint 2 (e.g., "Use existing patterns from skills/")
- Constraint 3 (e.g., "Test changes before committing")

**Inputs:**
- Input 1 (e.g., "Reference: skills/domains/shell/strict-mode.md")
- Input 2 (e.g., "Existing code: workers/ralph/loop.sh")
- Input 3 (e.g., "Acceptance criteria: rules/AC.rules")

**Acceptance Criteria:**
- [ ] AC 1: Specific, measurable condition
- [ ] AC 2: Specific, measurable condition
- [ ] AC 3: Specific, measurable condition

**If Blocked:**
- What to do if Ralph encounters an issue
- Who to escalate to (Cortex, Human, etc.)
- What information to provide

---

## Example Task Contract

### Task: Add shellcheck validation to verifier.sh

**Goal:** Ensure all shell scripts pass shellcheck with no warnings

**Subtasks:**
- [ ] Add shellcheck rules to rules/AC.rules
- [ ] Update verifier.sh to run shellcheck
- [ ] Fix any shellcheck violations in existing scripts
- [ ] Test verifier passes on clean code

**Constraints:**
- Do not modify protected files' hash guards
- Use existing rule format in AC.rules
- Must work in WSL2 Ubuntu environment
- Keep verifier runtime under 5 seconds

**Inputs:**
- Reference: skills/domains/shell/variable-patterns.md
- Existing code: verifier.sh, rules/AC.rules
- Test scripts: current_ralph_tasks.sh, thunk_ralph_tasks.sh

**Acceptance Criteria:**
- [ ] AC 1: rules/AC.rules contains new shellcheck rules
- [ ] AC 2: verifier.sh runs shellcheck on target scripts
- [ ] AC 3: All existing scripts pass shellcheck
- [ ] AC 4: Verifier report shows PASS for shellcheck rules

**If Blocked:**
- If shellcheck not installed: Report to human (installation required)
- If shellcheck rules too strict: Document exception in GAP_BACKLOG.md
- If scripts need refactoring: Break into subtasks and update this contract

---

## Current Status

**Last Updated:** 2026-01-21 19:30 (by Cortex)

### ✅ Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 0-A | Cortex Manager Pack | ✅ Complete |
| 0-B | Repository Restructure (Option B) | ✅ Complete |
| 0-Warn | Verifier Warnings | ✅ All resolved |
| 0-Quick | Quick Wins | ✅ Complete |

### 📊 Progress Summary

- **Completed:** 39 tasks
- **Pending:** 37 tasks  
- **Progress:** 51%
- **Verifier:** 24/24 PASS (only manual review WARNs)

---

## Active Task Contracts

### Phase 1: Quick Fixes (Priority: HIGH)

These are low-effort tasks that provide immediate value.

---

### Task 1.2: Copy SKILL_TEMPLATE to templates

**Goal:** Ensure template directory has the skill template for new projects

**Subtasks:**
- [ ] Copy `skills/self-improvement/SKILL_TEMPLATE.md` to `templates/ralph/SKILL_TEMPLATE.md`
- [ ] Verify content matches source

**Constraints:**
- Do not modify the source file
- Preserve exact content (no edits)

**Inputs:**
- Source: `skills/self-improvement/SKILL_TEMPLATE.md`
- Destination: `templates/ralph/SKILL_TEMPLATE.md`

**Acceptance Criteria:**
- [ ] File exists at `templates/ralph/SKILL_TEMPLATE.md`
- [ ] `diff skills/self-improvement/SKILL_TEMPLATE.md templates/ralph/SKILL_TEMPLATE.md` returns no differences

**If Blocked:** Report to Cortex if source file is missing

---

### Task 1.3: Fix broken links in skills files

**Goal:** Ensure all relative links in skills documentation work correctly

**Subtasks:**
- [ ] Fix `skills/conventions.md` - replace placeholder `../path/to/file.md` with actual paths
- [ ] Fix `skills/projects/brain-example.md` - update relative paths to use `../` correctly

**Constraints:**
- Only fix links that are actually broken
- Preserve link text, only update href

**Inputs:**
- `skills/conventions.md`
- `skills/projects/brain-example.md`
- Run `bash workers/ralph/.maintenance/verify-brain.sh` to identify broken links

**Acceptance Criteria:**
- [ ] No placeholder paths like `../path/to/file.md` in skills/
- [ ] Links in `skills/projects/brain-example.md` resolve correctly
- [ ] `verify-brain.sh` reports no broken link warnings

**If Blocked:** Document which links cannot be fixed and why

---

### Task 1.4: Fix "Brain KB" terminology

**Goal:** Complete terminology migration from "KB" to "Skills"

**Subtasks:**
- [ ] Find all remaining "Brain KB" references in templates/
- [ ] Replace with "Brain Skills"

**Constraints:**
- Only change terminology, not meaning
- Check templates/ directory only (other areas already fixed)

**Inputs:**
- `rg "Brain KB" templates/` to find occurrences

**Acceptance Criteria:**
- [ ] `rg "Brain KB" templates/ | wc -l` returns 0

**If Blocked:** If "Brain KB" is in a protected file, document for human review

---

## Queued Task Contracts

### Phase 2: Shell Script Cleanup (Priority: MEDIUM)

**Note:** Complete Phase 1 first. Phase 2 tasks improve code quality but are lower priority.

Tasks 2.1-2.15 are defined in Ralph's IMPLEMENTATION_PLAN.md. Cortex recommends:
1. Start with `current_ralph_tasks.sh` fixes (2.1-2.8)
2. Then `thunk_ralph_tasks.sh` fixes (2.9-2.14)
3. Finally `pr-batch.sh` (2.15)
4. After all fixes: sync templates (resolve WARN.T1, WARN.T2)

### Phase 3: Quick Reference Tables (Priority: MEDIUM)

Tasks 3.1-3.5 add documentation convention compliance. Can be done in parallel with Phase 2.

### Phase 5: Design Decisions (Priority: LOW)

**⚠️ Requires Human Approval:** Tasks 5.1-5.3 modify protected files (loop.sh, templates/ralph/loop.sh).

Cortex recommends deferring until Phases 1-3 are complete.

---

## Deferred Items

### Phase 6: PR #4 D-Items Review

**Recommendation:** Many D-items (D-4 through D-21) reference IMPLEMENTATION_PLAN.md issues that may have been resolved during the Phase 0-A/0-B work. 

**Action:** Ralph should review D-items and mark obsolete ones as resolved before implementing fixes.

### Phase 7: Maintenance

Ongoing - run `bash workers/ralph/.maintenance/verify-brain.sh` periodically.

<!-- Cortex will add new Task Contracts above this line -->
