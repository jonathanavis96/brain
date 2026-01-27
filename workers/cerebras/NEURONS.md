# NEURONS.md - Cerebras Worker Repository Map

## Purpose

This file maps the brain repository structure from the Cerebras worker's perspective, providing detailed information about every directory and key file for efficient navigation and understanding.

## Worker Context

- **Worker:** Cerebras (Direct Cerebras API integration)
- **Location:** `/workers/cerebras/`
- **Access:** Full brain repository (read/write except protected files)
- **Scope:** Shared task execution from `workers/IMPLEMENTATION_PLAN.md`
- **Model:** Cerebras Llama 3.3 70B (default)

## Quick Navigation

| I need to... | Read this |
|--------------|-----------|
| See active tasks | `workers/IMPLEMENTATION_PLAN.md` |
| See completed tasks | `workers/cerebras/THUNK.md` |
| Fix a verifier error | `skills/SUMMARY.md` → Error table |
| Understand project goals | `THOUGHTS.md` |
| Learn a pattern | `skills/domains/<category>/<skill>.md` |
| Bootstrap new project | `docs/BOOTSTRAPPING.md` |
| Full repo details | Root `NEURONS.md` |
| Check my guidance | `workers/cerebras/AGENTS.md` |
| Enhancement roadmap | `workers/cerebras/ENHANCEMENT_PLAN.md` |

---

## Complete Repository Structure

### Root Level

```text
brain/
├── README.md                    # Human-readable overview and onboarding
├── AGENTS.md                    # Root operational guide for all agents
├── NEURONS.md                   # Root repository structure map
├── THOUGHTS.md                  # Strategic vision and goals (100 line max)
├── CONTRIBUTING.md              # Contribution guidelines
├── new-project.sh               # Bootstrap new projects (~14 seconds)
└── setup.sh                     # Initial brain repository setup
```

**Key Points:**

- Root AGENTS.md has guidance for ALL agents (Cerebras, Ralph, Cortex)
- Root NEURONS.md has complete repository map
- THOUGHTS.md must stay under 100 lines (archive old content)

### Cortex Layer (Manager)

```text
cortex/
├── AGENTS.md                    # Cortex-specific operational guide
├── NEURONS.md                   # Cortex view of repository
├── THOUGHTS.md                  # Cortex strategic analysis
├── DECISIONS.md                 # Architectural decisions log
├── IMPLEMENTATION_PLAN.md       # READ-ONLY copy (syncs from workers/)
├── cortex.bash                  # Cortex wrapper script
├── snapshot.sh                  # Fast state snapshot (non-interactive)
├── sync_gaps.sh                 # Dedup and merge gaps from projects
├── cleanup_cortex_plan.sh       # Archive completed cortex tasks
├── one-shot.sh                  # Single cortex interaction
├── analysis/                    # Analysis documents
├── docs/                        # Cortex documentation
│   ├── REPO_MAP.md             # Detailed repository map
│   ├── PROMPT_REFERENCE.md     # Full prompt details
│   ├── RALPH_PATTERN_RESEARCH.md  # Ralph design research
│   └── TASK_SYNC_PROTOCOL.md   # Task synchronization rules
└── projects/                    # Per-project cortex work
    └── <project>/
        └── PROJECT_BRIEF.md
```

**Cortex Role:**

- Strategic planning (not implementation)
- Writes tasks to `workers/IMPLEMENTATION_PLAN.md`
- Reviews Ralph/Cerebras progress
- Never modifies source code directly

### Workers Layer (Execution)

```text
workers/
├── IMPLEMENTATION_PLAN.md       # SOURCE OF TRUTH - Shared task backlog
├── shared/                      # Shared utilities for all workers
│   ├── cache.sh                # Cache management
│   ├── common.sh               # Common functions
│   ├── filter_acli_errors.sh   # Error filtering
│   └── verifier_common.sh      # Verifier utilities
├── .verify/                     # Shared verification infrastructure
│   ├── ac.sha256               # AC.rules hash
│   ├── latest.txt              # Latest verification results
│   ├── run_id.txt              # Current run ID
│   ├── notify_human.sh         # Human notification
│   └── waivers/                # Manual approval waivers
├── ralph/                       # Ralph worker (RovoDev)
│   ├── (see Ralph NEURONS.md for details)
└── cerebras/                    # THIS WORKER - Cerebras integration
    ├── AGENTS.md               # Cerebras operational guide
    ├── NEURONS.md              # This file
    ├── THOUGHTS.md             # Cerebras-specific context
    ├── THUNK.md                # Completed task log
    ├── PROMPT.md               # Full system prompt (533 lines)
    ├── PROMPT_lean.md          # Lean prompt variant (93 lines)
    ├── VALIDATION_CRITERIA.md  # Quality gates
    ├── ENHANCEMENT_PLAN.md     # Enhancement roadmap (Phase A-F)
    ├── README.md               # Comprehensive usage guide (437 lines)
    ├── HUMAN_REQUIRED.md       # Manual verification tasks
    ├── loop.sh                 # Main execution loop (1,356 lines)
    ├── verifier.sh             # AC checker (730 lines)
    ├── cerebras_agent.py       # Python API wrapper
    ├── init_verifier_baselines.sh  # Initialize .verify/ (85 lines)
    ├── current_cerebras_tasks.sh   # Task monitor (795 lines)
    ├── thunk_cerebras_tasks.sh     # Completed task viewer (439 lines)
    ├── fix-markdown.sh         # Auto-fix markdown lint (165 lines)
    ├── cleanup_plan.sh         # Archive completed tasks (244 lines)
    ├── render_ac_status.sh     # Visualize verifier results (147 lines)
    ├── .verify/                # Hash protection system
    │   ├── .initialized        # Marker file
    │   ├── ac.sha256           # AC.rules hash
    │   ├── loop.sha256         # loop.sh hash
    │   ├── verifier.sha256     # verifier.sh hash
    │   ├── prompt.sha256       # PROMPT.md hash
    │   ├── agents.sha256       # AGENTS.md hash
    │   └── latest.txt          # Latest verifier output
    ├── config/                 # Configuration files
    │   └── non_cacheable_tools.txt  # Tools that bypass cache
    ├── docs/                   # Documentation
    │   └── WAIVER_PROTOCOL.md  # Manual override procedures
    └── logs/                   # Execution logs
        └── latest.log
```

**Cerebras Worker Key Files:**

- `workers/IMPLEMENTATION_PLAN.md` - Shared task source (cerebras reads from here)
- `THUNK.md` - Cerebras's completed task log
- `loop.sh` - Main loop (simpler than Ralph: 1,356 vs 2,292 lines)
- `verifier.sh` - Same verifier as Ralph but adapted paths
- `PROMPT.md` - Full prompt with token efficiency guidance
- `PROMPT_lean.md` - Lightweight variant for simple tasks

### Skills Knowledge Base

```text
skills/
├── SUMMARY.md                   # START HERE - Overview + error quick reference
├── index.md                     # Complete skills catalog
├── conventions.md               # Naming and organization rules
├── domains/                     # Broadly reusable skills
│   ├── README.md
│   ├── anti-patterns/          # What NOT to do
│   │   ├── documentation-anti-patterns.md
│   │   ├── markdown-anti-patterns.md
│   │   ├── ralph-anti-patterns.md
│   │   ├── shell-anti-patterns.md
│   │   └── README.md
│   ├── backend/                # Backend patterns
│   │   ├── api-design-patterns.md
│   │   ├── auth-patterns.md
│   │   ├── caching-patterns.md
│   │   ├── config-patterns.md
│   │   ├── database-patterns.md
│   │   └── error-handling-patterns.md
│   ├── code-quality/           # Quality patterns
│   │   ├── bulk-edit-patterns.md
│   │   ├── code-consistency.md
│   │   ├── code-hygiene.md
│   │   ├── code-review-patterns.md
│   │   ├── markdown-patterns.md
│   │   ├── research-cheatsheet.md
│   │   ├── research-patterns.md
│   │   ├── semantic-code-review.md
│   │   ├── test-coverage-patterns.md
│   │   ├── testing-patterns.md
│   │   └── token-efficiency.md  # TOKEN EFFICIENCY GUIDANCE
│   ├── frontend/               # Frontend patterns
│   │   ├── accessibility-patterns.md
│   │   ├── react-patterns.md
│   │   └── README.md
│   ├── infrastructure/         # Infrastructure patterns
│   │   ├── agent-observability-patterns.md
│   │   ├── deployment-patterns.md
│   │   ├── disaster-recovery-patterns.md
│   │   ├── observability-patterns.md
│   │   ├── security-patterns.md
│   │   └── state-management-patterns.md
│   ├── languages/              # Language-specific patterns
│   │   ├── go/
│   │   │   ├── go-patterns.md
│   │   │   └── README.md
│   │   ├── javascript/
│   │   │   ├── javascript-patterns.md
│   │   │   └── README.md
│   │   ├── python/
│   │   │   └── python-patterns.md
│   │   ├── shell/
│   │   │   ├── cleanup-patterns.md
│   │   │   ├── common-pitfalls.md
│   │   │   ├── README.md
│   │   │   ├── strict-mode.md
│   │   │   ├── validation-patterns.md
│   │   │   └── variable-patterns.md  # SHELLCHECK ERROR FIXES
│   │   └── typescript/
│   │       └── README.md
│   ├── marketing/              # Marketing patterns
│   │   ├── content/
│   │   ├── cro/
│   │   ├── growth/
│   │   ├── seo/
│   │   └── strategy/
│   ├── ralph/                  # Ralph-specific patterns
│   │   ├── bootstrap-patterns.md
│   │   ├── cache-debugging.md
│   │   ├── change-propagation.md
│   │   ├── ralph-patterns.md
│   │   ├── thread-search-patterns.md
│   │   └── tool-wrapper-patterns.md
│   └── websites/               # Website patterns
│       ├── architecture/
│       ├── copywriting/
│       ├── design/
│       ├── discovery/
│       ├── launch/
│       └── qa/
├── playbooks/                   # Operational playbooks
│   ├── README.md
│   ├── PLAYBOOK_TEMPLATE.md
│   ├── bootstrap-new-project.md
│   ├── debug-ralph-stuck.md
│   ├── decompose-large-tasks.md
│   ├── fix-markdown-lint.md
│   ├── fix-shellcheck-failures.md
│   ├── investigate-test-failures.md
│   ├── resolve-verifier-failures.md
│   ├── safe-template-sync.md
│   └── task-optimization-review.md
├── projects/                    # Project-specific skills
│   ├── README.md
│   └── brain-example.md
└── self-improvement/            # Gap capture system
    ├── README.md
    ├── GAP_BACKLOG.md          # Captured knowledge gaps
    ├── GAP_CAPTURE_RULES.md    # Rules for gap capture
    ├── GAP_LOG_AND_AUTO_SKILL_SPEC.md  # Spec
    ├── SKILL_BACKLOG.md        # Promoted skills
    └── SKILL_TEMPLATE.md       # Template for new skills
```

**Skills Quick Lookup:**

| Error Type | Skill to Consult |
|------------|------------------|
| ShellCheck (SC2034, SC2155, etc.) | `skills/domains/languages/shell/variable-patterns.md` |
| Markdown lint (MD040, MD024) | `skills/domains/code-quality/markdown-patterns.md` |
| Python errors | `skills/domains/languages/python/python-patterns.md` |
| Token efficiency | `skills/domains/code-quality/token-efficiency.md` |
| Verifier failures | Check `# VERIFIER STATUS` header in prompt |

### Templates

```text
templates/
├── README.md
├── AGENTS.project.md            # Template for project AGENTS.md
├── NEURONS.project.md           # Template for project NEURONS.md
├── THOUGHTS.project.md          # Template for project THOUGHTS.md
├── NEW_PROJECT_IDEA.template.md # Template for project ideas
├── backend/                     # Backend project templates
├── cortex/                      # Cortex templates
│   ├── cortex.bash
│   ├── cortex-PROJECT.bash
│   └── one-shot.sh
├── go/                          # Go project templates
├── javascript/                  # JavaScript project templates
├── python/                      # Python project templates
├── ralph/                       # Ralph worker templates
│   ├── loop.sh
│   ├── verifier.sh
│   ├── PROMPT.md
│   ├── AGENTS.project.md
│   ├── new-project.sh
│   └── ... (all ralph infrastructure)
└── website/                     # Website project templates
```

**Template Usage:**

- `templates/ralph/` = Source of truth for new Ralph workers
- When updating cerebras, consider if templates should get the same update
- Use `new-project.sh` to bootstrap projects with these templates

### Rules and Verification

```text
rules/
├── AC.rules                     # PROTECTED - Acceptance criteria (shared by all workers)
├── AC-hygiene-additions.rules   # Additional hygiene checks
└── MANUAL_APPROVALS.rules       # Human-approved exceptions

.verify/ (root)
├── ac.sha256                    # AC.rules baseline hash
├── agents.sha256                # AGENTS.md baseline hash
├── loop.sha256                  # loop.sh baseline hash (if at root)
├── prompt.sha256                # PROMPT.md baseline hash (if at root)
├── verifier.sha256              # verifier.sh baseline hash
├── latest.txt                   # Latest verification results (all workers)
├── run_id.txt                   # Current run ID
└── waiver_requests/             # Waiver request storage
    └── WVR-*.json
```

**Protected Files:**

These files are hash-guarded and require human intervention to modify:

- `rules/AC.rules` (`.verify/ac.sha256`)
- `workers/cerebras/loop.sh` (`.verify/loop.sha256`)
- `workers/cerebras/verifier.sh` (`.verify/verifier.sha256`)
- `workers/cerebras/PROMPT.md` (`.verify/prompt.sha256`)
- `workers/cerebras/AGENTS.md` (`.verify/agents.sha256`)

**If verifier detects hash mismatch:** Human must manually update hash files.

### Documentation

```text
docs/
├── BOOTSTRAPPING.md             # New project bootstrapping guide
├── CACHE_DESIGN.md              # Cache system design
├── CHANGES.md                   # Change log
├── EVENTS.md                    # Event emission system
├── HASH_VALIDATION.md           # Hash protection details
├── HISTORY.md                   # Repository history
├── MARKER_SCHEMA.md             # Marker format specification
├── QUALITY_GATES.md             # Quality gate definitions
├── REFERENCE_SUMMARY.md         # Quick reference
├── TEST_SCENARIOS.md            # Testing scenarios
├── TOOLS.md                     # Tool documentation
├── EDGE_CASES.md                # Edge case handling
├── brain-map/                   # Brain map application docs
│   ├── brain-map-spec.md
│   └── brain-map-implementation-plan.md
└── ... (other specialized docs)
```

### Tools and Utilities

```text
tools/
├── check_startup_rules.sh       # Validate startup rules
├── skill_freshness.sh           # Check skill freshness
├── test_*.sh                    # Various test scripts
├── thunk_dedup.sh               # Deduplicate THUNK entries
├── thunk_parser.py              # Parse THUNK.md
├── validate_*.sh                # Validation scripts
├── brain_dashboard/             # Brain metrics dashboard
│   ├── collect_metrics.sh
│   ├── generate_dashboard.py
│   └── README.md
├── gap_radar/                   # Gap detection system
│   ├── coverage_report.py
│   ├── extract_errors.sh
│   ├── extract_from_logs.sh
│   ├── match_skills.py
│   ├── patterns.yaml
│   ├── suggest_gaps.sh
│   └── README.md
├── pattern_miner/               # Pattern mining from commits
│   ├── analyze_commits.py
│   ├── mine_patterns.sh
│   └── README.md
├── rollflow_analyze/            # Rollflow analysis tool
│   ├── src/rollflow_analyze/
│   └── README.md
└── skill_graph/                 # Skill relationship graph
    ├── extract_links.py
    ├── generate_graph.py
    ├── skill_graph.sh
    └── README.md
```

### Bin (Executable Utilities)

```text
bin/
├── brain-event                  # Emit brain events
├── brain-search                 # Search brain repository
├── gap-radar                    # Run gap detection
├── ralph-stats                  # Ralph statistics
├── ralph-summary                # Ralph summary
└── thunk-parse                  # Parse THUNK files
```

## Access Levels

| Access Level | Paths | Notes |
| ------------ | ----- | ----- |
| **Full access** | `skills/`, `templates/`, `cortex/`, `docs/`, `workers/`, `tools/`, `bin/` | Read, write, create, delete |
| **Protected** | `rules/AC.rules`, `workers/cerebras/verifier.sh`, `workers/cerebras/loop.sh`, `workers/cerebras/PROMPT.md`, `workers/cerebras/AGENTS.md` | Read only - hash-guarded |
| **Protected** | `.verify/*.sha256` | Baseline hashes - human updates only |
| **Forbidden** | `.verify/waivers/*.approved` | OTP-protected - cannot read/write |

## Common Tasks

### Finding Information

```bash
# Search for pattern
rg "pattern" skills/ | head -20

# Find files by name
find . -name "*.md" | grep pattern

# Check if skill exists
ls skills/domains/code-quality/
```

### Adding New Content

```bash
# Add skill (broadly reusable)
skills/domains/<category>/<skill>.md

# Add playbook (specific procedure)
skills/playbooks/<playbook>.md

# Add gap (missing knowledge)
echo "- Gap description" >> skills/self-improvement/GAP_BACKLOG.md
```

### Working with Tasks

```bash
# View active tasks
grep "^- \[ \]" workers/IMPLEMENTATION_PLAN.md | head -10

# View completed tasks
tail -50 workers/cerebras/THUNK.md

# Monitor tasks (real-time)
bash workers/cerebras/current_cerebras_tasks.sh
```

### Verification

```bash
# Run verifier
cd workers/cerebras && bash verifier.sh

# Check specific AC rule
grep "BugA.1" rules/AC.rules

# View verifier results
bash workers/cerebras/render_ac_status.sh
```

## File Size Guidelines

| File | Max Lines | Action if Over |
| ---- | --------- | -------------- |
| `THOUGHTS.md` | 100 | Archive to logs |
| `PROMPT.md` | 600 | Move details to docs |
| `AGENTS.md` | 250 | Move examples to docs |
| `NEURONS.md` | 700 | OK (this file is comprehensive) |

## Environment Notes

**Platform:** WSL on Windows 11 with Ubuntu

**Key Points:**

- Working directory: `/home/user/code/brain` or `/mnt/c/...`
- Git line endings: `core.autocrlf=input`
- File permissions: WSL handles Unix permissions
- Path separators: Use Unix-style `/` paths
- No X11/GUI tools available (wmctrl, xdotool)
- Use PowerShell for Windows GUI control if needed

## See Also

- **[../../README.md](../../README.md)** - Human-readable overview
- **[../../AGENTS.md](../../AGENTS.md)** - Root operational guide
- **[../../NEURONS.md](../../NEURONS.md)** - Root repository map (even more detail)
- **[AGENTS.md](AGENTS.md)** - Cerebras-specific operational guide
- **[README.md](README.md)** - Comprehensive Cerebras documentation
- **[ENHANCEMENT_PLAN.md](ENHANCEMENT_PLAN.md)** - Enhancement roadmap
- **[../../skills/SUMMARY.md](../../skills/SUMMARY.md)** - Skills knowledge base
- **[../../workers/ralph/NEURONS.md](../../workers/ralph/NEURONS.md)** - Ralph's repository map (for comparison)
