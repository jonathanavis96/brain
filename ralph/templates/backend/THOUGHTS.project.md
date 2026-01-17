# THOUGHTS.md - [PROJECT_NAME] Vision

[REPLACE: Brief tagline describing your API/backend service in one sentence]

## What This Project Does

[REPLACE: Describe your backend service's purpose. What problem does it solve? Who/what consumes it? What value does it provide?]

Example structure:
- **Primary Goal:** [Main objective - e.g., "Provide authentication and user management API"]
- **Key Features:** [List 3-5 main API capabilities or services]
- **Target Consumers:** [Who/what uses this API - frontend apps, other services, external clients]
- **Integration Points:** [External services, databases, message queues, etc.]

## Current Goals

### Active Focus

[REPLACE: What is the backend currently working on? What's the immediate priority?]

Example:
- New API endpoint implementation (e.g., POST /api/v1/orders)
- Performance optimization (e.g., database query tuning, caching layer)
- Authentication/authorization enhancement
- Integration with external service X
- Migration to new infrastructure/framework

### Definition of Done

[REPLACE: Define what "complete" means for backend features. Be specific and measurable.]

A task/feature in this project is complete when:

#### ✅ Functionality
- API endpoint works as specified in requirements
- Handles all expected input cases
- Proper error handling for invalid inputs
- Edge cases handled appropriately
- Returns correct status codes and response formats

#### ✅ Testing
- Unit tests written and passing (>80% coverage on business logic)
- Integration tests cover API endpoints end-to-end
- Error scenarios tested (4xx, 5xx responses)
- Authentication/authorization tested
- Load/performance testing completed (if applicable)

#### ✅ Code Quality
- Follows framework-specific best practices
- Business logic separated from HTTP layer
- Error handling consistent across endpoints
- Code reviewed (if team project)
- Linting/formatting passes
- No secrets in code or logs

#### ✅ Documentation
- API endpoint documented (OpenAPI/Swagger or equivalent)
- Request/response examples provided
- Error responses documented
- README.md updated if setup changes
- NEURONS.md updated if structure changes

#### ✅ Security & Performance
- Input validation at API boundary
- Authentication/authorization enforced
- SQL injection/XSS prevention verified
- Rate limiting implemented (if needed)
- Response times meet requirements (<200ms for typical requests)
- Database queries optimized (no N+1 problems)

#### ✅ Deployment
- Environment variables documented
- Database migrations applied
- Health check endpoint working
- Logging configured properly
- Monitoring/metrics exposed

## Success Metrics

[REPLACE: How do you measure if this backend service is successful? Define quantifiable metrics.]

This project is successful when:

1. **Reliability** - [Specific measurable outcome, e.g., "99.9% uptime", "Zero data loss"]
2. **Performance** - [Specific measurable outcome, e.g., "P95 response time <200ms", "Handles 1000 req/sec"]
3. **API Quality** - [Specific measurable outcome, e.g., "All endpoints documented", "<1% error rate"]
4. **Test Coverage** - [Specific measurable outcome, e.g., ">80% code coverage", "100% critical path coverage"]
5. **Developer Experience** - [Specific measurable outcome, e.g., "Local setup in <5 min", "Clear error messages"]

## Source Code Definition

[REPLACE: Define what counts as "source code" vs reference materials in your backend project]

For this project, "source code" means:

- **`src/` or `app/`** - Main application code (routes, controllers, services, models)
- **`tests/`** - Test suite (unit, integration, e2e)
- **`migrations/`** - Database schema migrations
- **`config/`** - Configuration files and setup
- **`scripts/`** - Deployment and utility scripts

**NOT source code:**
- `node_modules/` or `venv/` - Dependencies (generated)
- `dist/`, `build/`, `target/` - Build artifacts (generated)
- `logs/` - Runtime logs (generated)
- `.env` - Local environment variables (not committed)
- `coverage/` - Test coverage reports (generated)

## Knowledge Base Integration

[REPLACE: How does this project use the brain repository's knowledge base?]

This project references brain repository knowledge:

- **API Design Patterns:** `../../brain/kb/domains/api-design-patterns.md` - RESTful conventions, versioning, pagination
- **Caching Patterns:** `../../brain/kb/domains/caching-patterns.md` - Redis, in-memory caching strategies
- **Auth Patterns:** `../../brain/kb/domains/auth-patterns.md` - JWT, OAuth2, session management
- **Testing Patterns:** `../../brain/kb/domains/testing-patterns.md` - Test organization and strategies
- **Project Learnings:** `../../brain/kb/projects/[this-project-slug].md` - Project-specific patterns

## Technical Context

[REPLACE: Key technical decisions, architecture choices, or constraints]

### Technology Stack
- **Language:** [e.g., TypeScript (Node.js), Python, Go, Java]
- **Framework:** [e.g., Express, FastAPI, Gin, Spring Boot]
- **Database:** [e.g., PostgreSQL, MongoDB, MySQL]
- **Caching:** [e.g., Redis, Memcached] (if applicable)
- **Message Queue:** [e.g., RabbitMQ, Kafka, SQS] (if applicable)
- **Infrastructure:** [e.g., Docker, Kubernetes, AWS Lambda, Heroku]

### Architecture Decisions
- [Key decision 1 and rationale, e.g., "RESTful API over GraphQL for simplicity and caching"]
- [Key decision 2 and rationale, e.g., "PostgreSQL for ACID compliance and relational data"]
- [Key decision 3 and rationale, e.g., "JWT tokens for stateless authentication"]
- [Key decision 4 and rationale, e.g., "Layered architecture: routes → services → repositories"]

### API Design Principles
- **Versioning:** [e.g., "URL-based: /api/v1/resource"]
- **Authentication:** [e.g., "JWT Bearer tokens"]
- **Error Format:** [e.g., "JSON with error code, message, details"]
- **Pagination:** [e.g., "Limit/offset or cursor-based"]
- **Rate Limiting:** [e.g., "100 requests per minute per API key"]

### Constraints
- [Technical constraint 1, e.g., "Must support 1000 concurrent connections"]
- [Technical constraint 2, e.g., "Response time <200ms for 95th percentile"]
- [Technical constraint 3, e.g., "Must integrate with legacy system via REST"]
- [Business constraint 1, e.g., "PCI DSS compliance required for payment data"]

### Deployment & Operations
- **Environment Variables:** [List critical env vars, e.g., DATABASE_URL, API_KEY, JWT_SECRET]
- **Health Checks:** [Endpoint for health monitoring, e.g., GET /health]
- **Logging:** [Logging strategy, e.g., "Structured JSON logs to stdout"]
- **Monitoring:** [Monitoring tools, e.g., "Prometheus metrics at /metrics"]
- **Database Migrations:** [Migration tool, e.g., "Knex migrations", "Alembic", "Flyway"]
