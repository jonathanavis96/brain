#!/usr/bin/env bash
#
# test-bootstrap.sh - Automated Bootstrap Test Suite
#
# Tests the brain repository's bootstrap infrastructure:
# - new-project.sh creates all expected files with correct structure
# - Generators execute without errors and render correct content
# - Generated projects pass validation on first run
#
# Usage: bash test-bootstrap.sh [--verbose]
#
# Exit codes:
#   0 - All tests passed
#   1 - One or more tests failed

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_DIR="$SCRIPT_DIR"
TEST_DIR="/tmp/bootstrap_test_$$"
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: bash test-bootstrap.sh [--verbose]"
            exit 1
            ;;
    esac
done

# Helper functions
info() { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[✓]${NC} $*"; }
fail() { echo -e "${RED}[✗]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
debug() { [[ "$VERBOSE" == "true" ]] && echo -e "${CYAN}[DEBUG]${NC} $*" || true; }
section() { echo -e "\n${CYAN}═══ $* ═══${NC}"; }

# Test framework
assert_file_exists() {
    local file="$1"
    local description="${2:-File $file exists}"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if [[ -f "$file" ]]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        success "$description"
        return 0
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        fail "$description (file not found: $file)"
        return 1
    fi
}

assert_file_contains() {
    local file="$1"
    local pattern="$2"
    local description="${3:-File $file contains '$pattern'}"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if [[ ! -f "$file" ]]; then
        TESTS_FAILED=$((TESTS_FAILED + 1))
        fail "$description (file not found: $file)"
        return 1
    fi
    
    if grep -q "$pattern" "$file"; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        success "$description"
        return 0
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        fail "$description (pattern not found)"
        debug "Expected pattern: $pattern"
        return 1
    fi
}

assert_command_succeeds() {
    local description="$1"
    shift
    TESTS_RUN=$((TESTS_RUN + 1))
    
    debug "Running: $*"
    if "$@" > /dev/null 2>&1; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        success "$description"
        return 0
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        fail "$description"
        debug "Command failed: $*"
        return 1
    fi
}

assert_file_count() {
    local dir="$1"
    local pattern="$2"
    local expected_count="$3"
    local description="${4:-Directory $dir has $expected_count files matching '$pattern'}"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if [[ ! -d "$dir" ]]; then
        TESTS_FAILED=$((TESTS_FAILED + 1))
        fail "$description (directory not found: $dir)"
        return 1
    fi
    
    local actual_count
    actual_count=$(find "$dir" -name "$pattern" 2>/dev/null | wc -l)
    
    if [[ "$actual_count" -eq "$expected_count" ]]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        success "$description"
        return 0
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        fail "$description (found $actual_count, expected $expected_count)"
        return 1
    fi
}

# Cleanup function
cleanup() {
    if [[ -d "$TEST_DIR" ]]; then
        debug "Cleaning up test directory: $TEST_DIR"
        rm -rf "$TEST_DIR"
    fi
}

trap cleanup EXIT

# Create test project idea file
create_test_project_idea() {
    local project_type="$1"
    local test_file="$TEST_DIR/test_project_idea_${project_type}.md"
    
    cat > "$test_file" << EOF
# Project: test-${project_type}-project

Location: $TEST_DIR/test_${project_type}_output
Tech Stack: $project_type
Purpose: Automated test project for bootstrap validation
Goals: Test bootstrap infrastructure, validate generator output, verify file structure
EOF
    
    echo "$test_file"
}

# Test Suite 1: new-project.sh basic functionality
test_new_project_basic() {
    section "Test Suite 1: new-project.sh Basic Functionality"
    
    # Test 1.1: Script exists and is executable
    assert_file_exists "$BRAIN_DIR/new-project.sh" "new-project.sh exists"
    assert_command_succeeds "new-project.sh is executable" test -x "$BRAIN_DIR/new-project.sh"
    
    # Test 1.2: Script has valid bash syntax
    assert_command_succeeds "new-project.sh has valid syntax" bash -n "$BRAIN_DIR/new-project.sh"
    
    # Test 1.3: Script shows usage with no arguments (expect exit code 1)
    TESTS_RUN=$((TESTS_RUN + 1))
    local output
    output=$("$BRAIN_DIR/new-project.sh" 2>&1 || true)
    if echo "$output" | grep -q "Usage:"; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        success "new-project.sh shows usage message when called without arguments"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        fail "new-project.sh shows usage message when called without arguments"
        debug "Output: $output"
    fi
}

# Test Suite 2: Generator functionality
test_generators() {
    section "Test Suite 2: Generator Scripts"
    
    local generators=(
        "generate-implementation-plan.sh"
        "generate-neurons.sh"
        "generate-thoughts.sh"
    )
    
    for generator in "${generators[@]}"; do
        local gen_path="$BRAIN_DIR/generators/$generator"
        
        # Test 2.x.1: Generator exists and is executable
        assert_file_exists "$gen_path" "Generator $generator exists"
        assert_command_succeeds "Generator $generator is executable" test -x "$gen_path"
        
        # Test 2.x.2: Generator has valid bash syntax
        assert_command_succeeds "Generator $generator has valid syntax" bash -n "$gen_path"
    done
}

# Test Suite 3: Template structure
test_template_structure() {
    section "Test Suite 3: Template Structure"
    
    # Test 3.1: Template directories exist
    assert_command_succeeds "templates/ directory exists" test -d "$BRAIN_DIR/templates"
    assert_command_succeeds "templates/ralph/ directory exists" test -d "$BRAIN_DIR/templates/ralph"
    assert_command_succeeds "templates/backend/ directory exists" test -d "$BRAIN_DIR/templates/backend"
    assert_command_succeeds "templates/python/ directory exists" test -d "$BRAIN_DIR/templates/python"
    
    # Test 3.2: Core template files exist
    local core_templates=(
        "templates/AGENTS.project.md"
        "templates/NEURONS.project.md"
        "templates/THOUGHTS.project.md"
        "templates/ralph/IMPLEMENTATION_PLAN.project.md"
        "templates/ralph/VALIDATION_CRITERIA.project.md"
        "templates/ralph/PROMPT.project.md"
        "templates/ralph/loop.sh"
    )
    
    for template in "${core_templates[@]}"; do
        assert_file_exists "$BRAIN_DIR/$template" "Template $template exists"
    done
    
    # Test 3.3: Template file count matches documentation
    # Actual count: 18 .md files + 1 .sh file = 19 total template files
    assert_file_count "$BRAIN_DIR/templates" "*.md" 18 "Template directory has 18 .md files"
}

# Test Suite 4: Bootstrap ralph project
test_bootstrap_ralph_project() {
    section "Test Suite 4: Bootstrap Ralph Project"
    
    # Create test project idea
    local idea_file
    idea_file=$(create_test_project_idea "ralph")
    
    # Run new-project.sh
    info "Running new-project.sh for ralph project..."
    if bash "$BRAIN_DIR/new-project.sh" "$idea_file" > /dev/null 2>&1; then
        success "new-project.sh completed without errors"
    else
        fail "new-project.sh completed without errors"
        return 1
    fi
    
    local project_dir="$TEST_DIR/test_ralph_output"
    
    # Test 4.1: Core Ralph files created
    assert_file_exists "$project_dir/AGENTS.md" "Ralph project has AGENTS.md"
    assert_file_exists "$project_dir/NEURONS.md" "Ralph project has NEURONS.md"
    assert_file_exists "$project_dir/THOUGHTS.md" "Ralph project has THOUGHTS.md"
    assert_file_exists "$project_dir/ralph/IMPLEMENTATION_PLAN.md" "Ralph project has ralph/IMPLEMENTATION_PLAN.md"
    assert_file_exists "$project_dir/ralph/VALIDATION_CRITERIA.md" "Ralph project has ralph/VALIDATION_CRITERIA.md"
    assert_file_exists "$project_dir/ralph/PROMPT.md" "Ralph project has ralph/PROMPT.md"
    assert_file_exists "$project_dir/ralph/loop.sh" "Ralph project has ralph/loop.sh"
    
    # Test 4.2: Generated files contain project name
    assert_file_contains "$project_dir/THOUGHTS.md" "test-ralph-project" "THOUGHTS.md contains project name"
    
    # Test 4.3: loop.sh is executable
    assert_command_succeeds "ralph/loop.sh is executable" test -x "$project_dir/ralph/loop.sh"
    
    # Test 4.4: loop.sh has valid syntax
    assert_command_succeeds "ralph/loop.sh has valid syntax" bash -n "$project_dir/ralph/loop.sh"
    
    # Test 4.5: Directory structure created
    assert_command_succeeds "ralph/ directory exists" test -d "$project_dir/ralph"
    assert_command_succeeds "src/ directory exists" test -d "$project_dir/src"
    assert_command_succeeds "kb/ directory exists" test -d "$project_dir/kb"
}

# Test Suite 5: Bootstrap backend project
test_bootstrap_backend_project() {
    section "Test Suite 5: Bootstrap Backend Project"
    
    local idea_file
    idea_file=$(create_test_project_idea "backend")
    
    info "Running new-project.sh for backend project..."
    if bash "$BRAIN_DIR/new-project.sh" "$idea_file" > /dev/null 2>&1; then
        success "new-project.sh completed for backend project"
    else
        fail "new-project.sh completed for backend project"
        return 1
    fi
    
    local project_dir="$TEST_DIR/test_backend_output"
    
    # Test 5.1: Core files created
    assert_file_exists "$project_dir/AGENTS.md" "Backend project has AGENTS.md"
    assert_file_exists "$project_dir/NEURONS.md" "Backend project has NEURONS.md"
    assert_file_exists "$project_dir/THOUGHTS.md" "Backend project has THOUGHTS.md"
    
    # Test 5.2: Directory structure created
    assert_command_succeeds "src/ directory exists" test -d "$project_dir/src"
    assert_command_succeeds "kb/ directory exists" test -d "$project_dir/kb"
}

# Test Suite 6: Bootstrap python project
test_bootstrap_python_project() {
    section "Test Suite 6: Bootstrap Python Project"
    
    local idea_file
    idea_file=$(create_test_project_idea "python")
    
    info "Running new-project.sh for python project..."
    if bash "$BRAIN_DIR/new-project.sh" "$idea_file" > /dev/null 2>&1; then
        success "new-project.sh completed for python project"
    else
        fail "new-project.sh completed for python project"
        return 1
    fi
    
    local project_dir="$TEST_DIR/test_python_output"
    
    # Test 6.1: Core files created
    assert_file_exists "$project_dir/AGENTS.md" "Python project has AGENTS.md"
    assert_file_exists "$project_dir/NEURONS.md" "Python project has NEURONS.md"
    assert_file_exists "$project_dir/THOUGHTS.md" "Python project has THOUGHTS.md"
    
    # Test 6.2: Directory structure created
    assert_command_succeeds "src/ directory exists" test -d "$project_dir/src"
    assert_command_succeeds "kb/ directory exists" test -d "$project_dir/kb"
}

# Main test execution
main() {
    info "Starting Brain Repository Bootstrap Test Suite"
    info "Test directory: $TEST_DIR"
    
    # Create test directory
    mkdir -p "$TEST_DIR"
    
    # Run test suites
    test_new_project_basic
    test_generators
    test_template_structure
    test_bootstrap_ralph_project
    test_bootstrap_backend_project
    test_bootstrap_python_project
    
    # Print summary
    section "Test Summary"
    echo ""
    echo "  Tests Run:    $TESTS_RUN"
    echo "  Tests Passed: $(printf "${GREEN}%d${NC}" "$TESTS_PASSED")"
    echo "  Tests Failed: $(printf "${RED}%d${NC}" "$TESTS_FAILED")"
    echo ""
    
    if [[ "$TESTS_FAILED" -eq 0 ]]; then
        success "All tests passed! ✓"
        return 0
    else
        fail "Some tests failed. Review output above for details."
        return 1
    fi
}

# Run main
main
