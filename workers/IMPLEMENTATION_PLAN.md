# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-28 10:15:00

**Current Status:** Phase 33 nearly complete (14/20 tasks done), focusing on remaining polish features

**Recent Completions:**

- **Phase 28: Template Maintenance (✅ COMPLETED)** - Audited templates for drift, verified no critical issues
- **Phase 27: Skills Knowledge Base Expansion (✅ COMPLETED)** - Reviewed GAP_BACKLOG, promoted semantic code review skill
- **Phase 26: Environment & Testing Infrastructure (✅ COMPLETED)** - Brain Map testing setup and documentation
- **Phase 25: Brain Map (✅ COMPLETED)** - Full MVP with backend API, frontend UI, comprehensive tests
- **Phase 24: Template Drift Alignment (✅ COMPLETED)**
- **Phase 23: Loop Efficiency & Correctness Fixes (✅ COMPLETED)**

**Active Focus:**

- Phase 0-Warn: Markdown lint errors (MD032, MD007, MD046, MD012)
- Phase 0-Lint: MD004 list style errors in cortex docs

<!-- Cortex adds new Task Contracts below this line -->

## Phase 37: Repo Cleanup & Drift Control

**Context:** The Brain repo has accumulated drift over time: broken links, outdated references, and missing tool documentation.

**Goal:** Restore correctness and prevent future drift by (1) fixing link + reference integrity, (2) making `docs/TOOLS.md` authoritative, (3) refreshing repo maps, and (4) adding lightweight guardrails.

**Success Criteria:**

- `bash tools/validate_links.sh` returns 0 errors
- `python3 tools/validate_examples.py skills/` succeeds
- `docs/TOOLS.md` lists all key runnable entrypoints (bin + core tools) with correct usage
- Repo maps (`NEURONS.md`, `cortex/docs/REPO_MAP.md` as applicable) match actual structure

---

### Task 37.1: Link + reference integrity

- [ ] **37.1.2** Remove references to renamed/deleted scripts and paths
  - **Goal:** Ensure docs/templates don’t reference removed scripts (e.g., old sync names) or obsolete paths.
  - **AC:** `grep -R "sync_cortex_plan.sh" -n .` and `grep -R "sync_completions_to_cortex.sh" -n .` return no matches outside historical changelogs.
  - **If Blocked:** Add a small “Deprecated names” section to the relevant doc with the correct replacements.

---

### Task 37.2: Tools documentation correctness (`docs/TOOLS.md`)

- [ ] **37.2.1** Inventory runnable tools and reconcile with `docs/TOOLS.md`
  - **Goal:** Make `docs/TOOLS.md` match what’s actually runnable in this repo.
  - **AC:** `docs/TOOLS.md` includes:
    - `bin/*` entrypoints
    - key scripts under `tools/` (validators, dashboard, gap_radar, rollflow)
    - key worker scripts under `workers/ralph/` that humans run
  - **If Blocked:** Generate an inventory list via `find bin tools -maxdepth 2 -type f` and paste into the task notes.

- [ ] **37.2.2** Add missing usage/outputs/prereqs for each documented tool
  - **Goal:** Make each tool entry actionable.
  - **AC:** Each tool in `docs/TOOLS.md` has: purpose, command example, where outputs go, and prerequisites.
  - **If Blocked:** Start with top 10 most-used tools and mark remaining entries as TODO.

---

### Task 37.3: Repo maps + docs drift cleanup

- [ ] **37.3.1** Refresh `NEURONS.md` to match current repo structure
  - **Goal:** Ensure the repo map reflects actual directories/files.
  - **AC:** `NEURONS.md` matches current structure and contains no dead links.
  - **If Blocked:** Add a “Delta to fix” checklist at the bottom and stop.

- [ ] **37.3.2** Reconcile `cortex/docs/REPO_MAP.md` and other high-level docs with current structure
  - **Goal:** Reduce contradictions between maps/runbooks and the actual repo.
  - **AC:** `cortex/docs/REPO_MAP.md` and `cortex/docs/RUNBOOK.md` have no stale path references.
  - **If Blocked:** Prioritize updating the runbook first.

---

### Task 37.4: Drift guardrails (prevent recurrence)

- [ ] **37.4.1** Add a lightweight “tool inventory” validator (optional) or documented procedure
  - **Goal:** Prevent `docs/TOOLS.md` from drifting.
  - **AC:** Either:
    - A script exists under `tools/` that compares `docs/TOOLS.md` entries to actual files, or
    - A documented procedure exists in `docs/TOOLS.md` describing how to regenerate the inventory.
  - **If Blocked:** Add a TODO checklist to `docs/TOOLS.md` describing the intended validator.

- [ ] **37.4.2** Add/extend a check to catch out-of-workspace brain references in templates
  - **Goal:** Prevent regressions to `../../brain/...` in templates.
  - **AC:** `grep -R "\.\./\.\./brain/" templates/` returns 0 matches.
  - **If Blocked:** Document the rule in `templates/README.md` and add it to pre-commit later.

---

## Phase 38: Documentation Consolidation & Navigation

**Context:** Over time, documentation tends to drift: duplicated guidance, conflicting instructions, and unclear entrypoints. This phase focuses on consolidation and navigability (not functional changes).

**Goal:** Make the documentation set coherent: one canonical place per topic, clear “start here” paths, and minimal duplication.

**Success Criteria:**

- No conflicting guidance between `README.md`, `AGENTS.md`, `docs/*`, `cortex/docs/*`, and `workers/*` for core workflows
- Clear “Start Here” pointers for humans and agents
- Deprecated/duplicate docs are either removed or clearly marked as historical

---

### Task 38.1: Identify duplication + contradictions

- [ ] **38.1.1** Inventory duplicated topics and pick canonical docs
  - **Goal:** Identify where the same topic is documented in multiple places (e.g., bootstrapping, task sync, running Ralph/Cortex, gap capture) and pick one canonical location per topic.
  - **AC:** A short “canonical map” table is added to `docs/REFERENCE_SUMMARY.md` (or `docs/CHANGES.md` if preferred) listing topic → canonical file, plus “deprecated copies” list.
  - **If Blocked:** Start with the top 5 topics and leave the rest as a TODO list.

- [ ] **38.1.2** Resolve the highest-impact contradictions
  - **Goal:** Remove conflicting instructions that cause incorrect usage.
  - **AC:** The canonical docs match current behavior for:
    - bootstrap layout (`workers/ralph/`)
    - plan authority (`workers/IMPLEMENTATION_PLAN.md` canonical, cortex mirror)
    - gap capture workflow (`cortex/GAP_CAPTURE.md` + `.gap_pending` + `cortex/sync_gaps.sh`)
  - **If Blocked:** Add an explicit “Current reality” callout box at the top of the canonical doc.

---

### Task 38.2: Simplify entrypoints (“Start Here”)

- [ ] **38.2.1** Create/refresh a single top-level “Start Here” section
  - **Goal:** Make it obvious where to begin for new contributors and agents.
  - **AC:** `README.md` includes a concise “Start Here” section linking to: `NEURONS.md`, `docs/TOOLS.md`, `docs/BOOTSTRAPPING.md`, `skills/SUMMARY.md`, and `workers/IMPLEMENTATION_PLAN.md`.
  - **If Blocked:** Add the section as a TODO skeleton with placeholder bullets.

- [ ] **38.2.2** Reduce redundant onboarding text in `AGENTS.md`/`cortex/docs/*`
  - **Goal:** Avoid repeating the same onboarding guidance in multiple places.
  - **AC:** Duplicated onboarding content is replaced with links to the canonical “Start Here” docs.
  - **If Blocked:** Mark duplicated sections with “DEPRECATED: see <link>”.

---

### Task 38.3: Prune or demote historical docs

- [ ] **38.3.1** Mark historical change logs and old analysis as “historical” and de-emphasize in navigation
  - **Goal:** Reduce noise from older artifacts without deleting history.
  - **AC:** Old `cortex/docs/CHANGES_*.md` and `artifacts/analysis/*.md` are clearly labeled as historical and are not linked from primary entrypoints unless necessary.
  - **If Blocked:** Add a single “Historical docs index” section listing them.

- [ ] **38.3.2** Merge or remove duplicate runbooks
  - **Goal:** Ensure there is one operational runbook per role (Cortex vs Ralph) and links point to the right one.
  - **AC:** `cortex/docs/RUNBOOK.md` and `workers/ralph/README.md` do not contain overlapping “how to run” instructions; one links to the other where appropriate.
  - **If Blocked:** Add a “Canonical runbook is X” note at the top of the non-canonical file.

---

### Task 38.4: Cross-link consistency + naming conventions

- [ ] **38.4.1** Standardize references to canonical files across the repo
  - **Goal:** Make cross-links consistent (same terminology, same paths).
  - **AC:** References to key files use consistent names/paths:
    - `workers/IMPLEMENTATION_PLAN.md`
    - `workers/PLAN_DONE.md`
    - `workers/ralph/THUNK.md`
    - `skills/self-improvement/GAP_BACKLOG.md`
  - **If Blocked:** Fix only the most commonly referenced paths first.

- [ ] **38.4.2** Add/refresh “See also” sections on major docs
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

- [ ] **35.1.1** Review `GAP_BACKLOG.md` entries
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
  - **If Blocked:** Capture gaps in `skills/self-improvement/GAP_BACKLOG.md` and link them from the relevant Ralph skill doc.

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
