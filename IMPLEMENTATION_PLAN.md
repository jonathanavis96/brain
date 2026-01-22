# Implementation Plan

This implementation plan outlines the tasks to fully set up the brain repository as a self-improving knowledge base for RovoDev agents.

## Phase 0-Warn: Verifier Warnings

### ShellCheck Warnings (HIGH Priority)

- [x] **WARN.SC.1** Fix SC2016 in `setup.sh` line 70 - Use double quotes for grep pattern with $HOME variable expansion
- [x] **WARN.SC.2** Fix SC2129 in `setup.sh` line 75 - Consolidate multiple redirects to $SHELL_CONFIG using brace grouping
- [x] **WARN.SC.3** Fix SC2016 in `setup.sh` line 77 - Use double quotes for echo with $HOME variable expansion
- [x] **WARN.SC.4** Fix SC2034 in `templates/cortex/cortex.bash` line 64 - Remove unused RUNNER variable or mark with underscore
- [x] **WARN.SC.5** Fix SC2034 in `templates/cortex/cortex.bash` line 68 - Remove unused CONFIG_FLAG variable or mark with underscore
- [x] **WARN.SC.6** Fix SC2086 in `templates/cortex/one-shot.sh` lines 257, 261 - Quote CONFIG_FLAG variable
- [x] **WARN.SC.7** Fix SC2162 in `templates/ralph/current_ralph_tasks.sh` line 558 - Add -r flag to read command
- [ ] **WARN.SC.8** Fix SC2162 in `templates/ralph/loop.sh` lines 457, 498 - Add -r flag to read commands
- [ ] **WARN.SC.9** Fix SC2002 in `templates/ralph/loop.sh` line 666 - Replace useless cat with direct redirection
- [ ] **WARN.SC.10** Fix SC2086 in `templates/ralph/loop.sh` line 765 - Quote attach_flag variable
- [ ] **WARN.SC.11** Fix SC2034 in `templates/ralph/pr-batch.sh` line 103 - Remove unused week_num variable
- [ ] **WARN.SC.12** Fix SC2162 in `templates/ralph/pr-batch.sh` line 191 - Add -r flag to read command
- [ ] **WARN.SC.13** Fix SC2162 in `templates/ralph/thunk_ralph_tasks.sh` line 379 - Add -r flag to read command
- [ ] **WARN.SC.14** Fix SC2094 in `templates/ralph/verifier.sh` lines 395-396 - Avoid reading and writing same file in pipeline
- [ ] **WARN.SC.15** Fix SC2162 in `workers/ralph/current_ralph_tasks.sh` line 261 - Add -r flag to read command
- [ ] **WARN.SC.16** Fix SC2162 in `workers/ralph/current_ralph_tasks.sh` line 558 - Add -r flag to read command
- [ ] **WARN.SC.17** Fix SC2162 in `workers/ralph/loop.sh` lines 458, 499 - Add -r flag to read commands
- [ ] **WARN.SC.18** Fix SC2162 in `workers/ralph/new-project.sh` lines 250, 263, 277, 281, 290, 302 - Add -r flag to all read commands

### Markdown Lint Warnings (MEDIUM Priority)

- [ ] **WARN.MD.1** Fix MD032 in `cortex/AGENTS.md` - Add blank lines around lists (lines 6, 17, 37, 44, 92, 120, 124, 151)
- [ ] **WARN.MD.2** Fix MD022 in `cortex/AGENTS.md` - Add blank lines around headings (lines 54, 59, 65)
- [ ] **WARN.MD.3** Fix MD031 in `cortex/AGENTS.md` - Add blank lines around fenced code blocks (lines 55, 60, 62, 67, 72)
- [ ] **WARN.MD.4** Fix MD060 in `cortex/AGENTS.md` - Fix table column spacing (line 86)
- [ ] **WARN.MD.5** Fix MD032 in `cortex/CORTEX_SYSTEM_PROMPT.md` - Add blank lines around lists (lines 18, 25, 50)
- [ ] **WARN.MD.6** Fix MD060 in `cortex/CORTEX_SYSTEM_PROMPT.md` - Fix table column spacing (line 92)
- [ ] **WARN.MD.7** Fix MD022 in `cortex/DECISIONS.md` - Add blank lines around headings (lines 13, 18, 23, 131)
- [ ] **WARN.MD.8** Fix MD032 in `cortex/DECISIONS.md` - Add blank lines around lists (multiple lines)
- [ ] **WARN.MD.9** Fix MD031 in `cortex/DECISIONS.md` - Add blank lines around fenced code blocks (line 43)
- [ ] **WARN.MD.10** Fix MD038 in `cortex/DECISIONS.md` line 133 - Remove spaces inside code span

## Phase 1: High Priority - Core Documentation

- [x] Create THOUGHTS.md defining project goals and success criteria
- [x] Create NEURONS.md mapping the codebase structure and key files
- [x] Create AGENTS.md with guidance for agents working on the brain repository
- [x] Create README.md providing human-readable overview and onboarding (README.md exists and is comprehensive)
- [x] Ensure templates/ directory exists and contains necessary project templates (templates/ already exists with comprehensive content: ralph/, cortex/, backend/, python/ subdirectories)
  - [x] Create templates/ directory in root (already exists)
  - [x] Create templates/ralph/ subdirectory (already exists)
  - [x] Copy and adapt templates from ralph/templates/ to root templates/ (already complete)
- [x] Ensure new-project.sh bootstrap script exists in root
  - [x] Copy new-project.sh from ralph/ to root
  - [x] Update paths to work from root context

## Phase 2: Medium Priority - Skills & Documentation

- [x] Verify and organize scripts (loop.sh, verifier.sh) in correct locations (both exist in workers/ralph/ which is appropriate)
- [x] Update skills/SUMMARY.md and skills/index.md if new files added
  - [x] Verify skills/SUMMARY.md completeness (exists in skills/)
  - [x] Create skills/index.md if missing (not found in search)
- [ ] Create docs/EDGE_CASES.md with detailed examples and error recovery procedures
- [x] Ensure THUNK.md exists for logging completed tasks (exists in workers/ralph/ for Ralph loop logging)

## Phase 3: Low Priority - Optimization & Testing

- [ ] Review and optimize self-improvement system (GAP_BACKLOG.md, SKILL_BACKLOG.md)
- [ ] Add any missing skill files based on gaps identified
- [ ] Test full Ralph loop execution with verifier integration

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
