#!/bin/bash
# Test if chat mode has different validation than run mode

echo "=== Testing Chat Mode vs Run Mode ==="

# Check if acli has a chat command
echo "Available rovodev commands:"
acli rovodev --help 2>&1 | grep -E "^\s+\w+" | head -20
