# Skill Template (LLM-Optimized)

Use this template when creating new skill files. Copy and fill in all sections.

---

# Skill: <skill-short-name>

## 1) Intent (1 sentence)

What this skill enables Claude to do reliably.

## 2) Type

Choose one:
- Knowledge / Procedure / Tooling / Pattern / Debugging / Reference

## 3) Trigger Conditions (When to use)

Use this skill when ANY of these are true:
- <trigger 1>
- <trigger 2>
- <trigger 3>

## 4) Non-Goals (What NOT to do)

- <non-goal 1>
- <non-goal 2>

## 5) Inputs Required (and how to confirm)

Claude must gather/confirm:
- <input 1> (where to find it; how to validate)
- <input 2> (where to find it; how to validate)

## 6) Files / Sources to Study (DON'T SKIP)

Study these before acting:
- <path/file 1>
- <path/file 2>

Rules:
- Don't assume not implemented. Confirm with repo search.
- Prefer existing repo conventions/patterns over inventing new ones.

## 7) Procedure (LLM Playbook)

Follow in order:

### Step 1: Orient
- Study relevant docs/specs/code paths.
- Define the smallest viable outcome.

### Step 2: Decide
- Choose the simplest approach that matches existing patterns.
- If multiple approaches exist, pick the one that reduces future work.

### Step 3: Execute
- Keep changes minimal.
- Use consistent naming, paths, and conventions.

### Step 4: Validate
- Run the repo's standard checks/tests/build steps if any.
- If failures occur, fix them or document the failure + cause.

### Step 5: Record
- Update operational signs if needed (AGENTS.md, prompts, conventions).
- Update skills index (index.md).

## 8) Output / Deliverables

This skill is complete when these exist:
- <deliverable 1>
- <deliverable 2>

## 9) Gotchas / Failure Modes

Common ways Claude fails here:
- <failure mode 1> → mitigation
- <failure mode 2> → mitigation

## 10) Minimal Example (repo-specific)

**Context:**
<describe the situation>

**Steps taken:**
1. <step 1>
2. <step 2>

**Result:**
<what was produced>
