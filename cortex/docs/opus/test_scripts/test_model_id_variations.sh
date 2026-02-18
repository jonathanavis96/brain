#!/bin/bash
# Test different model ID formats that might bypass validation

echo "=== TESTING MODEL ID VARIATIONS ==="

declare -a MODEL_IDS=(
  "claude-opus-4-6"
  "anthropic.claude-opus-4-6-20250929-v1:0"
  "opus-4-6"
  "opus4-6"
  "opus_4_6"
  "claude_opus_4_6"
  "anthropic/claude-opus-4-6"
  "bedrock/anthropic.claude-opus-4-6"
  "claude-opus-4.6"
  "claude.opus.4.6"
  "CLAUDE-OPUS-4-6"
)

for MODEL_ID in "${MODEL_IDS[@]}"; do
  echo "Testing: $MODEL_ID"
  
  CONFIG_FILE="/tmp/test_model_$$.yml"
  cat > "$CONFIG_FILE" << EOFCONFIG
version: 1
agent:
  modelId: $MODEL_ID
  streaming: true
EOFCONFIG
  
  # Quick test - just check startup message
  timeout 10 acli rovodev run --config-file "$CONFIG_FILE" --yolo "test" 2>&1 | grep -E "Using model:|subscription|not available" | head -2
  rm -f "$CONFIG_FILE"
  echo "---"
done

echo ""
echo "Actual models from logs (last 10):"
tail -100 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -10
