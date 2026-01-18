# Knowledge Base Summary

## Purpose

This repository serves as a **reference knowledge base** for RovoDev and parallel agents working on React and JavaScript projects. It contains curated performance optimization guidelines, best practices, and rules optimized for agent consumption with minimal token overhead.

## What's Inside

### React & JavaScript Performance References

- **[React Best Practices Index](../references/react-best-practices/INDEX.md)** - Comprehensive performance optimization guidelines for React and Next.js applications
- **[Hotlist](../references/react-best-practices/HOTLIST.md)** - Most commonly applicable rules for quick reference

### Knowledge Directories

- **[Domains](domains/README.md)** - Technical domain knowledge and reusable patterns (authentication, caching, API design, etc.)
  - [Authentication Patterns](domains/auth-patterns.md) - OAuth2, JWT, session management (example KB file)
  - [Caching Patterns](domains/caching-patterns.md) - Redis, in-memory, CDN, and browser caching strategies
  - [API Design Patterns](domains/api-design-patterns.md) - REST, GraphQL, versioning, error handling
  - [Database Patterns](domains/database-patterns.md) - Schema design, ORMs, query optimization, migrations, transactions
  - [Testing Patterns](domains/testing-patterns.md) - Unit, integration, e2e testing across Jest, pytest, Go testing
  - [Ralph Loop Architecture](domains/ralph-patterns.md) - How Ralph works internally (subagents, tool visibility, execution flow)
- **[Projects](projects/README.md)** - Project-specific conventions, decisions, and context
  - [Brain Repository](projects/brain-example.md) - Brain-specific conventions and Ralph usage (example KB file)

## KB Authoring

- **[Conventions](conventions.md)** - Guidelines for creating and maintaining KB files (required structure, naming, style)

## How Agents Should Use This Repository

1. **Start here** (`kb/SUMMARY.md`) to understand what's available
2. **Consult the HOTLIST** first for common scenarios
3. **Fan out to specific rules** only when deeper knowledge is required
4. **Never scan** the entire rules directory unless explicitly instructed

## Repository Structure

```
brain/
├── AGENTS.md                    # Agent-specific guidance for this repo
├── README.md                    # Human-readable overview
├── kb/
│   └── SUMMARY.md              # This file - knowledge base entrypoint
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
