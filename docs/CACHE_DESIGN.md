# Cache Design - Ralph Loop Caching System

## Overview

This document defines the caching strategy for the Ralph loop system. The cache stores results from idempotent operations (verifiers, read operations, read-only LLM calls) to avoid redundant work across loop iterations.

**Core Principle:** Cache things that are **idempotent** (same inputs = same outputs). Never cache operations that advance state or modify files.

## At a Glance

| Concept | Description | Example |
|---------|-------------|---------|
| `verify` scope | Cache verifier tool results | `shellcheck loop.sh` cached by file hash |
| `read` scope | Cache file system reads | `cat PROMPT.md` cached by path+mtime |
| `llm_ro` scope | Cache read-only LLM phases | REPORT phase cached by prompt+git_sha |
| `CACHE_MODE` | Control cache behavior | `off`, `record`, `use` |
| `CACHE_SCOPE` | Which caches are active | `verify,read` (default), `verify,read,llm_ro` |
| Input-based keys | Keys derived from content, not iteration | Same file = same key across runs |
| Phase guards | BUILD/PLAN never cache LLM | Hard-blocked regardless of CACHE_SCOPE |

## Common Mistakes

| ❌ Don't | ✅ Do | Why |
|----------|-------|-----|
| Cache BUILD/PLAN LLM calls | Only cache REPORT/ANALYZE LLM | BUILD advances state, caching skips work |
| Use iteration number in cache key | Use file content hash in key | Iteration changes; content determines result |
| Cache failures | Only cache PASS results | Failures may be transient, should retry |
| Set `CACHE_SCOPE=llm_ro` for task execution | Use `CACHE_SCOPE=verify,read` | LLM caching is only safe for read-only phases |
| Forget `--force-fresh` when debugging | Use `--force-fresh` to bypass cache | Stale cache can cause confusing behavior |
| Assume cache hit = correct result | Verify outputs periodically | TTL and content hashing mitigate but don't eliminate staleness |

## Cache Scopes

The Ralph loop supports three cache scopes, each targeting a different class of operations:

### 1. `verify` Scope (Verifiers)

**Purpose:** Cache results from static analysis and verification tools.

**Cacheable Operations:**

- `shellcheck` - Shell script linting
- `markdownlint` - Markdown linting
- `grep` - Pattern searches in files
- `pre-commit` hooks - Code formatting checks
- Custom verifier rules from `rules/AC.rules`

**Cache Key:** `tool_name + file_content_hash(target_file)`

**Rationale:** Verifiers are pure functions - same file content always produces same result. Caching eliminates redundant shellcheck/lint runs when files haven't changed.

**Example:**

```bash
# First run: cache miss, runs shellcheck
shellcheck loop.sh  # → PASS (cached)

# Second run: file unchanged, cache hit
shellcheck loop.sh  # → PASS (from cache, instant)

# File modified: cache miss, runs shellcheck again
echo "new code" >> loop.sh
shellcheck loop.sh  # → FAIL (cache miss due to content change)
```

### 2. `read` Scope (Read Operations)

**Purpose:** Cache results from file system read operations.

**Cacheable Operations:**

- `cat` / file reads (keyed by path + mtime)
- `ls` / directory listings (keyed by path + mtime)
- `find` searches (keyed by directory tree hash)
- `git log` / `git show` (keyed by commit SHA)

**Cache Key:** `tool_name + path + mtime` or `tool_name + tree_hash(dir)`

**Rationale:** File reads are idempotent - same file at same mtime always returns same content. Caching eliminates redundant disk I/O for unchanged files.

**Example:**

```bash
# First run: cache miss, reads file
cat PROMPT.md  # → content (cached)

# Second run: file unchanged, cache hit
cat PROMPT.md  # → content (from cache)

# File modified: cache miss, reads fresh content
echo "new line" >> PROMPT.md
cat PROMPT.md  # → updated content (cache miss due to mtime change)
```

### 3. `llm_ro` Scope (Read-Only LLM Phases)

**Purpose:** Cache LLM responses for analysis/report phases that don't modify code.

**Cacheable Phases:**

- `REPORT` - Generate reports/summaries from logs
- `ANALYZE` - Code analysis without modifications
- `REVIEW` - Code review comments (read-only)

**Cache Key:** `model + prompt_hash + git_sha`

**Rationale:** Read-only LLM operations are expensive but deterministic given same inputs. Caching saves cost/time when re-running analysis on unchanged code.

**Important:** This scope is **opt-in only** and **never enabled for BUILD/PLAN phases**.

**Example:**

```bash
# First run: cache miss, calls LLM
rovodev analyze --phase=REPORT  # → analysis (cached)

# Second run: code unchanged, cache hit
rovodev analyze --phase=REPORT  # → analysis (from cache)

# Code changed: cache miss, calls LLM again
git commit -m "fix bug"
rovodev analyze --phase=REPORT  # → updated analysis (cache miss due to git SHA change)
```

## Phase-to-Scope Mapping

Different loop phases have different caching policies:

| Phase | Allowed Scopes | Rationale |
|-------|----------------|-----------|
| **PLAN** | `verify`, `read` | PLAN creates new tasks - cannot cache LLM (non-idempotent) |
| **BUILD** | `verify`, `read` | BUILD executes tasks, modifies files - cannot cache LLM (non-idempotent) |
| **VERIFY** | `verify`, `read` | Verification is pure idempotent checking - all scopes safe |
| **REPORT** | `verify`, `read`, `llm_ro` | Report generation is read-only analysis - all scopes safe |

### Why BUILD/PLAN Never Cache LLM

**BUILD Phase:** Executes tasks that modify code, create files, update docs. Each iteration advances state - caching would cause Ralph to skip work and report "done" without actually doing anything.

```bash
# BAD: If we cached BUILD phase LLM
Iteration 1: "Create foo.sh" → creates foo.sh (cached)
Iteration 2: "Create foo.sh" → cache hit, returns "done" → foo.sh NOT created again (wrong!)
```

**PLAN Phase:** Creates new tasks based on current state. Each planning cycle may discover new issues or change priorities - caching would freeze the plan.

```bash
# BAD: If we cached PLAN phase LLM
Iteration 1: PLAN discovers 5 tasks (cached)
Iteration 2: PLAN cache hit → returns same 5 tasks → ignores new bugs found (wrong!)
```

**Key Rule:** Only cache **read-only, idempotent operations**. Never cache operations that advance state or depend on evolving context.

## Cache Configuration

Cache behavior is controlled via environment variables, CLI flags, and config files.

### Environment Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `CACHE_MODE` | `off`, `record`, `use` | `off` | Cache behavior mode |
| `CACHE_SCOPE` | Comma-separated list | `verify,read` | Which cache types are active |

**Important:** Both variables must be **exported** for subprocesses (like `verifier.sh`) to inherit them:

```bash
export CACHE_MODE=use
export CACHE_SCOPE=verify,read
bash loop.sh
```

The loop exports these automatically. If setting manually, always use `export`.

**Verify caching works:**

```bash
bash tools/test_cache_inheritance.sh
# Expected: "✅ SUCCESS: Cache is working!" with >0 cache hits
```

**CACHE_MODE values:**

- `off` - No caching (default, safest)
- `record` - Run everything, store PASS results for future use
- `use` - Check cache first, skip on hit, record misses

**CACHE_SCOPE values:**

- `verify` - Cache verifier results (shellcheck, lint)
- `read` - Cache file reads (cat, ls)
- `llm_ro` - Cache read-only LLM phases (REPORT, ANALYZE only)

### CLI Flags

| Flag | Description |
|------|-------------|
| `--cache-mode MODE` | Set cache mode (off/record/use) |
| `--cache-scope SCOPES` | Set cache scopes (comma-separated) |
| `--force-fresh` | Bypass all caching for this run |

### Deprecated (backwards compatibility)

| Old | Maps To | Notes |
|-----|---------|-------|
| `CACHE_SKIP=1` | `CACHE_MODE=use CACHE_SCOPE=verify,read` | Logs deprecation warning |
| `--cache-skip` | `--cache-mode use` | Logs deprecation warning |
| `--force-no-cache` | `--force-fresh` | Alias, no warning |

### Config File

Location: `artifacts/rollflow_cache/config.yml`

```yaml
# Non-cacheable tools (always run fresh)
non_cacheable_tools:
  - git_push
  - deploy_script

# Maximum cache age (hours)
max_cache_age_hours: 168  # 7 days

# Cache settings
cache_settings:
  enabled: true
  check_git_sha: true  # Require git SHA match
  verbose: false
```

## Cache Key Generation

Cache keys uniquely identify tool executions:

### General Pattern

```text
cache_key = hash(tool_name + inputs + context)
```

### Scope-Specific Keys

**Verify Scope:**

```bash
# shellcheck foo.sh
cache_key = "shellcheck" + sha256(foo.sh content)
```

**Read Scope:**

```bash
# cat PROMPT.md
cache_key = "cat" + "PROMPT.md" + mtime(PROMPT.md)
```

**LLM_RO Scope:**

```bash
# rovodev analyze
cache_key = "rovodev" + model + sha256(prompt) + git_sha
```

## Cache Invalidation

Cache entries become invalid when:

1. **Input Changes:**
   - File content changes → new hash → cache miss
   - Directory tree changes → new tree hash → cache miss
   - Prompt changes → new prompt hash → cache miss

2. **Context Changes:**
   - Git SHA changes → cache miss (code evolved)
   - Config changes → cache miss (behavior may differ)

3. **Age Expiration:**
   - Entry older than `max_cache_age_hours` → treated as miss
   - Default: 7 days (prevents stale lint rules, outdated analysis)

4. **Manual Invalidation:**
   - `--force-no-cache` flag → ignores all cache
   - Delete `artifacts/rollflow_cache/cache.sqlite` → clears all entries

## Implementation Notes

### Cache Database Schema

```sql
CREATE TABLE pass_cache (
  cache_key TEXT PRIMARY KEY,
  tool_name TEXT,
  last_pass_ts TEXT,  -- ISO 8601 timestamp
  last_duration_ms INTEGER,
  meta_json TEXT  -- JSON: {git_sha, model, inputs, etc.}
);

CREATE TABLE fail_log (
  cache_key TEXT,
  tool_name TEXT,
  fail_ts TEXT,
  error_msg TEXT
);
```

### Cache Lookup Flow

```bash
# 1. Generate cache key
key = cache_key("shellcheck", "loop.sh", git_sha)

# 2. Check cache
if lookup_cache_pass(key, git_sha); then
  # Cache hit - skip execution
  log_cache_hit(key, "shellcheck")
  CACHE_HITS++
  return 0
fi

# 3. Cache miss - execute tool
log_cache_miss(key, "shellcheck")
CACHE_MISSES++
result = shellcheck loop.sh

# 4. Store PASS results
if [[ $result -eq 0 ]]; then
  upsert_pass(key, "shellcheck", duration_ms, git_sha)
fi
```

## Usage Examples

### Enable Cache for Verifiers Only

```bash
export CACHE_MODE=use
export CACHE_SCOPE="verify"
bash loop.sh --iterations 10
```

### Enable Cache with Read Operations (Recommended Default)

```bash
export CACHE_MODE=use
export CACHE_SCOPE="verify,read"
bash loop.sh
```

### Enable Cache with LLM for REPORT Phase

```bash
# Only use llm_ro for read-only phases like REPORT
export CACHE_MODE=use
export CACHE_SCOPE="verify,read,llm_ro"
bash loop.sh --phase REPORT
```

### Record Mode (Populate Cache Without Skipping)

```bash
# First run: populate cache without skipping anything
export CACHE_MODE=record
bash loop.sh --iterations 1

# Second run: use populated cache
export CACHE_MODE=use
bash loop.sh --iterations 5
```

### Force Fresh Run (Ignore Cache)

```bash
# Cache enabled but want fresh run for debugging
export CACHE_MODE=use
bash loop.sh --force-fresh
```

### CLI Flags (Alternative to Env Vars)

```bash
# Equivalent to CACHE_MODE=use CACHE_SCOPE=verify,read
bash loop.sh --cache-mode use --cache-scope verify,read --iterations 5
```

### View Cache Statistics

```bash
# After run with CACHE_MODE=use, loop.sh prints:
# Cache Statistics:
#   Hits: 42
#   Misses: 8
#   Time Saved: 18.3s (18342ms)
```

## Benefits

1. **Speed:** Skip redundant shellcheck/lint runs (saves 1-3s per file)
2. **Cost:** Skip redundant LLM calls in REPORT phase (saves $0.01-0.10 per call)
3. **Reliability:** Deterministic results for same inputs (idempotency guarantee)
4. **Safety:** Hard-blocks LLM caching for BUILD/PLAN (prevents state skipping)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Stale cache after tool updates | TTL expiration (7 days), git SHA check |
| False cache hits | Content-based keys (not iteration-based) |
| Cache poisoning | Only cache PASS results, log FAILs without caching |
| LLM cache in BUILD | Hard-block in code, log warning if attempted |

## Future Enhancements

1. **Per-Agent Cache Isolation:** Separate cache namespaces for Ralph vs Cortex
2. **Cache Warming:** Pre-populate cache with common lint results
3. **Cache Analytics:** Track hit rates, most-cached tools, time savings
4. **Distributed Cache:** Share cache across machines (Redis/S3)

## See Also

- **[loop.sh](../workers/ralph/loop.sh)** - Cache implementation
- **[common.sh](../workers/shared/common.sh)** - Cache functions (lookup_cache_pass, log_cache_hit)
- **[config.yml](../artifacts/rollflow_cache/config.yml)** - Cache configuration
- **[workers/IMPLEMENTATION_PLAN.md](../workers/IMPLEMENTATION_PLAN.md)** - Phase 1 implementation plan
