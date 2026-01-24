#!/usr/bin/env bash
# cortex/snapshot.sh - Generate current brain repository state snapshot
# Lean version: Git status, Ralph status, recent commits only
# Other context (THOUGHTS, tasks, gaps) loaded via file injection

set -euo pipefail

# Resolve script directory (cortex/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Navigate to brain root
cd "${BRAIN_ROOT}"

echo "# Brain Snapshot"
echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. Git Status
echo "## Git"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Branch: $(git branch --show-current)"
  if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "Status: Clean"
  else
    echo "Status: Dirty"
    git status --short
  fi
else
  echo "Not a git repository"
fi
echo ""

# 2. Ralph Status
echo "## Ralph"
if [[ -f "workers/IMPLEMENTATION_PLAN.md" ]]; then
  ralph_total=$(grep -cE '^\- \[(x|~| |\?)\] \*\*[0-9]' workers/IMPLEMENTATION_PLAN.md || echo "0")
  ralph_done=$(grep -cE '^\- \[x\] \*\*[0-9]' workers/IMPLEMENTATION_PLAN.md || echo "0")
  echo "Tasks: ${ralph_done}/${ralph_total}"
  echo ""
  echo "Next:"
  grep -E '^\- \[ \] \*\*[0-9]' workers/IMPLEMENTATION_PLAN.md | head -3 || echo "None"
else
  echo "No IMPLEMENTATION_PLAN.md"
fi
echo ""

# 3. Recent Commits
echo "## Commits"
git log --oneline -5 2>/dev/null || echo "None"
echo ""

# 4. Pending Gaps from sibling projects
pending_gaps=()
shopt -s nullglob
for marker in "${BRAIN_ROOT}"/../*/cortex/.gap_pending; do
  [[ -f "$marker" ]] && pending_gaps+=("$marker")
done
shopt -u nullglob

if [[ ${#pending_gaps[@]} -gt 0 ]]; then
  echo "## Pending Gaps"
  echo "⚠️ ${#pending_gaps[@]} project(s) have pending gaps:"
  for marker in "${pending_gaps[@]}"; do
    project_dir=$(dirname "$(dirname "$marker")")
    project_name=$(basename "$project_dir")
    gap_file="$(dirname "$marker")/GAP_CAPTURE.md"
    count=$(grep -cE '^### [0-9]{4}-[0-9]{2}-[0-9]{2}' "$gap_file" 2>/dev/null) || count=0
    echo "  - $project_name: $count gap(s)"
  done
  echo ""
  echo "Run: bash cortex/sync_gaps.sh"
fi
