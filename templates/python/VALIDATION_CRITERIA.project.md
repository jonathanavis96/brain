# VALIDATION_CRITERIA.md - [PROJECT_NAME] Quality Gates

Last updated: [TIMESTAMP]

## Purpose

This document defines the acceptance criteria and quality standards for the [PROJECT_NAME] project. Use these gates to validate that work is complete and production-ready before marking tasks done.

## Code Quality Standards

### Python Style & Standards

- [ ] **PEP 8 Compliance**: Code follows PEP 8 style guide
- [ ] **Linter Passes**: `flake8` or `pylint` runs without errors
- [ ] **Type Hints**: Public functions have type hints
- [ ] **Docstrings**: Modules, classes, and public functions have docstrings
- [ ] **Import Order**: Imports organized (standard lib → third-party → local)
- [ ] **Line Length**: ≤88 characters (Black) or ≤79 (PEP 8)
- [ ] **No Warnings**: Python interpreter runs without warnings

### Code Formatting

- [ ] **Black Formatted**: Code formatted with Black (or equivalent)
- [ ] **Consistent Style**: Naming conventions consistent across codebase
- [ ] **No Dead Code**: Unused imports, variables, and functions removed
- [ ] **Clear Names**: Variables and functions have descriptive names

## Testing Standards

### Test Coverage

- [ ] **Unit Tests**: Critical functions have unit tests
- [ ] **Coverage Target**: >80% code coverage on core logic
- [ ] **Test Passing**: All tests pass (`pytest` exits with 0)
- [ ] **No Skipped Tests**: Skipped tests documented with reason
- [ ] **Test Isolation**: Tests don't depend on execution order

### Test Quality

- [ ] **Fixtures Used**: Test setup/teardown uses fixtures
- [ ] **Mocks Proper**: External dependencies mocked appropriately
- [ ] **Edge Cases**: Edge cases and error conditions tested
- [ ] **Fast Tests**: Unit tests complete in <5 seconds total
- [ ] **Clear Assertions**: Test failures provide clear error messages

## Functional Requirements

### Core Functionality

- [ ] **Requirements Met**: Feature implements specified requirements
- [ ] **Edge Cases**: Handles edge cases gracefully
- [ ] **Error Handling**: Errors caught and logged appropriately
- [ ] **Input Validation**: User inputs validated before processing
- [ ] **Output Correctness**: Outputs match expected results

### Python-Specific

- [ ] **Virtual Environment**: Dependencies installable in clean venv
- [ ] **Dependencies Updated**: requirements.txt reflects actual dependencies
- [ ] **Entry Points Work**: CLI/API entry points function correctly
- [ ] **No Global State**: Minimal use of global variables/state

## Documentation Standards

### Code Documentation

- [ ] **Module Docstrings**: Each module has purpose docstring
- [ ] **Function Docstrings**: Public functions documented with args/returns
- [ ] **Complex Logic**: Non-obvious code has explanatory comments
- [ ] **Type Hints**: Function signatures include type hints

### Project Documentation

- [ ] **README Updated**: Setup instructions current and accurate
- [ ] **NEURONS.md Updated**: Structure changes reflected in map
- [ ] **Examples Work**: Code examples in docs execute successfully
- [ ] **Dependencies Listed**: All dependencies documented

## Performance Standards

### Efficiency

- [ ] **Response Time**: [Define acceptable response times, e.g., "<200ms for API calls"]
- [ ] **Resource Usage**: [Define memory/CPU constraints, e.g., "<500MB memory"]
- [ ] **Scalability**: [Define load requirements, e.g., "Handles 1000 req/sec"]

### Python-Specific Performance

- [ ] **No Memory Leaks**: Long-running processes don't accumulate memory
- [ ] **Efficient Iteration**: Uses generators/iterators for large datasets
- [ ] **Database Queries**: No N+1 query problems (if applicable)
- [ ] **Caching Used**: Appropriate use of caching for expensive operations

## Security Standards

### General Security

- [ ] **Input Sanitized**: User inputs sanitized to prevent injection
- [ ] **Secrets Secure**: No hardcoded secrets in code
- [ ] **Dependencies Safe**: No known vulnerabilities in dependencies
- [ ] **Error Messages**: Error messages don't leak sensitive info

### Python-Specific Security

- [ ] **No eval/exec**: Avoids dangerous functions like `eval()`, `exec()`
- [ ] **Pickle Careful**: Uses pickle only with trusted data
- [ ] **Path Traversal**: File paths validated to prevent traversal attacks
- [ ] **SQL Injection**: Uses parameterized queries (if applicable)

## Dependency Management

### Dependency Standards

- [ ] **requirements.txt Current**: All dependencies listed
- [ ] **Version Pinning**: Critical dependencies version-pinned
- [ ] **No Unused Deps**: Unused dependencies removed
- [ ] **Virtual Env Clean**: Fresh venv install works
- [ ] **Dependency Conflicts**: No conflicting dependency versions

## Git & Version Control

### Commit Standards

- [ ] **Clear Messages**: Commit messages describe what and why
- [ ] **Atomic Commits**: Each commit is a logical unit
- [ ] **No Secrets**: No secrets or credentials in git history
- [ ] **Clean History**: No debug commits or TODO commits

### Branch Standards

- [ ] **Branch Named**: Branch name describes purpose
- [ ] **Up to Date**: Branch synced with main/master
- [ ] **Conflicts Resolved**: No merge conflicts

## Integration Standards

### External Systems

- [ ] **API Calls Work**: External API integrations tested
- [ ] **Database Migrations**: Database schema changes have migrations
- [ ] **Backward Compatible**: Changes don't break existing integrations
- [ ] **Error Recovery**: Graceful degradation if external service fails

## Ralph Loop Integration

### Ralph Compliance

- [ ] **IMPLEMENTATION_PLAN Updated**: Task marked complete, discoveries noted
- [ ] **NEURONS.md Accurate**: Structure changes reflected
- [ ] **VALIDATION_CRITERIA Met**: All quality gates passed
- [ ] **Commit Message Clear**: Describes what was implemented

## Framework-Specific Standards

### [Django Projects]

- [ ] **Migrations Generated**: Database changes have migration files
- [ ] **Admin Registered**: Models registered in admin (if applicable)
- [ ] **Tests Use TestCase**: Tests inherit from appropriate base
- [ ] **Settings Secure**: Debug=False, SECRET_KEY not hardcoded

### [FastAPI Projects]

- [ ] **Schemas Defined**: Pydantic models for request/response
- [ ] **OpenAPI Docs**: Auto-generated docs accurate
- [ ] **Async Used**: Async/await used for I/O operations
- [ ] **Dependencies Work**: FastAPI dependency injection used properly

### [Flask Projects]

- [ ] **Blueprints Used**: Routes organized in blueprints
- [ ] **Config Object**: Configuration uses app.config
- [ ] **Context Managed**: App context handled correctly
- [ ] **Templates Escaped**: Jinja2 auto-escaping enabled

### [CLI Projects]

- [ ] **Help Text**: `--help` provides clear usage instructions
- [ ] **Exit Codes**: Proper exit codes (0=success, non-zero=error)
- [ ] **Arguments Parsed**: Input parsing handles invalid arguments
- [ ] **User Feedback**: Clear output messages for user actions

## Definition of Done

A task is complete when:

1. ✅ **All functional requirements met** (see Functional Requirements)
2. ✅ **Code quality standards met** (see Code Quality Standards)
3. ✅ **Tests written and passing** (see Testing Standards)
4. ✅ **Documentation updated** (see Documentation Standards)
5. ✅ **Performance acceptable** (see Performance Standards)
6. ✅ **Security validated** (see Security Standards)
7. ✅ **Dependencies managed** (see Dependency Management)
8. ✅ **Changes committed** (see Git & Version Control)
9. ✅ **Integration verified** (see Integration Standards)
10. ✅ **Ralph artifacts updated** (see Ralph Loop Integration)

## Notes

- These criteria adapt to project size (strict for production, relaxed for prototypes)
- Add project-specific gates as patterns emerge
- Review and update criteria quarterly or after major milestones
- Use this as a checklist before marking IMPLEMENTATION_PLAN tasks complete
