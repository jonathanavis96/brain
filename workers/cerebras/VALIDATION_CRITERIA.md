# Validation Criteria - Cerebras Worker

## Purpose

This file defines the quality gates and validation commands for the Cerebras worker.

## Acceptance Criteria Source

The authoritative acceptance criteria are defined in:

- **Location:** `../../rules/AC.rules`
- **Protected by:** `../../.verify/ac.sha256` (hash guard)
- **Enforced by:** `verifier.sh` (runs after each BUILD iteration)

## Pre-Commit Validation

Before committing any changes, run:

```bash
# Full pre-commit suite
pre-commit run --all-files

# Individual checks
shellcheck -e SC1091 *.sh
markdownlint **/*.md
ruff check .
```

## Manual Verification

```bash
# Run verifier manually
bash verifier.sh

# Check latest results
cat .verify/latest.txt

# Verify protected file hashes
sha256sum -c .verify/ac.sha256
sha256sum -c .verify/verifier.sha256
sha256sum -c .verify/loop.sha256
sha256sum -c .verify/prompt.sha256
```

## Definition of Done

Before marking a task complete, verify:

- [ ] Code changes implemented and tested
- [ ] All acceptance criteria pass (`bash verifier.sh`)
- [ ] Pre-commit hooks pass (`pre-commit run --all-files`)
- [ ] THUNK.md updated with task completion entry
- [ ] workers/IMPLEMENTATION_PLAN.md task marked `[x]`
- [ ] Single commit with all changes (code + THUNK + PLAN)
- [ ] Commit message follows conventional format

## Commit Message Format

```text
<type>(<scope>): <summary>

- Detail 1
- Detail 2

Co-authored-by: cerebras-worker <cerebras-worker@users.noreply.github.com>
Brain-Repo: jonathanavis96/brain
```

**Types:** feat, fix, docs, refactor, chore, test  
**Scopes:** cerebras, templates, skills, plan

## Common Validation Errors

See `../../skills/SUMMARY.md` → Error Quick Reference for common errors and fixes.

## See Also

- **[../../rules/AC.rules](../../rules/AC.rules)** - Acceptance criteria definitions
- **[../../skills/SUMMARY.md](../../skills/SUMMARY.md)** - Skills knowledge base
- **[../../skills/domains/code-quality/code-hygiene.md](../../skills/domains/code-quality/code-hygiene.md)** - Definition of Done checklist
