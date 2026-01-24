# Cortex Operations Runbook

## Purpose

This runbook provides operational guidance for running Cortex (the Brain's manager) and Ralph (the worker), troubleshooting common issues, and understanding when to escalate to human intervention.

## How to Start Cortex

Cortex is the high-level planning and management layer for the Brain repository.

```bash
cd /path/to/brain/cortex/
bash run.sh
```text

**What Cortex does:**

- Reviews current mission and progress via `snapshot.sh`
- Updates `IMPLEMENTATION_PLAN.md` with high-level tasks
- Delegates work to Ralph by creating Task Contracts
- Reviews completed work and adjusts plans

**What Cortex can modify:**

- `IMPLEMENTATION_PLAN.md` (task planning)
- `THOUGHTS.md` (strategic analysis)
- `GAP_BACKLOG.md` (knowledge gaps)
- `SKILL_BACKLOG.md` (skill promotion)

**What Cortex CANNOT modify:**

- `PROMPT.md`, `loop.sh`, `verifier.sh` (protected by hash guards)
- Source code in `skills/`, `templates/`, or worker directories
- Acceptance criteria (`rules/AC.rules`)

## How to Start Ralph

Ralph is the tactical worker who executes individual tasks from the implementation plan.

```bash
cd /path/to/brain/workers/ralph/
bash loop.sh                    # Single iteration
bash loop.sh --iterations 10    # Multiple iterations (10 BUILD/PLAN cycles)
bash loop.sh --dry-run          # Preview changes without committing
bash loop.sh --resume           # Resume from interruption
```text

**Modes:**

- **PLAN mode:** Iteration 1 or every 3rd iteration - updates IMPLEMENTATION_PLAN.md, pushes commits
- **BUILD mode:** All other iterations - picks ONE task, implements, commits locally (no push)

**Stop sentinel:** Ralph outputs `:::COMPLETE:::` only when ALL tasks are done (managed by `loop.sh`, not Ralph himself)

## Task Monitors

Monitor Ralph's progress in real-time using these tools:

### Current Ralph Tasks Monitor

```bash
cd /path/to/brain/workers/ralph/
bash current_ralph_tasks.sh
```text

Shows pending `[ ]` tasks from `IMPLEMENTATION_PLAN.md`, organized by priority.

**Hotkeys:**

- `h` - Hide/show completed tasks
- `r` - Archive completed tasks
- `f` - Force refresh display
- `c` - Clear screen
- `?` - Help
- `q` - Quit

### THUNK Monitor (Completed Tasks)

```bash
cd /path/to/brain/workers/ralph/
bash thunk_ralph_tasks.sh
```text

Shows completed task log from `THUNK.md` (append-only).

**Hotkeys:**

- `r` - Refresh/clear display
- `e` - Start new era
- `q` - Quit

## Verification Commands

### Verifier Status

Check the latest verifier results:

```bash
cd /path/to/brain/workers/ralph/
cat .verify/latest.txt
```text

Look for:

- `[PASS]` - All checks passed
- `[FAIL]` - Acceptance criteria violated (Ralph must fix before continuing)
- `[WARN]` - Non-blocking warnings (should be tracked in IMPLEMENTATION_PLAN.md)

### Run Verifier Manually

```bash
cd /path/to/brain/workers/ralph/
bash verifier.sh
```text

### Maintenance Check

```bash
cd /path/to/brain/
bash .maintenance/verify-brain.sh
```text

Checks for:

- File count drift in NEURONS.md
- Documentation accuracy
- Template sync issues

## Troubleshooting

### Ralph Issues

#### Issue: Loop doesn't stop

**Symptom:** Ralph keeps running even though tasks appear complete  
**Check:** Does `IMPLEMENTATION_PLAN.md` have any unchecked `[ ]` tasks?  
**Fix:** Ensure ALL tasks are marked `[x]`, including subsections and nested tasks

#### Issue: Ralph batches multiple tasks

**Symptom:** Ralph completes more than one task per BUILD iteration  
**Root cause:** Violates PROMPT.md "EXACTLY ONE task" rule  
**Fix:** This is a Ralph execution error - review PROMPT.md emphasis on single-task iterations

#### Issue: Verifier fails with `Protected.*` errors

**Symptom:** `.verify/latest.txt` shows `[FAIL] Protected.1`, `Protected.2`, or `Protected.3`  
**Root cause:** Protected file hash mismatch (loop.sh, verifier.sh, or PROMPT.md was modified)  
**Action:** **HUMAN INTERVENTION REQUIRED** - Ralph cannot fix this. Report to human operator.

#### Issue: Verifier fails with `Hygiene.Shellcheck.*` errors

**Symptom:** SC2034 (unused variable) or SC2155 (declare and assign separately)  
**Check:** `.verify/latest.txt` for specific file and line number  
**Fix:** Consult `skills/domains/languages/shell/variable-patterns.md` and fix the code  
**Commit:** `fix(ralph): resolve AC failure <RULE_ID>`

#### Issue: Verifier fails with `Hygiene.Markdown.*` errors

**Symptom:** Missing code fence language tags or duplicate headings  
**Check:** `.verify/latest.txt` for specific file  
**Fix:** Consult `skills/domains/code-quality/markdown-patterns.md`  
**Common fixes:**

- Add language tag: ` ```bash ` instead of ` ``` `
- Remove duplicate headings in same file

#### Issue: Wrong mode (PLAN vs BUILD)

**Symptom:** Ralph is planning when he should build, or vice versa  
**Check:** Iteration number - iteration 1 or every 3rd = PLAN, others = BUILD  
**Fix:** Adjust `--iterations` parameter or wait for next PLAN cycle

#### Issue: "acli not found"

**Fix:** Add Atlassian CLI to PATH in `~/.bashrc`:

```bash
export PATH="$PATH:/path/to/atlassian-cli/bin"
source ~/.bashrc
```text

### Cortex Issues

#### Issue: Cortex creates invalid Task Contracts

**Symptom:** Ralph doesn't understand task requirements  
**Check:** Does contract follow the template in `CORTEX_SYSTEM_PROMPT.md`?  
**Required fields:**

- Goal (what to achieve)
- Subtasks (numbered list)
- Constraints (what NOT to do)
- Inputs (files/context needed)
- Acceptance Criteria (how to verify)
- If Blocked (escalation path)

#### Issue: Cortex modifies protected files

**Symptom:** Verifier fails with `Protected.*` errors after Cortex runs  
**Root cause:** Cortex violated modification scope rules  
**Action:** **HUMAN INTERVENTION REQUIRED** - Review Cortex execution logs

### General Issues

#### Issue: Git push rejected

**Symptom:** `! [rejected] branch-name -> branch-name (fetch first)`  
**Fix:**

```bash
git pull --rebase origin branch-name
git push
```text

#### Issue: Merge conflicts

**Symptom:** Git reports conflicts during pull/rebase  
**Fix:**

```bash
git status                          # See conflicted files
# Manually resolve conflicts in editor
git add <resolved-files>
git rebase --continue               # If rebasing
# OR
git commit                          # If merging
```text

#### Issue: Bootstrap generator fails

**Symptom:** `new-project.sh` or `generate-*.sh` fails  
**Check:** Required fields in idea file (Project, Tech Stack, Purpose)  
**Fix:** Ensure idea template has all required fields populated

#### Issue: GitHub CLI not authenticated

**Symptom:** `new-project.sh` fails with GitHub API errors  
**Fix:**

```bash
gh auth login
```text

## What to Do If Blocked

### If Ralph is blocked

1. **Check IMPLEMENTATION_PLAN.md** - Is the task description clear and complete?
2. **Check acceptance criteria** - Are they testable and specific?
3. **Check THOUGHTS.md** - Is the strategic context clear?
4. **Create issue** - If task is ambiguous, create `SPEC_CHANGE_REQUEST.md` and STOP

### If Cortex is blocked

1. **Review snapshot output** - Is the current state accurately captured?
2. **Review DECISIONS.md** - Are architectural decisions documented?
3. **Review THUNK.md** - Is work being completed but not reflected in plans?
4. **Escalate to human** - If unable to resolve, document the blocker and stop

### If verifier blocks progress

1. **Read `.verify/latest.txt`** carefully - Identify exact rule that failed
2. **Consult skills** - Look up fix in `skills/SUMMARY.md` → specific domain skill
3. **Apply fix** - Make minimum necessary change
4. **Re-run verifier** - Confirm fix resolved the issue
5. **If unfixable** - Request waiver using `.verify/request_waiver.sh` (requires human approval)

### If unsure

**STOP and document the uncertainty.** Better to pause and clarify than to make wrong assumptions.

## Waiver Protocol (False Positives)

If a hygiene gate fails but the failure is a **legitimate exception**, request a waiver:

```bash
cd /path/to/brain/workers/ralph/
./.verify/request_waiver.sh <RULE_ID> <FILE_PATH> "<REASON>"
```text

Example:

```bash
./.verify/request_waiver.sh Hygiene.MarkdownFenceLang docs/snippets.md \
  "File intentionally uses plain fences for copy/paste UX"
```text

**Important:** Only humans can approve waivers (requires TOTP). Ralph/Cortex can only REQUEST waivers.

## See Also

- **CORTEX_SYSTEM_PROMPT.md** - Cortex identity and rules
- **REPO_MAP.md** - Brain repository navigation guide
- **DECISIONS.md** - Architectural decisions and stability anchor
- **../ralph/AGENTS.md** - Ralph operational guide and validation commands
- **../ralph/PROMPT.md** - Ralph's instructions (PLAN/BUILD protocols)
- **../skills/SUMMARY.md** - Skills knowledge base overview
- **../skills/domains/ralph/ralph-patterns.md** - Ralph loop architecture
