# Rovo Account Manager - Agent Guidance

## Quick Start

**Read this file first, then:**
1. Read `THOUGHTS.md` for current mission
2. Run `bash cortex/rovo/snapshot.sh` for current state
3. Check `IMPLEMENTATION_PLAN.md` for tasks

---

## Project Overview

**Type:** Python automation system with browser control  
**Tech Stack:** Python, Selenium, PowerShell (WSL), Gmail API  
**Environment:** WSL on Windows 11 (NO X11/wmctrl)

**Goal:** Autonomous Atlassian account pool management

---

## File Access

| File | Purpose |
|------|---------|
| `THOUGHTS.md` | Current mission (max 100 lines) |
| `IMPLEMENTATION_PLAN.md` | Tasks with AC |
| `PROMPT.md` | Ralph loop mechanics |
| `docs/PROMPT_REFERENCE.md` | Detailed reference |

---

## Paths

**Local (rovo project):**
- `~/code/rovo/src/` - Python source
- `~/code/rovo/bin/` - Bash scripts
- `~/code/rovo/config/` - JSON configs

**Brain (skills reference):**
- `~/code/brain/skills/SUMMARY.md` - Start here
- `~/code/brain/skills/domains/shell/` - Shell patterns
- `~/code/brain/skills/self-improvement/GAP_BACKLOG.md` - Gap capture

---

## Key Rules

1. **Scope restriction** - Only modify files in `~/code/rovo/`
2. **Backup before changes** - Always backup files you'll modify
3. **Test incrementally** - Verify each change before moving on
4. **WSL environment** - Use PowerShell for Windows GUI control

---

## Validation (before marking task complete)

```bash
cd ~/code/rovo
bash -n bin/*.sh              # Syntax check
shellcheck bin/*.sh           # Static analysis (if installed)
python3 -m py_compile src/*.py  # Python syntax
```

---

## Window Management Pattern

**Call chain:** Python → PowerShell → Win32 API

```python
# In create_account.py
from windows_window_manager import show_browser, hide_browser

hide_browser()  # During automation
show_browser()  # Before manual input (CAPTCHA)
```

---

## Self-Improvement

End of iteration, if you used undocumented knowledge:
1. Check `brain/skills/` for existing skill
2. Check `brain/skills/self-improvement/GAP_BACKLOG.md`
3. If not found: append to GAP_BACKLOG.md

---

## See Also

- **Detailed reference:** `docs/PROMPT_REFERENCE.md`
- **Current mission:** `THOUGHTS.md`
- **Tasks:** `IMPLEMENTATION_PLAN.md`
