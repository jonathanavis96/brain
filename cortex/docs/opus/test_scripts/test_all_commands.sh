#!/bin/bash
# Test if any rovodev subcommands have different validation

echo "=== Testing All Rovodev Commands ==="

# Get all commands
commands=$(acli rovodev --help 2>&1 | grep -A100 "Commands:" | grep "^\s\s[a-z]" | awk '{print $1}')

echo "Available commands:"
echo "$commands"
echo ""

# Test if any have different model validation
for cmd in $commands; do
    echo "Testing: acli rovodev $cmd"
    timeout 5 acli rovodev $cmd --help 2>&1 | grep -iE "model|config" | head -3
    echo "---"
done
