# Implementation Plan - Brain Repository

**Last Updated:** 2026-02-02 15:24:49

**Current Status:** Phase 40 in progress (docs-only workflow hardening). Phase 41 queued (CodeRabbit tracker fixes).

**Execution Order (Ralph):**

1. Phase 40 (docs-only): reviewer checklist, then optional worktrees doc
2. Phase 41 (fixes): start with low-risk repo hygiene and markdown fixes, then docs/example fixes

<!-- Cortex adds new Task Contracts below this line -->

## Phase 40: Workflow Hardening (Bug Packets + Review Gate)

- [ ] **40.3.1** Create `docs/review-checklist.txt`
  - **Goal:** Create a lightweight skepticism checklist reviewers can apply to complex changes.
  - **Implementation:** Add `docs/review-checklist.txt` with 10–15 items derived from CodeRabbit guidance (prove it works, what could break, rollback, smallest tests, etc.).
  - **AC:**
    - `docs/review-checklist.txt` exists
    - Checklist is 10–15 items, plain text

- [ ] **40.3.2** Reference the checklist from `AGENTS.md`
  - **Goal:** Make the checklist discoverable without bloating `AGENTS.md`.
  - **Dependencies:** Do **40.3.1** first.
  - **Implementation:** Add a short pointer in `AGENTS.md` describing when to apply `docs/review-checklist.txt` (multi-file refactors, API changes, template sync, verifier/protected-file changes).
  - **AC:**
    - `AGENTS.md` links to `docs/review-checklist.txt`
    - `bash workers/ralph/fix-markdown.sh AGENTS.md` succeeds

- [ ] **40.4** (Optional) Worktree + plan handoff conventions (docs-only)
  - **Goal:** Document a safe worktree workflow (wt-plan / wt-build / wt-analysis / wt-review) and a plan handoff mechanism.
  - **Implementation:** Prefer creating `docs/worktrees.md`.
  - **AC:**
    - EITHER `docs/worktrees.md` exists with the conventions from section C/G
    - OR `docs/BOOTSTRAPPING.md` contains a short section with the same conventions (if `docs/worktrees.md` is skipped)
    - Includes a clear “default = commit plan artifact” rule and common failure modes

---

## Phase 41: CodeRabbit Tracker → Atomic Fix Tasks

- [ ] **41.8.1** Git hygiene: add `*.egg-info/` to `.gitignore`
  - **Goal:** Prevent Python build artifacts from being committed.
  - **AC:** `.gitignore` includes `*.egg-info/`

- [ ] **41.8.2** Git hygiene: remove any tracked `*.egg-info/` from git index (if present)
  - **Goal:** Ensure the repo index is clean while keeping local files.
  - **Dependencies:** Do **41.8.1** first.
  - **AC:**
    - `git ls-files | grep -E '\\.egg-info(/|$)'` returns no matches
  - **If Blocked:** If none are tracked, record that fact in the task completion and mark done.

- [ ] **41.4.1** Fix M10: repair `workers/ralph/THUNK.md` table formatting
  - **Goal:** Ensure all rows in the THUNK table have consistent column counts and escaped pipes.
  - **AC:**
    - `bash workers/ralph/fix-markdown.sh workers/ralph/THUNK.md`
    - `markdownlint workers/ralph/THUNK.md` passes (or at minimum no table-related rule failures)

- [ ] **41.2** Fix C2: Shell README config mismatch
  - **Goal:** Align `skills/domains/languages/shell/README.md` with actual `.pre-commit-config.yaml` shfmt settings (or vice versa).
  - **AC:**
    - Docs match config after change
    - Doc validation passes: `bash tools/validate_doc_sync.sh`

- [ ] **41.7.1** Fix m6: correct Jest flag example in `skills/domains/code-quality/test-coverage-patterns.md`
  - **Goal:** Ensure Jest CLI flags in examples are valid.
  - **AC:**
    - Example commands are correct for Jest (or explicitly marked as pseudocode)
    - Any shell snippets use `bash` fences and are copy/pastable

- [ ] **41.7.2** Fix m6: correct artifacts endpoint example in `skills/domains/code-quality/test-coverage-patterns.md`
  - **Goal:** Ensure the artifacts endpoint example matches the documented tooling (or is clearly labeled as an example).
  - **AC:**
    - Endpoint/example is correct, or explicitly annotated as tool-specific/pseudocode

- [ ] **41.5.1** Fix m1: remove stray/duplicate code fences in `skills/domains/infrastructure/observability-patterns.md`
  - **Goal:** Make the markdown render correctly.
  - **AC:**
    - No stray/duplicate closing fences in the file
    - `markdownlint skills/domains/infrastructure/observability-patterns.md` has no fence-related failures (if rule enabled)

- [ ] **41.5.2** Fix m1: correct SQL placeholder style + injection-risk example in `skills/domains/infrastructure/observability-patterns.md`
  - **Goal:** Remove unsafe SQL-injection patterns and keep placeholder style consistent inside each example.
  - **AC:**
    - SQL examples avoid injection patterns OR clearly label an unsafe example and provide a corrected safe alternative
    - Placeholder style is consistent within each SQL example (no mixing `?`/`%s`/`$1` in one example)

- [ ] **41.5.3** Fix m1: correct Python example issues in `skills/domains/infrastructure/observability-patterns.md`
  - **Goal:** Fix broken Python snippets (e.g., references to non-existent attributes).
  - **AC:**
    - Python examples are syntactically valid (where feasible)
    - Example code does not reference obviously non-existent fields like `record.extra` unless defined in the snippet

- [ ] **41.5.4** Fix m1: correct metrics middleware example in `skills/domains/infrastructure/observability-patterns.md`
  - **Goal:** Avoid hardcoded HTTP status in middleware examples.
  - **AC:** Middleware example does not hardcode status "200" (uses actual response status or equivalent).

- [ ] **41.6.1** Fix m4: correct future date in `skills/domains/languages/typescript/README.md`
  - **Goal:** Remove future timestamps.
  - **AC:** No date in that file is later than 2026-02-02.

- [ ] **41.6.2** Fix m4: correct future date reference in plan artifacts (if any)
  - **Goal:** Ensure no plan docs contain future dates.
  - **AC:** `grep -R "2026-02-0[3-9]" -n .` returns no matches.

- [ ] **41.1** (Last) Convert additional OPEN tracker items into new atomic plan tasks (bounded)
  - **Goal:** Keep the plan actionable without duplicating already-fixed items.
  - **Scope:** Create at most 5 new tasks from OPEN items in `docs/CODERABBIT_ISSUES_TRACKER.md` that are not already represented in this plan.
  - **AC:**
    - Each new task references a specific issue id and the file path/approximate lines from the tracker
    - Items marked ✅ Fixed in the tracker are not duplicated
