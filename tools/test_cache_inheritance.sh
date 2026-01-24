#!/usr/bin/env bash
# Regression test for verifier cache inheritance
# Ensures CACHE_MODE/CACHE_SCOPE are properly exported to subprocesses
#
# Usage: bash tools/test_cache_inheritance.sh
# Exit: 0 = cache working, 1 = cache broken (regression detected)
#
# This test:
# 1. Sets CACHE_MODE=record, runs verifier once (populates cache)
# 2. Sets CACHE_MODE=use, runs verifier again (should hit cache)
# 3. Asserts cache hits > 0 (fails fast if broken)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
VERIFIER="$ROOT/workers/ralph/verifier.sh"
CACHE_DB="$ROOT/artifacts/rollflow_cache/cache.sqlite"

echo "=== Cache Smoke Test ==="
echo "Root: $ROOT"
echo "Verifier: $VERIFIER"
echo "Cache DB: $CACHE_DB"
echo ""

# Ensure verifier exists
if [[ ! -x "$VERIFIER" ]]; then
  echo "ERROR: Verifier not found or not executable: $VERIFIER"
  exit 1
fi

# Clean up test entries from cache (optional - keeps test isolated)
if [[ -f "$CACHE_DB" ]]; then
  echo "Clearing old test cache entries..."
  python3 -c "
import sqlite3
try:
    conn = sqlite3.connect('$CACHE_DB')
    conn.execute(\"DELETE FROM pass_cache WHERE tool_name LIKE 'verifier:%'\")
    conn.commit()
    conn.close()
    print('  Cleared verifier cache entries')
except Exception as e:
    print(f'  No cache to clear: {e}')
" 2>/dev/null || true
fi

echo ""
echo "--- Run 1: CACHE_MODE=record (populate cache) ---"
cd "$ROOT/workers/ralph"
export CACHE_MODE=record
export CACHE_SCOPE=verify,read

# Capture stderr to check for cache logging
STDERR_FILE=$(mktemp)
if bash verifier.sh 2>"$STDERR_FILE"; then
  echo "✓ Verifier passed"
else
  echo "⚠ Verifier had failures (expected for some checks)"
fi

# Check if any entries were recorded
if [[ -f "$CACHE_DB" ]]; then
  RECORD_COUNT=$(python3 -c "
import sqlite3
conn = sqlite3.connect('$CACHE_DB')
cursor = conn.execute(\"SELECT COUNT(*) FROM pass_cache WHERE tool_name LIKE 'verifier:%'\")
print(cursor.fetchone()[0])
conn.close()
" 2>/dev/null) || RECORD_COUNT=0
  echo "  Cache entries recorded: $RECORD_COUNT"
else
  RECORD_COUNT=0
  echo "  WARNING: Cache DB not created"
fi

echo ""
echo "--- Run 2: CACHE_MODE=use (should hit cache) ---"
export CACHE_MODE=use

# Run again and capture output
STDERR_FILE2=$(mktemp)
REPORT_FILE="$ROOT/workers/ralph/.verify/latest.txt"

if bash verifier.sh 2>"$STDERR_FILE2"; then
  echo "✓ Verifier passed"
else
  echo "⚠ Verifier had failures (expected for some checks)"
fi

# Check for cache hits in stderr
CACHE_HITS=$(grep -c "\[CACHE_HIT\]" "$STDERR_FILE2" 2>/dev/null) || CACHE_HITS=0
echo "  Cache hits logged: $CACHE_HITS"

# Check for "(cached)" markers in report
CACHED_PASSES=$(grep -c "(cached)" "$REPORT_FILE" 2>/dev/null) || CACHED_PASSES=0
echo "  Cached PASSes in report: $CACHED_PASSES"

# Cleanup temp files
rm -f "$STDERR_FILE" "$STDERR_FILE2"

echo ""
echo "=== Results ==="
if [[ "$CACHE_HITS" -gt 0 ]] || [[ "$CACHED_PASSES" -gt 0 ]]; then
  echo "✅ SUCCESS: Cache is working!"
  echo "   - Cache hits: $CACHE_HITS"
  echo "   - Cached passes: $CACHED_PASSES"
  exit 0
else
  echo "❌ FAILURE: No cache hits detected"
  echo ""
  echo "Debug: Check if CACHE_MODE is exported:"
  echo "  env | grep CACHE"
  echo ""
  echo "Debug: Check cache DB contents:"
  echo "  sqlite3 $CACHE_DB \"SELECT cache_key, tool_name FROM pass_cache LIMIT 5\""
  exit 1
fi
