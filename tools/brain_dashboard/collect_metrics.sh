#!/usr/bin/env bash
# Collect brain repository metrics and output as JSON
# Usage: bash collect_metrics.sh [--output FILE]

set -euo pipefail

# Default output to stdout
OUTPUT_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --output)
      OUTPUT_FILE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 [--output FILE]" >&2
      exit 1
      ;;
  esac
done

# Determine repo root (navigate up from tools/brain_dashboard/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "${REPO_ROOT}" || exit 1

# Helper: Escape JSON strings
json_escape() {
  python3 -c 'import json, sys; print(json.dumps(sys.stdin.read().strip()))'
}

# 1. Task velocity by week (from THUNK.md)
task_velocity() {
  local thunk_file="workers/ralph/THUNK.md"

  if [[ ! -f "${thunk_file}" ]]; then
    echo "[]"
    return
  fi

  # Extract date column (4th field) from THUNK tables, count per week
  awk -F'|' '
    /^\|/ && NF >= 4 && $4 ~ /^[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}/ {
      # Extract date from 4th column
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", $4)
      date = $4

      # Parse YYYY-MM-DD and calculate week number
      split(date, parts, "-")
      year = parts[1]
      month = parts[2]
      day = parts[3]

      # Simple week calculation: YYYY-Www format
      week = sprintf("%s-W%02d", year, int((day + 6) / 7))
      weeks[week]++
    }
    END {
      printf "["
      first = 1
      for (week in weeks) {
        if (!first) printf ","
        printf "{\"week\":\"%s\",\"tasks\":%d}", week, weeks[week]
        first = 0
      }
      printf "]"
    }
  ' "${thunk_file}"
}

# 2. Skills growth by week (file creation dates in skills/)
skills_growth() {
  if [[ ! -d "skills" ]]; then
    echo "[]"
    return
  fi

  # Use git log to find when skill files were added
  git log --diff-filter=A --pretty=format:'%ad' --date=format:'%Y-W%U' -- 'skills/**/*.md' 2>/dev/null |
    sort | uniq -c |
    awk '{
    printf "%s{\"week\":\"%s\",\"skills_added\":%d}", (NR>1?",":""), $2, $1
  }' |
    awk '{printf "[%s]", $0}'

  # Fallback if git log fails
  if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    echo "[]"
  fi
}

# 3. Commit frequency by day (last 30 days)
commit_frequency() {
  # Get commits from last 30 days, count by date
  git log --since="30 days ago" --pretty=format:'%ad' --date=short 2>/dev/null |
    sort | uniq -c |
    awk '{
    printf "%s{\"date\":\"%s\",\"commits\":%d}", (NR>1?",":""), $2, $1
  }' |
    awk '{printf "[%s]", $0}'

  if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    echo "[]"
  fi
}

# 4. Stale skills (files not modified in 30+ days)
stale_skills() {
  if [[ ! -d "skills" ]]; then
    echo "[]"
    return
  fi

  # Find .md files modified more than 30 days ago
  find skills -name "*.md" -type f -mtime +30 2>/dev/null |
    while IFS= read -r file; do
      # Get days since last modification
      if [[ "$(uname)" == "Darwin" ]]; then
        # macOS
        days=$((($(date +%s) - $(stat -f %m "${file}")) / 86400))
      else
        # Linux
        days=$((($(date +%s) - $(stat -c %Y "${file}")) / 86400))
      fi

      printf '{\"file\":\"%s\",\"days_stale\":%d},' "${file}" "${days}"
    done |
    sed 's/,$//' |
    awk '{printf "[%s]", $0}'

  # Handle empty case
  if [[ ${PIPESTATUS[0]} -ne 0 ]] || [[ -z "$(find skills -name "*.md" -type f -mtime +30 2>/dev/null)" ]]; then
    echo "[]"
  fi
}

# Build final JSON
build_json() {
  cat <<EOF
{
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "task_velocity": $(task_velocity),
  "skills_growth": $(skills_growth),
  "commit_frequency": $(commit_frequency),
  "stale_skills": $(stale_skills)
}
EOF
}

# Output
if [[ -n "${OUTPUT_FILE}" ]]; then
  build_json >"${OUTPUT_FILE}"
  echo "Metrics written to: ${OUTPUT_FILE}" >&2
else
  build_json
fi
