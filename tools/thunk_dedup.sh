#!/usr/bin/env bash
# thunk_dedup.sh - Remove duplicate entries from THUNK.md
#
# Usage:
#   bash tools/thunk_dedup.sh --dry-run    # Preview what would be removed
#   bash tools/thunk_dedup.sh              # Remove duplicates (idempotent)
#
# Features:
#   - Preserves first occurrence of each THUNK # (task ID)
#   - Outputs count of removed duplicates
#   - Idempotent - safe to run multiple times
#   - Preserves table structure and headers

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THUNK_FILE="${SCRIPT_DIR}/../workers/ralph/THUNK.md"

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
      echo "Usage: bash tools/thunk_dedup.sh [--dry-run]"
      echo ""
      echo "Options:"
      echo "  --dry-run    Preview what would be removed (no modifications)"
      echo "  -h, --help   Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate file exists
if [[ ! -f "$THUNK_FILE" ]]; then
  echo "Error: THUNK.md not found at $THUNK_FILE"
  exit 1
fi

echo "Analyzing $THUNK_FILE for duplicates..."

# Count total task rows (exclude headers and separators)
total_rows=$(awk '/^\|/ && !/^[|[:space:]]*THUNK[[:space:]]*#/ && !/^[|[:space:]]*[-]+[[:space:]]*\|/ {print}' "$THUNK_FILE" | wc -l)

# Count unique task IDs (column 2)
unique_ids=$(awk -F'|' '/^\|/ && !/^[|[:space:]]*THUNK[[:space:]]*#/ && !/^[|[:space:]]*[-]+[[:space:]]*\|/ {gsub(/^[[:space:]]+|[[:space:]]+$/, "", $2); print $2}' "$THUNK_FILE" | sort -u | wc -l)

duplicate_count=$((total_rows - unique_ids))

echo "Total task rows: $total_rows"
echo "Unique task IDs: $unique_ids"
echo "Duplicate rows to remove: $duplicate_count"

if [[ $duplicate_count -eq 0 ]]; then
  echo "No duplicates found. THUNK.md is clean."
  exit 0
fi

# Show duplicate task IDs
echo ""
echo "Duplicate task IDs:"
awk -F'|' '/^\|/ && !/^[|[:space:]]*THUNK[[:space:]]*#/ && !/^[|[:space:]]*[-]+[[:space:]]*\|/ {gsub(/^[[:space:]]+|[[:space:]]+$/, "", $2); print $2}' "$THUNK_FILE" | sort | uniq -d | head -20
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
  echo "Run without --dry-run to apply deduplication."
  exit 0
fi

# Perform deduplication
# Strategy: Keep first occurrence of each THUNK # (column 2)
temp_file=$(mktemp)

awk -F'|' '
BEGIN {
  OFS="|"
}
# Keep all non-table lines (headers, text, etc.)
!/^\|/ {
  print
  next
}
# Keep table headers
/^[|[:space:]]*THUNK[[:space:]]*#/ || /^[|[:space:]]*[-]+[[:space:]]*\|/ {
  print
  next
}
# For data rows, track THUNK # (column 2) and keep first occurrence
{
  # Extract and clean THUNK # (column 2)
  task_id = $2
  gsub(/^[[:space:]]+|[[:space:]]+$/, "", task_id)

  if (!seen[task_id]++) {
    print
  }
}' "$THUNK_FILE" >"$temp_file"

# Verify deduplication worked
new_total_rows=$(awk '/^\|/ && !/^[|[:space:]]*THUNK[[:space:]]*#/ && !/^[|[:space:]]*[-]+[[:space:]]*\|/ {print}' "$temp_file" | wc -l)
new_unique_ids=$(awk -F'|' '/^\|/ && !/^[|[:space:]]*THUNK[[:space:]]*#/ && !/^[|[:space:]]*[-]+[[:space:]]*\|/ {gsub(/^[[:space:]]+|[[:space:]]+$/, "", $2); print $2}' "$temp_file" | sort -u | wc -l)

if [[ $new_total_rows -ne $new_unique_ids ]]; then
  echo "Error: Deduplication failed verification (rows=$new_total_rows, unique=$new_unique_ids)"
  rm "$temp_file"
  exit 1
fi

# Apply changes
mv "$temp_file" "$THUNK_FILE"

echo ""
echo "Summary:"
echo "  Original rows: $total_rows"
echo "  After dedup: $new_total_rows"
echo "  Removed duplicates: $duplicate_count"
echo ""
echo "Deduplication complete. THUNK.md now has $new_total_rows unique task entries."
