#!/usr/bin/env python3
"""
Test suite for tools/detect_human_required.py

Validates that human-required marker detection works correctly
against known positive and negative fixtures.
"""

import subprocess
import sys
from pathlib import Path


def test_positive_fixture():
    """Test that positive fixture exits 0 (marker found)."""
    fixture = Path("tools/tests/fixtures/human_required_positive.log")
    result = subprocess.run(
        [sys.executable, "tools/detect_human_required.py", str(fixture)],
        capture_output=True,
    )
    assert (
        result.returncode == 0
    ), f"Expected exit 0 for positive fixture, got {result.returncode}"


def test_negative_fixture():
    """Test that negative fixture exits 1 (no marker found)."""
    fixture = Path("tools/tests/fixtures/human_required_negative.log")
    result = subprocess.run(
        [sys.executable, "tools/detect_human_required.py", str(fixture)],
        capture_output=True,
    )
    assert (
        result.returncode == 1
    ), f"Expected exit 1 for negative fixture, got {result.returncode}"


def test_captcha_fixture():
    """Test that CAPTCHA fixture exits 0 (marker found)."""
    fixture = Path("tools/tests/fixtures/human_required_captcha.log")
    result = subprocess.run(
        [sys.executable, "tools/detect_human_required.py", str(fixture)],
        capture_output=True,
    )
    assert (
        result.returncode == 0
    ), f"Expected exit 0 for captcha fixture, got {result.returncode}"


def test_nonexistent_file():
    """Test that nonexistent file exits 2 (error)."""
    result = subprocess.run(
        [sys.executable, "tools/detect_human_required.py", "nonexistent.log"],
        capture_output=True,
    )
    assert (
        result.returncode == 2
    ), f"Expected exit 2 for nonexistent file, got {result.returncode}"


if __name__ == "__main__":
    print("Running human_required detection tests...")

    try:
        test_positive_fixture()
        print("✓ Positive fixture test passed")
    except AssertionError as e:
        print(f"✗ Positive fixture test failed: {e}")
        sys.exit(1)

    try:
        test_negative_fixture()
        print("✓ Negative fixture test passed")
    except AssertionError as e:
        print(f"✗ Negative fixture test failed: {e}")
        sys.exit(1)

    try:
        test_captcha_fixture()
        print("✓ CAPTCHA fixture test passed")
    except AssertionError as e:
        print(f"✗ CAPTCHA fixture test failed: {e}")
        sys.exit(1)

    try:
        test_nonexistent_file()
        print("✓ Nonexistent file test passed")
    except AssertionError as e:
        print(f"✗ Nonexistent file test failed: {e}")
        sys.exit(1)

    print("\nAll tests passed!")
