# NEURONS.md - Project Map

## Purpose

This file provides a structural overview of the project for AI agents and developers. It's automatically maintained to help agents quickly understand the codebase layout.

## Repository Structure

```text
.
├── src/                    # Source code
├── tests/                  # Test files
├── node_modules/           # Dependencies (gitignored)
├── dist/                   # Build output (gitignored)
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Locked dependency versions (npm)
├── yarn.lock              # Locked dependency versions (yarn)
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
├── tsconfig.json          # TypeScript configuration (if using TypeScript)
├── .gitignore             # Git ignore patterns
├── README.md              # Project overview and setup instructions
├── THOUGHTS.md            # Strategic vision and goals
├── AGENTS.md              # AI agent operational guide
├── NEURONS.md             # This file - project structure map
└── workers/               # Ralph loop infrastructure
    └── ralph/
        ├── PROMPT.md      # Ralph agent prompt
        ├── workers/IMPLEMENTATION_PLAN.md  # Task backlog
        └── workers/ralph/THUNK.md       # Completed task log
```

## Key Directories

### `src/`

Main source code directory. Organize by feature or layer:

```text
src/
├── components/            # UI components (React/Vue)
├── utils/                 # Utility functions
├── api/                   # API client code
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── stores/                # State management (Redux/Zustand/etc)
├── styles/                # CSS/SCSS files
└── index.js               # Entry point
```

### `tests/`

Test files organized to mirror `src/` structure:

```text
tests/
├── unit/                  # Unit tests
├── integration/           # Integration tests
├── e2e/                   # End-to-end tests
└── fixtures/              # Test data and mocks
```

## File Counts

<!-- Auto-generated file counts -->

Run this to update counts:

```bash
echo "- Source files: $(find src -type f -name '*.js' -o -name '*.ts' -o -name '*.jsx' -o -name '*.tsx' | wc -l)"
echo "- Test files: $(find tests -type f -name '*.test.js' -o -name '*.test.ts' -o -name '*.spec.js' -o -name '*.spec.ts' | wc -l)"
echo "- Total lines of code: $(find src -name '*.js' -o -name '*.ts' -o -name '*.jsx' -o -name '*.tsx' | xargs wc -l | tail -1 | awk '{print $1}')"
```

## Navigation Tips

### Finding Code

```bash
# Search for function/component definitions
rg "function myFunction" src/
rg "const MyComponent" src/

# Find imports of a specific module
rg "import.*from.*'./myModule'" src/

# Find all files importing a library
rg "import.*from.*'react'" src/
```

### Common Patterns

- **Entry point**: `src/index.js` or `src/main.js`
- **Config files**: Root directory (`.eslintrc.js`, `.prettierrc`, `tsconfig.json`)
- **Environment variables**: `.env` files (gitignored, with `.env.example` committed)
- **Build output**: `dist/` or `build/` directory (gitignored)

## Project-Specific Structure

[Add project-specific directory explanations here]

## See Also

- **AGENTS.md** - Operational guide for AI agents
- **THOUGHTS.md** - Project vision and goals
- **README.md** - Setup and usage instructions
- **workers/ralph/workers/IMPLEMENTATION_PLAN.md** - Current task backlog
