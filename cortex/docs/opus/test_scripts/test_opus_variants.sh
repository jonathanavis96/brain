#!/bin/bash
# Test different Opus model ID variants to see if any bypass subscription check

variants=(
  "claude-opus-4-6"
  "claude-opus-4.6" 
  "anthropic.claude-opus-4-6-20250929-v1:0"
  "claude-opus-4-6@20250929"
  "opus-4-6"
  "opus46"
  "claude-opus-latest"
)

for variant in "${variants[@]}"; do
  echo "Testing: $variant"
  # Just check if model loads without actually running a full session
  timeout 10 acli rovodev run --config-file <(echo "runtime:
  modelId: $variant") --yolo "test" 2>&1 | grep -E "Model not available|Using model:|fallback" | head -3
  echo "---"
done
