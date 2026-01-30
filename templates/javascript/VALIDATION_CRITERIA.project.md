# Validation Criteria - JavaScript/TypeScript Project

## Purpose

This document defines the quality gates and validation commands for this project. All changes must pass these checks before being committed.

## Pre-Commit Checklist

- [ ] All linter warnings resolved
- [ ] All tests passing
- [ ] Type checking passes (TypeScript projects)
- [ ] Code formatted with Prettier
- [ ] No console.log statements in production code
- [ ] Dependencies updated in package.json/package-lock.json

## Validation Commands

### Linting

```bash
# Run ESLint
npm run lint
# or
yarn lint

# Auto-fix ESLint issues
npm run lint -- --fix
# or
yarn lint --fix
```

**Expected Output:** 0 errors, 0 warnings

### Formatting

```bash
# Check formatting with Prettier
npm run format:check
# or
npx prettier --check "src/**/*.{js,ts,jsx,tsx}"

# Auto-fix formatting
npm run format
# or
npx prettier --write "src/**/*.{js,ts,jsx,tsx}"
```

**Expected Output:** All files formatted correctly

### Type Checking (TypeScript Only)

```bash
# Run TypeScript compiler in check mode
npm run type-check
# or
npx tsc --noEmit
```

**Expected Output:** 0 errors

### Testing

```bash
# Run all tests
npm test
# or
yarn test

# Run tests with coverage
npm run test:coverage
# or
yarn test:coverage

# Run tests in watch mode (development)
npm run test:watch
# or
yarn test:watch
```

**Expected Output:** All tests passing, >80% coverage on critical paths

### Build

```bash
# Production build
npm run build
# or
yarn build
```

**Expected Output:** Build completes without errors, outputs to `dist/` or `build/`

### All Checks Combined

```bash
# Run all validation steps
npm run validate
# or create this script in package.json:
# "validate": "npm run lint && npm run type-check && npm test && npm run build"
```

## Continuous Integration Gates

If using CI/CD (GitHub Actions, GitLab CI, etc.), ensure these run on every PR:

1. Install dependencies (`npm ci` or `yarn install --frozen-lockfile`)
2. Lint check (`npm run lint`)
3. Type check (`npm run type-check`)
4. Run tests (`npm test`)
5. Build check (`npm run build`)

## Code Quality Standards

### ESLint Rules

Core rules to enforce:

- No unused variables (`no-unused-vars`)
- No console statements in production (`no-console`)
- Prefer const over let (`prefer-const`)
- Require async/await over callbacks (`prefer-promise-reject-errors`)
- Enforce semicolons or not (consistency)

### TypeScript Standards (if applicable)

- Strict mode enabled in `tsconfig.json`
- No implicit `any` types
- Explicit return types on exported functions
- Proper null/undefined handling

### Testing Standards

- Unit test coverage >80% for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Mock external dependencies
- Use descriptive test names (`it('should validate user input correctly')`)

## Project-Specific Validation

[Add custom validation rules and commands specific to this project]

### Example Custom Checks

```bash
# Validate environment variables
npm run check:env

# Check for security vulnerabilities
npm audit

# Check bundle size
npm run analyze
```

## Acceptance Criteria Template

When creating new features/fixes, define acceptance criteria:

```markdown
## Feature: [Feature Name]

### Acceptance Criteria

- [ ] Implementation complete
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] No ESLint warnings
- [ ] TypeScript types defined (if applicable)
- [ ] Documentation updated
- [ ] Manual testing complete
- [ ] Code review approved
```

## Common Validation Failures

| Error | Fix |
|-------|-----|
| ESLint: `'variable' is assigned a value but never used` | Remove unused variable or prefix with `_` if intentionally unused |
| Prettier: `Code style issues found` | Run `npm run format` to auto-fix |
| TypeScript: `Type 'X' is not assignable to type 'Y'` | Add proper type annotations or fix type mismatch |
| Test: `ReferenceError: X is not defined` | Import missing dependency or fix scope issue |
| Build: `Module not found: Can't resolve 'X'` | Install missing package or fix import path |

## See Also

- **AGENTS.md** - AI agent operational guide
- **THOUGHTS.md** - Project goals and success criteria
- **brain/workers/ralph/PROMPT.md** - Ralph loop automation
