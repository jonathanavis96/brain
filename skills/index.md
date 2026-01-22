# Skills Index

Catalog of all skill files in the brain system.

---

## How to Use This Index

1. Scan categories below to find relevant skills
2. Click through to read full skill file
3. Follow the skill's trigger conditions and procedure

## Adding New Skills

1. Use `self-improvement/SKILL_TEMPLATE.md`
2. Place in correct folder (see placement rules below)
3. Update this index

### Placement Rules

| Scope | Location |
|-------|----------|
| Broadly reusable across repos | `skills/domains/<category>/<skill>.md` |
| Project-specific but reusable | `skills/projects/<project>/<skill>.md` |
| Uncertain | Default to `skills/domains/` with best-guess category |

---

## Domains (Broadly Reusable)

### Backend
- [api-design-patterns.md](domains/backend/api-design-patterns.md) - REST API design patterns and conventions
- [auth-patterns.md](domains/backend/auth-patterns.md) - Authentication and authorization patterns
- [caching-patterns.md](domains/backend/caching-patterns.md) - Caching strategies and patterns
- [config-patterns.md](domains/backend/config-patterns.md) - Portable configs, templates, environment variables
- [database-patterns.md](domains/backend/database-patterns.md) - Database design and query patterns
- [error-handling-patterns.md](domains/backend/error-handling-patterns.md) - Error handling strategies

### Code Quality
- [code-consistency.md](domains/code-quality/code-consistency.md) - Documentation accuracy, terminology, parsing consistency
- [code-hygiene.md](domains/code-quality/code-hygiene.md) - Definition of Done checklists
- [markdown-patterns.md](domains/code-quality/markdown-patterns.md) - Lint rules (MD040, MD024, MD050), documentation accuracy
- [testing-patterns.md](domains/code-quality/testing-patterns.md) - Testing strategies and patterns

### Infrastructure
- [deployment-patterns.md](domains/infrastructure/deployment-patterns.md) - Deployment and CI/CD patterns
- [security-patterns.md](domains/infrastructure/security-patterns.md) - Security best practices
- [state-management-patterns.md](domains/infrastructure/state-management-patterns.md) - State management patterns

### Languages

#### Python
- [python-patterns.md](domains/languages/python/python-patterns.md) - datetime, f-strings, JSON handling, type hints

#### Shell
- [README.md](domains/languages/shell/README.md) - Shell scripting overview and quick reference
- [strict-mode.md](domains/languages/shell/strict-mode.md) - Strict mode (`set -euo pipefail`) patterns
- [variable-patterns.md](domains/languages/shell/variable-patterns.md) - SC2155, SC2034, scoping
- [cleanup-patterns.md](domains/languages/shell/cleanup-patterns.md) - Traps, temp files, state restoration
- [common-pitfalls.md](domains/languages/shell/common-pitfalls.md) - ShellCheck errors and gotchas

### Ralph
- [ralph-patterns.md](domains/ralph/ralph-patterns.md) - Ralph loop operational patterns
- [bootstrap-patterns.md](domains/ralph/bootstrap-patterns.md) - Project bootstrapping patterns
- [change-propagation.md](domains/ralph/change-propagation.md) - Change propagation and template sync

### Websites
- [README.md](domains/websites/README.md) - Website development overview
- See `domains/websites/` for full structure (architecture, build, copywriting, design, discovery, launch, qa)

---

## Projects (Project-Specific)

### Brain
- [brain-example.md](projects/brain-example.md) - Brain repository patterns and conventions

---

## Self-Improvement (Meta)

- [README.md](self-improvement/README.md) - Self-improvement system overview
- [GAP_CAPTURE_RULES.md](self-improvement/GAP_CAPTURE_RULES.md) - Gap capture protocol
- [GAP_BACKLOG.md](self-improvement/GAP_BACKLOG.md) - Raw gap capture log
- [SKILL_BACKLOG.md](self-improvement/SKILL_BACKLOG.md) - Promotion queue
- [SKILL_TEMPLATE.md](self-improvement/SKILL_TEMPLATE.md) - Template for new skills
