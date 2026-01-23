#!/usr/bin/env bash
# sync_completions_to_cortex.sh - Sync task completions from Ralph to Cortex
#
# Purpose: Propagate task completion status ([x]) from Ralph's execution plan
#          back to Cortex's strategic plan.
#
# Usage:   bash sync_completions_to_cortex.sh [--dry-run] [--verbose]
#
# Called by: loop.sh (after each BUILD iteration)
#
# Protocol: Complements sync_cortex_plan.sh (which syncs Cortex → Ralph)

set -euo pipefail

# Paths (relative to workers/ralph/)
CORTEX_PLAN="../../cortex/IMPLEMENTATION_PLAN.md"
RALPH_PLAN="../IMPLEMENTATION_PLAN.md"
LOG_PREFIX="[SYNC-BACK]"

# Options
DRY_RUN=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Logging functions
log_info() {
  echo "$LOG_PREFIX $*"
}

log_verbose() {
  if [[ "$VERBOSE" == "true" ]]; then
    echo "$LOG_PREFIX [VERBOSE] $*"
  fi
}

# shellcheck disable=SC2317  # May be used in future error handling
log_error() {
  echo "$LOG_PREFIX [ERROR] $*" >&2
}

# Check if both plans exist
if [[ ! -f "$CORTEX_PLAN" ]]; then
  log_verbose "Cortex plan not found: $CORTEX_PLAN - skipping reverse sync"
  exit 0
fi

if [[ ! -f "$RALPH_PLAN" ]]; then
  log_verbose "Ralph plan not found: $RALPH_PLAN - skipping reverse sync"
  exit 0
fi

# Extract completed task IDs from Ralph's plan
# Matches: - [x] **1.2** or - [x] **2.1.3**
declare -A completed_tasks
while IFS= read -r line; do
  if [[ "$line" =~ ^[[:space:]]*-[[:space:]]\[x\][[:space:]]\*\*([0-9]+\.[0-9A-Z.]+)\*\* ]]; then
    task_id="${BASH_REMATCH[1]}"
    completed_tasks["$task_id"]=1
    log_verbose "Ralph completed: $task_id"
  fi
done <"$RALPH_PLAN"

if [[ ${#completed_tasks[@]} -eq 0 ]]; then
  log_verbose "No completed tasks in Ralph's plan"
  exit 0
fi

log_info "Found ${#completed_tasks[@]} completed tasks in Ralph's plan"

# Check which tasks need updating in Cortex's plan
tasks_to_update=0
tmp_file=$(mktemp)

while IFS= read -r line; do
  # Check if this is an unchecked task that Ralph has completed
  if [[ "$line" =~ ^([[:space:]]*-[[:space:]])\[\ \]([[:space:]]\*\*([0-9]+\.[0-9A-Z.]+)\*\*.*)$ ]]; then
    task_id="${BASH_REMATCH[3]}"
    prefix="${BASH_REMATCH[1]}"
    suffix="${BASH_REMATCH[2]}"

    if [[ -n "${completed_tasks[$task_id]:-}" ]]; then
      # Mark as complete
      echo "${prefix}[x]${suffix}" >>"$tmp_file"
      tasks_to_update=$((tasks_to_update + 1))
      log_info "Marking complete: $task_id"
    else
      echo "$line" >>"$tmp_file"
    fi
  else
    echo "$line" >>"$tmp_file"
  fi
done <"$CORTEX_PLAN"

if [[ "$tasks_to_update" -eq 0 ]]; then
  log_info "Cortex plan already up to date"
  rm -f "$tmp_file"
  exit 0
fi

# Apply updates
if [[ "$DRY_RUN" == "true" ]]; then
  log_info "[DRY RUN] Would mark $tasks_to_update tasks complete in Cortex plan"
  log_info "[DRY RUN] Diff:"
  diff "$CORTEX_PLAN" "$tmp_file" || true
  rm -f "$tmp_file"
  exit 0
fi

mv "$tmp_file" "$CORTEX_PLAN"
log_info "Updated $tasks_to_update tasks in Cortex plan"
exit 0
