# Gap Capture Rules (Mandatory)

These rules are enforced for all agents operating within the Ralph brain system.

## What Is a Gap?

A **gap** is missing brain capability that would have helped you complete a task more effectively. Types:

| Type | Description |
|------|-------------|
| Knowledge | Facts, concepts, or domain knowledge not documented |
| Procedure | Step-by-step process not captured anywhere |
| Tooling | Tool usage, commands, or integrations not documented |
| Pattern | Reusable solution pattern not in skills/ |
| Debugging | Troubleshooting approach for a specific failure mode |
| Reference | External documentation or specification needed |

## Rule 1: Search First (No Duplicates)

Before logging ANY gap:

1. Search `skills/` for existing matching skill
2. Search `skills/self-improvement/GAP_BACKLOG.md` for existing gap entry
3. If found: **UPDATE existing entry** rather than creating new one

## Rule 2: Always Log Gaps

If you used knowledge/procedure/tooling that isn't documented in `skills/`:

1. Append entry to `GAP_BACKLOG.md`
2. Use the format specified in GAP_BACKLOG.md
3. Include evidence (paths, filenames, observations)

## Rule 3: Promotion Criteria

A gap should be promoted to a skill when ALL of these are true:

- [ ] The gap is **clear** (well-defined, not vague)
- [ ] The gap is **specific** (actionable, not overly broad)
- [ ] The gap is **recurring** (likely to help again)
- [ ] The skill can be expressed as **triggers + steps + outputs** (LLM-executable)

## Rule 4: Promotion Process

When promotion criteria are met:

1. Add entry to `SKILL_BACKLOG.md` with status "Pending"
2. Create skill file using `SKILL_TEMPLATE.md`
3. Place in correct location:
   - Broadly reusable → `skills/domains/<topic>/<skill>.md`
   - Project-specific → `skills/projects/<project>/<skill>.md`
4. Create folder if needed (one file per skill)
5. Update `skills/index.md`
6. Mark `SKILL_BACKLOG.md` entry as "Done" with link to new file

## Rule 5: Update Operational Signs

After creating a new skill, check if it affects agent behavior:

- If the skill changes how agents should operate → Update `AGENTS.md`
- If the skill changes prompts → Update `PROMPT.md` or templates
- If the skill affects validation → Update `VALIDATION_CRITERIA.md`
