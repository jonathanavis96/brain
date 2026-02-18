#!/bin/bash
in_fence=false
while IFS= read -r line; do
    if [[ "$line" =~ ^\`\`\`[a-z] ]]; then
        if $in_fence; then
            echo "ERROR: Opening fence while already in fence"
        fi
        in_fence=true
    elif [[ "$line" == '```' ]]; then
        if ! $in_fence; then
            echo "LINE $linenum: ERROR - Closing fence without opening"
        fi
        in_fence=false
    fi
    ((linenum++))
done < AGENTS.md
if $in_fence; then
    echo "ERROR: File ended with unclosed fence"
else
    echo "All fences properly paired"
fi
