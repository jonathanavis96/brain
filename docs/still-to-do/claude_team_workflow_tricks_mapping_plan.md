# Claude Code Team Workflow Tricks — Mapping + Plan for Windows/WSL + `acli rovodev run`

> **Mode:** PLAN + REVIEW ONLY (no implementation)

## Table of Contents

- [A) Recommendation Summary](#a-recommendation-summary-top-3-to-adopt-first)
- [B) Viability Table](#b-viability-table-mapping-each-tip-to-your-setup)
- [C) Worktree Plan-Sharing Design (Very Important)](#c-worktree-plan-sharing-design-3-mechanisms)
- [D) `agents.md` replacement for `CLAUDE.md`](#d-agentsmd-replacement-for-claudemd-rules-that-evolve-safely)
- [E) “Hands-off bug fixing” adaptation without Slack](#e-hands-off-bug-fixing-adaptation-without-slack)
- [F) Voice dictation + TTS on Windows/WSL](#f-voice-dictation--tts-on-windowswsl-runner-agnostic)
- [G) Proposed Workflow v1 (ASCII diagram)](#g-proposed-workflow-v1-ascii-diagram)
- [H) Phased Implementation Plan (PLAN ONLY; no code changes)](#h-phased-implementation-plan-plan-only-no-code-changes)

---

## A) Recommendation Summary (top 3 to adopt first)

1) **Bug Packet + “verification-first” contract (Tips 5 + 6 adapted)**

- **Why first:** Biggest reliability win with the least moving parts. Cuts iteration thrash and “cannot reproduce” loops.
- **What changes:** You standardize what you paste to Ralph (failure + repro + environment + expected behavior), and you require a verification command list and proof output in the final response.

2) **Two-stage gating: Cortex Plan → Reviewer audit → Ralph execution (Tips 2 + 6)**

- **Why second:** Your repo already encodes role separation (Cortex vs Ralph). Adding a lightweight review gate improves correctness and reduces rework.
- **What changes:** Make “Plan” the artifact, do a skepticism pass (“staff engineer review”), and explicitly define when to stop and re-plan.

3) **Worktrees for parallelism + a read-only analysis tree (Tip 1)**

- **Why third:** This unlocks true concurrency (plan while builds/tests run elsewhere) without changing your core loop. It also helps context hygiene (analysis tree stays clean).
- **What changes:** Add 3–4 worktrees with a clear purpose and naming scheme; define how plans move from Cortex worktree to Ralph worktree (see section C).

If you do only these three, you’ll see faster throughput, fewer regressions, and lower cognitive load.

---

## B) Viability Table (mapping each tip to your setup)

| Tip / Pattern | Viability | Effort | Expected benefit | Dependencies / prerequisites | Main risks | How it integrates with `acli rovodev run` |
|---|---|---:|---|---|---|---|
| 1) Git worktrees (3–5 + RO analysis) | **Viable now** | M | Parallelism, less context switching, safer experiments | Comfort with `git worktree`; clear naming + branch rules | Confusion about “where am I?”, accidental edits in analysis tree | Run `acli rovodev run` from the intended worktree folder; encode worktree id in prompt/statusline |
| 2) Plan mode as key artifact + clarify before plan + stop/re-plan + “two-Claude” review | **Viable now** | S–M | Fewer wrong turns; better specs; predictable execution | A consistent plan template; a “review checklist” | Over-process / slowing small tasks; plan drift | Cortex runs `acli rovodev run` in planner mode; reviewer can be same tool run with “review-only” prompt; Ralph run starts only after plan approved |
| 3) Invest in CLAUDE.md + per-task notes + weekly pruning | **Viable with light work** (use `agents.md` + `notes/`) | S | Better continuity; fewer repeated mistakes | A stable location for “rules” + per-task notes convention | Notes rot; too much writing | Put “rules appendices” into `agents.md`; store task notes in a consistent folder; pass pointers/paths to the agent in `acli rovodev run` |
| 4) Create skills for repeated tasks + integration skills | **Viable with light work** | M | Compounding speedup; standardized quality | A place to store skills; conventions for invoking them | Skill sprawl; outdated patterns | Treat “skills” as prompt snippets / playbooks referenced from `agents.md` and pasted into `acli rovodev run` instructions |
| 5) “Claude fixes most bugs; verification is key” | **Viable now** | S | Faster bug turnaround; less human debugging | Strong bug packet + verification commands | False confidence if verification weak; flaky tests | Ralph run must include explicit “Repro → Fix → Verify → Report proof” steps in its output |
| 6) Prompt patterns (“Grill me”, “Prove it works”, “scrap & elegant”, explicit error handling + examples) | **Viable now** | S | Higher-quality changes, better reasoning, fewer edge-case misses | A small set of reusable “review prompts” | Overlong responses; rabbit holes | Use as a second `acli rovodev run` pass in reviewer mode, or as a mandatory “final section” in Ralph responses |
| 7) Terminal optimizations (statusline, colored tabs, voice dictation, Ghostty) | **Viable with light work** (Windows/WSL-friendly subset) | M | Faster orientation; fewer “wrong tree” mistakes; lower friction | Windows Terminal customization; shell prompt (starship / pure / etc.) | Config complexity; team inconsistency | Independent of `acli rovodev run`, but improves operator speed; show worktree + branch + repo cleanliness before running |
| 8) Subagents strategically + auto-approval permission routing | **Partially viable** | M–L | Better context hygiene; parallel analysis | Depends on what `acli rovodev run` supports (subagents/tool routing) | Accidental policy bypass; approval confusion | If subagent control isn’t exposed, emulate with multiple runs: “analysis run” then “implementation run”; avoid auto-approval hooks unless the tooling explicitly supports it safely |
| 9) Data/analytics via CLI tools (bq/psql/etc.) + shared schema/query skill | **Viable with light work** | M | Faster investigations; better operational debugging | Those CLIs available in WSL; credentials; safe read-only rules | Data exfiltration risk; destructive queries | Works well if you enforce “read-only by default” in `agents.md`; pass “safe query checklist” into runs |
| 10) Learn with Claude (explainers, onboarding HTML, diagrams, spaced repetition) | **Viable with light work** | S–M | Onboarding speed; shared mental models | A small “learning output format” convention | Becomes busywork | Use Cortex to generate artifacts on demand; keep them minimal and tied to real incidents |

**Key “not viable / unclear” area:** anything that assumes deep product integration (Slack/Asana/GDrive hooks) or “auto-approval routing” unless `acli rovodev run` explicitly supports those capabilities with auditable controls.

---

## C) Worktree Plan‑Sharing Design (3 mechanisms)

You want the Cortex plan (in `wt-plan`) to be reliably visible to Ralph (in `wt-build`) with minimal footguns.

### Option A — Commit the plan artifact (branch or same branch)

**Mechanism**

- Cortex writes/updates a plan file (or a plan section in a canonical file), then commits it.
- Ralph pulls/merges that commit in their worktree and executes.

**Pros**

- Strong provenance/audit trail (“what plan did we execute?”).
- Works across machines.
- Naturally resolves “stale plan” issues because Git forces explicit sync.

**Cons**

- More commits (noise) unless you squash or use a dedicated “plans” branch.
- If you’re mid-iteration, committing partial plans may feel heavy.

**Failure modes**

- Ralph implements against an old commit because they didn’t pull.
- Merge conflicts if both touch the same plan file.

**Recommendation**

- **Recommended for anything non-trivial**. Use a dedicated convention:
  - Either a `plan/<ticket-or-topic>` branch, or
  - A “plan commit” label/tag in the message, then squash later.

**Integration with `acli rovodev run`**

- Cortex: `acli rovodev run` → produces/updates plan → human commits.
- Ralph: pulls latest → `acli rovodev run` in implementer mode using the plan as the artifact of record.

---

### Option B — Copy plan file across worktrees

**Mechanism**

- A script copies `plan.md` (or `workers/IMPLEMENTATION_PLAN.md`) from `wt-plan` to `wt-build` before Ralph runs.

**Pros**

- Very fast; no git ceremony.
- Good for “local-only” workflows.

**Cons**

- Easy to desync (“which copy is authoritative?”).
- Harder to audit later.
- Risk of overwriting local changes.

**Failure modes**

- Copy happens from the wrong source path (wrong worktree).
- Partial copy leaves Ralph with a truncated plan.

**Recommendation**

- **Not recommended as the primary mechanism**. If used, treat it as a stopgap and enforce:
  - checksum/size check,
  - timestamp logging,
  - and a “source-of-truth” banner inside the copied plan.

**Integration with `acli rovodev run`**

- Wrapper around `acli rovodev run` in the Ralph worktree: “sync plan → run”.

---

### Option C — Shared read-only location / shared artifact pointer

**Mechanism**

- Plan lives in a shared location accessible to all worktrees:
  - e.g., a single canonical path outside worktrees (or a dedicated “plans” repo/folder),
  - or a generated artifact that Ralph references by path/URL.
- Ralph reads it, but doesn’t edit it.

**Pros**

- Eliminates duplication: one plan, many consumers.
- Can be made read-only to prevent accidental edits.
- Works well with an “analysis” worktree too.

**Cons**

- Requires careful pathing on Windows/WSL.
- If the shared location isn’t versioned, you lose history.

**Failure modes**

- Permissions drift (RO becomes writable).
- Path differences between Windows and WSL confuse scripts.

**Recommendation**

- **Good hybrid** when paired with Option A:
  - Canonical plan is committed (history),
  - A “latest plan pointer” is also written to a stable path for convenience.

**Integration with `acli rovodev run`**

- Runs include “Plan is at: `<path>`” and instruct the agent to treat that as immutable input.

---

### Overall recommendation

- **Default:** **Option A (commit plan artifact)** for correctness and auditability.
- **Convenience add-on:** Option C as a pointer/cache for “latest plan” access.
- Avoid Option B except as a temporary bridge.

---

## D) `agents.md` replacement for CLAUDE.md (rules that evolve safely)

### Proposed “Rules Appendix” format (designed for appending after mistakes)

Use a structured, append-only section so new rules don’t rewrite history:

**Format**

- **Rule ID:** `R-YYYYMMDD-###`
- **Trigger:** “When X happens…”
- **Directive:** “Do Y instead…”
- **Rationale:** 1–2 lines
- **Verification:** exact checks required
- **Scope:** repo-wide / subsystem / language
- **Expiry/Review:** “Re-evaluate on <date>” or “Promote to core rules if repeated 3x”

This keeps rules actionable and prevents “wall of text”.

### 8 example rules (generic but relevant)

1) **Scoped staging**

- **Trigger:** When changing multiple subsystems in one fix.
- **Do:** Split into separate commits/PRs; stage files by concern; never mix refactor + behavior change.
- **Verify:** `git diff --staged` shows only one concern.

2) **Verification is mandatory**

- **Trigger:** When claiming a bug is fixed.
- **Do:** Run the repro command first (fail), apply fix, rerun (pass), then run the smallest relevant test suite.
- **Verify:** Paste command + output snippets (before/after).

3) **Migrations / schema changes**

- **Trigger:** When changing storage formats, schemas, or serialized shapes.
- **Do:** Add forward + backward compatibility, and a migration note; include rollback plan.
- **Verify:** Versioned fixture tests (old + new).

4) **Null/empty handling**

- **Trigger:** When reading external inputs (files, env vars, API responses).
- **Do:** Treat missing/empty as first-class; explicit defaults; no blind indexing.
- **Verify:** Add at least one test for missing key / empty file.

5) **Refactor safety rails**

- **Trigger:** When touching “core” modules.
- **Do:** Mechanical refactor only; preserve public interfaces; add characterization tests first if behavior unclear.
- **Verify:** Public API snapshot / golden test passes.

6) **Error handling must be explicit**

- **Trigger:** When adding new network/file/process calls.
- **Do:** Handle failure paths; produce actionable error messages; avoid swallowing exceptions.
- **Verify:** Induce one failure mode and show message quality.

7) **No “drive-by” formatting**

- **Trigger:** When working on a logic bug.
- **Do:** Don’t reformat unrelated code. If formatting is required, do it in a separate commit.
- **Verify:** Diff is narrow; blame remains meaningful.

8) **Test selection discipline**

- **Trigger:** When the test suite is large.
- **Do:** Run the smallest targeted tests locally; only run full suite when touching shared layers or before merge.
- **Verify:** Provide the exact command list used.

### Weekly pruning routine (keep under ~300 lines)

- **Cadence:** weekly (15 minutes).
- **Steps:**
  1) **Deduplicate**: merge near-identical rules; keep the newest ID but preserve rationale.
  2) **Promote**: any rule triggered ≥3 times becomes a “Core Rule” (top section).
  3) **Expire**: delete or archive rules that are now enforced by automation/tests.
  4) **Compress**: rewrite verbose narratives into Trigger/Do/Verify bullets.
  5) **Index**: maintain a short index mapping “symptom → rule ID”.

---

## E) “Hands‑off bug fixing” adaptation without Slack

### What you should paste instead

To replace the “Slack thread” context, paste a compact, deterministic evidence bundle:

- **Repro command** (exact command, from repo root, include env vars)
- **Observed failure output** (first error + stack trace)
- **Expected behavior**
- **Recent change context**: link to commit(s) or paste `git diff` (preferred minimal diff)
- **Environment info**: OS (Windows+WSL), language/runtime versions, dependency manager version
- **Any logs**: CI log excerpt, docker-compose service logs, etc.

### Bug Packet Template (strict)

```text
# BUG PACKET (for Ralph)

## 1) Goal
Fix: <one sentence>

## 2) Repro (must be deterministic)
From repo root:
- Command: `<exact command>`
- Preconditions: <files present/env vars/services running>
- Frequency: <always / intermittent>

## 3) Observed Failure
- Exit code:
- Key error line(s):
- Stack trace / log excerpt (top 30–80 lines):

## 4) Expected Behavior
<what should happen>

## 5) Scope Constraints
- Must NOT change: <APIs/files/behavior>
- Allowed to change: <modules>
- Performance/security constraints:

## 6) Suspected Area (optional)
<links/files>

## 7) Artifacts
- git diff / commit: <paste diff or hash>
- CI log snippet (if any):
- Docker logs (if any):

## 8) Verification Requirements (Ralph must run and paste proof)
- Repro command passes
- Targeted tests: `<commands>`
- Lint/format (if applicable): `<commands>`
- Regression guard: <what new test or check prevents recurrence>

## 9) Completion Definition
Ralph replies with:
1) Root cause
2) Fix summary
3) Proof: commands + output snippets
4) Risk assessment + rollback note
```

### Verification requirement

- Every fix must include:
  - **A “before” failing run** (or a credible explanation if impossible, but treat that as exceptional).
  - **An “after” passing run** of the same repro.
  - **Targeted tests** (unit/integration relevant to the touched area).
  - **A regression guard**: ideally a new/updated test or a narrow check.
- Ralph’s completion message must include the exact commands used and short proof excerpts.

---

## F) Voice dictation + TTS on Windows/WSL (runner-agnostic)

### Voice dictation options (Windows)

- **Windows built-in dictation (Win+H)**
  - **Pros:** zero setup, works in most text fields, good enough for prompts/plans.
  - **Cons:** limited customization/vocab; depends on focus/cursor; may struggle with code symbols.
  - **Best use:** writing plans, bug packets, review prompts, PR descriptions.

- **Third-party dictation (category-level)**
  - Look for tools that support:
    - custom vocabulary (“worktree”, “lint”, “pytest”),
    - command/snippet expansion (“insert bug packet template”),
    - push-to-talk.
  - **Pros:** faster for technical vocabulary; better macros.
  - **Cons:** more moving parts; potential privacy concerns.

**Practical recommendation:** start with Windows dictation for planning text; only adopt third-party if you feel sustained friction with technical terms.

### TTS notifications (two approaches)

#### Approach 1 — PowerShell TTS triggered from WSL

**Mechanism**

- From WSL scripts, call `powershell.exe` with a short TTS command on key events.

**Where it hooks**

- In a wrapper script around your `acli rovodev run` invocation:
  - on start (optional),
  - on success,
  - on failure (most valuable),
  - and on “human required” / approval needed.

**Benefits**

- Hands-free awareness while you multitask.
- Works in Windows+WSL without special desktop apps.

**Risks**

- PowerShell invocation quoting can be finicky.
- Over-notifying becomes noise.

#### Approach 2 — Non-TTS fallback (toast / sound)

**Mechanism**

- Trigger:
  - Windows toast notification, or
  - simple system sound, or
  - Windows Terminal bell.

**Where it hooks**

- Same wrapper points: start/end/fail, plus CI failure detection if you run CI locally.

**Benefits**

- Less intrusive than voice.
- Often easier to implement robustly than TTS.

**Risks**

- Toast permissions/focus mode can suppress notifications.

**Recommendation**

- Implement non-TTS first if you want minimal fragility; add TTS only for failure/human-required states.

---

## G) Proposed Workflow v1 (ASCII diagram)

```text
Worktrees:
  wt-plan     = Cortex planning + coordination (clean, low churn)
  wt-build    = Ralph implementation + tests
  wt-analysis = read-only checkout for browsing/searching (no edits)
  wt-review   = optional reviewer workspace for skepticism pass

Flow:

   +------------------+        +-------------------+
   | wt-plan (Cortex) |        | wt-review (audit) |
   |  - Plan artifact | -----> |  - Skeptic review |
   |  - agents.md     |        |  - "prove it" qs  |
   +--------+---------+        +---------+---------+
            |                              |
            | Plan approved                | Review notes
            v                              v
   +------------------+        +---------------------------+
   | wt-build (Ralph) | -----> | Verifier / targeted tests |
   |  - Implement     |        | + proof in completion     |
   |  - Bug Packet    |        +-------------+-------------+
   +--------+---------+                      |
            |                                |
            | Merge/squash                   |
            v                                v
         main branch                    Notifications
                                      (TTS/toast/sound)
                                      start/end/fail

Where `agents.md` updates happen:
  - After a failure pattern: append a Rule ID entry in wt-plan
  - Weekly prune/merge rules (wt-plan)

Where notifications happen:
  - Wrapper around `acli rovodev run` in wt-plan and wt-build
  - Failure/human-required gets loudest signal
```

---

## H) Phased Implementation Plan (PLAN ONLY; no code changes)

### Phase 0 (1–2 hours): Minimal changes (highest ROI, lowest risk)

**Changes**

- Adopt Bug Packet Template + verification contract for Ralph.
- Adopt “Cortex Plan artifact + reviewer skepticism checklist” for complex tasks.

**Acceptance criteria**

- 1 real bug/task completed using the Bug Packet template with:
  - repro before/after proof,
  - targeted tests listed,
  - short root cause explanation.
- 1 complex change goes through: plan → review questions → implementation.

**Rollback**

- Stop using the templates; return to ad-hoc pasting.

**Measure**

- Iterations per fix (messages/back-and-forth).

- # of “cannot reproduce” incidents

- % of tasks with explicit repro + verification proof.

---

### Phase 1: Worktrees + two-agent plan/review gate

**Changes**

- Create worktrees: `wt-plan`, `wt-build`, `wt-analysis`, optional `wt-review`.
- Define a strict “plan handoff” mechanism (recommend Option A: commit plan).

**Acceptance criteria**

- You can run Cortex planning in `wt-plan` while tests/build run in `wt-build`.
- Ralph never edits in `wt-analysis`.
- 2 tasks completed without worktree confusion; plan commit is the artifact of record.

**Rollback**

- Remove extra worktrees; return to single checkout.

**Measure**

- Time spent waiting on tests (should drop via parallel activity).
- Number of “wrong directory/worktree” mistakes (should be near zero).
- Lead time from plan approved → implementation started.

---

### Phase 2: “Skills” equivalents + bug packet + verification hardening

**Changes**

- Convert repeated routines into “skills” (prompt snippets/checklists) referenced from `agents.md`.
- Standardize verification commands by task type (backend/frontend/docs).

**Acceptance criteria**

- At least 3 reusable skills exist (e.g., “python bugfix”, “refactor safety”, “release note”).
- Each skill includes: inputs required, steps, verification commands, failure handling.
- Regression rate decreases (fewer follow-up fixes).

**Rollback**

- Keep skills but stop enforcing them; revert to ad-hoc.

**Measure**

- Rework rate (follow-up fixes within 24–72 hours).
- Average time-to-fix for recurring task categories.

---

### Phase 3: Statusline/notifications/voice (operator-speed improvements)

**Changes**

- Add statusline showing: repo, branch, worktree id, dirty state, time since last commit.
- Add wrapper hooks for end/fail notifications (toast/sound; optional TTS).
- Add dictation habit: use voice for planning + bug packets.

**Acceptance criteria**

- You can tell worktree + branch at a glance before running `acli rovodev run`.
- You receive a reliable signal on fail/human-required without watching the terminal.
- Voice dictation reliably produces usable plan text at least once daily.

**Rollback**

- Disable statusline module; remove notification hooks; stop using dictation.

**Measure**

- Context-switch overhead (subjective: fewer “where was I?” moments).
- Missed failures (times you didn’t notice a run failed).
- Throughput: tasks/day or plan→merge cycle time.

---

### What is *not* viable / should be deferred (given your constraints)

- Deep “Slack thread → go fix” automation equivalents (you don’t use Slack): emulate via Bug Packets instead.
- Auto-approval routing “through a model” (Tip 8 advanced): risky unless `acli rovodev run` has explicit, auditable support for permission gates and you’re comfortable with that risk model.
- macOS-centric terminal tooling (Ghostty-specific workflows): use Windows Terminal + WSL-compatible prompt tooling instead.
