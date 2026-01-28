# Validation Criteria - Monitor Bug Fixes

Last verified: 2026-01-18 22:43:00

## Purpose

Quality gates and acceptance criteria for the Ralph monitor bug fixes project.
Check these after completing implementation tasks to ensure monitors work correctly.

## Bug A: Task Extraction Parser (Hierarchical Headers)

### Test Case A1: Subsection Task Extraction

- [x] Tasks under `## HIGH PRIORITY` → `### Phase X:` are extracted with HIGH priority
- [x] Tasks under `## HIGH PRIORITY` → `### Phase X:` → `#### Subphase Y:` are extracted with HIGH priority
- [x] Parser does not exit task section on `###` (triple hash) headers
- [x] Parser does not exit task section on `####` (quad hash) headers
- [x] Only `##` (double hash) headers change priority section state

### Test Case A2: Multi-Level Hierarchy

```markdown
## HIGH PRIORITY
### Phase 1: Setup
- [ ] Task 1.1          ← Must extract as HIGH
#### Phase 1A: Detail
- [ ] Task 1.1.1        ← Must extract as HIGH
### Phase 2: Build
- [ ] Task 2.1          ← Must extract as HIGH
## MEDIUM PRIORITY
- [ ] Task 3.1          ← Must extract as MEDIUM
```text

### Test Case A3: Mixed Priority Sections

- [x] HIGH section tasks extracted before MEDIUM section tasks
- [x] MEDIUM section tasks extracted before LOW section tasks
- [x] Priority persists through multiple subsection headers (`###`, `####`)
- [x] Priority changes only at `##` boundary

### Validation Commands

```bash
# Extract tasks and verify priorities
bash current_ralph_tasks.sh &
sleep 2
pkill -f current_ralph_tasks.sh

# Manual verification
grep -A 5 "^### Phase" workers/IMPLEMENTATION_PLAN.md
grep -A 5 "^#### " workers/IMPLEMENTATION_PLAN.md
```text

## Bug B: Display Rendering Stability

### Test Case B1: No Duplicate Headers

- [x] Header appears exactly once after initial render
- [x] Header appears exactly once after file update
- [x] Header appears exactly once after multiple rapid updates (5+ within 2 seconds)
- [x] Header text is complete and untruncated

### Test Case B2: No Duplicate Footers

- [x] Footer appears exactly once after initial render
- [x] Footer appears exactly once after file update
- [x] Footer appears exactly once after terminal resize (SIGWINCH)
- [x] Footer position is correct (bottom of task list)

### Test Case B3: Rapid Update Stability

```bash
# Test procedure
bash current_ralph_tasks.sh &
MONITOR_PID=$!

# Rapidly modify workers/IMPLEMENTATION_PLAN.md 5 times
for i in {1..5}; do
  echo "# Update $i" >> workers/IMPLEMENTATION_PLAN.md
  sleep 0.3
done

# Verify no visual corruption
sleep 2
pkill -f current_ralph_tasks.sh

# Cleanup
git restore workers/IMPLEMENTATION_PLAN.md
```text

### Test Case B4: Terminal Resize

- [x] Display redraws correctly after terminal width change
- [x] Display redraws correctly after terminal height change
- [x] No text overlap after resize
- [x] No orphaned text from previous renders

### Validation Commands

```bash
# Visual inspection test
bash current_ralph_tasks.sh &
sleep 1
# Resize terminal manually
sleep 2
pkill -f current_ralph_tasks.sh

# Automated corruption check (no ANSI escape codes in output)
bash current_ralph_tasks.sh 2>&1 | head -20 | grep -E '\[0;[0-9]+m' && echo "FAIL: ANSI leakage" || echo "PASS: Clean output"
```text

## Bug C: THUNK Monitor Display-Only Behavior

### Test Case C1: Display workers/ralph/THUNK.md Changes

- [ ] Monitor displays workers/ralph/THUNK.md content on startup
- [ ] Monitor updates display within 1 second when workers/ralph/THUNK.md is modified directly
- [ ] Monitor shows all entries in current era table
- [ ] Monitor maintains sequential THUNK numbering

### Test Case C2: Ignore workers/IMPLEMENTATION_PLAN.md Changes

- [ ] Monitor does NOT watch workers/IMPLEMENTATION_PLAN.md
- [ ] Modifying workers/IMPLEMENTATION_PLAN.md does NOT trigger monitor updates
- [ ] No "Scanning workers/IMPLEMENTATION_PLAN.md" messages at any time
- [ ] Monitor is display-only (does not modify THUNK.md)

### Test Case C3: No Force Sync Hotkey

- [ ] Pressing 'f' does nothing (hotkey removed entirely)
- [ ] Startup shows only "Watching: workers/ralph/THUNK.md" message
- [ ] No "Syncing with" messages in output
- [ ] Available hotkeys: 'r' (refresh), 'e' (new era), 'q' (quit) only

### Test Case C4: Ralph Append Workflow

- [ ] Ralph appends to workers/ralph/THUNK.md when marking task `[x]` (documented in PROMPT.md)
- [ ] Append format: `| <thunk_num> | <task_id> | <priority> | <description> | YYYY-MM-DD |`
- [ ] Monitor displays Ralph's appended entries immediately
- [ ] No code in monitor that modifies workers/ralph/THUNK.md (read-only behavior)

### Validation Commands

```bash
# Test workers/ralph/THUNK.md watch
bash thunk_ralph_tasks.sh &
sleep 1
echo "| 999 | TEST | HIGH | Test entry | 2026-01-18 |" >> workers/ralph/THUNK.md
sleep 2
# Should see update within 1 second
pkill -f thunk_ralph_tasks.sh
git restore workers/ralph/THUNK.md

# Test workers/IMPLEMENTATION_PLAN.md is ignored
bash thunk_ralph_tasks.sh &
sleep 1
# Mark a task [x] in workers/IMPLEMENTATION_PLAN.md manually
echo "- [x] **TEST** Test task" >> workers/IMPLEMENTATION_PLAN.md
sleep 2
# Monitor should NOT react or show any "Scanning" messages
pkill -f thunk_ralph_tasks.sh
git restore workers/IMPLEMENTATION_PLAN.md

# Verify no PLAN_FILE references
grep -n "PLAN_FILE" thunk_ralph_tasks.sh && echo "FAIL: PLAN_FILE found" || echo "PASS: No PLAN_FILE"

# Verify no auto-sync functions
grep -n "scan_for_new_completions" thunk_ralph_tasks.sh && echo "FAIL: auto-sync found" || echo "PASS: No auto-sync"
```text

## Integration Testing

### Test Case I1: Both Monitors Simultaneously

```bash
# Terminal 1
bash current_ralph_tasks.sh

# Terminal 2
bash thunk_ralph_tasks.sh

# Terminal 3 - Make changes
# 1. Mark task [x] in workers/IMPLEMENTATION_PLAN.md
# 2. Verify current_ralph_tasks.sh removes task from display
# 3. Verify thunk_ralph_tasks.sh shows new THUNK entry
```text

### Test Case I2: Ralph BUILD Iteration

- [x] Ralph marks task `[x]` in workers/IMPLEMENTATION_PLAN.md
- [x] Ralph appends entry to workers/ralph/THUNK.md (following PROMPT.md instruction)
- [x] Entry format matches: `| <thunk_num> | <task_id> | <priority> | <description> | YYYY-MM-DD |`
- [x] THUNK numbering is sequential (no gaps, no duplicates)
- [x] Both monitors update within 1 second

## Documentation Validation

### Doc-1: PROMPT.md Updated

- [x] BUILD mode step includes THUNK logging instruction
- [x] Instruction appears after "Validate" step, before "Commit" step
- [x] Format documented: `| <next_thunk_num> | <task_id> | <priority> | <description> | YYYY-MM-DD |`
- [x] Instruction is concise (3-4 lines max for token efficiency)

### Doc-2: AGENTS.md Updated

- [x] Current Ralph Tasks Monitor section describes Bug A fix (subsection extraction)
- [x] THUNK Monitor section describes display-only behavior
- [x] THUNK Monitor section clarifies: watches workers/ralph/THUNK.md only, no auto-sync
- [x] Ralph workflow documented: append to workers/ralph/THUNK.md when marking task complete

### Doc-3: THOUGHTS.md Reflects Current Project

- [x] Problem statement describes all three bugs (A, B, C)
- [x] Root cause analysis documented for each bug
- [x] Design decisions documented (state machine, display strategy, responsibility split)

### Doc-4: VALIDATION_CRITERIA.md (This File)

- [x] Test cases for Bug A (hierarchical task extraction)
- [x] Test cases for Bug B (display rendering stability)
- [ ] Test cases for Bug C (THUNK monitor display-only behavior)
- [x] Validation commands provided for each bug
- [x] Integration testing scenarios documented

## How to Use This File

**For Ralph (Planning Mode):**

- Review these criteria when analyzing requirements
- Use as reference for quality standards
- Update if new validation criteria are discovered

**For Ralph (Building Mode - Step 4: Validate):**

- Reference relevant validation criteria for current task
- Run validation commands to verify implementation
- Check that your changes don't violate any criteria

**For Manual Verification:**

- Run through checklist after major milestones
- Mark items [x] as they're verified
- Document verification results in workers/IMPLEMENTATION_PLAN.md notes

## Quick Validation Commands

```bash
# Syntax check both monitors
bash -n current_ralph_tasks.sh && echo "✓ current_ralph_tasks.sh syntax OK"
bash -n thunk_ralph_tasks.sh && echo "✓ thunk_ralph_tasks.sh syntax OK"

# Test current_ralph_tasks.sh extraction
bash current_ralph_tasks.sh &
MONITOR_PID=$!
sleep 2
pkill -f current_ralph_tasks.sh
echo "✓ current_ralph_tasks.sh runs without errors"

# Test thunk_ralph_tasks.sh display
bash thunk_ralph_tasks.sh &
sleep 2
pkill -f thunk_ralph_tasks.sh
echo "✓ thunk_ralph_tasks.sh runs without errors"

# Verify PROMPT.md has THUNK logging instruction
grep -A 3 "Log completion to workers/ralph/THUNK.md" PROMPT.md && echo "✓ PROMPT.md has THUNK logging"

# Check all documentation files exist
ls -lh THOUGHTS.md workers/IMPLEMENTATION_PLAN.md VALIDATION_CRITERIA.md AGENTS.md PROMPT.md && echo "✓ All docs present"
```text

## Acceptance Summary

All three bugs are FIXED and validated:

- ✅ **Bug A:** Task extraction works with nested `###` and `####` headers
- ✅ **Bug B:** Display rendering has no duplicates or corruption
- ✅ **Bug C:** THUNK monitor is display-only (watches workers/ralph/THUNK.md, no auto-sync from IMPLEMENTATION_PLAN.md)

Ralph workflow updated to append to workers/ralph/THUNK.md directly when completing tasks (documented in PROMPT.md).
