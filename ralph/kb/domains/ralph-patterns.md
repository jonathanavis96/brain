# Ralph Loop Architecture

## Why This Exists

Ralph is the automated self-improvement loop for brain repositories and projects. Agents need to understand how Ralph works internally (subagents, tool visibility, execution flow) to effectively write prompts and debug issues.

## When to Use It

- Writing or modifying Ralph prompts (`PROMPT.md`)
- Debugging Ralph execution issues
- Understanding why certain operations are fast (parallel) vs slow (sequential)
- Deciding between interactive RovoDev sessions vs Ralph automation

## Details

### Architecture

```
ralph.ps1 (PowerShell loop)
    ↓
acli rovodev run --yolo -- "$promptContent"
    ↓
RovoDev Agent (executes prompt instructions)
    ↓
Spawns subagents as instructed by prompt
```

### Subagent Usage

Ralph prompts instruct RovoDev to use:
- **Reading/Searching**: Up to 100 parallel subagents
- **Writing/Modifying**: Exactly 1 agent (sequential for safety)

**Key insight**: Subagent orchestration happens inside RovoDev backend, not in ralph.ps1. The PowerShell script just calls acli and logs output.

### Visibility

**Without `--verbose`**: Only see RovoDev's final text responses

**With `--verbose`**: See tool calls and results:
```
⬢ Called expand_folder: 
    • folder_path: "ralph"
[tool results]
```

**Never visible**: Internal subagent spawning/pooling (happens in backend)

### Prompt Instructions

Prompts explicitly tell RovoDev to use subagents:

```markdown
**0a. Study specs/*** (using parallel subagents, max 100)
```

These instructions guide RovoDev's internal behavior. Ralph.ps1 doesn't enforce this - it just passes the prompt through.

### Best Practices

1. **Reading phase**: Request parallel subagents for speed
2. **Writing phase**: Specify single agent for safety
3. **Verbose mode**: Add `--verbose` flag to ralph.ps1 to see tool activity
4. **Debugging**: Check `ralph/progress.txt` for full execution log

### Common Misconception

❌ "Ralph spawns subagents"
✅ "Ralph passes prompts to RovoDev, which spawns subagents as instructed"

Ralph is just the orchestrator. RovoDev is the executor.
