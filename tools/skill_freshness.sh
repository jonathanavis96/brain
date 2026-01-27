#!/usr/bin/env bash
set -euo pipefail

# skill_freshness.sh - List skills with age and flag stale ones
# Usage: skill_freshness.sh [--days N] [--exit-on-stale]

THRESHOLD_DAYS=90
EXIT_ON_STALE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --days)
      THRESHOLD_DAYS="$2"
      shift 2
      ;;
    --exit-on-stale)
      EXIT_ON_STALE=true
      shift
      ;;
    --help)
      echo "Usage: skill_freshness.sh [--days N] [--exit-on-stale]"
      echo ""
      echo "Options:"
      echo "  --days N           Set staleness threshold (default: 90)"
      echo "  --exit-on-stale    Exit with code 1 if any skills exceed threshold"
      echo "  --help             Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

# Get current time in seconds since epoch
NOW=$(date +%s)
THRESHOLD_SECONDS=$((THRESHOLD_DAYS * 86400))

echo "Skill Freshness Report"
echo "======================"
echo "Threshold: ${THRESHOLD_DAYS} days"
echo ""
echo "Format: [STATUS] AGE_DAYS | PATH"
echo ""

STALE_COUNT=0

# Find all .md files in skills/ directory
while IFS= read -r file; do
  # Get file modification time in seconds since epoch
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    MTIME=$(stat -f %m "$file")
  else
    # Linux
    MTIME=$(stat -c %Y "$file")
  fi

  # Calculate age in days
  AGE_SECONDS=$((NOW - MTIME))
  AGE_DAYS=$((AGE_SECONDS / 86400))

  # Determine status
  if [[ $AGE_SECONDS -gt $THRESHOLD_SECONDS ]]; then
    STATUS="[STALE]"
    STALE_COUNT=$((STALE_COUNT + 1))
  else
    STATUS="[ OK  ]"
  fi

  printf "%s %4d days | %s\n" "$STATUS" "$AGE_DAYS" "$file"
done < <(find skills/ -name "*.md" -type f | sort)

echo ""
echo "Summary:"
echo "--------"
TOTAL_COUNT=$(find skills/ -name "*.md" -type f | wc -l)
echo "Total skills: $TOTAL_COUNT"
echo "Stale skills: $STALE_COUNT (>${THRESHOLD_DAYS} days)"
echo "Fresh skills: $((TOTAL_COUNT - STALE_COUNT))"

# Exit with error code if requested and stale skills found
if [[ "$EXIT_ON_STALE" == true && $STALE_COUNT -gt 0 ]]; then
  exit 1
fi

exit 0
