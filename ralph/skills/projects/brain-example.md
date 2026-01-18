# Brain Repository Project

<!-- This is an EXAMPLE KB file demonstrating project-specific knowledge.
     It shows how to document conventions, decisions, and context for a specific project. -->

## Why This Exists

The brain repository is a unique project that serves as both a knowledge base AND uses itself for self-improvement via the Ralph loop. This creates special considerations that differ from typical projects. This KB file documents brain-specific conventions, Ralph loop usage, and structural decisions that agents need to understand when working on the brain itself.

**Problem solved:** Without this documentation, agents working on the brain repository might not understand the distinction between local paths (for brain's own Ralph) vs relative paths (for project templates), or how the brain uses Ralph to improve itself.

## When to Use It

Reference this KB file when:
- Working on the brain repository itself (not a project created from brain)
- Running the brain's own Ralph loop (`ralph/ralph.ps1`)
- Creating or modifying templates in `templates/`
- Adding new KB files or updating the knowledge base structure
- Updating validation scripts or bootstrap scripts
- Troubleshooting brain-specific issues

**Specific triggers:**
- Editing files in `brain/templates/`
- Modifying `brain/ralph/` prompts
- Running `brain/ralph/ralph.ps1`
- Updating `brain/fix_plan.md`
- Contributing to the knowledge base

## Details

### Brain Repository Structure

The brain repository has a unique dual role:

```
brain/
├── kb/                    # Knowledge base (the "source code" for knowledge)
├── references/            # Read-only reference materials (45 React rules)
├── templates/             # Bootstrap templates for new projects
├── ralph/                 # Brain's OWN Ralph loop for self-improvement
├── fix_plan.md           # Brain's OWN improvement backlog
├── new-project.ps1       # Bootstrap script
├── validate-brain.ps1    # Validation script
└── AGENTS.md             # Guidance for agents working ON brain
```

**Key insight:** The brain repository IS a project itself, and uses Ralph to evolve.

### Path Conventions: Brain vs Projects

This is critical to understand:

**When working IN the brain repository:**
- KB references use **local paths**: `kb/SUMMARY.md`, `references/react-best-practices/HOTLIST.md`
- Brain's Ralph prompts use **local paths**: `kb/SUMMARY.md`
- AGENTS.md references are **local**: `kb/conventions.md`

**When in templates (for NEW projects):**
- KB references use **relative paths from project root**: `../brain/kb/SUMMARY.md`
- Templates assume project is sibling to brain: `../brain/`
- Template prompts use **relative paths**: `../../brain/kb/SUMMARY.md`

**Example:**

```markdown
<!-- In brain/AGENTS.md (local paths) -->
Read [conventions](kb/conventions.md)

<!-- In brain/templates/AGENTS.project.md (relative paths) -->
Read [conventions](../brain/kb/conventions.md)

<!-- In brain/ralph/PROMPT.md (local paths, brain's own Ralph) -->
Read `kb/SUMMARY.md`

<!-- In brain/templates/ralph/PROMPT.md (relative paths, for projects) -->
Read `../../brain/kb/SUMMARY.md`
```

### Brain Self-Improvement with Ralph

The brain repository has its own Ralph loop at `ralph/ralph.ps1`:

**How it works:**
1. Brain's `fix_plan.md` contains improvement tasks for the brain itself
2. Running `ralph/ralph.ps1` executes the brain's Ralph loop
3. Ralph reads brain's KB (local paths), implements top task from fix_plan.md
4. Changes are validated with `validate-brain.ps1`
5. Progress logged to `ralph/progress.txt`

**What Ralph considers "source code" for the brain:**
- Templates in `templates/`
- KB files in `kb/`
- Scripts: `new-project.ps1`, `validate-brain.ps1`
- Documentation: `AGENTS.md`, `README.md`
- Ralph infrastructure: `ralph/` directory

**Brain's Ralph does NOT modify:**
- `references/react-best-practices/rules/` (45 files, read-only reference material)

### KB File Categories

The brain organizes knowledge into two categories:

**Domains (`kb/domains/`):**
- Reusable technical patterns
- Cross-project knowledge
- Technology-specific patterns
- Example: `auth-patterns.md`, `caching-strategies.md`

**Projects (`kb/projects/`):**
- Project-specific conventions
- Single-project context
- Deployment specifics
- Example: `brain-example.md` (this file), `ecommerce-site.md`

### Validation Script

The brain includes `validate-brain.ps1` to ensure integrity:

**What it checks:**
- KB files have required format (Why/When/Details headers)
- SUMMARY.md links point to existing files
- Templates don't have hardcoded absolute paths
- Rules directory unchanged (45 files)
- No orphaned KB files (all linked from SUMMARY.md)

**Usage:**
```powershell
.\validate-brain.ps1          # Run validation
.\validate-brain.ps1 -Fix     # Attempt to fix issues (planned feature)
```

### Bootstrap Script

The `new-project.ps1` script creates sibling projects:

**Enhanced features:**
- Pre-flight checks (templates exist, name valid, directory available)
- `-WhatIf` parameter for dry-run preview
- Post-creation validation (all files created successfully)
- Clear error messages with actionable guidance

**Usage:**
```powershell
.\new-project.ps1 -Name my-project                    # Create project
.\new-project.ps1 -Name my-project -WhatIf            # Preview without creating
.\new-project.ps1 -Name test -Path C:\Projects        # Custom parent directory
```

### Template Maintenance

When updating templates, ensure consistency:

**Path patterns:**
- Templates use `../brain/` (relative from project root)
- Ralph prompts in templates use `../../brain/` (relative from project/ralph/)

**Progressive disclosure order:**
1. `../brain/kb/SUMMARY.md`
2. `../brain/references/react-best-practices/HOTLIST.md`
3. `../brain/references/react-best-practices/INDEX.md` (only if needed)
4. `../brain/references/react-best-practices/rules/*` (only specific rules)

**Required sections in KB files:**
- `## Why This Exists`
- `## When to Use It`
- `## Details`

### Common Brain-Specific Tasks

**Adding a new KB file:**
1. Create file in `kb/domains/` or `kb/projects/`
2. Follow Why/When/Details structure
3. Update `kb/SUMMARY.md` with link
4. Run `validate-brain.ps1` to verify

**Updating templates:**
1. Edit files in `templates/`
2. Ensure relative paths are correct (`../brain/`)
3. Test with `new-project.ps1 -WhatIf`
4. Run `validate-brain.ps1`

**Running brain's Ralph loop:**
1. Add tasks to `fix_plan.md`
2. Run `.\ralph\ralph.ps1 -Iterations 10 -PlanEvery 3`
3. Ralph implements tasks, validates with `validate-brain.ps1`
4. Check `ralph/progress.txt` for logs

### Brain-Specific Gotchas

❌ **Don't modify `references/react-best-practices/rules/`** - These 45 files are read-only reference material  
❌ **Don't use absolute paths in templates** - Projects are siblings to brain, use relative paths  
❌ **Don't confuse brain's Ralph paths with template Ralph paths** - Brain uses local, templates use relative  
❌ **Don't skip validation** - Always run `validate-brain.ps1` after changes

### Decision History

**Why templates use relative paths:**
- Projects created by `new-project.ps1` are siblings to brain
- Relative paths allow projects to reference shared KB
- Enables multiple projects to share one brain

**Why brain has its own Ralph loop:**
- Brain needs to evolve and improve itself
- Meta-approach: brain uses its own tools for self-improvement
- fix_plan.md tracks brain's own improvement tasks

**Why validation script is necessary:**
- Ensures KB integrity (proper format, no broken links)
- Catches template path errors before they affect new projects
- Verifies references directory unchanged (45 rules - complete Vercel Engineering set)

### Integration with Other KB Files

- Related: `kb/conventions.md` - KB file authoring guidelines
- Related: `kb/domains/README.md` - Domain KB explanation
- Related: `kb/projects/README.md` - Project KB explanation
- See: `AGENTS.md` - Agent guidance for brain repository
- See: `README.md` - Developer onboarding guide

### Testing Changes to Brain

Before committing changes to brain repository:

1. **Validate structure:** `.\validate-brain.ps1`
2. **Test bootstrap:** `.\new-project.ps1 -Name test-project -WhatIf`
3. **Check KB links:** Verify all links in `kb/SUMMARY.md` work
4. **Review paths:** Ensure templates use relative paths
5. **Run brain's Ralph:** Test self-improvement loop works

### Contributing to Brain

When contributing new features to brain:

1. **Add task to fix_plan.md** with rationale and relevant rules
2. **Run brain's Ralph loop** to implement the task
3. **Validate changes** with `validate-brain.ps1`
4. **Update documentation** (AGENTS.md, README.md, etc.)
5. **Create KB files** if new patterns discovered

## References

- [AGENTS.md](../../AGENTS.md) - Agent guidance for brain repository
- [README.md](../../README.md) - Developer onboarding and quickstart guide
- [kb/conventions.md](../conventions.md) - KB file authoring conventions
- [fix_plan.md](../../fix_plan.md) - Brain's improvement backlog
