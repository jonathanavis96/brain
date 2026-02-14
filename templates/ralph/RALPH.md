# Ralph Wiggum - Iterative Loop Runner

Ralph is a systematic, iterative development loop that alternates between planning and building phases.

## The Ralph Contract

### Phase 0: Initial Study (Before First Iteration)

**0a. Study THOUGHTS.md**  
Use parallel subagents (max 100) to read project vision, goals, and success criteria. Create minimal THOUGHTS.md if missing.

**0b. Identify source code location**  
Prefer `src/` directory. If different, document the actual location.

**0c. Study brain/workers/IMPLEMENTATION_PLAN.md**  
Read the current plan. If it doesn't exist or is empty, the first iteration must create it.

### The Loop

Ralph operates in two alternating phases:

#### 📋 PLAN Phase

See `PROMPT.md` (planning mode section) for full instructions.

**Goal**: Create or update `brain/workers/IMPLEMENTATION_PLAN.md` with clear, atomic tasks

**Frequency**:

- First iteration (if brain/workers/IMPLEMENTATION_PLAN.md missing/empty)
- Every N iterations (configurable, default: every 3)
- When explicitly requested

#### 🔨 BUILD Phase

See `PROMPT.md` (building mode section) for full instructions.

**Goal**: Implement the top item from `brain/workers/IMPLEMENTATION_PLAN.md`

**Process**:

1. Take top incomplete item from brain/workers/IMPLEMENTATION_PLAN.md
2. Implement the change
3. Run build/tests
4. Update brain/workers/IMPLEMENTATION_PLAN.md (mark completed `[x]`)
5. Append progress to brain/workers/ralph/THUNK.md
6. Stage changes with `git add -A` (NO commit - loop.sh batches commits at PLAN phase)

### Parallelism Contract

**Reading/Searching** (max 100 parallel subagents):

- Studying specs, source code, documentation
- Searching for patterns, imports, references
- Analyzing KB files and best practices

**Building/Testing** (exactly 1 agent):

- Running build commands
- Executing tests and benchmarks
- Making file modifications
- Git operations (staging in BUILD, commits batched at PLAN phase)

### Completion Sentinel

When all work is complete, Ralph outputs:

```text
:::COMPLETE:::
```text

The loop runner detects this sentinel and stops iteration.

## Progress Tracking

All Ralph task completions are logged to `brain/workers/ralph/THUNK.md` with:

- Task ID
- Timestamp
- Phase (PLAN or BUILD)
- Actions taken
- Results and outcomes

Organized into "eras" for major project phases.

## Git Commits

**Commits are batched at PLAN phase** for efficiency (~13 seconds saved per BUILD iteration).

**BUILD phase:** Stage changes only (`git add -A`, no commit)  
**PLAN phase:** loop.sh commits all accumulated BUILD changes at PLAN start, then stages/commits plan updates

**Exception:** Verifier failures get immediate commits in BUILD mode with message: `fix(ralph): resolve AC failure <RULE_ID>`

This ensures:

- Fewer, more meaningful commits
- Faster BUILD iterations (no commit overhead)
- Comprehensive commit messages (Ralph has full context during PLAN)
- All related changes grouped together

## Knowledge Base Integration

Ralph can consult project-specific skills in the skills directory when it exists.

**Knowledge growth:**
When Ralph discovers new conventions or decisions specific to the project, it can create/update KB files in the skills directory.

## Running Ralph

```bash
# From repo root
cd brain/workers/ralph
bash loop.sh --iterations 10 --plan-every 3
```

## File Structure

```text
project-root/               ← Application code and config files
├── src/                    # Source code - ALWAYS in project root!
├── package.json            # Dependencies - in project root
├── tsconfig.json           # Config files - in project root
├── index.html              # Entry points - in project root
├── README.md               # Project readme
└── workers/
    └── ralph/                  # ALL Ralph-related files
        ├── RALPH.md            # This file - Ralph contract
        ├── PROMPT.md           # Unified prompt (mode detection)
        ├── VALIDATION_CRITERIA.md  # Quality gates
        ├── AGENTS.md           # Agent guidance for this project
        ├── THOUGHTS.md         # Project vision, goals, success criteria
        ├── NEURONS.md          # Codebase map (auto-generated)
        ├── THUNK.md            # Task completion log (append-only)
        ├── loop.sh             # Loop runner script
        ├── logs/               # Iteration logs
        └── skills/             # Project-specific knowledge base
    ├── IMPLEMENTATION_PLAN.md  # Task tracking (at workers/ level)
```text

### ⚠️ CRITICAL: Source code goes in PROJECT ROOT, not Ralph directory

**The Ralph directory contains Ralph loop infrastructure AND project context files.**

- Source code → `src/` (project root)
- Config files → project root (`package.json`, `tsconfig.json`, etc.)
- Entry points → project root (`index.html`, `main.py`, etc.)
- Ralph files → Ralph directory (PROMPT.md, AGENTS.md, THOUGHTS.md, NEURONS.md, THUNK.md, skills/, logs/, etc.)
- Task tracking → brain/workers/IMPLEMENTATION_PLAN.md

**NEVER put application code inside the Ralph directory.**

## Philosophy: Ralph Wiggum

Named after the Simpsons character who famously said "I'm helping!" Ralph embodies:

- **Simple and obvious** - No clever tricks, just systematic iteration
- **Persistent** - Keeps going until the job is done
- **Honest** - Logs everything, admits what it doesn't know
- **Helpful** - Focused on making progress, not being perfect

Ralph doesn't try to be smart. Ralph just follows the contract and gets the work done.
