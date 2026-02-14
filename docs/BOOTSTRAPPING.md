# Bootstrapping New Projects

The brain repository provides intelligent generators for scaffolding new Ralph-enabled projects.

## Quick Start

```bash
# 1. Create project idea file from template
cp templates/NEW_PROJECT_IDEA.template.md my-project-idea.md
# Edit with: Project name, Purpose, Tech Stack, Goals

# 2. Bootstrap complete project structure
bash scripts/new-project.sh my-project-idea.md
# Creates GitHub repo, clones locally, generates all Ralph files
```text

## Generator Scripts

This repo's `scripts/new-project.sh` can optionally call generator scripts when available, but **this Brain repo currently does not include a `generators/` directory**. In that case, bootstrap falls back to copying templates from `templates/`.

If/when `generators/` is reintroduced, these scripts are expected:

### generate-neurons.sh

**Status:** Not currently shipped in this repo.

If a future version reintroduces `generators/`, this script would create NEURONS.md (codebase map) from a project idea file.

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

**Status:** Not currently shipped in this repo.

If reintroduced, it would generate THOUGHTS.md (vision/goals/DoD) from the idea file.

**Intelligence features:**

- Infers project type description from tech stack
- Generates appropriate skills/patterns references (React, Auth, etc.)
- Creates Definition of Done criteria tailored to project type
- Parses multi-line sections: Detailed Description, Success Criteria, Technical Requirements

**Required fields:** Same as generate-neurons.sh

### generate-implementation-plan.sh

**Status:** Not currently shipped in this repo.

If reintroduced, it would generate `brain/workers/IMPLEMENTATION_PLAN.md` from the idea file.

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

# Bootstrap everything (templates + vendored brain pack)
bash scripts/new-project.sh my-api-idea.md

# In the new project, Ralph is run from:
#   cd brain/workers/ralph && bash loop.sh

# In the new project, Ralph is run from:
#   cd brain/workers/ralph && bash loop.sh
```text

## Bootstrapped notification tooling

Bootstrapped projects include a small set of notification/observability helpers at repo root:

- `bin/notify` — desktop notification + optional TTS (best-effort)
- `bin/cortex-run-notify` — wraps Cortex runs and sends notifications
- `bin/ralph-run-notify` — wraps Ralph runs and sends notifications
- `bin/discord-post` — optional Discord webhook posting (if configured)
- `tools/detect_human_required.py` — scans logs for HUMAN_REQUIRED markers (used by the notify wrappers)

These are intentionally minimal (not the full Brain `tools/` suite).

## Template Types

Located in `templates/`:

| Template | Purpose | Files Included |
|----------|---------|----------------|
| `ralph/` | Full Ralph loop infrastructure | 14 files: loop.sh, monitors, verifier, rules/AC.rules, PROMPT.md, etc. |
| `brain/cortex/` | Cortex manager infrastructure | 5+ files: CORTEX_SYSTEM_PROMPT.md, THOUGHTS.md, DECISIONS.md, snapshot.sh, etc. |
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

### Brain pack location in downstream projects

**Key rule:** In downstream projects, all Brain-provided runtime + knowledge lives under `./brain/`.

That means projects should not have top-level `workers/` or top-level `cortex/` folders created by bootstrap.

**Correct downstream project structure:**

```text
project/
├── brain/
│   ├── skills/                 # Brain skills snapshot (updated via sync_brain_skills.sh)
│   ├── cortex/                 # Cortex manager layer (planning)
│   └── workers/
│       ├── IMPLEMENTATION_PLAN.md
│       └── ralph/              # Ralph worker runtime
├── src/                         # Application source code
├── docs/
└── ...
```text

**Incorrect (old convention):**

```text
project/
├── skills/                      # ❌ old convention
├── workers/                      # ❌ old convention
├── cortex/                       # ❌ old convention
└── ...
```text

## See Also

- **[`scripts/new-project.sh`](../scripts/new-project.sh)** - Main bootstrap script
- **[templates/](../templates/)** - Template files
- **[skills/playbooks/bootstrap-new-project.md](../skills/playbooks/bootstrap-new-project.md)** - Bootstrap playbook
- **[workers/ralph/README.md](../workers/ralph/README.md)** - Ralph loop design philosophy (Brain repo internal reference)
- **[NEURONS.md](../NEURONS.md)** - Repository structure map
- **[AGENTS.md](../AGENTS.md)** - Brain repository agent guidance
