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

- [ ] Show **repo name**
- [ ] Show **git branch**
- [ ] Show **dirty/clean indicator**
- [ ] Show **exit status of last command** (helps spot failed verifier/test commands)
- [ ] Show **WSL distro / host marker** (optional but helpful if you use multiple)

**Acceptance criteria:**

- You can screenshot a terminal prompt and it uniquely identifies: repo + branch + dirty state.

### 3.1.2 Worktree identification

Options (choose one):

- A) Parse `git worktree list` and show the worktree path suffix (`wt-plan`, `wt-build`, etc.).
- B) Set an explicit env var in each worktree shell init (e.g., `export BRAIN_WT=wt-plan`).

Checklist:

- [ ] Choose approach A or B
- [ ] Worktree label appears in prompt
- [ ] Worktree label is **hard to miss** (brackets/prefix)

**Acceptance criteria:**

- Prompt clearly shows `wt-plan` vs `wt-build` vs `wt-analysis`.

### 3.1.3 Windows Terminal tab title integration (optional)

- [ ] Tab title includes `repo:branch` (and optionally worktree)
- [ ] Title updates on `cd` into/out of repo

**Acceptance criteria:**

- You can distinguish multiple open tabs without clicking into them.

---

## 3.2 Notifications: get loud signals on FAIL / HUMAN_REQUIRED

Goal: You should not need to babysit the terminal to know when a run fails or requires manual action.

### 3.2.1 Define the notification contract

- [ ] Decide which events matter:
  - [ ] Start
  - [ ] Success
  - [ ] Fail
  - [ ] Human-required (CAPTCHA / approval / protected files)
- [ ] Decide minimum signal types:
  - [ ] Sound *(not implemented in `bin/notify` yet)*
  - [x] Toast / Windows notification *(implemented via `bin/notify` PowerShell bridge)*
  - [ ] Optional: TTS *(not implemented in `bin/notify` yet)*

**Acceptance criteria:**

- [ ] There is a single documented mapping from event → notification method(s).

### 3.2.2 Wrapper script around `acli rovodev run`

Design goals:

- Should work from WSL.
- Should not require a GUI Linux notification daemon.
- Should degrade gracefully (if PowerShell not found, skip notifications).

**Status:** Implemented.

- Wrapper: `bin/rovodev-run-notify`
- Notifier: `bin/notify`

Checklist:

- [x] Wrapper accepts: command + args
- [x] Wrapper emits notifications on:
  - [x] success exit code (0)
  - [x] non-zero exit code
- [ ] Wrapper prints a short summary line even if notifications fail *(wrapper currently relies on `bin/notify` fallback printing; could add a dedicated one-liner in the wrapper)*

**Acceptance criteria:**

- [x] Running the wrapper produces a toast notification on failure (sound/TTS optional).

### 3.2.3 Human-required detection

Potential inputs (choose at least one reliable trigger):

- [x] A) Detect specific markers in logs (e.g., `HUMAN_REQUIRED`, `CAPTCHA`, `APPROVAL_REQUIRED`).
- [ ] B) Detect verifier warnings that explicitly say human intervention needed.
- [ ] C) Detect if process is waiting for input (harder; defer unless needed).

**Status:** Implemented (log-marker based).

- Detector: `tools/detect_human_required.py` (regex list is in-code; returns exit code 0 if a marker is found)
- Wrapper integration: `bin/rovodev-run-notify --log <file>`

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

- [ ] Decide primary dictation mechanism (Windows-native recommended)
- [ ] Decide where dictated text goes:
  - [ ] Bug packets
  - [ ] Plan drafts
  - [ ] Review notes

**Acceptance criteria:**

- You can produce a usable plan paragraph by voice at least once.

### 3.3.2 Text-to-speech for alerts (optional)

- [ ] Decide whether to do TTS at all
- [ ] If yes, choose method (PowerShell `SAPI.SpVoice` is the usual Windows option)
- [ ] Implement “human required” spoken alert distinct from generic failure

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
- [x] Create `bin/rovodev-run-notify` wrapper that calls `acli rovodev run` and notifies on exit.
- [ ] Add a prompt/worktree label snippet (documented, not auto-installed).
- [x] Add a “human required detection” regex list + unit-like fixture test using a sample log.
  - **Notes:** Regex list exists in `tools/detect_human_required.py`. Remaining work: pin a historical log example/fixture and reference it here.

Additional (implemented):

- [x] Notify when Ralph finishes or stops (loop-level): `workers/ralph/loop.sh` now triggers `bin/notify` on loop exit (completion, human-required, verifier-stop, interrupt).
