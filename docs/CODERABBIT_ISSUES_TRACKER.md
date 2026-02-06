# CodeRabbit Issues Tracker

**Created:** 2026-01-25  
**Last Updated:** 2026-01-27  
**PRs Covered:** #5, #6  
**Purpose:** Unified tracker for CodeRabbit findings and prevention systems

---

## Recent Fixes (2026-01-27)

These items were raised by CodeRabbit during review (advisory) and were validated and fixed in the current branch.

### Fix Notes (what changed + how to apply elsewhere)

- **`bin/brain-search` — SQL quote-breaking/injection risk** (✅ Fixed, `89180e0`)
  - **Fix approach:**
    - Validate `LIMIT` early as a positive integer before interpolating into SQL.
    - Escape single quotes in user query for SQLite string literals by doubling them (`'` → `''`) before using in `LIKE '%...%'`.
  - **Snippet (pattern):**

    ```text
    # SQLite string literal escaping
    QUERY_SQL_ESCAPED=${QUERY//\'/\'\'}

    if [[ ! "$LIMIT" =~ ^[0-9]+$ ]] || [[ "$LIMIT" -lt 1 ]]; then
      echo "--limit must be a positive integer" >&2
      exit 1
    fi
    ```

- **`bin/brain-search` — grep literal safety + `--limit` parsing** (✅ Fixed, `034e8fd`)
  - **What was broken:**
    - `grep -i "$QUERY"` treated a query starting with `-` as an option.
    - `--limit` assumed `$2` existed; could fail when invoked as `--limit` with no value.
  - **Fix approach:**
    - Pass `--` before the search pattern (`grep -i -- "$QUERY"`) so leading hyphens are treated literally.
    - In the `--limit` branch, validate `${2:-}` is present and not another option before assigning `LIMIT`.

- **Skill quiz — counter increments can exit under `set -e`** (✅ Fixed, `04462c4`)
  - **What was broken:** `((total++))` / `((correct++))` can return status 1 when the previous value is 0, which can terminate the script under `set -e`.
  - **Fix approach:** use `((++total))` / `((++correct))` (or `+= 1`) so the arithmetic expression evaluates to non-zero and does not trigger `set -e`.

- **Docs hygiene — typos + table cleanup + SPEC clarity** (✅ Fixed, `dca3ff0`)
  - **What was broken:**
    - Minor typos (`doesnt`) in both plan files.
    - `workers/workers/PLAN_DONE.md` had duplicated checklist rows in the archive table and a confusing self-referential line-number mention.
    - `SPEC_CHANGE_REQUEST.md` listed `templates/ralph/loop.sh` as impacted without stating whether the change had been applied.
  - **Fix approach:**
    - Correct spelling (`doesn't`).
    - Collapse the checklist into a single valid Markdown table row and clarify that archived line numbers refer to the file state at the time.
    - Add an explicit note that template sync is still required for `templates/ralph/loop.sh` (and its `.verify` hash).

- **Brain map spec — missing Inbox node type in Node types list** (✅ Fixed, `f244e7d`)
  - **What was broken:** The `Node types` bullet list omitted `Inbox`, while other parts of the spec treat Inbox as a first-class type.
  - **Fix approach:** Add `Inbox` to the list with a short “capture/triage” description so the spec is self-consistent.

- **Brain dashboard — timestamp freshness + timezone mismatch** (✅ Fixed, `85376f7`)
  - **What was broken:**
    - `artifacts/brain_metrics.json.generated_at` could be earlier than `max(commit_frequency[].date)`.
    - `artifacts/dashboard.html` subtitle used a local timestamp without timezone and drifted from `generated_at`.
  - **Fix approach:**
    - In `collect_metrics.sh`, compute `generated_at` in UTC and ensure it is >= max reported commit date (uses end-of-day UTC if needed).
    - In `generate_dashboard.py`, render the subtitle directly from `metrics.generated_at` and append `(UTC)`.

- **Workers plan marker — task-contract insertion marker misplaced** (✅ Fixed, `836e2d2`)
  - **What was broken:** `<!-- Cortex adds new Task Contracts below this line -->` appeared after Phase 24, which violates the “append new contracts below the marker” convention.
  - **Fix approach:** Move the marker line so it is immediately above `## Phase 24: ...` and ensure it exists exactly once.

- **Brain map implementation plan — placeholder dev commands** (✅ Fixed, `f4f4ec3`)
  - **What was broken:** The implementation plan used placeholders (`<run backend dev command>`, `<run frontend dev command>`) which are not copy-pastable.
  - **Fix approach:** Replace placeholders with concrete commands for the intended stack, explicitly labeled "once scaffolding exists".

- **Brain map spec — validated_by direction mismatch in Artifact example** (✅ Fixed, `f4f4ec3`)
  - **What was broken:** Artifact example used `validated_by` pointing from Artifact → criteria, contradicting the definition `A validated_by Artifact/Test`.
  - **Fix approach:** Change the Artifact example link type to `related_to` so relationship direction semantics remain consistent.

- **PLAN-only guard — args bypass** (✅ Fixed, `c81c16c`)
  - **Fix approach:** ensure `guard_plan_only_mode` matches command prefixes with wildcards so `git commit -m ...` is blocked.
  - **Snippet (pattern):**

    ```text
    case "$action" in
      git\ add* | git\ commit* | git\ push*)
        return 1
        ;;
      verifier.sh* | pre-commit*)
        return 1
        ;;
    esac
    ```

- **Protected hash validation — deletion + regen output format** (✅ Fixed, `c81c16c`)
  - **Fix approach:**
    - If a protected file is missing but tracked (or staged for deletion), treat as `[FAIL]`.
    - When regenerating `.sha256` baselines, write **hash-only**, not `hash  filename`.
  - **Snippet (pattern):**

    ```text
    # Fail if tracked file is missing
    if ! [[ -f "$file" ]] && git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
      echo "[FAIL] protected file missing" >&2
      return 1
    fi

    # Hash-only baseline generation
    sha256sum "$file" | cut -d' ' -f1 > "$hash_file"
    ```

- **Marker schema docs — phase casing mismatch** (✅ Fixed, `5a8cc1c`)
  - **Fix approach:** align docs/examples with the enum (`phase=build|plan|custom`) to avoid casing mismatches between emitters/parsers.

- **Cache debugging docs — join multiplication** (✅ Fixed, `5a8cc1c`)
  - **Fix approach:** aggregate pass/fail counts separately (CTEs) and then join summaries; avoid counting across a `LEFT JOIN` that multiplies rows.

- **Template verifier — wrong ROOT resolution** (✅ Fixed, `00bcf62`)
  - **Fix approach:** templates should compute repo root correctly by default (two levels up from `templates/ralph/`).
  - **Snippet (pattern):**

    ```text
    ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    ```

- **Template markdown fix — wrong lint issue counting** (✅ Fixed, `00bcf62`)
  - **Fix approach:** markdownlint output is rule IDs (e.g., `MD040`), not literal `error`; count non-empty output lines (or `MD[0-9]+`).

- **Pattern miner README — output format drift** (✅ Fixed, `5a8cc1c`)
  - **Fix approach:** keep README examples in sync with `format_suggestions()` labels/sections so users can compare output reliably.

- **Skill quiz — narrow headings + brittle jq pipeline** (✅ Fixed, `39d7923`)
  - **Fix approach:**
    - Support alternative headings (`Scenario`, `Example`, `Use Case`, `Solution`, `Implementation`, `How to Apply`).
    - In `quiz.sh`, check extractor exit status and validate JSON before calling `jq`.

- **Cortex docs — conflicting task contract guidance + CLI break** (✅ Fixed, `11c40b8`, `8b726b1`)
  - **Fix approach:**
    - Make the source-of-truth explicit: task contracts live in `workers/IMPLEMENTATION_PLAN.md`.
    - Avoid non-printable control characters in docs (they can break YAML/JSON parsing in tooling).

- **Protected-file workflow — spec alignment** (✅ Fixed, `11c40b8`)
  - **Fix approach:** ensure `SPEC_CHANGE_REQUEST.md` documents the *actual* protected changes and uses hash-only baseline instructions.

- **SPEC testing guidance — avoid implying casual loop.sh execution** (✅ Fixed, `702ac6e`)
  - **What was broken:** SPEC testing instructions told readers to run `workers/ralph/loop.sh --dry-run` directly without clarifying it is a protected, potentially side-effecting script.
  - **Fix approach:** add a preferred non-executing validation option (syntax + protected hash checks) and explicitly mark dry-run execution as human-only controlled execution with safety guardrails.

---

## Executive Summary

CodeRabbit has identified **50+ issues** across PR5 and PR6, with significant overlap indicating recurring problems. This document consolidates all findings and defines prevention systems to catch these issues **before** PRs are created.

### Issue Categories

| Category | PR5 | PR6 | Recurring? | Prevention |
|----------|-----|-----|------------|------------|
| SHA256 Hash Mismatches | 8 | 1 | ✅ Yes | Hash validation pre-commit |
| Protected File Changes | 4 | 0 | - | SPEC_CHANGE_REQUEST enforcement |
| Logic Bugs (Shell) | 4 | 3 | ✅ Yes | Shell unit tests, semantic linting |
| Logic Bugs (Python) | 2 | 0 | - | Python semantic linting |
| Documentation Issues | 10 | 3 | ✅ Yes | Link validation, example testing |
| Code Examples Broken | 8 | 2 | ✅ Yes | Example extraction & validation |
| Git Hygiene | 2 | 0 | - | .gitignore rules |
| Markdown Formatting | 3 | 2 | ✅ Yes | markdownlint enforcement |

---

## 🔴 CRITICAL Issues

### C1: SHA256 Hash Mismatches (Recurring)

**Status:** ⬜ Open (multiple instances)  
**PRs:** #5, #6

| Location | PR5 Issue | PR6 Issue | Current Status |
|----------|-----------|-----------|----------------|
| `.verify/loop.sha256` | C1 | - | Needs update |
| `.verify/ac.sha256` | C2 | - | Needs approval |
| `.verify/verifier.sha256` | C3 | - | Needs update |
| `workers/ralph/.verify/loop.sha256` | C4 | - | Needs update |
| `workers/ralph/.verify/prompt.sha256` | C5 | - | Needs SPEC_CHANGE_REQUEST |
| `workers/ralph/.verify/verifier.sha256` | C6 | - | Needs SPEC_CHANGE_REQUEST |
| `templates/ralph/.verify/loop.sha256` | C7 | PI-2 | ⬜ Needs update |
| `workers/cerebras/PROMPT.md` | C8 | - | Hash guard blocked |

**Root Cause:** Protected files are modified but hashes aren't updated. No automated check prevents this.

**Prevention:** Pre-commit hook that validates all `.verify/*.sha256` files match their targets.

---

### C2: Shell README Config Mismatch (New in PR6)

**Status:** ✅ Closed  
**File:** `skills/domains/languages/shell/README.md` line 64  
**PR:** #6 (PI-1)

**Issue:** README documents shfmt configuration that doesn't match actual `.pre-commit-config.yaml`.

**Resolution:** Verified with `tools/validate_doc_sync.sh` - documentation correctly distinguishes between manual usage (`-i 2 -ci -w`) and pre-commit check mode (`-d -i 2 -ci`). Config and docs are in sync.

**Prevention:** Documentation-config sync validation script.

---

## 🟠 MAJOR Issues

### M1: bin/brain-event Flag Parsing (Recurring)

**Status:** ⬜ Open  
**File:** `bin/brain-event` lines 84-125  
**PRs:** #5 (L7), #6 (PI-3)

**PR5 Issue:** Unbound variable error if flag is last arg - Guard `$2` access with `${2-}` check  
**PR6 Issue:** Flag parsing consumes next option when value missing - `--event --iter 1` treats `--iter` as value

**Fix:**

```text
--event)
  EVENT="${2-}"
  shift
  if [[ -n "$EVENT" && "$EVENT" != --* ]]; then
    shift
  else
    EVENT=""
  fi
  ;;
```

**Prevention:** Shell script unit tests (bats) for argument parsing.

---

### M2: cleanup() Not Called in Trap (PR5)

**Status:** ⬜ Open  
**File:** `workers/ralph/loop.sh` lines 154-172  
**PR:** #5 (L1)

**Issue:** `cleanup_and_emit` doesn't call `cleanup()`, leaves TEMP_CONFIG behind.

**Prevention:** Function call graph analysis, integration tests.

---

### M3: lookup_cache_pass Missing Argument (PR5)

**Status:** ⬜ Open  
**File:** `workers/ralph/loop.sh` lines 1037-1038  
**PR:** #5 (L2)

**Issue:** Missing tool/runner arg, `non_cacheable_tools` ignored.

**Prevention:** Function signature validation.

---

### M4: Cache-hit Returns Before Cleanup (PR5)

**Status:** ⬜ Open  
**File:** `workers/ralph/loop.sh` lines 1056-1068  
**PR:** #5 (L3)

**Issue:** Cache-hit returns before cleaning temp prompt file.

**Prevention:** Resource cleanup analysis.

---

### M5: CACHE_SKIP Only Accepts Literal "true" (PR5)

**Status:** ⬜ Open  
**File:** `workers/ralph/loop.sh` lines 341-360  
**PR:** #5 (L4)

**Issue:** Should accept truthy values (1, yes, on) case-insensitive.

**Prevention:** Boolean parsing standardization.

---

### M6: Waiver Approval Race Condition (PR5)

**Status:** ⬜ Open  
**File:** `.verify/approve_waiver_totp.py` lines 83-90  
**PR:** #5 (L5)

**Issue:** Deletes request file before writing approval, breaks `check_waiver.sh`.

**Prevention:** Integration tests for waiver workflow.

---

### M7: Verifier Cache Key Timing (PR5)

**Status:** ⬜ Open  
**File:** `workers/ralph/verifier.sh` lines 344-385  
**PR:** #5 (L6)

**Issue:** Cache key only appends AC.rules hash in "use" mode.

**Prevention:** Cache key consistency tests.

---

### M8: Cerebras Agent State Reinjection (PR5)

**Status:** ⬜ Open  
**File:** `workers/cerebras/cerebras_agent.py` lines 1021-1038  
**PR:** #5 (L8)

**Issue:** State reinjection at index 1 breaks `_prune_messages`.

**Prevention:** Python unit tests for message handling.

---

### M9: Undefined LOGS_DIR Variable (New in PR6)

**Status:** ✅ Fixed (2026-01-25)  
**File:** `templates/ralph/loop.sh` lines 1707, 1949  
**PR:** #6 (PI-8)

**Issue:** Script defines `LOGDIR` but references `LOGS_DIR` (undefined). Fails with `set -u`.

**Fix:** All references to `LOGS_DIR` have been corrected to `LOGDIR`.

**Prevention:** shellcheck already catches this if run properly; ensure all shell files are checked.

---

### M10: workers/ralph/THUNK.md Table Column Mismatch (Recurring)

**Status:** ⬜ Open  
**File:** `workers/ralph/workers/ralph/THUNK.md` lines 748, 770-782  
**PRs:** #5 (D8), #6 (PI-6, PI-10)

**Issue:** Table rows have wrong column count (6 instead of 5), unescaped pipes.

**Prevention:** markdownlint MD056 enforcement on all files.

---

### M11: code-review-patterns.md Example Bug (New in PR6)

**Status:** ⬜ Open  
**File:** `skills/domains/code-quality/code-review-patterns.md` line 286  
**PR:** #6 (PI-5)

**Issue:** Code example has bugs or incorrect patterns.

**Prevention:** Code example validation (extract and syntax-check).

---

### M12: README.md Documentation Issue (New in PR6)

**Status:** ⬜ Open  
**File:** `README.md` line 326  
**PR:** #6 (PI-4)

**Issue:** Incorrect or misleading documentation.

**Prevention:** Documentation review checklist.

---

### M13: Notification Wrapper Default Mismatch (New)

**Status:** ⬜ Open  
**Files:**

- `bin/cortex-run-notify` (`MIN_SECONDS_DEFAULT` vs help text)
- `templates/ralph/bin/cortex-run-notify` (same mismatch)

**Issue:** Help text documents `--min-seconds` default as 60 but code default is 120.

**Fix:** Make the help text and constant agree (and keep repo + template in sync).

**Prevention:** Add a checklist item: "Help/usage defaults must match constants" for wrapper scripts.

---

### M13b: cortex-run-notify `script(1)` Invocation Uses Wrong Arg Order (Fixed)

**Status:** ✅ Fixed (2026-02-06)  
**File:** `bin/cortex-run-notify`

**Issue:** In interactive-watch mode, the wrapper invoked `script` with the output file before `-c` and included an extraneous `/dev/null`, which breaks on some systems and can capture logs incorrectly.

**Fix:** Call `script` with options first, then the `-c` command, then the output file:

- `script -q -f -c "$cmd_str" "$tmp_log"`

Also made `watch_pid` cleanup safe under `set -u` by using `${watch_pid:-}` in the guard.

**Prevention:** Document the `script` argument order pitfall in shell anti-patterns; avoid “stringly” extra args like `/dev/null` unless required.

---

### M14: bin/notify Broken Redirection Argument (New)

**Status:** ⬜ Open  
**File:** `bin/notify` (PowerShell invocation block)

**Issue:** The script passes a literal string like `">/dev/null 2>&1"` as an argument rather than performing shell redirection.

**Fix:** Capture PowerShell combined output into a variable and only print it when `--debug` is enabled; otherwise fall back to console output.

**Prevention:** Document/avoid "stringly-typed redirection"; use `cmd ... >/dev/null 2>&1` or `output=$(cmd 2>&1)` patterns.

---

### M15: Wrapper Flag Parsing Unsafe Under set -u (New)

**Status:** ⬜ Open  
**Files:**

- `bin/ralph-run-notify` (`--log`, `--min-seconds`)
- `templates/ralph/bin/ralph-run-notify` (same logic)

**Issue:** Case arms read `$2` and `shift 2` without validating the value exists and is not another flag.

**Fix:** Guard `${2:-}` and reject missing/flag-like values before assignment + shifting.

**Prevention:** Add shell wrapper argument-parsing tests (missing value, next-flag-as-value).

---

### M16: Wrapper Array Expansion Nounset Risk (New)

**Status:** ⬜ Open  
**Files:**

- `bin/ralph-run-notify` and templates variant (DRY_RUN uses `${LOOP_ARGS[*]}`)

**Issue:** Under `set -u`, empty/unset arrays can trigger "unbound variable" in some expansions.

**Fix:** Use safe default expansions where appropriate (e.g., `${arr[*]:-}`) and keep quoted `"${arr[@]}"` for execution.

**Prevention:** Wrapper template pattern should standardize safe dry-run printing for arrays.

---

### M17: skill-suggest Description Fallback Never Runs (New)

**Status:** ⬜ Open  
**File:** `bin/skill-suggest`

**Issue:** `grep | sed || head -1` never falls back because `sed` returns success even when `grep` outputs nothing.

**Fix:** Compute heading-derived description first; if empty, fall back to `head -1`.

**Prevention:** Avoid `cmd1 | cmd2 || fallback` when `cmd2` can succeed on empty input.

---

### M18: Template REPO_ROOT Calculation Incorrect (New)

**Status:** ⬜ Open  
**Files:**

- `templates/ralph/bin/cortex-run-notify`
- `templates/ralph/bin/ralph-run-notify`

**Issue:** `REPO_ROOT` resolves to `templates/ralph` instead of repository root, breaking `tools/detect_human_required.py` lookup.

**Fix:** Prefer `git -C "$SCRIPT_DIR" rev-parse --show-toplevel` with a fallback directory climb.

**Prevention:** Document a standard `resolve_repo_root()` function for template scripts.

---

### M19: Template Wrapper Path Resolution (New)

**Status:** ⬜ Open  
**Files:**

- `templates/cortex/cortex-PROJECT.bash`
- `templates/cortex/cortex.bash`

**Issue:** Template scripts call wrappers at CWD-relative paths (`bin/...`), which can fail when invoked from a different working directory or when the generated project layout differs.

**Fix:**

- Resolve and validate wrapper path from a known root (`PROJECT_ROOT`/`BRAIN_ROOT`) before invocation.
- For Cortex chat template, invoke the wrapper as an absolute path: `${BRAIN_ROOT}/bin/cortex-run-notify`.

**Prevention:** Template scripts should never assume CWD-relative `bin/...` exists without `test -x`, and should avoid relative wrapper execution.

---

### M20: Coverage Artifact URL Missing Guard (New)

**Status:** ⬜ Open  
**File:** `skills/domains/code-quality/test-coverage-patterns.md`

**Issue:** Script example uses `ARTIFACT_URL` without checking it is non-empty; `curl` may run with an empty URL.

**Fix:** Guard for empty `ARTIFACT_URL` and print an actionable error mentioning `coverage-summary` + `RUN_ID`.

**Prevention:** Example validation should include "required variable non-empty" checks for external fetches.

---

### M21: Cache Debugging SQL Column Name Drift (New)

**Status:** ⬜ Open  
**File:** `skills/domains/ralph/cache-debugging.md`

**Issue:** Example SQL uses `last_used_at` but schema documents `last_pass_ts`.

**Fix:** Replace `last_used_at` with `last_pass_ts` (and ensure consistency across the document).

**Prevention:** Keep schema and example queries adjacent and cross-check during edits.

---

### M22: ralph-run-notify Uses CWD-Relative loop.sh Path (New)

**Status:** ⬜ Open  
**Files:**

- `bin/ralph-run-notify`
- `templates/ralph/bin/ralph-run-notify`

**Issue:** Wrapper executes `bash workers/ralph/loop.sh ...` which fails if invoked from a different CWD.

**Fix:** Use absolute path derived from `REPO_ROOT`:

- `bash "${REPO_ROOT}/workers/ralph/loop.sh" "${LOOP_ARGS[@]}"`

**Prevention:** Wrapper/template scripts should avoid CWD-relative execution for internal entrypoints; prefer `REPO_ROOT` + absolute paths.

---

## 🟡 MINOR Issues

### m1: Observability Patterns Issues (Recurring)

**Status:** ⬜ Open  
**File:** `skills/domains/infrastructure/observability-patterns.md`  
**PRs:** #5 (D10, Q5, Q6, Q7), #6 (PI-7)

| Line | Issue |
|------|-------|
| 319 | PostgreSQL placeholder style mismatch (`?` vs `%s` vs `$1`) |
| - | Stray duplicate closing fence |
| - | `JsonFormatter.format` references non-existent `record.extra` |
| - | `metricsMiddleware` hardcodes "200" status |
| - | SQL injection in span logging |

**Prevention:** Code example validation, security pattern checks.

---

### m2: current_ralph_tasks.sh Issues (Recurring)

**Status:** ⬜ Open  
**File:** `workers/ralph/current_ralph_tasks.sh`  
**PRs:** #5 (Q1), #6 (PI-9)

**Issue:** Archive headers not treated as section terminators, other minor issues.

**Prevention:** Shell script unit tests.

---

### m3: Broken Documentation Links (PR5)

**Status:** ✅ Fixed (2026-01-25)  
**PRs:** #5 (D1, D2, D3)

| File | Broken Link | Status |
|------|-------------|--------|
| `skills/domains/frontend/README.md` | `../languages/typescript/README.md` | ✅ Fixed - file exists |
| `skills/domains/languages/javascript/README.md` | typescript README | ✅ Fixed - file exists |
| `skills/index.md` | Missing entries in SUMMARY.md | ✅ Fixed |

**Prevention:** Link validation script in pre-commit.

---

### m4: Incorrect Dates in Documentation (PR5)

**Status:** ⬜ Open  
**PRs:** #5 (D4, D5)

| File | Issue |
|------|-------|
| `workers/IMPLEMENTATION_PLAN.md` | Future date |
| `skills/domains/languages/typescript/README.md` | Future date |

**Prevention:** Date validation script (no future dates).

---

### m5: Python Code Examples Missing Imports (PR5)

**Status:** ✅ Fixed (2026-01-25)  
**PRs:** #5 (Q3, Q4)

| File | Issue | Status |
|------|-------|--------|
| `skills/domains/infrastructure/deployment-patterns.md` | Missing `import time` | ✅ Fixed - import added |
| `skills/domains/infrastructure/deployment-patterns.md` | Undefined `userId` | ✅ Fixed - properly defined as parameters |

**Prevention:** Extract Python code blocks and run `python -m py_compile`.

---

### m6: JavaScript Example Issues (PR5)

**Status:** ✅ Fixed (2026-01-25)  
**PRs:** #5 (Q9, Q10, Q11)

| File | Issue | Status |
|------|-------|--------|
| `skills/domains/languages/javascript/README.md` | Undefined `userId` | ✅ Fixed - userId defined before use |
| `skills/domains/code-quality/test-coverage-patterns.md` | Jest flag used incorrectly | ⬜ Needs verification |
| `skills/domains/code-quality/test-coverage-patterns.md` | Artifacts endpoint incorrect | ⬜ Needs verification |

**Prevention:** Extract JS code blocks and run eslint/syntax check.

---

### m7: Git Hygiene (PR5)

**Status:** ⬜ Open  
**PRs:** #5 (G1, G2)

| Issue | Fix |
|-------|-----|
| `*.egg-info/` committed | Add to `.gitignore`, `git rm -r` |
| Waiver request reason contradicts evidence | Update or reject |

**Prevention:** Comprehensive `.gitignore`, waiver validation.

---

## Prevention Systems Design

### System 1: Pre-PR Quality Gate (`bin/pre-pr-check`)

A single script that runs ALL checks before creating a PR:

```text
#!/usr/bin/env bash
# bin/pre-pr-check - Run before creating a PR

set -euo pipefail

echo "=== Pre-PR Quality Check ==="

# 1. Hash validation
echo "Checking SHA256 hashes..."
for hash_file in $(find . -path '*/.verify/*.sha256' -type f); do
  # Extract target file and verify hash matches
done

# 2. Link validation  
echo "Checking documentation links..."
# Use markdown-link-check or custom script

# 3. Code example validation
echo "Validating code examples..."
# Extract code blocks, syntax check by language

# 4. Shell script checks
echo "Running shellcheck on all scripts..."
shellcheck -e SC1091 **/*.sh

# 5. Markdown linting
echo "Running markdownlint..."
markdownlint **/*.md

# 6. Pre-commit (standard)
echo "Running pre-commit hooks..."
pre-commit run --all-files

echo "=== All checks passed! Ready for PR ==="
```

---

### System 2: Code Review Debugger Agent

**Purpose:** An agent that runs semantic analysis BEFORE creating a PR, catching issues that CodeRabbit would find.

**Concept:** Run a focused review pass using an LLM to check for:

- Logic bugs (undefined variables, unused functions, race conditions)
- Documentation-code mismatches
- Incomplete code examples
- Security patterns

**Implementation Options:**

#### Option A: Pre-commit LLM Hook

```yaml
# .pre-commit-config.yaml
- repo: local
  hooks:
    - id: semantic-review
      name: Semantic Code Review
      entry: python tools/semantic_review.py
      language: python
      types: [python, shell, markdown]
      stages: [pre-push]  # Only on push, not every commit
```

#### Option B: Dedicated Review Script

```bash
# bin/code-review-debugger
#!/usr/bin/env bash
# Runs semantic analysis on changed files

CHANGED_FILES=$(git diff --name-only origin/main...HEAD)

for file in $CHANGED_FILES; do
  case "$file" in
    *.sh) check_shell_semantics "$file" ;;
    *.py) check_python_semantics "$file" ;;
    *.md) check_markdown_semantics "$file" ;;
  esac
done
```

#### Option C: Ralph Pre-PR Mode

Add a new mode to Ralph that reviews changes before PR:

```bash
bash loop.sh --mode review  # Reviews changes, doesn't implement
```

---

### System 3: Issue Pattern Database

Track recurring issues to build custom lint rules:

```yaml
# tools/issue_patterns.yaml
patterns:
  - id: shell-flag-parsing
    description: "Flag parsing that consumes next option"
    pattern: 'shift\s*\n\s*\[\[ -n "\$\{1-\}" \]\] && shift'
    fix: "Check if value looks like a flag before second shift"
    files: ["*.sh"]
    
  - id: undefined-variable-typo
    description: "Variable name typo (LOGS_DIR vs LOGDIR)"
    check: "grep for variables that differ by underscore/case"
    files: ["*.sh"]
    
  - id: placeholder-style-mismatch
    description: "Mixed SQL placeholder styles in same example"
    pattern: "Both '?' and '%s' or '$1' in same code block"
    files: ["*.md"]
```

---

## Recommended Implementation Order

### Phase 1: Quick Wins (This Week)

1. ✅ Create unified issues tracker (this document)
2. ⬜ Fix all hash mismatches (HUMAN REQUIRED)
3. ⬜ Fix `LOGS_DIR` → `LOGDIR` typo
4. ⬜ Fix workers/ralph/THUNK.md table formatting
5. ⬜ Add `*.egg-info/` to `.gitignore`

### Phase 2: Pre-PR Script (Next)

6. ⬜ Create `bin/pre-pr-check` script
7. ⬜ Add hash validation to pre-pr-check
8. ⬜ Add link validation to pre-pr-check
9. ⬜ Document in AGENTS.md

### Phase 3: Code Example Validation

10. ⬜ Create code block extractor
11. ⬜ Add Python syntax validation
12. ⬜ Add Shell syntax validation
13. ⬜ Add JavaScript syntax validation

### Phase 4: Semantic Review (Future)

14. ⬜ Design semantic review patterns
15. ⬜ Implement Code Review Debugger agent
16. ⬜ Build issue pattern database

---

## Quick Reference: Why Pre-commit Misses These

| Check Type | Pre-commit | CodeRabbit | Pre-PR Script |
|------------|------------|------------|---------------|
| Syntax errors | ✅ | ✅ | ✅ |
| Style violations | ✅ | ✅ | ✅ |
| Undefined variables | ✅ | ✅ | ✅ |
| Hash validation | ❌ | ✅ | ✅ (planned) |
| Logic bugs | ❌ | ✅ | ⚠️ (partial) |
| Missing function calls | ❌ | ✅ | ❌ |
| Race conditions | ❌ | ✅ | ❌ |
| Broken doc links | ❌ | ✅ | ✅ (planned) |
| Code example bugs | ❌ | ✅ | ✅ (planned) |

**Conclusion:** We need a **layered approach**:

1. **Pre-commit:** Fast syntax/style checks (existing)
2. **Pre-PR Script:** Hash validation, link checks, example validation (new)
3. **CodeRabbit:** Semantic analysis, logic bugs (keep enabled)

---

## Files to Archive

These files are now superseded by this unified tracker:

- `docs/CODERABBIT_PR5_ALL_ISSUES.md` → Archive
- `docs/CODERABBIT_PR5_ANALYSIS.md` → Merged into this doc
- `docs/CODERABBIT_PR6_POTENTIAL_ISSUES.md` → Merged into this doc
