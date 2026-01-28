# Brain Analytics Dashboard

## Overview

The Brain Analytics Dashboard provides visual insights into the brain repository's health and activity. It tracks task velocity, skills growth, commit frequency, and identifies stale documentation.

## Usage

### Generate Dashboard

```bash
# From repository root
cd tools/brain_dashboard || exit

# Collect metrics and generate dashboard
bash collect_metrics.sh --output metrics.json
python3 generate_dashboard.py --input metrics.json --output ../../artifacts/dashboard.html

# Or use pipe chain
bash collect_metrics.sh | python3 generate_dashboard.py > ../../artifacts/dashboard.html
```

### View Dashboard

```bash
# Open in browser (WSL)
explorer.exe artifacts/dashboard.html

# Or use any web browser
firefox artifacts/dashboard.html
```

## Metrics Explained

### Task Velocity

**What it measures:** Number of tasks completed per week over the last 12 weeks.

**How it's calculated:** Parses `workers/ralph/workers/ralph/THUNK.md` for completion timestamps, groups by week.

**Why it matters:** Tracks Ralph loop productivity and identifies bottlenecks. Declining velocity may indicate:

- Complex tasks requiring more time
- Accumulating technical debt
- Need for skill improvements

**Healthy range:** 5-15 tasks/week (depends on task complexity)

### Skills Growth

**What it measures:** Number of new skill files added per week.

**How it's calculated:** Git log analysis of `skills/**/*.md` file additions.

**Why it matters:** Indicates knowledge base expansion. Steady growth shows:

- Active self-improvement protocol
- Gap capture working effectively
- Knowledge being documented

**Healthy range:** 1-3 new skills/week

### Commit Frequency

**What it measures:** Daily commit activity over the last 30 days.

**How it's calculated:** `git log` with date grouping.

**Why it matters:** Shows repository activity patterns. Helps identify:

- Peak productivity days
- Work gaps or breaks
- Batch vs continuous development style

**Healthy range:** 3-10 commits/day (Ralph loop iterations)

### Stale Skills

**What it measures:** Skill files not updated in 30+ days.

**How it's calculated:** `find` with `-mtime +30` on `skills/**/*.md`.

**Why it matters:** Identifies documentation that may be outdated. Stale skills may:

- Contain deprecated patterns
- Miss recent best practices
- Need validation against current codebase

**Action:** Review stale skills quarterly, update or archive as needed.

## Dashboard Features

### Zero Dependencies

The dashboard is a self-contained HTML file with:

- Inline CSS styling
- Inline SVG charts
- No external JavaScript libraries
- No network requests

This ensures:

- Works offline
- No CDN failures
- Fast load times
- Secure (no external code execution)

### Visual Elements

**Line Charts:** Task velocity and commit frequency trends

**Bar Charts:** Skills growth histogram

**Tables:** Stale skills list with file paths and last modified dates

## Integration

### Manual Generation

Run before demos, quarterly reviews, or when stakeholders need metrics.

### Automated Generation (Optional)

Add to `cortex/snapshot.sh`:

```bash
# Generate brain dashboard
if [[ -x tools/brain_dashboard/collect_metrics.sh ]]; then
  tools/brain_dashboard/collect_metrics.sh \
    | python3 tools/brain_dashboard/generate_dashboard.py \
    > artifacts/dashboard.html
fi
```

## Troubleshooting

### Empty Charts

**Symptom:** Dashboard shows "No data available"

**Causes:**

- Fresh repository with no history
- Git log parsing issues (check date formats)
- workers/ralph/THUNK.md format changes

**Fix:** Verify `bash collect_metrics.sh` produces valid JSON with non-empty arrays.

### Incorrect Dates

**Symptom:** Metrics show wrong time periods

**Causes:**

- System timezone not UTC
- Git log timezone issues

**Fix:** The collector uses UTC timestamps. Ensure consistent timezone in Git config.

### Missing Files

**Symptom:** Stale skills list incomplete

**Causes:**

- Symlinks or non-regular files in skills/
- Permission issues

**Fix:** Run `find skills -name "*.md" -type f -mtime +30` manually to debug.

## See Also

- **[tools/gap_radar/](../gap_radar/)** - Error pattern detection
- **[tools/skill_graph/](../skill_graph/)** - Skill dependency visualization
- **[cortex/snapshot.sh](../../cortex/snapshot.sh)** - Repository snapshot tool
- **[workers/ralph/workers/ralph/THUNK.md](../../workers/ralph/THUNK.md)** - Completed task log
