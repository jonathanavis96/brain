# Protected File Hash Validation

## Overview

The brain repository uses SHA256 hash validation to protect critical infrastructure files from unauthorized modifications. This system prevents "edit the judge" attacks where an agent might modify verification scripts or acceptance criteria.

## Protected Files

The following files are protected by hash guards:

### Workers/Ralph Directory

- `workers/ralph/loop.sh` - Ralph loop orchestration
- `workers/ralph/verifier.sh` - Acceptance criteria verification
- `workers/ralph/PROMPT.md` - Ralph system prompt
- `workers/ralph/AGENTS.md` - Ralph operational guide

### Root Directory

- `rules/AC.rules` - Acceptance criteria definitions
- `AGENTS.md` - Repository operational guide (root level)
- `loop.sh` - Loop script (if exists at root)
- `verifier.sh` - Verifier script (if exists at root)
- `PROMPT.md` - Prompt (if exists at root)

## Hash Files

Baseline hashes are stored in `.verify/` directories:

```text
.verify/
├── ac.sha256          # rules/AC.rules
├── agents.sha256      # AGENTS.md (root)
├── loop.sha256        # loop.sh (root)
├── prompt.sha256      # PROMPT.md (root)
└── verifier.sha256    # verifier.sh (root)

workers/ralph/.verify/
├── ac.sha256          # rules/AC.rules (copy)
├── agents.sha256      # workers/ralph/AGENTS.md
├── loop.sha256        # workers/ralph/loop.sh
├── prompt.sha256      # workers/ralph/PROMPT.md
└── verifier.sha256    # workers/ralph/verifier.sh
```

## Validation Layers

### 1. Pre-commit Hook (NEW)

**File:** `tools/validate_protected_hashes.sh`  
**Trigger:** Before every git commit  
**Behavior:**

- **FAIL (blocks commit):** Protected file is staged with hash mismatch
- **WARN (allows commit):** Protected file modified but not staged
- **PASS:** All staged protected files match baseline hashes

**Usage:**

```bash
# Automatic (pre-commit hook)
git commit -m "message"

# Manual validation
bash tools/validate_protected_hashes.sh

# Bypass (EMERGENCY ONLY - requires justification)
git commit --no-verify -m "emergency: reason"
```

### 2. Verifier Checks (Runtime)

**File:** `workers/ralph/verifier.sh`  
**Trigger:** After every BUILD iteration  
**Checks:** `Protected.1`, `Protected.2`, `Protected.3`, `Protected.4` in `rules/AC.rules`

**Behavior:**

- Compares current file hash against baseline
- Reports `[FAIL]` or `[WARN]` depending on gate setting
- Blocks Ralph loop progression if gate=block

## When to Update Hashes

### Legitimate Updates (Human Only)

Protected files should only be modified by humans with explicit justification:

1. **Bug fixes:** Critical fixes to loop.sh or verifier.sh
2. **Feature additions:** New acceptance criteria in AC.rules
3. **Documentation updates:** Clarifications in PROMPT.md or AGENTS.md

**Process:**

```bash
# 1. Make the change
vim workers/ralph/loop.sh

# 2. Regenerate hash
sha256sum workers/ralph/loop.sh > workers/ralph/.verify/loop.sha256

# 3. Commit both
git add workers/ralph/loop.sh workers/ralph/.verify/loop.sha256
git commit -m "fix(ralph): description of change"

# 4. Document in commit message
# Include rationale and scope of change
```

### Automatic Hash Regeneration

The verifier can auto-regenerate hashes for **lint-only changes** (see `auto_regen_protected_hash()` in verifier.sh):

**Safe patterns:**

- Adding `-r` flag to `read` commands (SC2162)
- Quoting variables (SC2086)
- Adding blank lines (MD032)
- Adding language tags to fences (MD040)

**Process:** Verifier detects safe change → regenerates hash → continues

## Bypass Mechanisms

### 1. Git Commit Bypass

```bash
git commit --no-verify -m "emergency: critical production fix"
```

**When to use:** NEVER in normal workflow. Only for emergency fixes when:

- Pre-commit hooks are broken
- Critical production issue requires immediate fix
- Hash files corrupted and need recovery

### 2. Waiver System

For verifier failures, use the waiver protocol:

```bash
cd workers/ralph
bash ../.verify/request_waiver.sh Protected.1 "Reason for override"
```

See `docs/WAIVER_PROTOCOL.md` for full process.

## Troubleshooting

### "Hash mismatch" Error on Commit

**Symptom:**

```text
[FAIL] workers/ralph/loop.sh (staged with hash mismatch)
  Expected: abc123...
  Current:  def456...
```

**Solutions:**

1. **If change is intentional:**

   ```bash
   sha256sum workers/ralph/loop.sh > workers/ralph/.verify/loop.sha256
   git add workers/ralph/.verify/loop.sha256
   ```

2. **If change is accidental:**

   ```bash
   git checkout workers/ralph/loop.sh
   ```

3. **To understand what changed:**

   ```bash
   git diff workers/ralph/loop.sh
   ```

### Pre-commit Hook Not Running

**Check installation:**

```bash
pre-commit install
pre-commit run validate-protected-hashes --all-files
```

**Manual test:**

```bash
bash tools/validate_protected_hashes.sh
```

### Hash File Missing

**Symptom:** `[FAIL] file.sh (hash file missing: .verify/file.sha256)`

**Fix:**

```bash
# Generate baseline hash
sha256sum workers/ralph/loop.sh > workers/ralph/.verify/loop.sha256
```

### Verifier Shows Protected.X Warning

**Check current status:**

```bash
cd workers/ralph
bash verifier.sh
```

**Read injected status:** Look for `# VERIFIER STATUS` section in Ralph's prompt

**Action:**

- If `[WARN]` with "human review required" → Human must regenerate hashes
- If `[FAIL]` → Ralph cannot proceed until fixed

## Prevention Impact

**Before POST-CR6.1:**

- 8 hash mismatches in PR5
- 1 hash mismatch in PR6
- Manual detection only at PR review time

**After POST-CR6.1:**

- Pre-commit validation blocks commits with hash mismatches
- Immediate feedback to developer
- Reduces PR review overhead

## Related Systems

- **Waiver Protocol:** `docs/WAIVER_PROTOCOL.md` - Override mechanism for false positives
- **Verifier:** `workers/ralph/verifier.sh` - Runtime validation
- **AC Rules:** `rules/AC.rules` - Protection checks (Protected.1-4)
- **Pre-commit Config:** `.pre-commit-config.yaml` - Hook integration

## Testing

**Smoke test:**

```bash
# Should pass (no staged changes)
bash tools/validate_protected_hashes.sh

# Should warn (modified but not staged)
echo "# test" >> workers/ralph/loop.sh
bash tools/validate_protected_hashes.sh
git checkout workers/ralph/loop.sh

# Should fail (staged with mismatch)
echo "# test" >> workers/ralph/loop.sh
git add workers/ralph/loop.sh
bash tools/validate_protected_hashes.sh
git reset HEAD workers/ralph/loop.sh
git checkout workers/ralph/loop.sh
```

**Pre-commit integration test:**

```bash
pre-commit run validate-protected-hashes --all-files
```

## Future Enhancements

**Planned improvements:**

1. **Automatic PR comment:** Add hash validation results to PR description
2. **Change analysis:** Show diff summary when hash mismatch detected
3. **Multi-sig approval:** Require 2+ human approvals for protected file changes
4. **Audit log:** Track all hash regenerations with timestamps and justifications
