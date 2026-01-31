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

**Context:** Markdown lint errors that could not be auto-fixed by `fix-markdown.sh`.

- [x] **WARN.MD040.test_md040.md** - Fix MD040 in tools/tests/fixtures/test_md040.md
  - **Issue:** Fenced code blocks at lines 5 and 18 are missing language specifiers
  - **Fix:** Add `bash` language tag to line 5 block, add `python` language tag to line 18 block
  - **AC:** `markdownlint tools/tests/fixtures/test_md040.md` passes (no MD040 errors)

---

## Phase 39: CodeRabbit-Style Semantic Review (LLM) + PR Gate

**Context:** CodeRabbit catches semantic/logic issues that syntax-only tooling misses (missing imports, inconsistent variable usage, doc-example drift, subtle shell pitfalls). We want a local, configurable semantic review layer that Ralph can run in PLAN iterations, plus a PR/branch diff reviewer for merge-to-main confidence.

**Goal:** Add an opt-in semantic reviewer that:

- Can run in **diff mode** (PR/branch vs `main`)
- Can run as an optional **pre-commit** hook
- Uses **`acli rovodev run`** (same runtime Ralph uses) when LLM mode is enabled
- Has safe defaults (no secrets required to run the repo; clean skip behavior)

**Success Criteria:**

- `python3 tools/semantic_reviewer.py --help` works.
- `bin/semantic-review-pr` (or equivalent) runs and exits 0 on a clean branch.
- Semantic review runs in **PLAN** only (not BUILD).

---

### Task 39.1: Semantic reviewer CLI (skeleton + git diff plumbing)

### Task 39.2: LLM provider using the Ralph runtime (`acli rovodev run`)

### Task 39.3: Non-LLM “common bug” checks (fast heuristics)

### Task 39.4: Developer entrypoints (pre-commit + PR command)

### Task 39.5: Ralph integration (PLAN-only semantic review)

- [x] **39.5.1** Run semantic review during PLAN only (not BUILD)
  - **Goal:** Run expensive semantic checks only when Ralph is reasoning.
  - **AC:** Logs show semantic review invoked in PLAN and not in BUILD.
  - **If Blocked:** Gate behind `SEMANTIC_REVIEW_PHASES=plan`.

### Task 39.6: Loop commit policy (BUILD no-commit; end-of-run commits)

- [x] **39.6.1** Verify BUILD never commits; PLAN commits still occur; end-of-run always commits
  - **Goal:** Ensure the loop’s commit behavior matches expectations.
  - **AC:**
    - BUILD phase does not create commits.
    - End-of-run flush commits after running `fix-markdown.sh` + pre-commit + verifier.
  - **If Blocked:** Add a regression test script under `workers/ralph/tests/` with a fake repo.

**Protected Hash Note:** If `workers/ralph/loop.sh` or `workers/ralph/verifier.sh` is modified, regenerate protected hashes and run `bash tools/validate_protected_hashes.sh`.

---
