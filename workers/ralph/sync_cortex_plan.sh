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
RALPH_PLAN="IMPLEMENTATION_PLAN.md"
SYNC_MARKER="<!-- SYNCED_FROM_CORTEX: $(date +%Y-%m-%d) -->"
LOG_PREFIX="[SYNC]"

# Options
DRY_RUN=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run) DRY_RUN=true; shift ;;
        --verbose) VERBOSE=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
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

    # Copy cortex plan and add sync markers to each task line
    while IFS= read -r line; do
        echo "$line"
        # Add marker after task lines (lines starting with "- [ ]" or "- [x]")
        if [[ "$line" =~ ^[[:space:]]*-[[:space:]]\[[\ x~?]\][[:space:]]\*\*[0-9] ]]; then
            echo "  $SYNC_MARKER"
        fi
    done < "$CORTEX_PLAN" > "$RALPH_PLAN"

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

# Extract task IDs from Ralph's plan (tasks that already have sync markers)
# We look for patterns like "- [ ] **1.1**" or "- [x] **2.3.4**"
declare -A synced_tasks
while IFS= read -r line; do
    if [[ "$line" =~ SYNCED_FROM_CORTEX ]]; then
        # Previous line should be the task, extract task ID
        if [[ -n "${prev_line:-}" ]] && [[ "$prev_line" =~ \*\*([0-9]+\.[0-9A-Z.]+)\*\* ]]; then
            task_id="${BASH_REMATCH[1]}"
            synced_tasks["$task_id"]=1
            log_verbose "Already synced: $task_id"
        fi
    fi
    prev_line="$line"
done < "$RALPH_PLAN"

# Find new tasks in Cortex plan
new_tasks_found=0
tmp_file=$(mktemp)

while IFS= read -r line; do
    # Check if this is a task line
    if [[ "$line" =~ ^[[:space:]]*-[[:space:]]\[[\ x~?]\][[:space:]]\*\*([0-9]+\.[0-9A-Z.]+)\*\* ]]; then
        task_id="${BASH_REMATCH[1]}"

        # Check if this task is already synced
        if [[ -z "${synced_tasks[$task_id]:-}" ]]; then
            log_info "New task found: $task_id"
            new_tasks_found=$((new_tasks_found + 1))

            # Collect this task and its context (description lines until next task or empty line)
            echo "$line" >> "$tmp_file"
            echo "  $SYNC_MARKER" >> "$tmp_file"

            # Read following lines until we hit another task or section header
            while IFS= read -r next_line; do
                if [[ "$next_line" =~ ^[[:space:]]*-[[:space:]]\[[\ x~?]\][[:space:]]\*\* ]] || \
                   [[ "$next_line" =~ ^## ]] || \
                   [[ -z "$next_line" ]]; then
                    # Stop before next task/section
                    break
                fi
                echo "$next_line" >> "$tmp_file"
            done
            echo "" >> "$tmp_file"
        fi
    fi
done < "$CORTEX_PLAN"

if [[ "$new_tasks_found" -eq 0 ]]; then
    log_info "No new tasks to sync"
    rm -f "$tmp_file"
    exit 0
fi

# Append new tasks to Ralph's plan
if [[ "$DRY_RUN" == "true" ]]; then
    log_info "[DRY RUN] Would append $new_tasks_found new tasks:"
    cat "$tmp_file"
    rm -f "$tmp_file"
    exit 0
fi

log_info "Appending $new_tasks_found new tasks to Ralph's plan"

# Find the best insertion point (before "## Phase 7:" or at end)
if grep -q "^## Phase 7:" "$RALPH_PLAN"; then
    # Insert before Phase 7 (maintenance section)
    phase7_line=$(grep -n "^## Phase 7:" "$RALPH_PLAN" | head -1 | cut -d: -f1)
    head -n $((phase7_line - 1)) "$RALPH_PLAN" > "${RALPH_PLAN}.tmp"
    echo "" >> "${RALPH_PLAN}.tmp"
    echo "## Phase 0-Synced: Tasks from Cortex" >> "${RALPH_PLAN}.tmp"
    echo "" >> "${RALPH_PLAN}.tmp"
    cat "$tmp_file" >> "${RALPH_PLAN}.tmp"
    tail -n +$phase7_line "$RALPH_PLAN" >> "${RALPH_PLAN}.tmp"
    mv "${RALPH_PLAN}.tmp" "$RALPH_PLAN"
else
    # Append at end
    echo "" >> "$RALPH_PLAN"
    echo "## Phase 0-Synced: Tasks from Cortex" >> "$RALPH_PLAN"
    echo "" >> "$RALPH_PLAN"
    cat "$tmp_file" >> "$RALPH_PLAN"
fi

rm -f "$tmp_file"
log_info "Sync complete - $new_tasks_found tasks added"
exit 0
