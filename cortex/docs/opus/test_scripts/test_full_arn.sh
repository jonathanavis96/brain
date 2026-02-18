#!/bin/bash
# Test using full ARN/model identifiers like the system uses internally

echo "=== Testing Full ARN/Model Identifier Format ==="

test_model() {
    model=$1
    echo "Testing: $model"
    timeout 10 acli rovodev run --config-file <(echo "runtime:
  modelId: $model") << 'INPUT' 2>&1 | grep -E "Using model:|Model not available|subscription" | head -3
test
INPUT
    # Check logs
    tail -5 ~/.rovodev/logs/*.log 2>/dev/null | grep "Model response - Model:" | tail -1
    echo "---"
}

# Try the full format from usage tracking
test_model "anthropic.claude-opus-4-6-20250929-v1:0"

# Try variations
test_model "anthropic.claude-opus-4.6-20250929-v1:0"
test_model "anthropic.claude-opus-4-6-v1:0"

# Try without version
test_model "anthropic.claude-opus-4-6-20250929"
