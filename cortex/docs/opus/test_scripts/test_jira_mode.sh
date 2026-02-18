#!/bin/bash
# Test if --jira flag has different model validation

echo "=== Testing --jira Flag ==="

# Check if jira mode has different behavior
timeout 20 acli rovodev run --jira "https://example.atlassian.net/browse/TEST-1" "test" 2>&1 | grep -E "Using model:|subscription|not available" | head -5

echo ""
echo "Actual model from logs:"
tail -20 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -1
