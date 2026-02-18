#!/bin/bash
# Try calling the rovodev binary directly

echo "=== Testing Direct Binary Call ==="

binary="/home/grafe/.local/share/acli/1.3.13-stable/plugin/rovodev/atlassian_cli_rovodev"

echo "1. Check binary help:"
timeout 5 "$binary" --help 2>&1 | head -20
echo ""

echo "2. Try running with Opus config:"
timeout 10 "$binary" run --config-file <(echo "runtime:
  modelId: claude-opus-4-6") << 'INPUT' 2>&1 | grep -E "Using model:|Model not available|subscription" | head -5
test
INPUT

# Check what actually responded
tail -5 ~/.rovodev/logs/*.log 2>/dev/null | grep "Model response - Model:" | tail -1
