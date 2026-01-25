#!/usr/bin/env bash
# cleanup_plan.sh - Remove completed tasks from IMPLEMENTATION_PLAN.md
#
# Usage:
#   bash cleanup_plan.sh --dry-run    # Preview what would be removed
#   bash cleanup_plan.sh              # Remove completed tasks (no archive)
#   bash cleanup_plan.sh --archive    # Archive to THUNK.md then remove
#
# Features:
#   - Removes lines with [x] checkbox (completed tasks)
#   - Removes entire phase sections when all tasks are [x]
#   - Preserves phase headers if they have pending [ ] tasks
#   - Preserves marker line: <!-- Cortex adds new Task Contracts below this line -->

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLAN_FILE="${SCRIPT_DIR}/../IMPLEMENTATION_PLAN.md"
THUNK_FILE="${SCRIPT_DIR}/THUNK.md"

# Default flags
DRY_RUN=false
ARCHIVE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --archive)
      ARCHIVE=true
      shift
      ;;
    -h | --help)
      echo "Usage: bash cleanup_plan.sh [--dry-run] [--archive]"
      echo ""
      echo "Options:"
      echo "  --dry-run    Preview what would be removed (no modifications)"
      echo "  --archive    Append removed tasks to THUNK.md before deletion"
      echo "  -h, --help   Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate files exist
if [[ ! -f "$PLAN_FILE" ]]; then
  echo "Error: IMPLEMENTATION_PLAN.md not found at $PLAN_FILE"
  exit 1
fi

if [[ "$ARCHIVE" == "true" ]] && [[ ! -f "$THUNK_FILE" ]]; then
  echo "Error: THUNK.md not found at $THUNK_FILE (required for --archive)"
  exit 1
fi

# Archive completed tasks to THUNK.md
archive_tasks() {
  local -a archived_tasks=()
  local current_date
  current_date=$(date '+%Y-%m-%d')

  echo "Collecting completed tasks for archiving..."

  # Collect all completed tasks
  while IFS= read -r line; do
    if echo "$line" | grep -qE '^[[:space:]]*-[[:space:]]*\[[xX]\]'; then
      # Extract task info: - [x] **10.1.1** Description text
      local task_id
      local description
      task_id=$(echo "$line" | sed -E 's/^[[:space:]]*-[[:space:]]*\[[xX]\][[:space:]]*\*\*([^*]+)\*\*.*/\1/')
      description=$(echo "$line" | sed -E 's/^[[:space:]]*-[[:space:]]*\[[xX]\][[:space:]]*//')

      archived_tasks+=("| TBD | $task_id | auto-cleanup | $description | $current_date |")
    fi
  done <"$PLAN_FILE"

  if [[ ${#archived_tasks[@]} -eq 0 ]]; then
    echo "No completed tasks to archive."
    return
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    echo ""
    echo "Would archive ${#archived_tasks[@]} tasks to THUNK.md:"
    for task in "${archived_tasks[@]}"; do
      echo "  $task"
    done
    echo ""
  else
    # Find the last THUNK number in THUNK.md
    local last_thunk_num
    last_thunk_num=$(grep -oE '^\| [0-9]+ \|' "$THUNK_FILE" | tail -n1 | grep -oE '[0-9]+')
    if [[ -z "$last_thunk_num" ]]; then
      last_thunk_num=0
    fi

    # Append tasks to THUNK.md (before the final blank line)
    local next_thunk=$((last_thunk_num + 1))
    for task in "${archived_tasks[@]}"; do
      # Replace TBD with actual THUNK number
      task="${task/TBD/$next_thunk}"
      # Insert before the last line (which should be blank)
      sed -i "$ i\\$task" "$THUNK_FILE"
      ((next_thunk++))
    done

    echo "Archived ${#archived_tasks[@]} tasks to THUNK.md (THUNK #$((last_thunk_num + 1))-$((next_thunk - 1)))"
  fi
}

# Main cleanup logic - simplified single-pass approach
cleanup_plan() {
  local temp_file
  temp_file=$(mktemp)
  local removed_count=0
  local removed_phases=0

  # First pass: identify phases to keep
  local current_phase=""
  local -A phase_has_pending

  while IFS= read -r line; do
    # Track current phase
    if echo "$line" | grep -qE '^##[[:space:]]+Phase'; then
      current_phase=$(echo "$line" | sed -E 's/^##[[:space:]]+//')
      phase_has_pending["$current_phase"]=false
    fi

    # Check for pending tasks in current phase
    if [[ -n "$current_phase" ]] && echo "$line" | grep -qE '^[[:space:]]*-[[:space:]]*\[[[:space:]]\]'; then
      phase_has_pending["$current_phase"]=true
    fi
  done <"$PLAN_FILE"

  # Second pass: write output
  current_phase=""
  local skip_phase=false

  while IFS= read -r line; do
    # Detect phase headers
    if echo "$line" | grep -qE '^##[[:space:]]+Phase'; then
      current_phase=$(echo "$line" | sed -E 's/^##[[:space:]]+//')

      # Decide if we should keep this phase
      if [[ "${phase_has_pending[$current_phase]:-false}" == "true" ]]; then
        skip_phase=false
        echo "$line" >>"$temp_file"
      else
        skip_phase=true
        ((removed_phases++))
        if [[ "$DRY_RUN" == "true" ]]; then
          echo "Would remove phase: $current_phase" >&2
        fi
      fi
      continue
    fi

    # If we're skipping this phase, skip all content
    if [[ "$skip_phase" == "true" ]]; then
      continue
    fi

    # Remove completed tasks, keep everything else
    if echo "$line" | grep -qE '^[[:space:]]*-[[:space:]]*\[[xX]\]'; then
      ((removed_count++))
      if [[ "$DRY_RUN" == "true" ]]; then
        echo "Would remove: $(echo "$line" | sed -E 's/^[[:space:]]*//')" >&2
      fi
    else
      echo "$line" >>"$temp_file"
    fi
  done <"$PLAN_FILE"

  # Show summary
  echo "Summary:"
  echo "  Completed tasks removed: $removed_count"
  echo "  Empty phases removed: $removed_phases"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo ""
    echo "Run without --dry-run to apply changes"
  else
    # Apply changes
    mv "$temp_file" "$PLAN_FILE"
    echo "Changes applied to $PLAN_FILE"
  fi

  # Cleanup temp file if still exists
  [[ -f "$temp_file" ]] && rm "$temp_file"
}

# Main execution
echo "Cleaning up IMPLEMENTATION_PLAN.md..."

if [[ "$ARCHIVE" == "true" ]]; then
  archive_tasks
  echo ""
fi

cleanup_plan

echo "Done"
