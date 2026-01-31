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

- [ ] **39.1.1** Create `tools/semantic_reviewer.py` CLI skeleton + deterministic output format
  - **Goal:** Establish a stable CLI contract and findings schema without requiring any LLM access.
  - **AC:**
    - `python3 tools/semantic_reviewer.py --help` works.
    - `python3 tools/semantic_reviewer.py --paths README.md` exits 0 and prints either `0 findings` or `SKIPPED`.
  - **If Blocked:** Start with `--help` and `--paths` only; stub out remaining options.

- [ ] **39.1.2** Implement changed-file discovery for PR review (`--against` / `--git-diff`)
  - **Goal:** Make the tool able to review only the branch diff versus `main`.
  - **AC:**
    - `python3 tools/semantic_reviewer.py --against main` exits 0.
    - When `origin/main` exists, it is preferred over `main`.
  - **If Blocked:** Support only `--git-diff origin/main..HEAD` and document it.

### Task 39.2: LLM provider using the Ralph runtime (`acli rovodev run`)

- [ ] **39.2.1** Add `rovodev` provider that shells out to `acli rovodev run`
  - **Goal:** Use the same execution path as Ralph for semantic review.
  - **Implementation:**
    - Read prompt from a temp file and run:
      - `cat <prompt_file> | acli rovodev run --yolo [--config-file <tmp_config>]`
    - Parse LLM output into the findings schema.
  - **AC:**
    - With no provider configured: tool exits 0 with a clear `SKIPPED: No SEMANTIC_REVIEW_PROVIDER configured` message.
    - With `SEMANTIC_REVIEW_PROVIDER=rovodev` but not authenticated: tool exits 0 with `SKIPPED: Run 'acli rovodev auth'`.
  - **If Blocked:** Implement LLM call but return raw output without parsing (still stable, still exits 0).

- [ ] **39.2.2** Add canonical prompt template and strict output schema for the LLM
  - **Goal:** Ensure the LLM “knows what to look for” and outputs a consistent, automatable format.
  - **AC:** Prompt lives in `tools/prompts/semantic_review.txt` (or similar) and the reviewer loads it.
  - **If Blocked:** Inline the prompt first; add a follow-up task to externalize.

### Task 39.3: Non-LLM “common bug” checks (fast heuristics)

- [ ] **39.3.1** Implement 1–2 high-signal non-LLM checks with fixtures
  - **Goal:** Catch common CodeRabbit-style issues even without LLM access.
  - **AC:** At least 2 checks exist with fixture-based tests (e.g., `tests/unit/` or `tools/tests/`).
  - **If Blocked:** Implement only the markdown fenced-code sanity check first.

### Task 39.4: Developer entrypoints (pre-commit + PR command)

- [ ] **39.4.1** Add optional pre-commit hook `semantic-code-review`
  - **Goal:** Allow manual or CI usage via pre-commit.
  - **AC:** `pre-commit run semantic-code-review --all-files` exits 0 when provider missing (skip).
  - **If Blocked:** Set `stages: [manual]` only.

- [ ] **39.4.2** Add `bin/semantic-review-pr` (diff vs main)
  - **Goal:** One command to review the current branch vs `main`.
  - **AC:** Script exists, is executable, and exits 0 on a clean branch.
  - **If Blocked:** Put the script under `tools/` and call it from docs.

### Task 39.5: Ralph integration (PLAN-only semantic review)

- [ ] **39.5.1** Run semantic review during PLAN only (not BUILD)
  - **Goal:** Run expensive semantic checks only when Ralph is reasoning.
  - **AC:** Logs show semantic review invoked in PLAN and not in BUILD.
  - **If Blocked:** Gate behind `SEMANTIC_REVIEW_PHASES=plan`.

### Task 39.6: Loop commit policy (BUILD no-commit; end-of-run commits)

- [ ] **39.6.1** Verify BUILD never commits; PLAN commits still occur; end-of-run always commits
  - **Goal:** Ensure the loop’s commit behavior matches expectations.
  - **AC:**
    - BUILD phase does not create commits.
    - End-of-run flush commits after running `fix-markdown.sh` + pre-commit + verifier.
  - **If Blocked:** Add a regression test script under `workers/ralph/tests/` with a fake repo.

**Protected Hash Note:** If `workers/ralph/loop.sh` or `workers/ralph/verifier.sh` is modified, regenerate protected hashes and run `bash tools/validate_protected_hashes.sh`.

---

