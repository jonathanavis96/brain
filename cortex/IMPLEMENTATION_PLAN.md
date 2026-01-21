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

**Last Updated:** 2026-01-21 18:52 (by Cortex)

### ✅ Completed: Repository Restructuring (Phase 0-A & 0-B)

**What was accomplished:**
- ✅ Created Cortex manager layer at `brain/cortex/`
- ✅ Moved Ralph worker to `brain/workers/ralph/`
- ✅ Moved shared resources to root: `skills/`, `templates/`, `rules/`, `docs/`
- ✅ Updated all path references for portability
- ✅ Fixed verifier Hash Guard false positive
- ✅ All 24 AC checks passing

**Commits:**
- 962d75d "feat(brain): implement Option B structure with proper separation"
- 3cd7ca5 "fix(paths): update all paths to reflect Option B structure and ensure portability"

### 🔄 Next Task: Validate Ralph's Full Workflow

**Goal:** Confirm Ralph can execute normally from new location

**Test Plan:**
```bash
cd brain/workers/ralph
bash loop.sh --iterations 1
```

**Success Criteria:**
- Ralph completes one full iteration
- No path errors in logs
- Can access skills/, templates/, rules/
- Verifier runs successfully
- Can commit changes

**If Blocked:** Report specific error to human for Cortex analysis

---

## Future Tasks (Pending)

Cortex will create new Task Contracts after Ralph validation completes.

Potential areas:
- Documentation improvements
- Shell script cleanup
- Quick reference tables
- Template maintenance

<!-- Cortex will add Task Contracts below this line -->
