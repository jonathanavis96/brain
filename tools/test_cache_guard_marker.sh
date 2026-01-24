#!/usr/bin/env bash
# Smoke test for CACHE_GUARD marker emission
# Verifies that loop.sh emits :::CACHE_GUARD::: markers with required fields
#
# Usage: bash tools/test_cache_guard_marker.sh
# Exit: 0 = markers working, 1 = markers broken
#
# This test:
# 1. Greps loop.sh source code for :::CACHE_GUARD::: patterns
# 2. Validates required fields: iter=, allowed=, reason=, phase=, ts=
# 3. Ensures all emissions follow the standard format

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
LOOP_SH="$ROOT/workers/ralph/loop.sh"

echo "=== CACHE_GUARD Marker Smoke Test ==="
echo "Root: $ROOT"
echo "Loop script: $LOOP_SH"
echo ""

# Ensure loop.sh exists
if [[ ! -x "$LOOP_SH" ]]; then
  echo "ERROR: loop.sh not found or not executable: $LOOP_SH"
  exit 1
fi

echo "--- Checking loop.sh source for CACHE_GUARD markers ---"

# Extract all CACHE_GUARD echo statements from loop.sh
MARKERS=$(grep ":::CACHE_GUARD:::" "$LOOP_SH" 2>/dev/null) || {
  echo "❌ FAILURE: No :::CACHE_GUARD::: markers found in loop.sh"
  exit 1
}

MARKER_COUNT=$(echo "$MARKERS" | wc -l)
echo "  CACHE_GUARD emissions found in source: $MARKER_COUNT"
echo ""

# Validate each marker line
INVALID_MARKERS=()
LINE_NUM=0

while IFS= read -r line; do
  LINE_NUM=$((LINE_NUM + 1))

  # Extract the marker content (everything after :::CACHE_GUARD:::)
  MARKER_CONTENT=$(echo "$line" | grep -oE ':::CACHE_GUARD::: .*' | sed 's/:::CACHE_GUARD::: //')

  # Check for required fields
  MISSING_FIELDS=()

  if ! echo "$MARKER_CONTENT" | grep -q 'iter='; then
    MISSING_FIELDS+=("iter")
  fi

  if ! echo "$MARKER_CONTENT" | grep -q 'allowed='; then
    MISSING_FIELDS+=("allowed")
  fi

  if ! echo "$MARKER_CONTENT" | grep -q 'reason='; then
    MISSING_FIELDS+=("reason")
  fi

  if ! echo "$MARKER_CONTENT" | grep -q 'phase='; then
    MISSING_FIELDS+=("phase")
  fi

  if ! echo "$MARKER_CONTENT" | grep -q 'ts='; then
    MISSING_FIELDS+=("ts")
  fi

  if [[ "${#MISSING_FIELDS[@]}" -gt 0 ]]; then
    INVALID_MARKERS+=("Line $LINE_NUM: Missing fields: ${MISSING_FIELDS[*]}")
  fi

  echo "  ✓ Marker $LINE_NUM: $MARKER_CONTENT"
done <<<"$MARKERS"

echo ""
echo "=== Results ==="

if [[ "${#INVALID_MARKERS[@]}" -eq 0 ]]; then
  echo "✅ SUCCESS: All CACHE_GUARD markers are properly formatted!"
  echo "   - Markers validated: $MARKER_COUNT"
  echo "   - All required fields present: iter, allowed, reason, phase, ts"
  exit 0
else
  echo "❌ FAILURE: Some CACHE_GUARD markers are invalid"
  echo ""
  for invalid in "${INVALID_MARKERS[@]}"; do
    echo "  $invalid"
  done
  echo ""
  echo "Expected format: :::CACHE_GUARD::: iter=N allowed=0/1 reason=... phase=... ts=..."
  exit 1
fi
