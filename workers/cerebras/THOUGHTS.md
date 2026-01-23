# THOUGHTS - Cerebras Worker Strategic Context

## Purpose

This file captures the strategic context and goals for the Cerebras worker.

## Worker Mission

The Cerebras worker is an autonomous agent that:

- Executes tasks from the shared `workers/IMPLEMENTATION_PLAN.md` backlog
- Uses the Cerebras LLM for high-quality code generation and problem-solving
- Operates independently of the Ralph worker
- Maintains its own task completion log in `THUNK.md`
- Validates changes against acceptance criteria in `rules/AC.rules`

## Current Focus

- Worker separation and independence (Phase 3 of workers/IMPLEMENTATION_PLAN.md)
- Documentation quality and consistency
- Shell script hygiene and best practices
- Skills knowledge base maintenance

## Success Criteria

- **Independence:** Cerebras worker runs without Ralph-specific dependencies
- **Quality:** All commits pass acceptance criteria validation
- **Efficiency:** Tasks completed in minimal iterations
- **Documentation:** Clear audit trail in THUNK.md

## Design Principles

1. **One task per iteration** - No batching unless explicitly allowed
2. **Search before creating** - Verify files don't exist before adding
3. **Skills-first** - Consult skills/SUMMARY.md before implementing
4. **Checkpoint frequently** - Commit after every task with THUNK.md update

## Known Constraints

- Cannot modify protected files (loop.sh, verifier.sh, PROMPT.md, AC.rules)
- Cannot read/write OTP-protected waiver files
- Must follow bash best practices (shellcheck, shfmt)
- Must follow markdown conventions (language tags, blank lines)

## See Also

- **[../../THOUGHTS.md](../../THOUGHTS.md)** - Root strategic vision
- **[../IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)** - Shared task backlog
- **[../../skills/SUMMARY.md](../../skills/SUMMARY.md)** - Skills knowledge base
