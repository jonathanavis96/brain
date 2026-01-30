# Project Guidance for AI Agents

## Knowledge Base (MUST USE)

### Progressive Disclosure: Always Read in This Order

**ALWAYS start here:**

1. `./skills/SUMMARY.md` - Knowledge base overview and usage guide
2. `./skills/domains/` - Domain-specific patterns (caching, API design, auth, testing, etc.)

**When working with specific technologies:**
3. `./skills/` - Technology-specific best practices and patterns

**For project-specific patterns:**
4. `./skills/projects/<project-slug>.md` - Project-specific conventions discovered in this codebase

### Why This Order Matters

- **Token efficiency**: Start with summaries, drill down only when needed
- **Faster results**: Targeted knowledge lookup vs scanning everything
- **Avoid overwhelm**: Read specific docs only when task requires them

## Knowledge Growth Rule (Mandatory)

When you discover a new convention, architectural decision, or project-specific pattern:

1. **Create a skill file** in the brain repo:
   - Project-specific: `./skills/projects/<project-slug>.md`
   - Domain/cross-project: `./skills/domains/<domain>.md`

2. **Update the index**: Add a link in `./skills/SUMMARY.md`

3. **Structure new skill files** with:

   ```markdown
   # [Title]
   
   ## Why This Exists
   [Explain the problem this solves or decision rationale]
   
   ## When to Use It
   [Specific scenarios or conditions for applying this knowledge]
   
   ## Details
   [The actual knowledge, patterns, conventions, etc.]
   ```

## Parallelism Rule

**Reading/searching/spec review**: Use up to **100 parallel subagents** for maximum efficiency

- File reading, searching, spec analysis, documentation review
- Gathering context from multiple sources simultaneously

**Build/tests/benchmarks**: Use exactly **1 agent**

- Running build commands, executing tests, benchmarks
- Making file modifications and commits

## Core Principles

### Before Making Changes

1. **Search the codebase** - Don't assume anything is missing; search first
2. **Read targeted knowledge** - Follow the hierarchy: SUMMARY → domain docs → specific files
3. **Check existing patterns** - Look for established conventions in the codebase before inventing new ones

### Code Quality (Python-Specific)

- Follow PEP 8 style guidelines
- Use type hints for function signatures
- Prefer standard library over third-party dependencies when appropriate
- Keep functions small and focused (single responsibility)
- Write clear docstrings for modules, classes, and functions
- Use virtual environments for dependency isolation

### Project Structure (Python Conventions)

- Prefer `src/` or package-named directory for source code
- Keep tests in `tests/` directory
- Use `requirements.txt` or `pyproject.toml` for dependencies
- Document setup and usage in README.md
- Keep project goals and vision in `THOUGHTS.md`
- Maintain `workers/IMPLEMENTATION_PLAN.md` as a prioritized task list

### Python Best Practices

- Use context managers (`with` statements) for resource management
- Prefer list comprehensions over map/filter for readability
- Use `pathlib.Path` over `os.path` for path operations
- Handle exceptions explicitly, avoid bare `except:`
- Use f-strings for string formatting (Python 3.6+)
- Follow "batteries included" philosophy - leverage standard library

## Environment Prerequisites

- **Environment:** WSL (Windows Subsystem for Linux) on Windows 11 with Ubuntu
- **Shell:** bash (comes with WSL Ubuntu)
- **Atlassian CLI:** `acli` - <https://developer.atlassian.com/cloud/cli/>
- **RovoDev:** `acli rovodev auth && acli rovodev usage site`

### WSL/Windows 11 Specifics

- Working directory: `/mnt/c/...` or `/home/...` depending on where repository is cloned
- Git line endings: Use `core.autocrlf=input` to avoid CRLF issues
- File permissions: WSL handles Unix permissions on Windows filesystem
- Path separators: Use Unix-style `/` paths (WSL translates automatically)

## Ralph Integration

This project uses the Ralph Wiggum iterative loop for systematic development:

- **Single unified prompt**: See `workers/ralph/PROMPT.md` (determines mode from iteration number)
- **Progress tracking**: All work logged in `workers/ralph/progress.txt`
- **Completion**: Look for `:::COMPLETE:::` sentinel

## RovoDev + CLI Guardrails

When working with RovoDev and Atlassian CLI:

- **Always run repo scripts with bash** in WSL2/Linux environment
- **If Ralph/RovoDev appears to "hang" or "wait"**, first run:
  - `acli rovodev auth status`
  - `acli rovodev usage site` (select a valid site if prompted)
  - then retry
- **Don't assume the correct site is the one open in the browser** - rely on CLI-selected site
- **If a command needs interactivity**, the agent must clearly tell the user what input/action is required
- **Avoid long-running background watchers/polling** unless the user explicitly wants it - prefer short, bounded runs

### Secrets and Tokens

- **Never paste API tokens, secrets, or credentials** into logs, markdown, or console output
- Use placeholders like `PASTE_TOKEN_HERE` and instruct the user to provide them locally

## Python Testing

### Testing Frameworks

- **pytest**: Preferred for most Python projects (simple, powerful, extensive plugin ecosystem)
- **unittest**: Standard library option for simpler projects
- **doctest**: For documentation examples that double as tests

### Testing Best Practices

- Write tests alongside features (not as an afterthought)
- Use fixtures for test setup/teardown
- Mock external dependencies (APIs, databases, file I/O)
- Aim for >80% code coverage on critical paths
- Run tests before committing: `pytest tests/`

## Python Virtual Environments

Always use virtual environments to isolate dependencies:

```bash
# Create virtual environment
python3 -m venv venv

# Activate (Linux/macOS)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Deactivate when done
deactivate
```text

## Project-Specific Notes

[Add project-specific conventions, architecture decisions, and patterns here]
