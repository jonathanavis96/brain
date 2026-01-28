#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RALPH_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FIXTURES_DIR="$SCRIPT_DIR/fixtures"

if [[ ! -d "$FIXTURES_DIR" ]]; then
  echo "Fixtures directory not found: $FIXTURES_DIR" >&2
  exit 1
fi

extract_summary() {
  local logfile="$1"
  local marker
  marker="BUILD_READY"
  if [[ "$logfile" == *"_plan.log" ]]; then
    marker="PLAN_READY"
  fi

  local summary_lines
  summary_lines=$(grep -n "Summary:" "$logfile" 2>/dev/null | grep -v "iteration summary" || true)

  if [[ -z "$summary_lines" ]]; then
    local status_line
    status_line=$(grep -n "^STATUS |" "$logfile" 2>/dev/null | tail -1 | cut -d: -f1 || echo "")

    if [[ -n "$status_line" ]]; then
      sed -n "${status_line},\$p" "$logfile" | sed '/:::\(BUILD\|PLAN\)_READY:::/q' | sed $'s/\x1b\[[0-9;]*m//g'
      return 0
    fi

    return 1
  fi

  local last_summary_line
  last_summary_line=$(echo "$summary_lines" | tail -1 | cut -d: -f1)
  sed -n "${last_summary_line},\$p" "$logfile" | sed '/:::\(BUILD\|PLAN\)_READY:::/q' | sed $'s/\x1b\[[0-9;]*m//g'
}

for fixture in "$FIXTURES_DIR"/*.log; do
  echo "===================="
  echo "Fixture: $(basename "$fixture")"
  if output=$(extract_summary "$fixture"); then
    if [[ -z "$output" ]]; then
      echo "(no summary found)"
    else
      echo "$output"
    fi
  else
    echo "(no summary found)"
  fi
  echo ""
done
