# Agent Loading Analysis - Cortex vs Ralph

**Date:** 2026-01-21 20:50:00  
**Purpose:** Document what files are loaded, in what order, and identify issues

---

## Current State

### Cortex Loading Sequence (cortex/cortex.bash)

**Files Loaded:**

1. `cortex/CORTEX_SYSTEM_PROMPT.md` - Full system prompt (399 lines, ~14KB)
2. `cortex/snapshot.sh` output - Repository state snapshot (~140 lines)
3. "Chat Mode Instructions" - Inline instructions in the script

**NOT Loaded:**

- ❌ `cortex/AGENTS.md` - **DOES NOT EXIST**
- ❌ `cortex/DECISIONS.md` - NOT loaded automatically
- ❌ `cortex/THOUGHTS.md` - NOT loaded automatically

**Loading Order:**

```text
cortex.bash
  ↓
CORTEX_SYSTEM_PROMPT.md (full identity)
  ↓
snapshot.sh (current state)
  ↓
Chat Mode Instructions (inline)
  ↓
RovoDev executes
```

---

### Ralph Loading Sequence (workers/ralph/loop.sh)

**Files Loaded:**

1. `workers/ralph/PROMPT.md` - Full system prompt (369 lines, ~15KB)
2. (Conditionally) `.verify/latest.txt` - Verifier results

**NOT Loaded:**

- ❌ `workers/ralph/AGENTS.md` - **EXISTS but NOT loaded by loop.sh**
- ❌ Other context files loaded conditionally by Ralph based on instructions in PROMPT.md

**Loading Order:**

```text
loop.sh
  ↓
PROMPT.md (full identity + instructions)
  ↓
RovoDev executes
  ↓
Ralph reads AGENTS.md IF instructed by PROMPT.md
```

---

## Key Findings

### 1. AGENTS.md is NOT Loaded Automatically by Scripts

**Neither cortex.bash nor loop.sh loads AGENTS.md directly.**

Instead:

- Cortex: Loads CORTEX_SYSTEM_PROMPT.md (which should reference AGENTS.md)
- Ralph: Loads PROMPT.md (which instructs Ralph to read AGENTS.md)

**Current Reality:**

- Ralph's PROMPT.md line 3: "**Before any task, read NEURONS.md via subagent**"
- Ralph's AGENTS.md line 3: "**Before any task, read NEURONS.md via subagent**"
- ⚠️ **No instruction in PROMPT.md to read AGENTS.md first!**

### 2. Read Order Should Be

**Recommended Order (agents.md spec):**

1. Read `AGENTS.md` (quick context, 30-70 lines)
2. Read `PROMPT.md` or system-specific files

**Current Order (Cortex):**

1. Read `CORTEX_SYSTEM_PROMPT.md` (399 lines)
2. No AGENTS.md loaded

**Current Order (Ralph):**

1. Read `PROMPT.md` (369 lines)
2. AGENTS.md never mentioned in PROMPT.md

### 3. Content Overlap Issues

**Duplicated Content:**

- Environment prerequisites (WSL, bash, acli) - in BOTH files
- Ralph loop integration - in BOTH files
- RovoDev guardrails - in BOTH files

**Should Be:**

- AGENTS.md: Quick practical tips (30-70 lines)
- PROMPT.md: Detailed mode logic, verification, iteration flow

---

## Research/Internet Capability Analysis

### Cortex Research Instructions: ❌ MISSING

**Searched for:** "research", "internet", "curl", "web", "google", "search online"  
**Result:** No explicit instruction to research when needed

**Current Behavior:**

- Cortex CAN access internet (confirmed via curl test)
- But NO instruction in CORTEX_SYSTEM_PROMPT.md to do so
- Must infer from general problem-solving ability

### Ralph Research Instructions: ❌ MISSING

**Searched for:** Same terms  
**Result:** No explicit instruction except one Google Authenticator reference

**Current Behavior:**

- Ralph CAN access internet (same bash environment)
- But NO instruction in PROMPT.md to research when needed
- No guidance on when to use curl/web search

---

## Terminology Issues

### KB vs Skills

**Problem:** Templates use "KB" (Knowledge Base) inconsistently

**Found in templates:**

- "Knowledge Base (MUST USE)" - templates/backend/AGENTS.project.md
- "KB lookups" - templates/AGENTS.project.md
- "Create a KB file" - multiple templates
- "Project knowledge base" - structure diagrams

**Should Be:**

- "Skills" - for brain repository patterns
- "kb/" - for project-specific local knowledge

**Correct Structure:**

```text
brain/
  skills/           ← Cross-project reusable patterns
  
project/
  ralph/
    kb/             ← Project-specific local knowledge
```

---

## Recommendations

### 1. Create cortex/AGENTS.md

**Content (30-50 lines):**

```markdown
# Cortex Agent Guidance

## First: Read the Context
1. Read this file (AGENTS.md) first
2. Then read CORTEX_SYSTEM_PROMPT.md for detailed identity
3. Run `bash cortex/snapshot.sh` for current state

## Quick Tips
- You are the strategic manager (plan, don't code)
- Write tasks in cortex/IMPLEMENTATION_PLAN.md
- Ralph syncs from your plan automatically
- Use snapshot.sh, not interactive scripts

## Research When Needed
- **You can access the internet:** Use curl to fetch documentation
- **When to research:** Unknown tech, new frameworks, API specs
- **How:** curl -s URL or ask user for clarification

## Environment
- WSL on Windows 11 with Ubuntu
- Bash shell, acli for RovoDev
- Paths: /mnt/c/ or /home/

See CORTEX_SYSTEM_PROMPT.md for full details.
```

### 2. Update CORTEX_SYSTEM_PROMPT.md

Add at top:

```markdown
## Prerequisites

**Read these files in order:**
1. `cortex/AGENTS.md` (you should have already read this)
2. This file (CORTEX_SYSTEM_PROMPT.md) - your full identity
3. `cortex/snapshot.sh` output - current repository state
```

### 3. Update Ralph's PROMPT.md

Add at top:

```markdown
## Prerequisites

**Read these files in order:**
1. `AGENTS.md` (you should have already read this)
2. This file (PROMPT.md) - your full identity and mode logic
3. `.verify/latest.txt` - verifier results (if exists)
```

### 4. Add Research Instructions to Both

**Cortex (CORTEX_SYSTEM_PROMPT.md):**

```markdown
## Research Capability

You have internet access. Use it when needed:
- **When:** Unknown technology, API documentation, error messages
- **How:** `curl -s URL` to fetch docs, specs, examples
- **Example:** `curl -s https://docs.python.org/3/...`
- **Fallback:** If blocked, ask user for information
```

**Ralph (PROMPT.md):**

```markdown
## Research Capability

You have internet access. Use it when needed:
- **When:** Stuck on error, unknown API, framework questions
- **How:** `curl -s URL` to fetch documentation
- **Example:** `curl -s https://api.github.com/...`
- **Balance:** Prefer skills/ knowledge base first, research second
```

### 5. Fix KB → Skills Terminology

**Global find/replace in templates:**

- "KB" → "skills"
- "Knowledge Base" → "Brain skills repository"
- Keep "kb/" for project-local knowledge directories

### 6. Deduplicate AGENTS.md and PROMPT.md

**Move to AGENTS.md (quick reference):**

- Environment prerequisites
- Quick tips and workflows
- Common pitfalls

**Keep in PROMPT.md (detailed logic):**

- Mode determination (PLAN vs BUILD)
- Verification flow
- Completion checklist
- Error protocols

---

## Action Items

1. ✅ Create `cortex/AGENTS.md` (30-50 lines)
2. ⚠️ Update `cortex/CORTEX_SYSTEM_PROMPT.md` to reference AGENTS.md
3. ⚠️ Update `workers/ralph/PROMPT.md` to reference AGENTS.md
4. ⚠️ Add research instructions to both agents
5. ⚠️ Fix KB → Skills terminology in all templates
6. ⚠️ Deduplicate content between AGENTS.md and PROMPT.md files
