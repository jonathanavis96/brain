#!/usr/bin/env bash
set -euo pipefail

# generate-implementation-plan.sh - HIGH INTELLIGENCE generator for custom IMPLEMENTATION_PLAN.md
# Usage: bash generate-implementation-plan.sh INPUT_IDEA.md OUTPUT_IMPLEMENTATION_PLAN.md

if [ $# -ne 2 ]; then
    echo "Usage: bash generate-implementation-plan.sh INPUT_IDEA.md OUTPUT_IMPLEMENTATION_PLAN.md"
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

# Extract section content (multi-line)
extract_section() {
    local header="$1"
    local file="$2"
    awk -v header="$header" '
        $0 ~ "^## " header {found=1; next}
        found && /^## / {found=0}
        found && NF {print}
    ' "$file"
}

PROJECT_NAME=$(extract_project_name "$IDEA_FILE")
PROJECT_PURPOSE=$(extract_field "Purpose" "$IDEA_FILE")
PROJECT_TECH=$(extract_field "Tech Stack" "$IDEA_FILE")
PROJECT_GOALS=$(extract_field "Goals" "$IDEA_FILE")
DETAILED_DESC=$(extract_section "Detailed Description" "$IDEA_FILE")
SUCCESS_CRITERIA=$(extract_section "Success Criteria" "$IDEA_FILE")
TECH_REQS=$(extract_section "Technical Requirements" "$IDEA_FILE")

# Validate required fields
if [ -z "$PROJECT_NAME" ]; then
    echo "Error: PROJECT_NAME is required. Add 'Project: <name>' or '# Project: <name>' to $IDEA_FILE"
    exit 1
fi

if [ -z "$PROJECT_TECH" ]; then
    echo "Error: Tech Stack is required. Add 'Tech Stack: <technologies>' to $IDEA_FILE"
    exit 1
fi

if [ -z "$PROJECT_PURPOSE" ]; then
    echo "Error: Purpose is required. Add 'Purpose: <description>' to $IDEA_FILE"
    exit 1
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

# HIGH INTELLIGENCE: Parse goals into structured tasks
parse_goals_into_tasks() {
    local goals="$1"
    local tech="$2"
    local project_type="$3"
    
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    # Split goals by common delimiters (commas, semicolons, "and")
    # This is a simplistic parser - handles common patterns
    echo "$goals" | sed 's/,\s*/\n/g; s/;\s*/\n/g; s/\band\b/\n/g' | grep -v '^[[:space:]]*$'
}

# HIGH INTELLIGENCE: Generate phase structure based on project type
generate_phases() {
    local project_type="$1"
    local tech="$2"
    local goals="$3"
    
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    # Always start with Phase 1: Setup
    cat << 'EOF'
### High Priority - Phase 1: Project Setup & Foundation

EOF
    
    case "$project_type" in
        web-app)
            cat << 'WEBAPP'
- [ ] **Task 1:** Initialize project structure
  - Set up package.json with required dependencies
  - Configure TypeScript (if applicable)
  - Set up linting (ESLint) and formatting (Prettier)
  - Create basic directory structure (src/, public/, tests/)
  - Target: Project builds successfully, npm install works

- [ ] **Task 2:** Configure development environment
  - Set up development server
  - Configure hot module replacement
  - Add environment variable handling (.env files)
  - Set up basic routing structure
  - Target: Development server runs, can view basic page

- [ ] **Task 3:** Implement core layout and navigation
  - Create root layout component
  - Implement basic navigation structure
  - Set up responsive design foundation
  - Add global styles and theme configuration
  - Target: Can navigate between placeholder pages

WEBAPP
            ;;
        
        api)
            cat << 'API'
- [ ] **Task 1:** Initialize API project structure
  - Set up project framework (Express/FastAPI/etc.)
  - Configure database connection
  - Set up environment variable handling
  - Create basic directory structure (routes/, models/, controllers/)
  - Target: API server starts successfully

- [ ] **Task 2:** Implement core middleware and utilities
  - Add request logging middleware
  - Implement error handling middleware
  - Set up authentication/authorization framework
  - Configure CORS and security headers
  - Target: Middleware stack functional, basic health check endpoint works

- [ ] **Task 3:** Design and implement data models
  - Define database schema
  - Create ORM models or database migrations
  - Implement data validation
  - Set up database seeding for development
  - Target: Can create/read/update/delete basic entities

API
            ;;
        
        automation)
            cat << 'AUTO'
- [ ] **Task 1:** Set up automation project structure
  - Create scripts/ directory with organization by function
  - Set up configuration file handling (YAML, JSON, or .env)
  - Implement logging infrastructure
  - Create lib/ directory for shared functions
  - Target: Basic script structure in place, can execute hello-world script

- [ ] **Task 2:** Implement core automation utilities
  - Create error handling and retry logic
  - Implement file system utilities (reading configs, writing logs)
  - Set up credential/secret management (GPG, vault, or secure storage)
  - Add progress tracking and status reporting
  - Target: Utility functions work, can handle errors gracefully

- [ ] **Task 3:** Build first automation workflow
  - Identify highest-priority automation task from goals
  - Implement core logic for primary automation
  - Add input validation and safety checks
  - Create dry-run mode for testing
  - Target: First workflow executes successfully in dry-run mode

AUTO
            ;;
        
        cli)
            cat << 'CLI'
- [ ] **Task 1:** Set up CLI project structure
  - Initialize CLI framework (argparse, Click, Commander, etc.)
  - Set up command structure and routing
  - Implement help text and usage documentation
  - Create basic directory structure
  - Target: CLI runs, shows help text, accepts --version flag

- [ ] **Task 2:** Implement core CLI utilities
  - Add colored output and formatting utilities
  - Implement progress indicators and spinners
  - Set up configuration file handling (~/.config or project-specific)
  - Add error handling and user-friendly error messages
  - Target: CLI has polished UX, handles errors gracefully

- [ ] **Task 3:** Build first primary command
  - Implement highest-priority command from goals
  - Add argument parsing and validation
  - Implement core business logic
  - Add success/failure feedback
  - Target: First command works end-to-end

CLI
            ;;
        
        infrastructure)
            cat << 'INFRA'
- [ ] **Task 1:** Set up infrastructure-as-code structure
  - Initialize IaC tooling (Terraform init, Ansible structure, etc.)
  - Create directory structure (modules/, roles/, environments/)
  - Set up state management (remote backend for Terraform)
  - Create development/staging/production environments
  - Target: IaC structure validated, can run plan/check commands

- [ ] **Task 2:** Define core infrastructure modules
  - Create base networking module (VPC, subnets, security groups)
  - Define compute resources (instances, containers, serverless)
  - Set up storage resources (buckets, volumes, databases)
  - Add monitoring and logging infrastructure
  - Target: Core modules defined, pass validation checks

- [ ] **Task 3:** Implement deployment automation
  - Create deployment scripts/pipelines
  - Add environment variable and secret management
  - Implement rollback procedures
  - Add smoke tests for infrastructure
  - Target: Can deploy infrastructure to dev environment

INFRA
            ;;
        
        script)
            cat << 'SCRIPT'
- [ ] **Task 1:** Create basic script structure
  - Set up main script file with proper shebang
  - Implement argument parsing
  - Add usage/help documentation
  - Create lib/ directory for functions
  - Target: Script executes, shows help, validates arguments

- [ ] **Task 2:** Implement core functionality
  - Build main business logic based on purpose
  - Add error handling and validation
  - Implement logging to file or stdout
  - Add dry-run/test mode
  - Target: Core functionality works for basic use case

- [ ] **Task 3:** Add robustness and utilities
  - Implement retry logic for flaky operations
  - Add comprehensive error messages
  - Create configuration file support
  - Add examples and documentation
  - Target: Script handles edge cases, well-documented

SCRIPT
            ;;
        
        *)
            cat << 'GENERAL'
- [ ] **Task 1:** Set up project structure
  - Create directory layout based on project needs
  - Initialize version control (git)
  - Set up configuration management
  - Create README with project overview
  - Target: Project structure established, documented

- [ ] **Task 2:** Implement core functionality
  - Build primary feature or capability
  - Add error handling
  - Create basic documentation
  - Set up development workflow
  - Target: Core feature works for basic use case

- [ ] **Task 3:** Add testing and validation
  - Create test cases for core functionality
  - Implement validation logic
  - Add example usage or demos
  - Document testing procedures
  - Target: Core functionality tested and validated

GENERAL
            ;;
    esac
}

# HIGH INTELLIGENCE: Parse goals and create feature tasks (ENHANCED)
generate_feature_tasks() {
    local goals="$1"
    local project_type="$2"
    local tech="$3"
    
    cat << 'EOF'

### Medium Priority - Phase 2: Core Features

EOF
    
    if [ -n "$goals" ]; then
        # Parse goals into individual tasks
        local task_num=4
        while IFS= read -r goal; do
            goal=$(echo "$goal" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            [ -z "$goal" ] && continue
            
            # Clean up goal text (remove "achieve", "build", etc. if at start)
            goal=$(echo "$goal" | sed 's/^[Aa]chieve\s*//; s/^[Bb]uild\s*//; s/^[Ii]mplement\s*//; s/^[Cc]reate\s*//')
            
            # Capitalize first letter
            goal="$(echo "${goal:0:1}" | tr '[:lower:]' '[:upper:]')${goal:1}"
            
            # ENHANCED: Generate context-aware subtasks based on project type and tech stack
            echo "- [ ] **Task ${task_num}:** ${goal}"
            
            # Infer what this goal likely requires based on keywords and project type
            local goal_lower=$(echo "$goal" | tr '[:upper:]' '[:lower:]')
            
            # Authentication/Authorization goals
            if echo "$goal_lower" | grep -qE "auth|login|sign.?in|sign.?up|register|user.?management"; then
                echo "  - Design authentication flow (JWT, session-based, or OAuth2)"
                echo "  - Implement user registration with validation"
                echo "  - Create login/logout endpoints or pages"
                echo "  - Add password hashing and secure storage"
                echo "  - Implement protected routes/endpoints"
                echo "  - Add authentication tests"
            # Database/Data goals
            elif echo "$goal_lower" | grep -qE "database|data.?model|schema|persist|store|crud"; then
                echo "  - Design database schema (tables, relationships, indexes)"
                echo "  - Set up database connection and migrations"
                echo "  - Implement data models with validation"
                echo "  - Create CRUD operations for core entities"
                echo "  - Add database transaction handling"
                echo "  - Write data layer tests"
            # API/Integration goals
            elif echo "$goal_lower" | grep -qE "api|endpoint|integration|webhook|third.?party"; then
                echo "  - Design API contract (request/response schemas)"
                echo "  - Implement API endpoints with proper HTTP methods"
                echo "  - Add request validation and error handling"
                echo "  - Implement rate limiting and authentication"
                echo "  - Add API documentation (OpenAPI/Swagger)"
                echo "  - Write API integration tests"
            # UI/Frontend goals
            elif echo "$goal_lower" | grep -qE "ui|interface|page|component|view|dashboard|form"; then
                echo "  - Design UI wireframes and component structure"
                echo "  - Implement reusable UI components"
                echo "  - Add form validation and error display"
                echo "  - Implement responsive layout (mobile/tablet/desktop)"
                echo "  - Add loading states and error boundaries"
                echo "  - Write component tests"
            # Search/Filter goals
            elif echo "$goal_lower" | grep -qE "search|filter|query|find|lookup"; then
                echo "  - Design search algorithm and query interface"
                echo "  - Implement search indexing (if needed)"
                echo "  - Add filter options with proper validation"
                echo "  - Implement pagination and sorting"
                echo "  - Optimize search performance"
                echo "  - Add search result tests"
            # Notification/Email goals
            elif echo "$goal_lower" | grep -qE "notif|email|alert|message|mail"; then
                echo "  - Set up notification service/provider"
                echo "  - Design notification templates"
                echo "  - Implement notification triggers"
                echo "  - Add notification delivery queue"
                echo "  - Implement user notification preferences"
                echo "  - Test notification delivery"
            # File/Upload goals
            elif echo "$goal_lower" | grep -qE "file|upload|download|image|document|media"; then
                echo "  - Implement file upload with validation (size, type)"
                echo "  - Set up file storage (local, S3, or CDN)"
                echo "  - Add file processing (resize, convert, compress)"
                echo "  - Implement file download/retrieval"
                echo "  - Add file metadata tracking"
                echo "  - Test file operations"
            # Payment/Billing goals
            elif echo "$goal_lower" | grep -qE "payment|billing|checkout|subscription|stripe|paypal"; then
                echo "  - Integrate payment provider API"
                echo "  - Implement checkout flow with validation"
                echo "  - Add payment processing and confirmation"
                echo "  - Implement invoice generation"
                echo "  - Add payment webhook handling"
                echo "  - Test payment flows (use test mode)"
            # Analytics/Reporting goals
            elif echo "$goal_lower" | grep -qE "analytic|report|dashboard|metric|stat|insight"; then
                echo "  - Design data collection points"
                echo "  - Implement analytics tracking"
                echo "  - Create data aggregation queries"
                echo "  - Build report generation logic"
                echo "  - Add data visualization components"
                echo "  - Test analytics accuracy"
            # Generic fallback with project-type specific guidance
            else
                case "$project_type" in
                    web-app|api|python-web)
                        echo "  - Define feature requirements and acceptance criteria"
                        echo "  - Implement core business logic with validation"
                        echo "  - Add database operations (if needed)"
                        echo "  - Create API endpoints or UI components"
                        echo "  - Add error handling and logging"
                        echo "  - Write feature tests"
                        ;;
                    cli)
                        echo "  - Define command interface and arguments"
                        echo "  - Implement command handler with validation"
                        echo "  - Add progress feedback and error messages"
                        echo "  - Create help documentation"
                        echo "  - Test command execution and edge cases"
                        ;;
                    automation)
                        echo "  - Define automation workflow and triggers"
                        echo "  - Implement automation logic with error recovery"
                        echo "  - Add logging and monitoring"
                        echo "  - Create scheduling/trigger mechanism"
                        echo "  - Test automation in staging environment"
                        ;;
                    *)
                        echo "  - Break down goal into specific implementation steps"
                        echo "  - Identify dependencies on Phase 1 tasks"
                        echo "  - Implement core functionality with validation"
                        echo "  - Add error handling and edge case coverage"
                        echo "  - Create tests for critical paths"
                        ;;
                esac
            fi
            
            echo "  - Target: ${goal} complete and validated"
            echo ""
            
            task_num=$((task_num + 1))
        done < <(parse_goals_into_tasks "$goals" "$tech" "$project_type")
    else
        cat << 'NOGOALS'
- [ ] **Task 4:** Implement primary feature
  - Define feature requirements based on project purpose
  - Build core business logic
  - Add input validation and error handling
  - Create basic tests
  - Target: Primary feature functional

- [ ] **Task 5:** Add secondary features
  - Identify complementary features
  - Implement feature integrations
  - Add documentation
  - Target: Feature set complete

NOGOALS
    fi
}

# HIGH INTELLIGENCE: Generate testing and deployment tasks
generate_polish_tasks() {
    local project_type="$1"
    local tech="$2"
    
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    cat << 'EOF'

### Low Priority - Phase 3: Testing, Documentation & Deployment

EOF
    
    # Testing tasks - vary by tech stack
    if echo "$tech_lower" | grep -qE "(typescript|javascript|react|next\.?js)"; then
        cat << 'JSTEST'
- [ ] **Task:** Set up automated testing
  - Configure test framework (Jest, Vitest, or similar)
  - Write unit tests for core functions
  - Add integration tests for key workflows
  - Set up test coverage reporting
  - Target: >80% test coverage, all tests pass

JSTEST
    elif echo "$tech_lower" | grep -qE "(python)"; then
        cat << 'PYTEST'
- [ ] **Task:** Set up automated testing
  - Configure pytest with coverage
  - Write unit tests for core functions
  - Add integration tests for key workflows
  - Set up test fixtures and mocks
  - Target: >80% test coverage, all tests pass

PYTEST
    elif echo "$tech_lower" | grep -qE "(bash|powershell)"; then
        cat << 'SHELLTEST'
- [ ] **Task:** Add validation and testing
  - Create test scripts for critical functions
  - Add shellcheck/PSScriptAnalyzer validation
  - Test edge cases and error conditions
  - Document expected behavior
  - Target: All validation checks pass, edge cases handled

SHELLTEST
    else
        cat << 'GENTEST'
- [ ] **Task:** Set up testing infrastructure
  - Choose appropriate testing framework
  - Write tests for core functionality
  - Add integration tests for key workflows
  - Document testing procedures
  - Target: Core functionality tested, tests pass

GENTEST
    fi
    
    # Documentation task
    cat << 'DOC'

- [ ] **Task:** Complete documentation
  - Write comprehensive README with setup instructions
  - Document API/CLI/usage patterns
  - Add inline code comments where needed
  - Create examples and tutorials
  - Target: New users can get started without assistance

DOC
    
    # Deployment task - varies by project type
    if [ "$project_type" = "web-app" ]; then
        cat << 'WEBDEPLOY'

- [ ] **Task:** Set up deployment pipeline
  - Configure hosting (Vercel, Netlify, AWS, etc.)
  - Set up CI/CD pipeline
  - Add environment-specific configurations
  - Implement automated deployments
  - Target: Can deploy to production with one command

WEBDEPLOY
    elif [ "$project_type" = "api" ]; then
        cat << 'APIDEPLOY'

- [ ] **Task:** Set up deployment and monitoring
  - Configure hosting environment
  - Set up CI/CD pipeline
  - Add health checks and monitoring
  - Implement logging and alerting
  - Target: API deployed, monitored, and stable

APIDEPLOY
    elif [ "$project_type" = "automation" ]; then
        cat << 'AUTODEPLOY'

- [ ] **Task:** Set up automation scheduling
  - Configure cron jobs or task scheduler
  - Set up monitoring and alerting
  - Add error notification system
  - Document maintenance procedures
  - Target: Automation runs reliably on schedule

AUTODEPLOY
    else
        cat << 'GENDEPLOY'

- [ ] **Task:** Prepare for deployment/distribution
  - Package project for distribution
  - Create installation/setup procedures
  - Add versioning and release notes
  - Document deployment process
  - Target: Project ready for production use

GENDEPLOY
    fi
}

# Generate current state summary
generate_current_state() {
    local project_type="$1"
    local purpose="$2"
    
    cat << EOF
**Current State:** New project - no code exists yet

**Purpose:** ${purpose:-Build a new project from scratch}

**Project Type:** ${project_type}

**Phase:** Phase 1 - Foundation and Setup
EOF
}

# Generate goal statement
generate_goal_statement() {
    local purpose="$1"
    local goals="$2"
    
    if [ -n "$goals" ]; then
        echo "Build a complete $(echo "$purpose" | tr '[:upper:]' '[:lower:]') that achieves: ${goals}"
    else
        echo "Build a complete $(echo "$purpose" | tr '[:upper:]' '[:lower:]') with all core functionality implemented and tested."
    fi
}

# Main output generation
CURRENT_STATE=$(generate_current_state "$PROJECT_TYPE" "$PROJECT_PURPOSE")
GOAL_STATEMENT=$(generate_goal_statement "$PROJECT_PURPOSE" "$PROJECT_GOALS")
PHASE_1_TASKS=$(generate_phases "$PROJECT_TYPE" "$PROJECT_TECH" "$PROJECT_GOALS")
PHASE_2_TASKS=$(generate_feature_tasks "$PROJECT_GOALS" "$PROJECT_TYPE" "$PROJECT_TECH")
PHASE_3_TASKS=$(generate_polish_tasks "$PROJECT_TYPE" "$PROJECT_TECH")

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

cat > "$OUTPUT_FILE" << EOF
# Implementation Plan - ${PROJECT_NAME}

Last updated: ${TIMESTAMP}

## Current State

${CURRENT_STATE}

## Goal

${GOAL_STATEMENT}

## Prioritized Tasks

${PHASE_1_TASKS}
${PHASE_2_TASKS}
${PHASE_3_TASKS}

## Discoveries & Notes

[Track important learnings, blockers, or decisions here as Ralph works through tasks]

---

## How Ralph Uses This File

**Planning Mode (Iteration 1, every 3rd):**
- Analyze current state vs. THOUGHTS.md goals
- Update task priorities based on dependencies
- Add newly discovered tasks
- Remove or archive completed tasks

**Building Mode (Other iterations):**
- Read this file FIRST every iteration
- Find the FIRST unchecked \`[ ]\` task (top to bottom through priorities)
- Implement ONLY that ONE task
- Mark completed: \`[x]\`
- Add discoveries under "Discoveries & Notes"
- Commit and STOP

**One Task Per Iteration:** Ralph implements exactly ONE task per BUILD iteration, then stops to let the loop restart with fresh context.
EOF

echo "Generated custom IMPLEMENTATION_PLAN.md at: $OUTPUT_FILE"
