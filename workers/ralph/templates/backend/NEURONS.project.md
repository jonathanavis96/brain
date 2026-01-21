# NEURONS.md - [PROJECT_NAME] Repository Map

**Purpose:** Quick navigation map of the backend codebase structure. Read on-demand via subagent when you need to locate specific files.

**Last Updated:** [TIMESTAMP]

---

## Project Overview

**Type:** Backend API / Microservice  
**Framework:** [e.g., Express.js, FastAPI, Gin, Spring Boot]  
**Language:** [e.g., TypeScript, Python, Go, Java]

---

## Directory Structure

```
[PROJECT_ROOT]/
├── src/ or app/           # Main application code
│   ├── routes/            # API route definitions
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── models/            # Data models
│   ├── middleware/        # Express/API middleware
│   ├── utils/             # Utility functions
│   └── config/            # Configuration files
├── tests/                 # Test suite
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/          # Test data
├── migrations/            # Database migrations
├── scripts/               # Deployment/utility scripts
├── docs/                  # API documentation
└── ralph/                 # Ralph loop infrastructure
    ├── PROMPT.md
    ├── IMPLEMENTATION_PLAN.md
    └── progress.txt
```

---

## Core Files

### Entry Points
- **`[src/index.ts or app/main.py or cmd/server/main.go]`** - Application entry point, server startup
- **`[src/app.ts or app/__init__.py]`** - App initialization, middleware setup

### Configuration
- **`[.env.example]`** - Environment variable template
- **`[src/config/database.ts or config/settings.py]`** - Database configuration
- **`[src/config/auth.ts or config/security.py]`** - Authentication/authorization config

### API Routes
- **`[src/routes/index.ts or app/routes.py]`** - Main router, route aggregation
- **`[src/routes/users.ts or app/routes/users.py]`** - User management endpoints
- **`[src/routes/auth.ts or app/routes/auth.py]`** - Authentication endpoints
- **`[src/routes/api/v1/*.ts]`** - Versioned API routes

### Business Logic
- **`[src/services/userService.ts or app/services/user_service.py]`** - User business logic
- **`[src/services/authService.ts or app/services/auth_service.py]`** - Authentication logic
- **`[src/services/*.ts]`** - Other domain services

### Data Layer
- **`[src/models/User.ts or app/models/user.py]`** - User model/schema
- **`[src/models/*.ts or app/models/*.py]`** - Other data models
- **`[src/repositories/*.ts or app/repositories/*.py]`** - Database access layer (if using repository pattern)

### Middleware
- **`[src/middleware/auth.ts or app/middleware/auth.py]`** - Authentication middleware
- **`[src/middleware/errorHandler.ts or app/middleware/error_handler.py]`** - Global error handling
- **`[src/middleware/validation.ts or app/middleware/validation.py]`** - Input validation
- **`[src/middleware/logging.ts or app/middleware/logging.py]`** - Request logging

### Utilities
- **`[src/utils/logger.ts or app/utils/logger.py]`** - Logging utility
- **`[src/utils/validator.ts or app/utils/validators.py]`** - Validation helpers
- **`[src/utils/errors.ts or app/utils/errors.py]`** - Custom error classes

---

## Test Files

### Unit Tests
- **`[tests/unit/services/userService.test.ts]`** - Service layer unit tests
- **`[tests/unit/utils/*.test.ts]`** - Utility function tests

### Integration Tests
- **`[tests/integration/routes/users.test.ts]`** - API endpoint tests
- **`[tests/integration/database/*.test.ts]`** - Database integration tests

### Test Setup
- **`[tests/setup.ts or tests/conftest.py]`** - Test configuration
- **`[tests/fixtures/*.json or tests/fixtures.py]`** - Test data

---

## Database

### Migrations
- **`[migrations/001_create_users_table.sql]`** - User table creation
- **`[migrations/*.sql or migrations/versions/*.py]`** - Schema migrations

### Seeds (if applicable)
- **`[seeds/*.sql or seeds/*.py]`** - Initial data seeding

---

## Documentation

### API Documentation
- **`[docs/api.md or docs/openapi.yaml]`** - API endpoint documentation
- **`[docs/authentication.md]`** - Authentication flow documentation
- **`[docs/deployment.md]`** - Deployment guide

### Project Documentation
- **`README.md`** - Project overview, setup instructions
- **`THOUGHTS.md`** - Project vision and goals
- **`AGENTS.md`** - AI agent guidance
- **`VALIDATION_CRITERIA.md`** - Quality gates

---

## Scripts

### Development
- **`[scripts/dev.sh or scripts/dev.py]`** - Start development server
- **`[scripts/seed.sh or scripts/seed.py]`** - Seed database with test data

### Deployment
- **`[scripts/deploy.sh]`** - Deployment automation
- **`[scripts/migrate.sh or scripts/migrate.py]`** - Run database migrations

### Utilities
- **`[scripts/generate-api-key.sh]`** - Generate API keys
- **`[scripts/backup-db.sh]`** - Database backup utility

---

## Configuration Files

### Package Management
- **`[package.json or requirements.txt or go.mod or pom.xml]`** - Dependencies
- **`[package-lock.json or poetry.lock or go.sum]`** - Dependency lock file

### Build & Development
- **`[tsconfig.json or pyproject.toml or Makefile]`** - Build configuration
- **`[.eslintrc or .pylintrc or golangci.yml]`** - Linting configuration
- **`[.prettierrc or .editorconfig]`** - Code formatting

### Infrastructure
- **`[Dockerfile]`** - Docker container definition
- **`[docker-compose.yml]`** - Local development environment
- **`[.github/workflows/*.yml or .gitlab-ci.yml]`** - CI/CD pipelines

---

## Important Patterns

### [API Endpoint Structure]
```
[Describe typical endpoint structure, e.g.:
GET    /api/v1/users       - List users (paginated)
POST   /api/v1/users       - Create user
GET    /api/v1/users/:id   - Get user by ID
PUT    /api/v1/users/:id   - Update user
DELETE /api/v1/users/:id   - Delete user
]
```

### [Error Response Format]
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### [Authentication Flow]
```
[Describe authentication mechanism, e.g.:
1. POST /api/v1/auth/login with credentials
2. Receive JWT token in response
3. Include token in Authorization header: "Bearer <token>"
4. Token validated by middleware on protected routes
]
```

---

## Common Tasks

### Adding a New API Endpoint
1. Create route handler in `[src/routes/]`
2. Implement business logic in `[src/services/]`
3. Add data access in `[src/repositories/ or models/]`
4. Add validation middleware
5. Write integration tests in `[tests/integration/routes/]`
6. Update API documentation in `[docs/]`

### Database Schema Changes
1. Create migration file in `[migrations/]`
2. Update model in `[src/models/]`
3. Run migration: `[command, e.g., npm run migrate]`
4. Update seed data if needed
5. Test migration rollback

### Adding Authentication to Endpoint
1. Import auth middleware
2. Add middleware to route definition
3. Test with valid/invalid tokens
4. Update API docs with auth requirements

---

## Framework-Specific Notes

### [Express.js Projects]
- Middleware executed in order of definition
- Use `express.Router()` for modular routes
- Error handling middleware must have 4 parameters: `(err, req, res, next)`

### [FastAPI Projects]
- Automatic OpenAPI docs at `/docs`
- Use Pydantic models for request/response validation
- Dependency injection via `Depends()`

### [Gin Projects]
- Use `gin.Context` for request/response
- Middleware via `router.Use(middleware())`
- Bind JSON with `c.ShouldBindJSON(&model)`

### [Spring Boot Projects]
- Use `@RestController` for API controllers
- `@Service` for business logic
- `@Repository` for data access
- Exception handling via `@ControllerAdvice`

---

## Notes

- Update this file when adding new directories or significant files
- Keep the structure section accurate as the project evolves
- Document project-specific patterns and conventions
- Link to external documentation for complex features
