# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-25 18:45:00

**Current Status:** CodeRabbit PR#5 fixes and prevention strategy tasks.

<!-- Cortex adds new Task Contracts below this line -->

## Phase CR-1: Logic Bug Fixes (CodeRabbit HIGH Priority)

**Goal:** Fix runtime logic bugs identified by CodeRabbit review.

**Note:** L1-L4 and L6 are in protected files (loop.sh, verifier.sh) - Ralph can prepare fixes but HUMAN must approve hash updates.

- [x] **CR-1.5** Fix `approve_waiver_totp.py` race condition
  - **File:** `.verify/approve_waiver_totp.py` lines 83-90
  - **Issue:** Deletes request file before approval written, breaks `check_waiver.sh`
  - **Fix:** Keep or archive request file after approval
  - **AC:** Request file preserved after approval; `check_waiver.sh` works correctly

- [x] **CR-1.7** Fix `bin/brain-event` unbound variable
  - **File:** `bin/brain-event` lines 84-117
  - **Issue:** Unbound variable error if flag is last argument
  - **Fix:** Guard `$2` access with `${2:-}` check
  - **AC:** `bash -n bin/brain-event` passes; no unbound var errors when flag is last arg

- [x] **CR-1.8** Fix `cerebras_agent.py` state reinjection index
  - **File:** `workers/cerebras/cerebras_agent.py` lines 1021-1038
  - **Issue:** State reinjection at index 1 breaks `_prune_messages`
  - **Fix:** Insert after user message (index 2)
  - **AC:** State reinjection works correctly with message pruning

---

## Phase CR-2: Documentation Fixes (CodeRabbit MEDIUM Priority)

**Goal:** Fix broken links, dates, and markdown formatting issues.

- [x] **CR-2.1** Fix broken TypeScript README links
  - **Files:** `skills/domains/frontend/README.md`, `skills/domains/languages/javascript/README.md`
  - **Issue:** Links to `../languages/typescript/README.md` may be broken
  - **Fix:** Verify links work or update paths
  - **AC:** All cross-references resolve correctly

- [x] **CR-2.2** Update skills/index.md with missing entries
  - **File:** `skills/index.md`
  - **Issue:** Missing entries for research-patterns, token-efficiency, frontend
  - **Fix:** Add all missing skill entries
  - **AC:** `skills/index.md` lists all files in `skills/domains/` and `skills/playbooks/`

- [x] **CR-2.3** Fix markdown formatting in observability-patterns.md
  - **File:** `skills/domains/infrastructure/observability-patterns.md`
  - **Issue:** Stray duplicate closing fence
  - **Fix:** Remove extra backticks
  - **AC:** `markdownlint` passes on file

---

## Phase CR-3: Code Example Fixes (CodeRabbit LOW Priority)

**Goal:** Fix incorrect code examples in skills documentation.

- [x] **CR-3.1** Fix Python examples in deployment-patterns.md
  - **File:** `skills/domains/infrastructure/deployment-patterns.md`
  - **Issues:** Missing `import time`, undefined `userId` in `isEnabledForPercentage`
  - **Fix:** Add missing imports and define variables
  - **AC:** Python examples are syntactically correct and complete

- [x] **CR-3.2** Fix Python examples in observability-patterns.md
  - **File:** `skills/domains/infrastructure/observability-patterns.md`
  - **Issues:** `JsonFormatter.format` refs non-existent `record.extra`, hardcoded "200" status, SQL injection in span logging
  - **Fix:** Correct all example issues
  - **AC:** Python examples follow security best practices

- [ ] **CR-3.3** Fix disaster-recovery-patterns.md PostgreSQL example
  - **File:** `skills/domains/infrastructure/disaster-recovery-patterns.md`
  - **Issue:** Uses removed PostgreSQL 12+ `recovery.conf`
  - **Fix:** Update to modern PostgreSQL recovery configuration
  - **AC:** PostgreSQL examples use current best practices (standby.signal + postgresql.conf)

- [ ] **CR-3.4** Fix JavaScript examples
  - **Files:** `skills/domains/languages/javascript/README.md`, `skills/domains/code-quality/test-coverage-patterns.md`
  - **Issues:** Undefined `userId` in tagged template, incorrect Jest `--collectCoverageFrom` usage
  - **Fix:** Define variables, correct Jest command
  - **AC:** JavaScript examples are correct and runnable

- [ ] **CR-3.5** Fix grammar in deployment-patterns.md
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
