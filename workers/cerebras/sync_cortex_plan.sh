#!/usr/bin/env bash
# sync_cortex_plan.sh - Copy workers plan to cortex for review
#
# Purpose: Copy the workers/IMPLEMENTATION_PLAN.md to cortex/ so Cortex
#          can review what changed during Cerebras's execution.
#
# Direction: workers/ → cortex/ (one-way copy)
# Called by: loop.sh (once at start, before any iterations)
#
# Usage:   bash sync_cortex_plan.sh [--dry-run] [--verbose]

set -euo pipefail

# Resolve repository root reliably
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  :
else
  # Script is in workers/cerebras/, so repo root is two levels up
  REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
fi

# Canonical plan is workers/IMPLEMENTATION_PLAN.md; cortex copy is for review
WORKERS_PLAN="${REPO_ROOT}/workers/IMPLEMENTATION_PLAN.md"
CORTEX_PLAN="${REPO_ROOT}/cortex/IMPLEMENTATION_PLAN.md"
LOG_PREFIX="[SYNC]"

# Options
DRY_RUN=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

log_info() {
  echo "$LOG_PREFIX $1"
}

log_verbose() {
  if [[ "$VERBOSE" == "true" ]]; then
    echo "$LOG_PREFIX $1"
  fi
}

# Verify source exists
if [[ ! -f "$WORKERS_PLAN" ]]; then
  echo "$LOG_PREFIX ERROR: Workers plan not found: $WORKERS_PLAN" >&2
  exit 1
fi

# Copy workers → cortex
if [[ "$DRY_RUN" == "true" ]]; then
  log_info "[DRY RUN] Would copy $WORKERS_PLAN → $CORTEX_PLAN"
else
  cp "$WORKERS_PLAN" "$CORTEX_PLAN"
  log_info "Copied workers plan to cortex for review"
fi

log_verbose "Source: $WORKERS_PLAN"
log_verbose "Target: $CORTEX_PLAN"

exit 0
