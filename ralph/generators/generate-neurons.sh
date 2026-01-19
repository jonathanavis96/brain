#!/usr/bin/env bash
set -euo pipefail

# generate-neurons.sh - HIGH INTELLIGENCE generator for custom NEURONS.md
# Usage: bash generate-neurons.sh INPUT_IDEA.md OUTPUT_NEURONS.md

if [ $# -ne 2 ]; then
    echo "Usage: bash generate-neurons.sh INPUT_IDEA.md OUTPUT_NEURONS.md"
    exit 1
fi

IDEA_FILE="$1"
OUTPUT_FILE="$2"

if [ ! -f "$IDEA_FILE" ]; then
    echo "Error: Input file not found: $IDEA_FILE"
    exit 1
fi

# Extract fields from NEW_PROJECT_IDEA.md
extract_field() {
    local field="$1"
    local file="$2"
    grep -i "^${field}:" "$file" | head -1 | sed "s/^${field}://i" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

extract_project_name() {
    local file="$1"
    if grep -q "^# Project:" "$file"; then
        grep "^# Project:" "$file" | head -1 | sed 's/^# Project://i' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
    else
        extract_field "Project" "$file"
    fi
}

PROJECT_NAME=$(extract_project_name "$IDEA_FILE")
PROJECT_LOCATION=$(extract_field "Location" "$IDEA_FILE")
PROJECT_PURPOSE=$(extract_field "Purpose" "$IDEA_FILE")
PROJECT_TECH=$(extract_field "Tech Stack" "$IDEA_FILE")
PROJECT_GOALS=$(extract_field "Goals" "$IDEA_FILE")

# Default to project name if location not found
if [ -z "$PROJECT_LOCATION" ]; then
    PROJECT_LOCATION="/path/to/${PROJECT_NAME}"
fi

# HIGH INTELLIGENCE: Infer project type from tech stack
infer_project_type() {
    local tech="$1"
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    if echo "$tech_lower" | grep -qE "(next\.?js|react|vue|angular|svelte)"; then
        echo "web-app"
    elif echo "$tech_lower" | grep -qE "(django|fastapi|flask)"; then
        echo "python-web"
    elif echo "$tech_lower" | grep -qE "(fastapi|flask|express|node\.?js|gin|spring)"; then
        echo "api"
    elif echo "$tech_lower" | grep -qE "(cli|command.?line|argparse|click|typer)"; then
        echo "cli"
    elif echo "$tech_lower" | grep -qE "(selenium|puppeteer|playwright|automation|cron|systemd)"; then
        echo "automation"
    elif echo "$tech_lower" | grep -qE "(docker|kubernetes|terraform|ansible|infrastructure)"; then
        echo "infrastructure"
    elif echo "$tech_lower" | grep -qE "(python)" && echo "$tech_lower" | grep -qv "django\|fastapi\|flask\|next\|react\|vue"; then
        echo "python-general"
    elif echo "$tech_lower" | grep -qE "(bash|powershell|ruby|perl)" && echo "$tech_lower" | grep -qv "next\|react\|vue"; then
        echo "script"
    else
        echo "general"
    fi
}

PROJECT_TYPE=$(infer_project_type "$PROJECT_TECH")

# HIGH INTELLIGENCE: Infer directory structure from tech stack
generate_directory_structure() {
    local tech="$1"
    local project_type="$2"
    local location="$3"
    
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    cat << 'EOF'
```
EOF
    
    echo "${location}/"
    echo "├── README.md                    # Project overview and setup"
    
    # Type-specific structure
    case "$project_type" in
        web-app)
            if echo "$tech_lower" | grep -q "next\.?js"; then
                cat << 'NEXTJS'
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.tsx             # Home page
│   │   ├── layout.tsx           # Root layout
│   │   └── api/                 # API routes
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI components
│   │   └── features/            # Feature-specific components
│   ├── lib/                     # Utility functions
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript type definitions
│   └── styles/                  # Global styles
├── public/                      # Static assets
├── tests/                       # Test files
NEXTJS
                if echo "$tech_lower" | grep -q "typescript"; then
                    echo "├── tsconfig.json               # TypeScript configuration"
                fi
                echo "├── package.json                # Dependencies"
                echo "├── next.config.js              # Next.js configuration"
            else
                cat << 'REACT'
├── src/
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   ├── utils/                   # Utility functions
│   ├── hooks/                   # Custom React hooks
│   ├── styles/                  # Stylesheets
│   └── App.tsx                  # Root component
├── public/                      # Static assets
├── tests/                       # Test files
├── package.json                # Dependencies
REACT
            fi
            ;;
        python-web)
            if echo "$tech_lower" | grep -q "django"; then
                cat << 'DJANGO'
├── [project_name]/              # Django project directory
│   ├── settings.py              # Project settings
│   ├── urls.py                  # URL routing
│   ├── wsgi.py                  # WSGI application
│   └── asgi.py                  # ASGI application
├── [app_name]/                  # Django app(s)
│   ├── models.py                # Database models
│   ├── views.py                 # View functions/classes
│   ├── urls.py                  # App URL patterns
│   ├── admin.py                 # Admin configuration
│   ├── forms.py                 # Form definitions
│   └── migrations/              # Database migrations
├── templates/                   # HTML templates
├── static/                      # Static files (CSS, JS, images)
├── tests/                       # Test files
├── requirements.txt             # Python dependencies
├── manage.py                    # Django management script
DJANGO
            elif echo "$tech_lower" | grep -q "fastapi"; then
                cat << 'FASTAPI'
├── app/
│   ├── __init__.py              # App initialization
│   ├── main.py                  # FastAPI application entry point
│   ├── api/                     # API routes
│   │   ├── __init__.py
│   │   └── routes/              # Endpoint handlers
│   ├── models/                  # Pydantic models
│   ├── schemas/                 # Request/response schemas
│   ├── services/                # Business logic
│   ├── db/                      # Database models and connection
│   └── config/                  # Configuration
├── tests/                       # Test files
├── requirements.txt             # Python dependencies
FASTAPI
            else
                cat << 'FLASK'
├── app/
│   ├── __init__.py              # App factory
│   ├── routes.py                # Route handlers
│   ├── models.py                # Database models
│   ├── forms.py                 # WTForms definitions
│   └── templates/               # Jinja2 templates
├── tests/                       # Test files
├── requirements.txt             # Python dependencies
├── config.py                    # Configuration
FLASK
            fi
            ;;
        python-general)
            cat << 'PYTHON_GEN'
├── [package_name]/              # Main Python package
│   ├── __init__.py              # Package initialization
│   ├── __main__.py              # Entry point for python -m
│   ├── core/                    # Core business logic
│   ├── utils/                   # Utility functions
│   └── config/                  # Configuration
├── tests/                       # Test files
│   ├── __init__.py
│   ├── conftest.py              # pytest fixtures
│   └── test_*.py                # Test modules
├── requirements.txt             # Python dependencies
├── setup.py                     # Package setup (optional)
├── pyproject.toml               # Modern Python config (optional)
PYTHON_GEN
            ;;
        api)
            if echo "$tech_lower" | grep -qE "(fastapi|flask|django)"; then
                cat << 'PYTHON_API'
├── src/
│   ├── api/                     # API endpoints
│   │   ├── routes/              # Route handlers
│   │   └── models/              # Data models
│   ├── services/                # Business logic
│   ├── utils/                   # Utility functions
│   └── config/                  # Configuration
├── tests/                       # Test files
├── requirements.txt            # Python dependencies
PYTHON_API
            elif echo "$tech_lower" | grep -qE "(express|node\.?js)"; then
                cat << 'NODE_API'
├── src/
│   ├── routes/                  # API routes
│   ├── controllers/             # Request handlers
│   ├── models/                  # Data models
│   ├── middleware/              # Express middleware
│   ├── services/                # Business logic
│   └── utils/                   # Utility functions
├── tests/                       # Test files
├── package.json                # Dependencies
NODE_API
            fi
            ;;
        cli)
            cat << 'CLI'
├── src/
│   ├── commands/                # CLI command implementations
│   ├── utils/                   # Helper functions
│   └── main.py|ts|go            # Entry point
├── tests/                       # Test files
CLI
            ;;
        automation)
            cat << 'AUTOMATION'
├── scripts/                     # Automation scripts
│   ├── setup.sh                 # Environment setup
│   └── run.sh                   # Execution script
├── src/                         # Source code
│   ├── tasks/                   # Task implementations
│   └── utils/                   # Helper functions
├── config/                      # Configuration files
├── logs/                        # Execution logs
├── tests/                       # Test files
AUTOMATION
            ;;
        infrastructure)
            cat << 'INFRA'
├── terraform/                   # Infrastructure as code
│   ├── modules/                 # Reusable modules
│   └── environments/            # Environment configs
├── ansible/                     # Configuration management
├── docker/                      # Docker configurations
├── scripts/                     # Deployment scripts
├── docs/                        # Documentation
INFRA
            ;;
        script)
            cat << 'SCRIPT'
├── scripts/                     # Main scripts
├── lib/                         # Shared libraries
├── config/                      # Configuration files
├── logs/                        # Execution logs
├── tests/                       # Test files
SCRIPT
            ;;
        *)
            cat << 'GENERAL'
├── src/                         # Source code
├── tests/                       # Test files
├── docs/                        # Documentation
├── config/                      # Configuration
GENERAL
            ;;
    esac
    
    # Ralph infrastructure (always present)
    cat << 'RALPH'
│
├── ralph/                       # Ralph loop infrastructure
│   ├── AGENTS.md                # Operational guide
│   ├── NEURONS.md               # This file (codebase map)
│   ├── THOUGHTS.md              # Project vision and goals
│   ├── PROMPT.md                # Ralph instructions
│   ├── IMPLEMENTATION_PLAN.md   # TODO list
│   ├── VALIDATION_CRITERIA.md   # Quality gates
│   ├── loop.sh                  # Ralph loop runner
│   └── logs/                    # Ralph execution logs
RALPH
    
    # Common files
    echo "│"
    if echo "$tech_lower" | grep -q "docker"; then
        echo "├── Dockerfile                  # Container definition"
        echo "├── docker-compose.yml          # Multi-container setup"
    fi
    echo "├── .gitignore                  # Git ignore rules"
    echo "└── LICENSE                     # Project license"
    
    cat << 'EOF'
```
EOF
}

# HIGH INTELLIGENCE: Infer file types and conventions from tech stack
generate_file_conventions() {
    local tech="$1"
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    echo "### File Types & Conventions"
    echo ""
    
    # Language-specific conventions
    if echo "$tech_lower" | grep -q "typescript"; then
        cat << 'TS'
**TypeScript Files:**
- `.ts` - TypeScript source files
- `.tsx` - TypeScript with JSX (React components)
- `tsconfig.json` - TypeScript compiler configuration
- Use strict mode for type safety
- Define interfaces in `types/` directory

TS
    fi
    
    if echo "$tech_lower" | grep -q "python"; then
        cat << 'PYTHON'
**Python Files:**
- `.py` - Python source files
- `requirements.txt` or `pyproject.toml` - Dependencies
- Follow PEP 8 style guide
- Use type hints for function signatures
- Organize modules by domain/feature

PYTHON
    fi
    
    if echo "$tech_lower" | grep -qE "(bash|shell)"; then
        cat << 'BASH'
**Bash Scripts:**
- `.sh` - Shell scripts
- Use `#!/usr/bin/env bash` shebang
- Enable strict mode: `set -euo pipefail`
- Quote variables: `"$VAR"` not `$VAR`

BASH
    fi
    
    if echo "$tech_lower" | grep -q "powershell"; then
        cat << 'PS'
**PowerShell Scripts:**
- `.ps1` - PowerShell scripts
- Use `Set-StrictMode -Version Latest`
- Follow verb-noun naming: `Get-Data`, `Set-Config`
- Use approved verbs from `Get-Verb`

PS
    fi
    
    # Testing conventions
    echo "**Testing:**"
    if echo "$tech_lower" | grep -qE "(jest|vitest)"; then
        echo "- Test files: \`*.test.ts\` or \`*.spec.ts\`"
        echo "- Location: Adjacent to source or in \`tests/\`"
    elif echo "$tech_lower" | grep -q "pytest"; then
        echo "- Test files: \`test_*.py\` or \`*_test.py\`"
        echo "- Location: \`tests/\` directory"
    else
        echo "- Test files: Follow language conventions"
        echo "- Location: \`tests/\` directory"
    fi
    echo ""
}

# HIGH INTELLIGENCE: Generate quick reference commands
generate_quick_reference() {
    local tech="$1"
    local project_type="$2"
    
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    cat << 'EOF'
## Quick Reference Lookup

### "I need to..."

| Task | Check Here |
|------|------------|
EOF
    
    echo "| **Understand project structure** | \`NEURONS.md\` (this file) |"
    echo "| **Run Ralph loop** | \`ralph/AGENTS.md\` → \`bash ralph/loop.sh\` |"
    echo "| **Find TODO list** | \`ralph/IMPLEMENTATION_PLAN.md\` |"
    echo "| **Check project goals** | \`ralph/THOUGHTS.md\` |"
    echo "| **See validation criteria** | \`ralph/VALIDATION_CRITERIA.md\` |"
    
    case "$project_type" in
        web-app)
            echo "| **Find components** | \`src/components/\` |"
            echo "| **Add new page** | \`src/app/\` (App Router) or \`src/pages/\` |"
            echo "| **Add API route** | \`src/app/api/\` or \`src/pages/api/\` |"
            echo "| **Add utilities** | \`src/lib/\` or \`src/utils/\` |"
            ;;
        python-web)
            echo "| **Find models** | \`app/models.py\` or \`[app]/models.py\` |"
            echo "| **Find views/routes** | \`app/views.py\` or \`app/routes.py\` or \`app/api/routes/\` |"
            echo "| **Add business logic** | \`app/services/\` |"
            echo "| **Database migrations** | \`python manage.py makemigrations\` (Django) or \`alembic revision\` |"
            ;;
        python-general)
            echo "| **Find main logic** | \`[package]/core/\` or \`[package]/__main__.py\` |"
            echo "| **Add utilities** | \`[package]/utils/\` |"
            echo "| **Add tests** | \`tests/test_*.py\` |"
            echo "| **Run tests** | \`pytest\` or \`python -m unittest\` |"
            ;;
        api)
            echo "| **Find API routes** | \`src/api/routes/\` or \`src/routes/\` |"
            echo "| **Find data models** | \`src/api/models/\` or \`src/models/\` |"
            echo "| **Add business logic** | \`src/services/\` |"
            ;;
        automation)
            echo "| **Find automation tasks** | \`src/tasks/\` or \`scripts/\` |"
            echo "| **Check logs** | \`logs/\` |"
            echo "| **Update config** | \`config/\` |"
            ;;
        cli)
            echo "| **Find CLI commands** | \`src/commands/\` |"
            echo "| **Entry point** | \`src/main.*\` |"
            ;;
    esac
    
    echo "| **Run tests** | See validation commands below |"
    echo "| **Brain Skills patterns** | \`../../brain/skills/SUMMARY.md\` |"
    echo ""
}

# HIGH INTELLIGENCE: Generate validation commands
generate_validation_commands() {
    local tech="$1"
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    echo "## Validation Commands"
    echo ""
    echo "\`\`\`bash"
    echo "# File structure check"
    
    if echo "$tech_lower" | grep -qE "(next\.?js|react)"; then
        echo "ls -la src/ public/ tests/"
    elif echo "$tech_lower" | grep -qE "(python|fastapi|flask|django)"; then
        echo "ls -la src/ tests/"
    else
        echo "ls -la src/ scripts/ tests/"
    fi
    
    echo ""
    echo "# Run tests"
    if echo "$tech_lower" | grep -qE "(jest|vitest)"; then
        echo "npm test"
    elif echo "$tech_lower" | grep -q "pytest"; then
        echo "pytest tests/"
    elif echo "$tech_lower" | grep -q "go"; then
        echo "go test ./..."
    else
        echo "# Run project-specific test command"
    fi
    
    echo ""
    echo "# Lint check"
    if echo "$tech_lower" | grep -q "typescript"; then
        echo "npm run lint"
    elif echo "$tech_lower" | grep -q "python"; then
        echo "flake8 src/ tests/ || pylint src/ tests/"
    elif echo "$tech_lower" | grep -q "bash"; then
        echo "shellcheck scripts/*.sh"
    fi
    
    echo ""
    echo "# Build check"
    if echo "$tech_lower" | grep -qE "(next\.?js|react)"; then
        echo "npm run build"
    elif echo "$tech_lower" | grep -q "typescript"; then
        echo "tsc --noEmit"
    elif echo "$tech_lower" | grep -q "go"; then
        echo "go build ./..."
    fi
    
    echo ""
    echo "# Ralph infrastructure"
    echo "bash -n ralph/loop.sh"
    echo "ls -lh ralph/AGENTS.md ralph/NEURONS.md ralph/THOUGHTS.md ralph/PROMPT.md ralph/IMPLEMENTATION_PLAN.md"
    echo "\`\`\`"
    echo ""
}

# Generate the complete NEURONS.md file
cat > "$OUTPUT_FILE" << EOF
# NEURONS.md - ${PROJECT_NAME} Repository Map

**Read via subagent** - This is the codebase map for Ralph. Not loaded in first context.

## Purpose
This is the **${PROJECT_NAME} map** that Ralph and all agents read on-demand when needed. It maps the entire project structure, tells you where everything lives, and provides quick lookup for common tasks.

## Navigation Rules (Read This First)
**Deterministic Context Loading Order:**
1. \`PROMPT.md\` (loaded first by loop.sh - contains conditional logic for plan/build modes)
2. \`AGENTS.md\` (operational guide - how to run Ralph)
3. \`NEURONS.md\` (this file - read via subagent when needed, NOT in first-load context)
4. \`IMPLEMENTATION_PLAN.md\` (TODO list - read in BUILD mode)
5. \`THOUGHTS.md\` (project goals and success criteria - read as needed)

**Progressive Disclosure:** Start broad, drill down only when needed. Don't read everything at once.

---

## Repository Layout

$(generate_directory_structure "$PROJECT_TECH" "$PROJECT_TYPE" "$PROJECT_LOCATION")

---

$(generate_quick_reference "$PROJECT_TECH" "$PROJECT_TYPE")

### "Where do I put..."

| Content Type | Location | Notes |
|--------------|----------|-------|
EOF

# Context-aware "where do I put" section (ENHANCED with goal awareness)
goals_lower=$(echo "$PROJECT_GOALS" | tr '[:upper:]' '[:lower:]')

case "$PROJECT_TYPE" in
    web-app)
        cat >> "$OUTPUT_FILE" << 'WEBAPP_WHERE'
| **New React component** | `src/components/` | Feature-specific in `features/`, reusable in `ui/` |
| **New page** | `src/app/` or `src/pages/` | App Router uses `src/app/`, Pages Router uses `src/pages/` |
| **API endpoint** | `src/app/api/` or `src/pages/api/` | Server-side API routes |
| **Utility function** | `src/lib/` or `src/utils/` | Pure functions, no side effects |
| **Custom hook** | `src/hooks/` | Reusable React hooks |
| **Type definitions** | `src/types/` | TypeScript interfaces and types |
| **Static assets** | `public/` | Images, fonts, favicons |
WEBAPP_WHERE
        
        # Add goal-specific guidance
        if echo "$goals_lower" | grep -qE "auth|login|user"; then
            echo "| **Auth components** | \`src/components/auth/\` | Login forms, protected routes, user menus |" >> "$OUTPUT_FILE"
            echo "| **Auth API routes** | \`src/app/api/auth/\` | Registration, login, session endpoints |" >> "$OUTPUT_FILE"
        fi
        if echo "$goals_lower" | grep -qE "dashboard|analytics"; then
            echo "| **Dashboard components** | \`src/components/dashboard/\` | Charts, widgets, data displays |" >> "$OUTPUT_FILE"
            echo "| **Analytics utilities** | \`src/lib/analytics/\` | Data aggregation, calculations |" >> "$OUTPUT_FILE"
        fi
        if echo "$goals_lower" | grep -qE "form|input|upload"; then
            echo "| **Form components** | \`src/components/forms/\` | Reusable form inputs, validation |" >> "$OUTPUT_FILE"
            echo "| **Upload handlers** | \`src/lib/upload/\` | File upload logic, S3 integration |" >> "$OUTPUT_FILE"
        fi
        ;;
    api)
        cat >> "$OUTPUT_FILE" << 'API_WHERE'
| **New API endpoint** | `src/api/routes/` or `src/routes/` | Route handlers and definitions |
| **Data model** | `src/api/models/` or `src/models/` | Database schemas and models |
| **Business logic** | `src/services/` | Service layer, no HTTP concerns |
| **Middleware** | `src/middleware/` | Request/response processing |
| **Utility function** | `src/utils/` | Helper functions |
| **Configuration** | `src/config/` | App configuration and settings |
API_WHERE
        
        # Add goal-specific guidance
        if echo "$goals_lower" | grep -qE "auth|login|jwt|token"; then
            echo "| **Auth middleware** | \`src/middleware/auth/\` | JWT validation, role checks |" >> "$OUTPUT_FILE"
            echo "| **User service** | \`src/services/user/\` | User management logic |" >> "$OUTPUT_FILE"
        fi
        if echo "$goals_lower" | grep -qE "webhook|integration|external"; then
            echo "| **Webhook handlers** | \`src/api/webhooks/\` | External service integrations |" >> "$OUTPUT_FILE"
            echo "| **Integration clients** | \`src/clients/\` | Third-party API wrappers |" >> "$OUTPUT_FILE"
        fi
        if echo "$goals_lower" | grep -qE "payment|billing|stripe"; then
            echo "| **Payment service** | \`src/services/payment/\` | Payment processing logic |" >> "$OUTPUT_FILE"
            echo "| **Stripe webhooks** | \`src/api/webhooks/stripe/\` | Payment event handlers |" >> "$OUTPUT_FILE"
        fi
        ;;
    automation)
        cat >> "$OUTPUT_FILE" << 'AUTO_WHERE'
| **Automation task** | `src/tasks/` or `scripts/` | Task implementations |
| **Configuration** | `config/` | Task settings and credentials |
| **Utility function** | `src/utils/` | Helper functions |
| **Logs** | `logs/` | Execution logs and outputs |
AUTO_WHERE
        ;;
    cli)
        cat >> "$OUTPUT_FILE" << 'CLI_WHERE'
| **CLI command** | `src/commands/` | Command implementations |
| **Utility function** | `src/utils/` | Helper functions |
| **Configuration** | `config/` | CLI settings |
CLI_WHERE
        ;;
    *)
        cat >> "$OUTPUT_FILE" << 'GENERAL_WHERE'
| **Source code** | `src/` | Main application code |
| **Configuration** | `config/` | App settings |
| **Utility function** | `src/utils/` or `lib/` | Helper functions |
GENERAL_WHERE
        ;;
esac

cat >> "$OUTPUT_FILE" << 'EOF'
| **Test files** | `tests/` | Unit, integration, e2e tests |
| **Documentation** | `docs/` or `README.md` | Project documentation |
| **Ralph plans** | `ralph/IMPLEMENTATION_PLAN.md` | Task tracking |
| **Ralph logs** | `ralph/logs/` | Execution transcripts |

---

EOF

# Add file conventions
generate_file_conventions "$PROJECT_TECH" >> "$OUTPUT_FILE"

cat >> "$OUTPUT_FILE" << 'EOF'

---

EOF

# Add validation commands
generate_validation_commands "$PROJECT_TECH" >> "$OUTPUT_FILE"

cat >> "$OUTPUT_FILE" << 'EOF'

---

## Path Conventions

**From Ralph's perspective (in `ralph/` subdirectory):**
- Brain KB: \`../../brain/skills/SUMMARY.md\`
- Brain references: `../../brain/references/react-best-practices/HOTLIST.md`
- Brain templates: `../../brain/templates/`
- Project root: `../` (one level up from ralph/)
- This file: `NEURONS.md` (in ralph/ directory)

**From project root:**
- Ralph directory: `ralph/`
- Source code: `src/` or language-specific directory
- Tests: `tests/` or adjacent to source

---

## Brain Integration

This project uses the shared **brain** repository for knowledge and patterns:

**Brain Location:** `/home/grafe/code/brain/`

**Key Brain Resources:**
- **KB Index:** \`../../brain/skills/SUMMARY.md\`
- **React Best Practices:** `../../brain/references/react-best-practices/HOTLIST.md`
- **Ralph Patterns:** \`../../brain/skills/domains/ralph-patterns.md\`
- **Auth Patterns:** \`../../brain/skills/domains/auth-patterns.md\`

**Reading Brain Content:**
Always use the entry points (SUMMARY.md, HOTLIST.md, INDEX.md) before diving into specific files. The brain uses progressive disclosure.

---

## Key Insights

EOF

# Add project-specific insights
cat >> "$OUTPUT_FILE" << EOF
**This is a ${PROJECT_TYPE} project** using ${PROJECT_TECH}.

**Primary Purpose:** ${PROJECT_PURPOSE}

**Directory Strategy:** 
EOF

case "$PROJECT_TYPE" in
    web-app)
        echo "- Component-based architecture" >> "$OUTPUT_FILE"
        echo "- Separate UI components from feature logic" >> "$OUTPUT_FILE"
        echo "- Use hooks for state management and side effects" >> "$OUTPUT_FILE"
        ;;
    api)
        echo "- Layered architecture (routes → controllers → services → models)" >> "$OUTPUT_FILE"
        echo "- Keep business logic in services, not routes" >> "$OUTPUT_FILE"
        echo "- Use middleware for cross-cutting concerns" >> "$OUTPUT_FILE"
        ;;
    automation)
        echo "- Task-based organization" >> "$OUTPUT_FILE"
        echo "- Separate configuration from logic" >> "$OUTPUT_FILE"
        echo "- Log everything for debugging" >> "$OUTPUT_FILE"
        ;;
    cli)
        echo "- Command-based structure" >> "$OUTPUT_FILE"
        echo "- Clear separation of command handlers and utilities" >> "$OUTPUT_FILE"
        ;;
esac

cat >> "$OUTPUT_FILE" << 'EOF'

**File Discovery Pattern:**
1. Check NEURONS.md (this file) for high-level structure
2. Use Quick Reference Lookup above for specific tasks
3. Read IMPLEMENTATION_PLAN.md for current work
4. Consult brain KB for patterns and best practices

**Don't Assume Missing:**
Always search the codebase before creating new functionality. Use grep extensively.

EOF

echo "✅ Generated custom NEURONS.md at: $OUTPUT_FILE"
