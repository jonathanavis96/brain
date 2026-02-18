#!/bin/bash
# Test different date suffixes and version formats

echo "=== Testing Version/Date Format Exploits ==="
echo ""

date_variants=(
  "claude-opus-4-6@20250929"
  "claude-opus-4-6@20260101"
  "claude-opus-4-6@latest"
  "claude-opus-4.6.0"
  "claude-opus-4-6-v1"
  "claude-opus-4-6-v1:0"
  "anthropic.claude-opus-4-6:latest"
)

for variant in "${date_variants[@]}"; do
  echo "Testing: $variant"
  sed -i "s/modelId: .*/modelId: $variant/" ~/.rovodev/config.yml
  timeout 10 acli rovodev run --yolo "hi" 2>&1 | grep -E "Using model:|Model not available" | head -2
  echo "---"
done

# Restore original
sed -i 's/modelId: .*/modelId: claude-opus-4-6/' ~/.rovodev/config.yml
