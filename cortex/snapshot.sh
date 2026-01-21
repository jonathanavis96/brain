#!/usr/bin/env bash
# cortex/snapshot.sh - Generate current brain repository state snapshot
# Used by cortex/run.sh to provide context to Cortex manager

set -euo pipefail

# Color codes for output
readonly CYAN='\033[0;36m'
readonly YELLOW='\033[1;33m'
readonly GREEN='\033[0;32m'
readonly RED='\033[0;31m'
readonly NC='\033[0m' # No Color

# Resolve script directory (cortex/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Navigate to brain root
cd "${BRAIN_ROOT}"

echo "# Brain Repository Snapshot"
echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. Current Mission (from cortex/THOUGHTS.md)
echo "## Current Mission"
echo ""
if [[ -f "cortex/THOUGHTS.md" ]]; then
    # Extract "Current Mission" section (between ## Current Mission and next ##)
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
    # Extract last 3 table rows (excluding headers and separators)
    grep -E '^\| [0-9]+' THUNK.md | tail -3 || echo "No THUNK entries found"
else
    echo "⚠️  THUNK.md not found"
fi
echo ""

# 4. GAP_BACKLOG.md entry count
echo "## Skills Gap Backlog"
echo ""
if [[ -f "skills/self-improvement/GAP_BACKLOG.md" ]]; then
    gap_count=$(grep -cE '^### GAP-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3}' skills/self-improvement/GAP_BACKLOG.md || echo "0")
    echo "**Total Gaps Captured:** ${gap_count}"
else
    echo "⚠️  skills/self-improvement/GAP_BACKLOG.md not found"
fi
echo ""

# 5. Git Status (clean/dirty)
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

# 6. Last 5 commits (oneline)
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
