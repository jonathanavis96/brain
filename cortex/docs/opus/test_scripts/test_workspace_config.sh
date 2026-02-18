#!/bin/bash
# Test workspace-level config (might override global)

echo "=== Testing Workspace Config Exploit ==="

# Create local .rovodev/config.yml in workspace
mkdir -p .rovodev
cat > .rovodev/config.yml << 'YAML'
runtime:
  modelId: claude-opus-4-6
YAML

echo "Created workspace config:"
cat .rovodev/config.yml
echo ""

echo "Test: Run from workspace with local config"
acli rovodev run << 'INPUT' 2>&1 | tee /tmp/workspace_config.log | grep -E "Using model:|Model not available|subscription"
What model are you?
INPUT

# Check what actually responded
echo ""
echo "Actual model used:"
tail -5 ~/.rovodev/logs/*.log | grep "Model response - Model:" | tail -1

# Cleanup
rm -rf .rovodev/
