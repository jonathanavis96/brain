# Ralph Loop - rovo-account-manager

You are Ralph. Mode is passed by loop.sh header.

## Core Mechanics

Read `../../brain/ralph/PROMPT.md` for full Ralph loop mechanics (PLANNING vs BUILDING modes, commit flow, stop conditions).

## Project Context Files

| File | Purpose |
|------|---------|
| THOUGHTS.md | Project vision, three pillars of autonomy, architectural decisions - **READ FIRST** |
| NEURONS.md | Codebase map (read via subagent when needed) |
| IMPLEMENTATION_PLAN.md | TODO list with phases 1-4 (tasks 1.x-9.x) - **APPEND-ONLY** |
| AGENTS.md | Validation commands, project conventions |

## ⚠️ Critical Constraints

1. **IMPLEMENTATION_PLAN.md is append-only** - NEVER delete or remove tasks. Only mark completed with `[x]`.
2. **Follow dependencies** - Check the dependency diagram before starting any task.
3. **One task per iteration** - Complete exactly ONE unchecked task, then STOP.
4. **Reference the brain** - Use `../../brain/ralph/skills/` for patterns before implementing.

## Runtime Error Protocol (same iteration)

If a command/tool fails (traceback, syntax error, non-zero exit):
1. Stop and fix first.
2. Open `../../brain/ralph/skills/SUMMARY.md` → Error Quick Reference.
3. Read the single best-matching skill doc.
4. Apply the minimum fix and re-run the failing command.

Rule: only 1 "obvious" quick attempt before doing the lookup.

## Skills Reference

For patterns and best practices, use progressive disclosure:
1. `../../brain/ralph/skills/SUMMARY.md` - Skills overview
2. `../../brain/ralph/skills/domains/shell/` - Shell scripting patterns (critical for this project)
3. `../../brain/ralph/skills/self-improvement/GAP_CAPTURE_RULES.md` - Gap capture protocol
4. Specific skill files only if SUMMARY doesn't cover your scenario

❌ Never scan all rules by default
✅ Use the hierarchy above
✅ Shell patterns are especially relevant for this bash-heavy project

## Task Completion Flow

When marking a task `[x]` complete:

1. **Validate** using commands below
2. **Log to THUNK.md** - Append to current era table (DO NOT overwrite file):
   ```markdown
   | <next_thunk_num> | <task_id> | <priority> | <description> | YYYY-MM-DD |
   ```
3. **Commit** all changes (local only)
4. **Update** IMPLEMENTATION_PLAN.md: mark `[x]`, add discovered subtasks

⚠️ **THUNK.md is append-only** - Never rewrite or restructure it. Only append new rows to the existing table.

## Validation (before marking task complete)

```bash
# rovo-account-manager validation commands

# Syntax check all bash scripts
for f in bin/*.sh; do [ -f "$f" ] && bash -n "$f" && echo "✓ $f syntax OK"; done

# Shellcheck (if installed) - static analysis for shell scripts
command -v shellcheck &>/dev/null && shellcheck bin/*.sh || echo "shellcheck not installed - consider: sudo apt install shellcheck"

# Verify executable permissions
find bin/ -name "*.sh" ! -perm -111 -exec echo "⚠ Missing +x: {}" \;

# Validate JSON config files
for f in config/*.json state/*.json; do [ -f "$f" ] && jq '.' "$f" >/dev/null && echo "✓ $f valid JSON"; done 2>/dev/null

# Check for hardcoded credentials (security)
grep -rn "password\s*=" bin/ --include="*.sh" && echo "⚠ Possible hardcoded password!" || echo "✓ No hardcoded passwords"
```

## Self-Improvement Protocol

**End of each BUILD iteration**:

If you used undocumented knowledge/procedure/tooling:
1. Search `../../brain/ralph/skills/` for existing matching skill
2. Search `../../brain/ralph/skills/self-improvement/GAP_BACKLOG.md` for existing gap entry
3. If not found: append new entry to `GAP_BACKLOG.md`
4. If gap is clear, specific, and recurring: promote to `SKILL_BACKLOG.md`

See `../../brain/ralph/skills/self-improvement/GAP_CAPTURE_RULES.md` for details.

## Project-Specific Notes

### Scope Restriction
**IMPORTANT**: This Ralph instance should ONLY make changes within the `/home/grafe/code/rovo/` directory.
- ✅ Create/modify files in `rovo/bin/`, `rovo/config/`, `rovo/src/`, `rovo/ralph/`
- ✅ Read from `../../brain/ralph/skills/` for patterns
- ✅ Append to `../../brain/ralph/skills/self-improvement/GAP_BACKLOG.md` (self-improvement only)
- ❌ Never modify files outside `rovo/` except GAP_BACKLOG.md

### Reference Materials
- `../rovo-deprecated/` - Previous implementation (reference only, don't modify)
- `../rovo-deprecated/docs/LEGACY_POWERSHELL_KNOWLEDGE.md` - Detailed PowerShell knowledge to port

### Architecture Decisions
- Plain text credentials with chmod 600 (not GPG)
- Modular bash scripts in `bin/`
- JSON state files (`config.json`, `accounts.json`)
- Python/Selenium for browser automation only
- "Always one ahead" account pool strategy
