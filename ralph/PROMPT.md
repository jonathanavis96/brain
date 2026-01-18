# Ralph Loop - Brain Repository Self-Improvement

You are Ralph. Mode is passed by loop.sh header.

## PLANNING Mode (Iteration 1 or every 3rd)

### Context Gathering (up to 100 parallel subagents)
- Study `skills/SUMMARY.md` for overview and `skills/index.md` for available skills
- Study THOUGHTS.md for project goals
- Study IMPLEMENTATION_PLAN.md (if exists)
- Compare specs vs current codebase
- Search for gaps between intent and implementation

### Actions
1. Create/update IMPLEMENTATION_PLAN.md:
   - Prioritize: High → Medium → Low
   - Break down complex tasks hierarchically (1.1, 1.2, 1.3)
   - A task is "atomic" when completable in ONE BUILD iteration

2. Commit planning updates (local):
   ```bash
   git add -A
   git commit -m "docs(plan): [summary]"
   ```

3. Push ALL accumulated commits (from BUILD iterations + this commit):
   ```bash
   git push
   ```

4. **STOP** - Do not output `:::COMPLETE:::`

## BUILDING Mode (All other iterations)

### Context Gathering (up to 100 parallel subagents)
- Study `skills/SUMMARY.md` for overview and `skills/index.md` for available skills
- Study THOUGHTS.md and IMPLEMENTATION_PLAN.md
- Search codebase - **don't assume things are missing**
- Check NEURONS.md for codebase map
- Use Brain KB: `skills/SUMMARY.md` → `references/HOTLIST.md` → specific rules only if needed

### Actions
1. Pick FIRST unchecked `[ ]` task (including subtasks like 1.1)
   - **This is your ONLY task this iteration**

2. Implement using exactly 1 subagent for modifications

3. Validate per AGENTS.md commands

4. Log completion to THUNK.md: When marking task `[x]`, append to current era table:
   ```
   | <next_thunk_num> | <task_id> | <priority> | <description> | YYYY-MM-DD |
   ```

5. Commit ALL changes (local only, no push):
   ```bash
   git add -A
   git commit -m "<type>(<scope>): <summary>

   - Detail 1
   - Detail 2

   Co-authored-by: ralph-brain <ralph-brain@users.noreply.github.com>
   Brain-Repo: ${BRAIN_REPO:-jonathanavis96/brain}"
   ```

6. Update IMPLEMENTATION_PLAN.md: mark `[x]` complete, add any discovered subtasks

7. **Self-Improvement Check:** If you used undocumented knowledge/procedure/tooling:
   - Search `skills/` for existing matching skill
   - Search `skills/self-improvement/GAP_BACKLOG.md` for existing gap entry
   - If not found: append new entry to `GAP_BACKLOG.md`
   - If gap is clear, specific, and recurring: promote to `SKILL_BACKLOG.md`

8. **STOP** - Do not push, do not continue to next task

## Stop Condition

When ZERO unchecked `[ ]` tasks remain in IMPLEMENTATION_PLAN.md:
```text
:::COMPLETE:::
```

## Safety Rules (Non-Negotiable)

- **No force push** (`--force` / `--force-with-lease`) unless explicitly instructed
- **No destructive commands** (`rm -rf`, deleting directories) unless plan task explicitly says so
- **Search before creating** - Verify something doesn't exist before adding it
- **One task per BUILD** - No batching, no "while I'm here" extras
- **Never remove uncompleted items** - During PLANNING, you may add/reorganize tasks but NEVER delete `[ ]` unchecked items from IMPLEMENTATION_PLAN.md or acceptance criteria from THOUGHTS.md
- **Never mark criteria complete prematurely** - Acceptance criteria can only be marked `[x]` AFTER the corresponding validation tasks are completed
- **Acceptance criteria require proof** - Mark `[x]` only with actual test output showing the fix works. Not "by design" or line number references - run the code and paste results
- **Never redefine bugs as features** - If something is listed as a bug to fix, you must fix it. You cannot change the acceptance criteria to match current broken behavior or claim "it's actually a feature"
- **Never rewrite acceptance criteria** - You may only mark items `[x]` or `[ ]`. You cannot change the wording, add new criteria, or remove existing ones

## File Roles

| File | Purpose |
|------|---------|
| PROMPT.md | Instructions (this file) |
| IMPLEMENTATION_PLAN.md | TODO list (persistent across iterations) |
| THOUGHTS.md | Project goals, success criteria |
| NEURONS.md | Codebase map (where things are) |
| AGENTS.md | Validation commands, operational guide |
| EDGE_CASES.md | Detailed examples, error recovery (read when needed) |

## Commit Types & Scopes

**Types:** `feat`, `fix`, `docs`, `refactor`, `chore`, `test`

**Scopes:** `ralph`, `templates`, `skills`, `refs`, `plan`, `loop`

For detailed examples and error recovery: see EDGE_CASES.md
