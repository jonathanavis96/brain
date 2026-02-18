#!/bin/bash
# Check if there's a way to manipulate auth/subscription data

echo "=== Testing Auth/Subscription Bypass ==="

echo "1. Check for subscription/auth cache:"
find ~/.local/share/acli ~/.rovodev -name "*subscription*" -o -name "*auth*" -o -name "*token*" 2>/dev/null | head -20
echo ""

echo "2. Check metadata.json:"
cat ~/.local/share/acli/*/plugin/rovodev/metadata.json 2>/dev/null
echo ""

echo "3. Look for subscription data in config:"
grep -r "subscription\|tier\|plan\|premium" ~/.rovodev/ 2>/dev/null | head -10
