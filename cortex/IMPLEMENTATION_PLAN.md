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

**Last Updated:** 2026-01-21 19:57:00 (by Cortex)

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

### Phase 0-Sync: Infrastructure (Priority: CRITICAL - DO THIS FIRST)

- [ ] **0.0** Implement sync_cortex_plan.sh script
  - **Priority:** CRITICAL (blocks all other Cortex → Ralph task delegation)
  - **Goal:** Implement the task synchronization mechanism described in `cortex/docs/TASK_SYNC_PROTOCOL.md`
  - **Context:**
    - Currently, there is NO automatic sync from `cortex/IMPLEMENTATION_PLAN.md` → `workers/ralph/IMPLEMENTATION_PLAN.md`
    - The protocol is documented but the script doesn't exist yet
    - Without this, Cortex must manually copy tasks or user must do it
  - **Implementation:**
    1. Create `workers/ralph/sync_cortex_plan.sh`
    2. Implement logic from TASK_SYNC_PROTOCOL.md:
       - Read `cortex/IMPLEMENTATION_PLAN.md`
       - Extract tasks from Phase sections
       - Check if task already synced (via `<!-- SYNCED_FROM_CORTEX: YYYY-MM-DD -->` marker)
       - Append new tasks to `workers/ralph/IMPLEMENTATION_PLAN.md`
       - Add sync markers to newly synced tasks
    3. Integrate into `workers/ralph/loop.sh` startup sequence:
       ```bash
       # At start of PLAN mode, before task selection
       if [[ -f "../cortex/IMPLEMENTATION_PLAN.md" ]]; then
           bash sync_cortex_plan.sh
       fi
       ```
  - **Reference Implementation:** See `cortex/docs/TASK_SYNC_PROTOCOL.md` sections:
    - "Sync Mechanism" (lines 60-85)
    - "Workflow Example" (lines 87-150)
    - "Pseudocode" (lines 200-230)
  - **AC:**
    - [ ] `workers/ralph/sync_cortex_plan.sh` exists and is executable
    - [ ] Script reads from `cortex/IMPLEMENTATION_PLAN.md`
    - [ ] Script appends new tasks to `workers/ralph/IMPLEMENTATION_PLAN.md`
    - [ ] Synced tasks have `<!-- SYNCED_FROM_CORTEX: YYYY-MM-DD -->` markers
    - [ ] Duplicate tasks are NOT created (check for existing markers)
    - [ ] `loop.sh` calls sync script at startup in PLAN mode
    - [ ] Test: Add a dummy task to cortex plan, run sync, verify it appears in Ralph's plan
  - **If Blocked:** 
    - Reference TASK_SYNC_PROTOCOL.md for detailed algorithm
    - Ask user for clarification on sync timing or marker format

---

### Phase 0-Quick: Documentation Updates (Priority: HIGH)

- [ ] **0.1** Update README.md with setup instructions
  - **Goal:** Add installation and quick start documentation
  - **Context:**
    - New `setup.sh` script installs `cortex` and `ralph` commands globally
    - Users need clear instructions on getting started
    - **DO NOT merge to main** - there's a pending PR that needs fixing first
  - **Implementation:** Add these sections to `README.md`:
  
    ```markdown
    ## Quick Start
    
    ```bash
    git clone https://github.com/jonathanavis96/brain
    cd brain
    bash setup.sh
    source ~/.bashrc  # Or open a new terminal
    cortex            # Ready to use!
    ```
    
    ## What setup.sh Does
    
    - ✅ Detects brain location automatically
    - ✅ Creates ~/bin/cortex and ~/bin/ralph symlinks
    - ✅ Ensures ~/bin is in PATH
    - ✅ Adds PATH to shell config if needed
    - ✅ Works across different systems/users
    
    ## Available Commands
    
    ```bash
    cortex              # Chat with Cortex (Opus 4.5)
    cortex -h           # Help
    ralph -i20 -p5      # Run Ralph (Sonnet 4.5)
    ralph -h            # Help
    ```
    ```
  
  - **AC:**
    - [ ] README.md updated with Quick Start section
    - [ ] Setup instructions are clear and accurate
    - [ ] Command examples are included
    - [ ] Changes committed to current branch (NOT main)
  - **If Blocked:** Ask for clarification on setup.sh location or behavior

---

### Phase 1: Quick Fixes (Priority: MEDIUM)

These are low-effort tasks that provide immediate value. Ralph should complete these in order.

---

### Task 1.0: Fix KB→Skills terminology in templates

- **Goal:** Replace confusing "KB" (Knowledge Base) terminology with correct "Skills" terminology
- **Context:** Templates use "KB" inconsistently, which is confusing
  - "Brain skills repository" = correct (cross-project reusable patterns at `brain/skills/`)
  - "kb/" = local project knowledge (project-specific, not cross-project)
  - "KB" is ambiguous and should be replaced
- **Files to Update:**
  - `templates/AGENTS.project.md`
  - `templates/backend/AGENTS.project.md`
  - `templates/python/AGENTS.project.md`
  - `templates/cortex/AGENTS.project.md`
- **Changes:**
  - Find: "Knowledge Base (MUST USE)"
  - Replace: "Brain Skills Repository (MUST USE)"
  - Find: "KB lookups"
  - Replace: "Skills lookups"
  - Find: "Create a KB file"
  - Replace: "Create a skill file" (or "Create a local kb/ file" if referring to project-local knowledge)
  - Find: "Project knowledge base"
  - Replace: "Brain skills repository" (when referring to brain/skills/) OR "Project kb/ directory" (when referring to local knowledge)
- **Important:** Keep "kb/" references when they refer to project-local knowledge directories
- **AC:**
  - [ ] "KB" replaced with "Skills" in all 4 template AGENTS files
  - [ ] "Knowledge Base" → "Brain Skills Repository" or "Brain skills repository"
  - [ ] Project-local "kb/" references preserved and clarified
  - [ ] Grep check: `grep -r "Knowledge Base\|KB lookups" templates/` returns no matches (except kb/ directory references)
- **If Blocked:** Search templates for "KB" to find all occurrences

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
