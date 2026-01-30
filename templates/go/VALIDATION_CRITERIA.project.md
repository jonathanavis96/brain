# Validation Criteria - Go Project

## Purpose

This document defines the quality gates and validation commands for this project. All changes must pass these checks before being committed.

## Pre-Commit Checklist

- [ ] All linter warnings resolved
- [ ] All tests passing
- [ ] Code formatted with `gofmt`
- [ ] Imports organized with `goimports`
- [ ] No unused variables or imports
- [ ] All errors explicitly handled
- [ ] Dependencies tidied (`go.mod` and `go.sum` up to date)

## Validation Commands

### Formatting

```bash
# Format all Go files
go fmt ./...

# Organize imports
goimports -w .

# Alternative: use gofumpt for stricter formatting
gofumpt -l -w .
```

**Expected Output:** All files formatted correctly (no output from `go fmt`)

### Linting

```bash
# Run golangci-lint (comprehensive)
golangci-lint run

# Run specific linters
golangci-lint run --enable-all

# Run with auto-fix where possible
golangci-lint run --fix
```

**Expected Output:** 0 errors, 0 warnings

Common linters checked by golangci-lint:

- `errcheck` - Unchecked errors
- `gosimple` - Simplification suggestions
- `govet` - Suspicious constructs
- `ineffassign` - Ineffectual assignments
- `staticcheck` - Static analysis
- `unused` - Unused code

### Vet (Built-in Static Analysis)

```bash
# Run go vet
go vet ./...
```

**Expected Output:** No issues found

### Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Generate coverage report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Run tests with race detector
go test -race ./...

# Run tests verbosely
go test -v ./...

# Run specific test
go test -run TestFunctionName ./path/to/package
```

**Expected Output:** All tests passing, >80% coverage on critical paths

### Build

```bash
# Build application
go build -o bin/app cmd/app/main.go

# Build all binaries
go build ./cmd/...

# Check for build errors without creating binary
go build -o /dev/null ./...
```

**Expected Output:** Build completes without errors

### Module Management

```bash
# Verify dependencies
go mod verify

# Tidy dependencies (remove unused, add missing)
go mod tidy

# Check for outdated dependencies
go list -u -m all

# Vendor dependencies (if using vendor/)
go mod vendor
```

**Expected Output:** All dependencies verified, `go.mod` and `go.sum` clean

### All Checks Combined

```bash
# Run all validation steps
go fmt ./... && \
goimports -w . && \
golangci-lint run && \
go vet ./... && \
go test ./... && \
go build ./cmd/...
```

Or create a `Makefile`:

```makefile
.PHONY: validate
validate: fmt lint vet test build

.PHONY: fmt
fmt:
	go fmt ./...
	goimports -w .

.PHONY: lint
lint:
	golangci-lint run

.PHONY: vet
vet:
	go vet ./...

.PHONY: test
test:
	go test -cover ./...

.PHONY: build
build:
	go build -o bin/app cmd/app/main.go
```

Then run: `make validate`

## Code Quality Standards

### golangci-lint Configuration

Key rules to enforce (in `.golangci.yml`):

- **errcheck**: Check for unchecked errors
- **gosimple**: Suggest code simplifications
- **govet**: Detect suspicious constructs
- **ineffassign**: Detect ineffectual assignments
- **staticcheck**: Advanced static analysis
- **unused**: Find unused constants, variables, functions
- **gocyclo**: Check cyclomatic complexity (max 15)
- **gofmt**: Ensure consistent formatting
- **misspell**: Check for common misspellings

### Go Standards

- Follow [Effective Go](https://golang.org/doc/effective_go) guidelines
- Follow [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- Use standard library when possible
- Keep functions small (< 50 lines ideal)
- Limit cyclomatic complexity (< 15)
- Handle all errors explicitly
- Avoid global mutable state

### Error Handling Standards (Critical)

```go
// ✅ GOOD: Always check and wrap errors
result, err := doSomething()
if err != nil {
    return fmt.Errorf("doing something: %w", err)
}

// ❌ BAD: Ignoring errors
result, _ := doSomething()

// ✅ GOOD: Error wrapping preserves stack trace
if err := validateInput(data); err != nil {
    return fmt.Errorf("input validation failed for %s: %w", data.Name, err)
}
```

### Testing Standards

- Unit test coverage >80% for business logic
- Table-driven tests for multiple scenarios
- Use `t.Helper()` in test helper functions
- Mock external dependencies using interfaces
- Use `testify/assert` or `testify/require` for cleaner assertions
- Test both success and error paths
- Use descriptive test names: `TestUserService_CreateUser_DuplicateEmail`

## Continuous Integration Gates

If using CI/CD (GitHub Actions, GitLab CI, etc.), ensure these run on every PR:

1. `go mod download` - Download dependencies
2. `go fmt ./...` - Check formatting
3. `golangci-lint run` - Run linter
4. `go vet ./...` - Static analysis
5. `go test -race -cover ./...` - Run tests with race detector
6. `go build ./cmd/...` - Build all binaries

## Common Validation Failures

| Error | Fix |
|-------|-----|
| `golangci-lint: unused variable 'x'` | Remove unused variable or use it |
| `golangci-lint: Error return value not checked` | Check error with `if err != nil` |
| `go vet: composite literal uses unkeyed fields` | Use keyed fields: `MyStruct{Field1: val1, Field2: val2}` |
| `go test: undefined: SomeFunc` | Import missing package or fix function name |
| `go build: cannot find package` | Run `go mod tidy` to sync dependencies |
| `goimports: imports not organized` | Run `goimports -w .` |

## Project-Specific Validation

[Add custom validation rules and commands specific to this project]

### Example Custom Checks

```bash
# Check for security vulnerabilities
go list -json -m all | nancy sleuth

# Run security linter
gosec ./...

# Check for outdated dependencies
go-mod-outdated
```

## Acceptance Criteria Template

When creating new features/fixes, define acceptance criteria:

```markdown
## Feature: [Feature Name]

### Acceptance Criteria

- [ ] Implementation complete
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests passing
- [ ] No golangci-lint warnings
- [ ] Error handling implemented
- [ ] Documentation updated (GoDoc comments)
- [ ] Manual testing complete
- [ ] Code review approved
```

## See Also

- **AGENTS.md** - AI agent operational guide
- **THOUGHTS.md** - Project goals and success criteria
- **brain/workers/ralph/PROMPT.md** - Ralph loop automation
- **[Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)** - Common review feedback
- **[Effective Go](https://golang.org/doc/effective_go)** - Official style guide
