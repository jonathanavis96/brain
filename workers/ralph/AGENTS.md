# AGENTS.md - Ralph Loop (Brain Repo Self-Improvement)

## First Step: Read the Brain Map

**Before any task, read NEURONS.md via subagent** - it maps the brain repository structure.

## Purpose

Ralph loop for brain repository self-improvement. Runs PLAN/BUILD cycles to maintain knowledge base and templates.

## Prerequisites

- **Environment:** WSL (Windows Subsystem for Linux) on Windows 11 with Ubuntu
- **Shell:** bash (comes with WSL Ubuntu)
- **Atlassian CLI:** `acli` - <https://developer.atlassian.com/cloud/cli/>
- **RovoDev:** `acli rovodev auth && acli rovodev usage site`

## Environment Notes

**WSL/Windows 11 Specifics:**

- Working directory: `/mnt/c/...` or `/home/...` depending on where repository is cloned
- Git line endings: Use `core.autocrlf=input` to avoid CRLF issues
- File permissions: WSL handles Unix permissions on Windows filesystem
- Path separators: Use Unix-style `/` paths (WSL translates automatically)

## How to Run

```bash
cd /path/to/brain/workers/ralph/
bash loop.sh                    # Single iteration
bash loop.sh --iterations 10    # Multiple iterations
bash loop.sh --dry-run          # Preview changes
bash loop.sh --rollback 2       # Undo last 2 commits
bash loop.sh --resume           # Resume from interruption
```

Mode: Iteration 1 or every 3rd = PLAN, others = BUILD.

## Task Monitors

Ralph uses two complementary monitors for real-time task tracking:

**Current Ralph Tasks:** `bash current_ralph_tasks.sh` - Shows pending tasks from workers/IMPLEMENTATION_PLAN.md  
**THUNK Monitor:** `bash thunk_ralph_tasks.sh` - Shows completed task log from workers/ralph/THUNK.md

### Rule: Interactive monitors must not be piped

`current_ralph_tasks.sh` and `thunk_ralph_tasks.sh` are **interactive, continuously-refreshing** monitors.

- **Never run them in a pipeline** (e.g. `... | grep ...` or `... | sed ...`). Doing so can leave background processes running and interfere with the Ralph loop/terminal state.
- For non-interactive debugging/snapshots, **always wrap with `timeout`**:

```bash
# Safe snapshot (auto-exits)
timeout 2s bash current_ralph_tasks.sh --hide-completed

timeout 2s bash thunk_ralph_tasks.sh
```

- If you suspect you left a monitor running, kill it with:

```bash
pgrep -af 'current_ralph_tasks\.sh|thunk_ralph_tasks\.sh'
pkill -f 'bash .*current_ralph_tasks\.sh' || true
pkill -f 'bash .*thunk_ralph_tasks\.sh' || true
```

See README.md for detailed monitor features and hotkeys.

## Loop Stop Sentinel

Ralph outputs when ALL tasks complete:

```text
:::COMPLETE:::
```

## Troubleshooting

- **acli not found**: Add to PATH in ~/.bashrc
- **Loop doesn't stop**: Check `:::COMPLETE:::` output
- **Ralph batches tasks**: See PROMPT.md "EXACTLY ONE task" emphasis
- **Wrong mode**: Check iteration number (1 or 3rd = PLAN)

See README.md for design philosophy, safety features, and detailed documentation.

## See Also

- **README.md** - Design philosophy, validation, safety features, architecture
- **VALIDATION_CRITERIA.md** - Quality gates and validation commands
- **NEURONS.md** - Brain repository map
- **skills/domains/ralph/ralph-patterns.md** - Ralph loop architecture
- **docs/BOOTSTRAPPING.md** - New project bootstrapping and generators
- **skills/** - Skills knowledge base and self-improvement protocol
