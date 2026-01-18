# THOUGHTS - Ralph Loop & Monitor Improvements

## Document Purpose

This document captures the analysis, design decisions, and architectural choices for fixing the Ralph loop and monitor scripts. It serves as the rationale behind the IMPLEMENTATION_PLAN.md tasks.

---

## Problem Summary

Nine interconnected issues require resolution:

1. **:::COMPLETE::: detection fails** — Loop continues despite completion signal
2. **Lost verification tasks** — Two critical tasks removed from plan need restoration
3. **current_ralph_tasks.sh UX issues** — Blank screen, slow refresh, bottom-anchored display
4. **thunk_ralph_tasks.sh performance** — Full regeneration instead of incremental updates
5. **THUNK scanner wrong source** — Scans IMPLEMENTATION_PLAN.md instead of THUNK.md
6. **Vague task descriptions** — "Test" tasks lack actionable detail
7. **Monitor launch errors** — gnome-terminal DBus errors on startup
8. **Monitor coupling to plan mode** — Updates only trigger during planning iterations
9. **Startup behavior** — Monitors should launch immediately with graceful fallback

---

## Root Cause Analysis

### 1. :::COMPLETE::: Detection Failure

**Current Implementation (loop.sh lines 505-514):**
```bash
if sed 's/\x1b\[[0-9;]*m//g' "$log" | grep -qE '^\s*:::COMPLETE:::\s*$'; then
    return 42  # Special return code for completion
fi
```

**Problem:** The detection logic is correct, but the return value capture is broken.

#### Phase 0: Exact Bug Location (loop.sh lines 600-610)

```bash
# THE BUG - alternating plan/build path (lines 600-610):
    if [[ "$i" -eq 1 ]] || (( PLAN_EVERY > 0 && ( (i-1) % PLAN_EVERY == 0 ) )); then
      run_once "$PLAN_PROMPT" "plan" "$i"
    else
      run_once "$BUILD_PROMPT" "build" "$i"
    fi
    # Check if Ralph signaled completion
    if [[ $? -eq 42 ]]; then  # <-- BUG: $? is exit code of if/else, NOT run_once!
      echo ""
      echo "Loop terminated early due to completion."
      break
    fi
```

**Why it fails:** The `if/else` construct itself returns an exit code (0 when the conditional succeeds). This **overwrites** the return value from `run_once` before `$?` is checked. So `$?` always reflects the `if` statement's success (0), not the function's return (42).

**Note:** The custom prompt path (lines 582-588) does NOT have this bug because `run_once` is called directly without a wrapping conditional.

**Root Cause:** Shell variable `$?` is ephemeral — the if/else construct between `run_once` and the check overwrites it.

#### Exit Code Contract

| Exit Code | Meaning | Action |
|-----------|---------|--------|
| `0` | Normal completion (task done, more work remains) | Continue loop |
| `42` | `:::COMPLETE:::` detected (all tasks done) | Exit loop gracefully |
| Other | Error / unexpected failure | Continue (let set -e handle if fatal) |

**Note:** Exit code 42 is chosen because it's outside the standard Unix range (0-2 typical, 126-128 reserved). No other part of loop.sh uses 42.

---

### 2. Lost Verification Tasks

Two tasks were removed during plan consolidation:

| Task | Purpose |
|------|---------|
| Verify new structure exists | Confirm kb→skills migration directories exist |
| Verify deleted directories gone | Confirm stale directories were removed |

**Root Cause:** Manual plan editing without validation checklist.

---

### 3. current_ralph_tasks.sh UX Issues

**Blank Screen Problem:**
- `display_tasks()` calls `clear` at line 328
- Then performs full parsing of IMPLEMENTATION_PLAN.md (expensive)
- Screen stays blank during parsing

**Full Regeneration Problem:**
- Every refresh re-parses entire file
- Completed tasks (stable) are re-processed unnecessarily
- No caching mechanism exists

**Bottom-Anchored Display:**
- `clear` clears screen but doesn't position cursor
- Long task lists scroll, leaving user at bottom

**Missing Current Task Indicator:**
- Uses `○` for all pending tasks
- No visual distinction for "currently being worked on"

---

### 4. thunk_ralph_tasks.sh Performance

**Current Flow:**
1. On any file change, calls `scan_for_new_completions()` (lines 342-343)
2. `scan_for_new_completions()` reads ENTIRE IMPLEMENTATION_PLAN.md
3. For EACH completed task, checks if exists in THUNK.md
4. Then calls `display_thunks()` which reads ENTIRE THUNK.md

**Problem:** O(n×m) complexity where n=tasks in plan, m=tasks in thunk.

---

### 5. THUNK Scanner Wrong Source

**Current Behavior (lines 148-216):**
- `scan_for_new_completions()` scans `IMPLEMENTATION_PLAN.md`
- Extracts `[x]` tasks and appends to THUNK.md
- This is the SYNC operation, not the DISPLAY operation

**Actual Issue:** The scanner IS scanning the right file for its purpose (syncing completions). The DISPLAY should only read THUNK.md — which it does. But the scanner runs on EVERY plan file change, which is correct.

**Real Problem:** The thunk monitor's DISPLAY rebuilds from scratch instead of incrementally showing new lines. When IMPLEMENTATION_PLAN.md changes, it re-scans everything.

---

### 6. Vague Task Descriptions

**Example from tasks 26-30:**
```
✓ Task 26: T6.1 Test
✓ Task 27: T6.2 Test
✓ Task 28: T6.3 Test
```

**Source Analysis:**
The `generate_title()` function truncates at first colon:
```bash
if [[ "$rest" =~ ^([^:.]+)[:.] ]]; then
    rest="${BASH_REMATCH[1]}"
```

If task is: `**T6.1** Test: Mark a task [x] in IMPLEMENTATION_PLAN.md → verify it appears in THUNK.md`
The title becomes: `Test` (truncated at colon)

**Root Cause:** Title extraction regex is too aggressive on colons.

---

### 7. Monitor Launch Errors

**Error Message:**
```
Error constructing proxy for org.gnome.Terminal:/org/gnome/Terminal/Factory0: 
Error calling StartServiceByName for org.gnome.Terminal: 
Process org.gnome.Terminal exited with status 1
```

**Current Implementation (lines 527-528):**
```bash
if command -v gnome-terminal &>/dev/null; then
    gnome-terminal --title="Current Ralph Tasks" -- bash "$monitor_dir/current_ralph_tasks.sh" &
```

**Problem:** `command -v gnome-terminal` returns true (binary exists) but gnome-terminal fails to launch (DBus/display issues in WSL or headless environments).

**Root Cause:** Presence check ≠ functionality check.

---

### 8. Monitor Coupling to Plan Mode

**Observed Behavior:** Thunk monitor only shows updates when planning mode runs.

**Analysis:** This is NOT a code coupling issue. The thunk monitor watches BOTH files:
```bash
if [[ "$CURRENT_PLAN_MODIFIED" != "$LAST_PLAN_MODIFIED" ]]; then
    # Auto-sync when IMPLEMENTATION_PLAN.md changes
    scan_for_new_completions
```

**Real Issue:** In BUILD mode, Ralph may not modify IMPLEMENTATION_PLAN.md at all (only code files). The thunk monitor correctly waits for plan changes to sync.

However, THUNK.md could be modified directly by other processes, and the monitor DOES watch for that:
```bash
if [[ "$CURRENT_THUNK_MODIFIED" != "$LAST_THUNK_MODIFIED" ]]; then
    display_thunks
```

**Actual Problem:** Perception issue — if no tasks are completed, no updates appear. This is correct behavior.

---

### 9. Startup Behavior

**Current Implementation:** Monitors launch at line 569, AFTER branch setup:
```bash
ensure_worktree_branch "$TARGET_BRANCH"
# Launch monitors before starting iterations
launch_monitors
```

**Problem:** Launch happens, but errors are printed inline with loop output, cluttering the display. No fallback instructions provided.

---

## Design Decisions

### A. Source-of-Truth Separation

```
┌─────────────────────────────────────────────────────────────┐
│                    SOURCE OF TRUTH                          │
├─────────────────────────────────────────────────────────────┤
│  IMPLEMENTATION_PLAN.md  →  Backlog (editable, rewritable)  │
│  THUNK.md                →  Event log (append-only)         │
├─────────────────────────────────────────────────────────────┤
│                    CONSUMERS                                │
├─────────────────────────────────────────────────────────────┤
│  current_ralph_tasks.sh  ←  Reads IMPLEMENTATION_PLAN.md    │
│  thunk_ralph_tasks.sh    ←  Reads THUNK.md                  │
│                          ←  Syncs FROM IMPLEMENTATION_PLAN  │
└─────────────────────────────────────────────────────────────┘
```

**Principle:** Each monitor has ONE primary source. The thunk monitor's sync operation is a WRITE to THUNK.md, not a display operation.

---

### B. Deterministic Stop Condition

**Strategy: Capture return code immediately**

```bash
run_once "$PLAN_PROMPT" "plan" "$i"
run_result=$?  # Capture IMMEDIATELY

# Now safe to echo or do other operations
echo "..."

if [[ $run_result -eq 42 ]]; then
    break
fi
```

**Alternative Considered:** File-based sentinel (write completion to a file).
**Rejected:** Adds filesystem state management; return code is simpler if captured correctly.

---

### C. Incremental/Append-Only Monitor Strategy

#### current_ralph_tasks.sh Approach:

1. **Cache completed tasks** — Store in memory/temp file after first parse
2. **Differential update** — On file change, only re-parse uncached sections
3. **Stable header** — Print header immediately, then populate content
4. **Cursor positioning** — Use `tput cup 0 0` to render from top

**Implementation Pattern:**
```
┌─────────────────────────────────────────────────────────────┐
│  First Load:                                                │
│    1. Parse full IMPLEMENTATION_PLAN.md                     │
│    2. Cache completed task hashes in COMPLETED_CACHE        │
│    3. Display all tasks                                     │
├─────────────────────────────────────────────────────────────┤
│  Subsequent Refresh:                                        │
│    1. Parse IMPLEMENTATION_PLAN.md                          │
│    2. For each task:                                        │
│       - If hash in COMPLETED_CACHE: skip parsing details    │
│       - If new completion: add to cache, display            │
│       - If pending: always re-check (might have changed)    │
│    3. Only redraw changed sections                          │
└─────────────────────────────────────────────────────────────┘
```

#### thunk_ralph_tasks.sh Approach:

1. **Track last-read line** — Remember line count of THUNK.md
2. **Tail-only parsing** — On change, read only NEW lines
3. **Append to display** — Don't clear, just add new entries

**Implementation Pattern:**
```
┌─────────────────────────────────────────────────────────────┐
│  First Load:                                                │
│    1. Parse full THUNK.md                                   │
│    2. Store LAST_LINE_COUNT                                 │
│    3. Display all thunks                                    │
├─────────────────────────────────────────────────────────────┤
│  Subsequent Change Detected:                                │
│    1. Get current line count                                │
│    2. If current > LAST_LINE_COUNT:                         │
│       - Read only lines from LAST_LINE_COUNT to end         │
│       - Append new thunks to display (no clear)             │
│       - Update LAST_LINE_COUNT                              │
│    3. If current < LAST_LINE_COUNT (file edited/truncated): │
│       - Full refresh (rare case)                            │
└─────────────────────────────────────────────────────────────┘
```

---

### D. Monitor Launch Strategy

**Priority Order:**
1. **tmux** (if inside tmux session) — Most reliable for WSL/headless
2. **Windows Terminal** (if wt.exe available) — Best for WSL2
3. **gnome-terminal** (with functionality test) — Linux desktop
4. **Manual fallback** — Print commands once, continue without monitors

**Functionality Test for gnome-terminal:**
```bash
if command -v gnome-terminal &>/dev/null; then
    # Test if it can actually launch (quick timeout)
    if timeout 2s gnome-terminal --version &>/dev/null; then
        # Actually functional
    fi
fi
```

**Fallback Message (printed ONCE):**
```
═══════════════════════════════════════════════════════════════
  ⚠️  Could not auto-launch monitor terminals.
  
  To run monitors manually, open new terminals and run:
    bash /path/to/ralph/current_ralph_tasks.sh
    bash /path/to/ralph/thunk_ralph_tasks.sh
═══════════════════════════════════════════════════════════════
```

---

### E. Current Task Indicator

**New Symbol Set:**
| Symbol | Meaning |
|--------|---------|
| `✓` | Completed |
| `▶` | Current/In-Progress (first unchecked task) |
| `○` | Pending (subsequent unchecked tasks) |

**Detection Logic:**
- First `[ ]` task encountered = current (mark with `▶`)
- All subsequent `[ ]` tasks = pending (mark with `○`)

---

### F. Task Description Formatting

**Current Problem:** Truncation at colon loses context.

**Solution:** Smarter truncation that preserves test context:

```bash
# For "Test:" prefixed tasks, include the object being tested
if [[ "$desc" =~ ^Test:[[:space:]]*(.+)$ ]]; then
    local test_target="${BASH_REMATCH[1]}"
    # Take up to → or first 50 chars
    if [[ "$test_target" =~ ^([^→]+)→ ]]; then
        echo "Test: ${BASH_REMATCH[1]}"
    else
        echo "Test: $(echo "$test_target" | cut -c1-50)"
    fi
fi
```

**Expected Output:**
```
Before: Test
After:  Test: Mark a task [x] in IMPLEMENTATION_PLAN.md
```

---

### G. Display Formatting (User Preference)

**Requirements:**
- Empty line between tasks
- Indentation for readability
- Priority section separators
- Different symbols for status

**Target Format:**
```
High Priority ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✓ Task 1: T1.1 Rename watch_ralph_tasks.sh → current_ralph_tasks.sh

  ▶ Task 2: T1.2 Update heading in current_ralph_tasks.sh

  ○ Task 3: T1.3 Verify current_ralph_tasks.sh filtering behavior

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Medium Priority ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Overlap Analysis

Several issues share root causes or solutions:

| Root Cause | Affected Issues | Single Fix Resolves |
|------------|-----------------|---------------------|
| Return code capture | #1 (:::COMPLETE:::) | Yes |
| Full file re-parsing | #3, #4, #8 | Incremental approach |
| Title truncation regex | #6 (vague tests) | Smarter extraction |
| Launch without test | #7 (gnome-terminal) | Functionality check |
| No caching | #3, #4 | Cache layer |

---

## Risk Assessment

| Change | Risk Level | Mitigation |
|--------|------------|------------|
| Return code capture | LOW | Simple variable assignment |
| Incremental parsing | MEDIUM | Keep full-refresh fallback |
| Launch detection | LOW | Fallback to manual |
| Title extraction | LOW | Only affects display |
| Display formatting | LOW | Pure presentation |

---

## Verification Strategy

Each fix requires specific verification:

1. **:::COMPLETE::: detection**
   - Test: Echo `:::COMPLETE:::` in mock log → loop exits
   - Test: No completion → loop continues

2. **Incremental monitors**
   - Test: Screen never goes blank during refresh
   - Test: Completed task cache persists across refreshes
   - Test: New task appears without full redraw

3. **Monitor launch**
   - Test: In tmux → tmux windows created
   - Test: In WSL without display → manual commands printed
   - Test: Ralph continues regardless of launch success

4. **Task formatting**
   - Test: "Test: X → expect Y" displays as "Test: X"
   - Test: Empty line between tasks visible
   - Test: Current task has `▶` symbol

---

### H. Test Task Format Standard

**Convention:** All test tasks must follow a clear, actionable format that specifies:
1. The action being performed
2. The expected observable outcome

**Format Pattern:**
```
Test: <action> → expect <observable outcome>
```

**Examples:**

✅ **Good (Clear & Actionable):**
```
Test: Mark task [x] in plan → expect task appears in THUNK.md
Test: Run loop.sh without completion marker → expect loop continues
Test: Add entry to THUNK.md → expect new entry appears without full redraw
Test: Modify IMPLEMENTATION_PLAN.md manually → expect monitor updates within 1 second
```

❌ **Bad (Vague, Not Actionable):**
```
Test
Test: Functionality
Test: Behavior verification
Test: Basic case
```

**Rationale:**
- **Prevents ambiguity** — Anyone reading the task knows exactly what to do and what success looks like
- **Enables automation** — Clear expectations can be scripted into test assertions
- **Improves debugging** — When a test fails, the expected outcome is explicit
- **Reduces token overhead** — Implementation plan remains self-documenting without requiring THOUGHTS.md lookups

**Title Extraction Behavior:**
When test tasks are displayed in monitors (current_ralph_tasks.sh, thunk_ralph_tasks.sh), the `generate_title()` function extracts the action portion:

```
Input:  Test: Mark task [x] in plan → expect task appears in THUNK.md
Output: Test: Mark task [x] in plan
```

This preserves context while keeping display concise (truncates at the `→` arrow).

**Enforcement:**
- All new test tasks in IMPLEMENTATION_PLAN.md must follow this format
- Existing vague test tasks should be rewritten when encountered
- Test tasks without clear expectations should be rejected during plan review

---

## Answers to Clarifying Questions

1. **When :::COMPLETE::: detected, should loop exit entirely?**
   → Yes, exit the entire run (stop iterating). This is a terminal state meaning "all tasks done."

2. **Where is :::COMPLETE::: written?**
   → Written to the log file by RovoDev via `script` command. Authoritative source is the iteration log file.

3. **THUNK.md location?**
   → Per-project file at `$RALPH_DIR/THUNK.md` (e.g., `brain/ralph/THUNK.md`).

4. **Preferred monitor launch order in WSL?**
   → tmux first (if in tmux session), then Windows Terminal (`wt.exe`), then gnome-terminal, then manual fallback.

5. **Monitor refresh: file change only or heartbeat?**
   → File change primary, with 0.5s poll interval as current. No additional heartbeat needed.

---

---

## Token Impact Assessment

**Does this require changes to AGENTS.md or PROMPT.md?**

**No.**

All fixes are contained within:
- `loop.sh` — Return code capture fix, monitor launch improvements
- `current_ralph_tasks.sh` — Display formatting, incremental updates
- `thunk_ralph_tasks.sh` — Incremental parsing, append-only display
- `IMPLEMENTATION_PLAN.md` — Restore lost verification tasks

**Rationale:**
- The :::COMPLETE::: detection is already documented in PROMPT.md (Ralph knows to emit it)
- Monitor behavior is independent of agent instructions
- Task formatting is pure presentation logic
- No new behaviors need to be communicated to RovoDev

If any AGENTS.md or PROMPT.md change becomes necessary during implementation, it will be:
1. Proposed as a specific <= 5 line edit
2. Justified as "required for correctness"
3. Documented here before implementation

---

## Next Steps

See IMPLEMENTATION_PLAN.md for the ordered task list implementing these decisions.
