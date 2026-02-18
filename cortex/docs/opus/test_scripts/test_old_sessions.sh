#!/bin/bash
# Test restoring old sessions from Feb 16

echo "=== Testing Old Session Restoration ==="

# Find sessions from Feb 16 that used Opus
echo "Sessions from Feb 16:"
find ~/.rovodev/sessions -name "metadata.json" -newermt "2026-02-16" ! -newermt "2026-02-17" -exec dirname {} \; | while read session_dir; do
    session_id=$(basename "$session_dir")
    echo "  $session_id"
done

# Try to restore one
oldest_session=$(find ~/.rovodev/sessions -name "metadata.json" -newermt "2026-02-16" ! -newermt "2026-02-17" -exec dirname {} \; | head -1 | xargs basename)

if [[ -n "$oldest_session" ]]; then
    echo ""
    echo "Attempting to restore session: $oldest_session"
    acli rovodev run --restore-session "$oldest_session" << 'INPUT' 2>&1 | tee /tmp/session_restore.log | grep -E "Using model:|Model not available|subscription|Restored"
What model are you using?
INPUT
    
    echo ""
    echo "Actual model used:"
    tail -5 ~/.rovodev/logs/*.log | grep "Model response - Model:" | tail -1
else
    echo "No old sessions found"
fi
