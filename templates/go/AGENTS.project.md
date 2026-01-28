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

### Code Quality (Go-Specific)

- Follow `gofmt` and `goimports` formatting standards
- Use `golangci-lint` for comprehensive linting
- Prefer standard library over external dependencies
- Keep functions small and focused (single responsibility)
- Handle errors explicitly - never ignore returned errors
- Use meaningful variable names (no single-letter except loop counters)
- Document exported functions, types, and packages with comments
- Avoid global variables - prefer dependency injection

### Project Structure (Go Conventions)

- Keep source code in project root or `cmd/` for multiple binaries
- Place internal packages in `internal/` (not importable outside project)
- Shared libraries go in `pkg/` (importable by external projects)
- Test files alongside source files (`*_test.go`)
- Use `go.mod` for dependency management
- Document setup and usage in `README.md`
- Keep project goals and vision in `THOUGHTS.md`
- Maintain `workers/ralph/workers/IMPLEMENTATION_PLAN.md` as a prioritized task list

### Go Best Practices

- Use `go fmt` before every commit
- Run `go vet` to catch common mistakes
- Use `golangci-lint` for comprehensive linting
- Follow [Effective Go](https://golang.org/doc/effective_go) guidelines
- Prefer composition over inheritance
- Use interfaces for abstraction (small interfaces are better)
- Avoid premature optimization - clarity first, then optimize
- Use table-driven tests for comprehensive coverage
- Leverage goroutines and channels for concurrency
- Use context for cancellation and timeouts

### Error Handling (Critical)

```go
// ✅ GOOD: Always check errors
result, err := someFunction()
if err != nil {
    return fmt.Errorf("someFunction failed: %w", err)
}

// ❌ BAD: Ignoring errors
result, _ := someFunction()

// ✅ GOOD: Wrap errors with context
if err := doSomething(); err != nil {
    return fmt.Errorf("doing something with %s: %w", name, err)
}
```

### Testing (Go)

- Write tests in `*_test.go` files
- Use `testing` package from standard library
- Use table-driven tests for multiple scenarios
- Mock external dependencies using interfaces
- Run tests before committing: `go test ./...`
- Check coverage: `go test -cover ./...`
- Use `testify` or `assert` packages for cleaner assertions (optional)

## Environment Prerequisites

- **Environment:** WSL (Windows Subsystem for Linux) on Windows 11 with Ubuntu
- **Shell:** bash (comes with WSL Ubuntu)
- **Go:** Latest stable version (check with `go version`)
- **golangci-lint:** Install via `go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest`
- **Atlassian CLI:** `acli` - <https://developer.atlassian.com/cloud/cli/>
- **RovoDev:** `acli rovodev auth && acli rovodev usage site`

### WSL/Windows 11 Specifics

- Working directory: `/mnt/c/...` or `/home/...` depending on where repository is cloned
- Git line endings: Use `core.autocrlf=input` to avoid CRLF issues
- File permissions: WSL handles Unix permissions on Windows filesystem
- Path separators: Use Unix-style `/` paths (WSL translates automatically)
- Go binary location: Ensure `$GOPATH/bin` is in your `$PATH`

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

## Go Module Management

### Dependency Management

```bash
# Initialize module
go mod init github.com/username/project-name

# Add dependency
go get github.com/some/package

# Update dependencies
go get -u ./...

# Tidy up (remove unused, add missing)
go mod tidy

# Vendor dependencies (optional)
go mod vendor
```

### Common Commands

Standard Go commands:

- `go run main.go`: Run the program
- `go build`: Build binary
- `go test ./...`: Run all tests
- `go fmt ./...`: Format all files
- `go vet ./...`: Check for suspicious constructs
- `golangci-lint run`: Run comprehensive linter
- `go mod tidy`: Clean up dependencies

## Project-Specific Notes

[Add project-specific conventions, architecture decisions, and patterns here]
