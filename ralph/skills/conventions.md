# KB File Authoring Conventions

## Why This Exists

Knowledge base files in the brain repository follow specific conventions to ensure consistency, discoverability, and optimal token efficiency for AI agents. This document centralizes all KB authoring guidelines that were previously scattered across templates and README files.

## When to Use It

Reference this document when:
- Creating a new KB file in `kb/domains/` or `kb/projects/`
- Reviewing or updating existing KB files
- Contributing knowledge back to the brain repository
- Ensuring KB files meet quality standards

## Required File Structure

Every KB file **must** follow this three-section structure:

```markdown
# [Title]

## Why This Exists

[1-3 paragraphs explaining the problem, context, or motivation]
[Answer: "Why does this knowledge matter?"]

## When to Use It

[Specific scenarios, triggers, or conditions where this applies]
[Include concrete examples or bullet points]
[Answer: "When should I reference this?"]

## Details

[The actual knowledge: patterns, code examples, implementation details]
[Can include multiple subsections as needed]
[Can be as long or short as necessary]
```

### Section Guidelines

**Why This Exists**
- Provide context and motivation
- Explain the problem this knowledge solves
- Keep it brief (1-3 paragraphs)
- Help readers quickly decide if this is relevant

**When to Use It**
- Be specific and actionable
- Include concrete triggers or scenarios
- Use bullet points for clarity
- Think: "What situations warrant reading this?"

**Details**
- Contains the actual knowledge
- Can have multiple subsections
- Include code examples where helpful
- Focus on actionable, practical information

## Naming Conventions

### File Names

- **Use kebab-case**: `auth-patterns.md`, `caching-strategies.md`
- **Be descriptive**: Name should clearly indicate content
- **Use plurals for collections**: `api-patterns.md` not `api-pattern.md`
- **Keep it concise**: 2-4 words ideal, avoid unnecessary words

**Good examples:**
- `auth-patterns.md`
- `caching-strategies.md`
- `api-design-conventions.md`

**Bad examples:**
- `AuthPatterns.md` (wrong case)
- `pattern.md` (too vague)
- `authentication-pattern-for-oauth-and-jwt.md` (too long)

### Directory Structure

```
kb/
├── SUMMARY.md              # KB index - always update when adding files
├── conventions.md          # This file
├── domains/                # Technical domain knowledge (reusable)
│   ├── README.md
│   └── [domain-kb-files].md
└── projects/               # Project-specific knowledge
    ├── README.md
    └── [project-kb-files].md
```

## Domain vs Project KB

### Use `kb/domains/` when:

✅ Pattern applies to **multiple projects**  
✅ Technical solution is **reusable**  
✅ Knowledge is **architectural or technology-focused**  
✅ Content is **framework or tool-specific**

**Examples:**
- Authentication patterns (OAuth2, JWT, session management)
- Caching strategies (LRU, Redis, React Query patterns)
- API design conventions (REST, error handling, versioning)
- State management approaches (Context, Zustand, server state)

### Use `kb/projects/` when:

✅ Specific to **one project or codebase**  
✅ Context about **project history or decisions**  
✅ Project-specific **conventions or requirements**  
✅ Information about **specific integrations or dependencies**

**Examples:**
- Project-specific file structure conventions
- Custom component library usage
- Project deployment processes
- Third-party service integration patterns specific to one project

## Creating New KB Files

### Step-by-Step Process

1. **Choose the right directory**
   - Domain knowledge → `kb/domains/`
   - Project-specific → `kb/projects/`

2. **Create the file with required structure**
   ```markdown
   # [Title]
   
   ## Why This Exists
   [Content]
   
   ## When to Use It
   [Content]
   
   ## Details
   [Content]
   ```

3. **Update `kb/SUMMARY.md`**
   - Add link under "Domains" or "Projects" section
   - Use descriptive link text
   - Keep alphabetical order within sections

4. **Validate the file**
   - Check: All three required headers present
   - Check: Content is clear and actionable
   - Check: Linked from SUMMARY.md
   - Check: No duplicate content with existing KB files

## Updating Existing KB Files

When updating KB files:

- **Preserve structure**: Keep Why/When/Details sections
- **Maintain focus**: Don't let Details section become unfocused
- **Consider splitting**: If file grows too large (>500 lines), consider splitting into multiple files
- **Update dates**: Add "Last updated" note if making significant changes
- **Check links**: Ensure SUMMARY.md link text still accurate

## Writing Style Guidelines

### For AI Agent Consumption

- **Be concise**: Agents pay token costs for reading
- **Use clear hierarchies**: Headers, bullets, numbered lists
- **Front-load key information**: Most important details first
- **Use code examples**: Show, don't just tell
- **Avoid redundancy**: Don't repeat information from other KB files, link instead

### Formatting

- **Headers**: Use `##` for main sections, `###` for subsections
- **Code blocks**: Always specify language (````markdown`, ````javascript`, etc.)
- **Lists**: Use `-` for bullets, `1.` for numbered lists
- **Emphasis**: Use **bold** for key terms, `code` for inline code
- **Links**: Use relative paths: `[link](../path/to/file.md)`

### Example Formatting

```markdown
## Details

### Authentication Flow

When implementing OAuth2 authentication:

1. **Redirect to provider**
   ```javascript
   const authUrl = `${OAUTH_URL}?client_id=${CLIENT_ID}`;
   window.location.href = authUrl;
   ```

2. **Handle callback**
   - Verify state parameter
   - Exchange code for tokens
   - Store tokens securely

**Security considerations:**
- Always validate state parameter (prevents CSRF)
- Use PKCE for public clients
- Store refresh tokens in httpOnly cookies
```

## Common Mistakes to Avoid

❌ **Missing required sections**
- Every KB file needs Why/When/Details

❌ **Vague "When to Use It" sections**
- Be specific about scenarios and triggers

❌ **Creating orphaned files**
- Always update SUMMARY.md when adding files

❌ **Duplicating existing content**
- Check existing KB files first, consider updating instead

❌ **Using absolute paths**
- Use relative paths: `../references/...` not `/brain/references/...`

❌ **Mixing domain and project knowledge**
- Keep domain knowledge reusable, project knowledge specific

❌ **Over-engineering**
- Don't create KB files for trivial or obvious patterns

## Validation Checklist

Before considering a KB file complete:

- [ ] File has all three required sections (Why/When/Details)
- [ ] File name uses kebab-case
- [ ] File is in correct directory (domains/ or projects/)
- [ ] SUMMARY.md updated with link to file
- [ ] Content is clear, concise, and actionable
- [ ] Code examples include language specifiers
- [ ] No duplicate content with existing files
- [ ] Relative paths used throughout

## Integration with Templates

Project templates reference these conventions:

- `templates/AGENTS.project.md` - Points to KB structure
- `templates/ralph/PROMPT.md` - Includes KB growth instructions
- `templates/ralph/PROMPT.md` - References KB reading order

When updating conventions, ensure templates remain consistent.

## See Also

- [kb/SUMMARY.md](SUMMARY.md) - KB index and navigation
- [kb/domains/README.md](domains/README.md) - Domain KB guidelines
- [kb/projects/README.md](projects/README.md) - Project KB guidelines
- [AGENTS.md](../AGENTS.md) - Agent guidance for brain repository
