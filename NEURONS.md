# NEURONS.md - Brain Repository Map

**Last Updated:** 2026-01-22

## Quick Reference

| What                       | Where                        | Purpose                                       |
|----------------------------|------------------------------|-----------------------------------------------|
| **Strategic Vision** | `THOUGHTS.md` | Mission, goals, success criteria |
| **Repository Map** | `NEURONS.md` (this file) | Codebase structure and navigation |
| **Agent Guide** | `AGENTS.md` (planned) | Operational guidance for agents |
| **Human Onboarding** | `README.md` | Getting started guide |
| **Implementation Plan** | `IMPLEMENTATION_PLAN.md` | Current tasks and roadmap |
| **Skills Knowledge Base** | `skills/` | Domain patterns and best practices |
| **Project Templates** | `templates/` | Bootstrapping for new projects |
| **Ralph Worker** | `workers/ralph/` | Self-improvement loop for brain |
| **Cortex Manager** | `cortex/` | Strategic planning and coordination |
| **Acceptance Criteria** | `rules/AC.rules` | Automated quality gates (protected) |
| **Verifier** | `.verify/` | Hash guards and verification system |

## Repository Structure

```text
brain/                           # Root of brain repository
├── README.md                    # Human onboarding and overview
├── THOUGHTS.md                  # Strategic vision and goals
├── NEURONS.md                   # This file - codebase map
├── AGENTS.md                    # (planned) Agent operational guide
├── IMPLEMENTATION_PLAN.md       # Current tasks and roadmap
│
├── skills/                      # Skills knowledge base (domain patterns)
│   ├── SUMMARY.md              # Skills overview and hotlist
│   ├── index.md                # Skill catalog and navigation
│   ├── conventions.md          # Cross-cutting conventions
│   ├── domains/                # Domain-specific patterns
│   │   ├── backend/            # API, auth, caching, database patterns
│   │   ├── code-quality/       # Testing, hygiene, token efficiency
│   │   ├── infrastructure/     # Deployment, security, state management
│   │   ├── languages/          # Python, shell scripting patterns
│   │   ├── ralph/              # Ralph loop architecture patterns
│   │   └── websites/           # Web design and development patterns
│   ├── projects/               # Project-specific conventions
│   └── self-improvement/       # GAP_BACKLOG, SKILL_BACKLOG
│
├── templates/                   # Project bootstrapping templates
│   ├── ralph/                  # Ralph loop template (core files)
│   ├── backend/                # Backend project templates
│   ├── python/                 # Python project templates
│   └── cortex/                 # Cortex manager templates
│
├── workers/                     # Worker agents (executors)
│   └── ralph/                  # Ralph self-improvement worker
│       ├── AGENTS.md           # Ralph operational guide
│       ├── NEURONS.md          # Ralph codebase map
│       ├── THOUGHTS.md         # Ralph tactical notes
│       ├── IMPLEMENTATION_PLAN.md  # Ralph work queue
│       ├── THUNK.md            # Ralph completion log
│       ├── PROMPT.md           # Ralph agent instructions
│       ├── loop.sh             # Ralph execution loop
│       ├── verifier.sh         # Acceptance criteria checker
│       └── docs/               # Ralph-specific documentation
│
├── cortex/                      # Manager agent (strategic planning)
│   ├── AGENTS.md               # Cortex operational guide
│   ├── NEURONS.md              # Cortex codebase map
│   ├── THOUGHTS.md             # Cortex strategic notes
│   ├── IMPLEMENTATION_PLAN.md  # Cortex planning queue
│   ├── analysis/               # Analysis and planning documents
│   ├── docs/                   # Cortex-specific documentation
│   └── projects/               # Project-specific planning
│
├── docs/                        # Repository-wide documentation
│   ├── BOOTSTRAPPING.md        # New project setup guide
│   ├── CHANGES.md              # Change log and history
│   ├── EDGE_CASES.md           # (planned) Error recovery procedures
│   ├── HISTORY.md              # Historical context and decisions
│   └── REFERENCE_SUMMARY.md    # Quick reference guide
│
├── rules/                       # Quality gates and acceptance criteria
│   ├── AC.rules                # Automated acceptance criteria (protected)
│   ├── AC-hygiene-additions.rules  # Additional hygiene rules
│   └── MANUAL_APPROVALS.rules  # Manual review gates
│
└── .verify/                     # Verification and hash guards
    ├── ac.sha256               # AC.rules hash baseline (protected)
    ├── loop.sha256             # loop.sh hash baseline (protected)
    ├── prompt.sha256           # PROMPT.md hash baseline (protected)
    ├── verifier.sha256         # verifier.sh hash baseline (protected)
    ├── latest.txt              # Last verifier run output
    ├── waiver_requests/        # Pending waiver requests
    └── waivers/                # Approved waivers (OTP-protected)
```text

## File Counts

- **Markdown files:** 129
- **Shell scripts:** 27
- **Python files:** 1
- **Total directories:** 19+

## Key Files by Purpose

### Strategic Documents

- `THOUGHTS.md` - What we're achieving (mission, goals, metrics)
- `README.md` - How to use the brain (onboarding)
- `IMPLEMENTATION_PLAN.md` - What we're working on (tasks)

### Navigation & Context

- `NEURONS.md` - Where things are (this file)
- `skills/SUMMARY.md` - Skills overview and hotlist
- `skills/index.md` - Skill catalog

### Protected Files (Hash-Guarded)

- `rules/AC.rules` - Quality gates
- `workers/ralph/loop.sh` - Ralph execution loop
- `workers/ralph/verifier.sh` - Acceptance criteria checker
- `workers/ralph/PROMPT.md` - Ralph agent instructions
- `.verify/*.sha256` - Hash baselines for protected files

### Self-Improvement System

- `skills/self-improvement/GAP_BACKLOG.md` - Identified knowledge gaps
- `skills/self-improvement/SKILL_BACKLOG.md` - Skills to create
- `workers/ralph/THUNK.md` - Completed tasks log

## Domain Coverage

### Backend

- API design patterns
- Authentication patterns
- Caching strategies
- Database patterns
- Error handling

### Code Quality

- Code consistency
- Code hygiene
- Markdown patterns
- Testing patterns
- Token efficiency

### Infrastructure

- Deployment patterns
- Security patterns
- State management

### Languages

- Python patterns
- Shell scripting (cleanup, strict mode, variable patterns)

### Ralph Loop

- Bootstrap patterns
- Change propagation
- Ralph architecture patterns

### Websites

- Architecture (section composer, sitemap builder, tech stack)
- Copywriting (CTA, objection handling, value proposition)
- Design (color system, typography, spacing)
- Discovery (audience mapping, requirements, scope control)
- QA (acceptance criteria, accessibility, visual QA)
- Launch (deployment, finishing pass)

## "I need to..." Quick Lookup

| Task                       | Start Here                                                   |
|----------------------------|--------------------------------------------------------------|
| Find a skill pattern | `skills/SUMMARY.md` → `skills/index.md` |
| Bootstrap new project | `docs/BOOTSTRAPPING.md` → `templates/` |
| Understand Ralph loop | `workers/ralph/AGENTS.md` → `skills/domains/ralph/` |
| Check acceptance criteria | `rules/AC.rules` (read only) |
| Review verifier output | `.verify/latest.txt` |
| See completed work | `workers/ralph/THUNK.md` |
| Understand brain mission | `THOUGHTS.md` |
| Get started (human) | `README.md` |
| Add new skill | `skills/self-improvement/GAP_BACKLOG.md` |

## Manager vs Worker Architecture

The brain repository follows Option B structure (worker-in-repo):

### Cortex (Manager)

- **Location:** `cortex/`
- **Role:** Strategic planning, coordination, analysis
- **Files:** AGENTS.md, NEURONS.md, THOUGHTS.md, IMPLEMENTATION_PLAN.md
- **Scope:** Multi-project orchestration, resource allocation

### Ralph (Worker)

- **Location:** `workers/ralph/`
- **Role:** Tactical execution, self-improvement loop
- **Files:** AGENTS.md, NEURONS.md, THOUGHTS.md, IMPLEMENTATION_PLAN.md, THUNK.md
- **Scope:** Brain repository maintenance and improvement

### Brain Root

- **Location:** `/` (root)
- **Role:** Overall repository vision and structure
- **Files:** THOUGHTS.md, NEURONS.md, AGENTS.md (planned), README.md
- **Scope:** Repository-wide mission, goals, templates

## Validation Commands

```bash
# Check repository structure
tree -L 2 -d .

# Count files by type
find . -name "*.md" | wc -l
find . -name "*.sh" | wc -l
find . -name "*.py" | wc -l

# Verify protected files (should show matches)
ls -la rules/AC.rules workers/ralph/{loop,verifier}.sh workers/ralph/PROMPT.md

# Check hash guards exist
ls -la .verify/*.sha256

# View last verifier run
cat .verify/latest.txt

# Check for stale TODOs
rg -i "TODO|FIXME|XXX" --type md | head -20

# Verify skills catalog up-to-date
ls -1 skills/domains/*/*.md | wc -l
grep -c "^- \[" skills/index.md
```text

## Navigation Tips

1. **Start with SUMMARY.md** - Get overview before diving into specific skills
2. **Use index.md** - Catalog of all skills with descriptions
3. **Check THOUGHTS.md** - Understand context and current phase
4. **Read AGENTS.md** - Get operational guidance (once created)
5. **Follow hotlist** - `skills/SUMMARY.md` links most-used patterns

## Common Workflows

### Adding a New Skill

1. Capture gap in `skills/self-improvement/GAP_BACKLOG.md`
2. Promote to `SKILL_BACKLOG.md` when clear
3. Create skill file in appropriate `skills/domains/` subdirectory
4. Update `skills/index.md` with new entry
5. Add to hotlist in `skills/SUMMARY.md` if frequently used

### Bootstrapping a New Project

1. Read `docs/BOOTSTRAPPING.md`
2. Choose template from `templates/` (ralph, backend, python, etc.)
3. Copy template to new project location
4. Run `new-project.sh` (planned at root level)
5. Customize AGENTS.md, NEURONS.md, THOUGHTS.md for project

### Running Ralph Loop on Brain

1. Navigate to `workers/ralph/`
2. Check `AGENTS.md` for prerequisites
3. Run `bash loop.sh` for single iteration
4. Monitor with `bash current_ralph_tasks.sh`
5. View completed work in `THUNK.md`

### Checking Verifier Status

1. Read `.verify/latest.txt` for pass/fail/warn
2. If FAIL: Fix issues before continuing
3. If WARN: Add to IMPLEMENTATION_PLAN.md Phase 0-Warn section
4. Protected file changes: Requires human intervention

## Workspace Boundaries

Ralph has **full access** to entire brain repository from root (`/home/grafe/code/brain`):

| Access Level               | Paths                                                                                                 | Notes                                |
|----------------------------|-------------------------------------------------------------------------------------------------------|--------------------------------------|
| **Full access** | `skills/`, `templates/`, `cortex/`, `docs/`, `workers/` | Read, write, create, delete |
| **Protected** | `rules/AC.rules`, `workers/ralph/verifier.sh`, `workers/ralph/loop.sh`, `workers/ralph/PROMPT.md` | Read only - hash-guarded |
| **Protected** | `.verify/*.sha256` | Baseline hashes - human updates |
| **Forbidden** | `.verify/waivers/*.approved` | OTP-protected - cannot read/write |

## Related Documentation

- `workers/ralph/NEURONS.md` - Ralph worker codebase map (tactical view)
- `cortex/NEURONS.md` - Cortex manager codebase map (strategic view)
- `README.md` - Human-readable onboarding guide
- `THOUGHTS.md` - Strategic vision and goals
- `skills/domains/ralph/ralph-patterns.md` - Ralph loop architecture

## Version History

| Date       | Changes                                                       |
|------------|---------------------------------------------------------------|
| 2026-01-22 | Initial creation - mapped brain repository structure         |
