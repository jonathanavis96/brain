# Implementation Plan - Monitor Bug Fixes

## Overview

Fix three critical bugs in the Ralph monitoring system:
1. **Bug A:** `current_ralph_tasks.sh` exits task extraction on `###` headers, missing tasks under Phase subsections
2. **Bug B:** Display rendering duplicates headers/footers due to startup messages + differential updates
3. **Bug C:** `thunk_ralph_tasks.sh` auto-syncs from IMPLEMENTATION_PLAN.md instead of just watching THUNK.md

Root cause analysis and design decisions documented in `THOUGHTS.md`.

---

## HIGH PRIORITY

### Phase 1: Fix Task Extraction Parser (Bug A)

**Root Cause:** Parser uses `^###[[:space:]]+` pattern to exit task sections. When it hits `### Phase 4:` under `## HIGH PRIORITY`, it exits extraction even though we're still in a priority section.

- [ ] **1.1** Fix section detection logic in `current_ralph_tasks.sh` `extract_tasks()` function
  - Remove the `elif [[ "$line" =~ ^###[[:space:]]+ ]]; then in_task_section=false` block (lines 132-135)
  - Only change state on `##` (double hash) headers, not `###` or `####` subsection headers
  - Test: Tasks under `## HIGH PRIORITY` → `### Phase 4:` → `#### Phase 4A:` must be extracted with HIGH priority

### Phase 2: Fix Display Rendering (Bug B)

**Root Cause:** Startup messages occupy screen rows before first render. `display_tasks()` uses `tput cup 0 0` assuming row 0 is empty. Differential update logic tracks wrong row positions, causing duplicated headers/footers.

- [ ] **2.1** Remove differential update complexity from `current_ralph_tasks.sh` `display_tasks()`
  - Remove `force_full_redraw` parameter logic (lines 378, 519-526)
  - Remove `TASK_DISPLAY_ROWS`, `LAST_RENDERED_CONTENT`, `LAST_FOOTER_*` tracking (lines 36-41, 569-580)
  - Always do full redraw: `clear` at start of function, then render all content
  - Simpler = more robust. Parsing 100 tasks takes <50ms - imperceptible to humans

- [ ] **2.2** Simplify display rendering to always clear screen before drawing
  - Replace lines 527-566 (conditional rendering) with simple sequential echo statements
  - Pattern: `clear` → loop over content → echo each line
  - Remove all `tput cup $row $col` cursor positioning logic (only needed for differential updates)
  
- [ ] **2.3** Test display rendering with multiple file updates
  - Modify IMPLEMENTATION_PLAN.md 5 times rapidly
  - Verify no duplicate headers, no duplicate footers, no text corruption
  - Verify terminal resize (SIGWINCH) works correctly

### Phase 3: Fix THUNK Monitor Auto-Sync (Bug C)

**Root Cause:** `thunk_ralph_tasks.sh` watches IMPLEMENTATION_PLAN.md and tries to sync `[x]` tasks to THUNK.md. This is wrong - Ralph should append to THUNK.md directly when completing tasks.

- [ ] **3.1** Remove `scan_for_new_completions()` function from `thunk_ralph_tasks.sh`
  - Delete function definition (lines 167-244)
  - Remove all calls to this function (lines 468, 508, 555)
  - This function parses IMPLEMENTATION_PLAN.md and writes to THUNK.md - wrong responsibility

- [ ] **3.2** Remove IMPLEMENTATION_PLAN.md watching from `thunk_ralph_tasks.sh`
  - Remove `PLAN_FILE` variable and references (lines 465, 552-559)
  - Remove `LAST_PLAN_MODIFIED` / `CURRENT_PLAN_MODIFIED` tracking
  - Only watch THUNK.md file changes

- [ ] **3.3** Remove "Syncing with:" message from startup
  - Update line 464 to only show "Watching: $THUNK_FILE"
  - Remove reference to PLAN_FILE

- [ ] **3.4** Test THUNK monitor watches only THUNK.md
  - Append line to THUNK.md manually → verify monitor updates display
  - Modify IMPLEMENTATION_PLAN.md → verify monitor does NOT react
  - No "Scanning IMPLEMENTATION_PLAN.md" messages should appear

### Phase 4: Update PROMPT.md for Ralph THUNK Logging

**Requirement:** Ralph must append to THUNK.md when marking tasks `[x]` complete in IMPLEMENTATION_PLAN.md.

- [ ] **4.1** Add THUNK logging instruction to PROMPT.md BUILD mode section
  - After step 3 (Validate), before step 4 (Commit)
  - Instruction: "When marking a task `[x]` in IMPLEMENTATION_PLAN.md, append entry to THUNK.md in current era table"
  - Format: `| <next_thunk_num> | <task_id> | <priority> | <description> | YYYY-MM-DD |`
  - Keep instruction concise (3-4 lines max) - token efficiency

- [ ] **4.2** Test Ralph appends to THUNK.md on task completion
  - Run one BUILD iteration with this IMPLEMENTATION_PLAN.md
  - Verify completed task appears in THUNK.md
  - Verify format matches table structure

### Phase 5: Validation & Integration Testing

- [ ] **5.1** Integration test: Run both monitors simultaneously
  - Launch `current_ralph_tasks.sh` in one terminal
  - Launch `thunk_ralph_tasks.sh` in another terminal
  - Mark task `[x]` in IMPLEMENTATION_PLAN.md
  - Verify: current_ralph_tasks.sh updates immediately (shows remaining tasks)
  - Verify: THUNK.md gets new entry (Ralph appended it)
  - Verify: thunk_ralph_tasks.sh updates immediately (shows new THUNK entry)

- [ ] **5.2** Verify all three bugs are fixed
  - **Bug A:** Tasks under `### Phase` headers are extracted correctly
  - **Bug B:** No duplicate headers/footers after multiple file updates
  - **Bug C:** THUNK monitor only watches THUNK.md, does not auto-sync from PLAN

---

## MEDIUM PRIORITY

### Phase 6: Documentation Updates

- [ ] **6.1** Update AGENTS.md monitor documentation
  - Update "Task Monitor" section with correct behavior descriptions
  - Remove any references to auto-sync functionality
  - Document that Ralph appends to THUNK.md directly

- [ ] **6.2** Update VALIDATION_CRITERIA.md
  - Add test cases for hierarchical task extraction (Bug A fix)
  - Add test cases for display rendering stability (Bug B fix)
  - Add test cases for THUNK monitor watch-only behavior (Bug C fix)

---

## Acceptance Criteria

### Bug A: Task Extraction
- [x] Tasks under `## HIGH PRIORITY` → `### Phase X:` → `#### Subphase Y:` are extracted with HIGH priority
- [x] Parser does not exit on `###` or `####` headers
- [x] Only `##` headers change priority section state

### Bug B: Display Rendering
- [x] Header appears exactly once after file updates
- [x] Footer appears exactly once after file updates
- [x] No overlapping text after multiple rapid updates
- [x] No visual corruption after terminal resize

### Bug C: THUNK Monitor
- [x] Watches ONLY THUNK.md
- [x] Updates display when THUNK.md changes
- [x] Does NOT watch IMPLEMENTATION_PLAN.md
- [x] Does NOT modify any files (display only)
- [x] No "Scanning IMPLEMENTATION_PLAN.md" messages

---

## Notes

- Keep changes minimal and focused - fix bugs, don't refactor unnecessarily
- Maintain backwards compatibility with existing IMPLEMENTATION_PLAN.md formats
- Preserve all existing hotkey functionality
- All fixes tested individually before integration testing
