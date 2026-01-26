# DECISIONS.md - Stability Anchor

## Purpose

This file documents **architectural decisions, naming conventions, style preferences, and update cadences** for the brain repository. It serves as a stability anchor - when in doubt, refer here.

**Audience:** Cortex (manager), Ralph (worker), and human maintainers.

---

## Naming Conventions

### File Naming

- **Templates:** `*.project.md` suffix indicates template files (e.g., `AGENTS.project.md`)
- **Scripts:** Use lowercase with hyphens for multi-word names (e.g., `verify-brain.sh`, `new-project.sh`)
- **Markdown:** Use UPPERCASE for project-root files (e.g., `AGENTS.md`, `NEURONS.md`), title-case for nested docs

### Variable Naming (Shell)

- **Constants:** `UPPERCASE_WITH_UNDERSCORES` (e.g., `THUNK_FILE`, `PLAN_FILE`)
- **Local variables:** `lowercase_with_underscores` (e.g., `task_count`, `line_num`)
- **Functions:** `lowercase_with_underscores` (e.g., `display_tasks`, `parse_plan`)

### Git Conventions

- **Commit types:** `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
- **Scopes:** `ralph`, `cortex`, `templates`, `skills`, `refs`, `plan`, `loop`
- **Format:** `<type>(<scope>): <summary>` with optional body and Co-authored-by trailer

---

## Architectural Decisions

### 2026-01-20: Cortex Manager Pack

**Decision:** Introduce "Cortex" as a manager layer that plans and delegates to Ralph (worker).

**Rationale:**

- Ensures all planning sessions produce **atomic, actionable, testable** subtasks
- Separates planning (Cortex/Opus) from execution (Ralph/Sonnet)
- Provides consistent context bootstrapping for Opus sessions
- Prepares architecture for future parallel workers (e.g., Rust specialist, Python specialist)

**Structure:**

```text
brain/
  cortex/                      ← Manager (Opus) - planning only
    CORTEX_SYSTEM_PROMPT.md    ← Identity + rules
    REPO_MAP.md                ← Navigation guide
    DECISIONS.md               ← This file
    RUNBOOK.md                 ← Operations guide
    IMPLEMENTATION_PLAN.md     ← High-level atomic tasks
    THOUGHTS.md                ← Cortex's analysis
    run.sh, snapshot.sh        ← Entry points
    
  workers/ralph/               ← Worker - execution only
    PROMPT.md, loop.sh, ...    ← Ralph's machinery
```text

**Workflow:**

1. Human runs `bash cortex/run.sh` → Opus loads as Cortex
2. Cortex writes `cortex/IMPLEMENTATION_PLAN.md` (atomic tasks)
3. Human runs `bash workers/ralph/loop.sh`
4. Ralph copies Cortex plan at startup, executes tasks, logs to THUNK.md
5. Cortex can compare both plans to check alignment

### 2026-01-19: TOTP vs Hardware Key

**Decision:** Use TOTP (Google Authenticator) as temporary bridge until hardware-key signing is available.

**Rationale:**

- Hardware keys (YubiKey) require additional setup and tooling
- TOTP provides "good enough" human verification for waiver approvals
- System designed to be swappable to hardware keys later
- Secret stored outside repo ensures Ralph can't self-approve

**Components:**

- `.verify/approve_waiver_totp.py` - Validates 6-digit OTP
- `.verify/launch_approve_waiver.sh` - Interactive terminal for approval
- `.verify/check_waiver.sh` - Gate integration
- `.verify/request_waiver.sh` - Helper for creating requests

### 2026-01-19: Single Waiver Location

**Decision:** Keep canonical waiver system at repo root `.verify/`

**Rationale:**

- One source of truth avoids sync issues
- Scripts copied to `ralph/.verify/` for template completeness
- All waiver requests/approvals stored at root level
- Avoids duplication and state divergence

### 2026-01-18: Sonnet as Default Model

**Decision:** Keep Sonnet 4.5 as hardcoded default in `loop.sh`, don't read from `rovodev-config.yml`

**Rationale:**

- Predictable behavior across environments
- `rovodev-config.yml` is for user overrides, not defaults
- Usage text updated to reflect this choice
- Opus (Claude Opus 4.5) reserved for Cortex planning mode

### 2026-01-17: Maintenance System

**Decision:** Create `.maintenance/` folder with automated consistency checks

**Rationale:**

- Prevents drift between docs and code
- Automated checks run during planning mode
- Active items tracked in `MAINTENANCE.md`
- Audit trail in `MAINTENANCE_LOG.md`

**Components:**

- `.maintenance/verify-brain.sh` - 6 consistency checks
- `.maintenance/MAINTENANCE.md` - Active items queue
- `.maintenance/MAINTENANCE_LOG.md` - Completion log

### 2026-01-15: Skills vs Knowledge Base

**Decision:** Rename "Knowledge Base (KB)" → "Skills" throughout repository

**Rationale:**

- More intuitive for agents ("I have skills" vs "I have a knowledge base")
- Aligns with agent-first design philosophy
- Clearer intent for references (skills you can apply)

**Status:** In progress (see Phase 1 of implementation plan)

---

## Style Preferences

### Markdown

- **Headings:** Use ATX-style (`#`, `##`, `###`), not Setext (`===`, `---`)
- **Code fences:** Always include language tag (backtick-backtick-backtick-bash, backtick-backtick-backtick-markdown, backtick-backtick-backtick-python)
- **Tables:** Consistent column alignment, no split rows
- **Lists:** Use `-` for unordered, `1.` for ordered (auto-increment okay)
- **Bold:** Use `**bold**` not `__bold__`
- **Emphasis:** Use `*italic*` not `_italic_`

### Shell Scripts

- **Strict mode:** Always use `set -euo pipefail` at top
- **Functions:** Define before use (or use forward declarations)
- **Quoting:** Always quote variables: `"$var"` not `$var`
- **Exit codes:** Use `0` for success, `1-255` for errors
- **Comments:** Document complex logic, not obvious code
- **Shellcheck:** Fix all warnings (SC2155, SC2034, etc.)

### Python

- **Type hints:** Use for function signatures
- **Docstrings:** Google style for public functions/classes
- **Formatting:** Black-compatible (88 char line length)
- **Imports:** Standard library → third-party → local, alphabetical within groups
- **Error handling:** Explicit error messages, no bare `except:`

---

## Update Cadences

### Planning Mode (Iteration 1 or every 3rd)

- Review `skills/SUMMARY.md` and `skills/index.md`
- Run `.maintenance/verify-brain.sh` and incorporate findings
- Update `IMPLEMENTATION_PLAN.md` with atomic tasks
- Commit planning updates and **push all accumulated commits**

### Build Mode (All other iterations)

- Pick **first unchecked task** from `IMPLEMENTATION_PLAN.md`
- Implement, validate, log to `THUNK.md`, commit (local only)
- Check self-improvement: append to `skills/self-improvement/GAP_BACKLOG.md` if needed
- **Never push** - wait for planning mode to push

### Verifier Gates

- Run after every build iteration
- Block on FAIL status - Ralph must fix before continuing
- Warn on WARN status - track in `IMPLEMENTATION_PLAN.md` "Verifier Warnings" section
- Protected files: `loop.sh`, `verifier.sh`, `PROMPT.md`, `rules/AC.rules`

### Skills System

- **End of iteration:** Check for undocumented knowledge → append to `GAP_BACKLOG.md`
- **When gap is clear/specific/recurring:** Promote to `SKILL_BACKLOG.md`
- **When ready:** Create skill file using `SKILL_TEMPLATE.md`, update `skills/index.md`

---

## Cortex-Specific Decisions

### Task Contract Format

**Decision:** Cortex writes tasks as "Task Contracts" with specific fields

**Required fields:**

- **Goal:** What success looks like (1-2 sentences)
- **Subtasks:** Numbered checklist of atomic steps
- **Constraints:** What Ralph cannot modify or skip
- **Inputs:** Files/context Ralph needs to read
- **Acceptance Criteria:** How to verify completion (commands + expected outputs)
- **If Blocked:** What to do if stuck (file a SPEC_CHANGE_REQUEST, ask human, etc.)

**Rationale:**

- Forces Cortex to think through implementation details
- Gives Ralph clear marching orders
- Makes verification explicit and testable
- Reduces back-and-forth ambiguity

### Cortex Modification Scope

**Decision:** Cortex can only modify specific files

**Allowed:**

- `cortex/IMPLEMENTATION_PLAN.md` - Task contracts for Ralph
- `cortex/THOUGHTS.md` - Cortex's analysis and decision log
- `skills/self-improvement/GAP_BACKLOG.md` - Gap capture
- `skills/self-improvement/SKILL_BACKLOG.md` - Skill promotion queue
- Any files Cortex creates in `cortex/` (e.g., temp analysis files)

**Prohibited:**

- `PROMPT.md`, `loop.sh`, `verifier.sh` - Protected files
- Worker code (Ralph's files) - Cortex delegates, doesn't implement
- Templates - Cortex plans, Ralph executes template updates
- Skills content - Cortex plans, Ralph writes skill files

**Rationale:**

- Clear separation of concerns (planning vs execution)
- Prevents Cortex from breaking Ralph's loop
- Forces atomic task definition (can't "fix it while I'm here")

### Restructure Strategy (Copy-Verify-Delete)

**Decision:** Multi-phase approach to moving `brain/ralph/` → `brain/workers/ralph/`

**Status:** ✅ COMPLETED (2026-01-21) - Restructured to Option B with proper separation

**Phases:**

- **0-A:** ✅ Create Cortex alongside existing Ralph (no breaking changes)
- **0-B:** ✅ Implemented Option B structure with shared resources at root
- **0-C:** ✅ Human verified new location, all verifications pass
- **0-D:** ✅ Old `brain/ralph/` removed, Ralph runs from `workers/ralph/`

**Safety layers:**

1. Phase split: 0-A ends with copy, 0-B starts with delete
2. Mandatory stop sentinel: `:::PHASE-0A-COMPLETE:::`
3. BLOCKED marker: Phase 0-B has visible "🔒 BLOCKED" notice
4. Prerequisite check: 0-B requires explicit human approval

**Rationale:**

- Avoids Ralph breaking his own loop mid-execution
- Gives human opportunity to test before deleting original
- Copy operation is low-risk, delete is high-risk
- Separate phases allow rollback if issues discovered

---

## When to Update This File

**Add entries when:**

- Making architectural changes (new folders, new roles, new workflows)
- Establishing conventions (naming, style, commit format)
- Resolving design debates (document why you chose X over Y)
- Creating new processes (cadences, gates, review cycles)

**Don't add:**

- Temporary decisions (use `THOUGHTS.md` instead)
- Implementation details (use inline comments instead)
- Bug fixes (use commit messages instead)
- Personal preferences without rationale

**Review cadence:** During planning mode, check if recent decisions should be promoted from `THOUGHTS.md` → `DECISIONS.md`

---

## Recent Decisions

### DEC-2026-01-21-001: Cortex Performance - No Interactive Scripts

**Date:** 2026-01-21 20:09:00

**Decision:** Cortex must never call interactive or long-running scripts directly.

**Rationale:**

- Interactive scripts (`loop.sh`, `current_ralph_tasks.sh`, `thunk_ralph_tasks.sh`) hang and timeout
- Wastes 56+ seconds per call when Cortex attempts to execute them
- All needed data can be extracted via direct file reading
- `snapshot.sh` already provides comprehensive state information

**Implementation:**

- Added performance guidance to `CORTEX_SYSTEM_PROMPT.md`
- Enhanced `cortex/snapshot.sh` to include Ralph worker status section
- Cortex uses `bash cortex/snapshot.sh` instead of calling worker scripts directly
- Cortex reads files directly with `grep`, `cat`, `head`, `tail` when needed

**Impact:** Improved Cortex response time and reliability.

---

### DEC-2026-01-21-002: Timestamp Format Standard

**Date:** 2026-01-21 20:09:00

**Decision:** ALL timestamps in `.md` files MUST use `YYYY-MM-DD HH:MM:SS` format (with seconds).

**Rationale:**

- Consistency across all documentation
- Enables precise temporal tracking
- Prevents ambiguity in planning sessions and decision logs
- Supports automation and parsing

**Examples:**

- ✅ Correct: `2026-01-21 20:15:00`
- ❌ Wrong: `2026-01-21 20:15` (missing seconds)
- ❌ Wrong: `2026-01-21` (missing time)

**Applies to:**

- `cortex/THOUGHTS.md` - Planning session headers
- `cortex/IMPLEMENTATION_PLAN.md` - Last Updated timestamps
- `cortex/DECISIONS.md` - Decision dates
- Any other `.md` files with temporal markers

**Impact:** Improved temporal precision and documentation consistency.

---

### DEC-2026-01-21-003: Cortex File Access Boundaries

**Date:** 2026-01-21 20:09:00

**Decision:** Cortex may only modify files within approved directories. Violations should be detected by verifier.

**Approved Write Access:**

- `cortex/*.md` - Cortex's planning and analysis files
- `skills/self-improvement/GAP_BACKLOG.md` - Knowledge gap tracking
- `skills/self-improvement/SKILL_BACKLOG.md` - Skill promotion queue

**Forbidden Actions:**

- Modifying source code directly (Ralph's responsibility)
- Modifying protected infrastructure (`PROMPT.md`, `loop.sh`, `verifier.sh`, `rules/AC.rules`)
- Modifying Ralph's working copy of `IMPLEMENTATION_PLAN.md` (Cortex writes to `cortex/IMPLEMENTATION_PLAN.md` instead)

**Enforcement:**

- System prompt guidance (trust-based)
- Future: Add verifier rule `Cortex.FileAccess.1` to check git history

**Rationale:** Clear separation of concerns - Cortex plans, Ralph executes.

**Impact:** Prevents Cortex from overstepping boundaries and maintains clean delegation model.

---

### DEC-2026-01-26-001: shfmt Formatting Source of Truth

**Date:** 2026-01-26 17:01:35

**Decision:** The pre-commit hook's shfmt configuration is the source of truth for shell script formatting. Local shfmt runs must use the same flags as pre-commit to avoid formatting drift.

**Context:** Pre-commit uses `shfmt -ci` (case-indent), while local shfmt runs without flags produce different formatting. This caused repeated formatting diffs and hash churn for protected files like `loop.sh`.

**Resolution:**

- Always run `shfmt -ci -w <file>` when formatting shell scripts locally
- Pre-commit config location: `.pre-commit-config.yaml` (check `args` for shfmt hook)
- After formatting, update `.verify/*.sha256` hashes in ALL verify directories

**Affected Files:**

- `workers/ralph/loop.sh` (protected, hash-guarded)
- Any other shell scripts under pre-commit shfmt hook

**Rationale:** Consistent formatting between local development and CI prevents hash churn and failed commits.

**Impact:** Stable verification hashes, no more reformat/re-hash loops.

---

### DEC-2026-01-26-002: Loop End-of-Run Flush Commit Guarantee

**Date:** 2026-01-26 23:50:42

**Decision:** The Ralph loop must perform a final scoped "flush" commit at end-of-run (and on graceful interrupt after the current iteration) so that runs ending on BUILD do not leave uncommitted work.

**Rationale:**

- Current behavior only commits accumulated BUILD changes at the start of the next PLAN iteration.
- If a run ends on a BUILD iteration (common with `--iterations N`, early termination, or Ctrl+C after iteration completes), changes can remain unstaged/unstable and may be lost or cause confusion.
- A dedicated end-of-run flush preserves the semantics of PLAN vs BUILD while guaranteeing repository state consistency.

**Implementation Notes:**

- Use the existing `stage_scoped_changes` denylist (avoids committing `artifacts/**`, `cortex/PLAN_DONE.md`, caches).
- Do not run in `--dry-run` mode.
- Because `loop.sh` is hash-guarded, humans must regenerate `.verify/*.sha256` after changes.

**Impact:** More reliable loop behavior; fewer "dirty worktree" surprises; safer interruption/termination.
