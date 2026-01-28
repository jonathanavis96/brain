# NEURONS.md - [PROJECT_NAME] Repository Map

**Read via subagent** - This is the codebase map for Ralph. Not loaded in first context.

## Purpose

This is the **project map** that Ralph and all agents read on-demand when needed. It maps the entire repository structure, tells you where everything lives, and provides quick lookup for common tasks.

## Navigation Rules (Read This First)

**Deterministic Context Loading Order:**

1. `AGENTS.md` (injected first by loop.sh - operational guide)
2. `PROMPT.md` (injected second - contains conditional logic for plan/build modes)
3. `NEURONS.md` (this file - read via subagent when needed, NOT injected)
4. `workers/IMPLEMENTATION_PLAN.md` (TODO list - read in BUILD mode via subagent)
5. `THOUGHTS.md` (project goals - read as needed via subagent)
6. Project-specific files as needed

**Progressive Disclosure:** Start broad, drill down only when needed. Don't read everything at once.

---

## Repository Layout

[REPLACE: Map your project's directory structure. Use tree format with brief descriptions.]

```text
/path/to/[PROJECT_NAME]/
├── AGENTS.md                    # Ralph operational guide (how to run)
├── NEURONS.md                   # This file (project map - what exists where)
├── THOUGHTS.md                  # Project vision, goals, and success criteria
│
├── ralph/                       # Ralph loop infrastructure (ONLY loop files here)
│   ├── loop.sh                  # Ralph loop runner (bash)
│   ├── verifier.sh              # AC verifier script
│   ├── PROMPT.md                # Unified prompt (plan + build modes)
│   ├── workers/IMPLEMENTATION_PLAN.md   # Persistent TODO list
│   ├── VALIDATION_CRITERIA.md   # Quality gates and acceptance criteria
│   ├── rovodev-config.yml       # RovoDev configuration
│   └── THUNK.md                 # Completion log
│
├── src/                         # Your application source code
├── tests/                       # Test suite
├── docs/                        # Project documentation
└── ...
```

## Quick Lookups

### Core

- Project map: `NEURONS.md`
- Goals/vision: `THOUGHTS.md`
- Task plan: `workers/IMPLEMENTATION_PLAN.md`
- Ralph loop: `workers/ralph/loop.sh`
- Verifier: `workers/ralph/verifier.sh`

### Notes

- Keep this file up to date as the repo structure changes.
- Prefer describing *where things live* over long prose.
