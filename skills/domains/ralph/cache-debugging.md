# Cache Debugging Patterns

Patterns for debugging cache-related issues in the Ralph loop system.

## Cache Logging Flow

The verifier cache system logs hits/misses through multiple layers:

```text
workers/shared/common.sh     → log_cache_hit() / log_cache_miss()
        ↓ (stderr)
workers/ralph/verifier.sh    → calls cache functions during AC checks
        ↓ (stderr)
workers/ralph/loop.sh        → run_verifier() captures/summarizes stderr
        ↓ (stdout)
Terminal output              → "📊 Cache: N hits, M misses"
```

## Key Files

| File | Role |
|------|------|
| `workers/shared/common.sh` | Cache functions (`log_cache_hit`, `log_cache_miss`) - output to stderr |
| `workers/ralph/verifier.sh` | Calls cache lookup, logs hits/misses per AC check |
| `workers/ralph/loop.sh` | `run_verifier()` function - captures stderr, shows summary |

## Common Issues

### Issue: Cache metadata flooding terminal

**Symptom:** 40+ lines of `[CACHE_HIT]` / `[CACHE_MISS]` in terminal output.

**Cause:** Verifier stderr not being captured/summarized.

**Fix:** In `run_verifier()`, capture stderr to temp file and count hits/misses:

```bash
local cache_stderr
cache_stderr=$(mktemp)

if "$VERIFY_SCRIPT" 2>"$cache_stderr"; then
  # Count and summarize
  local cache_hits cache_misses
  cache_hits=$(grep -c '\[CACHE_HIT\]' "$cache_stderr" 2>/dev/null || echo "0")
  cache_misses=$(grep -c '\[CACHE_MISS\]' "$cache_stderr" 2>/dev/null || echo "0")
  if [[ $((cache_hits + cache_misses)) -gt 0 ]]; then
    echo "📊 Cache: $cache_hits hits, $cache_misses misses"
  fi
  rm -f "$cache_stderr"
  # ... rest of success handling
fi
```

### Issue: Cache output appearing in latest.txt

**Symptom:** `[CACHE_HIT]` entries in `.verify/latest.txt` instead of `[PASS]`/`[FAIL]`.

**Cause:** Stderr being redirected to the report file somewhere.

**Debug steps:**

1. Check where verifier writes to `$REPORT_FILE` (should be stdout redirect `>>`)
2. Check where cache logging writes (should be stderr `>&2`)
3. Check how verifier is called (should NOT merge stderr into stdout)

**Expected behavior:**

- Cache metadata → stderr → discarded or summarized
- PASS/FAIL results → `$REPORT_FILE` (`latest.txt`)

## Debugging Commands

```bash
# Run verifier and see all stderr (cache metadata)
cd ~/code/brain/workers/ralph && bash verifier.sh

# Run verifier with stderr hidden (normal loop behavior)
cd ~/code/brain/workers/ralph && bash verifier.sh 2>/dev/null

# Check what's in latest.txt
cat ~/code/brain/workers/ralph/.verify/latest.txt

# Search for cache logging in codebase
grep -rn "CACHE_HIT\|CACHE_MISS" workers/
```

## Related Files

- `docs/CACHE_DESIGN.md` - Full cache architecture
- `skills/domains/ralph/ralph-patterns.md` - General Ralph patterns

## See Also

- **[Caching Patterns](../backend/caching-patterns.md)** - General caching strategies (TTL, LRU, write-through/write-behind)
- **[Ralph Patterns](ralph-patterns.md)** - Ralph loop architecture and troubleshooting
- **[Token Efficiency](../code-quality/token-efficiency.md)** - Performance optimization including cache usage
- **[docs/CACHE_DESIGN.md](../../../docs/CACHE_DESIGN.md)** - Full cache design document for Ralph system
