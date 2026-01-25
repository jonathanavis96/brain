#!/usr/bin/env bash
# check_startup_rules.sh - Verify Ralph follows token efficiency rules
#
# Usage:
#   tools/check_startup_rules.sh [LOG_FILE]
#   tools/check_startup_rules.sh              # Uses most recent log
#   tools/check_startup_rules.sh path/to/log  # Check specific log
#
# Exit codes:
#   0 = PASS (no forbidden patterns found)
#   1 = FAIL (forbidden patterns detected)

set -uo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$BRAIN_ROOT/workers/ralph/logs"

# Get log file
if [[ $# -ge 1 ]]; then
  LOG_FILE="$1"
else
  LOG_FILE=$(find "$LOG_DIR" -maxdepth 1 -name "*.log" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
fi

if [[ -z "$LOG_FILE" || ! -f "$LOG_FILE" ]]; then
  echo -e "${RED}ERROR: No log file found${NC}"
  exit 1
fi

echo "Checking: $LOG_FILE"
echo "---"

# Strip ANSI codes for easier parsing
CLEAN_LOG=$(mktemp)
sed 's/\x1b\[[0-9;]*m//g' "$LOG_FILE" >"$CLEAN_LOG"
trap 'rm -f "$CLEAN_LOG"' EXIT

FAILURES=0

# Check 1: Forbidden startup file opens
echo -n "Check 1: No forbidden startup file opens... "
FORBIDDEN_OPENS=$(grep -n "Calling open_files" "$CLEAN_LOG" | grep -E "NEURONS\.md|THOUGHTS\.md" | head -5 || true)
if [[ -n "$FORBIDDEN_OPENS" ]]; then
  echo -e "${RED}FAIL${NC}"
  echo "  Found forbidden open_files calls:"
  printf "    %s\n" "$FORBIDDEN_OPENS"
  FAILURES=$((FAILURES + 1))
else
  echo -e "${GREEN}PASS${NC}"
fi

# Check 2: THUNK.md opened for lookup (not just tail for append)
echo -n "Check 2: THUNK.md not opened for lookup... "
THUNK_OPENS=$(grep -n "Calling open_files" "$CLEAN_LOG" | grep -i "THUNK\.md" | head -5 || true)
if [[ -n "$THUNK_OPENS" ]]; then
  echo -e "${RED}FAIL${NC}"
  echo "  Found THUNK.md open_files (should use grep/brain-search):"
  printf "    %s\n" "$THUNK_OPENS"
  FAILURES=$((FAILURES + 1))
else
  echo -e "${GREEN}PASS${NC}"
fi

# Check 3: Full IMPLEMENTATION_PLAN.md opened (vs grep+slice)
echo -n "Check 3: IMPLEMENTATION_PLAN.md not opened in full... "
# This is harder to detect - we look for open_files on the file without a preceding grep
IMPL_OPENS=$(grep -n "Calling open_files" "$CLEAN_LOG" | grep -i "IMPLEMENTATION_PLAN\.md" | head -5 || true)
if [[ -n "$IMPL_OPENS" ]]; then
  echo -e "${YELLOW}WARN${NC}"
  echo "  Found IMPLEMENTATION_PLAN.md open_files (should grep+slice):"
  printf "    %s\n" "$IMPL_OPENS"
  # Not counted as failure - could be legitimate in some cases
else
  echo -e "${GREEN}PASS${NC}"
fi

# Check 4: Grep explosion (informational)
echo -n "Check 4: No grep explosions (>100 lines output)... "
# This check is informational only - manual review needed
echo -e "${GREEN}INFO${NC} (manual review needed for grep output sizes)"

# Check 5: First actions are cheap (grep/ls, not open_files)
echo -n "Check 5: First tool call is cheap (grep/ls/find)... "
FIRST_CALLS=$(grep -E "Calling (bash|open_files)" "$CLEAN_LOG" | head -3)
if echo "$FIRST_CALLS" | head -1 | grep -q "Calling bash"; then
  echo -e "${GREEN}PASS${NC}"
else
  echo -e "${YELLOW}WARN${NC}"
  echo "  First calls may not be cheap discovery:"
  printf "    %s\n" "$FIRST_CALLS"
fi

echo "---"
if [[ $FAILURES -gt 0 ]]; then
  echo -e "${RED}RESULT: $FAILURES check(s) failed${NC}"
  exit 1
else
  echo -e "${GREEN}RESULT: All critical checks passed${NC}"
  exit 0
fi
