# Brain Tools Reference

Quick reference for all CLI tools in the Brain repository. **Use these instead of manual grep/sed for common tasks.**

## Regeneration Procedure

**To keep this document in sync with actual tools:**

1. Run the validator to check for drift:

   ```bash
   bash tools/validate_tool_inventory.sh
   ```

2. If the validator reports missing tools:
   - Add documentation for each missing tool in the appropriate section below
   - Follow the existing format (### `path/to/tool` - Purpose)
   - Include: Purpose, Usage examples, Output description, Prerequisites

3. Re-run validator to confirm all tools are documented

**Note:** The validator checks `bin/`, `tools/`, and `workers/ralph/` for executables and scripts.

## Quick Lookup

| Task | Command | Notes |
|------|---------|-------|
| Search THUNK + git | `bin/brain-search "keyword"` | Fast grep across sources |
| Export THUNK to SQLite | `bin/thunk-parse --format sqlite -o thunk.db` | For complex queries |
| Get THUNK stats | `bin/thunk-parse --stats` | Entry counts, priority breakdown |
| Ralph performance | `bin/ralph-stats --since 4h` | Tool calls, durations |
| Ralph log summary | `bin/ralph-summary` | Clean summary from logs |
| Suggest knowledge gaps | `bin/gap-radar --dry-run` | From verifier errors |
| Emit event marker | `bin/brain-event --event iteration_start --iter 5` | For observability |
| Analyze logs | `python3 -m tools.rollflow_analyze --log-dir DIR` | Detailed metrics |
| Dedup THUNK entries | `bash tools/thunk_dedup.sh --dry-run` | Remove duplicates |
| Check stale skills | `bash tools/skill_freshness.sh` | Flag skills >90 days old |
| Generate skill graph | `bash tools/skill_graph/skill_graph.sh` | DOT dependency graph |
| View dashboard | `open artifacts/dashboard.html` | Metrics dashboard |
| Quiz yourself | `bash tools/skill_quiz/quiz.sh` | Test knowledge retention |

---

## CLI Tools (`bin/`)

### `bin/brain-search` - Quick Multi-Source Search

Search across workers/ralph/THUNK.md, git history, and cache database.

**Purpose:** Fast multi-source search for task history and code changes.

**Usage:**

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

**Output:** Formatted results from THUNK entries, git commits, and optionally cache DB.

**Prerequisites:** None (uses grep and git).

**Token savings:** Use this instead of `grep + git log` separately.

---

### `bin/thunk-parse` - workers/ralph/THUNK.md Parser & Exporter

Extract structured data from workers/ralph/THUNK.md markdown tables.

**Purpose:** Parse workers/ralph/THUNK.md into structured formats for analysis and querying.

**Usage:**

```bash
# Show statistics (fast overview)
bin/thunk-parse --stats

# Export to JSON (stdout)
bin/thunk-parse --format json workers/ralph/workers/ralph/THUNK.md

# Export to JSON file
bin/thunk-parse --format json -o thunk.json

# Export to SQLite (enables complex queries)
bin/thunk-parse --format sqlite -o thunk.db
```

**Output:** JSON array or SQLite database with fields: `thunk_num`, `original_id`, `priority`, `description`, `completed`, `era`.

**Prerequisites:** Python 3, SQLite (for database export).

**Token savings:** Use `--stats` instead of opening workers/ralph/THUNK.md to count entries.

---

### `bin/ralph-stats` - Ralph Performance Statistics

Quick performance metrics from Ralph loop and RovoDev logs.

**Purpose:** Analyze Ralph loop performance metrics for optimization.

**Usage:**

```bash
# Last 24 hours (default)
bin/ralph-stats

# Last 4 hours
bin/ralph-stats --since 4h

# Full markdown report
bin/ralph-stats --full
```

**Output:** Summary showing tool call counts, durations, cache hit rates, iteration success printed to stdout.

**Prerequisites:** Access to `workers/ralph/logs/` directory.

**Use for:** Performance monitoring, identifying slow operations.

---

### `bin/gap-radar` - Knowledge Gap Suggester

Analyze errors and suggest entries for skills/self-improvement/GAP_BACKLOG.md.

**Purpose:** Discover missing skills from error patterns and verifier failures.

**Usage:**

```bash
# Analyze verifier output (default, dry-run)
bin/gap-radar --dry-run

# Analyze specific log file
bin/gap-radar --from-log path/to/log.txt

# Auto-append to skills/self-improvement/GAP_BACKLOG.md
bin/gap-radar --append
```

**Output:** Gap suggestions printed to stdout, optionally appended to `skills/self-improvement/skills/self-improvement/GAP_BACKLOG.md`.

**Prerequisites:** Python 3, `tools/gap_radar/patterns.yaml` for error matching.

**Use for:** Discovering undocumented patterns from recurring errors.

---

### `bin/brain-event` - Event Marker Emitter

Emit structured events to `state/events.jsonl` for observability.

**Purpose:** Provider-neutral event logging for Ralph loop monitoring and debugging.

**Usage:**

```bash
# Iteration markers
bin/brain-event --event iteration_start --iter 5 --phase BUILD
bin/brain-event --event iteration_end --iter 5 --status ok

# Error events
bin/brain-event --event error --msg "Verifier failed" --code 1

# Watch mode
bin/brain-event --watch --filter "error"
```

**Output:** JSON lines appended to `state/events.jsonl`.

**Prerequisites:** Bash 4+, jq (for watch mode filtering).

**Use for:** Observability pipelines, log correlation.

---

### `bin/ralph-summary` - Log Summary Extractor

Extract clean task completion summaries from Ralph logs, stripping terminal noise (ANSI codes, streaming artifacts, spinner lines).

**Purpose:** Extract human-readable summaries from Ralph logs without terminal artifacts.

**Usage:**

```bash
# Latest log summary
bin/ralph-summary

# Last N logs
bin/ralph-summary --recent 3

# All logs from today
bin/ralph-summary --all

# List available logs
bin/ralph-summary --list
```

**Output:** Clean summary block (before `:::BUILD_READY:::` or `:::PLAN_READY:::` markers) printed to stdout.

**Prerequisites:** Access to `workers/ralph/logs/` directory.

---

### `bin/discord-post` - Discord Webhook Poster

Post messages to Discord webhooks for notifications and observability.

**Purpose:** Send formatted messages to Discord channels via webhooks. Used for agent notifications, build status, and event tracking. Automatically chunks long messages at newline boundaries.

**Usage:**

```bash
# Post a simple message
echo "Build completed successfully" | bin/discord-post

# Post from file
bin/discord-post --file /path/to/message.txt

# Dry run (preview without sending)
echo "Test message" | bin/discord-post --dry-run

# Custom max length
echo "Long message..." | bin/discord-post --max-length 1500
```

**Output:** HTTP response from Discord API (200 OK on success). Non-blocking: exits 0 even if webhook fails or is missing.

**Prerequisites:** `curl`, `DISCORD_WEBHOOK_URL` environment variable (unless `--dry-run`).

**See also:** [skills/domains/infrastructure/discord-webhook-patterns.md](../skills/domains/infrastructure/discord-webhook-patterns.md)

**Token savings:** Use this instead of opening raw log files and manually filtering noise.

---

## Python Tools (`tools/`)

### `tools/thunk_parser.py` - workers/ralph/THUNK.md Parser

Extract structured data from workers/ralph/THUNK.md markdown tables.

**Purpose:** Parse workers/ralph/THUNK.md and export to JSON or SQLite for complex queries. Provides statistics on task completion.

**Usage:**

```bash
# Parse and display stats
python3 tools/thunk_parser.py workers/ralph/workers/ralph/THUNK.md --stats

# Export to JSON
python3 tools/thunk_parser.py workers/ralph/workers/ralph/THUNK.md --format json --output thunk.json

# Export to SQLite
python3 tools/thunk_parser.py workers/ralph/workers/ralph/THUNK.md --format sqlite --output thunk.db
```

**Output:** JSON array or SQLite database with fields: `thunk_num`, `original_id`, `priority`, `description`, `completed`, `era`.

**Prerequisites:** Python 3, SQLite3 (for database export).

**Note:** This is the underlying library for `bin/thunk-parse` wrapper.

---

### `tools/rollflow_analyze` - Log Analyzer

Detailed analysis of Ralph loop logs and RovoDev tool calls.

**Purpose:** Extract structured metrics from Ralph loop execution logs for performance analysis.

**Usage:**

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

**Output:** JSON report + optional markdown summary in `artifacts/analysis/`.

**Prerequisites:** Python 3, PyYAML (for config parsing).

**Parsers:** `marker` (structured), `heuristic` (regex fallback), `auto` (tries both).

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

### `tools/thunk_dedup.sh` - THUNK Deduplication

Remove duplicate entries from workers/ralph/THUNK.md (one-time cleanup utility).

**Purpose:** Remove duplicate THUNK entries while preserving first occurrence.

**Usage:**

```bash
# Preview what would be removed
bash tools/thunk_dedup.sh --dry-run

# Remove duplicates (idempotent)
bash tools/thunk_dedup.sh
```

**Output:** Updates `workers/ralph/workers/ralph/THUNK.md` in-place, prints statistics to stdout.

**Prerequisites:** Bash, standard Unix tools (awk, sort).

---

### `tools/skill_freshness.sh` - Skill Age Checker

List skills with age and flag stale ones (default: >90 days).

**Purpose:** Identify outdated skills that may need review or updates.

**Usage:**

```bash
# List all skills with age
bash tools/skill_freshness.sh

# Custom threshold
bash tools/skill_freshness.sh --days 60

# Exit non-zero if stale skills found (for CI)
bash tools/skill_freshness.sh --exit-on-stale
```

**Output:** List of skills with last modification date, flags stale entries.

**Prerequisites:** Git (uses `git log` to determine file age).

---

### `tools/brain_dashboard/` - Metrics Dashboard

Generate HTML dashboard with brain repository metrics.

**Purpose:** Visualize brain repository health metrics (skills, tasks, coverage).

**Usage:**

```bash
# Collect metrics and generate dashboard
bash tools/brain_dashboard/collect_metrics.sh
python3 tools/brain_dashboard/generate_dashboard.py
```

**Output:** `artifacts/dashboard.html` (open in browser), `artifacts/brain_metrics.json`.

**Prerequisites:** Python 3, Bash, write access to `artifacts/` directory.

---

### `tools/skill_graph/` - Skill Dependency Graph

Generate DOT graph of skill dependencies and cross-references.

**Purpose:** Visualize relationships between skill documents.

**Usage:**

```bash
# Generate graph to stdout
bash tools/skill_graph/skill_graph.sh

# Output to file
bash tools/skill_graph/skill_graph.sh --output skills.dot

# Render with Graphviz (if installed)
bash tools/skill_graph/skill_graph.sh | dot -Tpng -o skills.png
```

**Output:** DOT format graph printed to stdout or file.

**Prerequisites:** Python 3, Graphviz (optional, for rendering).

**Components:** `extract_links.py` (parse refs), `generate_graph.py` (DOT output).

---

### `tools/pattern_miner/` - Commit Pattern Discovery

Discover recurring patterns in sibling project git logs to identify potential new skills.

**Purpose:** Mine commit messages from other projects to discover skill gaps.

**Usage:**

```bash
# Analyze commits from ~/code/ projects
bash tools/pattern_miner/mine_patterns.sh

# Run analyzer directly
python3 tools/pattern_miner/analyze_commits.py
```

**Output:** Suggested patterns printed to stdout, identifies common fixes/changes.

**Prerequisites:** Python 3, Git, access to sibling repositories in `~/code/`.

**Use case:** Find gaps in brain's skills by analyzing what you repeatedly fix in other projects.

---

### `tools/skill_quiz/` - Interactive Knowledge Quiz

Terminal-based quiz for testing knowledge retention from skill docs.

**Purpose:** Test knowledge retention through interactive scenarios from skill documents.

**Usage:**

```bash
# Start quiz with random skill
bash tools/skill_quiz/quiz.sh

# Quiz specific skill
bash tools/skill_quiz/quiz.sh skills/domains/shell/variable-patterns.md
```

**Output:** Interactive terminal prompts with scenarios and solutions.

**Prerequisites:** Bash, Python 3 (for `extract_scenarios.py`).

**Format:** Presents scenarios, waits for your answer, reveals solution.

---

## Validation Tools (`tools/validate_*.sh`)

### `tools/validate_examples.py` - Code Example Validator

Validate code examples in markdown documentation.

**Purpose:** Lint code blocks in markdown files for syntax errors, undefined variables, and missing imports.

**Usage:**

```bash
# Validate all skills
python3 tools/validate_examples.py skills/**/*.md

# Validate specific file
python3 tools/validate_examples.py skills/domains/python/python-patterns.md

# Used by pre-commit hook
pre-commit run validate-examples --all-files
```

**Checks:**

- Python: syntax errors, undefined variables, missing imports
- JavaScript/TypeScript: syntax errors, undefined variables  
- Shell: shellcheck validation

**Output:** List of validation errors with line numbers and descriptions. Exits 0 if all examples are valid.

**Prerequisites:** Python 3, shellcheck (for shell example validation).

---

Pre-commit hooks and CI validators.

| Tool | Purpose | Output | Prerequisites |
|------|---------|--------|---------------|
| `validate_links.sh` | Check markdown links exist | Exit 0/1, prints broken links | Bash, grep |
| `validate_examples.py` | Validate code examples in docs | Exit 0/1, prints errors | Python 3 |
| `validate_doc_sync.sh` | Check doc/code sync | Exit 0/1, prints mismatches | Bash, diff |
| `validate_protected_hashes.sh` | Verify protected file hashes | Exit 0/1, prints hash failures | Bash, sha256sum |

**Note:** These run automatically via pre-commit. Manual runs for debugging only.

---

## Test Tools (`tools/test_*.sh`)

Cache and plan testing utilities.

| Tool | Purpose | Output | Prerequisites |
|------|---------|--------|---------------|
| `test_cache_smoke.sh` | Basic cache functionality test | Exit 0/1, test results | Bash |
| `test_cache_guard_marker.sh` | Test cache guard markers | Exit 0/1, test results | Bash |
| `test_cache_inheritance.sh` | Test cache inheritance | Exit 0/1, test results | Bash |
| `test_plan_cleanup.sh` | Test plan cleanup script | Exit 0/1, test results | Bash |
| `test_plan_only_guard.sh` | Test PLAN-ONLY mode guardrails | Exit 0/1, 15 test cases | Bash |

**Usage:** Run directly (e.g., `bash tools/test_cache_smoke.sh`). Exit 0 = pass, exit 1 = fail.

---

## Worker Scripts (`workers/ralph/`)

Key scripts that humans and agents run to operate the Ralph loop.

### `workers/ralph/loop.sh` - Ralph Loop Controller

Main loop controller that runs PLAN/BUILD cycles.

**Purpose:** Execute Ralph loop iterations with PLAN/BUILD cycle management.

**Usage:**

```bash
# Single iteration
bash workers/ralph/loop.sh

# Multiple iterations
bash workers/ralph/loop.sh --iterations 10

# Preview changes without committing
bash workers/ralph/loop.sh --dry-run

# Undo last N commits
bash workers/ralph/loop.sh --rollback 2

# Resume from interruption
bash workers/ralph/loop.sh --resume
```

**Output:** Executes agent, commits changes, prints `:::COMPLETE:::` when all tasks done.

**Prerequisites:** RovoDev CLI (`acli rovodev`), Git, verifier.sh, PROMPT.md.

**Mode:** Iteration 1 or every 3rd = PLAN, others = BUILD.

---

### `workers/ralph/current_ralph_tasks.sh` - Task Monitor

Real-time display of pending tasks from workers/IMPLEMENTATION_PLAN.md.

**Purpose:** Monitor pending tasks from workers/workers/IMPLEMENTATION_PLAN.md in real-time.

**Usage:**

```bash
# Interactive monitor with hotkeys
bash workers/ralph/current_ralph_tasks.sh

# One-shot display
bash workers/ralph/current_ralph_tasks.sh --once
```

**Output:** Terminal display with pending tasks grouped by phase, updates on file change.

**Prerequisites:** Bash, access to `workers/workers/IMPLEMENTATION_PLAN.md`.

---

### `workers/ralph/thunk_ralph_tasks.sh` - Completion Log Monitor

Display completed task log from workers/ralph/THUNK.md.

**Purpose:** View completed tasks from workers/ralph/THUNK.md grouped by era.

**Usage:**

```bash
# Interactive monitor
bash workers/ralph/thunk_ralph_tasks.sh

# One-shot display
bash workers/ralph/thunk_ralph_tasks.sh --once
```

**Output:** Terminal display of completed tasks with timestamps and descriptions.

**Prerequisites:** Bash, access to `workers/ralph/workers/ralph/THUNK.md`.

---

### `workers/ralph/verifier.sh` - Acceptance Criteria Checker

Runs all acceptance criteria checks from `rules/AC.rules`.

**Purpose:** Validate all acceptance criteria before continuing Ralph loop.

**Usage:**

```bash
# Run all checks
bash workers/ralph/verifier.sh

# Quick check (skip slow tests)
bash workers/ralph/verifier.sh --quick
```

**Output:** `.verify/latest.txt` with PASS/FAIL/WARN results (injected into agent prompt header).

**Prerequisites:** Bash, shellcheck, markdownlint, protected file hashes.

---

### `workers/ralph/fix-markdown.sh` - Markdown Auto-Fixer

Auto-fixes common markdown lint issues before BUILD iterations.

**Purpose:** Auto-fix ~40-60% of common markdown issues before verifier runs.

**Usage:**

```bash
# Fix all markdown files
bash workers/ralph/fix-markdown.sh

# Dry-run mode
bash workers/ralph/fix-markdown.sh --dry-run
```

**Output:** Modifies markdown files in-place, prints fixed issues to stdout.

**Prerequisites:** Bash, sed, grep.

**Fixes:** Missing blank lines, code fence language tags, list formatting.

---

### `workers/ralph/render_ac_status.sh` - AC Status Renderer

Render acceptance criteria status as markdown report.

**Purpose:** Generate human-readable verifier status from `.verify/latest.txt`.

**Usage:**

```bash
# Render latest verifier results
bash workers/ralph/render_ac_status.sh
```

**Output:** Formatted summary printed to stdout showing PASS/FAIL/WARN counts and details.

**Prerequisites:** Bash, access to `../.verify/latest.txt`.

---

### `workers/ralph/sync_workers_plan_to_cortex.sh` - Plan Sync

Sync workers/workers/IMPLEMENTATION_PLAN.md to workers/workers/IMPLEMENTATION_PLAN.md.

**Purpose:** Propagate Ralph's plan updates to Cortex manager layer.

**Usage:**

```bash
# Sync plan to cortex
bash workers/ralph/sync_workers_plan_to_cortex.sh
```

**Output:** Copies `workers/workers/IMPLEMENTATION_PLAN.md` to `workers/workers/IMPLEMENTATION_PLAN.md`.

**Prerequisites:** Bash, write access to `cortex/` directory.

---

### `workers/ralph/init_verifier_baselines.sh` - Verifier Baseline Init

Initialize verifier baseline hashes for protected files.

**Purpose:** Generate baseline SHA256 hashes for protected files (PROMPT.md, verifier.sh, etc.).

**Usage:**

```bash
# Initialize all baselines
bash workers/ralph/init_verifier_baselines.sh
```

**Output:** Creates/updates `.verify/*.sha256` hash files.

**Prerequisites:** Bash, sha256sum.

**Use case:** First-time setup or regenerating hashes after approved changes.

---

### `workers/ralph/cleanup_plan.sh` - Plan Cleanup

Archive completed plan sections and reset for new work.

**Purpose:** Archive completed sections from workers/IMPLEMENTATION_PLAN.md.

**Usage:**

```bash
# Clean up completed tasks
bash workers/ralph/cleanup_plan.sh
```

**Use case:** Periodic maintenance to prevent workers/IMPLEMENTATION_PLAN.md from growing too large.

---

### `scripts/new-project.sh` - Project Bootstrapper

Bootstrap a new project from templates.

```bash
# Create new project
bash scripts/new-project.sh my-project

# Specify template
bash scripts/new-project.sh my-project --template python
```

**Templates:** python, go, javascript, website, backend, ralph.

---

### `workers/ralph/pr-batch.sh` - PR Batch Creator

Create pull requests for batched commits.

```bash
# Create PR for last N commits
bash workers/ralph/pr-batch.sh --commits 5

# Interactive mode
bash workers/ralph/pr-batch.sh
```

---

### `workers/ralph/update_thunk_from_plan.sh` - THUNK Sync

Sync completed tasks from workers/IMPLEMENTATION_PLAN.md to workers/ralph/THUNK.md (utility for recovery).

```bash
# Sync completed tasks
bash workers/ralph/update_thunk_from_plan.sh
```

**Use case:** Recovery when workers/ralph/THUNK.md and workers/IMPLEMENTATION_PLAN.md get out of sync.

---

## Schema Files

### `tools/thread_storage_schema.sql`

SQLite schema for unified thread storage with FTS5 full-text search.

**Tables:**

- `threads` - Run/era records
- `work_items` - Tasks from workers/ralph/THUNK.md
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
| `open_files workers/ralph/workers/ralph/THUNK.md` | `bin/thunk-parse --stats` |
| `grep "pattern" workers/ralph/THUNK.md` | `bin/brain-search "pattern"` |
| Manual `git log \| grep` | `bin/brain-search --git-only "pattern"` |
| Read whole IMPL_PLAN | `grep -n "^- \[ \]" workers/workers/IMPLEMENTATION_PLAN.md \| head -10` |

### For THUNK operations

| Task | Command |
|------|---------|
| Check if task done | `bin/brain-search --thunk-only "11.1.3"` |
| Get last THUNK # | `tail -5 workers/ralph/workers/ralph/THUNK.md` then grep for `^\|` |
| Count completions | `bin/thunk-parse --stats` |
| Find similar work | `bin/brain-search "keyword"` |

---

## Validation Tools

### `tools/check_startup_rules.sh`

Tripwire script to verify Ralph follows token efficiency rules after each run.

```bash
tools/check_startup_rules.sh                    # Check latest log
tools/check_startup_rules.sh path/to/log.log   # Check specific log
```

Checks: no forbidden file opens at startup, no THUNK lookups via open_files, no full IMPL_PLAN reads, no grep explosions, first tool call is cheap.

---

### `tools/test_cache_smoke.sh`

Smoke-test the cache subsystem.

```bash
bash tools/test_cache_smoke.sh
```

---

### `tools/test_cache_guard_marker.sh`

Verify cache guard marker enforcement.

```bash
bash tools/test_cache_guard_marker.sh
```

---

### `tools/test_cache_inheritance.sh`

Verify cache inheritance behavior.

```bash
bash tools/test_cache_inheritance.sh
```

---

### `tools/test_plan_cleanup.sh`

Test plan cleanup behaviors.

```bash
bash tools/test_plan_cleanup.sh
```

---

### `tools/test_plan_only_guard.sh`

Test PLAN-ONLY mode guardrails.

```bash
bash tools/test_plan_only_guard.sh
```

---

### `tools/thunk_dedup.sh`

Deduplicate THUNK entries.

```bash
bash tools/thunk_dedup.sh --help
```

---

### `tools/validate_links.sh`

Validate that markdown links resolve.

```bash
bash tools/validate_links.sh
```

---

### `tools/validate_doc_sync.sh`

Validate that documentation and code stay in sync.

```bash
bash tools/validate_doc_sync.sh
```

---

### `tools/validate_protected_hashes.sh`

Verify protected-file hash baselines.

```bash
bash tools/validate_protected_hashes.sh
```

---

### `tools/validate_tool_inventory.sh`

Ensure `docs/TOOLS.md` documents all tools.

```bash
bash tools/validate_tool_inventory.sh
```

---

## Adding New Tools

**Rule:** All new CLI tools in `bin/` or utility scripts in `tools/` MUST be documented in this file.

**Checklist for new tools:**

1. Add entry to **Quick Lookup** table (if commonly used)
2. Add full section under appropriate category (`bin/` CLI Tools or `tools/` Python Tools)
3. Include: usage examples, purpose, and token savings (if applicable)
4. Update **Last Updated** date at bottom of file

**Why:** This file is the single source of truth for available tooling. Undocumented tools are invisible to agents and humans alike.

---

## See Also

- **[skills/domains/ralph/thread-search-patterns.md](../skills/domains/ralph/thread-search-patterns.md)** - Detailed search patterns
- **[skills/domains/ralph/cache-debugging.md](../skills/domains/ralph/cache-debugging.md)** - Cache debugging guide
- **[workers/ralph/AGENTS.md](../workers/ralph/AGENTS.md)** - Ralph operational guide
- **[skills/SUMMARY.md](../skills/SUMMARY.md)** - Skills knowledge base overview
- **[NEURONS.md](../NEURONS.md)** - Repository structure map
- **[CACHE_DESIGN.md](CACHE_DESIGN.md)** - Cache system design
- **[events.md](events.md)** - Event marker format
- **[tools/gap_radar/README.md](../tools/gap_radar/README.md)** - Gap radar details
- **[tools/rollflow_analyze/README.md](../tools/rollflow_analyze/README.md)** - Log analyzer details

---

**Last Updated:** 2026-01-28
