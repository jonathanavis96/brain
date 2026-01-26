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

## Phase 23: Loop Efficiency & Correctness Fixes

**Goal:** Fix bugs and inefficiencies in the Ralph loop that waste tokens and cause drift.

**Priority:** HIGH (correctness + biggest remaining efficiency wins)

**Reference:** Analysis of iteration logs showing repeated failures and unnecessary work.

### Phase 23.1: Correctness Fixes (HIGH)


### Phase 23.2: Staging Efficiency (HIGH - protected file)



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

## Phase 22: Markdown Lint Fixes

**Goal:** Fix manual markdown lint errors that auto-fix cannot resolve.

**Reference:** Markdown lint errors from pre-commit hook output.

**Priority:** HIGH (blocks clean pre-commit runs)

### Phase 22.2: THUNK.md Table Fixes


### Phase 22.3: MD032 Fixes - Lists Need Blank Lines (cortex/)




### Phase 22.4: MD032 Fixes - Lists Need Blank Lines (workers/)




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

### Phase 22.7: MD024 Fixes - Duplicate Headings (cortex/PLAN_DONE.md)

- [ ] **22.7.1** Fix MD024 in cortex/PLAN_DONE.md line 186
  - **Goal:** Make duplicate heading unique (Context: "Archived on 2026-01-26")
  - **Fix:** Add time or sequence number to differentiate (e.g., "Archived on 2026-01-26 (Morning)")
  - **AC:** `markdownlint cortex/PLAN_DONE.md` passes (no MD024 errors at line 186)

- [ ] **22.7.2** Fix MD024 in cortex/PLAN_DONE.md line 210
  - **Goal:** Make duplicate heading unique (Context: "Archived on 2026-01-26")
  - **Fix:** Add time or sequence number to differentiate (e.g., "Archived on 2026-01-26 (Afternoon)")
  - **AC:** `markdownlint cortex/PLAN_DONE.md` passes (no MD024 errors at line 210)

- [ ] **22.7.3** Fix MD024 in cortex/PLAN_DONE.md line 221
  - **Goal:** Make duplicate heading unique (Context: "Archived on 2026-01-26")
  - **Fix:** Add time or sequence number to differentiate (e.g., "Archived on 2026-01-26 (Evening)")
  - **AC:** `markdownlint cortex/PLAN_DONE.md` passes (no MD024 errors at line 221)

### Phase 22.8: MD012 Fixes - Multiple Consecutive Blank Lines (workers/IMPLEMENTATION_PLAN.md)

- [ ] **22.8.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md lines 31-33
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3, 4, 5)
  - **Context:** Lines 31 (Actual: 3), 32 (Actual: 4), 33 (Actual: 5)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at lines 31-33)

- [ ] **22.8.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md lines 39-40
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3, 4)
  - **Context:** Lines 39 (Actual: 3), 40 (Actual: 4)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at lines 39-40)

- [ ] **22.8.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 48
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **Context:** Line 48 (Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 48)

### Phase 22.9: MD055/MD056 Fixes - Table Issues (workers/ralph/THUNK.md)

- [ ] **22.9.1** Fix MD055/MD056 in workers/ralph/THUNK.md lines 815-828
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

- [ ] **22.10.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 32
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 32)

- [ ] **22.10.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 111
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 111)

- [ ] **22.10.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 112
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 4)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 112)

- [ ] **22.10.4** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 116
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 3)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 116)

- [ ] **22.10.5** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 117
  - **Goal:** Remove extra blank lines (Expected: 2; Actual: 4)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD012 errors at line 117)

### Phase 22.11: MD024 Fix - Duplicate Heading (workers/PLAN_DONE.md)

- [ ] **22.11.1** Fix MD024 in workers/PLAN_DONE.md line 49
  - **Goal:** Make duplicate heading unique (Context: "Archived on 2026-01-26")
  - **Fix:** Add time or sequence number to differentiate (e.g., "Archived on 2026-01-26 (Set 1)")
  - **AC:** `markdownlint workers/PLAN_DONE.md` passes (no MD024 errors at line 49)

---

<!-- Cortex adds new Task Contracts below this line -->
