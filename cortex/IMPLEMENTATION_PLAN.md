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

## Phase 24: Session Termination 404 Investigation & PLAN-ONLY Guardrails

**Goal:** Diagnose and mitigate noisy "Session termination failed: 404" console spam; add PLAN-ONLY enforcement guardrails.

**Priority:** HIGH (noise pollution + pipeline waste prevention)

**Context:** Console prints `Session termination failed: 404` during agent runs, but the agent continues working. Likely a cleanup handler attempting to close a session that no longer exists. Additionally, PLAN-ONLY mode needs guardrails to prevent accidental implementation actions.

---

### Phase 24.1: Investigation - Find the Emitter (HIGH)

- [x] **24.1.1** Find exact emitter of "Session termination failed: 404" **[HIGH]**
  - **Goal:** Locate the file, function, and line that emits this exact string
  - **Steps:**
    1. `rg -n "Session termination failed" .` (literal string search)
    2. `rg -n "termination.*failed|failed.*terminat" --type sh --type py .`
    3. Check tool wrappers, shared libs (`workers/shared/`), and any HTTP client code
    4. If not in repo, check if it's from an external tool/dependency (note which one)
  - **AC:** Exact file:line documented in THUNK, or confirmation that it's external with tool name
  - **Files likely touched:** None (read-only investigation)

- [x] **24.1.2** Trace session lifecycle and termination call path **[HIGH]**
  - **Goal:** Document the full flow: session creation → storage → termination call
  - **Depends:** 24.1.1
  - **Steps:**
    1. In the emitter file, trace backwards: what calls the termination function?
    2. Find where session ID/resource ID originates
    3. Find what HTTP endpoint is being called (URL pattern)
    4. Check if termination is called from a finally/cleanup block
  - **AC:** Documented in THUNK: (1) session creation point, (2) session ID storage location, (3) termination trigger, (4) HTTP endpoint being hit
  - **Files likely touched:** None (read-only investigation)

- [x] **24.1.3** Capture minimal reproduction log snippet **[HIGH]**
  - **Goal:** Get a concrete example showing the error in context
  - **Depends:** 24.1.1
  - **Steps:**
    1. Run a minimal operation that triggers the error
    2. Capture 10-20 lines of surrounding log context
    3. Note: what action preceded it, what action followed, any correlated errors
  - **AC:** Log snippet in THUNK showing error + surrounding context
  - **Files likely touched:** None (read-only investigation)

- [x] **24.1.4** Classify 404 as harmless-noise vs actionable-bug **[HIGH]**
  - **Goal:** Determine if this causes real problems or is purely cosmetic
  - **Depends:** 24.1.2, 24.1.3
  - **Steps:**
    1. Check if leaked resources result from failed cleanup
    2. Check if subsequent operations fail due to this
    3. Check if session state becomes inconsistent
    4. Review: does agent continue successfully after error?
  - **AC:** Written conclusion in THUNK with evidence: "HARMLESS-NOISE" or "ACTIONABLE-BUG" + rationale
  - **Files likely touched:** None (read-only investigation)

---

### Phase 24.2: Mitigation - Reduce Spam Without Hiding Real Errors (MEDIUM)

- [x] **24.2.1** Instrument emitter with contextual info **[MEDIUM]**
  - **Goal:** When error occurs, include enough context to diagnose
  - **Depends:** 24.1.1, 24.1.4 (only if HARMLESS-NOISE)
  - **Steps:**
    1. Add to error message: component/tool name, action being performed
    2. Add session/resource ID (redact sensitive parts if needed)
    3. Add HTTP status code and endpoint (redacted)
  - **AC:** Error message includes: `[component] Session termination failed: 404 for [action] (id: xxx...)`
  - **Files likely touched:** File identified in 24.1.1

- [x] **24.2.2** Add dedupe/throttle for repeated identical errors **[MEDIUM]**
  - **Goal:** Same error within N seconds prints once + suppressed count
  - **Depends:** 24.2.1
  - **Steps:**
    1. At emitter (or nearest central logger), track last-error + timestamp
    2. If same error within 5 seconds, increment suppressed counter
    3. On different error or timeout, print summary: `(x3 similar suppressed)`
    4. Reset counter after summary
  - **AC:** Repeated 404s show: first occurrence, then `(xN suppressed)` summary
  - **Files likely touched:** File identified in 24.1.1, possibly `workers/shared/common.sh`

- [x] **24.2.3** Add DEBUG/VERBOSE toggle for full error output **[LOW]**
  - **Goal:** Allow full repeated output when debugging
  - **Depends:** 24.2.2
  - **Steps:**
    1. Check for existing DEBUG/VERBOSE env var or flag
    2. If DEBUG=1 or --verbose, skip dedupe and print all occurrences with full context
    3. Document the toggle in relevant AGENTS.md or README
  - **AC:** `DEBUG=1` prints all 404s; default prints dedupe summary
  - **Files likely touched:** File identified in 24.1.1

---

### Phase 24.3: Root Cause Fixes - Decision Tree (MEDIUM)

**Note:** Execute the appropriate task based on 24.1.4 classification. Only one branch should be needed.

- [x] **24.3.1** FIX IF: Double-termination / already-cleaned session **[MEDIUM]**
  - **Goal:** Make cleanup idempotent - safe to call multiple times
  - **Depends:** 24.1.4 (if root cause is double-termination)
  - **Steps:**
    1. Add guard: check if session is already terminated before calling terminate
    2. Use a flag/state variable to track "already cleaned"
    3. If already cleaned, log at DEBUG level and return success
  - **AC:** Calling terminate twice doesn't error; second call logs DEBUG and returns 0
  - **Files likely touched:** File with termination logic

- [x] **24.3.2** FIX IF: Stale/invalid session ID **[MEDIUM]**
  - **Goal:** Fix lifecycle ordering so session ID is valid at termination time
  - **Depends:** 24.1.4 (if root cause is stale ID)
  - **Steps:**
    1. Find where session ID is stored and when it's invalidated
    2. Ensure termination happens BEFORE ID invalidation
    3. Or: clear stored ID after successful termination, check for empty before calling
  - **AC:** Termination always uses valid ID; no 404 from stale references
  - **Files likely touched:** Session management code

- [x] **24.3.3** FIX IF: Wrong endpoint/path **[MEDIUM]**
  - **Goal:** Correct the termination endpoint URL
  - **Depends:** 24.1.4 (if root cause is wrong endpoint)
  - **Steps:**
    1. Compare actual endpoint vs expected endpoint (from API docs)
    2. Fix URL construction or path template
    3. Add capability check: verify endpoint exists before calling
  - **AC:** Termination calls correct endpoint; 404 no longer occurs
  - **Files likely touched:** HTTP client/endpoint configuration

- [x] **24.3.4** FIX IF: External best-effort cleanup (expected 404) **[MEDIUM]**
  - **Goal:** Downgrade to DEBUG level since 404 is expected/harmless
  - **Depends:** 24.1.4 (if classification is HARMLESS-NOISE from external service)
  - **Steps:**
    1. Catch 404 specifically in the termination error handler
    2. Log at DEBUG level: "Session already terminated (404 - expected)"
    3. Return success (exit 0) since cleanup goal is achieved
    4. Keep ERROR level for other status codes (500, 403, etc.)
  - **AC:** 404 logs at DEBUG only; other errors still ERROR; exit code is 0 for 404
  - **Files likely touched:** Error handler in termination code

---

### Phase 24.4: PLAN-ONLY Mode Guardrails (HIGH)

**Guard Interface Specification:**

- **Env var:** `RALPH_MODE=PLAN` (triggers guard; unset or `BUILD` = normal execution)
- **Guard function:** `guard_plan_only_mode <action>` in `workers/shared/common.sh`
- **Behavior:** Returns 0 (allowed) or 1 (blocked) based on action category
- **Blocked categories:** `git-write` (add/commit/push), `file-modify` (shfmt -w, markdownlint --fix), `verification` (verifier.sh, pre-commit)
- **Allowed categories:** `read` (cat, grep, git status, git diff), `plan-write` (edits to IMPLEMENTATION_PLAN.md only)

- [x] **24.4.1** Document PLAN-ONLY boundary rules in AGENTS.md **[HIGH]**
  - **Goal:** Clear reference for what PLAN-ONLY mode can and cannot do
  - **Interface:** Document the guard spec above in human-readable form
  - **Steps:**
    1. Add section to `cortex/AGENTS.md`: "PLAN-ONLY Mode Boundaries"
    2. Document env var: `RALPH_MODE=PLAN` enables guard
    3. List blocked categories with examples:
       - `git-write`: `git add`, `git commit`, `git push`
       - `file-modify`: `shfmt -w`, `markdownlint --fix`, any `-w`/`--fix` flag
       - `verification`: `verifier.sh`, `pre-commit run`
    4. List allowed categories with examples:
       - `read`: `cat`, `grep`, `git status`, `git diff`, `git log`
       - `plan-write`: edits to `workers/IMPLEMENTATION_PLAN.md` only
    5. Note: violation prints refusal message and returns non-zero (fail-safe)
  - **AC:** AGENTS.md has PLAN-ONLY section documenting env var, blocked/allowed categories with examples
  - **Files likely touched:** `cortex/AGENTS.md`

- [x] **24.4.2** Add PLAN-ONLY guard function to shared lib **[MEDIUM]**
  - **Goal:** Reusable guard that blocks implementation actions in PLAN mode
  - **Depends:** 24.4.1
  - **Interface:**
    - Function: `guard_plan_only_mode <action>`
    - Location: `workers/shared/common.sh`
    - Env check: `[[ "${RALPH_MODE:-}" == "PLAN" ]]`
    - Returns: 0 = allowed, 1 = blocked
  - **Steps:**
    1. In `workers/shared/common.sh`, add function `guard_plan_only_mode()`
    2. Early return 0 if `RALPH_MODE != PLAN` (guard disabled)
    3. Pattern-match action against blocked categories:
       - `git add|git commit|git push` → blocked (git-write)
       - `*-w|*--fix|shfmt|markdownlint --fix` → blocked (file-modify)
       - `verifier.sh|pre-commit` → blocked (verification)
    4. If blocked: `echo "PLAN-ONLY: Refusing '$1'. Add task to plan instead." >&2; return 1`
    5. Otherwise: `return 0` silently
  - **AC:** `RALPH_MODE=PLAN guard_plan_only_mode "git commit"` prints refusal to stderr and returns 1
  - **Files likely touched:** `workers/shared/common.sh`

- [ ] **24.4.3** Integrate guard into loop.sh commit/staging section **[MEDIUM]**
  - **Goal:** Loop respects PLAN-ONLY mode for staging/commit actions
  - **Depends:** 24.4.2
  - **Interface:** Call `guard_plan_only_mode` before each git-write operation
  - **Steps:**
    1. Source `workers/shared/common.sh` if not already sourced
    2. Before `git add`: `guard_plan_only_mode "git add" || { log "Skipping staging (PLAN mode)"; skip_staging=1; }`
    3. Before `git commit`: `guard_plan_only_mode "git commit" || { log "Skipping commit (PLAN mode)"; skip_commit=1; }`
    4. Continue loop execution (don't abort on guard refusal)
  - **AC:** With `RALPH_MODE=PLAN`, loop skips staging/commit; logs refusal once per action type; exits cleanly
  - **Files likely touched:** `workers/ralph/loop.sh` (protected - requires human approval + hash update)
  - **Note:** Protected file - requires human approval

- [x] **24.4.4** Add acceptance test proving PLAN-ONLY mode is respected **[HIGH]**
  - **Goal:** Verify that PLAN-ONLY mode blocks all forbidden actions
  - **Depends:** 24.4.2, 24.4.3
  - **Interface:** Test script exercises `guard_plan_only_mode` with both modes
  - **Steps:**
    1. Create test script `tools/test_plan_only_guard.sh`
    2. Source `workers/shared/common.sh`
    3. **Test blocked actions (RALPH_MODE=PLAN):**
       - `guard_plan_only_mode "git add"` → assert exit 1 + stderr contains "PLAN-ONLY"
       - `guard_plan_only_mode "git commit"` → assert exit 1
       - `guard_plan_only_mode "shfmt -w"` → assert exit 1
       - `guard_plan_only_mode "markdownlint --fix"` → assert exit 1
       - `guard_plan_only_mode "pre-commit"` → assert exit 1
    4. **Test allowed actions (RALPH_MODE=PLAN):**
       - `guard_plan_only_mode "grep"` → assert exit 0, no stderr
       - `guard_plan_only_mode "cat"` → assert exit 0
       - `guard_plan_only_mode "git status"` → assert exit 0
    5. **Test guard disabled (RALPH_MODE unset):**
       - `guard_plan_only_mode "git commit"` → assert exit 0 (guard inactive)
    6. Print summary: "X/Y tests passed"
  - **AC:** `bash tools/test_plan_only_guard.sh` exits 0 with all tests passing
  - **Files likely touched:** `tools/test_plan_only_guard.sh` (new file)

---

**Phase 24 Overall AC:**

- [ ] Emitter identified and documented in THUNK
- [ ] Root cause classified as HARMLESS-NOISE or ACTIONABLE-BUG with evidence
- [ ] Appropriate fix branch completed (one of 24.3.1-24.3.4)
- [ ] Spam reduced: normal runs show 1 contextual message + suppressed summary
- [ ] PLAN-ONLY guardrails documented and implemented
- [ ] Guard function tested: blocks forbidden actions, allows reads

---

## Phase 23: Loop Efficiency & Correctness Fixes

**Goal:** Fix bugs and inefficiencies in the Ralph loop that waste tokens and cause drift.

**Priority:** HIGH (correctness + biggest remaining efficiency wins)

**Reference:** Analysis of iteration logs showing repeated failures and unnecessary work.

### Phase 23.1: Correctness Fixes (HIGH)


### Phase 23.2: Staging Efficiency (HIGH - protected file)


- [x] **23.2.3** Fix cleanup_plan.sh to reliably locate workers/IMPLEMENTATION_PLAN.md **[HIGH]**
  - **Goal:** Cleanup script works regardless of current working directory and never looks in the wrong folder.
  - **AC:**
    - Running from repo root, `workers/`, and `workers/ralph/` succeeds.
    - It cleans `[x]` tasks correctly and does not error on missing plan file.
  - **Implementation notes:**
    - Resolve repo root via script directory + `git rev-parse --show-toplevel` (if available) or deterministic path traversal.
    - Use explicit path: `$REPO_ROOT/workers/IMPLEMENTATION_PLAN.md`.
    - Add a clear error message if plan file genuinely missing.

- [ ] **23.2.2** End-of-loop cleanup when no unchecked tasks remain **[MEDIUM]**
  - **Goal:** When the loop is about to exit and there are 0 `- [ ]` tasks left, automatically leave the repo in a clean, consistent state.
  - **Behavior (must):**
    1. If there are no unchecked tasks, run the same cleanup routine used at PLAN start to remove `[x]` items from `workers/IMPLEMENTATION_PLAN.md` (so the plan ends clean).
    2. Do a final read-only review step (summary only): list remaining unchecked tasks (should be 0), show `git status --short`, show last commit, and stop. **No new tasks created.**
    3. If there are staged changes at this point, batch them into one final commit using the scoped staging rules (plan + THUNK + task files only; never artifacts/cortex copies/caches by default).
  - **AC:**
    - On a run that finishes all tasks, the plan contains no leftover `[x]` clutter (or only what cleanup policy allows).
    - Repo ends clean (`git status --short` empty) unless artifacts are intentionally left modified and are not staged.
    - No new tasks are appended during the final review step.
  - **Notes:** Must respect protected-file policy; if implementation touches protected files, human must approve + update hashes.

### Phase 23.3: Tool Efficiency (MEDIUM)


### Phase 23.4: Workflow Efficiency (LOW)


**Phase AC:**

- sync_completions_to_cortex.sh runs without errors (0 completions case and real completions)
- No cache.sqlite files tracked in git
- Staging excludes artifacts/cortex/cache by default
- snapshot.sh has option to skip dashboard regeneration
- fix-markdown can process specific file list

---

## Phase 9C: Task Optimization (Batching + Decomposition)

**Goal:** Use Phase 0 structured logs to identify batching and decomposition opportunities, reducing task overhead and improving iteration success rate.

**Artifacts:** `artifacts/optimization_hints.md` (analysis output)

### Phase 9C.0: Prerequisites (Marker Pipeline Fix)


### Phase 9C.1: Batching Infrastructure


### Phase 9C.2: Apply Batching to Current Backlog


### Phase 9C.3: Decomposition Detection


### Phase 9C.4: Validation

- [ ] **9C.4.1** Validate batching recommendations against next 5 iterations
  - **Goal:** Measure if batched tasks reduce total time vs individual tasks
  - **AC:** Update `artifacts/optimization_hints.md` with before/after comparison

**Phase AC:**

- `artifacts/optimization_hints.md` updates from iter artifacts
- ≥3 batching opportunities identified with evidence
- ≥2 decomposition opportunities documented

---

<!-- NOTE: Recurring processes moved to cortex/docs/RUNBOOK.md - not tasks -->

---

## Phase 21: Token Efficiency & Tool Consolidation

**Status:** Phase 21.1, 21.2, and 21.3.1-21.3.2 COMPLETE. One task remaining.

- [x] **21.3.3** Add tools reference to `skills/index.md` [LOW]
  - **Goal:** Include tools in searchable skills index
  - **AC:** Index has entry pointing to `docs/TOOLS.md`

---

## Phase 22: Markdown Lint Fixes

**Goal:** Fix manual markdown lint errors that auto-fix cannot resolve.

**Reference:** Markdown lint errors from pre-commit hook output.

**Priority:** HIGH (blocks clean pre-commit runs)

### Phase 22.2: THUNK.md Table Fixes


### Phase 22.3: MD032 Fixes - Lists Need Blank Lines (cortex/)

- [x] **22.3.1** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 159
  - **Goal:** Add blank line before list at line 159
  - **Context:** List starting with "- **Env var:** `RALPH_MODE=PLA...`"
  - **AC:** `markdownlint cortex/IMPLEMENTATION_PLAN.md` passes (no MD032 errors at line 159)

- [x] **22.3.2** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 241
  - **Goal:** Add blank line before list at line 241
  - **Context:** List starting with "- [ ] Emitter identified and d..."
  - **AC:** `markdownlint cortex/IMPLEMENTATION_PLAN.md` passes (no MD032 errors at line 241)

- [x] **22.3.3** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 295
  - **Goal:** Add blank line before list at line 295
  - **Context:** List starting with "- sync_completions_to_cortex.s..."
  - **AC:** `markdownlint cortex/IMPLEMENTATION_PLAN.md` passes (no MD032 errors at line 295)

### Phase 22.4: MD032 Fixes - Lists Need Blank Lines (workers/)

- [x] **22.4.1** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 159
  - **Goal:** Add blank line before list at line 159
  - **Context:** Same error as cortex/ - list starting with "- **Env var:** `RALPH_MODE=PLA...`"
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD032 errors at line 159)

- [x] **22.4.2** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 241
  - **Goal:** Add blank line before list at line 241
  - **Context:** Same error as cortex/ - list starting with "- [ ] Emitter identified and d..."
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD032 errors at line 241)

- [x] **22.4.3** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 295
  - **Goal:** Add blank line before list at line 295
  - **Context:** List starting with "- sync_completions_to_cortex.s..."
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD032 errors at line 295)

### Phase 22.4B: MD012 Fixes - Multiple Consecutive Blank Lines (workers/)

- [ ] **22.4B.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 261
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 261)

- [ ] **22.4B.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 290
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 290)

- [ ] **22.4B.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 315
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 315)

- [ ] **22.4B.4** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 319
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 319)

- [ ] **22.4B.5** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 320
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 4)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 320)

- [ ] **22.4B.6** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 321
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 5)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 321)

- [ ] **22.4B.7** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 325
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 325)

### Phase 22.4C: MD012 Fixes - Multiple Consecutive Blank Lines (cortex/)

- [ ] **22.4C.1** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 261
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint cortex/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 261)

- [ ] **22.4C.2** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 290
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint cortex/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 290)

- [ ] **22.4C.3** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 315
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint cortex/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 315)

- [ ] **22.4C.4** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 319
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint cortex/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 319)

- [ ] **22.4C.5** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 320
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 4)
  - **AC:** `markdownlint cortex/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 320)

- [ ] **22.4C.6** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 321
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 5)
  - **AC:** `markdownlint cortex/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 321)

- [ ] **22.4C.7** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 325
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint cortex/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 325)

### Phase 22.5: MD024 Fixes - Duplicate Headings (cortex/)

- [ ] **22.5.1** Fix MD024 in cortex/PLAN_DONE.md line 186
  - **Goal:** Make duplicate "Archived on 2026-01-26" heading unique
  - **Context:** Multiple "### Archived on 2026-01-26" headings
  - **Fix:** Add distinguishing suffix or merge sections
  - **AC:** `markdownlint cortex/PLAN_DONE.md` passes (no MD024 errors at line 186)

- [ ] **22.5.2** Fix MD024 in cortex/PLAN_DONE.md line 210
  - **Goal:** Make duplicate "Archived on 2026-01-26" heading unique
  - **Context:** Multiple "### Archived on 2026-01-26" headings
  - **Fix:** Add distinguishing suffix or merge sections
  - **AC:** `markdownlint cortex/PLAN_DONE.md` passes (no MD024 errors at line 210)

- [ ] **22.5.3** Fix MD024 in cortex/PLAN_DONE.md line 221
  - **Goal:** Make duplicate "Archived on 2026-01-26" heading unique
  - **Context:** Multiple "### Archived on 2026-01-26" headings
  - **Fix:** Add distinguishing suffix or merge sections
  - **AC:** `markdownlint cortex/PLAN_DONE.md` passes (no MD024 errors at line 221)

### Phase 22.6: MD001 Fix - Heading Increment (workers/)

- [ ] **22.6.1** Fix MD001 in workers/PLAN_DONE.md line 7
  - **Goal:** Fix heading level increment (Expected: h2; Actual: h3)
  - **Context:** File jumps from h1 to h3 without h2
  - **Fix:** Change line 7 from h3 to h2, or add h2 before it
  - **AC:** `markdownlint workers/PLAN_DONE.md` passes (no MD001 errors)

---

<!-- Cortex adds new Task Contracts below this line -->
