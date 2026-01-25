# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-25 22:58:55

**Current Status:** Planning phase - analyzing CodeRabbit PR6 fixes and prevention systems.

<!-- Cortex adds new Task Contracts below this line -->

## Phase CR-6: CodeRabbit PR6 Fixes

**Goal:** Fix remaining CodeRabbit issues before merging PR6.

**Reference:** `docs/CODERABBIT_ISSUES_TRACKER.md`

**Status:** All 11 Ralph-fixable issues identified. Ready for BUILD phase execution.

### Major Issues (Ralph Can Fix)

- [x] **CR-6.1** Fix `LOGS_DIR` → `LOGDIR` typo in templates/ralph/loop.sh (M9)
  - **File:** `templates/ralph/loop.sh` lines 1707, 1949
  - **Issue:** Script defines `LOGDIR` but references `LOGS_DIR` (undefined)
  - **Fix:** Replace `$LOGS_DIR` with `$LOGDIR`
  - **AC:** `grep -n 'LOGS_DIR' templates/ralph/loop.sh` returns empty

- [x] **CR-6.2** Fix bin/brain-event flag parsing (M1)
  - **File:** `bin/brain-event` lines 84-125
  - **Issue:** Flag parsing consumes next option when value missing
  - **Fix:** Check if value looks like a flag before shifting
  - **AC:** `--event --iter 1` doesn't treat `--iter` as event value

- [x] **CR-6.3** Fix THUNK.md table column mismatch (M10)
  - **File:** `workers/ralph/THUNK.md` lines 748, 770-782
  - **Issue:** Table rows have wrong column count, unescaped pipes
  - **Fix:** Ensure all rows have 5 columns, escape pipes in content
  - **AC:** `markdownlint workers/ralph/THUNK.md` passes MD056

- [x] **CR-6.4** Fix shell README config mismatch (C2)
  - **File:** `skills/domains/languages/shell/README.md` line 64
  - **Issue:** README documents shfmt config that doesn't match `.pre-commit-config.yaml`
  - **Fix:** Update README to match actual config
  - **AC:** Documented shfmt flags match `.pre-commit-config.yaml`

- [x] **CR-6.5** Fix code-review-patterns.md example bugs (M11)
  - **File:** `skills/domains/code-quality/code-review-patterns.md` line 286
  - **Issue:** Code example has bugs or incorrect patterns
  - **Fix:** Review and correct the code example
  - **AC:** Code examples are syntactically valid and demonstrate correct patterns

- [x] **CR-6.6** Fix README.md documentation issue (M12)
  - **File:** `README.md` line 326
  - **Issue:** Incorrect or misleading documentation
  - **Fix:** Correct the documentation
  - **AC:** Documentation accurately describes the feature/process

- [x] **CR-6.7** Fix observability-patterns.md issues (m1)
  - **File:** `skills/domains/infrastructure/observability-patterns.md`
  - **Issues:** PostgreSQL placeholder mismatch, stray fence, hardcoded status, SQL injection
  - **Fix:** Correct all code examples
  - **AC:** All code examples use consistent patterns and are secure

- [x] **CR-6.8** Fix broken documentation links (m3)
  - **Files:** `skills/domains/frontend/README.md`, `skills/domains/languages/javascript/README.md`, `skills/index.md`
  - **Issue:** Links to non-existent typescript README
  - **Fix:** Create typescript README or update links
  - **AC:** All internal links resolve to existing files

- [x] **CR-6.9** Fix deployment-patterns.md missing imports (m5)
  - **File:** `skills/domains/infrastructure/deployment-patterns.md`
  - **Issue:** Missing `import time`, undefined `userId`
  - **Fix:** Add missing imports, define or document variables
  - **AC:** Python code examples are complete and runnable

- [x] **CR-6.10** Fix JavaScript example issues (m6)
  - **Files:** `skills/domains/languages/javascript/README.md`, `skills/domains/code-quality/test-coverage-patterns.md`
  - **Issue:** Undefined `userId`, incorrect Jest flag
  - **Fix:** Complete the examples
  - **AC:** JavaScript examples are syntactically valid

- [x] **CR-6.11** Fix archive header parsing in current_ralph_tasks.sh (from CR-5) - Completed 2026-01-25 (THUNK #773)

### Human Required (Hash/Protected Files)

**Note:** These require human intervention after Ralph prepares fixes:

- [x] **CR-6.H1** Update SHA256 hashes after all fixes
  - Run hash regeneration for all `.verify/` directories
  - **Files:** `.verify/`, `workers/ralph/.verify/`, `templates/ralph/.verify/`
  - **Updated:** agents.sha256 (root + workers/ralph), loop.sha256 (templates/ralph), prompt.sha256 (templates/ralph)

---

## Notes

- **Protected files (loop.sh, verifier.sh, PROMPT.md):** Ralph can prepare fixes but human must update hashes
- **Hash regeneration:** Already handled by human - C1-C8 issues resolved
- **egg-info cleanup (G1):** Already fixed - directory removed and added to .gitignore
- **Reference:** See `docs/CODERABBIT_ISSUES_TRACKER.md` for complete issue list

## Phase POST-CR6: Post-CodeRabbit Prevention Systems

**Goal:** Address systemic issues identified by CodeRabbit analysis to prevent future issues.

**Reference:** `docs/CODERABBIT_ISSUES_TRACKER.md` - Prevention Systems section

**Rationale:** CodeRabbit identified 50+ issues across PR5 and PR6 with significant recurring patterns. These prevention systems will catch issues before PR creation.

### High Priority Prevention

- [ ] **POST-CR6.1** Implement hash validation pre-commit hook
  - **Goal:** Prevent SHA256 hash mismatches (8 instances in PR5, 1 in PR6)
  - **Implementation:** Pre-commit hook that validates all `.verify/*.sha256` files match targets
  - **Files:** `.git/hooks/pre-commit` or `.pre-commit-config.yaml`
  - **AC:** Hook blocks commits when hash mismatches detected
  - **Priority:** HIGH (recurring critical issue)

- [ ] **POST-CR6.2** Create shell script unit test framework
  - **Goal:** Catch logic bugs in shell scripts (4 bugs in PR5, 3 in PR6)
  - **Implementation:** Setup bats-core framework, write tests for bin/brain-event flag parsing
  - **Files:** `tests/unit/`, `.pre-commit-config.yaml`
  - **AC:** `bats tests/unit/*.bats` runs successfully
  - **Priority:** HIGH (recurring logic bugs)

- [ ] **POST-CR6.6** Expand semantic code review skill
  - **Goal:** Document patterns for LLM-based code review (complementing pre-commit)
  - **Implementation:** Expand `skills/domains/code-quality/code-review-patterns.md`
  - **Coverage:** Regex capture groups, dead code detection, variable scope, security
  - **AC:** Skill includes comprehensive checklist and examples
  - **Priority:** HIGH (already partially done in CR-4.1, needs expansion)

### Medium Priority Prevention

- [ ] **POST-CR6.3** Implement documentation link validation
  - **Goal:** Prevent broken internal links (10 documentation issues across PRs)
  - **Implementation:** Script that validates all `[text](path)` links resolve to existing files
  - **Files:** `tools/validate_links.sh`, `.pre-commit-config.yaml`
  - **AC:** Script detects broken links in README.md, skills/, docs/
  - **Priority:** MEDIUM (recurring but non-breaking)

- [ ] **POST-CR6.4** Create code example validation system
  - **Goal:** Ensure code examples are runnable (8 broken examples in PR5, 2 in PR6)
  - **Implementation:** Extract code blocks from markdown, validate syntax, check imports/variables
  - **Files:** `tools/validate_examples.py`, `.pre-commit-config.yaml`
  - **AC:** Script identifies missing imports, undefined variables, syntax errors
  - **Priority:** MEDIUM (quality issue, not functional)

- [ ] **POST-CR6.7** Document prevention system architecture
  - **Goal:** Explain how prevention layers work together
  - **Implementation:** Create `docs/QUALITY_GATES.md`
  - **Coverage:** Pre-commit hooks → verifier → CodeRabbit → human review
  - **AC:** Document shows what each layer catches, with examples
  - **Priority:** MEDIUM (helps maintainers understand system)

### Low Priority Prevention

- [ ] **POST-CR6.5** Implement documentation-config sync validation
  - **Goal:** Keep README.md in sync with actual config files
  - **Implementation:** Script that compares documented flags/settings with real configs
  - **Files:** `tools/validate_doc_sync.sh`
  - **AC:** Script catches shell/README.md shfmt config mismatch (CR-6.4 type issues)
  - **Priority:** LOW (infrequent)

---
