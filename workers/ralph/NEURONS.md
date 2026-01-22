# NEURONS.md - Brain Repository Map

**Read via subagent** - This is the codebase map for Ralph. Not loaded in first context.

## Purpose
This is the **brain map** that Ralph and all agents read on-demand when needed. It maps the entire brain repository structure, tells you where everything lives, and provides quick lookup for common tasks.

## Navigation Rules (Read This First)
**Deterministic Context Loading Order:**
1. `PROMPT.md` (loaded first by loop.sh - contains conditional logic for plan/build modes)
2. `AGENTS.md` (operational guide - how to run Ralph)
3. `NEURONS.md` (this file - read via subagent when needed, NOT in first-load context)
4. `IMPLEMENTATION_PLAN.md` (TODO list - read in BUILD mode)
5. `THOUGHTS.md` (project goals and success criteria - read as needed)
6. KB files and references as needed

**Progressive Disclosure:** Start broad, drill down only when needed. Don't read everything at once.

---

## Repository Layout

```text
brain/ (repository root)
├── README.md                    # Human-readable overview
├── IMPLEMENTATION_PLAN.md       # High-level task list (managed by Cortex)
│
├── cortex/                      # Manager layer (Opus 4.5)
│   ├── CORTEX_SYSTEM_PROMPT.md  # Cortex identity and rules
│   ├── REPO_MAP.md              # Human-friendly repo navigation
│   ├── DECISIONS.md             # Stability anchor (naming, style, architecture)
│   ├── RUNBOOK.md               # Operations guide (how to start, troubleshoot)
│   ├── IMPLEMENTATION_PLAN.md   # Task contracts for workers
│   ├── THOUGHTS.md              # Cortex thinking space (mission, decisions)
│   ├── run.sh                   # Main entry point (concatenates context)
│   └── snapshot.sh              # Generates current state summary
│
├── workers/                     # Execution layer
│   └── ralph/                   # Ralph worker (Sonnet 4.5)
│       ├── AGENTS.md            # Ralph operational guide
│       ├── NEURONS.md           # This file (Ralph's codebase map)
│       ├── PROMPT.md            # Ralph's instructions (protected)
│       ├── IMPLEMENTATION_PLAN.md  # Ralph's local task list
│       ├── THOUGHTS.md          # Ralph's working context
│       ├── THUNK.md             # Completed task log
│       ├── VALIDATION_CRITERIA.md  # Quality gates
│       ├── loop.sh              # Main execution loop (protected)
│       ├── verifier.sh          # Acceptance criteria validator (protected)
│       ├── current_ralph_tasks.sh  # Real-time task monitor
│       ├── thunk_ralph_tasks.sh    # Completed task viewer
│       ├── .maintenance/        # Repository health checks
│       ├── .verify/             # Worker-level verification (links to root)
│       └── logs/                # Execution transcripts
│
├── skills/                      # Knowledge base (shared, 30+ files)
│   ├── SUMMARY.md               # Start here - overview and error reference
│   ├── index.md                 # Complete skills catalog
│   ├── conventions.md           # Skills authoring guidelines
│   ├── domains/                 # Technical domain knowledge
│   ├── projects/                # Project-specific conventions
│   └── self-improvement/        # Gap capture and skill promotion
│
├── templates/                   # Project scaffolding (shared)
│   ├── AGENTS.project.md        # Operational guide template
│   ├── NEURONS.project.md       # Repository map template
│   ├── THOUGHTS.project.md      # Project goals template
│   ├── ralph/                   # Ralph-specific templates
│   └── ...                      # Backend, Python templates
│
├── rules/                       # Acceptance criteria (shared)
│   ├── AC.rules                 # Core acceptance criteria (protected)
│   ├── AC-hygiene-additions.rules  # Extended hygiene checks
│   └── MANUAL_APPROVALS.rules   # Human-gated changes
│
├── docs/                        # Project documentation (shared)
│   ├── BOOTSTRAPPING.md         # New project setup guide
│   ├── CHANGES.md               # Release notes and migration guide
│   ├── EDGE_CASES.md            # Detailed examples, error recovery
│   └── ...                      # History, test scenarios
│
└── .verify/                     # Validation infrastructure (shared)
    ├── latest.txt               # Most recent verifier output
    ├── *.sha256                 # Hash guards for protected files
    ├── waivers/                 # Approved waivers (TOTP-protected)
    └── waiver_requests/         # Pending waiver requests
```

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `BRAIN_ROOT` | `../..` (from workers/ralph/) | Path to brain repository root |
| `BRAIN_REPO` | `jonathanavis96/brain` | GitHub repo for commit trailers |
| `RALPH_PROJECT_ROOT` | (auto) | Set by thin wrapper for project delegation |

**Note:** All paths in this file are relative to the brain repository root for portability.

---

## Quick Reference Lookup

### "I need to..."

| Task | Check Here |
|------|------------|
| **Understand what's in the brain** | `NEURONS.md` (this file) or `cortex/REPO_MAP.md` |
| **Run Ralph loop** | `AGENTS.md` → `bash loop.sh` |
| **Run Cortex manager** | `cortex/RUNBOOK.md` → `bash cortex/run.sh` |
| **Find TODO list** | `IMPLEMENTATION_PLAN.md` (Ralph) or `cortex/IMPLEMENTATION_PLAN.md` (Cortex) |
| **See commit examples & error recovery** | `docs/EDGE_CASES.md` |
| **See recent changes** | `docs/CHANGES.md` |
| **See KB structure** | `skills/SUMMARY.md` |
| **Check React performance patterns** | `references/react-best-practices/HOTLIST.md` → `INDEX.md` |
| **Create new KB file** | `skills/conventions.md` (authoring guide) |
| **Bootstrap new project** | `templates/README.md` (instructions) |
| **Understand Ralph patterns** | `skills/domains/ralph/ralph-patterns.md` |
| **Find auth patterns** | `skills/domains/backend/auth-patterns.md` |
| **Learn brain conventions** | `skills/projects/brain-example.md` |
| **Check Cortex architecture decisions** | `cortex/DECISIONS.md` |
| **Understand manager/worker workflow** | `AGENTS.md` → "Manager/Worker Architecture" section |
| **Check project goals** | `THOUGHTS.md` (Ralph) or `cortex/THOUGHTS.md` (Cortex) |

### "Where do I put..."

| Content Type | Location | Modifiable? |
|--------------|----------|-------------|
| **Reusable domain patterns** | `skills/domains/<domain>.md` | ✅ Yes |
| **Project-specific knowledge** | `skills/projects/<project>.md` | ✅ Yes |
| **Ralph operational docs** | `AGENTS.md` | ✅ Yes (Ralph only) |
| **Brain structure map** | `NEURONS.md` or `cortex/REPO_MAP.md` | ✅ Yes |
| **Cortex strategic planning** | `cortex/IMPLEMENTATION_PLAN.md`, `cortex/THOUGHTS.md` | ✅ Yes (Cortex only) |
| **Cortex architecture decisions** | `cortex/DECISIONS.md` | ✅ Yes (Cortex only) |
| **React performance rules** | `references/react-best-practices/rules/` | ❌ **READ-ONLY** |
| **Project templates** | `templates/` | ✅ Yes |
| **TODO backlog** | `IMPLEMENTATION_PLAN.md` | ✅ Yes (Ralph only) |
| **Execution logs** | `logs/` | ✅ Auto-generated |

---

## Knowledge Base Structure

### skills/ (33 total files)

**Purpose:** Curated knowledge for agents - domain patterns, project conventions, authoring guidelines.

**Navigation:**
1. Start: `skills/SUMMARY.md` - Overview of all KB content
2. Index: `skills/index.md` - Complete catalog of all skills
3. Authoring: `skills/conventions.md` - How to create/update KB files
4. Domains: `skills/domains/` - Reusable patterns across projects (22 files including shell/)
5. Projects: `skills/projects/` - Project-specific knowledge (2 files)
6. Self-Improvement: `skills/self-improvement/` - Gap capture system (6 files)

**Key Files:**
- `skills/SUMMARY.md` - KB index, links to all domains and projects
- `skills/conventions.md` - Required structure (Why/When/Details), naming, validation
- `skills/domains/backend/auth-patterns.md` - Authentication patterns (example)
- `skills/domains/ralph/ralph-patterns.md` - Ralph loop architecture details
- `skills/projects/brain-example.md` - Brain repo conventions (example)

**All KB files must have:**
```markdown
# Title

## Why This Exists
[Problem or rationale]

## When to Use It
[Specific scenarios]

## Details
[The actual knowledge]
```

---

## References Structure

### references/react-best-practices/ (47 total files)

**Purpose:** External React/Next.js performance optimization guidelines from Vercel Engineering.

**CRITICAL: READ-ONLY - DO NOT MODIFY ANY FILES IN references/**

**Navigation Hierarchy (Progressive Disclosure):**
1. **First:** `references/react-best-practices/HOTLIST.md` - Top 10 most applicable rules (start here always)
2. **Second:** `references/react-best-practices/INDEX.md` - Categorized rule index (8 categories, 45 rules)
3. **Third:** `references/react-best-practices/rules/*.md` - Individual rule files (only when needed)

**Rule Categories (from INDEX.md):**
- 🔄 Async & Waterfall Elimination (7 rules)
- 📦 Bundle Optimization (5 rules)
- 🖥️ Server Performance (4 rules)
- 💻 Client-Side Data Fetching (2 rules)
- 🔁 Re-render Optimization (6 rules)
- 🎨 Rendering & DOM (7 rules)
- ⚡ JavaScript Micro-Optimizations (12 rules)
- 🔬 Advanced Patterns (2 rules)

**Rule Count Validation:**
```bash
find references/react-best-practices/rules/ -name "*.md" | wc -l
# Must always output: 45 (rule files only, excludes _template.md and _sections.md)
```

**Usage Pattern:**
- ❌ Don't scan all 45 rules (token-inefficient)
- ✅ Do use HOTLIST → INDEX → specific rule

---

## Templates Structure

### templates/ (4 total files)

**Purpose:** Bootstrap new projects with Ralph infrastructure and KB integration.

**Key Files:**
- `templates/README.md` - Usage instructions, path conventions, validation
- `templates/AGENTS.project.md` - Becomes AGENTS.md in new projects
- `templates/fix_plan.md` - Task checklist template
- `../../templates/ralph/RALPH.md` - Ralph contract documentation (from workers/ralph/)

**Path Conventions:**
- Templates use relative paths: `../brain/skills/SUMMARY.md` (from project root)
- Brain's own prompts use local paths: `../../skills/SUMMARY.md` (relative to workers/ralph/)
- All paths in templates must be validated before use

**Bootstrap Process:**
```bash
# From brain repository root (not implemented in bash yet - legacy PowerShell)
# ./new-project.ps1 -Name my-project
# Creates: ../my-project/ with AGENTS.md, ralph/, specs/, src/
```

---

## Cortex Structure

### cortex/ (8 total files)

**Purpose:** Manager layer running Opus 4.5 - creates high-level implementation plans and manages strategic decisions.

**Key Files:**
- `cortex/CORTEX_SYSTEM_PROMPT.md` - Cortex identity, role definition, what Cortex can/cannot modify
- `cortex/REPO_MAP.md` - Human-friendly navigation guide for the brain repository
- `cortex/DECISIONS.md` - Stability anchor for naming, style, architecture decisions
- `cortex/RUNBOOK.md` - Operations guide (how to start, troubleshoot, verify)
- `cortex/IMPLEMENTATION_PLAN.md` - Task contract template (high-level tasks for Ralph)
- `cortex/THOUGHTS.md` - Cortex thinking space (current mission, decision log)
- `cortex/run.sh` - Main entry point (concatenates context and calls RovoDev)
- `cortex/snapshot.sh` - Generates current state summary (mission, progress, git status)

**Workflow:**
1. Cortex creates/updates high-level tasks in `cortex/IMPLEMENTATION_PLAN.md`
2. Ralph copies these to `IMPLEMENTATION_PLAN.md` (via sync mechanism - to be implemented)
3. Ralph picks ONE atomic task per BUILD iteration and implements it
4. Ralph logs completion to `THUNK.md`
5. Cortex reviews progress via `cortex/snapshot.sh` and adjusts strategy

**What Cortex Can Modify:**
- ✅ `cortex/IMPLEMENTATION_PLAN.md` - Task contracts
- ✅ `cortex/THOUGHTS.md` - Strategic thinking
- ✅ `skills/self-improvement/GAP_BACKLOG.md` - Knowledge gaps
- ✅ `skills/self-improvement/SKILL_BACKLOG.md` - Skill promotion queue

**What Cortex Cannot Modify:**
- ❌ `PROMPT.md`, `loop.sh`, `verifier.sh` - Protected Ralph infrastructure
- ❌ Source code in `ralph/`, `skills/`, `templates/` - Ralph's domain
- ❌ Acceptance criteria in `rules/AC.rules` - Protected by hash guard

**Running Cortex:**
```bash
cd /path/to/brain/
bash cortex/run.sh              # Single review cycle
bash cortex/run.sh --help       # Show usage
```

---

## Specs Structure

### specs/ (1 total file)

**Purpose:** Define what the brain repository is for and what "done" means.

**Key File:**
- `THOUGHTS.md` - Brain repo vision, goals, knowledge classification, definition of done

**Contents:**
- Primary functions: Knowledge repository, project bootstrap, self-evolution
- Knowledge classification: Global (brain) vs project-specific
- Knowledge growth process: Determine scope → Create/update KB → Update SUMMARY → Validate
- Source code definition: templates/, skills/, references/, scripts
- Definition of done: Templates valid, paths correct, indexes current, documentation clear

---

## Ralph Loop Infrastructure

### Core Files (at ralph/ root)

**Execution:**
- `loop.sh` - Bash script that runs Ralph iterations
- `rovodev-config.yml` - RovoDev configuration

**Prompts:**
- `PROMPT.md` - Unified prompt with conditional logic (plan mode: gap analysis, NO code changes, updates TODO list; build mode: implement top task, validate, commit)
- `IMPLEMENTATION_PLAN.md` - Persistent TODO list (updated by planning mode, read by building mode)
- `PROMPT_verify.md` - Verification prompt (validation checks)

**Stop Sentinel:**
```text
:::COMPLETE:::
```

Only output when ALL tasks in IMPLEMENTATION_PLAN.md are 100% complete.

---

## Parallel Subagent Patterns

### Reading/Discovery: Up to 100 parallel subagents
Use for:
- Grep searches across codebase
- File scanning and documentation study
- KB discovery and indexing
- Comparing specs to documentation

### Comparison/Analysis: Up to 500 parallel subagents
Use for:
- Large-scale spec vs code comparison
- Cross-file dependency analysis
- Comprehensive validation checks

### Building/Modification: Exactly 1 subagent
Use for:
- Implementation and code changes
- Git operations (commit, push)
- File writes and modifications
- Any destructive operations

**Conflict Prevention:** Only the single build subagent performs modifications. All other subagents are read-only.

---

## Ralph Pattern Documentation (Legacy)

**Source:** https://github.com/ghuntley/how-to-ralph-wiggum

**Core Principles:**
- **Don't assume not implemented** - Always search codebase before creating new functionality
- **Parallel subagents for reading** - Up to 100 for discovery, 500 for comparison
- **Single agent for building** - Exactly 1 for implementation/modification/git ops
- **AGENTS.md is operational-only** - How to run/build/test, NO progress diaries
- **Single TODO list** - IMPLEMENTATION_PLAN.md is the only backlog
- **One iteration = one coherent unit** - Implement + verify + update plan + commit

**Context Loading Each Iteration:**
1. PROMPT.md (planning or build prompt)
2. AGENTS.md (operational guide)
3. NEURONS.md (brain map - this file)
4. Specs and KB files via progressive disclosure

**Loop Structure:**
- **PLAN phase:** Gap analysis, updates TODO list, NO code changes, NO commits
- **BUILD phase:** Implements top task, validates, commits when complete
- **Completion:** Outputs `:::COMPLETE:::` when all tasks done

---

## File Counts and Validation

### Quick Checks
```bash
# KB file count
find skills/ -name "*.md" | wc -l
# Should be: 33 (SUMMARY, index, conventions, 22 in domains/ including shell/, 2 in projects/, 6 in self-improvement/)

# Cortex file count
find cortex/ -name "*.md" -o -name "*.sh" | wc -l
# Should be: 8 (6 .md files + 2 .sh scripts)

# React rules count (READ-ONLY - must never change)
find references/react-best-practices/rules/ -name "*.md" | wc -l
# Must always be: 45

# Template count
find templates/ -name "*.md" | wc -l
# Should be: 4 (README, AGENTS.project, fix_plan, ralph/RALPH)

# Spec count
find specs/ -name "*.md" | wc -l
# Should be: 1 (overview.md)

# Total .md files in brain/ root (excluding subdirs)
find . -maxdepth 1 -name "*.md" | wc -l
# Current: ~7 files (AGENTS, NEURONS, PROMPT, IMPLEMENTATION_PLAN, THOUGHTS, THUNK, README, VALIDATION_CRITERIA)
```

### Validation Commands (Backpressure)
```bash
# Verify file structure
ls -la skills/ templates/ references/ specs/

# Check KB integrity (all KB files must have required headers)
grep -r "## Why This Exists" skills/domains/ skills/projects/
grep -r "## When to Use It" skills/domains/ skills/projects/

# Verify React rules unchanged
find references/react-best-practices/rules/ -name "*.md" | wc -l
# Should output: 45

# Test loop.sh syntax
bash -n loop.sh

# Check AGENTS.md and NEURONS.md exist
ls -lh AGENTS.md NEURONS.md
```

---

## Read-Only vs Modifiable Sections

### ❌ DO NOT MODIFY (Read-Only)
- **references/react-best-practices/rules/*.md** - 45 curated rules from Vercel Engineering
- **old_md/** - Archived plans and reports (historical record)
- **logs/** - Auto-generated execution transcripts

### ✅ MODIFIABLE (Active Development)
- **AGENTS.md** - Ralph operational guide
- **NEURONS.md** - This brain map
- **PROMPT.md** - Ralph unified prompt
- **IMPLEMENTATION_PLAN.md** - Ralph TODO list
- **loop.sh** - Ralph loop runner
- **rovodev-config.yml** - Ralph configuration
- **cortex/** - All Cortex files (CORTEX_SYSTEM_PROMPT, REPO_MAP, DECISIONS, RUNBOOK, IMPLEMENTATION_PLAN, THOUGHTS, run.sh, snapshot.sh)
- **skills/** - All knowledge base files
- **templates/** - Project bootstrap templates
- **docs/** - Documentation files

---

## Windows Reference Repository (Read-Only)

**Location:** `/mnt/c/Users/grafe.MASTERRIG/Desktop/AllDoneSites/brain`

**Status:** Legacy Windows-based brain repository. Contains PowerShell scripts and older structure.

**Usage:** Reference only. Do NOT modify files in Windows repo from WSL. All active development happens in WSL2 in the brain repository at `workers/ralph/` (use relative paths for portability).

**Note:** PowerShell prerequisites removed from Ralph. All Ralph operations now use bash in WSL2.

---

## Success Criteria for Brain Repository

From `THOUGHTS.md`, the brain is successful when:

1. **New projects bootstrap in <60 seconds** with all Ralph infrastructure
2. **KB files consulted before implementation** in every project
3. **Knowledge grows organically** - new conventions added regularly
4. **Templates evolve** - improvements from one project benefit all future projects
5. **Self-improvement works** - Ralph loop makes the brain better over time

---

## Common Workflows

### Adding New Domain Knowledge
1. Check if it exists: grep across `skills/domains/`
2. Create: `skills/domains/new-pattern.md` with Why/When/Details structure
3. Update: `skills/SUMMARY.md` to link new file
4. Validate: Check required headers present

### Adding Project-Specific Knowledge
1. Create: `skills/projects/project-slug.md`
2. Follow Why/When/Details structure
3. Update: `skills/SUMMARY.md`
4. Keep focused: Only project-specific content

### Using React Best Practices
1. Start: `references/react-best-practices/HOTLIST.md`
2. If not covered: `references/react-best-practices/INDEX.md`
3. Drill down: `references/react-best-practices/rules/specific-rule.md`
4. Never: Scan all 45 rules at once

### Running Ralph Loop
```bash
cd /path/to/brain/workers/ralph/
bash loop.sh                           # Single iteration
bash loop.sh --iterations 10           # Multiple iterations
bash loop.sh --prompt PROMPT.md        # Use unified prompt
```

### Validating Brain Integrity
```bash
# File counts
find skills/ -name "*.md" | wc -l              # Should be 7
find references/react-best-practices/rules/ -name "*.md" | wc -l  # Must be 45

# Required headers in KB files
grep -r "## Why This Exists" skills/domains/ skills/projects/
grep -r "## When to Use It" skills/domains/ skills/projects/

# Script syntax
bash -n loop.sh

# Directory structure
tree -L 2 -I 'old_md|logs'
```

---

## Summary

This brain repository contains:
- **33 KB files** (index, conventions, domains with shell/, projects, self-improvement)
- **8 Cortex files** (manager layer - CORTEX_SYSTEM_PROMPT, REPO_MAP, DECISIONS, RUNBOOK, IMPLEMENTATION_PLAN, THOUGHTS, run.sh, snapshot.sh)
- **45 React rules** (read-only performance patterns)
- **4 template files** (project bootstrap)
- **1 spec file** (project definition)
- **Ralph loop infrastructure** (bash-based, WSL2)

**Remember:**
1. Read NEURONS.md (this file) immediately after AGENTS.md
2. Use progressive disclosure (HOTLIST → INDEX → specific files)
3. Search before creating (don't assume missing)
4. Follow parallel subagent patterns (100 read, 1 build)
5. Never modify references/react-best-practices/rules/
6. Cortex manages strategy, Ralph executes tasks

**For questions about:**
- **How to run Ralph** → See AGENTS.md
- **How to run Cortex** → See cortex/RUNBOOK.md
- **What exists where** → You're reading it (NEURONS.md) or see cortex/REPO_MAP.md
- **How to create KB files** → See skills/conventions.md
- **Project goals** → See THOUGHTS.md or cortex/THOUGHTS.md
- **React patterns** → See references/react-best-practices/HOTLIST.md
- **Manager/worker workflow** → See AGENTS.md "Manager/Worker Architecture" section
