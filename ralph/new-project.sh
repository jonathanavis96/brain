#!/usr/bin/env bash
set -euo pipefail

# new-project.sh - Bootstrap new projects with Ralph infrastructure
# Usage: bash new-project.sh NEW_PROJECT_IDEA.md

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_DIR="$SCRIPT_DIR"
TEMPLATES_DIR="$BRAIN_DIR/templates"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }
die() { error "$*"; exit 1; }

# Usage message
usage() {
    cat << EOF
Usage: bash new-project.sh NEW_PROJECT_IDEA.md

Bootstrap a new project with complete Ralph infrastructure.

Arguments:
  NEW_PROJECT_IDEA.md    Path to project idea file (required)

The NEW_PROJECT_IDEA.md file should contain:
  - Project name
  - Target location (absolute path)
  - Purpose/description
  - Tech stack
  - Goals/objectives

After successful bootstrap:
  - Complete Ralph infrastructure created at target location
  - NEW_PROJECT_IDEA.md archived to old_projects/
  - New project ready for Ralph to start building

Example:
  bash new-project.sh rovo_project_idea.md

EOF
    exit 1
}

# Parse command line arguments
if [ $# -ne 1 ]; then
    usage
fi

IDEA_FILE="$1"

# Validate input file
if [ ! -f "$IDEA_FILE" ]; then
    die "Project idea file not found: $IDEA_FILE"
fi

info "Reading project idea from: $IDEA_FILE"

# Extract project information from NEW_PROJECT_IDEA.md
# Expected format:
#   # Project: <name>
#   Location: <path>
#   Purpose: <description>
#   Tech Stack: <technologies>
#   Goals: <objectives>

extract_field() {
    local field="$1"
    local file="$2"
    grep -i "^${field}:" "$file" | head -1 | sed "s/^${field}://i" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

extract_project_name() {
    local file="$1"
    # Look for "# Project: NAME" or "Project: NAME"
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

# Validate extracted information
if [ -z "$PROJECT_NAME" ]; then
    die "Could not extract project name from $IDEA_FILE. Expected 'Project: <name>' or '# Project: <name>'"
fi

if [ -z "$PROJECT_LOCATION" ]; then
    die "Could not extract project location from $IDEA_FILE. Expected 'Location: <path>'"
fi

info "Project Name: $PROJECT_NAME"
info "Project Location: $PROJECT_LOCATION"
info "Purpose: ${PROJECT_PURPOSE:-<not specified>}"
info "Tech Stack: ${PROJECT_TECH:-<not specified>}"
info "Goals: ${PROJECT_GOALS:-<not specified>}"

# Validate target location doesn't exist
if [ -e "$PROJECT_LOCATION" ]; then
    die "Target location already exists: $PROJECT_LOCATION"
fi

# Create project directory structure
info "Creating project directory structure..."
mkdir -p "$PROJECT_LOCATION"
mkdir -p "$PROJECT_LOCATION/ralph"
mkdir -p "$PROJECT_LOCATION/src"
mkdir -p "$PROJECT_LOCATION/kb"

# Copy template files to project
info "Copying template files..."

# Copy root-level templates
if [ -f "$TEMPLATES_DIR/AGENTS.project.md" ]; then
    cp "$TEMPLATES_DIR/AGENTS.project.md" "$PROJECT_LOCATION/AGENTS.md"
    success "Copied AGENTS.md"
else
    warn "Template not found: AGENTS.project.md"
fi

# Copy Ralph infrastructure templates
if [ -f "$TEMPLATES_DIR/ralph/PROMPT.project.md" ]; then
    cp "$TEMPLATES_DIR/ralph/PROMPT.project.md" "$PROJECT_LOCATION/ralph/PROMPT.md"
    success "Copied ralph/PROMPT.md"
else
    warn "Template not found: ralph/PROMPT.project.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/IMPLEMENTATION_PLAN.project.md" ]; then
    cp "$TEMPLATES_DIR/ralph/IMPLEMENTATION_PLAN.project.md" "$PROJECT_LOCATION/ralph/IMPLEMENTATION_PLAN.md"
    success "Copied ralph/IMPLEMENTATION_PLAN.md"
else
    warn "Template not found: ralph/IMPLEMENTATION_PLAN.project.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/VALIDATION_CRITERIA.project.md" ]; then
    cp "$TEMPLATES_DIR/ralph/VALIDATION_CRITERIA.project.md" "$PROJECT_LOCATION/ralph/VALIDATION_CRITERIA.md"
    success "Copied ralph/VALIDATION_CRITERIA.md"
else
    warn "Template not found: ralph/VALIDATION_CRITERIA.project.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/RALPH.md" ]; then
    cp "$TEMPLATES_DIR/ralph/RALPH.md" "$PROJECT_LOCATION/ralph/RALPH.md"
    success "Copied ralph/RALPH.md"
else
    warn "Template not found: ralph/RALPH.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/loop.sh" ]; then
    cp "$TEMPLATES_DIR/ralph/loop.sh" "$PROJECT_LOCATION/ralph/loop.sh"
    chmod +x "$PROJECT_LOCATION/ralph/loop.sh"
    success "Copied ralph/loop.sh (executable)"
else
    warn "Template not found: ralph/loop.sh"
fi

# Generate custom files using HIGH INTELLIGENCE generators
info "Generating custom project files..."

# TODO: Task 11 - HIGH INTELLIGENCE generator for THOUGHTS.md
if [ -f "$BRAIN_DIR/generators/generate-thoughts.sh" ]; then
    info "Generating custom THOUGHTS.md..."
    bash "$BRAIN_DIR/generators/generate-thoughts.sh" "$IDEA_FILE" "$PROJECT_LOCATION/THOUGHTS.md"
    success "Generated THOUGHTS.md"
else
    warn "Generator not found: generate-thoughts.sh (using template fallback)"
    if [ -f "$TEMPLATES_DIR/THOUGHTS.project.md" ]; then
        cp "$TEMPLATES_DIR/THOUGHTS.project.md" "$PROJECT_LOCATION/THOUGHTS.md"
        success "Copied THOUGHTS.md template (needs customization)"
    fi
fi

# TODO: Task 12 - HIGH INTELLIGENCE generator for NEURONS.md
if [ -f "$BRAIN_DIR/generators/generate-neurons.sh" ]; then
    info "Generating custom NEURONS.md..."
    bash "$BRAIN_DIR/generators/generate-neurons.sh" "$IDEA_FILE" "$PROJECT_LOCATION/NEURONS.md"
    success "Generated NEURONS.md"
else
    warn "Generator not found: generate-neurons.sh (using template fallback)"
    if [ -f "$TEMPLATES_DIR/NEURONS.project.md" ]; then
        cp "$TEMPLATES_DIR/NEURONS.project.md" "$PROJECT_LOCATION/NEURONS.md"
        success "Copied NEURONS.md template (needs customization)"
    fi
fi

# TODO: Task 13 - HIGH INTELLIGENCE generator for IMPLEMENTATION_PLAN.md
if [ -f "$BRAIN_DIR/generators/generate-implementation-plan.sh" ]; then
    info "Generating custom IMPLEMENTATION_PLAN.md..."
    bash "$BRAIN_DIR/generators/generate-implementation-plan.sh" "$IDEA_FILE" "$PROJECT_LOCATION/ralph/IMPLEMENTATION_PLAN.md"
    success "Generated custom IMPLEMENTATION_PLAN.md"
else
    warn "Generator not found: generate-implementation-plan.sh (using template)"
    # Template already copied above
fi

# Create .gitignore if it doesn't exist
if [ ! -f "$PROJECT_LOCATION/.gitignore" ]; then
    cat > "$PROJECT_LOCATION/.gitignore" << 'EOF'
# Ralph progress logs
ralph/progress.txt
ralph/*.log

# Temporary files
tmp_*
*.tmp

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
EOF
    success "Created .gitignore"
fi

# Archive the project idea file
info "Archiving project idea file..."
ARCHIVE_DIR="$BRAIN_DIR/old_projects"
mkdir -p "$ARCHIVE_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="${PROJECT_NAME}_${TIMESTAMP}.md"
cp "$IDEA_FILE" "$ARCHIVE_DIR/$ARCHIVE_NAME"
success "Archived to: $ARCHIVE_DIR/$ARCHIVE_NAME"

# Summary
echo ""
success "Project bootstrap complete!"
echo ""
info "Project created at: $PROJECT_LOCATION"
info "Next steps:"
echo "  1. cd $PROJECT_LOCATION/ralph"
echo "  2. Review and customize THOUGHTS.md, NEURONS.md if needed"
echo "  3. bash loop.sh --iterations 10"
echo ""
info "The project's Ralph loop is ready to start building!"
