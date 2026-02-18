#!/bin/bash
# Check if there's a direct rovodev binary we can call

echo "=== Checking for Direct Binary Access ==="

# Find where acli rovodev plugin is installed
echo "1. Plugin location:"
find ~/.local/share/acli -name "*rovodev*" -type f 2>/dev/null | head -10
echo ""

# Check if there's a standalone rovodev binary
echo "2. Looking for rovodev executables:"
which rovodev 2>/dev/null || echo "Not in PATH"
find ~/.local/share/acli -name "rovodev" -type f -executable 2>/dev/null | head -5
echo ""

# Check the actual plugin structure
echo "3. Plugin structure:"
ls -la ~/.local/share/acli/*/plugin/rovodev/ 2>/dev/null | head -20
