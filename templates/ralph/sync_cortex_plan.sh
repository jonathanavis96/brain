#!/usr/bin/env bash
# sync_cortex_plan.sh - Sync tasks from Cortex to Ralph
#
# Purpose: Automatically synchronize high-level tasks from Cortex's strategic
#          plan to Ralph's execution plan.
#
# Usage:   bash sync_cortex_plan.sh [--dry-run] [--verbose]
#
# Called by: loop.sh (before each iteration)
#
# Protocol: See cortex/docs/TASK_SYNC_PROTOCOL.md for complete specification

set -euo pipefail

# Paths (relative to workers/ralph/)
CORTEX_PLAN="../../cortex/IMPLEMENTATION_PLAN.md"
RALPH_PLAN="../IMPLEMENTATION_PLAN.md"
SYNC_MARKER="<!-- SYNCED_FROM_CORTEX: $(date '+%Y-%m-%d %H:%M:%S') -->"
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
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Logging functions
log_info() {
  echo "$LOG_PREFIX $*"
}

log_verbose() {
  if [[ "$VERBOSE" == "true" ]]; then
    echo "$LOG_PREFIX [VERBOSE] $*"
  fi
}

log_error() {
  echo "$LOG_PREFIX [ERROR] $*" >&2
}

# Check if cortex plan exists
if [[ ! -f "$CORTEX_PLAN" ]]; then
  log_error "Cortex plan not found: $CORTEX_PLAN"
  log_info "Sync skipped - Cortex not initialized"
  exit 0
fi

# CASE A: Bootstrap (first time)
if [[ ! -f "$RALPH_PLAN" ]]; then
  log_info "Bootstrap mode - creating Ralph's plan from Cortex"

  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "[DRY RUN] Would copy $CORTEX_PLAN → $RALPH_PLAN with sync markers"
    exit 0
  fi

  # Copy cortex plan and add single sync marker at section headers only
  while IFS= read -r line; do
    echo "$line"
    # Add marker after section headers (lines starting with "## Phase")
    if [[ "$line" =~ ^##[[:space:]]Phase ]]; then
      echo "$SYNC_MARKER"
    fi
  done <"$CORTEX_PLAN" >"$RALPH_PLAN"

  log_info "Bootstrap complete - Ralph's plan created"
  exit 0
fi

# CASE B: Incremental sync
log_verbose "Incremental sync mode"

# Check if cortex plan is newer
if [[ "$CORTEX_PLAN" -nt "$RALPH_PLAN" ]]; then
  log_info "Cortex plan has updates - checking for new tasks"
else
  log_verbose "No updates needed - Ralph's plan is current"
  exit 0
fi

log_info "Cortex plan has updates - checking for new tasks"

# Extract sections from Ralph's plan that have sync markers
declare -A synced_sections
current_section=""

while IFS= read -r line; do
  # Check for section headers
  if [[ "$line" =~ ^##[[:space:]]Phase[[:space:]]([0-9A-Z-]+): ]]; then
    current_section="${BASH_REMATCH[1]}"
  elif [[ "$line" =~ SYNCED_FROM_CORTEX ]] && [[ -n "$current_section" ]]; then
    synced_sections["$current_section"]=1
    log_verbose "Already synced section: Phase $current_section"
  fi
done <"$RALPH_PLAN"

# Find new sections in Cortex plan (append-only model)
new_sections_found=0
tmp_file=$(mktemp)
in_new_section=false

while IFS= read -r line; do
  # Check if this is a section header
  if [[ "$line" =~ ^##[[:space:]]Phase[[:space:]]([0-9A-Z-]+): ]]; then
    phase_id="${BASH_REMATCH[1]}"

    # Check if this section is already synced
    if [[ -z "${synced_sections[$phase_id]:-}" ]]; then
      log_info "New section found: Phase $phase_id"
      new_sections_found=$((new_sections_found + 1))
      in_new_section=true

      # Add section header and sync marker
      {
        echo "$line"
        echo "$SYNC_MARKER"
        echo ""
      } >>"$tmp_file"
    else
      in_new_section=false
    fi
  elif [[ "$in_new_section" == "true" ]]; then
    # Copy all content from new section until next section header
    if [[ "$line" =~ ^##[[:space:]]Phase ]]; then
      # Hit next section, stop copying
      in_new_section=false
      # Don't echo this line - it will be processed in next iteration
      continue
    fi
    echo "$line" >>"$tmp_file"
  fi
done <"$CORTEX_PLAN"

if [[ "$new_sections_found" -eq 0 ]]; then
  log_info "No new sections to sync"
  rm -f "$tmp_file"
  exit 0
fi

# Append new sections to Ralph's plan
if [[ "$DRY_RUN" == "true" ]]; then
  log_info "[DRY RUN] Would append $new_sections_found new sections:"
  cat "$tmp_file"
  rm -f "$tmp_file"
  exit 0
fi

log_info "Appending $new_sections_found new sections to Ralph's plan"

# Append at end (append-only model)
cat "$tmp_file" >>"$RALPH_PLAN"

rm -f "$tmp_file"
log_info "Sync complete - $new_sections_found sections added"
exit 0
