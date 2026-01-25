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
if [[ "$ARCHIVE" == "true" ]]; then
  echo "Note: --archive flag not yet implemented (task 10.1.2)"
  echo "Proceeding with cleanup only..."
fi

echo "Cleaning up IMPLEMENTATION_PLAN.md..."
cleanup_plan

echo "Done"
