# SPEC CHANGE REQUEST - AC.rules Shellcheck Regex

**Date:** 2026-01-25  
**Requested By:** Ralph (brain-work iteration)  
**Task:** 7.3.1 - Request AC.rules update for shellcheck regex

## Problem Statement

Task 7.3.1 in workers/IMPLEMENTATION_PLAN.md requests an "AC.rules update for shellcheck regex" but provides no specificity about:

1. Which shellcheck rule needs regex updates
2. What the current regex pattern is
3. What the desired regex pattern should be
4. What problem this solves

## Current State

AC.rules lines 240-270 contain shellcheck hygiene checks:

```ini
[Hygiene.Shellcheck.1]
mode=auto
gate=warn
desc=No unused variables in current_ralph_tasks.sh (SC2034)
cmd=shellcheck -f gcc current_ralph_tasks.sh 2>/dev/null | grep -c 'SC2034' || true
expect_stdout=0

[Hygiene.Shellcheck.2]
mode=auto
gate=warn
desc=No SC2155 issues in current_ralph_tasks.sh (local var masking)
cmd=shellcheck -f gcc current_ralph_tasks.sh 2>/dev/null | grep -c 'SC2155' || true
expect_stdout=0

[Hygiene.Shellcheck.3]
mode=auto
gate=warn
desc=No unused variables in thunk_ralph_tasks.sh (SC2034)
cmd=shellcheck -f gcc thunk_ralph_tasks.sh 2>/dev/null | grep -c 'SC2034' || true
expect_stdout=0

[Hygiene.Shellcheck.4]
mode=auto
gate=warn
desc=No SC2155 issues in thunk_ralph_tasks.sh (local var masking)
cmd=shellcheck -f gcc thunk_ralph_tasks.sh 2>/dev/null | grep -c 'SC2155' || true
expect_stdout=0
```

These rules use simple string matching (`grep -c 'SC2034'`), not regex patterns.

## Investigation

- No failing shellcheck-related verifier checks currently exist
- All shellcheck hygiene checks are passing (see header: PASS: 58, FAIL: 0)
- No recent THUNK entries mention shellcheck regex issues
- Task appears to be a placeholder or poorly defined requirement

## Recommendation

**Option 1:** Close task as "not actionable" - insufficient context to implement

**Option 2:** Request clarification from Cortex:

- What specific shellcheck pattern is problematic?
- What files are affected?
- What is the desired behavior change?

**Option 3:** If task refers to making shellcheck rules more flexible (e.g., checking all .sh files instead of specific files), propose:

```ini
[Hygiene.Shellcheck.Generic]
mode=auto
gate=warn
desc=No critical shellcheck issues in shell scripts (SC2034, SC2155)
cmd=find . -name "*.sh" -not -path "./.git/*" -exec shellcheck -f gcc {} + 2>/dev/null | grep -E 'SC2034|SC2155' | wc -l
expect_stdout=0
```

## Required Action

**HUMAN INTERVENTION REQUIRED:** Cannot modify protected file `rules/AC.rules` without:

1. Clear specification of required change
2. Human approval of change
3. Regeneration of `.verify/ac.sha256` hash

## Task Status

Marking task 7.3.1 as blocked pending human clarification.
