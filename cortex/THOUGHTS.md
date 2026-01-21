# Cortex Thoughts - Analysis & Strategic Planning

**Purpose:** This file captures Cortex's high-level thinking, strategic analysis, and decision-making process as the Brain's manager agent.

**Audience:** Cortex (Opus), with visibility to Ralph and humans for transparency.

---

## Current Mission

**Status:** Post-Restructure Maintenance Mode  
**Phase:** 1+ (Ongoing maintenance and improvements)  
**Last Updated:** 2026-01-21 19:30

### Mission Statement

The Cortex manager layer is operational and the repository restructure (Option B) is complete. Ralph now runs from `workers/ralph/` with shared resources at root level. Focus shifts to:

- **Code quality:** Shell script cleanup, template sync
- **Documentation:** Quick reference tables, skills maintenance
- **Stability:** Verifier improvements, design decisions implementation

### Completed Milestones

- ✅ **Phase 0-A:** Cortex manager pack created (cortex/ folder with all core files)
- ✅ **Phase 0-B:** Repository restructured to Option B (workers/ralph/ with shared root resources)
- ✅ **Phase 0-C:** Human verified new structure works correctly
- ✅ **Verifier:** All 24 AC checks passing (only WARN items remain)

### Current Objectives

1. **Phase 1:** Quick fixes & maintenance (templates, broken links)
2. **Phase 2:** Shell script cleanup (shellcheck, dead code removal)
3. **Phase 3:** Quick reference tables (documentation convention)
4. **Phase 4-7:** Lower priority improvements

### Success Criteria

- [x] Cortex can run independently (`bash cortex/run.sh`)
- [x] Ralph can sync tasks from `cortex/IMPLEMENTATION_PLAN.md`
- [x] Clear separation: Cortex plans, Ralph builds
- [ ] Skills system captures gaps and promotes knowledge (ongoing)
- [x] Both agents respect protected files and safety rules

---

## Decision Log

### 2026-01-21: Cortex THOUGHTS.md Structure

**Decision:** Create cortex/THOUGHTS.md following similar structure to ralph/THOUGHTS.md, but focused on strategic/managerial concerns rather than tactical execution.

**Rationale:**
- Provides Cortex with persistent memory across invocations
- Maintains consistency with Ralph's existing patterns
- Separates strategic thinking (Cortex) from tactical execution (Ralph)
- Allows decision history to accumulate over time

**Implementation:**
- Header explaining purpose and audience
- "Current Mission" section for high-level goals and objectives
- "Decision Log" section for strategic decisions and rationale
- "Strategic Analysis" section for deeper thinking (added as needed)

**Alternatives Considered:**
- Reuse single THOUGHTS.md for both agents: Rejected due to context mixing
- Use cortex/DECISIONS.md instead: Rejected; DECISIONS.md is for stable architectural decisions, not mission progress

**Impact:** Low - additive only, no breaking changes to Ralph

---

### 2026-01-20: Cortex Manager Pack Approved

**Decision:** Human (Jono) approved Phase 0-A (Cortex Manager Pack creation) on 2026-01-20.

**Context:** Copied from ralph/THOUGHTS.md for reference. This decision initiated the Cortex creation workflow.

**Key Points:**
- Create cortex/ folder alongside existing ralph/ (no breaking changes)
- Build out Cortex completely before restructuring
- Human verification gate before deleting original ralph/ folder
- Maintain backward compatibility throughout transition

---

## Strategic Analysis

### Brain Repository Health (2026-01-21 19:30:00)

**Strengths:**
- ✅ Strong verifier system (24/24 AC passing, only manual review WARNs)
- ✅ Successful repository restructure (Option B implemented)
- ✅ Cortex manager layer fully operational
- ✅ Clear separation: Cortex plans, Ralph executes
- ✅ 39 tasks completed, 37 pending (51% progress)

**Current State:**
- Ralph's IMPLEMENTATION_PLAN.md has well-organized phases (0-7)
- Phase 0-A and 0-B fully complete (restructure done)
- Template sync warnings exist (WARN.T1, WARN.T2) - templates lag behind implementation
- GAP_BACKLOG has 3 items, 1 at P1 priority (bash/shell validation patterns)

**Opportunities:**
- Phase 1 quick fixes are low-effort, high-value (template copy, link fixes)
- Shell script cleanup (Phase 2) improves code quality but lower priority
- Quick reference tables (Phase 3) improve agent UX
- Design decisions (Phase 5) add robustness but require protected file changes

**Risks:**
- Template drift increasing (monitor scripts differ from templates)
- Phase 6 D-items may be obsolete after IMPLEMENTATION_PLAN.md rewrite
- Some Phase 5 items require modifying protected files (human approval needed)

### Next Strategic Focus

**Immediate (this session):**
1. ✅ Update THOUGHTS.md with current state analysis
2. Create clear task contracts for Ralph's next iterations
3. Prioritize Phase 1 quick wins (fastest path to completion)

**Short-term:**
1. Complete Phase 1 quick fixes (template copy, link fixes)
2. Address Phase 2 shell cleanup (code quality)
3. Sync templates after shell scripts are clean

**Medium-term:**
1. Review Phase 6 D-items for obsolete entries
2. Promote P1 gap (bash validation patterns) if recurring
3. Consider Phase 5 design decisions (requires human approval)

---

## Notes & Observations

*This section captures ad-hoc observations that may inform future decisions.*

- Ralph consistently completes ~1 task per BUILD iteration (as designed)
- Verifier warnings are helpful but need better categorization (high/medium/low)
- Template sync warnings indicate need for better sync automation
- Skills system working well but underutilized for gap capture
- THUNK.md logging provides good audit trail of completed work

### Gap Backlog Review (2026-01-21)

Reviewed 3 items in GAP_BACKLOG.md:

| Gap | Priority | Promotion Decision |
|-----|----------|-------------------|
| Bash Terminal Control (tput) | P2 | Keep as reference - specialized, not recurring |
| Bash Associative Arrays | P2 | Keep as reference - general caching patterns already exist |
| **Bash/Shell Validation Patterns** | P1 | **Watch list** - promote if needed again |

The P1 item (Bash/Shell validation patterns) is the strongest candidate for promotion:
- **Clear:** Yes - specific validation commands documented
- **Specific:** Yes - bash -n, shellcheck, jq, perm checks
- **Recurring:** Not yet proven - only triggered once (rovo-account-manager bootstrap)
- **LLM-executable:** Yes - clear triggers + steps

**Action:** Keep as P1 in GAP_BACKLOG. If Ralph or other agents need bash project validation again, promote immediately.

---

## Planning Session Log

### 2026-01-21 19:57:00 - Phase 1 Task Refinement

**Context:** Second Cortex planning session - refining Phase 1 tasks based on actual repository state.

**Key Discovery:** The maintenance script `verify-brain.sh` has a **path bug** - it runs from `workers/ralph/.maintenance/` and uses relative paths that don't reach `brain/skills/` at root. This caused false "not found" errors for `skills/index.md` and `skills/SUMMARY.md`.

**Actions Taken:**
1. Investigated actual state: `skills/` exists at root with index.md and SUMMARY.md
2. Found `SKILL_TEMPLATE.md` source exists (2751 bytes), target missing
3. Found single "Brain KB" occurrence in `templates/NEURONS.project.md`
4. Confirmed broken links and Quick Reference tables are FALSE POSITIVES (path bug)
5. Updated `cortex/IMPLEMENTATION_PLAN.md` with refined Task Contracts
6. Synced `workers/ralph/IMPLEMENTATION_PLAN.md` Phase 0-Quick section
7. Added new task 0.Q.5 to fix maintenance script paths
8. Marked 0.Q.6 and 0.Q.7 as COMPLETE (false positives from path bug)

**Refined Phase 1 Tasks (in order):**
1. **0.Q.3** Copy SKILL_TEMPLATE.md - atomic file copy, <2 min
2. **0.Q.4** Fix "Brain KB" terminology - single line edit, <2 min  
3. **0.Q.5** Fix maintenance script paths - 5-10 min, path resolution

**Recommendations for Ralph:**
- Execute tasks 0.Q.3, 0.Q.4, 0.Q.5 in order
- After 0.Q.5, verify `bash workers/ralph/.maintenance/verify-brain.sh` reports 0 issues
- Then proceed to Phase 2 shell script cleanup

**Next Cortex Session:**
- Verify Phase 1 completion
- Review Phase 2 shell cleanup progress
- Re-evaluate Phase 6 D-items for obsolete entries

---

### 2026-01-21 19:30:00 - Post-Restructure Planning

**Context:** First Cortex planning session after successful Option B restructure.

**Actions Taken:**
1. Updated THOUGHTS.md mission status (Phase 0 → Phase 1+)
2. Updated strategic analysis with current repository health
3. Created detailed task contracts for Phase 1 quick fixes (1.2, 1.3, 1.4)
4. Documented phase prioritization and dependencies
5. Reviewed GAP_BACKLOG - no promotions needed yet

**Recommendations for Ralph:**
1. Start with Task 1.2 (copy SKILL_TEMPLATE) - simplest, <2 min
2. Then Task 1.3 (fix broken links) - requires investigation
3. Then Task 1.4 (KB→Skills terminology) - simple find/replace
4. After Phase 1: proceed to Phase 2 shell cleanup

**Next Cortex Session:**
- Review Ralph's Phase 1 completion
- Assess Phase 2 progress
- Re-evaluate Phase 6 D-items for obsolete entries
