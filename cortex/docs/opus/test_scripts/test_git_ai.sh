#!/bin/bash
# Test git-ai binary directly

echo "=== Testing git-ai Binary ==="

git_ai="$HOME/.local/share/acli/1.3.13-stable/plugin/rovodev/git-ai/git-ai"

echo "1. git-ai help:"
timeout 5 "$git_ai" --help 2>&1 | head -30
echo ""

echo "2. git-ai version:"
timeout 5 "$git_ai" --version 2>&1
echo ""

echo "3. Try using git-ai with Opus config:"
cd ~/code/brain
timeout 10 "$git_ai" commit 2>&1 | grep -E "model|config" | head -10
