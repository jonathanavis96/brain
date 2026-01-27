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

**Status:** ⬜ Open  
**File:** `skills/domains/languages/shell/README.md` line 64  
**PR:** #6 (PI-1)

**Issue:** README documents shfmt configuration that doesn't match actual `.pre-commit-config.yaml`.

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

### M10: THUNK.md Table Column Mismatch (Recurring)

**Status:** ⬜ Open  
**File:** `workers/ralph/THUNK.md` lines 748, 770-782  
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
4. ⬜ Fix THUNK.md table formatting
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
