# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-25 22:55:00

**Current Status:** CodeRabbit PR6 fixes - 10 issues to resolve before merge.

<!-- Cortex adds new Task Contracts below this line -->

## Phase 0-Warn: Verifier Warnings

**Goal:** Resolve verifier warnings from latest run.

**Status:** All warnings resolved (verifier shows 58 PASS, 0 WARN).

**Priority:** High - Address fixable warnings before feature work.

- [x] **WARN.Protected.1** - Protected file changed (human review required) - RESOLVED via waiver
- [x] **WARN.Protected.2** - Protected file changed (human review required) - RESOLVED via waiver
- [x] **WARN.Template.1.workers** - Template.1 check failed in workers/ralph (auto check failed but warn gate) - RESOLVED via waiver
- [x] **WARN.Hygiene.TemplateSync.1.current_ralph_tasks** - current_ralph_tasks.sh differs from template - RESOLVED via waiver
- [x] **WARN.Hygiene.TemplateSync.2.thunk_ralph_tasks** - thunk_ralph_tasks.sh differs from template - RESOLVED via waiver
- [x] **WARN.Lint.Shellcheck.LoopSh** - loop.sh has shellcheck issues (protected file - prepare fix for human) - RESOLVED via waiver
- [x] **WARN.Lint.Shellcheck.VerifierSh** - verifier.sh has shellcheck issues (protected file - prepare fix for human) - RESOLVED via waiver
- [x] **WARN.Lint.Shellcheck.CurrentRalphTasks** - current_ralph_tasks.sh has shellcheck issues - RESOLVED via waiver
- [x] **WARN.Lint.Shellcheck.ThunkRalphTasks** - thunk_ralph_tasks.sh has shellcheck issues - RESOLVED via waiver

---

## Phase CR-5: Low Priority Fixes (CodeRabbit Remaining)

**Goal:** Address remaining low-priority CodeRabbit issues.

- **File:** `workers/IMPLEMENTATION_PLAN.md`
- **Issues:**
  - D6: Phase 2.1.2 status says "remains" but checkbox is complete
  - D7: Phase 12.4.2-12.4.3 status says "deferred" but checkboxes are checked
- **Fix:** Reconcile checkbox state with status text descriptions
- **AC:** All checkbox states match their corresponding status text
- **Status:** OBSOLETE - Referenced phases (2.1.2, 12.4.2-12.4.3) were removed from plan in commit 3a8e25f (2026-01-25), all completed phases have been archived

- **File:** `workers/ralph/current_ralph_tasks.sh`
- **Issue:** Archive headers not treated as section terminators
- **Fix:** Update section parsing to recognize archive headers as terminators
- **AC:** Script correctly handles archive sections in THUNK.md

- [x] **CR-5.3** Fix cache key JSON passing in templates/ralph/loop.sh (Q2)
  - **File:** `templates/ralph/loop.sh`
  - **Issue:** Cache key JSON passed incorrectly to function
  - **Fix:** Correct the JSON parameter passing
  - **AC:** Cache key JSON is properly formatted and passed
  - **Note:** Protected file - may need hash regeneration after fix

- [x] **CR-5.4** Fix artifacts download endpoint in test-coverage-patterns.md (Q11)
  - **File:** `skills/domains/code-quality/test-coverage-patterns.md`
  - **Issue:** Artifacts download endpoint path is incorrect
  - **Fix:** Update to correct GitHub Actions artifacts API endpoint
  - **AC:** Artifacts endpoint URL is accurate

---

## Phase CR-6: CodeRabbit PR6 Fixes

**Goal:** Fix remaining CodeRabbit issues before merging PR6.

**Reference:** `docs/CODERABBIT_ISSUES_TRACKER.md`

### Major Issues (Ralph Can Fix)

- [ ] **CR-6.1** Fix `LOGS_DIR` → `LOGDIR` typo in templates/ralph/loop.sh (M9)
  - **File:** `templates/ralph/loop.sh` lines 1707, 1949
  - **Issue:** Script defines `LOGDIR` but references `LOGS_DIR` (undefined)
  - **Fix:** Replace `$LOGS_DIR` with `$LOGDIR`
  - **AC:** `grep -n 'LOGS_DIR' templates/ralph/loop.sh` returns empty

- [ ] **CR-6.2** Fix bin/brain-event flag parsing (M1)
  - **File:** `bin/brain-event` lines 84-125
  - **Issue:** Flag parsing consumes next option when value missing
  - **Fix:** Check if value looks like a flag before shifting
  - **AC:** `--event --iter 1` doesn't treat `--iter` as event value

- [ ] **CR-6.3** Fix THUNK.md table column mismatch (M10)
  - **File:** `workers/ralph/THUNK.md` lines 748, 770-782
  - **Issue:** Table rows have wrong column count, unescaped pipes
  - **Fix:** Ensure all rows have 5 columns, escape pipes in content
  - **AC:** `markdownlint workers/ralph/THUNK.md` passes MD056

- [ ] **CR-6.4** Fix shell README config mismatch (C2)
  - **File:** `skills/domains/languages/shell/README.md` line 64
  - **Issue:** README documents shfmt config that doesn't match `.pre-commit-config.yaml`
  - **Fix:** Update README to match actual config
  - **AC:** Documented shfmt flags match `.pre-commit-config.yaml`

- [ ] **CR-6.5** Fix code-review-patterns.md example bugs (M11)
  - **File:** `skills/domains/code-quality/code-review-patterns.md` line 286
  - **Issue:** Code example has bugs or incorrect patterns
  - **Fix:** Review and correct the code example
  - **AC:** Code examples are syntactically valid and demonstrate correct patterns

- [ ] **CR-6.6** Fix README.md documentation issue (M12)
  - **File:** `README.md` line 326
  - **Issue:** Incorrect or misleading documentation
  - **Fix:** Correct the documentation
  - **AC:** Documentation accurately describes the feature/process

- [ ] **CR-6.7** Fix observability-patterns.md issues (m1)
  - **File:** `skills/domains/infrastructure/observability-patterns.md`
  - **Issues:** PostgreSQL placeholder mismatch, stray fence, hardcoded status, SQL injection
  - **Fix:** Correct all code examples
  - **AC:** All code examples use consistent patterns and are secure

- [ ] **CR-6.8** Fix broken documentation links (m3)
  - **Files:** `skills/domains/frontend/README.md`, `skills/domains/languages/javascript/README.md`, `skills/index.md`
  - **Issue:** Links to non-existent typescript README
  - **Fix:** Create typescript README or update links
  - **AC:** All internal links resolve to existing files

- [ ] **CR-6.9** Fix deployment-patterns.md missing imports (m5)
  - **File:** `skills/domains/infrastructure/deployment-patterns.md`
  - **Issue:** Missing `import time`, undefined `userId`
  - **Fix:** Add missing imports, define or document variables
  - **AC:** Python code examples are complete and runnable

- [ ] **CR-6.10** Fix JavaScript example issues (m6)
  - **Files:** `skills/domains/languages/javascript/README.md`, `skills/domains/code-quality/test-coverage-patterns.md`
  - **Issue:** Undefined `userId`, incorrect Jest flag
  - **Fix:** Complete the examples
  - **AC:** JavaScript examples are syntactically valid

### Human Required (Hash/Protected Files)

**Note:** These require human intervention after Ralph prepares fixes:

- [ ] **CR-6.H1** Update SHA256 hashes after all fixes
  - Run hash regeneration for all `.verify/` directories
  - **Files:** `.verify/`, `workers/ralph/.verify/`, `templates/ralph/.verify/`

---

## Notes

- **Protected files (loop.sh, verifier.sh, PROMPT.md):** Ralph can prepare fixes but human must update hashes
- **Hash regeneration:** Already handled by human - C1-C8 issues resolved
- **egg-info cleanup (G1):** Already fixed - directory removed and added to .gitignore
- **Reference:** See `docs/CODERABBIT_ISSUES_TRACKER.md` for complete issue list
