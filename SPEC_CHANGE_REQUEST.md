# Specification Change Request

**Date:** 2026-01-26
**Task:** 24.4.x - Protected loop.sh changes (observability headers) + (separate) guard/flush proposal
**Requestor:** Ralph (BUILD mode)
**Status:** Pending Human Approval

## Change Required

This repo currently contains an **already-applied** protected change to `workers/ralph/loop.sh` that adds observability headers:

- `# RUNNER: $RUNNER`
- `# MODEL: <effective_model>` where `effective_model="${RESOLVED_MODEL:-${MODEL_ARG:-auto}}"`

The protected baseline hash (`workers/ralph/.verify/loop.sha256`) was updated to match this change.

Separately (not yet applied unless explicitly confirmed), Phase 24 also proposes:

1) Integrating `guard_plan_only_mode()` calls before git operations (task 24.4.3)
2) Adding an end-of-run scoped "flush" commit (task 24.4.4)

**Files impacted:**

- `workers/ralph/loop.sh` (protected)
- `templates/ralph/loop.sh` (protected)
- corresponding `.verify/loop.sha256` baselines (human-updated)

## Rationale

### A) Observability header change (already applied)

- Makes loop output self-describing for debugging and PR review by emitting:
  - `# RUNNER: ...`
  - `# MODEL: ...` (effective model actually used)

### B) PLAN-only and end-of-run safety (proposed)

- **Task 24.4.3** requires adding PLAN-ONLY mode guards to prevent git operations (staging, committing, pushing) when `RALPH_MODE=PLAN`.
- **Task 24.4.4** requires a final end-of-run commit "flush" because commits of accumulated BUILD work currently only occur when the next PLAN iteration begins; ending the run on BUILD can leave uncommitted changes.

Both are part of Phase 24 safety/correctness guardrails.
**Dependency:** Task 24.4.2 (guard function in common.sh) is complete ✓

## Applied Changes (already in repo)

**File:** `workers/ralph/loop.sh` (protected)

**Change:** In the prompt header emitted during `run_once()`, add:

```bash
echo "# RUNNER: $RUNNER"

# Single source of truth: this is the model value loop.sh will actually use/pass to the runner.
# If RESOLVED_MODEL is empty (e.g. user asked for auto/latest), fall back to the requested MODEL_ARG.
local effective_model
effective_model="${RESOLVED_MODEL:-${MODEL_ARG:-auto}}"
echo "# MODEL: ${effective_model}"
```

**Baselines updated to match:**

- `workers/ralph/.verify/loop.sha256`
- `.verify/loop.sha256`

## Proposed Changes (not yet applied unless explicitly confirmed)

**File:** `workers/ralph/loop.sh` (protected)

**Modifications needed:**

1. **Before staging operations** (where `git add` is called):

   ```bash
   # Guard against staging in PLAN mode
   if ! guard_plan_only_mode "git add"; then
     log "Skipping staging (PLAN mode)"
     skip_staging=1
   fi
   ```

2. **Before commit operations** (where `git commit` is called):

   ```bash
   # Guard against commits in PLAN mode
   if ! guard_plan_only_mode "git commit"; then
     log "Skipping commit (PLAN mode)"
     skip_commit=1
   fi
   ```

3. **Before push operations** (where `git push` is called):

   ```bash
   # Guard against push in PLAN mode
   if ! guard_plan_only_mode "git push"; then
     log "Skipping push (PLAN mode)"
     return 0  # Continue loop without error
   fi
   ```

4. **Ensure common.sh is sourced** (add near top if not present):

   ```bash
   source "$(dirname "$0")/../shared/common.sh"
   ```

## Acceptance Criteria

Per task 24.4.3:

- With `RALPH_MODE=PLAN`, loop skips staging/commit operations
- Logs refusal once per action type (via guard function)
- Exits cleanly (no error state)
- Loop continues execution normally

## Testing Plan

After human applies changes and updates hash:

1. Test with `RALPH_MODE=PLAN`:

   ```bash
   export RALPH_MODE=PLAN
   bash workers/ralph/loop.sh --dry-run
   ```

   Expected: No git operations, clean exit with guard messages

2. Test without RALPH_MODE (normal operation):

   ```bash
   unset RALPH_MODE
   bash workers/ralph/loop.sh --dry-run
   ```

   Expected: Normal git operations proceed

## Impact Assessment

**Risk:** LOW

- Changes are defensive (guard-only, no behavior change in BUILD mode)
- Guard function already tested in common.sh
- Only affects behavior when `RALPH_MODE=PLAN` is explicitly set

**Benefits:**

- Prevents accidental file modifications during planning iterations
- Completes Phase 24 safety feature
- Aligns with plan-only mode design goals

## Next Steps

1. **Human reviews** this change request
2. **Human applies** modifications to `workers/ralph/loop.sh`
3. **Human regenerates** hash baselines (hash-only):
   - `sha256sum workers/ralph/loop.sh | cut -d' ' -f1 > workers/ralph/.verify/loop.sha256`
   - `sha256sum workers/ralph/loop.sh | cut -d' ' -f1 > .verify/loop.sha256`
4. **Human marks** task 24.4.3 as `[x]` complete in `workers/IMPLEMENTATION_PLAN.md`
5. **Ralph continues** with next task in BUILD mode

## Alternative Approaches Considered

**Alternative 1:** Keep loop.sh unmodified, rely on external enforcement

- **Rejected:** Less robust, requires discipline rather than technical guardrails

**Alternative 2:** Implement as separate wrapper script

- **Rejected:** Adds complexity, loop.sh is the natural integration point

**Alternative 3:** Make loop.sh non-protected

- **Rejected:** loop.sh is core infrastructure, should remain hash-guarded

## References

- Task definition: `workers/IMPLEMENTATION_PLAN.md` line 104
- Guard function: `workers/shared/common.sh::guard_plan_only_mode()`
- Protected files list: `AGENTS.md` → Safety Rules
- Hash guard: `.verify/loop.sha256`
