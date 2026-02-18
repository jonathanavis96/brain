#!/bin/bash
# Test all Opus 4.5 variants

echo "=== TESTING OPUS 4.5 VARIANTS ==="

declare -a OPUS45_VARIANTS=(
  "anthropic.claude-opus-4-5-20251101-v1:0"
  "claude-opus-4-5"
  "claude-opus-4.5"
  "opus-4-5"
  "opus4-5"
  "claude-opus-4-5@20251101"
)

for MODEL in "${OPUS45_VARIANTS[@]}"; do
  echo "Testing: $MODEL"
  
  CONFIG_FILE="/tmp/test_$$.yml"
  cat > "$CONFIG_FILE" << EOFCONFIG
version: 1
agent:
  modelId: $MODEL
EOFCONFIG
  
  timeout 20 acli rovodev run --config-file "$CONFIG_FILE" --yolo "test" 2>&1 | grep -E "Using model:|subscription|not available" | head -3
  rm -f "$CONFIG_FILE"
  echo "---"
done

echo ""
echo "Models from logs:"
tail -100 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -8
