# Implementation Plan - Brain Repository Maintenance

## Overview

**Status:** Phases 0-8 COMPLETE ✅ | Phase 9-10 IN PROGRESS  
**Branch:** `brain-work` (pushed to origin)  
**Last Updated:** 2026-01-19

---

## ✅ COMPLETED SUMMARY

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | TOTP Waiver Approval System | ✅ Deployed & tested |
| 1 | Critical Bug Fixes (render_ac_status.sh, loop.sh monitors) | ✅ |
| 2 | Dead Code Removal + SC2155 shellcheck fixes | ✅ |
| 3 | Terminology Consistency (kb→skills) | ✅ |
| 4 | Documentation Updates (model versions, --model auto, fence tags) | ✅ |
| 5 | Code Quality Refactoring (process substitution) | ✅ |
| 6 | Maintenance Tasks (GAP_BACKLOG, REFERENCE_SUMMARY, templates) | ✅ |
| 7 | Generator Enhancements (error handling, AGENTS.md docs) | ✅ |
| 8 | Archive Documentation & Housekeeping | ✅ |

**Prevention System (Phase 0) Details:**
- `approve_waiver_totp.py` - TOTP approval requiring real human OTP
- `launch_approve_waiver.sh` - Auto-launches interactive terminal
- `check_waiver.sh` - Gate integration for verifying waivers
- `request_waiver.sh` - Helper for creating waiver requests
- PROMPT.md updated with waiver protocol
- AC.rules has 5 waiver meta-gates (CountLimit, NoBlanketScope, ExpiryRequired, HashIntegrity, NoUnapprovedInUse)

---

## 🔄 REMAINING WORK

### Phase 9: CodeRabbit v2 - Minor Issues (17 items)

Source: `CODERABBIT_REVIEW_ANALYSIS_v2.md` sections M-19 through M-32

| # | File | Issue | Fix |
|---|------|-------|-----|
| M-19 | `current_ralph_tasks.sh:149-157` | `update_spinner()` called but no spinner rendered | Add actual spinner rendering or remove function |
| M-20 | `templates/ralph/current_ralph_tasks.sh:149-157` | Same spinner issue in template | Sync with main file |
| M-21 | `thunk_ralph_tasks.sh:83` | Debug `echo "Header line: $header_line"` left in | Remove debug statement |
| M-22 | `templates/ralph/thunk_ralph_tasks.sh:83` | Same debug echo in template | Remove |
| M-23 | `render_ac_status.sh:121-124` | Unused `summary_line` variable | Remove or use |
| M-24 | `templates/ralph/render_ac_status.sh:121-124` | Same in template | Sync |
| M-25 | `pr-batch.sh:53-57` | `SCRIPT_NAME` only used in error path | Consider removing |
| M-26 | `templates/ralph/pr-batch.sh:53-57` | Same in template | Sync |
| M-27 | `verifier.sh:103-108` | Missing `.verify` dir could cause partial output | Add early check and clear error |
| M-28 | `templates/ralph/verifier.sh:103-108` | Same in template | Sync |
| M-29 | `loop.sh:689-697` | `check_rovo_session()` runs after startup - delays user | Move earlier or make async |
| M-30 | `templates/ralph/loop.sh:689-697` | Same in template | Sync |
| M-31 | `AC.rules:52-54` | Stale comment "NOT FIXED" but Bug C checks passing | Update comment to reflect current state |
| M-32 | `templates/ralph/AC.rules:52-54` | Same stale comment | Sync |

---

### Phase 10: CodeRabbit v2 - Nitpicks (23 items)

#### Refactoring - Medium Value (6 items)

| # | File | Issue | Fix |
|---|------|-------|-----|
| N-1 | `loop.sh:644-675` | Duplicated terminal detection logic | Extract `launch_in_terminal()` helper |
| N-2 | `current_ralph_tasks.sh` | Pipe in while loop loses variables | Use process substitution `< <(...)` |
| N-3 | `thunk_ralph_tasks.sh` | Same pipe issue | Use process substitution |
| N-4 | `templates/ralph/loop.sh:644-675` | Same duplication in template | Sync |
| N-5 | `new-project.sh:412-422` | sed replacement breaks with `&` or `/` | Use `escape_sed_replacement` |
| N-6 | `templates/ralph/loop.sh:299-309` | sed for modelId fragile | Low priority |

#### Dead Code / Unused Variables (8 items)

| # | File | Issue | Fix |
|---|------|-------|-----|
| N-7 | `templates/ralph/current_ralph_tasks.sh:25-35` | Unused `SHOW_HELP` flag | Remove |
| N-8 | `templates/ralph/current_ralph_tasks.sh:354-369` | `wrap_text` unused + subshell bug | Remove |
| N-9 | `templates/ralph/current_ralph_tasks.sh:371-485` | `icon`, `full_desc` parsed unused | Use `_` placeholders |
| N-10 | `current_ralph_tasks.sh:354-369` | Same `wrap_text` issue | Remove |
| N-11 | `thunk_ralph_tasks.sh:106-112` | Unused `normalize_description` | Remove or add TODO |
| N-12 | `templates/ralph/thunk_ralph_tasks.sh:127-134` | Unused `in_era` variable | Remove |
| N-13 | `templates/ralph/thunk_ralph_tasks.sh:146-162,239-255` | `orig_num`, `priority`, `completed` unused | Use `_` |
| N-14 | `templates/ralph/thunk_ralph_tasks.sh:167,260,311` | SC2155 in template | Split declaration |

#### Format/Style Issues (7 items)

| # | File | Issue | Fix |
|---|------|-------|-----|
| N-15 | `.verify/verifier.sha256:1` | Format inconsistency - missing filename | Standardize |
| N-16 | `templates/ralph/PROMPT.project.md:39-41` | MD050 strong-style | Change `**text**` to `__text__` |
| N-17 | `HISTORY.md:86` | Spaces inside inline code (MD038) | Remove spaces |
| N-18 | `templates/ralph/PROMPT.md:50-53` | Missing fence language | Add `markdown` tag |
| N-19 | `NEURONS.md:204-206` | Windows backslashes | Change to forward slashes |
| N-20 | `skills/index.md:1-6` | "Last updated" goes stale | Remove or auto-generate |
| N-21 | `THUNK.md:99-100,182,186,190,194-195` | Duplicate THUNK numbers | Add suffix (84a, 84b) |

#### Robustness/Edge Cases (2 items)

| # | File | Issue | Fix |
|---|------|-------|-----|
| N-22 | `templates/ralph/init_verifier_baselines.sh:43-50` | .gitignore update can miss entries | Check independently |
| N-23 | `templates/ralph/init_verifier_baselines.sh:22-24` | Hash format inconsistency | Normalize to `cut -d' ' -f1` |

---

## ⏭️ SKIPPED (Not Fixing)

| Item | File | Reason |
|------|------|--------|
| S-1 to S-4 | `old_sh/test-rovodev-integration.sh` | Archived deprecated code |
| S-5, S-6 | `AC.rules:19-25` | Intentional pattern testing |
| S-7 | `AC.rules:222-228` | Intentional defense-in-depth |
| S-8 | `HISTORY.md` | Don't change historical records |

---

## 📊 PROGRESS TRACKING

**CodeRabbit v2 Summary:**
- Total items: 69 (6 outside-diff + 32 minor + 31 nitpick)
- ✅ Done: 28
- ⏭️ Skipped: 8
- ⏳ Remaining: 33 (17 minor + 16 nitpick + robustness)

**Verifier Status:** 21 PASS, 0 FAIL, 6 WARN

---

## Notes

- Keep changes minimal and focused
- Sync templates with main files after each fix
- Run `./verifier.sh` after protected file changes
- Prevention system requires TOTP approval for waivers
