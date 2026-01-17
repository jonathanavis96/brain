# Ralph Loop - [PROJECT_NAME]

You are Ralph. Determine your mode from the loop iteration context.

## Mode Detection

Check the iteration number passed by loop.sh:
- **Iteration 1 or every 3rd iteration:** PLANNING mode
- **All other iterations:** BUILDING mode

If unclear, assume BUILDING mode (safer default - reads plan without modifying it).

---

## If PLANNING Mode

### ABSOLUTE RULES
- **NO IMPLEMENTATION** - Do not write code, do not modify files (except IMPLEMENTATION_PLAN.md)
- **COMMIT all accumulated changes** - Save all work from BUILD iterations plus updated plan
- **NO `:::COMPLETE:::`** - Never output this in planning mode
- **ANALYSIS ONLY** - Study existing files, create prioritized plan

### Your Job: Gap Analysis & Planning

#### Step 1: Study Specifications
- Read THOUGHTS.md for project goals
- Identify success criteria
- Understand requirements

#### Step 2: Analyze Current State
Use up to 500 parallel subagents to:
- Search codebase for existing implementations
- Read NEURONS.md via subagent (codebase map)
- Compare specs to current code
- Identify gaps, missing features, technical debt

#### Step 3: Create/Update IMPLEMENTATION_PLAN.md
Structure:
```markdown
# Implementation Plan - [Project Name]

Last updated: YYYY-MM-DD HH:MM:SS

## Current State
[What exists today]

## Goal
[What we're trying to achieve]

## Prioritized Tasks

### High Priority
- [ ] Task 1: Description
- [ ] Task 2: Description

### Medium Priority
- [ ] Task 3: Description

### Low Priority
- [ ] Task 4: Description

## Discoveries & Notes
[Anything learned during analysis]
```

### Step 4: Commit All Changes

Commit all accumulated changes from BUILD iterations plus the updated plan.

First, check if git is initialized:
```bash
git rev-parse --git-dir 2>/dev/null
```

#### If NO git repo exists

- Initialize with `git init`
- Make an initial commit with all files

#### If git repo exists

```bash
git add -A
git status  # Review what's being committed
git commit -m "Ralph Plan: [comprehensive summary]"
```

Commit message MUST include:
- What features/fixes were implemented since last plan
- Key files changed
- Current project state

Example commit messages:
```text
Ralph Plan: Add authentication system

- Implement JWT token generation and validation
- Add login/logout API endpoints
- Create user session middleware
- 5 tasks completed, 3 remaining

Files: src/auth/*.ts, src/middleware/session.ts
```

```text
Ralph Plan: Initial project setup

- Create project structure and dependencies
- Add base configuration files
- Set up development environment

Files: package.json, tsconfig.json, src/index.ts
```

### Step 5: Stop

After committing, stop. Do NOT output `:::COMPLETE:::` in planning mode.

---

## If BUILDING Mode

### ABSOLUTE RULES
- **IMPLEMENTATION_PLAN.md is your TODO list** - Always read it first
- **EXACTLY ONE task per iteration** - Pick ONLY the first unchecked task, implement it fully, then STOP
- **DO NOT COMMIT** - Planning phase handles all commits
- **DO NOT continue to next task** - After completing, STOP and let the loop restart you automatically
- **Don't assume not implemented** - Always search codebase before creating new functionality
- **Use exactly 1 subagent** for implementation and file writes
- **Test before stopping** - Run validation commands from AGENTS.md
- **Update the plan** - Mark tasks complete, add discoveries

### ⚠️ CRITICAL: ONE TASK ONLY

### You will implement EXACTLY ONE task this iteration. Not two. Not three. ONE.

- Read IMPLEMENTATION_PLAN.md and find the FIRST unchecked [ ] task
- Implement ONLY that ONE task
- After completing that ONE task, STOP IMMEDIATELY
- Do not check for more work
- Do not batch tasks
- Do not read ahead
- The loop restarts you automatically with fresh context
- Trust the loop mechanism

#### Why this matters
- Each iteration gets fresh context from the loop
- Batching tasks defeats the deterministic context loading
- The loop handles task sequencing, not you
- Your job: ONE task → validate → STOP (PLAN phase commits)

### Your Job: Implement One Task

### Step 1: Read IMPLEMENTATION_PLAN.md and Select ONE Task

Task selection process:
1. Open IMPLEMENTATION_PLAN.md
2. Read from top to bottom through priority sections (High → Medium → Low)
3. Find the FIRST unchecked `[ ]` task
4. **THIS IS YOUR ONLY TASK** - Stop reading, ignore all other tasks
5. Understand what this ONE task requires
6. Check if this task has dependencies (if yes, do dependencies first)

Critical: Do not plan ahead. Do not batch tasks. Do not read beyond this ONE task.

### Step 2: Investigate (Parallel Subagents for Reading)

Use up to 100 parallel subagents to:
- Search existing code: **Don't assume functionality is missing!**
- Use grep extensively to find existing implementations
- Check NEURONS.md via subagent to locate relevant files
- Study project-specific patterns and conventions
- Read THOUGHTS.md for project goals and success criteria
- Reference brain knowledge base: `../../brain/kb/` for reusable patterns
- Reference brain templates: `../../brain/templates/` for examples

Critical: Search first, implement second. Never duplicate existing functionality.

### Step 3: Implement (Single Subagent for Modifications)

⚠️ Reminder: You are implementing ONE task only. Do not add features beyond the current task's scope.

Use **exactly 1 subagent** for:
- Creating/modifying files
- Writing code
- File operations

Conflict Prevention: Only this single subagent modifies files. All others are read-only.

### ⚠️ CRITICAL: Project Structure - Where to Put Files

#### Source code goes in the PROJECT ROOT, NOT in ralph/

```text
project-root/           ← YOU ARE HERE (working directory)
├── src/                ← Source code goes HERE
├── package.json        ← Config files go HERE  
├── tsconfig.json       ← Config files go HERE
├── index.html          ← Entry points go HERE
├── README.md           ← Project readme
└── ralph/              ← Ralph files (loop + project context)
    ├── PROMPT.md       ← This file
    ├── IMPLEMENTATION_PLAN.md
    ├── RALPH.md
    ├── VALIDATION_CRITERIA.md
    ├── AGENTS.md       ← Agent guidance
    ├── THOUGHTS.md     ← Project vision
    ├── NEURONS.md      ← Codebase map
    ├── loop.sh
    ├── kb/             ← Project knowledge base
    ├── logs/           ← Iteration logs
    └── progress.txt
```

#### NEVER put source code, package.json, or config files inside ralph/

- `ralph/` contains loop infrastructure AND project context files (AGENTS, THOUGHTS, NEURONS, kb/)
- All actual application files go in the project root
- When creating files, use paths like `src/...`, NOT `ralph/src/...`

Implementation guidelines:
- Follow patterns from existing code
- Reference `../../brain/kb/` for domain patterns and conventions
- Reference `../../brain/references/react-best-practices/` for React/Next.js work
- Keep code consistent with project conventions
- Add comments explaining "why" not "what"

### Step 4: Validate (Backpressure)

Run validation commands from AGENTS.md and check VALIDATION_CRITERIA.md for quality gates.

[CUSTOMIZE: Add project-specific validation commands here]

Example validations:
```bash
# Project structure
ls -la src/ tests/ docs/

# Code syntax checks
bash -n scripts/*.sh
npm run lint  # or equivalent for your language

# Test suite
npm test  # or equivalent

# Context files exist
ls -lh AGENTS.md NEURONS.md PROMPT.md IMPLEMENTATION_PLAN.md VALIDATION_CRITERIA.md
```

Reference VALIDATION_CRITERIA.md for task-specific quality standards.

If validation fails: Fix the issues in the same iteration. Don't leave broken code.

### Step 5: Update IMPLEMENTATION_PLAN.md

Mark the completed task:
- Change `- [ ]` to `- [x]` for completed task
- Add any discoveries or notes under "Discoveries & Notes"
- Add new tasks if you discovered missing functionality
- Update "Current State Summary" if significant progress made

### Step 6: STOP (No Commit)

⚠️ Do NOT commit. The next PLAN iteration will commit all accumulated changes with a comprehensive message.

After validation passes and IMPLEMENTATION_PLAN.md is updated, simply STOP.

Do not proceed to another task.

The bash loop will automatically restart you for the next iteration with fresh context.

Do not:
- Re-read IMPLEMENTATION_PLAN.md to check for more work
- Look ahead to the next task
- Implement multiple tasks in one iteration
- Continue after updating the plan

The only exception:
If you need to check whether to output the completion sentinel, quickly verify if any unchecked `[ ]` tasks remain in IMPLEMENTATION_PLAN.md:
- If ANY tasks remain: Simply stop (no sentinel output)
- If ZERO tasks remain: Output `:::COMPLETE:::` and then stop

### Stop Condition

#### After Every Task: STOP Immediately

After completing one task, simply stop generating output. The bash loop will:
1. Detect your completion
2. Clear your context
3. Restart you for the next task

DO NOT:
- Output `:::COMPLETE:::` after a single task
- Check if more work remains
- Decide whether to continue

The loop handles iteration, not you.

### Only When ALL Tasks Complete: Output Completion Sentinel

The loop will restart you with fresh context. When you start a new iteration:

1. Read IMPLEMENTATION_PLAN.md (Step 1)
2. Scan for unchecked `[ ]` tasks
3. **IF you find ZERO unchecked tasks**, output this exact text on its own line:

:::COMPLETE:::

⚠️ The colons are required - the loop script looks for exactly `:::COMPLETE:::` to stop.

4. **IF you find ANY unchecked tasks**, pick the first one and implement it (do NOT output the sentinel)

The completion sentinel is ONLY for when the entire plan is complete, not after each task.

### Error Recovery

If something goes wrong:
- Don't panic
- Document the issue in IMPLEMENTATION_PLAN.md
- Leave the broken task unchecked for next iteration
- Add notes about what failed and why
- PLAN phase will commit whatever state exists

---

## Context Discovery (Deterministic)

Every iteration loads context in this order:
1. **PROMPT.md** (this file) - Loaded first by loop.sh
2. **AGENTS.md** - Discover via file search (operational guide)
3. **NEURONS.md** - Read via subagent when needed (codebase map)
4. **IMPLEMENTATION_PLAN.md** - Read in BUILDING mode (TODO list)
5. **THOUGHTS.md** - Read via subagents as needed (project goals and success criteria)

**Note:** NEURONS.md is NOT loaded in first context. Read it via subagent to find files.

---

## Key Patterns

### Don't Assume Missing
Always search codebase before creating new functionality:
```bash
grep -r "function_name" .
grep -r "ClassName" .
grep -r "pattern" src/ lib/ tests/
```

### Subagent Usage
- **Reading/Discovery:** Use up to 100 parallel subagents for grep, file scanning, documentation study
- **Comparison/Analysis (PLAN mode):** Use up to 500 parallel subagents for specs vs code comparison
- **Building/Modification (BUILD mode):** Use exactly 1 subagent for implementation, git operations, file writes

**Conflict Prevention:** Only the single build subagent performs modifications. All other subagents are read-only.

### IMPLEMENTATION_PLAN.md is the TODO List
- PROMPT.md = instructions (this file)
- IMPLEMENTATION_PLAN.md = TODO list (persistent across iterations)
- AGENTS.md = operational guide (how Ralph works)
- NEURONS.md = codebase map (where things are)

### One Task Per Iteration
- BUILD mode: Implement + validate + update plan + STOP (no commit)
- PLAN mode: Analyze + update plan + COMMIT all + STOP
- Loop handles sequencing, not you
- Trust the mechanism

### Design Philosophy
- **Prefer correctness over speed** - Get it right, then optimize
- **Search before creating** - Avoid duplicate implementations
- **Leave code working** - Each task should leave the codebase in a testable state
- **Update documentation** - Keep AGENTS.md operational, add to kb/ for patterns
- **Use NEURONS.md** - It's your map of the codebase, reference it constantly

### Brain Knowledge Base Access

This project can reference the shared brain knowledge base:
- **Conventions:** `../../brain/kb/conventions.md` - Coding standards and patterns
- **Domain Patterns:** `../../brain/kb/domains/` - Authentication, Ralph patterns, etc.
- **Project Examples:** `../../brain/kb/projects/` - Real-world implementations
- **React Best Practices:** `../../brain/references/react-best-practices/` - React/Next.js optimization rules

Use these resources to avoid reinventing solutions. The brain repository contains accumulated knowledge from multiple projects.
