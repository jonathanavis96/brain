# Change Propagation Patterns

> Rules for ensuring changes propagate to all required locations.

## Quick Reference

| Change Type | Must Also Update |
|-------------|------------------|
| `cortex/rovo/*.md` | `templates/cortex/*.md` (if pattern applies to all projects) |
| `cortex/rovo/loop.sh` | `templates/ralph/loop.sh` |
| `workers/ralph/*.sh` | `templates/ralph/*.sh` |
| `cortex/AGENTS.md` | Document in `skills/` if it's a reusable pattern |
| Any "knowledge" claim | Write it to a file (AGENTS.md, DECISIONS.md, or skills/) |

## Anti-Pattern: Claiming Without Writing

```markdown
❌ WRONG - Said "I updated my knowledge" without writing anywhere
Agent: "I've updated my knowledge that one-shot.sh is Cortex-only"
Reality: Never wrote this to any file

✅ RIGHT - Write to persistent location
Agent: "I've documented this in cortex/AGENTS.md under Architecture Note"
Then actually write it to the file
```

## Verification Checklist

Before marking any change complete, ask:

1. **Templates?** - Does this change apply to `templates/` for new projects?
2. **Skills?** - Is this a reusable pattern that belongs in `skills/domains/`?
3. **DECISIONS.md?** - Is this an architectural decision to document?
4. **Written proof?** - Did I actually write it, or just say I did?

## Template Sync Rule

**When updating project-specific files, always check if the template needs the same update.**

```bash
# Example: Updated cortex/rovo/loop.sh with context injection
# Must also update:
templates/ralph/loop.sh

# Example: Updated cortex/rovo/AGENTS.md with lean format
# Must also update:
templates/cortex/AGENTS.project.md  # (if it's a pattern for all projects)
```

## The "Say-Do" Rule

**Never say you did something without doing it.**

```markdown
❌ "I've updated my knowledge" → but no file was written
❌ "I've fixed the templates" → but templates unchanged
❌ "Task complete" → but verification skipped

✅ "I've written this to cortex/AGENTS.md lines 145-155"
✅ "I've updated templates/ralph/loop.sh with the same change"
✅ "Task complete - verified with: bash -n loop.sh"
```

## Acceptance Criteria Pattern

When given a task, define AC that includes propagation:

```markdown
- [ ] **1.1** Add context injection to loop.sh
  - **AC:**
    - [ ] cortex/rovo/loop.sh updated
    - [ ] templates/ralph/loop.sh updated (same change)
    - [ ] Both pass syntax check: `bash -n`
    - [ ] Pattern documented in skills/ if reusable
```

## Why This Matters

- **Templates drift** - New projects won't have improvements
- **Knowledge is lost** - "I know X" means nothing if not written
- **Maintenance burden** - Manual sync is error-prone
- **Trust erodes** - Claiming completion without verification
