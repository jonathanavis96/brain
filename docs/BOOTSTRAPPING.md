# Bootstrapping New Projects

The brain repository provides intelligent generators for scaffolding new Ralph-enabled projects.

## Quick Start

```bash
# 1. Create project idea file from template
cp templates/NEW_PROJECT_IDEA.template.md my-project-idea.md
# Edit with: Project name, Purpose, Tech Stack, Goals

# 2. Bootstrap complete project structure
bash new-project.sh my-project-idea.md
# Creates GitHub repo, clones locally, generates all Ralph files
```text

## Generator Scripts

Three specialized generators create Ralph infrastructure files from your project idea:

### generate-neurons.sh

**Purpose:** Creates NEURONS.md (codebase map) with intelligent structure inference

```bash
bash generators/generate-neurons.sh INPUT_IDEA.md OUTPUT_NEURONS.md
```text

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

### generate-thoughts.sh

**Purpose:** Creates THOUGHTS.md (goals, success criteria, design decisions)

```bash
bash generators/generate-thoughts.sh INPUT_IDEA.md OUTPUT_THOUGHTS.md
```text

**Intelligence features:**

- Infers project type description from tech stack
- Generates appropriate skills/patterns references (React, Auth, etc.)
- Creates Definition of Done criteria tailored to project type
- Parses multi-line sections: Detailed Description, Success Criteria, Technical Requirements

**Required fields:** Same as generate-neurons.sh

### generate-implementation-plan.sh

**Purpose:** Creates IMPLEMENTATION_PLAN.md (task breakdown)

```bash
bash generators/generate-implementation-plan.sh INPUT_IDEA.md OUTPUT_IMPLEMENTATION_PLAN.md
```text

**Intelligence features:**

- Parses Goals field into structured tasks
- Generates phase structure based on project type (setup, core, features, polish, deploy)
- Creates tech-specific acceptance criteria
- Handles both simple goal lists and complex multi-line goals

**Required fields:** Same as generate-neurons.sh

## Workflow Example

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
```text

## Template Types

Located in `templates/`:

| Template | Purpose | Files Included |
|----------|---------|----------------|
| `ralph/` | Full Ralph loop infrastructure | 14 files: loop.sh, monitors, verifier, rules/AC.rules, PROMPT.md, etc. |
| `cortex/` | Cortex manager infrastructure | 5 files: CORTEX_SYSTEM_PROMPT.md, IMPLEMENTATION_PLAN.md, THOUGHTS.md, DECISIONS.md, snapshot.sh |
| `backend/` | Backend project baseline | AGENTS.md, NEURONS.md, THOUGHTS.md, VALIDATION_CRITERIA.md |
| `python/` | Python project baseline | Same as backend with Python-specific guidance |

**Note:** `new-project.sh` automatically selects the correct template based on tech stack inference and creates both Ralph and Cortex infrastructure.

## Manual Generator Usage (Advanced)

When `new-project.sh` isn't suitable (existing repo, custom setup):

1. Create project idea file using `templates/NEW_PROJECT_IDEA.template.md`
2. Run generators individually to create Ralph files
3. Copy appropriate template files from `templates/{ralph,backend,python}/`
4. Manually substitute placeholders if needed (generators handle this automatically)

## Error Handling

All generators validate required fields and exit with clear error messages:

- Missing `Project:` → "Error: PROJECT_NAME is required"
- Missing `Tech Stack:` → "Error: Tech Stack is required"
- Missing `Purpose:` → "Error: Purpose is required"
- Input file not found → "Error: Input file not found"

## Known Issues

### Don't Copy `workers/` Directory

**Issue:** The `workers/ralph/` directory from the Brain repo should NOT be copied to bootstrapped projects. It contains Brain-specific Ralph infrastructure for self-improvement, not project-specific worker files.

**What went wrong:** The Jacqui website bootstrap accidentally included `workers/ralph/` which created confusion about where Ralph was supposed to work.

**Fix:** Ensure `new-project.sh` and manual bootstrapping exclude:

- `workers/` (Brain's internal worker configs)
- Any Brain-specific directories not meant for project scaffolding

**Project structure should be:**

```text
project/
├── cortex/          # Manager layer (planning)
├── ralph/           # Worker layer (execution) ← project-specific
├── src/             # Source code
└── ...
```text

NOT:

```text
project/
├── cortex/
├── ralph/
├── workers/ralph/   # ❌ Brain-specific, don't copy
└── ...
```text

## See Also

- **[new-project.sh](../new-project.sh)** - Main bootstrap script
- **[templates/](../templates/)** - Template files
- **[generators/](../generators/)** - Generator scripts
- **[AGENTS.md](../AGENTS.md)** - Brain repository agent guidance
