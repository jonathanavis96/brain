#!/usr/bin/env bash
# Test suite for PLAN-ONLY mode guard function
# Tests that guard_plan_only_mode correctly blocks/allows actions based on RALPH_MODE

set -euo pipefail

# Source the guard function
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../workers/shared/common.sh
source "${SCRIPT_DIR}/../workers/shared/common.sh" || {
  echo "ERROR: Failed to source common.sh" >&2
  exit 1
}

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper: assert exit code and optional stderr pattern
assert_exit_code() {
  local expected_exit="$1"
  local actual_exit="$2"
  local test_name="$3"
  local stderr_pattern="${4:-}"
  local stderr_output="${5:-}"

  if [[ "$actual_exit" -eq "$expected_exit" ]]; then
    if [[ -n "$stderr_pattern" && ! "$stderr_output" =~ $stderr_pattern ]]; then
      echo "❌ FAIL: $test_name (exit=$actual_exit OK, but stderr missing '$stderr_pattern')"
      TESTS_FAILED=$((TESTS_FAILED + 1))
    else
      echo "✅ PASS: $test_name"
      TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
  else
    echo "❌ FAIL: $test_name (expected exit=$expected_exit, got exit=$actual_exit)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# Test 1: Blocked actions when RALPH_MODE=PLAN
echo "=== Test Suite: PLAN-ONLY mode (RALPH_MODE=PLAN) ==="
export RALPH_MODE=PLAN

# Test 1.1: git add blocked
set +e
stderr_output=$(guard_plan_only_mode "git add" 2>&1)
exit_code=$?
set -e
assert_exit_code 1 "$exit_code" "Block: git add" "PLAN-ONLY" "$stderr_output"

# Test 1.2: git commit blocked
set +e
stderr_output=$(guard_plan_only_mode "git commit" 2>&1)
exit_code=$?
set -e
assert_exit_code 1 "$exit_code" "Block: git commit" "" "$stderr_output"

# Test 1.3: git push blocked
set +e
stderr_output=$(guard_plan_only_mode "git push" 2>&1)
exit_code=$?
set -e
assert_exit_code 1 "$exit_code" "Block: git push" "" "$stderr_output"

# Test 1.4: shfmt -w blocked
set +e
stderr_output=$(guard_plan_only_mode "shfmt -w" 2>&1)
exit_code=$?
set -e
assert_exit_code 1 "$exit_code" "Block: shfmt -w" "" "$stderr_output"

# Test 1.5: markdownlint --fix blocked
set +e
stderr_output=$(guard_plan_only_mode "markdownlint --fix" 2>&1)
exit_code=$?
set -e
assert_exit_code 1 "$exit_code" "Block: markdownlint --fix" "" "$stderr_output"

# Test 1.6: pre-commit blocked
set +e
stderr_output=$(guard_plan_only_mode "pre-commit" 2>&1)
exit_code=$?
set -e
assert_exit_code 1 "$exit_code" "Block: pre-commit" "" "$stderr_output"

# Test 1.7: verifier.sh blocked
set +e
stderr_output=$(guard_plan_only_mode "verifier.sh" 2>&1)
exit_code=$?
set -e
assert_exit_code 1 "$exit_code" "Block: verifier.sh" "" "$stderr_output"

# Test 2: Allowed actions when RALPH_MODE=PLAN
echo ""
echo "=== Test Suite: Allowed read operations (RALPH_MODE=PLAN) ==="

# Test 2.1: grep allowed
set +e
stderr_output=$(guard_plan_only_mode "grep" 2>&1)
exit_code=$?
set -e
assert_exit_code 0 "$exit_code" "Allow: grep" "" "$stderr_output"

# Test 2.2: cat allowed
set +e
stderr_output=$(guard_plan_only_mode "cat" 2>&1)
exit_code=$?
set -e
assert_exit_code 0 "$exit_code" "Allow: cat" "" "$stderr_output"

# Test 2.3: git status allowed
set +e
stderr_output=$(guard_plan_only_mode "git status" 2>&1)
exit_code=$?
set -e
assert_exit_code 0 "$exit_code" "Allow: git status" "" "$stderr_output"

# Test 2.4: git log allowed
set +e
stderr_output=$(guard_plan_only_mode "git log" 2>&1)
exit_code=$?
set -e
assert_exit_code 0 "$exit_code" "Allow: git log" "" "$stderr_output"

# Test 2.5: ls allowed
set +e
stderr_output=$(guard_plan_only_mode "ls" 2>&1)
exit_code=$?
set -e
assert_exit_code 0 "$exit_code" "Allow: ls" "" "$stderr_output"

# Test 3: Guard disabled when RALPH_MODE != PLAN
echo ""
echo "=== Test Suite: Guard disabled (RALPH_MODE=BUILD) ==="
export RALPH_MODE=BUILD

# Test 3.1: git commit allowed when guard disabled
set +e
stderr_output=$(guard_plan_only_mode "git commit" 2>&1)
exit_code=$?
set -e
assert_exit_code 0 "$exit_code" "Guard disabled: git commit allowed" "" "$stderr_output"

# Test 3.2: shfmt -w allowed when guard disabled
set +e
stderr_output=$(guard_plan_only_mode "shfmt -w" 2>&1)
exit_code=$?
set -e
assert_exit_code 0 "$exit_code" "Guard disabled: shfmt -w allowed" "" "$stderr_output"

# Test 4: Guard disabled when RALPH_MODE unset
echo ""
echo "=== Test Suite: Guard disabled (RALPH_MODE unset) ==="
unset RALPH_MODE

# Test 4.1: git add allowed when guard disabled
set +e
stderr_output=$(guard_plan_only_mode "git add" 2>&1)
exit_code=$?
set -e
assert_exit_code 0 "$exit_code" "Guard disabled (unset): git add allowed" "" "$stderr_output"

# Summary
echo ""
echo "=== Test Summary ==="
echo "✅ Passed: $TESTS_PASSED"
echo "❌ Failed: $TESTS_FAILED"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"

if [[ "$TESTS_FAILED" -gt 0 ]]; then
  exit 1
fi

echo ""
echo "✅ All tests passed!"
exit 0
