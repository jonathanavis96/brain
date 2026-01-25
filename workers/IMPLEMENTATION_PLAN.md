# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-25 18:45:00

**Current Status:** CodeRabbit PR#5 fixes and prevention strategy tasks.

<!-- Cortex adds new Task Contracts below this line -->

## Phase CR-3: Code Example Fixes (CodeRabbit LOW Priority) ✅

**Goal:** Fix incorrect code examples in skills documentation.

**Status:** All tasks completed - see THUNK.md for details.

- [x] **CR-3.1** Fix deployment-patterns.md Python examples
- [x] **CR-3.2** Fix observability-patterns.md Python examples
- [x] **CR-3.3** Fix disaster-recovery-patterns.md PostgreSQL example
- [x] **CR-3.4** Fix JavaScript examples (Jest flag)
- [x] **CR-3.5** Fix grammar in deployment-patterns.md

---

## Phase CR-4: Prevention Strategy ✅

**Goal:** Add skills and checklists to prevent similar issues in future.

**Status:** All tasks completed.

- [x] **CR-4.1** Create code-review-patterns.md skill
- [x] **CR-4.2** Add pre-PR checklist to AGENTS.md
- [x] **CR-4.3** Add LLM-based semantic linting gap to GAP_BACKLOG.md

---

## Phase CR-5: Low Priority Fixes (CodeRabbit Remaining)

**Goal:** Address remaining low-priority CodeRabbit issues.

- [ ] **CR-5.1** Fix documentation status mismatches (D6, D7)
  - **File:** `workers/IMPLEMENTATION_PLAN.md`
  - **Issues:**
    - D6: Phase 2.1.2 status says "remains" but checkbox is complete
    - D7: Phase 12.4.2-12.4.3 status says "deferred" but checkboxes are checked
  - **Fix:** Reconcile checkbox state with status text descriptions
  - **AC:** All checkbox states match their corresponding status text

- [ ] **CR-5.2** Fix archive header handling in current_ralph_tasks.sh (Q1)
  - **File:** `workers/ralph/current_ralph_tasks.sh`
  - **Issue:** Archive headers not treated as section terminators
  - **Fix:** Update section parsing to recognize archive headers as terminators
  - **AC:** Script correctly handles archive sections in THUNK.md

- [ ] **CR-5.3** Fix cache key JSON passing in templates/ralph/loop.sh (Q2)
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
