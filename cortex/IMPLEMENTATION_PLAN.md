# Implementation Plan - Brain Repository

**Last Updated:** 2026-02-02 15:26:05

**Current Status:** Phase 40 in progress (docs-only workflow hardening). Phase 41 queued (CodeRabbit tracker fixes).

**Execution Order (Ralph):**

1. Phase 40 (docs-only): reviewer checklist, then optional worktrees doc
2. Phase 41 (fixes): start with low-risk repo hygiene and markdown fixes, then docs/example fixes

<!-- Cortex adds new Task Contracts below this line -->

## Phase 40: Workflow Hardening (Bug Packets + Review Gate)

- [x] **40.3.1** Create `docs/review-checklist.txt`
  - **Goal:** Create a lightweight skepticism checklist reviewers can apply to complex changes.
  - **AC:**
    - `docs/review-checklist.txt` exists
    - Checklist is 10–15 items, plain text
  - **If Blocked:** If the checklist source material is unclear, draft a first-pass 10-item list and call out 1–2 items that may need refinement.

- [x] **40.3.2** Reference the checklist from `AGENTS.md`
  - **Goal:** Make the checklist discoverable without bloating `AGENTS.md`.
  - **Dependencies:** Do **40.3.1** first.
  - **AC:**
    - `AGENTS.md` links to `docs/review-checklist.txt`
    - `bash workers/ralph/fix-markdown.sh AGENTS.md` succeeds
  - **If Blocked:** If `AGENTS.md` is at risk of getting too long, keep it to a 2–3 line pointer and move any additional guidance into `docs/review-checklist.txt`.

- [x] **40.4** (Optional) Worktree + plan handoff conventions (docs-only)
  - **Goal:** Document a safe worktree workflow (wt-plan / wt-build / wt-analysis / wt-review) and a plan handoff mechanism.
  - **AC:**
    - EITHER `docs/worktrees.md` exists with the conventions from section C/G
    - OR `docs/BOOTSTRAPPING.md` contains a short section with the same conventions (if `docs/worktrees.md` is skipped)
    - Includes a clear "default = commit plan artifact" rule and common failure modes
  - **If Blocked:** If the source material is too long, write a minimal version: naming conventions + when to use which worktree + the "commit plan artifacts by default" rule.

---

## Phase 41: CodeRabbit Tracker → Atomic Fix Tasks

- [x] **41.8.1** Git hygiene: add `*.egg-info/` to `.gitignore`
  - **Goal:** Prevent Python build artifacts from being committed.
  - **AC:** `.gitignore` includes `*.egg-info/`
  - **If Blocked:** If `.gitignore` already contains an equivalent rule, link to the existing line in completion notes and mark done.

- [x] **41.8.2** Git hygiene: remove any tracked `*.egg-info/` from git index (if present)
  - **Goal:** Ensure the repo index is clean while keeping local files.
  - **Dependencies:** Do **41.8.1** first.
  - **AC:**
    - `git ls-files | grep -E '\\.egg-info(/|$)'` returns no matches
  - **If Blocked:** If none are tracked, record that fact in the task completion and mark done.

- [x] **41.4.1** Fix M10: repair `workers/ralph/THUNK.md` table formatting
  - **Goal:** Ensure all rows in the THUNK table have consistent column counts and escaped pipes.
  - **AC:**
    - `bash workers/ralph/fix-markdown.sh workers/ralph/THUNK.md`
    - `markdownlint workers/ralph/THUNK.md` passes (or at minimum no table-related rule failures)
  - **If Blocked:** If `markdownlint` is not available in the environment, run `bash workers/ralph/fix-markdown.sh ...` and ensure the table renders correctly (consistent pipes) and note the missing tool.

- [x] **41.2** Fix C2: Shell README config mismatch
  - **Goal:** Align `skills/domains/languages/shell/README.md` with actual `.pre-commit-config.yaml` shfmt settings (or vice versa).
  - **AC:**
    - Docs match config after change
    - Doc validation passes: `bash tools/validate_doc_sync.sh`
  - **If Blocked:** If the canonical validator differs, use the repo's documented doc validator and report which command was used.

- [x] **41.7.1** Fix m6: correct Jest flag example in `skills/domains/code-quality/test-coverage-patterns.md`
  - **Goal:** Ensure Jest CLI flags in examples are valid.
  - **AC:**
    - Example commands are correct for Jest (or explicitly marked as pseudocode)
    - Any shell snippets use `bash` fences and are copy/pastable
  - **If Blocked:** If repo tooling is not Jest, annotate the example as "tool-specific" and provide the correct command for the actual tool used in this repo.

- [x] **41.7.2** Fix m6: correct artifacts endpoint example in `skills/domains/code-quality/test-coverage-patterns.md`
  - **Goal:** Ensure the artifacts endpoint example matches the documented tooling (or is clearly labeled as an example).
  - **AC:**
    - Endpoint/example is correct, or explicitly annotated as tool-specific/pseudocode
  - **If Blocked:** If the correct endpoint depends on CI vendor, label the example with the vendor and provide at least one concrete correct endpoint.

- [x] **41.5.1** Fix m1: remove stray/duplicate code fences in `skills/domains/infrastructure/observability-patterns.md`
  - **Goal:** Make the markdown render correctly.
  - **AC:**
    - No stray/duplicate closing fences in the file
    - `markdownlint skills/domains/infrastructure/observability-patterns.md` has no fence-related failures (if rule enabled)
  - **If Blocked:** If markdownlint is unavailable, manually confirm rendered fences are balanced and note the limitation.

- [x] **41.5.2** Fix m1: correct SQL placeholder style + injection-risk example in `skills/domains/infrastructure/observability-patterns.md`
  - **Goal:** Remove unsafe SQL-injection patterns and keep placeholder style consistent inside each example.
  - **AC:**
    - SQL examples avoid injection patterns OR clearly label an unsafe example and provide a corrected safe alternative
    - Placeholder style is consistent within each SQL example (no mixing `?`/`%s`/`$1` in one example)
  - **If Blocked:** If the example is meant to be dialect-agnostic, use neutral pseudocode placeholders and clearly label it as pseudocode.

- [x] **41.5.3** Fix m1: correct Python example issues in `skills/domains/infrastructure/observability-patterns.md`
  - **Goal:** Fix broken Python snippets (e.g., references to non-existent attributes).
  - **AC:**
    - Python examples are syntactically valid (where feasible)
    - Example code does not reference obviously non-existent fields like `record.extra` unless defined in the snippet
  - **If Blocked:** If full correctness requires library-specific types, add a short comment explaining the assumed record fields/types.

- [x] **41.5.4** Fix m1: correct metrics middleware example in `skills/domains/infrastructure/observability-patterns.md`
  - **Goal:** Avoid hardcoded HTTP status in middleware examples.
  - **AC:** Middleware example does not hardcode status "200" (uses actual response status or equivalent).
  - **If Blocked:** If the framework example cannot access the status, explain the limitation and show the closest correct alternative.

- [x] **41.6.1** Fix m4: correct future date in `skills/domains/languages/typescript/README.md`
  - **Goal:** Remove future timestamps.
  - **AC:** No date in that file is later than 2026-02-02.
  - **If Blocked:** If the "date" is an example (not a real timestamp), label it clearly as an example and pick a non-future value.

- [x] **41.6.2** Fix m4: confirm repo has no future dates
  - **Goal:** Ensure no plan/docs contain future dates.
  - **AC:** `grep -R "2026-02-0[3-9]" -n .` returns no matches.
  - **If Blocked:** If grep hits generated artifacts, scope the search to `docs/`, `skills/`, `workers/`, and `cortex/` and report any remaining hits.

- [x] **41.1** (Last) Convert additional OPEN tracker items into new atomic plan tasks (bounded)
  - **Goal:** Keep the plan actionable without duplicating already-fixed items.
  - **Scope:** Create at most 5 new tasks from OPEN items in `docs/CODERABBIT_ISSUES_TRACKER.md` that are not already represented in this plan.
  - **AC:**
    - Each new task references a specific issue id and the file path/approximate lines from the tracker
    - Items marked ✅ Fixed in the tracker are not duplicated
  - **If Blocked:** If OPEN items are too broad, create tasks only for the highest-impact items (Critical/Major) and leave minor items in the tracker.

---

## Phase 43: CodeRabbit OPEN Issues (High Priority)

- [x] **43.1** Fix M1: bin/brain-event flag parsing bugs
  - **Ref:** `docs/CODERABBIT_ISSUES_TRACKER.md` M1, `bin/brain-event` lines 84-125
  - **Issues:**
    - Unbound variable error if flag is last arg (needs `${2-}` guard)
    - Flag parsing consumes next option when value missing (`--event --iter 1` treats `--iter` as value)
  - **Fix:**
    1. Add `${2-}` guards for all `$2` accesses in flag parsing
    2. Validate that flag values don't start with `--` before consuming them
    3. Add error message when flag value is missing
  - **AC:**
    - `bin/brain-event --event` prints error and exits (not unbound var crash)
    - `bin/brain-event --event --iter 1` treats `--iter` as separate flag, not value
    - All existing flag combinations still work correctly

- [x] **43.2** Fix M2: cleanup() not called in trap (loop.sh)
  - **Ref:** `docs/CODERABBIT_ISSUES_TRACKER.md` M2, `workers/ralph/loop.sh` lines 154-172
  - **Issue:** `cleanup_and_emit` function doesn't call `cleanup()`, leaves TEMP_CONFIG behind
  - **Fix:** Ensure `cleanup_and_emit` calls `cleanup()` before emitting status
  - **AC:**
    - `cleanup_and_emit` calls `cleanup()` function
    - TEMP_CONFIG is removed on trap exit
    - Manual test: `Ctrl+C` during loop leaves no temp files

- [x] **43.3** Fix M3: lookup_cache_pass missing argument (loop.sh)
  - **Ref:** `docs/CODERABBIT_ISSUES_TRACKER.md` M3, `workers/ralph/loop.sh` lines 1037-1038
  - **Issue:** Missing tool/runner arg, `non_cacheable_tools` ignored
  - **Fix:** Add missing argument to `lookup_cache_pass` function call
  - **AC:**
    - `lookup_cache_pass` receives all required arguments
    - `non_cacheable_tools` config is correctly respected
    - Shellcheck passes with no missing argument warnings

- [x] **43.4** Fix M4: cache-hit returns before cleanup (loop.sh)
  - **Ref:** `docs/CODERABBIT_ISSUES_TRACKER.md` M4, `workers/ralph/loop.sh` lines 1056-1068
  - **Issue:** Cache-hit early return skips temp prompt file cleanup
  - **Fix:** Move cleanup call before cache-hit return, or defer cleanup to trap
  - **AC:**
    - Cache-hit path cleans up temp prompt file
    - No temp files left after cache-hit execution
    - Manual test: trigger cache hit, verify no temp files remain

- [x] **43.5** Fix M10: workers/ralph/THUNK.md table column mismatch
  - **Ref:** `docs/CODERABBIT_ISSUES_TRACKER.md` M10, `workers/ralph/THUNK.md` lines 748, 770-782
  - **Issue:** Table rows have wrong column count (6 instead of 5), unescaped pipes
  - **Fix:**
    1. Identify all malformed table rows in THUNK.md
    2. Correct column count to match table header (5 columns)
    3. Escape any pipes within cell content using backslash
  - **AC:**
    - `markdownlint workers/ralph/THUNK.md` passes (no MD056 errors)
    - All table rows have exactly 5 columns
    - Table renders correctly in markdown preview

---

## Phase 42: Markdown Lint Fixes

- [x] **42.1** Fix MD001 in `docs/still-to-do/claude_team_workflow_tricks_mapping_plan.md`
  - **Goal:** Fix heading increment violation at line 477
  - **Issue:** Heading jumps from h1 to h3 without h2
  - **Fix:** Change heading level at line 477 from h3 (###) to h2 (##)
  - **AC:** `markdownlint docs/still-to-do/claude_team_workflow_tricks_mapping_plan.md` passes (no MD001 errors)

- [x] **42.2** Fix brain-event flag parsing regression
  - **Goal:** Fix `--event` flag parsing so it doesn't consume next flag as value
  - **Issue:** `bash tools/test_brain_event_parsing.sh` fails with "Error: --event requires a value (got flag: --iter)"
  - **Root Cause:** Line 108 in `bin/brain-event` checks `[[ -z "${1-}" ]]` but when `--event` has no value, `$1` contains the next flag (e.g., `--iter`)
  - **Fix:** Add check `[[ "$1" =~ ^-- ]]` before consuming value (similar to `--iter`, `--phase`, etc.)
  - **AC:** `bash tools/test_brain_event_parsing.sh` passes

- [x] **42.3** BATCH: Fix MD056 table column count errors in `TEMPLATE_DRIFT_REPORT.md`
  - **Goal:** Fix table formatting errors at lines 61, 77, and 87
  - **Issue:** Table rows have too few cells (Expected: 8 columns; Actual: 1)
  - **Fix:** Repair pipe separators in the three affected rows to ensure all 8 columns are present
  - **AC:** `markdownlint TEMPLATE_DRIFT_REPORT.md` passes (no MD056 errors)

- [x] **42.4** Fix MD040 in `TEMPLATE_DRIFT_REPORT.md`
  - **Goal:** Add language specification to fenced code block at line 254
  - **Issue:** Code fence missing language tag
  - **Fix:** Add appropriate language tag (likely `text` or `bash`) after opening ```
  - **AC:** `markdownlint TEMPLATE_DRIFT_REPORT.md` passes (no MD040 errors)
