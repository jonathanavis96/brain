# Implementation Plan

This implementation plan outlines the tasks to fully set up the brain repository as a self-improving knowledge base for RovoDev agents.

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
