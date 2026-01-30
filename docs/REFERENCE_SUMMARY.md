# Ralph Wiggum Reference Summary

## Overview

Ralph Wiggum is an iterative development loop pattern that alternates between PLAN and BUILD phases, using AI agents to progressively improve a codebase.

## Canonical Documentation Map

This table identifies the single source of truth for each major topic to avoid conflicting documentation.

| Topic | Canonical Location | Deprecated/Duplicate Copies |
|-------|-------------------|----------------------------|
| **Bootstrapping new projects** | `docs/BOOTSTRAPPING.md` | `README.md` (brief mention), `cortex/docs/REPO_MAP.md` (overview) |
| **Running Ralph loop** | `workers/ralph/README.md` | `AGENTS.md` (quick start), `workers/ralph/AGENTS.md` (operational), `docs/HISTORY.md` (historical) |
| **Task planning authority** | `workers/IMPLEMENTATION_PLAN.md` (canonical source) | `cortex/IMPLEMENTATION_PLAN.md` (mirror for Cortex context) |
| **Gap capture workflow** | `skills/self-improvement/GAP_CAPTURE_RULES.md` | `cortex/docs/RUNBOOK.md` (partial), `skills/self-improvement/README.md` (overview) |
| **Acceptance criteria & verifier** | `workers/ralph/VALIDATION_CRITERIA.md` | `docs/QUALITY_GATES.md` (conceptual), `docs/HASH_VALIDATION.md` (hash guard details) |
| **Task completion logging** | `workers/ralph/THUNK.md` (canonical log) | `cortex/docs/TASK_SYNC_PROTOCOL.md` (protocol spec), `docs/HISTORY.md` (historical context) |
| **Repository structure** | `NEURONS.md` | `cortex/docs/REPO_MAP.md` (detailed analysis) |
| **Tool inventory** | `docs/TOOLS.md` | Various READMEs in `bin/` and `tools/` subdirs |
| **Operational guide for agents** | `AGENTS.md` (root level, all agents) | `workers/ralph/AGENTS.md` (Ralph-specific), `workers/cerebras/AGENTS.md` (Cerebras-specific) |
| **Strategic vision** | `THOUGHTS.md` | `cortex/THOUGHTS.md` (project-specific if exists) |

### Notes on Authority

- **Plan authority**: `workers/IMPLEMENTATION_PLAN.md` is the single source of truth; `cortex/IMPLEMENTATION_PLAN.md` is a read-only mirror for Cortex's strategic planning context
- **Bootstrap layout**: Current reality is `workers/ralph/` (per ADR-0001), NOT `ralph/` at project root
- **Gap capture**: Use `skills/self-improvement/GAP_CAPTURE_RULES.md` for the process; gaps flow to `brain/cortex/.gap_pending` (legacy `cortex/.gap_pending` supported) then `cortex/sync_gaps.sh` merges to `GAP_BACKLOG.md`

## Key References

### 1. Ralph Playbook (<https://github.com/ghuntley/how-to-ralph-wiggum>)

**Core Principle**: Ralph is "powerful yet dumb" - it works best with simple, repeatable patterns and clear constraints.

**Critical Rules**:

- **Don't assume not implemented** - Always search the codebase before making changes (use grep extensively)
- **Parallel subagents for reading** - Use up to 100 parallel agents for reading docs/searching code
- **Single agent for building** - Use exactly 1 agent for implementation/modification/git ops
- **AGENTS.md is operational-only** - How to run, build, test. NO progress diaries.
- **IMPLEMENTATION_PLAN.md is THE TODO list** - Single prioritized backlog, always current
- **One iteration = one coherent unit** - Implement + verify + update plan + commit in a single iteration

**Context Loading (Each Iteration)**:

- `PROMPT.md` (unified prompt with mode detection)
- `AGENTS.md`
- Specs and implementation plan
- KB files via progressive disclosure

### 2. Ralph Original Post (<https://ghuntley.com/ralph/>)

**Loop Structure**:

- **PLAN phase**: Gap analysis, creates/updates IMPLEMENTATION_PLAN.md, NO code changes, NO commits
- **BUILD phase**: Takes top task, implements fully, runs validation, commits if complete
- **Completion**: BUILD outputs `:::COMPLETE:::` when all tasks done

### 3. Specs Pattern (<https://ghuntley.com/specs/>)

**Specification Structure**:

- `THOUGHTS.md` - Brain repository vision, goals, and definition of done
- `specs/FEATURE.md` - Individual feature specifications
- Specs are read during PLAN phase to understand project goals

**For Brain Repository**:

- "Source code" = templates, KB files, scripts, documentation, Ralph infrastructure
- "Read-only references" = `references/react-best-practices/rules/*` (45 files, never modify)

### 4. Groundhog Pattern (<https://github.com/ghuntley/groundhog>)

*(Link returned 404 - content unavailable, skipped)*

### 5. React Best Practices (vercel-labs/agent-skills)

**Already present in parent repo**: `../references/react-best-practices/`

- **HOTLIST.md**: Top 10 most applicable rules
- **INDEX.md**: Full categorized rule index
- **rules/**: 45 individual rule files

## Planning vs Building Loops

### PLAN Phase Rules

- **Input**: specs/*, existing code, IMPLEMENTATION_PLAN.md
- **Actions**: Gap analysis, update IMPLEMENTATION_PLAN.md, log summary
- **Output**: Updated IMPLEMENTATION_PLAN.md
- **Forbidden**: Code changes, commits, `:::COMPLETE:::`

### BUILD Phase Rules

- **Input**: Top task from IMPLEMENTATION_PLAN.md
- **Actions**: Implement, validate, update plan, commit
- **Output**: Working code, `:::COMPLETE:::` if all tasks done
- **Forbidden**: Creating new tasks without implementing them

## Validation Commands (Backpressure)

**For Brain Repository**:

```powershell
# Brain integrity checks (run from brain root)
..\validate-brain.ps1

# Template correctness checks (run from brain root)
..\validate-templates.ps1

# Verify 45 React rules unchanged
(Get-ChildItem -Path "..\references\react-best-practices\rules" -Filter "*.md").Count
# Should output: 45

# PowerShell syntax validation
pwsh -NoProfile -File ..\new-project.ps1 -WhatIf -Name test-validation

# Ralph script syntax check
pwsh -NoProfile -Command "& { . '.\ralph.ps1' }" -WhatIf
```text

**Validation Rules**:

- All KB files must have "Why This Exists" and "When to Use It" headers
- All KB files must be linked from `kb/SUMMARY.md`
- Templates must use `../brain/...` paths (relative from project root)
- Ralph prompts must use local paths relative to brain root: `kb/SUMMARY.md`
- No modifications to `references/react-best-practices/rules/*` (read-only)
- All PowerShell scripts must execute without syntax errors

## Success Criteria

- Ralph runs PLAN and BUILD without getting stuck
- IMPLEMENTATION_PLAN.md stays current
- Loop stops cleanly when complete
