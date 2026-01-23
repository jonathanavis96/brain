# Implementation Plan - Brain Repository

**Status:** PLANNING Mode  
**Last Updated:** 2026-01-23  
**Branch:** brain-work

## Overview

This plan addresses verifier warnings, pre-commit formatting issues, and strategic improvements to the brain repository based on THOUGHTS.md goals.

---

## Phase 0-Warn: Verifier Warnings

**Priority:** HIGH - Fix verifier warnings first before numbered tasks

- [x] WARN.Template.1.thunk_ralph_tasks - Sync workers/ralph/thunk_ralph_tasks.sh with template
- [ ] WARN.Hygiene.TemplateSync.1.current_ralph_tasks - Sync workers/ralph/current_ralph_tasks.sh with template
- [ ] WARN.Hygiene.TemplateSync.2.loop - Sync workers/ralph/loop.sh core logic with template (path references)
- [ ] WARN.Lint.Shellcheck.LoopSh - Fix shellcheck issues in workers/ralph/loop.sh
- [ ] WARN.Lint.Shellcheck.VerifierSh - Fix shellcheck issues in workers/ralph/verifier.sh (shfmt whitespace)
- [ ] WARN.Lint.Shellcheck.CurrentRalphTasks - Fix shellcheck issues in workers/ralph/current_ralph_tasks.sh
- [ ] WARN.Lint.Shellcheck.ThunkRalphTasks - Fix shellcheck issues in workers/ralph/thunk_ralph_tasks.sh

---

## Phase 0-Quick: Quick Wins

**Priority:** HIGH - Address pre-commit failures discovered during planning

- [ ] 0.Q.1 - Apply shfmt formatting to workers/ralph/verifier.sh (whitespace normalization)
- [ ] 0.Q.2 - Verify pre-commit passes on all files after formatting fix

---

## Phase 1: Template Synchronization

**Goal:** Ensure workers/ralph/ matches templates/ralph/ for core infrastructure files

### 1.1 Monitor Scripts (2 tasks)

- [ ] 1.1.1 - Sync thunk_ralph_tasks.sh: Compare and merge template changes
- [ ] 1.1.2 - Sync current_ralph_tasks.sh: Compare and merge template changes

### 1.2 Core Loop Infrastructure (1 task)

- [ ] 1.2.1 - Sync loop.sh path references: Update RALPH path calculation from `$ROOT/workers/ralph` to match template structure

---

## Phase 2: Code Quality & Hygiene

**Goal:** Achieve zero shellcheck warnings across all shell scripts

### 2.1 Shell Script Linting (4 tasks)

- [ ] 2.1.1 - Fix shellcheck issues in loop.sh (after template sync)
- [ ] 2.1.2 - Fix shellcheck issues in verifier.sh (SC2162 or similar)
- [ ] 2.1.3 - Fix shellcheck issues in current_ralph_tasks.sh (if any after template sync)
- [ ] 2.1.4 - Fix shellcheck issues in thunk_ralph_tasks.sh (if any after template sync)

### 2.2 Formatting Consistency (1 task)

- [ ] 2.2.1 - Run shfmt on all shell scripts in workers/ralph/ to ensure consistent formatting

---

## Phase 3: Skills Knowledge Base Expansion

**Goal:** Address gaps identified in THOUGHTS.md success criteria

### 3.1 Documentation Improvements (3 tasks)

- [ ] 3.1.1 - Review and update skills/SUMMARY.md to ensure all recent skills are referenced
- [ ] 3.1.2 - Audit skills/index.md for completeness against actual files in skills/domains/
- [ ] 3.1.3 - Add missing cross-references between related skills (e.g., ralph-patterns.md ↔ bootstrap-patterns.md)

### 3.2 Gap Analysis (2 tasks)

- [ ] 3.2.1 - Review skills/self-improvement/GAP_BACKLOG.md for promotion candidates
- [ ] 3.2.2 - Promote 2-3 high-value gaps to skills/self-improvement/SKILL_BACKLOG.md

---

## Phase 4: Ralph Loop Reliability

**Goal:** Improve Ralph's self-improvement and task execution accuracy

### 4.1 Task Completion Tracking (2 tasks)

- [ ] 4.1.1 - Verify THUNK.md logging works correctly across eras
- [ ] 4.1.2 - Test checkpoint protocol (code + THUNK + IMPLEMENTATION_PLAN in single commit)

### 4.2 Verifier Enhancements (2 tasks)

- [ ] 4.2.1 - Review AC.rules for any missing hygiene checks
- [ ] 4.2.2 - Document waiver protocol usage in workers/ralph/docs/WAIVER_PROTOCOL.md

---

## Phase 5: Strategic Improvements

**Goal:** Long-term enhancements aligned with THOUGHTS.md vision

### 5.1 Template Propagation (2 tasks)

- [ ] 5.1.1 - Audit templates/ for any changes that should propagate to workers/ralph/
- [ ] 5.1.2 - Document template sync protocol in skills/domains/ralph/change-propagation.md

### 5.2 Bootstrap Improvements (2 tasks)

- [ ] 5.2.1 - Test new-project.sh for any missing initialization steps
- [ ] 5.2.2 - Update templates/ralph/ with latest best practices from workers/ralph/

---

## Completion Criteria

- [ ] All verifier warnings resolved (WARN count = 0)
- [ ] All pre-commit hooks pass
- [ ] All shellcheck issues fixed
- [ ] Template synchronization complete
- [ ] Documentation audit complete
- [ ] All changes committed with proper git messages

---

## Notes

- **Template Sync Priority:** Phase 0-Warn tasks MUST be completed before Phase 1 tasks
- **Batching Rule:** Multiple shellcheck warnings in the same file = 1 task
- **Cross-file Batching:** Same fix type across multiple files = 1 task (e.g., SC2162 in 5 files)
- **Discovery Defer:** New issues found during BUILD mode noted in commit messages, added to plan during next PLAN mode
