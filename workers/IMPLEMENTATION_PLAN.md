# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-25 18:45:00

**Current Status:** CodeRabbit PR#5 fixes and prevention strategy tasks.

<!-- Cortex adds new Task Contracts below this line -->

## Phase CR-3: Code Example Fixes (CodeRabbit LOW Priority)

**Goal:** Fix incorrect code examples in skills documentation.

- **File:** `skills/domains/infrastructure/deployment-patterns.md`
- **Issues:** Missing `import time`, undefined `userId` in `isEnabledForPercentage`
- **Fix:** Add missing imports and define variables
- **AC:** Python examples are syntactically correct and complete

- **File:** `skills/domains/infrastructure/observability-patterns.md`
- **Issues:** `JsonFormatter.format` refs non-existent `record.extra`, hardcoded "200" status, SQL injection in span logging
- **Fix:** Correct all example issues
- **AC:** Python examples follow security best practices

- [x] **CR-3.3** Fix disaster-recovery-patterns.md PostgreSQL example
  - **File:** `skills/domains/infrastructure/disaster-recovery-patterns.md`
  - **Issue:** Uses removed PostgreSQL 12+ `recovery.conf`
  - **Fix:** Update to modern PostgreSQL recovery configuration
  - **AC:** PostgreSQL examples use current best practices (standby.signal + postgresql.conf)

- [x] **CR-3.4** Fix JavaScript examples
  - **Files:** `skills/domains/languages/javascript/README.md`, `skills/domains/code-quality/test-coverage-patterns.md`
  - **Issues:** Undefined `userId` in tagged template, incorrect Jest `--collectCoverageFrom` usage
  - **Fix:** Define variables, correct Jest command
  - **AC:** JavaScript examples are correct and runnable

- [x] **CR-3.5** Fix grammar in deployment-patterns.md
  - **File:** `skills/domains/infrastructure/deployment-patterns.md`
  - **Issue:** "backward compatible" should be "backward-compatible"
  - **Fix:** Hyphenate compound adjective
  - **AC:** Grammar is correct

---

## Phase CR-4: Prevention Strategy

**Goal:** Add skills and checklists to prevent similar issues in future.

- [ ] **CR-4.1** Create code-review-patterns.md skill
  - **File:** `skills/domains/code-quality/code-review-patterns.md`
  - **Goal:** Document patterns that CodeRabbit caught but pre-commit missed
  - **Content:**
    - Bash regex patterns that capture delimiters
    - Dead code patterns (cleanup blocks with undefined vars)
    - Code example completeness (imports, variable definitions)
    - Documentation reasonableness checks
  - **AC:** Skill file exists with actionable patterns

- [ ] **CR-4.2** Add pre-PR checklist to AGENTS.md
  - **File:** Root `AGENTS.md` or `workers/ralph/AGENTS.md`
  - **Goal:** Manual checklist for catching logic bugs before PR
  - **Content:**
    - Regex capture verification
    - Variable definition checks
    - Code example completeness
  - **AC:** Checklist section exists in AGENTS.md

- [ ] **CR-4.3** Update GAP_BACKLOG with "custom CodeRabbit" need
  - **File:** `skills/self-improvement/GAP_BACKLOG.md`
  - **Goal:** Track need for custom semantic linting tool
  - **AC:** Gap entry exists describing the need for LLM-based code review

---

## Notes

- **Protected files (loop.sh, verifier.sh, PROMPT.md):** Ralph can prepare fixes but human must update hashes
- **Hash regeneration:** Already handled by human - C1-C8 issues resolved
- **egg-info cleanup (G1):** Already fixed - directory removed and added to .gitignore
- **Reference:** See `docs/CODERABBIT_PR5_ALL_ISSUES.md` for complete issue list
