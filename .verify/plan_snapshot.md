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

<!-- Cortex adds new Task Contracts below this line -->

## Phase 1: Iteration Summary Reliability / Discord summaries

**Context:** The current system sometimes prints "No structured summary found in logs." Example logs contain a response header line ("─── Response ─────────────────────────────────────────"), then a multi-line STATUS header (e.g., `STATUS | ...` and one or more continuation lines like `phase=...`), then the plan/summary body, then a sentinel marker line (`:::PLAN_READY:::` or `:::BUILD_READY:::`). We need reliable iteration summary capture and Discord-ready formatting every time.

**Goal:** Make iteration summaries reliably captured and posted every time by:

1. Enforcing a strict structured summary block emitted by the agent on every iteration (PLAN + BUILD)
2. Making the log extractor robust (extract the block between the response header and the last `:::PLAN_READY:::` / `:::BUILD_READY:::` marker)
3. Producing a clean Discord payload (strip ANSI/ASCII art, remove STATUS + marker lines, format as readable headings + bullets, not a code block)

**Strict Output Contract (must be enforced via prompts/templates):**

At the end of every iteration (PLAN/BUILD), immediately before the marker line, output **exactly** this block shape:

- **Summary**
  - ...
- **Changes Made**
  - ...
- **Next Steps**
  - ...
- **Completed** (optional)
  - ...

**Rules:**

- Do not include ANSI framing/box lines.
- Do not include `STATUS | ...` lines in the summary block.
- Marker line must be on its own line after the block.

---

- [ ] **1.5** Robustly drop multi-line STATUS header (continuations only when immediately after STATUS)
  - **Goal:** Drop 2+ status lines reliably without deleting legitimate body content later.
  - **Inputs:** Extracted block starting at response header or STATUS.
  - **Outputs:** Clean body text without status header lines.
  - **Files likely to touch:** `workers/ralph/loop.sh` (cleaning stage inside `generate_iteration_summary()`)
  - **AC:**
    - Drops the `^STATUS |` line.
    - Then drops immediately following "status continuation" metadata lines only if they directly follow STATUS, stopping at the first blank line or first non-metadata body line.
    - Does not delete later `phase=` content in the body.
  - **Verification:**
    - `bash workers/ralph/tests/verify_summary_extraction.sh` covers a fixture where body includes later `phase=` text.
  - **Risk notes:** Overly broad continuation matching could delete real content.
  - **If Blocked:** Tighten continuation matching to an allowlist (e.g., `^(phase|step|tasks|file|runner|model)=`).

- [ ] **1.6** Add graceful fallback when markers exist but structured block cannot be extracted
  - **Goal:** If marker exists but block extraction fails, provide a Discord-friendly fallback including iteration metadata and an ANSI-stripped excerpt of the last ~40 lines.
  - **Inputs:** Raw log text with marker present.
  - **Outputs:** Fallback summary message (not a code block) including iteration number, phase, log path, and excerpt.
  - **Files likely to touch:** `workers/ralph/loop.sh` (fallback branch in `generate_iteration_summary()`)
  - **AC:**
    - If markers exist but extraction fails, output includes iteration number, phase, log path, and a "Recent log excerpt" section of ~40 lines after ANSI stripping.
    - Output is formatted as readable headings + bullets; no code fences.
  - **Verification:**
    - Fixture case includes marker but no extractable block; verify output matches spec via `bash workers/ralph/tests/verify_summary_extraction.sh`.
  - **Risk notes:** Excerpts can leak noise; ensure ANSI and decorative lines are stripped.
  - **If Blocked:** Reduce excerpt length and ensure stripping is applied before truncation.

- [ ] **1.7** Update prompts/templates to force the strict summary block every iteration (PLAN + BUILD)
  - **Goal:** Ensure the agent always emits the strict block immediately before the marker line, regardless of other content.
  - **Inputs:** Strict contract from 1.2.
  - **Outputs:** Prompt instructions that force the strict summary block at end of every iteration.
  - **Files likely to touch:**
    - `workers/ralph/PROMPT.md`
    - `templates/ralph/PROMPT.md`
    - `templates/ralph/PROMPT.project.md`
    - Potentially `.verify/prompt.sha256`, `workers/ralph/.verify/prompt.sha256`, `templates/ralph/.verify/prompt.sha256`
  - **AC:**
    - Prompt explicitly instructs: "At the end of every iteration (PLAN/BUILD), immediately before the marker line, output EXACTLY this block shape:" and includes the strict headings and bullet requirements.
    - Explicitly forbids ANSI framing/box lines and forbids including STATUS lines inside the summary block.
    - Requires marker line on its own line after the block.
  - **Verification:**
    - `rg -n "EXACTLY this block shape" workers/ralph/PROMPT.md templates/ralph/PROMPT.md templates/ralph/PROMPT.project.md`
  - **Risk notes:** `workers/ralph/PROMPT.md` may be protected/hash-guarded and require hash regeneration.
  - **If Blocked:** Create/update `SPEC_CHANGE_REQUEST.md` and stop if protected-file changes are disallowed.

- [ ] **1.8** Produce a clean Discord payload (no code blocks; readable headings + bullets)
  - **Goal:** Discord messages should be readable markdown (bold headings + bullets), not wrapped in code fences.
  - **Inputs:** Generated summary content from `generate_iteration_summary()`.
  - **Outputs:** Discord webhook payload with clean markdown formatting.
  - **Files likely to touch:** `bin/discord-post`
  - **AC:**
    - `bin/discord-post` does not wrap content in triple-backtick fences (single and multi-chunk cases).
    - Chunking remains safe at ~1900 chars.
    - Headings and bullets are preserved.
  - **Verification:**
    - `echo "**Title**\n\n**Summary**\n- a" | DISCORD_WEBHOOK_URL=dummy bin/discord-post --dry-run | jq -r .content` contains no triple-backtick fences.
  - **Risk notes:** Some users may rely on code block formatting; change is intentional per spec.
  - **If Blocked:** Add a flag to preserve old behavior only if required by backward compatibility, otherwise proceed with spec.

- [ ] **1.9** Enforce compacting + truncation (< 1800 characters target)
  - **Goal:** Keep Discord summaries compact; if longer, truncate with a clear note and keep key sections.
  - **Inputs:** Potentially long extracted summaries.
  - **Outputs:** Truncated summary with "(truncated)" note when needed.
  - **Files likely to touch:** `workers/ralph/loop.sh` (preferred) and/or `bin/discord-post` (guardrail)
  - **AC:**
    - If generated summary exceeds ~1800 chars, it truncates and appends a "(truncated)" note.
    - Retains at least the title, Summary section, and Next Steps section.
  - **Verification:**
    - Add/extend a fixture with >1800 chars and validate truncation via `bash workers/ralph/tests/verify_summary_extraction.sh`.
  - **Risk notes:** Naive truncation can cut headings; ensure truncation preserves section boundaries where possible.
  - **If Blocked:** Truncate by sections rather than raw characters.

- [ ] **1.10** Propagate changes to templates to prevent drift
  - **Goal:** Ensure template Ralph loop + Discord tooling match the fixed behavior so new projects behave correctly.
  - **Inputs:** Implemented changes in workers.
  - **Outputs:** Template updates mirroring the same logic/behavior.
  - **Files likely to touch:**
    - `templates/ralph/loop.sh`
    - `templates/ralph/bin/discord-post`
    - `templates/ralph/PROMPT.md`
    - `templates/ralph/PROMPT.project.md`
  - **AC:**
    - Template versions match the fixed extraction logic, strict summary contract, and Discord formatting changes.
    - Any intentional differences are documented in comments.
  - **Verification:**
    - `rg -n "generate_iteration_summary" templates/ralph/loop.sh`
    - `diff -u bin/discord-post templates/ralph/bin/discord-post` (expect identical or documented deltas)
  - **Risk notes:** Template drift is a recurring source of regressions.
  - **If Blocked:** Split propagation into smaller tasks per file if changes are too large.

- [ ] **1.11** Verification / Done Definition (lint + end-to-end iteration)
  - **Goal:** Prove reliability end-to-end: strict block emitted, extractor finds correct block around last marker, Discord payload is clean.
  - **Inputs:** Updated prompts, extractor, Discord post tool, fixtures.
  - **Outputs:** Passing local checks and at least one end-to-end iteration producing a Discord-ready summary.
  - **Files likely to touch:** None (verification-only)
  - **AC:**
    - `markdownlint workers/IMPLEMENTATION_PLAN.md` succeeds.
    - `bash -n workers/ralph/loop.sh bin/discord-post` succeeds.
    - At least one end-to-end iteration produces a Discord-ready summary (dry-run acceptable): no ANSI, no marker line, no STATUS header, no code fences, readable headings + bullets.
  - **Verification:**
    - `markdownlint workers/IMPLEMENTATION_PLAN.md`
    - `bash -n workers/ralph/loop.sh bin/discord-post`
    - `DISCORD_WEBHOOK_URL=... bash workers/ralph/loop.sh --iterations 1` (or `bin/discord-post --dry-run` if no network)
  - **Risk notes:** Network/webhook failures should remain non-blocking; validate dry-run output if needed.
  - **If Blocked:** Use `--dry-run` for `bin/discord-post` and verify payload content locally.

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

- [ ] **37.1.1** Run link validation and fix broken internal links
  - **Goal:** Eliminate broken internal links across the repository.
  - **AC:** `bash tools/validate_links.sh` returns 0 errors.
  - **If Blocked:** Fix the highest-impact links first and list remaining failures in `docs/CHANGES.md`.

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
