# Implementation Plan - Brain Repository Maintenance

## Overview

**Status:** Repository in maintenance mode. Monitor bug fixes completed. CodeRabbit review fixes pending.

**Recent achievements (2026-01-18 to 2026-01-19):**
- Monitor bug fixes (Bugs A, B, C) fully resolved and verified
- Verifier gate system implemented (21 PASS, 0 FAIL)
- KB→Skills migration completed
- Templates synced with live versions
- 256+ commits in January 2026

**Current focus:** CodeRabbit PR #4 review fixes (26 actionable items)

---

## HIGH PRIORITY

### Phase 8: CodeRabbit Review Fixes (PR #4)

> **Reference:** `CODERABBIT_REVIEW_ANALYSIS.md` for full details

#### 8.1 Bug Fixes (Critical)

- [ ] **8.1.1** Fix WARN regex in render_ac_status.sh (line 31)
  - Change `grep -oE '^[0-9]+'` to `grep -oE '[0-9]+'`
  
- [ ] **8.1.2** Add end marker guard in render_ac_status.sh (line 113)
  - Check `<!-- AC_STATUS_END -->` exists before awk

- [ ] **8.1.3** Fix subshell variable bug in loop.sh (lines 639-655)
  - Remove subshells, use direct if statements for terminal launch

#### 8.2 Dead Code Removal

- [ ] **8.2.1** Remove unused `ready_signal` from loop.sh (lines 583-589)
- [ ] **8.2.2** Remove unused `ready_signal` from templates/ralph/loop.sh

#### 8.3 Shellcheck SC2155 Fixes

- [ ] **8.3.1** Split `local var=$(cmd)` in thunk_ralph_tasks.sh (line 165)
- [ ] **8.3.2** Split `local var=$(cmd)` in current_ralph_tasks.sh (line 144)
- [ ] **8.3.3** Split `local var=$(cmd)` in loop.sh (line 481)
- [ ] **8.3.4** Split `local var=$(cmd)` in templates/ralph/loop.sh (line 481)

#### 8.4 Terminology Fixes (kb→skills)

- [ ] **8.4.1** Update pr-batch.sh header "Knowledge Base (kb/)" → "Skills (skills/)"
- [ ] **8.4.2** Update templates/ralph/pr-batch.sh same fix
- [ ] **8.4.3** Update generators/generate-neurons.sh "Brain KB patterns" label
- [ ] **8.4.4** Update templates/python/AGENTS.project.md "KB file" → "skill file"

#### 8.5 Documentation/Help Text

- [ ] **8.5.1** Update loop.sh model version 20250620 → 20250929
- [ ] **8.5.2** Update templates/ralph/loop.sh model version
- [ ] **8.5.3** Document `--model auto` option in loop.sh usage
- [ ] **8.5.4** Add markdown fence language to PROMPT.md (line 61)

#### 8.6 Refactoring (Optional)

- [ ] **8.6.1** Extract `launch_in_terminal()` helper in loop.sh
- [ ] **8.6.2** Use process substitution in current_ralph_tasks.sh (line 305)
- [ ] **8.6.3** Use process substitution in thunk_ralph_tasks.sh (line 191)

#### 8.7 Wording/Style

- [ ] **8.7.1** Apply wording tweaks to PROMPT.md
- [ ] **8.7.2** Add standalone-mode note to templates/AGENTS.project.md
- [ ] **8.7.3** Regenerate AC status section

---

### Phase 9: Template & Documentation Validation

- [ ] **9.1** Verify template completeness
  - Check templates/ralph/ has all required files (16 files expected)
  - Verify templates/backend/ completeness (4 files expected)
  - Verify templates/python/ completeness (4 files expected)
  - Cross-check with new-project.sh expectations

- [ ] **9.2** Review and consolidate documentation locations
  - Evaluate docs/REFERENCE_SUMMARY.md (marked as "legacy" in NEURONS.md)
  - Determine if content should be migrated to skills/ or deprecated
  - Update NEURONS.md if structure changes

- [ ] **9.3** Review GAP_BACKLOG.md for promotion candidates
  - Check if any P1 or P0 gaps should be promoted to SKILL_BACKLOG.md
  - Verify existing gap entries have proper status tracking

---

## MEDIUM PRIORITY

### Phase 10: Generator Script Enhancements

- [ ] **10.1** Add error handling to generator scripts
  - Review generators/generate-neurons.sh for edge cases
  - Review generators/generate-thoughts.sh for edge cases
  - Review generators/generate-implementation-plan.sh for edge cases
  - Add validation for missing required fields

- [ ] **10.2** Document generator usage in AGENTS.md
  - Add "Bootstrapping New Projects" section
  - Document when to use each generator
  - Provide examples of typical workflows

### Phase 11: Archive and Cleanup Tasks

- [ ] **11.1** Review old_sh/ archive directory
  - Verify archived scripts are truly obsolete
  - Document purpose of each archived script in old_sh/README.md
  - Consider removing if no historical value

---

## LOW PRIORITY

### Phase 12: Reference Material Updates

- [ ] **12.1** Validate React best practices references
  - Verify all 45 rule files are present in references/react-best-practices/rules/
  - Check INDEX.md and HOTLIST.md are up to date
  - Ensure no broken cross-references

- [ ] **12.2** Review CHANGES.md for completeness
  - Document any undocumented changes since 2026-01-18
  - Ensure migration guides are current
  - Add entry for any new features or breaking changes

---

## Acceptance Criteria

> **Source of truth:** `AC.rules` — verified by `./verifier.sh`
> 
> Do NOT use checkboxes here. AC IDs below link to executable checks.
> Run `./render_ac_status.sh` for current status.

### Bug A: Task Extraction
- **AC:** `BugA.1` (auto, gate=block) — Parser uses in_task_section state tracking
- **AC:** `BugA.2` (auto, gate=block) — Parser checks for ## (major section) not ### subsections

### Bug B: Display Rendering  
- **AC:** `BugB.1` (auto, gate=block) — Display function uses clear for full redraw
- **AC:** `BugB.2` (auto, gate=block) — No differential update logic (LAST_RENDERED)
- **AC:** `BugB.UI.1` (manual, gate=warn) — No visual corruption after terminal resize
- **AC:** `BugB.Auto.1` (auto, gate=warn) — Display uses terminal-safe cursor positioning
- **AC:** `BugB.Auto.2` (auto, gate=warn) — Display has stty handling for terminal state

### Bug C: THUNK Monitor
- **AC:** `BugC.1` (auto, gate=block) — No scan_for_new_completions function
- **AC:** `BugC.2` (auto, gate=block) — No PLAN_FILE variable
- **AC:** `BugC.3` (auto, gate=block) — No "Scanning IMPLEMENTATION_PLAN" message
- **AC:** `BugC.4` (auto, gate=block) — Monitor references THUNK.md
- **AC:** `BugC.5` (auto, gate=block) — Monitor does not append/redirect into THUNK.md
- **AC:** `BugC.6` (auto, gate=block) — No task_exists_in_thunk function
- **AC:** `BugC.7` (auto, gate=block) — No extract_task_id function
- **AC:** `BugC.UI.1` (manual, gate=warn) — THUNK monitor only displays, never modifies files
- **AC:** `BugC.Auto.1` (auto, gate=block) — THUNK monitor has no auto-sync from IMPLEMENTATION_PLAN

### Anti-Cheat & Integrity
- **AC:** `AntiCheat.1-5` (auto, gate=block) — No fake verification markers or dismissal phrases
- **AC:** `Protected.1-3` (auto, gate=block) — Protected files (loop.sh, verifier.sh, PROMPT.md) unchanged

<!-- AC_STATUS_START -->
## Acceptance Criteria Status

> **Auto-generated from verifier** — Last run: 2026-01-19 01:53:49 ( a57cd46)

| Metric | Value |
|--------|-------|
| ✅ PASS | 21 |
| ❌ FAIL | 0 |
| ⚠️ WARN | 0 |
| 🔒 Hash Guard | Hash |

### Check Details

| ID | Status | Description |
|----|--------|-------------|
| `BugA.1` | ✅ | Parser uses in_task_section state tracking |
| `BugA.2` | ✅ | Parser checks for ## (major section) not ### subsections |
| `BugB.1` | ✅ | Display function uses clear for full redraw |
| `BugB.2` | ✅ | No differential update logic (LAST_RENDERED) |
| `BugB.UI.1` | ⚠️ | No visual corruption after terminal resize |
| `BugC.1` | ✅ | No scan_for_new_completions function |
| `BugC.2` | ✅ | No PLAN_FILE variable |
| `BugC.3` | ✅ | No "Scanning IMPLEMENTATION_PLAN" message |
| `BugC.4` | ✅ | Monitor references THUNK.md |
| `BugC.5` | ✅ | Monitor does not append/redirect into THUNK.md |
| `BugC.6` | ✅ | No task_exists_in_thunk function |
| `BugC.7` | ✅ | No extract_task_id function |
| `BugC.UI.1` | ⚠️ | THUNK monitor only displays, never modifies files |
| `Template.1` | ⚠️ | thunk_ralph_tasks.sh matches template |
| `AntiCheat.1` | ✅ | No fake verification markers in source files |
| `AntiCheat.2` | ✅ | No dismissal phrases in active source files |
| `AntiCheat.3` | ✅ | No bug reframing in source files |
| `AntiCheat.4` | ✅ | No intended behavior dismissals in source files |
| `AntiCheat.5` | ✅ | No self-certification in source files |
| `Protected.1` | ✅ | loop.sh unchanged from baseline |
| `Protected.2` | ✅ | verifier.sh unchanged from baseline |
| `Protected.3` | ✅ | PROMPT.md unchanged from baseline |
| `VerifyMeta.1` | ✅ | Verifier run_id.txt exists and is non-empty |
| `BugB.Auto.1` | ⚠️ | Display uses terminal-safe cursor positioning (tput) |
| `BugB.Auto.2` | ⚠️ | Display has stty handling for terminal state |
| `BugC.Auto.1` | ✅ | THUNK monitor has no auto-sync from IMPLEMENTATION_PLAN |
| `BugC.Auto.2` | ⚠️ | THUNK writes limited to era creation only |

_Run `./verifier.sh` to refresh. Do not edit this section manually._
<!-- AC_STATUS_END -->

---

## Notes

- Keep changes minimal and focused - fix bugs, don't refactor unnecessarily
- Maintain backwards compatibility with existing IMPLEMENTATION_PLAN.md formats
- All fixes tested individually before integration testing
- Repository is in maintenance mode - prioritize quality over velocity
