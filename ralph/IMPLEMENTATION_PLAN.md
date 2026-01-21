# Implementation Plan - Brain Repository

## Maintenance Check (Planning Mode Only)

**When in planning mode**, run `bash .maintenance/verify-brain.sh` and review `.maintenance/MAINTENANCE.md`.
Incorporate any relevant maintenance items into the appropriate priority section below.

> **Note:** When maintenance items are completed:
> 1. Remove from `.maintenance/MAINTENANCE.md`
> 2. Log completion in `.maintenance/MAINTENANCE_LOG.md`
> 3. Remove from the MAINTENANCE section at the bottom of this plan

## Quick Wins (High Value, Low Effort)

These tasks can be completed quickly and provide immediate value. Consider prioritizing during BUILD iterations:

1. ~~**WARN.ST1** - Update NEURONS.md skills/ file count~~ ✅ COMPLETE
2. ~~**Task 1.1** - Fix terminology: Change "Brain KB" to "Brain Skills" in PROMPT.md:40~~ ✅ NOT FOUND (already fixed)
3. **Task 1.2** - Copy SKILL_TEMPLATE.md to templates/ralph/ (maintenance item)
4. **Task 1.3** - Fix broken links in skills/conventions.md and skills/projects/brain-example.md

**Note:** Task 1.1 appears already complete - no "Brain KB" references found in PROMPT.md.

## Overview

**Status:** PLAN mode - Strategic planning  
**Branch:** `brain-work` (up to date with origin after push)  
**Last Updated:** 2026-01-21 16:21  
**Progress:** 16 of 62 numbered tasks complete (25.8%)

**Current Focus:**
- Phase 0-A (Cortex Manager Pack) - 16/19 tasks complete (84.2% of phase)
- Next BUILD task: 0.A.4.3 - Update path references in workers/ralph/loop.sh
- All verifier checks PASSING (24/24), no critical warnings
- 3 more tasks to complete Phase 0-A before mandatory human verification

**Verifier Health:**
- ✅ All 24 acceptance criteria PASSING
- ✅ Protected file hashes current (loop.sh, verifier.sh, PROMPT.md)
- ⚠️ 4 maintenance items identified (already in Phase 1-3 below)
- ✅ No high or medium priority warnings blocking progress
- ⚠️ Last verifier run: 2026-01-21 14:44:56 (commit 8b00a4e)

**Strategic Notes:**
- Phase 0-A focuses on Cortex creation (no breaking changes to Ralph)
- Phase 0-B is BLOCKED pending human verification after Phase 0-A complete
- Maintenance items from verify-brain.sh already incorporated into Phases 1-4
- Skills directory has 33 markdown files
- Gap backlog has 3 entries (all P1-P2 priority, none promoted yet)
- No skill backlog items pending (promotion queue is empty)
- Recent work: 91 commits since 2026-01-19 (heavy development activity)

---

## Phase 0-A: Cortex Manager Pack - Create & Setup (19 items) - HUMAN APPROVED 2026-01-20

**Goal:** Create "Cortex" manager layer alongside existing Ralph (no breaking changes).

**Reference:** See `THOUGHTS.md` section "Cortex Manager Pack" for architecture and rationale.

**Priority:** PRIMARY - Must complete before moving Ralph to workers/ralph/

**Approach:** Build out cortex/ folder completely, then integrate with Ralph, then copy Ralph to workers/

### 0.A.1 - Create Cortex Folder & Core Files (7 items)

- [x] **0.A.1.1** Create `brain/cortex/` folder
  - **AC:** Folder exists at `brain/cortex/`

- [x] **0.A.1.2** Create `cortex/CORTEX_SYSTEM_PROMPT.md` - Opus identity and rules
  - **AC:** File contains: role definition ("You are Cortex, the Brain's manager"), what Cortex can modify (only IMPLEMENTATION_PLAN.md, THOUGHTS.md, GAP_BACKLOG.md, SKILL_BACKLOG.md), what Cortex cannot modify (PROMPT.md, loop.sh, verifier.sh, source code), workflow (Plan → Review → Delegate), Task Contract format template

- [x] **0.A.1.3** Create `cortex/REPO_MAP.md` - Human-friendly repo navigation
  - **AC:** File contains: folder purposes (cortex/, workers/, skills/, templates/), key files and their roles, where state lives, where skills are, navigation tips

- [x] **0.A.1.4** Create `cortex/DECISIONS.md` - Stability anchor
  - **AC:** File contains: naming conventions, update cadences, style preferences, architectural decisions (copy from THOUGHTS.md decision log + add Cortex decisions)

- [x] **0.A.1.5** Create `cortex/RUNBOOK.md` - Operations guide
  - **AC:** File contains: how to start Cortex (`bash cortex/run.sh`), how to start Ralph, troubleshooting steps, what to do if blocked, verification commands

- [x] **0.A.1.6** Create `cortex/IMPLEMENTATION_PLAN.md` - Task Contract template
  - **AC:** File contains: header explaining this is Cortex's plan, example Task Contract with Goal/Subtask/Constraints/Inputs/Acceptance Criteria/If Blocked format, empty "Current Tasks" section

- [x] **0.A.1.7** Create `cortex/THOUGHTS.md` - Cortex thinking space
  - **AC:** File contains: header explaining purpose ("Cortex's analysis and decisions"), "Current Mission" section, "Decision Log" section
  - **Content:** Should follow similar structure to ralph/THOUGHTS.md but focused on Cortex's high-level planning concerns

### 0.A.2 - Create cortex/run.sh and snapshot.sh (4 items)

- [x] **0.A.2.1** Create `cortex/snapshot.sh` - Generates current state
  - **AC:** Script outputs: current mission (from cortex/THOUGHTS.md), task progress (X/Y from IMPLEMENTATION_PLAN.md), last 3 THUNK entries, GAP_BACKLOG.md entry count, git status (clean/dirty), last 5 commits (oneline)
  - **AC:** Script uses strict mode (`set -euo pipefail`)
  - **AC:** Script is executable (`chmod +x`)

- [x] **0.A.2.2** Create `cortex/run.sh` - Main entry point
  - **AC:** Script concatenates: CORTEX_SYSTEM_PROMPT.md + snapshot output + DECISIONS.md
  - **AC:** Script pipes to `acli rovodev run` (similar pattern to ralph/loop.sh)
  - **AC:** Script uses strict mode, has usage help (`--help`)
  - **AC:** Script is executable

- [x] **0.A.2.3** Create `cortex/.gitignore` if needed
  - **AC:** Ignores any local/temp files (e.g., snapshot output cache)

- [x] **0.A.2.4** Test: Run `bash cortex/run.sh --help` successfully
  - **AC:** Help text displays without errors

### 0.A.3 - Update Ralph to Integrate with Cortex (3 items)

**Note:** These changes document the architecture but do NOT implement the sync mechanism yet. Actual sync logic will be implemented in Phase 0-B after human verification of the workers/ralph/ copy.

- [x] **0.A.3.1** Update `ralph/PROMPT.md` to reference Cortex as source of truth
  - **AC:** Add section explaining: "Cortex provides high-level tasks in `cortex/IMPLEMENTATION_PLAN.md`. Ralph copies this to his own `IMPLEMENTATION_PLAN.md` and tracks progress there."
  - **Note:** Document the intended workflow even though sync logic not implemented yet

- [x] **0.A.3.2** Update `ralph/AGENTS.md` to document Cortex → Ralph workflow
  - **AC:** Add "Manager/Worker Architecture" section explaining the relationship
  - **AC:** Document that Cortex lives at `../cortex/` (relative to ralph/)

- [x] **0.A.3.3** Update `ralph/NEURONS.md` to include cortex/ in the brain map
  - **AC:** Add cortex/ folder and its files to the map
  - **AC:** Update skills/ file count (currently claims "33", already updated in WARN.ST1)

### 0.A.4 - Restructure: Copy ralph/ to workers/ralph/ (5 items)

**IMPORTANT:** This sub-phase ONLY copies files. Delete happens in Phase 0-B after human verification.

- [x] **0.A.4.1** Create `brain/workers/` folder
  - **AC:** Folder exists at `brain/workers/`

- [x] **0.A.4.2** Copy entire `brain/ralph/` to `brain/workers/ralph/`
  - **AC:** All files and subfolders copied (preserving structure)
  - **AC:** Original `brain/ralph/` still exists (not moved yet)
  - **AC:** Verify with: `diff -rq brain/ralph brain/workers/ralph` shows no differences

- [ ] **0.A.4.3** Update path references in `workers/ralph/loop.sh`
  - **AC:** All relative paths updated (e.g., `../cortex/` becomes `../../cortex/`)
  - **AC:** SCRIPT_DIR detection still works from new location
  - **AC:** Path to `.verify/` updated if needed

- [ ] **0.A.4.4** Update path references in `workers/ralph/PROMPT.md`, `workers/ralph/AGENTS.md`, `workers/ralph/NEURONS.md`
  - **AC:** All file references use correct relative paths from new location
  - **AC:** Skills path updated from `../skills/` to `../../skills/`

- [ ] **0.A.4.5** Test from new location: `cd brain/workers/ralph && bash loop.sh --dry-run`
  - **AC:** Dry-run completes without errors
  - **AC:** Verifier can locate all required files
  - **Note:** This is a smoke test only, not a full iteration

---

## ⛔ PHASE 0-A COMPLETE - MANDATORY STOP

**DO NOT PROCEED TO PHASE 0-B.**

When all Phase 0-A tasks are checked `[x]`, Ralph MUST:
1. Output `:::PHASE-0A-COMPLETE:::`
2. Output `:::COMPLETE:::`
3. **STOP** - Do not read or execute Phase 0-B tasks

**Why:** Human must manually verify the copy worked before deleting the original:
```bash
cd brain/workers/ralph && bash loop.sh --iterations 1
```

**To continue:** Human will manually unblock Phase 0-B after verification.

---

## Phase 0-B: Cortex Manager Pack - Cleanup & Templates (11 items) - BLOCKED

> **🔒 BLOCKED:** This phase requires human approval after Phase 0-A verification.
> 
> **Unblock condition:** Human has run `bash brain/workers/ralph/loop.sh --iterations 1` successfully
> and confirmed by removing this BLOCKED notice.

### 0.B.1 - Delete Old ralph/ and Update References (5 items) - BLOCKED

**PREREQUISITE:** Human has verified `workers/ralph/loop.sh` works from new location.

- [ ] **0.B.1.1** Update `cortex/snapshot.sh` to read from `workers/ralph/`
  - **AC:** THUNK.md path updated to `../workers/ralph/THUNK.md`

- [ ] **0.B.1.2** Delete `brain/ralph/` folder (old location)
  - **AC:** Folder no longer exists
  - **AC:** Run this task from `workers/ralph/` location (Ralph is running from new location)

- [ ] **0.B.1.3** Update `brain/README.md` with new structure
  - **AC:** Documents cortex/, workers/ralph/, skills/, templates/ structure
  - **AC:** Updates any path references

- [ ] **0.B.1.4** Update `brain/.gitignore` if needed
  - **AC:** No stale references to old ralph/ location

- [ ] **0.B.1.5** Verify skills/ is at correct location (`brain/skills/`)
  - **AC:** skills/ is peer to cortex/ and workers/ (not nested inside ralph/)
  - **Note:** If skills/ is currently at `brain/ralph/skills/`, move to `brain/skills/`

### 0.B.2 - Update Templates and new-project.sh (6 items)

- [ ] **0.B.2.1** Create `brain/templates/cortex/` folder
  - **AC:** Folder exists with template versions of Cortex files

- [ ] **0.B.2.2** Create template Cortex files
  - **AC:** `CORTEX_SYSTEM_PROMPT.project.md` - generic version for new projects
  - **AC:** `REPO_MAP.project.md` - template with placeholders
  - **AC:** `DECISIONS.project.md` - empty template
  - **AC:** `RUNBOOK.project.md` - generic operations guide
  - **AC:** `run.sh` - parameterized for project paths
  - **AC:** `snapshot.sh` - parameterized for project paths

- [ ] **0.B.2.3** Update `new-project.sh` to copy Cortex template
  - **AC:** Script copies `templates/cortex/` to new project's `cortex/`
  - **AC:** Script copies `templates/ralph/` to new project's `workers/ralph/`

- [ ] **0.B.2.4** Update existing ralph templates for workers/ structure
  - **AC:** `templates/ralph/` paths assume `workers/ralph/` location
  - **AC:** Template references to cortex/ use `../../cortex/` paths

- [ ] **0.B.2.5** Move `brain/ralph/skills/` to `brain/skills/` if not already there
  - **AC:** skills/ exists at `brain/skills/` (peer to cortex/, workers/)
  - **AC:** Update any references in templates

- [ ] **0.B.2.6** Test: Full end-to-end verification
  - **AC:** `bash brain/workers/ralph/loop.sh --iterations 1` completes successfully
  - **AC:** `bash brain/cortex/run.sh --help` works
  - **AC:** All paths resolve correctly

---

## Phase 0-C: Verifier Runs After PLAN Mode (COMPLETE - 2026-01-21) (1 item)

**Goal:** Commit uncommitted changes that enable verifier to catch issues in PLAN mode.

**Rationale:** Currently uncommitted in `loop.sh` and `templates/ralph/loop.sh`. The verifier should run after PLAN iterations to catch AC violations early (e.g., protected file modifications during planning).

- [x] **0.C.1** Review and commit verifier PLAN mode changes
  - **AC:** Changes to `loop.sh` line 759-771 committed (verifier runs for both plan and build phases)
  - **AC:** Changes to `templates/ralph/loop.sh` line 674-686 committed (same fix)
  - **AC:** Commit message follows conventional format with scope `ralph` or `loop`
  - **Note:** Verified 2026-01-21: Hash checks show loop.sh is current and committed

---

## Phase 1: Quick Fixes & Maintenance (2 items)

**Goal:** Complete missing templates and fix broken documentation links

**Priority:** MEDIUM - Can be done anytime, good for quick BUILD iterations

**Effort:** Low - Each task is <5 minutes

Source: `.maintenance/verify-brain.sh` output

- [x] **1.1** ~~`PROMPT.md:40` - Change "Brain KB" to "Brain Skills" (NIT-1)~~ - Already complete
- [ ] **1.2** Copy `skills/self-improvement/SKILL_TEMPLATE.md` to `templates/ralph/SKILL_TEMPLATE.md`
  - **AC:** File exists at templates/ralph/SKILL_TEMPLATE.md
  - **AC:** Content matches source file
- [ ] **1.3** Fix broken links in skills files:
  - `skills/conventions.md` → Replace placeholder `../path/to/file.md` with actual path
  - `skills/projects/brain-example.md` → Fix relative paths (should be `../conventions.md`)
  - **AC:** No broken links reported by verify-brain.sh

---

## Phase 2: Shell Script Cleanup (16 items)

**Goal:** Fix shellcheck warnings and remove dead code from monitor scripts

**Priority:** LOW - Monitors work correctly, these are code quality improvements

**Effort:** Medium - Each task is 5-15 minutes but must be careful with monitors

**Note:** Template sync (WARN.T1, WARN.T2) should be handled when these fixes are complete

Source: `analysis/CODERABBIT_REVIEW_ANALYSIS.md` - PR #4 Shell Issues (SH-*)

### current_ralph_tasks.sh (10 items)

- [ ] **2.1** Line 4 - Update usage header to reflect current script name (SH-7, SH-13, SH-18)
- [ ] **2.2** Line 246 - Split declaration and assignment for SC2155 (SH-3, SH-9, SH-16)
- [ ] **2.3** Lines 276-279 - Remove unused `skip_line` variable (SH-4, SH-10, SH-20)
- [ ] **2.4** Lines 354-369 - Remove unused `wrap_text` function (SH-6, SH-21)
- [ ] **2.5** Line 404 - Use `_` placeholders for unused parsed fields (SH-5, SH-12)
- [ ] **2.6** Lines 156-159 - Fix cache key collision across sections (SH-11, SH-15)
- [ ] **2.7** Line 283 - Fix table column count (SH-17)
- [ ] **2.8** Lines 254-262 - Fix Archive/Clear exiting on ### headers (SH-8, SH-14, SH-19)

### thunk_ralph_tasks.sh (6 items)

- [ ] **2.9** Lines 6-15 - Update header to clarify script modifies THUNK.md via hotkey e (SH-28, SH-30, SH-32)
- [ ] **2.10** Lines 21-22 - Remove unused `LAST_DISPLAY_ROW` state (SH-33)
- [ ] **2.11** Lines 106-112 - Remove unused `normalize_description` function (SH-25)
- [ ] **2.12** Lines 125-134 - Remove unused `in_era` variable (SH-23)
- [ ] **2.13** Line 250 - Split declaration and assignment for SC2155 (SH-24, SH-29, SH-31)
- [ ] **2.14** Lines 217-227 - Extract magic number 8 into named constant (SH-26, SH-27)

### pr-batch.sh (1 item)

- [ ] **2.15** Lines 116-118 - Update category label to match new skills path (SH-22)

---

## Phase 3: Quick Reference Tables (5 items)

**Goal:** Add Quick Reference tables to skills files per documentation convention

**Priority:** MEDIUM - Improves agent UX, aligns with conventions

**Effort:** Low - Each task is 10-15 minutes (copy structure from existing examples)

Source: `.maintenance/verify-brain.sh` output

Add Quick Reference tables (per new convention) to:

- [ ] **3.1** `skills/domains/database-patterns.md`
- [ ] **3.2** `skills/domains/code-hygiene.md`
- [ ] **3.3** `skills/domains/shell/common-pitfalls.md`
- [ ] **3.4** `skills/domains/shell/strict-mode.md`
- [ ] **3.5** `skills/domains/shell/variable-patterns.md`

---

## Phase 4: Template Maintenance (2 items)

**Goal:** Add maintenance sections to PROMPT templates so new projects get this feature

**Priority:** LOW - Existing projects work fine, this is for future projects

**Effort:** Low - Each task is 5 minutes (copy sections from current PROMPT.md)

Source: `.maintenance/verify-brain.sh` output

- [ ] **4.1** Add `## Maintenance Check` and `## MAINTENANCE` sections to `templates/ralph/PROMPT.md`
- [ ] **4.2** Add `## Maintenance Check` and `## MAINTENANCE` sections to `templates/ralph/PROMPT.project.md`

---

## Phase 5: Design Decisions (3 items)

**Goal:** Implement verifier soft-fail during initialization to improve UX

**Priority:** LOW - Nice to have, doesn't fix any broken behavior

**Effort:** Medium - Requires careful testing (15-20 minutes per task)

Source: `analysis/CODERABBIT_REVIEW_ANALYSIS.md` - Design Decisions (human approved 2026-01-20)

### DD-1 & DD-2: Verifier Soft-Fail During Init Only

- [ ] **5.1** `loop.sh:504-508` - Add `.initialized` marker check to `run_verifier()`:
  - If `verifier.sh` missing AND `.verify/.initialized` exists → hard-fail (security)
  - If `verifier.sh` missing AND no `.initialized` → soft-fail (bootstrap mode)
- [ ] **5.2** `templates/ralph/loop.sh` - Apply same fix to template
- [ ] **5.3** `init_verifier_baselines.sh` - Create `.verify/.initialized` marker after successful init

### DD-3: Gitignore Personal Config

- [ ] **5.4** Rename `rovodev-config.yml` to `rovodev-config.local.yml`
- [ ] **5.5** Add `rovodev-config.local.yml` to `.gitignore`
- [ ] **5.6** Create `rovodev-config.template.yml` with placeholder values for others

---

## Phase 6: Review PR #4 D-Items Against New Plan (22 items)

Source: `analysis/CODERABBIT_REVIEW_ANALYSIS.md` - D-1 to D-22

Review each item against the rewritten IMPLEMENTATION_PLAN.md. For each:
- If obsolete (fixed by rewrite) → mark resolved in analysis/CODERABBIT_REVIEW_ANALYSIS.md
- If still applicable → add to appropriate phase above

| # | File | Issue | Status |
|---|------|-------|--------|
| D-1 | `AC-hygiene-additions.rules:74-79` | Process substitution requires bash | [ ] Review |
| D-2 | `AGENTS.md:56-58` | Add language tag to code fence | [ ] Review |
| D-3 | `AGENTS.md:56-58` | Add language identifier to fenced code block | [ ] Review |
| D-4 | `IMPLEMENTATION_PLAN.md:19-67` | Clarify phase ordering | [ ] Review |
| D-5 | `IMPLEMENTATION_PLAN.md:213-217` | Clarify checkbox policy scope | [ ] Review |
| D-6 | `IMPLEMENTATION_PLAN.md:288` | Fix markdown emphasis style | [ ] Review |
| D-7 | `IMPLEMENTATION_PLAN.md:4` | Extraction exits on ## HIGH PRIORITY | [ ] Review |
| D-8 | `IMPLEMENTATION_PLAN.md:6` | Context persistence block artifact | [ ] Review |
| D-9 | `IMPLEMENTATION_PLAN.md:173-210` | WARN summary mismatch | [ ] Review |
| D-10 | `IMPLEMENTATION_PLAN.md:172-209` | WARN summary conflicts | [ ] Review |
| D-11 | `IMPLEMENTATION_PLAN.md:275-276` | Fix broken WARN row | [ ] Review |
| D-12 | `IMPLEMENTATION_PLAN.md:239-240` | Use subheading for Rationale | [ ] Review |
| D-13 | `IMPLEMENTATION_PLAN.md:15-30` | Add completion tracking | [ ] Review |
| D-14 | `IMPLEMENTATION_PLAN.md:40-42` | Phase 2 source overstates range | [ ] Review |
| D-15 | `IMPLEMENTATION_PLAN.md:5` | Hyphenate compound adjectives | [ ] Review |
| D-16 | `IMPLEMENTATION_PLAN.md:40-43` | Phase 2 source overstates range | [ ] Review |
| D-17 | `IMPLEMENTATION_PLAN.md:41-44` | Phase 2 source doesn't match checklist | [ ] Review |
| D-18 | `IMPLEMENTATION_PLAN.md:64-131` | Phase 3 totals inconsistent | [ ] Review |
| D-19 | `IMPLEMENTATION_PLAN.md:159-177` | Next Execution Order implies unfinished | [ ] Review |
| D-20 | `IMPLEMENTATION_PLAN.md:206-213` | Resolve MD036/MD024 in Progress Summary | [ ] Review |
| D-21 | `IMPLEMENTATION_PLAN.md:5-12` | Update overview to reflect status | [ ] Review |
| D-22 | `rovodev-config.yml:11-12` | Document provisioning requirement | [ ] Review |

---

## MAINTENANCE

<!-- Auto-populated by verify-brain.sh - items below are consistency/housekeeping tasks -->
<!-- When completed, remove from here AND from .maintenance/MAINTENANCE.md -->

_Run `bash .maintenance/verify-brain.sh` to check for maintenance items._
