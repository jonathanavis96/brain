#!/usr/bin/env bash
# setup.sh - Install Brain commands (cortex and ralph) to ~/bin

set -euo pipefail

# Colors
readonly CYAN='\033[0;36m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}🧠 Brain Setup${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Detect brain location (parent of where this script is)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${GREEN}✓ Brain location: ${BRAIN_ROOT}${NC}"

# Ensure ~/bin exists
mkdir -p ~/bin
echo -e "${GREEN}✓ Ensured ~/bin directory exists${NC}"

# Create cortex symlink
if [[ -f "$BRAIN_ROOT/cortex/cortex.bash" ]]; then
  ln -sf "$BRAIN_ROOT/cortex/cortex.bash" ~/bin/cortex
  echo -e "${GREEN}✓ Created ~/bin/cortex${NC}"
else
  echo -e "${RED}✗ cortex/cortex.bash not found${NC}"
  exit 1
fi

# Create ralph symlink
if [[ -f "$BRAIN_ROOT/workers/ralph/ralph.sh" ]]; then
  ln -sf "$BRAIN_ROOT/workers/ralph/ralph.sh" ~/bin/ralph
  echo -e "${GREEN}✓ Created ~/bin/ralph${NC}"
else
  echo -e "${RED}✗ workers/ralph/ralph.sh not found${NC}"
  exit 1
fi

# Check if ~/bin is in PATH
if [[ ":$PATH:" == *":$HOME/bin:"* ]]; then
  echo -e "${GREEN}✓ ~/bin is already in PATH${NC}"
else
  echo -e "${YELLOW}⚠ ~/bin is not in PATH${NC}"

  # Check which shell config file to update
  SHELL_CONFIG=""
  if [[ -f ~/.bashrc ]]; then
    SHELL_CONFIG=~/.bashrc
  elif [[ -f ~/.bash_profile ]]; then
    SHELL_CONFIG=~/.bash_profile
  elif [[ -f ~/.zshrc ]]; then
    SHELL_CONFIG=~/.zshrc
  else
    echo -e "${YELLOW}⚠ Could not detect shell config file${NC}"
    echo -e "${YELLOW}  Please add this to your shell config manually:${NC}"
    echo -e "${YELLOW}  export PATH=\"\$HOME/bin:\$PATH\"${NC}"
    echo ""
    echo -e "${GREEN}Setup complete!${NC}"
    exit 0
  fi

  # Check if we already added it before
  if grep -q "export PATH=\"\$HOME/bin:\$PATH\"" "$SHELL_CONFIG" 2>/dev/null; then
    echo -e "${GREEN}✓ PATH entry already exists in $SHELL_CONFIG${NC}"
  else
    echo ""
    echo -e "${CYAN}Adding ~/bin to PATH in $SHELL_CONFIG...${NC}"
    {
      echo ""
      echo "# Add ~/bin to PATH for Brain commands (cortex, ralph)"
      echo "export PATH=\"\$HOME/bin:\$PATH\""
    } >>"$SHELL_CONFIG"
    echo -e "${GREEN}✓ Added ~/bin to PATH in $SHELL_CONFIG${NC}"
    echo ""
    echo -e "${YELLOW}⚠ Run this to activate in current shell:${NC}"
    echo -e "${YELLOW}  source $SHELL_CONFIG${NC}"
  fi
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "Available commands:"
echo -e "  ${GREEN}cortex${NC}       - Interactive chat with Brain manager (GPT-5.2)"
echo -e "  ${GREEN}ralph${NC}        - Execute Brain tasks (GPT-5.2 Codex)"
echo ""
echo -e "Examples:"
echo -e "  ${CYAN}cortex${NC}                    # Start interactive chat"
echo -e "  ${CYAN}cortex --model sonnet${NC}     # Use Sonnet instead"
echo -e "  ${CYAN}cortex --model opus${NC}       # Use Opus instead"
echo -e "  ${CYAN}ralph -i20 -p5${NC}            # 20 iterations, plan every 5"
echo -e "  ${CYAN}ralph --dry-run${NC}           # Preview without executing"
echo ""

# Check if commands are accessible
if command -v cortex &>/dev/null && command -v ralph &>/dev/null; then
  echo -e "${GREEN}✓ Commands are ready to use!${NC}"
else
  echo -e "${YELLOW}⚠ Commands not yet in PATH for this shell${NC}"
  echo -e "${YELLOW}  Run: source $SHELL_CONFIG${NC}"
  echo -e "${YELLOW}  Or open a new terminal${NC}"
fi

echo ""
