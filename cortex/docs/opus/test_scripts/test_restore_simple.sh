#!/bin/bash
# Simple restore test with verified Opus session

echo "=== SIMPLE RESTORE TEST ==="
echo "Session: wf9374a1-d8ab-47b5-8159-30b3af61af57 (confirmed Opus history)"
echo ""

# Test restore with simple query
timeout 30 acli rovodev run --restore "wf9374a1-d8ab-47b5-8159-30b3af61af57" "What model are you?" 2>&1 | tee /tmp/restore_simple.log

echo ""
echo "=== Checking logs for actual model ==="
tail -20 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:"
