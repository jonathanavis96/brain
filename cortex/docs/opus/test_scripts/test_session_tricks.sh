#!/bin/bash
# Test session manipulation tricks

echo "=== Testing Session Manipulation ==="

# Check if we can manually edit a session to use Opus
session_dir=$(find ~/.rovodev/sessions -name "metadata.json" -newermt "2026-02-16" ! -newermt "2026-02-17" | head -1 | xargs dirname)

if [[ -n "$session_dir" ]]; then
    session_id=$(basename "$session_dir")
    echo "Found old session: $session_id"
    
    # Backup and check current session
    echo "Current metadata:"
    cat "$session_dir/metadata.json" 2>/dev/null
    echo ""
    
    # Check if there's a model config in the session
    if [[ -f "$session_dir/session_context.json" ]]; then
        echo "Session context exists:"
        cat "$session_dir/session_context.json" 2>/dev/null | head -20
    fi
fi
