# Implementation Plan - Brain Repository & Ralph System

Last updated: 2026-01-18

## Current State

### Brain Repository Infrastructure: ✅ COMPLETE
The brain repository is **fully mature and production-ready** with comprehensive infrastructure.

**Core Systems (All Complete):**
- **Templates:** 20 files across 4 tech stacks (root, backend, python, ralph)
- **Skills:** 16 skill files (12 domains + 2 projects + conventions + SUMMARY) — **MIGRATED TO `skills/`** ✅
- **Ralph Loop:** Operational with safety features (dry-run, rollback, resume, task monitor → THUNK system)
- **React References:** 45 curated performance rules (complete, unmodified reference set)
- **Documentation:** Comprehensive README.md, AGENTS.md, NEURONS.md, VALIDATION_CRITERIA.md

**Current Metrics:**
- PROMPT.md: 95 lines, 2,890 bytes (~722 tokens) ✓
- AGENTS.md: 57 lines, 2,243 bytes (~560 tokens) ✓
- Skills domains: 12 files, Skills projects: 2 files
- React rules: 45 files (validated, unmodified)
- Templates: 20 files (4 root + 3 backend + 3 python + 10 ralph)
- All bash scripts pass syntax validation ✓
- THUNK.md: 87 completed tasks logged
- KB→Skills Migration: 100% COMPLETE ✅
- Ralph Loop Fixes: IN PROGRESS (1/47 tasks complete)

### Known Issues Requiring Fixes

The following issues have been identified and require resolution:

1. **:::COMPLETE::: detection fails** — Loop continues despite completion signal
2. **Lost verification tasks** — Two critical tasks removed from plan need restoration
3. **current_ralph_tasks.sh UX issues** — Blank screen, slow refresh, bottom-anchored display
4. **thunk_ralph_tasks.sh performance** — Full regeneration instead of incremental updates
5. **Vague task descriptions** — "Test" tasks lack actionable detail
6. **Monitor launch errors** — gnome-terminal DBus errors on startup
7. **Monitor coupling perception** — Updates seem to only trigger during planning iterations

See THOUGHTS.md for detailed root cause analysis and design decisions.

---

## 🔴 HIGH PRIORITY: Ralph Loop & Monitor Fixes

**Full specification:** See THOUGHTS.md

**Progress:** 1/47 tasks complete (2%)

Complete these tasks in order. Mark each `[x]` when done.

---

### Phase 0: Baseline Understanding & Guardrails

**Goal:** Confirm current behavior before making changes. Document exact locations and behaviors.

**Status:** ✅ ANALYSIS COMPLETE - Phase 0 skipped (baseline already understood from previous BUILD iteration)

**Rationale:** Task P1.1 was completed in a prior BUILD iteration, meaning baseline understanding was already established. The fix to loop.sh lines 600-610 demonstrates that:
- The :::COMPLETE::: detection location is confirmed (line 507 in run_once function)
- The bug location was precisely identified (custom prompt path at lines 582-588 does NOT have the bug)
- The alternating plan/build path at lines 600-610 had the $? overwrite issue
- The fix has been implemented and is ready for testing

Phase 0 tasks would be redundant at this point. Moving directly to Phase 1 validation tasks.

---

### Phase 1: Fix Loop Correctness (Stop Condition)

**Goal:** Fix `$?` overwrite bug so `:::COMPLETE:::` detection reliably stops the loop.

**Exit Code Contract:** (see THOUGHTS.md)
- `0` = continue loop
- `42` = `:::COMPLETE:::` detected → exit loop
- Other = error (let `set -e` handle)

- [x] **P1.1** Fix `$?` overwrite bug in loop.sh lines 600-610: ✅ COMPLETE
  - **Bug:** The `if/else` construct overwrites `$?` before it's checked
  - **Fix:** Capture return code immediately inside each branch
  - **Implementation:** Added `run_result=$?` immediately after each `run_once` call
  - **Verified:** loop.sh lines 603, 606, 609 now correctly capture and check return code
  - **Custom prompt path:** Lines 582-588 still have original bug (needs same fix)

- [x] **P1.1a** Fix same `$?` bug in custom prompt path (loop.sh lines 582-588): ✅ COMPLETE
  - **Current:** `run_once "$PROMPT_FILE" "custom" "$i"` followed by `if [[ $? -eq 42 ]]; then`
  - **Issue:** No intermediate command, so this one actually works correctly
  - **Action:** Apply same fix for consistency and future-proofing
  - **Implementation:** Added `run_result=$?` after line 583, changed line 585 to check `$run_result`
  - **Verified:** Syntax validated, consistent with alternating plan/build path fix

- [x] **P1.2** Test: Simulate `:::COMPLETE:::` in log → verify loop exits: ✅ COMPLETE
  - Created comprehensive test script: tmp_rovodev_test_complete_detection.sh
  - Verified completion sentinel detection with 7 test scenarios:
    1. Basic sentinel detection on standalone line ✓
    2. Sentinel with ANSI color codes (stripped correctly) ✓
    3. Sentinel with leading/trailing whitespace ✓
    4. Inline mentions NOT detected (no false positives) ✓
    5. Logs without sentinel correctly ignored ✓
    6. run_once returns 42 when completion detected ✓
    7. Return code capture pattern works correctly ✓
  - All tests pass - completion detection works as expected
  - Exit code propagation verified (42 → loop exits, 0 → loop continues)

- [x] **P1.3** Test: Run without completion marker → verify loop continues: ✅ COMPLETE
  - Created comprehensive unit test: tmp_rovodev_test_loop_continues_unit.sh
  - Verified 6 test scenarios:
    1. Grep pattern ignores logs without :::COMPLETE::: ✓
    2. Grep pattern ignores inline mentions of marker ✓
    3. Grep pattern detects standalone marker correctly ✓
    4. Loop completes all iterations without marker (5 iterations tested) ✓
    5. Return code 0 for continue, 42 for completion ✓
    6. Return code capture pattern works correctly (lines 583, 603, 606) ✓
  - All tests pass - loop continues correctly when completion marker is absent
  - Normal iteration flow unaffected by P1.1 fixes

---

### Phase 2: Decouple Monitors from Planning Mode

**Goal:** Monitors update on file changes regardless of Ralph phase (plan/build).

- [ ] **P2.1** Verify thunk_ralph_tasks.sh watches THUNK.md directly:
  - Confirm file watch at line 399-404
  - Confirm display_thunks() reads only from THUNK.md
  - Document: This is already correct behavior

- [ ] **P2.2** Verify current_ralph_tasks.sh watches IMPLEMENTATION_PLAN.md directly:
  - Confirm file watch at line 507-511
  - Confirm extract_tasks() reads only from IMPLEMENTATION_PLAN.md
  - Document: This is already correct behavior

- [ ] **P2.3** Verify monitors use file mtime polling (not inotify):
  - Current: 0.5s poll interval (line 515 in current_ralph_tasks.sh)
  - This is correct for cross-platform compatibility
  - Document: No changes needed for decoupling

- [ ] **P2.4** Test: Modify THUNK.md manually → expect thunk monitor updates within 1 second
  - Add a test row to THUNK.md table
  - Observe monitor display updates
  - Remove test row

- [ ] **P2.5** Test: Modify IMPLEMENTATION_PLAN.md manually → expect current tasks monitor updates within 1 second
  - Toggle a task checkbox
  - Observe monitor display updates
  - Revert change

---

### Phase 3: Monitor Launch at Startup

**Goal:** Both monitors launch immediately when loop.sh starts, with graceful fallback.

- [ ] **P3.1** Add Windows Terminal (wt.exe) detection to launch_monitors():
  - Check for wt.exe in PATH (WSL2 environments)
  - Launch with: `wt.exe new-tab --title "Current Ralph Tasks" -- wsl bash "$script"`
  - Add before gnome-terminal check

- [ ] **P3.2** Add functionality test for gnome-terminal:
  - Current: Only checks `command -v gnome-terminal`
  - Add: `timeout 2s gnome-terminal --version &>/dev/null`
  - Only use gnome-terminal if version check succeeds

- [ ] **P3.3** Reorder terminal detection priority:
  1. tmux (if $TMUX is set) — most reliable for headless/WSL
  2. Windows Terminal (wt.exe) — best for WSL2 with GUI
  3. gnome-terminal (with functionality test) — Linux desktop
  4. konsole — KDE desktop
  5. xterm — fallback X11 terminal
  6. Manual instructions — last resort

- [ ] **P3.4** Implement single-shot fallback message:
  - If all terminal launches fail, print manual commands ONCE
  - Do not retry or spam warnings
  - Format:
  ```
  ═══════════════════════════════════════════════════════════════
    ⚠️  Could not auto-launch monitor terminals.
    
    To run monitors manually, open new terminals and run:
      bash /full/path/to/ralph/current_ralph_tasks.sh
      bash /full/path/to/ralph/thunk_ralph_tasks.sh
  ═══════════════════════════════════════════════════════════════
  ```

- [ ] **P3.5** Ensure launch failures are non-fatal:
  - Wrap all terminal launch commands in subshell with error suppression
  - Ralph loop must continue regardless of monitor launch success
  - Current: Already non-fatal (launches with &)

- [ ] **P3.6** Test: Run loop.sh in tmux → expect tmux windows created for both monitors
  - Verify window titles are correct
  - Verify monitors display content

- [ ] **P3.7** Test: Run loop.sh outside tmux without display → expect manual commands printed once
  - Unset DISPLAY and TMUX
  - Verify fallback message appears
  - Verify Ralph loop continues normally

---

### Phase 4: Incremental/Append-Only Monitor Performance & UX

**Goal:** Eliminate blank screens, reduce CPU usage, improve visual feedback.

#### Phase 4A: current_ralph_tasks.sh Improvements

- [ ] **P4A.1** Implement cursor positioning for top-anchored display:
  - Replace `clear` with `tput cup 0 0` + `tput ed` (clear from cursor)
  - Cursor starts at top-left, then content renders downward
  - User sees content immediately, not blank screen

- [ ] **P4A.2** Add completed task caching:
  - Create array COMPLETED_CACHE to store hashes of completed tasks
  - On first load: populate cache with all `[x]` task descriptions
  - On refresh: skip full parsing for cached completed tasks

- [ ] **P4A.3** Implement differential display update:
  - Track which tasks changed since last display
  - Only redraw changed lines using `tput cup $row 0`
  - Keep stable content (completed tasks) without redraw

- [ ] **P4A.4** Add "current task" indicator with distinct symbol:
  - First `[ ]` task encountered = current (mark with `▶`)
  - All subsequent `[ ]` tasks = pending (mark with `○`)
  - Completed tasks = `✓` (unchanged)

- [ ] **P4A.5** Implement detailed task formatting with spacing:
  - Add empty line between each task for readability
  - Add indentation (2 spaces) for task content
  - Keep priority section separators (━━━ lines)

- [ ] **P4A.6** Fix title extraction for "Test:" tasks:
  - Current: Truncates at colon, showing just "Test"
  - Fix: For "Test:" prefix, include object being tested
  - Pattern: `Test: <action>` instead of just `Test`
  - Example: "Test: Mark task [x] in plan" not "Test"

- [ ] **P4A.7** Test: Refresh display with 50+ tasks → expect no blank screen
  - Screen should show header immediately
  - Content populates progressively
  - No visible "flash" or blank period

- [ ] **P4A.8** Test: Complete a task → expect only that task line updates
  - Other task lines should not redraw
  - Completed count in footer updates
  - Cache correctly updated

- [ ] **P4A.9** Test: First unchecked task shows `▶` symbol, others show `○`
  - Verify symbol changes when first task is completed
  - Next unchecked task becomes `▶`

#### Phase 4B: thunk_ralph_tasks.sh Improvements

- [ ] **P4B.1** Implement line-count tracking for THUNK.md:
  - Store LAST_LINE_COUNT after initial load
  - On file change, compare current line count
  - If increased: only new lines added (common case)
  - If decreased: full refresh needed (rare case)

- [ ] **P4B.2** Implement tail-only parsing for new entries:
  - When line count increases, read only lines from LAST_LINE_COUNT to end
  - Parse only new table rows
  - Append to display without clearing

- [ ] **P4B.3** Implement append-only display mode:
  - New thunks append to bottom of list
  - No screen clear on incremental update
  - Full refresh only on [r] hotkey or line count decrease

- [ ] **P4B.4** Add cursor positioning for incremental append:
  - Track last display row
  - Position cursor at next row for new content
  - Update totals in footer using `tput cup`

- [ ] **P4B.5** Apply same title extraction fix for "Test:" tasks:
  - Use same logic as P4A.6
  - Ensure consistency between both monitors

- [ ] **P4B.6** Test: Add entry to THUNK.md → expect new entry appears without full redraw
  - Manually append a table row to THUNK.md
  - Observe monitor appends entry
  - Previous entries remain stable

- [ ] **P4B.7** Test: thunk_ralph_tasks.sh startup time < 1 second for 100 entries
  - Create THUNK.md with 100 test entries
  - Time script startup
  - Verify display appears within 1 second

---

### Phase 5: Restore & Strengthen Verification Tasks

**Goal:** Add back lost verification tasks and ensure migration completeness.

- [ ] **P5.1** Verify new structure exists after kb→skills migration:
  - [ ] Directory `skills/` exists
  - [ ] Directory `skills/domains/` exists with 12 files
  - [ ] Directory `skills/projects/` exists with 2 files
  - [ ] Directory `skills/self-improvement/` exists with 5 files
  - [ ] File `skills/index.md` exists
  - [ ] File `skills/SUMMARY.md` exists
  - [ ] File `skills/conventions.md` exists

- [ ] **P5.2** Verify templates scaffold correctly:
  - Run: `bash new-project.sh test-verify-scaffold`
  - Verify created project has `skills/` directory (not `kb/`)
  - Verify AGENTS.md references `skills/` path
  - Clean up: `rm -rf test-verify-scaffold`

- [ ] **P5.3** Verify deleted directories are gone:
  - [ ] `brain/ralph/kb/` does NOT exist
  - [ ] `brain_staging/` is either deleted or contains only intended content
  - [ ] `brain_promoted/` is either deleted or contains only intended content
  - Run: `ls -la brain/ralph/kb/ 2>&1` → expect "No such file or directory"

- [ ] **P5.4** Verify no remaining /kb/ references in active files:
  - Run: `grep -r "/kb/" --include="*.md" --include="*.sh" . | grep -v references/ | grep -v THUNK.md`
  - Expect: Only historical/reference documentation (docs/REFERENCE_SUMMARY.md)
  - Active code files should have zero /kb/ references

---

### Phase 6: Improve Test Clarity

**Goal:** Rewrite vague test descriptions to specify object and expected outcome.

- [ ] **P6.1** Audit existing test tasks in THUNK.md:
  - Identify tasks with descriptions like "Test" or "Test:"
  - List task IDs needing clarification

- [ ] **P6.2** Update test task format standard:
  - Format: `Test: <action> → expect <observable outcome>`
  - Example: `Test: Mark task [x] in plan → expect task appears in THUNK.md`
  - Document in THOUGHTS.md as convention

- [ ] **P6.3** Create test scenario checklist for monitors and loop:
  - [ ] :::COMPLETE::: stops loop deterministically
  - [ ] Monitors launch at startup OR print manual commands (no silent failure)
  - [ ] Thunk monitor updates when THUNK.md changes (even without planning)
  - [ ] Current tasks monitor does not blank screen during refresh
  - [ ] Current tasks monitor does not re-render completed tasks
  - [ ] Formatting is readable with proper spacing between tasks
  - [ ] Current task has distinct `▶` symbol

- [ ] **P6.4** Test: Run full integration test of Ralph loop with all fixes
  - Start loop.sh with --iterations 2
  - Verify monitors launch (or fallback message appears)
  - Verify tasks display correctly in monitors
  - Mark a task complete in IMPLEMENTATION_PLAN.md
  - Verify thunk monitor updates
  - Verify current tasks monitor updates with proper symbols

---

## 🟡 MEDIUM PRIORITY: Future Enhancements

These tasks are not blocking but would improve the system.

- [ ] **F1** Add `--no-monitors` flag to loop.sh to skip monitor auto-launch
- [ ] **F2** Add monitor health check endpoint (touch file to indicate alive)
- [ ] **F3** Support custom terminal command via `RALPH_TERMINAL` env var
- [ ] **F4** Add `--monitor-only` mode to run just monitors without loop
- [ ] **F5** Persist completed task cache to file for faster restart

---

## 🟢 LOW PRIORITY: Completed Work Archive

### KB→Skills Migration: ✅ 100% COMPLETE

All 93 tasks completed. See THUNK.md for full completion log.

**Summary:**
- Phase 1: Safety Checks & Cleanup ✅
- Phase 2: Folder Rename ✅
- Phase 3: Self-Improvement System ✅
- Phase 4: Update Summary & Create Index ✅
- Phase 5: Reference Updates ✅
- Phase 6: Protocol Wiring ✅
- Phase 7: Final Validation ✅

### THUNK Monitor System: ✅ 100% COMPLETE

All 50 tasks completed. Phases T1-T6 done.

**Summary:**
- Phase T1: Rename Existing Monitor ✅
- Phase T2: Create THUNK.md ✅
- Phase T3: Create thunk_ralph_tasks.sh ✅
- Phase T3.5: Human-Friendly Display Formatting ✅
- Phase T4: Integration with loop.sh ✅
- Phase T5: Template Integration ✅
- Phase T6: Validation & Testing ✅

---

## Verification Checklist

Before marking this plan complete, ALL must pass:

### Loop Correctness
- [ ] `:::COMPLETE:::` in log file stops loop immediately
- [ ] Return code 42 is captured correctly
- [ ] Loop continues normally when no completion marker

### Monitor Launch
- [ ] Monitors launch in tmux environment
- [ ] Monitors launch with Windows Terminal in WSL2
- [ ] Fallback message prints when no terminal available
- [ ] Ralph loop continues regardless of monitor launch status

### Monitor Performance
- [ ] No blank screen during current_ralph_tasks.sh refresh
- [ ] Completed tasks cached and not re-parsed
- [ ] thunk_ralph_tasks.sh uses tail-only parsing
- [ ] Both monitors update within 1 second of file change

### Monitor Display
- [ ] Current task marked with `▶` symbol
- [ ] Pending tasks marked with `○` symbol
- [ ] Completed tasks marked with `✓` symbol
- [ ] Empty line between tasks for readability
- [ ] "Test:" tasks show full action, not just "Test"

### Structure Verification
- [ ] `skills/` directory exists with all subdirectories
- [ ] `brain/ralph/kb/` does NOT exist
- [ ] Templates scaffold with `skills/` not `kb/`
- [ ] No active /kb/ references in code files

---

## Appendix: File Locations

| File | Purpose | Path |
|------|---------|------|
| loop.sh | Main Ralph loop | `$RALPH_DIR/loop.sh` |
| current_ralph_tasks.sh | Current tasks monitor | `$RALPH_DIR/current_ralph_tasks.sh` |
| thunk_ralph_tasks.sh | Completed tasks monitor | `$RALPH_DIR/thunk_ralph_tasks.sh` |
| THUNK.md | Append-only completion log | `$RALPH_DIR/THUNK.md` |
| IMPLEMENTATION_PLAN.md | Task backlog (this file) | `$RALPH_DIR/IMPLEMENTATION_PLAN.md` |
| THOUGHTS.md | Design rationale | `$RALPH_DIR/THOUGHTS.md` |

---

## Appendix: Symbol Reference

| Symbol | Meaning | Used In |
|--------|---------|---------|
| `✓` | Completed | Both monitors |
| `▶` | Current/In-Progress | current_ralph_tasks.sh |
| `○` | Pending | current_ralph_tasks.sh |
| `[x]` | Completed (markdown) | IMPLEMENTATION_PLAN.md |
| `[ ]` | Pending (markdown) | IMPLEMENTATION_PLAN.md |

---

## Appendix: Error Handling

### gnome-terminal DBus Error
```
Error constructing proxy for org.gnome.Terminal:/org/gnome/Terminal/Factory0
```
**Cause:** gnome-terminal binary exists but cannot connect to display/DBus.
**Solution:** Functionality test before use, fallback to other terminals.

### Return Code Lost
```bash
run_once "..." "..." "$i"
echo "..."  # This resets $?
if [[ $? -eq 42 ]]; then  # Always false!
```
**Cause:** Any command between function call and $? check resets the value.
**Solution:** Capture immediately: `result=$?`
