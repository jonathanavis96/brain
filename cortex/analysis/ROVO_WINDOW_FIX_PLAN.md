# Rovo Window Management Fix - Atomic Plan

**Date:** 2026-01-21 21:15:00  
**Project:** Rovo Account Manager  
**Issue:** Window not moving to left monitor correctly and missing maximize functionality

---

## Problem Summary

**Current Behavior:**
- Window attempts to move to left monitor
- `Move-Window` function uses `SWP_SHOWWINDOW` flag which shows the window
- This conflicts with minimize operation
- No maximize function exists for showing window when manual action needed

**Expected Behavior:**
- Move to left monitor (minimize if `--show` not used)
- Stay minimized during automation
- **MAXIMIZE and bring to front** when manual action needed (CAPTCHA, refresh, etc.)
- Minimize again after manual action complete

---

## Atomic Tasks for Ralph

### Phase 0-Window: Window Management Fixes (Priority: HIGH)

---

#### **Task 0-W.1:** Add maximize functionality to PowerShell script

- **Goal:** Add missing maximize action to windows_window_manager.ps1
- **Files:** `src/windows_window_manager.ps1`
- **Changes:**
  1. Add `SW_MAXIMIZE` constant (value: 3) to Win32 class
  2. Create `Maximize-Window` function:
     ```powershell
     function Maximize-Window {
         param([IntPtr]$Handle)
         $result = [Win32]::ShowWindow($Handle, [Win32]::SW_MAXIMIZE)
         return $result
     }
     ```
  3. Add "maximize" case to switch statement:
     ```powershell
     "maximize" {
         $window = Find-ChromeWindow -ProcessId $ProcessId
         $handle = $window.Handle
         if ($handle) {
             $result = Maximize-Window -Handle $handle
             if ($result) {
                 Write-Output "SUCCESS:Window maximized"
             } else {
                 Write-Output "ERROR:Failed to maximize window"
                 exit 1
             }
         } else {
             Write-Output "ERROR:Window not found"
             exit 1
         }
     }
     ```
  4. Update valid actions help text to include "maximize"

- **AC:**
  - [ ] `SW_MAXIMIZE = 3` constant added to Win32 class
  - [ ] `Maximize-Window` function exists and works
  - [ ] "maximize" action in switch statement
  - [ ] Test: `powershell.exe windows_window_manager.ps1 -Action maximize` maximizes Chrome
  
- **If Blocked:** Check Win32 API documentation for ShowWindow constants

---

#### **Task 0-W.2:** Fix Move-Window to not show window when moving

- **Goal:** Allow moving window while keeping it minimized
- **Files:** `src/windows_window_manager.ps1`
- **Current Problem:** `SWP_SHOWWINDOW` flag restores minimized windows
- **Changes:**
  1. Remove `SWP_SHOWWINDOW` from flags in Move-Window function
  2. Change line 125 to:
     ```powershell
     $flags = [Win32]::SWP_NOACTIVATE -bor [Win32]::SWP_NOZORDER
     ```
  3. Keep the restore logic (lines 119-122) for when window is minimized during move

- **AC:**
  - [ ] `SWP_SHOWWINDOW` removed from Move-Window flags
  - [ ] Window can be moved while minimized
  - [ ] Test: Move window, minimize it, move again - should stay minimized
  
- **If Blocked:** Research `SetWindowPos` flags on MSDN

---

#### **Task 0-W.3:** Add maximize_window method to Python wrapper

- **Goal:** Expose maximize functionality to Python code
- **Files:** `src/windows_window_manager.py`
- **Changes:**
  1. Add `maximize_window` method to `WindowsWindowManager` class:
     ```python
     def maximize_window(self, window_handle: str, pid: Optional[int] = None) -> bool:
         """Maximize window.
         
         Args:
             window_handle: Window handle (legacy parameter, not used)
             pid: Optional process ID to target specific Chrome window
             
         Returns:
             True if successful
         """
         args = ["-Action", "maximize"]
         if pid:
             args.extend(["-ProcessId", str(pid)])
             
         success, output = self._run_powershell(args)
         
         if success and "SUCCESS" in output:
             logger.info("✓ Window maximized")
             return True
         else:
             logger.error(f"Failed to maximize window: {output}")
             return False
     ```
  2. Add module-level `show_browser` function:
     ```python
     def show_browser(window_handle: Optional[str] = None, pid: Optional[int] = None) -> bool:
         """
         Show and maximize browser window.
         
         Args:
             window_handle: Window handle (optional, will find Chrome window if None)
             pid: Optional process ID to target specific Chrome window
             
         Returns:
             True if successful
         """
         wm = WindowsWindowManager()
         
         if window_handle is None:
             window_handle = wm.find_chrome_window(pid=pid)
         
         if not window_handle:
             logger.warning(f"Could not find Chrome window to show{f' for PID {pid}' if pid else ''}")
             return False
         
         return wm.maximize_window(window_handle, pid=pid)
     ```

- **AC:**
  - [ ] `maximize_window` method exists in WindowsWindowManager class
  - [ ] `show_browser` function exists at module level
  - [ ] Test: Call `show_browser()` from Python - Chrome maximizes
  
- **If Blocked:** Check existing `minimize_window` method as template

---

#### **Task 0-W.4:** Use show_browser when manual action needed

- **Goal:** Maximize window before asking user for manual action
- **Files:** `src/create_account.py`
- **Context:** Currently window is minimized but never restored when CAPTCHA/refresh needed
- **Changes:**
  1. Import `show_browser` from windows_window_manager (already imports hide_browser)
  2. Find all locations where manual action is requested:
     - CAPTCHA detection
     - Manual refresh prompts (Attempt 2, Attempt 3)
     - Manual site name entry prompts
  3. Before `input("Press Enter...")` prompts, add:
     ```python
     # Show browser for manual action
     if AUTO_HIDE_BROWSER and window_id:
         logger.info("Showing browser for manual action...")
         show_browser(window_id, pid=self.browser_pid)
     ```
  4. After manual action complete, re-hide:
     ```python
     # Hide browser again after manual action
     if AUTO_HIDE_BROWSER and window_id:
         logger.info("Hiding browser again...")
         hide_browser(window_id, pid=self.browser_pid)
     ```

- **AC:**
  - [ ] `show_browser` imported from windows_window_manager
  - [ ] Before each manual action prompt: window maximizes
  - [ ] After each manual action complete: window minimizes
  - [ ] Test full flow: Window minimizes at start, maximizes for CAPTCHA, minimizes after
  
- **If Blocked:** Search codebase for `input("Press Enter")` to find all manual action points

---

## Testing Plan

**Full Integration Test:**
1. Run `./bin/create-account.sh` (without --show flag)
2. Observe: Window moves to left monitor and minimizes immediately
3. When CAPTCHA appears: Window maximizes automatically
4. Solve CAPTCHA and press Enter
5. Observe: Window minimizes again
6. Repeat for any additional manual actions

**Expected Result:**
- ✅ Window on left monitor throughout
- ✅ Minimized when no action needed
- ✅ Maximized when CAPTCHA/manual action needed
- ✅ Re-minimized after action complete

---

## Dependencies

**None** - All tasks can be done independently, but test order:
1. 0-W.1 (PowerShell maximize)
2. 0-W.2 (Fix move flags)
3. 0-W.3 (Python wrapper)
4. 0-W.4 (Use in create_account.py)

---

## Notes

- **WSL Environment:** Using PowerShell from WSL to control Windows GUI
- **No X11/wmctrl:** Cannot use Linux tools on Windows 11
- **Window Handle:** Using PID to find Chrome window
- **Multiple Monitors:** Left monitor detection works, just need maximize logic

---

**Estimated Time:** 1-2 hours for all 4 tasks
**Complexity:** Low (straightforward Win32 API additions)
