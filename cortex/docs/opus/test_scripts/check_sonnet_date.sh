#!/bin/bash
# Check if the @ date suffix works for Sonnet

echo "=== TESTING SONNET WITH @ DATE SUFFIX ==="

CONFIG_FILE="/tmp/test_sonnet_date_$$.yml"
cat > "$CONFIG_FILE" << 'EOFCONFIG'
version: 1
agent:
  modelId: claude-sonnet-4-5@20250929
  streaming: true
EOFCONFIG

echo "Config:"
cat "$CONFIG_FILE"

echo ""
echo "Testing Sonnet with @date:"
timeout 30 acli rovodev run --config-file "$CONFIG_FILE" --yolo "What model are you?" 2>&1 | tee /tmp/sonnet_date_test.log

echo ""
echo "Check for errors:"
grep -i "subscription\|not available\|fallback" /tmp/sonnet_date_test.log || echo "✅ NO ERROR!"

echo ""
echo "Actual model:"
tail -20 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -1

rm -f "$CONFIG_FILE"
