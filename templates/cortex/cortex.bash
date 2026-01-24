#!/usr/bin/env bash
# cortex/chat.sh - Interactive chat with Cortex (lightweight, no full planning session)

set -euo pipefail

# Resolve script directory (follow symlink if needed)
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
SCRIPT_DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
BRAIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${BRAIN_ROOT}"

# Colors
readonly CYAN='\033[0;36m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}🧠 Cortex Interactive Chat${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Usage help
usage() {
  cat <<EOF
Usage: bash cortex/chat.sh [OPTIONS]

Cortex Interactive Chat - Direct conversation with the Brain manager.

Options:
  --help, -h           Show this help message
  --model MODEL        Override model (opus, sonnet, auto)

Examples:
  bash cortex/chat.sh                    # Start chat with default model
  bash cortex/chat.sh --model opus       # Chat with specific model

Description:
  Opens an interactive chat session with Cortex. Unlike one-shot.sh,
  this does NOT trigger a full planning session. Use this for:
  - Asking questions about the repository
  - Getting guidance on tasks
  - Discussing architectural decisions
  - Quick consultations

  Cortex will have access to:
  - His identity (CORTEX_SYSTEM_PROMPT.md)
  - Current repository state (via snapshot)
  - All Brain documentation

  For automated planning sessions, use: bash cortex/one-shot.sh

EOF
}

# Defaults
MODEL_ARG="opus" # Default to Opus 4.5 for Cortex strategic planning

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
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

# Model resolution (same logic as one-shot.sh)
RESOLVED_MODEL=""
if [[ -n "$MODEL_ARG" ]]; then
  case "$MODEL_ARG" in
    opus)
      RESOLVED_MODEL="anthropic.claude-opus-4-5-20251101-v1:0"
      ;;
    sonnet)
      RESOLVED_MODEL="anthropic.claude-sonnet-4-20250514-v1:0"
      ;;
    auto)
      RESOLVED_MODEL=""
      ;;
    *)
      RESOLVED_MODEL="$MODEL_ARG"
      ;;
  esac
fi

if [[ -n "$RESOLVED_MODEL" ]]; then
  echo -e "${GREEN}Using model: ${RESOLVED_MODEL}${NC}"
else
  echo -e "${GREEN}Using default model${NC}"
fi

echo ""

# Generate lightweight context snapshot
echo -e "${YELLOW}Generating context snapshot...${NC}"
echo ""
SNAPSHOT_OUTPUT=$(bash "${SCRIPT_DIR}/snapshot.sh")

# Create Cortex system prompt for config
CORTEX_SYSTEM_PROMPT=$(
  cat <<EOF
$(cat "${SCRIPT_DIR}/AGENTS.md")

---

$(cat "${SCRIPT_DIR}/NEURONS.md")

---

$(cat "${SCRIPT_DIR}/CORTEX_SYSTEM_PROMPT.md")

---

$(cat "${SCRIPT_DIR}/THOUGHTS.md")

---

# Current Repository State

${SNAPSHOT_OUTPUT}

---

# Chat Mode Instructions

You are now in **chat mode**. The user wants to have a direct conversation with you.

**Do NOT:**
- Automatically start a planning session
- Update files unless explicitly asked
- Execute the full planning workflow from one-shot.sh

**DO:**
- Answer questions about the Brain repository
- Provide guidance and recommendations when asked
- Help the user understand current state and next steps
- Be conversational and helpful
- Wait for user input and respond naturally

The user will now type their questions. Engage in a natural conversation.
EOF
)

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Starting Cortex Chat...${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${GREEN}💬 You can now chat with Cortex!${NC}"
echo -e "${GREEN}📋 Cortex has full context of the Brain repository.${NC}"
echo -e "${GREEN}🚪 Type 'exit' or press Ctrl+C to end the session.${NC}"
echo ""

# Create temporary config file with Cortex system prompt
CONFIG_FILE="/tmp/cortex_config_$$_$(date +%s).yml"

cat >"$CONFIG_FILE" <<EOF
version: 1
agent:
  additionalSystemPrompt: |
$(while IFS= read -r line; do
  echo "    $line"
done <<<"$CORTEX_SYSTEM_PROMPT")
  streaming: true
  temperature: 0.3
EOF

# Add model if specified
if [[ -n "$RESOLVED_MODEL" ]]; then
  echo "  modelId: ${RESOLVED_MODEL}" >>"$CONFIG_FILE"
else
  echo "  modelId: auto" >>"$CONFIG_FILE"
fi

# Launch interactive chat (NO message argument = interactive mode)
acli rovodev run --config-file "$CONFIG_FILE" --yolo
EXIT_CODE=$?

# Cleanup
rm -f "$CONFIG_FILE"

echo ""
echo -e "${CYAN}========================================${NC}"
if [[ $EXIT_CODE -eq 0 ]]; then
  echo -e "${GREEN}✓ Chat session ended${NC}"
else
  echo -e "${YELLOW}⚠ Chat session ended with code ${EXIT_CODE}${NC}"
fi
echo -e "${CYAN}========================================${NC}"

exit $EXIT_CODE
