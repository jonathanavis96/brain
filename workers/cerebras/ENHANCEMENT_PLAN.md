# Cerebras Worker Enhancement Plan

## Executive Summary

**Goal:** Bring Cerebras worker to full feature parity with Ralph worker while maintaining its unique Cerebras API integration.

**Current State:**

- ✅ Cerebras has working loop.sh with API integration
- ✅ Token efficiency optimizations added (just completed)
- ❌ Verifier infrastructure is broken (referenced but missing)
- ❌ Missing quality tools and helper scripts
- ❌ Minimal documentation

**Target State:**

- ✅ Full verifier infrastructure working
- ✅ Complete set of quality and monitoring tools
- ✅ Comprehensive documentation
- ✅ Optional: Cortex integration for unified workflow

**Estimated Effort:** 6-10 hours total work

---

## Phase A: Fix Critical Infrastructure (PRIORITY 1)

**Duration:** 1-3 hours  
**Risk:** HIGH if skipped - verifier currently broken

### Tasks

#### 1. Copy verifier.sh

**Why:** Loop.sh calls run_verifier() but file doesn't exist. Currently fails silently in bootstrap mode.

**Actions:**

```bash
cp workers/ralph/verifier.sh workers/cerebras/verifier.sh
```

**Path Adaptations Needed:**

- Change `RALPH=` to `CEREBRAS=`
- Update AC_RULES path if different
- Update .verify/ directory references
- Update workers/ralph/THUNK.md path references

**Files to modify:** workers/cerebras/verifier.sh

---

#### 2. Copy init_verifier_baselines.sh

**Why:** Automated setup for .verify/ infrastructure

**Actions:**

```bash
cp workers/ralph/init_verifier_baselines.sh workers/cerebras/init_verifier_baselines.sh
```

**Path Adaptations:**

- Change script directory references
- Update file paths for cerebras

**Files to modify:** workers/cerebras/init_verifier_baselines.sh

---

#### 3. Create Complete .verify/ Infrastructure

**Why:** Verifier needs baseline hashes for protected file validation

**Files to Create:**

- `.verify/.initialized` - Marker that verification is set up
- `.verify/ac.sha256` - Hash of AC.rules
- `.verify/prompt.sha256` - Hash of PROMPT.md
- `.verify/agents.sha256` - Hash of AGENTS.md
- `.verify/verifier.sha256` - Hash of verifier.sh

**Actions:**

```bash
cd workers/cerebras
bash init_verifier_baselines.sh
```

**Expected Output:** All hash files created, .initialized marker present

---

#### 4. Test Verifier Works

**Why:** Ensure no regressions before proceeding

**Test Commands:**

```bash
cd workers/cerebras
bash verifier.sh
echo $?  # Should be 0 (pass)
```

**Success Criteria:**

- Verifier runs without errors
- All AC checks pass or report known issues
- Exit code is 0 or appropriate for current state

---

## Phase B: Add Quality & Monitoring Tools (PRIORITY 2)

**Duration:** 1-2 hours  
**Risk:** MEDIUM - reduces agent efficiency and human visibility

### Tasks

#### 5. Copy fix-markdown.sh

**Why:** Auto-fix common markdown lint issues, reduce manual iterations

**Actions:**

```bash
cp workers/ralph/fix-markdown.sh workers/cerebras/fix-markdown.sh
```

**No path changes needed** - script is generic

**Test:**

```bash
cd workers/cerebras
bash fix-markdown.sh PROMPT.md
```

---

#### 6. Create current_cerebras_tasks.sh

**Why:** Real-time task monitoring for humans

**Actions:**

```bash
cp workers/ralph/current_ralph_tasks.sh workers/cerebras/current_cerebras_tasks.sh
```

**Path Adaptations:**

- Change `RALPH_DIR` to `CEREBRAS_DIR`
- Update `workers/IMPLEMENTATION_PLAN.md` path
- Update script title/headers

**Test:**

```bash
cd workers/cerebras
bash current_cerebras_tasks.sh
```

---

#### 7. Create thunk_cerebras_tasks.sh

**Why:** View completed task history

**Actions:**

```bash
cp workers/ralph/thunk_ralph_tasks.sh workers/cerebras/thunk_cerebras_tasks.sh
```

**Path Adaptations:**

- Change `RALPH_DIR` to `CEREBRAS_DIR`
- Update `workers/ralph/THUNK.md` path
- Update script title/headers

**Test:**

```bash
cd workers/cerebras
bash thunk_cerebras_tasks.sh
```

---

#### 8. Copy cleanup_plan.sh

**Why:** Archive completed tasks from workers/IMPLEMENTATION_PLAN.md

**Actions:**

```bash
cp workers/ralph/cleanup_plan.sh workers/cerebras/cleanup_plan.sh
```

**Path Adaptations:**

- Update workers/IMPLEMENTATION_PLAN.md path
- Update archive directory path

**Test:**

```bash
cd workers/cerebras
bash cleanup_plan.sh --dry-run
```

---

#### 9. Copy render_ac_status.sh

**Why:** Visualize verifier results in human-readable format

**Actions:**

```bash
cp workers/ralph/render_ac_status.sh workers/cerebras/render_ac_status.sh
```

**Path Adaptations:**

- Update .verify/latest.txt path

**Test:**

```bash
cd workers/cerebras
bash render_ac_status.sh
```

---

#### 10. Test All Helper Scripts

**Why:** Ensure all scripts work before moving forward

**Test Plan:**

- Run each script with --help or -h flag
- Run each script in dry-run mode if available
- Verify output looks correct
- Check for any error messages

---

## Phase C: Add Supporting Infrastructure (PRIORITY 3)

**Duration:** 30-60 minutes  
**Risk:** LOW - nice to have but not critical

### Tasks

#### 11. Copy config/ Directory

**Why:** Store configuration like non_cacheable_tools.txt

**Actions:**

```bash
cp -r workers/ralph/config workers/cerebras/config
```

**Files Included:**

- `config/non_cacheable_tools.txt` - Tools that bypass cache

**No modifications needed** - configuration is generic

---

#### 12. Copy docs/ Directory

**Why:** Additional documentation (waiver protocol, etc.)

**Actions:**

```bash
cp -r workers/ralph/docs workers/cerebras/docs
```

**Files Included:**

- `docs/WAIVER_PROTOCOL.md` - Manual override procedures

**Modifications:**

- Update references from "ralph" to "cerebras"

---

#### 13. Create HUMAN_REQUIRED.md

**Why:** Document when and how to escalate to human

**Actions:**

- Copy workers/ralph/HUMAN_REQUIRED.md as template
- Adapt for cerebras-specific scenarios
- Add cerebras-specific escalation triggers

**Content Should Include:**

- When agent should request human help
- How to request help (notification methods)
- Common escalation scenarios
- Resolution procedures

---

## Phase D: Documentation (PRIORITY 2)

**Duration:** 2-3 hours  
**Risk:** MEDIUM - poor docs reduce usability

### Tasks

#### 14. Create Comprehensive README.md

**Why:** Central guide for understanding cerebras worker

**Content Structure:**

```markdown
# Cerebras Worker

## Overview
- What is the cerebras worker
- How it differs from ralph
- When to use cerebras vs ralph

## Architecture
- Loop structure
- Verifier integration
- Cerebras API integration
- Prompt strategy (PROMPT.md vs PROMPT_lean.md)

## Running Cerebras
- Prerequisites
- Basic usage
- Command-line options
- Environment variables

## Helper Scripts
- current_cerebras_tasks.sh
- thunk_cerebras_tasks.sh
- fix-markdown.sh
- cleanup_plan.sh
- render_ac_status.sh

## Troubleshooting
- Common errors
- Verifier failures
- API issues

## Design Philosophy
- Why separate worker for Cerebras
- Token efficiency focus
- Quality over speed
```

**Actions:**

- Use workers/ralph/README.md as reference
- Adapt sections for cerebras specifics
- Add cerebras API documentation
- Document PROMPT_lean.md usage

---

#### 15. Enhance NEURONS.md

**Why:** Detailed structure map for agent navigation

**Current:** 76 lines (minimal)  
**Target:** 300-400 lines (comprehensive like ralph)

**Content to Add:**

- Complete directory tree
- File purposes and relationships
- Protected files list
- Navigation shortcuts
- Common file locations

---

#### 16. Enhance VALIDATION_CRITERIA.md

**Why:** Comprehensive quality standards

**Current:** 80 lines  
**Target:** 250+ lines (detailed like ralph)

**Content to Add:**

- Detailed acceptance criteria for each phase
- Quality gates (markdown lint, shellcheck, etc.)
- Testing requirements
- Documentation standards
- Commit message format
- Protected file handling

---

## Phase E: Cortex Integration (DECISION REQUIRED)

**Duration:** 1-2 hours  
**Risk:** LOW - optional feature

### Decision Point #1: Should Cerebras Integrate with Cortex?

**Option A: YES - Full Integration**

- Cerebras syncs with cortex like ralph does
- Unified workflow across all workers
- Cortex sees cerebras progress
- More complex, more dependencies

**Option B: NO - Keep Standalone**

- Cerebras remains independent
- Simpler architecture
- No cortex dependencies
- Separate workflow

**Recommendation:** YES if cerebras will be used for brain repository work, NO if cerebras is experimental or separate use case.

---

### Tasks (if YES to integration)

#### 17. Copy task sync script

**Actions:**

```bash
cp workers/ralph/sync_cortex_plan.sh workers/cerebras/sync_cortex_plan.sh
```

**Path Adaptations:**

- Update source workers/IMPLEMENTATION_PLAN.md path
- Update cortex destination path
- Update script name references

---

#### 18. Copy task completion sync script

**Actions:**

```bash
cp workers/ralph/sync_completions_to_cortex.sh workers/cerebras/sync_completions_to_cortex.sh
```

**Path Adaptations:**

- Update workers/ralph/THUNK.md path
- Update cortex paths
- Update worker name references

---

#### 19. Update loop.sh for Cortex Sync

**Why:** Automatically sync with cortex during loop

**Changes Needed:**

- Add sync call after PLAN mode
- Add completion sync after BUILD mode
- Handle sync failures gracefully

**Code Location:** Near end of run_once() function

---

## Phase F: Testing & Validation (FINAL)

**Duration:** 1-2 hours  
**Risk:** HIGH if skipped - could ship broken code

### Tasks

#### 20. Run Full Loop Iteration

**Why:** End-to-end integration test

**Test Commands:**

```bash
cd workers/cerebras
bash loop.sh --dry-run  # Preview changes
bash loop.sh             # Run one iteration
```

**Success Criteria:**

- Loop completes without errors
- Verifier runs and reports status
- Files are committed properly
- workers/ralph/THUNK.md updated correctly

---

#### 21. Verify All Verifier Checks Pass

**Why:** Ensure quality gates work

**Actions:**

- Run verifier manually
- Review all AC checks
- Fix any failures
- Rerun until clean

**Success Criteria:**

- All AC rules pass OR
- Known failures are documented

---

#### 22. Test Helper Scripts with Real Tasks

**Why:** Ensure scripts work in real scenarios

**Test Plan:**

- Add test task to workers/IMPLEMENTATION_PLAN.md
- Monitor with current_cerebras_tasks.sh
- Complete task
- Check with thunk_cerebras_tasks.sh
- Run cleanup_plan.sh
- Verify archive works

---

#### 23. Final Commit

**Why:** Preserve all work with good documentation

**Commit Message Template:**

```text
feat(cerebras): bring worker to full parity with ralph

CRITICAL FIXES:
- Add verifier.sh (was broken - referenced but missing)
- Create complete .verify/ infrastructure
- Add init_verifier_baselines.sh

QUALITY TOOLS:
- Add fix-markdown.sh for auto-fixes
- Add current_cerebras_tasks.sh for monitoring
- Add thunk_cerebras_tasks.sh for history
- Add cleanup_plan.sh for maintenance
- Add render_ac_status.sh for visualization

INFRASTRUCTURE:
- Add config/ directory
- Add docs/ directory
- Add HUMAN_REQUIRED.md

DOCUMENTATION:
- Create comprehensive README.md (420+ lines)
- Enhance NEURONS.md (76 → 400+ lines)
- Enhance VALIDATION_CRITERIA.md (80 → 250+ lines)

[OPTIONAL if Phase E done]
CORTEX INTEGRATION:
- Add task sync script
- Add task completion sync script
- Update loop.sh for automatic sync

TESTING:
- All scripts tested and working
- Full loop iteration successful
- Verifier checks passing

Impact: Cerebras now has same tooling and quality standards as Ralph
Effort: ~8 hours total work
```

---

## Risk Assessment

### High Risk Items (Must Address)

1. ✅ Verifier.sh missing - breaks quality checks
2. ✅ .verify/ infrastructure incomplete - no hash protection

### Medium Risk Items (Should Address)

1. ⚠️ Missing helper scripts - reduces efficiency
2. ⚠️ Minimal documentation - reduces usability

### Low Risk Items (Nice to Have)

1. ℹ️ Cortex integration - optional feature
2. ℹ️ Config/docs directories - convenience

---

## Success Criteria

### Must Have (Phase A-B-D)

- ✅ Verifier works correctly
- ✅ All quality tools present
- ✅ Comprehensive README.md

### Should Have (Phase C)

- ✅ Config and docs directories
- ✅ HUMAN_REQUIRED.md

### Could Have (Phase E)

- ⭐ Cortex integration (decision dependent)

---

## Rollback Plan

If issues arise during implementation:

1. **Critical Failure (verifier broken):**
   - Revert verifier.sh changes
   - Keep .verify/ in bootstrap mode
   - Document issue for later fix

2. **Helper Script Issues:**
   - Remove problematic script
   - Document what didn't work
   - Continue with remaining scripts

3. **Documentation Issues:**
   - Commit code changes separately
   - Fix docs in follow-up commit

---

## Post-Implementation

### Verification Checklist

- [ ] Verifier runs without errors
- [ ] All helper scripts work
- [ ] Documentation is complete
- [ ] Loop completes full iteration
- [ ] All commits have good messages
- [ ] No regressions in existing functionality

### Follow-Up Tasks

- Update templates/ralph/ if any improvements should propagate
- Update cortex documentation about cerebras
- Add cerebras to monitoring/observability
- Document lessons learned

---

## Decision Summary

**Decision Points to Confirm:**

1. **Cortex Integration?** (Phase E)
   - [ ] YES - Add full cortex sync
   - [ ] NO - Keep standalone

2. **Priority?**
   - [ ] Critical phases only (A, B, D) - 4-6 hours
   - [ ] All phases except E - 6-8 hours
   - [ ] Everything including E - 8-10 hours

3. **Approach?**
   - [ ] All at once (one big commit)
   - [ ] Phase by phase (multiple commits)
   - [ ] Feature by feature (many small commits)

**Recommended:** Phase by phase with 3-4 commits total
