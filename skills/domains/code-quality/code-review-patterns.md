# Code Review Patterns

<!-- covers: code-review, semantic-linting, logic-bugs, pre-commit-checklist -->

Patterns for catching logic bugs and semantic issues that automated linters miss. These are issues that CodeRabbit caught in PR#5 but pre-commit hooks did not detect.

## Problem: Beyond Syntax Checking

Automated linters excel at syntax and style but struggle with:

- **Logic errors** - Code runs but doesn't do what it claims
- **Semantic correctness** - Variables are used but never defined
- **Context-dependent bugs** - Cleanup code references wrong variables
- **Example completeness** - Documentation code is missing imports

## Pattern Categories

### 1. Bash Regex Capture Groups

**Issue:** Regex patterns that include delimiters in capture groups, causing incorrect matches.

**Example from PR#5:**

```bash
# ❌ BAD - captures delimiter pipe character
if [[ "$line" =~ ^\|\ *([0-9]+\.[0-9]+(\.[0-9]+)?)\ *\| ]]; then
    task_id="${BASH_REMATCH[1]}"  # Includes trailing " |"
fi

# ✅ GOOD - captures only the task ID
if [[ "$line" =~ ^\|\ *([0-9]+\.[0-9]+(\.[0-9]+)?)\ * ]]; then
    task_id="${BASH_REMATCH[1]}"  # Clean match
fi
```

**Detection checklist:**

- [ ] Does the regex pattern include `\|` or other delimiters inside `()`?
- [ ] Are captured groups used in string comparisons or assignments?
- [ ] Would trailing whitespace or delimiters break downstream logic?

**Fix:** Move delimiters outside capture groups, match only the data you need.

### 2. Dead Code with Undefined Variables

**Issue:** Cleanup blocks or error handlers reference variables that don't exist in that scope.

**Example from PR#5:**

```bash
cleanup_and_emit() {
    # ❌ BAD - cleanup() function is never called
    # Variable TEMP_CONFIG from cleanup() is never removed
    release_lock
    emit_completion_status "$1"
}
```

**Detection checklist:**

- [ ] Are all functions/commands in the cleanup path actually called?
- [ ] Do cleanup handlers reference variables defined in the main flow?
- [ ] Are temp files actually removed before exit?

**Fix:** Trace the execution path and ensure all cleanup code runs. Use `trap` handlers or explicit calls.

**See also:** [cleanup-patterns.md](../languages/shell/cleanup-patterns.md) for trap best practices.

### 3. Code Example Completeness

**Issue:** Documentation examples are missing imports, variable definitions, or context needed to run.

**Example from PR#5:**

```python
# ❌ BAD - time.sleep() used but never imported
def retry_with_backoff(func, max_retries=3):
    for i in range(max_retries):
        try:
            return func()
        except Exception:
            time.sleep(2 ** i)  # Missing: import time

# ✅ GOOD - complete example
import time

def retry_with_backoff(func, max_retries=3):
    for i in range(max_retries):
        try:
            return func()
        except Exception:
            time.sleep(2 ** i)
```

**Detection checklist:**

- [ ] Are all imported modules/functions declared at the top?
- [ ] Are all variables used in examples defined or parameterized?
- [ ] Can the example run standalone (copy-paste test)?
- [ ] Are external dependencies documented?

**Fix patterns:**

1. Add missing imports at the top of the code block
2. Define variables used in examples (or add comments explaining them)
3. Use realistic placeholder values (not `undefined_var`)
4. Test examples in isolation before committing

### 4. Variable Scope and Initialization

**Issue:** Variables used before being set, or assumed to exist from external context.

**Example from PR#5:**

```python
# ❌ BAD - userId never defined, murmurhash not imported, 'hash' shadows built-in
def isEnabledForPercentage(flag, percentage):
    hash = murmurhash(flag + userId)  # Where does userId come from?
    return (hash % 100) < percentage

# ✅ GOOD - parameter or explicit source, proper imports, no built-in shadowing
from murmurhash import murmurhash

def isEnabledForPercentage(flag, user_id, percentage):
    hash_value = murmurhash(f"{flag}{user_id}")
    return (hash_value % 100) < percentage
```

**Detection checklist:**

- [ ] Are all variables in the function either parameters, local vars, or globals?
- [ ] Do variable names match between definition and use?
- [ ] Are loop variables declared before the loop?

**Fix:** Make all variable sources explicit (parameters, globals with comments, or local assignments).

**See also:** [variable-patterns.md](../languages/shell/variable-patterns.md) for shell-specific rules.

### 5. Security Issues in Examples

**Issue:** Example code demonstrates insecure patterns (SQL injection, hardcoded secrets, etc.).

**Example from PR#5:**

```python
# ❌ BAD - SQL injection vulnerability
span.set_attribute("sql.query", f"SELECT * FROM {table}")

# ✅ GOOD - parameterized query
span.set_attribute("sql.query", "SELECT * FROM users WHERE id = ?")
span.set_attribute("sql.params", str(params))
```

**Detection checklist:**

- [ ] Are user inputs sanitized or parameterized?
- [ ] Are secrets/tokens redacted in logs/examples?
- [ ] Do examples follow current security best practices?

**Fix:** Use parameterized queries, sanitize inputs, redact sensitive data.

**See also:** [security-patterns.md](../infrastructure/security-patterns.md)

### 6. Outdated or Deprecated APIs

**Issue:** Documentation uses APIs that have been removed or replaced in newer versions.

**Example from PR#5:**

```bash
# ❌ BAD - recovery.conf removed in PostgreSQL 12+
cat > /var/lib/postgresql/data/recovery.conf <<EOF
standby_mode = 'on'
EOF

# ✅ GOOD - modern PostgreSQL recovery
touch /var/lib/postgresql/data/standby.signal
cat >> /var/lib/postgresql/data/postgresql.conf <<EOF
primary_conninfo = 'host=primary port=5432'
EOF
```

**Detection checklist:**

- [ ] Are version-specific APIs documented with version constraints?
- [ ] Have APIs been deprecated since the example was written?
- [ ] Do examples work with the "current" version (not legacy)?

**Fix:** Research current best practices, update examples to modern APIs, add version notes.

### 7. Inconsistent Error Handling

**Issue:** Some code paths handle errors while others silently fail.

**Example from PR#5:**

```python
# ❌ BAD - status hardcoded, missing async def, missing import
def metricsMiddleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    metrics.histogram("duration", duration, {"status": "200"})  # Wrong!
    return response

# ✅ GOOD - uses actual status, async def, complete imports
import time

async def metricsMiddleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    metrics.histogram("duration", duration, {"status": str(response.status_code)})
    return response
```

**Detection checklist:**

- [ ] Are all error paths handled consistently?
- [ ] Do metrics/logs reflect actual runtime state (not hardcoded values)?
- [ ] Are exceptions propagated or caught appropriately?

**Fix:** Use actual runtime values, not placeholders or assumptions.

## Pre-Commit Review Checklist

Before committing code, manually review:

### Shell Scripts

- [ ] Regex patterns: Are capture groups clean (no delimiters inside `()`)?
- [ ] Cleanup handlers: Do all `trap` or cleanup functions actually run?
- [ ] Variable usage: Are all variables defined before use?

### Python/JavaScript Examples

- [ ] Imports: Are all modules imported at the top?
- [ ] Variables: Are all variables defined or parameterized?
- [ ] Copy-paste test: Can the example run standalone?
- [ ] Security: No SQL injection, XSS, or credential leaks?

### Documentation

- [ ] Version constraints: Are deprecated APIs marked as such?
- [ ] Completeness: Do examples include necessary context?
- [ ] Accuracy: Do hardcoded values match actual runtime behavior?

## Workflow Integration

### During Development

1. Write code with semantic correctness in mind (not just syntax)
2. Test examples in isolation (run them!)
3. Review your own diff before committing

### Before PR

1. Run automated checks: `pre-commit run --all-files`
2. Manual review using checklist above
3. Test at least one example from each modified doc file

### In Code Review

- Look for patterns in this document
- Question assumptions (where do variables come from?)
- Verify examples are complete and secure

## Limitations

**These patterns require human/LLM review** - they cannot be fully automated because:

- Context-dependent logic requires understanding intent
- "Correct" depends on what the code is supposed to do
- Trade-offs exist (completeness vs brevity in examples)

**Future:** Consider custom linting rules or LLM-based semantic checks for high-frequency patterns.

## See Also

- **[code-hygiene.md](code-hygiene.md)** - Definition of Done checklist
- **[code-consistency.md](code-consistency.md)** - Naming and structure patterns
- **[variable-patterns.md](../languages/shell/variable-patterns.md)** - Shell variable best practices
- **[cleanup-patterns.md](../languages/shell/cleanup-patterns.md)** - Trap handlers and temp files
- **[security-patterns.md](../infrastructure/security-patterns.md)** - Security best practices
- **[testing-patterns.md](testing-patterns.md)** - How to test code examples
- **[docs/CODERABBIT_PR5_ALL_ISSUES.md](../../../docs/CODERABBIT_PR5_ALL_ISSUES.md)** - Full issue list from PR#5

## Gap Identification

If you encounter code review patterns not covered here, add to `skills/self-improvement/GAP_BACKLOG.md`.
