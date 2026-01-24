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

- [bulk-edit-patterns.md](domains/code-quality/bulk-edit-patterns.md) - Bulk editing strategies and markdown auto-fix patterns
- [code-consistency.md](domains/code-quality/code-consistency.md) - Documentation accuracy, terminology, parsing consistency
- [code-hygiene.md](domains/code-quality/code-hygiene.md) - Definition of Done checklists
- [markdown-patterns.md](domains/code-quality/markdown-patterns.md) - Lint rules (MD040, MD024, MD050), documentation accuracy
- [testing-patterns.md](domains/code-quality/testing-patterns.md) - Testing strategies and patterns
- [research-patterns.md](domains/code-quality/research-patterns.md) - Systematic research methodology for gathering and evaluating information
- [research-cheatsheet.md](domains/code-quality/research-cheatsheet.md) - One-page quick reference for research patterns
- [token-efficiency.md](domains/code-quality/token-efficiency.md) - Token optimization strategies for AI agents

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
- [validation-patterns.md](domains/languages/shell/validation-patterns.md) - Shell project validation (syntax, shellcheck, permissions, security)

### Ralph

- [ralph-patterns.md](domains/ralph/ralph-patterns.md) - Ralph loop operational patterns
- [bootstrap-patterns.md](domains/ralph/bootstrap-patterns.md) - Project bootstrapping patterns
- [change-propagation.md](domains/ralph/change-propagation.md) - Change propagation and template sync

### Websites

- [README.md](domains/websites/README.md) - Website development overview

#### Architecture

- [section-composer.md](domains/websites/architecture/section-composer.md) - Section-based page composition
- [sitemap-builder.md](domains/websites/architecture/sitemap-builder.md) - Sitemap planning and structure
- [tech-stack-chooser.md](domains/websites/architecture/tech-stack-chooser.md) - Technology selection guidance

#### Build

- [analytics-tracking.md](domains/websites/build/analytics-tracking.md) - Analytics integration patterns
- [component-development.md](domains/websites/build/component-development.md) - Component development workflow
- [forms-integration.md](domains/websites/build/forms-integration.md) - Form handling and integration
- [mobile-first.md](domains/websites/build/mobile-first.md) - Mobile-first development approach
- [performance.md](domains/websites/build/performance.md) - Performance optimization strategies
- [seo-foundations.md](domains/websites/build/seo-foundations.md) - SEO fundamentals

#### Copywriting

- [cta-optimizer.md](domains/websites/copywriting/cta-optimizer.md) - Call-to-action optimization
- [objection-handler.md](domains/websites/copywriting/objection-handler.md) - Objection handling in copy
- [value-proposition.md](domains/websites/copywriting/value-proposition.md) - Value proposition development

#### Design

- [color-system.md](domains/websites/design/color-system.md) - Color system design
- [design-direction.md](domains/websites/design/design-direction.md) - Design direction and vision
- [spacing-layout.md](domains/websites/design/spacing-layout.md) - Spacing and layout systems
- [typography-system.md](domains/websites/design/typography-system.md) - Typography system design

#### Discovery

- [audience-mapping.md](domains/websites/discovery/audience-mapping.md) - Audience research and mapping
- [requirements-distiller.md](domains/websites/discovery/requirements-distiller.md) - Requirements gathering and distillation
- [scope-control.md](domains/websites/discovery/scope-control.md) - Scope management

#### Launch

- [deployment.md](domains/websites/launch/deployment.md) - Deployment procedures
- [finishing-pass.md](domains/websites/launch/finishing-pass.md) - Final QA and polish

#### QA

- [acceptance-criteria.md](domains/websites/qa/acceptance-criteria.md) - Acceptance criteria definition
- [accessibility.md](domains/websites/qa/accessibility.md) - Accessibility testing and compliance
- [visual-qa.md](domains/websites/qa/visual-qa.md) - Visual quality assurance

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
