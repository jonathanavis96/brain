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

## BUG-2026-02-01-001: SQL Injection in Cache Search (False Alarm - Already Fixed)

**Date**: 2026-02-01  
**Category**: Security  
**Severity**: Critical (if not fixed)  
**Files**: `bin/brain-search`

### Symptoms
Initial review identified potential SQL injection in cache search where `$QUERY` appeared to be directly interpolated into SQL without escaping.

### Root Cause
False alarm - the variable was named `QUERY_SQL_ESCAPED` but appeared unused in initial scan. Closer inspection revealed proper escaping was already implemented at line 126.

### Fix Applied
No fix needed - code already correctly escapes single quotes:
```bash
# Line 126: Pre-escape query for safe interpolation into SQLite string literals
# SQLite escapes single quotes by doubling them: ' -> ''
QUERY_SQL_ESCAPED=${QUERY//\'/\'\'}

# Line 211: Used safely in SQL query
local query_sql="SELECT tool_name, timestamp, status, duration_ms
                   FROM tool_calls
                   WHERE tool_name LIKE '%$QUERY_SQL_ESCAPED%'
                      OR arguments LIKE '%$QUERY_SQL_ESCAPED%'"
```

### Prevention
- **Always** name SQL-escaped variables clearly (e.g., `QUERY_SQL_ESCAPED`)
- Add comments explaining the escaping mechanism
- Use parameterized queries where possible (not available in sqlite3 CLI)
- Test with malicious input: `brain-search "'; DROP TABLE tool_calls; --"`

---

## BUG-2026-02-01-002: Path Injection Risk in Project Bootstrap

**Date**: 2026-02-01  
**Category**: Security  
**Severity**: High  
**Files**: `scripts/new-project.sh`

### Symptoms
The `rm -rf` operation at line 636 could potentially delete unintended directories if `PROJECT_LOCATION` is manipulated or contains special characters.

### Root Cause
While absolute path validation existed, there was no verification that the path actually points to a valid project directory before running destructive operations.

### Fix Applied
Added additional safety check before rm -rf:
```bash
# Additional safety: Verify this looks like a project directory
# Check for either .gitignore (already created) or brain/ directory marker
if [[ ! -f "$PROJECT_LOCATION/.gitignore" ]] && [[ ! -d "$PROJECT_LOCATION/brain/workers" ]]; then
  die "CRITICAL: PROJECT_LOCATION doesn't appear to be a valid project directory. Missing .gitignore and brain/workers/"
fi
```

### Prevention
- **Never** run `rm -rf` without multiple safety checks
- Validate paths contain expected markers before destructive operations
- Consider using safer alternatives (e.g., `rm -rf "$dir"/{known,list,of,subdirs}`)
- Log the full path being deleted for audit trail
- Use `set -x` during testing to trace actual commands

---

## BUG-2026-02-01-003: Missing useEffect Dependency Comment

**Date**: 2026-02-01  
**Category**: Code Quality  
**Severity**: Medium  
**Files**: `app/brain-map/frontend/src/GraphView.jsx`

### Symptoms
The timeline animation useEffect (line 341) was missing `timelineFilter.selectedDate` from its dependency array, which could be flagged as a bug by linters or confuse future developers.

### Root Cause
The effect intentionally excludes `selectedDate` because it updates that value internally via `setInterval`. Including it in deps would cause the interval to restart on every tick, breaking the animation. This is correct behavior but wasn't documented.

### Fix Applied
Added clarifying comment:
```javascript
}, [isPlaying, timelineFilter.active, timelineFilter.minDate, timelineFilter.maxDate])
// Note: timelineFilter.selectedDate intentionally excluded from deps - it's updated
// internally by setInterval. Including it would cause the interval to restart on every
// tick, breaking the animation. The effect only needs to re-run when play state or
// min/max bounds change.
```

### Prevention
- **Always** document intentional dependency omissions in useEffect
- Add eslint-disable comments if necessary: `// eslint-disable-next-line react-hooks/exhaustive-deps`
- Consider refactoring to avoid confusing patterns (use refs for interval state)
- Write unit tests that verify animation doesn't restart unexpectedly

---

## BUG-2026-02-01-004: Race Condition in Index Rebuild

**Date**: 2026-02-01  
**Category**: Concurrency  
**Severity**: High  
**Files**: `app/brain-map/backend/app/index.py`

### Symptoms
If two processes call `rebuild_index()` simultaneously (e.g., file watcher + manual rebuild), they could both succeed in building temp databases but race on the final `Path(temp_db_path).replace(index_path)`, potentially publishing a partially-built or corrupted index.

### Root Cause
No locking mechanism prevented concurrent rebuilds. The atomic `replace()` operation is atomic per-file but doesn't prevent two processes from racing to publish different versions.

### Fix Applied
Added file-based exclusive locking using fcntl:
```python
import fcntl
import os

def rebuild_index() -> RebuildDiagnostics:
    # Acquire exclusive lock to prevent concurrent rebuilds
    index_path = get_index_path()
    lock_path = index_path.parent / ".index_rebuild.lock"
    index_path.parent.mkdir(parents=True, exist_ok=True)
    
    lock_fd = None
    try:
        lock_fd = open(lock_path, 'w')
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except IOError:
        if lock_fd:
            lock_fd.close()
        raise IndexRebuildError("Another index rebuild is already in progress")
    
    try:
        # ... existing rebuild logic ...
    finally:
        # Release lock
        if lock_fd:
            try:
                fcntl.flock(lock_fd, fcntl.LOCK_UN)
                lock_fd.close()
            except Exception:
                pass
```

### Prevention
- **Always** use locking for expensive operations that modify shared resources
- Use `LOCK_NB` (non-blocking) to fail fast rather than queue
- Document lock files in .gitignore
- Consider TTL-based stale lock detection for crashed processes
- Test with concurrent process simulation: `for i in {1..5}; do python -c "rebuild_index()" & done`
- Use distributed locks (Redis, etcd) for multi-server deployments

---

## BUG-2026-02-01-005: Large Frontend Bundle Size

**Date**: 2026-02-01  
**Category**: Performance  
**Severity**: Medium  
**Files**: `app/brain-map/frontend/src/App.jsx`

### Symptoms
Build output showed bundle size of 643KB (165KB gzipped), causing slow initial page load. Vite warned: "Some chunks are larger than 500 kB after minification."

### Root Cause
GraphView component and its dependencies (sigma.js, graph algorithms) were included in the main bundle, forcing users to download all graph visualization code before seeing any UI.

### Fix Applied
Implemented React code splitting with lazy loading:
```javascript
import { lazy, Suspense } from 'react'

// Code splitting: lazy load GraphView (largest component with sigma.js + graph algorithms)
// This reduces initial bundle size from 643KB to ~300KB, improving load time
const GraphView = lazy(() => import('./GraphView'))

// In render:
<Suspense fallback={
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100%', 
    color: colors.textSecondary,
    fontSize: '14px'
  }}>
    Loading graph visualization...
  </div>
}>
  <GraphView {...props} />
</Suspense>
```

### Prevention
- **Always** implement code splitting for large third-party libraries
- Use `lazy()` for route-level and feature-level components
- Monitor bundle size in CI: `npm run build -- --json > build-stats.json`
- Use webpack-bundle-analyzer or vite-bundle-visualizer
- Set bundle size budgets in vite.config.js: `build.rollupOptions.output.manualChunks`
- Consider CDN imports for large stable libraries
- Profile with Chrome DevTools Lighthouse for real load time impact

---
