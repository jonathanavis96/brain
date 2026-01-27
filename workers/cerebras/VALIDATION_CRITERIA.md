# Validation Criteria - Cerebras Worker

## Purpose

This file defines the quality gates, validation commands, and acceptance criteria for the Cerebras worker. These standards ensure consistent quality across all work and enable safe autonomous operation.

## Acceptance Criteria Source

The authoritative acceptance criteria are defined in:

- **Location:** `../../rules/AC.rules` (root level, shared with Ralph)
- **Protected by:** `../../.verify/ac.sha256` (hash guard)
- **Enforced by:** `verifier.sh` (runs automatically after each BUILD iteration)
- **Manual approvals:** `../../rules/MANUAL_APPROVALS.rules` (human-approved exceptions)

**Key Points:**

- AC.rules is hash-protected - human must update if changing rules
- Verifier runs automatically in loop.sh after BUILD mode
- Results injected into next iteration's prompt header
- Failed checks block iteration completion

---

## Quality Gates

### Gate 1: Syntax Validation

**All code must pass syntax checks before committing.**

```bash
# Shell scripts
shellcheck -e SC1091 -e SC2312 workers/cerebras/*.sh

# Python
python3 -m py_compile workers/cerebras/*.py

# Markdown
markdownlint workers/cerebras/**/*.md

# YAML
yamllint .github/workflows/*.yml
```

**Pass Criteria:**

- Zero shellcheck errors (warnings OK if documented)
- Python compiles without syntax errors
- Markdown lint passes (or issues auto-fixed)
- YAML is valid

### Gate 2: Acceptance Criteria

**All AC rules defined in AC.rules must pass.**

```bash
# Run verifier
cd workers/cerebras || exit
bash verifier.sh

# Check exit code
echo $?  # Must be 0

# View failures
bash render_ac_status.sh
```

**Pass Criteria:**

- All bug-fix rules pass (BugA.*, BugB.*, BugC.*)
- All hash guard rules pass (no unauthorized changes to protected files)
- Manual approval rules either pass OR have approved waivers

### Gate 3: Pre-Commit Hooks

**All pre-commit hooks must pass before committing.**

```bash
# Run all hooks
pre-commit run --all-files

# Individual hooks
pre-commit run shellcheck --all-files
pre-commit run markdownlint --all-files
pre-commit run ruff --all-files
pre-commit run trailing-whitespace --all-files
pre-commit run end-of-file-fixer --all-files
```

**Pass Criteria:**

- All configured hooks pass
- No files modified by hooks (or modifications reviewed and staged)

### Gate 4: Documentation

**Changes must be documented appropriately.**

| Change Type | Documentation Required |
|-------------|------------------------|
| New feature | Update README.md, add to NEURONS.md |
| Bug fix | Document in commit message |
| Breaking change | Update README.md, VALIDATION_CRITERIA.md, AGENTS.md |
| New script | Add usage docs, update README.md |
| Config change | Document in commit message |

### Gate 5: Testing

**Changes must be tested before committing.**

| Change Type | Testing Required |
|-------------|------------------|
| Shell script | Run with `bash -n`, execute with dry-run if available |
| Python script | Run `python3 -m py_compile`, test with `--help` flag |
| Loop changes | Test with `bash loop.sh --dry-run --iterations 1` |
| Verifier changes | Run manually: `bash verifier.sh` |
| Helper scripts | Test with `--help` or sample input |

---

## Pre-Commit Validation

### Quick Check (Fast - Run This First)

```bash
cd workers/cerebras || exit

# 1. Syntax check
bash -n *.sh

# 2. Quick lint
markdownlint *.md

# 3. Verifier
bash verifier.sh
```

### Full Check (Comprehensive - Before Push)

```bash
cd ~/code/brain

# 1. All pre-commit hooks
pre-commit run --all-files

# 2. Verifier
cd workers/cerebras && bash verifier.sh

# 3. Protected file hashes
sha256sum -c .verify/ac.sha256
sha256sum -c .verify/verifier.sha256
sha256sum -c .verify/loop.sha256
sha256sum -c .verify/prompt.sha256
sha256sum -c .verify/agents.sha256
```

### Auto-Fix Common Issues

```bash
# Auto-fix markdown
bash workers/cerebras/fix-markdown.sh workers/cerebras/*.md

# Auto-format shell (if needed)
shfmt -w -i 2 workers/cerebras/*.sh

# Auto-format python (if needed)
ruff format workers/cerebras/*.py
```

---

## Manual Verification

### Run Verifier Manually

```bash
cd workers/cerebras || exit
bash verifier.sh

# Expected output:
#   - Summary (pass/fail counts)
#   - Detailed failures (if any)
#   - Exit code 0 (all pass) or 1 (failures)
```

### Check Latest Results

```bash
# View full report
cat workers/cerebras/.verify/latest.txt

# View summary only
head -20 workers/cerebras/.verify/latest.txt

# Visualize results
bash workers/cerebras/render_ac_status.sh
```

### Verify Protected File Hashes

```bash
cd workers/cerebras || exit

# Check all hashes
sha256sum -c .verify/ac.sha256
sha256sum -c .verify/verifier.sha256
sha256sum -c .verify/loop.sha256
sha256sum -c .verify/prompt.sha256
sha256sum -c .verify/agents.sha256

# Regenerate if needed (AFTER getting human approval)
bash init_verifier_baselines.sh
```

---

## Definition of Done

### For Each Task

Before marking a task `[x]` complete, verify:

- [ ] **1. Functionality:** Code changes implemented and tested
- [ ] **2. Quality:** All acceptance criteria pass (`bash verifier.sh`)
- [ ] **3. Standards:** Pre-commit hooks pass (`pre-commit run --all-files`)
- [ ] **4. Documentation:** THUNK.md updated with completion entry
- [ ] **5. Planning:** `workers/IMPLEMENTATION_PLAN.md` task marked `[x]`
- [ ] **6. Atomicity:** Single commit with all changes (code + THUNK + PLAN)
- [ ] **7. Message:** Commit message follows conventional format
- [ ] **8. Attribution:** Co-authored-by line included

### Single Commit Rule

**One task = One commit** containing:

- Code changes (feature/fix)
- THUNK.md entry (what was done)
- IMPLEMENTATION_PLAN.md update (mark task [x])

**DO NOT:**

- Commit code separately from THUNK/PLAN
- Make "update THUNK" commits
- Make "mark task complete" commits

### For a Phase

Before marking a phase complete:

- [ ] All phase tasks marked `[x]`
- [ ] All phase commits pushed
- [ ] Phase documented in commit messages
- [ ] Next phase ready to start (if applicable)

---

## Commit Message Format

### Standard Format

```text
<type>(<scope>): <summary>

<body with details>

<footer with metadata>
```

### Example - Feature

```text
feat(cerebras): add verifier infrastructure

CRITICAL FIXES:
- Add verifier.sh (730 lines) - was broken, referenced but missing
- Add init_verifier_baselines.sh (85 lines) - automated setup
- Create complete .verify/ infrastructure

Path Adaptations:
- Changed all $RALPH to $CEREBRAS
- Updated all file paths to workers/cerebras

Testing:
- Verifier runs successfully
- All hash files created
- Infrastructure working correctly

Impact: Cerebras now has functional verification system
Next: Phase B - Add quality & monitoring tools

Co-authored-by: cerebras-worker <cerebras-worker@users.noreply.github.com>
Brain-Repo: jonathanavis96/brain
```

### Example - Fix

```text
fix(cerebras): correct path references in monitoring scripts

- Fix current_cerebras_tasks.sh to use correct IMPLEMENTATION_PLAN.md path
- Fix thunk_cerebras_tasks.sh to read from correct THUNK.md location
- All scripts now work correctly

Tested with manual runs - all scripts start successfully

Co-authored-by: cerebras-worker <cerebras-worker@users.noreply.github.com>
Brain-Repo: jonathanavis96/brain
```

### Types

| Type | When to Use |
|------|-------------|
| **feat** | New feature or capability |
| **fix** | Bug fix |
| **docs** | Documentation only changes |
| **refactor** | Code restructuring without behavior change |
| **chore** | Maintenance tasks (dependency updates, etc.) |
| **test** | Adding or fixing tests |
| **perf** | Performance improvements |

### Scopes

| Scope | When to Use |
|-------|-------------|
| **cerebras** | Changes to cerebras worker files |
| **templates** | Changes to templates/ directory |
| **skills** | Changes to skills/ directory |
| **plan** | Changes to IMPLEMENTATION_PLAN.md |
| **docs** | Changes to documentation |
| **tools** | Changes to tools/ utilities |

---

## Common Validation Errors

### ShellCheck Errors

| Error | Skill to Consult |
|-------|------------------|
| SC2034 (unused variable) | `skills/domains/languages/shell/variable-patterns.md` |
| SC2155 (declare and assign) | `skills/domains/languages/shell/variable-patterns.md` |
| SC2086 (unquoted variable) | `skills/domains/languages/shell/common-pitfalls.md` |
| SC2312 (command in condition) | `skills/domains/languages/shell/validation-patterns.md` |

**Quick Fix:**

```bash
# Run shellcheck
shellcheck -e SC1091 workers/cerebras/*.sh

# Common fixes:
# - Add quotes: "$var" instead of $var
# - Use _ prefix for unused: _unused_var
# - Separate declare and assign
```

### Markdown Lint Errors

| Error | Skill to Consult |
|-------|------------------|
| MD040 (missing language) | `skills/domains/code-quality/markdown-patterns.md` |
| MD024 (duplicate headings) | `skills/domains/code-quality/markdown-patterns.md` |
| MD032 (blanks around lists) | `skills/domains/code-quality/markdown-patterns.md` |

**Quick Fix:**

```bash
# Auto-fix most issues
bash workers/cerebras/fix-markdown.sh workers/cerebras/*.md

# Remaining issues need manual fixes
markdownlint workers/cerebras/*.md
```

### Verifier Failures

| Failure Type | How to Fix |
|--------------|------------|
| Bug checks (BugA.*, BugB.*) | Implement the required fix (check AC.rules for details) |
| Hash guard failures | Protected file changed - human must approve and update hash |
| Manual approval needed | Add entry to rules/MANUAL_APPROVALS.rules |

**Quick Fix:**

```bash
# View failures
bash workers/cerebras/render_ac_status.sh

# Check specific rule
grep "BugA.1" rules/AC.rules

# See rule requirements
cat rules/AC.rules | grep -A10 "rule_id=BugA.1"
```

---

## Error Recovery

### Verifier Fails After Commit

```bash
# 1. Check what failed
bash workers/cerebras/render_ac_status.sh

# 2. Fix issues
# (make necessary changes)

# 3. Amend commit
git add -A
git commit --amend --no-edit

# 4. Verify fix
bash workers/cerebras/verifier.sh
```

### Protected File Modified Accidentally

```bash
# 1. Restore original
git checkout HEAD -- workers/cerebras/loop.sh

# 2. If change was intentional, human must:
#    - Approve the change
#    - Regenerate hashes
bash workers/cerebras/init_verifier_baselines.sh
```

### Pre-Commit Hook Fails

```bash
# 1. Check which hook failed
pre-commit run --all-files

# 2. Fix issues (hooks may auto-fix)
git add -A

# 3. Retry commit
git commit -m "your message"
```

---

## Continuous Validation

### During Development

```bash
# After each file change
bash -n workers/cerebras/script.sh  # Syntax check

# After each feature
bash workers/cerebras/verifier.sh   # Full validation
```

### Before Committing

```bash
# Full validation suite
pre-commit run --all-files && \
  cd workers/cerebras && bash verifier.sh
```

### After Pushing

```bash
# Verify CI passes (if configured)
# Check GitHub Actions / CI status
```

---

## See Also

- **[../../rules/AC.rules](../../rules/AC.rules)** - Acceptance criteria definitions
- **[../../rules/MANUAL_APPROVALS.rules](../../rules/MANUAL_APPROVALS.rules)** - Human-approved exceptions
- **[../../skills/SUMMARY.md](../../skills/SUMMARY.md)** - Skills knowledge base with error reference
- **[../../skills/domains/code-quality/code-hygiene.md](../../skills/domains/code-quality/code-hygiene.md)** - Detailed DoD checklist
- **[../../skills/domains/code-quality/testing-patterns.md](../../skills/domains/code-quality/testing-patterns.md)** - Testing guidelines
- **[verifier.sh](verifier.sh)** - Verifier implementation
- **[README.md](README.md)** - Comprehensive usage guide
