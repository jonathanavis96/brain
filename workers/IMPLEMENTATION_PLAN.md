# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-26 15:45:00

**Current Status:** Phase 23 (Loop Efficiency & Correctness) COMPLETE. All 6/6 tasks done.

**Active Phases:**

- **Phase 23: Loop Efficiency & Correctness Fixes (✅ 6/6 tasks complete)**
- Phase 21: Token Efficiency & Tool Consolidation (1 task remaining)
- Phase CR-6: CodeRabbit PR6 Fixes (✅ COMPLETED)
- Phase POST-CR6: Prevention Systems (✅ COMPLETED - all 7 tasks)
- Phase 10: RovoDev Parser & Observability (✅ COMPLETED - all 3 tasks)
- Phase 11: Thread Persistence & Search (✅ COMPLETED - all 4 tasks)
- Phase 12: Observability Improvements (🔄 IN PROGRESS - 1/4 tasks complete)
- Phases 13-20: Meta-tooling & Self-improvement (queued)

## Phase 22: Markdown Lint Fixes

**Goal:** Fix manual markdown lint errors that auto-fix cannot resolve.

**Reference:** Markdown lint errors from pre-commit hook output.

**Priority:** HIGH (blocks clean pre-commit runs)

### Phase 22.2: THUNK.md Table Fixes


### Phase 22.3: MD032 Fixes - Lists Need Blank Lines (cortex/)

### Phase 22.4: MD032 Fixes - Lists Need Blank Lines (workers/)

### Phase 22.4B: MD012 Fixes - Multiple Consecutive Blank Lines (workers/)

### Phase 22.4C: MD012 Fixes - Multiple Consecutive Blank Lines (cortex/)

### Phase 22.5: MD024 Fixes - Duplicate Headings (cortex/)


### Phase 22.6: MD001 Fix - Heading Increment (workers/)


### Phase 22.7: MD024 Fixes - Duplicate Headings (cortex/PLAN_DONE.md)


### Phase 22.8: MD012 Fixes - Multiple Consecutive Blank Lines (workers/IMPLEMENTATION_PLAN.md)

- [x] **22.8.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 48
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **Context:** Line 48 (Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 48)

### Phase 22.9: MD055/MD056 Fixes - Table Issues (workers/ralph/THUNK.md)

- [x] **22.9.1** Fix MD055/MD056 in workers/ralph/THUNK.md lines 815-828
  - **Goal:** Fix table pipe style and column count issues
  - **Context:** Multiple table rows with missing trailing pipes and incorrect column counts
  - **Details:**
    - Line 815:940 - Missing trailing pipe, too few cells (Expected: 5; Actual: 4)
    - Line 816:904 - Too many cells (Expected: 5; Actual: 7)
    - Line 820:758 - Too many cells (Expected: 5; Actual: 6)
    - Line 821:737 - Too many cells (Expected: 5; Actual: 6)
    - Line 822:946 - Too few cells (Expected: 5; Actual: 4)
    - Line 824:621 - Too many cells (Expected: 5; Actual: 6)
    - Line 825:1034 - Too many cells (Expected: 5; Actual: 6)
    - Line 826:828 - Missing trailing pipe (Expected: 5; Actual: 7)
    - Line 826:813 - Too many cells (Expected: 5; Actual: 7)
    - Line 827:370 - Too many cells (Expected: 5; Actual: 11)
    - Line 828:857 - Too many cells (Expected: 5; Actual: 8)
  - **AC:** `markdownlint workers/ralph/THUNK.md` passes (no MD055/MD056 errors at lines 815-828)

### Phase 22.10: MD012 Fixes - Multiple Consecutive Blank Lines (workers/IMPLEMENTATION_PLAN.md - NEW)

- [x] **22.10.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 32
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 32)

- [x] **22.10.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 111
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 111)

- [x] **22.10.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 112
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 4)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 112)

- [x] **22.10.4** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 116
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 116)

- [x] **22.10.5** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 117
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 4)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 117)

### Phase 22.11: MD024 Fix - Duplicate Heading (workers/PLAN_DONE.md)

- [x] **22.11.1** Fix MD024 in workers/PLAN_DONE.md line 49
  - **Goal:** Make duplicate heading unique (Context: "Archived on 2026-01-26")
  - **Fix:** Add time or sequence number to differentiate (e.g., "Archived on 2026-01-26 (Set 1)")
  - **AC:** `markdownlint workers/PLAN_DONE.md` passes (no MD024 errors at line 49)

---

## Phase 24: Template Drift Alignment (A1)

**Goal:** Align `templates/ralph/` to the accepted canonical Ralph layout `workers/ralph/` (ADR-0001) and backport the highest-impact, lowest-risk drift items from Brain `workers/ralph/` into templates in small, dependency-ordered batches.

**Reference Inputs:**

- `TEMPLATE_DRIFT_REPORT.md`
- `cortex/docs/ADR-0001-canonical-ralph-layout-workers-ralph.md`

**Ordering / Dependencies (execute in order unless noted):**

1. **24.1.1** Normalize template docs to canonical `workers/ralph/` (A1)
2. **24.1.2** Normalize template scripts to canonical `workers/ralph/` (A1)
3. **24.1.3** Audit templates for legacy `ralph/` paths and Brain-only path coupling
4. **24.2.1** Template `new-project.sh` (bootstrapping)
5. **24.3.1** Template `config/non_cacheable_tools.txt` (caching prerequisite)
6. **24.4.1** Backport `cerebras_agent.py` context management (stability)
7. **24.7.1** Backport `loop.sh` scoped staging improvements
8. **24.8.1** Backport `verifier.sh` caching (keep template path logic)
9. **24.9.1** Backport `current_ralph_tasks.sh` parsing improvements

> Notes: 24.5.1 (render_ac_status.sh) and 24.6.1 (model header + prompt batching) are gated by the Decisions Needed section and can be scheduled any time after 24.1.3.

### Phase 24.1: A1 Path Normalization Sweep (dependency-first)

- [ ] **24.1.1** Normalize template documentation to canonical `workers/ralph/` layout (A1)
  - **Goal:** Update template documentation so all examples and instructions refer to `workers/ralph/` (ADR-0001) and do not assume the legacy `ralph/` root.
  - **Scope:**
    - `templates/ralph/**/*.md`
  - **Non-goals:**
    - Do not modify Brain-only documentation under `workers/`.
    - Do not add dual-layout auto-detection guidance.
  - **Interfaces/Assumptions:**
    - Canonical layout is `workers/ralph/` (ADR-0001).
  - **Steps:**
    1. Search docs for legacy `ralph/` path references.
    2. Replace with `workers/ralph/` where the path refers to the Ralph root.
    3. Ensure docs do not reference Brain-only paths.
  - **Acceptance Criteria:**
    - `rg -n "(^|/)ralph/" templates/ralph/**/*.md` has no matches for layout-root paths (allowlist only if explicitly discussing historical drift).
    - `rg -n "workers/ralph" templates/ralph/**/*.md` shows updated canonical references.

- [ ] **24.1.2** Normalize template scripts to canonical `workers/ralph/` layout (A1)
  - **Goal:** Ensure template scripts operate correctly when installed under `workers/ralph/` and do not hardcode legacy `ralph/` layout paths.
  - **Scope:**
    - `templates/ralph/**/*.sh`
    - `templates/ralph/.verify/*` (only if any path references are embedded in these files)
  - **Non-goals:**
    - Do not add dual-layout auto-detection unless explicitly approved (ADR-0001 selects A1).
  - **Interfaces/Assumptions:**
    - Canonical layout is `workers/ralph/`.
    - Prefer `SCRIPT_DIR`/`BASH_SOURCE`-based root detection and/or `RALPH_PROJECT_ROOT` where appropriate.
  - **Steps:**
    1. Search scripts for hardcoded `ralph/` and other legacy paths.
    2. Update path computations and defaults to align with A1.
    3. Ensure no Brain-only relative paths (e.g., `../../brain/...`) are introduced.
  - **Acceptance Criteria:**
    - `rg -n "(^|/)ralph/" templates/ralph/**/*.sh` has no matches for layout-root paths.
    - `bash -n templates/ralph/*.sh templates/ralph/**/*.sh` passes.

- [ ] **24.1.3** Audit templates for legacy layout strings and Brain-only path coupling
  - **Goal:** Provide a deterministic verification pass that A1 normalization is complete before bootstrapping/caching work proceeds.
  - **Scope:**
    - `templates/ralph/` (entire subtree)
  - **Non-goals:**
    - Do not change Brain files.
  - **Interfaces/Assumptions:**
    - A1 is canonical.
  - **Steps:**
    1. Run repo-wide ripgrep checks for legacy layout markers.
    2. Fix any remaining violations found.
  - **Acceptance Criteria:**
    - `rg -n "(^|/)ralph/" templates/ralph` returns no matches (allowlist only if it is prose that explicitly discusses historical drift).
    - `rg -n "\.{2}/\.{2}/brain|/code/brain|workers/IMPLEMENTATION_PLAN\.md" templates/ralph` returns no matches.

### Phase 24.2: Bootstrapping (new projects must scaffold A1 correctly)

- [ ] **24.2.1** Template `workers/ralph/new-project.sh` bootstrapping script
  - **Dependencies:** 24.1.3 (A1 normalization + audit complete before copying/adjusting)
  - **Goal:** Ensure new projects can bootstrap Ralph using the same tool Brain uses, but without Brain-only assumptions.
  - **Scope:**
    - Add `templates/ralph/new-project.sh` sourced from `workers/ralph/new-project.sh` with template-appropriate path defaults.
    - Update any template docs that reference bootstrapping.
  - **Non-goals:**
    - Do not modify `workers/ralph/new-project.sh` in Brain as part of this task.
    - Do not add Brain repo-specific paths or branch names.
  - **Interfaces/Assumptions:**
    - Script must target canonical layout `workers/ralph/` and operate from an arbitrary repo root.
    - Script must not require files outside the target repo (no brain-relative references).
  - **Steps:**
    1. Copy `workers/ralph/new-project.sh` into `templates/ralph/new-project.sh`.
    2. Replace any Brain-only path assumptions with repo-root-relative detection.
    3. Ensure the script scaffolds `workers/ralph/` layout.
  - **Acceptance Criteria:**
    - `test -f templates/ralph/new-project.sh`
    - `bash -n templates/ralph/new-project.sh` passes.
    - `rg -n "brain" templates/ralph/new-project.sh` returns no Brain-specific path coupling (allowlist: comments that explain generic behavior without referencing this repo).
    - `rg -n "workers/ralph" templates/ralph/new-project.sh` returns matches showing canonical output paths.

### Phase 24.3: Caching Prerequisites (template parity)

- [ ] **24.3.1** Template `config/non_cacheable_tools.txt`
  - **Dependencies:** 24.1.3 (A1 normalization + audit complete)
  - **Goal:** Provide the config file required by caching-aware scripts so new projects work out-of-the-box.
  - **Scope:**
    - Add `templates/ralph/config/non_cacheable_tools.txt` based on `workers/ralph/config/non_cacheable_tools.txt`.
  - **Non-goals:**
    - Do not introduce Brain-only tool names unless they are generally applicable.
  - **Interfaces/Assumptions:**
    - Paths and scripts in templates should reference `workers/ralph/config/non_cacheable_tools.txt` (A1) after Phase 24.1.
  - **Steps:**
    1. Copy file into templates.
    2. Confirm referenced tools are generic.
  - **Acceptance Criteria:**
    - `test -f templates/ralph/config/non_cacheable_tools.txt`
    - `wc -l templates/ralph/config/non_cacheable_tools.txt` is greater than 0.
    - `diff -u workers/ralph/config/non_cacheable_tools.txt templates/ralph/config/non_cacheable_tools.txt` shows either identical content or only justified genericization edits.

### Phase 24.4: Stability Backports (Cerebras context management)

- [ ] **24.4.1** Backport Cerebras agent context-management improvements into templates
  - **Dependencies:** 24.1.3 (A1 normalization + audit complete)
  - **Goal:** Prevent token/context explosion in new projects by templating the battle-tested context-trimming logic from Brain.
  - **Scope:**
    - `templates/ralph/cerebras_agent.py`
    - (Optional) any template docs referencing Cerebras behavior
  - **Non-goals:**
    - Do not add Brain repo-specific defaults (paths, project names, task IDs).
  - **Interfaces/Assumptions:**
    - Drift report D06 describes specific constants and truncation limits to backport.
  - **Steps:**
    1. Diff `workers/ralph/cerebras_agent.py` vs `templates/ralph/cerebras_agent.py`.
    2. Backport only the context management, token/char limits, and summarization heuristics.
    3. Ensure defaults are safe and generic.
  - **Acceptance Criteria:**
    - `python3 -m py_compile templates/ralph/cerebras_agent.py` passes.
    - `rg -n "MAX_CONTEXT_CHARS|MAX_TOOL_RESULT_CHARS|KEEP_RECENT_TURNS|SUMMARIZE_AFTER_TURN" templates/ralph/cerebras_agent.py` finds the expected constants.

### Phase 24.5: Utility Adoption (optional)

- [ ] **24.5.1** Decide + (if approved) template `render_ac_status.sh`
  - **Dependencies:** 24.1.3 (A1 normalization + audit complete), DN-24.4 (decision)
  - **Goal:** Provide an optional utility to render verifier / AC status for humans without breaking canonical layout assumptions.
  - **Scope:**
    - If templated: `templates/ralph/render_ac_status.sh`
    - Update template docs to mention it as optional.
  - **Non-goals:**
    - Do not make the core loop/verifier depend on this utility.
  - **Interfaces/Assumptions:**
    - Must work with canonical `workers/ralph/` layout and `.verify/latest.txt` output location.
  - **Steps:**
    1. Inspect `workers/ralph/render_ac_status.sh` behavior and inputs.
    2. If generally useful, copy into templates and normalize paths per Phase 24.1.
  - **Acceptance Criteria:**
    - (If templated) `test -f templates/ralph/render_ac_status.sh`
    - (If templated) `bash -n templates/ralph/render_ac_status.sh` passes.
    - (If templated) `rg -n "workers/ralph" templates/ralph/render_ac_status.sh` shows canonical path usage.
  - **Risk/Notes:**
    - Gate on Decisions Needed below.

### Phase 24.6: Consistency (model header + prompt batching rule)

- [ ] **24.6.1** Align model-header single-source-of-truth + prompt batching rule across canonical files
  - **Dependencies:** DN resolution on what is authoritative (typically `workers/ralph/`), then apply to templates
  - **Goal:** Ensure the "model header" and "markdown batching" guidance are consistent between the canonical workers implementation and templates to prevent regressions.
  - **Scope:**
    - Inspect and, if needed, align the following pairs:
      - `workers/ralph/PROMPT.md` vs `templates/ralph/PROMPT.md`
      - `workers/ralph/loop.sh` vs `templates/ralph/loop.sh`
  - **Non-goals:**
    - Do not change protected/hash-guarded files without following repo protocol (if hashes are involved, handle via the existing baseline mechanisms).
  - **Interfaces/Assumptions:**
    - Canonical layout A1.
    - Recent fixes referenced in drift context: model header, markdown batching rule, `cleanup_plan.sh`.
  - **Steps:**
    1. Identify the authoritative wording/behavior for the model header and batching rule.
    2. Apply minimal edits to bring the non-authoritative copy in sync.
  - **Acceptance Criteria:**
    - `rg -n "markdown batching" workers/ralph/PROMPT.md templates/ralph/PROMPT.md` shows consistent guidance.
    - `rg -n "model header" workers/ralph/PROMPT.md templates/ralph/PROMPT.md` shows consistent guidance.
  - **Risk/Notes:**
    - May touch protected files in some repos; if blocked, break into a separate task with explicit hash-update steps.

### Phase 24.7: Loop Staging Improvements (backport-partial)

- [ ] **24.7.1** Backport `loop.sh` scoped staging improvements into templates (without Brain-specific paths)
  - **Dependencies:** 24.1.3
  - **Goal:** Improve signal-to-noise in commits by staging only scoped changes, while preserving template path logic and avoiding Brain-only assumptions.
  - **Scope:**
    - `templates/ralph/loop.sh`
  - **Non-goals:**
    - Do not copy Brain-specific denylist patterns or hardcoded file paths (drift report D11).
    - Do not change Brain `workers/ralph/loop.sh` in this task.
  - **Interfaces/Assumptions:**
    - Canonical layout A1 (`workers/ralph/`).
    - Use template-appropriate root detection (ADR-0001).
  - **Steps:**
    1. Diff `workers/ralph/loop.sh` vs `templates/ralph/loop.sh`.
    2. Backport `stage_scoped_changes()` and protected-file co-staging behavior.
    3. Ensure defaults remain safe (notably `CACHE_MODE=use` if applicable).
  - **Acceptance Criteria:**
    - `bash -n templates/ralph/loop.sh` passes.
    - `rg -n "stage_scoped_changes" templates/ralph/loop.sh` finds the function.
    - `rg -n "CACHE_MODE=use" templates/ralph/loop.sh` matches (or documented justified alternative).

### Phase 24.8: Verifier Caching Backport (keep template path logic)

- [ ] **24.8.1** Backport verifier caching into templates without regressing A1 root/path logic
  - **Dependencies:** 24.1.3, 24.3.1, 24.7.1
  - **Goal:** Speed up verifier runs via caching, while preserving the template’s correct root detection (`RALPH_PROJECT_ROOT` / `SCRIPT_DIR` relative) highlighted in drift report D15.
  - **Scope:**
    - `templates/ralph/verifier.sh`
    - `templates/ralph/config/non_cacheable_tools.txt` (must already exist from 24.3.1)
  - **Non-goals:**
    - Do not revert template root detection to Brain’s `$SCRIPT_DIR/../..` behavior.
    - Do not change Brain `workers/ralph/verifier.sh` in this task.
  - **Interfaces/Assumptions:**
    - 24.3.1 complete (config file exists).
    - A1 canonical layout.
  - **Steps:**
    1. Diff caching-related sections from `workers/ralph/verifier.sh`.
    2. Port cache key generation and lookup/store logic.
    3. Confirm root/path logic matches the template’s already-fixed version.
  - **Acceptance Criteria:**
    - `bash -n templates/ralph/verifier.sh` passes.
    - `rg -n "RALPH_PROJECT_ROOT" templates/ralph/verifier.sh` matches.
    - `rg -n "cache" templates/ralph/verifier.sh` shows caching logic present (human review allowed, but must be visible via grep).

### Phase 24.9: Observability Convenience (task monitor)

- [ ] **24.9.1** Backport `current_ralph_tasks.sh` parsing improvements into templates
  - **Dependencies:** 24.1.3
  - **Goal:** Improve task extraction/state tracking in new projects using the same generic parsing improvements validated in Brain (drift report D07).
  - **Scope:**
    - `templates/ralph/current_ralph_tasks.sh`
  - **Non-goals:**
    - Do not add Brain-specific parsing rules that assume Brain file layouts beyond A1.
  - **Interfaces/Assumptions:**
    - A1 canonical layout.
  - **Steps:**
    1. Diff `workers/ralph/current_ralph_tasks.sh` vs `templates/ralph/current_ralph_tasks.sh`.
    2. Backport generic improvements only.
  - **Acceptance Criteria:**
    - `bash -n templates/ralph/current_ralph_tasks.sh` passes.
    - `rg -n "improved|state|phase|task" templates/ralph/current_ralph_tasks.sh` shows updated parsing logic (exact tokens may differ; reviewer should confirm meaningful diff).

### Decisions Needed (to unblock templating work)

> Ralph should not guess on these; resolve explicitly or use the suggested default to proceed safely.

- **DN-24.1 (`RALPH.md`)**
  - **Decision needed:** Should `templates/ralph/RALPH.md` exist (and what is its purpose relative to `templates/ralph/README.md`)?
  - **Why it matters:** Avoid duplicative or misleading documentation in new projects.
  - **Where to inspect:** `templates/ralph/RALPH.md`, `templates/ralph/README.md`
  - **Suggested default:** Keep `RALPH.md` in templates but rewrite it to be a short "Ralph identity + layout" doc that points to README for operational details (ADR-0001 notes).

- **DN-24.2 (`PROMPT_cerebras.md`)**
  - **Decision needed:** Template `workers/ralph/PROMPT_cerebras.md` as an optional variant, or keep Brain-only?
  - **Why it matters:** Impacts usability for projects running Cerebras; avoids clutter for projects that don’t.
  - **Where to inspect:** `workers/ralph/PROMPT_cerebras.md` (source), `templates/ralph/` (destination)
  - **Suggested default:** Template it as optional; ensure scripts fall back to `PROMPT.md` if missing (ADR-0001 resolved follow-up).

- **DN-24.3 (`ralph.sh` wrapper)**
  - **Decision needed:** Is `workers/ralph/ralph.sh` a generally useful wrapper that should be templated?
  - **Why it matters:** Wrapper scripts can become "blessed" entrypoints; templating a Brain-specific wrapper would cause confusion.
  - **Where to inspect:** `workers/ralph/ralph.sh`, `templates/ralph/` for any existing wrapper conventions
  - **Suggested default:** Template it only if it is layout-agnostic and does not embed Brain branch names/paths.

- **DN-24.4 (`render_ac_status.sh`)**
  - **Decision needed:** Is `render_ac_status.sh` generally useful enough to template?
  - **Why it matters:** Low impact, but risks divergence if it depends on Brain-specific verifier output details.
  - **Where to inspect:** `workers/ralph/render_ac_status.sh`, `.verify/latest.txt` format assumptions
  - **Suggested default:** Do not template until verified it only depends on `.verify/latest.txt` and A1 paths.

- **DN-24.5 (`pr-batch.sh`)**
  - **Decision needed:** Should `pr-batch.sh` drift (D12) be backported to templates?
  - **Why it matters:** Incorrect assumptions about branch naming or paths can break PR automation.
  - **Where to inspect:** `workers/ralph/pr-batch.sh`, `templates/ralph/pr-batch.sh`
  - **Suggested default:** Defer unless drift is strictly bug-fix and layout normalization.

- **DN-24.6 (`HUMAN_REQUIRED.md` wording changes)**
  - **Decision needed:** Are wording changes in `HUMAN_REQUIRED.md` improvements that should be templated?
  - **Why it matters:** This doc controls when humans intervene; wording drift can alter workflow expectations.
  - **Where to inspect:** `workers/ralph/HUMAN_REQUIRED.md`, `templates/ralph/HUMAN_REQUIRED.md`
  - **Suggested default:** Only template changes that are A1 path normalization + clarity improvements.

---

<!-- Cortex adds new Task Contracts below this line -->
