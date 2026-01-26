#!/usr/bin/env bash
# cleanup_cortex_plan.sh - Archive completed tasks from cortex/IMPLEMENTATION_PLAN.md
#
# Usage:
#   bash cleanup_cortex_plan.sh --dry-run    # Preview what would be archived
#   bash cleanup_cortex_plan.sh              # Archive completed tasks to PLAN_DONE.md
#
# Features:
#   - Moves completed [x] tasks to PLAN_DONE.md with date stamp
#   - Removes empty phase sections from IMPLEMENTATION_PLAN.md
#   - Preserves pending [ ] tasks and phase headers with pending work

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLAN_FILE="${SCRIPT_DIR}/IMPLEMENTATION_PLAN.md"
ARCHIVE_FILE="${SCRIPT_DIR}/PLAN_DONE.md"

# Default flags
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h | --help)
      echo "Usage: bash cleanup_cortex_plan.sh [--dry-run]"
      echo ""
      echo "Options:"
      echo "  --dry-run    Preview what would be archived (no modifications)"
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

if [[ ! -f "$ARCHIVE_FILE" ]]; then
  echo "Error: PLAN_DONE.md not found at $ARCHIVE_FILE"
  echo "Create it first with a header section."
  exit 1
fi

echo "Cleaning up cortex/IMPLEMENTATION_PLAN.md..."

# Warn about malformed task entries (top-level task-like lines without checkboxes)
# Pattern: lines starting with "- **Goal:**" or "- **Completed:**" at column 0 (not indented sub-items)
# Indented sub-items like "  - **Goal:**" under a task are legitimate
orphaned_tasks=$(grep -nE '^-[[:space:]]+\*\*(Goal|Completed):\*\*' "$PLAN_FILE" || true)

if [[ -n "$orphaned_tasks" ]]; then
  echo ""
  echo "⚠️  WARNING: Found top-level task entries without checkboxes (will never be cleaned up):"
  echo "$orphaned_tasks" | head -10
  echo ""
  echo "Fix: Convert to '- [x] **X.Y.Z** Description' format or '- [ ] **X.Y.Z** Description'"
  echo "See: commit 5d1a8c2 for example fix"
  echo ""
fi

# Collect completed tasks for archiving
archived_tasks=()
current_date=$(date '+%Y-%m-%d')
current_phase=""

while IFS= read -r line; do
  # Track current phase
  if echo "$line" | grep -qE '^##[[:space:]]+Phase'; then
    current_phase=$(echo "$line" | sed -E 's/^##[[:space:]]+//')
  fi

  # Collect completed tasks
  if echo "$line" | grep -qE '^[[:space:]]*-[[:space:]]*\[[xX]\]'; then
    task_id=$(echo "$line" | sed -E 's/^[[:space:]]*-[[:space:]]*\[[xX]\][[:space:]]*\*\*([^*]+)\*\*.*/\1/' || echo "unknown")
    archived_tasks+=("| $current_date | $task_id | $line |")
  fi
done <"$PLAN_FILE"

if [[ ${#archived_tasks[@]} -eq 0 ]]; then
  echo "No completed tasks to archive."
  exit 0
fi

echo "Found ${#archived_tasks[@]} completed tasks to archive."

if [[ "$DRY_RUN" == "true" ]]; then
  echo ""
  echo "Would archive:"
  for task in "${archived_tasks[@]}"; do
    echo "  $task"
  done
  echo ""
  echo "Run without --dry-run to apply changes."
  exit 0
fi

# Archive tasks to PLAN_DONE.md (with deduplication)
# Read existing task IDs into memory before writing
existing_task_ids=$(grep -o '|[[:space:]]*[^|]*[[:space:]]*|[[:space:]]*[^|]*[[:space:]]*|' "$ARCHIVE_FILE" | awk -F'|' '{print $3}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || true)

{
  echo ""
  echo "### Archived on $current_date"
  echo ""
  echo "| Date | Task ID | Description |"
  echo "|------|---------|-------------|"
  for task in "${archived_tasks[@]}"; do
    # Extract task ID from the task string (format: | date | task_id | description |)
    task_id=$(echo "$task" | awk -F'|' '{print $3}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    # Check if task_id already exists in the pre-read list
    if ! echo "$existing_task_ids" | grep -qFx "$task_id"; then
      echo "$task"
    fi
  done
} >>"$ARCHIVE_FILE"

echo "Archived ${#archived_tasks[@]} tasks to PLAN_DONE.md"

# Now remove completed tasks and empty phases from IMPLEMENTATION_PLAN.md
temp_file=$(mktemp)
removed_count=0
removed_phases=0

# First pass: identify phases with pending tasks
declare -A phase_has_pending
current_phase=""

while IFS= read -r line; do
  if echo "$line" | grep -qE '^##[[:space:]]+Phase'; then
    current_phase=$(echo "$line" | sed -E 's/^##[[:space:]]+//')
    phase_has_pending["$current_phase"]=false
  fi

  if [[ -n "$current_phase" ]] && echo "$line" | grep -qE '^[[:space:]]*-[[:space:]]*\[[[:space:]]\]'; then
    phase_has_pending["$current_phase"]=true
  fi
done <"$PLAN_FILE"

# Second pass: write output
current_phase=""
skip_phase=false

while IFS= read -r line; do
  # Detect phase headers
  if echo "$line" | grep -qE '^##[[:space:]]+Phase'; then
    current_phase=$(echo "$line" | sed -E 's/^##[[:space:]]+//')

    if [[ "${phase_has_pending[$current_phase]:-false}" == "true" ]]; then
      skip_phase=false
      echo "$line" >>"$temp_file"
    else
      skip_phase=true
      removed_phases=$((removed_phases + 1))
    fi
    continue
  fi

  # Skip content in empty phases
  if [[ "$skip_phase" == "true" ]]; then
    continue
  fi

  # Remove completed tasks, keep everything else
  if echo "$line" | grep -qE '^[[:space:]]*-[[:space:]]*\[[xX]\]'; then
    removed_count=$((removed_count + 1))
  else
    echo "$line" >>"$temp_file"
  fi
done <"$PLAN_FILE"

# Apply changes
mv "$temp_file" "$PLAN_FILE"

echo ""
echo "Summary:"
echo "  Completed tasks removed: $removed_count"
echo "  Empty phases removed: $removed_phases"
echo "Changes applied to $PLAN_FILE"
echo ""
echo "Done"
