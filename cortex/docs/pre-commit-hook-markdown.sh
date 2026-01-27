#!/usr/bin/env bash
# Pre-commit hook for markdown validation
# 
# Installation:
#   cp cortex/docs/pre-commit-hook-markdown.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# Purpose: Prevent commits with markdown lint errors in IMPLEMENTATION_PLAN.md files

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT" || exit 1

echo "🔍 Checking markdown files..."

# Files to check
FILES_TO_CHECK=(
  "cortex/IMPLEMENTATION_PLAN.md"
  "workers/IMPLEMENTATION_PLAN.md"
)

ERRORS_FOUND=0

for file in "${FILES_TO_CHECK[@]}"; do
  if [[ ! -f "$file" ]]; then
    continue
  fi
  
  echo "  Checking $file..."
  
  # Run markdownlint
  if ! markdownlint "$file" 2>&1; then
    ERRORS_FOUND=1
    echo "❌ Markdown lint errors found in $file"
  else
    echo "  ✓ $file passed"
  fi
done

if [[ $ERRORS_FOUND -eq 1 ]]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ Pre-commit check FAILED: Markdown lint errors detected"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "To fix automatically:"
  echo "  bash workers/ralph/fix-markdown.sh cortex/IMPLEMENTATION_PLAN.md"
  echo "  bash workers/ralph/fix-markdown.sh workers/IMPLEMENTATION_PLAN.md"
  echo ""
  echo "To fix manually:"
  echo "  - Add language tags to code fences (\`\`\`bash, \`\`\`text, \`\`\`json)"
  echo "  - Add blank lines before/after code blocks"
  echo "  - Make duplicate headings unique"
  echo ""
  echo "To bypass this check (NOT RECOMMENDED):"
  echo "  git commit --no-verify"
  echo ""
  exit 1
fi

echo "✓ All markdown files passed validation"
exit 0
