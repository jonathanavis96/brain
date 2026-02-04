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

- [x] **6.5** Integration: Make `bin/rovodev-run-notify` emit distinct notifications for HUMAN_REQUIRED
  - **Goal:** Human-required runs get a distinct title/message (and optional TTS), not just “failed”.
  - **Implementation:** Update wrapper to:
    - Run detector after completion (or tail log if provided).
    - If human-required: `bin/notify --level warn --sound --tts` with a distinct message.
  - **AC:** With a fixture log, wrapper chooses HUMAN_REQUIRED path (can be tested via `--dry-run`).
  - **If Blocked:** Skip TTS and use warn-level toast only.

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
