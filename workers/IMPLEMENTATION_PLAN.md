# Implementation Plan - Brain Repository

**Last Updated:** 2026-02-03 13:41:05

**Current Status:** Active tasks are currently the Phase 5 reference set (skill-suggest agreed list).

**Execution Order (Ralph):**

1. Phase 5: Skill-Suggest Recommendations (Agreed Reference Set)
2. Phase 6: Phase 3 Operator-Speed Improvements (statusline + notifications + voice)

<!-- Cortex adds new Task Contracts below this line -->

---

## Phase 6: Phase 3 Operator-Speed Improvements (statusline + notifications + voice)

> Source breakdown: `docs/still-to-do/phase3_statusline_notifications_voice_breakdown.md`.
>
> Goal: make it hard to run in the wrong worktree/branch, and make FAIL/HUMAN_REQUIRED runs loud without terminal babysitting.
>
> **Environment assumption:** WSL2 on Windows 11 (notifications are implemented via `powershell.exe` bridge from WSL → Windows).

- [x] **6.7** Voice (dictation): Document the intended workflow (Windows-native)
  - **Goal:** Reduce typing friction by having a consistent, repeatable dictation workflow.
  - **Implementation:** Add a short section to an appropriate doc (suggested: `docs/BOOTSTRAPPING.md` or `docs/events.md`) describing:
    - primary dictation mechanism (Windows dictation recommended)
    - where dictated text goes (bug packets, plan drafts, review notes)
    - 3–5 bullet “how to use it” steps
  - **AC:** Doc includes the workflow steps and “where text goes” guidance.
  - **If Blocked:** Add the workflow notes to `docs/still-to-do/phase3_statusline_notifications_voice_breakdown.md`.

---

**Legend:**

- `[ ]` = TODO
- `[~]` = IN_PROGRESS
- `[?]` = PROPOSED_DONE (pending verifier)
- `[x]` = VERIFIED_DONE

**Time Estimates:**

- [S] Small: 2-5 minutes
- [M] Medium: 8-15 minutes
- [L] Large: 15-25 minutes
