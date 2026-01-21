# Cortex Thoughts - Analysis & Strategic Planning

**Purpose:** This file captures Cortex's high-level thinking, strategic analysis, and decision-making process as the Brain's manager agent.

**Audience:** Cortex (Opus), with visibility to Ralph and humans for transparency.

---

## Current Mission

**Status:** Initializing Cortex Manager Layer  
**Phase:** 0-A (Cortex creation and setup)  
**Last Updated:** 2026-01-21

### Mission Statement

Create a stable "Cortex" manager layer to handle high-level strategic planning and task delegation, while Ralph (Sonnet) focuses on tactical execution. This separation of concerns allows:

- **Cortex (Opus):** Strategic thinking, gap analysis, skills development, long-term planning
- **Ralph (Sonnet):** Fast, reliable task execution within well-defined contracts

### Current Objectives

1. **Phase 0-A:** Build out cortex/ folder with core files and operational scripts
2. **Phase 0-B:** Integrate Cortex with Ralph workflow (sync mechanism, runbooks)
3. **Phase 0-C:** Restructure repository (move ralph/ to workers/ralph/)
4. **Phase 1+:** Ongoing brain repository maintenance and self-improvement

### Success Criteria

- [ ] Cortex can run independently (`bash cortex/run.sh`)
- [ ] Ralph can sync tasks from `cortex/IMPLEMENTATION_PLAN.md`
- [ ] Clear separation: Cortex plans, Ralph builds
- [ ] Skills system captures gaps and promotes knowledge
- [ ] Both agents respect protected files and safety rules

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

### Brain Repository Health

**Strengths:**
- Strong verifier system (24/24 AC passing)
- Comprehensive skills system with 33+ documented patterns
- Ralph loop proven stable and reliable
- Good separation of concerns (PROMPT, IMPLEMENTATION_PLAN, THOUGHTS, NEURONS)

**Opportunities:**
- Add Cortex layer for strategic planning
- Improve template sync (3 warnings outstanding)
- Expand skills based on GAP_BACKLOG captures
- Better documentation of workflows and decision rationale

**Risks:**
- Transition to workers/ structure could break existing workflows
- Template drift between workers/ralph/ and templates/ralph/
- Skills documentation lagging behind actual practices
- Human approval gates could block progress

**Mitigations:**
- Phase 0-A complete before any structural changes
- Human verification required before deleting original ralph/
- Keep both paths working during transition
- Document all breaking changes and migration steps

### Next Strategic Focus

Once Phase 0-A completes:
1. Review Ralph's progress on Cortex integration
2. Plan Phase 0-B task contracts (sync mechanism)
3. Assess skills system gaps from recent work
4. Consider promoting high-value gaps to SKILL_BACKLOG

---

## Notes & Observations

*This section captures ad-hoc observations that may inform future decisions.*

- Ralph consistently completes ~1 task per BUILD iteration (as designed)
- Verifier warnings are helpful but need better categorization (high/medium/low)
- Template sync warnings indicate need for better sync automation
- Skills system working well but underutilized for gap capture
- THUNK.md logging provides good audit trail of completed work
