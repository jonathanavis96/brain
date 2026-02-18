#!/bin/bash
# Test environment variable overrides

echo "=== Testing Environment Variable Exploits ==="

test_cases=(
  "ROVODEV_MODEL_ID=claude-opus-4-6"
  "ROVODEV_MODELID=claude-opus-4-6"
  "ACLI_MODEL=claude-opus-4-6"
  "MODEL_OVERRIDE=claude-opus-4-6"
)

for env_var in "${test_cases[@]}"; do
  echo "Testing: $env_var"
  timeout 10 bash -c "export $env_var && acli rovodev run --yolo 'test' 2>&1" | grep -E "Using model:|Model not available|fallback" | head -3
  echo "---"
done
