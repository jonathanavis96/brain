#!/usr/bin/env bash
# validate_tool_inventory.sh - Verify docs/TOOLS.md is in sync with actual tools

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for issues
issues=0

echo "=== Tool Inventory Validator ==="
echo ""

# Get repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DOC="${REPO_ROOT}/docs/TOOLS.md"

if [[ ! -f "$TOOLS_DOC" ]]; then
    echo -e "${RED}ERROR: docs/TOOLS.md not found${NC}"
    exit 1
fi

echo "Checking docs/TOOLS.md against actual tools..."
echo ""

# Find all executables in bin/
echo "## Checking bin/ tools..."
mapfile -t bin_tools < <(find "${REPO_ROOT}/bin" -maxdepth 1 -type f -executable 2>/dev/null | sort)

for tool in "${bin_tools[@]}"; do
    tool_name=$(basename "$tool")
    if ! grep -q "### \`bin/${tool_name}\`" "$TOOLS_DOC"; then
        echo -e "${RED}MISSING: bin/${tool_name} not documented${NC}"
        ((issues++))
    else
        echo -e "${GREEN}OK: bin/${tool_name}${NC}"
    fi
done

# Find all Python tools
echo ""
echo "## Checking tools/ Python scripts..."
mapfile -t py_tools < <(find "${REPO_ROOT}/tools" -maxdepth 1 -name "*.py" -type f ! -name "__init__.py" 2>/dev/null | sort)

for tool in "${py_tools[@]}"; do
    tool_name=$(basename "$tool")
    if ! grep -q "\`tools/${tool_name}\`" "$TOOLS_DOC"; then
        echo -e "${RED}MISSING: tools/${tool_name} not documented${NC}"
        ((issues++))
    else
        echo -e "${GREEN}OK: tools/${tool_name}${NC}"
    fi
done

# Find all shell scripts in tools/
echo ""
echo "## Checking tools/ shell scripts..."
mapfile -t sh_tools < <(find "${REPO_ROOT}/tools" -maxdepth 1 -name "*.sh" -type f 2>/dev/null | sort)

for tool in "${sh_tools[@]}"; do
    tool_name=$(basename "$tool")
    if ! grep -q "\`tools/${tool_name}\`" "$TOOLS_DOC"; then
        echo -e "${RED}MISSING: tools/${tool_name} not documented${NC}"
        ((issues++))
    else
        echo -e "${GREEN}OK: tools/${tool_name}${NC}"
    fi
done

# Find tool subdirectories
echo ""
echo "## Checking tools/ subdirectories..."
mapfile -t tool_dirs < <(find "${REPO_ROOT}/tools" -mindepth 1 -maxdepth 1 -type d ! -name "__pycache__" ! -name "*.egg-info" 2>/dev/null | sort)

for tool_dir in "${tool_dirs[@]}"; do
    dir_name=$(basename "$tool_dir")
    if ! grep -q "### \`tools/${dir_name}/\`" "$TOOLS_DOC"; then
        echo -e "${YELLOW}WARNING: tools/${dir_name}/ might not be documented${NC}"
    else
        echo -e "${GREEN}OK: tools/${dir_name}/${NC}"
    fi
done

# Check worker scripts
echo ""
echo "## Checking workers/ralph/ scripts..."
worker_scripts=(
    "loop.sh"
    "current_ralph_tasks.sh"
    "thunk_ralph_tasks.sh"
    "verifier.sh"
    "fix-markdown.sh"
    "render_ac_status.sh"
    "sync_workers_plan_to_cortex.sh"
    "init_verifier_baselines.sh"
    "cleanup_plan.sh"
    "new-project.sh"
)

for script in "${worker_scripts[@]}"; do
    if [[ -f "${REPO_ROOT}/workers/ralph/${script}" ]]; then
        if ! grep -q "### \`workers/ralph/${script}\`" "$TOOLS_DOC"; then
            echo -e "${RED}MISSING: workers/ralph/${script} not documented${NC}"
            ((issues++))
        else
            echo -e "${GREEN}OK: workers/ralph/${script}${NC}"
        fi
    fi
done

echo ""
echo "=== Summary ==="
if [[ $issues -eq 0 ]]; then
    echo -e "${GREEN}✓ All tools are documented in docs/TOOLS.md${NC}"
    exit 0
else
    echo -e "${RED}✗ Found ${issues} undocumented tools${NC}"
    echo ""
    echo "To regenerate docs/TOOLS.md, see the procedure in the file header."
    exit 1
fi
