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

- Phase 0-Warn: Markdown lint errors (MD032, MD007, MD046)
- Phase 31: Brain Map V2 Core Interactions (node dragging, drag-to-link, dark mode, mobile)
- Phase 32: Brain Map V2 Discovery & Intelligence (path finder, AI insights, saved views)
- Phase 33: Brain Map V2 Polish & Power Features (temporal viz, collaboration, export)

<!-- Cortex adds new Task Contracts below this line -->

## Phase 36: Brain Map V2 UX + Interaction Fixes

**Context:** Recent Brain Map V2 work improved dark mode, label readability, and timeline performance, but several interaction bugs remain (label hover geometry/duplication, node drag repulsion, Quick Add details panel not reflecting created nodes).

**Goal:** Make core interactions predictable and readable: always-visible labels, hover label upgrade without duplication, stable node dragging (no magnet repulsion), and Quick Add details panel correctly reflecting selected/created nodes.

**Success Criteria:**

- Dark mode consistently applies to all panels and inputs
- Node labels are readable in dark mode at all zoom levels
- Hover label uses a pill with black text without duplicating/misaligning labels
- Dragging a node does not cause nearby nodes to drift/repel
- Quick Add details panel correctly shows ID/Title/Type for the relevant node (selected/created)

---

### Task 36.1: Label rendering correctness (always-visible + hover upgrade)

- [ ] **36.1.1** Align hover label geometry with Sigma defaults (no clipped first letters)
  - **Goal:** Fix hover pill positioning so the node circle does not cover the start of the label.
  - **AC:** Hover label pill never overlaps the first characters of the label at any zoom; label baseline matches Sigma disc-node label placement.
  - **If Blocked:** Copy Sigma’s `drawDiscNodeHover` geometry from `node_modules/sigma` into the hover draw override and only change fill colors.

- [ ] **36.1.2** Remove hover/zoom label duplication by matching default placement and ensuring hover “upgrades” the same label
  - **Goal:** Hover should visually upgrade the existing label (pill) rather than showing a second label in a different place.
  - **AC:** When zoomed-in labels are visible, hovering a node results in exactly one label being readable (the pill version), with no second label visible/offset.
  - **If Blocked:** Consider temporarily suppressing base label rendering for the hovered node (e.g., during `enterNode`, set node `label` to empty and restore on `leaveNode`) and document tradeoffs.

- [ ] **36.1.3** Ensure label colors are correct in dark mode for both base and hover labels
  - **Goal:** Base labels render white in dark mode; hover pill renders black text on white pill.
  - **AC:** Dark mode: base labels are white; hover labels are black-on-white; light mode remains readable.
  - **If Blocked:** Add a small “label rendering debug” toggle to log active Sigma settings (labelColor, defaultDrawNodeHover) while diagnosing.

---

### Task 36.2: Node dragging stability (stop magnet repulsion)

- [ ] **36.2.0** Fix Locked/Auto toggle UI labeling (currently inverted)
  - **Goal:** Ensure the toggle label/state matches the actual behavior (Locked means manual/no simulation; Auto means layout running).
  - **AC:** When the UI shows “Locked”, nodes do not shift due to physics; when the UI shows “Auto”, layout/physics can run (when not dragging).
  - **If Blocked:** Add a temporary debug label showing the underlying boolean (e.g., `layoutLocked=true/false`) to confirm state-to-label mapping.

- [ ] **36.2.1** Stop layout/physics updates while dragging a node
  - **Goal:** Prevent other nodes from moving away when dragging a node near them.
  - **AC:** While dragging, all non-dragged nodes remain visually stable (no repulsion/drift); upon drop, graph remains stable.
  - **If Blocked:** Ensure ForceAtlas2 worker/supervisor is fully stopped/paused on `downNode` and only resumed (optionally) on `mouseup`.

- [ ] **36.2.2** Confirm locked-mode behavior: dragging should be purely positional (no simulation)
  - **Goal:** In “Locked” mode, dragging should only update the dragged node’s x/y.
  - **AC:** Locked mode: no layout forces applied during drag; Auto mode: layout may run when not dragging.
  - **If Blocked:** Add explicit “dragging” guard that disables any layout start/restart timers.

---

### Task 36.3: Quick Add / details panel correctness

- [ ] **36.3.1** Fix Quick Add details section (ID/Title/Type) so it reflects the correct node
  - **Goal:** The persistent section showing `ID/Title/Type/...` should update appropriately (selected node and/or newly created node), instead of staying blank.
  - **AC:** Creating a node updates the UI so the details section shows the new node’s Title/Type/ID as expected; selecting a node updates the same section consistently.
  - **If Blocked:** Identify the single source of truth (e.g., `selectedNode`, `selectedNodes`, or a dedicated `activeNodeDraft`) and refactor the section to use it.

- [ ] **36.3.2** Ensure Quick Add “Type/Status” defaults and casing map correctly to backend
  - **Goal:** Avoid mismatches where UI uses `Inbox`/`idea` but backend expects different casing/values.
  - **AC:** Newly created nodes appear in graph and in details panels with correct type/status; no silent drops.
  - **If Blocked:** Add backend validation error surfacing to the UI (toast showing response body).

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
