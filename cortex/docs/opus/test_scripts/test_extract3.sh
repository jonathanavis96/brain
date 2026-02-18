#!/bin/bash
cd "$(dirname "$0")"
source loop.sh 2>/dev/null || true

generate_iteration_summary() {
  local logfile="$3"
  if [[ ! -f "$logfile" ]]; then
    echo "No log"
    return
  fi
  
  # Find marker
  local marker_line
  marker_line=$(grep -n ":::\(PLAN\|BUILD\)_READY:::" "$logfile" 2>/dev/null | tail -1 | cut -d: -f1 || echo "")
  
  if [[ -z "$marker_line" ]]; then
    echo "No marker"
    return
  fi
  
  echo "Found marker at line: $marker_line"
  
  # Get lines before marker
  sed -n "$((marker_line - 50)),${marker_line}p" "$logfile" | tail -30
}

generate_iteration_summary 1 PLAN workers/ralph/logs/2026-01-28_165734_iter1_plan.log
