# CodeRabbit PR #5 - Complete Issue List

**Date:** 2026-01-25  
**PR:** #5  
**Total Issues:** 40+  
**Source:** `docs/PR5 CodeRabiit.md`

---

## Issue Summary by Category

| Category | Count | Priority |
|----------|-------|----------|
| 🔴 SHA256 Hash Mismatches | 8 | CRITICAL - Blocks merge |
| 🔴 Protected File Changes | 4 | CRITICAL - Need SPEC_CHANGE_REQUEST |
| 🟠 Logic Bugs | 8 | HIGH - Runtime errors |
| 🟡 Git Hygiene | 2 | MEDIUM - Cleanup |
| 🟡 Documentation Fixes | 10 | MEDIUM - Broken links, dates |
| 🟢 Code Quality | 8+ | LOW - Style, grammar |

---

## 🔴 CRITICAL: SHA256 Hash Mismatches (8 issues)

These block the verifier and must be fixed by a human (hash files are protected).

| # | File | Issue | Fix |
|---|------|-------|-----|
| C1 | `.verify/loop.sha256` | Hash doesn't match guarded files | Recompute hash for current loop.sh |
| C2 | `.verify/ac.sha256` | Missing formal approval | Create waiver or SPEC_CHANGE_REQUEST |
| C3 | `.verify/verifier.sha256` | Incorrect checksum | Replace with `18d1a1a7876ea224a611063da2ed85321f8c038b5c1dca0d39decb57a46a6d4a` |
| C4 | `workers/ralph/.verify/loop.sha256` | Old hash after loop.sh modified | Update to `2be4310f06129e58eb3a68b8f5814e754ae1f0f47742e5909af341bb7934dd5b` |
| C5 | `workers/ralph/.verify/prompt.sha256` | PROMPT.md changed, hash stale | Update hash, create SPEC_CHANGE_REQUEST |
| C6 | `workers/ralph/.verify/verifier.sha256` | verifier.sh changed, hash stale | Update hash, create SPEC_CHANGE_REQUEST |
| C7 | `templates/ralph/.verify/loop.sha256` | Stale hash | Replace with `f345f7bdf3dd67e963fd96fed3e627cc66368c66ccc67abf1043a667be1c083d` |
| C8 | `workers/cerebras/PROMPT.md` | Blocked by hash guard | Update `.verify/prompt.sha256` or request waiver |

---

## 🔴 CRITICAL: Protected File Changes Need SPEC_CHANGE_REQUEST (4 issues)

| # | File | Change Description |
|---|------|--------------------|
| P1 | `workers/ralph/loop.sh` | Sources `common.sh` - needs SPEC_CHANGE_REQUEST |
| P2 | `workers/ralph/PROMPT.md` | Content changed - needs SPEC_CHANGE_REQUEST |
| P3 | `workers/ralph/verifier.sh` | Code edits - needs SPEC_CHANGE_REQUEST |
| P4 | `templates/ralph/loop.sh` | Cache key changes - needs SPEC_CHANGE_REQUEST |

---

## 🟠 HIGH: Logic Bugs (8 issues)

| # | File | Lines | Issue | Fix |
|---|------|-------|-------|-----|
| L1 | `workers/ralph/loop.sh` | 154-172 | `cleanup_and_emit` doesn't call `cleanup()`, leaves TEMP_CONFIG behind | Call `cleanup()` before releasing lock |
| L2 | `workers/ralph/loop.sh` | 1037-1038 | `lookup_cache_pass` missing tool/runner arg, `non_cacheable_tools` ignored | Add tool name as 3rd argument |
| L3 | `workers/ralph/loop.sh` | 1056-1068 | Cache-hit returns before cleaning temp prompt file | Add `rm -f "$prompt_with_mode"` before return |
| L4 | `workers/ralph/loop.sh` | 341-360 | CACHE_SKIP only accepts literal "true" | Accept truthy values (1, yes, on) case-insensitive |
| L5 | `.verify/approve_waiver_totp.py` | 83-90 | Deletes request file, breaks `check_waiver.sh` | Keep or archive request file |
| L6 | `workers/ralph/verifier.sh` | 344-385 | Cache key only appends AC.rules hash in "use" mode | Compute hash before CACHE_MODE check |
| L7 | `bin/brain-event` | 84-117 | Unbound variable error if flag is last arg | Guard `$2` access with `${2-}` check |
| L8 | `workers/cerebras/cerebras_agent.py` | 1021-1038 | State reinjection at index 1 breaks `_prune_messages` | Insert after user message (index 2) |

---

## 🟡 MEDIUM: Git Hygiene (2 issues)

| # | File | Issue | Fix |
|---|------|-------|-----|
| G1 | `tools/rollflow_analyze/src/rollflow_analyze.egg-info/` | Build artifact committed | `git rm -r`, add `*.egg-info/` to `.gitignore` |
| G2 | `.verify/waiver_requests/WVR-2026-01-24-003.json` | Reason field contradicts evidence | Update reason or reject waiver |

---

## 🟡 MEDIUM: Documentation Fixes (10 issues)

### Broken Links

| # | File | Issue | Fix |
|---|------|-------|-----|
| D1 | `skills/domains/frontend/README.md` | Link to `../languages/typescript/README.md` broken | Create file or fix path |
| D2 | `skills/domains/languages/javascript/README.md` | Link to typescript README broken | Remove or create target |
| D3 | `skills/index.md` | Missing entries in SUMMARY.md | Add research-patterns, token-efficiency, frontend entries |

### Incorrect Dates

| # | File | Issue | Fix |
|---|------|-------|-----|
| D4 | `workers/IMPLEMENTATION_PLAN.md` | "2026-01-25" is future date | Change to 2026-01-24 |
| D5 | `skills/domains/languages/typescript/README.md` | "2026-01-25" is future date | Change to 2026-01-24 |

### Status/Checklist Mismatches

| # | File | Issue | Fix |
|---|------|-------|-----|
| D6 | `workers/IMPLEMENTATION_PLAN.md` | Phase 2.1.2 status says "remains" but checkbox complete | Update status text |
| D7 | `workers/IMPLEMENTATION_PLAN.md` | Phase 12.4.2-12.4.3 status says "deferred" but checked | Reconcile checkbox vs text |

### Markdown Formatting

| # | File | Issue | Fix |
|---|------|-------|-----|
| D8 | `workers/ralph/THUNK.md` | Malformed table rows (unescaped pipes) | Escape pipes or use backticks |
| D9 | `cortex/AGENTS.md` | Code block formatting issue line 45-50 | Fix closing fence |
| D10 | `skills/domains/infrastructure/observability-patterns.md` | Stray duplicate closing fence | Remove extra backticks |

---

## 🟢 LOW: Code Quality / Examples (8+ issues)

### Shell Script Issues

| # | File | Issue |
|---|------|-------|
| Q1 | `workers/ralph/current_ralph_tasks.sh` | Archive headers not treated as section terminators |
| Q2 | `templates/ralph/loop.sh` | Cache key JSON passed incorrectly |

### Python Example Issues

| # | File | Issue |
|---|------|-------|
| Q3 | `skills/domains/infrastructure/deployment-patterns.md` | Missing `import time` |
| Q4 | `skills/domains/infrastructure/deployment-patterns.md` | `isEnabledForPercentage` undefined `userId` |
| Q5 | `skills/domains/infrastructure/observability-patterns.md` | `JsonFormatter.format` references non-existent `record.extra` |
| Q6 | `skills/domains/infrastructure/observability-patterns.md` | `metricsMiddleware` hardcodes "200" status |
| Q7 | `skills/domains/infrastructure/observability-patterns.md` | SQL injection in span logging |
| Q8 | `skills/domains/infrastructure/disaster-recovery-patterns.md` | Uses removed PostgreSQL 12+ `recovery.conf` |

### JavaScript Example Issues

| # | File | Issue |
|---|------|-------|
| Q9 | `skills/domains/languages/javascript/README.md` | Undefined `userId` in tagged template |
| Q10 | `skills/domains/code-quality/test-coverage-patterns.md` | Jest `--collectCoverageFrom` used incorrectly |
| Q11 | `skills/domains/code-quality/test-coverage-patterns.md` | Artifacts download endpoint incorrect |

### Grammar

| # | File | Issue |
|---|------|-------|
| Q12 | `skills/domains/infrastructure/deployment-patterns.md` | "backward compatible" should be "backward-compatible" |

---

## Recommended Fix Order

### Phase 1: Unblock Merge (HUMAN REQUIRED)

1. Regenerate all SHA256 hashes in `.verify/` directories
2. Create SPEC_CHANGE_REQUEST.md for protected file changes
3. Approve or update waiver requests

### Phase 2: Critical Bug Fixes (Ralph can do)

1. Fix `cleanup()` not called in trap handler
2. Fix `approve_waiver_totp.py` race condition
3. Fix `bin/brain-event` unbound variable
4. Fix cache key issues in loop.sh and verifier.sh

### Phase 3: Git Hygiene (Ralph can do)

1. Remove egg-info, update .gitignore
2. Fix waiver request reason field

### Phase 4: Documentation (Ralph can do)

1. Fix broken links (create missing files or update paths)
2. Fix incorrect dates
3. Fix status/checklist mismatches
4. Fix markdown formatting

### Phase 5: Code Examples (Ralph can do)

1. Fix Python examples (imports, variables)
2. Fix JavaScript examples
3. Fix shell script edge cases

---

## Notes

- **Hash regeneration is HUMAN ONLY** - per security model
- **SPEC_CHANGE_REQUEST.md** required for protected files per AGENTS.md policy
- Some issues are duplicates (same file mentioned multiple times)
- Code example issues are in documentation files, not runtime code
