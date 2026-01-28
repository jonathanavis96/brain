#!/usr/bin/env bash
# setup-linters.sh - Install static analysis tools for brain repository
# Run with: bash setup-linters.sh
#
# Tools installed:
#   - shellcheck: Shell script static analysis
#   - shfmt: Shell script formatter
#   - markdownlint-cli: Markdown linter
#   - jq: JSON processor
#   - yq: YAML processor
#   - pre-commit: Git hooks framework
#   - ruff: Python linter
#   - mypy: Python type checker
#   - eslint: JavaScript/TypeScript linter
#   - prettier: Code formatter (JS, CSS, HTML, MD)
#   - typescript: TypeScript compiler/checker
#   - gh: GitHub CLI
#   - gh-pages: GitHub Pages deployment

set -euo pipefail

echo "🔧 Installing linting tools for brain repository..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; }

# Track what we installed
INSTALLED=()
SKIPPED=()
FAILED=()

# =============================================================================
# APT packages (require sudo)
# =============================================================================
echo "📦 Installing apt packages..."

install_apt() {
  local pkg="$1"
  local desc="$2"
  if command -v "$pkg" &>/dev/null; then
    SKIPPED+=("$pkg (already installed)")
    return 0
  fi

  if sudo apt-get install -y "$pkg" &>/dev/null; then
    INSTALLED+=("$pkg - $desc")
    success "$pkg installed"
  else
    FAILED+=("$pkg")
    fail "$pkg failed to install"
  fi
}

# Update apt cache once
sudo apt-get update -qq

install_apt "shellcheck" "Shell script static analysis"
install_apt "jq" "JSON processor"
install_apt "gh" "GitHub CLI"

# yq - YAML processor (like jq but for YAML)
if command -v yq &>/dev/null; then
  SKIPPED+=("yq (already installed)")
elif sudo apt-get install -y yq &>/dev/null 2>&1; then
  INSTALLED+=("yq - YAML processor")
  success "yq installed"
elif command -v snap &>/dev/null && sudo snap install yq &>/dev/null 2>&1; then
  INSTALLED+=("yq - YAML processor (via snap)")
  success "yq installed via snap"
elif pip install --user yq &>/dev/null 2>&1; then
  INSTALLED+=("yq - YAML processor (via pip)")
  success "yq installed via pip"
else
  FAILED+=("yq")
  warn "yq not available - install manually from https://github.com/mikefarah/yq"
fi

# shfmt might be in a different package name or need snap
if command -v shfmt &>/dev/null; then
  SKIPPED+=("shfmt (already installed)")
elif sudo apt-get install -y shfmt &>/dev/null 2>&1; then
  INSTALLED+=("shfmt - Shell script formatter")
  success "shfmt installed"
elif command -v snap &>/dev/null && sudo snap install shfmt &>/dev/null 2>&1; then
  INSTALLED+=("shfmt - Shell script formatter (via snap)")
  success "shfmt installed via snap"
else
  FAILED+=("shfmt")
  warn "shfmt not available via apt or snap - install manually: GO111MODULE=on go install mvdan.cc/sh/v3/cmd/shfmt@latest"
fi

echo ""

# =============================================================================
# npm packages (web development tools)
# =============================================================================
echo "📦 Installing npm packages..."

install_npm() {
  local pkg="$1"
  local desc="$2"
  local cmd="${3:-$pkg}" # command name might differ from package name

  if ! command -v npm &>/dev/null; then
    SKIPPED+=("$pkg (npm not available)")
    return 0
  fi

  if command -v "$cmd" &>/dev/null; then
    SKIPPED+=("$pkg (already installed)")
    return 0
  fi

  if npm install -g "$pkg" &>/dev/null 2>&1; then
    INSTALLED+=("$pkg - $desc")
    success "$pkg installed"
  else
    FAILED+=("$pkg")
    fail "$pkg failed to install"
  fi
}

if command -v npm &>/dev/null; then
  # Markdown
  install_npm "markdownlint-cli" "Markdown linter" "markdownlint"

  # JavaScript/TypeScript
  install_npm "eslint" "JavaScript/TypeScript linter"
  install_npm "prettier" "Code formatter (JS, CSS, HTML, MD)"
  install_npm "typescript" "TypeScript compiler/checker" "tsc"

  # GitHub Pages deployment
  install_npm "gh-pages" "GitHub Pages deployment"
else
  warn "npm not found - skipping all npm packages (markdownlint, eslint, prettier, typescript, gh-pages)"
  SKIPPED+=("npm packages (npm not available)")
fi

echo ""

# =============================================================================
# Python packages via pipx (for Python 3.12+ compatibility)
# =============================================================================
echo "📦 Installing Python packages via pipx..."

# Ensure pipx is available
if ! command -v pipx &>/dev/null; then
  echo "Installing pipx first..."
  if sudo apt-get install -y pipx &>/dev/null 2>&1; then
    pipx ensurepath &>/dev/null 2>&1 || true
    INSTALLED+=("pipx - Python app installer")
    success "pipx installed"
  else
    FAILED+=("pipx")
    fail "pipx failed to install - Python tools will be skipped"
    warn "Install manually: sudo apt-get install pipx"
  fi
fi

install_pipx() {
  local pkg="$1"
  local desc="$2"
  local cmd="${3:-$pkg}" # command name might differ from package name

  if ! command -v pipx &>/dev/null; then
    SKIPPED+=("$pkg (pipx not available)")
    return 0
  fi

  if command -v "$cmd" &>/dev/null; then
    SKIPPED+=("$pkg (already installed)")
    return 0
  fi

  if pipx install "$pkg" &>/dev/null 2>&1; then
    INSTALLED+=("$pkg - $desc")
    success "$pkg installed"
  else
    FAILED+=("$pkg")
    fail "$pkg failed to install"
  fi
}

install_pipx "pre-commit" "Git hooks framework"
install_pipx "ruff" "Python linter (ultra-fast)"
install_pipx "mypy" "Python static type checker"

echo ""

# =============================================================================
# Summary
# =============================================================================
echo "========================================"
echo "📋 Installation Summary"
echo "========================================"

if [[ ${#INSTALLED[@]} -gt 0 ]]; then
  echo ""
  echo -e "${GREEN}Installed:${NC}"
  for item in "${INSTALLED[@]}"; do
    echo "  ✅ $item"
  done
fi

if [[ ${#SKIPPED[@]} -gt 0 ]]; then
  echo ""
  echo -e "${YELLOW}Skipped:${NC}"
  for item in "${SKIPPED[@]}"; do
    echo "  ⏭️  $item"
  done
fi

if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo ""
  echo -e "${RED}Failed:${NC}"
  for item in "${FAILED[@]}"; do
    echo "  ❌ $item"
  done
fi

echo ""
echo "========================================"
echo "🔍 Verify installation:"
echo "========================================"
echo "  shellcheck --version"
echo "  markdownlint --version"
echo "  pre-commit --version"
echo "  ruff --version"
echo "  mypy --version"
echo "  jq --version"
echo "  yq --version"
echo "  eslint --version"
echo "  prettier --version"
echo "  tsc --version"
echo "  gh --version"
echo "  gh-pages --version"
echo ""
echo "📝 Next steps:"
echo "  1. Run 'pre-commit install' to enable git hooks"
echo "  2. Run 'pre-commit run --all-files' to check all files"
echo ""
