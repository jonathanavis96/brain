# Implementation Plan - Brain Repository

**Last Updated:** 2026-02-03 13:41:05

**Current Status:** Active tasks are currently the Phase 5 reference set (skill-suggest agreed list).

**Execution Order (Ralph):**

1. Phase 5: Skill-Suggest Recommendations (Agreed Reference Set)
2. Phase 6: Phase 3 Operator-Speed Improvements (statusline + notifications + voice)

<!-- Cortex adds new Task Contracts below this line -->

---

## Phase 5: Skill-Suggest Recommendations (Agreed Reference Set)

> Source: `bin/skill-suggest` runs validated on 2026-02-03. These are the skill files we agreed are relevant; keep them here as a quick “what to read first” index when planning/triaging similar work.
>
> **Important:** These Phase 5 items are meant to be **atomic “pre-flight” tasks**. Each one should produce a tiny, explicit checklist in the iteration summary/THUNK entry (so we can prove the reference set was actually consulted).

- [ ] **5.1** Pre-flight (cache + shell-script bug work): consult shell variable + validation patterns
  - **When to use:** Before fixing shellcheck warnings, cache-key issues, or any bash regression.
  - **Read:**
    - `skills/domains/languages/shell/variable-patterns.md`
    - `skills/domains/languages/shell/validation-patterns.md`
  - **Steps:**
    1. Skim the “Quick Reference” tables (or headings if time-boxed).
    2. Identify 1–2 risks that apply to the current change (e.g., SC2155 masking exit codes, unquoted variables, missing `-r` on `read`, brittle validation).
    3. Paste a 3–5 line “Pre-flight notes” snippet into the iteration log/THUNK entry.
  - **AC:** The iteration summary includes a snippet like:
    - `Pre-flight (5.1): variable-patterns: <risk>; validation-patterns: <risk>`
  - **If Blocked:** If time-critical, do Step 1 only and paste `Pre-flight (5.1): skimmed headings only`.

- [ ] **5.2** Pre-flight (docs + lint + broken-link work): consult markdown + documentation anti-patterns
  - **When to use:** Before changing markdown docs, templates, or anything that commonly triggers markdownlint/link-check failures.
  - **Read:**
    - `skills/domains/anti-patterns/markdown-anti-patterns.md`
    - `skills/domains/anti-patterns/documentation-anti-patterns.md`
  - **Steps:**
    1. Skim “Common Failures” / “Anti-patterns” sections.
    2. Choose the top 2 anti-patterns most likely to bite this change (e.g., unlabeled fences, broken relative links, duplicate headings, tables with stray pipes).
    3. Paste a 2–4 line “Doc pre-flight notes” snippet into the iteration log/THUNK entry.
  - **AC:** The iteration summary includes a snippet like:
    - `Pre-flight (5.2): avoiding: <anti-pattern A>, <anti-pattern B>`
  - **If Blocked:** Skim headings only; paste `Pre-flight (5.2): skimmed headings only`.

- [ ] **5.3** Pre-flight (React graph viz performance work): consult frontend performance patterns
  - **When to use:** Before making UI/GraphView performance changes (memoization, clustering, rendering loops, event handlers).
  - **Read:**
    - `skills/domains/frontend/react-patterns.md`
    - `skills/domains/frontend/accessibility-patterns.md`
    - `skills/domains/frontend/README.md`
  - **Steps:**
    1. Skim the performance-related sections of `react-patterns.md`.
    2. Pick one concrete tactic to apply or explicitly rule out (e.g., `useMemo`/`useCallback`, reducing effect deps, profiling before optimizing).
    3. If UI behavior changes, skim the relevant a11y checklist section and note any required follow-ups.
    4. Paste a 2–5 line “Frontend pre-flight notes” snippet into the iteration log/THUNK entry.
  - **AC:** The iteration summary includes a snippet like:
    - `Pre-flight (5.3): tactic: <chosen tactic>; a11y: <note or N/A>`
  - **If Blocked:** Focus only on `react-patterns.md` and paste `Pre-flight (5.3): a11y deferred`.

- [ ] **5.4** Pre-flight (cross-cutting workflow): consult template sync + test failure playbooks
  - **When to use:** Before touching `templates/`, `.verify/`, tests, or anything that can trigger verifier/protected-file workflows.
  - **Read:**
    - `skills/playbooks/safe-template-sync.md`
    - `skills/playbooks/investigate-test-failures.md`
    - `skills/domains/code-quality/test-coverage-patterns.md`
    - `skills/domains/ralph/ralph-patterns.md`
  - **Steps:**
    1. Decide which playbook applies (template sync vs test failure vs both).
    2. Identify the **minimum bar** steps that must be followed (especially around intentional drift + waivers).
    3. Paste a 2–5 line “Workflow pre-flight notes” snippet into the iteration log/THUNK entry.
  - **AC:** The iteration summary includes a snippet like:
    - `Pre-flight (5.4): playbook: <chosen>; min steps: <list>`
  - **If Blocked:** Use safe-template-sync as the minimum bar and paste `Pre-flight (5.4): safe-template-sync minimum bar only`.

## Phase 6: Phase 3 Operator-Speed Improvements (statusline + notifications + voice)

> Source breakdown: `docs/still-to-do/phase3_statusline_notifications_voice_breakdown.md`.
>
> Goal: make it hard to run in the wrong worktree/branch, and make FAIL/HUMAN_REQUIRED runs loud without terminal babysitting.
>
> **Environment assumption:** WSL2 on Windows 11 (notifications are implemented via `powershell.exe` bridge from WSL → Windows).

- [ ] **6.1** Docs: Add a minimal prompt/statusline recipe (repo + branch + dirty + worktree label)
  - **Goal:** Provide a copy-pasteable snippet (not auto-installed) that shows where you are before running `acli rovodev run`.
  - **Implementation:** Update `docs/worktrees.md` with a “Prompt/Statusline” section containing:
    - A minimal `PS1` example (bash) showing repo/branch/dirty.
    - A worktree label strategy using an env var (e.g., `BRAIN_WT=wt-plan`) *or* `git worktree list` parsing.
    - A note on Windows Terminal tab titles as optional.
  - **AC:** `docs/worktrees.md` has a new section with a bash snippet and usage notes; markdownlint passes for the file.
  - **If Blocked:** If prompt customization is too personal, document only the env var approach + an example of exporting it per worktree.

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
