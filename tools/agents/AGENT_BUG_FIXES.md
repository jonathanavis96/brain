# Agent Bug Fixes - Knowledge Base

This file documents all bugs found and fixed during semantic reviews. Before fixing a bug, check this file for similar issues and documented solutions.

**Last Updated**: 2026-02-01

---

## BUG-2026-02-01-001: THUNK Dedupe Regex Over-Escaped

**Date**: 2026-02-01  
**Category**: Logic  
**Severity**: Critical  
**Files**: `workers/ralph/update_thunk_from_plan.sh`

### Symptoms
Existing THUNK tasks not detected during deduplication, causing duplicate entries to be appended every time the script runs after the first append.

### Root Cause
The grep pattern in `get_existing_original_ids()` was over-escaped: `'^\\|[[:space:]]*[0-9]+[[:space:]]*\\|'`

The double backslashes (`\\|`) look for a literal backslash character before the pipe, instead of matching the pipe itself. This made `existing_original_ids` always empty, so no duplicates were ever detected.

### Fix Applied
Changed the pattern from `'^\\|'` to `'^\|'` (single backslash):
```bash
grep -E '^\|[[:space:]]*[0-9]+[[:space:]]*\|' "$THUNK_FILE"
```

### Prevention
- In grep patterns, use single backslash for escaping special regex characters
- Test regex patterns with sample data before committing
- Add unit tests for deduplication logic with existing entries

---

## BUG-2026-02-01-002: XSS Vulnerability in Frontend Panel Display

**Date**: 2026-02-01  
**Category**: Security  
**Severity**: Critical  
**Files**: `app/brain-map/frontend/src/App.jsx`

### Symptoms
User-controlled data (node title, body, tags, type, status) injected directly into HTML via `innerHTML`, allowing script execution. An attacker could create a node with title `<img src=x onerror=alert('XSS')>` and execute arbitrary JavaScript.

### Root Cause
Using `panel.innerHTML = \`<h3>${editedNode?.title}</h3>...\`` without sanitization. Template literals with user data inserted directly into HTML create XSS vulnerabilities.

### Fix Applied
Replaced `innerHTML` with safe DOM methods (65+ lines of changes):
```javascript
// Before (UNSAFE):
panel.innerHTML = `<h3>${editedNode?.title}</h3>`

// After (SAFE):
const titleEl = document.createElement('h3')
titleEl.textContent = editedNode?.title || 'Node Details'
panel.appendChild(titleEl)
```

Built entire DOM tree programmatically using:
- `document.createElement()` for structure
- `textContent` for all user data (auto-escapes)
- Event listeners instead of inline onclick handlers

### Prevention
- **Never** use `innerHTML` with user-controlled data
- Use `textContent`, `createTextNode()`, or DOMPurify library for sanitization
- Prefer React components over raw DOM manipulation (already using React elsewhere)
- Run security linters (eslint-plugin-security)
- Test with XSS payloads: `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`

---

## BUG-2026-02-01-003: Unsafe rm -rf Without Variable Validation

**Date**: 2026-02-01  
**Category**: Security  
**Severity**: Critical  
**Files**: `scripts/new-project.sh`

### Symptoms
If `$PROJECT_LOCATION` variable is unset or empty, `rm -rf "$PROJECT_LOCATION/brain/skills"` could delete unintended files (e.g., `rm -rf /brain/skills` at filesystem root).

### Root Cause
No validation before destructive `rm -rf` operations. Shell expands empty variables to empty strings, making the path unpredictable.

### Fix Applied
Added comprehensive validation before `rm -rf`:
```bash
# Safety check: Ensure PROJECT_LOCATION is set and non-empty
if [[ -z "${PROJECT_LOCATION:-}" ]]; then
  die "CRITICAL: PROJECT_LOCATION is not set. Refusing to run rm -rf."
fi

# Safety check: Ensure path is absolute
if [[ ! "$PROJECT_LOCATION" =~ ^/ ]]; then
  die "CRITICAL: PROJECT_LOCATION must be an absolute path. Got: $PROJECT_LOCATION"
fi

# Only remove if target exists
if [[ -d "$PROJECT_LOCATION/brain/skills" ]]; then
  rm -rf "$PROJECT_LOCATION/brain/skills"
fi
```

### Prevention
- **Always** validate variables before `rm -rf`
- Use `${VAR:-}` to prevent unset variable errors
- Require absolute paths for destructive operations
- Check directory existence before deletion
- Consider using safer alternatives: `trash-cli`, move to temp directory
- Run shellcheck and enable `set -u` (error on unset variables)

---

## BUG-2026-02-01-004: CORS Credentials Enabled Without CSRF Protection

**Date**: 2026-02-01  
**Category**: Security  
**Severity**: High  
**Files**: `app/brain-map/backend/app/main.py`

### Symptoms
FastAPI CORS middleware configured with `allow_credentials=True` but no CSRF token validation, making the API vulnerable to cross-site request forgery attacks.

### Root Cause
Misunderstanding of CORS security model. `allow_credentials=True` allows cookies/auth headers to be sent cross-origin, but without CSRF protection, malicious sites can make authenticated requests.

### Fix Applied
1. Changed `allow_credentials=True` to `allow_credentials=False` (no cookies/sessions used)
2. Added comprehensive security documentation explaining localhost-only model
3. Explicitly limited allowed methods and headers

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,  # No cookies/sessions - safer for localhost-only use
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)
```

### Prevention
- Only enable `allow_credentials` if using cookie-based auth AND implementing CSRF tokens
- For localhost-only apps, use `allow_credentials=False`
- Document security model explicitly (authentication, CSRF, rate limiting, TLS)
- Use JWT tokens in headers instead of cookies (no CSRF risk)
- Run security audit tools (Bandit, Safety)

---

## BUG-2026-02-01-005: Missing Rate Limiting on Mutating Endpoints

**Date**: 2026-02-01  
**Category**: Security  
**Severity**: High  
**Files**: `app/brain-map/backend/app/main.py`, `app/brain-map/backend/requirements.txt`

### Symptoms
No rate limiting on POST/PUT/DELETE endpoints, allowing unlimited requests that could cause denial of service or abuse expensive operations (e.g., index rebuild).

### Root Cause
Default FastAPI configuration has no rate limiting. Even for localhost apps, accidental infinite loops or bugs can cause self-DoS.

### Fix Applied
1. Added `slowapi==0.1.9` to requirements.txt
2. Configured global rate limiter with `get_remote_address` key function
3. Applied decorators to all mutating endpoints:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/node", status_code=201)
@limiter.limit("20/minute")  # 20 node creations per minute
async def create_node(request: Request, node_data: NodeCreate) -> dict:
    ...
```

Rate limits applied:
- Position updates: 60/minute
- Node updates: 30/minute
- Comments: 20/minute
- Node creation: 20/minute
- Plan generation: 10/minute (expensive)

### Prevention
- **Always** add rate limiting to public endpoints (even localhost)
- Use lower limits for expensive operations (searches, reports, AI calls)
- Add `Request` parameter to all rate-limited functions
- Test rate limits with stress testing tools (locust, ab)
- Monitor rate limit hits in production logs

---

## BUG-2026-02-01-006: Missing Input Length Validation on Body Field

**Date**: 2026-02-01  
**Category**: Security  
**Severity**: Medium  
**Files**: `app/brain-map/backend/app/main.py`

### Symptoms
`body_md` field in `NodeCreate` and `NodeUpdate` models has no maximum length, allowing massive payloads that could cause memory exhaustion or DoS.

### Root Cause
Pydantic models default to unlimited string length. Without explicit `max_length`, users can send multi-gigabyte payloads.

### Fix Applied
Added `max_length=100000` (100KB limit) to body fields:
```python
# Before:
body_md: str = ""

# After:
body_md: str = Field(default="", max_length=100000)  # Limit to ~100KB

# Also for updates:
body_md: str | None = Field(default=None, max_length=100000)
```

### Prevention
- Always set `max_length` on user-input string fields
- Consider business requirements (code snippets vs full documents)
- Add similar limits to other text fields (title, tags, comments)
- Test with large payloads to verify limits work
- Return clear error messages when limits exceeded

---

## BUG-2026-02-01-007: Console.error in Production Frontend Code

**Date**: 2026-02-01  
**Category**: Style  
**Severity**: Low  
**Files**: `app/brain-map/frontend/src/App.jsx`

### Symptoms
`console.error('Failed to refresh graph:', err)` exposes error details in browser console, potentially leaking sensitive information.

### Root Cause
Debug statement left in production code. While low severity for localhost apps, it's poor practice and could expose implementation details.

### Fix Applied
Replaced with toast notification:
```javascript
// Before:
console.error('Failed to refresh graph:', err)

// After:
showToast('Failed to refresh graph: ' + err.message)
```

### Prevention
- Use proper error logging/notification systems instead of console methods
- Run linters to catch console.* statements (eslint-plugin-no-console)
- Set up proper logging service for production (Sentry, LogRocket)
- Use environment-specific logging (verbose in dev, minimal in prod)

---

## BUG-2026-02-01-008: Missing API Versioning

**Date**: 2026-02-01  
**Category**: Style  
**Severity**: Low  
**Files**: `app/brain-map/backend/app/main.py`

### Symptoms
API endpoints have no version prefix (e.g., `/api/v1/`), making it difficult to introduce breaking changes in the future.

### Root Cause
FastAPI default configuration uses root path `/`. Without versioning from the start, adding it later requires coordinating frontend/backend changes.

### Fix Applied
Added `root_path="/api/v1"` to FastAPI app:
```python
app = FastAPI(
    title="Brain Map API",
    description="Local-first knowledge graph API for Brain Map system",
    version="0.1.0",
    lifespan=lifespan,
    root_path="/api/v1",  # API versioning for future compatibility
)
```

### Prevention
- **Always** version APIs from day one (even localhost apps)
- Use path-based versioning (`/api/v1/`) or header-based (`Accept: application/vnd.api+json; version=1`)
- Document versioning strategy in API docs
- Plan deprecation policy before v2 (how long to support v1)

---
