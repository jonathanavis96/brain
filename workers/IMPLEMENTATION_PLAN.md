# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-25 18:45:00

**Current Status:** CodeRabbit PR#5 fixes and prevention strategy tasks.

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

- [ ] **CR-5.4** Fix artifacts download endpoint in test-coverage-patterns.md (Q11)
  - **File:** `skills/domains/code-quality/test-coverage-patterns.md`
  - **Issue:** Artifacts download endpoint path is incorrect
  - **Fix:** Update to correct GitHub Actions artifacts API endpoint
  - **AC:** Artifacts endpoint URL is accurate

---

## Notes

- **Protected files (loop.sh, verifier.sh, PROMPT.md):** Ralph can prepare fixes but human must update hashes
- **Hash regeneration:** Already handled by human - C1-C8 issues resolved
- **egg-info cleanup (G1):** Already fixed - directory removed and added to .gitignore
- **Reference:** See `docs/CODERABBIT_PR5_ALL_ISSUES.md` for complete issue list
