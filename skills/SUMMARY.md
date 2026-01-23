# Skills Summary

## 🚨 Error Quick Reference (Check Here First When Errors Occur!)

**When any command/tool fails during your iteration, consult this table immediately.**

### Verifier Rule Failures

| Failed Rule Pattern | What It Means | Where to Find Fix |
|---------------------|---------------|-------------------|
| `Protected.*` | Protected file hash mismatch (loop.sh, verifier.sh, PROMPT.md modified) | **HUMAN INTERVENTION REQUIRED** - You cannot fix this. Report to human. |
| `Hygiene.Shellcheck.1` | SC2034: Unused variables in current_ralph_tasks.sh | [Shell Variable Patterns](domains/shell/variable-patterns.md) - See "SC2034: Unused Variable" |
| `Hygiene.Shellcheck.2` | SC2155: Declare and assign separately in current_ralph_tasks.sh | [Shell Variable Patterns](domains/shell/variable-patterns.md) - See "SC2155: Masked Return Values" |
| `Hygiene.Shellcheck.3` | SC2034: Unused variables in thunk_ralph_tasks.sh | [Shell Variable Patterns](domains/shell/variable-patterns.md) |
| `Hygiene.Shellcheck.4` | SC2155: Declare and assign separately in thunk_ralph_tasks.sh | [Shell Variable Patterns](domains/shell/variable-patterns.md) |
| `Hygiene.Markdown.*` | Missing code fence language tags, duplicate headings | [Markdown Patterns](domains/markdown-patterns.md) - See MD040, MD024 |
| `Hygiene.TermSync.*` | Terminology inconsistency in documentation | [Code Consistency](domains/code-consistency.md) |
| `Hygiene.TemplateSync.*` | Template files out of sync | [Code Consistency](domains/code-consistency.md) |
| `AntiCheat.*` | Forbidden pattern/marker detected in code | **Remove the flagged marker/phrase from your code** |
| `freshness_check` | Verifier infrastructure issue (run_id mismatch) | **HUMAN INTERVENTION REQUIRED** - Report to human |
| `init_baselines` | Verifier baseline initialization failed | **HUMAN INTERVENTION REQUIRED** - Report to human |

### Common Runtime Errors

| Error Type | Symptoms | Skill Reference |
|------------|----------|-----------------|
| **Shell/Bash errors** | Command not found, syntax errors, exit code != 0 | [Shell README](domains/shell/README.md), [Common Pitfalls](domains/shell/common-pitfalls.md) |
| **ShellCheck warnings** | SC2034, SC2155, SC2086, etc. | [Variable Patterns](domains/shell/variable-patterns.md), [Strict Mode](domains/shell/strict-mode.md) |
| **Python errors** | ImportError, AttributeError, TypeError, scope errors ("cannot access local variable") | [Python Patterns](domains/python-patterns.md) |
| **API/HTTP errors** | 401, 403, 429, 500, timeout | [Error Handling Patterns](domains/error-handling-patterns.md), [API Design Patterns](domains/api-design-patterns.md) |
| **Git errors** | Merge conflicts, detached HEAD, push rejected | [Deployment Patterns](domains/deployment-patterns.md) |
| **JSON/Config errors** | Parse errors, missing keys, invalid values | [Config Patterns](domains/config-patterns.md) |
| **Test failures** | Assert errors, mock issues, timeout | [Testing Patterns](domains/testing-patterns.md) |
| **Build/compile errors** | Missing dependencies, syntax errors | Check project-specific docs in [Projects](projects/) |

### Quick Action Guide

**If you see a verifier failure (LAST_VERIFIER_RESULT: FAIL):**

1. Read `.verify/latest.txt` to identify which rule(s) failed
2. Look up the rule in the table above
3. If it says "HUMAN INTERVENTION REQUIRED" - stop and report
4. Otherwise, consult the linked skill document
5. Apply the fix and commit with: `fix(ralph): resolve AC failure <RULE_ID>`

**If you encounter a runtime error (command/tool failure):**

1. Note the error type (shell, Python, API, etc.)
2. Look up the error type in the "Common Runtime Errors" table above
3. Read the linked skill document
4. Apply the minimum fix
5. Re-run the failing command

**Rule: Only 1 "obvious" quick attempt before consulting skills.**

---

## Purpose

This repository serves as a **skills knowledge base** for RovoDev and parallel agents. It contains curated performance optimization guidelines, best practices, reusable patterns, and a self-improvement system optimized for agent consumption with minimal token overhead.

## What's Inside

**Note:** External performance references (like React best practices) have been moved to individual project repositories. This brain repository focuses on worker infrastructure and reusable skills.

### Skills Directories

- **[Domains](domains/README.md)** - Technical domain knowledge and reusable patterns (authentication, caching, API design, etc.)
  - [Authentication Patterns](domains/auth-patterns.md) - OAuth2, JWT, session management
  - [Caching Patterns](domains/caching-patterns.md) - Redis, in-memory, CDN, and browser caching strategies
  - [API Design Patterns](domains/api-design-patterns.md) - REST, GraphQL, versioning, error handling
  - [Change Propagation](domains/change-propagation.md) - Template sync, knowledge persistence, verification checklists
  - [Code Consistency](domains/code-consistency.md) - Documentation accuracy, terminology, parsing consistency
  - [Config Patterns](domains/config-patterns.md) - Portable configs, templates, environment variables
  - [Database Patterns](domains/database-patterns.md) - Schema design, ORMs, query optimization, migrations, transactions
  - [Markdown Patterns](domains/markdown-patterns.md) - Lint rules (MD040, MD024, MD050), documentation accuracy
  - [Python Patterns](domains/python-patterns.md) - datetime, f-strings, JSON handling, type hints, import scope
  - [Testing Patterns](domains/testing-patterns.md) - Unit, integration, e2e testing across Jest, pytest, Go testing
  - [Token Efficiency](domains/code-quality/token-efficiency.md) - Token optimization strategies for AI agents
  - [Ralph Loop Architecture](domains/ralph-patterns.md) - How Ralph works internally (subagents, tool visibility, execution flow)
  - [Bootstrap Patterns](domains/bootstrap-patterns.md) - Project bootstrapping, scaffold templates, initialization flows
  - [Code Hygiene](domains/code-hygiene.md) - Dead code removal, linting, formatting consistency
  - [Deployment Patterns](domains/deployment-patterns.md) - CI/CD, rollout strategies, environment management
  - [Error Handling Patterns](domains/error-handling-patterns.md) - Exception handling, error boundaries, retry strategies
  - [Security Patterns](domains/security-patterns.md) - Input validation, secrets management, secure defaults
  - [State Management Patterns](domains/state-management-patterns.md) - React state, global stores, persistence
  - **[Shell Scripting](domains/shell/README.md)** - Bash best practices, ShellCheck patterns, cleanup/traps
    - [Strict Mode](domains/shell/strict-mode.md) - `set -euo pipefail` patterns
    - [Variable Patterns](domains/shell/variable-patterns.md) - SC2155, SC2034, scoping
    - [Cleanup Patterns](domains/shell/cleanup-patterns.md) - Traps, temp files, state restoration
    - [Common Pitfalls](domains/shell/common-pitfalls.md) - TTY guards, magic numbers, DRY
  - **[Website Development](domains/websites/README.md)** - Website development overview
    - **Architecture**
      - [Section Composer](domains/websites/architecture/section-composer.md) - Section-based page composition
      - [Sitemap Builder](domains/websites/architecture/sitemap-builder.md) - Sitemap planning and structure
      - [Tech Stack Chooser](domains/websites/architecture/tech-stack-chooser.md) - Technology selection guidance
    - **Build**
      - [Analytics Tracking](domains/websites/build/analytics-tracking.md) - Analytics integration patterns
      - [Component Development](domains/websites/build/component-development.md) - Component development workflow
      - [Forms Integration](domains/websites/build/forms-integration.md) - Form handling and integration
      - [Mobile First](domains/websites/build/mobile-first.md) - Mobile-first development approach
      - [Performance](domains/websites/build/performance.md) - Performance optimization strategies
      - [SEO Foundations](domains/websites/build/seo-foundations.md) - SEO fundamentals
    - **Copywriting**
      - [CTA Optimizer](domains/websites/copywriting/cta-optimizer.md) - Call-to-action optimization
      - [Objection Handler](domains/websites/copywriting/objection-handler.md) - Objection handling in copy
      - [Value Proposition](domains/websites/copywriting/value-proposition.md) - Value proposition development
    - **Design**
      - [Color System](domains/websites/design/color-system.md) - Color system design
      - [Design Direction](domains/websites/design/design-direction.md) - Design direction and vision
      - [Spacing Layout](domains/websites/design/spacing-layout.md) - Spacing and layout systems
      - [Typography System](domains/websites/design/typography-system.md) - Typography system design
    - **Discovery**
      - [Audience Mapping](domains/websites/discovery/audience-mapping.md) - Audience research and mapping
      - [Requirements Distiller](domains/websites/discovery/requirements-distiller.md) - Requirements gathering and distillation
      - [Scope Control](domains/websites/discovery/scope-control.md) - Scope management
    - **Launch**
      - [Deployment](domains/websites/launch/deployment.md) - Deployment procedures
      - [Finishing Pass](domains/websites/launch/finishing-pass.md) - Final QA and polish
    - **QA**
      - [Acceptance Criteria](domains/websites/qa/acceptance-criteria.md) - Acceptance criteria definition
      - [Accessibility](domains/websites/qa/accessibility.md) - Accessibility testing and compliance
      - [Visual QA](domains/websites/qa/visual-qa.md) - Visual quality assurance
- **[Projects](projects/README.md)** - Project-specific conventions, decisions, and context
  - [Brain Repository](projects/brain-example.md) - Brain-specific conventions and Ralph usage
- **[Self-Improvement](self-improvement/README.md)** - Gap capture and skill promotion system
  - [Gap Capture Rules](self-improvement/GAP_CAPTURE_RULES.md) - Mandatory rules for capturing knowledge gaps
  - [Gap Backlog](self-improvement/GAP_BACKLOG.md) - Raw log of discovered gaps
  - [Skill Backlog](self-improvement/SKILL_BACKLOG.md) - Promotion queue for gaps ready to become skills
  - [Skill Template](self-improvement/SKILL_TEMPLATE.md) - Template for creating new skill files

### Skills Index

- **[Skills Index](index.md)** - Complete catalog of all available skills

## Skills Authoring

- **[Conventions](conventions.md)** - Guidelines for creating and maintaining skill files (required structure, naming, style)

## How Agents Should Use This Repository

1. **Start here** (`skills/SUMMARY.md`) to understand what's available
2. **Check the [Skills Index](index.md)** for a complete catalog
3. **Consult the HOTLIST** first for common scenarios
4. **Fan out to specific rules** only when deeper knowledge is required
5. **Log gaps** in the self-improvement system when you discover missing capabilities
6. **Never scan** the entire rules directory unless explicitly instructed

## Repository Structure

```text
brain/ (repository root)
├── README.md                    # Human-readable overview
├── cortex/                      # Manager layer (Cortex)
├── workers/                     # Execution layer (Ralph, etc.)
│   └── ralph/                   # Ralph worker
├── skills/                      # THIS DIRECTORY - shared knowledge base
│   ├── SUMMARY.md              # This file - skills entrypoint
│   ├── index.md                # Complete skills catalog
│   ├── conventions.md          # Skills authoring guidelines
│   ├── domains/                # Broadly reusable skills
│   ├── projects/               # Project-specific skills
│   └── self-improvement/       # Gap capture & skill promotion system
│       ├── README.md
│       ├── GAP_CAPTURE_RULES.md
│       ├── GAP_BACKLOG.md
│       ├── SKILL_BACKLOG.md
│       └── SKILL_TEMPLATE.md
├── templates/                   # Project scaffolding (shared)
├── rules/                       # Acceptance criteria (shared)
├── docs/                        # Project documentation (shared)
└── .verify/                     # Validation infrastructure (shared)
```

## Design Philosophy

- **Low token overhead** - Start broad, drill down only when needed
- **Agent-first** - Optimized for programmatic consumption
- **Reference-focused** - Knowledge, not executable skills
- **Ralph Wiggum friendly** - Simple, obvious, no surprises
