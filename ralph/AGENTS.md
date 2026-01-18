# AGENTS.md - Ralph Loop (Brain Repo Self-Improvement)

## First Step: Read the Brain Map
**Before any task, read NEURONS.md via subagent** - it maps the brain repository structure.

## Purpose
Ralph loop for brain repository self-improvement. Runs PLAN/BUILD cycles to maintain knowledge base and templates.

## Prerequisites
- WSL2 Ubuntu + bash
- Atlassian CLI (`acli`) - https://developer.atlassian.com/cloud/cli/
- RovoDev: `acli rovodev auth && acli rovodev usage site`

## How to Run
```bash
cd /home/grafe/code/brain/ralph/
bash loop.sh                    # Single iteration
bash loop.sh --iterations 10    # Multiple iterations
bash loop.sh --dry-run          # Preview changes
bash loop.sh --rollback 2       # Undo last 2 commits
bash loop.sh --resume           # Resume from interruption
```

Mode: Iteration 1 or every 3rd = PLAN, others = BUILD.

## Task Monitor
```bash
bash watch_ralph_tasks.sh       # Real-time task tracking
```
Hotkeys: `h` (toggle), `r` (archive), `f` (refresh), `c` (clear), `q` (quit)

## Loop Stop Sentinel
Ralph outputs when ALL tasks complete:
```
:::COMPLETE:::
```

## Troubleshooting
- **acli not found**: Add to PATH in ~/.bashrc
- **Loop doesn't stop**: Check `:::COMPLETE:::` output
- **Ralph batches tasks**: See PROMPT.md "EXACTLY ONE task" emphasis
- **Wrong mode**: Check iteration number (1 or 3rd = PLAN)

See README.md for design philosophy, safety features, and detailed documentation.

## See Also
- **README.md** - Design philosophy, validation, safety features
- **VALIDATION_CRITERIA.md** - Quality gates and validation commands
- **NEURONS.md** - Brain repository map
- **skills/domains/ralph-patterns.md** - Ralph loop architecture
