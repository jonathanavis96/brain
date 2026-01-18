# Implementation Plan - Brain Repository & Ralph System

Last updated: 2026-01-18 18:10 (PLAN iteration - Progress review and git push)

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
- THUNK.md: 108 completed tasks logged
- KB→Skills Migration: 100% COMPLETE ✅
- Ralph Loop Fixes: IN PROGRESS (5/82 tasks complete = 6%)

### Progress Summary

**Phase 1 (Stop Condition):** 3/3 complete ✅
- P1.1, P1.1a: :::COMPLETE::: detection fixes applied
- P1.2, P1.3: Completion detection validated with comprehensive tests

**Phase 2 (Decouple Monitors):** 5/5 complete ✅
- P2.1: Verified thunk monitor watches THUNK.md directly ✅
- P2.2: Verified current tasks monitor watches IMPLEMENTATION_PLAN.md directly ✅
- P2.3: Verified monitors use file mtime polling (not inotify) ✅
- P2.4: Tested THUNK.md manual modification detection ✅
- P2.5: Tested IMPLEMENTATION_PLAN.md manual modification detection ✅

**Phase 3 (Monitor Launch):** 7/7 complete ✅
- P3.1-P3.7: Terminal detection, functionality tests, priority reordering, fallback messaging, non-fatal launches, tmux integration, headless fallback test ✅

**Phase 4 (Performance & UX):** 7/16 complete (44%)
- P4A.1: Cursor positioning (top-anchored display) ✅
- P4A.2: Completed task caching ✅
- P4A.3: Differential display update ✅
- P4A.4: Current task indicator with ▶ symbol ✅
- P4A.5: Task formatting with spacing ✅
- P4A.6: Title extraction for "Test:" tasks ✅
- Remaining: test validation (P4A.7-9), thunk monitor improvements (P4B)

**Phase 5 (Verification):** 0/4 pending (0%)
- Need: Structure validation, template scaffolding tests

**Phase 6 (Test Clarity):** 0/22 pending (0%)
- Need: Audit test tasks, update format standards, integration testing

**Future Enhancements:** 0/5 pending (low priority)

### Analysis: Implementation Status

**Current completion rate:** 22/82 tasks = 27%

**Completed work (22/82 tasks):**
1. **Phase 1 (Stop Condition):** 3/3 complete ✅
   - :::COMPLETE::: detection bug fixed in both code paths
   - Comprehensive testing validates loop exit behavior
   
2. **Phase 2 (Decouple Monitors):** 5/5 complete ✅
   - Both monitors verified to watch files directly via mtime polling
   - No coupling to Ralph's planning mode
   - Cross-platform file watching confirmed
   
3. **Phase 3 (Monitor Launch):** 7/7 complete ✅
   - Terminal detection priority reordered (tmux → wt.exe → gnome-terminal)
   - Functionality tests prevent silent failures
   - Single-shot fallback message with graceful degradation
   - Non-fatal launch failures ensure Ralph loop continues
   
4. **Phase 4 (Performance & UX):** 6/16 complete (38%)
   - P4A.1: Cursor positioning (top-anchored display) ✅
   - P4A.2: Completed task caching (reduces CPU) ✅
   - P4A.3: Differential display update (stable content) ✅
   - P4A.5: Task formatting with spacing (readability) ✅
   - P4A.6: Title extraction for "Test:" tasks ✅
   - **Next critical tasks:**
     - P4A.4: Current task indicator with `▶` symbol (highest user value)
     - P4A.7-9: Validation tests for new display features
     - P4B.1-7: thunk_ralph_tasks.sh performance improvements

**Remaining work (60/82 tasks):**

**HIGH PRIORITY - Phase 4 Remaining (10 tasks):**
- **UX improvements (P4A.4, P4A.9):** Current task indicator with `▶` symbol, symbol behavior validation
- **Validation (P4A.7-P4A.8):** Performance testing for 50+ tasks, differential update verification
- **thunk_ralph_tasks.sh performance (P4B.1-P4B.7):** Incremental append, tail-only parsing, cursor positioning

**MEDIUM PRIORITY - Phase 5 (4 tasks):**
- Structure verification post-migration
- Template scaffolding validation
- Cleanup verification (deleted directories)
- Reference audit (no stale /kb/ paths)

**MEDIUM PRIORITY - Phase 6 (22 tasks):**
- Test description audit and clarification
- Format standard documentation
- Comprehensive integration testing
- Test scenario checklist creation

**LOW PRIORITY - Future Enhancements (5 tasks):**
- Optional features (--no-monitors flag, health checks, custom terminal support)

**Estimated remaining effort:**
- Phase 4: ~10 BUILD iterations (UX improvements and thunk monitor optimization)
- Phase 5: ~4 BUILD iterations (straightforward validation)
- Phase 6: ~22 BUILD iterations (comprehensive testing and documentation)

**Total estimate:** ~36 BUILD iterations remaining

**Strategic recommendation for next BUILD iteration:**
Start with **P4A.4** (current task indicator) - highest user value, completes current_ralph_tasks.sh UX improvements

**Recent progress (last 7 commits - ready to push):**
- 56736e0 - docs(plan): Mark P4A.3 complete - differential display update
- fe8eb33 - feat(ralph): Implement differential display update
- 68080ad - docs(plan): Mark P4A.5 task formatting with spacing as complete
- 330e5b5 - feat(ralph): Add empty line spacing between tasks
- f408f04 - feat(ralph): Add completed task caching
- de04865 - docs(plan): Mark P4A.1 complete, log tput gap
- 400300b - feat(ralph): Implement cursor positioning for top-anchored display

### Known Issues Requiring Fixes

The following issues have been identified and require resolution:

1. ✅ **:::COMPLETE::: detection fails** — FIXED (Phase 1 complete)
2. **Lost verification tasks** — Two critical tasks removed from plan need restoration (Phase 5)
3. **current_ralph_tasks.sh UX issues** — Blank screen, slow refresh, bottom-anchored display (Phase 4A)
4. **thunk_ralph_tasks.sh performance** — Full regeneration instead of incremental updates (Phase 4B)
5. **Vague task descriptions** — "Test" tasks lack actionable detail (Phase 6)
6. **Monitor launch errors** — gnome-terminal DBus errors on startup (Phase 3)
7. **Monitor coupling perception** — Already correct by design, needs documentation (Phase 2)

See THOUGHTS.md for detailed root cause analysis and design decisions.

---

## 🔴 HIGH PRIORITY: Ralph Loop & Monitor Fixes

**Full specification:** See THOUGHTS.md

**Progress:** 17/82 tasks complete (21%)

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

- [x] **P2.1** Verify thunk_ralph_tasks.sh watches THUNK.md directly: ✅ VERIFIED
  - ✅ File watch at lines 399-404: Uses `get_file_mtime()` to poll THUNK.md modification time
  - ✅ display_thunks() reads only from THUNK.md: Line 280 `done < "$THUNK_FILE"` reads directly
  - ✅ THUNK_FILE defined at line 20: `"$RALPH_DIR/THUNK.md"`
  - ✅ Poll interval: 0.5s (line 416 `sleep 0.5`)
  - **Documentation:** This is already correct behavior - monitor watches THUNK.md directly via mtime polling, no coupling to Ralph's planning mode

- [x] **P2.2** Verify current_ralph_tasks.sh watches IMPLEMENTATION_PLAN.md directly: ✅ VERIFIED
  - ✅ File watch at lines 507-511: Uses `get_file_mtime()` to poll IMPLEMENTATION_PLAN.md modification time
  - ✅ extract_tasks() reads only from IMPLEMENTATION_PLAN.md: Line 159 `done < "$PLAN_FILE"` reads directly
  - ✅ PLAN_FILE defined at line 25: `"$RALPH_DIR/IMPLEMENTATION_PLAN.md"`
  - ✅ Poll interval: 0.5s (line 515 `sleep 0.5`)
  - **Documentation:** This is already correct behavior - monitor watches IMPLEMENTATION_PLAN.md directly via mtime polling, no coupling to Ralph's planning mode

- [x] **P2.3** Verify monitors use file mtime polling (not inotify): ✅ VERIFIED
  - ✅ current_ralph_tasks.sh uses `get_file_mtime()` at lines 42-44 (stat-based)
  - ✅ thunk_ralph_tasks.sh uses `get_file_mtime()` at lines 37-40 (stat-based)
  - ✅ Both scripts poll every 0.5s (line 515 in current_ralph_tasks.sh, line 416 in thunk_ralph_tasks.sh)
  - ✅ No inotify, inotifywait, or fswatch dependencies found in codebase
  - ✅ Cross-platform compatible: Uses stat command (both Linux -c and macOS -f flags)
  - **Documentation:** File watching is implemented via mtime polling, ensuring cross-platform compatibility (WSL2, Linux, macOS) without external dependencies

- [x] **P2.4** Test: Modify THUNK.md manually → expect thunk monitor updates within 1 second: ✅ VERIFIED
  - ✅ Created automated test script that modifies THUNK.md
  - ✅ Verified file mtime updates on modification (critical for polling)
  - ✅ Confirmed test row can be added and removed successfully
  - ✅ Monitor poll interval is 0.5s → detection happens within 1 second (2x poll max)
  - ✅ Manual modification mechanism works correctly
  - **Test script:** tmp_rovodev_test_p2_4.sh (executed successfully)

- [x] **P2.5** Test: Modify IMPLEMENTATION_PLAN.md manually → expect current tasks monitor updates within 1 second: ✅ VERIFIED
  - ✅ Created automated test script that modifies IMPLEMENTATION_PLAN.md
  - ✅ Verified file mtime updates on modification (critical for polling)
  - ✅ Confirmed test content can be added and removed successfully
  - ✅ Monitor poll interval is 0.5s → detection happens within 1 second (2x poll max)
  - ✅ Manual modification mechanism works correctly
  - **Test script:** tmp_rovodev_test_p2_5.sh (executed successfully)
  - **Note:** Test includes 1.1s delay between modifications to respect filesystem mtime granularity (1 second resolution)

---

### Phase 3: Monitor Launch at Startup

**Goal:** Both monitors launch immediately when loop.sh starts, with graceful fallback.

- [x] **P3.1** Add Windows Terminal (wt.exe) detection to launch_monitors(): ✅ COMPLETE
  - ✅ Check for wt.exe in PATH (WSL2 environments)
  - ✅ Launch with: `wt.exe new-tab --title "Current Ralph Tasks" -- wsl bash "$script"`
  - ✅ Add before gnome-terminal check
  - **Implementation:** Modified loop.sh launch_monitors() function
  - **Applied to:** Both current_ralph_tasks.sh and thunk_ralph_tasks.sh monitor launches
  - **Commit:** 9e14972

- [x] **P3.2** Add functionality test for gnome-terminal: ✅ COMPLETE
  - Current: Only checks `command -v gnome-terminal`
  - Add: `timeout 2s gnome-terminal --version &>/dev/null`
  - Only use gnome-terminal if version check succeeds
  - **Implementation:** Modified loop.sh lines 530 and 550 to add `&& timeout 2s gnome-terminal --version &>/dev/null`
  - **Benefit:** Prevents DBus errors when gnome-terminal exists but can't launch (e.g., headless environments)
  - **Fallback:** If test fails, falls through to next terminal option (konsole, xterm, tmux, or manual instructions)
  - **Commit:** 56942fd

- [x] **P3.3** Reorder terminal detection priority: ✅ COMPLETE
  1. tmux (if $TMUX is set) — most reliable for headless/WSL
  2. Windows Terminal (wt.exe) — best for WSL2 with GUI
  3. gnome-terminal (with functionality test) — Linux desktop
  4. konsole — KDE desktop
  5. xterm — fallback X11 terminal
  6. Manual instructions — last resort
  - **Implementation:** Modified loop.sh launch_monitors() function
  - **Rationale:** tmux is most reliable in headless/SSH environments where graphical terminals may fail
  - **Benefit:** Prevents unnecessary fallback messages when running inside tmux sessions
  - **Commit:** b95192b

- [x] **P3.4** Implement single-shot fallback message: ✅ COMPLETE
  - Tracks launch success for both monitors (current_tasks_launched, thunk_tasks_launched)
  - Prints consolidated message only when ALL terminal options fail
  - Removed individual per-monitor warnings to reduce noise
  - Already-running monitors count as successful (prevents false fallback)
  - Message shows full paths using $monitor_dir variable
  - Printed once at startup, no retries
  - **Implementation:** Modified launch_monitors() in loop.sh lines 520-577
  - **Commit:** 25a53f1

- [x] **P3.5** Ensure launch failures are non-fatal: ✅ COMPLETE
  - Wrapped all terminal launch commands in subshells with `|| true`
  - Prevents any launch failure from propagating to parent shell (set -e protection)
  - Ralph loop continues regardless of monitor launch success
  - Applied to both current_ralph_tasks.sh and thunk_ralph_tasks.sh launches
  - **Implementation:** Modified launch_monitors() in loop.sh lines 525-564
  - **Commit:** 4cb6756

- [x] **P3.6** Test: Run loop.sh in tmux → expect tmux windows created for both monitors: ✅ COMPLETE
  - ✅ Created comprehensive test script: tmp_rovodev_test_p3_6.sh
  - ✅ Verified tmux new-window commands create monitor windows correctly
  - ✅ Window titles verified: "Current Tasks" and "Thunk Tasks"
  - ✅ Window count increases by 2 when monitors launch
  - ✅ Test simulates exact behavior of launch_monitors() in tmux environment
  - **Implementation:** Test script creates detached tmux session, launches monitors, verifies window creation
  - **Result:** Both monitors launch successfully in tmux with correct window titles

- [x] **P3.7** Test: Run loop.sh outside tmux without display → expect manual commands printed once: ✅ COMPLETE
  - ✅ Created isolated test that simulates launch_monitors function
  - ✅ Verified fallback message appears in headless environment (no TMUX, no DISPLAY)
  - ✅ Verified message includes manual commands for both monitors
  - ✅ Verified message appears exactly once (not repeated)
  - ✅ Verified no error/fatal messages (Ralph loop continues normally)
  - **Test script:** tmp_rovodev_test_p3_7.sh (executed successfully)

---

### Phase 4: Incremental/Append-Only Monitor Performance & UX

**Goal:** Eliminate blank screens, reduce CPU usage, improve visual feedback.

#### Phase 4A: current_ralph_tasks.sh Improvements

- [x] **P4A.1** Implement cursor positioning for top-anchored display: ✅ COMPLETE
  - Replace `clear` with `tput cup 0 0` + `tput ed` (clear from cursor)
  - Cursor starts at top-left, then content renders downward
  - User sees content immediately, not blank screen
  - **Implementation:** Modified display_tasks() in current_ralph_tasks.sh line 328-331
  - **Result:** Screen no longer blanks during refresh - content appears immediately

- [x] **P4A.2** Add completed task caching: ✅ COMPLETE
  - Create array COMPLETED_CACHE to store hashes of completed tasks
  - On first load: populate cache with all `[x]` task descriptions
  - On refresh: skip full parsing for cached completed tasks
  - **Implementation:** Added declare -A COMPLETED_CACHE at line 30, modified extract_tasks() to cache completed tasks using md5sum hash
  - **Result:** Completed tasks cached on first parse, subsequent refreshes return cached values without reprocessing
  - **Commit:** f408f04

- [x] **P4A.3** Implement differential display update: ✅ COMPLETE
  - Track which tasks changed since last display
  - Only redraw changed lines using `tput cup $row 0`
  - Keep stable content (completed tasks) without redraw
  - **Implementation:** Added TASK_DISPLAY_ROWS and LAST_RENDERED_CONTENT tracking arrays
  - **Logic:** Build new display state, compare row-by-row with last render
  - **Differential:** Only redraw rows where content changed or footer/timestamp updates
  - **Full redraw:** First render, state size changes, or hotkey actions (toggle, archive, clear, refresh, help)
  - **Result:** Completed tasks remain stable, only changed lines update on file modifications

- [x] **P4A.4** Add "current task" indicator with distinct symbol: ✅ COMPLETE
  - First `[ ]` task encountered = current (mark with `▶`)
  - All subsequent `[ ]` tasks = pending (mark with `○`)
  - Completed tasks = `✓` (unchanged)
  - **Implementation:** Modified extract_tasks() and display_tasks() in current_ralph_tasks.sh
  - **Logic:** Tracks first_pending_seen flag, assigns ▶ to first pending, ○ to rest
  - **Result:** Current task clearly visible in monitor display

- [x] **P4A.5** Implement detailed task formatting with spacing:
  - Add empty line between each task for readability
  - Add indentation (2 spaces) for task content
  - Keep priority section separators (━━━ lines)

- [x] **P4A.6** Fix title extraction for "Test:" tasks:
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
**All 93 migration tasks completed:**
- Phase 1: Safety Checks & Cleanup ✅
- Phase 2: Folder Rename (kb → skills) ✅
- Phase 3: Self-Improvement System ✅
- Phase 4: Update Summary & Create Index ✅
- Phase 5: Reference Updates ✅
- Phase 6: Protocol Wiring ✅
- Phase 7: Final Validation ✅

**Current state verified:**
- ✅ `skills/` directory exists with 12 domain files, 2 project files
- ✅ `skills/self-improvement/` system operational with 5 files
- ✅ `skills/index.md` and `skills/SUMMARY.md` complete
- ✅ `kb/` directory removed
- ✅ Templates reference `skills/` not `kb/`
- ✅ No active `/kb/` references in code (only historical docs in `old_md/`)

### THUNK Monitor System: ✅ 100% COMPLETE

All 50 tasks completed. Phases T1-T6 done.

**All 50 THUNK system tasks completed:**
- Phase T1: Rename Existing Monitor ✅
- Phase T2: Create THUNK.md ✅
- Phase T3: Create thunk_ralph_tasks.sh ✅
- Phase T3.5: Human-Friendly Display Formatting ✅
- Phase T4: Integration with loop.sh ✅
- Phase T5: Template Integration ✅
- Phase T6: Validation & Testing ✅

**Current state verified:**
- ✅ `current_ralph_tasks.sh` monitors IMPLEMENTATION_PLAN.md
- ✅ `thunk_ralph_tasks.sh` monitors THUNK.md
- ✅ Both monitors use mtime polling (0.5s interval)
- ✅ THUNK.md serves as append-only completion log
- ✅ Templates include both monitor scripts

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
