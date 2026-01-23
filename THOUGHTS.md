# THOUGHTS - Brain Repository Strategic Vision

**Purpose:** This file defines the brain repository's mission, goals, and success criteria. It serves as the strategic compass for all agents and humans working with this repository.

**Last Updated:** 2026-01-22

---

## Mission Statement

The brain repository is a **self-improving skills knowledge base for AI agents** (RovoDev and parallel workers). It provides curated best practices, reusable patterns, and operational templates that enable agents to solve problems autonomously with minimal human intervention.

### Core Principles

1. **Agent-First Design** - Content optimized for programmatic consumption with minimal token overhead
2. **Reference-Focused** - Knowledge repository, not executable code (except infrastructure)
3. **Self-Maintaining** - Ralph loop ensures continuous improvement and quality gates
4. **Quality-Gated** - All changes validated by verifier against acceptance criteria

---

## Project Goals

### 1. Comprehensive Skills Coverage

**Objective:** Maintain a complete, well-organized knowledge base covering all domains relevant to agent tasks.

**Key Areas:**

- Backend patterns (API design, authentication, caching, databases)
- Code quality (testing, hygiene, consistency, markdown)
- Infrastructure (deployment, security, state management)
- Language-specific patterns (Python, Shell/Bash)
- Ralph loop architecture and bootstrap patterns
- Website development (discovery, design, copywriting, QA, launch)

**Success Indicators:**

- Agents find answers in skills/ without human escalation
- Gap capture system identifies missing knowledge
- Skills promoted from backlog to active use

### 2. Self-Improvement System

**Objective:** Capture knowledge gaps and promote them into reusable skills systematically.

**Workflow:**

```text
Agent discovers gap → Log to GAP_BACKLOG.md → Review and refine → Promote to SKILL_BACKLOG.md → Create skill document
```

**Components:**

- `skills/self-improvement/GAP_CAPTURE_RULES.md` - Mandatory capture protocol
- `skills/self-improvement/GAP_BACKLOG.md` - Raw log of discovered gaps
- `skills/self-improvement/SKILL_BACKLOG.md` - Promotion queue for validated gaps
- `skills/self-improvement/SKILL_TEMPLATE.md` - Template for new skills

**Success Indicators:**

- Regular gap capture during iterations
- Promoted skills reused across multiple tasks
- Reduced repeated questions/errors

### 3. Ralph Loop Integrity

**Objective:** Maintain reliable, verifiable task execution through the Ralph worker infrastructure.

**Architecture:**

- **Manager Layer (Cortex):** Strategic planning, high-level decisions
- **Worker Layer (Ralph):** Tactical execution, atomic task completion
- **Verifier:** Automated acceptance criteria validation
- **Protected Files:** Hash-guarded critical infrastructure

**Key Components:**

- `workers/ralph/loop.sh` - Main execution loop
- `workers/ralph/verifier.sh` - Acceptance criteria validation
- `rules/AC.rules` - Quality gates and hygiene checks
- `.verify/` - Baseline hashes and waiver system

**Success Indicators:**

- 95%+ task completion rate without human intervention
- Verifier catches regressions before they merge
- Protected files remain unmodified
- Clean git history with atomic commits

### 4. Documentation Quality

**Objective:** Maintain accurate, consistent, synchronized documentation across all files.

**Standards:**

- Terminology consistency ("Brain Skills" not "KB")
- Template synchronization (workers/ ↔ templates/)
- Markdown lint compliance (MD040, MD024, MD050)
- Code fence language tags on all examples

**Validation:**

- Pre-commit hooks catch hygiene issues
- Verifier checks terminology and template sync
- Regular audits of documentation accuracy

**Success Indicators:**

- Zero markdown lint failures
- Templates match worker implementations
- Consistent terminology across all docs

---

## Success Criteria

### Agent Self-Service

- **Target:** Agents resolve 90%+ of tasks without human escalation
- **Measure:** THUNK.md completion rate vs HUMAN_REQUIRED.md escalations
- **Current:** Post-restructure, high completion rate observed

### Ralph Reliability

- **Target:** 95%+ verifier pass rate on first run
- **Measure:** `.verify/latest.txt` PASS/FAIL ratio
- **Current:** 24/24 AC checks passing (100%)

### Knowledge Growth

- **Target:** Regular gap capture and skill promotion
- **Measure:** GAP_BACKLOG.md and SKILL_BACKLOG.md activity
- **Current:** System in place, underutilized (needs improvement)

### Template Usability

- **Target:** <30 minutes to bootstrap new project using templates
- **Measure:** Time from `new-project.sh` to first commit
- **Current:** Templates exist, bootstrap functionality operational

---

## Current Phase

**Status:** Post-Restructure Maintenance Mode  
**Phase:** Iteration 1+ (ongoing maintenance and improvements)  
**Last Major Milestone:** Option B restructure completed 2026-01-21

### Recent Milestones

- ✅ **Option B Restructure:** Separated manager (Cortex) from workers (Ralph)
- ✅ **Cortex Operational:** Manager layer functioning independently
- ✅ **Verifier Passing:** All 24 AC checks passing consistently
- ✅ **Pre-commit Hooks:** Linting tools (shellcheck, markdownlint, ruff) installed
- ✅ **Template Sync:** Worker files synchronized to templates/

### Next Objectives (from IMPLEMENTATION_PLAN.md)

#### Phase 1: High Priority

- Create THOUGHTS.md, NEURONS.md, AGENTS.md at brain root
- Ensure templates/ and new-project.sh exist in root
- Complete brain repository setup

#### Phase 2: Medium Priority

- Update skills/index.md catalog
- Create docs/EDGE_CASES.md with error recovery procedures
- Documentation completeness

#### Phase 3: Low Priority

- Optimize self-improvement system usage
- Test full Ralph loop execution
- Add missing skill files

### Key Metrics

- **Progress:** ~51% complete (Phase 0 done, Phase 1+ in progress)
- **Verifier:** 24/24 checks passing (100%)
- **THUNK Entries:** 350+ tasks completed
- **Skills Count:** 30+ domain skill documents

---

## Notes & Observations

### Architectural Decisions

**Manager/Worker Separation:**

Why separate Cortex (manager) from Ralph (worker)?

- **Clarity:** Planning vs execution are distinct cognitive modes
- **Safety:** Ralph focuses on atomic tasks, Cortex on strategy
- **Scalability:** Multiple workers can reference single manager
- **Testability:** Each layer validated independently

**Option B Structure:**

Why keep skills/ and templates/ at root instead of workers/ralph/?

- **Shareability:** All workers and agents reference same knowledge base
- **Simplicity:** Brain root = knowledge, workers/ = executors
- **Portability:** Templates copied to new projects work immediately

### Lessons Learned

1. **Atomic Tasks Work:** Breaking down complex work into single-iteration tasks dramatically improves completion rate
2. **Verifier Adds Value:** Automated checks catch regressions humans would miss
3. **Template Drift Happens:** Without sync checks, templates diverge from implementations quickly
4. **Gap Capture Underused:** System exists but requires discipline to maintain

### Future Considerations

**Short-term (Next 10 iterations):**

- Complete Phase 1 high-priority tasks (THOUGHTS.md, NEURONS.md, AGENTS.md)
- Establish brain root structure clarity
- Sync remaining template/worker differences

**Medium-term (Next 30 iterations):**

- Expand skills coverage based on gap backlog
- Improve self-improvement system adoption
- Create quick reference tables for common patterns

**Long-term (Beyond 30 iterations):**

- Multi-agent collaboration patterns
- Skills versioning and deprecation
- Performance benchmarking and optimization
- Integration with external knowledge bases

---

## Differentiation from Related Files

### This File (THOUGHTS.md) vs README.md

- **THOUGHTS.md:** Strategic vision, goals, success criteria, lessons learned
- **README.md:** Human-readable onboarding, getting started guide, practical usage
- **No Overlap:** README answers "how to use", THOUGHTS answers "what we're achieving"

### This File vs cortex/THOUGHTS.md

- **Brain Root THOUGHTS.md:** Overall repository vision (stable, strategic)
- **cortex/THOUGHTS.md:** Cortex manager's planning sessions (medium frequency, tactical strategy)
- **Scope:** Root = mission/goals for entire repo, Cortex = current planning decisions

### This File vs workers/ralph/THOUGHTS.md

- **Brain Root THOUGHTS.md:** Strategic vision and goals (stable)
- **workers/ralph/THOUGHTS.md:** Ralph worker's execution notes (high frequency, completed tasks)
- **Scope:** Root = why/what we're building, Ralph = what's been done/in progress

---

## References

- [README.md](README.md) - Getting started guide
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - Current task queue
- [skills/SUMMARY.md](skills/SUMMARY.md) - Skills knowledge base entry point
- [cortex/THOUGHTS.md](cortex/THOUGHTS.md) - Cortex manager planning
- [workers/ralph/THOUGHTS.md](workers/ralph/THOUGHTS.md) - Ralph worker execution log
