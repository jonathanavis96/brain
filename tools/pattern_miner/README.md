# Pattern Miner

Discover recurring patterns in sibling project git logs to identify potential new skills for the brain repository.

## Purpose

The pattern miner scans commit messages from projects in your `~/code/` directory to find repeated themes (e.g., "CORS configuration", "rate limiting", "Docker optimization"). These patterns suggest gaps in the brain's skills knowledge base.

## Components

| File | Purpose |
| ---- | ------- |
| `mine_patterns.sh` | Extracts commit messages from sibling repositories |
| `analyze_commits.py` | Groups commits by keyword similarity and suggests skills |

## Quick Start

```bash
# Scan last 90 days of commits and analyze
cd /path/to/brain || exit 1
bash tools/pattern_miner/mine_patterns.sh | python3 tools/pattern_miner/analyze_commits.py

# Scan last 30 days with minimum frequency threshold
bash tools/pattern_miner/mine_patterns.sh 30 | python3 tools/pattern_miner/analyze_commits.py --min-freq 3

# Save output for later review
bash tools/pattern_miner/mine_patterns.sh | python3 tools/pattern_miner/analyze_commits.py > pattern_report.txt
```

## Output Format

The analyzer produces a single report section that mirrors `format_suggestions()`:

```text
================================================================================
PATTERN ANALYSIS - Skill Suggestions
================================================================================

Keyword: DOCKER
Frequency: 12 mentions
Category: technology
Suggested skill: skills/domains/languages/docker-patterns.md

Example commits:
  1. fix(docker): optimize layer caching
  2. feat(docker): add multi-stage build
  3. docs(docker): clarify local dev setup
  ... and 9 more

--------------------------------------------------------------------------------

SUMMARY: Found 15 recurring patterns
Total commits analyzed: 342
```

Notes:

- Keywords are printed in uppercase.
- Each keyword includes: frequency, category, suggested skill path, and example commits.
- The report ends with a single summary line: `SUMMARY: Found X recurring patterns`.

## Workflow: Acting on Suggestions

When the pattern miner identifies a potential skill:

### Step 1: Validate the Gap

Check if the skill already exists:

```bash
# Search existing skills
rg -l "docker.*pattern" skills/domains/

# Check skills index
grep -i "docker" skills/index.md
```

### Step 2: Verify Real Need

Review the example commits to ensure they represent:

- **Recurring pattern** - not one-off fixes
- **Generalizable knowledge** - applicable across projects
- **Non-trivial** - worth documenting (not obvious best practices)

### Step 3: Create the Skill

If validated, add to brain's implementation plan:

```markdown
## Phase X: Pattern Miner Suggestions

- [ ] **X.1.1** Create `skills/domains/infrastructure/docker-patterns.md` [MEDIUM]
  - **Goal:** Document Docker optimization patterns from pattern miner analysis
  - **AC:** Covers layer caching, multi-stage builds, .dockerignore best practices
  - **Context:** 12 commits in sibling projects show repeated Docker issues
```

Use `skills/self-improvement/SKILL_TEMPLATE.md` as the starting point.

### Step 4: Update Skill Index

After creating the skill, update:

- `skills/index.md` - add to appropriate category
- `skills/SUMMARY.md` - add one-line description if major skill

## Configuration

### Environment Variables

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `CODE_DIR` | `~/code` | Base directory containing repositories to scan |

### Command-Line Options

**mine_patterns.sh:**

```bash
bash mine_patterns.sh [DAYS_BACK]
```

- `DAYS_BACK` - Number of days to look back (default: 90)

**analyze_commits.py:**

```bash
python3 analyze_commits.py [--min-freq N]
```

- `--min-freq N` - Minimum occurrences to include in output (default: 2)

## Keyword Categories

The analyzer extracts keywords in three categories:

### Technology

Docker, Kubernetes, React, PostgreSQL, AWS, etc.

**Suggests:** Infrastructure or language-specific skills

### Operation

Fix, refactor, deploy, test, optimize, etc.

**Suggests:** Process or workflow skills

### Domain

CORS, rate limiting, validation, webhooks, etc.

**Suggests:** Domain-specific problem-solving patterns

## Examples

### Example 1: Finding CORS Patterns

```text
$ bash tools/pattern_miner/mine_patterns.sh 60 | python3 tools/pattern_miner/analyze_commits.py --min-freq 3

=== Suggested Skills ===

cors (7 mentions)
  Suggested: skills/domains/backend/cors-patterns.md
  Example commits:
    - fix(api): add CORS headers for preflight
    - fix(cors): handle credentials in CORS policy
    - docs(api): document CORS configuration
```

**Action:** Create `skills/domains/backend/cors-patterns.md` documenting:

- Preflight request handling
- Credential mode configuration
- Origin whitelisting strategies

### Example 2: Infrastructure Gaps

```text
$ bash tools/pattern_miner/mine_patterns.sh | python3 tools/pattern_miner/analyze_commits.py

=== Suggested Skills ===

kubernetes (15 mentions)
  Suggested: skills/domains/infrastructure/kubernetes-patterns.md

helm (8 mentions)
  Suggested: skills/domains/infrastructure/helm-patterns.md
```

**Action:** Evaluate if infrastructure skills need expansion beyond current deployment patterns.

## Troubleshooting

### No Repositories Found

```text
ERROR: No repositories found in ~/code/
```

**Solution:** Set `CODE_DIR` environment variable:

```bash
export CODE_DIR="/path/to/your/projects"
bash tools/pattern_miner/mine_patterns.sh | python3 tools/pattern_miner/analyze_commits.py
```

### Too Many Suggestions

```text
Suggestions generated: 87
```

**Solution:** Increase minimum frequency threshold:

```bash
bash tools/pattern_miner/mine_patterns.sh | python3 tools/pattern_miner/analyze_commits.py --min-freq 5
```

### No Commits Found

```text
Total commits analyzed: 0
```

**Solution:** Increase time range or check repository activity:

```bash
# Scan last 180 days instead of 90
bash tools/pattern_miner/mine_patterns.sh 180 | python3 tools/pattern_miner/analyze_commits.py
```

## Integration with Brain Loop

The pattern miner is designed for periodic human/Cortex review, not automated Ralph execution:

1. **Quarterly review:** Run pattern miner to discover trends
2. **Cortex prioritization:** Cortex evaluates suggestions and adds to implementation plan
3. **Ralph execution:** Ralph creates skills per implementation plan tasks

**Why not automate?** Skill creation requires strategic judgment (is this pattern worth documenting?) that exceeds Ralph's scope.

## See Also

- **[skills/self-improvement/GAP_BACKLOG.md](../../skills/self-improvement/GAP_BACKLOG.md)** - Known gaps in skills
- **[skills/self-improvement/SKILL_BACKLOG.md](../../skills/self-improvement/SKILL_BACKLOG.md)** - Planned skills
- **[skills/self-improvement/SKILL_TEMPLATE.md](../../skills/self-improvement/SKILL_TEMPLATE.md)** - Template for new skills
- **[skills/index.md](../../skills/index.md)** - Complete skills catalog
