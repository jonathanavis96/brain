# NEURONS.md - [PROJECT_NAME] Repository Map

Last updated: [TIMESTAMP]

## Quick Reference

| Task | Check Here |
|------|------------|
| Find main application logic | `[src/ or package-name/]` |
| Understand project setup | `README.md`, `setup.py`, or `pyproject.toml` |
| Add/check dependencies | `requirements.txt`, `Pipfile`, or `pyproject.toml` |
| Run tests | `tests/` directory, run `pytest` or `python -m unittest` |
| Configuration files | `config/`, `.env`, or root directory |
| Documentation | `docs/` directory or docstrings in source files |
| Scripts/utilities | `scripts/` or `bin/` directory |
| Entry points | `__main__.py`, `cli.py`, or `app.py` |

## Directory Structure

```text
[PROJECT_LOCATION]/
├── README.md                    # Project overview and setup
├── requirements.txt             # Python dependencies (pip)
├── setup.py                     # Package installation script (optional)
├── pyproject.toml              # Modern Python project config (optional)
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore patterns
│
├── [src/ or package-name/]     # Main source code
│   ├── __init__.py             # Package initialization
│   ├── __main__.py             # Entry point for `python -m package`
│   ├── [core modules]          # Core business logic
│   ├── [utils/]                # Utility functions
│   └── [config/]               # Configuration handling
│
├── tests/                      # Test suite
│   ├── __init__.py             # Test package initialization
│   ├── conftest.py             # pytest fixtures and configuration
│   ├── test_[module].py        # Unit tests
│   └── integration/            # Integration tests (optional)
│
├── docs/                       # Documentation (optional)
│   ├── index.md                # Documentation home
│   └── [topic].md              # Topic-specific docs
│
├── scripts/                    # Utility scripts (optional)
│   └── [helper_scripts].py     # Development/deployment helpers
│
├── ralph/                      # Ralph loop infrastructure
│   ├── loop.sh                 # Loop runner
│   ├── PROMPT.md               # Ralph instructions
│   ├── workers/IMPLEMENTATION_PLAN.md  # Task list
│   └── VALIDATION_CRITERIA.md  # Quality gates
│
└── skills/                     # Project-specific knowledge base
    └── [domain].md             # Domain patterns/conventions
```text

## [Main Package/Module] Structure

**Location**: `[src/ or package-name/]`

### Key Files

- **`__init__.py`** - Package initialization, version, public API exports
- **`__main__.py`** - Entry point for `python -m [package]` execution
- **`[core_module].py`** - [Description of main business logic]
- **`[utility_module].py`** - [Description of utilities/helpers]

### Module Organization

```text
[package-name]/
├── __init__.py              # Public API: imports, version
├── __main__.py              # CLI entry point
├── core/                    # Core business logic
│   ├── __init__.py
│   ├── [domain_model].py    # Domain models/entities
│   └── [business_logic].py  # Business logic implementation
├── api/                     # API layer (if applicable)
│   ├── __init__.py
│   ├── routes.py            # API routes/endpoints
│   └── schemas.py           # Request/response schemas
├── db/                      # Database layer (if applicable)
│   ├── __init__.py
│   ├── models.py            # ORM models
│   └── migrations/          # Database migrations
├── utils/                   # Utilities
│   ├── __init__.py
│   ├── helpers.py           # Helper functions
│   └── validators.py        # Input validation
└── config/                  # Configuration
    ├── __init__.py
    └── settings.py          # Configuration management
```text

## [Tests] Structure

**Location**: `tests/`

### Test Organization

- **`conftest.py`** - pytest fixtures, test configuration
- **`test_*.py`** - Test modules (mirror source structure)
- **Unit tests**: Test individual functions/classes in isolation
- **Integration tests**: Test component interactions (optional subdirectory)
- **Fixtures**: Reusable test data and setup

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_[module].py

# Run with coverage
pytest --cov=[package-name] --cov-report=html

# Run specific test
pytest tests/test_[module].py::test_function_name
```text

## Configuration Management

### Environment Variables

**File**: `.env` (git-ignored, copy from `.env.example`)

```text
# Example variables
DATABASE_URL=postgresql://localhost/dbname
API_KEY=your_api_key_here
DEBUG=True
```text

### Configuration Files

- **`config/settings.py`** - Application configuration
- **`.env`** - Environment-specific variables (not in git)
- **`.env.example`** - Template for environment variables (in git)

## Dependencies

### Installation

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Install in development mode (editable)
pip install -e .
```text

### Dependency Files

- **`requirements.txt`** - Production dependencies
- **`requirements-dev.txt`** - Development dependencies (testing, linting, etc.)
- **`setup.py`** - Package metadata and dependencies (if distributing)
- **`pyproject.toml`** - Modern Python project configuration (PEP 518)

## Development Commands

```bash
# Run application
python -m [package-name]
# or
python [src/main.py]

# Run tests
pytest

# Run linter
flake8 [src/]
# or
pylint [src/]

# Format code
black [src/]

# Type checking
mypy [src/]

# Generate documentation
sphinx-build -b html docs/ docs/_build/
```text

## Entry Points

### CLI Entry Point

- **File**: `[package-name]/__main__.py` or `[package-name]/cli.py`
- **Run**: `python -m [package-name]` or `python cli.py`

### API Entry Point (if applicable)

- **File**: `[package-name]/app.py` or `[package-name]/api/app.py`
- **Run**: `uvicorn [package-name].app:app` (FastAPI) or `flask run` (Flask)

### Script Entry Points (if applicable)

- **Location**: `scripts/` directory
- **Purpose**: One-off utilities, data migration, deployment helpers

## Python Version & Virtual Environment

- **Python Version**: [e.g., Python 3.9+]
- **Virtual Environment**: Required (see Dependencies section)
- **Package Manager**: pip (or Poetry, pipenv if specified)

## Code Style & Standards

- **Style Guide**: PEP 8
- **Type Hints**: Required for public functions
- **Docstrings**: Google or NumPy style
- **Line Length**: 88 characters (Black default) or 79 (PEP 8)
- **Import Order**: Standard library → Third-party → Local (enforced by isort)

## Knowledge Base References

This project leverages brain repository knowledge:

- **Domain Patterns**: `./brain/skills/domains/` - Caching, API design, testing patterns
- **Project Learnings**: `./brain/skills/projects/[project-slug].md` - Project-specific discoveries

## Framework-Specific Notes

### [Django Projects]

- **Settings**: `[project]/settings.py`
- **URLs**: `[project]/urls.py`
- **Apps**: `[app_name]/` directories
- **Migrations**: `python manage.py makemigrations && python manage.py migrate`
- **Admin**: Registered models in `[app]/admin.py`

### [FastAPI Projects]

- **Main App**: `app.py` or `main.py`
- **Routers**: `routers/` or `api/routes/`
- **Dependencies**: Dependency injection via `Depends()`
- **Schemas**: Pydantic models in `schemas.py`
- **Run**: `uvicorn [module]:app --reload`

### [Flask Projects]

- **Main App**: `app.py` or `__init__.py`
- **Blueprints**: `blueprints/` or organized by feature
- **Templates**: `templates/` directory
- **Static Files**: `static/` directory
- **Run**: `flask run` or `python app.py`

### [CLI Projects]

- **Parser**: `argparse`, `click`, or `typer`
- **Entry Point**: `cli.py` or `__main__.py`
- **Subcommands**: Organized by feature/domain
- **Help**: Auto-generated from docstrings/decorators

## Common Tasks

### Add a New Feature

1. Create module in `[src/]/[feature_name].py`
2. Add tests in `tests/test_[feature_name].py`
3. Update `__init__.py` if exposing public API
4. Update documentation if needed

### Add a New Dependency

1. Add to `requirements.txt` (or `pyproject.toml`)
2. Run `pip install -r requirements.txt`
3. Update README.md with any setup changes

### Debug Issues

1. Enable debug logging in configuration
2. Use Python debugger: `import pdb; pdb.set_trace()`
3. Check logs/output
4. Run specific test: `pytest tests/test_module.py::test_function -v`

### Performance Profiling

```bash
# Profile script execution
python -m cProfile -o output.prof script.py

# Visualize profile
snakeviz output.prof
```text

## Notes

- This map is a living document - update as structure evolves
- Keep entry points clear and documented
- Maintain test coverage >80% on critical paths
- Use virtual environments consistently
- Document setup steps in README.md
