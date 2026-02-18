#!/bin/bash
# Test direct API manipulation

echo "=== Testing API-Level Exploits ==="

# Check for any API configuration in logs
echo "1. Checking for API endpoints/tokens in recent logs:"
zgrep -h "api\|endpoint\|authorization" ~/.rovodev/logs/*.log.gz 2>/dev/null | grep -i "claude\|opus\|anthropic" | head -5
echo ""

# Check environment variables that might affect API calls
echo "2. Checking relevant environment variables:"
env | grep -iE "anthropic|claude|rovodev|acli|api" | head -10
echo ""

# Look for cached API responses
echo "3. Checking for cached API responses:"
find ~/.rovodev -name "*cache*" -o -name "*api*" 2>/dev/null | head -10
echo ""

# Check if there's a way to bypass via node/npm config
echo "4. Checking Node/NPM configuration:"
which node npm
npm config list 2>/dev/null | grep -i "anthropic\|claude\|rovodev" | head -5
