#!/bin/bash
# Check when the running config was created

echo "=== CONFIG FILE TIMELINE ==="
echo ""
echo "Running config file:"
ls -l /tmp/cortex_config_23307_1771410778.yml

echo ""
echo "Creation time from filename: 1771410778"
date -d @1771410778

echo ""
echo "Current time:"
date

echo ""
echo "That config was created: $(( $(date +%s) - 1771410778 )) seconds ago"
echo ""
echo "When was cortex.bash last modified?"
ls -l cortex/cortex.bash
git log -1 --format="%ai" cortex/cortex.bash

echo ""
echo "Theory: The config file was created BEFORE the cortex.bash change!"
echo "Let me check what cortex.bash looked like when this session started..."

COMMIT_AT_SESSION_START=$(git log --until="@1771410778" --format="%H" -1)
echo "Commit at session start: $COMMIT_AT_SESSION_START"

echo ""
echo "What did line 101 look like then?"
git show $COMMIT_AT_SESSION_START:cortex/cortex.bash | sed -n '100,102p'
