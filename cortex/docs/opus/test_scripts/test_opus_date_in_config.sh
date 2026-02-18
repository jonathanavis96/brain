#!/bin/bash
# Test if opus@date format works in config file

echo "=== TESTING OPUS WITH @ DATE IN CONFIG ==="

CONFIG_FILE="/tmp/test_opus_at_date_$$.yml"
cat > "$CONFIG_FILE" << 'EOFCONFIG'
version: 1
agent:
  modelId: claude-opus-4-6@20250929
  streaming: true
EOFCONFIG

echo "Config:"
cat "$CONFIG_FILE"

echo ""
echo "Testing:"
timeout 30 acli rovodev run --config-file "$CONFIG_FILE" --yolo "What model are you?" 2>&1 | tee /tmp/opus_at_date_test.log

echo ""
echo "Errors:"
grep -i "subscription\|not available\|fallback" /tmp/opus_at_date_test.log || echo "✅ NO ERROR!"

echo ""
echo "Actual model:"
tail -20 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -1

rm -f "$CONFIG_FILE"
