# AGENTS.md - Ralph Loop (Brain Repo Self-Improvement)

## First Step: Read the Brain Map
**Before any task, read NEURONS.md via subagent** - it maps the brain repository structure.

## Purpose
Ralph loop for brain repository self-improvement. Runs PLAN/BUILD cycles to maintain knowledge base and templates.

## Prerequisites
- WSL2 Ubuntu + bash
- Atlassian CLI (`acli`) - https://developer.atlassian.com/cloud/cli/
- RovoDev: `acli rovodev auth && acli rovodev usage site`

## How to Run
```bash
cd /home/grafe/code/brain/ralph/
bash loop.sh                    # Single iteration
bash loop.sh --iterations 10    # Multiple iterations
bash loop.sh --dry-run          # Preview changes
bash loop.sh --rollback 2       # Undo last 2 commits
bash loop.sh --resume           # Resume from interruption
```

Mode: Iteration 1 or every 3rd = PLAN, others = BUILD.

## Task Monitors

Ralph uses two complementary monitors for real-time task tracking:

### Current Ralph Tasks Monitor
```bash
bash current_ralph_tasks.sh     # Shows pending tasks from IMPLEMENTATION_PLAN.md
```
**Purpose:** Displays unchecked `[ ]` tasks only, organized by priority (HIGH/MEDIUM/LOW)
**Hotkeys:** `q` (quit)
**Key Features:**
- Extracts tasks from all priority sections, including nested subsections (`###`, `####`)
- First unchecked task marked with `▶` symbol (current task Ralph should work on)
- Always full screen redraw (no rendering artifacts)
- Updates within 1 second of IMPLEMENTATION_PLAN.md changes

### THUNK Monitor (Completed Tasks)
```bash
bash thunk_ralph_tasks.sh       # Shows completed task log from THUNK.md
```
**Purpose:** Displays completed tasks appended to THUNK.md
**Hotkeys:** `r` (refresh), `f` (force sync), `e` (new era), `q` (quit)
**Key Features:**
- Primary: Watches THUNK.md for Ralph-appended completions
- Safety net: Auto-syncs from IMPLEMENTATION_PLAN.md if Ralph forgets to append
- Append-only display (tail parsing for performance)
- Sequential THUNK numbering across project lifecycle

## Loop Stop Sentinel
Ralph outputs when ALL tasks complete:
```text
:::COMPLETE:::
```

## Skills + Self-Improvement Protocol

**Start of iteration:**
1. Study `skills/SUMMARY.md` for overview
2. Check `skills/index.md` for available skills
3. Review `skills/self-improvement/GAP_CAPTURE_RULES.md` for capture protocol

**End of iteration:**
1. If you used undocumented knowledge/procedure/tooling:
   - Search `skills/` for existing matching skill
   - Search `skills/self-improvement/GAP_BACKLOG.md` for existing gap entry
   - If not found: append new entry to `GAP_BACKLOG.md`
2. If a gap is clear, specific, and recurring:
   - Add to `skills/self-improvement/SKILL_BACKLOG.md`
   - Create skill file using `SKILL_TEMPLATE.md`
   - Update `skills/index.md`

## Bootstrapping New Projects

The brain repository provides intelligent generators for scaffolding new Ralph-enabled projects.

### Quick Start

```bash
# 1. Create project idea file from template
cp templates/NEW_PROJECT_IDEA.template.md my-project-idea.md
# Edit with: Project name, Purpose, Tech Stack, Goals

# 2. Bootstrap complete project structure
bash new-project.sh my-project-idea.md
# Creates GitHub repo, clones locally, generates all Ralph files
```

### Generator Scripts

Three specialized generators create Ralph infrastructure files from your project idea:

#### generate-neurons.sh
**Purpose:** Creates NEURONS.md (codebase map) with intelligent structure inference

```bash
bash generators/generate-neurons.sh INPUT_IDEA.md OUTPUT_NEURONS.md
```

**Intelligence features:**
- Infers project type from tech stack (web-app, api, cli, python-general, etc.)
- Generates directory structure matching conventions (Next.js, Django, FastAPI, Python, CLI)
- Creates tech-specific file location guides
- Generates validation commands per project type

**Required fields in INPUT_IDEA.md:**
- `Project:` or `# Project:` (name)
- `Tech Stack:` (comma-separated technologies)
- `Purpose:` (one-line description)
- `Location:` (optional, defaults to `/path/to/{project}`)

#### generate-thoughts.sh
**Purpose:** Creates THOUGHTS.md (goals, success criteria, design decisions)

```bash
bash generators/generate-thoughts.sh INPUT_IDEA.md OUTPUT_THOUGHTS.md
```

**Intelligence features:**
- Infers project type description from tech stack
- Generates appropriate skills/patterns references (React, Auth, etc.)
- Creates Definition of Done criteria tailored to project type
- Parses multi-line sections: Detailed Description, Success Criteria, Technical Requirements

**Required fields:** Same as generate-neurons.sh

#### generate-implementation-plan.sh
**Purpose:** Creates IMPLEMENTATION_PLAN.md (task breakdown)

```bash
bash generators/generate-implementation-plan.sh INPUT_IDEA.md OUTPUT_IMPLEMENTATION_PLAN.md
```

**Intelligence features:**
- Parses Goals field into structured tasks
- Generates phase structure based on project type (setup, core, features, polish, deploy)
- Creates tech-specific acceptance criteria
- Handles both simple goal lists and complex multi-line goals

**Required fields:** Same as generate-neurons.sh

### Workflow Example

```bash
# Create idea file
cat > my-api-idea.md << 'EOF'
# Project: Widget API
Purpose: REST API for widget management
Tech Stack: Python, FastAPI, PostgreSQL, Docker
Goals: CRUD endpoints, authentication, rate limiting, OpenAPI docs

## Detailed Description
Microservice for widget lifecycle management with JWT auth and role-based permissions.
EOF

# Generate Ralph files
bash generators/generate-neurons.sh my-api-idea.md NEURONS.md
bash generators/generate-thoughts.sh my-api-idea.md THOUGHTS.md
bash generators/generate-implementation-plan.sh my-api-idea.md IMPLEMENTATION_PLAN.md

# Or use new-project.sh to do everything
bash new-project.sh my-api-idea.md
```

### Template Types

Located in `templates/`:

| Template | Purpose | Files Included |
|----------|---------|----------------|
| `ralph/` | Full Ralph loop infrastructure | 14 files: loop.sh, monitors, verifier, AC.rules, PROMPT.md, etc. |
| `backend/` | Backend project baseline | AGENTS.md, NEURONS.md, THOUGHTS.md, VALIDATION_CRITERIA.md |
| `python/` | Python project baseline | Same as backend with Python-specific guidance |

**Note:** `new-project.sh` automatically selects the correct template based on tech stack inference.

### Manual Generator Usage (Advanced)

When `new-project.sh` isn't suitable (existing repo, custom setup):

1. Create project idea file using `templates/NEW_PROJECT_IDEA.template.md`
2. Run generators individually to create Ralph files
3. Copy appropriate template files from `templates/{ralph,backend,python}/`
4. Manually substitute placeholders if needed (generators handle this automatically)

### Error Handling

All generators validate required fields and exit with clear error messages:
- Missing `Project:` → "Error: PROJECT_NAME is required"
- Missing `Tech Stack:` → "Error: Tech Stack is required"
- Missing `Purpose:` → "Error: Purpose is required"
- Input file not found → "Error: Input file not found"

## Troubleshooting
- **acli not found**: Add to PATH in ~/.bashrc
- **Loop doesn't stop**: Check `:::COMPLETE:::` output
- **Ralph batches tasks**: See PROMPT.md "EXACTLY ONE task" emphasis
- **Wrong mode**: Check iteration number (1 or 3rd = PLAN)
- **Generator fails**: Check required fields in idea file (Project, Tech Stack, Purpose)
- **new-project.sh fails**: Verify `gh` CLI installed and authenticated for GitHub integration

See README.md for design philosophy, safety features, and detailed documentation.

## See Also
- **README.md** - Design philosophy, validation, safety features
- **VALIDATION_CRITERIA.md** - Quality gates and validation commands
- **NEURONS.md** - Brain repository map
- **skills/domains/ralph-patterns.md** - Ralph loop architecture
