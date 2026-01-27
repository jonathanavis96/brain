#!/usr/bin/env bash
# mine_patterns.sh - Scan sibling project git logs for repeated patterns
# Part of Brain self-improvement: discover patterns that could become skills

set -euo pipefail

# Default configuration
DAYS_BACK="${1:-90}"
CODE_DIR="${HOME}/code"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
  cat <<EOF
Usage: $0 [DAYS_BACK]

Scan sibling project git logs for repeated commit patterns.

Arguments:
  DAYS_BACK    Number of days to look back (default: 90)

Environment:
  CODE_DIR     Base directory containing repositories (default: ~/code)

Examples:
  $0           # Scan last 90 days
  $0 30        # Scan last 30 days
  CODE_DIR=/projects $0  # Use custom directory

Output:
  Raw commit messages from all discovered repositories.
  Pipe to analyze_commits.py for pattern analysis.
EOF
  exit 0
}

# Parse arguments
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
  usage
fi

# Validate CODE_DIR exists
if [[ ! -d "$CODE_DIR" ]]; then
  echo -e "${RED}Error: CODE_DIR '$CODE_DIR' does not exist${NC}" >&2
  exit 1
fi

# Main logic
main() {
  local repo_count=0
  local commit_count=0

  echo -e "${GREEN}Scanning repositories in: $CODE_DIR${NC}" >&2
  echo -e "${YELLOW}Looking back: $DAYS_BACK days${NC}" >&2
  echo "" >&2

  # Find all directories containing .git
  while IFS= read -r -d '' repo; do
    # Skip the brain repository itself to avoid self-referential patterns
    if [[ "$(basename "$repo")" == "brain" ]]; then
      continue
    fi

    # Check if it's a valid git repository
    if ! git -C "$repo" rev-parse --git-dir >/dev/null 2>&1; then
      continue
    fi

    repo_count=$((repo_count + 1))
    local repo_name
    repo_name="$(basename "$repo")"

    echo -e "${GREEN}[Repository: $repo_name]${NC}" >&2

    # Extract commit messages (format: <commit-hash> <message>)
    local repo_commits=0
    while IFS= read -r line; do
      if [[ -n "$line" ]]; then
        echo "$line"
        repo_commits=$((repo_commits + 1))
        commit_count=$((commit_count + 1))
      fi
    done < <(git -C "$repo" log --oneline --since="${DAYS_BACK} days ago" 2>/dev/null || true)

    echo -e "${YELLOW}  → $repo_commits commits${NC}" >&2

  done < <(find "$CODE_DIR" -mindepth 1 -maxdepth 1 -type d -print0)

  echo "" >&2
  echo -e "${GREEN}Summary:${NC}" >&2
  echo -e "  Repositories scanned: $repo_count" >&2
  echo -e "  Total commits: $commit_count" >&2
}

main "$@"
