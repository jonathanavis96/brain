# THOUGHTS - Current Analysis & Decisions

## Current State (2026-01-19)

### ✅ Prevention System - DEPLOYED

The TOTP Waiver Approval System is fully operational:

| Component | Location | Purpose |
|-----------|----------|---------|
| `approve_waiver_totp.py` | `.verify/` | Validates 6-digit OTP from Google Authenticator |
| `launch_approve_waiver.sh` | `.verify/` | Auto-launches interactive terminal for approval |
| `check_waiver.sh` | `.verify/` | Gate integration - verifies approved waivers |
| `request_waiver.sh` | `.verify/` | Helper for Ralph to create waiver requests |

**Security Properties:**
- Ralph can create requests but CANNOT approve them
- TOTP secret stored outside repo (not accessible to Ralph)
- Hash verification prevents post-approval tampering
- Max 60-day expiry, max 10 active waivers
- No wildcards or repo-wide scope allowed

**Waiver Meta-Gates in AC.rules:**
- `Waiver.CountLimit` (warn) - Max 10 active
- `Waiver.NoBlanketScope` (block) - No wildcards
- `Waiver.ExpiryRequired` (block) - Must have expiry
- `Waiver.HashIntegrity` (block) - Hash must match
- `Waiver.NoUnapprovedInUse` (warn) - Pending requests flagged

---

## CodeRabbit v2 Analysis

**Source:** `CODERABBIT_REVIEW_ANALYSIS_v2.md`  
**Total:** 69 items (6 outside-diff + 32 minor + 31 nitpick)

### Completed Items (58)

All items from Phases 1-3 complete:
- ✅ Phase 1: Template hash baselines (1 item)
- ✅ Phase 2: Minor issues (12 items)
- ✅ Phase 3: Nitpicks (29 complete, 1 deferred, 1 skipped)

**Major accomplishments:**
- ✅ Bug A/B/C monitor fixes
- ✅ SC2155 shellcheck violations (all files)
- ✅ KB→Skills terminology migration (in-diff items)
- ✅ Dead code removal (unused variables/functions)
- ✅ Model version updates
- ✅ Fence language tags standardized
- ✅ AC status dashboard regenerated
- ✅ Process substitution for pipe-in-while patterns
- ✅ Verifier failure injection into prompt loop

### Remaining Work (5 items)

**Phase 4 - Outside Diff Items (5):**
- OD-1: generators/generate-thoughts.sh wording
- OD-2: templates/python/NEURONS.project.md kb→skills
- OD-3: templates/ralph/RALPH.md kb→skills
- OD-4: skills/projects/brain-example.md kb→skills
- OD-6: skills/SUMMARY.md fence tag

### Skipped Items (8)

| Items | Reason |
|-------|--------|
| S-1 to S-4 | `old_sh/test-rovodev-integration.sh` - archived code |
| S-5, S-6 | AC.rules patterns - intentional design |
| S-7 | Overlapping gates - defense-in-depth |
| S-8 | HISTORY.md - don't change historical records |

---

## Decision Log

### 2026-01-19: TOTP vs Hardware Key

**Decision:** Use TOTP as temporary bridge until hardware-key signing is available.

**Rationale:**
- Hardware keys (YubiKey) require additional setup and tooling
- TOTP provides "good enough" human verification for now
- System designed to be swappable to hardware keys later
- Secret stored outside repo ensures Ralph can't self-approve

### 2026-01-19: Single Waiver Location

**Decision:** Keep canonical waiver system at repo root `.verify/`

**Rationale:**
- One source of truth avoids sync issues
- Scripts copied to `ralph/.verify/` for template completeness
- All waiver requests/approvals stored at root level

### 2026-01-18: Sonnet as Default Model

**Decision:** Keep Sonnet 4.5 as hardcoded default, don't read from config.yml

**Rationale:**
- Predictable behavior
- Config.yml for user overrides, not defaults
- Usage text updated to reflect this

---

## Maintenance System (New - 2026-01-20)

A brain consistency checker has been set up:

```text
brain/ralph/.maintenance/
├── verify-brain.sh      # Runs 6 consistency checks
├── MAINTENANCE.md       # Active items queue  
└── MAINTENANCE_LOG.md   # Audit trail of completed items
```

**When in planning mode:** Run `bash .maintenance/verify-brain.sh` before planning.

---

## Cortex Manager Pack (New - 2026-01-20)

### Decision: Introduce "Cortex" as Manager Layer

**What:** Create a manager role ("Cortex") that plans and delegates to Ralph (worker).

**Why:**
- Ensures all planning sessions produce **atomic, actionable, testable** subtasks
- Separates planning (Cortex) from execution (Ralph)
- Provides consistent context bootstrapping for Opus sessions
- Prepares architecture for future parallel workers (e.g., Rust specialist)

**Architecture:**
```text
brain/
  cortex/                      ← Manager (Opus) - planning only
    CORTEX_SYSTEM_PROMPT.md    ← Identity + rules for Opus
    REPO_MAP.md                ← Human-friendly repo map
    DECISIONS.md               ← Stability anchor ("we decided X")
    RUNBOOK.md                 ← How to troubleshoot
    IMPLEMENTATION_PLAN.md     ← HIGH-LEVEL atomic tasks (Cortex writes)
    THOUGHTS.md                ← Cortex's thinking/decisions
    run.sh                     ← Invoke: bash cortex/run.sh
    snapshot.sh                ← Generate current state for context
    
  workers/
    ralph/                     ← Worker - execution only
      PROMPT.md                ← Ralph's instructions
      IMPLEMENTATION_PLAN.md   ← Ralph's COPY (tracks progress)
      THUNK.md                 ← Completion log
      loop.sh                  ← Existing loop machinery
      ...
      
  skills/                      ← Shared (Cortex manages, Ralph uses)
  templates/                   ← Shared (includes cortex/ template)
```

**Workflow:**
1. Human runs `bash cortex/run.sh` → Opus loads as Cortex
2. Cortex writes `cortex/IMPLEMENTATION_PLAN.md` (atomic tasks)
3. Human runs `bash workers/ralph/loop.sh`
4. Ralph copies Cortex plan to `workers/ralph/IMPLEMENTATION_PLAN.md` (once at startup)
5. Ralph executes tasks, updates his copy, logs to THUNK.md
6. Cortex can compare both plans to check alignment

**Restructure Strategy (Copy-Verify-Delete):**
- Phase A: Create Cortex alongside existing Ralph (no breaking changes)
- Phase B: Copy `brain/ralph/` → `brain/workers/ralph/`
- Phase C: Human verifies new location works
- Phase D: Delete old `brain/ralph/` (from new location)

This avoids Ralph breaking his own loop mid-execution.

---

## Next Actions

**IMPLEMENTATION_PLAN.md now has 7 phases (Cortex is Phase 0 - highest priority):**

0. **Phase 0:** Cortex Manager Pack (NEW - human approved 2026-01-20)
   - Create cortex/ folder and core files
   - Create run.sh and snapshot.sh
   - Update Ralph to read from Cortex plan
   - Restructure to workers/ralph/ (copy-verify-delete)
   - Update templates and new-project.sh
1. **Phase 1:** Quick fixes (terminology, template copy, broken links)
2. **Phase 2:** Shell script cleanup (16 items - dead code, SC2155, etc.)
3. **Phase 3:** Add Quick Reference tables to 5 skill files
4. **Phase 4:** Template maintenance (add Maintenance sections)
5. **Phase 5:** Design decisions (human approved):
   - DD-1/DD-2: Add `.initialized` marker to verifier bypass logic
   - DD-3: Gitignore personal config, create template version
6. **Phase 6:** Review D-1 to D-22 items against new plan

**Priority order:** Execute Phase 0-A first, STOP for human verification, then Phase 0-B, then phases 1-6.

**Safety layers for Phase 0-A → 0-B transition:**
1. Phase split: 0-A ends with copy, 0-B starts with delete (separate phases)
2. Mandatory stop sentinel: `:::PHASE-0A-COMPLETE:::` + `:::COMPLETE:::`
3. BLOCKED marker: Phase 0-B has visible "🔒 BLOCKED" notice
4. Prerequisite check: 0-B tasks state "Human has verified" requirement
