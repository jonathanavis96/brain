#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Ralph Loop - Autonomous Agent Execution
# =============================================================================
#
# WORKSPACE BOUNDARIES:
#   Cerebras operates from: $ROOT/workers/cerebras/ (derived from this script location)
#   Full access to:      $ROOT/** (entire brain repository)
#   PROTECTED (no modify): rules/AC.rules, .verify/*.sha256, verifier.sh, loop.sh, PROMPT.md
#   FORBIDDEN (no access): .verify/waivers/*.approved (OTP-protected)
#
# =============================================================================

# ROOT can be overridden via env var for project delegation
if [[ -n ${CEREBRAS_PROJECT_ROOT:-} ]]; then
  ROOT="$CEREBRAS_PROJECT_ROOT"
  CEREBRAS="$ROOT/workers/cerebras"
else
  # Get absolute path to this script, then go up two levels for ROOT (brain/workers/cerebras -> brain)
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  CEREBRAS="$SCRIPT_DIR"
  ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
fi
LOGDIR="$CEREBRAS/logs"
VERIFY_REPORT="$CEREBRAS/.verify/latest.txt"
mkdir -p "$LOGDIR"

# Cleanup logs older than 7 days on startup
cleanup_old_logs() {
  local days="${1:-7}"
  local count
  count=$(find "$LOGDIR" -name "*.log" -type f -mtime +"$days" 2>/dev/null | wc -l)
  if [[ $count -gt 0 ]]; then
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
  if [[ -z $pid || $pid == "unknown" ]]; then
    return 1 # Invalid PID, treat as not running
  fi
  # Check if process exists (works on Linux/macOS)
  kill -0 "$pid" 2>/dev/null
}

# Atomic lock acquisition with stale lock detection
acquire_lock() {
  # First, check for stale lock
  if [[ -f $LOCK_FILE ]]; then
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
  if [[ -n ${TEMP_CONFIG:-} && -f ${TEMP_CONFIG:-} ]]; then
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
          [--model <model>] [--branch <name>] [--task <desc>] [--dry-run]
          [--no-monitors] [--force-build] [--rollback [N]] [--resume]

Defaults:
  --iterations 1
  --plan-every 3
  --model       glm (GLM 4.7 - strong coding model)
  --branch      Defaults to <repo>-work (e.g., brain-work, NeoQueue-work)
  If --prompt is NOT provided, loop alternates:
    - PLAN on iteration 1 and every N iterations
    - BUILD otherwise
  If --prompt IS provided, that prompt is used for all iterations.

Model Selection:
  --model <model>  Specify the Cerebras model to use. Shortcuts available:
                   llama4 / scout    -> llama-4-scout-17b (default)
                   maverick          -> llama-4-maverick-17b
                   llama3 / llama3-8b -> llama3.1-8b
                   llama3-70b        -> llama3.1-70b
                   qwen / qwen3      -> qwen-3-32b
                   qwen-235b         -> qwen-3-235b-a22b-instruct-2507
                   glm / glm4        -> zai-glm-4.7
                   auto              -> llama-4-scout-17b
                   Or provide a full Cerebras model ID directly.
                   See: https://inference-docs.cerebras.ai/introduction

Branch Workflow:
  --branch <name>  Work on specified branch (creates if needed, switches to it)
                   Default: <repo>-work (derived from git remote, e.g., brain-work)
                   Then run pr-batch.sh to create PRs to main

Task Injection:
  --task <desc>   Inject a specific task directly instead of reading IMPLEMENTATION_PLAN.md
                  Example: --task "Fix typo in README.md: change 'teh' to 'the'"

Safety Features:
  --dry-run       Preview changes without committing (uses a test task)
  --no-monitors   Skip auto-launching monitor terminals (useful for CI/CD or headless environments)
  --force-build   Force BUILD mode even on iteration 1 (bypasses automatic PLAN on first iteration)
  --rollback [N]  Undo last N Ralph commits (default: 1). Requires confirmation.
  --resume        Resume from last incomplete iteration (checks for uncommitted changes)

Requirements:
  - CEREBRAS_API_KEY environment variable must be set
  - Get your API key from: https://cloud.cerebras.ai

Examples:
  # Run BUILD once (from anywhere)
  bash cerebras/loop.sh --prompt cerebras/PROMPT_build.md --iterations 1 --plan-every 999

  # From inside cerebras/
  bash ./loop.sh --prompt ./PROMPT_build.md --iterations 1 --plan-every 999

  # Alternate plan/build for 10 iters, plan every 3
  bash cerebras/loop.sh --iterations 10 --plan-every 3

  # Use GLM model for coding tasks
  bash cerebras/loop.sh --model glm --iterations 20 --plan-every 5

  # Use Llama 4 Maverick for complex planning
  bash cerebras/loop.sh --model maverick --iterations 1

  # Dry-run mode (see what would change)
  bash cerebras/loop.sh --dry-run --iterations 1

  # Run without monitor terminals (useful for CI/CD)
  bash cerebras/loop.sh --no-monitors --iterations 5

  # Force BUILD mode on iteration 1 (skip automatic PLAN)
  bash cerebras/loop.sh --force-build --iterations 1

  # Rollback last 2 iterations
  bash cerebras/loop.sh --rollback 2

  # Resume after error
  bash cerebras/loop.sh --resume
EOF
}

# Defaults
ITERATIONS=1
PLAN_EVERY=3
PROMPT_ARG=""
MODEL_ARG=""
BRANCH_ARG=""
TASK_ARG=""
DRY_RUN=false
ROLLBACK_MODE=false
ROLLBACK_COUNT=1
RESUME_MODE=false
NO_MONITORS=false
FORCE_BUILD=false
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
      # Placeholder for future yolo mode implementation
      shift
      ;;
    --no-yolo)
      # Placeholder for future no-yolo mode implementation
      shift
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
    --task)
      TASK_ARG="${2:-}"
      shift 2
      ;;
    --no-monitors)
      NO_MONITORS=true
      shift
      ;;
    --force-build)
      FORCE_BUILD=true
      shift
      ;;
    --rollback)
      ROLLBACK_MODE=true
      if [[ -n ${2:-} && $2 =~ ^[0-9]+$ ]]; then
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

# Resolve model shortcut to Cerebras model ID
# Available models: https://inference-docs.cerebras.ai/introduction
resolve_model_cerebras() {
  local model="$1"
  case "$model" in
    llama4 | llama-4 | scout)
      echo "llama-4-scout-17b"
      ;;
    llama4-large | maverick)
      echo "llama-4-maverick-17b"
      ;;
    llama3 | llama-3 | llama3-8b)
      echo "llama3.1-8b"
      ;;
    llama3-large | llama3-70b)
      echo "llama3.1-70b"
      ;;
    qwen | qwen3)
      echo "qwen-3-32b"
      ;;
    qwen-large | qwen-235b)
      echo "qwen-3-235b-a22b-instruct-2507"
      ;;
    glm | glm4 | glm-4.7)
      echo "zai-glm-4.7"
      ;;
    auto | latest | "")
      echo "llama-4-scout-17b"
      ;;
    *)
      echo "$model"
      ;;
  esac
}

# Run Cerebras API call (OpenAI-compatible endpoint)
run_cerebras_api() {
  local prompt_file="$1"
  local model="$2"
  local output_file="$3"

  if [[ -z ${CEREBRAS_API_KEY:-} ]]; then
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

# Use provided model or default for Cerebras
if [[ -z $MODEL_ARG ]]; then
  MODEL_ARG="glm" # Default for Cerebras (GLM 4.7 - strong coding model)
fi

RESOLVED_MODEL="$(resolve_model_cerebras "$MODEL_ARG")"

if [[ -n $RESOLVED_MODEL ]]; then
  echo "Using model: $RESOLVED_MODEL"
fi

# Resolve target branch:
# 1. User-provided --branch takes precedence
# 2. On --resume without --branch, stay on current branch
# 3. Otherwise use default WORK_BRANCH
if [[ -n $BRANCH_ARG ]]; then
  TARGET_BRANCH="$BRANCH_ARG"
elif [[ $RESUME_MODE == "true" ]]; then
  TARGET_BRANCH="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "$WORK_BRANCH")"
else
  TARGET_BRANCH="$WORK_BRANCH"
fi

# Debug output for derived values
echo "Repo: $REPO_NAME | Branch: $TARGET_BRANCH | Lock: $LOCK_FILE"

# Resolve a prompt path robustly (works from repo root or ralph/)
resolve_prompt() {
  local p="$1"
  if [[ -z $p ]]; then return 1; fi

  # 1) As provided (relative to current working directory)
  if [[ -f $p ]]; then
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
if [[ $ROLLBACK_MODE == "true" ]]; then
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
  if [[ $confirm != "yes" ]]; then
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
if [[ $RESUME_MODE == "true" ]]; then
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
  if [[ $confirm != "yes" ]]; then
    echo "Resume cancelled."
    exit 0
  fi

  echo "✅ Continuing with existing changes..."
  echo ""
fi

# Handle branch switching
if [[ -n $BRANCH_ARG ]]; then
  CURRENT_BRANCH=$(git branch --show-current)
  if [[ $CURRENT_BRANCH != "$BRANCH_ARG" ]]; then
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
PLAN_PROMPT="$CEREBRAS/PROMPT.md"
BUILD_PROMPT="$CEREBRAS/PROMPT.md"

# Verifier gate - runs rules/AC.rules checks after BUILD
VERIFY_SCRIPT="$CEREBRAS/verifier.sh"
RUN_ID_FILE="$CEREBRAS/.verify/run_id.txt"
INIT_SCRIPT="$CEREBRAS/init_verifier_baselines.sh"
AC_HASH_FILE="$CEREBRAS/.verify/ac.sha256"

# Auto-init verifier baselines if missing
init_verifier_if_needed() {
  if [[ -x $INIT_SCRIPT && ! -f $AC_HASH_FILE ]]; then
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
  [[ -f $report_file ]] || return

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
  if [[ -n $standard_fails ]]; then
    if [[ -n $rules ]]; then
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
  [[ -z $LAST_VERIFIER_FAILED_RULES ]] && return 1

  # Check if any Protected.* rules failed
  if echo "$LAST_VERIFIER_FAILED_RULES" | grep -qE 'Protected\.[0-9]+'; then
    return 0 # protected file failures found
  fi
  return 1 # no protected file failures
}

run_verifier() {
  if [[ ! -x $VERIFY_SCRIPT ]]; then
    # Check for .initialized marker to determine security vs bootstrap mode
    if [[ -f "$CEREBRAS/.verify/.initialized" ]]; then
      # Security hard-fail: verifier was initialized but is now missing
      echo "🚨 SECURITY ERROR: Verifier missing but .initialized marker exists!"
      echo "   Expected: $VERIFY_SCRIPT"
      echo "   Marker: $CEREBRAS/.verify/.initialized"
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
    if [[ -f $RUN_ID_FILE ]]; then
      local stored_id
      stored_id=$(cat "$RUN_ID_FILE" 2>/dev/null)
      if [[ $stored_id != "$RUN_ID" ]]; then
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
    tail -10 "$CEREBRAS/.verify/latest.txt" 2>/dev/null || true
    LAST_VERIFIER_STATUS="PASS"
    LAST_VERIFIER_FAILED_RULES=""
    LAST_VERIFIER_FAIL_COUNT=0
    return 0
  else
    echo "❌ Acceptance criteria FAILED"
    echo ""
    # Show header and summary, skip individual check results
    sed -n '1,/^----/p; /^SUMMARY$/,$ p' "$CEREBRAS/.verify/latest.txt" 2>/dev/null || echo "(no report found)"
    LAST_VERIFIER_STATUS="FAIL"
    parse_verifier_failures "$CEREBRAS/.verify/latest.txt"
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
    # Use machine marker #@VERIFIER: to avoid matching documentation text
    if [[ -n $LAST_VERIFIER_STATUS ]]; then
      echo "#@VERIFIER: $LAST_VERIFIER_STATUS"
      if [[ $LAST_VERIFIER_STATUS == "FAIL" ]]; then
        echo "# FAILED_RULES: $LAST_VERIFIER_FAILED_RULES"
        echo "# FAILURE_COUNT: $LAST_VERIFIER_FAIL_COUNT"
        echo "# ACTION_REQUIRED: Read .verify/latest.txt and fix AC failures BEFORE picking new tasks."
      fi
      echo ""
    fi

    # LAZY LOADING: Don't inject AGENTS.md/NEURONS.md/THOUGHTS.md
    # Agent reads them via tools when needed, then writes STATE summary
    # This reduces base prompt from ~6K tokens to ~200 tokens
    cat "$prompt_file"

    # Inject task directly if --task was provided
    if [[ -n $TASK_ARG ]]; then
      echo ""
      echo "---"
      echo ""
      echo "# YOUR TASK"
      echo ""
      echo "$TASK_ARG"
      echo ""
      echo "Complete this task, commit with git_commit, then output :::BUILD_READY:::"
    # Append dry-run instruction if enabled
    elif [[ $DRY_RUN == "true" ]]; then
      echo ""
      echo "---"
      echo ""
      echo "# DRY-RUN MODE - TEST TASK"
      echo ""
      echo "⚠️ **DO NOT commit any changes.**"
      echo ""
      echo "## Your Task"
      echo ""
      echo "Create a file \`tmp_rovodev_test.md\` with this content:"
      echo ""
      echo '```markdown'
      echo "# Test File"
      echo ""
      echo "Created by Cerebras agent dry-run test."
      echo "Timestamp: $(date -Iseconds)"
      echo '```'
      echo ""
      echo "## Steps"
      echo "1. Use write_file to create tmp_rovodev_test.md"
      echo "2. Use read_file to verify it was created"
      echo "3. Output :::BUILD_READY:::"
      echo ""
      echo "Do NOT use git_commit. This is a test only."
    fi
  } >"$prompt_with_mode"

  # Feed prompt into Cerebras agent
  echo "🧠 Running Cerebras Agent with model: ${RESOLVED_MODEL}"
  # Use the agentic Python runner that supports tool execution
  if ! python3 "$CEREBRAS/cerebras_agent.py" \
    --prompt "$prompt_with_mode" \
    --model "$RESOLVED_MODEL" \
    --max-turns "${CEREBRAS_MAX_TURNS:-24}" \
    --cwd "$ROOT" \
    --output "$log"; then
    echo "❌ Cerebras Agent failed. See: $log"
    return 1
  fi

  # Clean up temporary prompt
  rm -f "$prompt_with_mode"

  echo
  echo "Run complete."
  echo "Transcript: $log"

  # In dry-run mode, remind user no commits were made
  if [[ $DRY_RUN == "true" ]]; then
    echo ""
    echo "========================================"
    echo "🔍 Dry-run completed"
    echo "No changes were committed."
    echo "Review the transcript above for analysis."
    echo "========================================"
  fi

  # Run verifier after both PLAN and BUILD iterations
  if [[ $phase == "plan" ]] || [[ $phase == "build" ]]; then
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
  if [[ -f "$CEREBRAS/IMPLEMENTATION_PLAN.md" ]]; then
    local unchecked_count
    # Note: grep -c returns exit 1 when count is 0, so we capture output first then default
    unchecked_count=$(grep -cE '^\s*-\s*\[ \]' "$CEREBRAS/IMPLEMENTATION_PLAN.md" 2>/dev/null) || unchecked_count=0
    if [[ $unchecked_count -eq 0 ]]; then
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
  if [[ -n ${TMUX:-} ]]; then
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
  local monitor_dir="$CEREBRAS"
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
  if [[ $current_tasks_launched == "false" && $thunk_tasks_launched == "false" ]]; then
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

# Fail fast if cerebras dependencies not found
command -v python3 >/dev/null 2>&1 || {
  echo "ERROR: python3 not found in PATH (required for Cerebras runner)"
  exit 1
}
if [[ ! -f "$CEREBRAS/cerebras_agent.py" ]]; then
  echo "ERROR: cerebras_agent.py not found at $CEREBRAS/cerebras_agent.py"
  exit 1
fi
if [[ -z ${CEREBRAS_API_KEY:-} ]]; then
  echo "ERROR: CEREBRAS_API_KEY environment variable not set"
  echo "Get your API key from: https://cloud.cerebras.ai"
  exit 1
fi

# Print effective config for debugging
echo "Runner=cerebras Model=${RESOLVED_MODEL:-<default>}"

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
if [[ $NO_MONITORS == "false" ]]; then
  launch_monitors
fi

# Determine prompt strategy
if [[ -n $PROMPT_ARG ]]; then
  PROMPT_FILE="$(resolve_prompt "$PROMPT_ARG")"
  for ((i = 1; i <= ITERATIONS; i++)); do
    # Check for interrupt before starting iteration
    if [[ $INTERRUPT_RECEIVED == "true" ]]; then
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
      if [[ -f $VERIFY_REPORT ]]; then
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
      echo "  cd workers/cerebras"
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
    if [[ $INTERRUPT_RECEIVED == "true" ]]; then
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
      if [[ -f $VERIFY_REPORT ]]; then
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
      echo "  cd workers/cerebras"
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
    # Determine mode: --force-build bypasses the "iteration 1 = PLAN" rule
    if [[ $FORCE_BUILD == "true" ]]; then
      # Force BUILD mode regardless of iteration number
      run_once "$BUILD_PROMPT" "build" "$i" || run_result=$?
    elif [[ $i -eq 1 ]] || ((PLAN_EVERY > 0 && ((i - 1) % PLAN_EVERY == 0))); then
      # Sync tasks from Cortex before PLAN mode
      if [[ -f "$CEREBRAS/sync_cortex_plan.sh" ]]; then
        echo "Syncing tasks from Cortex..."
        if (cd "$CEREBRAS" && bash sync_cortex_plan.sh) 2>&1; then
          echo "✓ Cortex sync complete"
        else
          echo "⚠ Cortex sync failed (non-blocking)"
        fi
        echo ""
      fi
      run_once "$PLAN_PROMPT" "plan" "$i" || run_result=$?
    else
      run_once "$BUILD_PROMPT" "build" "$i" || run_result=$?
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
