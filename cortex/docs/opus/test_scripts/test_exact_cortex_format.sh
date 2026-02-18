#!/bin/bash
# Test EXACT format from cortex.bash

echo "=== TESTING EXACT CORTEX.BASH CONFIG FORMAT ==="

CONFIG_FILE="/tmp/cortex_exact_test_$$.yml"

# Recreate EXACTLY what cortex.bash does
cat > "$CONFIG_FILE" << 'EOFCONFIG'
version: 1
agent:
  additionalSystemPrompt: |
    Test prompt
  streaming: true
  temperature: 0.3
  modelId: claude-opus-4-6
EOFCONFIG

echo "1. Config file created:"
cat "$CONFIG_FILE"

echo ""
echo "2. Testing with --config-file --yolo (same as cortex.bash):"
timeout 30 acli rovodev run --config-file "$CONFIG_FILE" --yolo "What model are you?" 2>&1 | tee /tmp/exact_cortex_test.log

echo ""
echo "3. Check for subscription error:"
grep -i "subscription\|not available\|fallback" /tmp/exact_cortex_test.log || echo "✅ NO SUBSCRIPTION ERROR!"

echo ""
echo "4. Actual model from logs:"
tail -20 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -1

rm -f "$CONFIG_FILE"
