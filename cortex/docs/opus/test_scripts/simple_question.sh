#!/bin/bash
# Simple question: Can I just test the exact format that's in the running config?

echo "=== DIRECT TEST OF WORKING FORMAT ==="
echo ""
echo "The running config uses: claude-sonnet-4-5@20250929"
echo "And it's responding with: Sonnet 4.5 (confirmed)"
echo ""
echo "Now let me test if I can use the SAME format but with Opus:"
echo ""

# Test the @ format with various Opus variations
declare -a TEST_MODELS=(
  "claude-opus-4-6@20250929"
  "claude-opus-4-6@20251101"  
  "claude-opus-4.6@20250929"
)

for MODEL in "${TEST_MODELS[@]}"; do
  echo "Testing: $MODEL"
  CONFIG_FILE="/tmp/test_simple_$$.yml"
  cat > "$CONFIG_FILE" << EOFCONFIG
version: 1
agent:
  modelId: $MODEL
  additionalSystemPrompt: "Test"
  streaming: true
  temperature: 0.3
EOFCONFIG

  timeout 25 acli rovodev run --config-file "$CONFIG_FILE" --yolo "Reply with just: SUCCESS" 2>&1 | grep -E "Using model:|subscription|Response|SUCCESS" | head -4
  rm -f "$CONFIG_FILE"
  echo "---"
  sleep 2
done

echo ""
echo "Actual models from logs:"
tail -100 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -5
