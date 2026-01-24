# Cortex-Ralph Task Synchronization Protocol

## Overview

This document defines how tasks flow from Cortex (strategic manager) to Ralph (execution worker) through an automated synchronization system.

## System Architecture

```text
Cortex (Manager)                    Ralph (Worker)
├─ cortex/IMPLEMENTATION_PLAN.md    ├─ workers/IMPLEMENTATION_PLAN.md
│  (Strategic task contracts)       │  (Execution-ready tasks + subtasks)
│                                   │
│  [Task 1.1] ──────────────────────> [Task 1.1] + subtasks
│  [Task 1.2] ──────────────────────> [Task 1.2] + subtasks
│  [NEW Task 1.3] ─────sync────────> [Task 1.3] ← synced!
```text

## Sync Mechanism

### When Sync Occurs

- **Trigger**: Before every `bash workers/ralph/loop.sh` execution
- **Location**: Line ~937 in `loop.sh` (after monitors launch, before iteration loop starts)
- **Script**: `bash cortex/sync_cortex_plan.sh` (called automatically by loop.sh)

### Sync Logic Flow

```bash
# Pseudocode for sync_cortex_plan.sh

cortex_plan = "cortex/IMPLEMENTATION_PLAN.md"
ralph_plan = "workers/IMPLEMENTATION_PLAN.md"

# CASE A: First Time (Bootstrap)
if ralph_plan does not exist:
    copy cortex_plan → ralph_plan
    add marker "<!-- SYNCED_FROM_CORTEX: YYYY-MM-DD -->" to each task
    exit

# CASE B: Cortex Has Updates
if cortex_plan is newer than ralph_plan:
    for each task in cortex_plan:
        if task not in ralph_plan:
            append task to ralph_plan
            add marker "<!-- SYNCED_FROM_CORTEX: YYYY-MM-DD -->"
    exit

# CASE C: No Updates Needed
else:
    log "Ralph's plan is current"
    exit
```text

## Task Markers

### Synced Task Format

When a task is synced from Cortex to Ralph, it receives a marker:

```markdown
- [ ] **1.3** Fix broken links in skills files
  <!-- SYNCED_FROM_CORTEX: 2026-01-21 -->
```text

### Detection Logic

The sync script identifies already-synced tasks by:

1. Matching task ID pattern: `**X.Y**`
2. Checking for marker: `<!-- SYNCED_FROM_CORTEX: YYYY-MM-DD -->`

### Ralph's Extensions

Ralph may add subtasks to synced tasks:

```markdown
- [ ] **1.3** Fix broken links in skills files
  <!-- SYNCED_FROM_CORTEX: 2026-01-21 -->
  - [ ] **1.3.1** Scan all .md files for broken links
  - [ ] **1.3.2** Update link references
  - [x] **1.3.3** Verify all links resolve
```text

**Important**: Ralph NEVER modifies Cortex's original task text. Only adds subtasks below.

## Workflow Example

### Step 1: Cortex Creates Tasks

You (Cortex) update `cortex/IMPLEMENTATION_PLAN.md`:

```markdown
## Phase 1: Quick Fixes

- [x] **1.1** Review repository structure
- [ ] **1.2** Copy SKILL_TEMPLATE to templates/
- [ ] **1.3** Fix broken links in skills files
```text

### Step 2: Ralph Receives Tasks (First Sync)

When Ralph runs `loop.sh`, sync creates `workers/IMPLEMENTATION_PLAN.md`:

```markdown
## Phase 1: Quick Fixes

- [x] **1.1** Review repository structure
  <!-- SYNCED_FROM_CORTEX: 2026-01-21 -->
  
- [ ] **1.2** Copy SKILL_TEMPLATE to templates/
  <!-- SYNCED_FROM_CORTEX: 2026-01-21 -->
  
- [ ] **1.3** Fix broken links in skills files
  <!-- SYNCED_FROM_CORTEX: 2026-01-21 -->
```text

### Step 3: Ralph Adds Execution Details

Ralph expands task 1.2 with subtasks:

```markdown
- [ ] **1.2** Copy SKILL_TEMPLATE to templates/
  <!-- SYNCED_FROM_CORTEX: 2026-01-21 -->
  - [ ] **1.2.1** Verify source file exists
  - [ ] **1.2.2** Create templates/ directory if missing
  - [x] **1.2.3** Copy file with proper permissions
```text

### Step 4: Cortex Adds New Task

You add task 1.4 to Cortex's plan:

```markdown
- [ ] **1.4** Update terminology in templates
```text

### Step 5: Next Ralph Sync (Incremental)

On next `loop.sh` run, sync detects:

- Tasks 1.1, 1.2, 1.3 already have `SYNCED_FROM_CORTEX` markers → skip
- Task 1.4 is new → append to Ralph's plan

Result in `workers/IMPLEMENTATION_PLAN.md`:

```markdown
- [ ] **1.2** Copy SKILL_TEMPLATE to templates/
  <!-- SYNCED_FROM_CORTEX: 2026-01-21 -->
  - [ ] **1.2.1** Verify source file exists
  - [ ] **1.2.2** Create templates/ directory if missing
  - [x] **1.2.3** Copy file with proper permissions
  
- [ ] **1.3** Fix broken links in skills files
  <!-- SYNCED_FROM_CORTEX: 2026-01-21 -->
  
- [ ] **1.4** Update terminology in templates
  <!-- SYNCED_FROM_CORTEX: 2026-01-21 -->  ← newly synced
```text

## Cortex's Responsibilities

### ✅ DO: Create High-Level Task Contracts

Your tasks should be:

- **Strategic**: Define WHAT and WHY, not HOW
- **Atomic**: Each task is independently completable
- **Versioned**: Use numbering (1.1, 1.2, 2.1, etc.)
- **Acceptance-criteria focused**: Clear success conditions

Example of good Cortex task:

```markdown
- [ ] **1.3** Fix broken links in skills files
  
  **Why**: Documentation navigation is broken
  **What**: Scan and update all broken internal links in skills/*.md
  **Acceptance**: All links resolve correctly, no 404s
```text

### ❌ DON'T: Micromanage Execution

Avoid overly detailed subtasks in Cortex's plan:

```markdown
# BAD - too detailed for Cortex
- [ ] **1.3** Fix broken links
  - [ ] **1.3.1** Open VS Code
  - [ ] **1.3.2** Use Ctrl+F to search
  - [ ] **1.3.3** Replace text...
```text

Ralph will create execution subtasks as needed.

### Task Lifecycle States

Mark tasks in Cortex's plan using these states:

```markdown
- [ ] **X.Y** Not started (Ralph hasn't picked it up yet)
- [~] **X.Y** In progress (Ralph is working on it)
- [x] **X.Y** Complete (Ralph marked done, verified by you)
- [?] **X.Y** Blocked (needs human intervention or decision)
```text

## Staleness Detection

### How You Know Ralph Needs New Tasks

Check these indicators in your snapshot:

```markdown
## Ralph Worker Status
**Ralph Tasks:** 5/5 complete (100%)
**Next Ralph Tasks:** None pending
```text

**Action**: Create new task contracts in `cortex/IMPLEMENTATION_PLAN.md`. They'll sync automatically on Ralph's next loop.

### How Ralph Knows Tasks Are Stale

Ralph's `loop.sh` checks:

1. Is `cortex/IMPLEMENTATION_PLAN.md` newer than `workers/IMPLEMENTATION_PLAN.md`?
2. If yes → run sync
3. If no → log "Ralph's plan is current"

## Conflict Resolution

### Scenario: Cortex Modifies Existing Task

**What happens**: Task IDs (e.g., `**1.2**`) are immutable once synced. If you change task 1.2's description:

```markdown
# Old Cortex task:
- [ ] **1.2** Copy SKILL_TEMPLATE to templates/

# You change it to:
- [ ] **1.2** Copy all templates to new location
```text

**Sync behavior**: The sync script does NOT update existing tasks. Ralph keeps the original.

**Resolution**:

- If task needs fundamental change → create NEW task (e.g., 1.5)
- Mark old task as `[?]` blocked with note: "See task 1.5 instead"

### Scenario: Ralph Deletes a Task

**What happens**: If Ralph removes a task from his plan, sync will NOT re-add it.

**Rationale**: Ralph may have determined task is obsolete or merged into another.

**Resolution**: Review Ralph's THUNK.md for explanation of why task was removed.

## Manual Override

### Human Intervention Required

Some situations require human approval:

```markdown
- [?] **5.1** Rename verifier config files
  **Status**: BLOCKED - modifies protected files (see MANUAL_APPROVALS.rules)
  **Action**: Requires human approval before Ralph can proceed
```text

**Cortex's role**: Document these in your planning sessions, flag for human review.

## Monitoring Sync Health

### Check Sync Status

When reviewing Ralph's progress, check:

1. **Sync timestamp freshness**:

   ```bash
   grep -E "SYNCED_FROM_CORTEX" workers/IMPLEMENTATION_PLAN.md | tail -1
   ```

2. **Task count alignment**:

   ```bash
   cortex_tasks=$(grep -cE '^\- \[ \] \*\*[0-9]' cortex/IMPLEMENTATION_PLAN.md)
   ralph_tasks=$(grep -cE 'SYNCED_FROM_CORTEX' workers/IMPLEMENTATION_PLAN.md)
   # Should be equal or ralph_tasks >= cortex_tasks (Ralph adds subtasks)
   ```

3. **Pending syncs**:

   ```bash
   if [[ "cortex/IMPLEMENTATION_PLAN.md" -nt "workers/IMPLEMENTATION_PLAN.md" ]]; then
       echo "Cortex has updates waiting for next Ralph loop"
   fi
   ```

## Integration with Your Workflow

### During Planning Sessions (You)

1. Run `bash cortex/run.sh`
2. Review repository snapshot (includes Ralph status)
3. Create/update task contracts in `cortex/IMPLEMENTATION_PLAN.md`
4. Document decisions in `cortex/DECISIONS.md`
5. Exit session

### During Execution (Ralph)

1. Run `bash workers/ralph/loop.sh`
2. **Sync runs automatically** at line ~937
3. Ralph sees new tasks from you
4. Ralph creates subtasks, executes work
5. Ralph updates THUNK.md with completions
6. Loop continues...

### Next Planning Session (You)

1. Your snapshot shows Ralph's progress:
   - Completed tasks: `[x]`
   - New THUNK entries
   - Updated git history
2. You review and create next wave of tasks
3. Cycle repeats

## Benefits of This System

### For You (Cortex)

- ✅ Focus on strategy, not execution details
- ✅ Ralph automatically receives your plans
- ✅ Clear separation of concerns
- ✅ Audit trail of all task assignments

### For Ralph

- ✅ Always has fresh tasks from you
- ✅ Freedom to add execution subtasks
- ✅ No manual sync required
- ✅ Clear task ownership (you = WHAT, Ralph = HOW)

### For Human

- ✅ Transparent task flow (can see sync markers)
- ✅ Both plans are readable markdown
- ✅ Git history shows all changes
- ✅ Manual intervention points clearly marked

## Implementation Status

**Current**: Planning complete, ready for implementation
**Next Step**: Create `cortex/sync_cortex_plan.sh` script
**Estimated Effort**: 2-3 hours for Ralph to implement and test

---

## Quick Reference

```bash
# Sync script location
brain/cortex/sync_cortex_plan.sh

# Called by
brain/workers/ralph/loop.sh (line ~937)

# Task marker format
<!-- SYNCED_FROM_CORTEX: YYYY-MM-DD -->

# Check if sync needed
[[ "cortex/IMPLEMENTATION_PLAN.md" -nt "workers/IMPLEMENTATION_PLAN.md" ]]

# View synced tasks
grep -B 1 "SYNCED_FROM_CORTEX" workers/IMPLEMENTATION_PLAN.md
```text
