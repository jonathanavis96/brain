# Cerebras Worker

## Overview

The Cerebras worker is an autonomous agent loop that uses Cerebras LLMs for self-improvement tasks on the brain repository. It operates similarly to the Ralph worker but with direct Cerebras API integration.

**Key Differences from Ralph:**

- **API Integration:** Direct Cerebras API calls instead of RovoDev wrapper
- **Model Focus:** Optimized for Cerebras Llama 3.3 70B
- **Prompt Strategy:** Has both full PROMPT.md and lean PROMPT_lean.md variants
- **Standalone:** Can operate independently without RovoDev infrastructure

## Architecture

### Core Components

```text
workers/cerebras/
├── loop.sh                      # Main execution loop (1,356 lines)
├── verifier.sh                  # Acceptance criteria checker (730 lines)
├── cerebras_agent.py            # Python wrapper for Cerebras API
├── PROMPT.md                    # Full system prompt (533 lines)
├── PROMPT_lean.md               # Lightweight prompt variant (93 lines)
├── workers/ralph/THUNK.md                     # Completed task log
├── workers/IMPLEMENTATION_PLAN.md       # Task queue (synced from workers/)
└── ENHANCEMENT_PLAN.md          # This enhancement roadmap

Helper Scripts:
├── current_cerebras_tasks.sh    # Real-time task monitor (795 lines)
├── thunk_cerebras_tasks.sh      # Completed task viewer (439 lines)
├── fix-markdown.sh              # Auto-fix markdown lint (165 lines)
├── cleanup_plan.sh              # Archive completed tasks (244 lines)
├── render_ac_status.sh          # Visualize verifier results (147 lines)
└── init_verifier_baselines.sh   # Initialize verification (85 lines)

Infrastructure:
├── .verify/                     # Hash protection system
├── config/                      # Configuration files
├── docs/                        # Documentation (WAIVER_PROTOCOL.md)
└── logs/                        # Execution logs
```

### Execution Flow

```text
1. loop.sh starts
   ↓
2. Determine mode (PLAN vs BUILD)
   ↓
3. Inject context (verifier status, header info)
   ↓
4. Call cerebras_agent.py with appropriate prompt
   ↓
5. Agent performs ONE task
   ↓
6. Run verifier.sh (BUILD mode only)
   ↓
7. Commit changes
   ↓
8. Loop continues or exits
```

### Mode Selection

- **PLAN Mode:** Iteration 1 or every 3rd iteration
- **BUILD Mode:** All other iterations

PLAN mode focuses on breaking down work and creating task contracts.
BUILD mode executes exactly ONE task from workers/IMPLEMENTATION_PLAN.md.

## Running Cerebras

### Prerequisites

```bash
# 1. Cerebras API key
export CEREBRAS_API_KEY="your-api-key-here"  # pragma: allowlist secret

# 2. Working directory
cd /path/to/brain/workers/cerebras || exit

# 3. Verify environment
which python3  # Should exist
test -f loop.sh && echo "✓ loop.sh found"
test -f verifier.sh && echo "✓ verifier.sh found"
```

### Basic Usage

```bash
# Single iteration (default)
bash loop.sh

# Multiple iterations
bash loop.sh --iterations 10

# Dry run (preview without changes)
bash loop.sh --dry-run

# Rollback last N iterations
bash loop.sh --rollback 2

# Resume from interruption
bash loop.sh --resume
```

### Command-Line Options

| Option | Description |
|--------|-------------|
| `--iterations N` | Run N iterations then stop |
| `--dry-run` | Preview changes without committing |
| `--rollback N` | Undo last N commits |
| `--resume` | Resume from interruption |
| `--model MODEL` | Override default model |
| `--prompt PROMPT` | Use alternate prompt file |
| `--help` | Show help message |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CEREBRAS_API_KEY` | (required) | Cerebras API key |
| `CEREBRAS_MODEL` | `llama3.3-70b` | Model to use |
| `CEREBRAS_TEMPERATURE` | `0.7` | Sampling temperature |
| `CEREBRAS_MAX_TOKENS` | `8000` | Max tokens per response |
| `CACHE_MODE` | `auto` | Cache behavior (auto/off/read/write) |

## Helper Scripts

### current_cerebras_tasks.sh

Real-time task monitor with interactive controls.

```bash
# Start monitoring
bash current_cerebras_tasks.sh

# Hotkeys while running:
#   r - Refresh now
#   p - Pause/resume auto-refresh
#   n - Next task (scroll down)
#   b - Previous task (scroll up)
#   j/k - Scroll one line
#   q - Quit
```

**Use case:** Human wants to see what task cerebras is working on without interrupting the loop.

### thunk_cerebras_tasks.sh

View completed task history from workers/ralph/THUNK.md.

```bash
# View all completed tasks
bash thunk_cerebras_tasks.sh

# Hotkeys:
#   r - Refresh
#   j/k - Scroll
#   / - Search
#   q - Quit
```

**Use case:** Review what work has been completed.

### fix-markdown.sh

Auto-fix common markdown lint issues.

```bash
# Fix single file
bash fix-markdown.sh path/to/file.md

# Fix multiple files
bash fix-markdown.sh file1.md file2.md file3.md

# Check issues without fixing
markdownlint file.md
```

**Use case:** Cerebras iteration fails on markdown lint - run this to auto-fix most issues.

### cleanup_plan.sh

Archive completed tasks from workers/IMPLEMENTATION_PLAN.md.

```bash
# Preview what would be archived
bash cleanup_plan.sh --dry-run

# Archive completed tasks
bash cleanup_plan.sh
```

**Use case:** workers/IMPLEMENTATION_PLAN.md has many completed tasks cluttering the view.

### render_ac_status.sh

Visualize verifier results in human-readable format.

```bash
# Generate status report
bash render_ac_status.sh

# Output shows:
#   - Pass/fail counts
#   - Failed check details
#   - Recommendations
```

**Use case:** Verifier failed but want to see exactly which checks failed.

## Prompt Strategy

Cerebras has two prompt variants:

### PROMPT.md (Full - 533 lines)

- Complete system prompt with all guidance
- Token efficiency optimizations
- Detailed context gathering instructions
- Comprehensive error handling
- **Use for:** Complex tasks, planning iterations

### PROMPT_lean.md (Lean - 93 lines)

- Minimal prompt focusing on core behavior
- Faster inference, lower cost
- Less context injection
- **Use for:** Simple BUILD tasks, quick iterations

To use lean prompt:

```bash
bash loop.sh --prompt PROMPT_lean.md
```

## Verification System

### Acceptance Criteria

The verifier checks rules defined in `rules/AC.rules` (root level, shared with ralph).

**Check categories:**

- **Bug checks:** Specific bug fixes verified
- **Hash guards:** Protected files haven't changed
- **Quality gates:** Markdown lint, shellcheck, etc.

### Running Verifier Manually

```bash
cd workers/cerebras || exit
bash verifier.sh

# Check exit code
echo $?  # 0 = pass, 1 = fail

# View detailed report
cat .verify/latest.txt
```

### Protected Files

These files are hash-protected and cannot be modified without human intervention:

- `loop.sh` (`.verify/loop.sha256`)
- `verifier.sh` (`.verify/verifier.sha256`)
- `PROMPT.md` (`.verify/prompt.sha256`)
- `AGENTS.md` (`.verify/agents.sha256`)
- `rules/AC.rules` (`.verify/ac.sha256`)

**If you need to modify these:** Human must update hash files manually.

## Troubleshooting

### Common Errors

#### "SECURITY ERROR: Verifier missing but .initialized marker exists"

**Cause:** verifier.sh was deleted after initialization.

**Fix:**

```bash
# Restore from git
git checkout verifier.sh
```

#### "grep: current_cerebras_tasks.sh: No such file or directory"

**Cause:** Verifier is checking for files that don't exist yet.

**Fix:** This is expected if you haven't run all enhancement phases. The files will be added in Phase B.

#### "exit code 1" from verifier

**Cause:** Some AC checks failed.

**Fix:**

```bash
# View detailed failures
bash render_ac_status.sh

# Fix issues manually or
# Use fix-markdown.sh for markdown issues
```

#### API Errors

**Cause:** Cerebras API key invalid or rate limited.

**Fix:**

```bash
# Check API key
echo $CEREBRAS_API_KEY

# Test API directly
python3 -c "import os; from anthropic import Anthropic; print('OK' if os.getenv('CEREBRAS_API_KEY') else 'Missing')"
```

### Debug Mode

Enable verbose logging:

```bash
# Set debug mode
export DEBUG=1

# Run loop
bash loop.sh

# View logs
tail -f workers/cerebras/logs/latest.log
```

## Design Philosophy

### Why Separate Cerebras Worker?

1. **Direct API Access:** No RovoDev wrapper dependency
2. **Model Optimization:** Tuned for Cerebras Llama 3.3 70B
3. **Experimentation:** Test Cerebras LLMs independently
4. **Fallback Option:** If RovoDev unavailable, use Cerebras directly

### Cerebras vs Ralph

| Aspect | Ralph | Cerebras |
|--------|-------|----------|
| **API** | RovoDev wrapper | Direct Cerebras API |
| **Caching** | Advanced (event emission, tool logging) | Basic |
| **Scoped Commits** | Yes | No |
| **Cortex Integration** | Yes | Optional |
| **Prompt Size** | 606 lines | 533 lines (+ 93 lean) |
| **Loop Size** | 2,292 lines | 1,356 lines |

**Both workers:**

- Use same verifier (verifier.sh)
- Follow same AC.rules
- Operate on brain repository
- Have token efficiency optimizations
- Support PLAN/BUILD mode switching

### Token Efficiency Focus

Cerebras prioritizes token efficiency:

- **Cheap First:** Use grep/sed/head instead of opening large files
- **Forbidden files:** Never open NEURONS.md, THOUGHTS.md with open_files
- **Required startup:** Specific command sequence to minimize context
- **Batch operations:** Combine multiple commands into one
- **Mental caching:** Don't repeat commands

See PROMPT.md "Token Efficiency" section for details.

## Testing

### Quick Smoke Test

```bash
cd workers/cerebras || exit

# 1. Verifier runs
bash verifier.sh && echo "✓ Verifier OK"

# 2. Helper scripts work
bash fix-markdown.sh --help 2>&1 | grep -q "Usage" && echo "✓ fix-markdown OK"
bash cleanup_plan.sh --help | grep -q "Usage" && echo "✓ cleanup_plan OK"

# 3. Python wrapper works
python3 cerebras_agent.py --help && echo "✓ Python agent OK"

# 4. Loop shows help
bash loop.sh --help | grep -q "Usage" && echo "✓ loop.sh OK"
```

### Full Integration Test

```bash
# Run one iteration with dry-run
bash loop.sh --dry-run --iterations 1

# Expected output:
#   - Mode determined (PLAN or BUILD)
#   - Context injected
#   - Agent called
#   - No actual changes (dry-run)
```

## Contributing

When modifying cerebras worker:

1. **Test thoroughly:** Run verifier before committing
2. **Update hashes:** If modifying protected files, update .verify/*.sha256
3. **Document changes:** Update this README if behavior changes
4. **Sync templates:** Consider if changes should go to templates/ralph/
5. **Run linters:** markdownlint, shellcheck before commit

## See Also

- **PROMPT.md** - Full system prompt for agent
- **PROMPT_lean.md** - Lean prompt variant
- **ENHANCEMENT_PLAN.md** - Roadmap for cerebras improvements
- **AGENTS.md** - Agent operational guide
- **NEURONS.md** - Repository structure map
- **VALIDATION_CRITERIA.md** - Quality standards
- **workers/ralph/README.md** - Ralph worker documentation (for comparison)

## License

Part of the brain repository. Same license as parent project.
