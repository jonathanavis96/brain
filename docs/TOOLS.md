# Brain Tools Reference

Quick reference for all CLI tools in the Brain repository. **Use these instead of manual grep/sed for common tasks.**

## Quick Lookup

| Task | Command | Notes |
|------|---------|-------|
| Search THUNK + git | `bin/brain-search "keyword"` | Fast grep across sources |
| Export THUNK to SQLite | `bin/thunk-parse --format sqlite -o thunk.db` | For complex queries |
| Get THUNK stats | `bin/thunk-parse --stats` | Entry counts, priority breakdown |
| Ralph performance | `bin/ralph-stats --since 4h` | Tool calls, durations |
| Suggest knowledge gaps | `bin/gap-radar --dry-run` | From verifier errors |
| Emit event marker | `bin/brain-event --event iteration_start --iter 5` | For observability |
| Analyze logs | `python3 -m tools.rollflow_analyze --log-dir DIR` | Detailed metrics |

---

## CLI Tools (`bin/`)

### `bin/brain-search` - Quick Multi-Source Search

Search across THUNK.md, git history, and cache database.

```bash
# Search all sources (THUNK + git)
bin/brain-search "shellcheck"

# THUNK only
bin/brain-search --thunk-only "SC2034"

# Git history only
bin/brain-search --git-only "verifier"

# Include cache database
bin/brain-search --all "markdown"

# Limit results
bin/brain-search --limit 5 "cache"
```

**Use for:** Quick lookups, finding if something was done before, pattern discovery.

**Token savings:** Use this instead of `grep + git log` separately.

---

### `bin/thunk-parse` - THUNK.md Parser & Exporter

Extract structured data from THUNK.md markdown tables.

```bash
# Show statistics (fast overview)
bin/thunk-parse --stats

# Export to JSON (stdout)
bin/thunk-parse --format json workers/ralph/THUNK.md

# Export to JSON file
bin/thunk-parse --format json -o thunk.json

# Export to SQLite (enables complex queries)
bin/thunk-parse --format sqlite -o thunk.db
```

**Output formats:**

- **JSON:** Array of entries with `thunk_num`, `original_id`, `priority`, `description`, `completed`, `era`
- **SQLite:** Table with same fields, enables SQL queries

**Use for:** Statistics, bulk analysis, complex queries against history.

**Token savings:** Use `--stats` instead of opening THUNK.md to count entries.

---

### `bin/ralph-stats` - Ralph Performance Statistics

Quick performance metrics from Ralph loop and RovoDev logs.

```bash
# Last 24 hours (default)
bin/ralph-stats

# Last 4 hours
bin/ralph-stats --since 4h

# Full markdown report
bin/ralph-stats --full
```

**Shows:** Tool call counts, durations, cache hit rates, iteration success.

**Use for:** Performance monitoring, identifying slow operations.

---

### `bin/gap-radar` - Knowledge Gap Suggester

Analyze errors and suggest entries for GAP_BACKLOG.md.

```bash
# Analyze verifier output (default, dry-run)
bin/gap-radar --dry-run

# Analyze specific log file
bin/gap-radar --from-log path/to/log.txt

# Auto-append to GAP_BACKLOG.md
bin/gap-radar --append
```

**Use for:** Discovering undocumented patterns from recurring errors.

---

### `bin/brain-event` - Event Marker Emitter

Emit structured events to `state/events.jsonl` for observability.

```bash
# Iteration markers
bin/brain-event --event iteration_start --iter 5 --phase BUILD
bin/brain-event --event iteration_end --iter 5 --status ok

# Error events
bin/brain-event --event error --msg "Verifier failed" --code 1
```

**Use for:** Observability pipelines, log correlation.

---

## Python Tools (`tools/`)

### `tools/rollflow_analyze` - Log Analyzer

Detailed analysis of Ralph loop logs and RovoDev tool calls.

```bash
# Basic analysis
python3 -m tools.rollflow_analyze --log-dir workers/ralph/logs/

# With RovoDev logs
python3 -m tools.rollflow_analyze --log-dir workers/ralph/logs/ --rovodev-logs ~/.rovodev/logs/

# Generate markdown report
python3 -m tools.rollflow_analyze --log-dir workers/ralph/logs/ --markdown

# Generate review pack
python3 -m tools.rollflow_analyze --log-dir workers/ralph/logs/ --review-pack

# Only recent logs
python3 -m tools.rollflow_analyze --log-dir workers/ralph/logs/ --since 24h
```

**Parsers available:**

- `marker` - Parse `:::MARKER:::` format
- `heuristic` - Regex patterns for unstructured logs
- `auto` - Try marker first, fall back to heuristic

**Output:** JSON report + optional markdown summary in `artifacts/analysis/`.

---

### `tools/gap_radar/` - Gap Detection Suite

Components for detecting knowledge gaps from errors.

| Script | Purpose |
|--------|---------|
| `extract_errors.sh` | Extract errors from verifier output |
| `extract_from_logs.sh` | Extract errors from log files |
| `match_skills.py` | Match errors to existing skills |
| `suggest_gaps.sh` | Generate GAP_BACKLOG suggestions |
| `coverage_report.py` | Report skill coverage |

**Usually accessed via:** `bin/gap-radar` wrapper.

---

## Validation Tools (`tools/validate_*.sh`)

Pre-commit hooks and CI validators.

| Tool | Purpose | Runs In |
|------|---------|---------|
| `validate_links.sh` | Check markdown links exist | pre-commit |
| `validate_examples.py` | Validate code examples in docs | pre-commit |
| `validate_doc_sync.sh` | Check doc/code sync | pre-commit |
| `validate_protected_hashes.sh` | Verify protected file hashes | pre-commit |

**Note:** These run automatically via pre-commit. Manual runs for debugging only.

---

## Test Tools (`tools/test_*.sh`)

Cache and plan testing utilities.

| Tool | Purpose |
|------|---------|
| `test_cache_smoke.sh` | Basic cache functionality test |
| `test_cache_guard_marker.sh` | Test cache guard markers |
| `test_cache_inheritance.sh` | Test cache inheritance |
| `test_plan_cleanup.sh` | Test plan cleanup script |

---

## Schema Files

### `tools/thread_storage_schema.sql`

SQLite schema for unified thread storage with FTS5 full-text search.

**Tables:**

- `threads` - Run/era records
- `work_items` - Tasks from THUNK.md
- `tool_executions` - Tool call records

**Usage:**

```bash
# Create database with schema
sqlite3 threads.db < tools/thread_storage_schema.sql

# Populate from THUNK
bin/thunk-parse --format sqlite -o threads.db
```

---

## Token Efficiency Tips

### Instead of opening large files

| Bad (high tokens) | Good (low tokens) |
|-------------------|-------------------|
| `open_files workers/ralph/THUNK.md` | `bin/thunk-parse --stats` |
| `grep "pattern" THUNK.md` | `bin/brain-search "pattern"` |
| Manual `git log \| grep` | `bin/brain-search --git-only "pattern"` |
| Read whole IMPL_PLAN | `grep -n "^- \[ \]" workers/IMPLEMENTATION_PLAN.md \| head -10` |

### For THUNK operations

| Task | Command |
|------|---------|
| Check if task done | `bin/brain-search --thunk-only "11.1.3"` |
| Get last THUNK # | `tail -5 workers/ralph/THUNK.md` then grep for `^\|` |
| Count completions | `bin/thunk-parse --stats` |
| Find similar work | `bin/brain-search "keyword"` |

---

## See Also

- [skills/domains/ralph/thread-search-patterns.md](../skills/domains/ralph/thread-search-patterns.md) - Detailed search patterns
- [docs/CACHE_DESIGN.md](CACHE_DESIGN.md) - Cache system design
- [docs/events.md](events.md) - Event marker format
- [tools/gap_radar/README.md](../tools/gap_radar/README.md) - Gap radar details
- [tools/rollflow_analyze/README.md](../tools/rollflow_analyze/README.md) - Log analyzer details

---

**Last Updated:** 2026-01-26
