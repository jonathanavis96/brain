#!/bin/bash
# Actually verify if ANY of these get through to Opus backend

echo "=== VERIFICATION: Testing if backend accepts Opus ==="
echo ""

test_variants=(
  "claude-opus-4-6"
  "claude-opus-4-6@20250929"
  "claude-opus-4-6@latest"
)

for variant in "${test_variants[@]}"; do
  echo "========================================="
  echo "Testing: $variant"
  echo "========================================="
  
  # Update config
  sed -i "s/modelId: .*/modelId: $variant/" ~/.rovodev/config.yml
  
  # Run and capture full output
  timeout 45 acli rovodev run --yolo "Say exactly: SUCCESS_${variant//[^a-zA-Z0-9]/_}" 2>&1 | tee /tmp/test_${variant//[^a-zA-Z0-9]/_}.log | grep -E "Using model:|Model not available|subscription|fallback|SUCCESS_|Model response - Model:"
  
  echo ""
  echo "Checking logs for actual model used:"
  grep "Model response - Model:" /tmp/test_${variant//[^a-zA-Z0-9]/_}.log | tail -1
  echo ""
  
  sleep 2
done

# Restore
sed -i 's/modelId: .*/modelId: claude-opus-4-6/' ~/.rovodev/config.yml
