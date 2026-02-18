#!/bin/bash
# Check what model info is stored in old sessions

echo "=== Checking Session Model Data ==="

# Find sessions from Feb 16
for session_dir in $(find ~/.rovodev/sessions -name "metadata.json" -newermt "2026-02-16 21:00" ! -newermt "2026-02-17 00:00" -exec dirname {} \;); do
    session_id=$(basename "$session_dir")
    echo "Session: $session_id"
    
    # Check for model references in session context
    if [[ -f "$session_dir/session_context.json" ]]; then
        grep -o '"model[^"]*"[^,}]*' "$session_dir/session_context.json" 2>/dev/null | head -5
        echo ""
    fi
done | head -50
