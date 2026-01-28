#!/usr/bin/env bash
set -euo pipefail

# new-project.sh - Bootstrap new projects with Ralph infrastructure
# Usage: bash new-project.sh NEW_PROJECT_IDEA.md
#
# Features:
#   - Interactive GitHub repo creation
#   - Automatic <repo>-work branch setup for PR workflow
#   - Template placeholder substitution
#   - Graceful offline/auth failure handling

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_DIR="$SCRIPT_DIR"
BRAIN_ROOT="$SCRIPT_DIR"
TEMPLATES_DIR="$BRAIN_DIR/templates"
RALPH_CONFIG_DIR="$HOME/.ralph"
RALPH_CONFIG_FILE="$RALPH_CONFIG_DIR/config"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
info() { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }
die() {
  error "$*"
  exit 1
}

# Check required dependencies
check_dependencies() {
  if ! command -v git &>/dev/null; then
    die "git is not installed. Please install git first."
  fi
}

# Check gh CLI (only when needed for repo creation)
check_gh() {
  if ! command -v gh &>/dev/null; then
    return 1
  fi
  if ! gh auth status &>/dev/null; then
    return 1
  fi
  return 0
}

# Get GitHub username from gh CLI or config
get_github_username() {
  # First check config file
  if [[ -f "$RALPH_CONFIG_FILE" ]]; then
    local saved_username
    saved_username=$(grep "^GITHUB_USERNAME=" "$RALPH_CONFIG_FILE" 2>/dev/null | cut -d= -f2)
    if [[ -n "$saved_username" ]]; then
      echo "$saved_username"
      return 0
    fi
  fi

  # Try to detect from gh CLI
  if command -v gh &>/dev/null && gh auth status &>/dev/null; then
    gh api user --jq '.login' 2>/dev/null || true
  fi
}

# Save GitHub username to config
save_github_username() {
  local username="$1"
  mkdir -p "$RALPH_CONFIG_DIR"
  if [[ -f "$RALPH_CONFIG_FILE" ]]; then
    # Update existing config
    if grep -q "^GITHUB_USERNAME=" "$RALPH_CONFIG_FILE"; then
      sed -i "s/^GITHUB_USERNAME=.*/GITHUB_USERNAME=$username/" "$RALPH_CONFIG_FILE"
    else
      echo "GITHUB_USERNAME=$username" >>"$RALPH_CONFIG_FILE"
    fi
  else
    echo "GITHUB_USERNAME=$username" >"$RALPH_CONFIG_FILE"
  fi
}

# Sanitize project name to repo name (lowercase, underscores to hyphens)
sanitize_repo_name() {
  local name="$1"
  echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' _' '-' | tr -cd 'a-z0-9-'
}

# Escape string for sed replacement (handle special chars)
escape_sed_replacement() {
  local str="$1"
  # Escape &, \, and / for sed replacement
  printf '%s\n' "$str" | sed -e 's/[&/\]/\\&/g'
}

# Substitute placeholders in a file
substitute_placeholders() {
  local file="$1"
  local repo_name="$2"
  local work_branch="$3"

  local escaped_repo escaped_branch
  escaped_repo=$(escape_sed_replacement "$repo_name")
  escaped_branch=$(escape_sed_replacement "$work_branch")

  sed -i "s/__REPO_NAME__/$escaped_repo/g" "$file"
  sed -i "s/__WORK_BRANCH__/$escaped_branch/g" "$file"
}

# Usage message
usage() {
  cat <<EOF
Usage: bash new-project.sh NEW_PROJECT_IDEA.md

Bootstrap a new project with complete Ralph infrastructure and GitHub integration.

Arguments:
  NEW_PROJECT_IDEA.md    Path to project idea file (required)

The NEW_PROJECT_IDEA.md file should contain:
  - Project name (# Project: <name>)
  - Target location (Location: <path>) - optional, defaults to sibling of brain/
  - Purpose/description
  - Tech stack
  - Goals/objectives

Features:
  - Interactive GitHub repo creation (optional)
  - Automatic <repo>-work branch setup for PR workflow
  - Template files with placeholder substitution
  - Graceful offline mode if GitHub unavailable

After successful bootstrap:
  - GitHub repo created (if requested)
  - Project on <repo>-work branch, ready for development
  - IDEA file archived to project's docs/ folder
  - README.md generated with project info

Example:
  bash new-project.sh my_cool_app_idea.md

EOF
  exit 1
}

# Parse command line arguments
if [ $# -ne 1 ]; then
  usage
fi

IDEA_FILE="$1"

# Check dependencies first
check_dependencies

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

# Handle Location: use from IDEA file, or fallback to sibling of brain
if [ -z "$PROJECT_LOCATION" ]; then
  # Fallback: create as sibling of brain directory
  DEFAULT_REPO_NAME=$(sanitize_repo_name "$PROJECT_NAME")
  PROJECT_LOCATION="$BRAIN_ROOT/$DEFAULT_REPO_NAME"
  warn "Location not specified in IDEA file"
  info "Detected brain root: $BRAIN_ROOT"
  info "Project will be created at: $PROJECT_LOCATION"
elif [[ "$PROJECT_LOCATION" != /* ]]; then
  # Relative path: resolve relative to BRAIN_ROOT
  PROJECT_LOCATION="$BRAIN_ROOT/$PROJECT_LOCATION"
  info "Resolved relative path to: $PROJECT_LOCATION"
fi

# Suggest repo name (sanitized, shorter)
SUGGESTED_REPO=$(sanitize_repo_name "$PROJECT_NAME")

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Project Summary${NC}"
echo -e "${CYAN}========================================${NC}"
info "Project Name: $PROJECT_NAME"
info "Location: $PROJECT_LOCATION"
info "Purpose: ${PROJECT_PURPOSE:-<not specified>}"
info "Tech Stack: ${PROJECT_TECH:-<not specified>}"
info "Goals: ${PROJECT_GOALS:-<not specified>}"
echo ""

# Validate target location doesn't exist
if [ -e "$PROJECT_LOCATION" ]; then
  die "Target location already exists: $PROJECT_LOCATION"
fi

# ============================================
# GitHub Repository Setup (Interactive)
# ============================================

CREATE_REPO=false
REPO_NAME=""
WORK_BRANCH=""
GITHUB_USERNAME=""
LOCAL_ONLY=false

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}GitHub Repository Setup${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

read -r -p "Create GitHub repository? (y/n): " create_repo_answer
if [[ "$create_repo_answer" =~ ^[Yy] ]]; then
  CREATE_REPO=true

  # Check if gh CLI is available
  if ! check_gh; then
    warn "GitHub CLI (gh) not installed or not authenticated"
    echo ""
    echo "Options:"
    echo "  1. Install gh: https://cli.github.com/"
    echo "  2. Run: gh auth login"
    echo "  3. Or continue without GitHub (local-only)"
    echo ""
    read -r -p "Continue local-only? (y/n): " local_only_answer
    if [[ "$local_only_answer" =~ ^[Yy] ]]; then
      CREATE_REPO=false
      LOCAL_ONLY=true
    else
      die "Please install and authenticate gh CLI first"
    fi
  fi

  if [[ "$CREATE_REPO" == "true" ]]; then
    # Get/confirm GitHub username
    detected_username=$(get_github_username)
    if [[ -n "$detected_username" ]]; then
      echo ""
      read -r -p "GitHub username [$detected_username]: " input_username
      GITHUB_USERNAME="${input_username:-$detected_username}"
    else
      echo ""
      read -r -p "GitHub username: " GITHUB_USERNAME
      if [[ -z "$GITHUB_USERNAME" ]]; then
        die "GitHub username is required"
      fi
    fi
    save_github_username "$GITHUB_USERNAME"

    # Get repo name
    echo ""
    read -r -p "Repository name [$SUGGESTED_REPO]: " input_repo
    REPO_NAME="${input_repo:-$SUGGESTED_REPO}"
    WORK_BRANCH="${REPO_NAME}-work"

    # Show summary
    echo ""
    echo -e "${CYAN}----------------------------------------${NC}"
    info "Repository: $GITHUB_USERNAME/$REPO_NAME (public)"
    info "Work branch: $WORK_BRANCH"
    info "Location: $PROJECT_LOCATION"
    echo -e "${CYAN}----------------------------------------${NC}"
    echo ""
    read -r -p "Proceed with this configuration? (y/n): " confirm_answer
    if [[ ! "$confirm_answer" =~ ^[Yy] ]]; then
      die "Setup cancelled by user"
    fi
  fi
else
  # No GitHub, local only
  LOCAL_ONLY=true
  REPO_NAME="$SUGGESTED_REPO"
  WORK_BRANCH="${REPO_NAME}-work"
  info "Skipping GitHub setup (local-only mode)"
fi

# ============================================
# Create Project Directory Structure
# ============================================

info "Creating project directory structure..."
mkdir -p "$PROJECT_LOCATION"
mkdir -p "$PROJECT_LOCATION/ralph"
mkdir -p "$PROJECT_LOCATION/ralph/logs"
mkdir -p "$PROJECT_LOCATION/skills"
mkdir -p "$PROJECT_LOCATION/src"
mkdir -p "$PROJECT_LOCATION/docs"

# ============================================
# Copy and Process Template Files
# ============================================

info "Copying template files..."

# Copy AGENTS.md to ralph/ (not project root)
if [ -f "$TEMPLATES_DIR/AGENTS.project.md" ]; then
  cp "$TEMPLATES_DIR/AGENTS.project.md" "$PROJECT_LOCATION/ralph/AGENTS.md"
  substitute_placeholders "$PROJECT_LOCATION/ralph/AGENTS.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied ralph/AGENTS.md"
else
  warn "Template not found: AGENTS.project.md"
fi

# Copy Ralph infrastructure templates
if [ -f "$TEMPLATES_DIR/ralph/PROMPT.project.md" ]; then
  cp "$TEMPLATES_DIR/ralph/PROMPT.project.md" "$PROJECT_LOCATION/ralph/PROMPT.md"
  substitute_placeholders "$PROJECT_LOCATION/ralph/PROMPT.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied ralph/PROMPT.md"
else
  warn "Template not found: ralph/PROMPT.project.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/IMPLEMENTATION_PLAN.project.md" ]; then
  cp "$TEMPLATES_DIR/ralph/IMPLEMENTATION_PLAN.project.md" "$PROJECT_LOCATION/ralph/IMPLEMENTATION_PLAN.md"
  substitute_placeholders "$PROJECT_LOCATION/ralph/IMPLEMENTATION_PLAN.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied ralph/IMPLEMENTATION_PLAN.md"
else
  warn "Template not found: ralph/IMPLEMENTATION_PLAN.project.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/VALIDATION_CRITERIA.project.md" ]; then
  cp "$TEMPLATES_DIR/ralph/VALIDATION_CRITERIA.project.md" "$PROJECT_LOCATION/ralph/VALIDATION_CRITERIA.md"
  substitute_placeholders "$PROJECT_LOCATION/ralph/VALIDATION_CRITERIA.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied ralph/VALIDATION_CRITERIA.md"
else
  warn "Template not found: ralph/VALIDATION_CRITERIA.project.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/RALPH.md" ]; then
  cp "$TEMPLATES_DIR/ralph/RALPH.md" "$PROJECT_LOCATION/ralph/RALPH.md"
  substitute_placeholders "$PROJECT_LOCATION/ralph/RALPH.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied ralph/RALPH.md"
else
  warn "Template not found: ralph/RALPH.md"
fi

# Copy loop.sh with placeholder substitution
if [ -f "$TEMPLATES_DIR/ralph/loop.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/loop.sh" "$PROJECT_LOCATION/ralph/loop.sh"
  chmod +x "$PROJECT_LOCATION/ralph/loop.sh"
  substitute_placeholders "$PROJECT_LOCATION/ralph/loop.sh" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied ralph/loop.sh (executable)"
else
  warn "Template not found: ralph/loop.sh"
fi

# Copy pr-batch.sh with placeholder substitution
if [ -f "$TEMPLATES_DIR/ralph/pr-batch.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/pr-batch.sh" "$PROJECT_LOCATION/ralph/pr-batch.sh"
  chmod +x "$PROJECT_LOCATION/ralph/pr-batch.sh"
  substitute_placeholders "$PROJECT_LOCATION/ralph/pr-batch.sh" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied ralph/pr-batch.sh (executable)"
else
  warn "Template not found: ralph/pr-batch.sh"
fi

# Copy monitor scripts (THUNK system)
if [ -f "$TEMPLATES_DIR/ralph/current_ralph_tasks.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/current_ralph_tasks.sh" "$PROJECT_LOCATION/ralph/current_ralph_tasks.sh"
  chmod +x "$PROJECT_LOCATION/ralph/current_ralph_tasks.sh"
  success "Copied ralph/current_ralph_tasks.sh (executable)"
else
  warn "Template not found: ralph/current_ralph_tasks.sh"
fi

if [ -f "$TEMPLATES_DIR/ralph/thunk_ralph_tasks.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/thunk_ralph_tasks.sh" "$PROJECT_LOCATION/ralph/thunk_ralph_tasks.sh"
  chmod +x "$PROJECT_LOCATION/ralph/thunk_ralph_tasks.sh"
  success "Copied ralph/thunk_ralph_tasks.sh (executable)"
else
  warn "Template not found: ralph/thunk_ralph_tasks.sh"
fi

# Copy verifier.sh
if [ -f "$TEMPLATES_DIR/ralph/verifier.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/verifier.sh" "$PROJECT_LOCATION/ralph/verifier.sh"
  chmod +x "$PROJECT_LOCATION/ralph/verifier.sh"
  success "Copied ralph/verifier.sh (executable)"
else
  warn "Template not found: ralph/verifier.sh"
fi

# Copy and process THUNK.project.md template
if [ -f "$TEMPLATES_DIR/ralph/THUNK.project.md" ]; then
  cp "$TEMPLATES_DIR/ralph/THUNK.project.md" "$PROJECT_LOCATION/ralph/THUNK.md"
  CREATION_DATE=$(date +"%Y-%m-%d")
  INITIAL_ERA_NAME="Initial Setup"

  # Escape variables for sed replacement to prevent corruption from special chars
  esc_project_name=$(escape_sed_replacement "$PROJECT_NAME")
  esc_creation_date=$(escape_sed_replacement "$CREATION_DATE")
  esc_era_name=$(escape_sed_replacement "$INITIAL_ERA_NAME")

  # Process template placeholders
  sed -i "s/{{PROJECT_NAME}}/$esc_project_name/g" "$PROJECT_LOCATION/ralph/THUNK.md"
  sed -i "s/{{CREATION_DATE}}/$esc_creation_date/g" "$PROJECT_LOCATION/ralph/THUNK.md"
  sed -i "s/{{INITIAL_ERA_NAME}}/$esc_era_name/g" "$PROJECT_LOCATION/ralph/THUNK.md"

  success "Copied ralph/THUNK.md (from template)"
else
  warn "Template not found: ralph/THUNK.project.md"
fi

# Generate custom files using HIGH INTELLIGENCE generators
info "Generating custom project files..."

# THOUGHTS.md goes in ralph/, not project root
if [ -f "$BRAIN_DIR/generators/generate-thoughts.sh" ]; then
  info "Generating custom THOUGHTS.md..."
  bash "$BRAIN_DIR/generators/generate-thoughts.sh" "$IDEA_FILE" "$PROJECT_LOCATION/ralph/THOUGHTS.md"
  success "Generated ralph/THOUGHTS.md"
else
  warn "Generator not found: generate-thoughts.sh (using template fallback)"
  if [ -f "$TEMPLATES_DIR/THOUGHTS.project.md" ]; then
    cp "$TEMPLATES_DIR/THOUGHTS.project.md" "$PROJECT_LOCATION/ralph/THOUGHTS.md"
    substitute_placeholders "$PROJECT_LOCATION/ralph/THOUGHTS.md" "$REPO_NAME" "$WORK_BRANCH"
    success "Copied ralph/THOUGHTS.md template (needs customization)"
  fi
fi

# NEURONS.md goes in ralph/, not project root
if [ -f "$BRAIN_DIR/generators/generate-neurons.sh" ]; then
  info "Generating custom NEURONS.md..."
  bash "$BRAIN_DIR/generators/generate-neurons.sh" "$IDEA_FILE" "$PROJECT_LOCATION/ralph/NEURONS.md"
  success "Generated ralph/NEURONS.md"
else
  warn "Generator not found: generate-neurons.sh (using template fallback)"
  if [ -f "$TEMPLATES_DIR/NEURONS.project.md" ]; then
    cp "$TEMPLATES_DIR/NEURONS.project.md" "$PROJECT_LOCATION/ralph/NEURONS.md"
    substitute_placeholders "$PROJECT_LOCATION/ralph/NEURONS.md" "$REPO_NAME" "$WORK_BRANCH"
    success "Copied ralph/NEURONS.md template (needs customization)"
  fi
fi

# Generate IMPLEMENTATION_PLAN.md using HIGH INTELLIGENCE generator
if [ -f "$BRAIN_DIR/generators/generate-implementation-plan.sh" ]; then
  info "Generating custom IMPLEMENTATION_PLAN.md..."
  bash "$BRAIN_DIR/generators/generate-implementation-plan.sh" "$IDEA_FILE" "$PROJECT_LOCATION/ralph/IMPLEMENTATION_PLAN.md"
  success "Generated custom IMPLEMENTATION_PLAN.md"
else
  warn "Generator not found: generate-implementation-plan.sh (using template)"
  # Template already copied above
fi

# ============================================
# Create .gitignore
# ============================================

if [ -f "$TEMPLATES_DIR/.gitignore" ]; then
  cp "$TEMPLATES_DIR/.gitignore" "$PROJECT_LOCATION/.gitignore"
  success "Copied .gitignore from template"
else
  # Create default .gitignore
  cat >"$PROJECT_LOCATION/.gitignore" <<'EOF'
# Ralph logs
ralph/logs/

# Local environment
.env.local
*.local

# OS files
.DS_Store
Thumbs.db
EOF
  success "Created .gitignore"
fi

# ============================================
# Vendor Brain knowledge into the new repo (RovoDev workspace-safe)
# ============================================

# RovoDev cannot read outside the workspace; vendor a snapshot of Brain skills
# so agents can reference it locally under ./brain/skills/.
if [ -d "$BRAIN_ROOT/skills" ]; then
  info "Vendoring Brain skills into project workspace (brain/skills)..."
  mkdir -p "$PROJECT_LOCATION/brain"
  rm -rf "$PROJECT_LOCATION/brain/skills"
  cp -R "$BRAIN_ROOT/skills" "$PROJECT_LOCATION/brain/skills"
  success "Vendored brain/skills snapshot"
else
  warn "No skills/ directory found at Brain root; skipping brain knowledge snapshot"
fi

# ============================================
# Generate README.md
# ============================================

info "Generating README.md..."
cat >"$PROJECT_LOCATION/README.md" <<EOF
# $PROJECT_NAME

${PROJECT_PURPOSE:-A new project bootstrapped with Ralph Brain.}

## Tech Stack

${PROJECT_TECH:-To be defined.}

## Goals

${PROJECT_GOALS:-To be defined.}

## Development

**Default workflow:**
- Work happens on the \`$WORK_BRANCH\` branch (never directly on main)
- Use \`ralph/pr-batch.sh\` to create PRs back to main
- Run \`ralph/loop.sh\` to start AI-assisted development

### Getting Started

\`\`\`bash
cd ralph
bash loop.sh --iterations 5
\`\`\`

## 🧠 Built with Ralph Brain

This project uses [Ralph Brain](https://github.com/jonathanavis96/brain) for AI-assisted development.

Ralph integration is optional - the project works standalone.
EOF
success "Generated README.md"

# ============================================
# Archive IDEA file to project's docs/
# ============================================

info "Archiving IDEA file to project docs..."
IDEA_FILENAME=$(basename "$IDEA_FILE")
cp "$IDEA_FILE" "$PROJECT_LOCATION/docs/$IDEA_FILENAME"
success "Archived to: $PROJECT_LOCATION/docs/$IDEA_FILENAME"

# ============================================
# Git Initialization and GitHub Setup
# ============================================

info "Initializing git repository..."
cd "$PROJECT_LOCATION"

git init
git add .
git commit -m "Initial scaffolding from Ralph Brain"
git branch -M main

if [[ "$CREATE_REPO" == "true" ]]; then
  info "Creating GitHub repository..."

  # Loop for handling name conflicts
  while true; do
    create_output=$(gh repo create "$REPO_NAME" --public --source=. --remote=origin 2>&1)
    create_exit=$?

    if [[ $create_exit -eq 0 ]]; then
      success "GitHub repo created: $GITHUB_USERNAME/$REPO_NAME"
      break
    else
      # Classify error
      if echo "$create_output" | grep -qiE "already exists|name.*(taken|unavailable)|repository creation failed|could not create repository"; then
        # Name conflict
        warn "Repository name '$REPO_NAME' is not available"
        echo ""
        read -r -p "Enter a different repository name (or 'skip' for local-only): " new_repo_name
        if [[ "$new_repo_name" == "skip" ]]; then
          LOCAL_ONLY=true
          warn "Switching to local-only mode"
          break
        fi
        REPO_NAME="$new_repo_name"
        WORK_BRANCH="${REPO_NAME}-work"
      elif echo "$create_output" | grep -qiE "auth|permission|token|credential|network|could not resolve|rate limit|forbidden|unauthorized"; then
        # Auth/network failure
        warn "GitHub unavailable: $create_output"
        LOCAL_ONLY=true
        break
      else
        # Unknown error - fallback to local-only
        warn "Unknown error creating repo: $create_output"
        LOCAL_ONLY=true
        break
      fi
    fi
  done

  if [[ "$LOCAL_ONLY" != "true" ]]; then
    # Push main
    info "Pushing main branch..."
    git push -u origin main

    # Create and push work branch
    info "Creating work branch: $WORK_BRANCH"
    git checkout -b "$WORK_BRANCH"
    git push -u origin "$WORK_BRANCH"

    success "Repository setup complete!"
  fi
fi

# Handle local-only mode
if [[ "$LOCAL_ONLY" == "true" ]]; then
  warn "Project created in local-only mode"
  echo ""
  echo "To connect to GitHub later, run these commands:"
  echo ""
  echo "  gh repo create $REPO_NAME --public --source=. --remote=origin"
  echo "  git push -u origin main"
  echo "  git checkout -b $WORK_BRANCH"
  echo "  git push -u origin $WORK_BRANCH"
  echo ""

  # Still create local work branch
  git checkout -b "$WORK_BRANCH"
fi

# Ensure we end on work branch
git checkout "$WORK_BRANCH" 2>/dev/null || true

# ============================================
# Summary
# ============================================

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Project Bootstrap Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
info "Project created at: $PROJECT_LOCATION"
info "Current branch: $WORK_BRANCH"
if [[ "$LOCAL_ONLY" != "true" ]]; then
  info "GitHub repo: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
fi
echo ""
info "Next steps:"
echo "  1. cd $PROJECT_LOCATION"
echo "  2. Review and customize THOUGHTS.md, NEURONS.md if needed"
echo "  3. cd ralph && bash loop.sh --iterations 5"
echo ""
info "The project is on '$WORK_BRANCH' branch - ready for development!"
info "Use 'ralph/pr-batch.sh' to create PRs when ready to merge to main."
