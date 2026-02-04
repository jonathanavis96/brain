# Git Worktree Workflow

## Overview

Git worktrees enable parallel work across different branches without context switching. This guide documents safe worktree conventions for multi-agent workflows (Cortex planning + Ralph implementation).

## Worktree Naming Conventions

| Worktree | Branch Pattern | Purpose | Agent Access |
|----------|---------------|---------|--------------|
| `wt-plan` | `plan/*` or `main` | Planning, design, analysis | Cortex (read/write), Ralph (read-only) |
| `wt-build` | `feat/*`, `fix/*` | Implementation, testing | Ralph (read/write), Cortex (read-only) |
| `wt-analysis` | `main` or `analysis/*` | Metrics, reports, debugging | Human/tools (read/write), Agents (read-only) |
| `wt-review` | `review/*` | PR review staging (optional) | Human/reviewers |

**Key principle:** Each worktree has a **designated owner**. Other parties are read-only to prevent merge conflicts and state confusion.

## Setup

```bash
# Create worktrees from repository root
git worktree add ../project-wt-plan main
git worktree add ../project-wt-build -b feat/new-feature
git worktree add ../project-wt-analysis main

# Verify worktrees
git worktree list
```

## Plan Handoff Mechanism

### Default: Commit Plan Artifacts (Option A)

**Rule:** Plans are committed artifacts, NOT ephemeral scratch files.

**Why:** Provides history, auditability, and deterministic handoff between agents.

**Workflow:**

1. **Cortex (wt-plan):** Create plan document (e.g., `IMPLEMENTATION_PLAN.md`, `DESIGN.md`)
2. **Cortex:** Commit plan artifact: `git commit -m "docs(plan): add feature X implementation plan"`
3. **Cortex:** Push to remote
4. **Ralph (wt-build):** Pull latest plan from committed history
5. **Ralph:** Reference plan commit SHA in implementation commits

**Benefits:**

- Plans are versioned and reviewable
- Clear handoff point (commit SHA)
- Git bisect works across plans and implementations
- Rollback is deterministic

### Alternative: Shared Read-Only Location (Option C)

**When to use:** As a convenience pointer alongside committed plans.

**Setup:**

```bash
# Create symlink or copy to stable path
ln -s ../project-wt-plan/IMPLEMENTATION_PLAN.md /tmp/latest-plan.md
```

**Limitations:**

- No history
- Permissions can drift
- Path differences between Windows/WSL can cause issues

**Recommendation:** Use Option C as a convenience cache, but **always commit the canonical plan** (Option A).

## Prompt/Statusline Configuration

**Goal:** Make it visually obvious which worktree/branch you're in before running commands.

### Minimal Bash Prompt (PS1)

Add this to your `~/.bashrc` or per-worktree `.envrc`:

```bash
# Show: [repo/branch worktree-label] with dirty indicator
parse_git_branch() {
  git branch 2>/dev/null | sed -n '/\* /s///p'
}

parse_git_dirty() {
  [[ $(git status --porcelain 2>/dev/null) ]] && echo "*"
}

export PS1='\[\033[01;34m\][\w]\[\033[00m\] \[\033[01;32m\]($(parse_git_branch)$(parse_git_dirty))\[\033[00m\] \$ '
```

### Worktree Label Strategy

**Option A: Environment variable per worktree**

Set a worktree-specific label in each directory:

```bash
# In wt-plan/.envrc (if using direnv) or manually:
export BRAIN_WT="wt-plan"

# Update PS1 to show it:
export PS1="[$BRAIN_WT] \w ($(parse_git_branch)) \$ "
```

**Option B: Parse from git worktree list**

```bash
# Add to .bashrc
get_worktree_label() {
  local wt_path
  wt_path=$(git rev-parse --show-toplevel 2>/dev/null) || return
  git worktree list | grep -F "$wt_path" | awk '{print $1}' | xargs basename
}

export PS1='[\w ($(get_worktree_label))] \$ '
```

### Windows Terminal Tab Titles (Optional)

If using Windows Terminal on Windows 11/WSL2, set tab titles per worktree:

```bash
# In wt-plan: Add to shell startup
echo -ne "\033]0;Brain: wt-plan\007"

# In wt-build:
echo -ne "\033]0;Brain: wt-build\007"
```

**Note:** These are convenience examples, not auto-installed. Customize to your preferences.

## Common Failure Modes

### 1. Wrong Worktree/Directory

**Symptom:** Agent makes changes in wrong worktree, causing unexpected conflicts.

**Prevention:**

- Check `pwd` and `git branch` before starting work
- Use prompt/statusline configuration (see section above)
- Verify context before running `acli rovodev run`

### 2. Permissions Drift

**Symptom:** Read-only worktree becomes writable; agents overwrite each other's work.

**Prevention:**

- Document access rules clearly in `AGENTS.md`
- Use file permissions where possible: `chmod -R a-w ../project-wt-analysis`
- Regular audits: `git status` in all worktrees

### 3. Stale Plans

**Symptom:** Ralph implements against outdated plan; work conflicts with recent changes.

**Prevention:**

- Always `git pull` in wt-plan before starting implementation
- Reference plan commit SHA in implementation commit messages
- Use plan versioning (e.g., `PLAN_v2.md`) when plans evolve significantly

### 4. Merge Conflicts Across Worktrees

**Symptom:** Changes in wt-build conflict with changes in wt-plan when merging.

**Prevention:**

- Keep concerns separated: plans in wt-plan, code in wt-build
- Don't edit the same files across worktrees simultaneously
- Merge wt-plan changes to main before starting wt-build work

## Cleanup

```bash
# Remove a worktree
git worktree remove ../project-wt-plan

# Force remove (if there are uncommitted changes)
git worktree remove --force ../project-wt-plan

# List all worktrees
git worktree list

# Prune stale worktree references
git worktree prune
```

## Integration with `acli rovodev run`

When using RovoDev with worktrees:

1. **Specify working directory:** `cd ../project-wt-build && acli rovodev run ...`
2. **Pass plan location:** Include "Plan is at: `../project-wt-plan/IMPLEMENTATION_PLAN.md`" in prompt
3. **Set immutability:** Instruct agent to treat plan as read-only input
4. **Verify context:** Agent should confirm branch and worktree before making changes

## Best Practices

1. **One concern per worktree** - Don't mix planning and implementation in the same checkout
2. **Commit plans by default** - Ephemeral plans lose history and create handoff ambiguity
3. **Name worktrees consistently** - Use `wt-<purpose>` prefix for clarity
4. **Document access rules** - Make read-only vs read-write explicit in `AGENTS.md`
5. **Clean up regularly** - Remove completed worktrees to avoid confusion

## See Also

- [AGENTS.md](../AGENTS.md) - Agent operational guide and access rules
- [docs/BOOTSTRAPPING.md](BOOTSTRAPPING.md) - New project setup
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree) - Official git-worktree reference
