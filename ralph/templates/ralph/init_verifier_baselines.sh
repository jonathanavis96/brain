#!/usr/bin/env bash
# init_verifier_baselines.sh - Initialize verifier hash baselines for a new project
#
# Run this after copying template files to generate project-specific hashes.
# These hashes protect against "edit the judge" attacks.
#
# Usage: ./init_verifier_baselines.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Initializing verifier baselines..."

# Create .verify directory
mkdir -p .verify

# Generate hash baselines for protected files
echo "Generating hash baselines..."

if [[ -f "AC.rules" ]]; then
  sha256sum AC.rules > .verify/ac.sha256
  echo "  ✓ AC.rules → .verify/ac.sha256"
fi

if [[ -f "loop.sh" ]]; then
  sha256sum loop.sh | cut -d' ' -f1 > .verify/loop.sha256
  echo "  ✓ loop.sh → .verify/loop.sha256"
fi

if [[ -f "verifier.sh" ]]; then
  sha256sum verifier.sh | cut -d' ' -f1 > .verify/verifier.sha256
  echo "  ✓ verifier.sh → .verify/verifier.sha256"
fi

if [[ -f "PROMPT.md" ]]; then
  sha256sum PROMPT.md | cut -d' ' -f1 > .verify/prompt.sha256
  echo "  ✓ PROMPT.md → .verify/prompt.sha256"
fi

# Ensure .gitignore has the right entries
if [[ -f ".gitignore" ]]; then
  if ! grep -q ".verify/latest.txt" .gitignore; then
    echo "" >> .gitignore
    echo "# Verifier runtime outputs (do not track)" >> .gitignore
    echo ".verify/latest.txt" >> .gitignore
    echo ".verify/run_id.txt" >> .gitignore
    echo "  ✓ Updated .gitignore"
  fi
fi

echo ""
echo "✅ Verifier baselines initialized!"
echo ""
echo "Files created in .verify/:"
ls -la .verify/*.sha256 2>/dev/null || echo "  (none)"
echo ""
echo "Next steps:"
echo "  1. Run ./verifier.sh to verify all checks pass"
echo "  2. Commit the .verify/*.sha256 files"
echo "  3. Do NOT commit .verify/latest.txt or .verify/run_id.txt"
