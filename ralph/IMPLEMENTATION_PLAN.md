# Implementation Plan - Brain Repository Maintenance

## Overview

**Status:** Phase 1-2 remaining  
**Branch:** `brain-work`  
**Last Updated:** 2026-01-19

---

## 🔄 Phase 1: Minor Issues (17 items)

Source: `CODERABBIT_REVIEW_ANALYSIS_v2.md`

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1.1 | `current_ralph_tasks.sh:149-157` | `update_spinner()` called but no spinner rendered | Add spinner or remove |
| 1.2 | `templates/ralph/current_ralph_tasks.sh:149-157` | Same spinner issue | Sync |
| 1.3 | `thunk_ralph_tasks.sh:83` | Debug `echo "Header line: $header_line"` | Remove |
| 1.4 | `templates/ralph/thunk_ralph_tasks.sh:83` | Same debug echo | Remove |
| 1.5 | `render_ac_status.sh:121-124` | Unused `summary_line` variable | Remove |
| 1.6 | `templates/ralph/render_ac_status.sh:121-124` | Same | Sync |
| 1.7 | `pr-batch.sh:53-57` | `SCRIPT_NAME` only used in error path | Consider removing |
| 1.8 | `templates/ralph/pr-batch.sh:53-57` | Same | Sync |
| 1.9 | `verifier.sh:103-108` | Missing `.verify` dir causes partial output | Add early check |
| 1.10 | `templates/ralph/verifier.sh:103-108` | Same | Sync |
| 1.11 | `loop.sh:689-697` | `check_rovo_session()` delays startup | Move earlier or async |
| 1.12 | `templates/ralph/loop.sh:689-697` | Same | Sync |
| 1.13 | `AC.rules:52-54` | Stale "NOT FIXED" comment | Update comment |
| 1.14 | `templates/ralph/AC.rules:52-54` | Same | Sync |

---

## 🔄 Phase 2: Nitpicks (16 items)

### Refactoring

| # | File | Issue | Fix |
|---|------|-------|-----|
| 2.1 | `loop.sh:644-675` | Duplicated terminal detection | Extract helper |
| 2.2 | `current_ralph_tasks.sh` | Pipe in while loop loses vars | Process substitution |
| 2.3 | `thunk_ralph_tasks.sh` | Same pipe issue | Process substitution |
| 2.4 | `new-project.sh:412-422` | sed breaks with `&` or `/` | Escape function |

### Dead Code

| # | File | Issue |
|---|------|-------|
| 2.5 | `templates/ralph/current_ralph_tasks.sh:25-35` | Unused `SHOW_HELP` |
| 2.6 | `templates/ralph/current_ralph_tasks.sh:354-369` | Unused `wrap_text` |
| 2.7 | `templates/ralph/current_ralph_tasks.sh:371-485` | `icon`, `full_desc` unused |
| 2.8 | `thunk_ralph_tasks.sh:106-112` | Unused `normalize_description` |
| 2.9 | `templates/ralph/thunk_ralph_tasks.sh:127-134` | Unused `in_era` |
| 2.10 | `templates/ralph/thunk_ralph_tasks.sh:146-162,239-255` | Unused vars |

### Format/Style

| # | File | Issue |
|---|------|-------|
| 2.11 | `templates/ralph/PROMPT.project.md:39-41` | MD050 strong-style |
| 2.12 | `HISTORY.md:86` | Spaces in inline code (MD038) |
| 2.13 | `NEURONS.md:204-206` | Windows backslashes |
| 2.14 | `skills/index.md:1-6` | Stale "Last updated" |
| 2.15 | `THUNK.md:99-100,182,186,190,194-195` | Duplicate THUNK numbers |

### Robustness

| # | File | Issue |
|---|------|-------|
| 2.16 | `templates/ralph/init_verifier_baselines.sh:43-50` | .gitignore update can miss entries |

---

## ⏭️ SKIPPED

| Item | Reason |
|------|--------|
| `old_sh/test-rovodev-integration.sh` | Archived code |
| `AC.rules:19-25`, `222-228` | Intentional design |
| `HISTORY.md` | Historical records |

---

## Notes

- Sync templates after each fix
- Run `./verifier.sh` after protected file changes
- Waivers require TOTP approval (see `skills/domains/code-hygiene.md`)
