#!/usr/bin/env python3
"""
Window management utilities for positioning browser windows.

Handles moving browser to specific monitor, resizing, and setting always-on-top.
Requires: wmctrl, xdotool (install via: sudo apt-get install wmctrl xdotool)
"""

import subprocess
import time
import logging
from typing import Optional, Tuple

logger = logging.getLogger(__name__)


class WindowManager:
    """Manages browser window positioning and behavior."""
    
    def __init__(self):
        """Initialize window manager and detect monitor setup."""
        self.monitors = self._detect_monitors()
        self.left_monitor = self._get_left_monitor()
        logger.info(f"Detected {len(self.monitors)} monitors")
        if self.left_monitor:
            logger.info(f"Left monitor: {self.left_monitor['width']}x{self.left_monitor['height']} at ({self.left_monitor['x']}, {self.left_monitor['y']})")
    
    def _detect_monitors(self) -> list:
        """Detect available monitors using xrandr."""
        try:
            result = subprocess.run(['xrandr', '--listmonitors'], 
                                  capture_output=True, text=True, check=True)
            monitors = []
            for line in result.stdout.split('\n'):
                # Parse lines like: " 1: +XWAYLAND1 1920/531x1080/299+0+120  XWAYLAND1"
                if ':' in line and '+' in line:
                    parts = line.split()
                    if len(parts) >= 3:
                        # Extract resolution and position: "1920/531x1080/299+0+120"
                        geo = parts[2]
                        # Split by '+' to get position
                        geo_parts = geo.split('+')
                        if len(geo_parts) >= 3:
                            # Parse "1920/531x1080/299"
                            res_part = geo_parts[0]
                            # Extract width and height: "1920/531x1080/299"
                            width = int(res_part.split('/')[0])
                            height_part = res_part.split('x')[1]  # "1080/299"
                            height = int(height_part.split('/')[0])
                            x = int(geo_parts[1])
                            y = int(geo_parts[2])
                            
                            monitors.append({
                                'width': width,
                                'height': height,
                                'x': x,
                                'y': y
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
    
    def find_chrome_window(self) -> Optional[str]:
        """Find Chrome/Chromium window ID."""
        try:
            # Try different window title patterns
            patterns = ['Chrome', 'Chromium', 'Google Chrome']
            for pattern in patterns:
                result = subprocess.run(['xdotool', 'search', '--name', pattern],
                                      capture_output=True, text=True, check=False)
                if result.returncode == 0 and result.stdout.strip():
                    window_ids = result.stdout.strip().split('\n')
                    if window_ids:
                        logger.info(f"Found Chrome window: {window_ids[0]}")
                        return window_ids[0]
        except Exception as e:
            logger.warning(f"Could not find Chrome window: {e}")
        return None
    
    def move_to_left_monitor(self, window_id: str, width: int = 400, height: int = 300, 
                            always_on_top: bool = True, no_focus: bool = True) -> bool:
        """
        Move window to top-left of left monitor with specified size.
        
        Args:
            window_id: X11 window ID
            width: Window width in pixels (default: 400 for minimal refresh button visibility)
            height: Window height in pixels (default: 300)
            always_on_top: Keep window on top of others
            no_focus: Don't steal keyboard/mouse focus
            
        Returns:
            True if successful
        """
        if not self.left_monitor:
            logger.error("No left monitor detected")
            return False
        
        try:
            # Calculate position (top-left corner of left monitor, with small padding)
            x = self.left_monitor['x'] + 10
            y = self.left_monitor['y'] + 10
            
            logger.info(f"Moving window {window_id} to left monitor at ({x}, {y}) size {width}x{height}")
            
            # Unminimize window first
            subprocess.run(['xdotool', 'windowactivate', '--sync', window_id],
                         check=False)
            time.sleep(0.5)  # Longer delay to ensure window is fully activated
            
            # Move and resize window using xdotool (works with Wayland/XWayland)
            # Use --sync flag to ensure command completes before continuing
            # xdotool windowmove <window_id> <x> <y>
            result = subprocess.run(['xdotool', 'windowmove', '--sync', window_id, str(x), str(y)],
                                  capture_output=True, text=True, check=False)
            if result.returncode == 0:
                logger.info(f"✓ Window move command executed to ({x}, {y})")
            else:
                logger.warning(f"Window move may have failed: {result.stderr}")
            
            time.sleep(0.3)  # Small delay between move and resize
            
            # xdotool windowsize <window_id> <width> <height>
            result = subprocess.run(['xdotool', 'windowsize', '--sync', window_id, str(width), str(height)],
                                  capture_output=True, text=True, check=False)
            if result.returncode == 0:
                logger.info(f"✓ Window resize command executed to {width}x{height}")
            else:
                logger.warning(f"Window resize may have failed: {result.stderr}")
            
            # Set always-on-top if requested (try wmctrl, fall back if fails)
            if always_on_top:
                try:
                    result = subprocess.run(['wmctrl', '-i', '-r', window_id, '-b', 'add,above'],
                                          check=False, capture_output=True, text=True)
                    if result.returncode == 0:
                        logger.info("✓ Set always-on-top")
                    else:
                        logger.warning(f"Could not set always-on-top (wmctrl not working): {result.stderr}")
                        logger.info("Note: Window positioned but not always-on-top")
                except FileNotFoundError:
                    logger.info("Note: wmctrl not installed - window positioned but not always-on-top")
                except Exception as e:
                    logger.debug(f"Could not set always-on-top: {e}")
            
            # Remove focus if requested (move focus back to previous window)
            if no_focus:
                # Get the previously active window and activate it
                result = subprocess.run(['xdotool', 'getactivewindow'],
                                      capture_output=True, text=True, check=False)
                if result.returncode == 0 and result.stdout.strip():
                    prev_window = result.stdout.strip()
                    if prev_window != window_id:
                        subprocess.run(['xdotool', 'windowactivate', prev_window],
                                     check=False)
                        logger.info("✓ Focus returned to previous window")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to move window: {e}")
            return False
    
    def minimize_window(self, window_id: str) -> bool:
        """Minimize window."""
        try:
            subprocess.run(['xdotool', 'windowminimize', window_id], check=True)
            logger.info(f"✓ Window {window_id} minimized")
            return True
        except Exception as e:
            logger.error(f"Failed to minimize window: {e}")
            return False
    
    def remove_always_on_top(self, window_id: str) -> bool:
        """Remove always-on-top property from window."""
        try:
            subprocess.run(['wmctrl', '-i', '-r', window_id, '-b', 'remove,above'],
                         check=True)
            logger.info(f"✓ Removed always-on-top from window {window_id}")
            return True
        except FileNotFoundError:
            logger.debug("wmctrl not installed - skipping always-on-top removal")
            return True  # Not an error, just not available
        except Exception as e:
            logger.debug(f"Could not remove always-on-top: {e}")
            return True  # Still not critical


def position_browser_for_manual_action(action_type: str = "refresh", 
                                       captcha_size: bool = False,
                                       minimal_size: bool = False,
                                       medium_size: bool = False) -> Tuple[bool, Optional[str]]:
    """
    Position browser window on left monitor for manual user interaction.
    
    Args:
        action_type: Type of action ("refresh", "captcha", "site_name", "initial")
        captcha_size: If True, use CAPTCHA size (700x700)
        minimal_size: If True, use minimal size (200x200) - just refresh button
        medium_size: If True, use medium size (600x600) - typing + refresh
        
    Returns:
        Tuple of (success: bool, window_id: Optional[str])
    """
    wm = WindowManager()
    window_id = wm.find_chrome_window()
    
    if not window_id:
        logger.error("Could not find Chrome window")
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
        window_id, 
        width=width, 
        height=height,
        always_on_top=True,
        no_focus=True
    )
    
    return success, window_id


def hide_browser(window_id: Optional[str] = None) -> bool:
    """
    Hide browser window (minimize and remove always-on-top).
    
    Args:
        window_id: X11 window ID (if None, will search for Chrome window)
        
    Returns:
        True if successful
    """
    wm = WindowManager()
    
    if window_id is None:
        window_id = wm.find_chrome_window()
    
    if not window_id:
        logger.warning("Could not find Chrome window to hide")
        return False
    
    # Remove always-on-top first
    wm.remove_always_on_top(window_id)
    
    # Then minimize
    wm.minimize_window(window_id)
    
    return True


if __name__ == "__main__":
    # Test the window manager
    logging.basicConfig(level=logging.INFO)
    
    print("Testing window manager...")
    print("\n1. Detecting monitors...")
    wm = WindowManager()
    
    print("\n2. Finding Chrome window...")
    window_id = wm.find_chrome_window()
    if window_id:
        print(f"   Found window: {window_id}")
        
        print("\n3. Moving to left monitor (minimal size for refresh)...")
        success = wm.move_to_left_monitor(window_id, width=400, height=300)
        if success:
            print("   ✓ Success!")
            print("\n   Waiting 5 seconds...")
            time.sleep(5)
            
            print("\n4. Hiding browser...")
            hide_browser(window_id)
            print("   ✓ Done!")
    else:
        print("   ✗ No Chrome window found. Please open Chrome first.")
