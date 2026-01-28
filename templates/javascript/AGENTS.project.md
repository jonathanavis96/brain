# Project Guidance for AI Agents

## Knowledge Base (MUST USE)

### Progressive Disclosure: Always Read in This Order

**ALWAYS start here:**

1. `./brain/skills/SUMMARY.md` - Knowledge base overview and usage guide
2. `./brain/skills/domains/` - Domain-specific patterns (caching, API design, auth, testing, etc.)

**When working with specific technologies:**
3. `./brain/skills/` - Technology-specific best practices and patterns

**For project-specific patterns:**
4. `./brain/skills/projects/<project-slug>.md` - Project-specific conventions discovered in this codebase

### Why This Order Matters

- **Token efficiency**: Start with summaries, drill down only when needed
- **Faster results**: Targeted knowledge lookup vs scanning everything
- **Avoid overwhelm**: Read specific docs only when task requires them

## Knowledge Growth Rule (Mandatory)

When you discover a new convention, architectural decision, or project-specific pattern:

1. **Create a skill file** in the brain repo:
   - Project-specific: `./brain/skills/projects/<project-slug>.md`
   - Domain/cross-project: `./brain/skills/domains/<domain>.md`

2. **Update the index**: Add a link in `./brain/skills/SUMMARY.md`

3. **Structure new skill files** with:

   ```markdown
   # [Title]
   
   ## Why This Exists
   [Explain the problem this solves or decision rationale]
   
   ## When to Use It
   [Specific scenarios or conditions for applying this knowledge]
   
   ## Details
   [The actual knowledge, patterns, conventions, etc.]
   ```

## Parallelism Rule

**Reading/searching/spec review**: Use up to **100 parallel subagents** for maximum efficiency

- File reading, searching, spec analysis, documentation review
- Gathering context from multiple sources simultaneously

**Build/tests/benchmarks**: Use exactly **1 agent**

- Running build commands, executing tests, benchmarks
- Making file modifications and commits

## Core Principles

### Before Making Changes

1. **Search the codebase** - Don't assume anything is missing; search first
2. **Read targeted knowledge** - Follow the hierarchy: SUMMARY → domain docs → specific files
3. **Check existing patterns** - Look for established conventions in the codebase before inventing new ones

### Code Quality (JavaScript/TypeScript-Specific)

- Follow ESLint rules and Prettier formatting
- Use TypeScript for type safety when possible
- Prefer `const` over `let`, avoid `var`
- Use modern ES6+ features (arrow functions, destructuring, spread/rest)
- Write clear JSDoc comments for complex functions
- Use async/await over raw promises for readability
- Handle errors explicitly (try/catch blocks)

### Project Structure (JavaScript/TypeScript Conventions)

- Keep source code in `src/` directory
- Place tests alongside source files or in `__tests__/` directories
- Use `package.json` for dependencies and scripts
- Configure ESLint (`.eslintrc.js`) and Prettier (`.prettierrc`)
- Document setup and usage in `README.md`
- Keep project goals and vision in `THOUGHTS.md`
- Maintain `workers/IMPLEMENTATION_PLAN.md` as a prioritized task list

### JavaScript/TypeScript Best Practices

- Use ES modules (`import`/`export`) over CommonJS when possible
- Prefer functional programming patterns (pure functions, immutability)
- Use template literals for string interpolation
- Leverage array methods (`map`, `filter`, `reduce`) over imperative loops
- Use object/array destructuring for cleaner code
- Avoid callback hell - use promises or async/await
- Use strict equality (`===`) over loose equality (`==`)
- Handle null/undefined explicitly

### Testing (JavaScript/TypeScript)

- **Jest**: Preferred for most JavaScript/TypeScript projects
- **Vitest**: Fast alternative for Vite-based projects
- **Testing Library**: For React/Vue component testing
- Write unit tests for business logic
- Write integration tests for API endpoints
- Use mocks/stubs for external dependencies
- Run tests before committing: `npm test` or `yarn test`

## Environment Prerequisites

- **Environment:** WSL (Windows Subsystem for Linux) on Windows 11 with Ubuntu
- **Shell:** bash (comes with WSL Ubuntu)
- **Node.js:** LTS version (check with `node --version`)
- **Package Manager:** npm or yarn
- **Atlassian CLI:** `acli` - <https://developer.atlassian.com/cloud/cli/>
- **RovoDev:** `acli rovodev auth && acli rovodev usage site`

### WSL/Windows 11 Specifics

- Working directory: `/mnt/c/...` or `/home/...` depending on where repository is cloned
- Git line endings: Use `core.autocrlf=input` to avoid CRLF issues
- File permissions: WSL handles Unix permissions on Windows filesystem
- Path separators: Use Unix-style `/` paths (WSL translates automatically)

## Ralph Integration

This project uses the Ralph Wiggum iterative loop for systematic development:

- **Single unified prompt**: See `workers/ralph/PROMPT.md` (determines mode from iteration number)
- **Progress tracking**: All work logged in `workers/ralph/progress.txt`
- **Completion**: Look for `:::COMPLETE:::` sentinel

## RovoDev + CLI Guardrails

When working with RovoDev and Atlassian CLI:

- **Always run repo scripts with bash** in WSL2/Linux environment
- **If Ralph/RovoDev appears to "hang" or "wait"**, first run:
  - `acli rovodev auth status`
  - `acli rovodev usage site` (select a valid site if prompted)
  - then retry
- **Don't assume the correct site is the one open in the browser** - rely on CLI-selected site
- **If a command needs interactivity**, the agent must clearly tell the user what input/action is required
- **Avoid long-running background watchers/polling** unless the user explicitly wants it - prefer short, bounded runs

### Secrets and Tokens

- **Never paste API tokens, secrets, or credentials** into logs, markdown, or console output
- Use placeholders like `PASTE_TOKEN_HERE` and instruct the user to provide them locally

## Package Management

### npm vs yarn

Both are supported. Choose one and stick with it throughout the project:

```bash
# npm
npm install              # Install dependencies
npm install <package>    # Add dependency
npm install -D <package> # Add dev dependency
npm run <script>         # Run script from package.json

# yarn
yarn                     # Install dependencies
yarn add <package>       # Add dependency
yarn add -D <package>    # Add dev dependency
yarn <script>            # Run script from package.json
```

### Common Scripts

Standard `package.json` scripts:

- `dev` or `start`: Start development server
- `build`: Production build
- `test`: Run tests
- `lint`: Run linter
- `format`: Run Prettier

## Project-Specific Notes

[Add project-specific conventions, architecture decisions, and patterns here]
