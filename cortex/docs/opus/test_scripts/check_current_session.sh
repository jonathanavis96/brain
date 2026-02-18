#!/bin/bash
# Check what model THIS session is using

echo "=== CURRENT SESSION ANALYSIS ==="
echo ""
echo "1. Find the current rovodev process:"
ROVODEV_PID=$(pgrep -f "atlassian_cli_rovodev" | head -1)
echo "Process ID: $ROVODEV_PID"

if [[ -n "$ROVODEV_PID" ]]; then
  echo ""
  echo "2. Process command line:"
  cat /proc/$ROVODEV_PID/cmdline | tr '\0' ' ' | fold -w 100
  
  echo ""
  echo ""
  echo "3. Process environment (rovodev/model related):"
  cat /proc/$ROVODEV_PID/environ | tr '\0' '\n' | grep -i "model\|rovodev\|config" | head -20
fi

echo ""
echo "4. Check for temp config files:"
ls -lht /tmp/cortex_config_* 2>/dev/null | head -5

echo ""
echo "5. Most recent temp config content:"
LATEST_CONFIG=$(ls -t /tmp/cortex_config_* 2>/dev/null | head -1)
if [[ -f "$LATEST_CONFIG" ]]; then
  echo "File: $LATEST_CONFIG"
  cat "$LATEST_CONFIG"
fi

echo ""
echo "6. What model is responding in THIS conversation:"
tail -100 ~/.rovodev/logs/rovodev.log | grep "Model response - Model:" | tail -5
