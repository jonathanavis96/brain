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

## Phase 0-Warn: Verifier Warnings

- [ ] **0-Warn.MD024.cortex-PLAN_DONE.454** Fix MD024 duplicate heading in cortex/PLAN_DONE.md line 454
  - **Error:** `error MD024/no-duplicate-heading Multiple headings with the same content [Context: "Archived on 2026-01-28"]`
  - **Fix:** Make duplicate "Archived on 2026-01-28" headings unique (e.g., add time or sequence number)
  - **AC:** `markdownlint cortex/PLAN_DONE.md` passes (no MD024 errors)

---

### Task 38.1: Identify duplication + contradictions

### Task 38.2: Simplify entrypoints ("Start Here")

### Task 38.3: Prune or demote historical docs

### Task 38.4: Cross-link consistency + naming conventions

#### Task 38.3 Implementation Details

- [ ] **38.3.2** Merge or remove duplicate runbooks
  - **Goal:** Ensure there is one operational runbook per role (Cortex vs Ralph) and links point to the right one.
  - **AC:** `cortex/docs/RUNBOOK.md` and `workers/ralph/README.md` do not contain overlapping “how to run” instructions; one links to the other where appropriate.
  - **If Blocked:** Add a “Canonical runbook is X” note at the top of the non-canonical file.

---

#### Task 38.4 Implementation Details

- [ ] **38.4.2** Add/refresh "See also" sections on major docs
  - **Goal:** Improve navigation without duplicating content.
  - **AC:** Major docs (`docs/TOOLS.md`, `docs/BOOTSTRAPPING.md`, `skills/SUMMARY.md`, `NEURONS.md`, `cortex/docs/RUNBOOK.md`) include a small “See also” list to related canonical docs.
  - **If Blocked:** Add “See also” only to `docs/TOOLS.md` and `docs/BOOTSTRAPPING.md` first.

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

- [ ] **35.1.1** Review `skills/self-improvement/GAP_BACKLOG.md` entries
  - **Goal:** Ensure all P1/P2 backlog items are triaged into a clear state.
  - **AC:** Every P1/P2 entry has an explicit status (Promoted/Archived/Keep), and there are no undecided entries older than 30 days.
  - **If Blocked:** Flag ambiguous entries with `[?]` and add a short note describing what decision is needed.

- [ ] **35.1.2** Update code-quality skills
  - **Goal:** Incorporate recent learnings (semantic review patterns, bulk-edit best practices).
  - **AC:** `skills/domains/code-quality/*.md` is updated to reflect current practices, and the section reads coherently end-to-end.
  - **If Blocked:** Add a TODO stub section noting what evidence/examples are needed to finish the update.

- [ ] **35.1.3** Enhance Ralph operational patterns
  - **Goal:** Document PLAN-mode governance rules, THUNK tracking patterns, and discovery-defer rules.
  - **AC:** `skills/domains/ralph/*.md` covers all `loop.sh` modes and the missing operational patterns.
  - **If Blocked:** Capture gaps in `skills/self-improvement/skills/self-improvement/GAP_BACKLOG.md` and link them from the relevant Ralph skill doc.

- [ ] **35.1.4** Frontend skills expansion
  - **Goal:** Add practical frontend patterns for web projects (React/Vue component patterns, state management).
  - **AC:** Frontend domain contains 5+ skill docs, and `ls skills/domains/frontend/*.md` reflects the growth.
  - **If Blocked:** Start with a single “frontend patterns index” doc listing planned subtopics.

---

### Task 35.2: Template Maintenance

- [ ] **35.2.1** Audit template drift
  - **Goal:** Identify differences between `templates/ralph/` and `workers/ralph/` that should be reconciled.
  - **AC:** A drift report is generated and differences are documented in `TEMPLATE_DRIFT_REPORT.md`.
  - **If Blocked:** Document partial findings and explicitly list paths that could not be compared.

- [ ] **35.2.2** Sync beneficial features
  - **Goal:** Propagate general-purpose improvements from workers to templates where appropriate.
  - **AC:** Templates are updated; `git diff` shows relevant `templates/` changes.
  - **If Blocked:** Split into smaller follow-up tasks grouped by area (scripts/docs/verifier ergonomics).

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
