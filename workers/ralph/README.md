# Brain Repository

The **brain** repository is the shared consciousness for all projects - a centralized knowledge base, template system, and bootstrap infrastructure powered by Ralph Wiggum's iterative development loop.

## What This Does

1. **Knowledge Repository** - 45 React/Next.js performance rules + domain patterns + project learnings
2. **Project Bootstrap** - Create new projects with complete Ralph infrastructure in ~14 seconds
3. **Self-Evolution** - Ralph loop maintains and improves the brain itself

## Quick Start

### Bootstrap a New Project

```bash
# 1. Create project idea file
cat > NEW_PROJECT_IDEA.md << 'EOF'
# Project: My Awesome App

Location: /path/to/your-project
Purpose: A web application that does amazing things
Tech Stack: Next.js, TypeScript, PostgreSQL, Docker
Goals: MVP in 2 weeks, 1000 users in first month
EOF

# 2. Run bootstrap
bash new-project.sh NEW_PROJECT_IDEA.md

# 3. Your project is ready!
cd /path/to/your-project
bash ralph/loop.sh --iterations 10
```

**What gets created:**
- Complete Ralph infrastructure (`ralph/loop.sh`, `ralph/PROMPT.md`, etc.)
- Custom `THOUGHTS.md` (generated from your project idea)
- Custom `NEURONS.md` (codebase map inferred from tech stack)
- Custom `IMPLEMENTATION_PLAN.md` (prioritized first tasks)
- `AGENTS.md` with brain knowledge base references

**Bootstrap time:** ~14 seconds

## Repository Structure

```
brain/
├── README.md                      # This file
├── AGENTS.md                      # How to run Ralph
├── NEURONS.md                     # Brain repository map
├── THOUGHTS.md                    # Vision & Ralph's mission
├── IMPLEMENTATION_PLAN.md         # Current tasks for brain maintenance
│
├── skills/                        # Skills & Knowledge Base (33 files)
│   ├── SUMMARY.md                 # KB index
│   ├── conventions.md             # KB authoring guide
│   ├── domains/                   # Reusable patterns
│   │   ├── auth-patterns.md       # OAuth2, JWT, sessions
│   │   └── ralph-patterns.md      # Ralph loop architecture
│   └── projects/                  # Project-specific knowledge
│       └── brain-example.md       # Brain repo conventions
│
├── references/                    # External best practices (READ-ONLY)
│   └── react-best-practices/      # 45 performance rules from Vercel
│       ├── HOTLIST.md             # Top 10 most applicable
│       ├── INDEX.md               # Categorized index
│       └── rules/                 # Individual rule files
│
├── templates/                     # Project bootstrap templates
│   ├── AGENTS.project.md          # Agent guidance
│   ├── THOUGHTS.project.md        # Vision template
│   ├── NEURONS.project.md         # Codebase map template
│   └── ralph/                     # Ralph infrastructure
│       ├── loop.sh                # Ralph runner
│       ├── PROMPT.project.md      # Unified prompt
│       └── IMPLEMENTATION_PLAN.project.md
│
├── generators/                    # HIGH INTELLIGENCE content generators
│   ├── generate-thoughts.sh      # Custom vision/goals
│   ├── generate-neurons.sh        # Tech-stack-aware map
│   └── generate-implementation-plan.sh
│
├── new-project.sh                 # Bootstrap orchestration
├── loop.sh                        # Ralph loop (brain self-improvement)
└── watch_ralph_tasks.sh           # Interactive task monitor
```

## Knowledge Base Usage

### Progressive Disclosure Pattern

Always start broad, drill down only when needed:

```markdown
1. skills/SUMMARY.md                      → Skills overview
2. references/react-best-practices/HOTLIST.md → Top 10 rules (covers 80% of scenarios)
3. references/react-best-practices/INDEX.md   → Full categorized index (if needed)
4. references/react-best-practices/rules/*    → Specific rule deep-dives
```

**Don't:** Scan all 45 rules by default (token-inefficient)
**Do:** Use HOTLIST → INDEX → specific rules

### React Best Practices (45 Rules)

Complete Vercel Engineering performance guidelines:

- 🔄 **Async & Waterfall Elimination** (5 rules) - Parallel data fetching
- 📦 **Bundle Optimization** (5 rules) - Code splitting, dynamic imports
- 🖥️ **Server Performance** (4 rules) - Next.js Server Components
- 💻 **Client-Side Data** (2 rules) - SWR, event listeners
- 🔁 **Re-render Optimization** (6 rules) - memo, useMemo, useCallback
- 🎨 **Rendering & DOM** (7 rules) - Hydration, SVG, conditional rendering
- ⚡ **JavaScript Micro-Optimizations** (12 rules) - Set/Map, caching, early exit
- 🔬 **Advanced Patterns** (2 rules) - Event handler refs, useLatest
- 📋 **Meta** (2 files) - Template and sections for creating new rules

## Ralph Loop (Brain Self-Improvement)

Ralph maintains the brain repository through iterative PLAN/BUILD cycles.

### Run Ralph

```bash
cd /path/to/brain/ralph/

# Single iteration (auto-detects PLAN or BUILD mode)
bash loop.sh

# Multiple iterations (plans every 3rd iteration)
bash loop.sh --iterations 10

# Watch tasks in real-time (interactive)
bash watch_ralph_tasks.sh
```

### Task Monitor (Interactive)

Real-time display of `IMPLEMENTATION_PLAN.md` with hotkeys:

```bash
bash watch_ralph_tasks.sh
```

**Hotkeys:**
- `h` - Toggle hide/show completed tasks
- `r` - Archive completed tasks to timestamped section
- `f` - Force refresh display
- `c` - Clear completed tasks (with confirmation)
- `?` - Show help
- `q` - Quit

**Supports multiple task formats:**
- `- [ ] **Task 1:** Description` (numbered)
- `- [ ] **Description text**` (unnumbered)
- `- [ ] Description text` (plain)

### Ralph's Mission

See `THOUGHTS.md` for Ralph's 20 strategic questions about brain evolution:

1. Should Ralph have dry-run mode?
2. Should we have template versioning?
3. Should generators use RovoDev API calls?
4. What project types can't we bootstrap yet?
5. How do we prevent KB fragmentation?
6. ... and 15 more strategic questions

## Bootstrap System Features

### HIGH INTELLIGENCE Generators

Generators analyze your project idea and produce customized content:

**generate-thoughts.sh**
- Parses purpose/goals from `NEW_PROJECT_IDEA.md`
- Infers Definition of Done
- Creates project-specific success metrics
- Generates vision aligned with project type

**generate-neurons.sh**
- Parses tech stack (Next.js, Python, Go, etc.)
- Infers directory structure conventions
- Maps initial codebase layout
- Includes tech-stack-specific patterns

**generate-implementation-plan.sh**
- Parses goals and breaks into tasks
- Prioritizes by dependency order
- Creates actionable first sprint
- Adds validation criteria per task

### Supported Project Types

Current: React/Next.js focused

**Planned (see THOUGHTS.md):**
- Python (Django, FastAPI, Flask)
- Go (web services, CLI tools)
- Rust (systems programming, WASM)
- Backend-only (APIs, microservices)
- DevOps (infrastructure, automation)
- Libraries/packages (npm, PyPI)

## Path Convention (CRITICAL)

All templates use **bash-style forward slash paths**:

```markdown
# Correct ✅
../../brain/skills/SUMMARY.md
../../brain/references/react-best-practices/HOTLIST.md

# Incorrect ❌
..\\brain\\kb\\SUMMARY.md                             # Windows backslashes
/path/to/brain/skills/SUMMARY.md             # Absolute paths (breaks portability)
```

**Why:** Cross-platform compatibility (WSL, Linux, macOS, Windows Git Bash)

## Contributing to Brain

### Adding Knowledge

1. **Domain patterns** (reusable across projects):
   ```bash
   # Create new domain KB file
   cat > skills/domains/my-pattern.md << 'EOF'
   # My Pattern
   
   ## Why This Exists
   [Problem this solves]
   
   ## When to Use It
   [Specific scenarios]
   
   ## Details
   [The actual pattern]
   EOF
   
   # Update index
   echo "- [My Pattern](domains/my-pattern.md)" >> skills/SUMMARY.md
   ```

2. **Project-specific knowledge**:
   ```bash
   # Create project KB file
   cat > skills/projects/my-project.md << 'EOF'
   # My Project
   
   ## Why This Exists
   Project-specific conventions and decisions
   
   ## When to Use It
   When working on my-project codebase
   
   ## Details
   [Architectural decisions, patterns, gotchas]
   EOF
   
   # Update index
   echo "- [My Project](projects/my-project.md)" >> skills/SUMMARY.md
   ```

3. **React rules**: Don't modify `references/react-best-practices/rules/*` (read-only)

### Modifying Templates

1. Maintain bash path standard: `../../brain/`
2. Test path depth matches template location
3. Validate before completing task
4. Document new conventions in `templates/README.md`

### Running Ralph on Brain

Brain can improve itself:

```bash
cd /path/to/brain/ralph/

# Add tasks to IMPLEMENTATION_PLAN.md
echo "- [ ] **My improvement task**" >> IMPLEMENTATION_PLAN.md

# Run Ralph
bash loop.sh --iterations 5

# Watch progress
bash watch_ralph_tasks.sh
```

**Ralph's Design Philosophy:**

- **PROMPT.md** - Single prompt with conditional logic (plan + build modes)
- **IMPLEMENTATION_PLAN.md** - The persistent TODO list (actionable tasks only)
- **VALIDATION_CRITERIA.md** - Quality gates and acceptance criteria (reference document)
- **NEURONS.md** - Codebase map (read via subagent when needed, not first-load)
- **One Iteration = One Unit** - Implement + validate + update plan + STOP
- **Don't Assume Missing** - Always search codebase before creating
- **One Task Per Iteration** - BUILD mode: implement ONE task, STOP (PLAN commits)
- **PLAN Phase Commits** - All commits happen during planning phase with comprehensive messages

**Safety Features:**

Ralph includes three safety mechanisms for brain repository work:

1. **Dry-run mode (`--dry-run`):**
   - Preview what Ralph would change without committing
   - Ralph analyzes the task and shows file diffs
   - Useful for testing before production runs
   - Appends special instructions to PROMPT.md

2. **Rollback capability (`--rollback [N]`):**
   - Undo last N Ralph commits (default: 1)
   - Shows commits to be reverted
   - Requires explicit "yes" confirmation
   - Uses `git reset --hard HEAD~N`

3. **Error recovery (`--resume`):**
   - Resume from incomplete iteration
   - Detects uncommitted changes
   - Prompts for confirmation before continuing
   - Useful after crashes or interruptions

**Task Monitor Features:**

The `watch_ralph_tasks.sh` script provides real-time task tracking with interactive controls:

- **Hotkeys:**
  - `h` - Toggle hide/show completed tasks
  - `r` - Archive completed tasks to timestamped section
  - `f` - Force refresh display
  - `c` - Clear completed tasks (with confirmation)
  - `?` - Show help
  - `q` - Quit

- **Supports multiple task formats:**
  - `- [ ] **Task 1:** Description` (numbered)
  - `- [ ] **Description text**` (unnumbered)
  - `- [ ] Description text` (plain)

## Validation

Ensure brain integrity:

```bash
# File structure
ls -la skills/ templates/ references/

# KB file count (should be 7)
find skills/ -name "*.md" | wc -l

# React rules count (should be 45)
find references/react-best-practices/rules/ -name "*.md" | wc -l

# Script syntax
bash -n loop.sh
bash -n watch_ralph_tasks.sh
bash -n new-project.sh

# KB integrity (all files have required headers)
grep -r "## Why This Exists" skills/domains/ skills/projects/
grep -r "## When to Use It" skills/domains/ skills/projects/
```

## Key Principles

1. **Search Before Creating** - Always grep for existing functionality
2. **Progressive Disclosure** - Start with HOTLIST/SUMMARY, drill down only when needed
3. **Token Efficiency** - Keep context files lean
4. **Bash Paths Standard** - All templates use `../../brain/` (not Windows paths)
5. **One Task Per Iteration** - BUILD mode: ONE task, validate, STOP (no commit)
6. **Documentation Reflects Reality** - Fix immediately if docs and code disagree
7. **Templates Are Sacred** - Test thoroughly before changing (many projects depend on them)
8. **Knowledge Grows Organically** - Add to KB when patterns emerge in 2+ projects
9. **Validation Is Mandatory** - All changes must pass validation before stopping
10. **Ralph Maintains Ralph** - Brain loop improves itself continuously

## Success Metrics

The brain repository is successful when:

1. **Bootstrap is instant** - New projects ready in <30 seconds
2. **Generated content is excellent** - Minimal editing needed
3. **KB is consulted actively** - Projects reference before implementing
4. **Knowledge grows naturally** - New patterns added weekly
5. **Templates evolve continuously** - Improvements benefit all future projects
6. **Ralph maintains itself** - Brain loop adds features autonomously
7. **Onboarding is trivial** - New developers understand in <10 minutes

## See Also

- **AGENTS.md** - How to run Ralph loop
- **NEURONS.md** - Brain repository map (read this via subagent)
- **THOUGHTS.md** - Vision, goals, and Ralph's 20 strategic questions
- **templates/README.md** - Template documentation and path conventions
- **skills/SUMMARY.md** - Skills & knowledge base index
- **skills/conventions.md** - Skills authoring guidelines

## Current Status (2026-01-16)

- ✅ Bootstrap system functional (~14 second project creation)
- ✅ 45 React best practices rules (complete Vercel Engineering set)
- ✅ 3 HIGH INTELLIGENCE generators working
- ✅ 33 KB files with proper structure
- ✅ Interactive task monitor with hotkeys
- ✅ Templates use bash paths consistently
- ✅ Ralph loop maintains brain repository
- 📝 10 tasks in IMPLEMENTATION_PLAN.md for continuous improvement

---

**Get Started:** Run `bash new-project.sh NEW_PROJECT_IDEA.md` to bootstrap your first project!
