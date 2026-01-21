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
| Broadly reusable across repos | `skills/domains/<topic>/<skill>.md` |
| Project-specific but reusable | `skills/projects/<project>/<skill>.md` |
| Uncertain | Default to `skills/domains/` with best-guess topic |

---

## Domains (Broadly Reusable)

### API Design
- [api-design-patterns.md](domains/api-design-patterns.md) - REST API design patterns and conventions

### Authentication
- [auth-patterns.md](domains/auth-patterns.md) - Authentication and authorization patterns

### Bootstrap
- [bootstrap-patterns.md](domains/bootstrap-patterns.md) - Project bootstrapping patterns

### Caching
- [caching-patterns.md](domains/caching-patterns.md) - Caching strategies and patterns

### Code Consistency
- [code-consistency.md](domains/code-consistency.md) - Documentation accuracy, terminology, parsing consistency

### Configuration
- [config-patterns.md](domains/config-patterns.md) - Portable configs, templates, environment variables

### Database
- [database-patterns.md](domains/database-patterns.md) - Database design and query patterns

### Deployment
- [deployment-patterns.md](domains/deployment-patterns.md) - Deployment and CI/CD patterns

### Error Handling
- [error-handling-patterns.md](domains/error-handling-patterns.md) - Error handling strategies

### Markdown
- [markdown-patterns.md](domains/markdown-patterns.md) - Lint rules (MD040, MD024, MD050), documentation accuracy

### Python
- [python-patterns.md](domains/python-patterns.md) - datetime, f-strings, JSON handling, type hints

### Ralph
- [ralph-patterns.md](domains/ralph-patterns.md) - Ralph loop operational patterns
- [code-hygiene.md](domains/code-hygiene.md) - Definition of Done checklists

### Security
- [security-patterns.md](domains/security-patterns.md) - Security best practices

### Shell Scripting
- [shell/README.md](domains/shell/README.md) - Shell scripting overview and quick reference
- [shell/strict-mode.md](domains/shell/strict-mode.md) - Strict mode (`set -euo pipefail`) patterns
- [shell/variable-patterns.md](domains/shell/variable-patterns.md) - SC2155, SC2034, scoping
- [shell/cleanup-patterns.md](domains/shell/cleanup-patterns.md) - Traps, temp files, state restoration
- [shell/common-pitfalls.md](domains/shell/common-pitfalls.md) - ShellCheck errors and gotchas

### State Management
- [state-management-patterns.md](domains/state-management-patterns.md) - State management patterns

### Testing
- [testing-patterns.md](domains/testing-patterns.md) - Testing strategies and patterns

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
