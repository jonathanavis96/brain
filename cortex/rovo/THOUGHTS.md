# Rovo Account Manager - Strategic Thoughts

**Last Updated:** 2026-01-21 23:35:00

## Current Mission

**Status:** Phase 3 - Window Management Fix  
**Goal:** Fix browser window behavior for manual actions

---

## Project Context

Autonomous Atlassian account pool management system:
- Creates accounts using Gmail + Google Authenticator
- Monitors account health and validates credentials
- Minimizes manual intervention through automation

**Environment:** WSL on Windows 11 (no X11/wmctrl)

---

## Current Issue (Phase 3)

**Problem:** Browser window NOT behaving correctly
- ❌ Does NOT move to left monitor
- ❌ Does NOT minimize during automation
- ❌ Does NOT maximize for manual actions (CAPTCHA)

**Root Cause:**
- Missing `SW_MAXIMIZE` in PowerShell script
- `SWP_SHOWWINDOW` flag conflicts with minimize
- No show/maximize before manual prompts

**Solution:**
1. Add maximize to PowerShell (`SW_MAXIMIZE`, `Maximize-Window`)
2. Fix `Move-Window` flags (remove `SWP_SHOWWINDOW`)
3. Add Python wrapper methods (`maximize_window`, `show_browser`)
4. Call `show_browser()` before input prompts

---

## Files to Modify

**Must Backup First:**
- `src/windows_window_manager.ps1` - PowerShell controller
- `src/windows_window_manager.py` - Python wrapper
- `src/create_account.py` - Main logic

**Do Not Modify:**
- `src/browser_automation.py` - Browser setup
- `src/window_manager.py` - Abstract interface

---

## Success Criteria

- [ ] Window moves to left monitor
- [ ] Window minimizes during automation
- [ ] Window maximizes before CAPTCHA/manual prompts
- [ ] Window re-minimizes after manual action
- [ ] Existing functionality preserved

---

## Completed Phases

- ✅ Phase 1: Foundation (batch creation, Gmail monitoring)
- ✅ Phase 2: Core features (pool reset, retry logic)
- 🔄 Phase 3: Window management fix (in progress)

---

## Next Steps

1. Create backup of affected files
2. Add maximize to PowerShell (atomic)
3. Fix Move-Window flags (atomic)
4. Add Python wrapper methods (atomic)
5. Integrate into create_account.py
6. Test full flow end-to-end
