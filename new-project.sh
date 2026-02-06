#!/usr/bin/env bash
set -euo pipefail

# new-project.sh - Bootstrap new projects
#
# Thin wrapper that delegates to `scripts/new-project.sh`.
#
# Canonical behavior: create the Brain scaffold under `<repo>/brain/` to keep the
# project root clean.
#
# Usage:
#   bash new-project.sh NEW_PROJECT_IDEA.md

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/scripts/new-project.sh" "$@"
