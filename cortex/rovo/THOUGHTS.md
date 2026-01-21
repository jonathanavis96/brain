# Rovo Account Manager - Strategic Thoughts

**Last Updated:** 2026-01-21 21:30:00

## Current Mission

Build and maintain an autonomous Atlassian account pool management system that:
- Creates accounts on demand using Gmail and Google Authenticator
- Monitors account health and validates credentials
- Manages account lifecycle (creation, validation, reuse, burn detection)
- Minimizes manual intervention through intelligent automation

**Status:** Phase 1-2 mostly complete, Phase 3 (window management fix) in progress

---

## Strategic Analysis

### Project Context

**Type:** Python automation system with browser control  
**Tech Stack:** Python, Selenium WebDriver, PowerShell (WSL), Gmail API, Google Authenticator  
**Environment:** WSL on Windows 11 (cannot use X11/wmctrl for window management)

**Key Objectives:**
1. Minimize CAPTCHA interactions through account reuse
2. Automate recovery flows (account refresh, site name retry)
3. Maintain clean separation between automation and manual actions
4. Preserve work-in-progress (38+ accounts created, batch system operational)

### Current State Assessment

**Strengths:**
- ✅ Batch creation working (`create-accounts.sh`)
- ✅ Gmail monitoring operational
- ✅ Browser automation stable
- ✅ Pool reset logic implemented
- ✅ Retry logic with manual fallbacks functional

**Critical Issue (Phase 3):**
- ❌ **Window management broken:** Browser window NOT behaving correctly
  - Does NOT move to left monitor as intended
  - Does NOT minimize when no interaction needed
  - Does NOT maximize when manual action required (CAPTCHA, refresh prompts)
  - User must manually manage window positioning

**Root Cause:**
- Missing maximize functionality in PowerShell window manager
- `Move-Window` function uses `SWP_SHOWWINDOW` flag which conflicts with minimize
- No logic to show/maximize window before manual action prompts
- Window positioning code incomplete for WSL/Windows 11 environment

**Impact:**
- Manual window management wastes time during batch creation
- Window stays visible on wrong monitor during automation
- User must manually restore window for CAPTCHA/refresh actions

---

## Planning Session Log

### 2026-01-21 21:30:00 - Window Management Fix Analysis

**Context:** User reported window not moving to left monitor and not maximizing for manual actions.

**Actions Taken:**
1. Analyzed `create-account.sh`, `create_account.py`, window manager files
2. Identified missing maximize functionality in PowerShell script
3. Found `SWP_SHOWWINDOW` flag conflict in `Move-Window` function
4. Discovered no show/maximize logic before manual input prompts

**Root Cause Confirmed:**
- PowerShell script lacks `SW_MAXIMIZE` constant and `Maximize-Window` function
- Python wrapper lacks `maximize_window` and `show_browser` functions
- `create_account.py` never calls show/maximize before asking for user input
- Window move operation restores minimized windows due to wrong flags

**Solution Designed:**
- Add maximize functionality to PowerShell (SW_MAXIMIZE constant, Maximize-Window function)
- Fix Move-Window to not show window when moving (remove SWP_SHOWWINDOW flag)
- Add maximize_window and show_browser to Python wrapper
- Call show_browser before manual action prompts, hide_browser after

**Risk Mitigation:**
- **MUST backup all affected files before changes**
- Test each change incrementally (PowerShell → Python → Integration)
- Verify existing functionality not broken (hide, move, minimize still work)
- Full integration test with real account creation flow

**Next Steps:**
1. Create backup of affected files (safety net)
2. Add maximize to PowerShell script (atomic change)
3. Fix Move-Window flags (atomic change)
4. Add Python wrapper methods (atomic change)
5. Integrate into create_account.py (atomic change)
6. Test full flow end-to-end

---

## Knowledge Gaps

**Documented:**
- WSL/Windows 11 window management patterns (using PowerShell from WSL)
- Win32 ShowWindow API constants and behavior
- Selenium window handle management in multi-monitor setup

**To Be Captured:**
- If window management works reliably, add pattern to brain/skills/
- Document WSL → PowerShell → Win32 API calling pattern
- Record multi-monitor positioning strategies

---

## Success Metrics

**Immediate (Phase 3):**
- ✅ Window moves to left monitor and stays there
- ✅ Window minimizes when no interaction needed
- ✅ Window maximizes automatically before CAPTCHA/manual prompts
- ✅ Window re-minimizes after manual action complete
- ✅ No existing functionality broken

**Long-term:**
- Batch creation runs with minimal user intervention
- Window management is fully automated
- CAPTCHA success rate remains high (>90%)
- Account pool maintains healthy size (40+ active accounts)

---

## Files to Modify (Phase 3 Window Fix)

**Must Backup Before Changes:**
1. `src/windows_window_manager.ps1` - PowerShell window controller
2. `src/windows_window_manager.py` - Python wrapper for PowerShell
3. `src/create_account.py` - Main account creation logic

**Dependencies (DO NOT MODIFY):**
- `src/browser_automation.py` - Browser setup and utilities
- `src/window_manager.py` - Abstract window manager interface
- `create-account.sh` - Bash wrapper (no changes needed)

---

## Notes for Ralph

- **CRITICAL:** Backup files before ANY changes
- Test each change independently before moving to next
- Verify existing hide/minimize still works after changes
- Full integration test required before considering complete
- If blocked, document issue in GAP_BACKLOG.md (do NOT break working code)

---

**Next Review:** After Phase 3 window fix complete
