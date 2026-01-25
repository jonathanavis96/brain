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

  # Detect batching opportunities
  batching_opportunities=0
  declare -A error_codes
  declare -A directories
  declare -A file_types

  # Parse pending tasks for patterns
  while IFS= read -r line; do
    # Extract error codes (MDxxx, SCxxxx, etc.)
    if [[ $line =~ (MD[0-9]{3}|SC[0-9]{4}|E[0-9]{4}|W[0-9]{3}) ]]; then
      code="${BASH_REMATCH[1]}"
      error_codes[$code]=$((${error_codes[$code]:-0} + 1))
    fi

    # Extract file paths and analyze
    if [[ $line =~ '`'([^'`']+'`') ]]; then
      path="${BASH_REMATCH[1]}"
      # Get directory prefix (e.g., skills/, templates/)
      dir_prefix=$(echo "$path" | cut -d'/' -f1)
      directories[$dir_prefix]=$((${directories[$dir_prefix]:-0} + 1))

      # Get file extension
      if [[ $path =~ \.([a-z]+)$ ]]; then
        ext="${BASH_REMATCH[1]}"
        file_types[$ext]=$((${file_types[$ext]:-0} + 1))
      fi
    fi
  done < <(grep -E '^\- \[ \] \*\*[0-9]' workers/IMPLEMENTATION_PLAN.md)

  # Count batching opportunities (≥3 similar tasks)
  for code in "${!error_codes[@]}"; do
    if [[ ${error_codes[$code]} -ge 3 ]]; then
      batching_opportunities=$((batching_opportunities + 1))
    fi
  done

  for dir in "${!directories[@]}"; do
    if [[ ${directories[$dir]} -ge 3 ]]; then
      batching_opportunities=$((batching_opportunities + 1))
    fi
  done

  for ext in "${!file_types[@]}"; do
    if [[ ${file_types[$ext]} -ge 3 ]]; then
      batching_opportunities=$((batching_opportunities + 1))
    fi
  done

  # Show batching hints if opportunities exist
  if [[ $batching_opportunities -gt 0 ]]; then
    echo "⚡ Batching opportunities: ${batching_opportunities}"
    echo ""

    # Show details
    for code in "${!error_codes[@]}"; do
      if [[ ${error_codes[$code]} -ge 3 ]]; then
        echo "  - ${error_codes[$code]} tasks with error code $code"
      fi
    done

    for dir in "${!directories[@]}"; do
      if [[ ${directories[$dir]} -ge 3 ]]; then
        echo "  - ${directories[$dir]} tasks in ${dir}/"
      fi
    done

    for ext in "${!file_types[@]}"; do
      if [[ ${file_types[$ext]} -ge 3 ]]; then
        echo "  - ${file_types[$ext]} tasks for .$ext files"
      fi
    done
    echo ""
  fi

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
