#!/bin/bash
# Check auth commands

echo "=== Testing Auth Commands ==="

echo "1. Auth help:"
acli rovodev auth --help 2>&1 | head -30
echo ""

echo "2. Check current auth status:"
acli rovodev auth status 2>&1 | head -20
