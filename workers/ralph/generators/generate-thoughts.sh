#!/usr/bin/env bash
set -euo pipefail

# generate-thoughts.sh - HIGH INTELLIGENCE generator for custom THOUGHTS.md
# Usage: bash generate-thoughts.sh INPUT_IDEA.md OUTPUT_THOUGHTS.md

if [ $# -ne 2 ]; then
    echo "Usage: bash generate-thoughts.sh INPUT_IDEA.md OUTPUT_THOUGHTS.md"
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

# Extract optional sections
DETAILED_DESC=$(extract_section "Detailed Description" "$IDEA_FILE")
SUCCESS_CRITERIA=$(extract_section "Success Criteria" "$IDEA_FILE")
TECH_REQS=$(extract_section "Technical Requirements" "$IDEA_FILE")

# HIGH INTELLIGENCE: Infer project type and patterns from tech stack
infer_project_type() {
    local tech="$1"
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    if [[ "$tech_lower" =~ next\.?js|react ]]; then
        echo "web application"
    elif [[ "$tech_lower" =~ django|fastapi|flask ]]; then
        echo "Python web application"
    elif [[ "$tech_lower" =~ python ]] && [[ ! "$tech_lower" =~ django|fastapi|flask ]]; then
        echo "Python application"
    elif [[ "$tech_lower" =~ powershell|bash|shell|automation ]]; then
        echo "automation system"
    elif [[ "$tech_lower" =~ api|express ]]; then
        echo "API service"
    elif [[ "$tech_lower" =~ cli|command.?line|click|typer|argparse ]]; then
        echo "command-line tool"
    elif [[ "$tech_lower" =~ docker|kubernetes|terraform ]]; then
        echo "infrastructure project"
    else
        echo "software project"
    fi
}

PROJECT_TYPE=$(infer_project_type "$PROJECT_TECH")

# HIGH INTELLIGENCE: Infer skills references based on tech stack
infer_skills_references() {
    local tech="$1"
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    local refs=""
    if [[ "$tech_lower" =~ next\.?js|react|javascript|typescript ]]; then
        refs="${refs}\n- **Performance Patterns:** \`../../brain/references/react-best-practices/\`"
    fi
    
    if [[ "$tech_lower" =~ auth|authentication|login ]]; then
        refs="${refs}\n- **Auth Patterns:** \`../../brain/skills/domains/auth-patterns.md\`"
    fi
    
    echo -e "$refs"
}

SKILLS_REFS=$(infer_skills_references "$PROJECT_TECH")

# HIGH INTELLIGENCE: Generate Definition of Done categories based on project type
generate_dod_categories() {
    local project_type="$1"
    local tech="$2"
    
    cat << 'EOF'

A task/feature in this project is complete when:

#### ✅ Functionality
- Feature works as specified in requirements
- All edge cases handled gracefully
- Error messages are clear and actionable
- User experience is intuitive

#### ✅ Testing
EOF

    if [[ "$tech" =~ [Tt]ype[Ss]cript|[Jj]ava[Ss]cript|[Rr]eact ]]; then
        cat << 'EOF'
- Unit tests written with good coverage
- Integration tests pass
- Type safety verified (TypeScript)
- Manual testing completed
EOF
    else
        cat << 'EOF'
- Core functionality tested
- Integration points verified
- Manual testing completed
- Regression tests pass
EOF
    fi

    cat << 'EOF'

#### ✅ Code Quality
- Code follows project conventions
- Proper error handling implemented
- No linting errors or warnings
- Comments explain "why" not "what"

#### ✅ Documentation
- README updated if needed
- API/interface documented
- Complex logic explained
- NEURONS.md updated with new files/patterns
EOF
}

DOD_CATEGORIES=$(generate_dod_categories "$PROJECT_TYPE" "$PROJECT_TECH")

# HIGH INTELLIGENCE: Generate success metrics based on goals (ENHANCED)
generate_success_metrics() {
    local goals="$1"
    local criteria="$2"
    local project_type="$3"
    
    # If detailed success criteria provided, use them
    if [ -n "$criteria" ]; then
        echo "$criteria" | sed 's/^- \[ \]/1./' | head -5
    # Otherwise infer context-aware metrics from goals and project type
    elif [ -n "$goals" ]; then
        local goals_lower=$(echo "$goals" | tr '[:upper:]' '[:lower:]')
        
        # Metric 1: Goal-specific functionality
        if echo "$goals_lower" | grep -qE "auth|login|user"; then
            echo "1. **Authentication system operational** - Users can register, login, and access protected features securely"
        elif echo "$goals_lower" | grep -qE "api|endpoint|integration"; then
            echo "1. **API fully functional** - All endpoints working, documented, and properly secured"
        elif echo "$goals_lower" | grep -qE "dashboard|analytics|report"; then
            echo "1. **Dashboard operational** - Real-time data visualization and reporting working correctly"
        elif echo "$goals_lower" | grep -qE "search|filter|query"; then
            echo "1. **Search functionality working** - Users can find content quickly with accurate results"
        else
            echo "1. **Core functionality delivered** - All primary goals from project idea implemented and working"
        fi
        
        # Metric 2: Performance/Quality based on project type
        case "$project_type" in
            web-app)
                echo "2. **Performance targets met** - Page loads <3s, Lighthouse score >90, responsive on all devices"
                ;;
            api|python-web)
                echo "2. **API performance validated** - Response times <200ms, handles 100+ concurrent requests, 99.9% uptime"
                ;;
            cli)
                echo "2. **CLI polished and tested** - Intuitive UX, helpful errors, works on target platforms, <1s startup"
                ;;
            automation)
                echo "2. **Automation reliable** - Runs on schedule, error recovery working, logs all actions"
                ;;
            *)
                echo "2. **Quality standards met** - Code passes all tests, meets performance benchmarks"
                ;;
        esac
        
        # Metric 3: Testing coverage
        if echo "$goals_lower" | grep -qE "payment|billing|checkout"; then
            echo "3. **Payment flow thoroughly tested** - Test transactions successful, edge cases handled, security validated"
        elif echo "$goals_lower" | grep -qE "data|database|storage"; then
            echo "3. **Data integrity verified** - All CRUD operations tested, migrations work, backups functional"
        else
            echo "3. **Test coverage adequate** - Critical paths tested, edge cases handled, automated tests passing"
        fi
        
        # Metric 4: Documentation and deployment readiness
        echo "4. **Production ready** - Documentation complete, deployable to target environment, monitoring in place"
    else
        # Generic fallback
        echo "1. **Deliverables complete** - All planned features implemented"
        echo "2. **Quality validated** - Meets testing and code quality standards"
        echo "3. **Documented** - Clear documentation for users and developers"
        echo "4. **Deployed** - Running in target environment"
    fi
}

SUCCESS_METRICS=$(generate_success_metrics "$PROJECT_GOALS" "$SUCCESS_CRITERIA" "$PROJECT_TYPE")

# HIGH INTELLIGENCE: Parse tech stack into structured format
parse_tech_stack() {
    local tech="$1"
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    # Detect languages
    local languages=""
    [[ "$tech_lower" =~ typescript ]] && languages="${languages}TypeScript, "
    [[ "$tech_lower" =~ javascript ]] && languages="${languages}JavaScript, "
    [[ "$tech_lower" =~ python ]] && languages="${languages}Python, "
    [[ "$tech_lower" =~ bash|shell ]] && languages="${languages}Bash, "
    [[ "$tech_lower" =~ powershell ]] && languages="${languages}PowerShell, "
    [[ "$tech_lower" =~ go ]] && languages="${languages}Go, "
    languages=${languages%, }
    [ -z "$languages" ] && languages="See Tech Stack field above"
    
    # Detect frameworks
    local frameworks=""
    [[ "$tech_lower" =~ next\.?js ]] && frameworks="${frameworks}Next.js, "
    [[ "$tech_lower" =~ react ]] && frameworks="${frameworks}React, "
    [[ "$tech_lower" =~ express ]] && frameworks="${frameworks}Express, "
    [[ "$tech_lower" =~ fastapi ]] && frameworks="${frameworks}FastAPI, "
    [[ "$tech_lower" =~ flask ]] && frameworks="${frameworks}Flask, "
    frameworks=${frameworks%, }
    [ -z "$frameworks" ] && frameworks="None (or not specified)"
    
    # Detect infrastructure
    local infra=""
    [[ "$tech_lower" =~ docker ]] && infra="${infra}Docker, "
    [[ "$tech_lower" =~ kubernetes|k8s ]] && infra="${infra}Kubernetes, "
    [[ "$tech_lower" =~ aws ]] && infra="${infra}AWS, "
    [[ "$tech_lower" =~ vercel ]] && infra="${infra}Vercel, "
    [[ "$tech_lower" =~ terraform ]] && infra="${infra}Terraform, "
    infra=${infra%, }
    [ -z "$infra" ] && infra="To be determined"
    
    echo "- **Language(s):** $languages"
    echo "- **Framework(s):** $frameworks"
    echo "- **Infrastructure:** $infra"
}

TECH_STACK_PARSED=$(parse_tech_stack "$PROJECT_TECH")

# HIGH INTELLIGENCE: Infer source code structure from tech stack
infer_source_structure() {
    local tech="$1"
    tech_lower=$(echo "$tech" | tr '[:upper:]' '[:lower:]')
    
    if [[ "$tech_lower" =~ next\.?js ]]; then
        cat << 'EOF'
- **`src/app/`** - Next.js App Router pages and layouts
- **`src/components/`** - Reusable React components
- **`src/lib/`** - Utility functions and shared logic
- **`public/`** - Static assets
EOF
    elif [[ "$tech_lower" =~ react ]]; then
        cat << 'EOF'
- **`src/components/`** - React components
- **`src/hooks/`** - Custom React hooks
- **`src/utils/`** - Utility functions
- **`public/`** - Static assets
EOF
    elif [[ "$tech_lower" =~ powershell|bash|automation ]]; then
        cat << 'EOF'
- **`scripts/`** - Automation scripts
- **`lib/`** - Shared functions and utilities
- **`config/`** - Configuration files
- **`docs/`** - Documentation
EOF
    elif [[ "$tech_lower" =~ api|express|fastapi ]]; then
        cat << 'EOF'
- **`src/routes/`** - API endpoints
- **`src/models/`** - Data models
- **`src/controllers/`** - Business logic
- **`src/middleware/`** - Request/response middleware
EOF
    else
        cat << 'EOF'
- **`src/`** - Source code
- **`lib/`** - Libraries and utilities
- **`config/`** - Configuration files
- **`docs/`** - Documentation
EOF
    fi
    
    cat << 'EOF'

**NOT source code:**
- `node_modules/` - External dependencies (if applicable)
- `dist/` or `build/` - Compiled/generated files (if applicable)
- `.next/` - Framework build cache (if applicable)
EOF
}

SOURCE_STRUCTURE=$(infer_source_structure "$PROJECT_TECH")

# Generate the custom THOUGHTS.md
cat > "$OUTPUT_FILE" << EOF
# THOUGHTS.md - ${PROJECT_NAME} Vision

## What This Project Does

**${PROJECT_TYPE^}:** ${PROJECT_PURPOSE}

${DETAILED_DESC:+### Detailed Description

$DETAILED_DESC

}### Primary Goal
${PROJECT_PURPOSE}

### Key Capabilities
${PROJECT_GOALS}

${TECH_REQS:+### Technical Requirements
$TECH_REQS

}## Current Goals

### Active Focus

Initial development phase - establishing project foundation:
- Set up project structure and development environment
- Implement core functionality
- Establish testing and validation processes
- Document architecture and patterns

Refer to \`ralph/IMPLEMENTATION_PLAN.md\` for prioritized task breakdown.

### Definition of Done

${DOD_CATEGORIES}

## Success Metrics

This project is successful when:

${SUCCESS_METRICS}

## Source Code Definition

For this project, "source code" means:

${SOURCE_STRUCTURE}

## Knowledge Base Integration

This project references brain repository knowledge:

${SKILLS_REFS}
${SKILLS_REFS:+
}${SKILLS_REFS:+}Refer to \`../../brain/skills/SUMMARY.md\` for complete skills index.

## Technical Context

### Technology Stack
${TECH_STACK_PARSED}

### Architecture Notes
${TECH_REQS:-Architecture decisions will be documented here as the project evolves.}

### Project Classification
- **Type:** ${PROJECT_TYPE^}
- **Primary Language:** $(echo "$PROJECT_TECH" | awk '{print $1}')
- **Knowledge Domain:** Custom (project-specific patterns may be promoted to \`../../brain/skills/projects/${PROJECT_NAME}.md\` if reusable)
EOF

echo "Generated custom THOUGHTS.md at: $OUTPUT_FILE"
