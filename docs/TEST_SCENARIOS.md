# Test Scenarios - Ralph Loop & Monitor System

Last updated: 2026-01-18

## Purpose

Comprehensive test checklist for Ralph loop and monitor system. Use this to verify all critical functionality works correctly after changes.

---

## Loop Correctness

### :::COMPLETE::: Detection

- [ ] **Test: Echo `:::COMPLETE:::` in log → expect loop exits immediately**
  - Run: Create log with `:::COMPLETE:::` marker
  - Expected: Loop detects marker and exits with code 0
  - Validation: Return code 42 captured correctly in loop.sh
  
- [ ] **Test: Run loop without completion marker → expect loop continues**
  - Run: Complete iterations with tasks but no `:::COMPLETE:::`
  - Expected: Loop continues through all iterations
  - Validation: No premature exit, normal iteration flow

- [ ] **Test: Completion marker with ANSI codes → expect loop exits**
  - Run: Marker with color codes (e.g., `\033[32m:::COMPLETE:::\033[0m`)
  - Expected: ANSI codes stripped, marker detected, loop exits
  - Validation: Color output doesn't break detection

- [ ] **Test: Inline mention of marker → expect loop continues**
  - Run: Log contains "I will output :::COMPLETE::: when done"
  - Expected: Inline mention ignored, loop continues
  - Validation: No false positives from documentation/comments

---

## Monitor Launch

### Startup Behavior

- [ ] **Test: Run loop.sh in tmux → expect tmux windows created**
  - Run: `TMUX=1 bash loop.sh --iterations 1` in tmux session
  - Expected: Two new tmux windows created with titles "Current Tasks" and "Thunk Tasks"
  - Validation: `tmux list-windows` shows new windows

- [ ] **Test: Run loop.sh with Windows Terminal → expect new tabs**
  - Run: In WSL2 with wt.exe in PATH
  - Expected: Two new Windows Terminal tabs for monitors
  - Validation: Tabs appear with monitor scripts running

- [ ] **Test: Run loop.sh without terminal → expect manual commands printed once**
  - Run: `TMUX="" DISPLAY="" bash loop.sh --iterations 1`
  - Expected: Single consolidated message with manual launch commands
  - Validation: Message includes paths to both monitor scripts

- [ ] **Test: Monitor launch fails → expect Ralph loop continues**
  - Run: Simulate terminal failure (e.g., gnome-terminal not functional)
  - Expected: Ralph loop continues execution despite monitor failures
  - Validation: Loop completes tasks, no fatal errors

### Terminal Detection Priority

- [ ] **Test: Verify tmux has highest priority**
  - Run: In tmux with DISPLAY set and gnome-terminal installed
  - Expected: Uses tmux, not graphical terminal
  - Validation: tmux windows created, not separate terminal windows

- [ ] **Test: Verify gnome-terminal functionality check**
  - Run: With gnome-terminal binary but no display
  - Expected: Functionality test fails, falls back to next option
  - Validation: No DBus errors, clean fallback

---

## Monitor File Watching

### Current Tasks Monitor (IMPLEMENTATION_PLAN.md)

- [ ] **Test: Modify IMPLEMENTATION_PLAN.md → expect monitor updates within 1 second**
  - Run: Add/remove task in plan file
  - Expected: Monitor detects change within 1s (2x poll interval)
  - Validation: mtime polling at 0.5s intervals

- [ ] **Test: Complete task in plan → expect monitor shows [x]**
  - Run: Change `[ ]` to `[x]` in IMPLEMENTATION_PLAN.md
  - Expected: Task status updates in monitor display
  - Validation: Completed count increases

### Thunk Monitor (THUNK.md)

- [ ] **Test: Modify THUNK.md → expect monitor updates within 1 second**
  - Run: Append new row to THUNK.md
  - Expected: Monitor detects change within 1s
  - Validation: New entry appears in display

- [ ] **Test: Add entry to THUNK.md → expect new entry appears without full redraw**
  - Run: Manually append table row to THUNK.md
  - Expected: New entry appends to bottom, previous entries stable
  - Validation: No screen clear, incremental update only

---

## Monitor Performance

### Current Tasks Monitor UX

- [ ] **Test: Refresh display with 50+ tasks → expect no blank screen**
  - Run: Load plan with 50+ tasks, trigger refresh
  - Expected: Screen shows header immediately, content populates progressively
  - Validation: No visible flash/blank period

- [ ] **Test: Complete a task → expect only that task line updates**
  - Run: Mark one task complete in plan
  - Expected: Only changed line redraws, other tasks stable
  - Validation: Differential update, completed tasks cached

- [ ] **Test: Startup time < 1 second with 50+ tasks**
  - Run: Launch monitor with large plan file
  - Expected: Initial display renders in < 1 second
  - Validation: Performance acceptable for real-world use

### Thunk Monitor UX

- [ ] **Test: Startup time < 1 second with 100 entries**
  - Run: Launch thunk monitor with 100 THUNK.md entries
  - Expected: Initial display renders in < 1 second
  - Validation: Optimized title generation, no subprocesses

- [ ] **Test: New entry appends without full redraw**
  - Run: Add entry while monitor running
  - Expected: Previous entries remain stable, new entry appends
  - Validation: Append-only display mode, cursor positioning

---

## Monitor Display Format

### Symbols & Indicators

- [ ] **Test: First unchecked task shows `▶` symbol**
  - Run: View plan with multiple pending tasks
  - Expected: First `[ ]` task marked with `▶` (current)
  - Validation: Visual indicator for current task

- [ ] **Test: Subsequent unchecked tasks show `○` symbol**
  - Run: View plan with multiple pending tasks
  - Expected: All `[ ]` tasks after first marked with `○`
  - Validation: Distinction between current and pending

- [ ] **Test: Completed tasks show `✓` symbol**
  - Run: View plan with `[x]` tasks
  - Expected: All completed tasks marked with `✓`
  - Validation: Consistent completion indicator

- [ ] **Test: Symbol changes when current task completes**
  - Run: Complete first pending task
  - Expected: `▶` moves to next pending task
  - Validation: Current indicator updates dynamically

### Task Formatting

- [ ] **Test: Empty line between tasks for readability**
  - Run: View monitor with multiple tasks
  - Expected: Visual spacing between each task
  - Validation: Improves readability, reduces visual clutter

- [ ] **Test: "Test:" tasks show full action, not just "Test"**
  - Run: View task like "Test: Mark task [x] in plan"
  - Expected: Title shows "Test: Mark task [x] in plan" (truncated at 50 chars if needed)
  - Validation: Title extraction includes action after colon

- [ ] **Test: Task IDs displayed correctly (P4A.7, T1.1, etc.)**
  - Run: View tasks with various ID formats
  - Expected: All alphanumeric task IDs displayed
  - Validation: Regex pattern handles diverse ID formats

---

## Integration Tests

### Full System Verification

- [ ] **Test: Run full integration test with all fixes**
  - Run: `bash loop.sh --iterations 2` in clean environment
  - Expected:
    - Monitors launch (or fallback message)
    - Tasks display with proper symbols
    - Manual task completion updates both monitors
    - No blank screens or performance issues
  - Validation: End-to-end workflow functions correctly

- [ ] **Test: Planning mode → Building mode transition**
  - Run: Loop through iteration 1 (PLAN) → iteration 2 (BUILD)
  - Expected: Mode changes, tasks picked correctly, monitors update throughout
  - Validation: Alternating plan/build logic works

- [ ] **Test: Multiple iterations complete cycle**
  - Run: `bash loop.sh --iterations 5` with sufficient tasks
  - Expected: All iterations complete, monitors stable throughout
  - Validation: No degradation over multiple iterations

---

## Error Handling & Edge Cases

### Graceful Degradation

- [ ] **Test: THUNK.md line count decreases → expect full refresh**
  - Run: Delete rows from THUNK.md
  - Expected: Monitor detects decrease, triggers full refresh
  - Validation: Handles rare edit/deletion case

- [ ] **Test: IMPLEMENTATION_PLAN.md becomes empty → expect monitors handle gracefully**
  - Run: Remove all tasks from plan
  - Expected: Monitor shows "No tasks found" or similar
  - Validation: No crashes or errors

- [ ] **Test: Malformed task syntax → expect monitors skip/ignore**
  - Run: Add invalid task format to plan
  - Expected: Monitor skips invalid entries, shows valid tasks
  - Validation: Robust parsing, no crashes

### File System

- [ ] **Test: IMPLEMENTATION_PLAN.md deleted → expect monitor detects and waits**
  - Run: Remove plan file while monitor running
  - Expected: Monitor detects missing file, waits for restoration
  - Validation: Handles temporary file absence

- [ ] **Test: File permissions prevent reading → expect graceful error**
  - Run: `chmod 000 IMPLEMENTATION_PLAN.md`
  - Expected: Monitor logs error but doesn't crash
  - Validation: Permission errors handled gracefully

---

## Regression Prevention

### Known Historical Issues

- [ ] **Test: $? overwrite bug fixed (lines 600-610, 582-588)**
  - Run: Verify return code captured immediately after run_once
  - Expected: No intermediate commands between call and capture
  - Validation: Code review confirms fix in both paths

- [ ] **Test: gnome-terminal DBus error prevented**
  - Run: On system with gnome-terminal but no display
  - Expected: Functionality test fails, clean fallback
  - Validation: No DBus error messages in output

- [ ] **Test: Monitors decouple from Ralph planning mode**
  - Run: Modify THUNK.md during BUILD iteration
  - Expected: Thunk monitor updates immediately
  - Validation: File watching independent of Ralph phase

---

## How to Use This Checklist

### For Manual Testing

1. Start from top, work through each section
2. Mark `[x]` when test passes
3. Document failures with date and details
4. Retest after fixes applied

### For Automated Testing

1. Each test should have corresponding script in `tmp_rovodev_test_*.sh`
2. Run all tests: `bash -c 'for f in tmp_rovodev_test_*.sh; do bash "$f" || echo "FAILED: $f"; done'`
3. Clean up temp files after testing

### For Regression Testing

1. Run full checklist before major releases
2. Run relevant sections after bug fixes
3. Update checklist when new scenarios discovered

### For CI/CD Integration

1. Automate critical tests (loop correctness, monitor launch, performance)
2. Run on each commit to main branch
3. Block merges if critical tests fail

---

## Test Script Naming Convention

Test scripts should follow this pattern:

```text
tmp_rovodev_test_<phase>_<task>.sh
```text

Examples:

- `tmp_rovodev_test_p1_2.sh` - Tests P1.2 (completion detection)
- `tmp_rovodev_test_p3_6.sh` - Tests P3.6 (tmux window creation)
- `tmp_rovodev_test_p4a7.sh` - Tests P4A.7 (no blank screen)

---

## Coverage Summary

| Category | Test Count | Automated | Manual |
|----------|-----------|-----------|--------|
| Loop Correctness | 4 | 4 | 0 |
| Monitor Launch | 6 | 4 | 2 |
| File Watching | 4 | 4 | 0 |
| Performance | 4 | 4 | 0 |
| Display Format | 7 | 3 | 4 |
| Integration | 3 | 0 | 3 |
| Error Handling | 5 | 0 | 5 |
| Regression | 3 | 3 | 0 |
| **Total** | **36** | **22** | **14** |

---

## References

- **IMPLEMENTATION_PLAN.md** - Task definitions and completion status
- **THOUGHTS.md** - Design rationale and test format standard (Section H)
- **VALIDATION_CRITERIA.md** - Quality gates and validation commands
- **loop.sh** - Main Ralph loop implementation
- **current_ralph_tasks.sh** - Current tasks monitor implementation
- **thunk_ralph_tasks.sh** - Completed tasks monitor implementation
