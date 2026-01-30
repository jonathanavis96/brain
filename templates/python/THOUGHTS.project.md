# THOUGHTS.md - [PROJECT_NAME] Vision

[REPLACE: Brief tagline describing your project in one sentence]

## What This Project Does

[REPLACE: Describe your project's purpose. What problem does it solve? Who uses it? What value does it provide?]

Example structure:

- **Primary Goal:** [Main objective of the project]
- **Key Features:** [List 3-5 main features or capabilities]
- **Target Users:** [Who benefits from this project]
- **Integration Points:** [How it connects to other systems/tools]

## Current Goals

### Active Focus

[REPLACE: What is the project currently working on? What's the immediate priority?]

Example:

- Feature X implementation
- Performance optimization in area Y
- Refactoring module Z
- Bug fixes in component W

### Definition of Done

[REPLACE: Define what "complete" means for key deliverables. Be specific and measurable.]

A task/feature in this project is complete when:

#### ✅ Functionality

- Feature works as specified in requirements
- Edge cases handled appropriately
- Error handling implemented
- Input validation in place

#### ✅ Testing

- Unit tests written and passing (>80% coverage on critical paths)
- Integration tests cover key workflows
- Manual testing completed for user-facing features
- Test fixtures/mocks properly configured

#### ✅ Code Quality

- Follows PEP 8 style guidelines
- Type hints added to function signatures
- Docstrings present for modules, classes, and public functions
- Code reviewed (if team project)
- Linter passes (flake8/pylint)

#### ✅ Documentation

- README.md updated if setup changes
- Docstrings explain complex logic
- API documentation generated (if applicable)
- NEURONS.md updated if structure changes

#### ✅ Dependencies

- requirements.txt updated
- Virtual environment requirements documented
- No unnecessary dependencies added

## Success Metrics

[REPLACE: How do you measure if this project is successful? Define quantifiable metrics.]

This project is successful when:

1. **Functionality** - [Specific measurable outcome, e.g., "Processes 1000 records/second"]
2. **Reliability** - [Specific measurable outcome, e.g., "99.9% uptime in production"]
3. **Code Quality** - [Specific measurable outcome, e.g., ">80% test coverage"]
4. **User Satisfaction** - [Specific measurable outcome, e.g., "Users report <2min average task time"]
5. **Maintainability** - [Specific measurable outcome, e.g., "New features added in <1 day"]

## Source Code Definition

[REPLACE: Define what counts as "source code" vs reference materials in your project]

For this project, "source code" means:

- **`[src/ or package-name/]`** - Main Python package with application logic
- **`tests/`** - Test suite (unit, integration, e2e)
- **`scripts/`** - Development and deployment utilities
- **`config/`** - Configuration management code

**NOT source code:**

- `venv/` or `.venv/` - Virtual environment (generated)
- `__pycache__/` - Python bytecode cache (generated)
- `*.egg-info/` - Package metadata (generated)
- `dist/`, `build/` - Build artifacts (generated)
- `.pytest_cache/` - Test cache (generated)
- `docs/_build/` - Generated documentation

## Knowledge Base Integration

[REPLACE: How does this project use the brain repository's knowledge base?]

This project references brain repository knowledge:

- **Domain Conventions:** `./skills/domains/` - Caching, API design, auth, testing patterns
- **Project Learnings:** `./skills/projects/[this-project-slug].md` - Project-specific patterns that might benefit other projects

## Technical Context

[REPLACE: Key technical decisions, architecture choices, or constraints]

### Technology Stack

- **Language:** Python [version, e.g., 3.9+]
- **Framework:** [e.g., Django, FastAPI, Flask, CLI with Click/Typer]
- **Key Libraries:** [List major dependencies, e.g., SQLAlchemy, Pydantic, requests]
- **Database:** [e.g., PostgreSQL, SQLite, MongoDB] (if applicable)
- **Infrastructure:** [e.g., Docker, AWS Lambda, Kubernetes] (if applicable)

### Architecture Decisions

- [Key decision 1 and rationale, e.g., "FastAPI for async support and auto-generated docs"]
- [Key decision 2 and rationale, e.g., "Pydantic for data validation to ensure type safety"]
- [Key decision 3 and rationale, e.g., "Repository pattern for database abstraction"]

### Constraints

- [Technical constraint 1, e.g., "Must support Python 3.9+ for compatibility"]
- [Technical constraint 2, e.g., "Response time <200ms for API endpoints"]
- [Business constraint 1, e.g., "Must integrate with legacy system via REST API"]

### Python-Specific Considerations

- **Virtual Environment**: Required for dependency isolation
- **Package Distribution**: [e.g., "Internal use only" or "PyPI package"]
- **Type Checking**: [e.g., "mypy enforced in CI" or "Optional for now"]
- **Code Formatting**: [e.g., "Black with 88-char line length"]
- **Testing Framework**: [e.g., "pytest with coverage reporting"]
