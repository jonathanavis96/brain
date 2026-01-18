# Project Guidance for AI Agents

## Knowledge Base (MUST USE)

### Progressive Disclosure: Always Read in This Order

**ALWAYS start here:**
1. `../../brain/skills/SUMMARY.md` - Knowledge base overview and usage guide
2. `../../brain/skills/domains/` - Domain-specific patterns (caching, API design, auth, testing, etc.)

**When working with specific technologies:**
3. `../../brain/references/` - Technology-specific best practices and patterns

**For project-specific patterns:**
4. `../../brain/skills/projects/<project-slug>.md` - Project-specific conventions discovered in this codebase

### Why This Order Matters
- **Token efficiency**: Start with summaries, drill down only when needed
- **Faster results**: Targeted knowledge lookup vs scanning everything
- **Avoid overwhelm**: Read specific docs only when task requires them

## Knowledge Growth Rule (Mandatory)

When you discover a new convention, architectural decision, or project-specific pattern:

1. **Create a KB file** in the brain repo:
   - Project-specific: `../../brain/skills/projects/<project-slug>.md`
   - Domain/cross-project: `../../brain/skills/domains/<domain>.md`

2. **Update the index**: Add a link in `../../brain/skills/SUMMARY.md`

3. **Structure new KB files** with:
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

### API Design Best Practices
- Follow RESTful conventions (or GraphQL/gRPC best practices)
- Use proper HTTP status codes (2xx success, 4xx client errors, 5xx server errors)
- Implement consistent error response formats
- Version your APIs (URL versioning or header-based)
- Document endpoints with OpenAPI/Swagger or equivalent
- Implement rate limiting and authentication
- Use pagination for large result sets
- Keep endpoints focused and predictable

### Code Quality
- Write clear, self-documenting code with minimal comments
- Keep functions and handlers small and focused (single responsibility)
- Use dependency injection for testability
- Implement proper error handling and logging
- Follow framework-specific best practices
- Use environment variables for configuration
- Validate all inputs at API boundaries

### Project Structure
- Organize by feature/domain (not by type - controllers/models/views)
- Keep API routes in clear, documented files
- Separate business logic from HTTP/transport layer
- Use middleware for cross-cutting concerns (auth, logging, error handling)
- Keep configuration separate from code
- Document setup and usage in README.md
- Keep project goals and vision in `THOUGHTS.md`
- Maintain `ralph/IMPLEMENTATION_PLAN.md` as a prioritized task list

### Backend-Specific Best Practices
- **Authentication**: Use JWT, OAuth2, or session-based auth consistently
- **Authorization**: Implement role-based or attribute-based access control
- **Validation**: Validate all inputs at the API boundary
- **Error Handling**: Return consistent error formats with useful messages
- **Logging**: Log requests, errors, and important business events
- **Testing**: Unit test business logic, integration test API endpoints
- **Database**: Use connection pooling, prepare statements, handle migrations
- **Caching**: Cache expensive operations, implement cache invalidation
- **Monitoring**: Expose health check and metrics endpoints
- **Security**: Sanitize inputs, use HTTPS, protect against common attacks (CSRF, XSS, SQL injection)

## Ralph Integration

This project uses the Ralph Wiggum iterative loop for systematic development:
- **Single unified prompt**: See `ralph/PROMPT.md` (determines mode from iteration number)
- **Progress tracking**: All work logged in `ralph/progress.txt`
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

## Framework-Specific Notes

### Express.js (Node.js)
- Use async/await for asynchronous operations
- Implement error handling middleware
- Use helmet for security headers
- Structure routes with Router
- Use environment variables via dotenv

### FastAPI (Python)
- Use Pydantic models for request/response validation
- Leverage automatic OpenAPI documentation
- Use dependency injection for database connections
- Implement async endpoints for I/O operations
- Use middleware for cross-cutting concerns

### Gin/Echo (Go)
- Use structured logging
- Implement middleware for common tasks
- Use context for request-scoped values
- Handle errors explicitly
- Use goroutines responsibly for concurrent operations

### Spring Boot (Java)
- Use annotations for configuration
- Implement exception handlers
- Use dependency injection (constructor injection preferred)
- Follow layered architecture (controller → service → repository)
- Use application.properties/yaml for configuration

## Testing Backend APIs

### Unit Testing
- Test business logic in isolation
- Mock external dependencies (databases, APIs, services)
- Test edge cases and error conditions
- Aim for >80% coverage on critical paths

### Integration Testing
- Test full API endpoints with real dependencies
- Use test databases/containers for isolation
- Test authentication and authorization flows
- Verify error responses and status codes

### Common Testing Tools
- **Node.js**: Jest, Supertest, Mocha/Chai
- **Python**: pytest, unittest, httpx (for async)
- **Go**: testing package, httptest, testify
- **Java**: JUnit, Mockito, Spring Test

## Project-Specific Notes

[Add project-specific conventions, architecture decisions, and patterns here]
