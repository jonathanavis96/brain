# Contributing to Brain

Thank you for your interest in contributing to the Brain repository! This guide will help you understand how to contribute effectively.

## Quick Start

1. **Read the documentation first:**
   - [README.md](README.md) - Repository overview and onboarding
   - [NEURONS.md](NEURONS.md) - Repository structure map
   - [THOUGHTS.md](THOUGHTS.md) - Strategic vision and goals
   - [AGENTS.md](AGENTS.md) - Operational guide for agents

2. **Understand the Brain's purpose:**
   - Self-improving skills knowledge base for RovoDev agents
   - Maintained through automated Ralph loop system
   - Templates for bootstrapping new projects

3. **Set up your environment:**
   - WSL (Windows Subsystem for Linux) on Windows 11 with Ubuntu
   - Git with `core.autocrlf=input` for line endings
   - Pre-commit hooks: `bash setup-linters.sh`

## Types of Contributions

### 1. Skills Documentation

**What:** Add or improve skill files in `skills/domains/`

**Process:**

1. Search existing skills: `rg "pattern" skills/`
2. Check `skills/self-improvement/GAP_BACKLOG.md` for planned skills
3. Use `skills/self-improvement/SKILL_TEMPLATE.md` as template
4. Place in appropriate category:
   - Broadly reusable → `skills/domains/<category>/<skill>.md`
   - Project-specific → `skills/projects/<project>/<skill>.md`
5. Update `skills/index.md` and `skills/SUMMARY.md`
6. Run validation: `markdownlint skills/**/*.md`

**Quality criteria:**

- Clear Quick Reference table at top
- Code examples with language tags (e.g., bash, python, etc.)
- Error code tags for lookup (`<!-- covers: SC2034, SC2155 -->`)
- Blank lines around code blocks, lists, headings
- Links to related skills

### 2. Template Improvements

**What:** Enhance project templates in `templates/`

**Process:**

1. Identify template to improve (ralph/, cortex/, backend/, python/, go/, javascript/, website/)
2. Make changes to template file
3. Consider if change should propagate to `workers/ralph/` (Brain-specific infrastructure)
4. Test template with new project bootstrap: `bash new-project.sh test-idea.md`
5. Document change in commit message

**Important:**

- Templates should **reference** skills, not duplicate them
- Keep templates lean - point to `skills/` for detailed guidance
- Ensure compatibility with `new-project.sh` bootstrap script

### 3. Bug Fixes

**What:** Fix issues in scripts, documentation, or templates

**Process:**

1. Search for similar issues: `rg "error_pattern" .`
2. Check if issue is already tracked in `workers/IMPLEMENTATION_PLAN.md`
3. Fix the issue following quality gates below
4. Run validation commands (see Validation section)
5. Commit with descriptive message: `fix(scope): description`

### 4. Gap Identification

**What:** Report missing knowledge or undocumented procedures

**Process:**

1. Search `skills/` for existing documentation
2. Check `skills/self-improvement/GAP_BACKLOG.md` for existing entries
3. If not found, append entry to `GAP_BACKLOG.md`:

```markdown
### Gap: [Short Title]

**Context:** [When/where this gap was encountered]

**Missing Knowledge:** [What's missing]

**Workaround Used:** [What you did instead]

**Proposed Solution:** [How to fill this gap]

**Priority:** [High/Medium/Low]
```

4. Commit: `docs(gaps): add gap for [topic]`

## Quality Gates

All contributions must pass these checks:

### Shellcheck (Shell Scripts)

```bash
shellcheck -e SC1091 **/*.sh
```

Common issues:

- SC2034: Unused variable
- SC2155: Declare and assign separately
- SC2162: Add `-r` flag to `read` commands

See `skills/domains/languages/shell/` for patterns.

### Markdownlint (Markdown Files)

```bash
markdownlint **/*.md
```

Common issues:

- MD040: Add language after ` ``` ` (e.g., ` ```bash `)
- MD032: Blank lines around lists required
- MD024: Duplicate headings must be unique

See `skills/domains/code-quality/markdown-patterns.md` for patterns.

### Pre-commit Hooks

```bash
pre-commit run --all-files
```

Runs shellcheck, markdownlint, trailing whitespace, YAML syntax, and more.

## Commit Message Format

Use conventional commits:

```text
<type>(<scope>): <summary>

<optional body with details>

Co-authored-by: <name> <email>
```

**Types:**

- `feat`: New feature or skill
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code restructuring
- `chore`: Maintenance tasks
- `test`: Test additions or fixes

**Scopes:**

- `ralph`: Ralph loop infrastructure
- `skills`: Skills knowledge base
- `templates`: Project templates
- `plan`: Implementation plan updates
- `cortex`: Cortex manager layer

**Examples:**

```bash
git commit -m "feat(skills): add React hooks patterns"
git commit -m "fix(ralph): correct monitor ETA calculation"
git commit -m "docs(plan): update Phase 7 tasks"
```

## Working with Ralph Loop

The Brain repository uses an automated Ralph loop for self-improvement. If you're working on Ralph-specific infrastructure:

1. **Read Ralph documentation:**
   - [workers/ralph/README.md](workers/ralph/README.md) - Design philosophy
   - [workers/ralph/AGENTS.md](workers/ralph/AGENTS.md) - Operational guide
   - [workers/ralph/VALIDATION_CRITERIA.md](workers/ralph/VALIDATION_CRITERIA.md) - Quality gates

2. **Protected files (read-only):**
   - `workers/ralph/rules/AC.rules` (+ `.verify/ac.sha256`)
   - `workers/ralph/verifier.sh` (+ `.verify/verifier.sha256`)
   - `workers/ralph/loop.sh` (+ `.verify/loop.sha256`)
   - `workers/ralph/PROMPT.md` (+ `.verify/prompt.sha256`)

   If these need changes, create `SPEC_CHANGE_REQUEST.md` for human review.

3. **Running Ralph:**

```bash
cd workers/ralph/
bash loop.sh                    # Single iteration
bash loop.sh --iterations 5     # Multiple iterations
bash loop.sh --dry-run          # Preview changes
```

4. **Task monitors:**

```bash
bash workers/ralph/current_ralph_tasks.sh  # Pending tasks
bash workers/ralph/thunk_ralph_tasks.sh    # Completed tasks
```

## Validation Commands

Before submitting contributions:

```bash
# Run all pre-commit checks
pre-commit run --all-files

# Check shellcheck (if you modified shell scripts)
shellcheck -e SC1091 **/*.sh

# Check markdown lint (if you modified markdown files)
markdownlint **/*.md

# Run Ralph verifier (if working on Ralph infrastructure)
cd workers/ralph/
bash verifier.sh
```

## Pull Request Guidelines

1. **Keep changes focused:**
   - One logical change per PR
   - Don't mix unrelated fixes

2. **Write clear descriptions:**
   - What problem does this solve?
   - What changes were made?
   - How was it tested?

3. **Link related issues:**
   - Reference Gap Backlog entries if applicable
   - Link to IMPLEMENTATION_PLAN.md tasks if relevant

4. **Ensure CI passes:**
   - All quality gates must pass
   - No new shellcheck or markdownlint errors

## Getting Help

1. **Check documentation:**
   - `skills/SUMMARY.md` - Skills overview
   - `skills/index.md` - Complete skills catalog
   - Error Quick Reference in `skills/SUMMARY.md`

2. **Search existing solutions:**
   - `rg "error_code" skills/` - Find patterns for specific errors
   - `rg "pattern" .` - Search entire repository

3. **Ask for guidance:**
   - Open an issue with `[Question]` tag
   - Check `workers/ralph/AGENTS.md` for Ralph-specific guidance

## Code of Conduct

- Be respectful and constructive
- Focus on improving the knowledge base
- Document your reasoning in commit messages
- Test your changes before submitting
- Follow existing patterns and conventions

## License

By contributing to Brain, you agree that your contributions will be licensed under the same license as the repository.

## Additional Resources

- **[docs/BOOTSTRAPPING.md](docs/BOOTSTRAPPING.md)** - New project bootstrapping
- **[skills/playbooks/](skills/playbooks/)** - Step-by-step guides
- **[skills/domains/ralph/ralph-patterns.md](skills/domains/ralph/ralph-patterns.md)** - Ralph loop architecture

Thank you for helping improve the Brain knowledge base! 🧠
