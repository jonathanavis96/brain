#!/bin/bash
# Test Opus 4.5 (not 4.6!)

echo "=== TESTING OPUS 4.5 (NOT 4.6) ==="

CONFIG_FILE="/tmp/test_opus45_$$.yml"
cat > "$CONFIG_FILE" << 'EOFCONFIG'
version: 1
agent:
  modelId: anthropic.claude-opus-4-5-20251101-v1:0
  streaming: true
  temperature: 0.3
EOFCONFIG

echo "Config:"
cat "$CONFIG_FILE"

echo ""
echo "Testing Opus 4.5:"
timeout 30 acli rovodev run --config-file "$CONFIG_FILE" --yolo "What model are you? Reply with your exact model name." 2>&1 | tee /tmp/opus45_test.log

echo ""
echo "Check for subscription error:"
grep -i "subscription\|not available\|fallback" /tmp/opus45_test.log || echo "✅ NO SUBSCRIPTION ERROR!"

echo ""
echo "Actual model from logs:"
tail -20 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -1

rm -f "$CONFIG_FILE"
