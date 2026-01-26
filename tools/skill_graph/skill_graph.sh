#!/usr/bin/env bash
# skill_graph.sh - One-command pipeline to generate skill dependency graph
#
# Usage:
#   bash tools/skill_graph/skill_graph.sh [--output FILE.dot]
#
# Description:
#   Combines extract_links.py and generate_graph.py into a single pipeline.
#   Outputs valid DOT format to stdout (or to file if --output specified).
#
# Examples:
#   bash tools/skill_graph/skill_graph.sh > skills.dot
#   bash tools/skill_graph/skill_graph.sh --output skills.dot
#   bash tools/skill_graph/skill_graph.sh | dot -Tpng > skills.png

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --output)
      OUTPUT_FILE="$2"
      shift 2
      ;;
    -h | --help)
      grep "^#" "$0" | grep -v "^#!/" | sed 's/^# //' | sed 's/^#//'
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Use --help for usage information" >&2
      exit 1
      ;;
  esac
done

# Run the pipeline
if [[ -n "$OUTPUT_FILE" ]]; then
  python3 "$SCRIPT_DIR/extract_links.py" | python3 "$SCRIPT_DIR/generate_graph.py" >"$OUTPUT_FILE"
  echo "Graph written to $OUTPUT_FILE" >&2
else
  python3 "$SCRIPT_DIR/extract_links.py" | python3 "$SCRIPT_DIR/generate_graph.py"
fi
