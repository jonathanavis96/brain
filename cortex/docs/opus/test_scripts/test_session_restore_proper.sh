#!/bin/bash
# Properly test if old sessions can still use Opus

echo "=== SESSION RESTORATION TEST ==="

# Find sessions from Feb 16 (when exploit worked)
OLD_SESSION=$(ls -d ~/.rovodev/sessions/wf9374a1-* 2>/dev/null | head -1)

if [[ -n "$OLD_SESSION" ]]; then
    SESSION_ID=$(basename "$OLD_SESSION")
    echo "Found old session: $SESSION_ID"
    echo "Attempting to restore and continue..."
    
    timeout 15 acli rovodev run --workspace ~/code/brain --session-id "$SESSION_ID" << 'INPUT' 2>&1 | grep -E "Using model:|Model response - Model:|Model not available|subscription"
Hello, what model are you currently using?
INPUT
else
    echo "No old sessions found from exploit period"
fi
