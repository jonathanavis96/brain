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

---

## CodeRabbit Review Fixes (2026-01-19)

PR #4 review identified 26 actionable fixes. Analysis in `CODERABBIT_REVIEW_ANALYSIS.md`.

### Bug Fixes Required

1. **render_ac_status.sh:31** - WARN regex `^[0-9]+` won't match `WARN: 6`
   - Root cause: Regex anchored to start of line but WARN count isn't at start
   - Fix: Change to `[0-9]+` (unanchored)

2. **render_ac_status.sh:113** - Missing end marker guard
   - Root cause: awk script assumes `<!-- AC_STATUS_END -->` exists
   - Risk: If marker missing, awk eats rest of file
   - Fix: Add guard check before awk

3. **loop.sh:639-655** - Subshell variable assignment bug
   - Root cause: `( cmd && var=true )` runs in subshell, parent var unchanged
   - Symptom: Fallback message shown even when monitors launch successfully
   - Fix: Remove subshells, use direct if statements

### Dead Code Removal

4. **thunk_ralph_tasks.sh:125** - `in_era` variable set but never read
5. **loop.sh:583-589** - `ready_signal` assigned but never used
6. **templates/ralph/loop.sh:583-612** - Same `ready_signal` dead code

### Shellcheck SC2155 Fixes

`local var=$(cmd)` masks command exit status. Split declaration and assignment.

7. **thunk_ralph_tasks.sh:165-168**
8. **current_ralph_tasks.sh:144**
9. **loop.sh:481**
10. **templates/ralph/loop.sh:481**

### Terminology Fixes (kb→skills)

11. **pr-batch.sh:116-118** - "Knowledge Base (kb/)" → "Skills (skills/)"
12. **templates/ralph/pr-batch.sh:117-118** - Same fix
13. **generators/generate-neurons.sh:431-434** - "Brain KB patterns" → "Brain Skills patterns"
14. **templates/python/AGENTS.project.md:26-31** - "KB file" → "skill file"

### Documentation/Help Text

15. **loop.sh:162-164** - Model version `20250620` → `20250929`
16. **templates/ralph/loop.sh:162-164** - Same fix
17. **loop.sh usage** - Document `--model auto` option
18. **PROMPT.md:61** - Add markdown fence language tag

### Refactoring (Optional but Recommended)

19. **loop.sh:644-675** - Extract `launch_in_terminal()` helper (DRY)
20. **current_ralph_tasks.sh:305-320** - Use process substitution `< <(...)` 
21. **thunk_ralph_tasks.sh:191-206** - Same process substitution fix

### Wording/Style

22-26. Various minor wording tweaks in PROMPT.md, templates, etc.

### Skipped Items (archived code)

- All `old_sh/test-rovodev-integration.sh` issues - archived deprecated code
- AC.rules "fragility" concerns - intentional pattern testing
