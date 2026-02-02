# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-31 22:22:16

**Current Status:** Phase 39 completed - All tasks done. Ready for new phase planning.

**Recent Completions:**

- **Phase 39: CodeRabbit-Style Semantic Review (✅ COMPLETED 2026-01-31)** - Full semantic review tooling with LLM + heuristics, pre-commit integration, PR review script
- **Phase 28: Template Maintenance (✅ COMPLETED)** - Audited templates for drift, verified no critical issues
- **Phase 27: Skills Knowledge Base Expansion (✅ COMPLETED)** - Reviewed GAP_BACKLOG, promoted semantic code review skill
- **Phase 26: Environment & Testing Infrastructure (✅ COMPLETED)** - Brain Map testing setup and documentation
- **Phase 25: Brain Map (✅ COMPLETED)** - Full MVP with backend API, frontend UI, comprehensive tests

**Active Focus:**

- No active phases - awaiting Cortex guidance for Phase 40+
- Verifier status: 2 warnings (Protected file changes - human review required)

<!-- Cortex adds new Task Contracts below this line -->

## Phase 40: Workflow Hardening (Bug Packets + Review Gate)

- [ ] **40.1** Rename docs backlog folder to `docs/still-to-do/` and update references
  - **Goal:** Standardize docs folder naming (lowercase + kebab-case) without breaking internal links.
  - **AC:**
    - Folder exists at `docs/still-to-do/`
    - `docs/still-to-do/claude_team_workflow_tricks_mapping_plan.md` exists and renders with working TOC anchors
    - No remaining references to `docs/Still_To_Do/` in repo markdown (`grep -R "Still_To_Do" -n .` returns none)
    - (After rename) the old folder `docs/Still_To_Do/` no longer exists
    - Link validation passes: `bash tools/validate_links.sh`
  - **If Blocked:** If link validation is noisy due to unrelated links, scope it to docs only and report remaining failures.

- [ ] **40.2** Add Bug Packet template doc + keep `AGENTS.md` lean (pointer + policy)
  - **Goal:** Standardize bugfix task intake (repro + expected/actual + verification + proof) without bloating `AGENTS.md`.
  - **Dependencies:** Do **40.1** first so the source doc path is stable under `docs/still-to-do/`.
  - **Implementation:**
    - Create `docs/bug-packet-template.md` containing the “Bug Packet Template (strict)” from `docs/still-to-do/claude_team_workflow_tricks_mapping_plan.md` section E.
    - Treat `docs/CODERABBIT_ISSUES_TRACKER.md` as the long-lived “issue history + prevention ideas” document.
    - Update top-level `AGENTS.md` with a *short* “Bug Packets” section:
      - Link to `docs/bug-packet-template.md`.
      - State the policy: bugfix tasks must include repro + expected/actual + verification commands; completions must include proof + root cause + risk/rollback.
  - **AC:**
    - `docs/bug-packet-template.md` exists
    - `AGENTS.md` remains high-level (only a brief pointer/policy, not the full template)
    - `AGENTS.md` links to both `docs/bug-packet-template.md` and `docs/CODERABBIT_ISSUES_TRACKER.md`
    - `bash workers/ralph/fix-markdown.sh AGENTS.md docs/bug-packet-template.md` succeeds

- [ ] **40.3** Add a lightweight “Reviewer skepticism checklist” for complex changes
  - **Goal:** Introduce a consistent review gate (plan → skeptic review questions → implementation) for higher-risk work.
  - **Implementation:**
    - Add `docs/review-checklist.txt` with a 10–15 item checklist derived from section A/B (e.g., “prove it works”, “what could break”, “rollback”, “smallest tests”).
    - Add a short pointer in `workers/IMPLEMENTATION_PLAN.md` (or `AGENTS.md`) describing when to apply it (e.g., multi-file refactors, API changes, template sync, verifier changes).
  - **AC:**
    - `docs/review-checklist.txt` exists
    - At least one recent/next task in the plan references the checklist explicitly
  - **If Blocked:** If checklist becomes too long, keep only the “top 7” questions and defer the rest.

- [ ] **40.4** (Optional) Worktree + plan handoff conventions (docs-only)
  - **Goal:** Document a safe worktree workflow (wt-plan / wt-build / wt-analysis / wt-review) and a plan handoff mechanism.
  - **AC:**
    - `docs/worktrees.md` exists with the recommended conventions from section C/G
    - Includes a clear “default = commit plan artifact” rule and failure modes
  - **If Blocked:** Skip creating `docs/worktrees.md` and instead add a short section to `docs/BOOTSTRAPPING.md`.

---

## Phase 41: CodeRabbit Tracker → Atomic Fix Tasks

- [ ] **41.1** Triage `docs/CODERABBIT_ISSUES_TRACKER.md` and add only OPEN items as tasks
  - **Goal:** Convert the tracker into an actionable, non-duplicative Ralph backlog.
  - **AC:**
    - Every new task references a specific issue id (e.g., C2, M1) and file path/lines
    - Items already marked ✅ Fixed are NOT duplicated as new tasks

- [ ] **41.2** Fix C2: Shell README config mismatch
  - **Goal:** Align `skills/domains/languages/shell/README.md` with actual `.pre-commit-config.yaml` shfmt settings (or vice versa).
  - **AC:**
    - Docs match config after change
    - Doc validation passes (use `bash tools/validate_doc_sync.sh` if that is the canonical validator)

- [ ] **41.3** Fix M1: `bin/brain-event` robust flag parsing (missing value should not consume next option)
  - **Goal:** Make `--event` (and similar flags) safe when last arg or when next token is another option.
  - **AC:**
    - `bash -n bin/brain-event` passes
    - Add/extend `tests/unit/brain-event.bats` to cover:
      - `--event` as last arg
      - `--event --iter 1` does not treat `--iter` as the event value

- [ ] **41.4** Fix M10: `workers/ralph/THUNK.md` table column mismatch
  - **Goal:** Ensure all rows in the THUNK table have consistent column counts and escaped pipes.
  - **AC:**
    - `bash workers/ralph/fix-markdown.sh workers/ralph/THUNK.md`
    - `markdownlint workers/ralph/THUNK.md` passes (or at minimum no table-related rule failures)

- [ ] **41.5** Fix m1: Observability patterns code example issues
  - **Goal:** Correct broken/unsafe examples in `skills/domains/infrastructure/observability-patterns.md`.
  - **AC:**
    - No stray/duplicate code fences
    - Python examples are syntactically valid (where feasible)
    - SQL examples avoid injection patterns or are clearly labeled unsafe + corrected alternative

- [ ] **41.6** Fix m4: Incorrect future dates in documentation
  - **Goal:** Replace future dates with correct historical timestamps.
  - **AC:** No docs contain dates later than current date (2026-02-02)

- [ ] **41.7** Fix m6: Verify JS examples in `skills/domains/code-quality/test-coverage-patterns.md`
  - **Goal:** Confirm and correct the “Jest flag used incorrectly” and “Artifacts endpoint incorrect” items.
  - **AC:** Example commands are correct for the documented tooling (or annotated if intentionally pseudocode)

- [ ] **41.8** Fix m7: Git hygiene (`*.egg-info/`)
  - **Goal:** Prevent Python build artifacts from being committed.
  - **AC:**
    - `.gitignore` includes `*.egg-info/`
    - If any are tracked, remove them from git while keeping local files

- [ ] **41.9** (HUMAN REQUIRED / Protected) Address C1: SHA256 hash mismatches for protected files
  - **Goal:** Bring `.verify/*.sha256` baselines back into sync with protected targets, following waiver protocol.
  - **AC:** Verifier warnings about protected hash changes are resolved with explicit human approval where required.
  - **If Blocked:** Do not auto-update protected hashes without following the waiver/protected-file protocol.

- [ ] **41.10** (HUMAN REQUIRED / Protected) Decide on M2–M7 protected-script fixes
  - **Goal:** Decide whether to fix M2–M7 now or defer (these touch protected scripts: `workers/ralph/loop.sh`, `workers/ralph/verifier.sh`, `.verify/approve_waiver_totp.py`, etc.).
  - **AC:** Each item (M2, M3, M4, M5, M6, M7) has an explicit decision + next step (fix now with waiver vs defer) recorded in the tracker and/or plan.

