# Brain Repository Map - Cortex Navigation Guide

## Purpose

This document provides a human-friendly overview of the Brain repository structure. Use this to understand where things live and how the repository is organized.

## Top-Level Folders

### `cortex/` - Manager Layer (Opus 4.5)
**Purpose:** High-level planning, task delegation, and strategic oversight.

**Key Files:**
- `CORTEX_SYSTEM_PROMPT.md` - Cortex's identity, role, and operational rules
- `REPO_MAP.md` - This file - navigation guide for the repository
- `DECISIONS.md` - Architectural decisions and conventions (stability anchor)
- `RUNBOOK.md` - Operations guide (how to start Cortex, troubleshooting)
- `IMPLEMENTATION_PLAN.md` - Task contracts for workers (delegation format)
- `THOUGHTS.md` - Cortex's analysis and decision log
- `run.sh` - Main entry point to start Cortex
- `snapshot.sh` - Generates current state summary for Cortex context

**What Cortex Can Modify:**
- `cortex/IMPLEMENTATION_PLAN.md` - Task contracts for workers
- `cortex/THOUGHTS.md` - Cortex's own thinking space
- Root-level `IMPLEMENTATION_PLAN.md` - When delegating to Ralph
- Root-level `THOUGHTS.md` - Strategic decisions
- `skills/self-improvement/GAP_BACKLOG.md` - Knowledge gaps
- `skills/self-improvement/SKILL_BACKLOG.md` - Skill promotion queue

**What Cortex Cannot Modify:**
- Worker prompts (e.g., `workers/ralph/PROMPT.md`)
- Loop scripts (e.g., `workers/ralph/loop.sh`)
- Verifier scripts (e.g., `workers/ralph/verifier.sh`)
- Source code implementations (workers execute, Cortex delegates)

### `workers/` - Execution Layer (Currently: ralph/)
**Purpose:** Task execution, implementation, and iteration.

**Current Workers:**
- `ralph/` - Shell-based loop executor (Sonnet 4.5)
  - `loop.sh` - Main execution loop (PLAN/BUILD cycles)
  - `PROMPT.md` - Ralph's instructions and operational rules
  - `verifier.sh` - Acceptance criteria validation
  - `current_ralph_tasks.sh` - Real-time task monitor
  - `thunk_ralph_tasks.sh` - Completed task log viewer
  - `IMPLEMENTATION_PLAN.md` - Ralph's local copy of tasks
  - `THUNK.md` - Completed task log
  - `NEURONS.md` - Ralph's codebase map
  - `THOUGHTS.md` - Ralph's working context

**Workflow:** Cortex writes task contracts → Ralph executes → Ralph reports progress → Cortex reviews

### `skills/` - Knowledge Base
**Purpose:** Reusable patterns, best practices, and self-improvement system.

**Structure:**
- `SUMMARY.md` - Overview and error quick reference (START HERE)
- `index.md` - Complete catalog of all available skills
- `conventions.md` - Guidelines for authoring new skills
- `domains/` - Technical domain knowledge (auth, caching, API design, shell, etc.)
- `projects/` - Project-specific conventions and context
- `self-improvement/` - Gap capture and skill promotion system
  - `GAP_CAPTURE_RULES.md` - Protocol for logging knowledge gaps
  - `GAP_BACKLOG.md` - Raw log of discovered gaps
  - `SKILL_BACKLOG.md` - Gaps ready for promotion to skills
  - `SKILL_TEMPLATE.md` - Template for creating new skill files

**Usage Pattern:**
1. Start with `SUMMARY.md` for overview
2. Check `index.md` for catalog
3. Consult specific skill files only when needed
4. Log gaps when encountering undocumented knowledge

**Note:** External references (like React best practices) have been moved to individual project repositories. The brain repository focuses on worker infrastructure and skills.

### `templates/` - Project Scaffolding
**Purpose:** Templates for bootstrapping new Ralph-enabled projects.

**Structure:**
- Template files for different project types (backend, python, ralph)
- Generator scripts located in `workers/ralph/generators/` folder (if present)

**Common Templates:**
- `AGENTS.project.md` - Operational guide template
- `NEURONS.project.md` - Repository map template
- `THOUGHTS.project.md` - Project goals template
- `IMPLEMENTATION_PLAN.project.md` - Task planning template
- `ralph/` - Ralph-specific templates (loop.sh, verifier.sh, etc.)

### `.verify/` - Validation Infrastructure
**Purpose:** Acceptance criteria enforcement, hash guards, and waiver system.

**Key Files:**
- `latest.txt` - Most recent verifier output (check for PASS/FAIL/WARN)
- `*.sha256` - Hash guards for protected files
- `waiver_requests/` - Pending waiver requests (legitimately failed rules)
- `waivers/` - Approved waivers (TOTP-protected)

**Protected Files (hash-guarded):**
- `workers/ralph/loop.sh`
- `workers/ralph/verifier.sh`
- `workers/ralph/PROMPT.md`
- `rules/AC.rules`

### `rules/` - Acceptance Criteria
**Purpose:** Automated validation rules for verifier.sh.

**Key Files:**
- `AC.rules` - Core acceptance criteria (protected by hash guard)
- `AC-hygiene-additions.rules` - Extended hygiene checks
- `MANUAL_APPROVALS.rules` - Human-gated changes

**Note:** Workers cannot modify these files - they are enforced by the verifier.

### `docs/` - Project Documentation
**Purpose:** Design decisions, change logs, edge case handling.

**Key Files:**
- `BOOTSTRAPPING.md` - How to create new Ralph-enabled projects
- `CHANGES.md` - Project changelog
- `EDGE_CASES.md` - Detailed examples and error recovery
- `HISTORY.md` - Project evolution
- `TEST_SCENARIOS.md` - Validation scenarios

### `.maintenance/` - Repository Health
**Purpose:** Maintenance tracking and verification.

**Key Files:**
- `MAINTENANCE.md` - Current maintenance items
- `MAINTENANCE_LOG.md` - Historical maintenance log
- `verify-brain.sh` - Repository health check script

**Note:** Analysis files are located in `workers/ralph/analysis/` if present.

## Key Root Files

| File | Purpose | Owner |
|------|---------|-------|
| `README.md` | Human-readable overview | Human/Cortex |
| `IMPLEMENTATION_PLAN.md` | High-level task list | Cortex |

**Worker-Specific Files (in `workers/ralph/`):**

| File | Purpose | Owner |
|------|---------|-------|
| `AGENTS.md` | Operational guide for Ralph | Human/Cortex |
| `NEURONS.md` | Ralph's codebase map | Ralph |
| `THOUGHTS.md` | Ralph's working context | Ralph |
| `IMPLEMENTATION_PLAN.md` | Ralph's local task list | Ralph (synced from root) |
| `THUNK.md` | Completed task log | Ralph |
| `PROMPT.md` | Ralph's instructions | Human (protected) |
| `VALIDATION_CRITERIA.md` | Quality gates | Human/Cortex |
| `loop.sh` | Ralph's main loop | Human (protected) |
| `verifier.sh` | Acceptance criteria validator | Human (protected) |

## Where State Lives

- **Current tasks:** `IMPLEMENTATION_PLAN.md` (root and `workers/ralph/`)
- **Completed tasks:** `workers/ralph/THUNK.md`
- **Strategic context:** `cortex/THOUGHTS.md`
- **Ralph's context:** `workers/ralph/THOUGHTS.md`
- **Knowledge gaps:** `skills/self-improvement/GAP_BACKLOG.md`
- **Skill backlog:** `skills/self-improvement/SKILL_BACKLOG.md`
- **Verifier status:** `.verify/latest.txt`
- **Git state:** `.git/` (local commits before push)
- **Maintenance items:** `workers/ralph/.maintenance/MAINTENANCE.md`

## Navigation Tips

### "I need to understand the project goals"
→ Read `THOUGHTS.md` (root level)

### "I need to see what tasks are active"
→ Read `IMPLEMENTATION_PLAN.md` (root level)

### "I need to know what's been completed"
→ Read `THUNK.md`

### "I need to understand the codebase structure"
→ Read `NEURONS.md` (root level or `workers/ralph/`)

### "I need to learn a specific skill/pattern"
→ Start with `skills/SUMMARY.md` → `skills/index.md` → specific skill file

### "I need to check if something failed"
→ Read `.verify/latest.txt` (look for `[FAIL]` or `[WARN]`)

### "I need to bootstrap a new project"
→ Read `docs/BOOTSTRAPPING.md`

### "I need to fix a verifier failure"
→ Read `skills/SUMMARY.md` → Error Quick Reference table

### "I need to understand Ralph's workflow"
→ Read `skills/domains/ralph/ralph-patterns.md`

### "I need to create a new skill"
→ Read `skills/self-improvement/SKILL_TEMPLATE.md`

### "I need architectural context"
→ Read `cortex/DECISIONS.md` (after it's created)

### "I need operational procedures"
→ Read `cortex/docs/RUNBOOK.md` or `AGENTS.md`

## Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     Brain Repository                         │
│                                                              │
│  ┌──────────────┐         ┌─────────────────────┐          │
│  │   Cortex     │────────>│  IMPLEMENTATION_    │          │
│  │  (Manager)   │  writes │  PLAN.md            │          │
│  │  Opus 4.5    │         │  (task contracts)   │          │
│  └──────────────┘         └──────────┬──────────┘          │
│         │                            │                      │
│         │ reads status               │ reads tasks          │
│         │                            │                      │
│         ▼                            ▼                      │
│  ┌──────────────┐         ┌─────────────────────┐          │
│  │   THUNK.md   │<────────│      Ralph          │          │
│  │  (completed) │  writes │    (Worker)         │          │
│  └──────────────┘         │   Sonnet 4.5        │          │
│                           └─────────────────────┘          │
│                                     │                       │
│                                     │ reads                 │
│                                     ▼                       │
│                           ┌─────────────────────┐          │
│                           │     skills/         │          │
│                           │  (Knowledge Base)   │          │
│                           └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## File Count Reference (for freshness checks)

- **skills/ total:** 30+ files (see `workers/ralph/NEURONS.md` for exact count)
- **templates/ total:** ~30 files across subdirectories
- **cortex/:** 8 core files (CORTEX_SYSTEM_PROMPT, REPO_MAP, DECISIONS, RUNBOOK, etc.)
- **workers/:** 1 worker (ralph/) currently
- **rules/:** 3 files (AC.rules, AC-hygiene-additions.rules, MANUAL_APPROVALS.rules)

## Last Updated

2026-01-21 - Updated to reflect Option B structure (shared resources at root)
