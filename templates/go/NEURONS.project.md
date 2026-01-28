# NEURONS.md - Project Map

## Purpose

This file provides a structural overview of the project for AI agents and developers. It's automatically maintained to help agents quickly understand the codebase layout.

## Repository Structure

```text
.
├── cmd/                    # Command-line applications
│   └── app/               # Main application
│       └── main.go        # Entry point
├── internal/              # Private application code
│   ├── handlers/          # HTTP handlers
│   ├── models/            # Data models
│   ├── services/          # Business logic
│   └── database/          # Database layer
├── pkg/                   # Public libraries (importable)
│   └── utils/             # Utility functions
├── api/                   # API definitions (OpenAPI, protobuf)
├── configs/               # Configuration files
├── scripts/               # Build and deployment scripts
├── docs/                  # Documentation
├── vendor/                # Vendored dependencies (optional)
├── go.mod                 # Go module definition
├── go.sum                 # Dependency checksums
├── .golangci.yml          # Linter configuration
├── Makefile               # Build automation (optional)
├── .gitignore             # Git ignore patterns
├── README.md              # Project overview and setup
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

### `cmd/`

Application entry points. Each subdirectory is a separate binary:

```text
cmd/
├── api-server/           # REST API server
│   └── main.go
├── worker/               # Background worker
│   └── main.go
└── cli/                  # CLI tool
    └── main.go
```

### `internal/`

Private application code (not importable outside this project):

```text
internal/
├── handlers/             # HTTP request handlers
├── services/             # Business logic layer
├── repository/           # Data access layer
├── models/               # Domain models
├── middleware/           # HTTP middleware
└── config/               # Configuration loading
```

### `pkg/`

Public libraries (can be imported by external projects):

```text
pkg/
├── utils/                # Utility functions
├── logger/               # Logging wrapper
└── errors/               # Custom error types
```

### Tests

Test files live alongside source code:

```text
internal/
├── handlers/
│   ├── user.go
│   └── user_test.go      # Tests for user.go
├── services/
│   ├── auth.go
│   └── auth_test.go      # Tests for auth.go
```

## File Counts

<!-- Auto-generated file counts -->

Run this to update counts:

```bash
echo "- Go source files: $(find . -type f -name '*.go' ! -path './vendor/*' | wc -l)"
echo "- Test files: $(find . -type f -name '*_test.go' | wc -l)"
echo "- Total lines of code: $(find . -name '*.go' ! -path './vendor/*' ! -name '*_test.go' | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')"
```

## Navigation Tips

### Finding Code

```bash
# Search for function definitions
rg "func MyFunction" .

# Find struct definitions
rg "type MyStruct struct" .

# Find interface implementations
rg "func.*\(.*\*MyType\).*Method" .

# Find all imports of a package
rg "import.*\"github.com/your/package\"" .
```

### Common Patterns

- **Entry point**: `cmd/app/main.go` or `main.go`
- **Config files**: `configs/` directory or root (`.golangci.yml`, `Makefile`)
- **Environment variables**: `.env` files (gitignored, with `.env.example` committed)
- **Generated code**: Often in `api/` or `internal/generated/` (gitignored)

## Go Project Conventions

### Package Naming

- Use lowercase, single-word package names
- Avoid underscores or mixedCaps
- Package name should match directory name
- `internal/` packages are project-private
- `pkg/` packages are public libraries

### File Organization

- Group related code in packages
- Keep package size manageable (< 15 files ideal)
- One main concept per file
- Test files alongside source (`*_test.go`)
- Use `doc.go` for package documentation

### Import Organization

Go convention for import grouping:

```go
import (
    // Standard library
    "context"
    "fmt"
    "net/http"

    // External dependencies
    "github.com/gorilla/mux"
    "go.uber.org/zap"

    // Internal packages
    "github.com/yourorg/yourproject/internal/handlers"
    "github.com/yourorg/yourproject/internal/services"
)
```

## Build and Run

### Development

```bash
# Run main application
go run cmd/app/main.go

# Run with hot reload (using air or similar)
air

# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...
```

### Production Build

```bash
# Build binary
go build -o bin/app cmd/app/main.go

# Build with optimizations
go build -ldflags="-s -w" -o bin/app cmd/app/main.go

# Cross-compile (example: Linux amd64)
GOOS=linux GOARCH=amd64 go build -o bin/app-linux cmd/app/main.go
```

## Project-Specific Structure

[Add project-specific directory explanations here]

## See Also

- **AGENTS.md** - Operational guide for AI agents
- **THOUGHTS.md** - Project vision and goals
- **README.md** - Setup and usage instructions
- **workers/IMPLEMENTATION_PLAN.md** - Current task backlog
