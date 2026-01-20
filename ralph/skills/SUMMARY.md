# Skills Summary

## Purpose

This repository serves as a **skills knowledge base** for RovoDev and parallel agents. It contains curated performance optimization guidelines, best practices, reusable patterns, and a self-improvement system optimized for agent consumption with minimal token overhead.

## What's Inside

### React & JavaScript Performance References

- **[React Best Practices Index](../references/react-best-practices/INDEX.md)** - Comprehensive performance optimization guidelines for React and Next.js applications
- **[Hotlist](../references/react-best-practices/HOTLIST.md)** - Most commonly applicable rules for quick reference

### Skills Directories

- **[Domains](domains/README.md)** - Technical domain knowledge and reusable patterns (authentication, caching, API design, etc.)
  - [Authentication Patterns](domains/auth-patterns.md) - OAuth2, JWT, session management
  - [Caching Patterns](domains/caching-patterns.md) - Redis, in-memory, CDN, and browser caching strategies
  - [API Design Patterns](domains/api-design-patterns.md) - REST, GraphQL, versioning, error handling
  - [Code Consistency](domains/code-consistency.md) - Documentation accuracy, terminology, parsing consistency
  - [Config Patterns](domains/config-patterns.md) - Portable configs, templates, environment variables
  - [Database Patterns](domains/database-patterns.md) - Schema design, ORMs, query optimization, migrations, transactions
  - [Markdown Patterns](domains/markdown-patterns.md) - Lint rules (MD040, MD024, MD050), documentation accuracy
  - [Python Patterns](domains/python-patterns.md) - datetime, f-strings, JSON handling, type hints
  - [Testing Patterns](domains/testing-patterns.md) - Unit, integration, e2e testing across Jest, pytest, Go testing
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
brain/
├── AGENTS.md                    # Agent-specific guidance for this repo
├── README.md                    # Human-readable overview
├── skills/
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
└── references/
    └── react-best-practices/   # React/Next.js performance guidelines
        ├── INDEX.md            # Categorized rule index
        ├── HOTLIST.md          # Most applicable rules
        └── rules/              # 45 individual rule files
```

## Design Philosophy

- **Low token overhead** - Start broad, drill down only when needed
- **Agent-first** - Optimized for programmatic consumption
- **Reference-focused** - Knowledge, not executable skills
- **Ralph Wiggum friendly** - Simple, obvious, no surprises
