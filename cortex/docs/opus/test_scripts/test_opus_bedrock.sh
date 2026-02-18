#!/bin/bash
# Test if bedrock ARN format works

echo "=== TESTING BEDROCK ARN FORMAT ==="

CONFIG_FILE="/tmp/test_bedrock_$$.yml"
cat > "$CONFIG_FILE" << 'EOFCONFIG'
version: 1
agent:
  modelId: us.anthropic.claude-opus-4-6-20250929-v1:0
  streaming: true
EOFCONFIG

echo "Config:"
cat "$CONFIG_FILE"

echo ""
echo "Testing:"
timeout 30 acli rovodev run --config-file "$CONFIG_FILE" --yolo "What model are you?" 2>&1 | tee /tmp/bedrock_test.log

echo ""
echo "Check for subscription error:"
grep -i "subscription\|not available" /tmp/bedrock_test.log || echo "✅ NO ERROR!"

echo ""
echo "Actual model:"
tail -20 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -1

rm -f "$CONFIG_FILE"
