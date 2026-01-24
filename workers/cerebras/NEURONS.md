# NEURONS.md - Cerebras Worker Repository Map

## Purpose

This file maps the brain repository structure from the Cerebras worker's perspective.

## Worker Context

- **Worker:** Cerebras
- **Location:** `/workers/cerebras/`
- **Access:** Full brain repository (read/write)
- **Scope:** Shared task execution from `workers/IMPLEMENTATION_PLAN.md`

## Repository Structure

```text
brain/ (repository root)
├── README.md                    # Human-readable overview
├── AGENTS.md                    # Root operational guide
├── NEURONS.md                   # Root repository map
├── THOUGHTS.md                  # Strategic vision
├── cortex/                      # Manager layer (Cortex)
├── workers/                     # Execution layer
│   ├── IMPLEMENTATION_PLAN.md  # SHARED task backlog
│   ├── .verify/                # Shared verification
│   ├── shared/                 # Shared utilities
│   │   ├── common.sh
│   │   └── verifier_common.sh
│   ├── ralph/                  # Ralph worker
│   └── cerebras/               # THIS WORKER
│       ├── AGENTS.md
│       ├── NEURONS.md
│       ├── THOUGHTS.md
│       ├── THUNK.md
│       ├── PROMPT.md
│       ├── VALIDATION_CRITERIA.md
│       ├── loop.sh
│       ├── verifier.sh
│       ├── cerebras_agent.py
│       └── .verify/
├── skills/                      # Skills knowledge base
│   ├── SUMMARY.md              # Skills entrypoint
│   ├── index.md                # Complete skills catalog
│   ├── domains/                # Broadly reusable skills
│   ├── projects/               # Project-specific skills
│   └── self-improvement/       # Gap capture system
├── templates/                   # Project scaffolding
├── rules/                       # Acceptance criteria
├── docs/                        # Project documentation
└── .verify/                     # Root validation infrastructure
```

## Access Levels

| Access Level | Paths | Notes |
| ------------ | ----- | ----- |
| **Full access** | `skills/`, `templates/`, `cortex/`, `docs/`, `workers/` | Read, write, create, delete |
| **Protected** | `rules/AC.rules`, `verifier.sh`, `loop.sh`, `PROMPT.md` | Read only - hash-guarded |
| **Protected** | `.verify/*.sha256` | Baseline hashes - human updates only |
| **Forbidden** | `.verify/waivers/*.approved` | OTP-protected - cannot read/write |

## Key Files

| File | Purpose |
| ---- | ------- |
| `workers/IMPLEMENTATION_PLAN.md` | Shared task backlog for all workers |
| `THUNK.md` | This worker's completed task log |
| `skills/SUMMARY.md` | Skills knowledge base entrypoint |
| `skills/index.md` | Complete skills catalog |
| `.verify/latest.txt` | Latest verification results |

## See Also

- **[../../NEURONS.md](../../NEURONS.md)** - Root repository map
- **[../../AGENTS.md](../../AGENTS.md)** - Root operational guide
- **[../../skills/SUMMARY.md](../../skills/SUMMARY.md)** - Skills knowledge base
