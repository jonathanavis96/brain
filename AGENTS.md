# AGENTS.md - Operational Guide

## Purpose

This guide provides operational instructions for agents working on the brain repository. The brain repository serves as a self-improving skills knowledge base for RovoDev agents, maintained through the Ralph loop system.

## Getting Started

**New to Brain?** Start here:

1. **[README.md](README.md)** - Overview and quick start guide
2. **[NEURONS.md](NEURONS.md)** - Complete repository structure map
3. **[THOUGHTS.md](THOUGHTS.md)** - Strategic vision and goals
4. **[skills/SUMMARY.md](skills/SUMMARY.md)** - Skills overview

For operational details on running Ralph, see **[workers/ralph/README.md](workers/ralph/README.md)** and **[workers/ralph/AGENTS.md](workers/ralph/AGENTS.md)**.

### Making Changes

See **[workers/ralph/AGENTS.md](workers/ralph/AGENTS.md)** for detailed operational guidance including:

- Search patterns and validation commands
- Pre-PR checklist (regex patterns, variable scope, code examples)
- Protected files and workspace boundaries

### Protected Files and Workspace Boundaries

See **[workers/ralph/AGENTS.md](workers/ralph/AGENTS.md)** for complete details on protected files and workspace access levels.

## Self-Improvement System

See **[skills/self-improvement/README.md](skills/self-improvement/README.md)** for the complete gap capture and skill development protocol.

## Common Tasks

For detailed guidance on common tasks, see:

- **Adding new skills:** [skills/self-improvement/README.md](skills/self-improvement/README.md)
- **Updating templates:** [workers/ralph/AGENTS.md](workers/ralph/AGENTS.md#template-sync-rule)
- **Running the verifier:** [workers/ralph/VALIDATION_CRITERIA.md](workers/ralph/VALIDATION_CRITERIA.md)

## Troubleshooting

For troubleshooting guidance:

- **Ralph loop issues:** [workers/ralph/README.md](workers/ralph/README.md#troubleshooting)
- **Common errors:** [skills/SUMMARY.md](skills/SUMMARY.md) → Error Quick Reference
- **Verifier failures:** [workers/ralph/VALIDATION_CRITERIA.md](workers/ralph/VALIDATION_CRITERIA.md)

## Environment Notes

**WSL/Windows 11 Specifics:**

**Python in WSL:** Use `python3` (not `python`). Many WSL distros do not provide a `python` shim by default. When writing commands/scripts, prefer `python3` explicitly and use `python -m ...` only if you’ve verified the environment provides it.


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
