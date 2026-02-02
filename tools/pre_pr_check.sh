#!/usr/bin/env bash
# Pre-PR check wrapper: run the repo's primary quality gates in one command.
#
# Runs:
#  1) Ralph verifier (AC rules)
#  2) Link validation
#  3) Protected hash validation

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

failures=0
run_check() {
  local name="$1"
  shift
  echo ""
  echo "==> ${name}"
  if "$@"; then
    echo "PASS: ${name}"
  else
    echo "FAIL: ${name}" >&2
    failures=$((failures + 1))
  fi
}

run_check "Ralph verifier" bash "$ROOT/workers/ralph/verifier.sh"
run_check "Link validation" bash "$ROOT/tools/validate_links.sh"
run_check "Protected hash validation" bash "$ROOT/tools/validate_protected_hashes.sh"

echo ""
if [[ "$failures" -eq 0 ]]; then
  echo "All pre-PR checks passed."
  exit 0
fi

echo "$failures pre-PR check(s) failed." >&2
exit 1
