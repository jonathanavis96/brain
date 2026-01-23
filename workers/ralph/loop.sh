#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Ralph Loop - Autonomous Agent Execution
# =============================================================================
#
# WORKSPACE BOUNDARIES:
#   Ralph operates from: $ROOT/workers/ralph/ (derived from this script location)
#   Full access to:      $ROOT/** (entire brain repository)
#   PROTECTED (no modify): rules/AC.rules, .verify/*.sha256, verifier.sh, loop.sh, PROMPT.md
#   FORBIDDEN (no access): .verify/waivers/*.approved (OTP-protected)
#
# =============================================================================

# ROOT can be overridden via env var for project delegation
if [[ -n "${RALPH_PROJECT_ROOT:-}" ]]; then
  ROOT="$RALPH_PROJECT_ROOT"
  RALPH="$ROOT/workers/ralph"
else
  # Get absolute path to this script, then go up two levels for ROOT (brain/workers/ralph -> brain)
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  RALPH="$SCRIPT_DIR"
  ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
fi
LOGDIR="$RALPH/logs"
VERIFY_REPORT="$RALPH/.verify/latest.txt"
mkdir -p "$LOGDIR"

# Cleanup logs older than 7 days on startup
cleanup_old_logs() {
  local days="${1:-7}"
  local count
  count=$(find "$LOGDIR" -name "*.log" -type f -mtime +"$days" 2>/dev/null | wc -l)
  if [[ "$count" -gt 0 ]]; then
    echo "🧹 Cleaning up $count log files older than $days days..."
    find "$LOGDIR" -name "*.log" -type f -mtime +"$days" -delete
  fi
}
cleanup_old_logs 7

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
    return 1 # Invalid PID, treat as not running
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
    if ! (
      set -o noclobber
      echo "$$" >"$LOCK_FILE"
    ) 2>/dev/null; then
      LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "unknown")
      # Double-check: maybe we lost a race but the winner is now dead
      if ! is_pid_running "$LOCK_PID"; then
        echo "🧹 Removing stale lock (PID $LOCK_PID no longer running)"
        rm -f "$LOCK_FILE"
        # Retry once
        if ! (
          set -o noclobber
          echo "$$" >"$LOCK_FILE"
        ) 2>/dev/null; then
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
          [--runner rovodev|opencode|cerebras] [--model <model>] [--branch <name>] [--dry-run] [--no-monitors]
          [--opencode-serve] [--opencode-port N] [--opencode-attach <url>] [--opencode-format json|text]
          [--rollback [N]] [--resume]

Defaults:
  --iterations 1
  --plan-every 3
  --runner      rovodev
  --model       Sonnet 4.5 (rovodev) or Grok Code (opencode), Llama models (cerebras). Use --model auto for rovodev config.
  --branch      Defaults to <repo>-work (e.g., brain-work, NeoQueue-work)
  If --prompt is NOT provided, loop alternates:
    - PLAN on iteration 1 and every N iterations
    - BUILD otherwise
  If --prompt IS provided, that prompt is used for all iterations.

Model Selection:
  --model <model>  Specify the model to use. Shortcuts available:
                   sonnet  -> Sonnet 4.5 (anthropic.claude-sonnet-4-5-20250929-v1:0)
                   opus    -> Opus 4.5 (anthropic.claude-opus-4-5-20251101-v1:0)
                   sonnet4 -> Sonnet 4 (anthropic.claude-sonnet-4-20250514-v1:0)
                    auto    -> Use default from ~/.rovodev/config.yml
                    Or provide a full model ID directly.

Runner Selection:
  --runner rovodev|opencode|cerebras
                   rovodev: uses acli rovodev run (default)
                   opencode: uses opencode run (provider/model). See: opencode models
                   cerebras: uses Cerebras agentic runner with tool execution
                            (requires CEREBRAS_API_KEY env var, shows token usage)

Branch Workflow:
  --branch <name>  Work on specified branch (creates if needed, switches to it)
                   Default: <repo>-work (derived from git remote, e.g., brain-work)
                   Then run pr-batch.sh to create PRs to main

Safety Features:
  --dry-run       Preview changes without committing (appends instruction to prompt)
  --no-monitors   Skip auto-launching monitor terminals (useful for CI/CD or headless environments)
  --rollback [N]  Undo last N Ralph commits (default: 1). Requires confirmation.
  --resume        Resume from last incomplete iteration (checks for uncommitted changes)

OpenCode Options:
  --opencode-serve      Start local OpenCode server for faster runs (implies --opencode-attach localhost:4096)
  --opencode-port N     Port for OpenCode server (default: 4096)
  --opencode-attach <url> Attach to running OpenCode server at <url> (e.g., http://localhost:4096)
  --opencode-format default|json  Format for OpenCode output (default: default; use default for grep-based verifiers)

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

  # Run without monitor terminals (useful for CI/CD)
  bash ralph/loop.sh --no-monitors --iterations 5

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
RUNNER="rovodev"
PROMPT_ARG=""
MODEL_ARG=""
BRANCH_ARG=""
DRY_RUN=false
OPENCODE_SERVE=false
OPENCODE_PORT=4096
OPENCODE_ATTACH=""
OPENCODE_FORMAT="default"
ROLLBACK_MODE=false
ROLLBACK_COUNT=1
RESUME_MODE=false
NO_MONITORS=false
CONSECUTIVE_VERIFIER_FAILURES=0

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --prompt)
      PROMPT_ARG="${2:-}"
      shift 2
      ;;
    --iterations)
      ITERATIONS="${2:-}"
      shift 2
      ;;
    --plan-every)
      PLAN_EVERY="${2:-}"
      shift 2
      ;;
    --yolo)
      YOLO_FLAG="--yolo"
      shift
      ;;
    --no-yolo)
      YOLO_FLAG=""
      shift
      ;;
    --runner)
      RUNNER="${2:-}"
      shift 2
      ;;
    --opencode-serve)
      OPENCODE_SERVE=true
      shift
      ;;
    --opencode-port)
      OPENCODE_PORT="${2:-4096}"
      shift 2
      ;;
    --opencode-attach)
      OPENCODE_ATTACH="${2:-}"
      shift 2
      ;;
    --opencode-format)
      OPENCODE_FORMAT="${2:-default}"
      shift 2
      ;;
    --model)
      MODEL_ARG="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH_ARG="${2:-}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-monitors)
      NO_MONITORS=true
      shift
      ;;
    --rollback)
      ROLLBACK_MODE=true
      if [[ -n "${2:-}" && "$2" =~ ^[0-9]+$ ]]; then
        ROLLBACK_COUNT="$2"
        shift 2
      else
        shift
      fi
      ;;
    --resume)
      RESUME_MODE=true
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 2
      ;;
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
    opus | opus4.5 | opus45)
      echo "$MODEL_OPUS_45"
      ;;
    sonnet | sonnet4.5 | sonnet45)
      echo "$MODEL_SONNET_45"
      ;;
    sonnet4)
      echo "$MODEL_SONNET_4"
      ;;
    latest | auto)
      # Use system default - don't override config
      echo ""
      ;;
    *)
      echo "$model"
      ;;
  esac
}

# Resolve model shortcut to OpenCode provider/model.
# IMPORTANT: Replace placeholder IDs below with the *exact* IDs from: opencode models
resolve_model_opencode() {
  local model="$1"
  case "$model" in
    grok | grokfast | grok-code-fast-1)
      # Confirmed via opencode models
      echo "opencode/grok-code"
      ;;
    opus | opus4.5 | opus45)
      # Placeholder - anthropic not available in current setup
      echo "opencode/gpt-5-nano"
      ;; # Fallback to available model
    sonnet | sonnet4.5 | sonnet45)
      # Placeholder - anthropic not available
      echo "opencode/gpt-5-nano"
      ;; # Fallback
    latest | auto)
      # Let OpenCode decide its own default if user explicitly asked for auto/latest
      echo ""
      ;;
    *)
      # Pass through (user provided provider/model already, or an OpenCode alias)
      echo "$model"
      ;;
  esac
}

# Run Cerebras API call (OpenAI-compatible endpoint)
run_cerebras_api() {
  local prompt_file="$1"
  local model="$2"
  local output_file="$3"

  if [[ -z "${CEREBRAS_API_KEY:-}" ]]; then
    echo "ERROR: CEREBRAS_API_KEY environment variable not set"
    echo "Get your API key from: https://cloud.cerebras.ai"
    return 1
  fi

  # Create JSON payload using jq for proper escaping
  local json_payload
  json_payload=$(jq -n \
    --arg model "$model" \
    --rawfile content "$prompt_file" \
    '{
      model: $model,
      messages: [{role: "user", content: $content}],
      max_tokens: 16384,
      temperature: 0.3
    }')

  # Make API call
  local response
  response=$(curl -sS "https://api.cerebras.ai/v1/chat/completions" \
    -H "Authorization: Bearer $CEREBRAS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$json_payload" 2>&1)

  local rc=$?
  if [[ $rc -ne 0 ]]; then
    echo "ERROR: Cerebras API call failed (curl exit $rc)"
    echo "$response"
    return 1
  fi

  # Check for API error
  if echo "$response" | jq -e '.error' >/dev/null 2>&1; then
    echo "ERROR: Cerebras API error:"
    echo "$response" | jq -r '.error.message // .error'
    return 1
  fi

  # Extract and output the response content
  echo "$response" | jq -r '.choices[0].message.content' | tee "$output_file"
  return 0
}

# Setup model config - default to Sonnet 4.5 for Ralph loops
CONFIG_FLAG=""
TEMP_CONFIG=""

# Use provided model or default based on runner
if [[ -z "$MODEL_ARG" ]]; then
  if [[ "$RUNNER" == "opencode" ]]; then
    MODEL_ARG="grok" # Default for OpenCode
  else
    MODEL_ARG="sonnet" # Default for RovoDev
  fi
fi

if [[ "$RUNNER" == "opencode" ]]; then
  RESOLVED_MODEL="$(resolve_model_opencode "$MODEL_ARG")"
else
  RESOLVED_MODEL="$(resolve_model "$MODEL_ARG")"
fi

# Only create RovoDev temp config when runner=rovodev and we have a model to set
if [[ "$RUNNER" == "rovodev" ]]; then
  if [[ -n "$RESOLVED_MODEL" ]]; then
    TEMP_CONFIG="/tmp/rovodev_config_$$_$(date +%s).yml"

    # Copy base config and override modelId
    if [[ -f "$HOME/.rovodev/config.yml" ]]; then
      sed "s|^  modelId:.*|  modelId: $RESOLVED_MODEL|" "$HOME/.rovodev/config.yml" >"$TEMP_CONFIG"
    else
      cat >"$TEMP_CONFIG" <<EOFCONFIG
version: 1
agent:
  modelId: $RESOLVED_MODEL
EOFCONFIG
    fi
    CONFIG_FLAG="--config-file $TEMP_CONFIG"
    echo "Using model: $RESOLVED_MODEL"
  fi
else
  # OpenCode runner uses provider/model directly; no temp config needed.
  if [[ -n "$RESOLVED_MODEL" ]]; then
    echo "Using model: $RESOLVED_MODEL"
  else
    echo "Using model: (OpenCode default)"
  fi
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
  read -r -p "⚠️  Revert these $ROLLBACK_COUNT commit(s)? (type 'yes' to confirm): " confirm
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

  read -r -p "Continue from this state? (yes/no): " confirm
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

# Verifier gate - runs rules/AC.rules checks after BUILD
VERIFY_SCRIPT="$RALPH/verifier.sh"
RUN_ID_FILE="$RALPH/.verify/run_id.txt"
INIT_SCRIPT="$RALPH/init_verifier_baselines.sh"
AC_HASH_FILE="$RALPH/.verify/ac.sha256"

# Auto-init verifier baselines if missing
init_verifier_if_needed() {
  if [[ -x "$INIT_SCRIPT" && ! -f "$AC_HASH_FILE" ]]; then
    echo ""
    echo "========================================"
    echo "🔧 Initializing verifier baselines..."
    echo "========================================"
    if "$INIT_SCRIPT"; then
      echo "✅ Baselines initialized successfully"
    else
      echo "❌ Failed to initialize baselines"
      return 1
    fi
  fi
  return 0
}

# Track last verifier result for prompt injection
LAST_VERIFIER_STATUS=""
LAST_VERIFIER_FAILED_RULES=""
LAST_VERIFIER_FAIL_COUNT=0

# Parse verifier report to extract failed rules
parse_verifier_failures() {
  local report_file="$1"
  [[ -f "$report_file" ]] || return

  local rules=""
  local count=0

  # Extract [FAIL] rule IDs (standard format)
  local standard_fails
  standard_fails=$(grep -oE '^\[FAIL\] [A-Za-z0-9_.]+' "$report_file" 2>/dev/null | sed 's/\[FAIL\] //' | tr '\n' ',' | sed 's/,$//' | sed 's/,,*/,/g')
  local standard_count
  standard_count=$(grep -c '^\[FAIL\]' "$report_file" 2>/dev/null || echo "0")

  # Check for hash guard failure (special format: [timestamp] FAIL: AC hash mismatch)
  if grep -q 'FAIL: AC hash mismatch' "$report_file" 2>/dev/null; then
    rules="HashGuard"
    count=1
  fi

  # Combine results
  if [[ -n "$standard_fails" ]]; then
    if [[ -n "$rules" ]]; then
      rules="$rules, $standard_fails"
    else
      rules="$standard_fails"
    fi
    count=$((count + standard_count))
  fi

  LAST_VERIFIER_FAILED_RULES="$rules"
  LAST_VERIFIER_FAIL_COUNT="$count"
}

# Check if Ralph requested human intervention in the log
check_human_intervention() {
  local log_file="$1"
  # Strip ANSI codes and check for human intervention marker
  if sed 's/\x1b\[[0-9;]*m//g' "$log_file" | grep -q 'HUMAN INTERVENTION REQUIRED'; then
    return 0 # intervention needed
  fi
  return 1 # no intervention needed
}

# Check if previous verifier found protected file failures (requires human intervention)
check_protected_file_failures() {
  # If no failed rules, nothing to check
  [[ -z "$LAST_VERIFIER_FAILED_RULES" ]] && return 1

  # Check if any Protected.* rules failed
  if echo "$LAST_VERIFIER_FAILED_RULES" | grep -qE 'Protected\.[0-9]+'; then
    return 0 # protected file failures found
  fi
  return 1 # no protected file failures
}

run_verifier() {
  if [[ ! -x "$VERIFY_SCRIPT" ]]; then
    # Check for .initialized marker to determine security vs bootstrap mode
    if [[ -f "$RALPH/.verify/.initialized" ]]; then
      # Security hard-fail: verifier was initialized but is now missing
      echo "🚨 SECURITY ERROR: Verifier missing but .initialized marker exists!"
      echo "   Expected: $VERIFY_SCRIPT"
      echo "   Marker: $RALPH/.verify/.initialized"
      LAST_VERIFIER_STATUS="FAIL"
      LAST_VERIFIER_FAILED_RULES="verifier_missing_initialized"
      LAST_VERIFIER_FAIL_COUNT=1
      return 1
    else
      # Bootstrap mode: soft-fail, allow continuation
      echo "⚠️  Verifier not found or not executable: $VERIFY_SCRIPT"
      echo "   (Bootstrap mode - no .initialized marker found)"
      LAST_VERIFIER_STATUS="SKIP"
      return 0 # Don't block if verifier doesn't exist yet
    fi
  fi

  # Auto-init baselines if missing
  if ! init_verifier_if_needed; then
    LAST_VERIFIER_STATUS="FAIL"
    LAST_VERIFIER_FAILED_RULES="init_baselines"
    LAST_VERIFIER_FAIL_COUNT=1
    return 1
  fi

  echo ""
  echo "========================================"
  echo "🔍 Running acceptance criteria verifier..."
  echo "========================================"

  # Generate unique run ID for freshness check
  RUN_ID="$(date +%s)-$$"
  export RUN_ID

  if "$VERIFY_SCRIPT"; then
    # Verify freshness: run_id.txt must match our RUN_ID
    if [[ -f "$RUN_ID_FILE" ]]; then
      local stored_id
      stored_id=$(cat "$RUN_ID_FILE" 2>/dev/null)
      if [[ "$stored_id" != "$RUN_ID" ]]; then
        echo "❌ Freshness check FAILED: run_id mismatch"
        echo "   Expected: $RUN_ID"
        echo "   Got: $stored_id"
        LAST_VERIFIER_STATUS="FAIL"
        LAST_VERIFIER_FAILED_RULES="freshness_check"
        LAST_VERIFIER_FAIL_COUNT=1
        return 1
      fi
    else
      echo "❌ Freshness check FAILED: run_id.txt not found"
      LAST_VERIFIER_STATUS="FAIL"
      LAST_VERIFIER_FAILED_RULES="freshness_check"
      LAST_VERIFIER_FAIL_COUNT=1
      return 1
    fi

    echo "✅ All acceptance criteria passed! (run_id: $RUN_ID)"
    tail -10 "$RALPH/.verify/latest.txt" 2>/dev/null || true
    LAST_VERIFIER_STATUS="PASS"
    LAST_VERIFIER_FAILED_RULES=""
    LAST_VERIFIER_FAIL_COUNT=0
    return 0
  else
    echo "❌ Acceptance criteria FAILED"
    echo ""
    # Show header and summary, skip individual check results
    sed -n '1,/^----/p; /^SUMMARY$/,$ p' "$RALPH/.verify/latest.txt" 2>/dev/null || echo "(no report found)"
    LAST_VERIFIER_STATUS="FAIL"
    parse_verifier_failures "$RALPH/.verify/latest.txt"
    return 1
  fi
}

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
    echo "# REPOSITORY: $REPO_NAME"
    echo "# ROOT: $ROOT"
    echo ""

    # Inject verifier status from previous iteration (if any)
    if [[ -n "$LAST_VERIFIER_STATUS" ]]; then
      echo "# LAST_VERIFIER_RESULT: $LAST_VERIFIER_STATUS"
      if [[ "$LAST_VERIFIER_STATUS" == "FAIL" ]]; then
        echo "# FAILED_RULES: $LAST_VERIFIER_FAILED_RULES"
        echo "# FAILURE_COUNT: $LAST_VERIFIER_FAIL_COUNT"
        echo "# ACTION_REQUIRED: Read .verify/latest.txt and fix AC failures BEFORE picking new tasks."
      fi
      echo ""
    fi

    # Inject current verifier summary (BUILD mode gets fresh state after auto-fix)
    if [[ "$phase" == "build" ]] && [[ -f "$VERIFY_REPORT" ]]; then
      echo "# CURRENT VERIFIER STATE (after auto-fix)"
      echo "# Auto-fix has already run. Focus only on WARN/FAIL items below."
      echo ""
      # Extract just the summary section
      sed -n '/^SUMMARY$/,/^$/p' "$VERIFY_REPORT" 2>/dev/null || true
      echo ""
      # Show WARN and FAIL items only
      grep -E "^\[WARN\]|\[FAIL\]" "$VERIFY_REPORT" 2>/dev/null || echo "# All checks passing!"
      echo ""
    fi

    # Inject AGENTS.md (standard Ralph pattern: PROMPT.md + AGENTS.md)
    # NEURONS.md and THOUGHTS.md are read via subagent when needed (too large for base context)
    echo "# AGENTS.md - Operational Guide"
    echo ""
    cat "${RALPH}/AGENTS.md"
    echo ""
    echo "---"
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
      echo "1. Read workers/IMPLEMENTATION_PLAN.md and identify the first unchecked task"
      echo "2. Analyze what changes would be needed to implement it"
      echo "3. Show file diffs or describe modifications you would make"
      echo "4. Update workers/IMPLEMENTATION_PLAN.md with detailed notes about your findings"
      echo "5. DO NOT use git commit - stop after analysis"
      echo ""
      echo "Output format:"
      echo "- List files that would be created/modified"
      echo "- Show code snippets or diffs for key changes"
      echo "- Document any risks or dependencies discovered"
      echo "- Add findings to workers/IMPLEMENTATION_PLAN.md under 'Discoveries & Notes'"
      echo ""
      echo "This is a preview only. No commits will be made."
    fi
  } >"$prompt_with_mode"

  # Feed prompt into selected runner
  if [[ "$RUNNER" == "opencode" ]]; then
    # NOTE: Passing full prompt as CLI arg can hit shell/argv limits if prompt is huge.
    # If that happens, pivot to a file-based approach after validating basic integration.
    attach_flag=""
    if [[ -n "${OPENCODE_ATTACH:-}" ]]; then
      attach_flag="--attach ${OPENCODE_ATTACH}"
    fi
    opencode run "${attach_flag}" --model "${RESOLVED_MODEL}" --format "${OPENCODE_FORMAT}" "$(cat "$prompt_with_mode")" 2>&1 | tee "$log"
    rc=$?
    if [[ $rc -ne 0 ]]; then
      echo "❌ OpenCode failed (exit $rc). See: $log"
      tail -n 80 "$log" || true
      return 1
    fi
  else
    # Default: RovoDev
    script -q -c "cat \"$prompt_with_mode\" | acli rovodev run ${CONFIG_FLAG} ${YOLO_FLAG}" "$log"
  fi

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

  # Run verifier after both PLAN and BUILD iterations
  if [[ "$phase" == "plan" ]] || [[ "$phase" == "build" ]]; then
    if run_verifier; then
      echo ""
      echo "========================================"
      echo "🎉 ${phase^^} iteration verified successfully!"
      echo "========================================"
      CONSECUTIVE_VERIFIER_FAILURES=0
    else
      echo ""
      echo "========================================"
      echo "⚠️  ${phase^^} completed but verification failed."
      echo "Review .verify/latest.txt for details."
      echo "========================================"
      # Return special exit code for verifier failure (not human intervention)
      # This allows the main loop to track consecutive failures
      return 44
    fi
  fi

  # Legacy: also check for :::COMPLETE::: but ignore it (loop.sh owns completion now)
  if sed 's/\x1b\[[0-9;]*m//g' "$log" | grep -qE '^\s*:::COMPLETE:::\s*$'; then
    echo ""
    echo "⚠️  Ralph output :::COMPLETE::: but that token is reserved for loop.sh."
    echo "Ignoring - use :::BUILD_READY::: or :::PLAN_READY::: instead."
  fi

  # Check if Ralph requested human intervention
  if check_human_intervention "$log"; then
    echo ""
    echo "========================================"
    echo "🛑 HUMAN INTERVENTION REQUIRED"
    echo "========================================"
    echo "Ralph has indicated it cannot proceed without human help."
    echo "Review the log above for details."
    echo ""
    return 43 # Special return code for human intervention
  fi

  # Check if all tasks are done (for true completion)
  if [[ -f "$ROOT/workers/IMPLEMENTATION_PLAN.md" ]]; then
    local unchecked_count
    # Note: grep -c returns exit 1 when count is 0, so we capture output first then default
    unchecked_count=$(grep -cE '^\s*-\s*\[ \]' "$ROOT/workers/IMPLEMENTATION_PLAN.md" 2>/dev/null) || unchecked_count=0
    if [[ "$unchecked_count" -eq 0 ]]; then
      # All tasks done - run final verification
      if run_verifier; then
        echo ""
        echo "========================================"
        echo "🎉 All tasks complete and verified!"
        echo "========================================"
        return 42 # Special return code for completion
      fi
    fi
  fi

  return 0
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
launch_monitors() {
  local monitor_dir="$RALPH"
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

# Start OpenCode server if requested
if [[ "$RUNNER" == "opencode" ]]; then
  if $OPENCODE_SERVE; then
    OPENCODE_ATTACH="http://localhost:${OPENCODE_PORT}"
    opencode serve --port "$OPENCODE_PORT" >/tmp/opencode_serve.log 2>&1 &
    OPENCODE_SERVE_PID=$!
    trap '[[ -n "${OPENCODE_SERVE_PID:-}" ]] && kill "$OPENCODE_SERVE_PID" 2>/dev/null' EXIT
  fi
fi

# Fail fast if opencode runner but command not found
if [[ "$RUNNER" == "opencode" ]]; then
  command -v opencode >/dev/null 2>&1 || {
    echo "ERROR: opencode not found in PATH"
    exit 1
  }
fi

# Health check for attach endpoint (TCP port check)
if [[ -n "${OPENCODE_ATTACH:-}" ]]; then
  hostport="${OPENCODE_ATTACH#http://}"
  hostport="${hostport#https://}"
  hostport="${hostport%%/*}"
  h="${hostport%%:*}"
  p="${hostport##*:}"
  if ! (echo >/dev/tcp/"$h"/"$p") >/dev/null 2>&1; then
    echo "WARN: OpenCode attach endpoint not reachable; running without --attach"
    OPENCODE_ATTACH=""
  fi
fi

# Print effective config for debugging
echo "Runner=${RUNNER} Model=${RESOLVED_MODEL:-<default>} Format=${OPENCODE_FORMAT:-<default>} Attach=${OPENCODE_ATTACH:-<none>} Serve=${OPENCODE_SERVE:-false}"

# Change to repository root for all git operations
cd "$ROOT"

# Ensure we're on the worktree branch before starting
echo ""
echo "========================================"
echo "Setting up worktree branch: $TARGET_BRANCH"
echo "========================================"
ensure_worktree_branch "$TARGET_BRANCH"
echo ""

# Launch monitors before starting iterations (unless --no-monitors flag is set)
if [[ "$NO_MONITORS" == "false" ]]; then
  launch_monitors
fi

# Determine prompt strategy
if [[ -n "$PROMPT_ARG" ]]; then
  PROMPT_FILE="$(resolve_prompt "$PROMPT_ARG")"
  for ((i = 1; i <= ITERATIONS; i++)); do
    # Check for interrupt before starting iteration
    if [[ "$INTERRUPT_RECEIVED" == "true" ]]; then
      echo ""
      echo "Exiting gracefully after iteration $((i - 1))."
      exit 130
    fi

    # Check for protected file failures before starting LLM (requires human intervention)
    if check_protected_file_failures; then
      echo ""
      echo "========================================"
      echo "🛑 HUMAN INTERVENTION REQUIRED"
      echo "========================================"
      echo "Protected file hash mismatches detected: $LAST_VERIFIER_FAILED_RULES"
      echo ""
      echo "These files are protected and cannot be fixed by Ralph."
      echo ""
      # Show which specific files failed
      if [[ -f "$VERIFY_REPORT" ]]; then
        echo "Failed protected files:"
        grep "^\[FAIL\] Protected\." "$VERIFY_REPORT" | while read -r line; do
          if echo "$line" | grep -q "Protected.1"; then
            echo "  - loop.sh"
          elif echo "$line" | grep -q "Protected.2"; then
            echo "  - verifier.sh"
          elif echo "$line" | grep -q "Protected.3"; then
            echo "  - PROMPT.md"
          elif echo "$line" | grep -q "Protected.4"; then
            echo "  - rules/AC.rules"
          fi
        done
        echo ""
      fi
      echo "To regenerate baselines for these files:"
      echo "  cd brain/ralph"
      echo "  sha256sum loop.sh | cut -d' ' -f1 > .verify/loop.sha256"
      echo "  sha256sum PROMPT.md | cut -d' ' -f1 > .verify/prompt.sha256"
      echo "  sha256sum verifier.sh | cut -d' ' -f1 > .verify/verifier.sha256"
      echo "  sha256sum rules/AC.rules | cut -d' ' -f1 > .verify/ac.sha256"
      echo ""
      echo "After resolving, re-run the loop to continue."
      exit 1
    fi

    # Capture exit code without triggering set -e
    run_result=0
    run_once "$PROMPT_FILE" "custom" "$i" || run_result=$?
    # Check if Ralph signaled completion
    if [[ $run_result -eq 42 ]]; then
      echo ""
      echo "Loop terminated early due to completion."
      break
    fi
    # Check if Ralph requested human intervention
    if [[ $run_result -eq 43 ]]; then
      echo ""
      echo "Loop paused - human intervention required."
      echo "After resolving the issue, re-run the loop to continue."
      exit 1
    fi
    # Check if verifier failed (exit code 44) - give one retry then stop
    if [[ $run_result -eq 44 ]]; then
      CONSECUTIVE_VERIFIER_FAILURES=$((CONSECUTIVE_VERIFIER_FAILURES + 1))
      if [[ $CONSECUTIVE_VERIFIER_FAILURES -ge 2 ]]; then
        echo ""
        echo "========================================"
        echo "🛑 LOOP STOPPED: Consecutive verifier failures"
        echo "========================================"
        echo "Verifier failed $CONSECUTIVE_VERIFIER_FAILURES times in a row."
        echo "Ralph was given a retry iteration but could not fix the issues."
        echo ""
        echo "Review .verify/latest.txt for details."
        echo "Failed rules: $LAST_VERIFIER_FAILED_RULES"
        echo ""
        echo "After fixing manually, re-run the loop to continue."
        exit 1
      else
        echo ""
        echo "========================================"
        echo "⚠️  Verifier failed - giving Ralph one retry iteration"
        echo "========================================"
        echo "Next iteration will inject LAST_VERIFIER_RESULT: FAIL"
        echo "Ralph should fix the AC failures before picking new tasks."
        echo ""
      fi
    else
      # Reset counter on successful iteration
      CONSECUTIVE_VERIFIER_FAILURES=0
    fi
  done
else
  # Alternating plan/build
  for ((i = 1; i <= ITERATIONS; i++)); do
    # Check for interrupt before starting iteration
    if [[ "$INTERRUPT_RECEIVED" == "true" ]]; then
      echo ""
      echo "Exiting gracefully after iteration $((i - 1))."
      exit 130
    fi

    # Check for protected file failures before starting LLM (requires human intervention)
    if check_protected_file_failures; then
      echo ""
      echo "========================================"
      echo "🛑 HUMAN INTERVENTION REQUIRED"
      echo "========================================"
      echo "Protected file hash mismatches detected: $LAST_VERIFIER_FAILED_RULES"
      echo ""
      echo "These files are protected and cannot be fixed by Ralph."
      echo ""
      # Show which specific files failed
      if [[ -f "$VERIFY_REPORT" ]]; then
        echo "Failed protected files:"
        grep "^\[FAIL\] Protected\." "$VERIFY_REPORT" | while read -r line; do
          if echo "$line" | grep -q "Protected.1"; then
            echo "  - loop.sh"
          elif echo "$line" | grep -q "Protected.2"; then
            echo "  - verifier.sh"
          elif echo "$line" | grep -q "Protected.3"; then
            echo "  - PROMPT.md"
          elif echo "$line" | grep -q "Protected.4"; then
            echo "  - rules/AC.rules"
          fi
        done
        echo ""
      fi
      echo "To regenerate baselines for these files:"
      echo "  cd brain/ralph"
      echo "  sha256sum loop.sh | cut -d' ' -f1 > .verify/loop.sha256"
      echo "  sha256sum PROMPT.md | cut -d' ' -f1 > .verify/prompt.sha256"
      echo "  sha256sum verifier.sh | cut -d' ' -f1 > .verify/verifier.sha256"
      echo "  sha256sum rules/AC.rules | cut -d' ' -f1 > .verify/ac.sha256"
      echo ""
      echo "After resolving, re-run the loop to continue."
      exit 1
    fi

    # Capture exit code without triggering set -e
    run_result=0
    if [[ "$i" -eq 1 ]] || ((PLAN_EVERY > 0 && ((i - 1) % PLAN_EVERY == 0))); then
      # Sync tasks from Cortex before PLAN mode
      if [[ -f "$RALPH/sync_cortex_plan.sh" ]]; then
        echo "Syncing tasks from Cortex..."
        if (cd "$RALPH" && bash sync_cortex_plan.sh) 2>&1; then
          echo "✓ Cortex sync complete"
        else
          echo "⚠ Cortex sync failed (non-blocking)"
        fi
        echo ""
      fi
      run_once "$PLAN_PROMPT" "plan" "$i" || run_result=$?
    else
      # Auto-fix lint issues before BUILD iteration
      echo "Running auto-fix for lint issues..."
      if [[ -f "$RALPH/fix-markdown.sh" ]]; then
        (cd "$ROOT" && bash "$RALPH/fix-markdown.sh" . 2>/dev/null) || true
      fi
      if command -v pre-commit &>/dev/null; then
        (cd "$ROOT" && pre-commit run --all-files 2>/dev/null) || true
      fi

      # Run verifier to get current state (Ralph will see WARN/FAIL in context)
      echo "Running verifier to check current state..."
      (cd "$RALPH" && bash verifier.sh 2>/dev/null) || true
      echo ""

      run_once "$BUILD_PROMPT" "build" "$i" || run_result=$?

      # Sync completions back to Cortex after BUILD iterations
      if [[ -f "$RALPH/sync_completions_to_cortex.sh" ]]; then
        echo "Syncing completions to Cortex..."
        if (cd "$RALPH" && bash sync_completions_to_cortex.sh) 2>&1; then
          echo "✓ Completions synced to Cortex"
        else
          echo "⚠ Completions sync failed (non-blocking)"
        fi
        echo ""
      fi
    fi
    # Check if Ralph signaled completion (exit code 42)
    if [[ $run_result -eq 42 ]]; then
      echo ""
      echo "Loop terminated early due to completion."
      break
    fi
    # Check if Ralph requested human intervention (exit code 43)
    if [[ $run_result -eq 43 ]]; then
      echo ""
      echo "Loop paused - human intervention required."
      echo "After resolving the issue, re-run the loop to continue."
      exit 1
    fi
    # Check if verifier failed (exit code 44) - give one retry then stop
    if [[ $run_result -eq 44 ]]; then
      CONSECUTIVE_VERIFIER_FAILURES=$((CONSECUTIVE_VERIFIER_FAILURES + 1))
      if [[ $CONSECUTIVE_VERIFIER_FAILURES -ge 2 ]]; then
        echo ""
        echo "========================================"
        echo "🛑 LOOP STOPPED: Consecutive verifier failures"
        echo "========================================"
        echo "Verifier failed $CONSECUTIVE_VERIFIER_FAILURES times in a row."
        echo "Ralph was given a retry iteration but could not fix the issues."
        echo ""
        echo "Review .verify/latest.txt for details."
        echo "Failed rules: $LAST_VERIFIER_FAILED_RULES"
        echo ""
        echo "After fixing manually, re-run the loop to continue."
        exit 1
      else
        echo ""
        echo "========================================"
        echo "⚠️  Verifier failed - giving Ralph one retry iteration"
        echo "========================================"
        echo "Next iteration will inject LAST_VERIFIER_RESULT: FAIL"
        echo "Ralph should fix the AC failures before picking new tasks."
        echo ""
      fi
    else
      # Reset counter on successful iteration
      CONSECUTIVE_VERIFIER_FAILURES=0
    fi
  done
fi
