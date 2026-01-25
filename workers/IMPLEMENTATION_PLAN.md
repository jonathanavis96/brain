# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-25 18:45:00

**Current Status:** CodeRabbit PR#5 fixes and prevention strategy tasks.

<!-- Cortex adds new Task Contracts below this line -->

## Phase 9C: Task Optimization (Batching + Decomposition)

**Goal:** Use Phase 0 structured logs to identify batching and decomposition opportunities, reducing task overhead and improving iteration success rate.

**Artifacts:** `artifacts/optimization_hints.md` (analysis output)

### Phase 9C.0: Prerequisites (Marker Pipeline Fix)

- [x] **9C.0.3** Document RovoDev tool instrumentation limitation
  - **Goal:** Clarify that RovoDev's native tools bypass shell wrapper
  - **AC:** `artifacts/optimization_hints.md` has "Limitations" section explaining tool visibility gap
  - **Note:** RovoDev bash/grep/find_and_replace_code don't go through `log_tool_start()`

### Phase 9C.1: Batching Infrastructure

- [x] **9C.1.1** Enhance `cortex/snapshot.sh` with batching hints
  - **Goal:** Show "⚡ Batching opportunities: X" when ≥3 similar pending tasks detected
  - **AC:** Snapshot output shows batching hints section when opportunities exist
  - **Detection:** Same error code (MDxxx, SCxxxx), same directory prefix, same file type

  - **Goal:** Document `[S/M/L]` complexity convention for task estimation
  - **AC:** PROMPT_REFERENCE.md has "Task Complexity" section with realistic time estimates (S=2-3min, M=5-10min, L=10-20min)

### Phase 9C.2: Apply Batching to Current Backlog

- [x] **9C.2.1** Create batch task template in `templates/ralph/PROMPT.md`
  - **Goal:** Standard format for batched tasks with multi-file scope
  - **AC:** Template shows batch task example with glob patterns and verification

  - **Scope:** Create `templates/javascript/`, `templates/go/`, `templates/website/`
  - **Steps:**
    1. Define standard template structure (AGENTS.md, NEURONS.md, VALIDATION_CRITERIA.md)
    2. Create all three directories with standard files in one pass
    3. **Templates contain pointers to brain skills, NOT duplicated content**
    4. Verify each directory has required files
  - **AC:** All three template directories exist with standard structure and skill references
  - **Replaces:** 6.1.1, 6.1.2, 6.3.1
  - **Status:** 6.1.1 and 6.1.2 complete, 6.3.1 pending

- [x] **9C.2.B2** BATCH: Update skills documentation (combines 7.2.1, 7.2.2)
  - **Scope:** `skills/index.md` + `skills/SUMMARY.md`
  - **Steps:**
    1. Scan `skills/domains/` and `skills/playbooks/` for all files
    2. Update `skills/index.md` with any missing entries
    3. Update `skills/SUMMARY.md` error reference and playbooks section
  - **AC:** Both index files list all current skills, SUMMARY includes playbooks
  - **Replaces:** 7.2.1, 7.2.2

- [x] **9C.2.B3** BATCH: Improve onboarding docs (combines 7.1.1, 7.1.2)
  - **Scope:** Root `README.md` + new `CONTRIBUTING.md`
  - **Steps:**
    1. Enhance README.md onboarding flow (quick start, navigation)
    2. Create CONTRIBUTING.md with guidelines
    3. Cross-link between files
  - **AC:** README has clear onboarding, CONTRIBUTING.md exists
  - **Replaces:** 7.1.1, 7.1.2

### Phase 9C.3: Decomposition Detection

- [x] **9C.3.1** Add duration tracking to `current_ralph_tasks.sh` footer
  - **Goal:** Show when current task exceeds 2x median (⚠️ warning)
  - **AC:** Footer shows "⚠️ Current task exceeding median" when appropriate

- [x] **9C.3.2** Create decomposition checklist in `skills/playbooks/`
  - **Goal:** Playbook for breaking down oversized tasks
  - **AC:** `skills/playbooks/decompose-large-tasks.md` exists with decision criteria

### Phase 9C.4: Validation

- [x] **9C.4.1** Validate batching recommendations against next 5 iterations
  - **Goal:** Measure if batched tasks reduce total time vs individual tasks
  - **AC:** Update `artifacts/optimization_hints.md` with before/after comparison

**Phase AC:**

- `artifacts/optimization_hints.md` updates from iter artifacts
- ≥3 batching opportunities identified with evidence
- ≥2 decomposition opportunities documented

---


## Phase 0-Warn: Verifier Warnings

**Goal:** Resolve verifier warnings from latest run.

**Status:** 2 warnings present - both require HUMAN INTERVENTION (protected file changes).

- [ ] **WARN.Protected.1** - Protected file changed (human review required) - HUMAN INTERVENTION REQUIRED
- [ ] **WARN.Protected.2** - Protected file changed (human review required) - HUMAN INTERVENTION REQUIRED

---

## Phase CR-5: Low Priority Fixes (CodeRabbit Remaining)

**Goal:** Address remaining low-priority CodeRabbit issues.

- [ ] **CR-5.1** Fix documentation status mismatches (D6, D7)
  - **File:** `workers/IMPLEMENTATION_PLAN.md`
  - **Issues:**
    - D6: Phase 2.1.2 status says "remains" but checkbox is complete
    - D7: Phase 12.4.2-12.4.3 status says "deferred" but checkboxes are checked
  - **Fix:** Reconcile checkbox state with status text descriptions
  - **AC:** All checkbox states match their corresponding status text

- [ ] **CR-5.2** Fix archive header handling in current_ralph_tasks.sh (Q1)
  - **File:** `workers/ralph/current_ralph_tasks.sh`
  - **Issue:** Archive headers not treated as section terminators
  - **Fix:** Update section parsing to recognize archive headers as terminators
  - **AC:** Script correctly handles archive sections in THUNK.md

- [ ] **CR-5.3** Fix cache key JSON passing in templates/ralph/loop.sh (Q2)
  - **File:** `templates/ralph/loop.sh`
  - **Issue:** Cache key JSON passed incorrectly to function
  - **Fix:** Correct the JSON parameter passing
  - **AC:** Cache key JSON is properly formatted and passed
  - **Note:** Protected file - may need hash regeneration after fix

- [ ] **CR-5.4** Fix artifacts download endpoint in test-coverage-patterns.md (Q11)
  - **File:** `skills/domains/code-quality/test-coverage-patterns.md`
  - **Issue:** Artifacts download endpoint path is incorrect
  - **Fix:** Update to correct GitHub Actions artifacts API endpoint
  - **AC:** Artifacts endpoint URL is accurate

---

## Notes

- **Protected files (loop.sh, verifier.sh, PROMPT.md):** Ralph can prepare fixes but human must update hashes
- **Hash regeneration:** Already handled by human - C1-C8 issues resolved
- **egg-info cleanup (G1):** Already fixed - directory removed and added to .gitignore
- **Reference:** See `docs/CODERABBIT_PR5_ALL_ISSUES.md` for complete issue list
