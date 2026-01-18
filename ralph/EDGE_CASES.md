# EDGE_CASES.md - Ralph Reference Guide

This file contains detailed examples, error recovery, and edge case handling. Referenced by PROMPT.md but NOT loaded every iteration - read only when needed.

## Commit Message Examples

### Conventional Commit Format

```
<type>(<scope>): <summary>

- Detail 1
- Detail 2

Co-authored-by: ralph-brain <ralph-brain@users.noreply.github.com>
Brain-Repo: ${BRAIN_REPO}
```

### Allowed Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes nor adds |
| `chore` | Maintenance, dependencies, tooling |
| `test` | Adding or updating tests |

### Allowed Scopes

| Scope | When to Use |
|-------|-------------|
| `ralph` | Changes to Ralph loop files (PROMPT, AGENTS, etc.) |
| `templates` | Changes to project templates |
| `kb` | Knowledge base additions/updates |
| `refs` | Reference documentation changes |
| `plan` | IMPLEMENTATION_PLAN.md updates |
| `loop` | loop.sh changes |

### Examples

**Feature addition:**
```
feat(templates): add lean PROMPT.project.md template

- References brain PROMPT.md instead of duplicating
- Includes project-specific validation section
- ~30 lines vs previous ~300 lines

Co-authored-by: ralph-brain <ralph-brain@users.noreply.github.com>
Brain-Repo: jonathanavis96/brain
```

**Bug fix:**
```
fix(loop): prevent concurrent ralph runs with lock file

- Add PID-based lock in /tmp/ralph-{repo}.lock
- Cleanup on exit via trap
- Clear error message if already running

Co-authored-by: ralph-brain <ralph-brain@users.noreply.github.com>
Brain-Repo: jonathanavis96/brain
```

**Documentation:**
```
docs(plan): update implementation plan

- Mark token-efficiency tasks complete
- Add discovered subtasks for loop.sh
- Reprioritize remaining work

Co-authored-by: ralph-brain <ralph-brain@users.noreply.github.com>
Brain-Repo: jonathanavis96/brain
```

## Plan Structure Template

When creating/updating IMPLEMENTATION_PLAN.md:

```markdown
# Implementation Plan

## High Priority
- [ ] 1. Task description (clear, actionable)
  - [ ] 1.1 Subtask if complex
  - [ ] 1.2 Another subtask
- [ ] 2. Another high priority task

## Medium Priority
- [ ] 3. Medium priority task
- [ ] 4. Another medium task

## Low Priority
- [ ] 5. Nice to have
- [ ] 6. Future consideration

## Completed
- [x] 0. Initial setup (moved here when done)
```

### Task Breakdown Rules

- A task is "atomic" when completable in ONE BUILD iteration
- Complex tasks get hierarchical subtasks: 1.1, 1.2, 1.3
- Each subtask should be independently verifiable
- If a task spans multiple files or concepts, break it down

## Error Recovery

### Build Fails
1. Read the error message carefully
2. Check if it's a pre-existing issue (search git log)
3. Fix the immediate error
4. Re-run validation
5. If stuck after 2 attempts, add `[BLOCKED: reason]` to the task and move to next

### Tests Fail
1. Determine if failure is from your changes or pre-existing
2. If pre-existing: note in plan, continue
3. If from your changes: fix before marking complete
4. Never mark a task complete if your changes broke tests

### Merge Conflicts
1. Do NOT force push
2. Pull latest: `git pull --rebase origin $(git branch --show-current)`
3. Resolve conflicts manually
4. If complex, add `[NEEDS-REVIEW: merge conflict]` and stop

### Unknown State
If you're unsure what state the codebase is in:
1. Run `git status` to see uncommitted changes
2. Run `git log --oneline -5` to see recent commits
3. Check IMPLEMENTATION_PLAN.md for last completed task
4. Resume from the first unchecked task

## Subagent Usage Patterns

### Reading/Discovery (up to 100 parallel)
```
- grep -r "pattern" . --include="*.ts"
- Find all files matching criteria
- Read multiple documentation files
- Search for existing implementations
```

### Building/Modification (exactly 1)
```
- File creation/modification
- Git operations
- Running build/test commands
- Any state-changing operation
```

**Why single subagent for builds?**
- Prevents race conditions
- Ensures atomic commits
- Maintains consistent state
- Avoids file write conflicts

## Context Discovery

### Where to Find Information

| Need | Location |
|------|----------|
| Project goals | THOUGHTS.md |
| Codebase map | NEURONS.md (read via subagent) |
| Task list | IMPLEMENTATION_PLAN.md |
| Validation commands | AGENTS.md |
| Patterns/conventions | kb/SUMMARY.md → specific domain files |
| React best practices | references/react-best-practices/HOTLIST.md |

### KB Lookup Order (Token Efficient)
1. `kb/SUMMARY.md` - Overview, when to use what
2. `references/*/HOTLIST.md` - Top 10 rules (covers 80% of cases)
3. Specific rule files - Only when HOTLIST doesn't cover your scenario

❌ Never scan all rules by default
✅ Use the hierarchy above

## Design Philosophy

### Core Principles
- **Prefer correctness over speed** - Get it right, then optimize
- **Search before creating** - Avoid duplicate implementations
- **Leave code working** - Each task should leave codebase testable
- **Update documentation** - Keep AGENTS.md operational, add to kb/ for patterns
- **Trust the loop** - It handles sequencing, you handle one task

### What Makes a Good Task
- Clear definition of done
- Single responsibility
- Independently verifiable
- Leaves codebase in working state

### What Makes a Bad Task
- Vague: "improve the code"
- Multi-part: "add X, Y, and Z"
- Unbounded: "refactor everything"
- Dependent: requires another task to be useful

## Safety Reminders

These are repeated from PROMPT.md for emphasis:

- **No force push** (`--force` / `--force-with-lease`) unless explicitly instructed
- **No destructive commands** (`rm -rf`, deleting directories) unless plan task explicitly says so
- **No secrets in commits** - Use placeholders, never real tokens
- **Search before creating** - Verify something doesn't exist before adding it
