#!/bin/bash
# Check if we can find the rovodev CLI source/binary to understand validation

echo "=== Checking RovoDev Installation ==="
which acli
file $(which acli)
echo

echo "=== Finding RovoDev modules ==="
find ~/.npm -name "*rovodev*" -o -name "*rovo-dev*" 2>/dev/null | head -10
find /usr/local/lib -name "*rovodev*" -o -name "*rovo-dev*" 2>/dev/null | head -10
echo

echo "=== Checking for model validation code ==="
# Try to find where the subscription check happens
find ~ -type f -name "*.js" -o -name "*.ts" 2>/dev/null | xargs grep -l "Model not available for current subscription" 2>/dev/null | head -5
