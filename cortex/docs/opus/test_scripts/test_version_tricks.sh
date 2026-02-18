#!/bin/bash
# Test if different acli versions have different validation

echo "=== Testing Version/Update Tricks ==="

echo "1. Current acli version:"
acli --version 2>&1

echo ""
echo "2. Available versions:"
ls -la ~/.local/share/acli/ 2>/dev/null | grep -E "^d"

echo ""
echo "3. Check for beta/dev channels:"
acli update --help 2>&1 | grep -iE "beta|dev|channel|version" | head -10
