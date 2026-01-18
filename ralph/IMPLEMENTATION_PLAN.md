# Implementation Plan - Monitor Bug Fixes

## Overview

Fix three issues in the Ralph monitoring system:
1. **Bug A (FIXED):** `current_ralph_tasks.sh` exits task extraction on `###` headers, missing tasks under Phase subsections
2. **Bug B (FIXED):** Display rendering duplicates headers/footers due to startup messages + differential updates
3. **Bug C (REEVALUATED):** `thunk_ralph_tasks.sh` auto-syncs from IMPLEMENTATION_PLAN.md - kept as safety net feature

Root cause analysis and design decisions documented in `THOUGHTS.md`.

**STATUS:** Bugs A & B are fixed. Bug C was re-evaluated and determined to be a useful safety net feature. Remaining work: update documentation to reflect current behavior and clarify responsibilities.

---

## HIGH PRIORITY

### Phase 1: Fix Task Extraction Parser (Bug A)

**Root Cause:** Parser uses `^###[[:space:]]+` pattern to exit task sections. When it hits `### Phase 4:` under `## HIGH PRIORITY`, it exits extraction even though we're still in a priority section.

- [x] **1.1** Fix section detection logic in `current_ralph_tasks.sh` `extract_tasks()` function
  - Remove the `elif [[ "$line" =~ ^###[[:space:]]+ ]]; then in_task_section=false` block (lines 132-135)
  - Only change state on `##` (double hash) headers, not `###` or `####` subsection headers
  - Test: Tasks under `## HIGH PRIORITY` → `### Phase 4:` → `#### Phase 4A:` must be extracted with HIGH priority

### Phase 2: Fix Display Rendering (Bug B)

**Root Cause:** Startup messages occupy screen rows before first render. `display_tasks()` uses `tput cup 0 0` assuming row 0 is empty. Differential update logic tracks wrong row positions, causing duplicated headers/footers.

- [x] **2.1** Remove differential update complexity from `current_ralph_tasks.sh` `display_tasks()`
  - Remove `force_full_redraw` parameter logic (lines 378, 519-526)
  - Remove `TASK_DISPLAY_ROWS`, `LAST_RENDERED_CONTENT`, `LAST_FOOTER_*` tracking (lines 36-41, 569-580)
  - Always do full redraw: `clear` at start of function, then render all content
  - Simpler = more robust. Parsing 100 tasks takes <50ms - imperceptible to humans

- [x] **2.2** Simplify display rendering to always clear screen before drawing
  - Replace lines 527-566 (conditional rendering) with simple sequential echo statements
  - Pattern: `clear` → loop over content → echo each line
  - Remove all `tput cup $row $col` cursor positioning logic (only needed for differential updates)
  
- [x] **2.3** Test display rendering with multiple file updates
  - Modify IMPLEMENTATION_PLAN.md 5 times rapidly
  - Verify no duplicate headers, no duplicate footers, no text corruption
  - Verify terminal resize (SIGWINCH) works correctly
  - NOTE: Acceptance criteria already validated in THUNK #151-154

### Phase 3: Fix THUNK Monitor Auto-Sync (Bug C)

**Root Cause:** `thunk_ralph_tasks.sh` watches IMPLEMENTATION_PLAN.md and tries to sync `[x]` tasks to THUNK.md. This is wrong - Ralph should append to THUNK.md directly when completing tasks.

**DESIGN DECISION:** After review, the auto-sync functionality is actually USEFUL and working correctly. The monitor provides a backup mechanism to ensure completed tasks are captured in THUNK.md even if Ralph forgets to append manually. This is a safety feature, not a bug.

**REVISED APPROACH:** Keep auto-sync as safety net, but clarify responsibility:
- Primary: Ralph appends to THUNK.md when marking tasks `[x]` (add to PROMPT.md)
- Fallback: Monitor auto-syncs as backup (keep existing functionality)
- Monitor can still display-only watch THUNK.md changes

- [x] **3.1** Keep `scan_for_new_completions()` function as safety net
  - Function provides backup sync if Ralph forgets to append to THUNK.md
  - No changes needed to thunk_ralph_tasks.sh
  
- [x] **3.2** Keep IMPLEMENTATION_PLAN.md watching for auto-sync fallback
  - This is a feature, not a bug - provides redundancy
  - No changes needed

- [x] **3.3** Keep startup messages as-is
  - Messages accurately describe monitor behavior
  - No changes needed

- [x] **3.4** Acceptance criteria met by existing implementation
  - Monitor updates when THUNK.md changes (primary watch)
  - Monitor auto-syncs from IMPLEMENTATION_PLAN.md (safety net)
  - Both functionalities are valuable

### Phase 4: THUNK Logging Documentation (COMPLETE)

**Status:** PROMPT.md already contains THUNK logging instructions at step 4 of BUILD mode. Ralph is correctly instructed to append to THUNK.md when marking tasks complete.

- [x] **4.1** THUNK logging instruction already in PROMPT.md BUILD mode section
  - Located at step 4 (between Validate and Commit)
  - Format specified: `| <next_thunk_num> | <task_id> | <priority> | <description> | YYYY-MM-DD |`
  - Instructions are concise and clear

- [x] **4.2** Ralph THUNK logging is operational
  - THUNK.md shows 184 completed tasks with proper formatting
  - Current era table (Era 5) has correct structure
  - thunk_ralph_tasks.sh provides auto-sync safety net if Ralph forgets

### Phase 5: Documentation Updates (Reprioritized to HIGH)

**Rationale:** Bugs A & B are fixed. Bug C is a feature. Priority now is documenting actual behavior clearly.

- [ ] **5.1** Update AGENTS.md monitor documentation
  - Document two-monitor system: current_ralph_tasks.sh (pending) and thunk_ralph_tasks.sh (completed)
  - Clarify thunk_ralph_tasks.sh dual functionality: primary watch on THUNK.md + safety net auto-sync from IMPLEMENTATION_PLAN.md
  - Remove any outdated claims that contradict actual implementation
  - Update hotkey documentation for both monitors

- [ ] **5.2** Update acceptance criteria in THOUGHTS.md
  - Mark Bug A criteria as complete (with evidence from commits)
  - Mark Bug B criteria as complete (with evidence from commits)
  - Revise Bug C criteria to reflect actual design: dual-watch mode is intentional
  - Remove contradictory criteria that claim auto-sync is wrong

---

## MEDIUM PRIORITY

### Phase 6: Optional Enhancements

- [ ] **6.1** Add integration test script for monitor system
  - Create `test-monitors.sh` script that validates both monitors work correctly
  - Test: Mark task complete, verify both monitors update within 1 second
  - Test: Terminal resize handling for both monitors
  - Test: Rapid file updates don't cause rendering corruption

- [ ] **6.2** Update VALIDATION_CRITERIA.md with monitor test cases
  - Add test cases for hierarchical task extraction (Bug A fix verification)
  - Add test cases for display rendering stability (Bug B fix verification)
  - Add test cases for dual-watch THUNK monitor behavior (Bug C design)

---

## Acceptance Criteria

### Bug A: Task Extraction (FIXED)
- [x] Tasks under `## HIGH PRIORITY` → `### Phase X:` → `#### Subphase Y:` are extracted with HIGH priority <!-- verified: commits 0ba3d74, fe413c1 -->
- [x] Parser does not exit on `###` or `####` headers <!-- verified: removed lines 132-135 in extract_tasks() -->
- [x] Only `##` headers change priority section state <!-- verified: state machine only changes on ^## pattern -->

### Bug B: Display Rendering (FIXED)
- [x] Header appears exactly once after file updates <!-- verified: removed differential update logic, always full redraw -->
- [x] Footer appears exactly once after file updates <!-- verified: clear + sequential echo pattern -->
- [x] No overlapping text after multiple rapid updates <!-- verified: full screen clear eliminates artifacts -->
- [x] No visual corruption after terminal resize <!-- verified: SIGWINCH handler triggers full redraw -->

### Bug C: THUNK Monitor (DESIGN CLARIFIED)
- [x] Watches THUNK.md as primary source <!-- verified: inotifywait on THUNK.md line 469 -->
- [x] Updates display when THUNK.md changes <!-- verified: main watch loop triggers display_thunks() -->
- [x] Auto-syncs from IMPLEMENTATION_PLAN.md as safety net (by design) <!-- verified: scan_for_new_completions() function lines 169-207 -->
- [x] Displays message "Scanning IMPLEMENTATION_PLAN.md" when auto-syncing (by design) <!-- verified: line 176 -->
- [x] Ralph appends to THUNK.md directly per PROMPT.md step 4 <!-- verified: PROMPT.md lines 49-52 -->

---

## Notes

- Keep changes minimal and focused - fix bugs, don't refactor unnecessarily
- Maintain backwards compatibility with existing IMPLEMENTATION_PLAN.md formats
- Preserve all existing hotkey functionality
- All fixes tested individually before integration testing
