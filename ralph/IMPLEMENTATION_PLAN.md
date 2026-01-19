# Implementation Plan - Brain Repository Maintenance

## Overview

**Status:** Ready to push Phase 1-2 commits, then continue Phase 3 (LOW priority polish)  
**Branch:** `brain-work` (5 commits ahead of origin)  
**Last Updated:** 2026-01-19 (PLAN iteration)

### Context

All HIGH and MEDIUM priority tasks from CodeRabbit v2 review are complete:
- ✅ Phase 1: Template hash baselines updated (1 item)
- ✅ Phase 2: Minor issues fixed (12 items)
- 🔄 Phase 3: LOW priority nitpicks - 22 items remaining (8 complete)

**Phase 3 Assessment:**
- Items are style/optimization improvements, not bugs
- Primary value: codebase polish and technical debt reduction
- Secondary value: learning opportunities for Ralph patterns
- Execution strategy: Quick wins first (format/docs), then dead code, then robustness

---

## HIGH PRIORITY

### Phase 1: Template Hash Baselines (1 item)

Source: Discovery during planning - `templates/ralph/.verify/` has stale hash baselines

- [x] **1.1** Update `templates/ralph/.verify/` hash baselines to match current protected files
  - `loop.sha256`: Update from `e753d05...` to `cb54c8a...` (matches `loop.sh`)
  - `prompt.sha256`: Update from `b29969...` to `b355c8...` (matches `PROMPT.md`)
  - Verify: `sha256sum loop.sh PROMPT.md verifier.sh AC.rules` and compare to template hashes
  - Reason: Template directory should have correct baselines for new projects

---

## MEDIUM PRIORITY

### Phase 2: Minor Issues from CodeRabbit v2 (12 items)

Source: `CODERABBIT_REVIEW_ANALYSIS_v2.md` - Items M-19, M-21 through M-32

**Note:** Original Phase 1 tasks (1.1-1.14) were already completed in previous iterations but plan wasn't updated.

- [x] **2.1** `render_ac_status.sh:57-71` - Add SKIP pattern to regex and case statement (M-19)
- [x] **2.2** `skills/self-improvement/SKILL_TEMPLATE.md:9-12` - Change "Claude" to "the agent" (M-21)
- [x] **2.3** `skills/self-improvement/SKILL_TEMPLATE.md:66-69` - Change `index.md` reference to `SUMMARY.md` (M-22)
- [x] **2.4** `generators/generate-neurons.sh:653-660` - Change "KB Index" label to "Skills Index" (M-23)
- [x] **2.5** `skills/conventions.md:248-251` - Remove duplicate PROMPT template bullet (M-24)
- [x] **2.6** `skills/domains/README.md:61-63` - Remove "(planned)" qualifier for conventions.md (M-25)
- [x] **2.7** `skills/self-improvement/README.md:20-25` - Change `skills/index.md` to `skills/SUMMARY.md` (M-26)
- [x] **2.8** `AGENTS.md:56-58` - Add fence language tag for `:::COMPLETE:::` block (M-27)
- [x] **2.9** `AGENTS.md:30-41` - Update monitor hotkeys documentation to match actual behavior (M-28)
- [x] **2.10** `PROMPT.md:109-110` - Add new hash-guarded files to protected-files list (M-29)
- [x] **2.11** `skills/domains/ralph-patterns.md:71-76` - Update commit strategy to use `[?]` not `[x]` (M-30)
- [x] **2.12** `THOUGHTS.md:17-23` - Add `bash` fence language tag (M-31) - OBSOLETE: Bug A section removed in 149e5fe streamline commit

---

## LOW PRIORITY

### Phase 3: Nitpicks from CodeRabbit v2 (30 items total, 22 remaining)

Source: `CODERABBIT_REVIEW_ANALYSIS_v2.md` - Items N-1 through N-31

#### Refactoring (6 items - 5 complete, 1 deferred)

- [x] **3.1** `loop.sh:644-675` - Extract `launch_in_terminal()` helper for duplicated terminal detection (N-1)
- [x] **3.2** `templates/ralph/loop.sh:644-675` - Sync with extracted helper (N-4)
- [x] **3.3** `current_ralph_tasks.sh` - Use process substitution `< <(...)` instead of pipe in while loop (N-2)
- [x] **3.4** `thunk_ralph_tasks.sh` - Use process substitution instead of pipe in while loop (N-3)
- [x] **3.5** `new-project.sh:412-422` - Add `escape_sed_replacement` function for THUNK template (N-5)
- [ ] **3.6** `templates/ralph/loop.sh:299-309` - Consider yq for modelId sed operation (N-6)
  - Status: DEFERRED - sed solution is adequate, yq adds unnecessary dependency

#### Dead Code (8 items - 2 complete, 6 remaining)

**Goal:** Clean up unused variables/functions to pass shellcheck cleanly

- [x] **3.7** `templates/ralph/current_ralph_tasks.sh:25-35` - Remove unused `SHOW_HELP` flag (N-7)
- [x] **3.8** `templates/ralph/current_ralph_tasks.sh:354-369` - Remove unused `wrap_text` function (N-8)
- [ ] **3.9** `templates/ralph/current_ralph_tasks.sh:371-485` - Use `_` placeholders for unused `icon`, `full_desc` (N-9)
- [ ] **3.10** `current_ralph_tasks.sh:354-369` - Remove unused `wrap_text` function (N-10)
  - Note: Root file still has dead function, template already cleaned
- [ ] **3.11** `thunk_ralph_tasks.sh:106-112` - Remove unused `normalize_description` function (N-11)
- [ ] **3.12** `templates/ralph/thunk_ralph_tasks.sh:127-134` - Remove unused `in_era` variable (N-12)
- [ ] **3.13** `templates/ralph/thunk_ralph_tasks.sh:146-162,239-255` - Use `_` for unused parsed vars (N-13)
- [ ] **3.14** `templates/ralph/thunk_ralph_tasks.sh:167,260,311` - Fix SC2155 in template (N-14)

#### Format/Style (7 items - 1 complete, 6 remaining)

**Goal:** Consistency and markdown linter compliance

- [x] **3.15** `.verify/verifier.sha256:1` - Standardize format with filename suffix (N-15)
- [ ] **3.16** `templates/ralph/PROMPT.project.md:39-41` - Fix MD050 strong-style (N-16)
- [ ] **3.17** `HISTORY.md:86` - Remove spaces in inline code spans (N-17)
- [ ] **3.18** `templates/ralph/PROMPT.md:50-53` - Add `markdown` fence language tag (N-18)
- [ ] **3.19** `NEURONS.md:204-206` - Change Windows backslashes to forward slashes (N-19)
- [ ] **3.20** `skills/index.md:1-6` - Remove or auto-generate "Last updated" stamp (N-20)
  - Decision: Remove entirely (auto-generation adds complexity for low value)
- [ ] **3.21** `THUNK.md:99-100,182,186,190,194-195` - Fix duplicate THUNK numbers with suffixes (N-21)
  - Note: Cosmetic only - historical Era 1 numbering artifacts

#### Robustness (6 items - 0 complete, 6 remaining)

**Goal:** Prevent edge-case failures and improve error handling

- [ ] **3.22** `templates/ralph/init_verifier_baselines.sh:43-50` - Check each .gitignore entry independently (N-22)
  - Complexity: Low - split compound test into loop
- [ ] **3.23** `templates/ralph/init_verifier_baselines.sh:22-24` - Normalize to store only hash not full sha256sum (N-23)
  - Complexity: Low - adjust cut/awk operation for consistency
- [ ] **3.24** `templates/ralph/current_ralph_tasks.sh:101-201` - Hash full raw line to prevent cache collisions (N-24)
  - Complexity: Medium - change cache key generation strategy
- [ ] **3.25** `templates/ralph/current_ralph_tasks.sh:242-349` - Align Archive/Clear parsing with extract logic (N-25)
  - Complexity: Medium - refactor parsing into shared function
- [ ] **3.26** `templates/ralph/verifier.sh:30-34` - Use `grep -F` for literal matching to prevent regex injection (N-26)
  - Complexity: Trivial - add `-F` flag for security
- [ ] **3.27** `templates/ralph/verifier.sh:222-227` - Add trap for temp file cleanup on early exit (N-27)
  - Complexity: Low - add trap handler

#### Documentation (4 items - 0 complete, 4 remaining)

**Goal:** Complete terminology migration and improve user guidance

- [ ] **3.28** `templates/backend/AGENTS.project.md:22-33` - Update "KB file" to "skill file" (N-28)
- [ ] **3.29** `templates/AGENTS.project.md:58-74` - Add standalone-mode note for missing brain (N-29)
- [ ] **3.30** `rovodev-config.yml:11-12` - Document model provisioning requirement (N-30)
- [ ] **3.31** `templates/ralph/thunk_ralph_tasks.sh:262-268` - Add non-TTY guard for `tput cup` (N-31)
  - Complexity: Trivial - add `[[ -t 1 ]]` check

---

## ⏭️ DEFERRED/SKIPPED

| Item | Status | Reason |
|------|--------|--------|
| **3.6** - yq for modelId sed | DEFERRED | Sed solution adequate, yq adds unnecessary dependency |
| `old_sh/test-rovodev-integration.sh` issues | SKIPPED | Archived code - not maintaining |
| `AC.rules` pattern overlap | SKIPPED | Intentional defense-in-depth design |
| `HISTORY.md` MD038 at line 86 | SKIPPED | Historical records - don't alter |

---

## Execution Strategy

### PLAN Mode Actions (This Iteration)

1. ✅ Update IMPLEMENTATION_PLAN.md with accurate task counts and priorities
2. ✅ Reorganize Phase 3 by execution order (quick wins → dead code → robustness → docs)
3. 🔄 Commit planning updates
4. 🔄 Push ALL accumulated commits (5 commits: tasks 3.5, 3.7, 3.8, 3.15)

### BUILD Iterations (Phase 3) - Recommended Order

**Batch 1 - Quick Wins (7 tasks, ~5 iterations):**
- 3.16, 3.17, 3.18, 3.19, 3.20, 3.21 (format/style fixes)
- 3.26 (trivial grep -F flag)

**Batch 2 - Dead Code (6 tasks, ~4 iterations):**
- 3.9, 3.10, 3.11, 3.12, 3.13, 3.14 (cleanup unused code)

**Batch 3 - Documentation (4 tasks, ~3 iterations):**
- 3.28, 3.29, 3.30, 3.31 (terminology and guidance)

**Batch 4 - Robustness (5 tasks, ~7 iterations):**
- 3.22, 3.23 (init script improvements - trivial)
- 3.27 (trap handler - low complexity)
- 3.24, 3.25 (cache/parsing refactors - medium complexity)

### Quality Gates

- **Shellcheck:** Run after ANY .sh file changes
- **Template sync:** Changes to root files must sync to `templates/ralph/`
- **Testing:** Monitor scripts require manual verification with `bash script.sh`
- **Markdown lint:** Validate .md changes don't break tables/formatting

### Success Criteria

Phase 3 complete when:
- [ ] All 22 remaining tasks marked `[x]`
- [ ] All commits pushed to `origin/brain-work`
- [ ] `verifier.sh` passes cleanly
- [ ] No shellcheck warnings in modified scripts
- [ ] Ready to merge `brain-work` → `main`
