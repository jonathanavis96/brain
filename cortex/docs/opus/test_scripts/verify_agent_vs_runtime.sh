#!/bin/bash
# Test if the key is agent.modelId vs runtime.modelId

echo "=== TESTING CONFIG STRUCTURE VARIATIONS ==="

# Test 1: runtime.modelId
echo "Test 1: runtime.modelId"
CONFIG1="/tmp/test_runtime_$$.yml"
cat > "$CONFIG1" << EOFCONFIG
version: 1
runtime:
  modelId: claude-opus-4-6
EOFCONFIG
timeout 20 acli rovodev run --config-file "$CONFIG1" "test1" 2>&1 | grep -E "Using model:|subscription" | head -3
rm -f "$CONFIG1"

echo ""
echo "Test 2: agent.modelId"
CONFIG2="/tmp/test_agent_$$.yml"
cat > "$CONFIG2" << EOFCONFIG
version: 1
agent:
  modelId: claude-opus-4-6
EOFCONFIG
timeout 20 acli rovodev run --config-file "$CONFIG2" "test2" 2>&1 | grep -E "Using model:|subscription" | head -3
rm -f "$CONFIG2"

echo ""
echo "Test 3: Just modelId at root"
CONFIG3="/tmp/test_root_$$.yml"
cat > "$CONFIG3" << EOFCONFIG
version: 1
modelId: claude-opus-4-6
EOFCONFIG
timeout 20 acli rovodev run --config-file "$CONFIG3" "test3" 2>&1 | grep -E "Using model:|subscription" | head -3
rm -f "$CONFIG3"

echo ""
echo "Actual models from logs:"
tail -30 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -5
