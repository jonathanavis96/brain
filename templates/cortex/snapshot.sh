#!/usr/bin/env bash
# snapshot.sh - Generate a quick status snapshot for Cortex

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$PROJECT_ROOT/.." && pwd)"

cd "$REPO_ROOT"

# Project name
PROJECT_NAME="$(basename "$REPO_ROOT")"

# Current date/time
NOW=$(date "+%Y-%m-%d %H:%M:%S")

echo "# ${PROJECT_NAME} Snapshot"
echo "Generated: $NOW"
echo ""

# Git status
echo "## Git"
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
if git diff-index --quiet HEAD -- 2>/dev/null; then
  echo "Status: Clean"
else
  echo "Status: Uncommitted changes"
fi
echo ""

# Task summary
echo "## Tasks"
PLAN_FILE="$PROJECT_ROOT/workers/IMPLEMENTATION_PLAN.md"
if [[ -f "$PLAN_FILE" ]]; then
  total=$(grep -cE '^\- \[[ x?]\] \*\*[0-9]' "$PLAN_FILE" 2>/dev/null || echo 0)
  done=$(grep -cE '^\- \[x\] \*\*[0-9]' "$PLAN_FILE" 2>/dev/null || echo 0)
  echo "Progress: $done/$total"
else
  echo "Progress: 0/0 (IMPLEMENTATION_PLAN.md not found)"
fi
echo ""

# Next tasks
echo "## Next Tasks"
if [[ -f "$PLAN_FILE" ]]; then
  grep -E '^\- \[ \] \*\*[0-9]' "$PLAN_FILE" | head -3 || echo "None"
else
  echo "None (IMPLEMENTATION_PLAN.md not found)"
fi
echo ""

# Recent commits
echo "## Recent Commits"
git log --oneline -5 2>/dev/null || echo "No commits"
echo ""
