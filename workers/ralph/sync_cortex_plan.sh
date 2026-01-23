#!/usr/bin/env bash
# sync_cortex_plan.sh - Sync tasks from Cortex to Ralph
#
# Purpose: Automatically synchronize high-level tasks from Cortex's strategic
#          plan to Ralph's execution plan.
#
# Usage:   bash sync_cortex_plan.sh [--dry-run] [--verbose] [--reset]
#
# Called by: loop.sh (before each iteration)
#
# Protocol: See cortex/docs/TASK_SYNC_PROTOCOL.md for complete specification

set -euo pipefail

# Paths (relative to workers/ralph/)
CORTEX_PLAN="../../cortex/IMPLEMENTATION_PLAN.md"
RALPH_PLAN="../IMPLEMENTATION_PLAN.md"
LAST_SYNC_FILE=".last_sync"
LOG_PREFIX="[SYNC]"

# Options
DRY_RUN=false
VERBOSE=false
RESET=false

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
    --reset)
      RESET=true
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

# Handle --reset flag
if [[ "$RESET" == "true" ]]; then
  if [[ -f "$LAST_SYNC_FILE" ]]; then
    rm -f "$LAST_SYNC_FILE"
    log_info "Sync state cleared - .last_sync file removed"
  else
    log_info "No sync state to clear - .last_sync file doesn't exist"
  fi
  exit 0
fi

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
    log_info "[DRY RUN] Would copy $CORTEX_PLAN → $RALPH_PLAN"
    exit 0
  fi

  # Copy cortex plan
  cp "$CORTEX_PLAN" "$RALPH_PLAN"

  # Record all synced headers
  grep "^## Phase" "$CORTEX_PLAN" >"$LAST_SYNC_FILE"

  log_info "Bootstrap complete - Ralph's plan created"
  exit 0
fi

# CASE B: Incremental sync
log_verbose "Incremental sync mode"

# Check if cortex plan is newer
if [[ "$CORTEX_PLAN" -nt "$RALPH_PLAN" ]]; then
  log_info "Cortex plan has updates - checking for new sections"
else
  log_verbose "No updates needed - Ralph's plan is current"
  exit 0
fi

# Read already-synced headers from .last_sync file
declare -A synced_headers
if [[ -f "$LAST_SYNC_FILE" ]]; then
  while IFS= read -r header_line; do
    synced_headers["$header_line"]=1
    log_verbose "Already synced: $header_line"
  done <"$LAST_SYNC_FILE"
fi

# Find the Cortex sync marker in Ralph's plan (take first occurrence)
marker_line=$(grep -n "^<!-- Cortex adds new Task Contracts below this line -->" "$RALPH_PLAN" | head -1 | cut -d: -f1 || echo "")

if [[ -z "$marker_line" ]]; then
  log_error "Sync marker not found in Ralph's plan"
  log_error "Expected: <!-- Cortex adds new Task Contracts below this line -->"
  exit 1
fi

# Extract new sections from Cortex plan
new_sections_found=0
tmp_file=$(mktemp)
in_new_section=false

while IFS= read -r line; do
  # Check if this is a section header
  if [[ "$line" =~ ^##[[:space:]]Phase ]]; then
    # Check if this header is already synced
    if [[ -z "${synced_headers[$line]:-}" ]]; then
      log_info "New section found: $line"
      new_sections_found=$((new_sections_found + 1))
      in_new_section=true

      # Add blank line before section (except first)
      if [[ "$new_sections_found" -gt 1 ]]; then
        echo "" >>"$tmp_file"
      fi

      # Add section header
      echo "$line" >>"$tmp_file"
    else
      in_new_section=false
    fi
  elif [[ "$in_new_section" == "true" ]]; then
    # Copy all content from new section until next section header
    if [[ "$line" =~ ^##[[:space:]]Phase ]]; then
      # Hit next section, stop copying this section
      in_new_section=false
      # Process this line in next iteration (don't echo yet)
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

# Show what would be added in dry-run mode
if [[ "$DRY_RUN" == "true" ]]; then
  log_info "[DRY RUN] Would append $new_sections_found new sections below line $marker_line:"
  cat "$tmp_file"
  rm -f "$tmp_file"
  exit 0
fi

log_info "Appending $new_sections_found new sections to Ralph's plan (after line $marker_line)"

# Insert new sections after the marker line
# Create temporary output file
tmp_output=$(mktemp)

# Copy lines 1 through marker_line, add blank line, append new sections
{
  head -n "$marker_line" "$RALPH_PLAN"
  echo ""
  cat "$tmp_file"
} >"$tmp_output"

# Append remainder of Ralph's plan (after marker line)
tail -n +$((marker_line + 1)) "$RALPH_PLAN" >>"$tmp_output"

# Replace Ralph's plan with updated version
mv "$tmp_output" "$RALPH_PLAN"

# Update .last_sync with all headers from Cortex (not just new ones)
grep "^## Phase" "$CORTEX_PLAN" >"$LAST_SYNC_FILE"

rm -f "$tmp_file"
log_info "Sync complete - $new_sections_found sections added"
exit 0
