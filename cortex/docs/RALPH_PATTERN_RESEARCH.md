# Ralph Pattern Research

**Source:** ghuntley.com/ralph, github.com/ghuntley/how-to-ralph-wiggum, github.com/ghuntley/loom
**Date:** 2026-01-21

## Key Terminology

| Ghuntley Term | Our Term | Purpose |
|---------------|----------|---------|
| Weaver | Ralph | Execution worker (runs in loop, implements tasks) |
| Manager | Cortex | Strategic planner (breaks down goals, creates specs) |
| Loom | Brain | The overall system/repository |
| specs/ | specs/ | Requirement documents per "topic of concern" |
| AGENTS.md | AGENTS.md | Operational learnings (updated by weaver during BUILD) |
| PROMPT.md | PROMPT.md | Core identity/instructions (~1-2KB, lean) |
| IMPLEMENTATION_PLAN.md | IMPLEMENTATION_PLAN.md | Task list derived from specs |

## Core Architecture

### Two Modes, Two Prompts

| Mode | Purpose | Prompt Focus |
|------|---------|--------------|
| PLANNING | Generate/update IMPLEMENTATION_PLAN.md | Gap analysis (specs vs code), no implementation |
| BUILDING | Implement tasks, commit | Pick task, implement, validate, commit |

### Context Loading Per Iteration

**CRITICAL:** Only `PROMPT.md` + `AGENTS.md` are loaded each iteration. That's it.

- NOT massive system prompts
- NOT full THOUGHTS.md
- Worker reads other files on-demand via subagents

### BUILDING Mode Lifecycle (Ralph/Weaver)

1. **Orient** – subagents study `specs/*` (requirements)
2. **Read plan** – study `IMPLEMENTATION_PLAN.md`
3. **Select** – pick the most important task
4. **Investigate** – subagents study relevant `/src` ("don't assume not implemented")
5. **Implement** – N subagents for file operations
6. **Validate** – 1 subagent for build/tests (backpressure)
7. **Update IMPLEMENTATION_PLAN.md** – mark task done, note discoveries/bugs
8. **Update AGENTS.md** – if operational learnings discovered
9. **Commit**
10. **Loop ends** → context cleared → next iteration starts fresh

### PLANNING Mode Lifecycle (Cortex/Manager)

1. Subagents study `specs/*` and existing `/src`
2. Compare specs against code (gap analysis)
3. Create/update `IMPLEMENTATION_PLAN.md` with prioritized tasks
4. **No implementation**

## Key Principles

### 1. Let Ralph Ralph

- Don't prescribe everything upfront
- Observe failure patterns, add "signs" reactively
- Signs can be: prompt text, AGENTS.md entries, utilities in codebase

### 2. Specs Drive Everything

- `specs/*.md` - Requirements docs for each "topic of concern"
- One topic of concern = one spec file
- One spec → many tasks
- "Topic Scope Test": Can you describe it in one sentence without "and"?

### 3. AGENTS.md is Operational Learnings

- Updated **by the weaver during BUILD** when patterns discovered
- Contains "signs" - patterns discovered, how to build/test
- NOT a massive identity document
- Lean (~3KB max)

### 4. The Plan is Disposable

- If it's wrong, throw it out, and start over
- Generated from specs, not hand-crafted

### 5. Move Outside the Loop

- You sit ON the loop, not IN it
- Observe and course correct
- Tune it like a guitar - observe failures, add signs

### 6. Backpressure

- Run tests after implementation (validation step)
- Prevents "cheating" - can't claim done without tests passing

## Loom Project Structure (Reference)

```text
loom/
├── .agents/workflows/     # Workflow definitions
├── specs/                 # 50+ spec files (topics of concern)
│   ├── README.md         # Spec index by category
│   ├── architecture.md
│   ├── auth-*.md
│   ├── weaver-*.md       # Weaver (worker) specs
│   └── ...
├── AGENTS.md             # Operational learnings (~195 lines)
├── prompt.md             # Current task prompt (very lean)
├── TODO.md               # High-level todos
├── hidave.md             # Current focus/plan
└── crates/               # Rust source code
```text

### AGENTS.md Structure (from Loom)

```markdown
# Loom Agent Guidelines

## Specifications
- Assume NOT implemented
- Check the codebase first
- Use specs as guidance
- Spec index: specs/README.md

## Commands
### Building with Nix
### Building with Cargo
### Testing
### Database

## Patterns
### Error Handling
### Internationalization
### Adding Translations

## Anti-patterns
- (operational learnings about what NOT to do)
```text

### prompt.md Structure (from Loom)

Very lean - just points to specs and current task:

```markdown
study specs/readme.md
study hidave.md and pick the most important thing to do
...
IMPORTANT:
- update the hidave plan when the task is done
- commit and push when you are done
```text

## What This Means for Our Brain Repo

### Current Problems

1. **CORTEX_SYSTEM_PROMPT.md is 18KB** - Should be ~1-2KB like prompt.md
2. **Too much context injected** - 32KB+ before conversation starts
3. **No specs/** - No clear requirements documents
4. **AGENTS.md is static** - Should be updated with operational learnings
5. **No separation of PLANNING vs BUILDING prompts**

### Recommended Changes

1. **Lean down CORTEX_SYSTEM_PROMPT.md** → Rename to `PROMPT.md`, ~1-2KB max
2. **AGENTS.md stays lean** (~3KB) - Operational learnings only
3. **Create specs/** for Brain project requirements
4. **Two prompts**: `PROMPT_plan.md` and `PROMPT_build.md`
5. **Injection should be**: `PROMPT.md` + `AGENTS.md` only (~4-5KB total)
6. **THOUGHTS.md, NEURONS.md read on-demand** - Not injected every time

### File Mapping

| Current | Should Be |
|---------|-----------|
| `CORTEX_SYSTEM_PROMPT.md` (18KB) | `PROMPT.md` (~1KB) |
| `AGENTS.md` (3KB) | `AGENTS.md` (lean, updated by worker) |
| *(missing)* | `specs/` directory |
| `THOUGHTS.md` | Read on-demand, not injected |
| `NEURONS.md` | Read on-demand, not injected |
| `snapshot.sh` | Remove or simplify to task counts only |

---

## Key Finding: Planning is Conversational, Not Autonomous

**Discovery (2026-01-21):** Ghuntley's "manager" isn't a separate autonomous AI agent - it's **him talking to an AI in a terminal conversation**.

### How Ghuntley Actually Plans

1. **Interactive conversation** - He opens a terminal, talks to Claude/AI conversationally
2. **Iterative refinement** - Back-and-forth discussion: "what about X?", "how should we handle Y?"
3. **AI helps structure** - Gap analysis, prioritization, breaking down tasks
4. **Conversation produces the plan** - Output becomes `hidave.md` / `TODO.md`
5. **Fresh context executes** - Weaver (separate session) picks up plan and builds

### Two AI Interactions, Different Modes

| Mode | Style | Context | Human Role |
|------|-------|---------|------------|
| **Planning** | Conversational, iterative | Maintains conversation history | Active collaborator |
| **Building** | Autonomous, task-focused | Fresh each iteration | Observer (on the loop) |

### The Critical Difference from Our Cortex

**Ghuntley's model:**

- Planning = Human + AI conversation (interactive)
- Building = AI loop (autonomous)
- The human IS the manager, AI assists

**Our current Cortex model:**

- Planning = Cortex AI (semi-autonomous)
- Building = Ralph AI (autonomous)
- AI is the manager

### Conversational Continuity Problem

In planning mode, the AI should:

- ✅ Remember what was discussed earlier in the conversation
- ✅ Understand references without re-explanation ("the thing we talked about")
- ✅ Build on previous context naturally
- ❌ NOT require the human to re-explain context 100 times
- ❌ NOT start fresh every response

This is why Ghuntley uses terminal conversations for planning - the AI maintains conversational state throughout the session.

### Implications for Brain Repo

1. **Planning mode should be conversational** - Not one-shot autonomous planning
2. **Context injection at start** - Then conversation flows naturally
3. **Human stays in the loop** - Planning is collaborative, not delegated
4. **Building mode stays autonomous** - Ralph picks task, implements, commits

### Proposed Cortex Chat Mode

```text
cortex.bash (current) → planning conversation
- Load context once at start
- Human and AI discuss, iterate, refine
- Output: updated IMPLEMENTATION_PLAN.md
- Human decides when plan is ready

one-shot.sh → quick status/updates
- Fast snapshot, answer one question, done
```text

---

## References

- <https://ghuntley.com/ralph/>
- <https://github.com/ghuntley/how-to-ralph-wiggum>
- <https://github.com/ghuntley/loom>
