# Quality Gates - Prevention System Architecture

**Last Updated:** 2026-01-26

## Overview

The brain repository uses a multi-layered quality gate system to prevent issues before they reach code review. Each layer catches different types of problems, creating defense in depth.

## Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                     Developer Workflow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Pre-commit Hooks (Automated - Blocking)           │
│  - Shellcheck (shell script linting)                        │
│  - shfmt (shell formatting check)                            │
│  - markdownlint (markdown validation)                        │
│  - ruff (Python linting & formatting)                        │
│  - bats unit tests (shell script logic)                      │
│  - validate-links (broken link detection)                    │
│  - validate-code-examples (code syntax validation)           │
│  - validate-protected-hashes (SHA256 integrity)              │
│  - detect-secrets (security scanning)                        │
│  - File hygiene (trailing whitespace, EOF newlines)          │
└─────────────────────────────────────────────────────────────┘
                              │
                     ✓ All checks pass
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Git Commit Created                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Ralph Verifier (Automated - Blocking/Warning)     │
│  - Protected file integrity (hash validation)                │
│  - Anti-cheat checks (no dismissive language)                │
│  - Code hygiene (unused vars, dead code)                     │
│  - Terminology consistency (kb → skills migration)           │
│  - Markdown structure validation                             │
│  - Template sync verification                                │
│  - Waiver governance (approval tracking)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                     ✓ PASS or WARN only
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Ralph Loop Continues (BUILD mode)               │
└─────────────────────────────────────────────────────────────┘
                              │
                     Work complete (push)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: CodeRabbit AI Review (Automated - Advisory)       │
│  - Semantic code analysis                                    │
│  - Logic bug detection                                       │
│  - Security vulnerability scanning                           │
│  - Best practice violations                                  │
│  - Code complexity analysis                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                     ✓ Review complete
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Human Review (Manual - Final Gate)                │
│  - Strategic alignment check                                 │
│  - Edge case reasoning                                       │
│  - User experience validation                                │
│  - Architectural decisions                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                     ✓ Approved & merged
                              ▼
                         Production
```

## Layer Details

### Layer 1: Pre-commit Hooks

**Purpose:** Catch syntax errors, formatting issues, and obvious bugs before commit.

**Trigger:** Runs automatically on `git commit`

**Configuration:** `.pre-commit-config.yaml`

**What It Catches:**

| Check | Issue Type | Example |
|-------|-----------|---------|
| shellcheck | Shell script bugs | Unused variables (SC2034), unquoted variables (SC2086) |
| shfmt | Shell formatting | Inconsistent indentation, missing spaces |
| markdownlint | Markdown structure | Missing code fence tags (MD040), blank lines around lists (MD032) |
| ruff | Python errors | Syntax errors, import issues, undefined names |
| bats-tests | Shell logic bugs | Flag parsing errors, incorrect exit codes |
| validate-links | Broken links | Links to non-existent files or anchors |
| validate-code-examples | Invalid code | Missing imports, undefined variables, syntax errors |
| validate-protected-hashes | File integrity | SHA256 hash mismatches for protected files |
| detect-secrets | Security | API keys, tokens, passwords in code |
| File hygiene | Whitespace issues | Trailing whitespace, missing EOF newlines |

**Bypass:** `git commit --no-verify` (not recommended - only for emergencies)

**Example Output:**

```text
shellcheck..............................................................Failed
- hook id: shellcheck
- exit code: 1

In workers/ralph/loop.sh line 480:
  export RUN_ID=$(date +%s)
              ^-----------^ SC2155: Declare and assign separately

markdownlint............................................................Failed
- hook id: markdownlint
- exit code: 1

skills/domains/backend/api-design-patterns.md:42 MD040/fenced-code-language
Code block missing language tag
```

### Layer 2: Ralph Verifier

**Purpose:** Enforce project-specific rules and prevent "edit the judge" attacks.

**Trigger:** Runs after each BUILD iteration in `workers/ralph/loop.sh`

**Configuration:** `rules/AC.rules` (protected by hash guard)

**What It Catches:**

| Category | Rules | Issue Type | Example |
|----------|-------|-----------|---------|
| Protected Files | Protected.1-4 | File integrity | loop.sh modified without updating hash |
| Anti-Cheat | AntiCheat.1-5 | Dismissive language | "by design", "works as intended" |
| Code Hygiene | Hygiene.Shellcheck.1-4 | Dead code | Unused variables (SC2034), local var masking (SC2155) |
| Terminology | Hygiene.TermSync.1-3 | Outdated terms | References to "kb/" instead of "skills/" |
| Markdown | Hygiene.Markdown.1 | Structure issues | Duplicate H2 headings in IMPLEMENTATION_PLAN.md |
| Linting | Lint.Shellcheck.* | Tool integration | Shellcheck issues in core scripts |
| Linting | Lint.Markdownlint.* | Tool integration | Markdownlint issues in key docs |
| Waiver | Waiver.* | Governance | Unapproved waiver requests in use |
| Cortex | Cortex.FileSizeLimit.* | Bloat prevention | THOUGHTS.md exceeds 100 lines |

**Gate Types:**

- `gate=block`: Must pass, loop stops if failed
- `gate=warn`: Advisory only, allows continuation

**Example Output:**

```text
SUMMARY
  PASS: 54
  FAIL: 1
  WARN: 2
  SKIP: 0

[FAIL] Protected.1 (loop.sh hash mismatch - human review required)
[WARN] Hygiene.Shellcheck.1 (SC2034 in current_ralph_tasks.sh)
[WARN] Cortex.FileSizeLimit.THOUGHTS (105 lines, max 100)
```

**Waiver System:** False positives can be waived via `workers/.verify/request_waiver.sh` (requires human approval via OTP)

### Layer 3: CodeRabbit AI Review

**Purpose:** Deep semantic analysis that catches logic bugs, security issues, and best practice violations.

**Trigger:** Runs automatically on pull request creation/update

**Configuration:** `.coderabbit.yaml` (not in this repo - platform config)

**What It Catches:**

| Category | Issue Type | Example |
|----------|-----------|---------|
| Logic Bugs | Control flow errors | Flag parsing consuming next option as value |
| Security | Vulnerabilities | SQL injection in example code, hardcoded credentials |
| Best Practices | Anti-patterns | PostgreSQL placeholder mismatch ($1 vs $2) |
| Code Quality | Complexity issues | Deeply nested conditionals, long functions |
| Documentation | Accuracy issues | README documenting config that doesn't match actual file |
| Completeness | Missing elements | Code examples missing imports or variable definitions |

**Example Issues from PR5/PR6:**

- **C1-C8:** Hash mismatches (8 instances in PR5, 1 in PR6)
- **M1:** Flag parsing bug in `bin/brain-event` lines 84-125
- **m2:** PostgreSQL placeholder mismatch in observability-patterns.md
- **m4:** Incorrect dates in documentation (2026-01-25 should be 2026-01-24)
- **C2:** README documenting shfmt config that doesn't match `.pre-commit-config.yaml`
- **C3:** Broken links to non-existent typescript README
- **C4:** Missing imports in Python examples (deployment-patterns.md)

**Advisory Nature:** CodeRabbit comments don't block PRs, but should be addressed before merge.

### Layer 4: Human Review

**Purpose:** Final sanity check for strategic alignment, edge cases, and user experience.

**Trigger:** Manual review before PR merge

**What Humans Check:**

1. **Strategic Alignment**
   - Does this change align with brain repository goals?
   - Does it fit the Ralph loop design philosophy?
   - Should this be in brain vs a different repo?

2. **Edge Cases**
   - What happens if file doesn't exist?
   - How does this behave with empty input?
   - What about WSL vs native Linux differences?

3. **User Experience**
   - Is error output helpful?
   - Are success messages clear?
   - Will new contributors understand this?

4. **Architectural Decisions**
   - Does this create tech debt?
   - Should this be configurable vs hardcoded?
   - Is this the right abstraction level?

5. **Hash Updates**
   - For protected file changes: Regenerate SHA256 hashes
   - Verify changes are intentional and safe
   - Update `.verify/*.sha256` baselines

**Human-Only Actions:**

- Updating `.verify/*.sha256` hash files
- Approving waiver requests via OTP
- Merging pull requests
- Creating new phases in IMPLEMENTATION_PLAN.md

## Prevention System Effectiveness

### Issues Caught Per Layer (PR5 + PR6 Analysis)

**Layer 1 (Pre-commit) - Should Catch:**

- ✓ Shellcheck issues (SC2034, SC2155, SC2162, SC2086, SC2002)
- ✓ Markdown formatting (MD040, MD032, MD056, MD060)
- ✓ Python syntax errors
- ✓ Broken internal links
- ✓ Code examples with syntax errors
- ✓ Hash mismatches for protected files

**Layer 2 (Verifier) - Catches:**

- ✓ Protected file modifications (hash guards)
- ✓ Anti-cheat language patterns
- ✓ Dead code (unused variables)
- ✓ Terminology migration issues
- ✓ Template sync divergence
- ~ Some shellcheck issues (warn gate only)

**Layer 3 (CodeRabbit) - Catches:**

- ✓ Logic bugs (flag parsing, control flow)
- ✓ Security issues (SQL injection, hardcoded values)
- ✓ Documentation accuracy (config mismatches)
- ✓ Incomplete code examples (missing imports)
- ✓ Semantic correctness (placeholder mismatches)

**Layer 4 (Human) - Catches:**

- ✓ Strategic misalignment
- ✓ Architectural concerns
- ✓ User experience issues
- ✓ Protected file hash regeneration needed

### Coverage Gaps (Addressed in POST-CR6 Phase)

These issues slipped through to CodeRabbit in PR5/PR6:

1. **Hash Mismatches (9 instances)** → POST-CR6.1 added hash validation pre-commit hook
2. **Logic Bugs (7 instances)** → POST-CR6.2 added bats unit test framework
3. **Broken Links (10 instances)** → POST-CR6.3 added link validation script
4. **Invalid Code Examples (10 instances)** → POST-CR6.4 added code example validator
5. **Documentation-Config Drift (1 instance)** → POST-CR6.5 added sync validator (low priority)

**Result:** POST-CR6 prevention systems move 30+ issue types from Layer 3 → Layer 1, catching them before commit.

## How To Use This System

### For Developers

**Before committing:**

```bash
# Install pre-commit hooks (one-time setup)
pip install pre-commit
pre-commit install

# Validate your changes
pre-commit run --all-files
```

**If pre-commit fails:**

1. Read the error message carefully
2. Fix the issue (don't use `--no-verify` to bypass)
3. Run `pre-commit run --all-files` again
4. Commit when all checks pass

**If Ralph verifier fails:**

1. Check the `# VERIFIER STATUS` section in next iteration prompt
2. Fix the failing rule (listed in `# FAILED_RULES:`)
3. Commit fix with message: `fix(ralph): resolve AC failure <RULE_ID>`
4. Ralph auto-reruns verifier after your fix

**If CodeRabbit flags an issue:**

1. Review the comment and assess validity
2. If valid: Fix the issue and push update
3. If false positive: Reply with rationale (human reviews)
4. Address all comments before requesting merge

### For Ralph Loop

**Verifier-first workflow:**

1. Auto-fix runs before every BUILD iteration:
   - `workers/ralph/fix-markdown.sh` (fixes ~40-60% of markdown issues)
   - `pre-commit run --all-files` (fixes shell/python/yaml issues)
   - `verifier.sh` (checks remaining state)

2. Ralph receives verifier status in prompt header

3. If `[FAIL]` present: Ralph must fix before new tasks

4. If `[WARN]` present: Ralph adds to "Phase 0-Warn" section in IMPLEMENTATION_PLAN.md

5. Ralph fixes one warning/task per iteration

**Waiver protocol:**

If verifier shows false positive:

```bash
cd workers/.verify
bash request_waiver.sh <RULE_ID> "reason for waiver"
# Creates waiver_requests/WVR-YYYY-MM-DD-NNN.json
# Human reviews and approves via launch_approve_waiver.sh (OTP required)
```

### For Maintainers

**Adding new pre-commit hooks:**

1. Edit `.pre-commit-config.yaml`
2. Add new hook under appropriate section
3. Test with `pre-commit run --all-files`
4. Document in this file under Layer 1

**Adding new verifier rules:**

1. Edit `rules/AC.rules` (protected file - requires human)
2. Add rule in INI format:

   ```ini
   [RuleCategory.RuleName]
   mode=auto
   gate=block          # or gate=warn
   desc=Human readable description
   cmd=command to run
   expect_stdout=expected output
   ```

3. Regenerate hash: `sha256sum rules/AC.rules > .verify/ac.sha256`
4. Test with `bash workers/ralph/verifier.sh`
5. Document in this file under Layer 2

**Reviewing CodeRabbit comments:**

1. For each comment thread:
   - ✓ Valid issue → Request developer fix
   - ✓ False positive → Explain rationale, dismiss
   - ✓ Unclear → Ask developer for clarification

2. Before merge checklist:
   - [ ] All valid issues addressed
   - [ ] False positives documented
   - [ ] Strategic alignment confirmed
   - [ ] No unresolved discussions

## Common Issues & Solutions

### "Pre-commit hook failed but I need to commit urgently"

**Wrong:** `git commit --no-verify` (bypasses all checks)

**Right:**

1. Fix the issue properly (takes 2-5 minutes usually)
2. If truly urgent and unfixable: `git commit --no-verify` + create follow-up task
3. Document why bypass was needed in commit message

### "Verifier shows hash mismatch for protected file"

**Cause:** You or Ralph modified loop.sh, verifier.sh, PROMPT.md, or AGENTS.md

**Solution:**

1. **If unintentional:** Revert the change
2. **If intentional:** Create `SPEC_CHANGE_REQUEST.md` and stop (human must review)
3. **If human approves:** Human regenerates hash:

   ```bash
   cd workers/ralph
   sha256sum loop.sh | cut -d' ' -f1 > .verify/loop.sha256
   ```

### "CodeRabbit flagged something that's actually correct"

**Process:**

1. Reply to CodeRabbit comment with explanation
2. Tag human reviewer with `@username`
3. Human reviews and dismisses if valid explanation
4. Do NOT add "FALSE POSITIVE" notes to code

### "Pre-commit hook shows 'command not found'"

**Cause:** Hook requires tool not installed (shellcheck, markdownlint, bats)

**Solution:**

```bash
# Install all linters
bash setup-linters.sh

# Or install specific tool
brew install shellcheck    # macOS
apt install shellcheck     # Ubuntu/Debian
```

## Prevention System Evolution

### Phase 1: Manual Review Only (Pre-2025)

- Human caught all issues
- High cognitive load
- ~30% of issues reached production

### Phase 2: Pre-commit + Verifier (2025 Q1)

- Automated syntax/formatting checks
- Protected file integrity
- ~15% of issues reached CodeRabbit

### Phase 3: CodeRabbit Integration (2025 Q2-Q3)

- AI-powered semantic analysis
- Logic bug detection
- Identified recurring patterns (50+ issues in PR5)

### Phase 4: Prevention Systems (2026-01-26 - Current)

- POST-CR6 prevention systems (hash validation, unit tests, link validation, code example validation)
- Move 30+ issue types from Layer 3 → Layer 1
- Target: <5% of issues reach CodeRabbit

### Phase 5: Self-Learning (Future)

- Gap radar auto-creates skills from errors
- Issue pattern database feeds prevention rules
- Verifier rules auto-generated from CodeRabbit patterns

## See Also

- **[docs/CODERABBIT_ISSUES_TRACKER.md](CODERABBIT_ISSUES_TRACKER.md)** - Issue inventory from PR5/PR6
- **[rules/AC.rules](../rules/AC.rules)** - Verifier rule definitions
- **[.pre-commit-config.yaml](../.pre-commit-config.yaml)** - Pre-commit hook configuration
- **[skills/domains/code-quality/code-review-patterns.md](../skills/domains/code-quality/code-review-patterns.md)** - Semantic review checklist
- **[workers/ralph/VALIDATION_CRITERIA.md](../workers/ralph/VALIDATION_CRITERIA.md)** - Quality gates and validation commands
- **[docs/WAIVER_PROTOCOL.md](../workers/ralph/docs/WAIVER_PROTOCOL.md)** - How to request waivers for false positives
