#!/bin/bash
# Final comprehensive check

echo "=== FINAL COMPREHENSIVE CHECK ==="
echo ""
echo "1. Global config modelId:"
grep "modelId:" ~/.rovodev/config.yml

echo ""
echo "2. Cortex.bash default (line 65):"
grep "MODEL_ARG=" cortex/cortex.bash | head -1

echo ""
echo "3. What cortex.bash SHOULD produce (opus46 → claude-opus-4-6):"
echo "   claude-opus-4-6"

echo ""
echo "4. What the ACTUAL running config has:"
grep "modelId:" /tmp/cortex_config_23307_1771410778.yml

echo ""
echo "5. Theory: The config is using ~/.rovodev/config.yml, NOT cortex.bash resolution!"
echo ""
echo "Let me test if changing global config to opus works:"

# Backup current config
cp ~/.rovodev/config.yml ~/.rovodev/config.yml.backup_investigation

# Change to different opus variant
echo ""
echo "Testing: What if I use the @ date suffix format in global config?"
