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

**Last Updated:** 2026-01-21 19:57 (by Cortex)

### ✅ Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 0-A | Cortex Manager Pack | ✅ Complete |
| 0-B | Repository Restructure (Option B) | ✅ Complete |
| 0-Warn | Verifier Warnings | ✅ All resolved |

### 📊 Progress Summary

- **Completed:** ~40 tasks (Phase 0-A, 0-B, 0-Warn all done)
- **Pending:** ~35 tasks (Phase 1-7)
- **Verifier:** 24/24 PASS
- **Maintenance:** 2 false-positive issues (path bug in verify-brain.sh)

### ⚠️ Maintenance Script Path Issue

The `workers/ralph/.maintenance/verify-brain.sh` script reports `skills/index.md` and `skills/SUMMARY.md` as "not found" because it uses relative paths from `workers/ralph/`. The files exist at `brain/skills/` (root level). This is a **path bug in the maintenance script**, not missing files.

**Recommendation:** Add task to fix verify-brain.sh paths in Phase 2.

---

## Active Task Contracts

### Phase 1: Quick Fixes (Priority: HIGH)

These are low-effort tasks that provide immediate value. Ralph should complete these in order.

---

### Task 1.1: Copy SKILL_TEMPLATE to templates

**Goal:** Ensure template directory has the skill template for new projects

**Subtasks:**
- [ ] Copy `skills/self-improvement/SKILL_TEMPLATE.md` to `templates/ralph/SKILL_TEMPLATE.md`
- [ ] Verify content matches source

**Constraints:**
- Do not modify the source file
- Preserve exact content (no edits)

**Inputs:**
- Source: `skills/self-improvement/SKILL_TEMPLATE.md` (exists, 2751 bytes)
- Destination: `templates/ralph/SKILL_TEMPLATE.md` (missing)

**Acceptance Criteria:**
- [ ] File exists at `templates/ralph/SKILL_TEMPLATE.md`
- [ ] `diff skills/self-improvement/SKILL_TEMPLATE.md templates/ralph/SKILL_TEMPLATE.md` returns no differences

**If Blocked:** Report to Cortex if source file is missing

**Estimated Effort:** <2 minutes

---

### Task 1.2: Fix "Brain KB" terminology in templates

**Goal:** Complete terminology migration from "KB" to "Skills"

**Subtasks:**
- [ ] Edit `templates/NEURONS.project.md` line containing "Brain KB patterns"
- [ ] Replace "Brain KB" with "Brain Skills"

**Constraints:**
- Only change terminology, not meaning
- Single file edit required

**Inputs:**
- File: `templates/NEURONS.project.md`
- Line: `- **Brain KB patterns** → See...`
- Command to verify: `rg "Brain KB" templates/`

**Acceptance Criteria:**
- [ ] `rg "Brain KB" templates/ | wc -l` returns 0
- [ ] Line now reads `- **Brain Skills patterns** → See...`

**If Blocked:** If file is protected, document for human review

**Estimated Effort:** <2 minutes

---

### Task 1.3: Fix maintenance script paths (NEW)

**Goal:** Fix verify-brain.sh to find skills/ at correct location

**Subtasks:**
- [ ] Update `workers/ralph/.maintenance/verify-brain.sh` to use correct paths
- [ ] Change `skills/index.md` check to use `../../../skills/index.md` or absolute path detection
- [ ] Change `skills/SUMMARY.md` check similarly
- [ ] Test script reports 0 issues after fix

**Constraints:**
- Script must work when run from `workers/ralph/.maintenance/` directory
- Must also work from repo root if invoked directly
- Use portable path resolution (not hardcoded absolute paths)

**Inputs:**
- Script: `workers/ralph/.maintenance/verify-brain.sh`
- Skills location: `brain/skills/` (3 levels up from .maintenance/)

**Acceptance Criteria:**
- [ ] `bash workers/ralph/.maintenance/verify-brain.sh` reports 0 issues
- [ ] Script correctly finds `skills/index.md` and `skills/SUMMARY.md`

**If Blocked:** Document path resolution approach in THUNK.md

**Estimated Effort:** 5-10 minutes

---

## Queued Task Contracts

### Phase 2: Shell Script Cleanup (Priority: MEDIUM)

**Note:** Complete Phase 1 first. Phase 2 tasks improve code quality but are lower priority.

Tasks in Ralph's IMPLEMENTATION_PLAN.md. Order of execution:
1. `current_ralph_tasks.sh` fixes (2.1-2.8)
2. `thunk_ralph_tasks.sh` fixes (2.9-2.14)
3. `pr-batch.sh` (2.15)
4. Template sync (resolve WARN.T1, WARN.T2)

### Phase 3: Quick Reference Tables (Priority: MEDIUM)

Maintenance script says all skills have Quick Reference tables. **Verify this is accurate** given the path bug - may be false positive.

### Phase 5: Design Decisions (Priority: LOW)

**⚠️ Requires Human Approval:** Tasks modify protected files (loop.sh).

Defer until Phases 1-3 complete.

---

## Deferred Items

### Phase 6: PR #4 D-Items Review

**Recommendation:** Many D-items may be obsolete after Phase 0-A/0-B restructure.

**Action:** Ralph should review D-items and mark obsolete ones as resolved.

### Phase 7: Maintenance

Ongoing - run `bash workers/ralph/.maintenance/verify-brain.sh` after Phase 1.3 fix.

<!-- Cortex will add new Task Contracts above this line -->
