# Implementation Plan - Brain Repository

**Last Updated:** 2026-02-03 13:41:05

**Current Status:** Active tasks are currently the Phase 5 reference set (skill-suggest agreed list).

**Execution Order (Ralph):**

1. Phase 5: Skill-Suggest Recommendations (Agreed Reference Set)
2. Phase 6: Phase 3 Operator-Speed Improvements (statusline + notifications + voice)

<!-- Cortex adds new Task Contracts below this line -->

---

## Phase 7: Propagate Phase 6 notifications + HUMAN_REQUIRED markers into templates

> Goal: new repos created from templates inherit the Phase 6 operator-speed improvements (Windows notifications + TTS, canonical `:::HUMAN_REQUIRED::: <reason>` markers, and project-prefixed notification titles).
>
> **Policy:** Use project label = git repo root basename, with env override via `BRAIN_PROJECT_LABEL` (preferred) or `PROJECT_LABEL`.

- [x] **7.4** Update template Cortex launchers to use `bin/cortex-run-notify` (min 120s)
  - **Goal:** Running Cortex from a templated repo uses notifications for long sessions.
  - **Implementation:** Update:
    - `templates/cortex/cortex.bash`
    - `templates/cortex/cortex-PROJECT.bash`
    to call: `bin/cortex-run-notify --min-seconds 120 -- --config-file ... --yolo`.
  - **AC:** `bash -n templates/cortex/cortex.bash templates/cortex/cortex-PROJECT.bash`
  - **If Blocked:** If template install paths differ, adjust paths consistently across templates.

- [x] **7.5** Update template docs and references (wrapper rename + canonical marker)
  - **Goal:** Templates documentation matches the new canonical marker and wrapper names.
  - **Implementation:**
    - Update `templates/ralph/PROMPT.md` to document canonical `:::HUMAN_REQUIRED::: <reason>` (mention legacy fallback optionally).
    - Ensure no template docs reference `rovodev-run-notify`.
  - **AC:** `rg "rovodev-run-notify" templates/` returns no matches.
  - **If Blocked:** At minimum, add a short note in `templates/ralph/PROMPT.md` pointing to `docs/events.md` in this repo.

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
