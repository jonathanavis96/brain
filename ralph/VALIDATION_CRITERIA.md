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
```

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
grep -A 5 "^### Phase" IMPLEMENTATION_PLAN.md
grep -A 5 "^#### " IMPLEMENTATION_PLAN.md
```

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

# Rapidly modify IMPLEMENTATION_PLAN.md 5 times
for i in {1..5}; do
  echo "# Update $i" >> IMPLEMENTATION_PLAN.md
  sleep 0.3
done

# Verify no visual corruption
sleep 2
pkill -f current_ralph_tasks.sh

# Cleanup
git restore IMPLEMENTATION_PLAN.md
```

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
```

## Bug C: THUNK Monitor Dual-Responsibility Model

### Test Case C1: Primary Watch (THUNK.md Changes)
- [x] Monitor displays THUNK.md content on startup
- [x] Monitor updates display within 1 second when THUNK.md is modified directly
- [x] Monitor shows all entries in current era table
- [x] Monitor maintains sequential THUNK numbering

### Test Case C2: Safety Net (Auto-Sync from IMPLEMENTATION_PLAN.md)
- [x] Monitor watches IMPLEMENTATION_PLAN.md as fallback
- [x] When task marked `[x]` in IMPLEMENTATION_PLAN.md, monitor syncs to THUNK.md
- [x] Auto-sync message displayed: "Scanning IMPLEMENTATION_PLAN.md"
- [x] Auto-sync only triggers if Ralph forgets to append manually

### Test Case C3: Ralph Append Workflow
- [x] Ralph appends to THUNK.md when marking task `[x]` (documented in PROMPT.md)
- [x] Append format: `| <thunk_num> | <task_id> | <priority> | <description> | YYYY-MM-DD |`
- [x] Monitor displays Ralph's appended entries immediately
- [x] No duplicate entries (Ralph append + auto-sync redundancy)

### Test Case C4: Hotkey Functionality
```bash
# Test hotkeys
bash thunk_ralph_tasks.sh &

# Press 'r' - manual refresh
# Press 'f' - force sync from IMPLEMENTATION_PLAN.md
# Press 'e' - start new era
# Press 'q' - quit

pkill -f thunk_ralph_tasks.sh
```

### Validation Commands
```bash
# Test primary watch
bash thunk_ralph_tasks.sh &
sleep 1
echo "| 999 | TEST | HIGH | Test entry | 2026-01-18 |" >> THUNK.md
sleep 2
pkill -f thunk_ralph_tasks.sh
git restore THUNK.md

# Test auto-sync fallback
bash thunk_ralph_tasks.sh &
sleep 1
# Mark a task [x] in IMPLEMENTATION_PLAN.md manually
sleep 2
grep "Scanning IMPLEMENTATION_PLAN.md" <(ps aux | grep thunk_ralph_tasks.sh)
pkill -f thunk_ralph_tasks.sh
```

## Integration Testing

### Test Case I1: Both Monitors Simultaneously
```bash
# Terminal 1
bash current_ralph_tasks.sh

# Terminal 2
bash thunk_ralph_tasks.sh

# Terminal 3 - Make changes
# 1. Mark task [x] in IMPLEMENTATION_PLAN.md
# 2. Verify current_ralph_tasks.sh removes task from display
# 3. Verify thunk_ralph_tasks.sh shows new THUNK entry
```

### Test Case I2: Ralph BUILD Iteration
- [x] Ralph marks task `[x]` in IMPLEMENTATION_PLAN.md
- [x] Ralph appends entry to THUNK.md (following PROMPT.md instruction)
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
- [x] THUNK Monitor section describes dual-responsibility model
- [x] THUNK Monitor section clarifies auto-sync as safety net (not primary)
- [x] Ralph workflow documented: append to THUNK.md when marking task complete

### Doc-3: THOUGHTS.md Reflects Current Project
- [x] Problem statement describes all three bugs (A, B, C)
- [x] Root cause analysis documented for each bug
- [x] Design decisions documented (state machine, display strategy, responsibility split)

### Doc-4: VALIDATION_CRITERIA.md (This File)
- [x] Test cases for Bug A (hierarchical task extraction)
- [x] Test cases for Bug B (display rendering stability)
- [x] Test cases for Bug C (THUNK monitor dual-responsibility)
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
- Document verification results in IMPLEMENTATION_PLAN.md notes

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
grep -A 3 "Log completion to THUNK.md" PROMPT.md && echo "✓ PROMPT.md has THUNK logging"

# Check all documentation files exist
ls -lh THOUGHTS.md IMPLEMENTATION_PLAN.md VALIDATION_CRITERIA.md AGENTS.md PROMPT.md && echo "✓ All docs present"
```

## Acceptance Summary

All three bugs are FIXED and validated:

- ✅ **Bug A:** Task extraction works with nested `###` and `####` headers
- ✅ **Bug B:** Display rendering has no duplicates or corruption
- ✅ **Bug C:** THUNK monitor uses dual-responsibility model (display + safety net)

Ralph workflow updated to append to THUNK.md directly when completing tasks (documented in PROMPT.md).
