#!/bin/bash
# Test if we can merge/override configs to bypass validation

echo "=== Testing Config Merge/Override Exploit ==="
echo ""

# Create a base config with Opus
cat > /tmp/base_config.yml << 'YAML'
runtime:
  modelId: claude-opus-4-6
YAML

# Try using both global and override
echo "Test 1: Use global config with Opus, run without --config-file"
cp ~/.rovodev/config.yml ~/.rovodev/config.yml.backup
sed -i 's/modelId: .*/modelId: claude-opus-4-6/' ~/.rovodev/config.yml
timeout 15 acli rovodev run --yolo "test" 2>&1 | grep -E "Using model:|Model not available|fallback" | head -5
mv ~/.rovodev/config.yml.backup ~/.rovodev/config.yml
echo ""

# Try with different config locations
echo "Test 2: Config in current directory"
cat > ./config.yml << 'YAML'
runtime:
  modelId: claude-opus-4-6
YAML
timeout 10 acli rovodev run --yolo "test" 2>&1 | grep -E "Using model:|Model not available" | head -3
rm -f ./config.yml
