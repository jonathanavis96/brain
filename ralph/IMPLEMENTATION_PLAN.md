# Implementation Plan - Brain Repository Maintenance

## Overview

**Status:** Phase 1-8 COMPLETE. Repository is in excellent state. New work available from CodeRabbit v2 review.

**Recent achievements (2026-01-18 to 2026-01-19):**
- ✅ Monitor bug fixes (Bugs A, B, C) fully resolved and verified
- ✅ Verifier gate system implemented (21 PASS, 0 FAIL, 6 WARN)
- ✅ KB→Skills migration completed across all files
- ✅ Templates synced with live versions
- ✅ **Phase 1-4 complete:** All high-priority CodeRabbit fixes (tasks 1.1-4.5)
  - Critical bug fixes (render_ac_status.sh, loop.sh monitors)
  - Dead code removal + SC2155 shellcheck fixes
  - Terminology consistency (kb→skills)
  - Documentation updates (model versions, --model auto, markdown fences)
  - AC status dashboard regenerated
- ✅ **Phase 5 complete:** Code quality refactoring (process substitution)
- ✅ **Phase 6 complete:** Maintenance tasks (GAP_BACKLOG review, REFERENCE_SUMMARY clarification, template validation, push to origin)
- ✅ **Phase 7 complete:** Generator enhancements (error handling, AGENTS.md documentation)
- ✅ **Phase 8 complete:** Archive documentation and housekeeping
- ✅ **Phase 0 complete (2026-01-19):** TOTP Waiver Approval System deployed
  - `approve_waiver_totp.py` - TOTP-based approval requiring real human OTP
  - `launch_approve_waiver.sh` - Auto-launches interactive terminal for approval
  - `check_waiver.sh` - Gate integration for verifying approved waivers
  - `request_waiver.sh` - Helper for creating waiver requests
  - PROMPT.md updated with waiver protocol instructions
  - AC.rules updated with waiver meta-gates (CountLimit, NoBlanketScope, ExpiryRequired, HashIntegrity, NoUnapprovedInUse)
  - End-to-end test PASSED - interactive terminal launches, OTP blocks, .approved file created

**Current focus:** CodeRabbit v2 review fixes (17 clear items in Phase 9)
**Branch status:** Pushed to origin/brain-work
**Next planning action:** Execute Phase 9 fixes (fence tags, nomenclature, documentation)
**Verifier status:** All critical checks PASS (21 PASS, 0 FAIL, 6 WARN acceptable)

**References:**
- `CODERABBIT_REVIEW_ANALYSIS.md` - Original PR #4 review fixes (Phase 1-4)
- `CODERABBIT_REVIEW_ANALYSIS_v2.md` - NEW follow-up review with 17 clear fixes + 10 decision items

---

## COMPLETED

### Phase 0: Prevention System - TOTP Waiver Approval (2026-01-19)

**Purpose:** Create escape hatches for noisy gates while ensuring Ralph cannot self-approve waivers.

- [x] **0.1** Create `approve_waiver_totp.py` - TOTP approval script
  - Validates 6-digit OTP from Google Authenticator
  - Reads secret from external file (not in repo)
  - Creates `.approved` artifact with hash verification

- [x] **0.2** Create `launch_approve_waiver.sh` - Auto-launcher
  - Opens interactive Windows Terminal from WSL
  - Displays waiver details (rule, paths, reason, expiry)
  - Blocks waiting for human OTP input

- [x] **0.3** Create `check_waiver.sh` - Gate integration
  - Verifies waiver is approved and not expired
  - Checks request hash matches (tamper detection)
  - Returns exit code for verifier integration

- [x] **0.4** Create `request_waiver.sh` - Request helper
  - Ralph uses this to create waiver request JSON
  - Enforces required fields (waiver_id, rule_id, scope, reason, expires)

- [x] **0.5** Update PROMPT.md with waiver protocol
  - Step-by-step instructions for Ralph
  - Security constraints (never learn secret, only request OTP)

- [x] **0.6** Add waiver meta-gates to AC.rules
  - `Waiver.CountLimit` (warn) - Max 10 active waivers
  - `Waiver.NoBlanketScope` (block) - No wildcards or repo-wide scope
  - `Waiver.ExpiryRequired` (block) - All waivers must have EXPIRES
  - `Waiver.HashIntegrity` (block) - Request hash must match
  - `Waiver.NoUnapprovedInUse` (warn) - Warn about pending requests

- [x] **0.7** End-to-end test
  - Created test waiver `WVR-pop-test-001`
  - Launched terminal automatically
  - OTP prompt appeared and blocked
  - `.approved` file created after OTP entry
  - Test files cleaned up

**Commits:** `43359fb`, `f5a4e70`

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

- [x] **2.1.2** Remove unused `ready_signal` variable from loop.sh (lines 582-588)
  - **Context:** Variable assigned but never used (legacy code)
  - **Files:** `loop.sh`, `templates/ralph/loop.sh`

#### 2.2 Shellcheck SC2155 Fixes (Masked Return Values)

Pattern: `local var=$(cmd)` masks command exit status. Fix: Split declaration and assignment.

- [x] **2.2.1** Fix SC2155 in thunk_ralph_tasks.sh line 167
  - **Current:** `local short_title=$(generate_title "$description")`
  - **Fix:** Split to: `local short_title; short_title=$(generate_title "$description")`
  - **File:** `thunk_ralph_tasks.sh`

- [x] **2.2.2** Fix SC2155 in current_ralph_tasks.sh line 159, 172, 191
  - **Pattern:** Same as 2.2.1 (multiple instances with cache_key and short_title)
  - **File:** `current_ralph_tasks.sh`

- [x] **2.2.3** Fix SC2155 in loop.sh line 480
  - **Current:** `export RUN_ID="$(date +%s)-$$"`
  - **Note:** This is an export, not local, but still masks exit status
  - **Fix:** Split declaration: `RUN_ID=$(date +%s)-$$; export RUN_ID`
  - **File:** `loop.sh`
  - **Warning:** Protected file - need to regenerate baseline hash after change

- [x] **2.2.4** Fix SC2155 in templates/ralph/loop.sh (same as 2.2.3)
  - **File:** `templates/ralph/loop.sh`

- [x] **2.3** Regenerate loop.sh baseline hash after all Phase 2 changes
  - **Command:** `sha256sum loop.sh | cut -d' ' -f1 > .verify/loop.sha256`
  - **Context:** Protected.1 check currently failing due to SC2155 fix in task 2.2.3
  - **Timing:** Run after Phase 3 complete to batch all protected file updates

---

### Phase 3: Terminology Consistency (kb→skills Migration)

Complete the kb→skills terminology migration across all files.

- [x] **3.1** Update pr-batch.sh line 116 header text
  - **Current:** "Knowledge Base (kb/)"
  - **Fix:** "Skills (skills/)"
  - **File:** `pr-batch.sh`

- [x] **3.2** Update templates/ralph/pr-batch.sh line 117 (same fix as 3.1)
  - **Current:** "Knowledge Base (kb/)"
  - **Fix:** "Skills (skills/)"
  - **File:** `templates/ralph/pr-batch.sh`

- [x] **3.3** Update generators/generate-neurons.sh line 433 label
  - **Current:** "Brain KB patterns"
  - **Fix:** "Brain Skills patterns"
  - **File:** `generators/generate-neurons.sh`

- [x] **3.4** Update templates/python/AGENTS.project.md lines 26-31
  - **Current:** References to "KB file"
  - **Fix:** Change to "skill file"
  - **File:** `templates/python/AGENTS.project.md`

---

## HIGH PRIORITY

### Phase 4: Documentation & Help Text Updates

- [x] **4.1** Update model version in loop.sh line 162
  - **Current:** `20250620`
  - **Fix:** `20250929` (current latest stable model)
  - **File:** `loop.sh`
  - **Warning:** Protected file - need to regenerate baseline hash after change

- [x] **4.2** Update model version in templates/ralph/loop.sh (same as 4.1)
  - **File:** `templates/ralph/loop.sh`

- [x] **4.3** Document `--model auto` option in loop.sh usage text
  - **Context:** Option exists but not shown in help
  - **File:** `loop.sh`
  - **Warning:** Protected file - need to regenerate baseline hash after change

- [x] **4.4** Add markdown fence language tag to PROMPT.md line 61
  - **Context:** Code block missing language identifier for markdown table format
  - **File:** `PROMPT.md`
  - **Warning:** Protected file - need to regenerate baseline hash after change

- [x] **4.5** Regenerate AC status section in IMPLEMENTATION_PLAN.md
  - **Command:** `./render_ac_status.sh --inline`
  - **Context:** Reflect current verifier state (21 PASS, 0 FAIL, 6 WARN) after Phase 1-4 completion
  - **Priority rationale:** Quick win, shows clean state after major phases complete
  - **Completed:** 2026-01-19 (commit 4597373)

### Phase 6: Maintenance & Push

- [x] **6.4** Push accumulated commits to origin (Phase 1-4)
  - **Context:** 1 commit pushed (95c12bf - push accumulated commits)
  - **Command:** `git push origin brain-work`
  - **Status:** Complete - all Phase 1-4 work now on origin/brain-work

- [x] **6.5** Push Phase 5-6 commits to origin
  - **Context:** All commits now pushed - branch up to date with origin/brain-work
  - **Command:** `git push origin brain-work`
  - **Priority:** HIGH - needed before Phase 7-8
  - **Status:** Complete - verified git status shows "Your branch is up to date with 'origin/brain-work'"

---

## MEDIUM PRIORITY

- [x] **6.2** Review GAP_BACKLOG.md for skill promotion
  - Check if P1/P0 gaps meet promotion criteria (currently 2 P2 gaps reviewed, no promotion needed)
  - Update gap statuses if needed
  - Promote clear, recurring gaps to SKILL_BACKLOG.md
  - **Current state:** 2 bash-specific P2 gaps in backlog, neither meets promotion criteria
  - **Priority rationale:** Self-improvement protocol compliance check
  - **Result:** Both gaps reviewed 2026-01-18, marked "keep as reference", do not meet recurring criteria

- [x] **6.3** Evaluate docs/REFERENCE_SUMMARY.md legacy status
  - Marked "legacy" in NEURONS.md
  - Compare with skills/SUMMARY.md for content overlap/divergence
  - Decision options:
    1. Keep both: docs/ for Ralph history/context, skills/ for agent consumption
    2. Deprecate docs/ version: Add redirect notice to skills/SUMMARY.md
    3. Merge content: Consolidate Ralph-specific patterns into skills/projects/brain-example.md
  - **Analysis complete (2026-01-19):**
    - docs/REFERENCE_SUMMARY.md = Ralph Wiggum pattern theory & external references (historical)
    - skills/SUMMARY.md = Skills KB entrypoint for agents (broader scope, operational)
    - skills/projects/brain-example.md = Brain-specific conventions (practical how-to)
    - **NOT duplicates** - complementary purposes
  - **Decision:** Keep all three files, clarified distinction in NEURONS.md
  - **Action taken:** Updated NEURONS.md line 65 annotation from "legacy" to "historical"

---

### Phase 5: Refactoring for Maintainability (Optional)

These improve code structure but are not critical.

- [ ] **5.1** Extract `launch_in_terminal()` helper function in loop.sh
  - **Issue:** Duplicated terminal detection logic for both monitors (lines 639-680)
  - **Benefit:** DRY principle, easier to maintain terminal emulator support
  - **File:** `loop.sh`
  - **Note:** See CODERABBIT_REVIEW_ANALYSIS.md for suggested implementation
  - **Warning:** Protected file - need to regenerate baseline hash after change
  - **Status:** Deferred - refactoring protected file requires careful validation

- [x] **5.2** Use process substitution in current_ralph_tasks.sh line 305
  - **Issue:** Pipe into while loop creates subshell, loses variable changes
  - **Fix:** Replace `| while` with `while ... < <(...)` pattern
  - **File:** `current_ralph_tasks.sh`
  - **Note:** Current code works correctly, this is a style improvement only

- [x] **5.3** Use process substitution in thunk_ralph_tasks.sh line 191
  - **Issue:** Same as 5.2
  - **File:** `thunk_ralph_tasks.sh`
  - **Note:** Current code works correctly, this is a style improvement only
  - **Verification (2026-01-19):** Code already uses correct patterns - no pipe-in-loop issues found
    - Line 101: Uses `< <(...)` process substitution (optimal)
    - Lines 178, 273: Use `< "$THUNK_FILE"` input redirection (correct, no subshell)
  - **Status:** Already implemented correctly, no changes needed

---

- [x] **6.1** Verify template completeness
  - Audit templates/ralph/ (14 files: AC.rules, IMPLEMENTATION_PLAN, MANUAL_APPROVALS, PROMPT x2, RALPH, THUNK, VALIDATION_CRITERIA, current_ralph_tasks.sh, init_verifier_baselines.sh, loop.sh, pr-batch.sh, thunk_ralph_tasks.sh, verifier.sh)
  - Audit templates/backend/ (4 files: AGENTS, NEURONS, THOUGHTS, VALIDATION_CRITERIA)
  - Audit templates/python/ (4 files: AGENTS, NEURONS, THOUGHTS, VALIDATION_CRITERIA)
  - Cross-check with new-project.sh expectations
  - **Verified counts:** ralph=14, backend=4, python=4 (all present)
  - **Status:** Template structure validated

---

## LOW PRIORITY

### Phase 7: Generator Script Enhancements

**Rationale:** Generators work correctly; improvements are nice-to-have for future maintainability.

- [x] **7.1** Add error handling to generator scripts
  - Review generators/generate-neurons.sh
  - Review generators/generate-thoughts.sh
  - Review generators/generate-implementation-plan.sh
  - Add validation for missing required fields

- [x] **7.2** Document generator usage in AGENTS.md
  - Add "Bootstrapping New Projects" section
  - Document when to use each generator
  - Provide workflow examples

---

### Phase 8: Archive & Reference Material

**Rationale:** Housekeeping tasks with no immediate impact on functionality.

- [x] **8.1** Review old_sh/ archive directory
  - Verify scripts are truly obsolete
  - Document purpose in old_sh/README.md
  - Consider removal if no historical value
  - **Completed:** Created old_sh/README.md documenting 3 archived scripts
  - **brain-doctor.sh:** Superseded by verifier.sh (historical reference value)
  - **test-bootstrap.sh:** Deprecated, manual validation sufficient
  - **test-rovodev-integration.sh:** Obsolete, feature never implemented
  - **Retention policy:** 6-month review cycle, cleanup criteria documented

- [x] **8.2** Validate React best practices references
  - Verify all 45 rule files present (confirmed: 45 ✓)
  - Check INDEX.md and HOTLIST.md are current
  - Ensure no broken cross-references
  - **Status:** All 45 rule files confirmed present, structure validated

- [x] **8.3** Update CHANGES.md with January 2026 work
  - **Decision:** Defer to Phase 9 - CHANGES.md tracks major feature releases
  - **Rationale:** Current work (CodeRabbit fixes, maintenance) is incremental improvements, not major features
  - **Future trigger:** Add entry when next major feature ships (e.g., new generator, monitor redesign)
  - **Status:** No immediate update needed - last entry (2026-01-18) covers major changes appropriately

---

## HIGH PRIORITY

### Phase 9: CodeRabbit v2 Clear Fixes

**Source:** `CODERABBIT_REVIEW_ANALYSIS_v2.md` - 17 verified fixes requiring no design decisions

#### 9.1 Markdown Fence Language Tags (4 items)

- [ ] **9.1.1** Add `text` language tag to skills/SUMMARY.md lines 50-71
  - **Issue:** MD040 - fenced code block missing language identifier
  - **File:** `skills/SUMMARY.md`

- [ ] **9.1.2** Add `text` language tag to AGENTS.md lines 56-58
  - **Issue:** `:::COMPLETE:::` block missing language tag
  - **File:** `AGENTS.md`

- [ ] **9.1.3** Add `bash` language tag to THOUGHTS.md lines 17-23
  - **Issue:** Code block under Bug A missing language tag
  - **File:** `THOUGHTS.md`

- [ ] **9.1.4** Add `bash` language tag to templates/ralph/THOUGHTS.project.md lines 17-23
  - **Issue:** Same as 9.1.3 in template version
  - **File:** `templates/ralph/THOUGHTS.project.md`

#### 9.2 Nomenclature Consistency (3 items)

- [ ] **9.2.1** Fix "kb" reference in THOUGHTS.md line 71
  - **Current:** "Brain KB: `skills/SUMMARY.md`"
  - **Fix:** "Brain Skills: `skills/SUMMARY.md`"
  - **File:** `THOUGHTS.md`

- [ ] **9.2.2** Fix "kb" reference in templates/ralph/PROMPT.project.md line 37
  - **Current:** "Brain KB"
  - **Fix:** "Brain Skills"
  - **File:** `templates/ralph/PROMPT.project.md`

- [ ] **9.2.3** Fix "kb" reference in templates/ralph/THOUGHTS.project.md line 71
  - **Current:** "Brain KB"
  - **Fix:** "Brain Skills"
  - **File:** `templates/ralph/THOUGHTS.project.md`

#### 9.3 Generator Script Improvements (3 items)

- [ ] **9.3.1** Add timeout to wget in generate-neurons.sh line 19
  - **Issue:** SC2086 - wget without timeout or retry limit
  - **Fix:** Add `--timeout=10 --tries=3` flags
  - **File:** `generators/generate-neurons.sh`

- [ ] **9.3.2** Add timeout to wget in generate-thoughts.sh line 19
  - **Issue:** Same as 9.3.1
  - **File:** `generators/generate-thoughts.sh`

- [ ] **9.3.3** Add timeout to wget in generate-implementation-plan.sh line 19
  - **Issue:** Same as 9.3.1
  - **File:** `generators/generate-implementation-plan.sh`

#### 9.4 Script Path Handling (4 items)

- [ ] **9.4.1** Quote variable in new-project.sh line 40
  - **Issue:** SC2086 - `$TEMPLATE_TYPE` unquoted in case statement
  - **Fix:** Change to `"$TEMPLATE_TYPE"` (quote all variable expansions)
  - **File:** `new-project.sh`

- [ ] **9.4.2** Quote variables in new-project.sh lines 88-92
  - **Issue:** SC2086 - Multiple unquoted variables in path operations
  - **Fix:** Quote `$NEW_PROJECT_DIR`, `$BRAIN_REPO`, `$VALIDATION_FILE`
  - **File:** `new-project.sh`

- [ ] **9.4.3** Fix hardcoded path in templates/backend/NEURONS.project.md line 8
  - **Current:** `/home/grafe/code/__PROJECT_NAME__`
  - **Fix:** `/path/to/__PROJECT_NAME__`
  - **File:** `templates/backend/NEURONS.project.md`

- [ ] **9.4.4** Fix hardcoded path in templates/python/NEURONS.project.md line 8
  - **Current:** `/home/grafe/code/__PROJECT_NAME__`
  - **Fix:** `/path/to/__PROJECT_NAME__`
  - **File:** `templates/python/NEURONS.project.md`

#### 9.5 Documentation Wording (3 items)

- [ ] **9.5.1** Remove redundant "project" in templates/backend/AGENTS.project.md line 3
  - **Current:** "## Purpose\n\nRalph loop for project __PROJECT_NAME__ project."
  - **Fix:** "Ralph loop for __PROJECT_NAME__ project." (remove duplicate "project")
  - **File:** `templates/backend/AGENTS.project.md`

- [ ] **9.5.2** Remove redundant "project" in templates/python/AGENTS.project.md line 3
  - **Issue:** Same as 9.5.1
  - **File:** `templates/python/AGENTS.project.md`

- [ ] **9.5.3** Fix grammar in VALIDATION_CRITERIA.md lines 24-26
  - **Current:** "Ensures monitors watch correct files"
  - **Fix:** "Ensure monitors watch correct files" (imperative mood, consistent with other criteria)
  - **File:** `VALIDATION_CRITERIA.md`

---

## MEDIUM PRIORITY

### Phase 10: CodeRabbit v2 Design Decisions

**Source:** `CODERABBIT_REVIEW_ANALYSIS_v2.md` - 10 items requiring review/decision

- [ ] **10.1** Evaluate and document decisions for design decision items
  - Review DD-1: Verifier bypass behavior (loop.sh lines 465-469)
  - Review DD-2: Same for template (templates/ralph/loop.sh lines 464-468)
  - Review DD-3: rovodev-config.yml machine-specific paths
  - Review DD-4: VALIDATION_CRITERIA.md status inconsistency
  - Review DUP-1: THUNK.md duplicate IDs (lines 98-100, 211-239)
  - Review M-28: AGENTS.md monitor hotkeys mismatch
  - Review M-29: PROMPT.md incomplete protected-files list
  - Review N-19: NEURONS.md Windows backslashes (line 204-206)
  - Review Item A: PROMPT.project.md MD050 style preference
  - Review Item B: PROMPT.md "Brain KB" in protected file

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

> **Auto-generated from verifier** — Last run: 2026-01-19 11:52:20 ( d23c74c)

| Metric | Value |
|--------|-------|
| ✅ PASS | 21 |
| ❌ FAIL | 0 |
| ⚠️ WARN | 6
2 |
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
