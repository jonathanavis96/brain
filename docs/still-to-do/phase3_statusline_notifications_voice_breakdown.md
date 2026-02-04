# Phase 3 Breakdown: Statusline / Notifications / Voice (Windows Terminal + WSL)

**Source:** Derived from `docs/still-to-do/claude_team_workflow_tricks_mapping_plan.md` Phase 3.

**Aim:** Break Phase 3 into check-offable, implementation-ready items that can be converted into atomic Ralph tasks.

**Scope constraints (from this repo’s operating model):**

- Windows 11 + WSL environment.
- No X11 / `wmctrl` / Linux desktop automation assumptions.
- Prefer solutions that work in:
  - Windows Terminal + WSL shells, and
  - non-interactive CI-like contexts (should no-op safely).

---

## 3.1 Statusline / Prompt: “Where am I?” at a glance

Goal: Before running `acli rovodev run`, you can instantly see repo + branch + dirty state + (optional) worktree label.

### 3.1.1 Minimal prompt requirements (shell-agnostic)

- [x] Show **repo name** *(see: `docs/worktrees.md` → “Prompt/Statusline Configuration”)*
- [x] Show **git branch** *(see: `docs/worktrees.md` → “Prompt/Statusline Configuration”)*
- [x] Show **dirty/clean indicator** *(see: `docs/worktrees.md` → `parse_git_dirty`)*
- [x] Show **exit status of last command** (helps spot failed verifier/test commands) *(see: `docs/worktrees.md` → `set_prompt`)*
- [ ] Show **WSL distro / host marker** (optional but helpful if you use multiple) *(not implemented; optional)*

**Acceptance criteria:**

- You can screenshot a terminal prompt and it uniquely identifies: repo + branch + dirty state.

### 3.1.2 Worktree identification

Options (choose one):

- A) Parse `git worktree list` and show the worktree path suffix (`wt-plan`, `wt-build`, etc.).
- B) Set an explicit env var in each worktree shell init (e.g., `export BRAIN_WT=wt-plan`).

Checklist:

- [x] Choose approach A or B *(implemented: Option A `$BRAIN_WT` and Option B parsing; see `docs/worktrees.md`)*
- [x] Worktree label appears in prompt *(see: `docs/worktrees.md` → `$BRAIN_WT`)*
- [x] Worktree label is **hard to miss** (brackets/prefix) *(included alongside repo name in prompt snippet; see `docs/worktrees.md`)*

**Acceptance criteria:**

- Prompt clearly shows `wt-plan` vs `wt-build` vs `wt-analysis`.

### 3.1.3 Windows Terminal tab title integration (optional)

- [x] Tab title includes `repo:branch` (and optionally worktree) *(static per-worktree startup example; see `docs/worktrees.md` → “Windows Terminal Tab Titles”)*
- [ ] Title updates on `cd` into/out of repo *(not implemented; would require PROMPT_COMMAND / chpwd hook)*

**Acceptance criteria:**

- You can distinguish multiple open tabs without clicking into them.

---

## 3.2 Notifications: get loud signals on FAIL / HUMAN_REQUIRED

Goal: You should not need to babysit the terminal to know when a run fails or requires manual action.

### 3.2.1 Define the notification contract

- [x] Decide which events matter: *(see: `docs/events.md` → “Notification Contract”)*
  - [x] Start
  - [x] Success
  - [x] Fail
  - [x] Human-required (CAPTCHA / approval / protected files)
- [x] Decide minimum signal types: *(toast baseline; optional sound/TTS; see: `docs/events.md` and `bin/notify`)*
  - [x] Sound *(implemented in `bin/notify --sound`)*
  - [x] Toast / Windows notification *(implemented via `bin/notify` PowerShell bridge)*
  - [x] Optional: TTS *(implemented in `bin/notify --tts`)*

**Acceptance criteria:**

- [x] There is a single documented mapping from event → notification method(s). *(see: `docs/events.md` → “Notification Contract”)*

### 3.2.2 Wrapper script around `acli rovodev run`

Design goals:

- Should work from WSL.
- Should not require a GUI Linux notification daemon.
- Should degrade gracefully (if PowerShell not found, skip notifications).

**Status:** Implemented.

- Wrapper: `bin/cortex-run-notify`
- Notifier: `bin/notify`

Checklist:

- [x] Wrapper accepts: command + args
- [x] Wrapper emits notifications on:
  - [x] success exit code (0)
  - [x] non-zero exit code
- [x] Wrapper prints a short summary line even if notifications fail *(wrapper prints `Cortex: SUCCESS/FAIL/HUMAN_REQUIRED` independent of notifier; see `bin/cortex-run-notify`)*

**Acceptance criteria:**

- [x] Running the wrapper produces a toast notification on failure (sound/TTS optional).

### 3.2.3 Human-required detection

Potential inputs (choose at least one reliable trigger):

- [x] A) Detect specific markers in logs (e.g., `HUMAN_REQUIRED`, `CAPTCHA`, `APPROVAL_REQUIRED`).
- [ ] B) Detect verifier warnings that explicitly say human intervention needed.
- [ ] C) Detect if process is waiting for input (harder; defer unless needed).

**Status:** Implemented (log-marker based).

- Detector: `tools/detect_human_required.py` (regex list is in-code; returns exit code 0 if a marker is found)
- Wrapper integration: `bin/cortex-run-notify --log <file>`

Checklist:

- [x] Choose triggers *(A: marker/regex scan)*
- [x] Document exact strings/regex *(see `tools/detect_human_required.py` `HUMAN_REQUIRED_PATTERNS`)*
- [x] Verify trigger works on at least 1 real historical log example

**Fixtures:**

- `tools/tests/fixtures/human_required_positive.log` - Contains "⚠️ HUMAN INTERVENTION REQUIRED" marker
- `tools/tests/fixtures/human_required_negative.log` - Normal log without markers
- `tools/tests/fixtures/human_required_captcha.log` - Contains "CAPTCHA" marker

**Test suite:** `tools/tests/test_detect_human_required.py` validates detection against all fixtures.

**Verification commands:**

```bash
# Positive case (should exit 0 - marker found)
python3 tools/detect_human_required.py tools/tests/fixtures/human_required_positive.log
echo $?  # Expected: 0

# Negative case (should exit 1 - no marker found)
python3 tools/detect_human_required.py tools/tests/fixtures/human_required_negative.log
echo $?  # Expected: 1

# Run full test suite
python3 tools/tests/test_detect_human_required.py
```

**Acceptance criteria:**

- [x] A "human required" run produces a distinct notification message/title.

---

## 3.3 Voice: dictation + TTS (optional)

Goal: Reduce typing friction for plans/bug packets; optionally read out fail/human-required.

### 3.3.1 Dictation workflow

- [x] Decide primary dictation mechanism (Windows-native recommended) *(Windows 11 dictation via `Win + H`; see `docs/events.md` → “Voice Dictation Workflow”)*
- [x] Decide where dictated text goes: *(see `docs/events.md` → “where text goes” section)*
  - [x] Bug packets
  - [x] Plan drafts
  - [x] Review notes

**Acceptance criteria:**

- You can produce a usable plan paragraph by voice at least once.

### 3.3.2 Text-to-speech for alerts (optional)

- [x] Decide whether to do TTS at all *(yes; implemented)*
- [x] If yes, choose method (PowerShell `SAPI.SpVoice` is the usual Windows option) *(see: `bin/notify`)*
- [x] Implement “human required” spoken alert distinct from generic failure *(distinct titles/messages + `--tts` paths implemented in `workers/ralph/loop.sh` and `bin/cortex-run-notify`)*

**Acceptance criteria:**

- On a simulated failure, you get an audible spoken summary.

---

## 3.4 Conversion guidance: how to turn these into atomic Ralph tasks

When converting to `workers/IMPLEMENTATION_PLAN.md`, prefer tasks that:

- Change **one file or one small set of files**.
- Produce a verifiable artifact:
  - A new script with `--dry-run` mode, or
  - A documented config snippet + proof output.
- Have a deterministic test command:
  - e.g., run wrapper with a command that exits 1 and verify notification path executes.

Suggested atomic task seeds:

- [x] Create a WSL-safe `bin/notify` helper (no-op fallback) with `--toast`.
  - **Notes:** `--sound` and `--tts` flags exist but are not implemented yet.
- [x] Create `bin/cortex-run-notify` wrapper that calls `acli rovodev run` and notifies on exit.
- [x] Add a prompt/worktree label snippet (documented, not auto-installed). *(see `docs/worktrees.md`)*
- [x] Add a “human required detection” regex list + unit-like fixture test using a sample log.
  - **Notes:** Regex list exists in `tools/detect_human_required.py`. Remaining work: pin a historical log example/fixture and reference it here.

Additional (implemented):

- [x] Notify when Ralph finishes or stops (loop-level): `workers/ralph/loop.sh` now triggers `bin/notify` on loop exit (completion, human-required, verifier-stop, interrupt).
