# AGENTS.md - Cerebras Worker Operational Guide

## Purpose

This guide provides operational instructions for the Cerebras worker. The Cerebras worker is a specialized autonomous agent that uses the Cerebras LLM for task execution.

## Worker Identity

- **Name:** Cerebras Worker
- **LLM:** Cerebras (via cerebras_agent.py)
- **Mode:** PLAN/BUILD cycles
- **Scope:** Full brain repository access

## How to Run

```bash
cd /path/to/brain/workers/cerebras/
bash loop.sh                    # Single iteration
bash loop.sh --iterations 10    # Multiple iterations
bash loop.sh --dry-run          # Preview changes
bash loop.sh --resume           # Resume from interruption
```

## Directory Structure

```text
workers/cerebras/
├── AGENTS.md               # This file - operational guide
├── NEURONS.md              # Repository structure map (cerebras-specific view)
├── THOUGHTS.md             # Strategic goals and context
├── THUNK.md                # Completed task log
├── PROMPT.md               # Agent prompt for cerebras
├── VALIDATION_CRITERIA.md  # Quality gates
├── loop.sh                 # Main execution loop
├── verifier.sh             # Acceptance criteria checker
├── cerebras_agent.py       # Cerebras LLM integration
├── .verify/                # Validation infrastructure
│   ├── ac.sha256          # Hash baseline for AC.rules
│   ├── verifier.sha256    # Hash baseline for verifier.sh
│   ├── loop.sha256        # Hash baseline for loop.sh
│   ├── prompt.sha256      # Hash baseline for PROMPT.md
│   └── latest.txt         # Latest verification results
└── docs/                   # Cerebras-specific documentation
    └── WAIVER_PROTOCOL.md  # Waiver request procedure
```

## Task Execution

See workers/IMPLEMENTATION_PLAN.md for shared task backlog.

## Protected Files

**Read-only (hash-guarded):**

- `rules/AC.rules` + `../../.verify/ac.sha256`
- `verifier.sh` + `.verify/verifier.sha256`
- `loop.sh` + `.verify/loop.sha256`
- `PROMPT.md` + `.verify/prompt.sha256`

If you need to change these files, create a `SPEC_CHANGE_REQUEST.md` and stop.

## See Also

- **[../../README.md](../../README.md)** - Brain repository overview
- **[../../NEURONS.md](../../NEURONS.md)** - Repository structure map
- **[../../THOUGHTS.md](../../THOUGHTS.md)** - Strategic vision
- **[../IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)** - Shared task backlog
- **[../../skills/](../../skills/)** - Skills knowledge base
