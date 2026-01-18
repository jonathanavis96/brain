#!/usr/bin/env bash
set -euo pipefail

# ROOT can be overridden via env var for project delegation
if [[ -n "${RALPH_PROJECT_ROOT:-}" ]]; then
  ROOT="$RALPH_PROJECT_ROOT"
  RALPH="$ROOT/ralph"
else
  ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  RALPH="$ROOT/ralph"
fi
LOGDIR="$RALPH/logs"
mkdir -p "$LOGDIR"

# Configurable Brain repo for commit trailers
BRAIN_REPO="${BRAIN_REPO:-jonathanavis96/brain}"

# Derive clean branch name from git repo name
# Derive repo name from git remote (stable across machines) or fall back to folder name
# Use git -C "$ROOT" to ensure commands run against the intended project directory
if git -C "$ROOT" remote get-url origin &>/dev/null; then
  REPO_NAME=$(basename -s .git "$(git -C "$ROOT" remote get-url origin)")
else
  REPO_NAME=$(basename "$ROOT")
fi
WORK_BRANCH="${REPO_NAME}-work"

# Lock file to prevent concurrent runs
# Lock file includes hash of repo path for uniqueness across same-named repos
REPO_PATH_HASH=$(cd "$ROOT" && pwd | md5sum | cut -c1-8)
LOCK_FILE="/tmp/ralph-${REPO_NAME}-${REPO_PATH_HASH}.lock"

# TARGET_BRANCH will be set after arg parsing (uses BRANCH_ARG if provided, else WORK_BRANCH)

# Check if a PID is still running
is_pid_running() {
  local pid="$1"
  if [[ -z "$pid" || "$pid" == "unknown" ]]; then
    return 1  # Invalid PID, treat as not running
  fi
  # Check if process exists (works on Linux/macOS)
  kill -0 "$pid" 2>/dev/null
}

# Atomic lock acquisition with stale lock detection
acquire_lock() {
  # First, check for stale lock
  if [[ -f "$LOCK_FILE" ]]; then
    LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "unknown")
    if ! is_pid_running "$LOCK_PID"; then
      echo "🧹 Removing stale lock (PID $LOCK_PID no longer running)"
      rm -f "$LOCK_FILE"
    fi
  fi

  if command -v flock &>/dev/null; then
    # Use flock for atomic locking (append mode to avoid truncating before lock acquired)
    exec 9>>"$LOCK_FILE"
    if ! flock -n 9; then
      LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "unknown")
      echo "ERROR: Ralph loop already running (lock: $LOCK_FILE, PID: $LOCK_PID)"
      exit 1
    fi
    # Now holding lock, safe to overwrite with our PID
    echo "$$" >"$LOCK_FILE"
  else
    # Portable fallback: noclobber atomic create
    if ! ( set -o noclobber; echo "$$" > "$LOCK_FILE" ) 2>/dev/null; then
      LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "unknown")
      # Double-check: maybe we lost a race but the winner is now dead
      if ! is_pid_running "$LOCK_PID"; then
        echo "🧹 Removing stale lock (PID $LOCK_PID no longer running)"
        rm -f "$LOCK_FILE"
        # Retry once
        if ! ( set -o noclobber; echo "$$" > "$LOCK_FILE" ) 2>/dev/null; then
          echo "ERROR: Ralph loop already running (lock: $LOCK_FILE)"
          exit 1
        fi
      else
        echo "ERROR: Ralph loop already running (lock: $LOCK_FILE, PID: $LOCK_PID)"
        exit 1
      fi
    fi
  fi
}
acquire_lock

# Interrupt handling: First Ctrl+C = graceful exit, Second Ctrl+C = immediate exit
INTERRUPT_COUNT=0
INTERRUPT_RECEIVED=false

# Cleanup function for temp files and lock
cleanup() {
  rm -f "$LOCK_FILE"
  if [[ -n "${TEMP_CONFIG:-}" && -f "${TEMP_CONFIG:-}" ]]; then
    rm -f "$TEMP_CONFIG"
  fi
}

handle_interrupt() {
  INTERRUPT_COUNT=$((INTERRUPT_COUNT + 1))
  
  if [[ $INTERRUPT_COUNT -eq 1 ]]; then
    echo ""
    echo "========================================"
    echo "⚠️  Interrupt received!"
    echo "Will exit after current iteration completes."
    echo "Press Ctrl+C again to force immediate exit."
    echo "========================================"
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

trap 'handle_interrupt' INT TERM
trap 'cleanup' EXIT

# Safe branch handling - ensures target branch exists without resetting history
# Accepts optional branch name; defaults to WORK_BRANCH
ensure_worktree_branch() {
  local branch="${1:-$WORK_BRANCH}"
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

usage() {
  cat <<'EOF'
Usage:
  loop.sh [--prompt <path>] [--iterations N] [--plan-every N] [--yolo|--no-yolo]
          [--model <model>] [--branch <name>] [--dry-run] [--rollback [N]] [--resume]

Defaults:
  --iterations 1
  --plan-every 3
  --model       Uses default from ~/.rovodev/config.yml
  --branch      Defaults to <repo>-work (e.g., brain-work, NeoQueue-work)
  If --prompt is NOT provided, loop alternates:
    - PLAN on iteration 1 and every N iterations
    - BUILD otherwise
  If --prompt IS provided, that prompt is used for all iterations.

Model Selection:
  --model <model>  Specify the model to use. Shortcuts available:
                   sonnet  -> Sonnet 4.5 (anthropic.claude-sonnet-4-5-20250620-v1:0)
                   opus    -> Opus 4.5 (anthropic.claude-opus-4-5-20251101-v1:0)
                   sonnet4 -> Sonnet 4 (anthropic.claude-sonnet-4-20250514-v1:0)
                   Or provide a full model ID directly.

Branch Workflow:
  --branch <name>  Work on specified branch (creates if needed, switches to it)
                   Default: <repo>-work (derived from git remote, e.g., brain-work)
                   Then run pr-batch.sh to create PRs to main

Safety Features:
  --dry-run       Preview changes without committing (appends instruction to prompt)
  --rollback [N]  Undo last N Ralph commits (default: 1). Requires confirmation.
  --resume        Resume from last incomplete iteration (checks for uncommitted changes)

Examples:
  # Run BUILD once (from anywhere)
  bash ralph/loop.sh --prompt ralph/PROMPT_build.md --iterations 1 --plan-every 999

  # From inside ralph/
  bash ./loop.sh --prompt ./PROMPT_build.md --iterations 1 --plan-every 999

  # Alternate plan/build for 10 iters, plan every 3
  bash ralph/loop.sh --iterations 10 --plan-every 3
  
  # Use Sonnet model for faster iterations
  bash ralph/loop.sh --model sonnet --iterations 20 --plan-every 5
  
  # Use Opus for careful planning
  bash ralph/loop.sh --model opus --iterations 1
  
  # Dry-run mode (see what would change)
  bash ralph/loop.sh --dry-run --iterations 1
  
  # Rollback last 2 iterations
  bash ralph/loop.sh --rollback 2
  
  # Resume after error
  bash ralph/loop.sh --resume
EOF
}

# Defaults
ITERATIONS=1
PLAN_EVERY=3
YOLO_FLAG="--yolo"
PROMPT_ARG=""
MODEL_ARG=""
BRANCH_ARG=""
DRY_RUN=false
ROLLBACK_MODE=false
ROLLBACK_COUNT=1
RESUME_MODE=false

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --prompt)
      PROMPT_ARG="${2:-}"; shift 2 ;;
    --iterations)
      ITERATIONS="${2:-}"; shift 2 ;;
    --plan-every)
      PLAN_EVERY="${2:-}"; shift 2 ;;
    --yolo)
      YOLO_FLAG="--yolo"; shift ;;
    --no-yolo)
      YOLO_FLAG=""; shift ;;
    --model)
      MODEL_ARG="${2:-}"; shift 2 ;;
    --branch)
      BRANCH_ARG="${2:-}"; shift 2 ;;
    --dry-run)
      DRY_RUN=true; shift ;;
    --rollback)
      ROLLBACK_MODE=true
      if [[ -n "${2:-}" && "$2" =~ ^[0-9]+$ ]]; then
        ROLLBACK_COUNT="$2"; shift 2
      else
        shift
      fi ;;
    --resume)
      RESUME_MODE=true; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2
      usage; exit 2 ;;
  esac
done

# Model version configuration - SINGLE SOURCE OF TRUTH
# Update these when new model versions are released
# Last updated: 2026-01-18 (Sonnet 4.5 September 2025 release)
MODEL_SONNET_45="anthropic.claude-sonnet-4-5-20250929-v1:0"
MODEL_OPUS_45="anthropic.claude-opus-4-5-20251101-v1:0"
MODEL_SONNET_4="anthropic.claude-sonnet-4-20250514-v1:0"

# Resolve model shortcut to full model ID
resolve_model() {
  local model="$1"
  case "$model" in
    opus|opus4.5|opus45)
      echo "$MODEL_OPUS_45" ;;
    sonnet|sonnet4.5|sonnet45)
      echo "$MODEL_SONNET_45" ;;
    sonnet4)
      echo "$MODEL_SONNET_4" ;;
    latest|auto)
      # Use system default - don't override config
      echo "" ;;
    *)
      echo "$model" ;;
  esac
}

# Setup model config - default to Sonnet 4.5 for Ralph loops
CONFIG_FLAG=""
TEMP_CONFIG=""

# Use provided model or default to Sonnet 4.5
if [[ -z "$MODEL_ARG" ]]; then
  MODEL_ARG="sonnet"  # Default for Ralph loops
fi

RESOLVED_MODEL="$(resolve_model "$MODEL_ARG")"

# Only create temp config if we have a model to set
if [[ -n "$RESOLVED_MODEL" ]]; then
  TEMP_CONFIG="/tmp/rovodev_config_$$_$(date +%s).yml"
  
  # Copy base config and override modelId
  if [[ -f "$HOME/.rovodev/config.yml" ]]; then
    sed "s|^  modelId:.*|  modelId: $RESOLVED_MODEL|" "$HOME/.rovodev/config.yml" > "$TEMP_CONFIG"
  else
    cat > "$TEMP_CONFIG" <<EOFCONFIG
version: 1
agent:
  modelId: $RESOLVED_MODEL
EOFCONFIG
  fi
  CONFIG_FLAG="--config-file $TEMP_CONFIG"
  echo "Using model: $RESOLVED_MODEL"
fi

# Resolve target branch:
# 1. User-provided --branch takes precedence
# 2. On --resume without --branch, stay on current branch
# 3. Otherwise use default WORK_BRANCH
if [[ -n "$BRANCH_ARG" ]]; then
  TARGET_BRANCH="$BRANCH_ARG"
elif [[ "$RESUME_MODE" == "true" ]]; then
  TARGET_BRANCH="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "$WORK_BRANCH")"
else
  TARGET_BRANCH="$WORK_BRANCH"
fi

# Debug output for derived values
echo "Repo: $REPO_NAME | Branch: $TARGET_BRANCH | Lock: $LOCK_FILE"

# Resolve a prompt path robustly (works from repo root or ralph/)
resolve_prompt() {
  local p="$1"
  if [[ -z "$p" ]]; then return 1; fi

  # 1) As provided (relative to current working directory)
  if [[ -f "$p" ]]; then
    realpath "$p"
    return 0
  fi

  # 2) Relative to repo root
  if [[ -f "$ROOT/$p" ]]; then
    realpath "$ROOT/$p"
    return 0
  fi

  echo "Prompt not found: $p (checked: '$p' and '$ROOT/$p')" >&2
  return 1
}

# Handle rollback mode
if [[ "$ROLLBACK_MODE" == "true" ]]; then
  echo "========================================"
  echo "🔄 Rollback Mode"
  echo "========================================"
  echo ""
  
  # Show last N commits
  echo "Last $ROLLBACK_COUNT commit(s) to be reverted:"
  echo ""
  git log --oneline -n "$ROLLBACK_COUNT"
  echo ""
  
  # Confirmation
  read -p "⚠️  Revert these $ROLLBACK_COUNT commit(s)? (type 'yes' to confirm): " confirm
  if [[ "$confirm" != "yes" ]]; then
    echo "Rollback cancelled."
    exit 0
  fi
  
  # Perform rollback
  echo ""
  echo "Reverting last $ROLLBACK_COUNT commit(s)..."
  if git reset --hard HEAD~"$ROLLBACK_COUNT"; then
    echo "✅ Rollback successful!"
    echo ""
    echo "Current HEAD:"
    git log --oneline -n 1
  else
    echo "❌ Rollback failed!"
    exit 1
  fi
  
  exit 0
fi

# Handle resume mode
if [[ "$RESUME_MODE" == "true" ]]; then
  echo "========================================"
  echo "🔄 Resume Mode"
  echo "========================================"
  echo ""
  
  # Check for uncommitted changes
  if git diff --quiet && git diff --cached --quiet; then
    echo "No uncommitted changes found."
    echo "Nothing to resume. Repository is clean."
    exit 0
  fi
  
  echo "Uncommitted changes detected:"
  echo ""
  git status --short
  echo ""
  
  read -p "Continue from this state? (yes/no): " confirm
  if [[ "$confirm" != "yes" ]]; then
    echo "Resume cancelled."
    exit 0
  fi
  
  echo "✅ Continuing with existing changes..."
  echo ""
fi

# Handle branch switching
if [[ -n "$BRANCH_ARG" ]]; then
  CURRENT_BRANCH=$(git branch --show-current)
  if [[ "$CURRENT_BRANCH" != "$BRANCH_ARG" ]]; then
    echo "========================================"
    echo "🌿 Branch: $BRANCH_ARG"
    echo "========================================"
    
    # Check if branch exists
    if git show-ref --verify --quiet "refs/heads/$BRANCH_ARG"; then
      git checkout "$BRANCH_ARG"
    else
      echo "Creating new branch: $BRANCH_ARG"
      git checkout -b "$BRANCH_ARG"
      # Push if remote exists
      if git remote get-url origin &>/dev/null; then
        git push -u origin "$BRANCH_ARG" 2>/dev/null || true
      fi
    fi
    echo ""
  fi
fi

# Ralph determines mode from iteration number (PROMPT.md has conditional logic)
PLAN_PROMPT="$RALPH/PROMPT.md"
BUILD_PROMPT="$RALPH/PROMPT.md"

run_once() {
  local prompt_file="$1"
  local phase="$2"
  local iter="$3"

  local ts
  ts="$(date +%F_%H%M%S)"
  local log="$LOGDIR/${ts}_iter${iter}_${phase}.log"

  echo
  echo "========================================"
  echo "Ralph Loop"
  echo "Root: $ROOT"
  echo "Iteration: $iter / $ITERATIONS"
  echo "Phase: $phase"
  echo "Prompt: $prompt_file"
  echo "Log: $log"
  echo "========================================"
  echo

  # Create temporary prompt with mode prepended
  local prompt_with_mode="/tmp/rovodev_prompt_with_mode_$$_${iter}.md"
  {
    echo "# MODE: ${phase^^}"
    echo ""
    cat "$prompt_file"
    
    # Append dry-run instruction if enabled
    if [[ "$DRY_RUN" == "true" ]]; then
      echo ""
      echo "---"
      echo ""
      echo "# DRY-RUN MODE ACTIVE"
      echo ""
      echo "⚠️ **CRITICAL: This is a dry-run. DO NOT commit any changes.**"
      echo ""
      echo "Your task:"
      echo "1. Read IMPLEMENTATION_PLAN.md and identify the first unchecked task"
      echo "2. Analyze what changes would be needed to implement it"
      echo "3. Show file diffs or describe modifications you would make"
      echo "4. Update IMPLEMENTATION_PLAN.md with detailed notes about your findings"
      echo "5. DO NOT use git commit - stop after analysis"
      echo ""
      echo "Output format:"
      echo "- List files that would be created/modified"
      echo "- Show code snippets or diffs for key changes"
      echo "- Document any risks or dependencies discovered"
      echo "- Add findings to IMPLEMENTATION_PLAN.md under 'Discoveries & Notes'"
      echo ""
      echo "This is a preview only. No commits will be made."
    fi
  } > "$prompt_with_mode"

  # Feed prompt into RovoDev
  script -q -c "cat \"$prompt_with_mode\" | acli rovodev run ${CONFIG_FLAG} ${YOLO_FLAG}" "$log"

  # Clean up temporary prompt
  rm -f "$prompt_with_mode"

  echo
  echo "Run complete."
  echo "Transcript: $log"
  
  # In dry-run mode, remind user no commits were made
  if [[ "$DRY_RUN" == "true" ]]; then
    echo ""
    echo "========================================"
    echo "🔍 Dry-run completed"
    echo "No changes were committed."
    echo "Review the transcript above for analysis."
    echo "========================================"
  fi
  
  # Check for completion sentinel (strip ANSI codes, require standalone line)
  # Only matches when sentinel appears alone on a line (not in validation/discussion)
  if sed 's/\x1b\[[0-9;]*m//g' "$log" | grep -qE '^\s*:::COMPLETE:::\s*$'; then
    echo ""
    echo "========================================"
    echo "🎉 Ralph signaled completion!"
    echo "All tasks in IMPLEMENTATION_PLAN.md done."
    echo "========================================"
    return 42  # Special return code for completion
  fi
  
  return 0
}

# Auto-launch monitors in background if not already running
launch_monitors() {
  local monitor_dir="$RALPH"
  
  # Check if current_ralph_tasks.sh exists and launch
  if [[ -f "$monitor_dir/current_ralph_tasks.sh" ]]; then
    if ! pgrep -f "current_ralph_tasks.sh" > /dev/null; then
      # Try to detect available terminal emulator
      if command -v gnome-terminal &>/dev/null; then
        gnome-terminal --title="Current Ralph Tasks" -- bash "$monitor_dir/current_ralph_tasks.sh" &
      elif command -v konsole &>/dev/null; then
        konsole --title "Current Ralph Tasks" -e bash "$monitor_dir/current_ralph_tasks.sh" &
      elif command -v xterm &>/dev/null; then
        xterm -T "Current Ralph Tasks" -e bash "$monitor_dir/current_ralph_tasks.sh" &
      elif [[ -n "${TMUX:-}" ]]; then
        tmux new-window -n "Current Tasks" "bash $monitor_dir/current_ralph_tasks.sh"
      else
        echo "⚠️  No terminal emulator detected. Skipping current_ralph_tasks.sh launch."
      fi
    fi
  fi
  
  # Check if thunk_ralph_tasks.sh exists and launch
  if [[ -f "$monitor_dir/thunk_ralph_tasks.sh" ]]; then
    if ! pgrep -f "thunk_ralph_tasks.sh" > /dev/null; then
      # Try to detect available terminal emulator
      if command -v gnome-terminal &>/dev/null; then
        gnome-terminal --title="Thunk Ralph Tasks" -- bash "$monitor_dir/thunk_ralph_tasks.sh" &
      elif command -v konsole &>/dev/null; then
        konsole --title "Thunk Ralph Tasks" -e bash "$monitor_dir/thunk_ralph_tasks.sh" &
      elif command -v xterm &>/dev/null; then
        xterm -T "Thunk Ralph Tasks" -e bash "$monitor_dir/thunk_ralph_tasks.sh" &
      elif [[ -n "${TMUX:-}" ]]; then
        tmux new-window -n "Thunk Tasks" "bash $monitor_dir/thunk_ralph_tasks.sh"
      else
        echo "⚠️  No terminal emulator detected. Skipping thunk_ralph_tasks.sh launch."
      fi
    fi
  fi
}

# Ensure we're on the worktree branch before starting
echo ""
echo "========================================"
echo "Setting up worktree branch: $TARGET_BRANCH"
echo "========================================"
ensure_worktree_branch "$TARGET_BRANCH"
echo ""

# Launch monitors before starting iterations
launch_monitors

# Determine prompt strategy
if [[ -n "$PROMPT_ARG" ]]; then
  PROMPT_FILE="$(resolve_prompt "$PROMPT_ARG")"
  for ((i=1; i<=ITERATIONS; i++)); do
    # Check for interrupt before starting iteration
    if [[ "$INTERRUPT_RECEIVED" == "true" ]]; then
      echo ""
      echo "Exiting gracefully after iteration $((i-1))."
      exit 130
    fi
    
    run_once "$PROMPT_FILE" "custom" "$i"
    # Check if Ralph signaled completion
    if [[ $? -eq 42 ]]; then
      echo ""
      echo "Loop terminated early due to completion."
      break
    fi
  done
else
  # Alternating plan/build
  for ((i=1; i<=ITERATIONS; i++)); do
    # Check for interrupt before starting iteration
    if [[ "$INTERRUPT_RECEIVED" == "true" ]]; then
      echo ""
      echo "Exiting gracefully after iteration $((i-1))."
      exit 130
    fi
    
    if [[ "$i" -eq 1 ]] || (( PLAN_EVERY > 0 && ( (i-1) % PLAN_EVERY == 0 ) )); then
      run_once "$PLAN_PROMPT" "plan" "$i"
    else
      run_once "$BUILD_PROMPT" "build" "$i"
    fi
    # Check if Ralph signaled completion
    if [[ $? -eq 42 ]]; then
      echo ""
      echo "Loop terminated early due to completion."
      break
    fi
  done
fi
