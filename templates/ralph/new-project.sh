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
#
# This script is designed to run from workers/ralph/ in any repo
# and will locate templates relative to its own location.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEMPLATES_DIR="$REPO_ROOT/templates"

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

# Sanitize project name for repo name (lowercase, hyphens)
sanitize_repo_name() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g'
}

# Substitute placeholders in file
substitute_placeholders() {
  local file=$1
  local repo_name=$2
  local work_branch=$3

  # Replace {{REPO_NAME}}, {{WORK_BRANCH}}, and {{PROJECT_NAME}}
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/{{REPO_NAME}}/$repo_name/g" "$file"
    sed -i '' "s/{{WORK_BRANCH}}/$work_branch/g" "$file"
    sed -i '' "s/{{PROJECT_NAME}}/$repo_name/g" "$file"
  else
    sed -i "s/{{REPO_NAME}}/$repo_name/g" "$file"
    sed -i "s/{{WORK_BRANCH}}/$work_branch/g" "$file"
    sed -i "s/{{PROJECT_NAME}}/$repo_name/g" "$file"
  fi
}

# Show usage
usage() {
  cat <<EOF
Usage: bash new-project.sh NEW_PROJECT_IDEA.md

Bootstrap a new project with Ralph infrastructure using the templates
from this repository.

The IDEA file should contain:
  - Project: <name>
  - Type: <backend|frontend|fullstack|cli|library>
  - Tech Stack: <comma-separated list>
  - Location: <path> (optional, defaults to sibling directory)
  - Description: <one-line summary>
  - Goals: <bullet list>

Options:
  -h, --help    Show this help message

Example:
  bash new-project.sh my-app-idea.md

EOF
  exit 0
}

# Parse command-line arguments
if [ $# -eq 0 ]; then
  usage
fi

if [[ "$1" == "-h" || "$1" == "--help" ]]; then
  usage
fi

IDEA_FILE="$1"

# Validate input
if [ ! -f "$IDEA_FILE" ]; then
  die "IDEA file not found: $IDEA_FILE"
fi

check_dependencies

info "Reading project idea from: $IDEA_FILE"

# Extract project information from IDEA file
PROJECT_NAME=$(grep -i "^Project:" "$IDEA_FILE" | sed 's/^Project://i' | xargs || echo "")
if [ -z "$PROJECT_NAME" ]; then
  PROJECT_NAME=$(grep -i "^# Project:" "$IDEA_FILE" | sed 's/^# Project://i' | xargs || echo "")
fi

PROJECT_TYPE=$(grep -i "^Type:" "$IDEA_FILE" | sed 's/^Type://i' | xargs || echo "")
TECH_STACK=$(grep -i "^Tech Stack:" "$IDEA_FILE" | sed 's/^Tech Stack://i' | xargs || echo "")
PROJECT_LOCATION=$(grep -i "^Location:" "$IDEA_FILE" | sed 's/^Location://i' | xargs || echo "")

info "Detected:"
info "  - Project Name: $PROJECT_NAME"
info "  - Type: ${PROJECT_TYPE:-not specified}"
info "  - Tech Stack: ${TECH_STACK:-not specified}"
if [ -n "$PROJECT_LOCATION" ]; then
  info "  - Location: $PROJECT_LOCATION"
fi

# Validate extracted information
if [ -z "$PROJECT_NAME" ]; then
  die "Could not extract project name from $IDEA_FILE. Expected 'Project: <name>' or '# Project: <name>'"
fi

# Handle Location: use from IDEA file, or fallback to sibling of current repo
if [ -z "$PROJECT_LOCATION" ]; then
  # Fallback: create as sibling of current repository
  DEFAULT_REPO_NAME=$(sanitize_repo_name "$PROJECT_NAME")
  PROJECT_LOCATION="$(dirname "$REPO_ROOT")/$DEFAULT_REPO_NAME"
  warn "Location not specified in IDEA file"
  info "Detected repo root: $REPO_ROOT"
  info "Project will be created at: $PROJECT_LOCATION"
elif [[ "$PROJECT_LOCATION" != /* ]]; then
  # Relative path: resolve relative to REPO_ROOT
  PROJECT_LOCATION="$REPO_ROOT/$PROJECT_LOCATION"
  info "Resolved relative path to: $PROJECT_LOCATION"
fi

# Suggest repo name (sanitized, shorter)
SUGGESTED_REPO=$(sanitize_repo_name "$PROJECT_NAME")

# Check if directory already exists
if [ -d "$PROJECT_LOCATION" ]; then
  die "Directory already exists: $PROJECT_LOCATION"
fi

# ============================================
# GitHub Repository Creation (Interactive)
# ============================================

info "GitHub repository setup..."

# Ask user if they want to create a GitHub repo
echo ""
read -rp "$(echo -e "${CYAN}Create GitHub repository? [y/N]:${NC} ")" CREATE_REPO
CREATE_REPO=${CREATE_REPO:-n}

if [[ "$CREATE_REPO" =~ ^[Yy]$ ]]; then
  if ! check_gh; then
    warn "gh CLI not available or not authenticated"
    warn "Skipping GitHub repo creation"
    warn "You can create the repo manually later and add it as remote"
    REPO_NAME="$SUGGESTED_REPO"
    WORK_BRANCH="${REPO_NAME}-work"
  else
    # Prompt for repo name (with suggestion)
    echo ""
    echo -e "${CYAN}Suggested repo name: ${GREEN}$SUGGESTED_REPO${NC}"
    read -rp "$(echo -e "${CYAN}Enter repo name (or press Enter to use suggestion):${NC} ")" REPO_NAME
    REPO_NAME=${REPO_NAME:-$SUGGESTED_REPO}

    # Prompt for visibility
    echo ""
    read -rp "$(echo -e "${CYAN}Make repository public? [y/N]:${NC} ")" IS_PUBLIC
    IS_PUBLIC=${IS_PUBLIC:-n}

    if [[ "$IS_PUBLIC" =~ ^[Yy]$ ]]; then
      VISIBILITY="--public"
    else
      VISIBILITY="--private"
    fi

    info "Creating GitHub repository: $REPO_NAME"

    # Create repo with gh CLI
    if gh repo create "$REPO_NAME" $VISIBILITY --clone=false --description "$PROJECT_NAME"; then
      success "Created GitHub repository: $REPO_NAME"
      WORK_BRANCH="${REPO_NAME}-work"
    else
      error "Failed to create GitHub repository"
      die "Please create the repository manually or run script again"
    fi
  fi
else
  info "Skipping GitHub repository creation"
  REPO_NAME="$SUGGESTED_REPO"
  WORK_BRANCH="${REPO_NAME}-work"
fi

# ============================================
# Create Project Directory Structure
# ============================================

info "Creating project at: $PROJECT_LOCATION"
mkdir -p "$PROJECT_LOCATION"
cd "$PROJECT_LOCATION" || die "Failed to cd to $PROJECT_LOCATION"

# Initialize git repository
if [ ! -d .git ]; then
  git init
  success "Initialized git repository"
fi

# Create workers/ralph/ directory (canonical A1 layout)
mkdir -p workers/ralph
success "Created workers/ralph/ directory"

# ============================================
# Copy Templates to workers/ralph/
# ============================================

info "Copying Ralph templates..."

# Create Cortex gap capture file (cross-project pattern mining)
if [ -f "$TEMPLATES_DIR/cortex/GAP_CAPTURE.project.md" ]; then
  mkdir -p "$PROJECT_LOCATION/cortex"
  cp "$TEMPLATES_DIR/cortex/GAP_CAPTURE.project.md" "$PROJECT_LOCATION/cortex/GAP_CAPTURE.md"
  substitute_placeholders "$PROJECT_LOCATION/cortex/GAP_CAPTURE.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Created cortex/GAP_CAPTURE.md"
else
  warn "Template not found: cortex/GAP_CAPTURE.project.md"
fi

# Copy AGENTS.md
if [ -f "$TEMPLATES_DIR/AGENTS.project.md" ]; then
  cp "$TEMPLATES_DIR/AGENTS.project.md" "$PROJECT_LOCATION/workers/ralph/AGENTS.md"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/AGENTS.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/AGENTS.md"
else
  warn "Template not found: AGENTS.project.md"
fi

# Copy Ralph infrastructure templates
if [ -f "$TEMPLATES_DIR/ralph/PROMPT.project.md" ]; then
  cp "$TEMPLATES_DIR/ralph/PROMPT.project.md" "$PROJECT_LOCATION/workers/ralph/PROMPT.md"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/PROMPT.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/PROMPT.md"
else
  warn "Template not found: ralph/PROMPT.project.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/IMPLEMENTATION_PLAN.project.md" ]; then
  mkdir -p "$PROJECT_LOCATION/workers"
  cp "$TEMPLATES_DIR/ralph/IMPLEMENTATION_PLAN.project.md" "$PROJECT_LOCATION/workers/IMPLEMENTATION_PLAN.md"
  substitute_placeholders "$PROJECT_LOCATION/workers/IMPLEMENTATION_PLAN.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/IMPLEMENTATION_PLAN.md"
else
  warn "Template not found: ralph/IMPLEMENTATION_PLAN.project.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/VALIDATION_CRITERIA.project.md" ]; then
  cp "$TEMPLATES_DIR/ralph/VALIDATION_CRITERIA.project.md" "$PROJECT_LOCATION/workers/ralph/VALIDATION_CRITERIA.md"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/VALIDATION_CRITERIA.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/VALIDATION_CRITERIA.md"
else
  warn "Template not found: ralph/VALIDATION_CRITERIA.project.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/NEURONS.project.md" ]; then
  cp "$TEMPLATES_DIR/ralph/NEURONS.project.md" "$PROJECT_LOCATION/workers/ralph/NEURONS.md"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/NEURONS.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/NEURONS.md"
else
  warn "Template not found: ralph/NEURONS.project.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/THOUGHTS.project.md" ]; then
  cp "$TEMPLATES_DIR/ralph/THOUGHTS.project.md" "$PROJECT_LOCATION/workers/ralph/THOUGHTS.md"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/THOUGHTS.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/THOUGHTS.md"
else
  warn "Template not found: ralph/THOUGHTS.project.md"
fi

if [ -f "$TEMPLATES_DIR/ralph/THUNK.project.md" ]; then
  cp "$TEMPLATES_DIR/ralph/THUNK.project.md" "$PROJECT_LOCATION/workers/ralph/THUNK.md"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/THUNK.md" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/THUNK.md"
else
  warn "Template not found: ralph/THUNK.project.md"
fi

# Copy loop.sh with placeholder substitution
if [ -f "$TEMPLATES_DIR/ralph/loop.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/loop.sh" "$PROJECT_LOCATION/workers/ralph/loop.sh"
  chmod +x "$PROJECT_LOCATION/workers/ralph/loop.sh"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/loop.sh" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/loop.sh (executable)"
else
  warn "Template not found: ralph/loop.sh"
fi

# Copy pr-batch.sh with placeholder substitution
if [ -f "$TEMPLATES_DIR/ralph/pr-batch.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/pr-batch.sh" "$PROJECT_LOCATION/workers/ralph/pr-batch.sh"
  chmod +x "$PROJECT_LOCATION/workers/ralph/pr-batch.sh"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/pr-batch.sh" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/pr-batch.sh (executable)"
else
  warn "Template not found: ralph/pr-batch.sh"
fi

# Copy monitor scripts (THUNK system)
if [ -f "$TEMPLATES_DIR/ralph/current_ralph_tasks.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/current_ralph_tasks.sh" "$PROJECT_LOCATION/workers/ralph/current_ralph_tasks.sh"
  chmod +x "$PROJECT_LOCATION/workers/ralph/current_ralph_tasks.sh"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/current_ralph_tasks.sh" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/current_ralph_tasks.sh (executable)"
else
  warn "Template not found: ralph/current_ralph_tasks.sh"
fi

if [ -f "$TEMPLATES_DIR/ralph/thunk_ralph_tasks.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/thunk_ralph_tasks.sh" "$PROJECT_LOCATION/workers/ralph/thunk_ralph_tasks.sh"
  chmod +x "$PROJECT_LOCATION/workers/ralph/thunk_ralph_tasks.sh"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/thunk_ralph_tasks.sh" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/thunk_ralph_tasks.sh (executable)"
else
  warn "Template not found: ralph/thunk_ralph_tasks.sh"
fi

# Copy verifier and rules

# Copy gap capture helper (cross-project pattern mining)
if [ -f "$TEMPLATES_DIR/ralph/capture_gap.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/capture_gap.sh" "$PROJECT_LOCATION/workers/ralph/capture_gap.sh"
  chmod +x "$PROJECT_LOCATION/workers/ralph/capture_gap.sh" || true
  success "Copied workers/ralph/capture_gap.sh"
else
  warn "Template not found: ralph/capture_gap.sh"
fi

# Copy brain skills sync helper
if [ -f "$TEMPLATES_DIR/ralph/sync_brain_skills.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/sync_brain_skills.sh" "$PROJECT_LOCATION/workers/ralph/sync_brain_skills.sh"
  chmod +x "$PROJECT_LOCATION/workers/ralph/sync_brain_skills.sh" || true
  success "Copied workers/ralph/sync_brain_skills.sh"
else
  warn "Template not found: ralph/sync_brain_skills.sh"
fi

# Copy verifier and rules
if [ -f "$TEMPLATES_DIR/ralph/verifier.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/verifier.sh" "$PROJECT_LOCATION/workers/ralph/verifier.sh"
  chmod +x "$PROJECT_LOCATION/workers/ralph/verifier.sh"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/verifier.sh" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/verifier.sh (executable)"
else
  warn "Template not found: ralph/verifier.sh"
fi

# Copy rules directory
if [ -d "$TEMPLATES_DIR/ralph/rules" ]; then
  cp -r "$TEMPLATES_DIR/ralph/rules" "$PROJECT_LOCATION/workers/ralph/rules"
  success "Copied workers/ralph/rules/"
else
  warn "Template not found: ralph/rules/"
fi

# Copy .verify directory structure
if [ -d "$TEMPLATES_DIR/ralph/.verify" ]; then
  cp -r "$TEMPLATES_DIR/ralph/.verify" "$PROJECT_LOCATION/workers/ralph/.verify"
  success "Copied workers/ralph/.verify/"
else
  # Create minimal .verify structure
  mkdir -p "$PROJECT_LOCATION/workers/ralph/.verify"
  touch "$PROJECT_LOCATION/workers/ralph/.verify/.initialized"
  success "Created workers/ralph/.verify/"
fi

# Copy initialization script
if [ -f "$TEMPLATES_DIR/ralph/init_verifier_baselines.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/init_verifier_baselines.sh" "$PROJECT_LOCATION/workers/ralph/init_verifier_baselines.sh"
  chmod +x "$PROJECT_LOCATION/workers/ralph/init_verifier_baselines.sh"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/init_verifier_baselines.sh" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/init_verifier_baselines.sh (executable)"
else
  warn "Template not found: ralph/init_verifier_baselines.sh"
fi

# Copy helper/cleanup scripts
if [ -f "$TEMPLATES_DIR/ralph/cleanup_plan.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/cleanup_plan.sh" "$PROJECT_LOCATION/workers/ralph/cleanup_plan.sh"
  chmod +x "$PROJECT_LOCATION/workers/ralph/cleanup_plan.sh"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/cleanup_plan.sh" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/cleanup_plan.sh (executable)"
else
  warn "Template not found: ralph/cleanup_plan.sh"
fi

if [ -f "$TEMPLATES_DIR/ralph/fix-markdown.sh" ]; then
  cp "$TEMPLATES_DIR/ralph/fix-markdown.sh" "$PROJECT_LOCATION/workers/ralph/fix-markdown.sh"
  chmod +x "$PROJECT_LOCATION/workers/ralph/fix-markdown.sh"
  substitute_placeholders "$PROJECT_LOCATION/workers/ralph/fix-markdown.sh" "$REPO_NAME" "$WORK_BRANCH"
  success "Copied workers/ralph/fix-markdown.sh (executable)"
else
  warn "Template not found: ralph/fix-markdown.sh"
fi

# Copy .gitignore for workers/ralph/
if [ -f "$TEMPLATES_DIR/ralph/.gitignore" ]; then
  cp "$TEMPLATES_DIR/ralph/.gitignore" "$PROJECT_LOCATION/workers/ralph/.gitignore"
  success "Copied workers/ralph/.gitignore"
else
  warn "Template not found: ralph/.gitignore"
fi

# Copy .markdownlint.yaml for workers/ralph/
if [ -f "$TEMPLATES_DIR/ralph/.markdownlint.yaml" ]; then
  cp "$TEMPLATES_DIR/ralph/.markdownlint.yaml" "$PROJECT_LOCATION/workers/ralph/.markdownlint.yaml"
  success "Copied workers/ralph/.markdownlint.yaml"
else
  warn "Template not found: ralph/.markdownlint.yaml"
fi

# Copy shared worker utilities if they exist
if [ -d "$TEMPLATES_DIR/../workers/shared" ]; then
  mkdir -p "$PROJECT_LOCATION/workers/shared"
  cp -r "$TEMPLATES_DIR/../workers/shared"/* "$PROJECT_LOCATION/workers/shared/"
  success "Copied workers/shared/ utilities"
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
workers/ralph/logs/

# Local environment
.env.local

# Dependencies
node_modules/
__pycache__/
*.pyc
.pytest_cache/

# Build artifacts
dist/
build/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF
  success "Created default .gitignore"
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
# Create README.md
# ============================================

cat >"$PROJECT_LOCATION/README.md" <<EOF
# $PROJECT_NAME

${PROJECT_TYPE:+**Type:** $PROJECT_TYPE}
${TECH_STACK:+**Tech Stack:** $TECH_STACK}

## Getting Started

This project uses Ralph for AI-assisted development.

### Running Ralph

\`\`\`bash
cd workers/ralph
bash loop.sh --iterations 5
\`\`\`

### Task Monitors

- **Current Tasks**: \`bash workers/ralph/current_ralph_tasks.sh\`
- **Completed Tasks**: \`bash workers/ralph/thunk_ralph_tasks.sh\`

## Project Structure

\`\`\`text
$PROJECT_NAME/
├── workers/
│   └── ralph/          # Ralph loop infrastructure
│       ├── AGENTS.md
│       ├── PROMPT.md
│       ├── IMPLEMENTATION_PLAN.md
│       ├── THUNK.md
│       ├── loop.sh
│       └── verifier.sh
└── README.md
\`\`\`

## Documentation

- **[workers/ralph/AGENTS.md](workers/ralph/AGENTS.md)** - Operational guide for agents
- **[workers/ralph/THOUGHTS.md](workers/ralph/THOUGHTS.md)** - Strategic vision
- **[workers/ralph/NEURONS.md](workers/ralph/NEURONS.md)** - Project structure map
- **[workers/IMPLEMENTATION_PLAN.md](workers/IMPLEMENTATION_PLAN.md)** - Task backlog

## Development

See [workers/ralph/VALIDATION_CRITERIA.md](workers/ralph/VALIDATION_CRITERIA.md) for quality gates.

EOF

success "Created README.md"

# ============================================
# Initialize Git and Create Work Branch
# ============================================

info "Setting up git branches..."

# Create initial commit
git add .
git commit -m "chore: bootstrap project with Ralph infrastructure" || warn "No changes to commit"

# If GitHub repo was created, add remote and setup branches
if [[ "$CREATE_REPO" =~ ^[Yy]$ ]] && check_gh; then
  info "Setting up remote and branches..."

  # Add remote
  git remote add origin "https://github.com/$(gh api user -q .login)/$REPO_NAME.git" 2>/dev/null || warn "Remote already exists"

  # Rename default branch to main (if needed)
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  if [ "$CURRENT_BRANCH" != "main" ]; then
    git branch -M main
  fi

  # Create work branch
  git checkout -b "$WORK_BRANCH"
  success "Created work branch: $WORK_BRANCH"

  # Push both branches
  info "Pushing to GitHub..."
  git push -u origin main
  git push -u origin "$WORK_BRANCH"

  success "Pushed branches to GitHub"

  # Return to work branch
  git checkout "$WORK_BRANCH"
else
  # No GitHub repo, just create work branch locally
  git checkout -b "$WORK_BRANCH"
  success "Created work branch: $WORK_BRANCH"
fi

# ============================================
# Initialize Verifier Baselines
# ============================================

info "Initializing verifier baselines..."
if [ -f "$PROJECT_LOCATION/workers/ralph/init_verifier_baselines.sh" ]; then
  cd "$PROJECT_LOCATION/workers/ralph" || die "Failed to cd to workers/ralph"
  bash init_verifier_baselines.sh
  success "Initialized verifier baselines"
else
  warn "init_verifier_baselines.sh not found, skipping"
fi

# ============================================
# Final Summary
# ============================================

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Project setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Project:${NC} $PROJECT_NAME"
echo -e "${CYAN}Location:${NC} $PROJECT_LOCATION"
if [[ "$CREATE_REPO" =~ ^[Yy]$ ]]; then
  echo -e "${CYAN}GitHub Repo:${NC} $REPO_NAME"
  echo -e "${CYAN}Work Branch:${NC} $WORK_BRANCH"
fi
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. ${CYAN}cd $PROJECT_LOCATION${NC}"
echo -e "  2. Review and customize workers/ralph/THOUGHTS.md"
echo -e "  3. Review and customize workers/IMPLEMENTATION_PLAN.md"
echo -e "  4. Run Ralph: ${CYAN}cd workers/ralph && bash loop.sh${NC}"
echo ""
echo -e "${YELLOW}Task Monitors:${NC}"
echo -e "  - Current tasks: ${CYAN}bash workers/ralph/current_ralph_tasks.sh${NC}"
echo -e "  - Completed: ${CYAN}bash workers/ralph/thunk_ralph_tasks.sh${NC}"
echo ""
if [[ "$CREATE_REPO" =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}GitHub Workflow:${NC}"
  echo -e "  - Work on: ${CYAN}$WORK_BRANCH${NC} branch"
  echo -e "  - PR to: ${CYAN}main${NC} branch"
  echo ""
fi

success "Happy coding! 🚀"
