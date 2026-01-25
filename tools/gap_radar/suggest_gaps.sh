#!/usr/bin/env bash
# suggest_gaps.sh - Suggest new GAP_BACKLOG entries from uncovered errors
# Usage: bash suggest_gaps.sh [--source verifier|log <file>] [--dry-run|--auto-append]
#
# Chains: extract_errors → match_skills → filter uncovered → format as gap entries
# De-duplicates against existing GAP_BACKLOG.md entries

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
GAP_BACKLOG="$BRAIN_ROOT/skills/self-improvement/GAP_BACKLOG.md"

# Default options
SOURCE_TYPE="verifier"
SOURCE_FILE=""
MODE="dry-run" # dry-run or auto-append

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      SOURCE_TYPE="$2"
      SOURCE_FILE="${3:-}"
      shift 3
      ;;
    --dry-run)
      MODE="dry-run"
      shift
      ;;
    --auto-append)
      MODE="auto-append"
      shift
      ;;
    --help)
      echo "Usage: bash suggest_gaps.sh [OPTIONS]"
      echo ""
      echo "OPTIONS:"
      echo "  --source verifier [file]    Extract from verifier output (default: .verify/latest.txt)"
      echo "  --source log <file>         Extract from Ralph iteration log"
      echo "  --dry-run                   Print suggestions without modifying files (default)"
      echo "  --auto-append               Append suggestions to GAP_BACKLOG.md"
      echo "  --help                      Show this help message"
      echo ""
      echo "EXAMPLES:"
      echo "  bash suggest_gaps.sh"
      echo "  bash suggest_gaps.sh --source log workers/ralph/logs/iter3_build.log"
      echo "  bash suggest_gaps.sh --auto-append"
      exit 0
      ;;
    *)
      echo "Error: Unknown option: $1" >&2
      echo "Run with --help for usage" >&2
      exit 1
      ;;
  esac
done

# Set default source file if not provided
if [[ -z "$SOURCE_FILE" ]]; then
  if [[ "$SOURCE_TYPE" == "verifier" ]]; then
    SOURCE_FILE="$BRAIN_ROOT/.verify/latest.txt"
  else
    echo "Error: --source log requires a file argument" >&2
    exit 1
  fi
fi

# Validate source file exists
if [[ ! -f "$SOURCE_FILE" ]]; then
  echo "Error: Source file not found: $SOURCE_FILE" >&2
  exit 1
fi

# Step 1: Extract errors
echo "→ Extracting errors from $SOURCE_FILE..." >&2
ERRORS_JSON=$(mktemp)
trap 'rm -f "$ERRORS_JSON"' EXIT

if [[ "$SOURCE_TYPE" == "verifier" ]]; then
  bash "$SCRIPT_DIR/extract_errors.sh" "$SOURCE_FILE" >"$ERRORS_JSON"
else
  bash "$SCRIPT_DIR/extract_from_logs.sh" "$SOURCE_FILE" >"$ERRORS_JSON"
fi

ERROR_COUNT=$(jq 'length' "$ERRORS_JSON")
echo "  Found $ERROR_COUNT errors" >&2

if [[ "$ERROR_COUNT" -eq 0 ]]; then
  echo "✓ No errors found - nothing to suggest" >&2
  exit 0
fi

# Step 2: Match against skills
echo "→ Matching errors against skills..." >&2
MATCHED_JSON=$(mktemp)
trap 'rm -f "$ERRORS_JSON" "$MATCHED_JSON"' EXIT

python3 "$SCRIPT_DIR/match_skills.py" "$ERRORS_JSON" >"$MATCHED_JSON"

UNCOVERED_COUNT=$(jq '[.[] | select(.covered == false)] | length' "$MATCHED_JSON")
echo "  Found $UNCOVERED_COUNT uncovered errors" >&2

if [[ "$UNCOVERED_COUNT" -eq 0 ]]; then
  echo "✓ All errors are covered by existing skills - nothing to suggest" >&2
  exit 0
fi

# Step 3: Extract existing error codes from GAP_BACKLOG.md
echo "→ Checking for duplicates in GAP_BACKLOG.md..." >&2
EXISTING_CODES=()
if [[ -f "$GAP_BACKLOG" ]]; then
  # Extract error codes from GAP_BACKLOG (look for SC####, MD###, etc. in evidence sections)
  while IFS= read -r code; do
    EXISTING_CODES+=("$code")
  done < <(grep -oE '(SC[0-9]+|MD[0-9]+|E[0-9]+|F[0-9]+|ImportError|AttributeError|TypeError|NameError)' "$GAP_BACKLOG" 2>/dev/null | sort -u || true)
fi

echo "  Found ${#EXISTING_CODES[@]} existing error codes in GAP_BACKLOG" >&2

# Step 4: Filter uncovered errors and check for duplicates
SUGGESTIONS=""
SUGGESTION_COUNT=0

# Group uncovered errors by error code
ERROR_CODES=$(jq -r '[.[] | select(.covered == false) | .error_code] | unique | .[]' "$MATCHED_JSON")

for error_code in $ERROR_CODES; do
  # Check if this error code already exists in GAP_BACKLOG
  is_duplicate=false
  if [[ ${#EXISTING_CODES[@]} -gt 0 ]]; then
    for existing_code in "${EXISTING_CODES[@]}"; do
      if [[ "$error_code" == "$existing_code" ]]; then
        is_duplicate=true
        break
      fi
    done
  fi

  if [[ "$is_duplicate" == true ]]; then
    echo "  ⊗ Skipping $error_code (already in GAP_BACKLOG)" >&2
    continue
  fi

  # Get example files for this error code
  EXAMPLES=$(jq -r --arg code "$error_code" '[.[] | select(.error_code == $code and .covered == false)] | .[0:3] | .[] | "  - \(.file // "unknown")" + (if .line then " line \(.line)" else "" end) + (if .message then ": \(.message)" else "" end)' "$MATCHED_JSON")

  # Determine error type and suggested skill location
  TYPE="Pattern"
  SKILL_LOCATION="domains/code-quality/"

  if [[ "$error_code" =~ ^SC[0-9]+ ]]; then
    TYPE="Tooling / Pattern"
    SKILL_LOCATION="domains/languages/shell/"
  elif [[ "$error_code" =~ ^MD[0-9]+ ]]; then
    TYPE="Pattern"
    SKILL_LOCATION="domains/code-quality/"
  elif [[ "$error_code" =~ (ImportError|AttributeError|TypeError|NameError|^E[0-9]+|^F[0-9]+) ]]; then
    TYPE="Pattern"
    SKILL_LOCATION="domains/languages/python/"
  fi

  # Generate gap entry
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
  SUGGESTION="### $TIMESTAMP — $error_code Error Pattern

- **Type:** $TYPE
- **Why useful:** Prevents recurring $error_code errors in future work
- **When triggered:** Error appeared in gap radar analysis
- **Evidence:**
$EXAMPLES
- **Priority:** P1
- **Status:** Identified
- **Suggested skill location:** skills/$SKILL_LOCATION

"

  SUGGESTIONS="$SUGGESTIONS$SUGGESTION"
  ((SUGGESTION_COUNT++)) || true
done

if [[ "$SUGGESTION_COUNT" -eq 0 ]]; then
  echo "✓ No new gaps to suggest (all uncovered errors already in GAP_BACKLOG)" >&2
  exit 0
fi

# Step 5: Output suggestions
echo "" >&2
echo "═══════════════════════════════════════" >&2
echo "  Found $SUGGESTION_COUNT new gap(s) to suggest" >&2
echo "═══════════════════════════════════════" >&2
echo "" >&2

if [[ "$MODE" == "dry-run" ]]; then
  echo "$SUGGESTIONS"
  echo "" >&2
  echo "→ Run with --auto-append to add these to GAP_BACKLOG.md" >&2
else
  # Auto-append mode
  if [[ ! -f "$GAP_BACKLOG" ]]; then
    echo "Error: GAP_BACKLOG.md not found at $GAP_BACKLOG" >&2
    exit 1
  fi

  # Append suggestions to GAP_BACKLOG.md
  echo "$SUGGESTIONS" >>"$GAP_BACKLOG"
  echo "✓ Appended $SUGGESTION_COUNT gap(s) to GAP_BACKLOG.md" >&2
fi

exit 0
