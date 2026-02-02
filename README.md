<div align="center">

# 🧠 Brain

**A self-improving AI knowledge base that helps AI coding assistants work smarter.**

*Think of it as shared memory for your AI tools.*

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 24+](https://img.shields.io/badge/node-24+-green.svg)](https://nodejs.org/)
[![Skills](https://img.shields.io/badge/skills-145+-orange.svg)](skills/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**[Quick Start](#quick-start-guide)** • **[Brain-Map Demo](#brain-map-application)** • **[Skills Library](skills/)** • **[Contributing](CONTRIBUTING.md)**

</div>

---

## Table of Contents

- [What is this?](#what-is-this-plain-english)
- [How it Works](#how-it-works)
- [Quick Start Guide](#quick-start-guide)
  - [Bootstrap a New Project](#-i-want-to-bootstrap-a-new-project)
  - [Use as Skills Library](#-i-want-to-use-brain-as-a-skills-library)
  - [Visualize Knowledge Graph](#-i-want-to-visualize-the-knowledge-graph)
  - [Run Self-Improvement Loop](#-i-want-to-run-brains-self-improvement-loop)
- [Repository Structure](#repository-structure)
- [The Workers](#the-workers)
- [Skills Library](#skills-library)
- [Brain-Map Application](#brain-map-application)
- [Key Features](#key-features)
- [Examples & Use Cases](#examples--use-cases)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## What is this? (Plain English)

Imagine you have an AI coding assistant. Every time you start a new project, it starts from scratch - no memory of what worked before, no knowledge of your patterns, no reusable templates.

**Brain fixes that.**

Brain is a repository that:

- **Remembers** what works (patterns, conventions, solutions)
- **Shares** knowledge across all your projects
- **Bootstraps** new projects with everything already set up
- **Improves itself** continuously using AI agents

It's like giving your AI assistant a persistent brain that learns and grows.

---

## How it Works

```text
┌─────────────────────────────────────────────────────────────┐
│                         BRAIN                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Skills    │  │  Templates  │  │   Workers   │          │
│  │  (patterns) │  │ (scaffolds) │  │ (AI agents) │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │    Your New Project    │
              │  (bootstrapped in ~14s)│
              └────────────────────────┘
```

**Three AI workers maintain the brain:**

| Worker | Role | Speed | Use Case |
|--------|------|-------|----------|
| **Cortex** | 🧠 Manager | Standard | Plans tasks, reviews progress, strategic decisions |
| **Ralph** | 🔨 Builder | Standard | Executes tasks, writes code, commits changes |
| **Cerebras** | ⚡ Fast Builder | 94% faster | Token-efficient iteration with 6K token budget |

**Cortex plans** → **Ralph/Cerebras build** → **Brain improves** → **Your projects benefit** 🚀

---

## Quick Start Guide

**First time here?** Pick your goal below. Each path takes 2-5 minutes.

### 🎯 Start Here

**New to Brain?** Here are the essential docs to get oriented:

- **[NEURONS.md](NEURONS.md)** - Repository structure map (know where everything lives)
- **[docs/TOOLS.md](docs/TOOLS.md)** - Available tools and utilities
- **[docs/BOOTSTRAPPING.md](docs/BOOTSTRAPPING.md)** - Create new projects from templates
- **[skills/SUMMARY.md](skills/SUMMARY.md)** - Skills overview and error quick reference
- **[workers/IMPLEMENTATION_PLAN.md](workers/IMPLEMENTATION_PLAN.md)** - Current work plan and task backlog

**Contributing?** See [CONTRIBUTING.md](CONTRIBUTING.md) for workflow and conventions.

### 🎯 Choose Your Path

#### 🚀 I Want to Bootstrap a New Project

**Best for:** Starting a new project with Brain's templates and full AI development infrastructure.

**Time: ~2 minutes**

```bash
# 1. Clone brain
git clone https://github.com/jonathanavis96/brain.git ~/code/brain
cd ~/code/brain

# 2. Create project idea
cat > MY_PROJECT.md << 'EOF'
# Project: My Awesome App
Location: ~/code/my-app
Purpose: A web app that does amazing things
Tech Stack: Next.js, TypeScript, PostgreSQL
Goals: User auth, Dashboard, API integration
EOF

# 3. Bootstrap (creates GitHub repo + local clone with full AI infrastructure)
bash scripts/new-project.sh MY_PROJECT.md

# 4. Start building!
cd ~/code/my-app
bash ralph/loop.sh --iterations 5
```

**What you get:**

- ✅ GitHub repo created automatically
- ✅ Complete Ralph loop infrastructure (worker + verifier)
- ✅ Project files: `THOUGHTS.md`, `NEURONS.md`, `workers/IMPLEMENTATION_PLAN.md`
- ✅ Connection to brain's skills library
- ✅ Pre-configured validation rules

**📖 Next steps:**

- Read `docs/BOOTSTRAPPING.md` for advanced bootstrapping options
- Review `templates/` directory to see available project types
- Check `CONTRIBUTING.md` to understand the development workflow

---

#### 🧠 I Want to Use Brain as a Skills Library

**Best for:** Enhancing your AI coding assistant with proven patterns and best practices.

**Time: ~30 seconds**

```bash
# Clone brain to a known location
git clone https://github.com/jonathanavis96/brain.git ~/code/brain

# Browse skills
cd ~/code/brain/skills
ls domains/  # shell, python, frontend, backend, infrastructure, etc.

# Reference in your AI prompts
# "Check ~/code/brain/skills/domains/shell/strict-mode.md for best practices"
```

**Key skill areas:**

- **Shell:** Variable patterns, validation, cleanup, strict mode
- **Python:** Error handling, testing, async patterns
- **Frontend:** React patterns, accessibility, performance
- **Backend:** API design, auth, caching, error handling
- **Infrastructure:** Deployment, security, observability
- **Code Quality:** Token efficiency, testing, markdown lint

**📖 Explore the library:**

- **[skills/SUMMARY.md](skills/SUMMARY.md)** - Quick overview and error reference
- **[skills/index.md](skills/index.md)** - Complete catalog of all 145+ skills
- **[skills/playbooks/](skills/playbooks/)** - Step-by-step procedures for common tasks

---

#### 🗺️ I Want to Visualize the Knowledge Graph

**Best for:** Exploring Brain's knowledge connections visually with an interactive graph interface.

**Time: ~2 minutes**

```bash
# 1. Navigate to brain-map
cd ~/code/brain/app/brain-map

# 2. Start backend (Terminal 1)
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. Start frontend (Terminal 2)
cd ../frontend
npm install  # First time only
npm run dev
```

**Open in browser:** <http://localhost:5173>

**What you get:**

- 🎨 Interactive D3.js force-directed graph of your notes
- 🔍 Search nodes by title, tags, or content
- 📝 Create and edit markdown notes with frontmatter
- 🔗 Visual relationship mapping between concepts
- 🔥 Heat maps showing most-connected and active notes
- 📊 Insights panel with orphan detection and density metrics

**📖 Learn more:** [app/brain-map/START.md](app/brain-map/START.md)

---

#### 🔧 I Want to Run Brain's Self-Improvement Loop

**Best for:** Contributing to Brain's development or understanding how it maintains itself.

**Time: ~5 minutes setup**

**Prerequisites:**

- WSL (Windows Subsystem for Linux) on Windows 11, or Linux/macOS
- Atlassian CLI: [Installation guide](https://developer.atlassian.com/cloud/cli/)
- RovoDev access: `acli rovodev auth && acli rovodev usage site`

```bash
# 1. Clone and setup
git clone https://github.com/jonathanavis96/brain.git ~/code/brain
cd ~/code/brain
bash setup.sh

# 2. Run Ralph (brain's worker)
cd workers/ralph
bash loop.sh --iterations 5

# 3. Monitor progress (in another terminal)
bash workers/ralph/current_ralph_tasks.sh
```

**📖 Learn more:**

- **[workers/ralph/README.md](workers/ralph/README.md)** - Ralph loop design philosophy
- **[workers/ralph/AGENTS.md](workers/ralph/AGENTS.md)** - Operational guide for AI agents
- **[NEURONS.md](NEURONS.md)** - Complete repository structure map
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development workflow and guidelines

---

### 🧭 New to Brain? Recommended Learning Path

**Start here if you're exploring Brain for the first time:**

1. **Read this README** (you're here!) to understand what Brain does
2. **Browse [skills/SUMMARY.md](skills/SUMMARY.md)** to see what knowledge is available
3. **Read [NEURONS.md](NEURONS.md)** to understand the repository structure
4. **Read [CONTRIBUTING.md](CONTRIBUTING.md)** to learn the development workflow
5. **Pick a quick start path above** based on your goal

**What the loop does:**

- Commits changes with verification
- Cortex reviews progress and plans next work

**Architecture details:** [workers/ralph/README.md](workers/ralph/README.md) | **Operations guide:** [AGENTS.md](AGENTS.md)

---

### 📚 Additional Resources

| Resource | Purpose |
|----------|---------|
| [NEURONS.md](NEURONS.md) | Complete repository map |
| [THOUGHTS.md](THOUGHTS.md) | Strategic vision & goals |
| [AGENTS.md](AGENTS.md) | Operational guide for AI agents |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guidelines for contributors |
| [skills/SUMMARY.md](skills/SUMMARY.md) | Skills overview + error reference |
| [docs/BOOTSTRAPPING.md](docs/BOOTSTRAPPING.md) | Advanced bootstrapping |
| [cortex/docs/RUNBOOK.md](cortex/docs/RUNBOOK.md) | Operations runbook |

---

## Repository Structure

```text
brain/
├── app/                    # Applications built with Brain
│   └── brain-map/          # Visual knowledge graph explorer
│       ├── backend/        # FastAPI server (search, notes, graph)
│       ├── frontend/       # React + D3.js visualization
│       └── notes/          # Markdown notes with frontmatter
│
├── skills/                 # Knowledge base (145+ reusable patterns)
│   ├── domains/            # Technical patterns (shell, python, etc.)
│   ├── playbooks/          # Step-by-step procedures
│   └── projects/           # Project-specific knowledge
│
├── templates/              # Project scaffolding templates
│   ├── cortex/             # Manager templates
│   ├── ralph/              # Worker templates
│   └── website/            # Website project templates
│
├── workers/                # AI worker infrastructure
│   ├── ralph/              # Builder worker (executes tasks)
│   └── cerebras/           # Fast inference worker
│
├── cortex/                 # Manager layer (plans work)
│   ├── IMPLEMENTATION_PLAN.md
│   └── THOUGHTS.md
│
└── rules/                  # Acceptance criteria & validation
    └── AC.rules
```

---

## The Workers

### Ralph (Builder)

Ralph executes tasks in iterative PLAN/BUILD cycles:

```bash
cd ~/code/brain/workers/ralph

# Single iteration
bash loop.sh

# Multiple iterations
bash loop.sh --iterations 10

# Dry run (preview changes)
bash loop.sh --dry-run

# With specific task
bash loop.sh --task "Fix the typo in README.md"
```

### Cortex (Manager)

Cortex plans and coordinates work:

```bash
cd ~/code/brain/cortex

# Get current brain status
bash snapshot.sh

# Start planning session
bash one-shot.sh
```

### Cerebras (Fast Worker)

Token-efficient worker using Cerebras inference:

```bash
cd ~/code/brain/workers/cerebras

# Run with low token budget
bash loop.sh --dry-run

# Typically uses ~6K tokens per run (vs 98K before optimization)
```

---

## Skills Library

The brain accumulates knowledge in `skills/`:

| Category | Examples |
|----------|----------|
| **Shell** | Variable patterns, strict mode, validation |
| **Python** | Error handling, testing patterns |
| **Code Quality** | Token efficiency, markdown patterns |
| **Infrastructure** | Deployment, security, state management |
| **Ralph Patterns** | Bootstrap, change propagation |

### Adding Knowledge

```bash
# 1. Create a new skill
cat > skills/domains/backend/my-pattern.md << 'EOF'
# My Pattern

## When to Use
[Scenarios where this applies]

## The Pattern
[The actual solution]

## Examples
[Code examples]
EOF

# 2. Update the index
# Edit skills/index.md to include the new skill
```

---

## Brain-Map Application

**Brain-Map** is a full-stack visual knowledge graph application for exploring and managing markdown notes.

### Features

- **Interactive Graph Visualization**: D3.js force-directed graph showing relationships between notes
- **Smart Search**: Filter nodes by title, tags, or content with real-time results
- **Note Management**: Create, edit, and delete markdown notes with YAML frontmatter
- **Relationship Mapping**: Automatic detection of `[[wiki-style]]` links between notes
- **Heat Mapping**: Visual indicators for:
  - Node centrality (most connected concepts)
  - Temporal activity (recently modified notes)
  - Relationship strength
- **Insights Panel**:
  - Orphan node detection
  - Density metrics
  - Suggested connections
- **Real-time Updates**: File system watcher automatically reflects changes

### Architecture

**Backend (FastAPI + Python):**

- REST API for notes, search, and graph data
- Full-text search with ranking
- Frontmatter parsing and validation
- File system watcher with debouncing
- Localhost-only security (no external access)

**Frontend (React + Vite + D3.js):**

- Force-directed graph layout with zoom/pan
- Toast notifications for all user actions
- Filtering and search UI
- Note editing panel with frontmatter support

### Quick Start

```bash
# Terminal 1: Backend
cd ~/code/brain/app/brain-map/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd ~/code/brain/app/brain-map/frontend
npm install && npm run dev
```

Open <http://localhost:5173> to explore the graph.

**📖 Full documentation:** [app/brain-map/START.md](app/brain-map/START.md)

---

## Key Features

### Self-Improvement

Brain improves itself using the Ralph loop. Tasks in `workers/IMPLEMENTATION_PLAN.md` get executed automatically.

### Token Efficiency

The Cerebras worker uses a gist-then-prune architecture:

- Reads context files once
- Summarizes to STATE
- Prunes raw reads from memory
- ~6K tokens per run (94% reduction from naive approach)

### Protected Files

Critical infrastructure is hash-guarded:

- `workers/ralph/loop.sh`
- `workers/ralph/PROMPT.md`
- `workers/ralph/verifier.sh`
- `rules/AC.rules`

Changes require human approval via waiver system.

### Verification

Every commit runs through:

- Shellcheck (shell scripts)
- Ruff (Python)
- Markdownlint (documentation)
- Custom acceptance criteria checks

---

## Philosophy

1. **Search Before Creating** - Always check if something exists
2. **One Task Per Iteration** - Focus, complete, commit
3. **Token Efficiency** - Keep context lean
4. **Documentation = Reality** - If they disagree, fix immediately
5. **Organic Growth** - Add patterns when they emerge in 2+ projects

---

## Current Status

**Brain v2.0** - Production Ready

- ✅ **Brain-Map Application** - Full-stack visual knowledge graph with React + FastAPI
- ✅ **145+ Skills** - Comprehensive patterns library across 10+ domains
- ✅ **Bootstrap System** - ~14 second project creation with GitHub integration
- ✅ **Self-Improving Ralph Loop** - Autonomous task execution with verification
- ✅ **Token-Efficient Cerebras Worker** - ~6K tokens/run (94% reduction)
- ✅ **Protected File System** - Hash-guarded critical infrastructure with waiver protocol
- ✅ **Comprehensive Verification** - Shellcheck, Ruff, Markdownlint, custom AC checks
- ✅ **9 Project Templates** - Backend, Frontend, Website, Go, Python, JavaScript, etc.
- ✅ **Multi-Worker Architecture** - Cortex (manager) + Ralph (builder) + Cerebras (fast)
- ✅ **Knowledge Graph Tools** - Visual exploration, orphan detection, relationship mapping

---

## Examples & Use Cases

### Real-World Applications

**1. Project Bootstrapping**

```bash
# Create a new Next.js SaaS project in 14 seconds
cat > saas_project.md << 'EOF'
# Project: My SaaS App
Location: ~/code/my-saas
Tech Stack: Next.js, TypeScript, Supabase
Features: Auth, payments, dashboard
EOF

bash scripts/new-project.sh saas_project.md
# ✅ GitHub repo created
# ✅ Ralph loop configured
# ✅ Connected to brain skills
# ✅ Ready to start iterating
```

**2. Knowledge Graph Exploration**

- Use Brain-Map to explore relationships between 145+ skills
- Find orphaned documentation that needs connections
- Visualize how different patterns relate to each other
- Quick lookup for "what skills do I have for X?"

**3. Continuous Skill Improvement**

```bash
# Ralph discovers a new pattern while working
# Automatically documents it in skills/
# Updates the knowledge graph
# Pattern becomes available for all future projects
```

**4. Documentation-Driven Development**

- Keep `IMPLEMENTATION_PLAN.md` as source of truth
- Ralph executes tasks from the plan
- Updates documentation as work progresses
- Never falls out of sync

### Example Projects

See **[skills/projects/brain-example.md](skills/projects/brain-example.md)** for a detailed example of how Brain maintains itself.

---

## Troubleshooting

### Common Issues

**Problem: Ralph loop fails with "PLAN_DONE.md not found"**

```bash
# Solution: Initialize the PLAN_DONE marker
touch workers/PLAN_DONE.md
```

**Problem: Bootstrap script can't find templates**

```bash
# Solution: Ensure you're running from brain repository root
cd ~/code/brain
bash scripts/new-project.sh MY_PROJECT.md
```

**Problem: Brain-Map backend won't start**

```bash
# Solution: Install Python dependencies
cd app/brain-map/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Problem: Brain-Map frontend shows blank graph**

```bash
# Solution: Ensure backend is running and check notes directory
curl http://localhost:8000/health
ls app/brain-map/notes/*.md  # Should show notes
```

**Problem: Verifier fails on protected files**

```bash
# Solution: Request a waiver for critical changes
cd workers/ralph
bash .verify/request_waiver.sh "Reason for change"
# Follow waiver approval process
```

**Problem: Skills not syncing to new project**

```bash
# Solution: Update brain pointer in new project
cd ~/code/my-project
# Edit workers/IMPLEMENTATION_PLAN.md
# Ensure BRAIN_PATH points to ~/code/brain
```

### Getting Help

- **Documentation**: Start with [NEURONS.md](NEURONS.md) to understand structure
- **Worker Issues**: Check [workers/ralph/README.md](workers/ralph/README.md)
- **Bootstrap Issues**: See [docs/BOOTSTRAPPING.md](docs/BOOTSTRAPPING.md)
- **Contribution Guide**: Read [CONTRIBUTING.md](CONTRIBUTING.md)

---

## How to Contribute

**See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.**

Key areas for contribution:

1. **Add Skills** - Document patterns you've discovered (use [skills/self-improvement/SKILL_TEMPLATE.md](skills/self-improvement/SKILL_TEMPLATE.md))
2. **Improve Templates** - Enhance project scaffolding (follow template sync rules in CONTRIBUTING.md)
3. **Report Gaps** - Add entries to `skills/self-improvement/skills/self-improvement/GAP_BACKLOG.md`
4. **Fix Bugs** - Create issues or submit PRs (run `pre-commit run --all-files` before committing)

### Quick Contribution Guide

### Quick Contribution

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/brain.git
cd brain

# 2. Create feature branch
git checkout -b feature/my-improvement

# 3. Make changes (add skills, fix bugs, improve templates)

# 4. Run verification
cd workers/ralph
bash verifier.sh

# 5. Commit and push
git add -A
git commit -m "feat(skills): add new pattern for X"
git push origin feature/my-improvement

# 6. Create PR on GitHub
```

### Contribution Types

| Type | Example | Where to Add |
|------|---------|--------------|
| **New Skill** | Shell pattern, Python idiom | `skills/domains/<category>/` |
| **Template Fix** | Better defaults, bug fix | `templates/<type>/` |
| **Bug Fix** | Verifier issue, script error | Anywhere |
| **Documentation** | Improve clarity, add examples | `*.md` files |

### Guidelines

- **Search first** - Check if pattern/fix already exists
- **Follow structure** - Use `skills/self-improvement/SKILL_TEMPLATE.md` for new skills
- **Test thoroughly** - Run verifier before submitting
- **Write clear commits** - Use conventional commits (`feat:`, `fix:`, `docs:`)

**📖 Full contribution guide:** [CONTRIBUTING.md](CONTRIBUTING.md)

**For AI agents:** [AGENTS.md](AGENTS.md) contains operational guidance and architecture details.

---

## License

MIT

---

<div align="center">

**Get Started:** `bash setup.sh` then `bash scripts/new-project.sh MY_PROJECT.md`

</div>
