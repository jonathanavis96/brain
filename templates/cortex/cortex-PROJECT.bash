#!/usr/bin/env bash
# cortex/cortex-{{PROJECT_SLUG}}.bash - Interactive chat with Cortex for {{PROJECT_NAME}}

set -euo pipefail

# Resolve script directory
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
SCRIPT_DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

# Colors
readonly CYAN='\033[0;36m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}🧠 Cortex Interactive Chat${NC}"
echo -e "${CYAN}   {{PROJECT_NAME}}${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

usage() {
  echo "Usage: bash cortex/cortex-{{PROJECT_SLUG}}.bash [OPTIONS]"
  echo ""
  echo "Cortex Interactive Chat - Direct conversation with the project manager."
  echo ""
  echo "Options:"
  echo "  --help, -h           Show this help"
  echo "  --model MODEL        Override model (opus, sonnet, auto)"
  echo ""
  echo "Examples:"
  echo "  bash cortex/cortex-{{PROJECT_SLUG}}.bash              # Start chat"
  echo "  bash cortex/cortex-{{PROJECT_SLUG}}.bash --model opus # Chat with specific model"
  echo ""
  echo "Use this for:"
  echo "  - Asking questions about the project"
  echo "  - Getting guidance on tasks"
  echo "  - Discussing design decisions"
  echo "  - Quick consultations"
  echo ""
  echo "For automated planning: bash cortex/one-shot.sh"
  echo "To run Ralph (execution): bash loop.sh"
}

MODEL_ARG="opus"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --model) MODEL_ARG="${2:-}"; shift 2 ;;
    *) echo "Unknown: $1" >&2; usage; exit 2 ;;
  esac
done

RESOLVED_MODEL=""
case "$MODEL_ARG" in
  opus) RESOLVED_MODEL="anthropic.claude-opus-4-5-20251101-v1:0" ;;
  sonnet) RESOLVED_MODEL="anthropic.claude-sonnet-4-20250514-v1:0" ;;
  auto) RESOLVED_MODEL="" ;;
  *) RESOLVED_MODEL="$MODEL_ARG" ;;
esac

echo ""
echo -e "${YELLOW}Generating context snapshot...${NC}"
echo ""
SNAPSHOT_OUTPUT=$(bash "${SCRIPT_DIR}/snapshot.sh")

# Build system prompt with project context
CORTEX_SYSTEM_PROMPT=$(cat <<EOF
$(cat "${SCRIPT_DIR}/AGENTS.md")

---

$(cat "${PROJECT_ROOT}/NEURONS.md")

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
- Execute the full planning workflow

**DO:**
- Answer questions about the {{PROJECT_NAME}} project
- Provide guidance and recommendations when asked
- Help the user understand current state and next steps
- Be conversational and helpful
- Wait for user input and respond naturally

**To run Ralph (execution):** User runs \`bash loop.sh\` from project root

The user will now type their questions. Engage in a natural conversation.
EOF
)

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Starting Cortex Chat...${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${GREEN}💬 You can now chat with Cortex!${NC}"
echo -e "${GREEN}📋 Cortex has full context of the {{PROJECT_NAME}} project.${NC}"
echo -e "${GREEN}🚪 Type 'exit' or press Ctrl+C to end the session.${NC}"
echo ""

CONFIG_FILE="/tmp/cortex_config_$$_$(date +%s).yml"

cat > "$CONFIG_FILE" <<EOF
version: 1
agent:
  additionalSystemPrompt: |
$(while IFS= read -r line; do
    echo "    $line"
done <<< "$CORTEX_SYSTEM_PROMPT")
  streaming: true
  temperature: 0.3
EOF

if [[ -n "$RESOLVED_MODEL" ]]; then
  echo "  modelId: ${RESOLVED_MODEL}" >> "$CONFIG_FILE"
else
  echo "  modelId: auto" >> "$CONFIG_FILE"
fi

acli rovodev run --config-file "$CONFIG_FILE" --yolo
EXIT_CODE=$?

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
