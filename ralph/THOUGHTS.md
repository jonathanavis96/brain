# THOUGHTS - Monitor Bug Fixes

## Problem Statement

Three critical bugs in the Ralph monitoring system:

1. **current_ralph_tasks.sh shows wrong tasks** - Parser exits on `###` headers, missing tasks under Phase subsections
2. **Display rendering corrupted** - Duplicate headers/footers due to startup messages + differential updates
3. **thunk_ralph_tasks.sh watches wrong file** - Auto-syncs from IMPLEMENTATION_PLAN.md instead of just watching THUNK.md

## Root Cause Analysis

### Bug A: Task Extraction Exits on `###`

**Location:** `current_ralph_tasks.sh` `extract_tasks()` function

**Issue:** Current logic:
```bash
elif [[ "$line" =~ ^###[[:space:]]+ ]]; then
    in_task_section=false  # BUG: exits on ANY ### header
fi
```

When parser hits `### Phase 4:` under `## HIGH PRIORITY`, it doesn't contain "HIGH PRIORITY" literal text, so it exits the task section. All subsequent `- [ ]` lines under that phase are ignored.

**Document structure:**
```markdown
## HIGH PRIORITY           ← Enters section (has "HIGH PRIORITY")
### Phase 4: ...           ← BUG: Exits section (matches ^###)
#### Phase 4A: ...         
- [ ] P4A.1 Task...        ← SKIPPED!
#### Phase 4B: ...
- [ ] P4B.1 Task...        ← SKIPPED!
```

**Fix:** Only exit on `##` (major sections), not `###` or `####` (subsections).

### Bug B: Display Rendering Duplicates

**Location:** `current_ralph_tasks.sh` display logic

**Issue chain:**
1. Startup messages ("Starting Ralph Task Monitor...") occupy rows 0-3
2. `display_tasks()` uses `tput cup 0 0` assuming row 0 is empty
3. Differential update logic (`ROW_CONTENT` cache) tracks wrong row positions
4. Result: Headers render multiple times, footers accumulate

**Fix:** 
- Add `clear` after startup messages before first render
- Always do full redraw (remove differential update path)
- Simple is robust

### Bug C: thunk_ralph_tasks.sh Auto-Sync

**Location:** `thunk_ralph_tasks.sh` `scan_for_new_completions()` function

**Issue:** Script watches IMPLEMENTATION_PLAN.md and tries to sync `[x]` tasks to THUNK.md. This is:
1. Redundant - Ralph should append to THUNK.md directly
2. Confusing - Output says "Scanning IMPLEMENTATION_PLAN.md"
3. Wrong responsibility - Monitor should only display, not modify

**Fix:**
- Remove auto-sync logic entirely
- Watch ONLY THUNK.md
- Ralph appends to THUNK.md when completing tasks (add instruction to PROMPT.md)

## Design Decisions

### D1: Section Parsing State Machine

Simple two-variable state:
- `in_task_section` (bool) - Are we inside a priority section?
- `current_priority` (string) - "HIGH" / "MEDIUM" / "LOW" / ""

Transitions:
- `## HIGH PRIORITY` → in_task_section=true, current_priority="HIGH"
- `## MEDIUM PRIORITY` → in_task_section=true, current_priority="MEDIUM"  
- `## LOW PRIORITY` → in_task_section=true, current_priority="LOW"
- `## <anything else>` → in_task_section=false, current_priority=""
- `### ` or `#### ` → NO STATE CHANGE (subsections stay in parent context)
- `- [ ] Task` when in_task_section → extract with current_priority

### D2: Display Strategy

Always full redraw:
```bash
display_tasks() {
    clear
    tput cup 0 0
    # draw header
    # draw tasks
    # draw footer
}
```

No row cache. No differential updates. Parsing 100 tasks takes <50ms - imperceptible.

### D3: THUNK Responsibility Split

- **Ralph:** Appends to THUNK.md when marking task `[x]` in IMPLEMENTATION_PLAN.md
- **thunk_ralph_tasks.sh:** Only watches and displays THUNK.md content
- **No auto-sync:** Monitor doesn't modify files, only displays

## THUNK.md Format Fix

Current format has alignment issues. New format:

```markdown
|THUNK # | TASK ID | Priority | Date       | Time     | Description
|--------|---------|----------|------------|----------|------------------------------
|   1    | P4B.1   | HIGH     | 2026-01-18 | 21:45:00 | Implement line-count tracking
```



Include both date AND time for completion tracking.
