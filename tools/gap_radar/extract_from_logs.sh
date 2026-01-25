#!/usr/bin/env bash
# extract_from_logs.sh - Parse Ralph iteration logs for common failure patterns
# Usage: bash extract_from_logs.sh [log_file]
#
# Output: JSON array of error objects with error_code, file, line, message

set -euo pipefail

LOG_FILE="${1:-}"

if [[ -z "$LOG_FILE" ]]; then
  echo "Usage: bash extract_from_logs.sh <log_file>" >&2
  echo "  Parses Ralph iteration logs for common failure patterns" >&2
  exit 1
fi

if [[ ! -f "$LOG_FILE" ]]; then
  echo "Error: Log file not found: $LOG_FILE" >&2
  exit 1
fi

# Extract errors from log file
# Looks for:
# - Python tracebacks
# - Shell errors (syntax error, command not found)
# - Lint failures (SC2155, MD040, etc.)
# - Tool execution errors

extract_errors() {
  local file="$1"
  local json_array="[]"

  # Pattern 1: ShellCheck errors (SC#### in any context)
  while IFS= read -r line; do
    if [[ "$line" =~ (SC[0-9]{4}) ]]; then
      local error_code="${BASH_REMATCH[1]}"

      # Try to extract file path (look for patterns like "in file.sh" or "file.sh:")
      local file_path=""
      if [[ "$line" =~ ([a-zA-Z0-9_/-]+\.sh) ]]; then
        file_path="${BASH_REMATCH[1]}"
      fi

      # Try to extract line number
      local line_num=""
      if [[ "$line" =~ [Ll]ine[[:space:]]*([0-9]+) ]]; then
        line_num="${BASH_REMATCH[1]}"
      fi

      # Build JSON object
      local json_obj
      json_obj=$(jq -n \
        --arg error_code "$error_code" \
        --arg file "$file_path" \
        --arg line "$line_num" \
        --arg message "$line" \
        '{
          error_code: $error_code,
          file: (if $file == "" then null else $file end),
          line: (if $line == "" then null else ($line | tonumber) end),
          message: $message,
          source: "shellcheck"
        }')

      json_array=$(echo "$json_array" | jq --argjson obj "$json_obj" '. += [$obj]')
    fi
  done < <(grep -E "SC[0-9]{4}" "$file" || true)

  # Pattern 2: Markdown lint errors (MD###)
  while IFS= read -r line; do
    if [[ "$line" =~ (MD[0-9]{3}) ]]; then
      local error_code="${BASH_REMATCH[1]}"

      # Try to extract file path
      local file_path=""
      if [[ "$line" =~ ([a-zA-Z0-9_/-]+\.md) ]]; then
        file_path="${BASH_REMATCH[1]}"
      fi

      # Try to extract line number
      local line_num=""
      if [[ "$line" =~ [Ll]ine[[:space:]]*([0-9]+) ]]; then
        line_num="${BASH_REMATCH[1]}"
      fi

      # Build JSON object
      local json_obj
      json_obj=$(jq -n \
        --arg error_code "$error_code" \
        --arg file "$file_path" \
        --arg line "$line_num" \
        --arg message "$line" \
        '{
          error_code: $error_code,
          file: (if $file == "" then null else $file end),
          line: (if $line == "" then null else ($line | tonumber) end),
          message: $message,
          source: "markdownlint"
        }')

      json_array=$(echo "$json_array" | jq --argjson obj "$json_obj" '. += [$obj]')
    fi
  done < <(grep -E "MD[0-9]{3}" "$file" || true)

  # Pattern 3: Python tracebacks
  while IFS= read -r line; do
    # Match lines like: "  File "script.py", line 42, in function_name"
    if [[ "$line" =~ File[[:space:]]+\"([^\"]+)\".*line[[:space:]]+([0-9]+) ]]; then
      local file_path="${BASH_REMATCH[1]}"
      local line_num="${BASH_REMATCH[2]}"

      # Build JSON object
      local json_obj
      json_obj=$(jq -n \
        --arg file "$file_path" \
        --arg line "$line_num" \
        --arg message "$line" \
        '{
          error_code: null,
          file: $file,
          line: ($line | tonumber),
          message: $message,
          source: "python_traceback"
        }')

      json_array=$(echo "$json_array" | jq --argjson obj "$json_obj" '. += [$obj]')
    fi
  done < <(grep -E "File \".*\", line [0-9]+" "$file" || true)

  # Pattern 4: Shell syntax errors
  while IFS= read -r line; do
    # Match lines like: "script.sh: line 69: syntax error"
    if [[ "$line" =~ ([a-zA-Z0-9_/-]+\.sh):[[:space:]]*line[[:space:]]+([0-9]+):[[:space:]]*(syntax[[:space:]]error[^:]*) ]]; then
      local file_path="${BASH_REMATCH[1]}"
      local line_num="${BASH_REMATCH[2]}"
      local error_msg="${BASH_REMATCH[3]}"

      # Build JSON object
      local json_obj
      json_obj=$(jq -n \
        --arg file "$file_path" \
        --arg line "$line_num" \
        --arg message "$error_msg" \
        '{
          error_code: null,
          file: $file,
          line: ($line | tonumber),
          message: $message,
          source: "shell_syntax"
        }')

      json_array=$(echo "$json_array" | jq --argjson obj "$json_obj" '. += [$obj]')
    fi
  done < <(grep -iE "\.sh:[[:space:]]*line[[:space:]]+[0-9]+:.*syntax error" "$file" || true)

  # Pattern 5: Command not found errors
  while IFS= read -r line; do
    if [[ "$line" =~ ([a-zA-Z0-9_-]+):[[:space:]]*(command[[:space:]]not[[:space:]]found) ]]; then
      local command="${BASH_REMATCH[1]}"
      local error_msg="${BASH_REMATCH[2]}"

      # Build JSON object
      local json_obj
      json_obj=$(jq -n \
        --arg command "$command" \
        --arg message "$error_msg" \
        '{
          error_code: null,
          file: null,
          line: null,
          message: ($command + ": " + $message),
          source: "command_not_found"
        }')

      json_array=$(echo "$json_array" | jq --argjson obj "$json_obj" '. += [$obj]')
    fi
  done < <(grep -iE "command not found" "$file" || true)

  # Pattern 6: Tool execution errors (Error executing tool)
  while IFS= read -r line; do
    if [[ "$line" =~ Error[[:space:]]executing[[:space:]]tool[[:space:]]([a-zA-Z0-9_]+):[[:space:]](.+) ]]; then
      local tool_name="${BASH_REMATCH[1]}"
      local error_msg="${BASH_REMATCH[2]}"

      # Build JSON object
      local json_obj
      json_obj=$(jq -n \
        --arg tool "$tool_name" \
        --arg message "$error_msg" \
        '{
          error_code: null,
          file: null,
          line: null,
          message: ("Tool " + $tool + ": " + $message),
          source: "tool_error"
        }')

      json_array=$(echo "$json_array" | jq --argjson obj "$json_obj" '. += [$obj]')
    fi
  done < <(grep -E "Error executing tool" "$file" || true)

  echo "$json_array"
}

# Main execution
extract_errors "$LOG_FILE" | jq '.'
