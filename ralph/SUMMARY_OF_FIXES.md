# Summary: Ralph Workflow Fixes

## What Was Wrong

### 1. AGENTS.md Had Incorrect Information
**Line 45 (old):** "Single TODO List - PROMPT_plan.md is the only backlog"

**Problem:** This was misleading and caused confusion about the role of prompt files vs the actual TODO list.

**Root Cause:** Conflated instructions (prompts) with work items (plan)

### 2. Missing Separation of Concerns
The original AGENTS.md didn't clearly explain:
- PROMPT_plan.md = instructions for PLAN mode
- PROMPT_build.md = instructions for BUILD mode  
- IMPLEMENTATION_PLAN.md = the actual persistent TODO list

### 3. No IMPLEMENTATION_PLAN.md Reference
AGENTS.md never mentioned `IMPLEMENTATION_PLAN.md` - the file that persists across iterations!

## What Was Fixed

### 1. Created Proper PROMPT_plan.md (107 lines)
- **Analysis only** - no implementation allowed
- Creates/updates IMPLEMENTATION_PLAN.md
- NO commits
- Does NOT output `<promise>COMPLETE</promise>`
- Uses up to 500 parallel subagents for comparison

### 2. Created Proper PROMPT_build.md (131 lines)
- **Implementation only** - reads IMPLEMENTATION_PLAN.md
- Picks one task per iteration
- Implements, validates, commits
- Updates IMPLEMENTATION_PLAN.md
- Uses exactly 1 subagent for modifications
- Outputs `<promise>COMPLETE</promise>` when all tasks done

### 3. Updated AGENTS.md (101 lines)
**Added new section:** "Two-Mode Loop System"
- Clearly explains PLAN mode vs BUILD mode
- Documents that IMPLEMENTATION_PLAN.md is the TODO list
- Clarifies prompts are instructions, not backlogs

**Updated Design Philosophy:**
- "Prompts vs Plans" - explains the distinction
- "Single TODO List" - correctly identifies IMPLEMENTATION_PLAN.md

**Updated Context Loading:**
- Now includes IMPLEMENTATION_PLAN.md in the load order

**Updated Validation:**
- Checks for IMPLEMENTATION_PLAN.md existence

**Updated Troubleshooting:**
- References IMPLEMENTATION_PLAN.md (not PROMPT_plan.md) for task completion
- Added guidance for wrong mode running

### 4. Created IMPLEMENTATION_PLAN.md
- Sample TODO list showing proper structure
- Documents what was completed
- Has unchecked tasks for testing

## How to Use Ralph Now

### Planning Mode (Gap Analysis)
```bash
bash loop.sh --iterations 5 --plan-every 1
# Iteration 1: Reads specs, analyzes code, creates IMPLEMENTATION_PLAN.md
```

### Building Mode (Implementation)
```bash
bash loop.sh --iterations 20 --plan-every 999
# Picks tasks from IMPLEMENTATION_PLAN.md, implements one per iteration
```

### Alternating Mode (Recommended)
```bash
bash loop.sh --iterations 20 --plan-every 3
# Iteration 1: PLAN
# Iterations 2-3: BUILD
# Iteration 4: PLAN (re-analyze)
# Iterations 5-6: BUILD
# etc.
```

## Key Insights

1. **Prompts are instructions, plans are TODO lists**
   - PROMPT_*.md = how to behave in each mode
   - IMPLEMENTATION_PLAN.md = what work needs to be done

2. **IMPLEMENTATION_PLAN.md persists across iterations**
   - This is the "memory" between loop restarts
   - Gets updated by both PLAN and BUILD modes

3. **Deterministic context loading is critical**
   - PROMPT → AGENTS → NEURONS → IMPLEMENTATION_PLAN → specs
   - Same order every time = predictable behavior

4. **Ralph can complete tasks in 1 iteration if instructed to do PLAN+BUILD**
   - Not the standard pattern, but it worked
   - Standard pattern is cleaner: separate PLAN and BUILD phases

## Files Modified

- ✅ AGENTS.md (updated with two-mode system)
- ✅ PROMPT_plan.md (created - analysis only)
- ✅ PROMPT_build.md (created - implementation only)
- ✅ IMPLEMENTATION_PLAN.md (created - TODO list)

## Validation Results

- ✓ loop.sh syntax valid
- ✓ All core files exist (AGENTS, NEURONS, PROMPT_plan, PROMPT_build, IMPLEMENTATION_PLAN)
- ✓ AGENTS.md correctly documents two-mode system
- ✓ PROMPT_plan.md forbids implementation
- ✓ PROMPT_build.md requires reading IMPLEMENTATION_PLAN.md
- ✓ Clear separation between prompts and plans

## Next Steps

1. Test Ralph with planning mode: `bash loop.sh --iterations 1`
2. Add a sample task to IMPLEMENTATION_PLAN.md
3. Test Ralph with build mode: `bash loop.sh --iterations 5 --plan-every 999`
4. Verify Ralph picks tasks correctly and commits properly
