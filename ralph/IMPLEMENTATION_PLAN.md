# Implementation Plan - Brain Repository Maintenance

## Overview

**Status:** Phase 1-3 remaining  
**Branch:** `brain-work` (up to date with origin)  
**Last Updated:** 2026-01-19

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
- [ ] **2.6** `skills/domains/README.md:61-63` - Remove "(planned)" qualifier for conventions.md (M-25)
- [ ] **2.7** `skills/self-improvement/README.md:20-25` - Change `skills/index.md` to `skills/SUMMARY.md` (M-26)
- [ ] **2.8** `AGENTS.md:56-58` - Add fence language tag for `:::COMPLETE:::` block (M-27)
- [ ] **2.9** `AGENTS.md:30-41` - Update monitor hotkeys documentation to match actual behavior (M-28)
- [ ] **2.10** `PROMPT.md:109-110` - Add new hash-guarded files to protected-files list (M-29)
- [ ] **2.11** `skills/domains/ralph-patterns.md:71-76` - Update commit strategy to use `[?]` not `[x]` (M-30)
- [ ] **2.12** `THOUGHTS.md:17-23` - Add `bash` fence language tag (M-31)

---

## LOW PRIORITY

### Phase 3: Nitpicks from CodeRabbit v2 (31 items)

Source: `CODERABBIT_REVIEW_ANALYSIS_v2.md` - Items N-1 through N-31

#### Refactoring (6 items)

- [ ] **3.1** `loop.sh:644-675` - Extract `launch_in_terminal()` helper for duplicated terminal detection (N-1)
- [ ] **3.2** `templates/ralph/loop.sh:644-675` - Sync with extracted helper (N-4)
- [ ] **3.3** `current_ralph_tasks.sh` - Use process substitution `< <(...)` instead of pipe in while loop (N-2)
- [ ] **3.4** `thunk_ralph_tasks.sh` - Use process substitution instead of pipe in while loop (N-3)
- [ ] **3.5** `new-project.sh:412-422` - Add `escape_sed_replacement` function for THUNK template (N-5)
- [ ] **3.6** `templates/ralph/loop.sh:299-309` - Consider yq for modelId sed operation (N-6, low value)

#### Dead Code (8 items)

- [ ] **3.7** `templates/ralph/current_ralph_tasks.sh:25-35` - Remove unused `SHOW_HELP` flag (N-7)
- [ ] **3.8** `templates/ralph/current_ralph_tasks.sh:354-369` - Remove unused `wrap_text` function (N-8)
- [ ] **3.9** `templates/ralph/current_ralph_tasks.sh:371-485` - Use `_` placeholders for unused `icon`, `full_desc` (N-9)
- [ ] **3.10** `current_ralph_tasks.sh:354-369` - Remove unused `wrap_text` function (N-10)
- [ ] **3.11** `thunk_ralph_tasks.sh:106-112` - Remove unused `normalize_description` function (N-11)
- [ ] **3.12** `templates/ralph/thunk_ralph_tasks.sh:127-134` - Remove unused `in_era` variable (N-12)
- [ ] **3.13** `templates/ralph/thunk_ralph_tasks.sh:146-162,239-255` - Use `_` for unused parsed vars (N-13)
- [ ] **3.14** `templates/ralph/thunk_ralph_tasks.sh:167,260,311` - Fix SC2155 in template (N-14)

#### Format/Style (7 items)

- [ ] **3.15** `.verify/verifier.sha256:1` - Standardize format with filename suffix (N-15)
- [ ] **3.16** `templates/ralph/PROMPT.project.md:39-41` - Fix MD050 strong-style (N-16)
- [ ] **3.17** `HISTORY.md:86` - Remove spaces in inline code spans (N-17)
- [ ] **3.18** `templates/ralph/PROMPT.md:50-53` - Add `markdown` fence language tag (N-18)
- [ ] **3.19** `NEURONS.md:204-206` - Change Windows backslashes to forward slashes (N-19)
- [ ] **3.20** `skills/index.md:1-6` - Remove or auto-generate "Last updated" stamp (N-20)
- [ ] **3.21** `THUNK.md:99-100,182,186,190,194-195` - Fix duplicate THUNK numbers with suffixes (N-21)

#### Robustness (6 items)

- [ ] **3.22** `templates/ralph/init_verifier_baselines.sh:43-50` - Check each .gitignore entry independently (N-22)
- [ ] **3.23** `templates/ralph/init_verifier_baselines.sh:22-24` - Normalize to store only hash not full sha256sum (N-23)
- [ ] **3.24** `templates/ralph/current_ralph_tasks.sh:101-201` - Hash full raw line to prevent cache collisions (N-24)
- [ ] **3.25** `templates/ralph/current_ralph_tasks.sh:242-349` - Align Archive/Clear parsing with extract logic (N-25)
- [ ] **3.26** `templates/ralph/verifier.sh:30-34` - Use `grep -F` for literal matching to prevent regex injection (N-26)
- [ ] **3.27** `templates/ralph/verifier.sh:222-227` - Add trap for temp file cleanup on early exit (N-27)

#### Documentation (4 items)

- [ ] **3.28** `templates/backend/AGENTS.project.md:22-33` - Update "KB file" to "skill file" (N-28)
- [ ] **3.29** `templates/AGENTS.project.md:58-74` - Add standalone-mode note for missing brain (N-29)
- [ ] **3.30** `rovodev-config.yml:11-12` - Document model provisioning requirement (N-30)
- [ ] **3.31** `templates/ralph/thunk_ralph_tasks.sh:262-268` - Add non-TTY guard for `tput cup` (N-31)

---

## ⏭️ SKIPPED (Intentionally Not Fixing)

| Item | Reason |
|------|--------|
| `old_sh/test-rovodev-integration.sh` issues | Archived code - not maintaining |
| `AC.rules:19-25`, `222-228` pattern issues | Intentional defense-in-depth design |
| `HISTORY.md` MD038 issue at line 86 | Historical records - don't alter |

---

## Notes

- **Template sync strategy:** Fix root file first, then sync to `templates/ralph/`
- **Hash baselines:** Run `./verifier.sh` after ANY protected file changes
- **Waivers:** Use `.verify/request_waiver.sh` if legitimate gate failures occur
- **Phase 1 priority:** Must complete before new projects have correct baselines
