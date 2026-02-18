#!/bin/bash
# Test Opus with @ date suffixes

echo "=== TESTING OPUS WITH @ DATE SUFFIXES ==="

declare -a OPUS_VARIANTS=(
  "claude-opus-4-6@20250929"
  "claude-opus-4-6@20251101"
  "claude-opus-4-6@20260101"
  "claude-opus-4-6@latest"
  "claude-opus-4.6@20250929"
  "anthropic.claude-opus-4-6@20250929"
)

for MODEL in "${OPUS_VARIANTS[@]}"; do
  echo "Testing: $MODEL"
  
  CONFIG_FILE="/tmp/test_opus_date_$$.yml"
  cat > "$CONFIG_FILE" << EOFCONFIG
version: 1
agent:
  modelId: $MODEL
  streaming: true
EOFCONFIG
  
  timeout 25 acli rovodev run --config-file "$CONFIG_FILE" --yolo "test" 2>&1 | grep -E "Using model:|subscription|not available|Response" | head -5
  
  rm -f "$CONFIG_FILE"
  echo "---"
  sleep 1
done

echo ""
echo "Actual models from logs:"
tail -200 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -10
