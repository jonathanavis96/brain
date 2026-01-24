<div align="center">

# 🧠 Brain

**A self-improving AI knowledge base that helps AI coding assistants work smarter.**

*Think of it as shared memory for your AI tools.*

</div>

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

**Two AI workers maintain the brain:**

| Worker | Role | Description |
|--------|------|-------------|
| **Cortex** | Manager | Plans tasks, reviews progress, makes strategic decisions |
| **Ralph** | Builder | Executes tasks, writes code, commits changes |

Cortex plans → Ralph builds → Brain improves → Your projects benefit.

---

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/jonathanavis96/brain.git ~/code/brain
cd ~/code/brain

# Run setup
bash setup.sh

# Verify
cortex --help
ralph --help
```

### Bootstrap a New Project

```bash
# Create a project idea file
cat > MY_PROJECT.md << 'EOF'
# Project: My Awesome App
Location: ~/code/my-app
Purpose: A web app that does amazing things
Tech Stack: Next.js, TypeScript, PostgreSQL
EOF

# Bootstrap it
cd ~/code/brain
bash workers/ralph/new-project.sh MY_PROJECT.md

# Your project is ready with full AI infrastructure!
cd ~/code/my-app
ralph loop --iterations 10
```

**What you get:**

- Complete Ralph loop infrastructure
- Custom `THOUGHTS.md` (project vision)
- Custom `NEURONS.md` (codebase map)
- Custom `IMPLEMENTATION_PLAN.md` (prioritized tasks)
- Connection to brain's knowledge base

---

## Repository Structure

```text
brain/
├── skills/                 # Knowledge base (reusable patterns)
│   ├── domains/            # Technical patterns (shell, python, etc.)
│   └── projects/           # Project-specific knowledge
│
├── templates/              # Project scaffolding templates
│   ├── cortex/             # Manager templates
│   └── ralph/              # Worker templates
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

## Key Features

### Self-Improvement

Brain improves itself using the Ralph loop. Tasks in `IMPLEMENTATION_PLAN.md` get executed automatically.

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

- ✅ Bootstrap system (~14 second project creation)
- ✅ Self-improving Ralph loop
- ✅ Token-efficient Cerebras worker (~6K tokens/run)
- ✅ Skills knowledge base
- ✅ Protected file system with waivers
- ✅ Comprehensive verification

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run verification: `bash workers/ralph/verifier.sh`
5. Submit PR

See [AGENTS.md](AGENTS.md) for detailed contribution guidelines.

---

## License

MIT

---

<div align="center">

**Get Started:** `bash setup.sh` then `bash workers/ralph/new-project.sh MY_PROJECT.md`

</div>
