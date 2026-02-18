#!/bin/bash
# Test continuing a session from Feb 16 when Opus was working

echo "=== Testing Session Continuation ==="

# Find a session from Feb 16 that used Opus
old_session=$(find ~/.rovodev/sessions -name "metadata.json" -newermt "2026-02-16 21:00" ! -newermt "2026-02-17 00:00" | head -1 | xargs dirname | xargs basename)

if [[ -n "$old_session" ]]; then
    echo "Found old Opus session: $old_session"
    echo ""
    
    echo "Testing restore with continuation:"
    timeout 15 acli rovodev run --restore-session "$old_session" << 'INPUT' 2>&1 | tee /tmp/session_continue.log | grep -E "Using model:|Model not available|Restored|subscription"
What model are you?
INPUT
    
    echo ""
    echo "Actual model from logs:"
    tail -10 ~/.rovodev/logs/*.log 2>/dev/null | grep "Model response - Model:" | tail -1
else
    echo "No old session found"
fi
