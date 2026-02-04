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

- [ ] **6.1** Statusline: Ensure prompt/worktree label recipe exists and meets the minimal requirements
  - **Goal:** Before running `acli rovodev run`, the prompt makes it obvious which repo/worktree/branch you’re in.
  - **Implementation:** Confirm `docs/worktrees.md` includes (or update it to include) a minimal bash prompt recipe that shows:
    - repo name (or unmistakable repo path)
    - git branch
    - dirty/clean indicator
    - exit status of last command
    - a worktree label (env var `BRAIN_WT=...` or derived)
  - **AC:** `docs/worktrees.md` “Prompt/Statusline Configuration” section includes a copy/paste snippet and notes for labeling worktrees.
  - **If Blocked:** Document only the env-var worktree label approach (`BRAIN_WT`) and branch/dirty indicators.

- [ ] **6.2** Notifications: Document a single “event → notification” contract
  - **Goal:** There is one canonical mapping of lifecycle events (start/success/fail/human-required) to notification behavior.
  - **Implementation:** Add a short section (recommended: `docs/events.md` or a new section in `docs/TOOLS.md`) that defines:
    - events: Start, Success, Fail, Human-required
    - minimum signal types: toast (implemented), sound (optional), TTS (optional)
    - what title/message should look like (short + scannable)
  - **AC:** Doc includes a compact table mapping event → title → level → optional sound/TTS; markdownlint passes.
  - **If Blocked:** Add the mapping to `docs/still-to-do/phase3_statusline_notifications_voice_breakdown.md` as the canonical table.

- [ ] **6.3** Wrapper: Make `bin/rovodev-run-notify` print a one-line summary even if notifications fail
  - **Goal:** If Windows toast is suppressed/unavailable, you still get an obvious terminal summary line.
  - **Implementation:** Update `bin/rovodev-run-notify` to always print a final line like:
    - `RovoDev: SUCCESS` / `RovoDev: FAIL (exit N)` / `RovoDev: HUMAN_REQUIRED (exit N)`
    - independent of whether `bin/notify` succeeds.
  - **AC:** In a simulated no-PowerShell environment (or by forcing `bin/notify` to fail), wrapper still prints the summary line.
  - **If Blocked:** Print the summary line only on non-zero exits.

- [ ] **6.4** Human-required: Pin and reference at least one real log/fixture proving detection works
  - **Goal:** Human-required detection is validated against a pinned example (fixture path) and is easy to reproduce.
  - **Implementation:** Ensure there is at least one fixture under `tools/tests/fixtures/` and:
    - add a tiny test (or extend existing tests) that asserts detection returns 0 for positive fixtures and 1 for negative
    - reference the fixture(s) from `docs/still-to-do/phase3_statusline_notifications_voice_breakdown.md` (or the new contract doc)
  - **AC:** `python3 tools/detect_human_required.py tools/tests/fixtures/human_required_positive.log` exits 0 and negative exits 1; tests cover both.
  - **If Blocked:** Document manual commands to run against the fixtures (no automated test).

- [ ] **6.5** Notification helper: Implement `--sound` and `--tts` in `bin/notify` (Windows PowerShell)
  - **Goal:** Optional audible signals are available for FAIL/HUMAN_REQUIRED without extra tooling.
  - **Implementation:** Update `bin/notify` so:
    - `--sound` plays a Windows system sound (e.g., `[System.Media.SystemSounds]::Exclamation.Play()` or similar)
    - `--tts` speaks the message using `SAPI.SpVoice`
    - both remain best-effort (never fail the caller; fall back to console output)
  - **AC:** `bin/notify --dry-run --sound --tts --title test --message hi` describes both actions; real run attempts sound/TTS on Windows.
  - **If Blocked:** Implement `--sound` only and keep `--tts` as “not implemented” warning.

- [ ] **6.7** Voice (dictation): Document the intended workflow (Windows-native)
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
