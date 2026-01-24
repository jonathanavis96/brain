#!/usr/bin/env bash
# =============================================================================
# Shared Worker Utilities
# =============================================================================
#
# Common functions shared across Ralph, Cerebras, and other workers.
# Source this file from worker loop scripts.
#
# Usage:
#   source "$(dirname "$(dirname "${BASH_SOURCE[0]}")")/shared/common.sh"
#
# =============================================================================

# Cleanup logs older than N days
# Args: $1 = days (default: 7), $2 = log directory
cleanup_old_logs() {
  local days="${1:-7}"
  local logdir="${2:-$LOGDIR}"
  local count
  count=$(find "$logdir" -name "*.log" -type f -mtime +"$days" 2>/dev/null | wc -l)
  if [[ "$count" -gt 0 ]]; then
    echo "🧹 Cleaning up $count log files older than $days days..."
    find "$logdir" -name "*.log" -type f -mtime +"$days" -delete
  fi
}

# Check if a PID is still running
# Args: $1 = PID
# Returns: 0 if running, 1 if not
is_pid_running() {
  local pid="$1"
  if [[ -z "$pid" || "$pid" == "unknown" ]]; then
    return 1 # Invalid PID, treat as not running
  fi
  # Check if process exists (works on Linux/macOS)
  kill -0 "$pid" 2>/dev/null
}

# Atomic lock acquisition with stale lock detection
# Args: $1 = lock file path
# Environment: Uses LOCK_FILE if $1 not provided
# Returns: 0 on success, exits on failure
acquire_lock() {
  local lock_file="${1:-${LOCK_FILE}}"

  # First, check for stale lock
  if [[ -f "$lock_file" ]]; then
    local lock_pid
    lock_pid=$(cat "$lock_file" 2>/dev/null || echo "unknown")
    if ! is_pid_running "$lock_pid"; then
      echo "🧹 Removing stale lock (PID $lock_pid no longer running)"
      rm -f "$lock_file"
    fi
  fi

  if command -v flock &>/dev/null; then
    # Use flock for atomic locking (append mode to avoid truncating before lock acquired)
    exec 9>>"$lock_file"
    if ! flock -n 9; then
      local lock_pid
      lock_pid=$(cat "$lock_file" 2>/dev/null || echo "unknown")
      echo "ERROR: Worker already running (lock: $lock_file, PID: $lock_pid)"
      exit 1
    fi
    # Now holding lock, safe to overwrite with our PID
    echo "$$" >"$lock_file"
  else
    # Portable fallback: noclobber atomic create
    if ! (
      set -o noclobber
      echo "$$" >"$lock_file"
    ) 2>/dev/null; then
      local lock_pid
      lock_pid=$(cat "$lock_file" 2>/dev/null || echo "unknown")
      # Double-check: maybe we lost a race but the winner is now dead
      if ! is_pid_running "$lock_pid"; then
        echo "🧹 Removing stale lock (PID $lock_pid no longer running)"
        rm -f "$lock_file"
        # Retry once
        if ! (
          set -o noclobber
          echo "$$" >"$lock_file"
        ) 2>/dev/null; then
          echo "ERROR: Worker already running (lock: $lock_file)"
          exit 1
        fi
      else
        echo "ERROR: Worker already running (lock: $lock_file, PID: $lock_pid)"
        exit 1
      fi
    fi
  fi
}

# =============================================================================
# RollFlow Tool Call Tracking
# =============================================================================
# Functions for generating cache keys and tracking tool calls for analysis.
# Used by rollflow_analyze to detect duplicate/cacheable tool invocations.

# Generate a stable cache key for a tool call
# Args: $1 = tool name, $2 = args (JSON or string), $3 = git SHA (optional)
# Output: SHA256 hash (first 16 chars for readability)
# Example: cache_key "shellcheck" '{"file":"loop.sh"}' "abc123"
cache_key() {
  local tool_name="${1:-unknown}"
  local args="${2:-}"
  local git_sha="${3:-}"

  # Normalize: lowercase tool name, sort JSON keys if valid JSON
  local normalized_args
  if echo "$args" | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
    # Valid JSON - normalize with sorted keys
    normalized_args=$(echo "$args" | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), sort_keys=True, separators=(',',':')))" 2>/dev/null || echo "$args")
  else
    # Not JSON - use as-is
    normalized_args="$args"
  fi

  # Combine components and hash
  local input="${tool_name,,}|${normalized_args}|${git_sha}"
  echo -n "$input" | sha256sum | cut -c1-16
}

# Generate a unique tool call ID
# Output: UUID-like identifier
tool_call_id() {
  # Use /proc/sys/kernel/random/uuid if available, otherwise generate from timestamp+random
  if [[ -f /proc/sys/kernel/random/uuid ]]; then
    cat /proc/sys/kernel/random/uuid
  else
    echo "$(date +%s%N)-$$-$RANDOM"
  fi
}

# Log tool call start marker (for rollflow_analyze parsing)
# Args: $1 = call_id, $2 = tool_name, $3 = cache_key, $4 = git_sha (optional)
log_tool_start() {
  local call_id="$1"
  local tool_name="$2"
  local key="$3"
  local git_sha="${4:-$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')}"
  local ts
  ts="$(date -Iseconds)"

  echo "::TOOL_CALL_START:: id=$call_id name=$tool_name key=$key ts=$ts git=$git_sha"
}

# Log tool call end marker (for rollflow_analyze parsing)
# Args: $1 = call_id, $2 = status (PASS|FAIL), $3 = exit_code, $4 = duration_ms, $5 = error (optional)
log_tool_end() {
  local call_id="$1"
  local status="$2"
  local exit_code="$3"
  local duration_ms="$4"
  local err="${5:-}"

  # Sanitize error message (no newlines, limit length)
  err="${err//$'\n'/ }"
  err="${err:0:100}"

  if [[ -n "$err" ]]; then
    echo "::TOOL_CALL_END:: id=$call_id status=$status exit=$exit_code duration_ms=$duration_ms err=$err"
  else
    echo "::TOOL_CALL_END:: id=$call_id status=$status exit=$exit_code duration_ms=$duration_ms"
  fi
}

# Log run start marker
# Args: $1 = run_id
log_run_start() {
  local run_id="$1"
  local ts
  ts="$(date -Iseconds)"
  echo "::RUN:: id=$run_id ts=$ts"
}

# Log iteration start marker
# Args: $1 = iter_id, $2 = run_id
log_iter_start() {
  local iter_id="$1"
  local run_id="$2"
  local ts
  ts="$(date -Iseconds)"
  echo "::ITER:: id=$iter_id run_id=$run_id ts=$ts"
}

# =============================================================================

# Cleanup function for temp files and lock
# Environment: Uses LOCK_FILE, TEMP_CONFIG
cleanup() {
  if [[ -n "${LOCK_FILE:-}" && -f "${LOCK_FILE:-}" ]]; then
    rm -f "$LOCK_FILE"
  fi
  if [[ -n "${TEMP_CONFIG:-}" && -f "${TEMP_CONFIG:-}" ]]; then
    rm -f "$TEMP_CONFIG"
  fi
}

# Interrupt handling: First Ctrl+C = graceful exit, Second Ctrl+C = immediate exit
# Environment: Uses and sets INTERRUPT_COUNT, INTERRUPT_RECEIVED (caller must check these)
handle_interrupt() {
  # shellcheck disable=SC2034
  INTERRUPT_COUNT=$((INTERRUPT_COUNT + 1))

  if [[ $INTERRUPT_COUNT -eq 1 ]]; then
    echo ""
    echo "========================================"
    echo "⚠️  Interrupt received!"
    echo "Will exit after current iteration completes."
    echo "Press Ctrl+C again to force immediate exit."
    echo "========================================"
    # shellcheck disable=SC2034
    INTERRUPT_RECEIVED=true
  else
    echo ""
    echo "========================================"
    echo "🛑 Force exit!"
    echo "========================================"
    cleanup
    kill 0
    exit 130
  fi
}

# Safe branch handling - ensures target branch exists without resetting history
# Args: $1 = branch name (required)
# Returns: 0 on success, 1 on failure
ensure_worktree_branch() {
  local branch="$1"
  if [[ -z "$branch" ]]; then
    echo "ERROR: ensure_worktree_branch requires branch name argument"
    return 1
  fi

  if git show-ref --verify --quiet "refs/heads/$branch"; then
    git checkout "$branch"
  else
    echo "Creating new worktree branch: $branch"
    git checkout -b "$branch"
  fi

  # Set upstream if not already set
  if ! git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1; then
    echo "Setting upstream for $branch"
    git push -u origin "$branch" 2>/dev/null || true
  fi
}

# Launch a script in a new terminal window
# Args: $1 = window title, $2 = script path, $3 = process grep pattern
# Returns: 0 if launched successfully, 1 otherwise
launch_in_terminal() {
  local title="$1"
  local script_path="$2"
  local process_pattern="$3"

  # Try to detect available terminal emulator (priority order: tmux, wt.exe, gnome-terminal, konsole, xterm)
  # All terminal launches redirect stderr to /dev/null to suppress dbus/X11 errors
  if [[ -n "${TMUX:-}" ]]; then
    if tmux new-window -n "$title" "bash $script_path" 2>/dev/null; then
      return 0
    fi
  elif command -v wt.exe &>/dev/null; then
    wt.exe new-tab --title "$title" -- wsl bash "$script_path" 2>/dev/null &
    sleep 0.5
    if pgrep -f "$process_pattern" >/dev/null; then
      return 0
    fi
  elif command -v gnome-terminal &>/dev/null; then
    gnome-terminal --title="$title" -- bash "$script_path" 2>/dev/null &
    sleep 0.5 # Give it time to fail
    if pgrep -f "$process_pattern" >/dev/null; then
      return 0
    fi
  elif command -v konsole &>/dev/null; then
    konsole --title "$title" -e bash "$script_path" 2>/dev/null &
    sleep 0.5
    if pgrep -f "$process_pattern" >/dev/null; then
      return 0
    fi
  elif command -v xterm &>/dev/null; then
    xterm -T "$title" -e bash "$script_path" 2>/dev/null &
    sleep 0.5
    if pgrep -f "$process_pattern" >/dev/null; then
      return 0
    fi
  fi

  return 1
}

# Auto-launch monitors in background if not already running
# Args: $1 = monitor directory path
# Environment: Expects monitor scripts at $1/current_ralph_tasks.sh and $1/thunk_ralph_tasks.sh
# Returns: Always returns 0 (non-blocking)
launch_monitors() {
  local monitor_dir="$1"
  local current_tasks_launched=false
  local thunk_tasks_launched=false

  # Check if current_ralph_tasks.sh exists and launch
  if [[ -f "$monitor_dir/current_ralph_tasks.sh" ]]; then
    if ! pgrep -f "current_ralph_tasks.sh" >/dev/null; then
      if launch_in_terminal "Current Tasks" "$monitor_dir/current_ralph_tasks.sh" "current_ralph_tasks.sh"; then
        current_tasks_launched=true
      fi
    else
      current_tasks_launched=true # Already running
    fi
  fi

  # Check if thunk_ralph_tasks.sh exists and launch
  if [[ -f "$monitor_dir/thunk_ralph_tasks.sh" ]]; then
    if ! pgrep -f "thunk_ralph_tasks.sh" >/dev/null; then
      if launch_in_terminal "Thunk Tasks" "$monitor_dir/thunk_ralph_tasks.sh" "thunk_ralph_tasks.sh"; then
        thunk_tasks_launched=true
      fi
    else
      thunk_tasks_launched=true # Already running
    fi
  fi

  # If both monitors failed to launch, print consolidated fallback message
  if [[ "$current_tasks_launched" == "false" && "$thunk_tasks_launched" == "false" ]]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  ⚠️  Could not auto-launch monitor terminals."
    echo ""
    echo "  To run monitors manually, open new terminals and run:"
    echo "    bash $monitor_dir/current_ralph_tasks.sh"
    echo "    bash $monitor_dir/thunk_ralph_tasks.sh"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
  fi
}
