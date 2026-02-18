#!/bin/bash
# Test alternative provider prefix formats

echo "=== Testing Provider Prefix Exploits ==="

test_model() {
    model=$1
    echo "Testing: $model"
    timeout 10 acli rovodev run --config-file <(echo "runtime:
  modelId: $model") << 'INPUT' 2>&1 | grep -E "Using model:|Model not available|subscription" | head -3
test
INPUT
    echo "---"
}

# Anthropic provider formats
test_model "anthropic.claude-opus-4-6"
test_model "anthropic/claude-opus-4-6"
test_model "anthropic::claude-opus-4-6"

# Bedrock formats
test_model "anthropic.claude-opus-4-6-20250929-v1:0"
test_model "us.anthropic.claude-opus-4-6-20250929-v1:0"
test_model "bedrock/anthropic.claude-opus-4-6"

# Alternative naming
test_model "opus-4.6"
test_model "opus4.6"
test_model "claude-4-opus"
