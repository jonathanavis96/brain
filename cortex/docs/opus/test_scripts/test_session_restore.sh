#!/bin/bash
# Try to restore and continue an old Opus session

echo "=== Testing Session Restoration Exploit ==="
echo ""

# Find sessions from Feb 16 that might have Opus
OLD_SESSION=$(ls -t ~/.rovodev/sessions/*/metadata.json 2>/dev/null | xargs grep -l "2026-02-16" 2>/dev/null | head -1 | xargs dirname | xargs basename)

if [[ -n "$OLD_SESSION" ]]; then
  echo "Found old session: $OLD_SESSION"
  echo "Session metadata:"
  cat ~/.rovodev/sessions/$OLD_SESSION/metadata.json 2>/dev/null | head -20
  echo ""
  
  echo "Attempting to restore session:"
  timeout 30 acli rovodev run --restore-session $OLD_SESSION --yolo "What model are you?" 2>&1 | grep -E "Using model:|Model not available|restore|claude-opus|Model response" | head -15
else
  echo "No old sessions found"
fi
