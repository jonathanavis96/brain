# PLAN-ONLY Mode Boundaries

When Ralph runs in PLAN-ONLY mode (controlled by `RALPH_MODE=PLAN` environment variable), certain operations are blocked to prevent accidental implementation work during planning phases.

## Environment Variable

- `RALPH_MODE=PLAN` - Enables guard (blocks implementation actions)
- `RALPH_MODE=BUILD` or unset - Normal operation (all actions allowed)

## Guard Function

- **Function:** `guard_plan_only_mode <action>` in `workers/shared/common.sh`
- **Returns:** 0 = allowed, 1 = blocked
- **Behavior:** Prints refusal message to stderr and returns non-zero for blocked actions

## Blocked Categories (PLAN-ONLY mode)

- **git-write:** Operations that modify git state
  - `git add`, `git commit`, `git push`
  - Example: `guard_plan_only_mode "git add"` → exits 1, prints "PLAN-ONLY: Refusing 'git add'. Add task to plan instead."
- **file-modify:** Operations that modify files in-place
  - `shfmt -w`, `markdownlint --fix`, any tool with `-w` or `--fix` flags
  - Example: `guard_plan_only_mode "shfmt -w"` → exits 1
- **verification:** Pre-commit hooks and validation scripts
  - `verifier.sh`, `pre-commit run`
  - Example: `guard_plan_only_mode "pre-commit"` → exits 1

## Allowed Categories (PLAN-ONLY mode)

- **read:** Read-only operations
  - `cat`, `grep`, `git status`, `git diff`, `git log`, `ls`, `find`
  - Example: `guard_plan_only_mode "grep"` → exits 0, no output
- **plan-write:** Edits to planning documents
  - Modifications to `workers/workers/IMPLEMENTATION_PLAN.md` only
  - Example: `guard_plan_only_mode "edit workers/IMPLEMENTATION_PLAN.md"` → exits 0

## Fail-Safe Design

- Violations print clear refusal message to stderr
- Violations return non-zero exit code (fail-safe)
- Loop continues execution (does not abort on guard refusal)
- Each action type logs refusal once (prevents spam)
