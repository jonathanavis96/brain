# Implementation Plan - Brain Repository Maintenance

## Overview

**Status:** Repository in maintenance mode. Monitor bug fixes completed. CodeRabbit PR #4 review fixes in progress.

**Recent achievements (2026-01-18 to 2026-01-19):**
- ✅ Monitor bug fixes (Bugs A, B, C) fully resolved and verified
- ✅ Verifier gate system implemented (21 PASS, 0 FAIL)
- ✅ KB→Skills migration completed
- ✅ Templates synced with live versions
- ✅ 256+ commits in January 2026
- ✅ Phase 1 complete: All critical bug fixes (tasks 1.1-1.3)
- ✅ Phase 2.1 started: Dead code removal (task 2.1.1 complete)

**Current focus:** Systematic resolution of 26 CodeRabbit review findings from PR #4
**Ready to push:** 7 commits accumulated from BUILD iterations

**Reference:** `CODERABBIT_REVIEW_ANALYSIS.md` for detailed analysis and rationale

---

## HIGH PRIORITY

### Phase 1: Critical Bug Fixes (CodeRabbit PR #4)

These are functional bugs that could cause incorrect behavior or data loss.

- [x] **1.1** Fix WARN count regex in render_ac_status.sh line 31
  - **Issue:** Pattern `^[0-9]+` anchored to line start, but "WARN: 6" has text before number
  - **Fix:** Change to unanchored `[0-9]+`
  - **File:** `render_ac_status.sh`

- [x] **1.2** Add end marker guard in render_ac_status.sh before awk (line 105-110)
  - **Issue:** Missing `<!-- AC_STATUS_END -->` would cause awk to truncate entire file
  - **Fix:** Add guard check and early return before awk invocation
  - **File:** `render_ac_status.sh`

- [x] **1.3** Fix subshell variable assignment in loop.sh launch_monitors() (lines 639-655)
  - **Issue:** Assignments like `( cmd && var=true )` run in subshell, parent variables unchanged
  - **Symptom:** False fallback messages shown even when monitors launch successfully
  - **Fix:** Replace subshells with direct if statements
  - **File:** `loop.sh`

---

### Phase 2: Code Quality - Dead Code & Shellcheck

These improve maintainability and eliminate shellcheck warnings.

#### 2.1 Dead Code Removal

- [x] **2.1.1** Remove unused `in_era` variable from thunk_ralph_tasks.sh (line 126)
  - **Context:** Variable set but never read
  - **File:** `thunk_ralph_tasks.sh`

- [ ] **2.1.2** Remove unused `ready_signal` variable from loop.sh (lines 582-588)
  - **Context:** Variable assigned but never used (legacy code)
  - **Files:** `loop.sh`, `templates/ralph/loop.sh`

#### 2.2 Shellcheck SC2155 Fixes (Masked Return Values)

Pattern: `local var=$(cmd)` masks command exit status. Fix: Split declaration and assignment.

- [ ] **2.2.1** Fix SC2155 in thunk_ralph_tasks.sh line 167
  - **Current:** `local short_title=$(generate_title "$description")`
  - **Fix:** Split to: `local short_title; short_title=$(generate_title "$description")`
  - **File:** `thunk_ralph_tasks.sh`

- [ ] **2.2.2** Fix SC2155 in current_ralph_tasks.sh line 159, 172, 191
  - **Pattern:** Same as 2.2.1 (multiple instances with cache_key and short_title)
  - **File:** `current_ralph_tasks.sh`

- [ ] **2.2.3** Fix SC2155 in loop.sh line 480
  - **Current:** `export RUN_ID="$(date +%s)-$$"`
  - **Note:** This is an export, not local, but still masks exit status
  - **Fix:** Split declaration: `RUN_ID=$(date +%s)-$$; export RUN_ID`
  - **File:** `loop.sh`

- [ ] **2.2.4** Fix SC2155 in templates/ralph/loop.sh (same as 2.2.3)
  - **File:** `templates/ralph/loop.sh`

---

### Phase 3: Terminology Consistency (kb→skills Migration)

Complete the kb→skills terminology migration across all files.

- [ ] **3.1** Update pr-batch.sh line 116 header text
  - **Current:** "Knowledge Base (kb/)"
  - **Fix:** "Skills (skills/)"
  - **File:** `pr-batch.sh`

- [ ] **3.2** Update templates/ralph/pr-batch.sh (same fix as 3.1)
  - **File:** `templates/ralph/pr-batch.sh`

- [ ] **3.3** Update generators/generate-neurons.sh line 433 label
  - **Current:** "Brain KB patterns"
  - **Fix:** "Brain Skills patterns"
  - **File:** `generators/generate-neurons.sh`

- [ ] **3.4** Update templates/python/AGENTS.project.md lines 26-31
  - **Current:** References to "KB file"
  - **Fix:** Change to "skill file"
  - **File:** `templates/python/AGENTS.project.md`

---

## MEDIUM PRIORITY

### Phase 4: Documentation & Help Text Updates

- [ ] **4.1** Update model version in loop.sh line 162
  - **Current:** `20250620`
  - **Fix:** `20250929` (or use generic version-agnostic text)
  - **File:** `loop.sh`

- [ ] **4.2** Update model version in templates/ralph/loop.sh (same as 4.1)
  - **File:** `templates/ralph/loop.sh`

- [ ] **4.3** Document `--model auto` option in loop.sh usage text
  - **Context:** Option exists but not shown in help
  - **File:** `loop.sh`

- [ ] **4.4** Add markdown fence language tag to PROMPT.md line 61
  - **Context:** Code block missing language identifier
  - **File:** `PROMPT.md`

- [ ] **4.5** Regenerate AC status section in IMPLEMENTATION_PLAN.md
  - **Command:** `./render_ac_status.sh --inline`
  - **Context:** Current status may be stale after recent changes

---

### Phase 5: Refactoring for Maintainability (Optional)

These improve code structure but are not critical.

- [ ] **5.1** Extract `launch_in_terminal()` helper function in loop.sh
  - **Issue:** Duplicated terminal detection logic for both monitors (lines 639-680)
  - **Benefit:** DRY principle, easier to maintain terminal emulator support
  - **File:** `loop.sh`
  - **Note:** See CODERABBIT_REVIEW_ANALYSIS.md for suggested implementation

- [ ] **5.2** Use process substitution in current_ralph_tasks.sh line 305
  - **Issue:** Pipe into while loop creates subshell, loses variable changes
  - **Fix:** Replace `| while` with `while ... < <(...)` pattern
  - **File:** `current_ralph_tasks.sh`

- [ ] **5.3** Use process substitution in thunk_ralph_tasks.sh line 191
  - **Issue:** Same as 5.2
  - **File:** `thunk_ralph_tasks.sh`

---

### Phase 6: Template Validation & Documentation

- [ ] **6.1** Verify template completeness
  - Audit templates/ralph/ (expect 16 files)
  - Audit templates/backend/ (expect 4 files)
  - Audit templates/python/ (expect 4 files)
  - Cross-check with new-project.sh expectations

- [ ] **6.2** Review GAP_BACKLOG.md for skill promotion
  - Check if P1/P0 gaps meet promotion criteria
  - Update gap statuses if needed

- [ ] **6.3** Evaluate docs/REFERENCE_SUMMARY.md legacy status
  - Marked "legacy" in NEURONS.md
  - Decide: migrate to skills/ or deprecate
  - Update NEURONS.md if structure changes

---

## LOW PRIORITY

### Phase 7: Generator Script Enhancements

- [ ] **7.1** Add error handling to generator scripts
  - Review generators/generate-neurons.sh
  - Review generators/generate-thoughts.sh
  - Review generators/generate-implementation-plan.sh
  - Add validation for missing required fields

- [ ] **7.2** Document generator usage in AGENTS.md
  - Add "Bootstrapping New Projects" section
  - Document when to use each generator
  - Provide workflow examples

---

### Phase 8: Archive & Reference Material

- [ ] **8.1** Review old_sh/ archive directory
  - Verify scripts are truly obsolete
  - Document purpose in old_sh/README.md
  - Consider removal if no historical value

- [ ] **8.2** Validate React best practices references
  - Verify all 45 rule files present
  - Check INDEX.md and HOTLIST.md are current
  - Ensure no broken cross-references

- [ ] **8.3** Update CHANGES.md
  - Document changes since 2026-01-18
  - Update migration guides
  - Add entries for new features

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
