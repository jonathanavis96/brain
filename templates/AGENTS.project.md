# Project Guidance for AI Agents

## Start Here (mandatory)

Before any work, read in this order:

1. `BOOTSTRAP.md` (or project README) — scope, constraints, deployment notes
2. `brain/workers/ralph/THOUGHTS.md` — product vision, goals/non-goals
3. `brain/workers/ralph/VALIDATION_CRITERIA.md` — quality gates and validation commands
4. `brain/workers/IMPLEMENTATION_PLAN.md` — the prioritized task list

## Task ordering rule (CRITICAL)

- Always work **top-to-bottom** in `brain/workers/IMPLEMENTATION_PLAN.md`.
- In each BUILD iteration, implement **only the first unchecked** task (`- [ ]`) in file order.
- Do **not** skip to later task IDs unless the current first task is explicitly blocked.
  - If blocked, mark it `[?]` and add an **If Blocked** note, then continue to the next unchecked task.

## Brain Knowledge Base (optional integration)

> If `./brain/` exists, use it. Otherwise, proceed using project-local docs.

Progressive disclosure:

1. `./brain/skills/SUMMARY.md` — knowledge base overview
2. `./brain/skills/index.md` — find relevant skills
3. Open only the specific skill file you need

## Parallelism Rule

**Reading/searching/spec review**: Use up to **100 parallel subagents** for maximum efficiency.

**Build/tests/benchmarks**: Use exactly **1 agent**.

## Core principles

- Search before creating new tools/files.
- Keep changes minimal and verifiable.
- Never commit secrets.

## Project structure

- Application code lives at project root (e.g., `src/`, `pyproject.toml`).
- Ralph loop infra lives in `brain/workers/ralph/`.
- The primary task list lives in `brain/workers/IMPLEMENTATION_PLAN.md`.
