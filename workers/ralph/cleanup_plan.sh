#!/usr/bin/env bash
# cleanup_plan.sh - Archive completed tasks from workers/IMPLEMENTATION_PLAN.md
#
# Usage:
#   bash cleanup_plan.sh --dry-run    # Preview what would be archived
#   bash cleanup_plan.sh              # Archive completed tasks to PLAN_DONE.md
#
# Features:
#   - Moves completed [x] tasks to PLAN_DONE.md with date stamp
#   - Removes empty phase sections from IMPLEMENTATION_PLAN.md
#   - Preserves pending [ ] tasks and phase headers with pending work

set -euo pipefail

# Resolve repository root reliably
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Try git rev-parse first (most reliable in git repos)
if REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  : # Success - REPO_ROOT is set
else
  # Fallback: deterministic path traversal from script location
  # Script is in workers/ralph/, so repo root is two levels up
  REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
fi

# Use explicit paths from repo root
PLAN_FILE="${REPO_ROOT}/workers/IMPLEMENTATION_PLAN.md"
ARCHIVE_FILE="${REPO_ROOT}/workers/PLAN_DONE.md"

normalize_markdown_blank_lines() {
  local file="$1"
  # Enforce markdown whitespace invariant: at most one blank line between blocks.
  # (i.e., collapse any run of 3+ newlines down to exactly 2 newlines).
  python3 - "$file" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
text = re.sub(r"\n{3,}", "\n\n", text)
path.write_text(text, encoding="utf-8")
PY
}

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
      echo "Usage: bash cleanup_plan.sh [--dry-run]"
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

echo "Cleaning up workers/IMPLEMENTATION_PLAN.md..."

# Warn about orphaned task entries (sub-items without a parent task)
# These occur when cleanup removes "- [x] **X.Y**" but leaves indented sub-items behind
# Detect: indented "- **Goal:**" or "- **Completed:**" lines that appear after a blank line
# (legitimate sub-items follow their parent task directly, orphans follow blank lines or headers)

# Build list of potentially orphaned entries by checking context
orphaned_entries=""
# Track last seen task line and its line number
last_task_line_num=0
line_num=0
while IFS= read -r line; do
  line_num=$((line_num + 1))

  # Track parent task lines (- [ ] or - [x] or - [?])
  # Match task IDs like: **1.2**, **34.1.3**, **0.L.1**, etc.
  if echo "$line" | grep -qE '^[[:space:]]*-[[:space:]]*\[[xX \?]\][[:space:]]+\*\*[0-9]+(\.[0-9A-Za-z]+)+'; then
    last_task_line_num=$line_num
  fi

  # Check for indented sub-item pattern (Goal, AC, Completed, Verification, If Blocked, Implementation)
  if echo "$line" | grep -qE '^[[:space:]]+-[[:space:]]+\*\*(Goal|AC|Completed|Verification|If Blocked|Implementation):\*\*'; then
    # Calculate distance from last parent task
    distance=$((line_num - last_task_line_num))

    # If no parent task seen yet, or distance > 100 lines (reasonable threshold), flag as orphaned
    if [[ $last_task_line_num -eq 0 ]] || [[ $distance -gt 100 ]]; then
      orphaned_entries="${orphaned_entries}${line_num}: ${line}\n"
    fi
  fi
done <"$PLAN_FILE"

if [[ -n "$orphaned_entries" ]]; then
  echo ""
  echo "⚠️  WARNING: Found orphaned sub-items (no parent task - will never be cleaned up):"
  echo -e "$orphaned_entries" | head -10
  echo ""
  echo "Fix: Remove these lines or add a parent task '- [x] **X.Y.Z** Description' above them"
  echo ""
fi

# Helpers
is_task_line() {
  # Matches task IDs like: **1.2**, **34.1.3**, **0.L.1**, etc.
  echo "$1" | grep -qE '^[[:space:]]*-[[:space:]]*\[[xX \?]\][[:space:]]+\*\*[0-9]+(\.[0-9A-Za-z]+)+'
}

is_completed_task_line() {
  echo "$1" | grep -qE '^[[:space:]]*-[[:space:]]*\[[xX]\][[:space:]]+\*\*'
}

is_heading_line() {
  echo "$1" | grep -qE '^(#{1,6})[[:space:]]+'
}

extract_task_id() {
  echo "$1" | sed -E 's/^[[:space:]]*-[[:space:]]*\[[xX \?]\][[:space:]]*\*\*([^*]+)\*\*.*/\1/'
}

# Guardrail: enforce task-contract format for pending tasks.
# Each pending task must have Goal/AC/If Blocked sub-items before the next task/heading.
missing_contract=""
current_task_id=""
need_goal="false"
need_ac="false"
need_if_blocked="false"

while IFS= read -r line; do
  if is_task_line "$line"; then
    # finalize previous pending task check
    if [[ -n "$current_task_id" ]]; then
      if [[ "$need_goal" == "true" || "$need_ac" == "true" || "$need_if_blocked" == "true" ]]; then
        missing_contract+="$current_task_id\n"
      fi
    fi

    if echo "$line" | grep -qE '^[[:space:]]*-[[:space:]]*\[[[:space:]]\]'; then
      current_task_id="$(extract_task_id "$line")"
      need_goal="true"
      need_ac="true"
      need_if_blocked="true"
    else
      current_task_id="" # completed/[?] tasks not enforced here
      need_goal="false"
      need_ac="false"
      need_if_blocked="false"
    fi
    continue
  fi

  if [[ -n "$current_task_id" ]]; then
    if echo "$line" | grep -qE '^[[:space:]]+-[[:space:]]+\*\*Goal:\*\*'; then
      need_goal="false"
    elif echo "$line" | grep -qE '^[[:space:]]+-[[:space:]]+\*\*AC:\*\*'; then
      need_ac="false"
    elif echo "$line" | grep -qE '^[[:space:]]+-[[:space:]]+\*\*If Blocked:\*\*'; then
      need_if_blocked="false"
    fi
  fi

done <"$PLAN_FILE"

# finalize last pending task check
if [[ -n "$current_task_id" ]]; then
  if [[ "$need_goal" == "true" || "$need_ac" == "true" || "$need_if_blocked" == "true" ]]; then
    missing_contract+="$current_task_id\n"
  fi
fi

if [[ -n "$missing_contract" ]]; then
  echo ""
  echo "ERROR: Some pending tasks are missing required sub-items (**Goal**, **AC**, **If Blocked**):" >&2
  echo -e "$missing_contract" | sed '/^$/d' | head -25 | sed 's/^/  - /' >&2
  echo "" >&2
  echo "Fix: Reformat tasks to the contract style:" >&2
  echo "  - [ ] **X.Y** Description" >&2
  echo "    - **Goal:** ..." >&2
  echo "    - **AC:** ..." >&2
  echo "    - **If Blocked:** ..." >&2
  exit 1
fi

# Collect completed task blocks for archiving
archived_task_ids=()
archived_task_blocks=()
current_date=$(date '+%Y-%m-%d')
current_time=$(date '+%H:%M:%S')

# Read whole file so we can capture blocks
mapfile -t plan_lines <"$PLAN_FILE"

for ((i=0; i<${#plan_lines[@]}; i++)); do
  line="${plan_lines[$i]}"

  if is_completed_task_line "$line"; then
    task_id="$(extract_task_id "$line")"

    # Capture the block until the next task line or heading line
    block="$line"
    j=$((i+1))
    while [[ $j -lt ${#plan_lines[@]} ]]; do
      next="${plan_lines[$j]}"
      if is_task_line "$next" || is_heading_line "$next"; then
        break
      fi
      block+=$'\n'"$next"
      j=$((j+1))
    done

    archived_task_ids+=("$task_id")
    archived_task_blocks+=("$block")
  fi
done

if [[ ${#archived_task_ids[@]} -eq 0 ]]; then
  echo "No completed tasks to archive."
  exit 0
fi

echo "Found ${#archived_task_ids[@]} completed tasks to archive."

if [[ "$DRY_RUN" == "true" ]]; then
  echo ""
  echo "Would archive task blocks (IDs):"
  for task_id in "${archived_task_ids[@]}"; do
    echo "  - $task_id"
  done
  echo ""
  echo "Run without --dry-run to apply changes."
  exit 0
fi

# Archive task blocks to PLAN_DONE.md (with deduplication on Task ID)
existing_task_ids=$(grep -oE '\|[[:space:]]*[^|]*[[:space:]]*\|[[:space:]]*[^|]*[[:space:]]*\|' "$ARCHIVE_FILE" | awk -F'|' '{print $3}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || true)

{
  echo ""
  echo "### Archived on $current_date $current_time"
  echo ""
  for ((k=0; k<${#archived_task_ids[@]}; k++)); do
    task_id="${archived_task_ids[$k]}"
    block="${archived_task_blocks[$k]}"

    if echo "$existing_task_ids" | grep -qFx "$task_id"; then
      continue
    fi

    echo "- [x] **$task_id**"
    echo "  - **Archived From:** workers/IMPLEMENTATION_PLAN.md"
    echo "  - **Archived At:** $current_date $current_time"
    echo "  - **Block:**"
    echo ""
    echo "```markdown"
    echo "$block"
    echo "```"
    echo ""
  done
} >>"$ARCHIVE_FILE"

normalize_markdown_blank_lines "$ARCHIVE_FILE"

echo "Archived ${#archived_task_ids[@]} tasks to PLAN_DONE.md"

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
skip_task_subitems=false

while IFS= read -r line; do
  # Detect phase headers
  if echo "$line" | grep -qE '^##[[:space:]]+Phase'; then
    current_phase=$(echo "$line" | sed -E 's/^##[[:space:]]+//')
    skip_task_subitems=false # Reset on new phase

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

  # Detect new task (pending or completed)
  if is_task_line "$line"; then
    # Check if this is a completed task
    if is_completed_task_line "$line"; then
      removed_count=$((removed_count + 1))
      skip_task_subitems=true
      continue
    fi

    # Pending or [?] task - keep it
    skip_task_subitems=false
    echo "$line" >>"$temp_file"
    continue
  fi

  # Skip all lines that belong to a completed task block, but only until we hit a new task/heading.
  if [[ "$skip_task_subitems" == "true" ]]; then
    if is_heading_line "$line" || is_task_line "$line"; then
      # This is the start of a new logical section; stop skipping and re-process on next loop.
      skip_task_subitems=false
      # fall through to normal handling of this line
    else
      continue
    fi
  fi

  # Keep everything else
  echo "$line" >>"$temp_file"
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
