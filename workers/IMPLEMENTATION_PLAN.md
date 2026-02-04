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

- [ ] **6.2** Tooling: Add `bin/notify` (WSL-safe) for toast/sound/TTS with no-op fallback
  - **Goal:** A single helper command Ralph scripts can call to notify the operator.
  - **Implementation:** Create `bin/notify` that:
    - Accepts flags like `--title`, `--message`, `--level (info|warn|error)`, `--sound`, `--tts`.
    - Uses PowerShell when available (WSL): `powershell.exe -NoProfile -Command ...`.
    - If PowerShell is unavailable, prints a single-line fallback and exits 0.
    - Has `--dry-run` to print what would have happened.
  - **AC:** `bin/notify --dry-run --title test --message hi` exits 0 and prints intended action; script is executable.
  - **If Blocked:** Implement toast only first; leave sound/TTS as flags that warn “not implemented yet”.

- [ ] **6.3** Tooling: Add `bin/rovodev-run-notify` wrapper around `acli rovodev run`
  - **Goal:** Run RovoDev and get a loud signal on SUCCESS/FAIL, without changing Ralph loop internals.
  - **Implementation:** Create `bin/rovodev-run-notify` that:
    - Runs `acli rovodev run ...` (pass-through args).
    - On exit 0: calls `bin/notify --level info`.
    - On non-zero: calls `bin/notify --level error --sound`.
    - Supports `--dry-run` (does not execute acli).
  - **AC:** `bin/rovodev-run-notify --dry-run -- echo hi` prints the command it would run; real invocation preserves exit code.
  - **If Blocked:** Provide wrapper without dry-run; document that it is a thin pass-through.

- [ ] **6.4** Detection: Add “human-required” marker detection (regex list + fixture test)
  - **Goal:** Distinguish FAIL vs HUMAN_REQUIRED and notify differently.
  - **Implementation:** Create `tools/detect_human_required.py` (or a small `bin/` helper) that:
    - Accepts a log file path (or stdin).
    - Returns exit code 0 if human-required markers found, 1 otherwise.
    - Uses a small, documented regex list (e.g., `HUMAN REQUIRED`, `CAPTCHA`, `Approve waiver`, `manual intervention`).
    - Add a minimal test/fixture log file under `tools/tests/fixtures/`.
  - **AC:** Running detector against fixture returns expected exit code; add a short usage note in the script help.
  - **If Blocked:** Start with a bash/rg-based detector and upgrade to Python later.

- [ ] **6.5** Integration: Make `bin/rovodev-run-notify` emit distinct notifications for HUMAN_REQUIRED
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
