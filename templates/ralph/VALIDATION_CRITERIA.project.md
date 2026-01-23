# Validation Criteria - [PROJECT_NAME]

Last verified: [YYYY-MM-DD HH:MM:SS]

## Purpose

Quality gates and acceptance criteria for [PROJECT_NAME].
Check these after completing implementation tasks to ensure the system meets requirements.

[REPLACE: Describe what this validation criteria file checks. What quality standards must the project meet?]

## Structure Validation

[REPLACE: Define structural requirements - files that must exist, directory layout, configuration files, etc.]

Example structure checks:

- [ ] Core directory structure exists (src/, bin/, config/, docs/, drivers/)
- [ ] Configuration files present and valid
- [ ] Required dependencies installed
- [ ] Entry points properly configured
- [ ] Source code in project root src/, NOT ralph/src/
- [ ] Scripts in project root bin/, NOT ralph/bin/

Example specific checks:

- [ ] `[critical-file].ext` exists with required sections
- [ ] `[directory/]` contains expected subdirectories
- [ ] `[config-file]` has all required fields

## Functional Validation

[REPLACE: Define functional requirements - what must work, what behavior is expected, performance criteria, etc.]

Example functional checks:

- [ ] Core feature X works as specified
- [ ] Integration with Y functions correctly
- [ ] Error handling covers edge cases
- [ ] Performance meets targets (response time, throughput, etc.)

Example specific checks:

- [ ] [Feature name] produces expected output
- [ ] [API endpoint] returns correct data format
- [ ] [Module] handles [error condition] gracefully
- [ ] [Process] completes within [time threshold]

## Content Validation

[REPLACE: Define content quality requirements - documentation, code quality, naming conventions, etc.]

Example content checks:

- [ ] All public APIs have documentation
- [ ] Code follows project style guide
- [ ] Naming conventions consistent
- [ ] Comments explain "why" not "what"

Example specific checks:

- [ ] `[file-pattern]` files have header documentation
- [ ] `[function-pattern]` functions have JSDoc/docstrings
- [ ] No TODO comments in main branch without tracking issue
- [ ] README.md reflects current project state

## Documentation Validation

[REPLACE: Define documentation requirements - what must be documented, where, and to what level of detail]

Example documentation checks:

- [ ] THOUGHTS.md reflects current goals and success criteria
- [ ] NEURONS.md maps current codebase structure
- [ ] IMPLEMENTATION_PLAN.md has actionable tasks
- [ ] AGENTS.md describes how Ralph works in this project

Example specific checks:

- [ ] Setup instructions tested on fresh environment
- [ ] API documentation matches implementation
- [ ] Architecture decisions documented with rationale
- [ ] Troubleshooting section covers common issues

## How to Use This File

**For Ralph (Planning Mode):**

- Review these criteria when analyzing requirements
- Use as reference for quality standards
- Update if new validation criteria are discovered
- Ensure planned tasks will satisfy these criteria

**For Ralph (Building Mode - Step 4: Validate):**

- Reference relevant validation criteria for current task
- Run validation commands to verify implementation
- Check that your changes don't violate any criteria
- Update task in IMPLEMENTATION_PLAN.md with validation results

**For Manual Verification:**

- Run through checklist after major milestones
- Mark items [x] as they're verified
- Document verification results in IMPLEMENTATION_PLAN.md notes
- Update criteria if new quality requirements emerge

## Validation Commands

[REPLACE: List bash commands that verify the project meets requirements. Make these copy-paste-able.]

```bash
# File structure validation
ls -la [key-directory]/
find [source-directory]/ -name "*.ext" | wc -l

# Code quality checks
[linter-command] [source-directory]/
[test-command] --coverage

# Functional validation
[build-command]
[test-command] --verbose
[integration-test-command]

# Documentation checks
grep -r "## [Required Section]" [docs-directory]/
[doc-build-command] # Verify docs build without errors

# Performance validation
[benchmark-command]
[load-test-command]
```text

## Example Project-Specific Checks

[REPLACE: Add validation checks specific to your project's domain]

**For a Web Application:**

```bash
# Build succeeds
npm run build

# Tests pass
npm test

# No TypeScript errors
npm run type-check

# Linting passes
npm run lint

# Bundle size acceptable
ls -lh dist/*.js | awk '{if ($5 > threshold) print "WARNING: Bundle too large"}'
```text

**For a CLI Tool:**

```bash
# Script has executable permissions
test -x bin/[tool-name]

# Help text accessible
./bin/[tool-name] --help

# Common commands work
./bin/[tool-name] [common-command-1]
./bin/[tool-name] [common-command-2]

# Error messages clear
./bin/[tool-name] --invalid-flag 2>&1 | grep "Usage:"
```text

**For a Library:**

```bash
# Public API exports correctly
[language-command] -e "import {X} from '[package]'"

# Type definitions present
ls -la dist/*.d.ts

# README example code works
[extract-and-run-readme-examples]

# No breaking changes vs previous version
[api-compatibility-check]
```text

---

## Validation Checklist Template

Use this template to track validation status for a specific implementation milestone:

### Milestone: [Feature/Release Name]

**Date:** [YYYY-MM-DD]
**Validated By:** [Ralph/Manual]

#### Structure

- [ ] [Specific check 1]
- [ ] [Specific check 2]

#### Functionality

- [ ] [Specific check 1]
- [ ] [Specific check 2]

#### Documentation

- [ ] [Specific check 1]
- [ ] [Specific check 2]

#### Results

[REPLACE: Document validation results, failures found, and how they were resolved]
