# NEURONS.md - Brain Repository Map

**Last Updated:** 2026-01-28

## Quick Reference

| What                       | Where                        | Purpose                                       |
|----------------------------|------------------------------|-----------------------------------------------|
| **Strategic Vision** | `THOUGHTS.md` | Mission, goals, success criteria |
| **Repository Map** | `NEURONS.md` (this file) | Codebase structure and navigation |
| **Agent Guide** | `AGENTS.md` | Operational guidance for agents |
| **Human Onboarding** | `README.md` | Getting started guide |
| **Skills Knowledge Base** | `skills/` | Domain patterns and best practices |
| **Project Templates** | `templates/` | Bootstrapping for new projects |
| **CLI Tools** | `bin/`, `tools/` | Command-line utilities and analysis tools |
| **Ralph Worker** | `workers/ralph/` | Self-improvement loop for brain |
| **Cerebras Worker** | `workers/cerebras/` | Alternative LLM worker |
| **Cortex Manager** | `cortex/` | Strategic planning and coordination |
| **Acceptance Criteria** | `rules/AC.rules` | Automated quality gates (protected) |
| **Verifier** | `.verify/` | Hash guards and verification system |

## Repository Structure

```text
brain/                           # Root of brain repository
├── README.md                    # Human onboarding and overview
├── THOUGHTS.md                  # Strategic vision and goals
├── NEURONS.md                   # This file - codebase map
├── AGENTS.md                    # Agent operational guide
├── CONTRIBUTING.md              # Contribution guidelines
├── SPEC_CHANGE_REQUEST.md       # Specification change requests
├── STAGING_COPY_REPORT.md       # Staging environment reports
├── TEMPLATE_DRIFT_REPORT.md     # Template drift analysis
├── scripts/                     # Setup and utility scripts
│   ├── new-project.sh          # Project bootstrapping script
│   ├── setup.sh                # Repository setup script
│   └── setup-linters.sh        # Linter configuration script
├── state/                       # Runtime state (event logs)
│   └── events.jsonl            # Event stream log
├── .editorconfig                # Editor configuration
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── .markdownlint.yaml           # Markdown linting configuration
├── .markdownlintignore          # Markdown linting exclusions
├── .pre-commit-config.yaml      # Pre-commit hook configuration
│
├── app/                         # Applications
│   └── brain-map/              # Brain mapping visualization tool
│       ├── START.md            # Getting started guide
│       ├── backend/            # Python FastAPI backend
│       │   ├── app/            # Application code
│       │   ├── tests/          # Test suite
│       │   ├── requirements.txt # Python dependencies
│       │   └── README.md       # Backend documentation
│       ├── frontend/           # React/Vite frontend
│       │   ├── src/            # Source code
│       │   ├── public/         # Static assets
│       │   ├── index.html      # Entry point
│       │   ├── package.json    # NPM dependencies
│       │   └── vite.config.js  # Vite configuration
│       ├── notes/              # Sample notes for testing
│       └── generated/          # Generated artifacts
│
├── artifacts/                   # Build artifacts and reports
│   ├── brain_metrics.json      # Brain repository metrics
│   ├── dashboard.html          # Metrics dashboard
│   ├── optimization_hints.md   # Optimization suggestions
│   ├── analysis/               # Analysis reports
│   ├── review_packs/           # Code review packages
│   ├── rollflow_cache/         # Rollflow cache data
│   └── rollflow_reports/       # Rollflow analysis reports
│
├── bin/                         # Command-line utilities
│   ├── brain-event             # Event logging utility
│   ├── brain-search            # Search THUNK/git history
│   ├── discord-post            # Discord webhook utility
│   ├── gap-radar               # Gap detection tool
│   ├── ralph-stats             # Ralph statistics viewer
│   ├── ralph-summary           # Ralph summary generator
│   └── thunk-parse             # workers/ralph/THUNK.md parser
│
├── config/                      # Configuration files
│   ├── tool-registry.yaml      # Tool registry
│   └── templates/              # Configuration templates
│       └── rovodev-config.template.yml
│
├── skills/                      # Skills knowledge base (domain patterns)
│   ├── SUMMARY.md              # Skills overview and hotlist
│   ├── index.md                # Skill catalog and navigation
│   ├── conventions.md          # Cross-cutting conventions
│   ├── domains/                # Domain-specific patterns
│   │   ├── anti-patterns/      # Common anti-patterns to avoid
│   │   ├── backend/            # API, auth, caching, database patterns
│   │   ├── code-quality/       # Testing, hygiene, token efficiency
│   │   ├── frontend/           # React, accessibility patterns
│   │   ├── infrastructure/     # Deployment, security, state management
│   │   ├── languages/          # Go, JavaScript, Python, Shell, TypeScript
│   │   ├── marketing/          # Content, CRO, growth, SEO strategies
│   │   ├── ralph/              # Ralph loop architecture patterns
│   │   └── websites/           # Web design and development patterns
│   ├── playbooks/              # Step-by-step operational guides
│   ├── projects/               # Project-specific conventions
│   └── self-improvement/       # GAP_BACKLOG, SKILL_BACKLOG, SKILL_TEMPLATE
│
├── templates/                   # Project bootstrapping templates
│   ├── ralph/                  # Ralph loop template (core files)
│   ├── backend/                # Backend project templates
│   ├── cortex/                 # Cortex manager templates
│   ├── go/                     # Go project templates
│   ├── javascript/             # JavaScript project templates
│   ├── python/                 # Python project templates
│   └── website/                # Website project templates
│
├── workers/                     # Worker agents (executors)
│   ├── workers/IMPLEMENTATION_PLAN.md  # Shared worker tasks
│   ├── workers/PLAN_DONE.md            # Completed planning phases
│   ├── .verify/                # Worker-level verification
│   ├── shared/                 # Shared worker utilities
│   │   ├── cache.sh            # Caching utilities
│   │   ├── common.sh           # Common functions
│   │   ├── filter_acli_errors.sh # Error filtering
│   │   └── verifier_common.sh  # Verification utilities
│   ├── ralph/                  # Ralph self-improvement worker
│   │   ├── AGENTS.md           # Ralph operational guide
│   │   ├── NEURONS.md          # Ralph codebase map
│   │   ├── THOUGHTS.md         # Ralph tactical notes
│   │   ├── workers/ralph/THUNK.md            # Ralph completion log
│   │   ├── PROMPT.md           # Ralph agent instructions (protected)
│   │   ├── VALIDATION_CRITERIA.md # Quality gates
│   │   ├── loop.sh             # Ralph execution loop (protected)
│   │   ├── verifier.sh         # Acceptance criteria checker (protected)
│   │   ├── ralph.sh            # Ralph CLI wrapper
│   │   ├── current_ralph_tasks.sh # Task monitor
│   │   ├── thunk_ralph_tasks.sh # THUNK monitor
│   │   ├── fix-markdown.sh     # Markdown auto-fixer
│   │   ├── init_verifier_baselines.sh # Baseline initializer
│   │   ├── cleanup_plan.sh     # Plan cleanup utility
│   │   ├── update_thunk_from_plan.sh # Plan-THUNK sync
│   │   ├── render_ac_status.sh # AC status renderer
│   │   ├── new-project.sh      # Project bootstrapper
│   │   ├── pr-batch.sh         # Batch PR creator
│   │   ├── sync_workers_plan_to_cortex.sh # Cortex sync
│   │   ├── artifacts/          # Ralph artifacts
│   │   ├── config/             # Ralph configuration
│   │   ├── docs/               # Ralph documentation
│   │   ├── logs/               # Ralph execution logs
│   │   ├── tests/              # Ralph test suite
│   │   ├── .maintenance/       # Maintenance utilities
│   │   └── .verify/            # Ralph verification
│   └── cerebras/               # Cerebras worker (alternative LLM)
│       ├── AGENTS.md           # Cerebras operational guide
│       ├── NEURONS.md          # Cerebras codebase map
│       ├── THOUGHTS.md         # Cerebras tactical notes
│       ├── workers/ralph/THUNK.md            # Cerebras completion log
│       ├── PROMPT.md           # Cerebras instructions (protected)
│       ├── VALIDATION_CRITERIA.md # Quality gates
│       ├── ENHANCEMENT_PLAN.md # Cerebras enhancements
│       ├── loop.sh             # Cerebras execution loop
│       ├── verifier.sh         # Acceptance criteria checker
│       ├── cerebras_agent.py   # Cerebras Python agent
│       ├── current_cerebras_tasks.sh # Task monitor
│       ├── thunk_cerebras_tasks.sh # THUNK monitor
│       ├── config/             # Cerebras configuration
│       ├── docs/               # Cerebras documentation
│       ├── logs/               # Cerebras execution logs
│       └── .verify/            # Cerebras verification
│
├── cortex/                      # Manager agent (strategic planning)
│   ├── AGENTS.md               # Cortex operational guide
│   ├── NEURONS.md              # Cortex codebase map
│   ├── THOUGHTS.md             # Cortex strategic notes
│   ├── DECISIONS.md            # Strategic decisions log
│   ├── workers/IMPLEMENTATION_PLAN.md  # Cortex planning queue
│   ├── workers/PLAN_DONE.md            # Completed cortex plans
│   ├── cortex.bash             # Cortex execution script
│   ├── ralph.sh                # Ralph delegation script
│   ├── one-shot.sh             # One-shot task executor
│   ├── snapshot.sh             # Repository snapshot utility
│   ├── sync_gaps.sh            # Gap synchronization
│   ├── cleanup_cortex_plan.sh  # Plan cleanup utility
│   ├── CORTEX_SYSTEM_PROMPT.md # Cortex system prompt
│   ├── analysis/               # Analysis and planning documents
│   ├── docs/                   # Cortex-specific documentation
│   └── projects/               # Project-specific planning
│
├── docs/                        # Repository-wide documentation
│   ├── BOOTSTRAPPING.md        # New project setup guide
│   ├── CHANGES.md              # Change log and history
│   ├── HISTORY.md              # Historical context and decisions
│   ├── REFERENCE_SUMMARY.md    # Quick reference guide
│   ├── TOOLS.md                # CLI tools documentation
│   ├── events.md               # Event system documentation
│   ├── CACHE_DESIGN.md         # Cache system design
│   ├── EDGE_CASES.md           # Edge cases and recovery
│   ├── HASH_VALIDATION.md      # Hash validation system
│   ├── MARKER_SCHEMA.md        # Marker schema documentation
│   ├── QUALITY_GATES.md        # Quality gate definitions
│   ├── TEST_SCENARIOS.md       # Test scenario catalog
│   ├── CODERABBIT_*.md         # CodeRabbit analysis reports
│   └── brain-map/              # Brain-map specific docs
│       ├── brain-map-spec.md
│       ├── brain-map-implementation-plan.md
│       └── brain-map-v2-enhancements.md
│
├── rules/                       # Quality gates and acceptance criteria
│   ├── AC.rules                # Automated acceptance criteria (protected)
│   ├── AC-hygiene-additions.rules  # Additional hygiene rules
│   └── MANUAL_APPROVALS.rules  # Manual review gates
│
├── tests/                       # Repository-level tests
│   └── unit/                   # Unit test suite
│       ├── brain-event.bats    # Brain event tests
│       └── README.md           # Test documentation
│
├── tools/                       # Development and analysis tools
│   ├── check_startup_rules.sh  # Startup validation
│   ├── skill_freshness.sh      # Skill freshness checker
│   ├── thunk_dedup.sh          # THUNK deduplication
│   ├── thunk_parser.py         # THUNK parser (Python)
│   ├── validate_doc_sync.sh    # Documentation sync validator
│   ├── validate_examples.py    # Code example validator
│   ├── validate_links.sh       # Link validation
│   ├── validate_protected_hashes.sh # Hash guard validator
│   ├── test_*.sh               # Various test utilities
│   ├── thread_storage_schema.sql # Thread storage schema
│   ├── brain_dashboard/        # Brain metrics dashboard
│   ├── gap_radar/              # Gap detection system
│   ├── pattern_miner/          # Pattern mining tools
│   ├── rollflow_analyze/       # Rollflow analysis framework
│   ├── skill_graph/            # Skill dependency graph
│   └── skill_quiz/             # Skill quiz generator
│
└── .verify/                     # Verification and hash guards
    ├── ac.sha256               # AC.rules hash baseline (protected)
    ├── agents.sha256           # AGENTS.md hash baseline (protected)
    ├── loop.sha256             # loop.sh hash baseline (protected)
    ├── prompt.sha256           # PROMPT.md hash baseline (protected)
    ├── verifier.sha256         # verifier.sh hash baseline (protected)
    ├── latest.txt              # Last verifier run output
    ├── run_id.txt              # Current run identifier
    ├── approve_waiver_totp.py  # Waiver approval utility
    ├── check_waiver.sh         # Waiver checker
    ├── launch_approve_waiver.sh # Waiver launcher
    ├── request_waiver.sh       # Waiver request utility
    ├── notify_human.sh         # Human notification script
    └── waiver_requests/        # Pending waiver requests
```

## File Counts

- **Markdown files:** 387
- **Shell scripts:** 77
- **Python files:** 40+ (excluding .venv)
- **Total files:** 6,589
- **Total directories:** 449 (excluding .git, .venv, node_modules, caches)

## Key Files by Purpose

### Strategic Documents

- `THOUGHTS.md` - What we're achieving (mission, goals, metrics)
- `README.md` - How to use the brain (onboarding)
- `workers/IMPLEMENTATION_PLAN.md` - What we're working on (tasks)

### Navigation & Context

- `NEURONS.md` - Where things are (this file)
- `skills/SUMMARY.md` - Skills overview and hotlist
- `skills/index.md` - Skill catalog

### Protected Files (Hash-Guarded)

- `rules/AC.rules` - Quality gates
- `workers/ralph/loop.sh` - Ralph execution loop
- `workers/ralph/verifier.sh` - Acceptance criteria checker
- `workers/ralph/PROMPT.md` - Ralph agent instructions
- `.verify/*.sha256` - Hash baselines for protected files

### Self-Improvement System

- `skills/self-improvement/skills/self-improvement/GAP_BACKLOG.md` - Identified knowledge gaps
- `skills/self-improvement/SKILL_BACKLOG.md` - Skills to create
- `workers/ralph/workers/ralph/THUNK.md` - Completed tasks log

## Domain Coverage

### Backend

- API design patterns
- Authentication patterns
- Caching strategies
- Database patterns
- Error handling

### Code Quality

- Code consistency
- Code hygiene
- Markdown patterns
- Testing patterns
- Token efficiency

### Infrastructure

- Deployment patterns
- Security patterns
- State management

### Languages

- Go patterns
- JavaScript/TypeScript patterns
- Python patterns
- Shell scripting (cleanup, strict mode, variable patterns)

### Ralph Loop

- Bootstrap patterns
- Change propagation
- Ralph architecture patterns

### Marketing

- Content strategy (copywriting, email, social)
- CRO (A/B testing, forms, signup flows, paywalls)
- Growth (analytics, referrals, paid ads, free tools)
- SEO (programmatic SEO, schema markup, audits)
- Strategy (competitor analysis, launches, pricing, psychology)

### Websites

- Architecture (section composer, sitemap builder, tech stack)
- Copywriting (CTA, objection handling, value proposition)
- Design (color system, typography, spacing)
- Discovery (audience mapping, requirements, scope control)
- QA (acceptance criteria, accessibility, visual QA)
- Launch (deployment, finishing pass)

## "I need to..." Quick Lookup

| Task                       | Start Here                                                   |
|----------------------------|--------------------------------------------------------------|
| Find a skill pattern | `skills/SUMMARY.md` → `skills/index.md` |
| Bootstrap new project | `docs/BOOTSTRAPPING.md` → `templates/` |
| Understand Ralph loop | `workers/ralph/AGENTS.md` → `skills/domains/ralph/` |
| Check acceptance criteria | `rules/AC.rules` (read only) |
| Review verifier output | `.verify/latest.txt` |
| See completed work | `workers/ralph/workers/ralph/THUNK.md` |
| Understand brain mission | `THOUGHTS.md` |
| Get started (human) | `README.md` |
| Add new skill | `skills/self-improvement/skills/self-improvement/GAP_BACKLOG.md` |
| **Use CLI tools** | **`docs/TOOLS.md`** → bin/, tools/ |
| Search THUNK/git quickly | `bin/brain-search "keyword"` |
| Get THUNK stats | `bin/thunk-parse --stats` |

## Manager vs Worker Architecture

The brain repository follows Option B structure (worker-in-repo):

### Cortex (Manager)

- **Location:** `cortex/`
- **Role:** Strategic planning, coordination, analysis
- **Files:** AGENTS.md, NEURONS.md, THOUGHTS.md, workers/IMPLEMENTATION_PLAN.md
- **Scope:** Multi-project orchestration, resource allocation

### Ralph (Worker)

- **Location:** `workers/ralph/`
- **Role:** Tactical execution, self-improvement loop
- **Files:** AGENTS.md, NEURONS.md, THOUGHTS.md, workers/IMPLEMENTATION_PLAN.md, workers/ralph/THUNK.md
- **Scope:** Brain repository maintenance and improvement

### Brain Root

- **Location:** `/` (root)
- **Role:** Overall repository vision and structure
- **Files:** THOUGHTS.md, NEURONS.md, AGENTS.md, README.md
- **Scope:** Repository-wide mission, goals, templates

## Validation Commands

```bash
# Check repository structure
tree -L 2 -d .

# Count files by type
find . -name "*.md" | wc -l
find . -name "*.sh" | wc -l
find . -name "*.py" | wc -l

# Verify protected files (should show matches)
ls -la rules/AC.rules workers/ralph/{loop,verifier}.sh workers/ralph/PROMPT.md

# Check hash guards exist
ls -la .verify/*.sha256

# View last verifier run
cat .verify/latest.txt

# Check for stale TODOs
rg -i "TODO|FIXME|XXX" --type md | head -20

# Verify skills catalog up-to-date
find skills/domains -name "*.md" | wc -l
grep -c "^- \[" skills/index.md
```

## Navigation Tips

1. **Start with SUMMARY.md** - Get overview before diving into specific skills
2. **Use index.md** - Catalog of all skills with descriptions
3. **Check THOUGHTS.md** - Understand context and current phase
4. **Read AGENTS.md** - Get operational guidance
5. **Follow hotlist** - `skills/SUMMARY.md` links most-used patterns

## Common Workflows

### Adding a New Skill

1. Capture gap in `skills/self-improvement/skills/self-improvement/GAP_BACKLOG.md`
2. Promote to `SKILL_BACKLOG.md` when clear
3. Create skill file in appropriate `skills/domains/` subdirectory
4. Update `skills/index.md` with new entry
5. Add to hotlist in `skills/SUMMARY.md` if frequently used

### Bootstrapping a New Project

1. Read `docs/BOOTSTRAPPING.md`
2. Choose template from `templates/` (ralph, backend, python, etc.)
3. Copy template to new project location
4. Run `scripts/new-project.sh` (Brain operator workflow)
5. Customize AGENTS.md, NEURONS.md, THOUGHTS.md for project

### Running Ralph Loop on Brain

1. Navigate to `workers/ralph/`
2. Check `AGENTS.md` for prerequisites
3. Run `bash loop.sh` for single iteration
4. Monitor with `bash current_ralph_tasks.sh`
5. View completed work in `workers/ralph/THUNK.md`

### Checking Verifier Status

1. Read `.verify/latest.txt` for pass/fail/warn
2. If FAIL: Fix issues before continuing
3. If WARN: Add to workers/IMPLEMENTATION_PLAN.md Phase 0-Warn section
4. Protected file changes: Requires human intervention

## Workspace Boundaries

Ralph has **full access** to entire brain repository from root (`/home/grafe/code/brain`):

| Access Level               | Paths                                                                                                 | Notes                                |
|----------------------------|-------------------------------------------------------------------------------------------------------|--------------------------------------|
| **Full access** | `skills/`, `templates/`, `cortex/`, `docs/`, `workers/` | Read, write, create, delete |
| **Protected** | `rules/AC.rules`, `workers/ralph/verifier.sh`, `workers/ralph/loop.sh`, `workers/ralph/PROMPT.md` | Read only - hash-guarded |
| **Protected** | `.verify/*.sha256` | Baseline hashes - human updates |
| **Forbidden** | `.verify/waivers/*.approved` | OTP-protected - cannot read/write |

## See Also

- **[workers/ralph/NEURONS.md](workers/ralph/NEURONS.md)** - Ralph worker codebase map (tactical view)
- **[cortex/NEURONS.md](cortex/NEURONS.md)** - Cortex manager codebase map (strategic view)
- **[README.md](README.md)** - Human-readable onboarding guide
- **[AGENTS.md](AGENTS.md)** - Agent operational guide
- **[THOUGHTS.md](THOUGHTS.md)** - Strategic vision and goals
- **[skills/SUMMARY.md](skills/SUMMARY.md)** - Skills knowledge base overview
- **[skills/domains/ralph/ralph-patterns.md](skills/domains/ralph/ralph-patterns.md)** - Ralph loop architecture
- **[docs/TOOLS.md](docs/TOOLS.md)** - CLI tools and utilities reference

## Version History

| Date       | Changes                                                       |
|------------|---------------------------------------------------------------|
| 2026-01-28 | Added scripts/ and state/ directories; updated file counts to 387 MD, 77 shell, 6,589 total files, 449 directories |
| 2026-01-22 | Initial creation - mapped brain repository structure         |
