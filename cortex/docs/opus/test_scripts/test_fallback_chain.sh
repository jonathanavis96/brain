#!/bin/bash
# Test if Opus can be injected into fallback chain

echo "=== Testing Fallback Chain Exploit ==="

# Create config with Opus in fallback
cat > /tmp/test_fallback_config.yml << 'YAML'
runtime:
  modelId: invalid-model-to-trigger-fallback
  fallbackModels:
    - claude-opus-4-6
    - anthropic.claude-sonnet-4-5-20250929-v1:0
YAML

echo "Config:"
cat /tmp/test_fallback_config.yml
echo ""

echo "Testing with Opus in fallback chain:"
timeout 15 acli rovodev run --config-file /tmp/test_fallback_config.yml --yolo "test" 2>&1 | grep -E "fallback|Using model:|Model not available" | head -10
