#!/usr/bin/env bash
# Test script for plan cleanup functionality
# Smoke tests to validate cleanup_plan.sh behavior

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLEANUP_SCRIPT="$BRAIN_ROOT/workers/ralph/cleanup_plan.sh"

# Check if cleanup script exists
if [[ ! -f "$CLEANUP_SCRIPT" ]]; then
  echo "ERROR: cleanup_plan.sh not found at $CLEANUP_SCRIPT"
  exit 1
fi

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test result functions
pass() {
  echo -e "${GREEN}✓${NC} $1"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
  echo -e "${RED}✗${NC} $1"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

info() {
  echo -e "${YELLOW}→${NC} $1"
}

# Test 1: Script exists and is executable
test_script_exists() {
  TESTS_RUN=$((TESTS_RUN + 1))
  info "Test 1: Script exists and is executable"

  if [[ -x "$CLEANUP_SCRIPT" ]]; then
    pass "cleanup_plan.sh exists and is executable"
  else
    fail "cleanup_plan.sh missing or not executable"
  fi
}

# Test 2: Help flag works
test_help_flag() {
  TESTS_RUN=$((TESTS_RUN + 1))
  info "Test 2: Help flag works"

  if bash "$CLEANUP_SCRIPT" --help 2>&1 | grep -q "Usage:"; then
    pass "Help flag displays usage"
  else
    fail "Help flag doesn't work"
  fi
}

# Test 3: Shellcheck passes
test_shellcheck() {
  TESTS_RUN=$((TESTS_RUN + 1))
  info "Test 3: Shellcheck passes"

  if command -v shellcheck >/dev/null 2>&1; then
    if shellcheck "$CLEANUP_SCRIPT" >/dev/null 2>&1; then
      pass "Shellcheck passes"
    else
      fail "Shellcheck reports errors"
    fi
  else
    info "  Skipped (shellcheck not installed)"
    TESTS_RUN=$((TESTS_RUN - 1))
  fi
}

# Run all tests
main() {
  echo "=================================================="
  echo "Plan Cleanup Test Suite"
  echo "=================================================="
  echo ""

  # Run tests
  test_script_exists
  test_help_flag
  test_shellcheck

  # Summary
  echo ""
  echo "=================================================="
  echo "Test Results"
  echo "=================================================="
  echo "Total tests: $TESTS_RUN"
  echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
  echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
  echo ""

  if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
  else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
  fi
}

main "$@"
