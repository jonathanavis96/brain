#!/usr/bin/env bash
# ralph.sh - User-friendly wrapper for Ralph loop with short flags

# Resolve script directory (follow symlink if needed)
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
SCRIPT_DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
LOOP_SH="$SCRIPT_DIR/loop.sh"

# Usage help
usage() {
  cat <<EOF
Usage: ralph [OPTIONS]

Ralph Worker - Execute tasks from the Brain repository implementation plan.

Short Options:
  -i N                 Number of iterations (default: 1)
  -p N                 Plan every N iterations (default: 3)
  -m MODEL             Model to use (opus, sonnet, glm, qwen, auto)
  -r RUNNER            Runner to use (rovodev, opencode, cerebras)
  -h                   Show this help

Long Options (passed directly to loop.sh):
  --iterations N       Same as -i N
  --plan-every N       Same as -p N
  --model MODEL        Same as -m MODEL
  --runner RUNNER      Same as -r RUNNER
  --yolo               Enable auto-approval mode (default)
  --no-yolo            Disable auto-approval mode
  --branch BRANCH      Target git branch
  --dry-run            Preview actions without executing
  --no-monitors        Don't launch background monitors
  --rollback [N]       Rollback last N commits
  --resume             Resume from last checkpoint
  --help               Show full loop.sh help

Examples:
  ralph                      # Run 1 iteration (default)
  ralph -i20                 # Run 20 iterations
  ralph -i20 -p5             # Run 20 iterations, plan every 5
  ralph -m opus -i10         # Use Opus model, 10 iterations
  ralph -r cerebras -m glm -i5  # Use Cerebras with GLM model
  ralph --dry-run -i5        # Dry run for 5 iterations
  ralph --rollback           # Rollback last commit
  ralph --resume -i10        # Resume and run 10 more iterations

Description:
  Ralph is the execution worker for the Brain repository. He reads tasks
  from IMPLEMENTATION_PLAN.md, creates subtasks, executes them, and logs
  completions to THUNK.md.

  Default behavior:
  - Iterations: 1
  - Plan every: 3 iterations
  - Model: Sonnet 4.5
  - Mode: YOLO (auto-approve)
  - Monitors: Enabled

  For interactive chat with Cortex (the manager): use 'cortex' command

EOF
}

# Parse short flags and convert to long flags for loop.sh
LOOP_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    -i)
      LOOP_ARGS+=(--iterations "${2:-1}")
      shift 2
      ;;
    -i*)
      # Handle -i20 format (no space)
      LOOP_ARGS+=(--iterations "${1#-i}")
      shift
      ;;
    -p)
      LOOP_ARGS+=(--plan-every "${2:-3}")
      shift 2
      ;;
    -p*)
      # Handle -p5 format (no space)
      LOOP_ARGS+=(--plan-every "${1#-p}")
      shift
      ;;
    -m)
      LOOP_ARGS+=(--model "${2:-gpt52}")
      shift 2
      ;;
    -m*)
      # Handle -mopus format (no space)
      LOOP_ARGS+=(--model "${1#-m}")
      shift
      ;;
    -r)
      LOOP_ARGS+=(--runner "${2:-rovodev}")
      shift 2
      ;;
    -r*)
      # Handle -rcerebras format (no space)
      LOOP_ARGS+=(--runner "${1#-r}")
      shift
      ;;
    -h)
      usage
      exit 0
      ;;
    --help)
      # Show full loop.sh help
      bash "$LOOP_SH" --help
      exit 0
      ;;
    *)
      # Pass through any other args to loop.sh
      LOOP_ARGS+=("$1")
      shift
      ;;
  esac
done

# Execute loop.sh with converted arguments
exec bash "$LOOP_SH" "${LOOP_ARGS[@]}"
