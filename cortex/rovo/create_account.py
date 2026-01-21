#!/usr/bin/env python3
"""
create_account.py - Automate Atlassian account and site creation

This script automates the complete account creation flow:
1. Create Atlassian account with email verification
2. Create Rovo Dev site
3. Handle MFA challenges

Uses Selenium for browser automation and integrates with gmail-read-code.sh
for verification code extraction.
"""

import sys
import time
import random
import subprocess
import json
import argparse
from pathlib import Path
from typing import Optional
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Add parent directory to path to import browser_automation
sys.path.insert(0, str(Path(__file__).parent))
from browser_automation import (
    BrowserConfig, create_driver, safe_find_element, safe_click,
    safe_send_keys, wait_for_page_load, logger
)
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

# Import manual intervention handlers
try:
    from manual_intervention import wait_for_manual_refresh, wait_for_captcha_solved, wait_for_manual_site_name_entry
    MANUAL_INTERVENTION_AVAILABLE = True
except ImportError:
    MANUAL_INTERVENTION_AVAILABLE = False
    logger.warning("Manual intervention module not available - using fallback methods")

# Selector timing tracker for optimization
class SelectorTimer:
    """Track selector performance to identify slow selectors"""
    def __init__(self):
        self.timings = []
    
    def track(self, selector_type: str, selector: str, duration: float, success: bool):
        self.timings.append({
            'selector_type': selector_type,
            'selector': selector,
            'duration_ms': round(duration * 1000, 2),
            'success': success
        })
        status = "✓" if success else "✗"
        logger.info(f"SELECTOR {status} [{duration*1000:.0f}ms] {selector_type}={selector}")
    
    def report(self):
        if not self.timings:
            return
        logger.info("=" * 60)
        logger.info("SELECTOR TIMING REPORT")
        logger.info("=" * 60)
        total_time = sum(t['duration_ms'] for t in self.timings)
        failed = [t for t in self.timings if not t['success']]
        slow = [t for t in self.timings if t['duration_ms'] > 1000]
        
        logger.info(f"Total selectors: {len(self.timings)}")
        logger.info(f"Total time: {total_time:.0f}ms")
        logger.info(f"Failed: {len(failed)}")
        logger.info(f"Slow (>1s): {len(slow)}")
        
        if slow:
            logger.info("\nSLOW SELECTORS:")
            for t in sorted(slow, key=lambda x: -x['duration_ms']):
                logger.info(f"  [{t['duration_ms']:.0f}ms] {t['selector_type']}={t['selector']}")
        
        if failed:
            logger.info("\nFAILED SELECTORS:")
            for t in failed:
                logger.info(f"  [{t['duration_ms']:.0f}ms] {t['selector_type']}={t['selector']}")
        logger.info("=" * 60)

selector_timer = SelectorTimer()


# Refresh strategy tracker for optimization
class RefreshTracker:
    """Track different refresh strategies to find the most reliable method"""
    def __init__(self):
        self.attempts = []
        self.current_method_index = 0  # Track which method to try next
        self.methods = [
            "Clear storage and cache then reload",
            "JavaScript location.reload(true)",
            "CDP Page.reload",
            "Navigate away and back"
        ]
    
    def get_next_method_index(self):
        """Get the index of the next method to try, then rotate"""
        index = self.current_method_index
        self.current_method_index = (self.current_method_index + 1) % len(self.methods)
        return index
    
    def get_method_name(self, index):
        """Get the name of a method by index"""
        return self.methods[index]
    
    def track_attempt(self, method: str, success: bool, duration: float, error: str = None, details: dict = None):
        """Track a refresh attempt"""
        self.attempts.append({
            'method': method,
            'success': success,
            'duration_ms': round(duration * 1000, 2),
            'error': error,
            'details': details or {},
            'timestamp': time.time()
        })
        status = "✓" if success else "✗"
        logger.info(f"REFRESH {status} [{duration*1000:.0f}ms] Method: {method}{f' | Error: {error}' if error else ''}")
    
    def report(self):
        """Generate a report of all refresh attempts"""
        if not self.attempts:
            return
        
        logger.info("=" * 80)
        logger.info("REFRESH STRATEGY TRACKING REPORT")
        logger.info("=" * 80)
        
        total = len(self.attempts)
        successful = [a for a in self.attempts if a['success']]
        failed = [a for a in self.attempts if not a['success']]
        
        logger.info(f"Total refresh attempts: {total}")
        logger.info(f"Successful: {len(successful)} ({len(successful)/total*100:.1f}%)")
        logger.info(f"Failed: {len(failed)} ({len(failed)/total*100:.1f}%)")
        
        # Group by method
        methods = {}
        for attempt in self.attempts:
            method = attempt['method']
            if method not in methods:
                methods[method] = {'total': 0, 'success': 0, 'durations': []}
            methods[method]['total'] += 1
            if attempt['success']:
                methods[method]['success'] += 1
            methods[method]['durations'].append(attempt['duration_ms'])
        
        logger.info("\nMETHOD PERFORMANCE:")
        logger.info("-" * 80)
        for method, stats in sorted(methods.items(), key=lambda x: -x[1]['success']/x[1]['total']):
            success_rate = stats['success'] / stats['total'] * 100
            avg_duration = sum(stats['durations']) / len(stats['durations'])
            logger.info(f"  {method}:")
            logger.info(f"    Success Rate: {success_rate:.1f}% ({stats['success']}/{stats['total']})")
            logger.info(f"    Avg Duration: {avg_duration:.0f}ms")
        
        if failed:
            logger.info("\nFAILED ATTEMPTS DETAILS:")
            logger.info("-" * 80)
            for attempt in failed:
                logger.info(f"  Method: {attempt['method']}")
                logger.info(f"    Error: {attempt['error']}")
                if attempt['details']:
                    logger.info(f"    Details: {attempt['details']}")
        
        logger.info("=" * 80)

refresh_tracker = RefreshTracker()


def refresh_page_with_tracking(driver, attempt_label: str = "", method_index: int = None):
    """
    Try a SINGLE refresh strategy and track if it works.
    Only tries one method per call to avoid multiple refreshes.
    
    Args:
        driver: Selenium WebDriver instance
        attempt_label: Label for logging (e.g., "Attempt 2")
        method_index: Which method to use (0-5). If None, uses next in rotation.
    
    Available methods (rotates through them):
    0. Clear storage/cache then reload - Hard reset WITHOUT cookie clear
    1. JavaScript location.reload(true) - Force cache reload (baseline)
    2. CDP Page.reload - Browser DevTools Protocol (most reliable)
    3. Navigate away and back - Complete session reset
    
    Returns:
        bool: True if refresh succeeded (navigation type changed or no error)
    """
    # Determine which method to use
    if method_index is None:
        method_index = refresh_tracker.get_next_method_index()
    
    method_name = refresh_tracker.get_method_name(method_index)
    
    label = f" ({attempt_label})" if attempt_label else ""
    logger.info(f"{'='*80}")
    logger.info(f"REFRESH PAGE - Method #{method_index}: {method_name}{label}")
    logger.info(f"{'='*80}")
    
    # Track initial page state
    try:
        initial_url = driver.current_url
        initial_title = driver.title
        initial_nav_type = driver.execute_script("return performance.navigation.type")
        logger.info(f"Initial state: URL={initial_url}, Title={initial_title[:50]}, NavType={initial_nav_type}")
    except Exception as e:
        logger.warning(f"Could not get initial page state: {e}")
        initial_url = None
    
    # Track which element has focus and console errors before we start
    try:
        active_element = driver.switch_to.active_element
        active_tag = active_element.tag_name
        active_id = active_element.get_attribute('id') or 'N/A'
        active_class = active_element.get_attribute('class') or 'N/A'
        logger.info(f"Active element BEFORE refresh: <{active_tag}> id='{active_id}' class='{active_class}'")
        
        # Check console errors
        console_errors = driver.execute_script("return window.console.errors || []")
        if console_errors:
            logger.warning(f"Console errors before refresh: {console_errors}")
        
        # Check field state if it's an input
        if active_tag == 'input':
            field_value = active_element.get_attribute('value') or ''
            field_disabled = active_element.get_attribute('disabled')
            logger.info(f"Input field state: value='{field_value}', disabled={field_disabled}")
            
    except Exception as e:
        logger.warning(f"Could not detect active element: {e}")
        active_tag = "unknown"
    
    # Execute the selected method
    start_time = time.time()
    success = False
    error_msg = None
    details = {}
    
    try:
        if method_index == 0:
            # METHOD 0: Clear storage/cache then reload (NO COOKIES)
            logger.info("Executing: Clear storage and cache then reload (preserving cookies)")
            
            # Clear localStorage and sessionStorage
            driver.execute_script("window.localStorage.clear();")
            driver.execute_script("window.sessionStorage.clear();")
            logger.info("  Cleared localStorage and sessionStorage")
            
            # Clear cache via CDP
            try:
                driver.execute_cdp_cmd('Network.clearBrowserCache', {})
                logger.info("  Cleared browser cache via CDP")
            except:
                logger.info("  Could not clear cache via CDP (non-critical)")
            
            # Now reload
            driver.execute_script("location.reload(true);")
            logger.info("  Executed location.reload(true)")
            wait_for_page_load(driver, 10)
            
        elif method_index == 1:
            # METHOD 1: JavaScript location.reload(true) - Baseline
            logger.info("Executing: JavaScript location.reload(true) [Baseline]")
            driver.execute_script("location.reload(true);")
            wait_for_page_load(driver, 10)
            
        elif method_index == 2:
            # METHOD 2: CDP Page.reload
            logger.info("Executing: CDP Page.reload")
            driver.execute_cdp_cmd('Page.reload', {'ignoreCache': True})
            logger.info("  Sent Page.reload via CDP")
            wait_for_page_load(driver, 10)
            
        elif method_index == 3:
            # METHOD 3: Navigate away and back
            logger.info("Executing: Navigate to about:blank and back")
            saved_url = driver.current_url
            logger.info(f"  Saving URL: {saved_url}")
            
            driver.get("about:blank")
            logger.info("  Navigated to about:blank")
            time.sleep(2)
            
            driver.get(saved_url)
            logger.info(f"  Navigated back to: {saved_url}")
            wait_for_page_load(driver, 10)
            details['url'] = saved_url
        
        # Check if refresh succeeded
        duration = time.time() - start_time
        new_nav_type = driver.execute_script("return performance.navigation.type")
        success = new_nav_type in [0, 1]  # 0=navigate, 1=reload - both OK
        
        details['nav_type_after'] = new_nav_type
        details['active_element_before'] = active_tag
        
        logger.info(f"  Navigation type after: {new_nav_type} (1=reload, 0=navigate)")
        
    except Exception as e:
        duration = time.time() - start_time
        error_msg = str(e)
        success = False
        logger.error(f"  Failed: {e}")
    
    # Track the attempt
    refresh_tracker.track_attempt(
        method_name,
        success,
        duration,
        error_msg,
        details
    )
    
    # Check for "Something went wrong on our end" after refresh
    try:
        page_source = driver.page_source
        error_still_exists = "Something went wrong on our end" in page_source or "Please try again" in page_source
        if error_still_exists:
            logger.error("⚠️  'Something went wrong on our end' error STILL EXISTS after refresh!")
            success = False  # Mark as failed if error persists
        else:
            logger.info("✓ 'Something went wrong' error NOT detected after refresh")
    except Exception as e:
        logger.warning(f"Could not check for error after refresh: {e}")
    
    logger.info(f"{'='*80}\n")
    
    return success


def timed_find_element(driver, by, value, timeout: int = 10):
    """Wrapper around safe_find_element with timing"""
    start = time.time()
    result = safe_find_element(driver, by, value, timeout)
    duration = time.time() - start
    selector_timer.track(str(by).split('.')[-1], value, duration, result is not None)
    return result

def timed_click(driver, by, value, timeout: int = 10) -> bool:
    """Wrapper around safe_click with timing"""
    start = time.time()
    result = safe_click(driver, by, value, timeout)
    duration = time.time() - start
    selector_timer.track(str(by).split('.')[-1], value, duration, result)
    return result

def timed_send_keys(driver, by, value, text: str, timeout: int = 10, human_like: bool = True) -> bool:
    """Wrapper around safe_send_keys with timing"""
    start = time.time()
    result = safe_send_keys(driver, by, value, text, timeout, human_like)
    duration = time.time() - start
    selector_timer.track(str(by).split('.')[-1], value, duration, result)
    return result


class AccountCreator:
    """Handles automated account and site creation"""
    
    def __init__(self, email: str, display_name: str, password: str, site_name: str):
        self.email = email
        self.display_name = display_name
        self.password = password
        self.site_name = site_name
        self.original_site_name = site_name  # Keep track of original for file operations
        self.rovo_root = Path(__file__).parent.parent
        self.driver = None
        self.browser_pid = None  # Track Chrome process ID for window management
        self.config = BrowserConfig()
        self.api_token = ""
        
        # Path to state/creds directory (rovo/state/creds/)
        self.creds_dir = Path(__file__).parent.parent / "state" / "creds"
    
    def update_site_name_references(self, new_site_name: str):
        """
        Update site_name across all files and references when the name changes.
        
        Updates:
        - self.site_name
        - state/creds/account_XX/site_name file
        - logs/credentials_{site_name}.txt file (rename and update content)
        - state/accounts.json (if exists)
        
        Args:
            new_site_name: The new site name to use
        """
        try:
            import re
            import os
            
            old_site_name = self.site_name
            logger.info(f"Updating site name from '{old_site_name}' to '{new_site_name}'")
            
            # Extract account number
            match = re.search(r'(\d+)', self.original_site_name)
            if not match:
                logger.warning(f"Could not extract account number from original_site_name: {self.original_site_name}")
                return
            
            account_num = match.group(1)
            
            # 1. Update self.site_name
            self.site_name = new_site_name
            logger.info(f"✓ Updated self.site_name to {new_site_name}")
            
            # 2. Update state/creds/account_XX/site_name file
            account_dir = self.creds_dir / f"account_{account_num}"
            if account_dir.exists():
                site_name_file = account_dir / "site_name"
                with open(site_name_file, 'w') as f:
                    f.write(new_site_name)
                os.chmod(site_name_file, 0o600)
                logger.info(f"✓ Updated {site_name_file}")
            
            # 3. Update logs/credentials_{site_name}.txt file
            old_creds_file = self.rovo_root / "logs" / f"credentials_{old_site_name}.txt"
            new_creds_file = self.rovo_root / "logs" / f"credentials_{new_site_name}.txt"
            
            if old_creds_file.exists():
                # Read old content and update site name references
                with open(old_creds_file, 'r') as f:
                    content = f.read()
                
                # Replace old site name with new one
                content = content.replace(f"Site: {old_site_name}", f"Site: {new_site_name}")
                
                # Write to new file
                with open(new_creds_file, 'w') as f:
                    f.write(content)
                
                # Remove old file
                old_creds_file.unlink()
                logger.info(f"✓ Renamed and updated credentials file to {new_creds_file}")
            
            # 4. Update state/accounts.json if it exists
            accounts_json = self.rovo_root / "state" / "accounts.json"
            if accounts_json.exists():
                try:
                    with open(accounts_json, 'r') as f:
                        accounts_data = json.load(f)
                    
                    account_key = f"account_{account_num}"
                    if "accounts" in accounts_data and account_key in accounts_data["accounts"]:
                        accounts_data["accounts"][account_key]["site_name"] = new_site_name
                        accounts_data["accounts"][account_key]["last_updated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                        
                        with open(accounts_json, 'w') as f:
                            json.dump(accounts_data, f, indent=2)
                        
                        logger.info(f"✓ Updated state/accounts.json")
                except Exception as e:
                    logger.warning(f"Could not update accounts.json: {e}")
            
            logger.info(f"✓✓✓ All site name references updated from '{old_site_name}' to '{new_site_name}'")
            
        except Exception as e:
            logger.error(f"Failed to update site name references: {e}")
    
    def save_credentials(self, api_token: str = "", burnt: bool = False):
        """
        Save account credentials to rovo/state/creds/account_XX/
        
        Creates a directory structure like:
            state/creds/account_53/
                email
                password
                display_name
                site_name
                api_token
        
        If burnt=True, saves to account_XX_burnt/ instead to indicate failed account.
        
        Args:
            api_token: The API token (if created)
            burnt: If True, append _burnt to directory name
        """
        try:
            import re
            import os
            
            # Extract account number from original_site_name (use original to avoid issues if modified)
            match = re.search(r'(\d+)', self.original_site_name)
            if not match:
                logger.warning(f"Could not extract account number from original_site_name: {self.original_site_name}")
                return
            
            account_num = match.group(1)
            suffix = "_burnt" if burnt else ""
            account_dir = self.creds_dir / f"account_{account_num}{suffix}"
            
            # Create account directory with secure permissions (700)
            account_dir.mkdir(parents=True, exist_ok=True)
            os.chmod(account_dir, 0o700)
            
            # Write each credential to its own file with secure permissions (600)
            cred_files = {
                "email": self.email,
                "password": self.password,
                "display_name": self.display_name,
                "site_name": self.site_name,
                "api_token": api_token or ""
            }
            
            for filename, value in cred_files.items():
                filepath = account_dir / filename
                with open(filepath, 'w') as f:
                    f.write(value)
                os.chmod(filepath, 0o600)
            
            logger.info(f"✓ Saved credentials to {account_dir}")
            
        except Exception as e:
            logger.error(f"Failed to save credentials to state/creds: {e}")
        
    def get_verification_code(self, code_type: str, max_attempts: int = 20, max_age_minutes: int = 2) -> str:
        """
        Get verification code from Gmail using gmail-read-code.sh
        
        Args:
            code_type: Type of code (signup, mfa, api_token)
            max_attempts: Maximum number of attempts (default: 20 = 1 minute at 3s intervals)
            max_age_minutes: Only look for emails from the last N minutes
            
        Returns:
            Verification code string
        """
        gmail_script = self.rovo_root / "bin" / "gmail-read-code.sh"
        
        for attempt in range(max_attempts):
            try:
                result = subprocess.run(
                    [str(gmail_script), "--type", code_type, "--max-age-minutes", str(max_age_minutes)],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if result.returncode == 0 and result.stdout.strip():
                    code = result.stdout.strip()
                    logger.info(f"Verification code received: {code}")
                    return code
                
                logger.info(f"Attempt {attempt + 1}/{max_attempts}: Waiting for verification email...")
                time.sleep(3)  # Wait 3 seconds between attempts (faster polling)
                
            except subprocess.TimeoutExpired:
                logger.warning(f"Attempt {attempt + 1}/{max_attempts}: Script timeout")
                continue
            except Exception as e:
                logger.error(f"Error getting verification code: {e}")
                continue
        
        raise Exception(f"Failed to get verification code after {max_attempts} attempts")
    
    
    def check_and_wait_for_captcha(self, max_wait_seconds: int = 120, account_progress: Optional[str] = None) -> bool:
        """
        Check if CAPTCHA is present and wait for user to solve it manually.
        
        Args:
            max_wait_seconds: Maximum time to wait for CAPTCHA to be solved
            account_progress: Optional progress string like "(account 4/10)" for context
            
        Returns:
            True if CAPTCHA was present and handled, False if no CAPTCHA
        """
        # Check for CAPTCHA iframe or checkbox
        captcha_selectors = [
            "iframe[src*='recaptcha']",
            "iframe[title*='reCAPTCHA']",
            ".g-recaptcha",
            "#recaptcha",
            "div[class*='recaptcha']",
        ]
        
        captcha_found = False
        for selector in captcha_selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    captcha_found = True
                    break
            except:
                continue
        
        # Also check for the "I'm not a robot" text
        try:
            page_source = self.driver.page_source
            if "I'm not a robot" in page_source or "confirm you're not a robot" in page_source:
                captcha_found = True
        except:
            pass
        
        if not captcha_found:
            logger.info("No CAPTCHA detected")
            return False
        
        # Use new manual intervention handler if available
        if MANUAL_INTERVENTION_AVAILABLE:
            return wait_for_captcha_solved(self.driver, max_wait_seconds, account_progress, browser_pid=self.browser_pid)
        
        # Fallback to original method if manual intervention not available
        progress_str = f" {account_progress}" if account_progress else ""
        logger.warning("=" * 50)
        logger.warning(f"CAPTCHA DETECTED!{progress_str}")
        logger.warning("=" * 50)
        if account_progress:
            logger.warning(f"Progress: {account_progress}")
        
        # Print clear instructions
        print("\n" + "=" * 60)
        print("🤖 CAPTCHA DETECTED! Manual intervention required.")
        print("=" * 60)
        if account_progress:
            print(f"Progress: {account_progress}")
        print(f"\n📧 Email being registered: {self.email}")
        print(f"\n🌐 Please open this URL in your browser:")
        print(f"   https://id.atlassian.com/signup")
        print(f"\n📝 Steps:")
        print(f"   1. Enter email: {self.email}")
        print(f"   2. Solve the CAPTCHA (click 'I'm not a robot')")
        print(f"   3. Click 'Sign up'")
        print(f"\n⏳ Waiting up to {max_wait_seconds} seconds for you to solve it...")
        print(f"   (Script will detect when you reach the verification code page)")
        print("=" * 60 + "\n")
        
        # Wait for CAPTCHA to be solved (page changes or CAPTCHA disappears)
        start_time = time.time()
        while time.time() - start_time < max_wait_seconds:
            time.sleep(2)
            
            # Check if we've moved past the CAPTCHA (look for verification code page)
            try:
                page_source = self.driver.page_source
                
                # Check if we're now on the verification code page
                if "emailed you a code" in page_source or "verification code" in page_source.lower():
                    logger.info("CAPTCHA solved! Moved to verification page.")
                    return True
                
                # Check if CAPTCHA is no longer visible (solved but not submitted yet)
                if "I'm not a robot" not in page_source and "confirm you're not a robot" not in page_source:
                    # Give a moment for page transition
                    time.sleep(2)
                    logger.info("CAPTCHA appears to be solved")
                    return True
                    
            except Exception as e:
                logger.debug(f"Error checking page state: {e}")
                continue
        
        logger.error(f"CAPTCHA not solved within {max_wait_seconds} seconds")
        return False
    
    def create_account(self) -> bool:
        """
        Step 1: Create Atlassian account
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info("=== Creating Atlassian Account ===")
            self.driver.get("https://id.atlassian.com/signup")
            wait_for_page_load(self.driver, 10)
            
            # Enter email - use the working selector (NAME=email)
            logger.info(f"Entering email: {self.email}")
            
            # Wait for email field and enter - use NAME selector which works
            if not timed_send_keys(self.driver, By.NAME, "email", self.email, timeout=5, human_like=True):
                # Fallback to ID if NAME doesn't work
                if not timed_send_keys(self.driver, By.ID, "email", self.email, timeout=2, human_like=True):
                    logger.error("Could not find email input field")
                    return False
            
            logger.info("Email entered successfully")
            time.sleep(0.3)
            
            # Click "Sign up" button
            logger.info("Clicking sign up button")
            if not timed_click(self.driver, By.CSS_SELECTOR, "button[type='submit']", timeout=5):
                logger.error("Could not find submit button")
                return False
            
            time.sleep(2)
            
            # Check for CAPTCHA and wait for manual intervention if needed
            account_progress = getattr(self, 'account_progress', None)
            if self.check_and_wait_for_captcha(account_progress=account_progress):
                logger.info("CAPTCHA was handled, continuing...")
                time.sleep(2)
            
            # Wait for and enter verification code
            logger.info("Waiting for verification code email...")
            code = self.get_verification_code("signup")
            
            logger.info(f"Entering verification code: {code}")
            
            # Atlassian uses 6 separate input boxes for the code
            # Use the working selector: input[type='text'][maxlength='1']
            code_entered = False
            
            # Find first code input box and paste (auto-fills other boxes)
            try:
                first_input = timed_find_element(self.driver, By.CSS_SELECTOR, "input[type='text'][maxlength='1']", timeout=10)
                if first_input:
                    first_input.click()
                    time.sleep(0.2)
                    # Paste the full code - auto-distributes to other boxes
                    first_input.send_keys(code)
                    code_entered = True
                    logger.info("Entered verification code successfully")
            except Exception as e:
                logger.debug(f"First input method failed: {e}")
            
            if not code_entered:
                logger.error("Could not find verification code input")
                return False
            
            time.sleep(0.3)
            
            # Submit verification code - use submit button directly
            logger.info("Clicking Verify/Submit button")
            if not timed_click(self.driver, By.CSS_SELECTOR, "button[type='submit']", timeout=5):
                logger.error("Could not submit verification code")
                return False
            
            # Wait 5 seconds and check if verification was successful
            logger.info("Waiting 5 seconds to verify code was accepted...")
            time.sleep(5)
            
            # Check if we're still on the verification page (code failed)
            try:
                page_source = self.driver.page_source
                current_url = self.driver.current_url
                
                # Check for error messages or if still on verification page
                if "verification" in current_url.lower() or "verify" in current_url.lower():
                    # Check if there's an error message
                    if "incorrect" in page_source.lower() or "invalid" in page_source.lower() or "wrong" in page_source.lower():
                        logger.error("Verification code was REJECTED - incorrect code")
                        return False
                    # Also check if we can still see the code input boxes (still on same page)
                    code_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='text'][maxlength='1']")
                    if len(code_inputs) > 0:
                        logger.error("Verification code was REJECTED - still on verification page")
                        return False
                
                logger.info("✓ Verification code accepted - proceeding to next step")
                
            except Exception as e:
                logger.debug(f"Error checking verification status: {e}")
            
            # Enter display name - wait for welcome page
            logger.info(f"Entering display name: {self.display_name}")
            if not timed_send_keys(self.driver, By.NAME, "displayName", self.display_name, timeout=10):
                logger.error("Could not find display name field")
                return False
            
            time.sleep(0.5)
            
            # Enter password
            logger.info("Entering password")
            if not timed_send_keys(self.driver, By.NAME, "password", self.password, timeout=5):
                logger.error("Could not find password field")
                return False
            
            time.sleep(0.5)
            
            # Submit account creation
            if not timed_click(self.driver, By.CSS_SELECTOR, "button[type='submit']", timeout=5):
                logger.error("Could not submit account creation")
                return False
            
            time.sleep(3)
            
            logger.info("✓ Account created successfully")
            return True
            
        except Exception as e:
            logger.error(f"Account creation failed: {e}")
            return False
    
    def handle_new_setup_flow(self) -> bool:
        """
        Handle the NEW setup flow that goes through:
        1. Click "Get Started"
        2. Select "Github Cloud"
        3. Click "Next"
        4. Click "Next" again
        5. Click "Rovo Dev CLI" box
        6. Navigate to clean /rovodev/overview URL
        
        Returns:
            True if successful, False otherwise
        """
        try:
            import random
            
            logger.info("=== NEW SETUP FLOW: Starting ===")
            
            # Step 1: Click "Get Started" button
            logger.info("Step 1: Looking for 'Get Started' button...")
            wait_time = random.uniform(5, 10)
            logger.info(f"Waiting {wait_time:.1f} seconds before clicking...")
            time.sleep(wait_time)
            
            get_started_selectors = [
                ("XPATH", "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'get started')]"),
                ("XPATH", "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'get started')]"),
                ("XPATH", "//button[text()='Get Started']"),
                ("XPATH", "//button[text()='Get started']"),
                ("CSS", "button[data-testid*='get-started']"),
                ("CSS", "button[aria-label*='Get started']"),
            ]
            
            clicked = False
            for selector_type, selector in get_started_selectors:
                try:
                    if selector_type == "XPATH":
                        if timed_click(self.driver, By.XPATH, selector, timeout=3):
                            logger.info(f"✓ TRACKER: 'Get Started' clicked via XPATH: {selector}")
                            clicked = True
                            break
                    else:
                        if timed_click(self.driver, By.CSS_SELECTOR, selector, timeout=3):
                            logger.info(f"✓ TRACKER: 'Get Started' clicked via CSS: {selector}")
                            clicked = True
                            break
                except Exception as e:
                    logger.debug(f"✗ TRACKER: 'Get Started' failed with {selector_type}: {selector} - {e}")
                    continue
            
            if not clicked:
                logger.error("✗ FAILED: Could not find 'Get Started' button")
                return False
            
            # Step 2: Select "Github Cloud" card
            logger.info("Step 2: Looking for 'Github Cloud' card...")
            wait_time = random.uniform(5, 10)
            logger.info(f"Waiting {wait_time:.1f} seconds before clicking...")
            time.sleep(wait_time)
            
            github_cloud_selectors = [
                ("XPATH", "//div[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'github cloud')]"),
                ("XPATH", "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'github cloud')]"),
                ("XPATH", "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'github cloud')]"),
                ("XPATH", "//div[@role='button'][contains(., 'Github Cloud')]"),
                ("XPATH", "//*[text()='Github Cloud']"),
                ("CSS", "div[data-testid*='github']"),
                ("CSS", "button[aria-label*='Github']"),
            ]
            
            clicked = False
            for selector_type, selector in github_cloud_selectors:
                try:
                    if selector_type == "XPATH":
                        if timed_click(self.driver, By.XPATH, selector, timeout=3):
                            logger.info(f"✓ TRACKER: 'Github Cloud' clicked via XPATH: {selector}")
                            clicked = True
                            break
                    else:
                        if timed_click(self.driver, By.CSS_SELECTOR, selector, timeout=3):
                            logger.info(f"✓ TRACKER: 'Github Cloud' clicked via CSS: {selector}")
                            clicked = True
                            break
                except Exception as e:
                    logger.debug(f"✗ TRACKER: 'Github Cloud' failed with {selector_type}: {selector} - {e}")
                    continue
            
            if not clicked:
                logger.error("✗ FAILED: Could not find 'Github Cloud' card")
                return False
            
            # Step 3: Click first "Next" button
            logger.info("Step 3: Looking for first 'Next' button...")
            wait_time = random.uniform(5, 10)
            logger.info(f"Waiting {wait_time:.1f} seconds before clicking...")
            time.sleep(wait_time)
            
            next_selectors = [
                ("XPATH", "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'next')]"),
                ("XPATH", "//button[text()='Next']"),
                ("XPATH", "//button[contains(., 'Next')]"),
                ("CSS", "button[type='submit']"),
                ("CSS", "button[data-testid*='next']"),
            ]
            
            clicked = False
            for selector_type, selector in next_selectors:
                try:
                    if selector_type == "XPATH":
                        if timed_click(self.driver, By.XPATH, selector, timeout=3):
                            logger.info(f"✓ TRACKER: First 'Next' clicked via XPATH: {selector}")
                            clicked = True
                            break
                    else:
                        if timed_click(self.driver, By.CSS_SELECTOR, selector, timeout=3):
                            logger.info(f"✓ TRACKER: First 'Next' clicked via CSS: {selector}")
                            clicked = True
                            break
                except Exception as e:
                    logger.debug(f"✗ TRACKER: First 'Next' failed with {selector_type}: {selector} - {e}")
                    continue
            
            if not clicked:
                logger.error("✗ FAILED: Could not find first 'Next' button")
                return False
            
            # Step 4: Click second "Next" button
            logger.info("Step 4: Looking for second 'Next' button...")
            wait_time = random.uniform(5, 10)
            logger.info(f"Waiting {wait_time:.1f} seconds before clicking...")
            time.sleep(wait_time)
            
            clicked = False
            for selector_type, selector in next_selectors:
                try:
                    if selector_type == "XPATH":
                        if timed_click(self.driver, By.XPATH, selector, timeout=3):
                            logger.info(f"✓ TRACKER: Second 'Next' clicked via XPATH: {selector}")
                            clicked = True
                            break
                    else:
                        if timed_click(self.driver, By.CSS_SELECTOR, selector, timeout=3):
                            logger.info(f"✓ TRACKER: Second 'Next' clicked via CSS: {selector}")
                            clicked = True
                            break
                except Exception as e:
                    logger.debug(f"✗ TRACKER: Second 'Next' failed with {selector_type}: {selector} - {e}")
                    continue
            
            if not clicked:
                logger.error("✗ FAILED: Could not find second 'Next' button")
                return False
            
            # Step 5: Click "Rovo Dev CLI" card
            logger.info("Step 5: Looking for 'Rovo Dev CLI' card...")
            wait_time = random.uniform(5, 10)
            logger.info(f"Waiting {wait_time:.1f} seconds before clicking...")
            time.sleep(wait_time)
            
            rovo_cli_selectors = [
                ("XPATH", "//div[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'rovo dev cli')]"),
                ("XPATH", "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'rovo dev cli')]"),
                ("XPATH", "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'rovo dev cli')]"),
                ("XPATH", "//div[@role='button'][contains(., 'Rovo Dev CLI')]"),
                ("XPATH", "//*[text()='Rovo Dev CLI']"),
                ("XPATH", "//div[contains(., 'CLI')]"),
                ("CSS", "div[data-testid*='cli']"),
                ("CSS", "button[aria-label*='CLI']"),
            ]
            
            clicked = False
            for selector_type, selector in rovo_cli_selectors:
                try:
                    if selector_type == "XPATH":
                        if timed_click(self.driver, By.XPATH, selector, timeout=3):
                            logger.info(f"✓ TRACKER: 'Rovo Dev CLI' clicked via XPATH: {selector}")
                            clicked = True
                            break
                    else:
                        if timed_click(self.driver, By.CSS_SELECTOR, selector, timeout=3):
                            logger.info(f"✓ TRACKER: 'Rovo Dev CLI' clicked via CSS: {selector}")
                            clicked = True
                            break
                except Exception as e:
                    logger.debug(f"✗ TRACKER: 'Rovo Dev CLI' failed with {selector_type}: {selector} - {e}")
                    continue
            
            if not clicked:
                logger.error("✗ FAILED: Could not find 'Rovo Dev CLI' card")
                return False
            
            # Step 6: Navigate to clean overview URL
            logger.info("Step 6: Navigating to clean /rovodev/overview URL...")
            wait_time = random.uniform(5, 10)
            logger.info(f"Waiting {wait_time:.1f} seconds before navigation...")
            time.sleep(wait_time)
            
            clean_url = f"https://{self.site_name}.atlassian.net/rovodev/overview"
            logger.info(f"Navigating to: {clean_url}")
            self.driver.get(clean_url)
            wait_for_page_load(self.driver, 10)
            time.sleep(2)
            
            logger.info("✓✓✓ NEW SETUP FLOW COMPLETED SUCCESSFULLY ✓✓✓")
            return True
            
        except Exception as e:
            logger.error(f"NEW SETUP FLOW ERROR: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def create_site(self) -> bool:
        """
        Step 2: Create Rovo Dev site
        
        Per documented flow:
        10. Navigate to: https://www.atlassian.com/try/cloud/signup?bundle=devai
        11. Click "Log in" link
        12. Enter email, sometimes 2FA (click no), enter password
        13-17. Handle MFA if needed
        18. Navigate again to devai URL
        19. Enter site name
        20. Click "Agree and start now"
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info("=== Creating Rovo Dev Site ===")
            self.driver.get("https://www.atlassian.com/try/cloud/signup?bundle=devai")
            wait_for_page_load(self.driver, 10)
            time.sleep(2)
            
            
            # Step 11: Click "Log in" link on the Rovo Dev signup page
            # The page shows "Already have Rovo Dev Agents? Log in"
            logger.info("Looking for Log in link...")
            if timed_click(self.driver, By.LINK_TEXT, "Log in", timeout=5):
                logger.info("Clicked 'Log in' link")
                time.sleep(2)
            elif timed_click(self.driver, By.PARTIAL_LINK_TEXT, "Log in", timeout=3):
                logger.info("Clicked 'Log in' link (partial)")
                time.sleep(2)
            else:
                logger.info("No Log in link found - may already be logged in or different page state")
            
            
            # Step 12-14: Login flow - enter email (only if not already logged in)
            # After account creation we're already logged in, so check quickly
            logger.info("Checking if login is needed...")
            
            # Try to enter email (username field) - use very short timeout since we're likely already logged in
            if timed_send_keys(self.driver, By.NAME, "username", self.email, timeout=2):
                logger.info("Entering email for login")
                
                if not timed_click(self.driver, By.CSS_SELECTOR, "button[type='submit']", timeout=5):
                    logger.error("Could not click continue after email")
                    return False
                
                time.sleep(2)
                
                # Check for 2FA/two-step verification prompt - click "No" or "Not now" if present
                # Per docs: "Sometimes asks for 2FA - click no"
                try:
                    page_source = self.driver.page_source
                    if "two-step" in page_source.lower() or "2fa" in page_source.lower() or "keep your account secure" in page_source.lower():
                        logger.info("2FA prompt detected, looking for skip option...")
                        # Try various skip buttons
                        if timed_click(self.driver, By.XPATH, "//button[contains(text(), 'No')]", timeout=2):
                            logger.info("Clicked 'No' to skip 2FA")
                            time.sleep(1)
                        elif timed_click(self.driver, By.XPATH, "//button[contains(text(), 'Not now')]", timeout=2):
                            logger.info("Clicked 'Not now' to skip 2FA")
                            time.sleep(1)
                        elif timed_click(self.driver, By.XPATH, "//a[contains(text(), 'Skip')]", timeout=2):
                            logger.info("Clicked 'Skip' link")
                            time.sleep(1)
                except:
                    pass
                
                # Enter password
                logger.info("Entering password")
                if not timed_send_keys(self.driver, By.NAME, "password", self.password, timeout=5):
                    logger.error("Could not find password field")
                    return False
                
                if not timed_click(self.driver, By.CSS_SELECTOR, "button[type='submit']", timeout=5):
                    logger.error("Could not submit login")
                    return False
                
                time.sleep(3)
            
            
            # Step 15-16: Handle MFA challenge if present
            current_url = self.driver.current_url
            if "mfa" in current_url.lower() or "challenge" in current_url.lower():
                logger.info("MFA challenge detected, getting verification code...")
                
                # Get MFA code from Gmail
                code = self.get_verification_code("mfa")
                logger.info(f"Entering MFA code: {code}")
                
                # Enter MFA code
                try:
                    first_input = timed_find_element(self.driver, By.CSS_SELECTOR, "input[type='text'][maxlength='1']", timeout=10)
                    if first_input:
                        first_input.click()
                        time.sleep(0.2)
                        first_input.send_keys(code)
                        time.sleep(1)
                        
                        # Submit MFA
                        timed_click(self.driver, By.CSS_SELECTOR, "button[type='submit']", timeout=5)
                        time.sleep(3)
                except Exception as e:
                    logger.warning(f"MFA entry issue: {e}")
            
            # Step 17-18: Navigate to devai signup page
            from selenium.webdriver.common.keys import Keys
            
            logger.info("Navigating to Rovo Dev signup page...")
            self.driver.get("https://www.atlassian.com/try/cloud/signup?bundle=devai")
            wait_for_page_load(self.driver, 10)
            time.sleep(2)
            
            # Step 19: Enter site name - CLEAR FIRST then type
            # Wait 5 seconds before typing (Attempt 1)
            logger.info("Waiting 5 seconds before typing site name (Attempt 1)...")
            time.sleep(5)
            
            logger.info(f"Entering site name: {self.site_name}")
            
            # Find site name input - use CSS selector directly
            site_input = timed_find_element(self.driver, By.CSS_SELECTOR, "input[type='text']", timeout=5)
            
            if not site_input:
                logger.error("Could not find site name input field")
                return False
            
            # Smart backspace: Field has "grafeeti1000", backspace "1000" and type account number
            site_input.click()
            time.sleep(0.2)
            
            import random
            import re
            
            # Get current value
            current_value = site_input.get_attribute('value') or ''
            logger.info(f"Current field value: '{current_value}'")
            
            # Extract the account number from our site name (e.g., "84" from "grafeeti84")
            number_match = re.search(r'\d+$', self.site_name)
            if number_match:
                account_number = number_match.group()
                # Default pre-filled value is "grafeeti1000" - backspace the "1000" (4 digits)
                num_backspaces = 4
                logger.info(f"Smart backspace: removing '1000' (4 backspaces) and typing '{account_number}'")
                
                # Backspace the "1000" portion
                for i in range(num_backspaces):
                    site_input.send_keys(Keys.BACK_SPACE)
                    time.sleep(random.uniform(0.05, 0.15))
                
                # Type the account number
                for char in account_number:
                    site_input.send_keys(char)
                    time.sleep(random.uniform(0.03, 0.10))
            else:
                # Fallback: clear all and type full name
                logger.info(f"Fallback: typing full site name '{self.site_name}'")
                site_input.send_keys(Keys.CONTROL + "a")
                time.sleep(0.1)
                for char in self.site_name:
                    site_input.send_keys(char)
                    time.sleep(random.uniform(0.03, 0.10))
            
            logger.info("✓ Site name entered (human-like typing)")
            
            # Wait 10 seconds before pressing ENTER (Attempt 1)
            logger.info("Waiting 10 seconds before pressing ENTER (Attempt 1)...")
            time.sleep(10)
            
            # Press ENTER to submit (bypasses click detection)
            logger.info("→ Pressing ENTER to submit (Attempt 1)...")
            site_input.send_keys(Keys.RETURN)
            logger.info("✓ ENTER key pressed successfully (Attempt 1)")
            
            # Wait longer for site creation to process before checking for errors
            logger.info("Waiting 10 seconds for site creation to process...")
            time.sleep(10)
            
            # Check for "Something went wrong on our end" error and handle it with REFRESH
            # This error requires up to 3 attempts with different strategies
            MAX_ERROR_RETRIES = 3
            for error_retry in range(MAX_ERROR_RETRIES):
                try:
                    # Check for error at start of loop
                    page_source = self.driver.page_source
                    error_exists = "Something went wrong on our end" in page_source or "Please try again" in page_source
                    
                    if error_exists:
                        logger.warning("=" * 50)
                        logger.warning(f"'Something went wrong' ERROR DETECTED! (attempt {error_retry + 1}/{MAX_ERROR_RETRIES})")
                        logger.warning("=" * 50)
                        
                        # Attempt 2: First retry with manual refresh (minimal window - just refresh button)
                        if error_retry == 0:
                            logger.info("Retry Attempt 2: Manual refresh required (minimal window)")
                            
                            # Use new manual intervention handler if available
                            if MANUAL_INTERVENTION_AVAILABLE:
                                account_progress = getattr(self, 'account_progress', None)
                                success = wait_for_manual_refresh(
                                    self.driver, 
                                    max_wait_seconds=120, 
                                    account_progress=account_progress,
                                    window_size="minimal",  # 200x200 - just refresh button
                                    browser_pid=self.browser_pid
                                )
                                if success:
                                    logger.info("✓ Manual refresh completed - error cleared!")
                                    # Wait for page to stabilize
                                    time.sleep(3)
                                else:
                                    logger.warning("Manual refresh timeout or error still exists")
                                    continue
                            else:
                                # Fallback: Original automated retry logic
                                logger.info("→ Attempt 2: Error detected (manual intervention not available)")
                            
                            # Wait 10 seconds for input field to appear
                            logger.info("Waiting 10 seconds for site name field to appear (Attempt 2)...")
                            time.sleep(10)
                            
                            # Find site name input and re-enter site name
                            logger.info(f"Re-entering site name: {self.site_name}")
                            site_input = timed_find_element(self.driver, By.CSS_SELECTOR, "input[type='text']", timeout=5)
                            if site_input:
                                site_input.click()
                                time.sleep(0.2)
                                
                                import random
                                import re
                                
                                # Get current value
                                current_value = site_input.get_attribute('value') or ''
                                logger.info(f"Current field value: '{current_value}'")
                                
                                # Extract the account number from our site name (e.g., "84" from "grafeeti84")
                                number_match = re.search(r'\d+$', self.site_name)
                                if number_match and current_value:
                                    account_number = number_match.group()
                                    # Field likely has "grafeeti1000" - backspace the "1000" (4 digits)
                                    num_backspaces = 4
                                    logger.info(f"Smart backspace: removing '1000' (4 backspaces) and typing '{account_number}'")
                                    
                                    # Backspace the "1000" portion
                                    for i in range(num_backspaces):
                                        site_input.send_keys(Keys.BACK_SPACE)
                                        time.sleep(random.uniform(0.05, 0.15))
                                    
                                    # Type the account number
                                    for char in account_number:
                                        site_input.send_keys(char)
                                        time.sleep(random.uniform(0.03, 0.10))
                                else:
                                    # Fallback: backspace everything and retype
                                    logger.info(f"Fallback: backspacing all {len(current_value)} characters and retyping")
                                    if current_value:
                                        for i in range(len(current_value)):
                                            site_input.send_keys(Keys.BACK_SPACE)
                                            time.sleep(random.uniform(0.05, 0.15))
                                    
                                    # Type full site name
                                    for char in self.site_name:
                                        site_input.send_keys(char)
                                        time.sleep(random.uniform(0.03, 0.10))
                                
                                logger.info("✓ Site name re-entered (human-like typing)")
                                
                                # Wait 10 seconds before pressing ENTER
                                logger.info("Waiting 10 seconds before pressing ENTER (Attempt 2)...")
                                time.sleep(10)
                                
                                # Press ENTER to submit (bypasses click detection)
                                logger.info("→ Pressing ENTER to submit (Attempt 2)...")
                                site_input.send_keys(Keys.RETURN)
                                logger.info("✓ ENTER key pressed successfully (Attempt 2)")
                                
                                # Wait 10 seconds for site creation to process
                                logger.info("Waiting 10 seconds for site creation to process...")
                                time.sleep(10)
                                
                                # Check if error still exists after Attempt 2
                                page_source = self.driver.page_source
                                if "Something went wrong on our end" in page_source or "Please try again" in page_source:
                                    logger.warning("Error still exists after Attempt 2, will try Attempt 3")
                                    continue
                                else:
                                    logger.info("✓ Error resolved after Attempt 2!")
                                    break
                                
                            else:
                                # Could not find site name input - try refreshing again
                                logger.warning("Could not find site name input after refresh (Attempt 2)")
                                logger.info("Waiting 10 seconds before trying to refresh again...")
                                time.sleep(10)
                                
                                logger.info("Attempting to refresh page again...")
                                try:
                                    self.driver.refresh()
                                    wait_for_page_load(self.driver, 10)
                                    logger.info("✓ Page refreshed again")
                                except Exception as e:
                                    logger.error(f"Could not refresh page: {e}")
                                
                                logger.info("Waiting 10 seconds after refresh...")
                                time.sleep(10)
                                
                                # Try to find input field again
                                logger.info("Trying to find site name input again...")
                                site_input_retry = timed_find_element(self.driver, By.CSS_SELECTOR, "input[type='text']", timeout=5)
                                if site_input_retry:
                                    logger.info("✓ Found site name input on retry")
                                else:
                                    logger.error("✗ Still could not find site name input - continuing to next attempt")
                                
                                # Loop back to check error status
                                continue
                        
                        # Attempt 3: Second retry with manual refresh + manual site name entry (larger window)
                        elif error_retry == 1:
                            logger.info("Retry Attempt 3: Manual refresh + Manual site name entry required")
                            
                            # Use new manual intervention handler if available
                            if MANUAL_INTERVENTION_AVAILABLE:
                                account_progress = getattr(self, 'account_progress', None)
                                success = wait_for_manual_site_name_entry(
                                    self.driver, 
                                    self.site_name,
                                    max_wait_seconds=120, 
                                    account_progress=account_progress,
                                    window_size="medium",  # 600x600 - larger for typing
                                    browser_pid=self.browser_pid
                                )
                                if success:
                                    logger.info("✓ Manual site name entry completed - error cleared!")
                                    # Break out of retry loop - error is resolved
                                    break
                                else:
                                    logger.warning("Manual site name entry timeout or error still exists")
                                    # Continue to attempt 4 (exhausted)
                                    continue
                            else:
                                # Fallback: Original automated retry logic
                                logger.info("→ Attempt 3: Error detected (manual intervention not available)")
                            
                            # Wait 10 seconds for input field to appear
                            logger.info("Waiting 10 seconds for site name field to appear (Attempt 3)...")
                            time.sleep(10)
                            
                            # Append "a" to site name and update all references
                            new_site_name = self.site_name + "a"
                            logger.info(f"Appending 'a' to site name: {self.site_name} -> {new_site_name}")
                            
                            # Update site name across all files and references
                            self.update_site_name_references(new_site_name)
                            
                            # Find site name input and enter modified site name
                            logger.info(f"Entering modified site name: {self.site_name}")
                            site_input = timed_find_element(self.driver, By.CSS_SELECTOR, "input[type='text']", timeout=5)
                            if site_input:
                                site_input.click()
                                time.sleep(0.2)
                                
                                import random
                                import re
                                
                                # Get current value
                                current_value = site_input.get_attribute('value') or ''
                                logger.info(f"Current field value: '{current_value}'")
                                
                                # Extract the account number from our site name (e.g., "84" from "grafeeti84")
                                number_match = re.search(r'\d+$', self.original_site_name)
                                if number_match and current_value:
                                    account_number = number_match.group()
                                    # Field likely has "grafeeti1000" - backspace the "1000" (4 digits) and type number+"a"
                                    num_backspaces = 4
                                    new_suffix = account_number + "a"
                                    logger.info(f"Smart backspace: removing '1000' (4 backspaces) and typing '{new_suffix}'")
                                    
                                    # Backspace the "1000" portion
                                    for i in range(num_backspaces):
                                        site_input.send_keys(Keys.BACK_SPACE)
                                        time.sleep(random.uniform(0.05, 0.15))
                                    
                                    # Type the account number + "a"
                                    for char in new_suffix:
                                        site_input.send_keys(char)
                                        time.sleep(random.uniform(0.03, 0.10))
                                else:
                                    # Fallback: backspace everything and retype
                                    logger.info(f"Fallback: backspacing all {len(current_value)} characters and retyping")
                                    if current_value:
                                        for i in range(len(current_value)):
                                            site_input.send_keys(Keys.BACK_SPACE)
                                            time.sleep(random.uniform(0.05, 0.15))
                                    
                                    # Type full site name
                                    for char in self.site_name:
                                        site_input.send_keys(char)
                                        time.sleep(random.uniform(0.03, 0.10))
                                
                                logger.info("✓ Modified site name entered (human-like typing)")
                                
                                # Wait 10 seconds before pressing ENTER
                                logger.info("Waiting 10 seconds before pressing ENTER (Attempt 3)...")
                                time.sleep(10)
                                
                                # Press ENTER to submit (bypasses click detection)
                                logger.info("→ Pressing ENTER to submit (Attempt 3)...")
                                site_input.send_keys(Keys.RETURN)
                                logger.info("✓ ENTER key pressed successfully (Attempt 3)")
                                
                                # Wait 10 seconds for site creation to process
                                logger.info("Waiting 10 seconds for site creation to process...")
                                time.sleep(10)
                                
                                # Check if error still exists after Attempt 3
                                page_source = self.driver.page_source
                                if "Something went wrong on our end" in page_source or "Please try again" in page_source:
                                    logger.error("Error still exists after Attempt 3 - all attempts exhausted")
                                    continue
                                else:
                                    logger.info("✓ Error resolved after Attempt 3!")
                                    break
                                
                            else:
                                # Could not find site name input - try refreshing again
                                logger.warning("Could not find site name input after refresh (Attempt 3)")
                                logger.info("Waiting 10 seconds before trying to refresh again...")
                                time.sleep(10)
                                
                                logger.info("Attempting to refresh page again...")
                                try:
                                    self.driver.refresh()
                                    wait_for_page_load(self.driver, 10)
                                    logger.info("✓ Page refreshed again")
                                except Exception as e:
                                    logger.error(f"Could not refresh page: {e}")
                                
                                logger.info("Waiting 10 seconds after refresh...")
                                time.sleep(10)
                                
                                # Try to find input field again
                                logger.info("Trying to find site name input again...")
                                site_input_retry = timed_find_element(self.driver, By.CSS_SELECTOR, "input[type='text']", timeout=5)
                                if site_input_retry:
                                    logger.info("✓ Found site name input on retry")
                                else:
                                    logger.error("✗ Still could not find site name input - all attempts exhausted")
                                
                                # Loop back to check error status (will hit "else: return False" on next iteration)
                                continue
                        
                        # Attempt 4 (error_retry == 2): All retries exhausted
                        else:
                            logger.error("=" * 50)
                            logger.error("ALL 3 ATTEMPTS FAILED - Site creation error persists")
                            logger.error("Attempt 1: Automated site name entry")
                            logger.error("Attempt 2: Manual refresh (minimal window)")
                            logger.error("Attempt 3: Manual refresh + Manual site name entry (medium window)")
                            logger.error("Attempt 4: EXHAUSTED - Account marked as burnt")
                            logger.error("=" * 50)
                            return False
                    else:
                        # No error detected, break out of retry loop
                        logger.info("No 'Something went wrong' error detected - continuing")
                        break
                except Exception as e:
                    logger.debug(f"Error checking for 'Something went wrong': {e}")
                    break
            
            # Step 21: Wait for URL to change to /rovodev/overview BEFORE creating API key
            # CRITICAL: Do NOT navigate - just wait for the URL to naturally change!
            logger.info("Waiting for site to be created (URL must change to /rovodev/overview)...")
            logger.info("NOTE: NOT navigating - waiting for natural redirect only!")
            
            site_url = f"https://{self.site_name}.atlassian.net/rovodev/overview"
            site_created = False
            
            # Wait up to 180 seconds for URL to change to rovodev/overview (NO NAVIGATION!)
            for attempt in range(36):  # 36 attempts × 5 seconds = 180 seconds max
                current_url = self.driver.current_url
                logger.info(f"Attempt {attempt + 1}/36: Current URL = {current_url}")
                
                # Check if we're on the rovodev/overview page (the target URL)
                if "/rovodev/overview" in current_url.lower():
                    logger.info(f"✓ Site is ready! URL changed to rovodev/overview")
                    site_created = True
                    break
                
                # If on dev-agents page without signup param, might be transitioning
                if f"{self.site_name}.atlassian.net" in current_url.lower():
                    logger.info(f"On site domain, waiting for redirect to /rovodev/overview...")
                
                # Wait before next check
                time.sleep(5)
            
            if not site_created:
                logger.error("Site creation timed out after 180s - URL never changed to /rovodev/overview")
                return False
            
            
            # Step 22: Detect which flow based on current URL
            current_url = self.driver.current_url
            logger.info(f"Current URL after site creation: {current_url}")
            
            # Determine which flow to use
            if "/rovodev/setup" in current_url.lower():
                logger.info("=" * 60)
                logger.info("NEW FLOW DETECTED: /rovodev/setup")
                logger.info("=" * 60)
                
                try:
                    # NEW FLOW: Setup wizard
                    setup_success = self.handle_new_setup_flow()
                    if not setup_success:
                        logger.error("NEW FLOW failed - pausing 20 seconds for documentation")
                        time.sleep(20)
                        return False
                    
                except Exception as e:
                    logger.error(f"NEW FLOW error: {e}")
                    logger.error("Pausing 20 seconds for documentation")
                    time.sleep(20)
                    return False
                    
            elif "/rovodev/overview" in current_url.lower():
                logger.info("=" * 60)
                logger.info("OLD FLOW DETECTED: /rovodev/overview")
                logger.info("=" * 60)
                
                # OLD FLOW: Dismiss popup if present
                logger.info("Checking for 'Get started with Rovo Dev' popup...")
                try:
                    # Look for the Dismiss button in the onboarding popup
                    # The popup says "Get started with Rovo Dev" with a "Dismiss" button
                    dismiss_clicked = False
                    
                    # Try multiple selectors for the Dismiss button
                    dismiss_selectors = [
                        "//button[contains(text(), 'Dismiss')]",
                        "//button[contains(., 'Dismiss')]",
                        "//button[@aria-label='Dismiss']",
                        "button[data-testid='dismiss-button']",
                        "//button[contains(@class, 'dismiss')]",
                    ]
                    
                    for selector in dismiss_selectors:
                        try:
                            if selector.startswith("//"):
                                if timed_click(self.driver, By.XPATH, selector, timeout=2):
                                    logger.info(f"✓ Clicked Dismiss button via {selector}")
                                    dismiss_clicked = True
                                    break
                            else:
                                if timed_click(self.driver, By.CSS_SELECTOR, selector, timeout=2):
                                    logger.info(f"✓ Clicked Dismiss button via {selector}")
                                    dismiss_clicked = True
                                    break
                        except:
                            continue
                    
                    if not dismiss_clicked:
                        # Also try clicking anywhere outside the modal or pressing Escape
                        from selenium.webdriver.common.keys import Keys
                        from selenium.webdriver.common.action_chains import ActionChains
                        actions = ActionChains(self.driver)
                        actions.send_keys(Keys.ESCAPE)
                        actions.perform()
                        logger.info("Pressed Escape to try dismissing popup")
                        time.sleep(1)
                    
                except Exception as e:
                    logger.info(f"No popup to dismiss or error: {e}")
                
                time.sleep(1)
            else:
                logger.warning(f"UNKNOWN FLOW: URL is {current_url}")
                logger.warning("Expected /rovodev/setup or /rovodev/overview")
                logger.info("Proceeding anyway...")
                time.sleep(2)
            
            # Open a NEW tab for API token creation
            logger.info("Opening new tab for API token creation...")
            self.driver.execute_script("window.open('about:blank', '_blank');")
            time.sleep(0.5)
            
            # Track tab handles
            site_tab = self.driver.window_handles[0]  # Original tab - shows site
            api_tab = self.driver.window_handles[-1]   # New tab - for API tokens
            
            logger.info(f"Site tab showing: {self.driver.current_url}")
            
            # Switch to the API tab and navigate to API token page
            logger.info("Switching to API tab for token creation...")
            self.driver.switch_to.window(api_tab)
            self.driver.get("https://id.atlassian.com/manage-profile/security/api-tokens")
            wait_for_page_load(self.driver, 10)
            time.sleep(2)
            
            logger.info("✓ Site created and API token page opened")
            return True
            
        except Exception as e:
            logger.error(f"Site creation failed: {e}")
            return False
    
    def create_api_token(self) -> str:
        """
        Step 3: Create API token (browser should already be on API tokens page)
        
        Uses optimized selectors from testing:
        - input[type='tel'] for 8-digit verification code (auto-focused, just type)
        - //button[contains(., 'Create API token')] for button
        - input[readonly] for token extraction with ATATT validation
        
        Returns:
            API token string if successful, empty string otherwise
        """
        try:
            logger.info("=== Creating API Token ===")
            
            from selenium.webdriver.common.keys import Keys
            from selenium.webdriver.common.action_chains import ActionChains
            from datetime import datetime, timedelta
            
            # Wait for potential redirect to step-up verification
            time.sleep(3)
            current_url = self.driver.current_url
            logger.info(f"Current URL: {current_url}")
            
            # Check if we need step-up verification (8-digit code)
            if "step-up" in current_url.lower():
                logger.info("Step-up verification required (8-digit code)")
                
                # Wait for URL to change to #sent (indicates email was sent and input is ready)
                logger.info("Waiting for #sent in URL (email sending)...")
                for _ in range(30):
                    if "#sent" in self.driver.current_url:
                        logger.info("✓ URL changed to #sent - email sent, input ready")
                        break
                    time.sleep(0.5)
                
                # Get 8-digit verification code
                code = self.get_verification_code("api_token", max_attempts=15, max_age_minutes=3)
                
                # Input is already focused with cursor waiting - type immediately
                logger.info(f"Typing 8-digit code immediately: {code}")
                actions = ActionChains(self.driver)
                actions.send_keys(code)
                actions.perform()
                logger.info("✓ Typed 8-digit code (Verify auto-submits)")
                
                # Wait for auto-submit and redirect
                logger.info("Waiting for verification to complete...")
                time.sleep(3)
                logger.info(f"After verification, URL: {self.driver.current_url}")
            
            
            # Wait for API tokens page to load
            logger.info("Waiting for API tokens page...")
            time.sleep(2)
            
            # Check for late step-up redirect
            if "step-up" in self.driver.current_url.lower():
                logger.info("Late redirect to step-up detected - handling verification...")
                # Wait for #sent
                for _ in range(30):
                    if "#sent" in self.driver.current_url:
                        break
                    time.sleep(0.5)
                code = self.get_verification_code("api_token", max_attempts=15, max_age_minutes=3)
                actions = ActionChains(self.driver)
                actions.send_keys(code)
                actions.perform()
                time.sleep(3)
            
            # Find and click "Create API token" button - use working selector
            logger.info("Looking for Create API token button...")
            button = None
            for attempt in range(10):
                button = timed_find_element(self.driver, By.XPATH, "//button[contains(., 'Create API token')]", timeout=2)
                if button:
                    logger.info("✓ Found 'Create API token' button")
                    break
                logger.info(f"Attempt {attempt + 1}/10: Button not found, waiting 2 seconds...")
                time.sleep(2)
            
            if not button:
                logger.error("Could not find Create API token button")
                return ""
            
            button.click()
            logger.info("✓ Clicked Create API token button")
            time.sleep(2)
            
            # Now in the modal - type name, Tab to date field, enter date, then Enter to submit
            logger.info(f"Entering token label: {self.site_name}")
            
            # Calculate date 12 months from now minus 1 day (format: MM/DD/YYYY)
            expiry_date = datetime.now() + timedelta(days=364)
            expiry_date_str = expiry_date.strftime("%m/%d/%Y")
            logger.info(f"Setting expiry date to: {expiry_date_str}")
            
            # Type the label directly (field is already focused after clicking Create button)
            actions = ActionChains(self.driver)
            actions.send_keys(self.site_name)
            actions.perform()
            logger.info("✓ Typed token label into focused field")
            
            time.sleep(0.5)
            
            # Press Tab to move to the date field
            logger.info("Pressing Tab to move to date field...")
            actions = ActionChains(self.driver)
            actions.send_keys(Keys.TAB)
            actions.perform()
            
            time.sleep(0.5)
            
            # Type the expiry date
            logger.info(f"Entering expiry date: {expiry_date_str}")
            actions = ActionChains(self.driver)
            actions.send_keys(expiry_date_str)
            actions.perform()
            logger.info("✓ Typed expiry date")
            
            time.sleep(0.3)
            
            # Press Enter multiple times to bypass date picker and submit form
            logger.info("Pressing Enter multiple times to submit...")
            for i in range(4):
                actions = ActionChains(self.driver)
                actions.send_keys(Keys.ENTER)
                actions.perform()
                time.sleep(0.3)
            logger.info("✓ Pressed Enter x4")
            
            time.sleep(3)
            
            # Extract the token - use working selector with ATATT validation
            logger.info("Extracting API token...")
            
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, "input[readonly]")
                token = element.get_attribute("value") or element.text
                token = token.strip() if token else ""
                
                # Validate: Atlassian API tokens start with "ATATT" and are ~180-200 chars
                if token.startswith("ATATT") and len(token) > 100:
                    logger.info(f"✓ API token extracted (length: {len(token)})")
                    return token
                else:
                    logger.error(f"Token found but invalid format (len={len(token)})")
                    return ""
            except NoSuchElementException:
                logger.error("Could not find token element (input[readonly])")
                return ""
            
        except Exception as e:
            logger.error(f"API token creation failed: {e}")
            return ""
    
    def run(self) -> bool:
        """
        Execute complete account, site, and API token creation flow
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Starting account creation for {self.email}")
            
            # Save credentials to file immediately (in case of failure later)
            creds_file = self.rovo_root / "logs" / f"credentials_{self.site_name}.txt"
            with open(creds_file, "w") as f:
                f.write(f"Email: {self.email}\n")
                f.write(f"Password: {self.password}\n")
                f.write(f"Site: {self.site_name}\n")
                f.write(f"Display Name: {self.display_name}\n")
            logger.info(f"Credentials saved to {creds_file}")
            
            # Create WebDriver
            self.driver = create_driver(self.config)
            
            # Get browser PID and user-data-dir for window management
            try:
                self.browser_pid = self.driver.service.process.pid
                # Get the temp user data directory for matching
                self.user_data_dir = None
                try:
                    # Extract user-data-dir from Chrome options if available
                    for arg in self.driver.capabilities.get('chrome', {}).get('chromedriverArgs', []):
                        if '--user-data-dir=' in arg:
                            self.user_data_dir = arg.split('=', 1)[1]
                            break
                except:
                    pass
                
                logger.info(f"Chrome browser PID: {self.browser_pid}")
                if self.user_data_dir:
                    logger.info(f"Chrome user-data-dir: {self.user_data_dir}")
            except Exception as e:
                logger.warning(f"Could not get browser PID: {e}")
                self.browser_pid = None
                self.user_data_dir = None
            
            # Position browser on left monitor initially and minimize (if enabled)
            if MANUAL_INTERVENTION_AVAILABLE:
                try:
                    from manual_intervention import POSITION_ON_LEFT_MONITOR, WINDOW_MANAGER_AVAILABLE, AUTO_HIDE_BROWSER
                    if POSITION_ON_LEFT_MONITOR and WINDOW_MANAGER_AVAILABLE:
                        # Import the correct window manager based on environment
                        try:
                            # Try Windows manager first (for WSL)
                            from windows_window_manager import position_browser_for_manual_action, hide_browser
                        except ImportError:
                            # Fall back to Linux manager
                            from window_manager import position_browser_for_manual_action, hide_browser
                        
                        logger.info("Positioning browser on left monitor initially...")
                        logger.info("Waiting for Chrome window to initialize...")
                        time.sleep(3)  # Give browser more time to fully open and create window
                        success, window_id = position_browser_for_manual_action(
                            action_type="initial",
                            captcha_size=True,  # Use standard size (700x700)
                            pid=self.browser_pid  # Pass browser PID for targeting
                        )
                        if success:
                            logger.info("✓ Browser positioned on left monitor at startup")
                            
                            # Minimize browser immediately if auto-hide is enabled
                            if AUTO_HIDE_BROWSER:
                                time.sleep(1)  # Brief delay to ensure positioning is complete
                                hide_success = hide_browser(window_id, pid=self.browser_pid)
                                if hide_success:
                                    logger.info("✓ Browser minimized - will show when manual action needed")
                                else:
                                    logger.debug("Could not minimize browser initially")
                        else:
                            logger.info("Could not position browser initially (will stay on main monitor)")
                except Exception as e:
                    logger.debug(f"Could not position browser initially: {e}")
            
            # Clear browser cache and cookies at startup for a fresh state
            logger.info("Clearing browser cookies and cache at startup...")
            try:
                self.driver.delete_all_cookies()
                # Navigate to a page first so we can clear storage
                self.driver.get("about:blank")
                self.driver.execute_script("window.localStorage.clear();")
                self.driver.execute_script("window.sessionStorage.clear();")
                logger.info("✓ Browser cache and cookies cleared")
            except Exception as e:
                logger.debug(f"Could not clear some storage: {e}")
            
            # Step 1: Create account
            if not self.create_account():
                logger.error("Failed to create account")
                # Save partial credentials as burnt (failed account)
                self.save_credentials("", burnt=True)
                return False
            
            # Step 2: Create site (also opens API token page in new tab)
            if not self.create_site():
                logger.error("Failed to create site")
                # Save partial credentials as burnt (failed account)
                self.save_credentials("", burnt=True)
                return False
            
            # Step 3: Create API token (browser is already on API tokens page)
            self.api_token = self.create_api_token()
            if self.api_token:
                # Append token to credentials file
                with open(creds_file, "a") as f:
                    f.write(f"API Token: {self.api_token}\n")
                logger.info("API token saved to credentials file")
            else:
                logger.warning("API token creation failed - can be done manually later")
            
            # Save complete credentials to state/creds/account_XX/
            self.save_credentials(self.api_token)
            
            logger.info("✓✓✓ Complete account and site creation successful ✓✓✓")
            return True
            
        except Exception as e:
            logger.error(f"Fatal error during account creation: {e}")
            # Try to save whatever we have as burnt (failed account)
            self.save_credentials(self.api_token if hasattr(self, 'api_token') else "", burnt=True)
            return False
            
        finally:
            # Print selector timing report
            selector_timer.report()
            
            if self.driver:
                logger.info("Closing browser")
                self.driver.quit()


def main():
    parser = argparse.ArgumentParser(description="Automate Atlassian account and site creation")
    parser.add_argument("email", help="Email address (variation)")
    parser.add_argument("display_name", help="Display name for account")
    parser.add_argument("password", help="Account password")
    parser.add_argument("site_name", help="Site name (e.g., grafeeti39)")
    parser.add_argument("--show", "-s", action="store_true", 
                       help="Keep browser visible on main monitor (disable auto-hide and positioning)")
    
    args = parser.parse_args()
    
    # Override config if --show flag is used
    if args.show:
        logger.info("--show flag detected: Disabling browser auto-hide and positioning")
        # Import and override the manual_intervention config
        try:
            import manual_intervention
            manual_intervention.AUTO_HIDE_BROWSER = False
            manual_intervention.POSITION_ON_LEFT_MONITOR = False
            logger.info("  auto_hide_browser: False")
            logger.info("  position_on_left_monitor: False")
        except ImportError:
            logger.info("  Manual intervention module not available (already disabled)")
    
    creator = AccountCreator(args.email, args.display_name, args.password, args.site_name)
    success = creator.run()
    
    # Generate tracking reports
    logger.info("\n" + "="*80)
    logger.info("GENERATING PERFORMANCE REPORTS")
    logger.info("="*80 + "\n")
    
    refresh_tracker.report()
    selector_timer.report()
    
    # Print API token to stdout for shell script to capture (if available)
    if success and hasattr(creator, 'api_token') and creator.api_token:
        print(f"API_TOKEN={creator.api_token}")
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
