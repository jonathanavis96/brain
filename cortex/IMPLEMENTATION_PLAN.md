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

## Phase 7: Propagate Phase 6 notifications + HUMAN_REQUIRED markers into templates

> Goal: new repos created from templates inherit the Phase 6 operator-speed improvements (Windows notifications + TTS, canonical `:::HUMAN_REQUIRED::: <reason>` markers, and project-prefixed notification titles).
>
> **Policy:** Use project label = git repo root basename, with env override via `BRAIN_PROJECT_LABEL` (preferred) or `PROJECT_LABEL`.

- [ ] **7.1** Add `bin/ralph-run-notify` wrapper (repo + templates)
  - **Goal:** Provide a simple entrypoint that runs the Ralph loop and notifies only for long runs.
  - **Implementation:**
    - Create `bin/ralph-run-notify` (modeled after `bin/cortex-run-notify`) with default `--min-seconds 120`.
    - Titles must be project-prefixed: `Ralph <project> complete|needs you|error`.
    - `bin/ralph-run-notify` should call `bash workers/ralph/loop.sh` and preserve exit code.
    - Propagate the wrapper into templates at `templates/ralph/bin/ralph-run-notify`.
  - **AC:**
    - `bash -n bin/ralph-run-notify templates/ralph/bin/ralph-run-notify`
    - `bin/ralph-run-notify --dry-run` shows `--min-seconds 120` and project-prefixed titles.
  - **If Blocked:** Add only the repo-level wrapper first, then copy it into templates in a follow-up task.

- [ ] **7.2** Ensure `bin/cortex-run-notify` is shipped in templates (and uses project-prefixed titles)
  - **Goal:** New repos created from templates include the Cortex wrapper and it produces `Cortex <project> ...` notifications.
  - **Implementation:**
    - Add `templates/ralph/bin/cortex-run-notify` (copy of repo `bin/cortex-run-notify`).
    - Ensure project label resolution uses: `BRAIN_PROJECT_LABEL` → `PROJECT_LABEL` → `git rev-parse --show-toplevel | basename` → `basename "$PWD"`.
  - **AC:**
    - `bash -n templates/ralph/bin/cortex-run-notify`
    - Wrapper emits titles like `Cortex brain complete` when run in this repo.
  - **If Blocked:** If templates layout requires a different install location, document the correct target path and update template callers.

- [ ] **7.3** Update `templates/ralph/loop.sh`: canonical `:::HUMAN_REQUIRED::: <reason>` marker + end-of-run notifications
  - **Goal:** Template Ralph loop behaves like the repo loop for human-required detection and Windows notifications.
  - **Implementation:**
    - Update template `check_human_intervention()` to detect canonical marker `^\s*:::HUMAN_REQUIRED:::` first (legacy fallback allowed).
    - Emit `emit_marker ":::HUMAN_REQUIRED::: protected file hash mismatches"` in protected-file failure paths.
    - Add end-of-run notify block (using `bin/notify`) with **project-prefixed** titles and `--tts/--sound` as in repo `workers/ralph/loop.sh`.
  - **AC:**
    - `bash -n templates/ralph/loop.sh`
    - `rg ":::HUMAN_REQUIRED:::" templates/ralph/loop.sh` shows both detection and emission
    - `rg "Ralph .*complete|Ralph .*needs you|Ralph .*error" templates/ralph/loop.sh`
  - **If Blocked:** Port only the HUMAN_REQUIRED detection/emission first; add notifications in a follow-up.

- [ ] **7.4** Update template Cortex launchers to use `bin/cortex-run-notify` (min 120s)
  - **Goal:** Running Cortex from a templated repo uses notifications for long sessions.
  - **Implementation:** Update:
    - `templates/cortex/cortex.bash`
    - `templates/cortex/cortex-PROJECT.bash`
    to call: `bin/cortex-run-notify --min-seconds 120 -- --config-file ... --yolo`.
  - **AC:** `bash -n templates/cortex/cortex.bash templates/cortex/cortex-PROJECT.bash`
  - **If Blocked:** If template install paths differ, adjust paths consistently across templates.

- [ ] **7.5** Update template docs and references (wrapper rename + canonical marker)
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
