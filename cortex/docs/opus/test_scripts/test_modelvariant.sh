#!/bin/bash
# Test modelVariant field - might bypass validation

echo "=== Testing modelVariant Exploit ==="

cat > /tmp/variant_config.yml << 'YAML'
runtime:
  modelId: auto
  modelVariant: claude-opus-4-6
YAML

echo "Config with modelVariant:"
cat /tmp/variant_config.yml
echo ""

timeout 20 acli rovodev run --config-file /tmp/variant_config.yml --yolo "test" 2>&1 | grep -E "Using model:|Model not|variant|fallback" | head -10
