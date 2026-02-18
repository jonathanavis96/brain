#!/bin/bash
# Test if serve/lsp modes have different validation

echo "=== Testing Alternative Modes ==="

echo "1. Testing 'serve' mode:"
timeout 5 acli rovodev serve --help 2>&1 | head -20
echo ""

echo "2. Testing 'lsp' mode:"
timeout 5 acli rovodev lsp --help 2>&1 | head -20
