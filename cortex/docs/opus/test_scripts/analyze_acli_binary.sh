#!/bin/bash
# Analyze the acli binary to understand model validation

echo "=== ACLI BINARY ANALYSIS ==="

# Check if it's a Go binary
strings /usr/local/bin/acli | grep -i "opus\|subscription\|model.*available" | head -20
echo "---"

# Check for API endpoints
strings /usr/local/bin/acli | grep -E "https?://.*atlassian.*|https?://.*api" | sort -u | head -10
echo "---"

# Check for version info
/usr/local/bin/acli version 2>&1 || /usr/local/bin/acli --version 2>&1 || echo "No version flag found"
