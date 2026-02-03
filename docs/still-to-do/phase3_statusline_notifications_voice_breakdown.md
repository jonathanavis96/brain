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
  - [ ] Sound
  - [ ] Toast / Windows notification
  - [ ] Optional: TTS

**Acceptance criteria:**

- There is a single documented mapping from event → notification method(s).

### 3.2.2 Wrapper script around `acli rovodev run`

Design goals:

- Should work from WSL.
- Should not require a GUI Linux notification daemon.
- Should degrade gracefully (if PowerShell not found, skip notifications).

Checklist:

- [ ] Wrapper accepts: command + args
- [ ] Wrapper emits notifications on:
  - [ ] success exit code (0)
  - [ ] non-zero exit code
- [ ] Wrapper prints a short summary line even if notifications fail

**Acceptance criteria:**

- Running the wrapper produces a sound/toast on failure.

### 3.2.3 Human-required detection

Potential inputs (choose at least one reliable trigger):

- A) Detect specific markers in logs (e.g., `HUMAN_REQUIRED`, `CAPTCHA`, `APPROVAL_REQUIRED`).
- B) Detect verifier warnings that explicitly say human intervention needed.
- C) Detect if process is waiting for input (harder; defer unless needed).

Checklist:

- [ ] Choose triggers
- [ ] Document exact strings/regex
- [ ] Verify trigger works on at least 1 real historical log example

**Acceptance criteria:**

- A “human required” run produces a distinct notification (different sound/message).

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

- [ ] Create a WSL-safe `bin/notify` helper (no-op fallback) with `--sound` and `--toast`.
- [ ] Create `bin/rovodev-run-notify` wrapper that calls `acli rovodev run` and notifies on exit.
- [ ] Add a prompt/worktree label snippet (documented, not auto-installed).
- [ ] Add a “human required detection” regex list + unit-like fixture test using a sample log.
