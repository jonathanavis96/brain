# THOUGHTS.md - Active Project Specifications

This file contains specifications for current active work. Completed projects are removed.

---

# THUNK Monitor System

**Purpose:** Create a persistent completion log (`THUNK.md`) that tracks all completed tasks across all IMPLEMENTATION_PLAN.md iterations, with globally sequential task numbering.

**Runtime Context:**
- This feature extends the existing Ralph task monitoring system
- Monitors should auto-launch when `loop.sh` runs
- Must work for both brain repository and bootstrapped projects

---

## Core Concept

### The Problem
When IMPLEMENTATION_PLAN.md changes (new project phase, new THOUGHTS.md), completed tasks disappear from view. There's no persistent record of what Ralph has accomplished across plan iterations.

### The Solution
**THUNK.md** = permanent append-only log of all completed tasks.
- Tasks get "thunked" (moved from current tasks → completion log) when marked `[x]`
- Task numbers are globally sequential across all plan iterations
- Display is clearable for readability, but THUNK.md is never truncated

### Terminology
- **THUNK** = a completed task that has been logged to the persistent record
- **Current tasks** = uncompleted `[ ]` tasks in IMPLEMENTATION_PLAN.md
- **Era** = a logical grouping of tasks from a single plan phase (e.g., "KB→Skills Migration", "THUNK Monitor Implementation")

---

## Monitor Renames

| Old Name | New Name | New Heading |
|----------|----------|-------------|
| `watch_ralph_tasks.sh` | `current_ralph_tasks.sh` | `CURRENT RALPH TASKS` |
| (new) | `thunk_ralph_tasks.sh` | `THUNK RALPH TASKS` |

---

## THUNK.md Format

```markdown
# THUNK - Completed Task Log

Persistent record of all completed tasks across IMPLEMENTATION_PLAN.md iterations.

---

## Era: <Era Name>
Started: <YYYY-MM-DD>

| THUNK # | Original # | Priority | Description | Completed |
|---------|------------|----------|-------------|-----------|
| 1 | 1.1 | High | Run safety check for brain_staging dependencies | 2026-01-18 13:15 |
| 2 | 1.2 | High | Delete stale directories | 2026-01-18 13:16 |
| 3 | 1.3 | High | Verify current KB structure exists | 2026-01-18 13:17 |
...

## Era: <Next Era Name>
Started: <YYYY-MM-DD>

| THUNK # | Original # | Priority | Description | Completed |
|---------|------------|----------|-------------|-----------|
| 24 | 1.1 | High | Create thunk_ralph_tasks.sh monitor | 2026-01-19 10:00 |
...
```

### Field Definitions

| Field | Description |
|-------|-------------|
| THUNK # | Globally sequential number (never resets, always increments) |
| Original # | Task number from IMPLEMENTATION_PLAN.md (e.g., "1.1", "5.3") |
| Priority | High / Medium / Low (from section where task was found) |
| Description | Task description text |
| Completed | Timestamp when task was marked complete |

---

## Numbering Rules

### Global Sequential Numbering
- THUNK numbers are **globally sequential** across all eras
- If THUNK.md has 23 completed tasks (THUNK #1-23), the next completed task becomes THUNK #24
- When IMPLEMENTATION_PLAN.md changes with new tasks numbered 1-14, those become THUNK #24-37 when completed

### Example Flow
1. Era 1: "KB→Skills Migration" - Tasks 1.1 through 7.4 complete → THUNK #1-43
2. Era 2: "THUNK Monitor Implementation" - New plan has tasks 1.1 through 2.8
3. When task 1.1 completes → becomes THUNK #44
4. When task 1.2 completes → becomes THUNK #45
5. etc.

---

## Detection Mechanism

### How Completion is Detected
1. `thunk_ralph_tasks.sh` monitors IMPLEMENTATION_PLAN.md for `[x]` items
2. Compares against existing entries in THUNK.md (by description matching)
3. Any `[x]` item NOT already in THUNK.md gets appended with next sequential number
4. Original task number and priority are preserved from source

### Duplicate Prevention
- Match by **task description text** (normalized: trimmed, lowercased)
- If description already exists in THUNK.md → skip (don't re-add)
- This handles cases where IMPLEMENTATION_PLAN.md is regenerated with same completed tasks

---

## Monitor Display Formatting (Human-Optimized)

The monitors must transform LLM-optimized task format into human-readable display.

### Two Formats (Important!)

**1. IMPLEMENTATION_PLAN.md (LLM-optimized) — DO NOT CHANGE**
```markdown
- [ ] **T1.1** Rename `watch_ralph_tasks.sh` → `current_ralph_tasks.sh`:
- [ ] **T1.2** Update heading in `current_ralph_tasks.sh` from `RALPH TASK MONITOR` → `CURRENT RALPH TASKS`
- [ ] **T1.3** Verify `current_ralph_tasks.sh` only shows `[ ]` items (already excludes `[x]` - confirm behavior)
```
This format is efficient for Ralph (LLM) to parse and execute. Keep it as-is.

**2. Monitor Display (Human-optimized) — TRANSFORM FOR DISPLAY**
```
Task 1 — Rename script
  ○ Rename watch_ralph_tasks.sh → current_ralph_tasks.sh

Task 2 — Update title
  ○ In current_ralph_tasks.sh, change the heading from RALPH TASK MONITOR →
    CURRENT RALPH TASKS

Task 3 — Confirm output
  ○ Make sure current_ralph_tasks.sh only lists unchecked tasks ([ ])
  ○ It should already hide completed ones ([x]) — just confirm it's working
```

### Transformation Rules

| Rule | LLM Format | Human Display |
|------|------------|---------------|
| Task header | `**T1.1**` | `Task 1 — <short title>` |
| Technical IDs | `T1.1`, `T2.3` | Strip from display, use sequential numbers |
| Task title | Extract from description | Short human-readable summary (bold if terminal supports) |
| Sub-bullets | Single line with full description | Indented `○` bullets under header |
| Long lines | Single line | Wrap but maintain indent |
| Multiple sub-items | N/A | Multiple `○` bullets under same task header |
| Separators | Em-dash `—` between number and title | `Task N — Title` |
| Code references | Backticks `\`file.sh\`` | Remove backticks, keep filename |

### Generating Human Titles

The monitor must extract/generate a short human title from the task description:

| LLM Description | Human Title |
|-----------------|-------------|
| `Rename \`watch_ralph_tasks.sh\` → \`current_ralph_tasks.sh\`` | `Rename script` |
| `Update heading in \`current_ralph_tasks.sh\` from \`RALPH TASK MONITOR\` → \`CURRENT RALPH TASKS\`` | `Update title` |
| `Verify \`current_ralph_tasks.sh\` only shows \`[ ]\` items` | `Confirm output` |
| `Create \`brain/ralph/THUNK.md\` with initial structure` | `Create THUNK file` |
| `Run safety check for brain_staging dependencies` | `Safety check` |

**Title generation logic:**
1. Look for action verbs: Rename, Update, Create, Verify, Delete, Add, Remove, Test
2. Extract the main object/target
3. Keep to 2-4 words max
4. If uncertain, use first 3-4 words of description

### Sub-bullet Formatting

When a task has complex descriptions, break into readable sub-bullets:

**Single action:**
```
Task 1 — Rename script
  ○ Rename watch_ralph_tasks.sh → current_ralph_tasks.sh
```

**Action with context:**
```
Task 2 — Update title
  ○ In current_ralph_tasks.sh, change the heading from RALPH TASK MONITOR →
    CURRENT RALPH TASKS
```

**Multiple related items:**
```
Task 3 — Confirm output
  ○ Make sure current_ralph_tasks.sh only lists unchecked tasks ([ ])
  ○ It should already hide completed ones ([x]) — just confirm it's working
```

### Terminal Styling (if supported)

| Element | Style |
|---------|-------|
| Task header (`Task N — Title`) | **Bold** |
| Sub-bullets | Normal weight |
| Indentation | 2 spaces before `○` |
| Line continuation | 4 spaces (align with text after `○ `) |

---

## Monitor Specifications

### `current_ralph_tasks.sh` (renamed from watch_ralph_tasks.sh)

**Heading:** `CURRENT RALPH TASKS`

**Behavior:**
- Shows only `[ ]` (uncompleted) tasks from IMPLEMENTATION_PLAN.md
- Automatically excludes `[x]` items (they belong in THUNK monitor)
- **Transforms LLM format to human-readable display** (see formatting rules above)
- Same hotkeys as before: `[h]` hide/show, `[r]` reset, `[f]` refresh, `[q]` quit

**Display Format:**
```
╔════════════════════════════════════════════════════════════════╗
║          CURRENT RALPH TASKS - 13:10:58                        ║
╚════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  High Priority
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Task 1 — Rename script
    ○ Rename watch_ralph_tasks.sh → current_ralph_tasks.sh

  Task 2 — Update title
    ○ In current_ralph_tasks.sh, change heading from RALPH TASK MONITOR →
      CURRENT RALPH TASKS

  Task 3 — Confirm output
    ○ Make sure current_ralph_tasks.sh only lists unchecked tasks ([ ])
    ○ It should already hide completed ones ([x]) — just confirm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Pending: 41 | Total: 43
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### `thunk_ralph_tasks.sh` (new)

**Heading:** `THUNK RALPH TASKS`

**Behavior:**
- Shows completed tasks from THUNK.md
- Displays THUNK # (global) and original task number
- Auto-refreshes to detect newly completed tasks
- **Refresh/Clear** (`[r]`) = clears terminal display but keeps THUNK.md intact

**Display Format:**
```
╔════════════════════════════════════════════════════════════════╗
║          THUNK RALPH TASKS - 13:10:58                          ║
╚════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Era: KB→Skills Migration (Started: 2026-01-18)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ THUNK #1 (1.1 High): Run safety check for brain_staging dependencies
  ✓ THUNK #2 (1.2 High): Delete stale directories
  ✓ THUNK #3 (1.3 High): Verify current KB structure exists
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Thunked: 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔════════════════════════════════════════════════════════════════╗
║  HOTKEYS: [r] Refresh/Clear Display  [f] Force Sync            ║
║           [e] New Era               [q] Quit                   ║
╚════════════════════════════════════════════════════════════════╝
```

**Hotkeys:**
| Key | Action |
|-----|--------|
| `[r]` | Refresh/Clear display (clears terminal, re-reads THUNK.md) |
| `[f]` | Force sync (scan IMPLEMENTATION_PLAN.md for new completions) |
| `[e]` | Start new era (prompts for era name, adds section to THUNK.md) |
| `[q]` | Quit |

---

## Auto-Launch Integration

### loop.sh Changes

Add monitor auto-launch before the main loop starts:

```bash
# Auto-launch monitors in background if not already running
launch_monitors() {
  local monitor_dir="$RALPH"
  
  # Check if current_ralph_tasks.sh exists and launch
  if [[ -f "$monitor_dir/current_ralph_tasks.sh" ]]; then
    if ! pgrep -f "current_ralph_tasks.sh" > /dev/null; then
      gnome-terminal --title="Current Ralph Tasks" -- bash "$monitor_dir/current_ralph_tasks.sh" &
      # Or for tmux: tmux new-window -n "Current Tasks" "bash $monitor_dir/current_ralph_tasks.sh"
    fi
  fi
  
  # Check if thunk_ralph_tasks.sh exists and launch
  if [[ -f "$monitor_dir/thunk_ralph_tasks.sh" ]]; then
    if ! pgrep -f "thunk_ralph_tasks.sh" > /dev/null; then
      gnome-terminal --title="Thunk Ralph Tasks" -- bash "$monitor_dir/thunk_ralph_tasks.sh" &
    fi
  fi
}

# Call before main loop
launch_monitors
```

**Note:** The exact terminal launch command may need adjustment based on environment (gnome-terminal, konsole, Windows Terminal, tmux, etc.). Make it configurable or detect automatically.

---

## Bootstrap Integration

### Files to Add to Templates

Add to `brain/ralph/templates/ralph/`:
1. `current_ralph_tasks.sh` - Copy of renamed monitor
2. `thunk_ralph_tasks.sh` - New THUNK monitor
3. `THUNK.md` - Empty template

### THUNK.md Template for New Projects

```markdown
# THUNK - Completed Task Log

Persistent record of all completed tasks across IMPLEMENTATION_PLAN.md iterations.

Project: {{PROJECT_NAME}}
Created: {{DATE}}

---

## Era: Initial Setup
Started: {{DATE}}

| THUNK # | Original # | Priority | Description | Completed |
|---------|------------|----------|-------------|-----------|

*No tasks completed yet.*
```

### new-project.sh Changes

Add to the template copying section:

```bash
# Copy Ralph monitor scripts
if [ -f "$TEMPLATES_DIR/ralph/current_ralph_tasks.sh" ]; then
    cp "$TEMPLATES_DIR/ralph/current_ralph_tasks.sh" "$PROJECT_LOCATION/ralph/current_ralph_tasks.sh"
    chmod +x "$PROJECT_LOCATION/ralph/current_ralph_tasks.sh"
    success "Copied ralph/current_ralph_tasks.sh"
fi

if [ -f "$TEMPLATES_DIR/ralph/thunk_ralph_tasks.sh" ]; then
    cp "$TEMPLATES_DIR/ralph/thunk_ralph_tasks.sh" "$PROJECT_LOCATION/ralph/thunk_ralph_tasks.sh"
    chmod +x "$PROJECT_LOCATION/ralph/thunk_ralph_tasks.sh"
    success "Copied ralph/thunk_ralph_tasks.sh"
fi

# Create empty THUNK.md from template
if [ -f "$TEMPLATES_DIR/ralph/THUNK.project.md" ]; then
    cp "$TEMPLATES_DIR/ralph/THUNK.project.md" "$PROJECT_LOCATION/ralph/THUNK.md"
    substitute_placeholders "$PROJECT_LOCATION/ralph/THUNK.md" "$REPO_NAME" "$WORK_BRANCH"
    success "Copied ralph/THUNK.md"
fi
```

---

## Implementation Phases

### Phase 1: Rename Existing Monitor
1. Rename `watch_ralph_tasks.sh` → `current_ralph_tasks.sh`
2. Update heading from `RALPH TASK MONITOR` → `CURRENT RALPH TASKS`
3. Ensure it only shows `[ ]` items (exclude `[x]`)

### Phase 2: Create THUNK.md
1. Create `brain/ralph/THUNK.md` with initial structure
2. Set Era to "KB→Skills Migration" or current active work
3. Migrate any already-completed tasks from IMPLEMENTATION_PLAN.md

### Phase 3: Create thunk_ralph_tasks.sh
1. Create new monitor script
2. Implement THUNK.md parsing and display
3. Implement completion detection (compare IMPLEMENTATION_PLAN.md `[x]` items against THUNK.md)
4. Implement auto-append logic with sequential numbering
5. Implement hotkeys (refresh, force sync, new era, quit)

### Phase 4: Auto-Launch Integration
1. Update `loop.sh` to auto-launch monitors
2. Make terminal launch command configurable/detectable
3. Add pgrep check to avoid duplicate launches

### Phase 5: Bootstrap Integration
1. Copy `current_ralph_tasks.sh` to `templates/ralph/`
2. Copy `thunk_ralph_tasks.sh` to `templates/ralph/`
3. Create `THUNK.project.md` template
4. Update `new-project.sh` to copy these files

### Phase 6: Validation
1. Test monitor rename works
2. Test THUNK.md gets populated on task completion
3. Test sequential numbering across era changes
4. Test bootstrap creates monitors in new projects
5. Test auto-launch works from loop.sh

---

## Acceptance Criteria

The THUNK Monitor system is complete when:

- [ ] `watch_ralph_tasks.sh` renamed to `current_ralph_tasks.sh`
- [ ] `current_ralph_tasks.sh` heading shows `CURRENT RALPH TASKS`
- [ ] `current_ralph_tasks.sh` only shows `[ ]` items
- [ ] `brain/ralph/THUNK.md` exists with proper format
- [ ] `thunk_ralph_tasks.sh` exists and displays THUNK.md contents
- [ ] Completed tasks auto-append to THUNK.md with sequential numbers
- [ ] Era sections work correctly
- [ ] Hotkeys work (refresh clears display but keeps THUNK.md)
- [ ] `loop.sh` auto-launches both monitors
- [ ] `templates/ralph/current_ralph_tasks.sh` exists
- [ ] `templates/ralph/thunk_ralph_tasks.sh` exists
- [ ] `templates/ralph/THUNK.project.md` exists
- [ ] `new-project.sh` copies monitor files to new projects
- [ ] Bootstrap creates working monitors in new projects

---

## Gotchas & Failure Modes

| Failure Mode | Mitigation |
|--------------|------------|
| Duplicate THUNK entries | Match by normalized description text before appending |
| Lost THUNK numbering on file corruption | Keep format simple, validate structure on read |
| Monitor launch fails silently | Log launch attempts, provide fallback instructions |
| Terminal command varies by environment | Make configurable or auto-detect (gnome-terminal vs konsole vs tmux) |
| IMPLEMENTATION_PLAN.md format changes | Parse flexibly, handle `[ ]` and `[x]` anywhere in line |
| Era not set when plan changes | Prompt user or auto-create era from THOUGHTS.md title |

---

# KB→Skills Migration Runbook

**Purpose:** Rename `ralph/kb/` to `ralph/skills/` and introduce a self-improvement system that captures knowledge gaps and promotes them into reusable skill files.

**Runtime Context:**
- This runbook is designed for execution by the Ralph loop (Claude Sonnet)
- Expected iterations: 20+ if needed
- PlanEvery: 10 (re-plan at iterations 10, 20, etc.)

---

## Migration Overview

### What Changes
1. **Folder rename:** `brain/ralph/kb/` → `brain/ralph/skills/`
2. **New subfolder:** `skills/self-improvement/` with 5 files
3. **New index:** `skills/index.md` (catalog of all skills)
4. **Updated:** `skills/summary.md` (overview + links to index)
5. **Reference updates:** All `kb` → `skills` across entire repo
6. **Protocol wiring:** Self-improvement checkpoints in AGENTS.md, PROMPT.md, templates
7. **Cleanup:** Delete `brain_staging/` and `brain_promoted/` (after safety check)

### What Stays the Same
- `skills/domains/` - all 12 existing pattern files preserved
- `skills/projects/` - all existing project files preserved
- `skills/conventions.md` - preserved (internal references updated)
- All React references under `references/` - untouched

---

## Phase 1: Safety Checks & Cleanup (Iteration 1)

### 1.1 Verify No Active Dependencies on Stale Directories

**MUST RUN these commands before any deletions:**

```bash
# Check for references to brain_staging or brain_promoted from active code
grep -rn "brain_staging\|brain_promoted" . --include="*.sh" --include="*.md" --include="*.yml" 2>/dev/null | grep -v "^./brain_staging" | grep -v "^./brain_promoted" | grep -v "logs/" | grep -v "old_md/"

# Check if anything in brain/ralph/ imports from them
grep -rn "promoted\|staging" brain/ralph/*.sh brain/ralph/*.md 2>/dev/null | grep -v "dev, staging, production"
```

**Expected result:** Empty or only historical/log references.

**If clean, delete:**
```bash
rm -rf brain_staging brain_promoted
```

**If NOT clean:** Document the dependency and decide whether to update or preserve.

### 1.2 Verify Current KB Structure

```bash
ls -la brain/ralph/kb/
ls -la brain/ralph/kb/domains/
ls -la brain/ralph/kb/projects/
```

**Expected:**
- `kb/SUMMARY.md`
- `kb/conventions.md`
- `kb/domains/` with 12 pattern files + README.md
- `kb/projects/` with project files + README.md

---

## Phase 2: Folder Rename (Iteration 2)

### 2.1 Rename kb → skills

```bash
mv brain/ralph/kb brain/ralph/skills
```

### 2.2 Verify Rename Succeeded

```bash
ls -la brain/ralph/skills/
# Should show: SUMMARY.md, conventions.md, domains/, projects/
```

---

## Phase 3: Create Self-Improvement System (Iterations 3-5)

### 3.1 Create Directory

```bash
mkdir -p brain/ralph/skills/self-improvement
```

### 3.2 Create Files (5 total)

Create these files with the exact content specified in IMPLEMENTATION_PLAN.md:

1. `skills/self-improvement/README.md` - Overview and links
2. `skills/self-improvement/GAP_CAPTURE_RULES.md` - Mandatory capture rules
3. `skills/self-improvement/GAP_BACKLOG.md` - Raw gap capture log
4. `skills/self-improvement/SKILL_BACKLOG.md` - Promotion queue
5. `skills/self-improvement/SKILL_TEMPLATE.md` - LLM-optimized 10-section template

---

## Phase 4: Update Summary & Create Index (Iterations 6-7)

### 4.1 Update `skills/summary.md`

- Change all `kb/` references to `skills/`
- Add folder tree showing new structure
- Add link to `skills/index.md`
- Add link to `skills/self-improvement/`

### 4.2 Create `skills/index.md`

New file containing:
- Catalog of all skill files under `domains/`
- Catalog of all skill files under `projects/`
- Links to self-improvement meta docs
- Instructions for adding new skills

---

## Phase 5: Update All References (Iterations 8-15)

### 5.1 Search for All KB References

```bash
# Find all files with kb references (excluding the kb folder itself)
grep -rln "ralph/kb\|/kb/\|kb/" brain/ralph/ --include="*.md" --include="*.sh" 2>/dev/null
```

### 5.2 Files to Update (Prioritized)

**Core Ralph Files:**
- `brain/ralph/AGENTS.md`
- `brain/ralph/PROMPT.md`
- `brain/ralph/NEURONS.md`
- `brain/ralph/README.md`
- `brain/ralph/VALIDATION_CRITERIA.md`
- `brain/ralph/EDGE_CASES.md`
- `brain/ralph/CHANGES.md`
- `brain/ralph/HISTORY.md`
- `brain/ralph/IMPLEMENTATION_PLAN.md`

**Generators:**
- `brain/ralph/generators/generate-neurons.sh`
- `brain/ralph/generators/generate-thoughts.sh`

**Templates:**
- `brain/ralph/templates/AGENTS.project.md`
- `brain/ralph/templates/THOUGHTS.project.md`
- `brain/ralph/templates/NEURONS.project.md`
- `brain/ralph/templates/README.md`
- `brain/ralph/templates/ralph/PROMPT.project.md`
- `brain/ralph/templates/ralph/RALPH.md`
- `brain/ralph/templates/backend/*.md`
- `brain/ralph/templates/python/*.md`

**Skills Folder Internal:**
- `brain/ralph/skills/domains/README.md`
- `brain/ralph/skills/projects/README.md`
- `brain/ralph/skills/conventions.md`

**External Projects:**
- `rovo-test/AGENTS.md`
- `rovo-test/NEURONS.md`
- `rovo-test/THOUGHTS.md`
- `rovo-test/ralph/PROMPT.md`
- `NeoQueue/ralph/PROMPT.md`
- `NeoQueue/ralph/RALPH.md`
- `NeoQueue/ralph/AGENTS.md`

### 5.3 Replacement Rules

| Find | Replace |
|------|---------|
| `ralph/kb/` | `ralph/skills/` |
| `/kb/` | `/skills/` |
| `kb/domains` | `skills/domains` |
| `kb/projects` | `skills/projects` |
| `kb/conventions` | `skills/conventions` |
| `kb/SUMMARY` | `skills/summary` |
| Commit scope `kb` | Commit scope `skills` |

### 5.4 Special Case: Commit Scopes in PROMPT.md

Find the line listing valid commit scopes (around line 93) and replace `kb` with `skills`.

---

## Phase 6: Wire Self-Improvement Protocol (Iterations 16-18)

### 6.1 Patch `brain/ralph/AGENTS.md`

Add new section "Skills + Self-Improvement Protocol":

```markdown
## Skills + Self-Improvement Protocol

**Start of iteration:**
1. Study `skills/summary.md` for overview
2. Check `skills/index.md` for available skills
3. Review `skills/self-improvement/GAP_CAPTURE_RULES.md` for capture protocol

**End of iteration:**
1. If you used undocumented knowledge/procedure/tooling:
   - Search `skills/` for existing matching skill
   - Search `skills/self-improvement/GAP_BACKLOG.md` for existing gap entry
   - If not found: append new entry to `GAP_BACKLOG.md`
2. If a gap is clear, specific, and recurring:
   - Add to `skills/self-improvement/SKILL_BACKLOG.md`
   - Create skill file using `SKILL_TEMPLATE.md`
   - Update `skills/index.md`
```

### 6.2 Patch `brain/ralph/PROMPT.md`

Add checkpoints:
- **Before planning:** "Study skills/summary.md and skills/index.md"
- **After completing work:** "Log any undocumented knowledge as a gap in GAP_BACKLOG.md; promote if clear/recurring"

### 6.3 Patch Templates

Update these templates to include the self-improvement protocol:
- `brain/ralph/templates/AGENTS.project.md`
- `brain/ralph/templates/ralph/PROMPT.project.md`

---

## Phase 7: Final Validation (Iterations 19-20)

### 7.1 Verify No Remaining KB References

```bash
# Should return ZERO results (except historical notes in HISTORY.md)
grep -rn "ralph/kb" . --include="*.md" --include="*.sh" 2>/dev/null | grep -v HISTORY.md | grep -v "old_md/"

# Should return ZERO results
grep -rn "/kb/" brain/ralph/*.md brain/ralph/templates/ brain/ralph/generators/ 2>/dev/null
```

### 7.2 Verify New Structure Exists

```bash
# All must exist
ls brain/ralph/skills/summary.md
ls brain/ralph/skills/index.md
ls brain/ralph/skills/conventions.md
ls brain/ralph/skills/domains/README.md
ls brain/ralph/skills/projects/README.md
ls brain/ralph/skills/self-improvement/README.md
ls brain/ralph/skills/self-improvement/GAP_CAPTURE_RULES.md
ls brain/ralph/skills/self-improvement/GAP_BACKLOG.md
ls brain/ralph/skills/self-improvement/SKILL_BACKLOG.md
ls brain/ralph/skills/self-improvement/SKILL_TEMPLATE.md
```

### 7.3 Verify Deleted Directories Are Gone

```bash
# Should fail (directories don't exist)
ls brain_staging 2>/dev/null && echo "ERROR: brain_staging still exists"
ls brain_promoted 2>/dev/null && echo "ERROR: brain_promoted still exists"
```

---

## Acceptance Criteria (Definition of DONE)

The migration is complete when ALL of the following are true:

- [ ] `brain/ralph/kb/` no longer exists
- [ ] `brain/ralph/skills/` exists with all original content intact
- [ ] `brain/ralph/skills/self-improvement/` exists with 5 files
- [ ] `skills/summary.md` updated with new structure and links to index
- [ ] `skills/index.md` created with catalog of all skills
- [ ] All active references changed from `kb` → `skills`
- [ ] Self-improvement protocol added to `AGENTS.md`
- [ ] Self-improvement checkpoints added to `PROMPT.md`
- [ ] Templates updated to inherit self-improvement protocol
- [ ] `brain_staging/` deleted (after safety check)
- [ ] `brain_promoted/` deleted (after safety check)
- [ ] Grep verification passes (zero active kb references)
- [ ] Commit scope `kb` replaced with `skills` in PROMPT.md

---

## Iteration Guidance (PlanEvery=10)

### Plan Iterations (1, 10, 20, ...)

On plan iterations:
1. Re-read this runbook
2. Check progress against acceptance criteria
3. Update IMPLEMENTATION_PLAN.md task list
4. Identify any blockers or unexpected issues
5. Adjust remaining tasks if needed

### Build Iterations (2-9, 11-19, 21+)

On build iterations:
1. Execute next uncompleted task from IMPLEMENTATION_PLAN.md
2. Validate the change succeeded
3. Mark task complete in IMPLEMENTATION_PLAN.md
4. Move to next task

### If Blocked

If a task cannot be completed:
1. Document the blocker in IMPLEMENTATION_PLAN.md under "Blockers"
2. Skip to next task if possible
3. On next plan iteration, decide how to resolve

---

## Gotchas & Failure Modes

| Failure Mode | Mitigation |
|--------------|------------|
| Deleting directories with active dependencies | ALWAYS run safety checks first; grep for references before rm |
| Missing a kb reference | Run comprehensive grep after all updates; use multiple patterns |
| Breaking commit scope validation | Check if PROMPT.md has validation logic; update consistently |
| Creating duplicate skills | Search skills/ and GAP_BACKLOG.md before creating anything new |
| Forgetting to update templates | Templates are the source of future behavior; prioritize them |
| Incomplete self-improvement wiring | Both AGENTS.md AND PROMPT.md AND templates need updates |
