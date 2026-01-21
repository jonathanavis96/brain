# Implementation Plan - Rovo Account Manager

**Status:** Phase 3 (Window Management Fix)  
**Branch:** `main`  
**Last Updated:** 2026-01-21 21:30:00

## Mission

Build and maintain an autonomous Atlassian account pool management system with intelligent automation and minimal manual intervention.

## Current Status

### ✅ Completed Phases

- **Phase 1:** Core account creation flow (Gmail, Google Auth, browser automation)
- **Phase 2:** Batch creation, pool management, retry logic with manual fallbacks

### 📊 Progress Summary

- **Completed:** Phase 1-2 (~90% of core functionality)
- **Pending:** Phase 3 (window management fix - 4 tasks)
- **Accounts Created:** 38+
- **System Status:** Operational but requires manual window management

---

## Active Task Contracts

### Phase 3-Backup: Safety First (Priority: CRITICAL - DO THIS FIRST)

**Context:** Window management fix will modify 3 critical files. MUST backup before ANY changes.

---

#### **Task 3-B.1:** Create backup of window management files

- **Goal:** Create safety backup of all files that will be modified
- **Context:** About to modify PowerShell and Python window management code
- **Files to Backup:**
  1. `src/windows_window_manager.ps1` - PowerShell window controller
  2. `src/windows_window_manager.py` - Python wrapper
  3. `src/create_account.py` - Main account creation logic
- **Implementation:**
  ```bash
  # Create backup directory with timestamp
  BACKUP_DIR="backups/window-fix-$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  
  # Backup files
  cp src/windows_window_manager.ps1 "$BACKUP_DIR/"
  cp src/windows_window_manager.py "$BACKUP_DIR/"
  cp src/create_account.py "$BACKUP_DIR/"
  
  # Create backup manifest
  cat > "$BACKUP_DIR/MANIFEST.txt" << EOF
  Backup created: $(date '+%Y-%m-%d %H:%M:%S')
  Purpose: Window management fix (Phase 3)
  Files backed up:
    - src/windows_window_manager.ps1
    - src/windows_window_manager.py
    - src/create_account.py
  
  Restore command (if needed):
    cp $BACKUP_DIR/* src/
  EOF
  
  echo "Backup created in: $BACKUP_DIR"
  ```
- **AC:**
  - [ ] `backups/window-fix-YYYYMMDD-HHMMSS/` directory created
  - [ ] All 3 files copied to backup directory
  - [ ] `MANIFEST.txt` exists with restore instructions
  - [ ] Backup directory path printed to console
- **If Blocked:** Verify `src/` directory exists and files are present

---

### Phase 3-Window: Fix Window Management (Priority: HIGH)

**Context:** Window not moving to left monitor, not minimizing when idle, not maximizing for manual actions.

**Root Cause:** Missing maximize functionality, wrong ShowWindow flags, no show/hide logic around manual prompts.

**Strategy:** Add features incrementally, test each step, verify existing functionality not broken.

---

#### **Task 3-W.1:** Add maximize functionality to PowerShell script

- **Goal:** Add missing maximize action to windows_window_manager.ps1
- **Files:** `src/windows_window_manager.ps1`
- **Current State:** Has minimize, hide, show, move - but NO maximize
- **Changes:**
  
  **1. Add SW_MAXIMIZE constant (after line 8):**
  ```powershell
  # Line 8 is: [int]$SW_MINIMIZE = 6
  # Add after it:
  [int]$SW_MAXIMIZE = 3
  ```
  
  **2. Create Maximize-Window function (after Minimize-Window function):**
  ```powershell
  function Maximize-Window {
      param([IntPtr]$Handle)
      
      # Maximize window using ShowWindow API
      $result = [Win32]::ShowWindow($Handle, [Win32]::SW_MAXIMIZE)
      
      if ($result) {
          return $true
      } else {
          return $false
      }
  }
  ```
  
  **3. Add "maximize" case to switch statement (around line 185):**
  ```powershell
  "maximize" {
      $window = Find-ChromeWindow -ProcessId $ProcessId
      if ($window) {
          $handle = $window.Handle
          $result = Maximize-Window -Handle $handle
          
          if ($result) {
              Write-Output "SUCCESS:Window maximized"
          } else {
              Write-Output "ERROR:Failed to maximize window"
              exit 1
          }
      } else {
          Write-Output "ERROR:Chrome window not found"
          exit 1
      }
  }
  ```
  
  **4. Update help text (line ~172):**
  ```powershell
  # Change:
  Write-Host "Valid actions: minimize, hide, show, move"
  # To:
  Write-Host "Valid actions: minimize, maximize, hide, show, move"
  ```

- **AC:**
  - [ ] `$SW_MAXIMIZE = 3` constant added
  - [ ] `Maximize-Window` function exists
  - [ ] "maximize" case in switch statement
  - [ ] Help text includes "maximize"
  - [ ] Test: `powershell.exe src/windows_window_manager.ps1 -Action maximize -ProcessId <pid>` maximizes Chrome
  - [ ] Existing actions still work (test minimize, hide, show)

- **If Blocked:** Check Win32 ShowWindow constants at https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-showwindow

---

#### **Task 3-W.2:** Fix Move-Window to not show window when moving

- **Goal:** Allow moving window while keeping it minimized (remove conflicting flag)
- **Files:** `src/windows_window_manager.ps1`
- **Current Problem:** Line 125 uses `SWP_SHOWWINDOW` flag which restores minimized windows
- **Changes:**
  
  **Find line 125 (approximately):**
  ```powershell
  $flags = [Win32]::SWP_NOACTIVATE -bor [Win32]::SWP_NOZORDER -bor [Win32]::SWP_SHOWWINDOW
  ```
  
  **Change to:**
  ```powershell
  $flags = [Win32]::SWP_NOACTIVATE -bor [Win32]::SWP_NOZORDER
  ```
  
  **Explanation:** Remove `SWP_SHOWWINDOW` flag so window position can be changed without restoring from minimized state.

- **AC:**
  - [ ] `SWP_SHOWWINDOW` removed from Move-Window flags
  - [ ] Test sequence works:
    1. Open Chrome
    2. Move window to left monitor
    3. Minimize window
    4. Move window again (different position)
    5. Window should STAY minimized (not restore)
  - [ ] Existing move functionality still works (window moves to correct position)

- **If Blocked:** Research SetWindowPos flags at https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowpos

---

#### **Task 3-W.3:** Add maximize_window method to Python wrapper

- **Goal:** Expose maximize functionality to Python code
- **Files:** `src/windows_window_manager.py`
- **Current State:** Has minimize_window, hide_browser - but NO maximize_window or show_browser
- **Changes:**
  
  **1. Add maximize_window method to WindowsWindowManager class (after minimize_window):**
  ```python
  def maximize_window(self, window_handle: str, pid: Optional[int] = None) -> bool:
      """Maximize window.
      
      Args:
          window_handle: Window handle (legacy parameter, not used in Windows implementation)
          pid: Optional process ID to target specific Chrome window
          
      Returns:
          True if successful, False otherwise
      """
      args = ["-Action", "maximize"]
      if pid:
          args.extend(["-ProcessId", str(pid)])
          
      success, output = self._run_powershell(args)
      
      if success and "SUCCESS" in output:
          logger.info("✓ Window maximized")
          return True
      else:
          logger.error(f"✗ Failed to maximize window: {output}")
          return False
  ```
  
  **2. Add show_browser function (after hide_browser function, around line 175):**
  ```python
  def show_browser(window_handle: Optional[str] = None, pid: Optional[int] = None) -> bool:
      """
      Show and maximize browser window for manual interaction.
      
      This is typically called before asking user for manual input (CAPTCHA, refresh, etc.)
      
      Args:
          window_handle: Window handle (optional, will find Chrome window if None)
          pid: Optional process ID to target specific Chrome window
          
      Returns:
          True if successful, False otherwise
      """
      wm = WindowsWindowManager()
      
      # If no window handle provided, try to find Chrome window
      if window_handle is None:
          window_handle = wm.find_chrome_window(pid=pid)
      
      if not window_handle:
          logger.warning(f"Could not find Chrome window to show{f' for PID {pid}' if pid else ''}")
          return False
      
      # Maximize window to bring to front and make visible
      result = wm.maximize_window(window_handle, pid=pid)
      
      if result:
          logger.info("✓ Browser window shown and maximized for manual action")
      else:
          logger.warning("✗ Failed to show browser window")
      
      return result
  ```

- **AC:**
  - [ ] `maximize_window` method exists in WindowsWindowManager class
  - [ ] `show_browser` function exists at module level
  - [ ] Test from Python REPL:
    ```python
    from windows_window_manager import show_browser, hide_browser
    show_browser()  # Chrome maximizes
    hide_browser()  # Chrome minimizes
    ```
  - [ ] Both functions work correctly with Chrome running

- **If Blocked:** Use existing `minimize_window` and `hide_browser` as templates

---

#### **Task 3-W.4:** Use show_browser before manual action prompts

- **Goal:** Maximize window automatically when user needs to interact
- **Files:** `src/create_account.py`
- **Context:** Currently window stays minimized when CAPTCHA appears or refresh needed
- **Changes:**
  
  **1. Import show_browser (add to existing import from windows_window_manager):**
  ```python
  # Find line ~30 (approximately):
  from windows_window_manager import hide_browser, position_browser_for_manual_action
  
  # Change to:
  from windows_window_manager import hide_browser, show_browser, position_browser_for_manual_action
  ```
  
  **2. Find all manual action prompts and add show/hide logic:**
  
  **Search for these patterns in create_account.py:**
  - `input("Press Enter after solving CAPTCHA")`
  - `input("Press Enter after completing manual refresh")`
  - `input("Press Enter after typing account name")`
  - Any other `input()` calls that require user interaction
  
  **For each prompt, add:**
  ```python
  # BEFORE the input() call:
  if AUTO_HIDE_BROWSER and window_id:
      logger.info("📺 Showing browser for manual action...")
      show_browser(window_id, pid=self.browser_pid)
  
  # The existing input() call
  input("Press Enter after solving CAPTCHA...")
  
  # AFTER the input() call:
  if AUTO_HIDE_BROWSER and window_id:
      logger.info("🔽 Hiding browser again...")
      hide_browser(window_id, pid=self.browser_pid)
  ```
  
  **Example location (search for "CAPTCHA" to find):**
  ```python
  # Around line 850 (search for CAPTCHA handling)
  logger.info("⚠️  CAPTCHA detected!")
  
  # ADD THIS:
  if AUTO_HIDE_BROWSER and window_id:
      logger.info("📺 Showing browser for manual action...")
      show_browser(window_id, pid=self.browser_pid)
  
  input("Press Enter after solving CAPTCHA...")
  
  # ADD THIS:
  if AUTO_HIDE_BROWSER and window_id:
      logger.info("🔽 Hiding browser again...")
      hide_browser(window_id, pid=self.browser_pid)
  ```

- **AC:**
  - [ ] `show_browser` imported from windows_window_manager
  - [ ] Before EACH manual input prompt: `show_browser()` called
  - [ ] After EACH manual input complete: `hide_browser()` called
  - [ ] Full integration test:
    1. Run `./create-account.sh testaccount` (without --show)
    2. Window starts minimized
    3. When CAPTCHA appears: window maximizes automatically
    4. After solving CAPTCHA and pressing Enter: window minimizes
    5. Repeat for any additional manual prompts
  - [ ] Existing --show flag still works (window stays visible throughout)

- **If Blocked:** Search for `input(` in create_account.py to find all manual prompts

---

### Phase 3-Verify: Ensure Nothing Broken (Priority: HIGH)

---

#### **Task 3-V.1:** Integration test of full account creation flow

- **Goal:** Verify window management works end-to-end without breaking existing functionality
- **Files:** None (testing only)
- **Test Script:**
  
  ```bash
  #!/bin/bash
  # Test window management fix
  
  echo "=== Window Management Integration Test ==="
  echo ""
  
  echo "Test 1: Account creation WITHOUT --show flag"
  echo "Expected: Window minimizes at start, maximizes for CAPTCHA, minimizes after"
  ./create-account.sh test-window-fix-1
  read -p "Did window behave correctly? (y/n): " result1
  
  echo ""
  echo "Test 2: Account creation WITH --show flag"
  echo "Expected: Window stays visible on left monitor throughout"
  ./create-account.sh test-window-fix-2 --show
  read -p "Did window stay visible on left monitor? (y/n): " result2
  
  echo ""
  echo "Test 3: Manual refresh scenario (Attempt 2)"
  echo "Expected: Window maximizes for manual refresh, minimizes after"
  # Run with account that will fail initial check
  ./create-account.sh test-window-fix-3
  read -p "Did window maximize for refresh prompt? (y/n): " result3
  
  echo ""
  echo "=== Test Results ==="
  echo "Test 1 (minimize/maximize/minimize): $result1"
  echo "Test 2 (--show stays visible): $result2"
  echo "Test 3 (manual refresh): $result3"
  
  if [[ "$result1" == "y" && "$result2" == "y" && "$result3" == "y" ]]; then
      echo "✅ All tests passed!"
      exit 0
  else
      echo "❌ Some tests failed - check window management"
      exit 1
  fi
  ```

- **AC:**
  - [ ] Test 1 passes: Window minimizes/maximizes/minimizes correctly
  - [ ] Test 2 passes: --show flag works (window stays visible)
  - [ ] Test 3 passes: Manual refresh shows window correctly
  - [ ] No errors in logs during tests
  - [ ] Account creation still completes successfully
  - [ ] No existing functionality broken

- **If Blocked:** If tests fail, restore from backup: `cp backups/window-fix-YYYYMMDD-HHMMSS/* src/`

---

## Dependencies (DO NOT MODIFY)

**These files are dependencies but should NOT be modified:**
- `src/browser_automation.py` - Browser setup utilities
- `src/window_manager.py` - Abstract window manager interface
- `create-account.sh` - Bash wrapper script
- `src/gmail_*.py` - Gmail API utilities
- `src/authenticator_*.py` - Google Authenticator utilities

**If you need to understand these files, READ them but DO NOT CHANGE them.**

---

## Restore from Backup (If Needed)

If something goes wrong during Phase 3:

```bash
# List available backups
ls -ltr backups/

# Restore from most recent backup
BACKUP_DIR=$(ls -t backups/ | head -1)
cp "backups/$BACKUP_DIR/"*.ps1 src/
cp "backups/$BACKUP_DIR/"*.py src/

# Verify restoration
echo "Restored files from: backups/$BACKUP_DIR"
cat "backups/$BACKUP_DIR/MANIFEST.txt"
```

---

## Notes for Ralph

- **Start with Task 3-B.1** - MUST backup before ANY changes
- Test each task independently before moving to next
- If ANY test fails, STOP and restore from backup
- Verify existing functionality after each change
- Full integration test (3-V.1) required before considering Phase 3 complete
- If blocked, document in GAP_BACKLOG.md - DO NOT guess or break working code

---

**Next Planning Session:** After Phase 3 complete, review for additional automation improvements
