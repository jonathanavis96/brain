#!/bin/bash
# Test shadow mode

echo "=== Testing Shadow Mode ==="

timeout 15 acli rovodev run --shadow << 'INPUT' 2>&1 | grep -E "Using model:|Model not available|subscription|Shadow mode" | head -10
test
INPUT

echo ""
echo "Model that responded:"
tail -5 ~/.rovodev/logs/*.log 2>/dev/null | grep "Model response - Model:" | tail -1
