# VALIDATION_CRITERIA.md - [PROJECT_NAME] Quality Gates

Last updated: [TIMESTAMP]

## Purpose

This document defines the acceptance criteria and quality standards for the [PROJECT_NAME] backend API. Use these gates to validate that work is complete and production-ready before marking tasks done.

## API Quality Standards

### Endpoint Design

- [ ] **RESTful Conventions**: Endpoints follow REST principles (or GraphQL/gRPC standards)
- [ ] **HTTP Methods**: Proper use of GET, POST, PUT, PATCH, DELETE
- [ ] **Status Codes**: Correct HTTP status codes (200, 201, 400, 401, 403, 404, 500, etc.)
- [ ] **Versioning**: API versioning implemented (e.g., /api/v1/)
- [ ] **Consistency**: Similar endpoints follow consistent patterns
- [ ] **Idempotency**: PUT and DELETE operations are idempotent

### Request/Response

- [ ] **Content-Type**: Proper Content-Type headers (application/json, etc.)
- [ ] **Request Validation**: All inputs validated at API boundary
- [ ] **Response Format**: Consistent JSON structure across endpoints
- [ ] **Error Format**: Standardized error response format
- [ ] **Pagination**: Large result sets properly paginated
- [ ] **Filtering/Sorting**: Query parameters for filtering and sorting (where applicable)

## Code Quality Standards

### General Code Quality

- [ ] **Clean Code**: Functions small and focused (single responsibility)
- [ ] **Naming**: Variables, functions, and classes have clear, descriptive names
- [ ] **No Dead Code**: Unused imports, variables, and functions removed
- [ ] **DRY Principle**: No significant code duplication
- [ ] **Comments**: Complex logic has explanatory comments
- [ ] **Linting**: Code passes linter without errors or warnings

### Architecture

- [ ] **Separation of Concerns**: HTTP layer separated from business logic
- [ ] **Layered Structure**: Clear layers (routes → controllers → services → repositories)
- [ ] **Dependency Injection**: Dependencies injected, not hardcoded
- [ ] **Error Handling**: Centralized error handling mechanism
- [ ] **Configuration**: No hardcoded values, use environment variables

## Testing Standards

### Test Coverage

- [ ] **Unit Tests**: Business logic has unit tests
- [ ] **Integration Tests**: API endpoints have integration tests
- [ ] **Coverage Target**: >80% coverage on critical paths
- [ ] **All Tests Pass**: Test suite runs successfully
- [ ] **Fast Tests**: Unit tests complete in <10 seconds
- [ ] **Test Isolation**: Tests don't depend on execution order

### Test Quality

- [ ] **Edge Cases**: Edge cases and boundary conditions tested
- [ ] **Error Cases**: Error handling tested (4xx, 5xx responses)
- [ ] **Auth Testing**: Authentication/authorization tested
- [ ] **Mocking**: External dependencies properly mocked
- [ ] **Test Data**: Uses fixtures or factories for test data
- [ ] **Clear Assertions**: Test failures provide clear error messages

## Security Standards

### Authentication & Authorization

- [ ] **Auth Required**: Protected endpoints require authentication
- [ ] **Authorization**: Role/permission checks where needed
- [ ] **Token Security**: Tokens stored securely, not in logs
- [ ] **Password Security**: Passwords hashed with bcrypt/scrypt/argon2
- [ ] **Session Management**: Sessions expire appropriately

### Input Security

- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **SQL Injection**: Uses parameterized queries or ORM
- [ ] **XSS Prevention**: Outputs properly escaped
- [ ] **CSRF Protection**: CSRF protection on state-changing operations
- [ ] **File Upload Safety**: File uploads validated and scanned (if applicable)

### Data Security

- [ ] **Secrets Secure**: No secrets in code, use environment variables
- [ ] **HTTPS**: API served over HTTPS in production
- [ ] **Sensitive Data**: Sensitive data not logged
- [ ] **Rate Limiting**: Rate limiting on public endpoints
- [ ] **CORS**: CORS configured appropriately

## Performance Standards

### Response Time

- [ ] **Fast Responses**: P95 response time meets target (typically <200ms)
- [ ] **Database Queries**: No N+1 query problems
- [ ] **Query Optimization**: Database queries use indexes
- [ ] **Connection Pooling**: Database connection pooling configured

### Scalability

- [ ] **Stateless**: API is stateless (or session state externalized)
- [ ] **Caching**: Expensive operations cached appropriately
- [ ] **Async Operations**: Long-running operations handled asynchronously
- [ ] **Resource Limits**: Reasonable limits on request size, pagination

## Documentation Standards

### API Documentation

- [ ] **Endpoints Documented**: All endpoints documented (OpenAPI/Swagger or equivalent)
- [ ] **Request Examples**: Request body examples provided
- [ ] **Response Examples**: Response examples for success and error cases
- [ ] **Authentication Docs**: Authentication requirements clearly documented
- [ ] **Error Codes**: Error codes and messages documented

### Code Documentation

- [ ] **README Current**: Setup instructions accurate and complete
- [ ] **NEURONS.md Updated**: Structure changes reflected in map
- [ ] **Complex Logic**: Non-obvious code has explanatory comments
- [ ] **Environment Variables**: All required env vars documented

### Deployment Documentation

- [ ] **Setup Guide**: Clear instructions for local development
- [ ] **Deployment Guide**: Production deployment documented
- [ ] **Migration Guide**: Database migration instructions provided
- [ ] **Monitoring**: Health check and monitoring endpoints documented

## Database Standards

### Schema Design

- [ ] **Normalized**: Database schema properly normalized (or denormalized with reason)
- [ ] **Indexes**: Appropriate indexes on frequently queried columns
- [ ] **Constraints**: Foreign keys and constraints defined
- [ ] **Data Types**: Appropriate data types for columns

### Migrations

- [ ] **Migration Files**: Schema changes have migration files
- [ ] **Reversible**: Migrations can be rolled back
- [ ] **Data Safety**: Migrations don't cause data loss
- [ ] **Migration Tested**: Migrations tested on copy of production data

## Error Handling Standards

### Error Responses

- [ ] **Consistent Format**: All errors follow standard format
- [ ] **Useful Messages**: Error messages are helpful and actionable
- [ ] **Error Codes**: Unique error codes for different error types
- [ ] **Status Codes**: Appropriate HTTP status codes used
- [ ] **Details Included**: Validation errors include field-level details

### Error Logging

- [ ] **Errors Logged**: All errors logged with context
- [ ] **Stack Traces**: Stack traces captured for debugging
- [ ] **Structured Logs**: Logs use structured format (JSON)
- [ ] **Sensitive Data**: No sensitive data in logs
- [ ] **Log Levels**: Appropriate log levels (ERROR, WARN, INFO, DEBUG)

## Integration Standards

### External Services

- [ ] **Timeouts**: HTTP requests have timeouts
- [ ] **Retry Logic**: Failed requests retried with backoff
- [ ] **Circuit Breaker**: Circuit breaker for unreliable services (if needed)
- [ ] **Graceful Degradation**: Handles external service failures gracefully
- [ ] **Mocked in Tests**: External services mocked in tests

### Database

- [ ] **Connection Pooling**: Database connections pooled
- [ ] **Transaction Management**: Transactions used appropriately
- [ ] **Connection Cleanup**: Connections properly closed
- [ ] **Error Handling**: Database errors handled and logged

## Deployment Standards

### Environment

- [ ] **Environment Variables**: All config via environment variables
- [ ] **Secrets Management**: Secrets managed securely (not in code)
- [ ] **Multi-Environment**: Supports dev, staging, production environments
- [ ] **Configuration Validation**: App validates required config on startup

### Health & Monitoring

- [ ] **Health Endpoint**: `/health` endpoint returns 200 when healthy
- [ ] **Metrics Endpoint**: Metrics exposed for monitoring (e.g., `/metrics`)
- [ ] **Logging Configured**: Logs output to stdout/stderr
- [ ] **Graceful Shutdown**: App handles SIGTERM gracefully

### Build & Deploy

- [ ] **Build Passes**: Build/compilation succeeds
- [ ] **Docker Image**: Dockerfile builds successfully (if applicable)
- [ ] **Dependencies Locked**: Dependency versions locked
- [ ] **CI/CD**: Tests run in CI pipeline

## Framework-Specific Standards

### [Express.js Projects]

- [ ] **Middleware Order**: Middleware in correct order
- [ ] **Error Middleware**: Error handler has 4 parameters
- [ ] **Async Errors**: Async route handlers wrapped or use try-catch
- [ ] **Helmet Used**: Security headers via helmet

### [FastAPI Projects]

- [ ] **Pydantic Models**: Request/response use Pydantic models
- [ ] **Async Endpoints**: I/O operations use async/await
- [ ] **Dependencies**: Database connections via Depends()
- [ ] **OpenAPI Accurate**: Auto-generated docs match actual API

### [Gin/Echo Projects]

- [ ] **Context Used**: Uses framework context properly
- [ ] **Middleware**: Middleware registered correctly
- [ ] **Error Handling**: Errors handled and returned appropriately
- [ ] **JSON Binding**: Request binding with validation

### [Spring Boot Projects]

- [ ] **Annotations**: Proper use of @RestController, @Service, @Repository
- [ ] **Exception Handling**: @ControllerAdvice for global error handling
- [ ] **Dependency Injection**: Constructor injection used
- [ ] **Testing**: Uses Spring Test annotations

## Ralph Loop Integration

### Ralph Compliance

- [ ] **IMPLEMENTATION_PLAN Updated**: Task marked complete, discoveries noted
- [ ] **NEURONS.md Accurate**: Structure changes reflected
- [ ] **VALIDATION_CRITERIA Met**: All quality gates passed
- [ ] **Commit Message Clear**: Describes what was implemented

## Definition of Done

A task is complete when:

1. ✅ **All functional requirements met** (see API Quality Standards)
2. ✅ **Code quality standards met** (see Code Quality Standards)
3. ✅ **Tests written and passing** (see Testing Standards)
4. ✅ **Security validated** (see Security Standards)
5. ✅ **Performance acceptable** (see Performance Standards)
6. ✅ **Documentation updated** (see Documentation Standards)
7. ✅ **Database changes handled** (see Database Standards)
8. ✅ **Error handling proper** (see Error Handling Standards)
9. ✅ **Integration verified** (see Integration Standards)
10. ✅ **Deployment ready** (see Deployment Standards)
11. ✅ **Ralph artifacts updated** (see Ralph Loop Integration)

## Notes

- These criteria adapt to project size (strict for production, relaxed for prototypes)
- Add project-specific gates as patterns emerge
- Review and update criteria quarterly or after major milestones
- Use this as a checklist before marking IMPLEMENTATION_PLAN tasks complete
