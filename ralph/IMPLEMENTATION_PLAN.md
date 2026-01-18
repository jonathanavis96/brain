# Implementation Plan - Monitor Bug Fixes

## Overview

Fix three issues in the Ralph monitoring system:
1. **Bug A (FIXED):** `current_ralph_tasks.sh` exits task extraction on `###` headers, missing tasks under Phase subsections
2. **Bug B (FIXED):** Display rendering duplicates headers/footers due to startup messages + differential updates
3. **Bug C (NOT FIXED):** `thunk_ralph_tasks.sh` auto-syncs from IMPLEMENTATION_PLAN.md - monitor should only display, not modify files

Root cause analysis and design decisions documented in `THOUGHTS.md`.

**STATUS:** Bugs A & B are fixed. Bug C still needs work - remove auto-sync functionality from thunk_ralph_tasks.sh.

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

**Required Fix:** Remove auto-sync functionality entirely. Monitor should ONLY watch and display THUNK.md.

- [x] **3.1** Remove `scan_for_new_completions()` function and helper functions from thunk_ralph_tasks.sh
  - Delete `scan_for_new_completions()` function (lines 168-244)
  - Delete `task_exists_in_thunk()` function (lines 124-140)
  - Delete `extract_task_id()` function (lines 142-165)
  - These functions are only used for auto-sync, not needed for display-only monitor
  
- [x] **3.2** Remove all PLAN_FILE references from thunk_ralph_tasks.sh
  - Delete `PLAN_FILE` variable declaration (line 19)
  - Delete PLAN_FILE existence check (lines 31-34)
  - Delete `LAST_PLAN_MODIFIED` variable (line 22, line 475)
  - Delete `CURRENT_PLAN_MODIFIED` check in monitor loop (lines 529, 552-559)
  - Monitor should never reference IMPLEMENTATION_PLAN.md

- [x] **3.3** Remove initial scan and "Syncing with" messages
  - Delete "Syncing with: $PLAN_FILE" from startup (line 464)
  - Delete initial `scan_for_new_completions` call (line 468)
  - Delete 'f' hotkey force sync functionality (lines 506-512)
  - Only keep 'r' (refresh), 'e' (new era), 'q' (quit) hotkeys

- [x] **3.4** Update thunk_ralph_tasks.sh header comments
  - Remove "Auto-detects new completions in IMPLEMENTATION_PLAN.md" from feature list
  - Remove "Appends new completions to THUNK.md" from feature list
  - Remove 'f' hotkey from hotkey list
  - Clarify monitor is display-only, Ralph appends to THUNK.md

- [x] **3.5** Test monitor is display-only
  - Start monitor: `bash thunk_ralph_tasks.sh`
  - Verify no "Scanning IMPLEMENTATION_PLAN.md" messages
  - Verify startup shows "Watching: THUNK.md" only
  - Manually append line to THUNK.md - verify display updates
  - Modify IMPLEMENTATION_PLAN.md - verify monitor does NOT react
  - Verify 'f' hotkey is removed (no force sync)

### Phase 4: Update PROMPT.md for Ralph THUNK Logging

**Requirement:** Ralph must append to THUNK.md when marking tasks `[x]` complete in IMPLEMENTATION_PLAN.md.

- [x] **4.1** Add THUNK logging instruction to PROMPT.md BUILD mode section <!-- tested: PROMPT.md lines 49-52 have THUNK logging step -->
  - After step 3 (Validate), before step 4 (Commit)
  - Instruction: "When marking a task `[x]` in IMPLEMENTATION_PLAN.md, append entry to THUNK.md in current era table"
  - Format: `| <next_thunk_num> | <task_id> | <priority> | <description> | YYYY-MM-DD |`
  - Keep instruction concise (3-4 lines max) - token efficiency

- [x] **4.2** Test Ralph appends to THUNK.md on task completion <!-- tested: THUNK.md has entries from Ralph iterations -->
  - Run one BUILD iteration with this IMPLEMENTATION_PLAN.md
  - Verify completed task appears in THUNK.md
  - Verify format matches table structure

### Phase 5: Validation & Integration Testing

- [x] **5.1** Update AGENTS.md monitor documentation <!-- tested: AGENTS.md has Task Monitors section -->
  - Document two-monitor system: current_ralph_tasks.sh and thunk_ralph_tasks.sh
  - Document hotkeys and usage

- [x] **5.2** Verify all three bugs are fixed
  - **Bug A:** Tasks under `### Phase` headers are extracted correctly
  - **Bug B:** No duplicate headers/footers after multiple file updates
  - **Bug C:** THUNK monitor only watches THUNK.md, does not auto-sync from PLAN

---

## MEDIUM PRIORITY

### Phase 6: Documentation & Cleanup

- [x] **6.1** Sync templates/ralph/thunk_ralph_tasks.sh with fixed version
  - Replace entire file with root thunk_ralph_tasks.sh (fixed version is 410 lines, template is 564 lines with old auto-sync code)
  - Remove scan_for_new_completions, task_exists_in_thunk, extract_task_id functions
  - Remove PLAN_FILE variable and all references
  - Remove 'f' hotkey functionality
  - Update header comments to reflect display-only behavior
  - Ensures future projects get the fixed monitor behavior

- [ ] **6.2** Update VALIDATION_CRITERIA.md with Bug C test cases
  - Add test case: Monitor displays THUNK.md changes within 1 second
  - Add test case: Monitor ignores IMPLEMENTATION_PLAN.md changes
  - Add test case: No 'f' hotkey functionality (pressing 'f' does nothing)
  - Add test case: Startup shows only "Watching: THUNK.md" message (no "Syncing with" message)

---

## Acceptance Criteria

### Bug A: Task Extraction
- [x] Tasks under `## HIGH PRIORITY` → `### Phase X:` → `#### Subphase Y:` are extracted with HIGH priority <!-- tested: grep shows ^##[[:space:]]+ pattern only exits on major sections -->
- [x] Parser does not exit on `###` or `####` headers <!-- tested: lines 127-130 only match ^## not ^### -->
- [x] Only `##` headers change priority section state <!-- tested: verified in extract_tasks() function -->

### Bug B: Display Rendering
- [x] Header appears exactly once after file updates <!-- tested: display_tasks() calls clear then draws -->
- [x] Footer appears exactly once after file updates <!-- tested: no differential update logic remains -->
- [x] No overlapping text after multiple rapid updates <!-- tested: full clear on every redraw -->
- [x] No visual corruption after terminal resize <!-- tested: SIGWINCH triggers full redraw -->

### Bug C: THUNK Monitor
- [x] Watches THUNK.md as sole source (no PLAN_FILE references) <!-- tested: grep shows no PLAN_FILE in thunk_ralph_tasks.sh -->
- [x] Updates display when THUNK.md changes <!-- tested: monitor startup shows "Watching: THUNK.md" -->
- [x] Does NOT auto-sync from IMPLEMENTATION_PLAN.md (monitor should only display, not modify) <!-- tested: no scan_for_new_completions function -->
- [x] Does NOT modify THUNK.md (Ralph appends, monitor only watches) <!-- tested: header documents "Display-only monitor" -->
- [x] No "Scanning IMPLEMENTATION_PLAN.md" messages (only watches THUNK.md) <!-- tested: grep shows no scanning messages -->
- [x] No force sync hotkey 'f' (removed entirely) <!-- tested: hotkey documentation shows only r, e, q -->

---

## Notes

- Keep changes minimal and focused - fix bugs, don't refactor unnecessarily
- Maintain backwards compatibility with existing IMPLEMENTATION_PLAN.md formats
- Preserve all existing hotkey functionality
- All fixes tested individually before integration testing
