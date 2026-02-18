#!/bin/bash
# Test if there are model aliases that map to Opus

echo "=== Testing Model Alias Exploits ==="
echo ""

# Try different capitalization/formatting
test_models=(
  "Claude-Opus-4-6"
  "CLAUDE-OPUS-4-6"
  "claude_opus_4_6"
  "ClaudeOpus46"
  "opus4.6"
  "claude-opus-v4.6"
  "anthropic/claude-opus-4-6"
)

for model in "${test_models[@]}"; do
  echo "Testing: $model"
  timeout 10 acli rovodev run --yolo "hi" 2>&1 <<YAML | grep -E "Using model:|Model not available" | head -2
runtime:
  modelId: $model
YAML
  echo "---"
done
