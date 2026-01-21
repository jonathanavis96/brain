#!/usr/bin/env python3
"""
Windows Window Manager for WSL
Controls Chrome windows on Windows using PowerShell from WSL
"""

import subprocess
import time
import logging
from typing import Optional, Tuple, Dict
from pathlib import Path

logger = logging.getLogger(__name__)

# PowerShell executable path in WSL
POWERSHELL_PATH = "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
SCRIPT_PATH = Path(__file__).parent / "windows_window_manager.ps1"


class WindowsWindowManager:
    """Manages Chrome browser windows on Windows from WSL."""
    
    def __init__(self):
        """Initialize window manager and detect monitor setup."""
        self.monitors = self._detect_monitors()
        self.left_monitor = self._get_left_monitor()
        self.right_monitor = self._get_right_monitor()
        
        logger.info(f"Detected {len(self.monitors)} monitors")
        if self.left_monitor:
            logger.info(f"Left monitor: {self.left_monitor['width']}x{self.left_monitor['height']} at ({self.left_monitor['x']}, {self.left_monitor['y']})")
        if self.right_monitor:
            logger.info(f"Right monitor: {self.right_monitor['width']}x{self.right_monitor['height']} at ({self.right_monitor['x']}, {self.right_monitor['y']})")
    
    def _run_powershell(self, args: list) -> Tuple[bool, str]:
        """Run PowerShell script with arguments."""
        try:
            cmd = [
                POWERSHELL_PATH,
                "-ExecutionPolicy", "Bypass",
                "-File", str(SCRIPT_PATH)
            ] + args
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False
            )
            
            if result.returncode == 0:
                return True, result.stdout.strip()
            else:
                logger.debug(f"PowerShell command failed: {result.stderr}")
                return False, result.stdout.strip()
        except Exception as e:
            logger.error(f"Error running PowerShell: {e}")
            return False, str(e)
    
    def _detect_monitors(self) -> list:
        """Detect Windows monitors using PowerShell."""
        try:
            cmd = [
                POWERSHELL_PATH,
                "-Command",
                "Add-Type -AssemblyName System.Windows.Forms; "
                "[System.Windows.Forms.Screen]::AllScreens | "
                "ForEach-Object { "
                "Write-Output \"$($_.Bounds.X),$($_.Bounds.Y),$($_.Bounds.Width),$($_.Bounds.Height),$($_.Primary)\" "
                "}"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=False)
            
            if result.returncode == 0:
                monitors = []
                for line in result.stdout.strip().split('\n'):
                    if line.strip():
                        parts = line.strip().split(',')
                        if len(parts) >= 5:
                            monitors.append({
                                'x': int(parts[0]),
                                'y': int(parts[1]),
                                'width': int(parts[2]),
                                'height': int(parts[3]),
                                'primary': parts[4].lower() == 'true'
                            })
                return monitors
        except Exception as e:
            logger.warning(f"Could not detect monitors: {e}")
        
        return []
    
    def _get_left_monitor(self) -> Optional[dict]:
        """Get the leftmost monitor (smallest x coordinate)."""
        if not self.monitors:
            return None
        return min(self.monitors, key=lambda m: m['x'])
    
    def _get_right_monitor(self) -> Optional[dict]:
        """Get the rightmost monitor (largest x coordinate)."""
        if not self.monitors:
            return None
        return max(self.monitors, key=lambda m: m['x'])
    
    def find_chrome_window(self, pid: Optional[int] = None, max_retries: int = 10, retry_delay: float = 0.5) -> Optional[str]:
        """Find Chrome window handle with retry logic.
        
        Args:
            pid: Optional process ID to find specific Chrome window
            max_retries: Maximum number of retries (default: 10 = 5 seconds)
            retry_delay: Delay between retries in seconds (default: 0.5s)
            
        Returns:
            Window handle string if found, None otherwise
        """
        for attempt in range(max_retries):
            args = ["-Action", "find"]
            if pid:
                args.extend(["-ProcessId", str(pid)])
                
            success, output = self._run_powershell(args)
            
            if success:
                # Parse output: HANDLE:12345\nTITLE:...\nPID:...
                handle = None
                for line in output.split('\n'):
                    if line.startswith('HANDLE:'):
                        handle = line.split(':', 1)[1]
                        logger.info(f"Found Chrome window: {handle} (PID: {pid if pid else 'any'}) after {attempt + 1} attempts")
                        return handle
            
            # Retry if not found
            if attempt < max_retries - 1:
                logger.debug(f"Chrome window not found (attempt {attempt + 1}/{max_retries}), retrying in {retry_delay}s...")
                time.sleep(retry_delay)
        
        logger.warning(f"Could not find Chrome window{f' for PID {pid}' if pid else ''} after {max_retries} attempts")
        return None
    
    def move_to_left_monitor(self, window_handle: str, width: int = 700, height: int = 700, pid: Optional[int] = None) -> bool:
        """
        Move window to top-left of left monitor with specified size.
        
        Args:
            window_handle: Window handle (legacy parameter, not used)
            width: Window width in pixels
            height: Window height in pixels
            pid: Optional process ID to target specific Chrome window
            
        Returns:
            True if successful
        """
        if not self.left_monitor:
            logger.error("No left monitor detected")
            return False
        
        # Calculate position (top-left corner of left monitor, with padding)
        x = self.left_monitor['x'] + 10
        y = self.left_monitor['y'] + 10
        
        logger.info(f"Moving window to left monitor at ({x}, {y}) size {width}x{height}{f' (PID: {pid})' if pid else ''}")
        
        args = [
            "-Action", "move",
            "-X", str(x),
            "-Y", str(y),
            "-Width", str(width),
            "-Height", str(height)
        ]
        if pid:
            args.extend(["-ProcessId", str(pid)])
        
        success, output = self._run_powershell(args)
        
        if success and "SUCCESS" in output:
            logger.info(f"✓ Window moved to left monitor")
            return True
        else:
            logger.error(f"Failed to move window: {output}")
            return False
    
    def minimize_window(self, window_handle: str, pid: Optional[int] = None) -> bool:
        """Minimize window.
        
        Args:
            window_handle: Window handle (legacy parameter, not used)
            pid: Optional process ID to target specific Chrome window
            
        Returns:
            True if successful
        """
        args = ["-Action", "minimize"]
        if pid:
            args.extend(["-ProcessId", str(pid)])
            
        success, output = self._run_powershell(args)
        
        if success and "SUCCESS" in output:
            logger.info("✓ Window minimized")
            return True
        else:
            logger.error(f"Failed to minimize window: {output}")
            return False


def position_browser_for_manual_action(action_type: str = "refresh", 
                                       captcha_size: bool = False,
                                       minimal_size: bool = False,
                                       medium_size: bool = False,
                                       pid: Optional[int] = None) -> Tuple[bool, Optional[str]]:
    """
    Position browser window on left monitor for manual user interaction.
    
    Args:
        action_type: Type of action ("refresh", "captcha", "site_name", "initial")
        captcha_size: If True, use CAPTCHA size (700x700)
        minimal_size: If True, use minimal size (200x200) - just refresh button
        medium_size: If True, use medium size (600x600) - typing + refresh
        pid: Optional process ID to target specific Chrome window
        
    Returns:
        Tuple of (success: bool, window_handle: Optional[str])
    """
    wm = WindowsWindowManager()
    window_handle = wm.find_chrome_window(pid=pid)
    
    if not window_handle:
        logger.error(f"Could not find Chrome window{f' for PID {pid}' if pid else ''}")
        return False, None
    
    # Choose size based on parameters
    if minimal_size:
        width, height = 200, 200  # Minimal - just refresh button
    elif medium_size:
        width, height = 600, 600  # Medium - typing + refresh
    elif captcha_size or action_type == "captcha":
        width, height = 700, 700  # Larger for CAPTCHA interaction
    else:
        width, height = 400, 300  # Default for refresh button
    
    success = wm.move_to_left_monitor(
        window_handle, 
        width=width, 
        height=height,
        pid=pid
    )
    
    return success, window_handle


def hide_browser(window_handle: Optional[str] = None, pid: Optional[int] = None) -> bool:
    """
    Hide browser window (minimize).
    
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
        logger.warning(f"Could not find Chrome window to hide{f' for PID {pid}' if pid else ''}")
        return False
    
    return wm.minimize_window(window_handle, pid=pid)


if __name__ == "__main__":
    # Test the window manager
    logging.basicConfig(level=logging.INFO)
    
    print("Testing Windows Window Manager from WSL...")
    print("\n1. Detecting monitors...")
    wm = WindowsWindowManager()
    
    print("\n2. Finding Chrome window...")
    window_handle = wm.find_chrome_window()
    if window_handle:
        print(f"   Found window: {window_handle}")
        
        print("\n3. Moving to left monitor (700x700)...")
        success = wm.move_to_left_monitor(window_handle, width=700, height=700)
        if success:
            print("   ✓ Success! Check your left monitor.")
            print("\n   Waiting 5 seconds...")
            time.sleep(5)
            
            print("\n4. Minimizing browser...")
            wm.minimize_window(window_handle)
            print("   ✓ Done!")
    else:
        print("   ✗ No Chrome window found. Please open Chrome first.")
