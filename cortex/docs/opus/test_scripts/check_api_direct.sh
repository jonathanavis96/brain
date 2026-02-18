#!/bin/bash
# Check if there's a way to call the backend API directly

echo "=== Checking for Direct API Access ==="
echo ""

# Look for API endpoints in recent logs
echo "Searching logs for API endpoints:"
zgrep -h "POST\|PUT\|api/" ~/.rovodev/logs/rovodev.2026-02-15_18-32-35_393939.log.gz 2>/dev/null | grep -i "model\|endpoint\|request" | head -10

echo ""
echo "Checking for auth tokens/headers:"
zgrep -h "Authorization\|X-.*Key\|Bearer" ~/.rovodev/logs/rovodev.2026-02-15_18-32-35_393939.log.gz 2>/dev/null | head -5
