#!/usr/bin/env bash
# cortex/snapshot.sh - Generate current project state snapshot
# Used by Cortex to provide context

set -euo pipefail

# Resolve script directory (cortex/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Navigate to project root
cd "${PROJECT_ROOT}"

echo "# {{PROJECT_NAME}} Snapshot"
echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. Current Mission (from cortex/THOUGHTS.md)
echo "## Current Mission"
echo ""
if [[ -f "cortex/THOUGHTS.md" ]]; then
    awk '/^## Current Mission$/,/^## / {
        if (/^## Current Mission$/) { next }
        if (/^## / && !/^## Current Mission$/) { exit }
        print
    }' cortex/THOUGHTS.md | head -20
else
    echo "⚠️  cortex/THOUGHTS.md not found"
fi
echo ""

# 2. Task Progress (from IMPLEMENTATION_PLAN.md)
echo "## Task Progress"
echo ""
if [[ -f "IMPLEMENTATION_PLAN.md" ]]; then
    total_tasks=$(grep -cE '^\- \[(x|~| |\?)\] \*\*[0-9]' IMPLEMENTATION_PLAN.md || echo "0")
    completed_tasks=$(grep -cE '^\- \[x\] \*\*[0-9]' IMPLEMENTATION_PLAN.md || echo "0")
    echo "**Tasks:** ${completed_tasks}/${total_tasks} complete"
    
    # Show next uncompleted task
    next_task=$(grep -m 1 -E '^\- \[ \] \*\*[0-9]' IMPLEMENTATION_PLAN.md || echo "")
    if [[ -n "${next_task}" ]]; then
        echo "**Next:** ${next_task}"
    else
        echo "**Next:** All tasks complete!"
    fi
else
    echo "⚠️  IMPLEMENTATION_PLAN.md not found"
fi
echo ""

# 3. Last 3 THUNK entries
echo "## Recent Completions (Last 3 THUNK Entries)"
echo ""
if [[ -f "THUNK.md" ]]; then
    grep -E '^\| [0-9]+' THUNK.md | tail -3 || echo "No THUNK entries found"
else
    echo "⚠️  THUNK.md not found"
fi
echo ""

# 4. Git Status (clean/dirty)
echo "## Git Status"
echo ""
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    current_branch=$(git branch --show-current)
    echo "**Branch:** ${current_branch}"
    
    # Check if working directory is clean
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        echo "**Status:** Clean (no uncommitted changes)"
    else
        echo "**Status:** Dirty (uncommitted changes present)"
        echo ""
        echo "Modified files:"
        git status --short
    fi
else
    echo "⚠️  Not a git repository"
fi
echo ""

# 5. Last 5 commits (oneline)
echo "## Recent Commits (Last 5)"
echo ""
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git log --oneline -5 || echo "No commits found"
else
    echo "⚠️  Not a git repository"
fi
echo ""

echo "---"
echo "Snapshot complete."
