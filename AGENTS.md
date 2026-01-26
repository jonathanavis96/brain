# AGENTS.md - Operational Guide

## Purpose

This guide provides operational instructions for agents working on the brain repository. The brain repository serves as a self-improving skills knowledge base for RovoDev agents, maintained through the Ralph loop system.

## Repository Structure

See [NEURONS.md](NEURONS.md) for a complete map of the brain repository structure.

**Key directories:**

- `skills/` - Skills knowledge base (domains, projects, self-improvement)
- `templates/` - Project scaffolding templates
- `workers/ralph/` - Ralph loop infrastructure
- `cortex/` - Manager layer (Cortex)
- `rules/` - Acceptance criteria
- `docs/` - Project documentation
- `.verify/` - Validation infrastructure

## How Ralph Works on Brain

The Ralph loop runs from `workers/ralph/` and has **full access to the entire brain repository** (not just `workers/ralph/`).

### Running Ralph

```bash
cd /path/to/brain/workers/ralph/ || exit 1
bash loop.sh                    # Single iteration
bash loop.sh --iterations 10    # Multiple iterations
bash loop.sh --dry-run          # Preview changes
bash loop.sh --rollback 2       # Undo last 2 commits
bash loop.sh --resume           # Resume from interruption
```text

**Mode:** Iteration 1 or every 3rd = PLAN, others = BUILD.

### Task Monitors

Ralph uses two complementary monitors for real-time task tracking:

**Current Ralph Tasks:** `bash workers/ralph/current_ralph_tasks.sh` - Shows pending tasks from IMPLEMENTATION_PLAN.md  
**THUNK Monitor:** `bash workers/ralph/thunk_ralph_tasks.sh` - Shows completed task log from THUNK.md

See `workers/ralph/README.md` for detailed monitor features and hotkeys.

## Working on the Brain Repository

### Before Starting Any Task

1. **Read NEURONS.md** - Understand the repository structure
2. **Read THOUGHTS.md** - Understand project goals and success criteria
3. **Check skills/SUMMARY.md** - Know what skills are available
4. **Check IMPLEMENTATION_PLAN.md** - See current work plan

### Context Sources

| File | Purpose |
| ---- | ------- |
| `NEURONS.md` | Repository structure map |
| `THOUGHTS.md` | Strategic vision, goals, success criteria |
| `IMPLEMENTATION_PLAN.md` | Current task backlog (root level) |
| `workers/IMPLEMENTATION_PLAN.md` | Shared worker tasks (Ralph, Cerebras, etc.) |
| `workers/ralph/THUNK.md` | Completed task log |
| `skills/SUMMARY.md` | Skills overview and error reference |
| `skills/index.md` | Complete skills catalog |

### Making Changes

**Search before creating:**

```bash
# Search entire repository
rg "pattern" /path/to/brain

# Find files by name
find /path/to/brain -name "filename"

# Check if something already exists
ls -la /path/to/brain/path/to/file
```

**Validate changes:**

```bash
# Run pre-commit checks (from brain root)
pre-commit run --all-files

# Check shellcheck
shellcheck -e SC1091 workers/ralph/*.sh

# Check markdown
markdownlint **/*.md
```

### Pre-PR Checklist

Before committing changes, manually verify these items that automated tools may miss:

**Regex and String Patterns:**

- [ ] **Capture delimiters:** Regex patterns that capture delimiters (e.g., `"([^"]+)"`) actually include the delimiters in the captured group
- [ ] **Escape sequences:** Special characters in strings are properly escaped (e.g., `\n`, `\t`, `\"`)

**Variable Scope:**

- [ ] **All variables defined:** Every variable used in a function is either a parameter, a local variable, or a documented global
- [ ] **No undefined references:** Variables are defined before use (especially in error/cleanup blocks)

**Code Examples in Documentation:**

- [ ] **Complete imports:** All necessary imports are shown (e.g., `import time`, `import os`)
- [ ] **Variables defined:** All variables used in examples are defined or clearly marked as "user-provided"
- [ ] **Runnable:** Code examples can be copied and run without modification (or missing parts are explicitly noted)

**Documentation Quality:**

- [ ] **No broken links:** Internal links point to existing files/sections
- [ ] **Consistent terminology:** Same concepts use the same terms throughout
- [ ] **Examples match text:** Code examples accurately demonstrate the described pattern

**See Also:** [skills/domains/code-quality/code-review-patterns.md](skills/domains/code-quality/code-review-patterns.md) for detailed guidance on each pattern.

### Protected Files

**Read-only (hash-guarded):**

- `workers/ralph/rules/AC.rules` + `.verify/ac.sha256`
- `workers/ralph/verifier.sh` + `.verify/verifier.sha256`
- `workers/ralph/loop.sh` + `.verify/loop.sha256`
- `workers/ralph/PROMPT.md` + `.verify/prompt.sha256`

If you need to change these files, create a `SPEC_CHANGE_REQUEST.md` and stop.

### Workspace Boundaries

| Access Level | Paths | Notes |
| ------------ | ----- | ----- |
| **Full access** | `skills/`, `templates/`, `cortex/`, `docs/`, `workers/` | Read, write, create, delete |
| **Protected** | `workers/ralph/rules/AC.rules`, `workers/ralph/verifier.sh`, etc. | Read only - hash-guarded |
| **Protected** | `.verify/*.sha256` | Baseline hashes - human updates only |
| **Forbidden** | `.verify/waivers/*.approved` | OTP-protected - cannot read/write |

## Self-Improvement System

When you discover missing knowledge or undocumented procedures:

1. **Search skills/** for existing documentation
2. **Check skills/self-improvement/GAP_BACKLOG.md** for existing gap entries
3. **If not found:** Append new entry to `GAP_BACKLOG.md`
4. **If gap is clear and recurring:** Promote to `SKILL_BACKLOG.md`

See `skills/self-improvement/README.md` for full protocol.

## Common Tasks

### Adding a New Skill

1. Use `skills/self-improvement/SKILL_TEMPLATE.md` as template
2. Place in appropriate folder:
   - Broadly reusable → `skills/domains/<category>/<skill>.md`
   - Project-specific → `skills/projects/<project>/<skill>.md`
3. Update `skills/index.md` and `skills/SUMMARY.md`

### Updating Templates

When modifying template files in `templates/`:

1. Update the template file
2. Consider if change should propagate to workers/ralph/
3. Document change in commit message
4. Verify template still works for new projects

### Template Sync Rule

**When modifying `workers/ralph/` files, ask:** Is this feature useful ONLY in Brain, or useful in ANY project?

| Answer | Action |
| ------ | ------ |
| **Only Brain** | Keep change in `workers/ralph/` only |
| **Any project** | Add to `templates/ralph/` as well |

**Examples:**

- Brain-specific paths, Brain-specific tasks → workers only
- Lint injection, error handling, general features → both workers AND templates

### Running Verifier

The verifier runs automatically after each BUILD iteration and results are injected into the prompt header.

For manual runs (human debugging):

```bash
cd /path/to/brain/workers/ralph
bash verifier.sh
# Results in ../.verify/latest.txt (agents: use injected header instead)
```

## Troubleshooting

### Ralph Loop Issues

- **Ralph doesn't stop:** Check for `:::COMPLETE:::` output (only loop.sh outputs this)
- **Ralph batches tasks:** Emphasize "EXACTLY ONE task" in guidance
- **Wrong mode:** Check iteration number (1 or 3rd = PLAN, others = BUILD)
- **Verifier fails:** Check injected `# VERIFIER STATUS` in prompt header

### Common Errors

See `skills/SUMMARY.md` → Error Quick Reference for common errors and fixes.

**Quick lookup:**

- **ShellCheck errors (SC2034, SC2155, etc.):** → `skills/domains/languages/shell/variable-patterns.md`
- **Markdown lint (MD040, MD024):** → `skills/domains/code-quality/markdown-patterns.md`
- **Python errors:** → `skills/domains/languages/python/python-patterns.md`
- **Verifier failures:** → Check injected `# VERIFIER STATUS` header, then consult `workers/ralph/PROMPT.md`

### Getting Help

1. Check `skills/SUMMARY.md` for overview
2. Use `skills/index.md` to find specific skills
3. Read relevant skill documentation
4. Check `workers/ralph/AGENTS.md` for Ralph-specific guidance
5. Read `workers/ralph/README.md` for detailed Ralph documentation

## Environment Notes

**WSL/Windows 11 Specifics:**

- Working directory: `/mnt/c/...` or `/home/...` depending on where repository is cloned
- Git line endings: Use `core.autocrlf=input` to avoid CRLF issues
- File permissions: WSL handles Unix permissions on Windows filesystem
- Path separators: Use Unix-style `/` paths (WSL translates automatically)

## See Also

- **[README.md](README.md)** - Human-readable overview and onboarding
- **[NEURONS.md](NEURONS.md)** - Repository structure map
- **[THOUGHTS.md](THOUGHTS.md)** - Strategic vision and goals
- **[workers/ralph/README.md](workers/ralph/README.md)** - Ralph loop design philosophy
- **[workers/ralph/AGENTS.md](workers/ralph/AGENTS.md)** - Ralph-specific operational guide
- **[workers/ralph/VALIDATION_CRITERIA.md](workers/ralph/VALIDATION_CRITERIA.md)** - Quality gates
- **[skills/](skills/)** - Skills knowledge base
- **[docs/BOOTSTRAPPING.md](docs/BOOTSTRAPPING.md)** - New project bootstrapping
