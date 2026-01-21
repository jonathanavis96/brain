#!/usr/bin/env bash
# cortex/run.sh - Cortex Manager Entry Point
# Cortex is the high-level manager that orchestrates Ralph workers

set -euo pipefail

# Resolve script directory (cortex/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Navigate to brain root
cd "${BRAIN_ROOT}"

# Usage help
usage() {
  cat <<EOF
Usage: bash cortex/run.sh [OPTIONS]

Cortex Manager - High-level orchestration for the Brain repository.

Options:
  --help, -h           Show this help message
  --interactive, -i    Enable interactive chat mode (ask questions)
  --model MODEL        Override model (opus, sonnet, auto)
  --runner RUNNER      Use specific runner (rovodev, opencode) [default: rovodev]

Examples:
  bash cortex/run.sh                    # One-shot planning session
  bash cortex/run.sh --interactive      # Interactive chat with Cortex
  bash cortex/run.sh -i --model opus    # Interactive with specific model
  bash cortex/run.sh --runner opencode --model grok

Description:
  Cortex reads the current repository state and provides strategic
  direction by creating Task Contracts for Ralph workers.

  Modes:
  - Default: One-shot planning session (auto-approve with --yolo)
  - Interactive (-i): Chat with Cortex, ask questions, get guidance

  Context provided to Cortex:
  - CORTEX_SYSTEM_PROMPT.md (identity and rules)
  - snapshot.sh output (current state)
  - DECISIONS.md (architectural decisions)
  - REPO_MAP.md (navigation guide)

EOF
}

# Defaults
MODEL_ARG=""
RUNNER="rovodev"
INTERACTIVE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    -i|--interactive)
      INTERACTIVE=true
      shift
      ;;
    --model)
      MODEL_ARG="${2:-}"
      shift 2
      ;;
    --runner)
      RUNNER="${2:-rovodev}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

# Model version configuration - same as loop.sh
MODEL_SONNET_45="anthropic.claude-sonnet-4-5-20250929-v1:0"
MODEL_OPUS_45="anthropic.claude-opus-4-5-20251101-v1:0"
MODEL_SONNET_4="anthropic.claude-sonnet-4-20250514-v1:0"

# Resolve model shortcut to full model ID
resolve_model() {
  local model="$1"
  case "$model" in
    opus|opus4.5|opus45)
      echo "$MODEL_OPUS_45" ;;
    sonnet|sonnet4.5|sonnet45)
      echo "$MODEL_SONNET_45" ;;
    sonnet4)
      echo "$MODEL_SONNET_4" ;;
    latest|auto)
      echo "" ;;
    *)
      echo "$model" ;;
  esac
}

# Resolve model shortcut for OpenCode
resolve_model_opencode() {
  local model="$1"
  case "$model" in
    grok|grokfast|grok-code-fast-1)
      echo "opencode/grok-code" ;;
    opus|opus4.5|opus45)
      echo "opencode/gpt-5-nano" ;;  # Fallback
    sonnet|sonnet4.5|sonnet45)
      echo "opencode/gpt-5-nano" ;;  # Fallback
    latest|auto)
      echo "" ;;
    *)
      echo "$model" ;;
  esac
}

# Default to Opus 4.5 for Cortex (higher-level strategic thinking)
if [[ -z "$MODEL_ARG" ]]; then
  if [[ "$RUNNER" == "opencode" ]]; then
    MODEL_ARG="grok"
  else
    MODEL_ARG="opus"  # Cortex uses Opus by default
  fi
fi

if [[ "$RUNNER" == "opencode" ]]; then
  RESOLVED_MODEL="$(resolve_model_opencode "$MODEL_ARG")"
else
  RESOLVED_MODEL="$(resolve_model "$MODEL_ARG")"
fi

# Setup model config for RovoDev
CONFIG_FLAG=""
TEMP_CONFIG=""

if [[ "$RUNNER" == "rovodev" ]]; then
  if [[ -n "$RESOLVED_MODEL" ]]; then
    TEMP_CONFIG="/tmp/rovodev_cortex_config_$$_$(date +%s).yml"

    # Copy base config and override modelId
    if [[ -f "$HOME/.rovodev/config.yml" ]]; then
      sed "s|^  modelId:.*|  modelId: $RESOLVED_MODEL|" "$HOME/.rovodev/config.yml" > "$TEMP_CONFIG"
    else
      cat > "$TEMP_CONFIG" <<EOFCONFIG
version: 1
agent:
  modelId: $RESOLVED_MODEL
EOFCONFIG
    fi
    CONFIG_FLAG="--config-file $TEMP_CONFIG"
    echo "Using model: $RESOLVED_MODEL"
  fi
else
  if [[ -n "$RESOLVED_MODEL" ]]; then
    echo "Using model: $RESOLVED_MODEL"
  else
    echo "Using model: (OpenCode default)"
  fi
fi

# Check required files exist
REQUIRED_FILES=(
  "cortex/CORTEX_SYSTEM_PROMPT.md"
  "cortex/snapshot.sh"
  "cortex/DECISIONS.md"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "❌ Required file missing: $file" >&2
    exit 1
  fi
done

# Make snapshot.sh executable if not already
chmod +x cortex/snapshot.sh

echo "========================================"
echo "🧠 Cortex Manager"
echo "========================================"
echo ""
echo "Generating context snapshot..."
echo ""

# Generate snapshot to temporary file
SNAPSHOT_FILE="/tmp/cortex_snapshot_$$_$(date +%s).txt"
if ! bash cortex/snapshot.sh > "$SNAPSHOT_FILE" 2>&1; then
  echo "❌ Failed to generate snapshot" >&2
  cat "$SNAPSHOT_FILE"
  rm -f "$SNAPSHOT_FILE"
  exit 1
fi

echo "Snapshot generated successfully."
echo ""

# Build composite prompt
COMPOSITE_PROMPT="/tmp/cortex_prompt_$$_$(date +%s).md"

{
  echo "# Cortex Manager - Strategic Planning Session"
  echo ""
  echo "You are Cortex, the high-level manager for the Brain repository."
  echo ""

  echo "---"
  echo ""

  cat cortex/CORTEX_SYSTEM_PROMPT.md

  echo ""
  echo "---"
  echo ""
  echo "# Current Repository State"
  echo ""

  cat "$SNAPSHOT_FILE"

  echo ""
  echo "---"
  echo ""
  echo "# Architectural Decisions"
  echo ""

  cat cortex/DECISIONS.md

  echo ""
  echo "---"
  echo ""
  echo "# Repository Map"
  echo ""

  cat cortex/REPO_MAP.md

} > "$COMPOSITE_PROMPT"

echo "Composite prompt prepared: $COMPOSITE_PROMPT"
echo ""
echo "========================================"
echo "Invoking Cortex..."
echo "========================================"
echo ""

# Run Cortex
if [[ "$RUNNER" == "rovodev" ]]; then
  # RovoDev runner
  if [[ "$INTERACTIVE" == "true" ]]; then
    # Interactive mode - with --yolo for auto-approval
    echo "🧠 Cortex Interactive Mode"
    echo "📋 Cortex has full context of the Brain repository."
    echo "💬 You can now ask questions and have a conversation."
    echo ""
    acli rovodev run "$CONFIG_FLAG" --yolo "$(cat "$COMPOSITE_PROMPT")"
    EXIT_CODE=$?
  else
    # One-shot mode - auto-approve with --yolo
    acli rovodev run "$CONFIG_FLAG" --yolo "$(cat "$COMPOSITE_PROMPT")"
    EXIT_CODE=$?
  fi
else
  # OpenCode runner
  if [[ "$INTERACTIVE" == "true" ]]; then
    echo "⚠️  Warning: Interactive mode not fully supported with OpenCode runner"
    echo "    Falling back to default mode"
    echo ""
  fi
  if [[ -n "$RESOLVED_MODEL" ]]; then
    opencode run --model "$RESOLVED_MODEL" --format default "$(cat "$COMPOSITE_PROMPT")"
    EXIT_CODE=$?
  else
    opencode run --format default "$(cat "$COMPOSITE_PROMPT")"
    EXIT_CODE=$?
  fi
fi

# Cleanup temp files
rm -f "$SNAPSHOT_FILE" "$COMPOSITE_PROMPT" "$TEMP_CONFIG"

echo ""
echo "========================================"
echo "Cortex session complete."
echo "========================================"

exit $EXIT_CODE
