# Ralph Loop Changes

## 2026-01-18: Stale Lock Detection & Default Model Override

### Summary
Two improvements to Ralph loop reliability and model consistency:

1. **Stale Lock Detection**: Automatically detects and removes stale lock files from crashed/killed processes
2. **Default Model Override**: Ralph always uses Sonnet 4.5 by default, regardless of global rovodev config

### Stale Lock Detection
- Before acquiring lock, checks if the PID in the lock file is still running
- If the process is dead, automatically removes the stale lock and continues
- Shows message: `🧹 Removing stale lock (PID XXXX no longer running)`
- Handles race conditions in the noclobber fallback path

### Default Model Override
- Ralph now defaults to `anthropic.claude-sonnet-4-5-20250929-v1:0` when no `--model` is specified
- Creates a temp config file that overrides the model, so global config changes don't affect Ralph
- Added model version constants as single source of truth for easy updates
- Can still override with `--model opus` or `--model auto` (to use global setting)

### Files Changed
- `brain/ralph/loop.sh` - Added stale lock detection and model defaults
- `rovo-test/ralph/loop.sh` - Added lock logic with stale detection

---

## 2026-01-18: Token-Efficient Architecture

### Summary
Reduced per-iteration token load by ~84% through lean prompts and delegation model.

### Token Savings
| File | Before | After | Savings |
|------|--------|-------|---------|
| Brain PROMPT.md | 301 lines | 95 lines | 68% |
| Project PROMPT.md | ~300 lines | 39 lines | 88% |
| Project loop.sh | ~450 lines | 25 lines | 95% |

### New Files
- **EDGE_CASES.md** - Detailed examples, error recovery, commit formats (read on-demand, not preloaded)
- **CHANGES.md** - This file

### New Environment Variables
| Variable | Default | Purpose |
|----------|---------|---------|
| `BRAIN_ROOT` | `../brain` (sibling) | Path to brain repository |
| `BRAIN_REPO` | `jonathanavis96/brain` | GitHub repo for commit trailers |
| `RALPH_PROJECT_ROOT` | (auto) | Set by thin wrapper to delegate to brain's loop.sh |

### New Behavior

**Commit/Push Flow:**
- **BUILD mode**: Implements one task → validates → commits locally (no push) → STOP
- **PLANNING mode**: Updates plan → commits → pushes ALL accumulated commits → STOP

**Branch Handling:**
- Auto-creates `{repo}-work` branch (e.g., `NeoQueue-work`, `brain-work`)
- Repo name derived from git remote URL (stable across machines), falls back to folder name
- Safe checkout (no accidental history resets)
- Sets upstream automatically on first push

**Lock File:**
- Prevents concurrent Ralph runs via `/tmp/ralph-{repo}-{hash}.lock`
- Hash derived from repo path (unique even for same-named repos in different locations)
- Contains PID for debugging
- Auto-cleanup on exit

**Project Delegation:**
- Projects use thin wrapper `loop.sh` (~25 lines)
- Delegates to brain's `loop.sh` via `RALPH_PROJECT_ROOT`
- Brain repo must be sibling or set via `BRAIN_ROOT`

### Commit Format
```
<type>(<scope>): <summary>

- Detail 1
- Detail 2

Co-authored-by: ralph-brain <ralph-brain@users.noreply.github.com>
Brain-Repo: jonathanavis96/brain
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
**Scopes:** `ralph`, `templates`, `kb`, `refs`, `plan`, `loop`

### Migration
For existing projects:
1. Replace `ralph/PROMPT.md` with lean version from `brain/ralph/templates/ralph/PROMPT.project.md`
2. Replace `ralph/loop.sh` with thin wrapper from `brain/ralph/templates/ralph/loop.sh`
3. Update placeholders: `__REPO_NAME__` → your project name
