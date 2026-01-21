# Ralph Loop - Rovo Account Manager

You are Ralph. Mode is passed by loop.sh header.

## Core Mechanics

Read `~/code/brain/workers/ralph/PROMPT.md` for full Ralph loop mechanics (PLANNING vs BUILDING modes, commit flow, stop conditions).

## Project Context Files

| File | Purpose |
|------|---------|
| `THOUGHTS.md` | Current mission - **READ FIRST** |
| `IMPLEMENTATION_PLAN.md` | Tasks with phases and AC |
| `AGENTS.md` | Quick reference, validation commands |
| `docs/PROMPT_REFERENCE.md` | Detailed reference (on-demand) |

## ⚠️ Critical Constraints

1. **Scope restriction** - Only modify files in `~/code/rovo/`
2. **IMPLEMENTATION_PLAN.md is append-only** - Never delete tasks, only mark `[x]`
3. **One task per iteration** - Complete exactly ONE task, then STOP
4. **Backup before changes** - Always backup files you'll modify

## Paths

**Local (rovo project):**
```
~/code/rovo/
├── bin/           # Bash scripts
├── src/           # Python source
├── config/        # JSON configs
└── state/         # Runtime state
```

**Brain (skills reference):**
```
~/code/brain/
├── skills/SUMMARY.md              # Start here for errors
├── skills/domains/shell/          # Shell patterns
└── skills/self-improvement/
    └── GAP_BACKLOG.md             # Append gaps here
```

## Runtime Error Protocol

If a command/tool fails:
1. Stop and fix first
2. Open `~/code/brain/skills/SUMMARY.md` → Error Quick Reference
3. Read the single best-matching skill doc
4. Apply minimum fix and re-run

Rule: only 1 "obvious" quick attempt before doing the lookup.

## Task Completion Flow

1. **Validate** using commands in AGENTS.md
2. **Log to THUNK.md** - Append row to current table
3. **Commit** all changes (local only)
4. **Update** IMPLEMENTATION_PLAN.md: mark `[x]`

## Validation Commands

```bash
cd ~/code/rovo

# Syntax check bash scripts
for f in bin/*.sh; do [ -f "$f" ] && bash -n "$f" && echo "✓ $f"; done

# Python syntax
python3 -m py_compile src/*.py

# Shellcheck (if installed)
command -v shellcheck &>/dev/null && shellcheck bin/*.sh
```

## Self-Improvement Protocol

End of each BUILD iteration, if you used undocumented knowledge:
1. Search `~/code/brain/skills/` for existing skill
2. Search `~/code/brain/skills/self-improvement/GAP_BACKLOG.md` for existing gap
3. If not found: append new entry to `GAP_BACKLOG.md`

## Reference Materials

- `~/code/rovo-deprecated/` - Previous implementation (reference only)
- `~/code/rovo-deprecated/docs/LEGACY_POWERSHELL_KNOWLEDGE.md` - PowerShell knowledge
