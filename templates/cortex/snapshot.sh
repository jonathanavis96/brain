#!/usr/bin/env bash
# snapshot.sh - Generate a quick status snapshot for Cortex
# Usage: bash brain/cortex/snapshot.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$BRAIN_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Project name
PROJECT_NAME="$(basename "$PROJECT_ROOT")"

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
  git status --short 2>/dev/null | head -15
fi
echo ""

# Task summary
echo "## Tasks"
PLAN_FILE="$BRAIN_DIR/workers/IMPLEMENTATION_PLAN.md"
if [[ -f "$PLAN_FILE" ]]; then
  pending=$(grep -cE '^\- \[ \] \*\*[0-9]' "$PLAN_FILE" 2>/dev/null || echo 0)
  done=$(grep -cE '^\- \[x\] \*\*[0-9]' "$PLAN_FILE" 2>/dev/null || echo 0)
  blocked=$(grep -cE '^\- \[\?\] \*\*[0-9]' "$PLAN_FILE" 2>/dev/null || echo 0)
  total=$((pending + done + blocked))
  echo "Progress: ${done}/${total} complete (${pending} pending, ${blocked} blocked)"
else
  echo "Progress: 0/0 (IMPLEMENTATION_PLAN.md not found)"
fi
echo ""

# Next tasks
echo "## Next Tasks"
if [[ -f "$PLAN_FILE" ]]; then
  next_tasks=$(grep -E '^\- \[ \] \*\*[0-9]' "$PLAN_FILE" | head -3)
  if [[ -n "$next_tasks" ]]; then
    echo "$next_tasks"
  else
    echo "None (all tasks complete or plan empty)"
  fi
else
  echo "None (IMPLEMENTATION_PLAN.md not found)"
fi
echo ""

# Batching opportunities (detect patterns in pending tasks)
if [[ -f "$PLAN_FILE" ]]; then
  pending_lines=$(grep -E '^\- \[ \] \*\*[0-9]' "$PLAN_FILE" 2>/dev/null || true)
  if [[ -n "$pending_lines" ]]; then
    pending_count=$(echo "$pending_lines" | wc -l)
    if [[ "$pending_count" -ge 3 ]]; then
      echo "## Batching Opportunities"
      echo "(${pending_count} pending tasks - check for patterns that can be batched)"
      echo ""
    fi
  fi
fi

# Recent commits
echo "## Recent Commits"
git log --oneline -5 2>/dev/null || echo "No commits"
echo ""

# Pending gaps from sibling projects
if [[ -f "$BRAIN_DIR/cortex/.gap_pending" ]]; then
  echo "## Pending Gaps"
  echo "Local gaps pending ingestion to Brain (brain/cortex/GAP_CAPTURE.md)"
  echo ""
fi
