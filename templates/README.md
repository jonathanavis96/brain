# Brain Repository Templates

This directory contains templates for bootstrapping new projects with the Ralph Wiggum iterative development loop and knowledge base integration.

## Template Files

- **NEW_PROJECT_IDEA.template.md** - Project description template for bootstrap system (defines project metadata for `new-project.sh`)
- **AGENTS.project.md** - Project guidance template for AI agents (becomes `AGENTS.md` in new project)
- **THOUGHTS.project.md** - Project vision and goals template (becomes `THOUGHTS.md` in new project)
- **NEURONS.project.md** - Codebase map template (becomes `NEURONS.md` in new project)
- **fix_plan.md** - Prioritized task checklist template
- **python/** - Python-specific templates (Django, FastAPI, Flask projects)
  - **AGENTS.project.md** - Python project guidance with PEP 8, type hints, testing
  - **THOUGHTS.project.md** - Python project vision template
  - **NEURONS.project.md** - Python project structure map
  - **VALIDATION_CRITERIA.project.md** - Python quality gates (pytest, coverage, linting)
- **backend/** - Backend API templates (Express, FastAPI, Gin, Spring Boot)
  - **AGENTS.project.md** - API project guidance with REST/GraphQL best practices
  - **THOUGHTS.project.md** - Backend service vision template
  - **NEURONS.project.md** - Backend project structure map
  - **VALIDATION_CRITERIA.project.md** - API quality gates (endpoints, security, performance)
- **ralph/** - Ralph loop infrastructure
  - **loop.sh** - Bash loop runner script (determines PLAN/BUILD mode, injects context, watches for completion)
  - **PROMPT.project.md** - Unified prompt template (MODE detection, sentinel logic, bash paths)
  - **IMPLEMENTATION_PLAN.project.md** - Task list template (persistent TODO list)
  - **VALIDATION_CRITERIA.project.md** - Quality gates template (acceptance criteria)
  - **RALPH.md** - Ralph contract documentation template

## Path Convention (CRITICAL)

All templates use **bash-style forward slash paths** for brain repository references to ensure cross-platform compatibility and WSL/Linux support.

### The Standard: `./brain/` (in-workspace brain pack)

RovoDev cannot read files outside its workspace. New projects should vendor Brain runtime + knowledge into the repo under `./brain/` during bootstrap.

To refresh the **skills snapshot** later, run:

```bash
bash brain/workers/ralph/sync_brain_skills.sh --from-sibling
```text

## Cross-Project Pattern Mining (Gap Capture)

Bootstrapped projects can capture missing knowledge locally in `brain/cortex/GAP_CAPTURE.md`.
To flag gaps for ingestion into Brain, touch `brain/cortex/.gap_pending`.

**Helper (recommended):**

```bash
bash brain/workers/ralph/capture_gap.sh "Suggested Skill Name" \
  --type "Pattern" \
  --priority "P1" \
  --why "1-2 lines" \
  --trigger "what you were doing" \
  --evidence "paths/notes"
```text

**Brain-side ingestion:** run `bash cortex/sync_gaps.sh` from the Brain repo to import pending gaps into `skills/self-improvement/skills/self-improvement/GAP_BACKLOG.md`.


Templates use **relative paths with forward slashes**:

```markdown
1. `./brain/skills/SUMMARY.md` - Knowledge base overview
2. `./brain/skills/domains/frontend/react-patterns.md` - Top 10 rules
```text

### Why Forward Slashes?

1. **Cross-platform**: Works natively on WSL, Linux, macOS, and Windows Git Bash
2. **Consistency**: Single standard prevents mixed styles and validation errors
3. **Readability**: Clear and familiar path syntax
4. **Validation**: Automated checks enforce this standard to prevent drift

### Path Depth

Templates are organized at different depths, requiring different numbers of `..` segments:

- **Project root templates** (e.g., `templates/AGENTS.project.md`):
  - Use: `./brain/skills/SUMMARY.md`
  - Depth: Same root-relative path from project root

- **Ralph subdirectory templates** (e.g., `templates/ralph/PROMPT.md`):
  - Use: `./brain/skills/SUMMARY.md`
  - Depth: Same root-relative path from project root

### Examples

**Correct ✅ (Always use forward slashes)**

```markdown
Read `./brain/skills/SUMMARY.md` first (always)
Check `./brain/skills/domains/frontend/react-patterns.md`
```text

**Incorrect ❌ (Anti-patterns to avoid)**

```markdown
# DO NOT USE - Windows-style backslashes break on Linux/WSL
Read `..\\brain\\kb\\SUMMARY.md`

# DO NOT USE - Absolute paths are not portable across systems
Check `/path/to/skills/SUMMARY.md`
```text

## NEW_PROJECT_IDEA.md Format

The `NEW_PROJECT_IDEA.template.md` file defines the standard format for describing new projects to the bootstrap system.

### Required Fields

The bootstrap script (`new-project.sh`) expects this structure:

```markdown
# Project: [Your Project Name]

Location: /absolute/path/to/project/root
Purpose: [Brief description of what this project does and why it exists]
Tech Stack: [Main technologies, frameworks, languages]
Goals: [Key objectives and success criteria]
```text

**Field Descriptions:**

- **Project** (in markdown header): Short project name (becomes directory name if location not specified)
- **Location**: Absolute path where the project should be created (e.g., `/path/to/your-project`)
- **Purpose**: Brief description of what the project does and why it exists
- **Tech Stack**: Primary technologies, frameworks, and languages (e.g., "Next.js, TypeScript, PostgreSQL, Docker")
- **Goals**: Key objectives and success criteria (used to generate initial IMPLEMENTATION_PLAN.md)

### Optional Sections

The template includes optional sections for additional context:

- **Detailed Description**: Expanded purpose, target users, key features, architectural decisions
- **Success Criteria**: Specific metrics or conditions (checklist format recommended)
- **Technical Requirements**: Constraints, dependencies, integration requirements
- **Notes**: Additional context for the AI agent (Ralph)

### Usage Example

Create a project idea file based on the template:

```bash
# Copy template
cp templates/NEW_PROJECT_IDEA.template.md rovo_project_idea.md

# Edit the file with your project details
vim rovo_project_idea.md

# Bootstrap the project
bash scripts/new-project.sh rovo_project_idea.md
```text

**What Happens:**

1. Script reads your project idea file
2. Creates directory structure at specified location
3. Copies template files from `templates/` to new project
4. Invokes HIGH INTELLIGENCE generators to create custom:
   - `THOUGHTS.md` (vision, goals, Definition of Done)
   - `NEURONS.md` (codebase map based on tech stack)
   - `workers/IMPLEMENTATION_PLAN.md` (prioritized tasks from goals)
5. Archives your project idea file to `old_projects/[timestamp]/`
6. New project's Ralph infrastructure is ready to start building

## Template Usage

### Bootstrap New Project

**Policy note:** `new-project.sh` is an **operator workflow** that lives in the Brain repository. Templates consume it, but downstream projects should **not** copy or ship `new-project.sh` as part of their own template scaffolding.

From the brain repository root:

```bash
# Copy and customize the template
cp templates/NEW_PROJECT_IDEA.template.md my_project_idea.md
# Edit my_project_idea.md with your project details

# Bootstrap the project
bash scripts/new-project.sh my_project_idea.md
```text

This creates a complete project structure at the specified location with:

- `AGENTS.md` - Project guidance (from AGENTS.project.md template)
- `THOUGHTS.md` - Custom vision and goals (generated by HIGH INTELLIGENCE)
- `NEURONS.md` - Custom codebase map (generated by HIGH INTELLIGENCE)
- `ralph/` - Complete Ralph loop infrastructure
  - `loop.sh` - Loop runner
  - `PROMPT.md` - Unified prompt with MODE detection
  - `workers/IMPLEMENTATION_PLAN.md` - Custom prioritized tasks (generated by HIGH INTELLIGENCE)
  - `VALIDATION_CRITERIA.md` - Quality gates
  - `RALPH.md` - Ralph contract documentation
- `kb/` - Knowledge base directory (empty, ready to fill)
- `src/` - Source code directory (empty, ready to fill)

### Validation

Before using templates in a new project, validate them:

```powershell
.\validate-templates.ps1
```text

This checks:

- Required template files exist
- Path patterns are correct (depth and format)
- KB file references are valid
- No absolute paths
- Path separator consistency (enforces `./brain/` standard)
- Markdown syntax

## Modifying Templates

When updating templates:

1. **Maintain path standard**: Always use `./brain/` format (bash-style forward slashes)
2. **Test path depth**: Ensure `..` count matches template location
3. **Run validation**: Execute `.\validate-templates.ps1` before committing
4. **Update this README**: Document any new conventions or patterns

## Path Validation Rules

The validation script (`validate-templates.ps1`) enforces:

1. **No mixed styles**: All paths must use `./brain/` format (no backslashes, no absolute paths)
2. **Correct depth**: Paths must match expected depth from template location
3. **Valid KB references**: Referenced files must exist in brain repo
4. **No absolute paths**: No Windows (`C:\`) or Unix (`/home/`) absolute paths
5. **Markdown correctness**: No broken links or incomplete syntax

## Why This Matters

Consistent path formatting ensures:

- **Reliability**: Projects bootstrap correctly every time
- **Maintainability**: Single source of truth for path conventions
- **Validation**: Automated checks prevent human error
- **Documentation**: Clear expectations for template authors

## See Also

- **AGENTS.md** (brain root) - Agent guidance for brain repository
- **new-project.ps1** - Project bootstrap script that uses these templates
- **validate-templates.ps1** - Template validation script
- **kb/conventions.md** - Knowledge base authoring guidelines
