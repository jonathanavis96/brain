# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-28 19:34:25

**Current Status:** Phase 37-38 active, Phase 0-Warn markdown lint cleanup required

**Recent Completions:**

- **Phase 28: Template Maintenance (✅ COMPLETED)** - Audited templates for drift, verified no critical issues
- **Phase 27: Skills Knowledge Base Expansion (✅ COMPLETED)** - Reviewed GAP_BACKLOG, promoted semantic code review skill
- **Phase 26: Environment & Testing Infrastructure (✅ COMPLETED)** - Brain Map testing setup and documentation
- **Phase 25: Brain Map (✅ COMPLETED)** - Full MVP with backend API, frontend UI, comprehensive tests
- **Phase 24: Template Drift Alignment (✅ COMPLETED)**
- **Phase 23: Loop Efficiency & Correctness Fixes (✅ COMPLETED)**

**Active Focus:**

- Phase 0-Warn: MD012 errors in workers/workers/PLAN_DONE.md
- Phase 37: Repo Cleanup & Drift Control
- Phase 38: Documentation Consolidation & Navigation

<!-- Cortex adds new Task Contracts below this line -->

---

## Phase 0-Warn: Markdown Lint Errors

**Context:** The following markdown errors could NOT be auto-fixed and require manual intervention.

**Goal:** Fix all remaining markdown lint errors to maintain documentation quality.

**Success Criteria:** `markdownlint <file>` passes with no errors for each affected file.

---

- [ ] **WARN.MD001.TEMPLATE_DRIFT_REPORT** Fix MD001/heading-increment in artifacts/reports/TEMPLATE_DRIFT_REPORT.md:245
  - **Issue:** Heading levels should only increment by one level at a time [Expected: h3; Actual: h4]
  - **Location:** Line 245 - "#### 3.4 `PROMPT.md` Path Adjustments"
  - **AC:** `markdownlint artifacts/reports/TEMPLATE_DRIFT_REPORT.md` passes (no MD001 errors)

- [ ] **WARN.MD032.CORTEX_SYSTEM_PROMPT** Fix MD032/blanks-around-lists in cortex/CORTEX_SYSTEM_PROMPT.md:10
  - **Issue:** Lists should be surrounded by blank lines
  - **Location:** Line 10 - bullet list not properly separated
  - **AC:** `markdownlint cortex/CORTEX_SYSTEM_PROMPT.md` passes (no MD032 errors)

- [ ] **WARN.MD022.CORTEX_SYSTEM_PROMPT** Fix MD022/blanks-around-headings in cortex/CORTEX_SYSTEM_PROMPT.md:11
  - **Issue:** Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Above]
  - **Location:** Line 11 - "## Responsibilities" heading
  - **AC:** `markdownlint cortex/CORTEX_SYSTEM_PROMPT.md` passes (no MD022 errors)

---

## Phase 35: Skills & Knowledge Base Maintenance

**Context:** Brain repository skills need periodic review and updates based on recent discoveries, tool usage patterns, and emerging best practices.

**Goal:** Keep skills knowledge base current, well-organized, and maximally useful for agents.

**Success Criteria:**

- GAP_BACKLOG items reviewed and promoted or archived
- Skills docs updated with recent learnings
- New domains/patterns documented as needed
- Skills index remains accurate

---

### Task 35.1: Skills Review & Updates

### Task 35.2: Template Maintenance

- [ ] **35.2.3** Update bootstrap scripts
  - **Goal:** Ensure `new-project.sh` and `setup.sh` match the latest recommended patterns.
  - **AC:** Scripts work for new projects (basic smoke bootstrap in a clean directory succeeds).
  - **If Blocked:** Add a reproducible “bootstrap test recipe” section to the plan and stop after documenting.

---

### Task 35.3: Documentation Quality

- [ ] **35.3.1** Link validation
  - **Goal:** Remove broken internal links across docs.
  - **AC:** `bash tools/validate_links.sh` returns 0 errors.
  - **If Blocked:** Fix the highest-impact links first and list remaining broken links in the task notes.

- [ ] **35.3.2** Example validation
  - **Goal:** Ensure code examples in skills docs are complete and runnable.
  - **AC:** `python3 tools/validate_examples.py skills/` succeeds.
  - **If Blocked:** Identify and quarantine failing examples with an “EXAMPLE INCOMPLETE” marker and file follow-up tasks.

- [ ] **35.3.3** Update `NEURONS.md`
  - **Goal:** Keep the repository map accurate and current.
  - **AC:** All current directories are listed and descriptions are up to date.
  - **If Blocked:** Document the delta as a TODO list under the task and stop.

- [ ] **35.3.4** Refresh `skills/SUMMARY.md`
  - **Goal:** Keep the error reference and domain list accurate.
  - **AC:** `skills/SUMMARY.md` reflects current domains and error guidance; manual review confirms consistency.
  - **If Blocked:** Add a short “needs review” section with the specific missing items.

### Archive - 2026-01-28 21:21
