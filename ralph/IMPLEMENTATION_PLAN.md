# Implementation Plan - Brain Repository

## Maintenance Check (Planning Mode Only)

**When in planning mode**, run `bash .maintenance/verify-brain.sh` and review `.maintenance/MAINTENANCE.md`.
Incorporate any relevant maintenance items into the appropriate priority section below.

> **Note:** When maintenance items are completed:
> 1. Remove from `.maintenance/MAINTENANCE.md`
> 2. Log completion in `.maintenance/MAINTENANCE_LOG.md`
> 3. Remove from the MAINTENANCE section at the bottom of this plan

## Overview

**Status:** Active - Phase 0-A in progress (Cortex Manager Pack - Create & Setup)  
**Branch:** `brain-work` (1 commit ahead of origin)  
**Last Updated:** 2026-01-20  
**Progress:** 1 of 65 tasks complete (1.5%)

---

## Phase 0-A: Cortex Manager Pack - Create & Setup (19 items) - HUMAN APPROVED 2026-01-20

**Goal:** Create "Cortex" manager layer alongside existing Ralph (no breaking changes).

**Reference:** See `THOUGHTS.md` section "Cortex Manager Pack" for architecture and rationale.

**Note:** Before starting Phase 0-A tasks, commit uncommitted loop.sh changes from previous BUILD iteration:
```bash
git add loop.sh
git commit -m "feat(loop): add human intervention detection via exit code 43"
```

### 0.A.1 - Create Cortex Folder & Core Files (7 items)

- [x] **0.A.1.1** Create `brain/cortex/` folder
  - **AC:** Folder exists at `brain/cortex/`

- [ ] **0.A.1.2** Create `cortex/CORTEX_SYSTEM_PROMPT.md` - Opus identity and rules
  - **AC:** File contains: role definition ("You are Cortex, the Brain's manager"), what Cortex can modify (only IMPLEMENTATION_PLAN.md, THOUGHTS.md, GAP_BACKLOG.md, SKILL_BACKLOG.md), what Cortex cannot modify (PROMPT.md, loop.sh, verifier.sh, source code), workflow (Plan → Review → Delegate), Task Contract format template

- [ ] **0.A.1.3** Create `cortex/REPO_MAP.md` - Human-friendly repo navigation
  - **AC:** File contains: folder purposes (cortex/, workers/, skills/, templates/), key files and their roles, where state lives, where skills are, navigation tips

- [ ] **0.A.1.4** Create `cortex/DECISIONS.md` - Stability anchor
  - **AC:** File contains: naming conventions, update cadences, style preferences, architectural decisions (copy from THOUGHTS.md decision log + add Cortex decisions)

- [ ] **0.A.1.5** Create `cortex/RUNBOOK.md` - Operations guide
  - **AC:** File contains: how to start Cortex (`bash cortex/run.sh`), how to start Ralph, troubleshooting steps, what to do if blocked, verification commands

- [ ] **0.A.1.6** Create `cortex/IMPLEMENTATION_PLAN.md` - Task Contract template
  - **AC:** File contains: header explaining this is Cortex's plan, example Task Contract with Goal/Subtask/Constraints/Inputs/Acceptance Criteria/If Blocked format, empty "Current Tasks" section

- [ ] **0.A.1.7** Create `cortex/THOUGHTS.md` - Cortex thinking space
  - **AC:** File contains: header explaining purpose ("Cortex's analysis and decisions"), "Current Mission" section (empty), "Decision Log" section (empty)

### 0.A.2 - Create cortex/run.sh and snapshot.sh (4 items)

- [ ] **0.A.2.1** Create `cortex/snapshot.sh` - Generates current state
  - **AC:** Script outputs: current mission (from cortex/THOUGHTS.md), task progress (X/Y from IMPLEMENTATION_PLAN.md), last 3 THUNK entries, GAP_BACKLOG.md entry count, git status (clean/dirty), last 5 commits (oneline)
  - **AC:** Script uses strict mode (`set -euo pipefail`)
  - **AC:** Script is executable (`chmod +x`)

- [ ] **0.A.2.2** Create `cortex/run.sh` - Main entry point
  - **AC:** Script concatenates: CORTEX_SYSTEM_PROMPT.md + snapshot output + DECISIONS.md
  - **AC:** Script pipes to `acli rovodev run` (similar pattern to ralph/loop.sh)
  - **AC:** Script uses strict mode, has usage help (`--help`)
  - **AC:** Script is executable

- [ ] **0.A.2.3** Create `cortex/.gitignore` if needed
  - **AC:** Ignores any local/temp files (e.g., snapshot output cache)

- [ ] **0.A.2.4** Test: Run `bash cortex/run.sh --help` successfully
  - **AC:** Help text displays without errors

### 0.A.3 - Update Ralph to Read from Cortex Plan (4 items)

- [ ] **0.A.3.1** Update `ralph/loop.sh` to copy Cortex plan at startup
  - **AC:** At start of `run_once()`, if `../cortex/IMPLEMENTATION_PLAN.md` exists and is newer than `IMPLEMENTATION_PLAN.md`, copy it
  - **AC:** Log message: "Syncing from Cortex plan..."
  - **AC:** Only copy once per loop invocation (not per iteration)

- [ ] **0.A.3.2** Update `ralph/PROMPT.md` to reference Cortex as source of truth
  - **AC:** Add section explaining: "Cortex provides high-level tasks in `cortex/IMPLEMENTATION_PLAN.md`. Ralph copies this to his own `IMPLEMENTATION_PLAN.md` and tracks progress there."

- [ ] **0.A.3.3** Update `ralph/AGENTS.md` to document Cortex → Ralph workflow
  - **AC:** Add "Manager/Worker Architecture" section explaining the relationship

- [ ] **0.A.3.4** Update `ralph/NEURONS.md` to include cortex/ in the brain map
  - **AC:** Add cortex/ folder and its files to the map

### 0.A.4 - Restructure: Copy ralph/ to workers/ralph/ (4 items)

**IMPORTANT:** This sub-phase ONLY copies files. Delete happens in Phase 0-B after human verification.

- [ ] **0.A.4.1** Create `brain/workers/` folder
  - **AC:** Folder exists at `brain/workers/`

- [ ] **0.A.4.2** Copy entire `brain/ralph/` to `brain/workers/ralph/`
  - **AC:** All files and subfolders copied (preserving structure)
  - **AC:** Original `brain/ralph/` still exists (not moved yet)
  - **AC:** Verify with: `diff -rq brain/ralph brain/workers/ralph` shows no differences

- [ ] **0.A.4.3** Update path references in `workers/ralph/loop.sh`
  - **AC:** All relative paths updated (e.g., `../cortex/` becomes `../../cortex/`)
  - **AC:** SCRIPT_DIR detection still works from new location

- [ ] **0.A.4.4** Update path references in `workers/ralph/PROMPT.md`, `workers/ralph/AGENTS.md`, `workers/ralph/NEURONS.md`
  - **AC:** All file references use correct relative paths from new location

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

## Phase 1: Quick Fixes (3 items)

Source: `analysis/CODERABBIT_REVIEW_ANALYSIS.md` - Quick Fixes section

- [ ] **1.1** `PROMPT.md:40` - Change "Brain KB" to "Brain Skills" (NIT-1)
- [ ] **1.2** Copy `skills/self-improvement/SKILL_TEMPLATE.md` to `templates/ralph/SKILL_TEMPLATE.md`
- [ ] **1.3** Fix broken links in skills files:
  - `skills/conventions.md` - `../path/to/file.md` (placeholder link)
  - `skills/projects/brain-example.md` - incorrect relative paths

---

## Phase 2: Shell Script Cleanup (16 items)

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

Source: `.maintenance/verify-brain.sh` output

Add Quick Reference tables (per new convention) to:

- [ ] **3.1** `skills/domains/database-patterns.md`
- [ ] **3.2** `skills/domains/code-hygiene.md`
- [ ] **3.3** `skills/domains/shell/common-pitfalls.md`
- [ ] **3.4** `skills/domains/shell/strict-mode.md`
- [ ] **3.5** `skills/domains/shell/variable-patterns.md`

---

## Phase 4: Template Maintenance (2 items)

Source: `.maintenance/verify-brain.sh` output

- [ ] **4.1** Add `## Maintenance Check` and `## MAINTENANCE` sections to `templates/ralph/PROMPT.md`
- [ ] **4.2** Add `## Maintenance Check` and `## MAINTENANCE` sections to `templates/ralph/PROMPT.project.md`

---

## Phase 5: Design Decisions (3 items)

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

### Current Maintenance Items (from verify-brain.sh 2026-01-20)

- [ ] **M.1** Create or sync template: `templates/ralph/SKILL_TEMPLATE.md` from `skills/self-improvement/SKILL_TEMPLATE.md`
  - **Note:** This is already covered by Phase 1, Task 1.2
- [ ] **M.2** Add missing sections to `templates/ralph/PROMPT.md`: `## Maintenance Check`, `## MAINTENANCE`
  - **Note:** This is already covered by Phase 4, Tasks 4.1 and 4.2
- [ ] **M.3** Fix broken links in skills files
  - `skills/conventions.md` → `../path/to/file.md` (placeholder link)
  - `skills/projects/brain-example.md` → incorrect relative paths
  - **Note:** This is already covered by Phase 1, Task 1.3
- [ ] **M.4** Add Quick Reference tables to 5 skill files
  - **Note:** This is already covered by Phase 3, Tasks 3.1-3.5

**Status:** All maintenance items are already incorporated into existing phases. No additional tasks needed.

_Run `bash .maintenance/verify-brain.sh` to check for maintenance items._
