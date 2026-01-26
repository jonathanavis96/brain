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





---

### Phase 24.2: Mitigation - Reduce Spam Without Hiding Real Errors (MEDIUM)




---

### Phase 24.3: Root Cause Fixes - Decision Tree (MEDIUM)

**Note:** Execute the appropriate task based on 24.1.4 classification. Only one branch should be needed.





---

### Phase 24.4: PLAN-ONLY Mode Guardrails (HIGH)

**Guard Interface Specification:**

- **Env var:** `RALPH_MODE=PLAN` (triggers guard; unset or `BUILD` = normal execution)
- **Guard function:** `guard_plan_only_mode <action>` in `workers/shared/common.sh`
- **Behavior:** Returns 0 (allowed) or 1 (blocked) based on action category
- **Blocked categories:** `git-write` (add/commit/push), `file-modify` (shfmt -w, markdownlint --fix), `verification` (verifier.sh, pre-commit)
- **Allowed categories:** `read` (cat, grep, git status, git diff), `plan-write` (edits to IMPLEMENTATION_PLAN.md only)



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


---

**Phase 24 Overall AC:**

- [ ] Emitter identified and documented in THUNK
- [ ] Root cause classified as HARMLESS-NOISE or ACTIONABLE-BUG with evidence
- [ ] Appropriate fix branch completed (one of 24.3.1-24.3.4)
- [ ] Spam reduced: normal runs show 1 contextual message + suppressed summary
- [ ] PLAN-ONLY guardrails documented and implemented
- [ ] Guard function tested: blocks forbidden actions, allows reads

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
