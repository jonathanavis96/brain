# Gap Radar - Automated Gap Discovery

## Overview

Gap Radar automatically detects missing skills by analyzing errors and failures across Ralph runs. It extracts error codes from verifier output and Ralph logs, matches them against existing skills coverage, and suggests new entries for `skills/self-improvement/GAP_BACKLOG.md`.

## Purpose

- **Turn every failure into a learning opportunity** - Captures undocumented error patterns
- **Automate gap detection** - Reduces manual gap capture burden on agents
- **Track skills coverage** - Identifies which error codes lack documentation
- **Improve over time** - Each iteration improves the brain's knowledge base

## Components

### 1. Error Extraction

**`extract_errors.sh`** - Parse verifier output for failures and warnings

```bash
# Extract from verifier output (default: .verify/latest.txt)
bash extract_errors.sh

# Extract from specific verifier file
bash extract_errors.sh /path/to/verifier_output.txt
```

Output: JSON array of error objects

```json
[
  {
    "status": "FAIL",
    "rule_id": "Hygiene.Shellcheck.2",
    "error_code": "SC2155",
    "file": "loop.sh",
    "line": 480,
    "message": "SC2155 in loop.sh line 480"
  }
]
```

**`extract_from_logs.sh`** - Parse Ralph iteration logs for common failure patterns

```bash
# Extract from log file
bash extract_from_logs.sh workers/ralph/logs/iter1_build.log

# Extract from all logs in directory
bash extract_from_logs.sh workers/ralph/logs/
```

Output: Same JSON format as `extract_errors.sh`

Detects:

- Python tracebacks (ImportError, AttributeError, TypeError, etc.)
- Shell errors (command not found, permission denied, syntax errors)
- Lint failures (shellcheck, markdownlint, pylint)
- Git errors (merge conflicts, push rejected)
- Network errors (connection refused, timeout)

### 2. Skills Coverage Matching

**`patterns.yaml`** - Error pattern definitions

Defines regex patterns for common error types across categories:

- Shell (ShellCheck SC codes)
- Markdown (Markdownlint MD codes)
- Python (tracebacks, import errors)
- Git (merge conflicts, authentication)
- Network (connection errors, timeouts)
- Permissions (access denied, read-only)
- Tool execution (timeouts, crashes)

**`match_skills.py`** - Match errors to skills coverage

```bash
# Match errors from verifier
bash extract_errors.sh | python3 match_skills.py /dev/stdin

# Match errors from log file
bash extract_from_logs.sh logs/iter1.log > errors.json
python3 match_skills.py errors.json
```

Output: JSON with coverage information

```json
[
  {
    "status": "FAIL",
    "rule_id": "Hygiene.Shellcheck.2",
    "error_code": "SC2155",
    "file": "loop.sh",
    "line": 480,
    "message": "SC2155 in loop.sh line 480",
    "covered": true,
    "skill": "domains/languages/shell/variable-patterns.md"
  }
]
```

### 3. Coverage Reporting

**`coverage_report.py`** - Generate coverage summary

```bash
# From verifier output
bash extract_errors.sh | python3 match_skills.py /dev/stdin | python3 coverage_report.py /dev/stdin

# From log file
bash extract_from_logs.sh logs/iter1.log | python3 match_skills.py /dev/stdin | python3 coverage_report.py /dev/stdin

# Save to file
bash extract_errors.sh | python3 match_skills.py /dev/stdin | python3 coverage_report.py /dev/stdin > coverage.txt
```

Output: Markdown summary table

```text
# Skills Coverage Report

Total errors analyzed: 15
Covered by skills: 12 (80.0%)
Uncovered (gaps): 3 (20.0%)

## Top Uncovered Error Codes

| Error Code | Count | Files |
|------------|-------|-------|
| SC2320 | 2 | loop.sh, verifier.sh |
| MD060 | 1 | README.md |

## Coverage by Category

| Category | Covered | Uncovered | Coverage % |
|----------|---------|-----------|------------|
| Shell | 8 | 2 | 80.0% |
| Markdown | 4 | 1 | 80.0% |
```

### 4. Gap Suggestions

**`suggest_gaps.sh`** - Suggest new GAP_BACKLOG entries

```bash
# Dry-run mode (preview suggestions without modifying files)
bash suggest_gaps.sh --dry-run

# Extract from verifier output
bash suggest_gaps.sh --source verifier --dry-run

# Extract from log file
bash suggest_gaps.sh --source log workers/ralph/logs/iter1_build.log --dry-run

# Auto-append mode (add to GAP_BACKLOG.md)
bash suggest_gaps.sh --auto-append

# From specific log file
bash suggest_gaps.sh --source log workers/ralph/logs/iter1_build.log --auto-append
```

Output format (dry-run):

```markdown
### [2026-01-25] Missing skill for SC2320

**Error Code:** SC2320  
**Category:** Shell  
**Files:** loop.sh, verifier.sh  
**Context:** Shell script validation  

**Gap:** No existing skill covers SC2320 (parameter expansion errors)

**Suggested Action:** Create/update skill in `domains/languages/shell/` to document SC2320 patterns and fixes
```

**De-duplication:** Automatically checks `skills/self-improvement/GAP_BACKLOG.md` for existing entries with same error code to avoid duplicates.

## Typical Workflows

### After a Ralph iteration (manual)

```bash
cd /path/to/brain

# 1. Extract and analyze errors
bash tools/gap_radar/suggest_gaps.sh --dry-run

# 2. Review suggestions
# (suggestions printed to stdout)

# 3. Append to GAP_BACKLOG if satisfied
bash tools/gap_radar/suggest_gaps.sh --auto-append
```

### Analyze specific log file

```bash
# Extract from specific iteration log
bash tools/gap_radar/suggest_gaps.sh \
  --source log workers/ralph/logs/iter5_build.log \
  --dry-run
```

### Generate coverage report

```bash
# Full pipeline
bash tools/gap_radar/extract_errors.sh | \
  python3 tools/gap_radar/match_skills.py /dev/stdin | \
  python3 tools/gap_radar/coverage_report.py /dev/stdin
```

### Check multiple sources

```bash
# From verifier
bash tools/gap_radar/suggest_gaps.sh --source verifier --dry-run

# From recent logs
bash tools/gap_radar/suggest_gaps.sh \
  --source log workers/ralph/logs/ \
  --dry-run
```

## Configuration

### Adding new error patterns

Edit `patterns.yaml` to add new error patterns:

```yaml
category_name:
  - name: Error Name
    pattern: 'regex pattern here'
    example: 'Error message example'
    category: category_name
```

### Extending skills coverage

Skills declare coverage using HTML comment tags:

```markdown
<!-- covers: SC2155, SC2034, SC2086 -->
```

The matcher uses these tags (when present) plus hard-coded patterns in `match_skills.py`.

## Integration with Ralph Loop

**Note:** Integration hook (Phase 7.4.1) is deferred because it requires modifying protected file `workers/ralph/loop.sh`.

Manual alternative:

```bash
# Run after Ralph iteration
bash workers/ralph/loop.sh
bash tools/gap_radar/suggest_gaps.sh --dry-run
```

## Output Files

- **`errors.json`** - Raw error extraction (if saved with `> errors.json`)
- **`coverage.json`** - Matched errors with coverage info
- **`coverage.txt`** - Human-readable coverage report
- **`skills/self-improvement/skills/self-improvement/GAP_BACKLOG.md`** - Updated with new gaps (--auto-append mode)

## Dependencies

- **bash** - Shell scripts
- **python3** - Python scripts
- **jq** - JSON parsing in shell scripts
- **grep, sed, awk** - Text processing

## Troubleshooting

### No errors extracted

- Check that verifier output or log file exists
- Verify file format matches expected patterns
- Try `--source log` with a specific log file path

### All errors show as uncovered

- Check that `skills/index.md` exists
- Verify skill files have coverage tags (`<!-- covers: ... -->`)
- Check hard-coded patterns in `match_skills.py`

### Duplicates in GAP_BACKLOG

- `suggest_gaps.sh` checks for existing error codes
- If duplicates appear, check the de-duplication logic in `suggest_gaps.sh`
- Manually review and merge duplicate entries

### Script fails with "command not found"

- Install missing dependencies: `sudo apt install jq`
- Check Python3 is available: `python3 --version`

## See Also

- **[skills/self-improvement/README.md](../../skills/self-improvement/README.md)** - Gap capture protocol
- **[skills/self-improvement/skills/self-improvement/GAP_BACKLOG.md](../../skills/self-improvement/GAP_BACKLOG.md)** - Gap log
- **[skills/self-improvement/GAP_CAPTURE_RULES.md](../../skills/self-improvement/GAP_CAPTURE_RULES.md)** - Manual gap capture rules
- **[skills/SUMMARY.md](../../skills/SUMMARY.md)** - Skills overview and error reference
