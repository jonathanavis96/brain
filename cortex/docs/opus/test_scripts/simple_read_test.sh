#!/usr/bin/env bash
set -euo pipefail
PLAN_FILE="../IMPLEMENTATION_PLAN.md"

echo "Testing simple read..."
count=0
while IFS= read -r line; do
  ((count++))
  if [[ $count -le 5 ]]; then
    echo "Line $count: ${line:0:50}"
  fi
done <"$PLAN_FILE"
echo "Total lines: $count"
