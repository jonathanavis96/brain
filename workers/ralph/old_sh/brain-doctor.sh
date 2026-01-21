#!/usr/bin/env bash
#
# brain-doctor.sh - Brain Repository Diagnostic Tool
#
# Performs comprehensive health checks on the brain repository:
# - File counts and structure validation
# - Path consistency checks
# - Link validation
# - Token efficiency analysis
# - Knowledge base coverage
# - Template completeness
#
# Usage: bash brain-doctor.sh [--verbose]
#

set -uo pipefail

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

VERBOSE=false
if [[ "${1:-}" == "--verbose" ]]; then
    VERBOSE=true
fi

# Counters for summary
CHECKS_PASSED=0
CHECKS_WARNED=0
CHECKS_FAILED=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_check() {
    local status=$1
    local message=$2
    local detail="${3:-}"
    
    case $status in
        "PASS")
            echo -e "[${GREEN}✓${NC}] $message"
            ((CHECKS_PASSED++))
            ;;
        "WARN")
            echo -e "[${YELLOW}⚠${NC}] $message"
            ((CHECKS_WARNED++))
            ;;
        "FAIL")
            echo -e "[${RED}✗${NC}] $message"
            ((CHECKS_FAILED++))
            ;;
    esac
    
    if [[ -n "$detail" && "$VERBOSE" == "true" ]]; then
        echo "    $detail"
    fi
}

# Check 1: React Best Practices Rules
print_header "React Best Practices Rules"

RULE_COUNT=$(find references/react-best-practices/rules/ -name "*.md" 2>/dev/null | wc -l)
EXPECTED_RULES=45

if [[ $RULE_COUNT -eq $EXPECTED_RULES ]]; then
    print_check "PASS" "React rules count: $RULE_COUNT (expected: $EXPECTED_RULES)"
else
    print_check "FAIL" "React rules count: $RULE_COUNT (expected: $EXPECTED_RULES)"
fi

# Check 2: Knowledge Base Domain Files
print_header "Knowledge Base Structure"

KB_DOMAIN_COUNT=$(find kb/domains/ -name "*.md" 2>/dev/null | wc -l)
print_check "PASS" "KB domain files: $KB_DOMAIN_COUNT"

# Check KB file headers
KB_FILES_WITH_WHY=$(grep -l "## Why This Exists" kb/domains/*.md kb/projects/*.md 2>/dev/null | wc -l || echo 0)
KB_FILES_WITH_WHEN=$(grep -l "## When to Use It" kb/domains/*.md kb/projects/*.md 2>/dev/null | wc -l || echo 0)
KB_TOTAL=$(find kb/domains/ kb/projects/ -name "*.md" 2>/dev/null | grep -v "README.md" | grep -v "SUMMARY.md" | wc -l)

if [[ $KB_FILES_WITH_WHY -eq $KB_TOTAL && $KB_FILES_WITH_WHEN -eq $KB_TOTAL ]]; then
    print_check "PASS" "KB files with proper headers: $KB_TOTAL/$KB_TOTAL" "All KB files have 'Why This Exists' and 'When to Use It' sections"
elif [[ $KB_FILES_WITH_WHY -gt 0 || $KB_FILES_WITH_WHEN -gt 0 ]]; then
    print_check "WARN" "KB files with proper headers: ${KB_FILES_WITH_WHY}/${KB_TOTAL} (Why), ${KB_FILES_WITH_WHEN}/${KB_TOTAL} (When)"
else
    print_check "FAIL" "KB files missing proper headers"
fi

# Check 3: Template Completeness
print_header "Template Structure"

TEMPLATE_COUNT=$(find templates/ -name "*.md" -o -name "*.sh" | wc -l)
print_check "PASS" "Template files: $TEMPLATE_COUNT"

# Check each template directory
for template_dir in templates/*/; do
    if [[ -d "$template_dir" ]]; then
        dir_name=$(basename "$template_dir")
        file_count=$(find "$template_dir" -maxdepth 1 -type f | wc -l)
        
        if [[ $file_count -gt 0 ]]; then
            print_check "PASS" "  Template directory '$dir_name': $file_count files"
        else
            print_check "WARN" "  Template directory '$dir_name': empty"
        fi
    fi
done

# Check 4: Path Consistency
print_header "Path Consistency"

WINDOWS_PATHS=$(grep -r "C:\\\\" templates/ 2>/dev/null | wc -l || echo 0)
if [[ $WINDOWS_PATHS -eq 0 ]]; then
    print_check "PASS" "No Windows paths in templates"
else
    print_check "FAIL" "Found $WINDOWS_PATHS Windows paths in templates"
fi

BRAIN_PATH_REFS=$(grep -r "\.\./\.\./brain/" templates/ 2>/dev/null | grep -v ".bak" | wc -l || echo 0)
if [[ $BRAIN_PATH_REFS -gt 0 ]]; then
    print_check "PASS" "Bash-style brain paths used: $BRAIN_PATH_REFS references"
else
    print_check "WARN" "No bash-style brain path references found in templates"
fi

# Check 5: Token Efficiency
print_header "Token Efficiency"

if [[ -f "PROMPT.md" ]]; then
    PROMPT_BYTES=$(wc -c < PROMPT.md)
    PROMPT_TOKENS=$((PROMPT_BYTES / 4))
    PROMPT_TARGET=8000
    
    if [[ $PROMPT_BYTES -le $PROMPT_TARGET ]]; then
        print_check "PASS" "PROMPT.md: $PROMPT_BYTES bytes (~$PROMPT_TOKENS tokens, target: ≤$PROMPT_TARGET bytes)"
    else
        PROMPT_OVER=$((PROMPT_BYTES - PROMPT_TARGET))
        PROMPT_PCT=$(( (PROMPT_OVER * 100) / PROMPT_TARGET ))
        print_check "WARN" "PROMPT.md: $PROMPT_BYTES bytes (~$PROMPT_TOKENS tokens, exceeds target by $PROMPT_OVER bytes, ${PROMPT_PCT}%)"
    fi
else
    print_check "FAIL" "PROMPT.md not found"
fi

if [[ -f "AGENTS.md" ]]; then
    AGENTS_BYTES=$(wc -c < AGENTS.md)
    AGENTS_TOKENS=$((AGENTS_BYTES / 4))
    AGENTS_TARGET=2000
    
    if [[ $AGENTS_BYTES -le $AGENTS_TARGET ]]; then
        print_check "PASS" "AGENTS.md: $AGENTS_BYTES bytes (~$AGENTS_TOKENS tokens, target: ≤$AGENTS_TARGET bytes)"
    else
        AGENTS_OVER=$((AGENTS_BYTES - AGENTS_TARGET))
        AGENTS_PCT=$(( (AGENTS_OVER * 100) / AGENTS_TARGET ))
        print_check "WARN" "AGENTS.md: $AGENTS_BYTES bytes (~$AGENTS_TOKENS tokens, exceeds target by $AGENTS_OVER bytes, ${AGENTS_PCT}%)"
    fi
else
    print_check "FAIL" "AGENTS.md not found"
fi

TOTAL_BYTES=$((PROMPT_BYTES + AGENTS_BYTES))
TOTAL_TOKENS=$((TOTAL_BYTES / 4))
TOTAL_TARGET=10000

if [[ $TOTAL_BYTES -le $TOTAL_TARGET ]]; then
    print_check "PASS" "Total first-load: $TOTAL_BYTES bytes (~$TOTAL_TOKENS tokens, target: ≤$TOTAL_TARGET bytes)"
else
    TOTAL_OVER=$((TOTAL_BYTES - TOTAL_TARGET))
    TOTAL_PCT=$(( (TOTAL_OVER * 100) / TOTAL_TARGET ))
    print_check "WARN" "Total first-load: $TOTAL_BYTES bytes (~$TOTAL_TOKENS tokens, exceeds target by $TOTAL_OVER bytes, ${TOTAL_PCT}%)"
fi

# Check 6: Core Files Existence
print_header "Core Files"

CORE_FILES=("AGENTS.md" "NEURONS.md" "PROMPT.md" "IMPLEMENTATION_PLAN.md" "VALIDATION_CRITERIA.md" "THOUGHTS.md")
for file in "${CORE_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        print_check "PASS" "$file exists"
    else
        print_check "FAIL" "$file missing"
    fi
done

# Check 7: Script Syntax Validation
print_header "Script Syntax"

if bash -n loop.sh 2>/dev/null; then
    print_check "PASS" "loop.sh syntax valid"
else
    print_check "FAIL" "loop.sh syntax errors"
fi

if bash -n new-project.sh 2>/dev/null; then
    print_check "PASS" "new-project.sh syntax valid"
else
    print_check "FAIL" "new-project.sh syntax errors"
fi

GENERATOR_SCRIPTS=(generators/*.sh)
for script in "${GENERATOR_SCRIPTS[@]}"; do
    if [[ -f "$script" ]]; then
        script_name=$(basename "$script")
        if bash -n "$script" 2>/dev/null; then
            print_check "PASS" "$script_name syntax valid"
        else
            print_check "FAIL" "$script_name syntax errors"
        fi
    fi
done

# Check 8: Link Validation in SUMMARY.md
print_header "Link Validation"

if [[ -f "kb/SUMMARY.md" ]]; then
    BROKEN_LINKS=0
    while IFS= read -r line; do
        if [[ $line =~ \[.*\]\((.*)\) ]]; then
            link="${BASH_REMATCH[1]}"
            # Convert relative link to absolute path
            if [[ ! "$link" =~ ^http ]]; then
                full_path="kb/$link"
                if [[ ! -f "$full_path" ]]; then
                    ((BROKEN_LINKS++))
                    if [[ "$VERBOSE" == "true" ]]; then
                        echo "    Broken link: $link"
                    fi
                fi
            fi
        fi
    done < kb/SUMMARY.md
    
    if [[ $BROKEN_LINKS -eq 0 ]]; then
        print_check "PASS" "All links in kb/SUMMARY.md resolve"
    else
        print_check "FAIL" "Found $BROKEN_LINKS broken links in kb/SUMMARY.md"
    fi
else
    print_check "WARN" "kb/SUMMARY.md not found"
fi

# Check 9: Generator Executability
print_header "Generator Executability"

for script in generators/*.sh; do
    if [[ -f "$script" ]]; then
        script_name=$(basename "$script")
        if [[ -x "$script" ]]; then
            print_check "PASS" "$script_name is executable"
        else
            print_check "WARN" "$script_name not executable (run: chmod +x $script)"
        fi
    fi
done

# Check 10: Coverage Metrics
print_header "Coverage Metrics"

# KB Domain Coverage
KB_DOMAIN_PATTERNS=("auth" "caching" "api" "testing" "bootstrap" "database" "deployment")
KB_COVERED=0
for pattern in "${KB_DOMAIN_PATTERNS[@]}"; do
    if ls kb/domains/*${pattern}*.md 2>/dev/null | grep -q .; then
        ((KB_COVERED++))
    fi
done
KB_COVERAGE_PCT=$(( (KB_COVERED * 100) / ${#KB_DOMAIN_PATTERNS[@]} ))

if [[ $KB_COVERAGE_PCT -ge 70 ]]; then
    print_check "PASS" "KB domain coverage: $KB_COVERED/${#KB_DOMAIN_PATTERNS[@]} patterns (${KB_COVERAGE_PCT}%)"
elif [[ $KB_COVERAGE_PCT -ge 40 ]]; then
    print_check "WARN" "KB domain coverage: $KB_COVERED/${#KB_DOMAIN_PATTERNS[@]} patterns (${KB_COVERAGE_PCT}%)"
else
    print_check "FAIL" "KB domain coverage: $KB_COVERED/${#KB_DOMAIN_PATTERNS[@]} patterns (${KB_COVERAGE_PCT}%)"
fi

# Template Coverage
TEMPLATE_TYPES=("backend" "python" "ralph")
TEMPLATE_DIRS_FOUND=0
for template_type in "${TEMPLATE_TYPES[@]}"; do
    if [[ -d "templates/$template_type" ]]; then
        ((TEMPLATE_DIRS_FOUND++))
    fi
done
TEMPLATE_COVERAGE_PCT=$(( (TEMPLATE_DIRS_FOUND * 100) / ${#TEMPLATE_TYPES[@]} ))

if [[ $TEMPLATE_COVERAGE_PCT -eq 100 ]]; then
    print_check "PASS" "Template completeness: $TEMPLATE_DIRS_FOUND/${#TEMPLATE_TYPES[@]} types (${TEMPLATE_COVERAGE_PCT}%)"
elif [[ $TEMPLATE_COVERAGE_PCT -ge 66 ]]; then
    print_check "WARN" "Template completeness: $TEMPLATE_DIRS_FOUND/${#TEMPLATE_TYPES[@]} types (${TEMPLATE_COVERAGE_PCT}%)"
else
    print_check "FAIL" "Template completeness: $TEMPLATE_DIRS_FOUND/${#TEMPLATE_TYPES[@]} types (${TEMPLATE_COVERAGE_PCT}%)"
fi

# Bootstrap Test Suite
print_header "Bootstrap Infrastructure Tests"

if [[ -f "test-bootstrap.sh" ]]; then
    echo "Running bootstrap test suite..."
    if bash test-bootstrap.sh; then
        print_check "PASS" "Bootstrap test suite" "All bootstrap tests passed"
    else
        print_check "FAIL" "Bootstrap test suite" "Some bootstrap tests failed"
    fi
else
    print_check "WARN" "Bootstrap test suite" "test-bootstrap.sh not found"
fi

# Summary Report
print_header "Summary Report"

TOTAL_CHECKS=$((CHECKS_PASSED + CHECKS_WARNED + CHECKS_FAILED))
HEALTH_SCORE=$(( (CHECKS_PASSED * 100) / TOTAL_CHECKS ))

echo -e "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed:${NC} $CHECKS_PASSED"
echo -e "${YELLOW}Warnings:${NC} $CHECKS_WARNED"
echo -e "${RED}Failed:${NC} $CHECKS_FAILED"
echo ""

if [[ $HEALTH_SCORE -ge 90 ]]; then
    echo -e "Health Score: ${GREEN}${HEALTH_SCORE}%${NC} - Excellent"
    exit 0
elif [[ $HEALTH_SCORE -ge 70 ]]; then
    echo -e "Health Score: ${GREEN}${HEALTH_SCORE}%${NC} - Good"
    exit 0
elif [[ $HEALTH_SCORE -ge 50 ]]; then
    echo -e "Health Score: ${YELLOW}${HEALTH_SCORE}%${NC} - Fair (attention needed)"
    exit 1
else
    echo -e "Health Score: ${RED}${HEALTH_SCORE}%${NC} - Poor (immediate attention required)"
    exit 1
fi
