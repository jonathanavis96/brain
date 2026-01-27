#!/usr/bin/env bash
# Interactive skill quiz - presents scenarios from skill files

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
EXTRACTOR="${SCRIPT_DIR}/extract_scenarios.py"

# Colors for terminal output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

usage() {
  cat <<EOF
Usage: ${0##*/} [OPTIONS] [SKILL_PATH]

Interactive quiz that presents scenarios from skill markdown files.

OPTIONS:
    -h, --help          Show this help message
    -r, --random        Pick random skill from skills/ directory
    -n, --rounds N      Number of rounds to play (default: 5)

ARGUMENTS:
    SKILL_PATH          Path to specific skill markdown file (relative to brain root)

EXAMPLES:
    ${0##*/} skills/domains/code-quality/markdown-patterns.md
    ${0##*/} --random --rounds 10
EOF
}

find_random_skill() {
  local skills_dir="${BRAIN_ROOT}/skills"
  # Find all .md files in skills/domains/ excluding README.md and index files
  local skill_files
  skill_files=$(find "${skills_dir}/domains" -name "*.md" -type f \
    ! -name "README.md" \
    ! -name "index.md" \
    ! -name "SUMMARY.md" 2>/dev/null || true)

  if [[ -z "${skill_files}" ]]; then
    echo "Error: No skill files found in ${skills_dir}/domains" >&2
    exit 1
  fi

  # Pick random file
  echo "${skill_files}" | shuf -n 1
}

extract_scenarios() {
  local skill_path="$1"

  local output
  local rc

  # Capture stdout; keep stderr for debugging
  output=$(python3 "${EXTRACTOR}" "${skill_path}" 2> >(sed 's/^/[extractor] /' >&2))
  rc=$?

  if [[ $rc -ne 0 ]]; then
    echo "Error: scenario extractor failed (rc=$rc). Check that EXTRACTOR exists and the skill file is readable." >&2
    echo "  EXTRACTOR=${EXTRACTOR}" >&2
    echo "  SKILL_PATH=${skill_path}" >&2
    return $rc
  fi

  if [[ -z "${output}" ]]; then
    echo "Error: scenario extractor produced empty output." >&2
    return 1
  fi

  echo "${output}"
}

present_quiz() {
  local skill_path="$1"
  local rounds="${2:-5}"

  # Extract scenarios
  local scenarios_json
  if ! scenarios_json=$(extract_scenarios "${skill_path}"); then
    echo "Error: failed to extract scenarios for quiz." >&2
    return 1
  fi

  # Validate JSON before invoking jq
  if ! echo "${scenarios_json}" | jq -e . >/dev/null 2>&1; then
    echo "Error: extractor output is not valid JSON. This usually indicates an extractor failure." >&2
    echo "  EXTRACTOR=${EXTRACTOR}" >&2
    echo "  SKILL_PATH=${skill_path}" >&2
    return 1
  fi

  # Check if any scenarios found
  local scenario_count
  scenario_count=$(echo "${scenarios_json}" | jq 'length')

  if [[ "${scenario_count}" -eq 0 ]]; then
    echo -e "${YELLOW}Warning: No quiz scenarios found in ${skill_path}${NC}" >&2
    echo "Skill files need a scenario section like 'When to Use', 'Problem', 'Overview', 'Scenario', 'Example', or 'Use Case'." >&2
    echo "And a solution section like 'Quick Reference', 'Details', 'Purpose', 'Solution', 'Implementation', or 'How to Apply'." >&2
    return 1
  fi

  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}Skill Quiz: $(basename "${skill_path}" .md)${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
  echo "Found ${scenario_count} scenarios. Playing ${rounds} rounds."
  echo ""

  local correct=0
  local total=0

  for ((i = 1; i <= rounds; i++)); do
    # Pick random scenario (0-indexed)
    local idx=$((RANDOM % scenario_count))
    local scenario
    local solution

    scenario=$(echo "${scenarios_json}" | jq -r ".[$idx].scenario")
    solution=$(echo "${scenarios_json}" | jq -r ".[$idx].solution")

    echo -e "${BLUE}Round ${i}/${rounds}:${NC}"
    echo ""
    echo -e "${YELLOW}Scenario:${NC}"
    echo "${scenario}"
    echo ""
    echo -e "${YELLOW}What would you do?${NC}"
    echo "(Press ENTER to see the answer, or type your answer first)"
    echo ""

    read -r _user_answer

    echo ""
    echo -e "${GREEN}Solution:${NC}"
    echo "${solution}"
    echo ""

    # Simple self-assessment
    echo -e "${YELLOW}Did you get it right? (y/n)${NC}"
    read -r assessment

    ((++total))
    if [[ "${assessment}" =~ ^[Yy] ]]; then
      ((++correct))
      echo -e "${GREEN}✓ Correct!${NC}"
    else
      echo -e "${RED}✗ Review this pattern${NC}"
    fi

    echo ""
    echo -e "${BLUE}Score: ${correct}/${total}${NC}"
    echo ""

    if [[ ${i} -lt ${rounds} ]]; then
      echo "Press ENTER for next round..."
      read -r
      echo ""
    fi
  done

  # Final score
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}Final Score: ${correct}/${total}${NC}"

  local percentage=$((correct * 100 / total))
  if [[ ${percentage} -ge 80 ]]; then
    echo -e "${GREEN}Excellent! You know this skill well.${NC}"
  elif [[ ${percentage} -ge 60 ]]; then
    echo -e "${YELLOW}Good! Review the missed scenarios.${NC}"
  else
    echo -e "${RED}Review this skill file: ${skill_path}${NC}"
  fi
  echo -e "${BLUE}========================================${NC}"
}

main() {
  local skill_path=""
  local random_mode=false
  local rounds=5

  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h | --help)
        usage
        exit 0
        ;;
      -r | --random)
        random_mode=true
        shift
        ;;
      -n | --rounds)
        rounds="$2"
        shift 2
        ;;
      -*)
        echo "Error: Unknown option $1" >&2
        usage >&2
        exit 1
        ;;
      *)
        skill_path="$1"
        shift
        ;;
    esac
  done

  # Determine skill path
  if [[ "${random_mode}" == true ]]; then
    skill_path=$(find_random_skill)
    echo "Selected random skill: ${skill_path}"
    echo ""
  elif [[ -z "${skill_path}" ]]; then
    echo "Error: Must provide SKILL_PATH or use --random" >&2
    usage >&2
    exit 1
  fi

  # Make path absolute if relative
  if [[ ! "${skill_path}" =~ ^/ ]]; then
    skill_path="${BRAIN_ROOT}/${skill_path}"
  fi

  # Check file exists
  if [[ ! -f "${skill_path}" ]]; then
    echo "Error: File not found: ${skill_path}" >&2
    exit 1
  fi

  # Run quiz
  present_quiz "${skill_path}" "${rounds}"
}

main "$@"
