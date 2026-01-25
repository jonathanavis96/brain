# Cortex Prompt Reference

Detailed rules, examples, and troubleshooting. Read on-demand, not injected.

---

## IMPLEMENTATION_PLAN.md Formatting Rules

### Phase Sections Required

```markdown
## Phase 0-Warn: Verifier Warnings
## Phase 0-Quick: Quick Wins
## Phase 1: Core Refactoring
```text

Ralph's monitor only detects `## Phase X:` headers.

### Checkbox Format Required

```markdown
- [ ] **1.1** - Pending task
- [x] **1.2** - Completed task
- [?] **1.3** - Proposed done, awaiting verification
```text

### Never Delete Tasks

- Keep completed tasks as history
- Keep empty phases as completed phase markers

### Task Numbering

- Top-level: `1.1`, `1.2`
- Subtasks: `1.1.1`, `1.1.2`

### Task Complexity Tags

Use complexity tags to estimate iteration time and identify candidates for decomposition:

- **[S]** Small - ~90 seconds (simple fix, single file, clear path)
  - Examples: Add missing language tag, fix typo, update version number
- **[M]** Medium - ~300 seconds (multi-file, some investigation)
  - Examples: Fix shellcheck warnings across 3 files, update documentation structure
- **[L]** Large - ~600 seconds (complex logic, testing required, cross-cutting)
  - Examples: Implement new feature with tests, refactor module architecture

**Guidelines:**

- Tasks consistently exceeding their tag should be decomposed
- Use `current_ralph_tasks.sh` ETA to track actual vs estimated time
- Batching multiple [S] tasks can be more efficient than individual iterations

**Example:**

```markdown
- [ ] **1.2.3** [M] Add caching layer to API client
- [ ] **1.2.4** [S] Fix MD040 in README.md
- [ ] **1.2.5** [L] Implement authentication system with OAuth2
```

---

## Example Task Contract

```markdown
- [ ] **1.2.3** Add caching layer to API client
  - **Goal:** Reduce duplicate API calls by caching responses for 5 minutes
  - **Constraints:** 
    - Must use existing Redis client from `lib/cache.py`
    - Must preserve all existing API signatures
  - **AC:** 
    - Cache decorator applied to all GET methods
    - Cache TTL = 300 seconds
    - Tests pass: `pytest tests/test_api_cache.py`
  - **If Blocked:**
    - Redis not available? Skip caching, log warning
```text

---

## Communication Protocol

### Start Cortex

`bash cortex/run.sh` → loads prompt, snapshot, decisions

### Start Ralph

`bash loop.sh` → syncs plan, picks task, implements, commits

### Monitor Progress

- `bash cortex/snapshot.sh` - Git + Ralph status
- Read `workers/ralph/THUNK.md` - Completed work

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Ralph not picking up tasks | Check `cortex/IMPLEMENTATION_PLAN.md` has `[ ]` tasks, restart loop.sh |
| Task not marked [x] | Verifier changes `[?]` → `[x]` after AC pass |
| Ralph blocked | Check THUNK.md, update task with clearer guidance |
| Need protected file change | Create SPEC_CHANGE_REQUEST.md for human review |

---

## Research Examples

```bash
# Fetch documentation
curl -s https://docs.example.com/api

# Check GitHub repos
curl -s https://raw.githubusercontent.com/user/repo/main/README.md
```text

---

## Getting Ralph Status (without interactive scripts)

```bash
# Next tasks
grep -E '^\- \[ \]' workers/IMPLEMENTATION_PLAN.md | head -5

# Recent completions
grep -E '^\| [0-9]+' workers/ralph/THUNK.md | tail -5

# Full snapshot
bash cortex/snapshot.sh
```text
