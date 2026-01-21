#!/usr/bin/env bash
# cortex/rovo/snapshot.sh - Generate current rovo project state snapshot
# Lean version: Git status, task status, recent commits only

set -euo pipefail

# Resolve paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ROVO_ROOT="${HOME}/code/rovo"

echo "# Rovo Account Manager Snapshot"
echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. Git Status (rovo project)
echo "## Git (rovo)"
if [[ -d "${ROVO_ROOT}" ]] && cd "${ROVO_ROOT}" && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Branch: $(git branch --show-current)"
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        echo "Status: Clean"
    else
        echo "Status: Dirty"
        git status --short
    fi
else
    echo "Rovo directory not found or not a git repo: ${ROVO_ROOT}"
fi
echo ""

# 2. Task Status (from brain cortex/rovo)
echo "## Tasks"
PLAN_FILE="${SCRIPT_DIR}/IMPLEMENTATION_PLAN.md"
if [[ -f "${PLAN_FILE}" ]]; then
    total=$(grep -cE '^\- \[(x|~| |\?)\] \*\*[0-9]' "${PLAN_FILE}" || echo "0")
    done=$(grep -cE '^\- \[x\] \*\*[0-9]' "${PLAN_FILE}" || echo "0")
    echo "Progress: ${done}/${total}"
    echo ""
    echo "Next:"
    grep -E '^\- \[ \] \*\*[0-9]' "${PLAN_FILE}" | head -3 || echo "None"
else
    echo "No IMPLEMENTATION_PLAN.md found"
fi
echo ""

# 3. Recent Commits (rovo project)
echo "## Recent Commits"
if [[ -d "${ROVO_ROOT}" ]] && cd "${ROVO_ROOT}"; then
    git log --oneline -5 2>/dev/null || echo "None"
else
    echo "Cannot access rovo directory"
fi
echo ""

# 4. Key File Status
echo "## Key Files"
if [[ -d "${ROVO_ROOT}/src" ]]; then
    echo "Window Manager:"
    ls -la "${ROVO_ROOT}/src/"*window*.{py,ps1} 2>/dev/null | awk '{print "  " $NF}' || echo "  Not found"
    echo "Account Creator:"
    ls -la "${ROVO_ROOT}/src/create_account.py" 2>/dev/null | awk '{print "  " $NF}' || echo "  Not found"
else
    echo "  src/ directory not found"
fi
