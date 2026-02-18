#!/bin/bash
# Test potentially hidden or undocumented flags

echo "=== Testing Hidden/Undocumented Flags ==="

test_flag() {
    flag=$1
    echo "Testing: $flag"
    timeout 5 acli rovodev run $flag claude-opus-4-6 << 'INPUT' 2>&1 | grep -E "Using model:|Model not available|Unknown option|subscription" | head -2
test
INPUT
    echo "---"
}

# Try various flag formats
test_flag "--model"
test_flag "--model-id"
test_flag "--force-model"
test_flag "--override-model"
test_flag "--beta-model"
test_flag "--experimental-model"
test_flag "--debug-model"
