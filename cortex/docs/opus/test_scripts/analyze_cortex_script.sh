#!/bin/bash
# Analyze how cortex.bash calls rovodev

echo "=== CORTEX.BASH ANALYSIS ==="
echo ""
echo "1. Looking for config-file usage:"
grep -n "config-file\|--config" cortex/cortex.bash || echo "None found"

echo ""
echo "2. Looking for model specifications:"
grep -n "model\|MODEL" cortex/cortex.bash || echo "None found"

echo ""
echo "3. Looking for the actual acli call:"
grep -n "acli rovodev run" cortex/cortex.bash

echo ""
echo "4. Full command construction:"
sed -n '100,200p' cortex/cortex.bash | grep -A5 -B5 "acli"

echo ""
echo "5. Check what args are passed:"
grep -n "\${.*ARGS\|ACLI_ARGS" cortex/cortex.bash

