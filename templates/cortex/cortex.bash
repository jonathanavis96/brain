#!/usr/bin/env bash
# cortex/cortex.bash - Interactive chat with Cortex via Claude Code
#
# This is the generic Cortex launcher. Projects bootstrapped with new-project.sh
# also get a project-specific launcher (cortex-PROJECT.bash) that calls this
# or can be customized independently.

set -euo pipefail

# Resolve script directory (follow symlink if needed)
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
SCRIPT_DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
BRAIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PROJECT_ROOT="$(cd "${BRAIN_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

# Colors
readonly CYAN='\033[0;36m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Cortex Interactive Chat (Claude Code)${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Usage help
usage() {
  cat <<EOF
Usage: bash brain/cortex/cortex.bash [OPTIONS]

Cortex Interactive Chat - Direct conversation with the project manager.

Options:
  --help, -h                       Show this help message
  --model MODEL                    Override model (opus, sonnet, haiku)
                                   Default: opus (Claude Opus 4.6)
  --design                         Start in design-only audit mode
  --dangerously-skip-permissions   Skip all permission prompts

Examples:
  bash brain/cortex/cortex.bash                    # Start chat with default model
  bash brain/cortex/cortex.bash --model sonnet     # Chat with Sonnet (less quota)
  bash brain/cortex/cortex.bash --design           # Design-only audit mode

Description:
  Opens an interactive chat session with Cortex via Claude Code.
  Use this for:
  - Asking questions about the project
  - Getting guidance on tasks
  - Discussing architectural decisions
  - Quick consultations

  For automated planning: bash brain/cortex/one-shot.sh
  To run Ralph (execution): bash brain/workers/ralph/loop.sh

EOF
}

# Defaults
MODEL_ARG=""
DESIGN_MODE="false"
SKIP_PERMISSIONS="true"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h | --help)
      usage
      exit 0
      ;;
    --model)
      MODEL_ARG="${2:-}"
      shift 2
      ;;
    --design)
      DESIGN_MODE="true"
      shift
      ;;
    --dangerously-skip-permissions)
      SKIP_PERMISSIONS="true"
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

# Model resolution for Claude Code
CLAUDE_MODEL_FLAG=""
if [[ -n "$MODEL_ARG" ]]; then
  case "$MODEL_ARG" in
    opus | opus46 | opus-4-6)
      CLAUDE_MODEL_FLAG="--model claude-opus-4-6"
      ;;
    sonnet | sonnet46 | sonnet-4-6)
      CLAUDE_MODEL_FLAG="--model claude-sonnet-4-6"
      ;;
    haiku | haiku45 | haiku-4-5)
      CLAUDE_MODEL_FLAG="--model claude-haiku-4-5-20251001"
      ;;
    *)
      CLAUDE_MODEL_FLAG="--model $MODEL_ARG"
      ;;
  esac
fi

echo ""

# Run cleanup before generating context (reduces token usage)
if [[ -x "${SCRIPT_DIR}/cleanup_cortex_plan.sh" ]]; then
  echo -e "${YELLOW}Running plan cleanup...${NC}"
  if bash "${SCRIPT_DIR}/cleanup_cortex_plan.sh" 2>/dev/null; then
    echo -e "${GREEN}Plan cleanup complete${NC}"
  else
    echo -e "${YELLOW}Plan cleanup skipped (no completed tasks)${NC}"
  fi
  echo ""
fi

# Snapshot no longer auto-injected - agent fetches on demand via: bash brain/cortex/snapshot.sh

# Optional design-only prompt injection
DESIGN_PROMPT_BLOCK=""
if [[ "$DESIGN_MODE" == "true" ]]; then
  DESIGN_PROMPT_BLOCK="

---

# Design-Only Mode

You are starting Cortex in **design-only audit mode**.

- Do **not** implement code changes.
- Follow the premium UI/UX audit prompt + protocol (if available in brain/docs/design/).
- Produce a structured audit report and a phased plan.
"
fi

# Build the system prompt - lean injection (THOUGHTS.md, NEURONS.md, snapshot fetched on demand)
SYSTEM_PROMPT=$(cat <<EOF
$(cat "${SCRIPT_DIR}/AGENTS.md")

---

$(cat "${SCRIPT_DIR}/CORTEX_SYSTEM_PROMPT.md")
${DESIGN_PROMPT_BLOCK}

---

# Chat Mode Instructions

You are now in **chat mode**. The user wants to have a direct conversation with you.

**Do NOT:**
- Automatically start a planning session
- Update files unless explicitly asked
- Execute the full planning workflow

**DO:**
- Answer questions about the project
- Provide guidance and recommendations when asked
- Help the user understand current state and next steps
- Be conversational and helpful
- Wait for user input and respond naturally

The user will now type their questions. Engage in a natural conversation.
EOF
)

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Starting Cortex Chat via Claude Code...${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${GREEN}You can now chat with Cortex!${NC}"
echo -e "${GREEN}Type 'exit' or press Ctrl+C to end the session.${NC}"
echo ""

# Build Claude Code command
CLAUDE_CMD="claude"

if [[ -n "$CLAUDE_MODEL_FLAG" ]]; then
  CLAUDE_CMD="$CLAUDE_CMD $CLAUDE_MODEL_FLAG"
fi

if [[ "$SKIP_PERMISSIONS" == "true" ]]; then
  CLAUDE_CMD="$CLAUDE_CMD --dangerously-skip-permissions"
fi

# Write system prompt to temp file (avoids shell escaping issues)
PROMPT_FILE=$(mktemp /tmp/cortex_prompt_XXXXXX.md)
echo "$SYSTEM_PROMPT" > "$PROMPT_FILE"

# Launch Claude Code with system prompt
$CLAUDE_CMD --system-prompt "$(cat "$PROMPT_FILE")"
EXIT_CODE=$?

# Cleanup
rm -f "$PROMPT_FILE"

echo ""
echo -e "${CYAN}========================================${NC}"
if [[ $EXIT_CODE -eq 0 ]]; then
  echo -e "${GREEN}Chat session ended${NC}"
else
  echo -e "${YELLOW}Chat session ended with code ${EXIT_CODE}${NC}"
fi
echo -e "${CYAN}========================================${NC}"

exit $EXIT_CODE
