# Implementation Plan

This implementation plan outlines the tasks to fully set up the brain repository as a self-improving knowledge base for RovoDev agents.

**Status:** PLAN mode - Updated 2026-01-22  
**Branch:** `brain-work`  
**Progress:** Overview below, detailed breakdown in workers/ralph/IMPLEMENTATION_PLAN.md

## Overview

The brain repository has **two implementation plans**:

1. **This file (root IMPLEMENTATION_PLAN.md)** - High-level overview and strategic tasks
2. **workers/ralph/IMPLEMENTATION_PLAN.md** - Detailed tactical execution plan for Ralph (923 lines, 117 tasks)

**Current Status Summary:**

- ✅ **Phase 0-Sync** - Infrastructure setup COMPLETE
- ⚠️ **Phase 0-Warn** - Verifier warnings resolved, 3 new shellcheck warnings added (30/33 complete, 6 awaiting waiver)
- ✅ **Phase 0-A/B** - Cortex manager pack COMPLETE (31/31 tasks)
- ✅ **Phase 0-Quick** - Quick wins COMPLETE (8/8 tasks)
- 📋 **Phase 1-8** - Shell cleanup, documentation, optimization (0/49 complete)
- 🚨 **NEW: Pre-commit scan** - Discovered 18 shellcheck violations in workers/ralph/ scripts (SC2162, SC2155, SC2129, SC2086)

See **workers/ralph/IMPLEMENTATION_PLAN.md** for the complete tactical breakdown (138 tasks total, +18 from pre-commit).

---

## Phase 0-Warn: Verifier Warnings (Root Level Files Only)

### ShellCheck Warnings (MEDIUM Priority)

- [x] **WARN.SC.1** Fix SC2016 in `setup.sh` line 70 - Use double quotes for grep pattern with $HOME variable expansion
- [x] **WARN.SC.2** Fix SC2129 in `setup.sh` line 75 - Consolidate multiple redirects to $SHELL_CONFIG using brace grouping
- [x] **WARN.SC.3** Fix SC2016 in `setup.sh` line 77 - Use double quotes for echo with $HOME variable expansion
- [x] **WARN.SC.4** Fix SC2034 in `templates/cortex/cortex.bash` line 64 - Remove unused RUNNER variable or mark with underscore
- [x] **WARN.SC.5** Fix SC2034 in `templates/cortex/cortex.bash` line 68 - Remove unused CONFIG_FLAG variable or mark with underscore
- [x] **WARN.SC.6** Fix SC2086 in `templates/cortex/one-shot.sh` lines 257, 261 - Quote CONFIG_FLAG variable
- [x] **WARN.SC.7** Fix SC2162 in `templates/ralph/current_ralph_tasks.sh` line 558 - Add -r flag to read command
- [x] **WARN.SC.8** Fix SC2162 in `templates/ralph/loop.sh` lines 457, 498 - Add -r flag to read commands
- [x] **WARN.SC.9** Fix SC2002 in `templates/ralph/loop.sh` line 666 - Replace useless cat with direct redirection
- [x] **WARN.SC.10** Fix SC2086 in `templates/ralph/loop.sh` line 765 - Quote attach_flag variable
- [x] **WARN.SC.11** Fix SC2034 in `templates/ralph/pr-batch.sh` line 103 - Remove unused week_num variable
- [x] **WARN.SC.12** Fix SC2162 in `templates/ralph/pr-batch.sh` line 191 - Add -r flag to read command
- [x] **WARN.SC.13** Fix SC2162 in `templates/ralph/thunk_ralph_tasks.sh` line 379 - Add -r flag to read command
- [x] **WARN.SC.14** Fix SC2094 in `templates/ralph/verifier.sh` lines 395-396 - Avoid reading and writing same file in pipeline

### Markdown Lint Warnings (LOW Priority)

**Note:** ~100+ markdown lint violations discovered across cortex/ files. These are formatting issues (blank lines, table spacing) that don't affect functionality. Will batch-fix by file in BUILD mode.

- [x] **WARN.MD.1-4** Fix all MD violations in `cortex/AGENTS.md` - MD032 (blank lines around lists), MD022 (blank lines around headings), MD031 (blank lines around fences), MD060 (table spacing)
- [x] **WARN.MD.5-6** Fix all MD violations in `cortex/CORTEX_SYSTEM_PROMPT.md` - MD032 (blank lines around lists), MD060 (table spacing)
- [ ] **WARN.MD.7-10** Fix all MD violations in `cortex/DECISIONS.md` - MD022 (blank lines around headings), MD032 (blank lines around lists), MD031 (blank lines around fences), MD038 (spaces in code spans)
- [ ] **WARN.MD.11** Fix all MD violations in `cortex/IMPLEMENTATION_PLAN.md` - MD032, MD031, MD060, MD009 (multiple formatting issues)

---

## Phase 1: High Priority - Core Documentation

- [x] Create THOUGHTS.md defining project goals and success criteria
- [x] Create NEURONS.md mapping the codebase structure and key files
- [x] Create AGENTS.md with guidance for agents working on the brain repository
- [x] Create README.md providing human-readable overview and onboarding
- [x] Ensure templates/ directory exists with comprehensive project templates
- [x] Ensure new-project.sh bootstrap script exists in root
- [x] Verify scripts (loop.sh, verifier.sh) in correct locations (workers/ralph/)
- [x] Update skills/SUMMARY.md and skills/index.md

---

## Phase 2: Medium Priority - Skills & Documentation

- [ ] **DOCS.1** Create docs/EDGE_CASES.md with detailed examples and error recovery procedures

---

## Phase 3: Low Priority - Optimization & Testing

- [ ] **OPT.1** Review and optimize self-improvement system (GAP_BACKLOG.md, SKILL_BACKLOG.md)
- [ ] **OPT.2** Add any missing skill files based on gaps identified
- [ ] **TEST.1** Test full Ralph loop execution with verifier integration

---

## Detailed Execution Plan

**All tactical BUILD tasks are tracked in workers/ralph/IMPLEMENTATION_PLAN.md** which contains:

- **Phase 0-Warn** - workers/ralph/ specific verifier warnings (2 shellcheck issues remaining)
- **Phase 0-Quick** - Quick wins (4 HIGH priority tasks: verify-brain.sh paths, markdown fixes)
- **Phase 1** - CodeRabbit outside-diff items (5 tasks)
- **Phase 2** - Shell script cleanup (14 tasks across 3 scripts)
- **Phase 3** - Quick reference tables (5 tasks)
- **Phase 4** - Template maintenance (2 tasks marked obsolete)
- **Phase 5** - Design decisions (6 tasks)
- **Phase 6** - PR #4 D-items review (22 tasks)
- **Phase 7** - Maintenance items (1 task)
- **Phase 8** - Pre-commit linting cleanup (17 tasks)

**Total:** 117 tasks tracked in workers/ralph/IMPLEMENTATION_PLAN.md

---

## Success Criteria

- [ ] All verifier warnings resolved or waivers approved
- [ ] All HIGH priority tasks complete
- [ ] Verifier passes with 0 failures
- [ ] Pre-commit hooks pass on all files
- [ ] Documentation is accurate and synchronized
- [ ] Shell scripts pass shellcheck with no warnings
- [ ] Markdown files pass markdownlint

---

## Notes

This root IMPLEMENTATION_PLAN.md provides strategic oversight. Ralph executes tasks from workers/ralph/IMPLEMENTATION_PLAN.md during BUILD iterations.

## Phase 4: Reference Notes

### Task 1: Create THOUGHTS.md

**DRY-RUN ANALYSIS (2026-01-21 20:15:00):**

**File to Create:** `/home/grafe/code/brain/THOUGHTS.md` (new file, ~350 lines)

**Purpose:** Top-level strategic vision document for the brain repository, distinct from:

- `cortex/THOUGHTS.md` - Cortex manager's strategic decisions and planning sessions
- `workers/ralph/THOUGHTS.md` - Ralph worker's tactical execution notes

**Content Structure:**

1. **Mission Statement** - What the brain repository is and why it exists
   - Self-improving skills knowledge base for AI agents
   - Core principles: agent-first, reference-focused, self-maintaining, quality-gated
2. **Project Goals** (4 main areas)
   - Comprehensive skills coverage (domain completeness)
   - Self-improvement system (gap capture and promotion)
   - Ralph loop integrity (verifier, protected files, manager/worker architecture)
   - Documentation quality (consistency, synchronization, accuracy)
3. **Success Criteria** - Measurable outcomes
   - Agent self-service (find answers without human intervention)
   - Ralph reliability (95%+ task completion, verifier effectiveness)
   - Knowledge growth (gap capture, skill promotion, multi-agent reuse)
   - Template usability (<30 min project setup time)
4. **Current Phase** - Where we are now (post-restructure maintenance mode)
   - Recent milestones (Option B restructure, Cortex operational, verifier passing)
   - Next objectives (Phase 0-Quick, shell cleanup, quick reference tables)
   - Key metrics (51% progress, 24/24 verifier checks passing)
5. **Notes & Observations** - Architectural decisions and lessons learned
   - Manager/worker separation rationale
   - Option B structure explanation
   - Lessons: atomic tasks, verifier value, template drift, gap capture underuse
6. **Future Considerations** - Short/medium/long-term roadmap

**Key Design Decisions:**

| Aspect | Brain Root THOUGHTS.md | Cortex THOUGHTS.md | Ralph THOUGHTS.md |
|--------|------------------------|-------------------|-------------------|
| **Scope** | Overall repository vision | Strategic planning | Tactical execution |
| **Audience** | All agents + humans | Cortex primarily | Ralph primarily |
| **Focus** | Mission, goals, success criteria | Decisions, analysis, planning sessions | Current work, completed tasks |
| **Update Frequency** | Low (stable vision) | Medium (planning sessions) | High (per BUILD iteration) |
| **Content** | What/why (purpose) | How/when (strategy) | What/done (tactics) |

**Differentiation from README.md:**

- README.md = Human-readable onboarding, getting started guide
- THOUGHTS.md = Strategic vision, goals, metrics, lessons learned
- No duplication - README focuses on "how to use", THOUGHTS on "what we're achieving"

**Implementation Approach:**

```bash
# Would create file with:
cat > THOUGHTS.md << 'EOF'
# THOUGHTS - Brain Repository Strategic Vision

**Purpose:** This file defines the brain repository's mission, goals, and success criteria...
[... full content ~350 lines ...]
EOF

# Would validate:
grep -n '^```' THOUGHTS.md | grep -v '^[0-9]*:```\(markdown\|bash\|text\|json\|sh\)$'  # Check fence tags
awk '/^#/ {print}' THOUGHTS.md | sort | uniq -d  # Check duplicate headings
rg -n "knowledge base|KB|brain repo" THOUGHTS.md  # Check terminology

# Would commit:
git add THOUGHTS.md
git commit -m "docs(brain): create THOUGHTS.md strategic vision document

- Define mission: self-improving skills knowledge base for agents
- Document 4 project goals: skills coverage, self-improvement, Ralph loop, docs quality
- Establish success criteria: agent self-service, Ralph reliability, knowledge growth
- Track current phase: post-restructure maintenance (51% progress)
- Record architectural decisions and lessons learned
- Outline short/medium/long-term roadmap

Co-authored-by: ralph-brain <ralph-brain@users.noreply.github.com>
Brain-Repo: jonathanavis96/brain"
```

**Validation Commands:**

```bash
# Ensure no markdown lint violations
markdownlint THOUGHTS.md 2>&1 | grep -E "MD040|MD024"

# Check for stale terminology (should return nothing)
rg -i "kb|knowledge base(?! for)" THOUGHTS.md

# Verify git tracking
git status THOUGHTS.md

# Validate structure
grep -E "^## " THOUGHTS.md  # Should show all major sections
```

**Dependencies:** None - standalone file

**Estimated Time:** 5-10 minutes (file creation, validation, commit)

**Risk Assessment:**

- **Very Low Risk** - Additive only, no breaking changes
- **No conflicts** - File doesn't exist yet
- **No dependencies** - References existing structure but doesn't modify it
- **Potential staleness** - Will need periodic updates as project evolves (addressed in "Update Frequency" design)

**Post-Creation Verification:**

1. File exists at `/home/grafe/code/brain/THOUGHTS.md`
2. All code fences have language tags (backtick-markdown, backtick-bash, backtick-text)
3. No duplicate headings at same level
4. Terminology is consistent (uses "skills" not "KB")
5. Git shows clean commit with proper message format
6. File readable by both agents and humans

**Next Task After Completion:** Task 2 - Create NEURONS.md (codebase map)

### Task 2: Create NEURONS.md

- NEURONS.md should map the brain repository structure, including ralph/ subdirectory
- Include quick reference lookup table, file counts, validation commands
- Follow structure similar to ralph/NEURONS.md but focused on brain root
- File location: /path/to/brain/NEURONS.md (new file)

### Task 3: Create AGENTS.md

- AGENTS.md should provide operational guidance for maintaining the brain repository
- Include how to run Ralph on brain, task monitors, troubleshooting
- File location: /path/to/brain/AGENTS.md (new file)

### Task 4: Ensure templates/ directory

- Create templates/ in brain root for project bootstrapping
- Copy and adapt templates from ralph/templates/
- Ensure all paths use ../brain/ convention for portability
- Include ralph/ subdirectory with core Ralph files

### Task 5: Ensure new-project.sh in root

- Copy new-project.sh from workers/ralph/ to brain root
- Update any hardcoded paths to work from brain root context
- Test bootstrap functionality

### General Notes

- All tasks are designed to be atomic and completable in one BUILD iteration
- Follow brain-specific conventions from skills/projects/brain-example.md
- Use local paths for brain repository references
- Maintain protected file integrity (rules/AC.rules, verifier.sh, etc.)
- Brain repository structure: root contains README.md, templates/, new-project.sh; workers/ralph/ contains Ralph infrastructure
