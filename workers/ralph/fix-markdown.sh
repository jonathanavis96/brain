#!/bin/bash
# fix-markdown.sh - Auto-fix markdown lint issues
#
# Usage: bash fix-markdown.sh [file1.md file2.md ...] or [directory]
#
# This script runs markdownlint --fix to automatically fix common issues:
#   - MD009: Trailing spaces
#   - MD010: Hard tabs
#   - MD012: Multiple consecutive blank lines
#   - MD031: Blanks around fenced code blocks
#   - MD032: Blanks around lists
#   - MD047: Files should end with a single newline
#
# Issues that CANNOT be auto-fixed (require manual edits):
#   - MD040: Fenced code blocks should have a language specified
#   - MD024: Multiple headings with same content
#   - MD036: Emphasis used instead of a heading
#
# Note: MD060 (table column style) is configured to "expanded" in .markdownlint.yaml
#
# Run this BEFORE attempting manual fixes to reduce the number of changes needed.

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Collect targets - either from args or default to current directory
if [[ $# -eq 0 ]]; then
  TARGETS=(".")
else
  TARGETS=("$@")
fi

# Filter to only existing files/directories
VALID_TARGETS=()
for target in "${TARGETS[@]}"; do
  if [[ -e "$target" ]]; then
    VALID_TARGETS+=("$target")
  else
    echo "Warning: $target does not exist, skipping" >&2
  fi
done

if [[ ${#VALID_TARGETS[@]} -eq 0 ]]; then
  echo "No valid targets to process"
  exit 0
fi

echo "=== Markdown Auto-Fix ==="
if [[ ${#VALID_TARGETS[@]} -eq 1 ]]; then
  echo "Target: ${VALID_TARGETS[0]}"
else
  echo "Targets: ${#VALID_TARGETS[@]} files"
fi
echo ""

# Count issues before
BEFORE_OUTPUT=$(markdownlint "${VALID_TARGETS[@]}" 2>&1 || true)
BEFORE=$(echo "$BEFORE_OUTPUT" | grep -c "error" || true)
BEFORE=${BEFORE:-0}

# Early exit if no issues to fix
if [[ $BEFORE -eq 0 ]]; then
  echo -e "Issues before: ${GREEN}0${NC}"
  echo "No issues found, skipping fix"
  echo ""
  echo "Done."
  exit 0
fi

echo -e "Issues before: ${YELLOW}${BEFORE}${NC}"

# Run the fix
echo ""
echo "Running markdownlint --fix..."
markdownlint --fix "${VALID_TARGETS[@]}" 2>&1 || true

# Count issues after
AFTER_OUTPUT=$(markdownlint "${VALID_TARGETS[@]}" 2>&1 || true)
AFTER=$(echo "$AFTER_OUTPUT" | grep -c "error" || true)
AFTER=${AFTER:-0}
echo ""
echo -e "Issues after:  ${YELLOW}${AFTER}${NC}"

# Calculate fixed
FIXED=$((BEFORE - AFTER))
if [[ $FIXED -gt 0 ]]; then
  echo -e "${GREEN}✓ Auto-fixed $FIXED issues${NC}"
else
  echo "No auto-fixable issues found"
fi

# Show remaining issues if any
if [[ $AFTER -gt 0 ]]; then
  echo ""
  echo -e "${RED}=== Remaining issues (need manual fix) ===${NC}"
  echo "$AFTER_OUTPUT" | head -30

  if [[ $AFTER -gt 30 ]]; then
    echo "... and $((AFTER - 30)) more"
  fi

  echo ""
  echo "Common manual fixes needed:"
  echo "  MD040: Add language to code fences (e.g., \`\`\`bash, \`\`\`python, \`\`\`text)"
  echo "  MD024: Rename duplicate headings to be unique"
  echo "  MD036: Convert bold text to proper headings (#### Heading)"
fi

echo ""
echo "Done."
