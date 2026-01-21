# NEURONS.md - Brain Repository Quick Map

## Structure

```
brain/
├── cortex/                 # Manager layer (you)
│   ├── AGENTS.md          # Your rules & task format
│   ├── NEURONS.md         # This map
│   ├── THOUGHTS.md        # Strategic context
│   ├── IMPLEMENTATION_PLAN.md  # Tasks for Ralph
│   └── docs/REPO_MAP.md   # Full detailed map
│
├── workers/ralph/          # Execution layer
│   ├── PROMPT.md          # Ralph's instructions (protected)
│   ├── loop.sh            # Execution loop (protected)
│   ├── IMPLEMENTATION_PLAN.md  # Ralph's task copy
│   ├── THUNK.md           # Completion log
│   └── NEURONS.md         # Ralph's codebase map
│
├── skills/                 # Knowledge base
│   ├── SUMMARY.md         # START HERE for errors
│   ├── domains/           # Technical patterns
│   └── self-improvement/  # Gap capture system
│
├── templates/              # Project scaffolding
│   ├── cortex/            # Cortex templates
│   └── ralph/             # Ralph templates
│
└── rules/                  # Acceptance criteria
    └── AC.rules           # Verifier rules (protected)
```

## Quick Navigation

| I need to... | Read this |
|--------------|-----------|
| See active tasks | `IMPLEMENTATION_PLAN.md` |
| See completed tasks | `workers/ralph/THUNK.md` |
| Fix a verifier error | `skills/SUMMARY.md` → Error table |
| Understand project goals | `cortex/THOUGHTS.md` |
| Learn a pattern | `skills/domains/<pattern>.md` |
| Bootstrap new project | `docs/BOOTSTRAPPING.md` |
| Full repo details | `cortex/docs/REPO_MAP.md` |
| Ralph pattern research | `cortex/docs/RALPH_PATTERN_RESEARCH.md` |

## Files I Can Modify

✅ `cortex/IMPLEMENTATION_PLAN.md`, `cortex/THOUGHTS.md`
✅ `skills/self-improvement/GAP_BACKLOG.md`, `SKILL_BACKLOG.md`

## Files I Cannot Modify

❌ `workers/ralph/PROMPT.md`, `loop.sh`, `verifier.sh` (protected)
❌ `rules/AC.rules` (protected)
❌ Source code (Ralph's job)
