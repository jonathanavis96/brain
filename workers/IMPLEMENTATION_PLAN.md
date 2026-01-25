# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-25 03:03:10

**Current Status:** PLAN mode (Iteration 1) complete. Verifier ran successfully: 53 PASS, 7 WARN (shellcheck/template sync - non-blocking). Phase 0 task X.4.1 was already completed (iter= removed from CACHE_CONFIG in previous session). Plan structure reviewed: Phases 5-8 well-organized, Phase 5.1 ready for BUILD execution starting with task 5.1.1. No new phases or tasks needed at this time.

<!-- Cortex adds new Task Contracts below this line -->

## Phase 5: CodeRabbit PR #5 Fixes

**Goal:** Fix all issues identified by CodeRabbit in PR #5.  
**Reference:** `docs/CODERABBIT_PR5_ALL_ISSUES.md`  
**Total Issues:** 40+ (8 critical, 8 high, 12 medium, 12+ low)

### Phase 5.1: Git Hygiene (Ralph)

- [x] **5.1.1** Add `*.egg-info/` to `.gitignore`
  - **AC:** `grep -q 'egg-info' .gitignore` returns 0

- [x] **5.1.2** Remove committed egg-info directory
  - Run `git rm -r tools/rollflow_analyze/src/rollflow_analyze.egg-info/`
  - **AC:** Directory removed from repo

- [x] **5.1.3** Fix waiver request reason in `WVR-2026-01-24-003.json`
  - Update reason field to match actual evidence (files are identical)
  - **AC:** Reason field accurately reflects diff -q output

### Phase 5.2: Logic Bug Fixes (Ralph)

- [x] **5.2.1** Fix `cleanup()` not called in `cleanup_and_emit` (loop.sh:154-172)
  - Call `cleanup()` before releasing lock to remove TEMP_CONFIG
  - **AC:** TEMP_CONFIG removed on all exit paths

- [x] **5.2.2** Fix `lookup_cache_pass` missing tool argument (loop.sh:1037-1038)
  - Add tool name as 3rd argument to lookup_cache_pass calls
  - **AC:** `non_cacheable_tools` check works correctly

- [x] **5.2.3** Fix cache-hit early return leaves temp file (loop.sh:1056-1068)
  - Add `rm -f "$prompt_with_mode"` before each cache-hit return
  - **AC:** No orphaned temp files after cache hits

- [x] **5.2.4** Fix CACHE_SKIP only accepts literal "true" (loop.sh:341-360)
  - Accept truthy values: 1, true, yes, y, on (case-insensitive)
  - **AC:** `CACHE_SKIP=1` and `CACHE_SKIP=yes` both work

- [x] **5.2.5** Fix `approve_waiver_totp.py` deletes request file (lines 83-90)
  - Keep request file or move to archive instead of deleting
  - **AC:** `check_waiver.sh` can still compute REQUEST_SHA256
  - **If Blocked:** Look at lines 83-90 where `os.remove()` is called. Either: (a) comment out the remove, (b) copy to `.verify/waiver_requests/archived/` before removing, or (c) rename to `.processed` suffix

- [x] **5.2.6** Fix verifier.sh cache key inconsistency (lines 344-385)
  - Compute ac_rules_hash before CACHE_MODE check, not just in "use" mode
  - **AC:** Cache keys consistent between record and use modes
  - **If Blocked:** The `ac_rules_hash` is computed inside an `if [[ "$CACHE_MODE" == "use" ]]` block. Move the hash computation BEFORE this conditional so both "record" and "use" modes have the same cache key components

- [ ] **5.2.7** Fix `bin/brain-event` unbound variable (lines 84-117)
  - Guard `$2` access with `${2-}` or `$# -ge 2` checks
  - **AC:** `shellcheck bin/brain-event` passes, no unbound errors

- [ ] **5.2.8** Fix `cerebras_agent.py` state reinjection (lines 1021-1038)
  - Insert state_msg after user message (index 2) not at index 1
  - **AC:** `_prune_messages` preserves system+user correctly
  - **If Blocked:** Message order must be: [0]=system, [1]=user, [2]=state_injection. The `_prune_messages` function expects system at 0 and user at 1. Find `messages.insert(1, state_msg)` and change to `messages.insert(2, state_msg)`

### Phase 5.3: Documentation Fixes (Ralph)

- [x] **5.3.1** Create `skills/domains/languages/typescript/README.md`
  - Fixes broken links from frontend/README.md and javascript/README.md
  - **AC:** File exists, links resolve

- [ ] **5.3.2** Update `skills/index.md` entries in SUMMARY.md
  - Add research-patterns, research-cheatsheet, token-efficiency
  - Add frontend section entries
  - **AC:** All index.md entries have SUMMARY.md counterparts

- [ ] **5.3.3** Fix incorrect dates (2026-01-25 → 2026-01-24)
  - Files: `workers/IMPLEMENTATION_PLAN.md`, `skills/domains/languages/typescript/README.md`
  - **AC:** No future dates in Last Updated fields

- [ ] **5.3.4** Fix `workers/IMPLEMENTATION_PLAN.md` status mismatches
  - Phase 2.1.2: Change "remains" to "COMPLETE"
  - Phase 12.4.2-12.4.3: Reconcile "deferred" text with checked boxes
  - **AC:** Status text matches checkbox state

- [ ] **5.3.5** Fix markdown formatting in `workers/ralph/THUNK.md`
  - Escape pipe characters in table rows: `|` → `\|` or wrap in backticks
  - **AC:** Markdown renders correctly

- [ ] **5.3.6** Fix stray fence in `observability-patterns.md` (lines 584-585)
  - Remove duplicate closing backticks
  - **AC:** No orphan code fences

### Phase 5.4: Code Example Fixes (Ralph)

- [ ] **5.4.1** Fix `deployment-patterns.md` - add `import time`
  - **AC:** Python example runs without NameError

- [ ] **5.4.2** Fix `deployment-patterns.md` - `isEnabledForPercentage` userId
  - Add userId parameter to function signature
  - **AC:** TypeScript compiles

- [ ] **5.4.3** Fix `observability-patterns.md` - JsonFormatter.format
  - Use correct LogRecord attribute access
  - **AC:** Python example runs

- [ ] **5.4.4** Fix `observability-patterns.md` - metricsMiddleware status
  - Capture actual status code instead of hardcoding "200"
  - **AC:** Go example compiles

- [ ] **5.4.5** Fix `observability-patterns.md` - SQL injection in span
  - Use parameterized query format in example
  - **AC:** Example shows secure pattern

- [ ] **5.4.6** Fix `disaster-recovery-patterns.md` - PostgreSQL 12+ recovery
  - Replace recovery.conf with postgresql.conf + recovery.signal
  - **AC:** Example works with modern PostgreSQL

- [ ] **5.4.7** Fix `javascript/README.md` - undefined userId
  - Add `const userId = 42` before sql usage
  - **AC:** Example is self-contained

- [ ] **5.4.8** Fix `test-coverage-patterns.md` - Jest flags
  - Replace `--collectCoverageFrom` with `--findRelatedTests`
  - Handle empty changed_files.txt
  - **AC:** Script works correctly

- [ ] **5.4.9** Fix `test-coverage-patterns.md` - artifacts endpoint
  - Use correct GitHub Actions artifacts API
  - Add Authorization header
  - **AC:** API call format is correct

- [ ] **5.4.10** Fix `deployment-patterns.md` - grammar
  - "backward compatible" → "backward-compatible"
  - **AC:** Hyphenated compound adjective

### Phase 5.5: Shell Script Fixes (Ralph)

- [ ] **5.5.1** Fix `current_ralph_tasks.sh` - Archive header handling
  - Treat Archive headers as section terminators
  - **AC:** Archive sections properly delimit task sections

- [ ] **5.5.2** Fix `templates/ralph/loop.sh` - cache key JSON
  - Use content_hash helper instead of raw JSON string
  - **AC:** Cache key generation doesn't fail under set -euo

### Phase 5.0: Hash Regeneration (HUMAN ONLY - Do First) ✅ COMPLETE

> ✅ **Completed 2026-01-25 by Cortex**

- [x] **5.0.1** Regenerate `.verify/loop.sha256`
- [x] **5.0.2** Regenerate `.verify/ac.sha256` - was already correct
- [x] **5.0.3** Regenerate `.verify/verifier.sha256` - was already correct
- [x] **5.0.4** Regenerate `workers/ralph/.verify/loop.sha256`
- [x] **5.0.5** Regenerate `workers/ralph/.verify/prompt.sha256` - was already correct
- [x] **5.0.6** Regenerate `workers/ralph/.verify/verifier.sha256` - was already correct
- [x] **5.0.7** Regenerate `templates/ralph/.verify/loop.sha256`
- [x] **5.0.8** Create SPEC_CHANGE_REQUEST.md - not needed, hashes updated directly

---


## Phase 6: Housekeeping & Skills Expansion

**Goal:** Clean up broken links, expand skills coverage, sync SUMMARY.md with actual skills.  
**Priority:** LOW - Good overnight work after Phase 5

### Phase 6.1: Fix Broken Links in Skills

- [ ] **6.1.1** Fix `skills/domains/languages/shell/README.md` broken links
  - `[code-hygiene.md](../code-hygiene.md)` → should be `../../code-quality/code-hygiene.md`
  - `[ralph-patterns.md](../ralph-patterns.md)` → should be `../../ralph/ralph-patterns.md`
  - **AC:** Links resolve to existing files

### Phase 6.2: Update SUMMARY.md with Missing Skills

- [ ] **6.2.1** Add missing skills to `skills/SUMMARY.md`
  - Missing: `accessibility-patterns`, `cache-debugging`, `disaster-recovery-patterns`, `observability-patterns`, `react-patterns`, `test-coverage-patterns`
  - **AC:** All `.md` files in `skills/domains/` have SUMMARY.md entries

### Phase 6.3: Stub Out Empty Language Directories

- [ ] **6.3.1** Create `skills/domains/languages/go/go-patterns.md` stub
  - Include: error handling, goroutines basics, common idioms
  - **AC:** File exists with at least Quick Reference table

- [ ] **6.3.2** Create `skills/domains/languages/javascript/javascript-patterns.md` stub  
  - Include: async/await, modules, common gotchas
  - **AC:** File exists with at least Quick Reference table

- [ ] **6.3.3** Expand `skills/domains/languages/typescript/README.md` to full patterns file
  - Include: type narrowing, generics basics, strict mode tips
  - **AC:** File has practical examples, not just links

### Phase 6.4: Template Sync Documentation

- [ ] **6.4.1** Document intentional template drift in `templates/ralph/README.md`
  - Explain why `loop.sh`, `verifier.sh`, `current_ralph_tasks.sh` differ from workers/ralph/
  - List which files SHOULD sync vs which are brain-specific
  - **AC:** README explains sync policy

### Phase 6.5: Waiver Request Cleanup

- [ ] **6.5.1** Add `created` timestamp to waiver request JSON schema
  - Update `.verify/request_waiver.sh` to include `"created": "$(date -Iseconds)"`
  - **AC:** New waiver requests have `created` field

- [ ] **6.5.2** Backfill `created` field in existing waiver requests
  - Use file mtime as fallback: `WVR-2026-01-24-*.json`
  - **AC:** All waiver requests have `created` field

### Phase 6.6: Index and Cross-Reference Improvements

- [ ] **6.6.1** Update `skills/index.md` with new Phase 6.3 skills
  - Add go-patterns, javascript-patterns entries
  - **AC:** Index lists all skill files

- [ ] **6.6.2** Add "See Also" sections to isolated skill files
  - Files like `cache-debugging.md` should link to related `caching-patterns.md`
  - **AC:** Skills have bidirectional links where relevant

**Phase AC:** No broken links in skills/, SUMMARY.md complete, language stubs exist

---


## Phase 7: Capability Gap Radar (Automated Gap Discovery)

**Goal:** Automatically detect missing skills by analyzing errors and failures across Ralph runs.  
**Why:** Gap capture exists but is underused. This turns every failure into a learning opportunity.  
**Priority:** MEDIUM - Infrastructure that compounds over time

### Phase 7.1: Error Pattern Extraction

- [ ] **7.1.1** Create `tools/gap_radar/extract_errors.sh`
  - Parse verifier output (`.verify/latest.txt`) for `[FAIL]` and `[WARN]` lines
  - Extract error codes (SC2155, MD040, etc.) and file paths
  - Output JSON: `{"error_code": "SC2155", "file": "loop.sh", "line": 42, "message": "..."}`
  - **AC:** Script parses sample verifier output correctly

- [ ] **7.1.2** Create `tools/gap_radar/extract_from_logs.sh`
  - Parse Ralph iteration logs for common failure patterns
  - Look for: Python tracebacks, shell errors, "command not found", lint failures
  - Output same JSON format as 7.1.1
  - **AC:** Script extracts errors from sample log file

- [ ] **7.1.3** Create `tools/gap_radar/patterns.yaml`
  - Define regex patterns for common error types
  - Categories: shell, python, markdown, git, permissions, network
  - Include example matches for each pattern
  - **AC:** YAML is valid, patterns documented

### Phase 7.2: Skills Coverage Matching

- [ ] **7.2.1** Create `tools/gap_radar/match_skills.py`
  - Input: error JSON from 7.1.x
  - Load `skills/index.md` and parse skill → error code mappings
  - Output: `{"error_code": "SC2155", "covered": true, "skill": "shell/variable-patterns.md"}`
  - **AC:** Correctly identifies covered vs uncovered errors

- [ ] **7.2.2** Add error code tags to existing skills
  - Update shell patterns to include `<!-- covers: SC2155, SC2034, SC2086 -->`
  - Update markdown patterns for MD040, MD032, etc.
  - **AC:** At least 10 skills have coverage tags

- [ ] **7.2.3** Create `tools/gap_radar/coverage_report.py`
  - Generate summary: total errors seen, % covered by skills, top uncovered
  - Output markdown table suitable for `GAP_BACKLOG.md` or standalone report
  - **AC:** Report runs and produces readable output

### Phase 7.3: Auto-Append to GAP_BACKLOG

- [ ] **7.3.1** Create `tools/gap_radar/suggest_gaps.sh`
  - Chain: extract_errors → match_skills → filter uncovered → format as gap entry
  - De-duplicate against existing `GAP_BACKLOG.md` entries
  - Output gap entries in correct markdown format
  - **AC:** Suggested gaps match GAP_BACKLOG format

- [ ] **7.3.2** Add `--dry-run` and `--auto-append` modes
  - `--dry-run`: Print suggestions without modifying files
  - `--auto-append`: Append to GAP_BACKLOG.md with timestamp
  - **AC:** Both modes work, auto-append preserves file structure

- [ ] **7.3.3** Create `tools/gap_radar/README.md`
  - Document usage, configuration, output formats
  - Include examples of running after Ralph iteration
  - **AC:** README covers all scripts and options

### Phase 7.4: Integration Hook

- [ ] **7.4.1** Add gap radar hook to `workers/ralph/loop.sh` (post-iteration)
  - After BUILD iteration completes, run `gap_radar/suggest_gaps.sh --dry-run`
  - Log suggestions to iteration log (don't auto-modify GAP_BACKLOG)
  - **AC:** Gap suggestions appear in Ralph logs
  - **If Blocked:** This modifies protected file - may need to defer or request waiver

- [ ] **7.4.2** Create `bin/gap-radar` convenience wrapper
  - Runs full pipeline with sensible defaults
  - Options: `--since <date>`, `--from-log <file>`, `--append`
  - **AC:** `bin/gap-radar --help` shows usage

**Phase AC:** Gap radar detects uncovered errors, suggests gaps, integrates with Ralph workflow

---


## Phase 8: Agent Playbooks (End-to-End Workflows)

**Goal:** Create curated multi-skill workflows for common complex tasks.  
**Why:** Skills are atomic; playbooks chain them into actionable guides.  
**Priority:** MEDIUM - Improves agent effectiveness on complex tasks

### Phase 8.1: Playbook Infrastructure

- [ ] **8.1.1** Create `skills/playbooks/` directory structure
  - Add `README.md` explaining playbook format and purpose
  - Define template: Goal, Prerequisites, Steps, Decision Points, Verification
  - **AC:** Directory exists with README

- [ ] **8.1.2** Create `skills/playbooks/PLAYBOOK_TEMPLATE.md`
  - Sections: Goal, When to Use, Prerequisites, Steps (numbered), Checkpoints, Troubleshooting
  - Include placeholder examples
  - **AC:** Template is complete and usable

- [ ] **8.1.3** Update `skills/index.md` with playbooks section
  - Add new "## Playbooks" section
  - Link to playbook directory
  - **AC:** Index includes playbooks

### Phase 8.2: Core Playbooks (Shell/Linting)

- [ ] **8.2.1** Create `skills/playbooks/fix-shellcheck-failures.md`
  - Steps: Run shellcheck → Identify error code → Lookup in shell patterns → Apply fix → Re-run
  - Decision points: "Is this a false positive?" → waiver path
  - Links to: `shell/variable-patterns.md`, `shell/common-pitfalls.md`
  - **AC:** Playbook covers SC2155, SC2034, SC2086 scenarios

- [ ] **8.2.2** Create `skills/playbooks/fix-markdown-lint.md`
  - Steps: Run markdownlint → Parse errors → Apply fixes → Verify
  - Include auto-fix option: `bash workers/ralph/fix-markdown.sh`
  - Links to: `code-quality/markdown-patterns.md`
  - **AC:** Playbook covers MD040, MD032, MD024 scenarios

- [ ] **8.2.3** Create `skills/playbooks/resolve-verifier-failures.md`
  - Steps: Read verifier output → Categorize failure type → Route to appropriate fix
  - Decision tree: Protected file? → Human required. Lint fail? → Fix playbook. Hash mismatch? → Regen or waiver
  - Links to: multiple skills based on failure type
  - **AC:** Playbook covers all verifier check categories

### Phase 8.3: Template & Sync Playbooks

- [ ] **8.3.1** Create `skills/playbooks/safe-template-sync.md`
  - Steps: Identify drift → Determine if intentional → Sync or document exception
  - Covers: workers/ralph/ ↔ templates/ralph/ synchronization
  - Decision point: "Is this brain-specific?" → Document in README, don't sync
  - **AC:** Playbook explains sync policy and exceptions

- [ ] **8.3.2** Create `skills/playbooks/bootstrap-new-project.md`
  - Steps: Run new-project.sh → Configure THOUGHTS.md → Set up validation criteria → First Ralph run
  - Links to: `docs/BOOTSTRAPPING.md`, templates
  - **AC:** Playbook covers full project setup flow

### Phase 8.4: Debugging Playbooks

- [ ] **8.4.1** Create `skills/playbooks/debug-ralph-stuck.md`
  - Symptoms: Ralph not progressing, repeated failures, infinite loop
  - Steps: Check lock file → Review last log → Identify blocking issue → Resolution paths
  - Links to: `ralph/ralph-patterns.md`, `ralph/cache-debugging.md`
  - **AC:** Playbook covers common stuck scenarios

- [ ] **8.4.2** Create `skills/playbooks/investigate-test-failures.md`
  - Steps: Run tests → Parse output → Identify failure type → Fix or escalate
  - Covers: Python pytest, shell script tests, integration tests
  - Links to: `code-quality/testing-patterns.md`
  - **AC:** Playbook covers pytest and bash test scenarios

### Phase 8.5: Playbook Cross-References

- [ ] **8.5.1** Add "Related Playbooks" section to relevant skills
  - Update shell patterns to link to fix-shellcheck playbook
  - Update markdown patterns to link to fix-markdown-lint playbook
  - **AC:** At least 5 skills have playbook cross-references

- [ ] **8.5.2** Update `skills/SUMMARY.md` with playbooks overview
  - Add playbooks to quick reference table
  - Include "When to use a playbook vs a skill" guidance
  - **AC:** SUMMARY includes playbooks section

**Phase AC:** Playbook infrastructure exists, 6+ playbooks created, cross-referenced from skills

## Phase 5: CodeRabbit PR #5 Fixes

**Goal:** Fix all issues identified by CodeRabbit in PR #5.  
**Reference:** `docs/CODERABBIT_PR5_ALL_ISSUES.md`  
**Total Issues:** 40+ (8 critical, 8 high, 12 medium, 12+ low)

### Phase 5.1: Git Hygiene (Ralph)

- [x] **5.1.1** Add `*.egg-info/` to `.gitignore`
  - **AC:** `grep -q 'egg-info' .gitignore` returns 0

- [x] **5.1.2** Remove committed egg-info directory
  - Run `git rm -r tools/rollflow_analyze/src/rollflow_analyze.egg-info/`
  - **AC:** Directory removed from repo

- [x] **5.1.3** Fix waiver request reason in `WVR-2026-01-24-003.json`
  - Update reason field to match actual evidence (files are identical)
  - **AC:** Reason field accurately reflects diff -q output

### Phase 5.2: Logic Bug Fixes (Ralph)

- [x] **5.2.1** Fix `cleanup()` not called in `cleanup_and_emit` (loop.sh:154-172)
  - Call `cleanup()` before releasing lock to remove TEMP_CONFIG
  - **AC:** TEMP_CONFIG removed on all exit paths

- [x] **5.2.2** Fix `lookup_cache_pass` missing tool argument (loop.sh:1037-1038)
  - Add tool name as 3rd argument to lookup_cache_pass calls
  - **AC:** `non_cacheable_tools` check works correctly

- [x] **5.2.3** Fix cache-hit early return leaves temp file (loop.sh:1056-1068)
  - Add `rm -f "$prompt_with_mode"` before each cache-hit return
  - **AC:** No orphaned temp files after cache hits

- [x] **5.2.4** Fix CACHE_SKIP only accepts literal "true" (loop.sh:341-360)
  - Accept truthy values: 1, true, yes, y, on (case-insensitive)
  - **AC:** `CACHE_SKIP=1` and `CACHE_SKIP=yes` both work

- [x] **5.2.5** Fix `approve_waiver_totp.py` deletes request file (lines 83-90)
  - Keep request file or move to archive instead of deleting
  - **AC:** `check_waiver.sh` can still compute REQUEST_SHA256
  - **If Blocked:** Look at lines 83-90 where `os.remove()` is called. Either: (a) comment out the remove, (b) copy to `.verify/waiver_requests/archived/` before removing, or (c) rename to `.processed` suffix

- [x] **5.2.6** Fix verifier.sh cache key inconsistency (lines 344-385)
  - Compute ac_rules_hash before CACHE_MODE check, not just in "use" mode
  - **AC:** Cache keys consistent between record and use modes
  - **If Blocked:** The `ac_rules_hash` is computed inside an `if [[ "$CACHE_MODE" == "use" ]]` block. Move the hash computation BEFORE this conditional so both "record" and "use" modes have the same cache key components

- [ ] **5.2.7** Fix `bin/brain-event` unbound variable (lines 84-117)
  - Guard `$2` access with `${2-}` or `$# -ge 2` checks
  - **AC:** `shellcheck bin/brain-event` passes, no unbound errors

- [ ] **5.2.8** Fix `cerebras_agent.py` state reinjection (lines 1021-1038)
  - Insert state_msg after user message (index 2) not at index 1
  - **AC:** `_prune_messages` preserves system+user correctly
  - **If Blocked:** Message order must be: [0]=system, [1]=user, [2]=state_injection. The `_prune_messages` function expects system at 0 and user at 1. Find `messages.insert(1, state_msg)` and change to `messages.insert(2, state_msg)`

### Phase 5.3: Documentation Fixes (Ralph)

- [x] **5.3.1** Create `skills/domains/languages/typescript/README.md`
  - Fixes broken links from frontend/README.md and javascript/README.md
  - **AC:** File exists, links resolve

- [ ] **5.3.2** Update `skills/index.md` entries in SUMMARY.md
  - Add research-patterns, research-cheatsheet, token-efficiency
  - Add frontend section entries
  - **AC:** All index.md entries have SUMMARY.md counterparts

- [ ] **5.3.3** Fix incorrect dates (2026-01-25 → 2026-01-24)
  - Files: `workers/IMPLEMENTATION_PLAN.md`, `skills/domains/languages/typescript/README.md`
  - **AC:** No future dates in Last Updated fields

- [ ] **5.3.4** Fix `workers/IMPLEMENTATION_PLAN.md` status mismatches
  - Phase 2.1.2: Change "remains" to "COMPLETE"
  - Phase 12.4.2-12.4.3: Reconcile "deferred" text with checked boxes
  - **AC:** Status text matches checkbox state

- [ ] **5.3.5** Fix markdown formatting in `workers/ralph/THUNK.md`
  - Escape pipe characters in table rows: `|` → `\|` or wrap in backticks
  - **AC:** Markdown renders correctly

- [ ] **5.3.6** Fix stray fence in `observability-patterns.md` (lines 584-585)
  - Remove duplicate closing backticks
  - **AC:** No orphan code fences

### Phase 5.4: Code Example Fixes (Ralph)

- [ ] **5.4.1** Fix `deployment-patterns.md` - add `import time`
  - **AC:** Python example runs without NameError

- [ ] **5.4.2** Fix `deployment-patterns.md` - `isEnabledForPercentage` userId
  - Add userId parameter to function signature
  - **AC:** TypeScript compiles

- [ ] **5.4.3** Fix `observability-patterns.md` - JsonFormatter.format
  - Use correct LogRecord attribute access
  - **AC:** Python example runs

- [ ] **5.4.4** Fix `observability-patterns.md` - metricsMiddleware status
  - Capture actual status code instead of hardcoding "200"
  - **AC:** Go example compiles

- [ ] **5.4.5** Fix `observability-patterns.md` - SQL injection in span
  - Use parameterized query format in example
  - **AC:** Example shows secure pattern

- [ ] **5.4.6** Fix `disaster-recovery-patterns.md` - PostgreSQL 12+ recovery
  - Replace recovery.conf with postgresql.conf + recovery.signal
  - **AC:** Example works with modern PostgreSQL

- [ ] **5.4.7** Fix `javascript/README.md` - undefined userId
  - Add `const userId = 42` before sql usage
  - **AC:** Example is self-contained

- [ ] **5.4.8** Fix `test-coverage-patterns.md` - Jest flags
  - Replace `--collectCoverageFrom` with `--findRelatedTests`
  - Handle empty changed_files.txt
  - **AC:** Script works correctly

- [ ] **5.4.9** Fix `test-coverage-patterns.md` - artifacts endpoint
  - Use correct GitHub Actions artifacts API
  - Add Authorization header
  - **AC:** API call format is correct

- [ ] **5.4.10** Fix `deployment-patterns.md` - grammar
  - "backward compatible" → "backward-compatible"
  - **AC:** Hyphenated compound adjective

### Phase 5.5: Shell Script Fixes (Ralph)

- [ ] **5.5.1** Fix `current_ralph_tasks.sh` - Archive header handling
  - Treat Archive headers as section terminators
  - **AC:** Archive sections properly delimit task sections

- [ ] **5.5.2** Fix `templates/ralph/loop.sh` - cache key JSON
  - Use content_hash helper instead of raw JSON string
  - **AC:** Cache key generation doesn't fail under set -euo

### Phase 5.0: Hash Regeneration (HUMAN ONLY - Do First) ✅ COMPLETE

> ✅ **Completed 2026-01-25 by Cortex**

- [x] **5.0.1** Regenerate `.verify/loop.sha256`
- [x] **5.0.2** Regenerate `.verify/ac.sha256` - was already correct
- [x] **5.0.3** Regenerate `.verify/verifier.sha256` - was already correct
- [x] **5.0.4** Regenerate `workers/ralph/.verify/loop.sha256`
- [x] **5.0.5** Regenerate `workers/ralph/.verify/prompt.sha256` - was already correct
- [x] **5.0.6** Regenerate `workers/ralph/.verify/verifier.sha256` - was already correct
- [x] **5.0.7** Regenerate `templates/ralph/.verify/loop.sha256`
- [x] **5.0.8** Create SPEC_CHANGE_REQUEST.md - not needed, hashes updated directly

---


## Phase 6: Housekeeping & Skills Expansion

**Goal:** Clean up broken links, expand skills coverage, sync SUMMARY.md with actual skills.  
**Priority:** LOW - Good overnight work after Phase 5

### Phase 6.1: Fix Broken Links in Skills

- [ ] **6.1.1** Fix `skills/domains/languages/shell/README.md` broken links
  - `[code-hygiene.md](../code-hygiene.md)` → should be `../../code-quality/code-hygiene.md`
  - `[ralph-patterns.md](../ralph-patterns.md)` → should be `../../ralph/ralph-patterns.md`
  - **AC:** Links resolve to existing files

### Phase 6.2: Update SUMMARY.md with Missing Skills

- [ ] **6.2.1** Add missing skills to `skills/SUMMARY.md`
  - Missing: `accessibility-patterns`, `cache-debugging`, `disaster-recovery-patterns`, `observability-patterns`, `react-patterns`, `test-coverage-patterns`
  - **AC:** All `.md` files in `skills/domains/` have SUMMARY.md entries

### Phase 6.3: Stub Out Empty Language Directories

- [ ] **6.3.1** Create `skills/domains/languages/go/go-patterns.md` stub
  - Include: error handling, goroutines basics, common idioms
  - **AC:** File exists with at least Quick Reference table

- [ ] **6.3.2** Create `skills/domains/languages/javascript/javascript-patterns.md` stub  
  - Include: async/await, modules, common gotchas
  - **AC:** File exists with at least Quick Reference table

- [ ] **6.3.3** Expand `skills/domains/languages/typescript/README.md` to full patterns file
  - Include: type narrowing, generics basics, strict mode tips
  - **AC:** File has practical examples, not just links

### Phase 6.4: Template Sync Documentation

- [ ] **6.4.1** Document intentional template drift in `templates/ralph/README.md`
  - Explain why `loop.sh`, `verifier.sh`, `current_ralph_tasks.sh` differ from workers/ralph/
  - List which files SHOULD sync vs which are brain-specific
  - **AC:** README explains sync policy

### Phase 6.5: Waiver Request Cleanup

- [ ] **6.5.1** Add `created` timestamp to waiver request JSON schema
  - Update `.verify/request_waiver.sh` to include `"created": "$(date -Iseconds)"`
  - **AC:** New waiver requests have `created` field

- [ ] **6.5.2** Backfill `created` field in existing waiver requests
  - Use file mtime as fallback: `WVR-2026-01-24-*.json`
  - **AC:** All waiver requests have `created` field

### Phase 6.6: Index and Cross-Reference Improvements

- [ ] **6.6.1** Update `skills/index.md` with new Phase 6.3 skills
  - Add go-patterns, javascript-patterns entries
  - **AC:** Index lists all skill files

- [ ] **6.6.2** Add "See Also" sections to isolated skill files
  - Files like `cache-debugging.md` should link to related `caching-patterns.md`
  - **AC:** Skills have bidirectional links where relevant

**Phase AC:** No broken links in skills/, SUMMARY.md complete, language stubs exist

---


## Phase 7: Capability Gap Radar (Automated Gap Discovery)

**Goal:** Automatically detect missing skills by analyzing errors and failures across Ralph runs.  
**Why:** Gap capture exists but is underused. This turns every failure into a learning opportunity.  
**Priority:** MEDIUM - Infrastructure that compounds over time

### Phase 7.1: Error Pattern Extraction

- [ ] **7.1.1** Create `tools/gap_radar/extract_errors.sh`
  - Parse verifier output (`.verify/latest.txt`) for `[FAIL]` and `[WARN]` lines
  - Extract error codes (SC2155, MD040, etc.) and file paths
  - Output JSON: `{"error_code": "SC2155", "file": "loop.sh", "line": 42, "message": "..."}`
  - **AC:** Script parses sample verifier output correctly

- [ ] **7.1.2** Create `tools/gap_radar/extract_from_logs.sh`
  - Parse Ralph iteration logs for common failure patterns
  - Look for: Python tracebacks, shell errors, "command not found", lint failures
  - Output same JSON format as 7.1.1
  - **AC:** Script extracts errors from sample log file

- [ ] **7.1.3** Create `tools/gap_radar/patterns.yaml`
  - Define regex patterns for common error types
  - Categories: shell, python, markdown, git, permissions, network
  - Include example matches for each pattern
  - **AC:** YAML is valid, patterns documented

### Phase 7.2: Skills Coverage Matching

- [ ] **7.2.1** Create `tools/gap_radar/match_skills.py`
  - Input: error JSON from 7.1.x
  - Load `skills/index.md` and parse skill → error code mappings
  - Output: `{"error_code": "SC2155", "covered": true, "skill": "shell/variable-patterns.md"}`
  - **AC:** Correctly identifies covered vs uncovered errors

- [ ] **7.2.2** Add error code tags to existing skills
  - Update shell patterns to include `<!-- covers: SC2155, SC2034, SC2086 -->`
  - Update markdown patterns for MD040, MD032, etc.
  - **AC:** At least 10 skills have coverage tags

- [ ] **7.2.3** Create `tools/gap_radar/coverage_report.py`
  - Generate summary: total errors seen, % covered by skills, top uncovered
  - Output markdown table suitable for `GAP_BACKLOG.md` or standalone report
  - **AC:** Report runs and produces readable output

### Phase 7.3: Auto-Append to GAP_BACKLOG

- [ ] **7.3.1** Create `tools/gap_radar/suggest_gaps.sh`
  - Chain: extract_errors → match_skills → filter uncovered → format as gap entry
  - De-duplicate against existing `GAP_BACKLOG.md` entries
  - Output gap entries in correct markdown format
  - **AC:** Suggested gaps match GAP_BACKLOG format

- [ ] **7.3.2** Add `--dry-run` and `--auto-append` modes
  - `--dry-run`: Print suggestions without modifying files
  - `--auto-append`: Append to GAP_BACKLOG.md with timestamp
  - **AC:** Both modes work, auto-append preserves file structure

- [ ] **7.3.3** Create `tools/gap_radar/README.md`
  - Document usage, configuration, output formats
  - Include examples of running after Ralph iteration
  - **AC:** README covers all scripts and options

### Phase 7.4: Integration Hook

- [ ] **7.4.1** Add gap radar hook to `workers/ralph/loop.sh` (post-iteration)
  - After BUILD iteration completes, run `gap_radar/suggest_gaps.sh --dry-run`
  - Log suggestions to iteration log (don't auto-modify GAP_BACKLOG)
  - **AC:** Gap suggestions appear in Ralph logs
  - **If Blocked:** This modifies protected file - may need to defer or request waiver

- [ ] **7.4.2** Create `bin/gap-radar` convenience wrapper
  - Runs full pipeline with sensible defaults
  - Options: `--since <date>`, `--from-log <file>`, `--append`
  - **AC:** `bin/gap-radar --help` shows usage

**Phase AC:** Gap radar detects uncovered errors, suggests gaps, integrates with Ralph workflow

---


## Phase 8: Agent Playbooks (End-to-End Workflows)

**Goal:** Create curated multi-skill workflows for common complex tasks.  
**Why:** Skills are atomic; playbooks chain them into actionable guides.  
**Priority:** MEDIUM - Improves agent effectiveness on complex tasks

### Phase 8.1: Playbook Infrastructure

- [ ] **8.1.1** Create `skills/playbooks/` directory structure
  - Add `README.md` explaining playbook format and purpose
  - Define template: Goal, Prerequisites, Steps, Decision Points, Verification
  - **AC:** Directory exists with README

- [ ] **8.1.2** Create `skills/playbooks/PLAYBOOK_TEMPLATE.md`
  - Sections: Goal, When to Use, Prerequisites, Steps (numbered), Checkpoints, Troubleshooting
  - Include placeholder examples
  - **AC:** Template is complete and usable

- [ ] **8.1.3** Update `skills/index.md` with playbooks section
  - Add new "## Playbooks" section
  - Link to playbook directory
  - **AC:** Index includes playbooks

### Phase 8.2: Core Playbooks (Shell/Linting)

- [ ] **8.2.1** Create `skills/playbooks/fix-shellcheck-failures.md`
  - Steps: Run shellcheck → Identify error code → Lookup in shell patterns → Apply fix → Re-run
  - Decision points: "Is this a false positive?" → waiver path
  - Links to: `shell/variable-patterns.md`, `shell/common-pitfalls.md`
  - **AC:** Playbook covers SC2155, SC2034, SC2086 scenarios

- [ ] **8.2.2** Create `skills/playbooks/fix-markdown-lint.md`
  - Steps: Run markdownlint → Parse errors → Apply fixes → Verify
  - Include auto-fix option: `bash workers/ralph/fix-markdown.sh`
  - Links to: `code-quality/markdown-patterns.md`
  - **AC:** Playbook covers MD040, MD032, MD024 scenarios

- [ ] **8.2.3** Create `skills/playbooks/resolve-verifier-failures.md`
  - Steps: Read verifier output → Categorize failure type → Route to appropriate fix
  - Decision tree: Protected file? → Human required. Lint fail? → Fix playbook. Hash mismatch? → Regen or waiver
  - Links to: multiple skills based on failure type
  - **AC:** Playbook covers all verifier check categories

### Phase 8.3: Template & Sync Playbooks

- [ ] **8.3.1** Create `skills/playbooks/safe-template-sync.md`
  - Steps: Identify drift → Determine if intentional → Sync or document exception
  - Covers: workers/ralph/ ↔ templates/ralph/ synchronization
  - Decision point: "Is this brain-specific?" → Document in README, don't sync
  - **AC:** Playbook explains sync policy and exceptions

- [ ] **8.3.2** Create `skills/playbooks/bootstrap-new-project.md`
  - Steps: Run new-project.sh → Configure THOUGHTS.md → Set up validation criteria → First Ralph run
  - Links to: `docs/BOOTSTRAPPING.md`, templates
  - **AC:** Playbook covers full project setup flow

### Phase 8.4: Debugging Playbooks

- [ ] **8.4.1** Create `skills/playbooks/debug-ralph-stuck.md`
  - Symptoms: Ralph not progressing, repeated failures, infinite loop
  - Steps: Check lock file → Review last log → Identify blocking issue → Resolution paths
  - Links to: `ralph/ralph-patterns.md`, `ralph/cache-debugging.md`
  - **AC:** Playbook covers common stuck scenarios

- [ ] **8.4.2** Create `skills/playbooks/investigate-test-failures.md`
  - Steps: Run tests → Parse output → Identify failure type → Fix or escalate
  - Covers: Python pytest, shell script tests, integration tests
  - Links to: `code-quality/testing-patterns.md`
  - **AC:** Playbook covers pytest and bash test scenarios

### Phase 8.5: Playbook Cross-References

- [ ] **8.5.1** Add "Related Playbooks" section to relevant skills
  - Update shell patterns to link to fix-shellcheck playbook
  - Update markdown patterns to link to fix-markdown-lint playbook
  - **AC:** At least 5 skills have playbook cross-references

- [ ] **8.5.2** Update `skills/SUMMARY.md` with playbooks overview
  - Add playbooks to quick reference table
  - Include "When to use a playbook vs a skill" guidance
  - **AC:** SUMMARY includes playbooks section

**Phase AC:** Playbook infrastructure exists, 6+ playbooks created, cross-referenced from skills

## Phase 0-Warn: Verifier Warnings

**Goal:** Resolve verifier warnings from latest run.

**Status:**


## Phase 0: Structured Logging (Cortex-readable)

**Goal:** Add structured markers to loop.sh for better observability.

- [x] **X.3.4** Add smoke check for CACHE_GUARD marker
- [ ] **X.4.1** Update `:::CACHE_CONFIG:::` to include `iter=` and `ts=`
- [ ] **X.4.2** Update `:::VERIFIER_ENV:::` to include `iter=` and `ts=`
- [ ] **X.2.1** Implement `run_tool()` wrapper with TOOL_START/TOOL_END markers
- [ ] **X.2.2** Route important tool calls through `run_tool()`
- [ ] **X.2.3** Ensure TOOL_END emitted on failure
- [ ] **X.1.1** Emit ITER_START/ITER_END markers
- [ ] **X.1.2** Emit PHASE_START/PHASE_END markers
- [ ] **X.5.1** Update `rollflow_analyze` to parse `:::` markers
- [ ] **X.5.2** Output `artifacts/analysis/iter_###.json`
- [ ] **X.6.1** Generate `artifacts/review_packs/iter_###.md` from JSON
- [ ] **X.6.2** Attach filtered log excerpts

## Phase 4: Shared Cache Library + Cortex Support (Safety Net)

**Goal:** Extract caching into shared infrastructure for waste-prevention + reliability across all runners.

**Rationale:** Caching won't save huge tokens for "new thinking" work, but prevents waste from:

- Reruns after crashes / network / rate-limit issues
- Accidental double-runs
- Retries where input didn't change
- Repeated setup/analysis steps

### Phase 4.1: Extract Cache Functions

- [ ] **4.1.1** Create `workers/shared/cache.sh` with extracted functions
  - Move from loop.sh: cache key generation, lookup/store, log helpers
  - Export interface: `cache_should_use`, `cache_make_key`, `cache_try_load`, `cache_store`
  - Include env parsing for `CACHE_MODE`, `CACHE_SCOPE`, `--force-fresh`
  - **AC:** File exists, functions are callable, shellcheck passes

### Phase 4.2: Refactor loop.sh to Use Shared Library

- [ ] **4.2.1** Update `workers/ralph/loop.sh` to source shared cache library
  - Replace inline cache logic with calls to `workers/shared/cache.sh`
  - Keep exact semantics: `CACHE_MODE`, `CACHE_SCOPE`, BUILD/PLAN blocking
  - **AC:** Before/after run shows identical cache hits/misses

- [ ] **4.2.2** Update `workers/cerebras/loop.sh` to source shared cache library
  - Same refactor as Ralph
  - **AC:** Cerebras caching unchanged behaviorally

### Phase 4.3: Add Cortex Caching

- [ ] **4.3.1** Update `cortex/one-shot.sh` to source shared cache library
  - Add `source workers/shared/cache.sh`
  - Set `AGENT_NAME=cortex` explicitly
  - Wrap `acli rovodev run` call with cache check/store
  - **AC:** Same one-shot twice with no repo changes → Run 1: miss+store, Run 2: hit+skip

### Phase 4.4: Fix Agent Isolation

- [ ] **4.4.1** Replace RUNNER dependency with AGENT_NAME in cache keys
  - Cache key "agent" field uses `AGENT_NAME` not `RUNNER`
  - Fall back sanely if `AGENT_NAME` missing (log warning)
  - **AC:** Ralph/Cortex/Cerebras with identical prompts don't share cache entries

### Phase 4.5: Smoke Test

- [ ] **4.5.1** Create `scripts/test_cache_smoke.sh` for cache correctness
  - Test: same prompt + git state → cache hit on 2nd run
  - Test: change git_sha → cache miss
  - Test: `--force-fresh` → bypass even if entry exists
  - Test: `CACHE_SCOPE=llm_ro` blocked during BUILD/PLAN
  - **AC:** One command verifies caching works for loop.sh and one-shot.sh


## Phase 5: Skills Knowledge Base Expansion

**Goal:** Expand brain skills to cover more domains and improve existing documentation.

**Priority:** Medium - Enhances agent capabilities and reduces knowledge gaps.


## Phase 6: Template Improvements

**Goal:** Enhance project templates with better defaults and more comprehensive coverage.

**Priority:** Medium - Improves new project bootstrapping experience.

**Recommended Next:** Start with 6.2.x tasks (Ralph template enhancements) as they build on recent cache work, then proceed to language templates (6.1.x).

- [ ] **6.2.1** Add cache configuration guidance to `templates/ralph/PROMPT.md`
  - Document CACHE_MODE and CACHE_SCOPE usage
  - Explain --force-fresh and --cache-skip flags
  - Add examples for BUILD/PLAN cache behavior
  - **AC:** PROMPT.md has cache configuration section with examples

- [ ] **6.2.2** Update `templates/ralph/VALIDATION_CRITERIA.project.md` with cache validation
  - Add cache smoke test commands
  - Document expected cache hit/miss patterns
  - Include troubleshooting guidance
  - **AC:** VALIDATION_CRITERIA.md has cache testing section

- [ ] **6.1.1** Create `templates/javascript/` directory with JS/TS project template
  - AGENTS.project.md, NEURONS.project.md, VALIDATION_CRITERIA.project.md
  - package.json template with common scripts
  - ESLint and Prettier configs
  - **AC:** Directory exists with 5+ files

- [ ] **6.1.2** Create `templates/go/` directory with Go project template
  - AGENTS.project.md, NEURONS.project.md, VALIDATION_CRITERIA.project.md
  - go.mod template and project structure
  - golangci-lint config
  - **AC:** Directory exists with 5+ files

- [ ] **6.3.1** Expand `templates/website/` with more comprehensive starter
  - Review existing website skills in skills/domains/websites/
  - Add section-based composition templates
  - Include SEO and analytics guidance
  - **AC:** templates/website/ has enhanced structure

**Phase 6 AC:** templates/ directory has 2 new language templates and enhanced Ralph/website templates

## Phase 7: Documentation and Maintenance

**Goal:** Improve documentation quality and maintain existing files.

**Priority:** Low - Nice-to-have improvements for clarity and completeness.

- [ ] **7.1.1** Enhance root `README.md` with better onboarding flow
- [ ] **7.1.2** Create `CONTRIBUTING.md` with contribution guidelines
- [ ] **7.2.1** Update `skills/index.md` with new skill files from Phase 5
- [ ] **7.2.2** Update `skills/SUMMARY.md` with enhanced error reference
- [ ] **7.3.1** Request AC.rules update for shellcheck regex

**Phase AC:** Documentation improved with better onboarding, all new skills indexed

---

## Completed Phases

See `workers/ralph/THUNK.md` for complete task history (550+ completed tasks).

**Completed:** Phases 0-3, 5 (partial), 8-13, X.3.1-X.3.3, RollFlow Analyzer (12.x)
