# Project Guidance for AI Agents

## Skills Library (Optional Integration)

> **Brain Skills:** If `../../brain/` exists, use it for skills lookups. Otherwise, proceed without brain skills - this project works standalone.

### Progressive Disclosure: Read in This Order

**If brain repository is available, ALWAYS start here:**
1. `../../brain/skills/SUMMARY.md` - Knowledge base overview and usage guide
2. `../../brain/references/react-best-practices/HOTLIST.md` - Top 10 most applicable performance rules (covers 80% of scenarios)

**Only if HOTLIST doesn't cover your scenario:**
3. `../../brain/references/react-best-practices/INDEX.md` - Full categorized rule index (find specific categories)

**Only when you need deep knowledge on a specific topic:**
4. `../../brain/references/react-best-practices/rules/*` - Individual rule files (read ONLY specific rules you need)

❌ **NEVER scan all 45 rules by default** - Token-inefficient and slow  
✅ **Use the hierarchy above** - Fast and targeted  
✅ **Only open specific rule files when needed for the task** - don't read everything "just in case"

### Why This Order Matters
- **Token efficiency**: HOTLIST covers most common scenarios with minimal tokens
- **Faster results**: Start broad, drill down only when needed
- **Avoid overwhelm**: Don't read all rules unless explicitly instructed

### Standalone Mode
If the brain repository is not present, skip brain skills lookups and rely on:
- Project-local documentation in `docs/`
- Standard best practices for your tech stack
- Any project-specific conventions documented in this file

## Skills Growth Rule (Mandatory)

When you discover a new convention, architectural decision, or project-specific pattern:

1. **Create a skill file** in the brain repo:
   - Project-specific: `../../brain/skills/projects/<project-slug>.md`
   - Domain/cross-project: `../../brain/skills/domains/<domain>.md`

2. **Update the index**: Add a link in `../../brain/skills/SUMMARY.md`

3. **Structure new skill files** with:
   ```markdown
   # [Title]
   
   ## Why This Exists
   [Explain the problem this solves or decision rationale]
   
   ## When to Use It
   [Specific scenarios or conditions for applying this knowledge]
   
   ## Details
   [The actual knowledge, patterns, conventions, etc.]
   ```

## Runtime errors (same iteration)

On any command/tool failure: check `../../brain/ralph/skills/SUMMARY.md` Error Quick Reference, read the mapped skill doc, fix, and retry the failing command.

## Skills + Self-Improvement Protocol

> **Note:** This protocol requires the brain repository at `../../brain/`. If running standalone (brain not present), skip this section.

**Start of iteration:**
1. Study `../../brain/skills/SUMMARY.md` for overview
2. Check `../../brain/skills/index.md` for available skills
3. Review `../../brain/skills/self-improvement/GAP_CAPTURE_RULES.md` for capture protocol

**End of iteration:**
1. If you used undocumented knowledge/procedure/tooling:
   - Search `../../brain/skills/` for existing matching skill
   - Search `../../brain/skills/self-improvement/GAP_BACKLOG.md` for existing gap entry
   - If not found: append new entry to `GAP_BACKLOG.md`
2. If a gap is clear, specific, and recurring:
   - Add to `../../brain/skills/self-improvement/SKILL_BACKLOG.md`
   - Create skill file using `SKILL_TEMPLATE.md`
   - Update `../../brain/skills/index.md`

## Parallelism Rule

**Reading/searching/spec review**: Use up to **100 parallel subagents** for maximum efficiency
- File reading, searching, spec analysis, documentation review
- Gathering context from multiple sources simultaneously

**Build/tests/benchmarks**: Use exactly **1 agent**
- Running build commands, executing tests, benchmarks
- Making file modifications and commits

## Core Principles

### Before Making Changes
1. **Search the codebase** - Don't assume anything is missing; search first
2. **Read targeted knowledge** - Follow the hierarchy: SUMMARY → HOTLIST → specific rules
3. **Check existing patterns** - Look for established conventions in the codebase before inventing new ones

### Code Quality
- Prefer standard patterns from the knowledge base over custom solutions
- Keep components small and focused
- Write clear, self-documenting code with minimal comments

### Project Structure

**⚠️ CRITICAL: Source code goes in PROJECT ROOT, not in ralph/!**

```
project-root/           ← Working directory for application files
├── src/                ← Source code HERE
├── package.json        ← Config files HERE
├── tsconfig.json       
├── README.md           ← Project readme
└── ralph/              ← Ralph files (loop + project context)
    ├── AGENTS.md       ← This file (agent guidance)
    ├── THOUGHTS.md     ← Project vision
    ├── NEURONS.md      ← Codebase map
    ├── PROMPT.md       ← Loop prompt
    ├── IMPLEMENTATION_PLAN.md  ← Task tracking
    ├── VALIDATION_CRITERIA.md  ← Quality gates
    ├── RALPH.md        ← Loop contract
    ├── loop.sh         ← Loop runner
    └── logs/           ← Iteration logs
```

- **Source code**: Always in `src/` at project root (NOT `ralph/src/`)
- **Config files**: Always at project root (`package.json`, `tsconfig.json`, etc.)
- **ralph/ directory**: Contains loop infrastructure AND project context (AGENTS, THOUGHTS, NEURONS, kb/, logs/)
- Keep project goals and vision in `ralph/THOUGHTS.md`
- Maintain `ralph/IMPLEMENTATION_PLAN.md` as a prioritized task list

## Ralph Integration

This project uses the Ralph Wiggum iterative loop for systematic development:
- **Single unified prompt**: See `ralph/PROMPT.md` (determines mode from iteration number)
- **Progress tracking**: All work logged in `ralph/progress.txt`
- **Completion**: Look for `:::COMPLETE:::` sentinel

## RovoDev + CLI Guardrails

When working with RovoDev and Atlassian CLI:

- **Always run repo scripts with PowerShell 7** (`pwsh`), not Windows PowerShell 5.1 (`powershell.exe`)
- **If Ralph/RovoDev appears to "hang" or "wait"**, first run:
  - `acli rovodev auth status`
  - `acli rovodev usage site` (select a valid site if prompted)
  - then retry
- **Don't assume the correct site is the one open in the browser** - rely on CLI-selected site
- **If a command needs interactivity**, the agent must clearly tell the user what input/action is required
- **Avoid long-running background watchers/polling** unless the user explicitly wants it - prefer short, bounded runs

### Secrets and Tokens

- **Never paste API tokens, secrets, or credentials** into logs, markdown, or console output
- Use placeholders like `PASTE_TOKEN_HERE` and instruct the user to provide them locally

### UTF-8 Logging

- **Any PowerShell file writes must explicitly use UTF-8**:
  - `Out-File -Encoding utf8`
  - `Add-Content -Encoding utf8` (or equivalent)
- Avoid UTF-16 defaults that cause NUL spam in VS Code

## Project-Specific Notes

[Add project-specific conventions, architecture decisions, and patterns here]
