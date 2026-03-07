# Brain Repository - Claude Code Context

## Overview

Brain is a central knowledge hub and self-improvement repository. It contains reusable skills, project templates, and a worker system (Ralph) for autonomous task execution.

## Architecture

```
brain/
├── cortex/           # Cortex manager (planning, strategy, chat)
├── workers/          # Execution workers
│   ├── ralph/        # Ralph - primary execution worker
│   ├── shared/       # Shared utilities across workers
│   └── cerebras/     # Cerebras worker (experimental)
├── skills/           # Reusable knowledge base
│   ├── domains/      # Domain-specific patterns
│   ├── playbooks/    # Step-by-step guides
│   └── self-improvement/  # Gap tracking, skill backlog
├── templates/        # Project scaffolding templates
│   ├── cortex/       # Cortex template for new projects
│   ├── ralph/        # Ralph template for new projects
│   └── (lang)/       # Language-specific templates
├── tools/            # Utility tools (dashboard, analyzers)
├── config/           # Configuration files
├── artifacts/        # Generated reports, dashboards
├── docs/             # Documentation
├── rules/            # Acceptance criteria rules
└── .verify/          # Protected file verification
```

## Key Files

| File | Purpose |
|------|---------|
| `workers/IMPLEMENTATION_PLAN.md` | Active task list (Cortex writes, Ralph executes) |
| `workers/ralph/THUNK.md` | Completion log (append-only) |
| `NEURONS.md` | Repository structure map |
| `THOUGHTS.md` | Project vision and architectural decisions |
| `skills/index.md` | Skills knowledge base index |

## Cortex (Manager)

Cortex is the strategic planner. In Claude Code, start a Cortex session with:

```bash
bash cortex/cortex.bash
```

Cortex responsibilities:
- Break goals into atomic tasks in `workers/IMPLEMENTATION_PLAN.md`
- Review Ralph's progress via `workers/ralph/THUNK.md`
- Write clear task contracts with acceptance criteria
- Identify knowledge gaps and propose new skills

## Ralph (Worker)

Ralph is the execution worker. He reads tasks from `workers/IMPLEMENTATION_PLAN.md`, completes one per iteration, and logs to `workers/ralph/THUNK.md`.

### Task Format

```markdown
- [ ] **X.Y** Short description
  - **Goal:** What to achieve
  - **AC:** How to verify completion
  - **If Blocked:** Fallback guidance
```

## Environment

- **Platform:** WSL2 on Windows 11 with Ubuntu
- **Shell:** bash
- **Runtime:** Claude Code (primary), Rovo Dev (legacy, see `*/rovodev/` folders)

## Conventions

- **Timestamps:** Always `YYYY-MM-DD HH:MM:SS` with real seconds
- **Markdown:** Language tags on ALL code fences, blank lines around fences/lists
- **Paths:** Use full absolute paths from brain root
- **Protected files:** `rules/AC.rules`, `.verify/*.sha256`, `workers/ralph/verifier.sh`, `workers/ralph/loop.sh`, `workers/ralph/PROMPT.md` - human-only modifications
- **Templates sync:** Changes to `workers/ralph/` must be propagated to `templates/ralph/`

## Scope Restrictions

- Changes should stay within the brain repository
- When working on downstream projects, stay within that project's directory
- Never modify protected files without explicit human approval

## Legacy Runtime

Rovo Dev (Atlassian CLI) files are archived in `*/rovodev/` subfolders throughout the repo. These are frozen legacy archives - **never modify any `*/rovodev/` folder or file**.
