#!/bin/bash
# Test feature flags and experimental features

echo "=== Testing Feature Flag Exploits ==="

test_config() {
    desc=$1
    config=$2
    echo "Testing: $desc"
    timeout 10 acli rovodev run --config-file <(echo "$config") << 'INPUT' 2>&1 | grep -E "Using model:|Model not available|subscription|experimental|beta" | head -3
test
INPUT
    echo "---"
}

test_config "enableDeepPlanTool with Opus" "runtime:
  modelId: claude-opus-4-6
  enableDeepPlanTool: true"

test_config "experimental features" "runtime:
  modelId: claude-opus-4-6
experimental:
  enabled: true
  betaFeatures: true"

test_config "debug mode" "runtime:
  modelId: claude-opus-4-6
debug:
  enabled: true
  bypassSubscriptionCheck: true"

test_config "legacy mode" "runtime:
  modelId: claude-opus-4-6
  useLegacyModelSelection: true"
