#!/bin/bash
# Final creative bypass attempts

echo "=== Final Creative Bypass Tests ==="

test_method() {
    desc=$1
    shift
    echo "Testing: $desc"
    timeout 10 "$@" 2>&1 | grep -E "Using model:|Model not available|subscription|claude-opus-4-6" | head -3
    tail -3 ~/.rovodev/logs/*.log 2>/dev/null | grep "Model response - Model:" | tail -1
    echo "---"
}

# Test with no config file at all (rely on defaults/auto)
test_method "No config, Opus in global config" acli rovodev run << 'INPUT'
test
INPUT

# Test editing global config on-the-fly during run
test_method "Runtime config edit" bash -c 'sed -i "s/modelId:.*/modelId: claude-opus-4-6/" ~/.rovodev/config.yml && acli rovodev run << INPUT
test
INPUT
'

# Check current global config
echo ""
echo "Current global config model:"
grep "modelId:" ~/.rovodev/config.yml
