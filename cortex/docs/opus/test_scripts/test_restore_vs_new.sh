#!/bin/bash
# Compare restore vs new session

echo "=== TEST 1: New session with Opus config ==="
timeout 20 acli rovodev run "test" 2>&1 | grep -E "Using model:|subscription|not available" | head -5

echo ""
echo "=== TEST 2: Restore old Opus session ==="
timeout 20 acli rovodev run --restore "wf9374a1-d8ab-47b5-8159-30b3af61af57" "test" 2>&1 | grep -E "Using model:|subscription|not available" | head -5

echo ""
echo "=== Actual models from logs ==="
tail -50 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -5
