# Cortex-Ralph Task Synchronization Protocol

> **Reality check (2026-01-28):** In this repository, the canonical execution plan is `workers/IMPLEMENTATION_PLAN.md`.
> `cortex/IMPLEMENTATION_PLAN.md` is a read-only mirror copied from workers for review/visibility.
> There is no "sync completions back to cortex" step; completion tracking lives in `workers/` (`PLAN_DONE.md`, `THUNK.md`).

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

- **Trigger**: At the start of `bash workers/ralph/loop.sh`
- **Location**: `workers/ralph/loop.sh` invokes the sync script before iterations begin
- **Script**: `bash workers/ralph/sync_workers_plan_to_cortex.sh` (called automatically by `workers/ralph/loop.sh`)
- **Behavior**: Copies `workers/IMPLEMENTATION_PLAN.md` → `cortex/IMPLEMENTATION_PLAN.md` for review/visibility

### Sync Logic Flow

```bash
# Pseudocode for sync (current implementation)

workers_plan = "workers/IMPLEMENTATION_PLAN.md"   # canonical
cortex_plan  = "cortex/IMPLEMENTATION_PLAN.md"    # mirror for review

# Behavior
# - Copy the canonical plan for visibility
cp "$workers_plan" "$cortex_plan"
exit 0
```text

## Task Markers (Deprecated)

This repository previously experimented with `<!-- SYNCED_FROM_CORTEX: ... -->` markers. The current implementation does **not** use task markers; it simply copies the full workers plan into cortex for review.

### Deprecated Marker Examples

Older plan formats included marker lines like `<!-- SYNCED_FROM_CORTEX: ... -->`. These are not used in the current implementation and can be ignored if encountered in historical artifacts.

**Important**: Task status and history are tracked via:
- `workers/PLAN_DONE.md` (archived task blocks)
- `workers/ralph/THUNK.md` (completion log)

## Workflow Example (Current Reality)

### Step 1: Write tasks in the canonical plan

Add tasks directly to `workers/IMPLEMENTATION_PLAN.md`.

### Step 2: Start Ralph

When you run `bash workers/ralph/loop.sh`, it will copy the workers plan into `cortex/IMPLEMENTATION_PLAN.md` for visibility at loop start.

### Step 3: Ralph executes tasks

Ralph executes tasks from `workers/IMPLEMENTATION_PLAN.md` and logs completions in `workers/ralph/THUNK.md`. Completed tasks are archived from the plan into `workers/PLAN_DONE.md` by `workers/ralph/cleanup_plan.sh`.

## Task Contract Format (Required)

All tasks in `workers/IMPLEMENTATION_PLAN.md` must use this contract format:

```markdown
- [ ] **X.Y** Short description
  - **Goal:** What to achieve
  - **AC:** How to verify
  - **If Blocked:** Fallback guidance
```text

**Enforcement:** `workers/ralph/cleanup_plan.sh` will fail with an error if it detects a pending task missing any of **Goal**, **AC**, or **If Blocked**.

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

**Action**: Add new tasks directly to `workers/IMPLEMENTATION_PLAN.md` (canonical), using the Task Contract Format below. On the next loop start, the plan will be copied into `cortex/IMPLEMENTATION_PLAN.md` for review.

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

## Quick Reference

```bash
# Copy canonical plan to cortex for review
bash workers/ralph/sync_workers_plan_to_cortex.sh

# Canonical plan
$EDITOR workers/IMPLEMENTATION_PLAN.md

# Cleanup/archival (enforces task contract format; archives full completed blocks)
bash workers/ralph/cleanup_plan.sh
```text
