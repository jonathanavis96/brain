# Tasks for Brain Ralph - Rovo Project Setup

**Date:** 2026-01-21 21:15:00  
**Context:** User manually copied Phase 0-Sync and Phase 0-P1 from brain to rovo, but Phase 0-Sync is brain-specific

---

## For Brain Repository Ralph (workers/ralph/)

Add these tasks to `workers/ralph/IMPLEMENTATION_PLAN.md` AFTER Phase 0-Sync:

---

### Phase 0-Rovo: Setup Cortex Manager for Rovo Project

- [ ] **0-R.1** Create cortex/ directory in rovo project
  - **Goal:** Add Cortex management infrastructure to existing rovo project
  - **Context:** Rovo project exists at `../rovo/` (sibling to brain)
  - **Changes:**
    1. Create `../rovo/cortex/` directory
    2. Copy templates from `brain/templates/cortex/` to `../rovo/cortex/`:
       - CORTEX_SYSTEM_PROMPT.project.md → CORTEX_SYSTEM_PROMPT.md
       - IMPLEMENTATION_PLAN.project.md → IMPLEMENTATION_PLAN.md
       - THOUGHTS.project.md → THOUGHTS.md
       - DECISIONS.project.md → DECISIONS.md
       - AGENTS.project.md → AGENTS.md
       - snapshot.sh → snapshot.sh
    3. Replace placeholders in copied files:
       - `{{PROJECT_NAME}}` → `Rovo Account Manager`
       - `{{PROJECT_PURPOSE}}` → `Autonomous Atlassian account pool management system`
       - `{{TECH_STACK}}` → `Python, Selenium, PowerShell (WSL), Gmail API`
       - `{{TIMESTAMP}}` → Current timestamp (YYYY-MM-DD HH:MM:SS format)
    4. Make snapshot.sh executable: `chmod +x ../rovo/cortex/snapshot.sh`
  - **AC:**
    - [ ] `../rovo/cortex/` directory exists
    - [ ] All 6 files copied and placeholders replaced
    - [ ] snapshot.sh is executable
    - [ ] Files use correct project context (Rovo Account Manager)
  - **If Blocked:** Verify `../rovo/` exists relative to brain repository

- [ ] **0-R.2** Populate Cortex THOUGHTS.md with current rovo state
  - **Goal:** Initialize Cortex's strategic context for rovo project
  - **Files:** `../rovo/cortex/THOUGHTS.md`
  - **Context:** Rovo has significant work done already (38+ accounts created, batch system working)
  - **Changes:**
    1. Read `../rovo/ralph/THOUGHTS.md` (if exists) for current project goals
    2. Read `../rovo/ralph/IMPLEMENTATION_PLAN.md` for task history
    3. Update `../rovo/cortex/THOUGHTS.md` with:
       - Current mission: Autonomous account pool management
       - Completed work: Batch creation, Gmail monitoring, browser automation
       - Current focus: Window management fix, pool reset logic
       - Known issues: Window not maximizing when manual action needed
       - Strategic goals: Minimize CAPTCHA interactions, prefer account reuse
  - **AC:**
    - [ ] THOUGHTS.md reflects actual rovo project state
    - [ ] Mentions window management issue
    - [ ] Documents current progress (Phase 1-2 mostly complete)
  - **If Blocked:** Ask user for rovo project priorities

- [ ] **0-R.3** Create initial Cortex IMPLEMENTATION_PLAN.md for rovo
  - **Goal:** Give Cortex a starting plan that Ralph can sync from
  - **Files:** `../rovo/cortex/IMPLEMENTATION_PLAN.md`
  - **Changes:**
    1. Copy window management tasks from `brain/cortex/ROVO_WINDOW_FIX_PLAN.md`
    2. Create Phase 0-Window section with 4 tasks (0-W.1 through 0-W.4)
    3. Add note: "Synced from brain/cortex analysis (2026-01-21)"
    4. Remove any brain-specific tasks (no Phase 0-Sync for rovo!)
  - **AC:**
    - [ ] IMPLEMENTATION_PLAN.md has Phase 0-Window tasks
    - [ ] Tasks are atomic and ready for ralph to execute
    - [ ] No brain-specific tasks included
  - **If Blocked:** Reference ROVO_WINDOW_FIX_PLAN.md for task details

---

## For Rovo Repository Ralph (../rovo/ralph/)

User should manually:

1. **DELETE Phase 0-Sync** from `../rovo/ralph/IMPLEMENTATION_PLAN.md`
   - Reason: That's a brain repository task (sync_cortex_plan.sh for brain/workers/ralph)
   - Rovo doesn't need it

2. **KEEP Phase 0-P1** (login retry logic fix) in `../rovo/ralph/IMPLEMENTATION_PLAN.md`
   - Reason: That IS a rovo-specific task (fixes create_account.sh)

3. **ADD Phase 0-Window tasks** from `../rovo/cortex/IMPLEMENTATION_PLAN.md` (after Brain Ralph completes 0-R.3)
   - These will be synced automatically once sync_cortex_plan.sh exists
   - Or manually copy for now

---

## Summary

**What Brain Ralph Does:**
- Creates cortex/ infrastructure in rovo project
- Populates with rovo-specific context
- Prepares window management fix plan

**What User Does:**
- Remove Phase 0-Sync from rovo plan (brain-specific)
- Keep Phase 0-P1 in rovo plan (rovo-specific)
- Use Cortex to manage rovo project going forward

**Result:**
- Rovo project has Cortex manager
- Window management fix tasks ready for rovo Ralph
- Clean separation between brain and rovo plans
