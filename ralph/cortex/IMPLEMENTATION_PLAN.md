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

## Current Tasks

**Status:** No active tasks  
**Last Updated:** 2026-01-21  
**Next Review:** After Phase 0-A completes

<!-- Cortex will add Task Contracts below this line -->
