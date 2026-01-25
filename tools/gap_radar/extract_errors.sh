#!/usr/bin/env bash
# extract_errors.sh - Parse verifier output for failures and warnings
# Usage: bash extract_errors.sh [verifier_output_file]
#
# Output: JSON array of error objects with error_code, file, line, message

set -euo pipefail

VERIFIER_FILE="${1:-.verify/latest.txt}"

if [[ ! -f "$VERIFIER_FILE" ]]; then
  echo "Error: Verifier file not found: $VERIFIER_FILE" >&2
  exit 1
fi

# Extract [FAIL] and [WARN] lines from verifier output
# Format: [FAIL] RuleID (description) - details
# Format: [WARN] RuleID (description) - details

extract_errors() {
  local file="$1"
  local json_array="[]"

  while IFS= read -r line; do
    # Match lines like: [FAIL] Hygiene.Shellcheck.2 (SC2155 in loop.sh line 480)
    # or: [WARN] Protected.1 (protected file changed - human review required)

    if [[ "$line" =~ ^\[(FAIL|WARN)\][[:space:]]+([A-Za-z0-9._-]+)[[:space:]]*\(([^\)]+)\) ]]; then
      local status="${BASH_REMATCH[1]}"
      local rule_id="${BASH_REMATCH[2]}"
      local description="${BASH_REMATCH[3]}"

      # Try to extract error code (e.g., SC2155, MD040)
      local error_code=""
      if [[ "$description" =~ (SC[0-9]+|MD[0-9]+) ]]; then
        error_code="${BASH_REMATCH[1]}"
      fi

      # Try to extract file path
      local file_path=""
      if [[ "$description" =~ in[[:space:]]+([^[:space:]]+) ]]; then
        file_path="${BASH_REMATCH[1]}"
      fi

      # Try to extract line number
      local line_num=""
      if [[ "$description" =~ line[[:space:]]+([0-9]+) ]]; then
        line_num="${BASH_REMATCH[1]}"
      fi

      # Build JSON object
      local json_obj
      json_obj=$(jq -n \
        --arg status "$status" \
        --arg rule_id "$rule_id" \
        --arg error_code "$error_code" \
        --arg file "$file_path" \
        --arg line "$line_num" \
        --arg message "$description" \
        '{
          status: $status,
          rule_id: $rule_id,
          error_code: (if $error_code == "" then null else $error_code end),
          file: (if $file == "" then null else $file end),
          line: (if $line == "" then null else ($line | tonumber) end),
          message: $message
        }')

      # Append to array
      json_array=$(echo "$json_array" | jq --argjson obj "$json_obj" '. += [$obj]')
    fi
  done < <(grep -E "^\[(FAIL|WARN)\]" "$file" || true)

  echo "$json_array"
}

# Main execution
extract_errors "$VERIFIER_FILE" | jq '.'
