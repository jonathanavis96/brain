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
#
# Checks:
#   1. No forbidden file opens (NEURONS.md, THOUGHTS.md, full IMPL_PLAN, THUNK)
#   2. No THUNK.md lookups via cat/grep/awk/sed (tail for append is OK)
#   3. No grep explosions (broad globs or "too many matches")
#   4. First tool calls are cheap (bash grep/ls/find, not open_files)

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

# Forbidden files regex (used in multiple checks)
# Note: Use [.] instead of \. in awk regex to avoid escape warnings
FORBIDDEN_FILES_REGEX='NEURONS[.]md|THOUGHTS[.]md'

# Check 1: Forbidden startup file opens (scan open_files blocks for forbidden names)
echo -n "Check 1: No forbidden startup file opens... "
# Match both "Calling open_files" and "Called open_files", scan next 5 lines for forbidden files
FORBIDDEN_OPENS=$(
  awk -v re="$FORBIDDEN_FILES_REGEX" '
    /[Cc]all(ed|ing) open_files/ {inblock=5}
    inblock>0 { if ($0 ~ re) { print NR ":" $0 } ; inblock-- }
  ' "$CLEAN_LOG" | head -5
)
if [[ -n "$FORBIDDEN_OPENS" ]]; then
  echo -e "${RED}FAIL${NC}"
  echo "  Found forbidden open_files calls:"
  printf "    %s\n" "$FORBIDDEN_OPENS"
  FAILURES=$((FAILURES + 1))
else
  echo -e "${GREEN}PASS${NC}"
fi

# Check 2a: THUNK.md opened via open_files
echo -n "Check 2a: THUNK.md not opened via open_files... "
THUNK_OPENS=$(
  awk '
    /[Cc]all(ed|ing) open_files/ {inblock=5}
    inblock>0 { if ($0 ~ /THUNK\.md/) { print NR ":" $0 } ; inblock-- }
  ' "$CLEAN_LOG" | head -5
)
if [[ -n "$THUNK_OPENS" ]]; then
  echo -e "${RED}FAIL${NC}"
  echo "  Found THUNK.md open_files (should use thunk-parse/brain-search):"
  printf "    %s\n" "$THUNK_OPENS"
  FAILURES=$((FAILURES + 1))
else
  echo -e "${GREEN}PASS${NC}"
fi

# Check 2b: THUNK.md read via cat/grep/awk/sed/head (not tail for append)
echo -n "Check 2b: THUNK.md not read via cat/grep/awk/sed... "
THUNK_BAD_READS=$(
  grep -E "command:" "$CLEAN_LOG" |
    grep -E "THUNK\.md" |
    grep -E "cat |grep |awk |sed |head " |
    grep -vE "tail -[0-9]+ .*THUNK\.md" |
    grep -vE "cat >>.*THUNK\.md" |
    grep -vE "echo.*>>.*THUNK\.md" |
    head -5 || true
)
if [[ -n "$THUNK_BAD_READS" ]]; then
  echo -e "${RED}FAIL${NC}"
  echo "  Suspicious THUNK.md reads (should use thunk-parse/brain-search):"
  printf "    %s\n" "$THUNK_BAD_READS"
  FAILURES=$((FAILURES + 1))
else
  echo -e "${GREEN}PASS${NC}"
fi

# Check 3: Full IMPLEMENTATION_PLAN.md opened (vs grep+slice)
echo -n "Check 3: IMPLEMENTATION_PLAN.md not opened in full... "
IMPL_OPENS=$(
  awk '
    /[Cc]all(ed|ing) open_files/ {inblock=5}
    inblock>0 { if ($0 ~ /IMPLEMENTATION_PLAN\.md/) { print NR ":" $0 } ; inblock-- }
  ' "$CLEAN_LOG" | head -5
)
if [[ -n "$IMPL_OPENS" ]]; then
  echo -e "${YELLOW}WARN${NC}"
  echo "  Found IMPLEMENTATION_PLAN.md open_files (should grep+slice):"
  printf "    %s\n" "$IMPL_OPENS"
  # Not counted as failure - could be legitimate in some cases
else
  echo -e "${GREEN}PASS${NC}"
fi

# Check 4: Grep explosion detection
echo -n "Check 4: No grep explosions... "
# Look for explicit explosion indicators
GREP_EXPLOSION=$(
  grep -nE "Too many matches found|Showing matched files only|Output truncated" "$CLEAN_LOG" | head -3 || true
)
if [[ -n "$GREP_EXPLOSION" ]]; then
  echo -e "${RED}FAIL${NC}"
  echo "  Grep explosion indicator found:"
  printf "    %s\n" "$GREP_EXPLOSION"
  FAILURES=$((FAILURES + 1))
else
  # Secondary heuristic: broad-scope searches
  BROAD_SEARCH=$(
    grep -E "command:" "$CLEAN_LOG" |
      grep -E "rg |grep " |
      grep -E "\*\*\/|skills/domains/\*\*|skills/\*\*|\*\*\/\*\.md" |
      head -3 || true
  )
  if [[ -n "$BROAD_SEARCH" ]]; then
    echo -e "${YELLOW}WARN${NC}"
    echo "  Broad search detected (ensure query is narrowed):"
    printf "    %s\n" "$BROAD_SEARCH"
  else
    echo -e "${GREEN}PASS${NC}"
  fi
fi

# Check 5: First actions are cheap (grep/ls, not open_files)
echo -n "Check 5: First tool call is cheap (grep/ls/find)... "
FIRST_CALLS=$(grep -E "[Cc]all(ed|ing) (bash|open_files)" "$CLEAN_LOG" | head -5)
FIRST_OPEN_FILES=$(echo "$FIRST_CALLS" | grep -n "open_files" | head -1 | cut -d: -f1)
FIRST_BASH=$(echo "$FIRST_CALLS" | grep -n "bash" | head -1 | cut -d: -f1)

if [[ -z "$FIRST_OPEN_FILES" ]]; then
  # No open_files in first 5 calls - good
  echo -e "${GREEN}PASS${NC}"
elif [[ -n "$FIRST_BASH" && "$FIRST_BASH" -lt "$FIRST_OPEN_FILES" ]]; then
  # Bash came before open_files - good
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
