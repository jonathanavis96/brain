#!/bin/bash
# Test if --yolo flag makes a difference

echo "=== TESTING --yolo FLAG IMPACT ==="

CONFIG_FILE="/tmp/test_yolo_$$.yml"
cat > "$CONFIG_FILE" << 'EOFCONFIG'
version: 1
agent:
  modelId: claude-opus-4-6
  streaming: true
EOFCONFIG

echo "Test 1: WITHOUT --yolo"
timeout 20 acli rovodev run --config-file "$CONFIG_FILE" "test" 2>&1 | grep -E "Using model:|subscription|not available" | head -5

echo ""
echo "Test 2: WITH --yolo"
timeout 20 acli rovodev run --config-file "$CONFIG_FILE" --yolo "test" 2>&1 | grep -E "Using model:|subscription|not available" | head -5

echo ""
echo "Actual models:"
tail -30 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -3

rm -f "$CONFIG_FILE"
