#!/usr/bin/env python3
"""
Detect "human-required" markers in log files or stdin.

Returns exit code 0 if human-required markers are found, 1 otherwise.
Used by bin/cortex-run-notify to distinguish failures requiring human intervention.

Usage:
    python3 tools/detect_human_required.py <logfile>
    cat logfile | python3 tools/detect_human_required.py
    python3 tools/detect_human_required.py --help
"""

import argparse
import re
import sys
from typing import List


# Documented regex patterns for human-required markers
HUMAN_REQUIRED_PATTERNS: List[str] = [
    # Canonical structured marker (preferred): :::HUMAN_REQUIRED::: <reason>
    r"^\s*:::\s*HUMAN_REQUIRED\s*:::",
    # Legacy/compat patterns
    r"HUMAN REQUIRED",
    r"HUMAN INTERVENTION REQUIRED",
    r"⚠️ HUMAN INTERVENTION REQUIRED",
    r"CAPTCHA",
    r"Approve waiver",
    r"manual intervention",
    r"manual review required",
    r"cannot proceed without human",
    r"requires human approval",
    r"human-only",
]


def detect_human_required(content: str) -> bool:
    """
    Check if content contains any human-required markers.

    Args:
        content: Log content to scan

    Returns:
        True if human-required marker found, False otherwise
    """
    for pattern in HUMAN_REQUIRED_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE | re.MULTILINE):
            return True
    return False


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Detect human-required markers in log files or stdin",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python3 tools/detect_human_required.py loop.log
    cat loop.log | python3 tools/detect_human_required.py
    python3 tools/detect_human_required.py < loop.log

Exit codes:
    0 = Human-required marker found
    1 = No human-required marker found
    2 = Error (file not found, etc.)

Detected patterns:
    - HUMAN REQUIRED / HUMAN INTERVENTION REQUIRED
    - CAPTCHA
    - Approve waiver / manual intervention / manual review required
    - cannot proceed without human / requires human approval
    - human-only
        """,
    )
    parser.add_argument(
        "logfile",
        nargs="?",
        help="Log file to scan (default: read from stdin)",
    )

    args = parser.parse_args()

    try:
        if args.logfile:
            with open(args.logfile, "r", encoding="utf-8") as f:
                content = f.read()
        else:
            content = sys.stdin.read()

        if detect_human_required(content):
            return 0
        return 1

    except FileNotFoundError:
        print(f"Error: File not found: {args.logfile}", file=sys.stderr)
        return 2
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
