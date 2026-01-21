# Rovo Account Manager - Prompt Reference

Detailed rules, examples, and troubleshooting. Read on-demand, not injected.

---

## IMPLEMENTATION_PLAN.md Formatting Rules

### Phase Sections Required
```markdown
## Phase 1: Foundation
## Phase 2: Core Features
## Phase 3: Window Management Fix
```

### Checkbox Format Required
```markdown
- [ ] **1.1** - Pending task
- [x] **1.2** - Completed task
- [?] **1.3** - Proposed done, awaiting verification
```

### Never Delete Tasks
- Keep completed tasks as history
- Keep empty phases as completed phase markers

---

## Validation Commands

```bash
# Syntax check all bash scripts
for f in bin/*.sh; do [ -f "$f" ] && bash -n "$f" && echo "✓ $f syntax OK"; done

# Shellcheck (if installed)
command -v shellcheck &>/dev/null && shellcheck bin/*.sh || echo "shellcheck not installed"

# Verify executable permissions
find bin/ -name "*.sh" ! -perm -111 -exec echo "⚠ Missing +x: {}" \;

# Validate JSON config files
for f in config/*.json state/*.json; do [ -f "$f" ] && jq '.' "$f" >/dev/null && echo "✓ $f valid JSON"; done 2>/dev/null

# Check for hardcoded credentials (security)
grep -rn "password\s*=" bin/ --include="*.sh" && echo "⚠ Possible hardcoded password!" || echo "✓ No hardcoded passwords"
```

---

## Skills Reference (Brain Integration)

When Brain repository is available at `~/code/brain/`:

| Need | Location |
|------|----------|
| Shell patterns | `brain/skills/domains/shell/` |
| Error fixes | `brain/skills/SUMMARY.md` → Error table |
| Gap capture | `brain/skills/self-improvement/GAP_BACKLOG.md` |

**Progressive disclosure:**
1. `brain/skills/SUMMARY.md` - Overview first
2. Specific domain skill only if needed
3. Never scan all skills

---

## Project Architecture

```
~/code/rovo/                    ← Project root
├── bin/                        ← Bash scripts
├── src/                        ← Python source
│   ├── create_account.py       ← Main account creation
│   ├── windows_window_manager.py   ← Python wrapper
│   └── windows_window_manager.ps1  ← PowerShell controller
├── config/                     ← JSON configs
├── state/                      ← Runtime state
└── cortex/rovo/               ← Planning layer (in brain repo)
    ├── AGENTS.md              ← Quick reference
    ├── THOUGHTS.md            ← Current mission
    ├── IMPLEMENTATION_PLAN.md ← Tasks
    └── docs/                  ← This reference
```

---

## Window Management (WSL/Windows 11)

**Environment:** WSL on Windows 11 - NO X11/wmctrl

**Pattern:** Python → PowerShell → Win32 API
```
create_account.py 
  → windows_window_manager.py (subprocess call)
    → windows_window_manager.ps1 (PowerShell)
      → Win32 ShowWindow/SetWindowPos APIs
```

**Key Functions:**
- `hide_browser()` - Minimize window during automation
- `show_browser()` - Maximize window for manual action
- `move_window()` - Position on specific monitor

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Window not moving | Check PowerShell script, verify monitor coordinates |
| Window not maximizing | Verify SW_MAXIMIZE constant in .ps1 |
| Python subprocess hangs | Check PowerShell execution policy |
| CAPTCHA not visible | Call show_browser() before input() prompt |

---

## Self-Improvement Protocol

**End of each iteration:**

If you used undocumented knowledge:
1. Search `brain/skills/` for existing skill
2. Search `brain/skills/self-improvement/GAP_BACKLOG.md` for existing gap
3. If not found: append new entry to `GAP_BACKLOG.md`

See `brain/skills/self-improvement/GAP_CAPTURE_RULES.md` for details.
