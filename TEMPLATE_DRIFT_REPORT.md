# Template Drift Report

**Generated:** 2026-01-26 21:55  
**Templates Root:** `templates/ralph/`  
**Current System Root:** `workers/ralph/`  
**Analyst:** Cortex (with Ralph forensic evidence)

---

## 1. Executive Summary

| Metric | Count |
|--------|-------|
| Files in BOTH (matched) | 15 |
| Files ONLY in templates | 9 |
| Files ONLY in current | 17 |
| Identical files | 5 |
| Modified files | 10 |

### Top 5 High-Impact Drifts

1. **loop.sh** (+173/-25 lines) - Major features added: scoped staging, caching, brain-specific paths
2. **verifier.sh** (+137/-14 lines) - Caching system added in current; template has new path logic we just fixed
3. **cerebras_agent.py** (+340/-190 lines) - Context management, token limits significantly evolved
4. **new-project.sh** (workers-only, 664 lines) - Major bootstrapping tool not templated
5. **Path architecture mismatch** - Templates assume `ralph/` structure, workers use `workers/ralph/`

---

## 2. Path Map / Assumptions

### Path Mapping Rules

| Template Path | Current Path | Notes |
|---------------|--------------|-------|
| `templates/ralph/` | `workers/ralph/` | Direct mapping |
| `templates/ralph/rules/AC.rules` | `rules/AC.rules` (root) | Brain uses root-level AC.rules |
| `*.project.md` | Renamed without `.project` suffix | Placeholder files for new projects |

### Ignored Globs

- `.verify/latest.txt`, `.verify/run_id.txt` (runtime)
- `*.bak` files
- `artifacts/`, `logs/` directories
- `__pycache__/`
- `.last_sync`

### Key Architectural Difference

**Templates assume:** `project/ralph/` structure (1 level)  
**Brain uses:** `project/workers/ralph/` structure (2 levels)

This affects ROOT calculation in loop.sh and verifier.sh.

---

## 3. Findings Table

| ID | File/Path | Diff Type | Intended? | Confidence | Impact | Summary | Action |
|----|-----------|-----------|-----------|------------|--------|---------|--------|
| **MATCHED FILES (exist in both)** | | | | | | | |
| D01 | `.gitignore` | Modified | Intended | High | Low | Brain adds `old_md/` ignore | Keep |
| D02 | `CEREBRAS_AGENT.md` | Identical | - | - | - | No drift | - |
| D03 | `HUMAN_REQUIRED.md` | Modified | Unknown | Medium | Low | Minor wording changes | Decide |
| D04 | `PROMPT.md` | Modified | Intended | High | High | Brain-specific context, paths | Keep |
| D05 | `README.md` | Modified | Intended | High | Med | Brain repo structure docs | Keep |
| D06 | `cerebras_agent.py` | Modified | Intended | High | High | Context mgmt, token limits evolved | Backport |
| D07 | `current_ralph_tasks.sh` | Modified | Intended | High | Med | Brain-specific parsing improvements | Backport |
| D08 | `docs/WAIVER_PROTOCOL.md` | Identical | - | - | - | No drift | - |
| D09 | `fix-markdown.sh` | Identical | - | - | - | No drift | - |
| D10 | `init_verifier_baselines.sh` | Identical | - | - | - | No drift (just synced) | - |
| D11 | `loop.sh` | Modified | Mixed | High | High | Scoped staging, caching = Backport; brain paths = Keep | Backport-partial |
| D12 | `pr-batch.sh` | Modified | Unknown | Low | Low | Path changes, minor logic | Decide |
| D13 | `sync_cortex_plan.sh` | Modified | Intended | Med | Med | Simplified in template | Keep |
| D14 | `thunk_ralph_tasks.sh` | Identical | - | - | - | No drift | - |
| D15 | `verifier.sh` | Modified | Mixed | High | High | Template has new path fix; current has caching | Backport-partial |
| **TEMPLATE-ONLY FILES** | | | | | | | |
| T01 | `.markdownlint.yaml` | Missing in current | Intended | High | Low | Root-level config used instead | Keep missing |
| T02 | `IMPLEMENTATION_PLAN.project.md` | Template placeholder | Intended | High | - | Becomes `IMPLEMENTATION_PLAN.md` | - |
| T03 | `PROMPT.project.md` | Template placeholder | Intended | High | - | Supplementary prompt template | - |
| T04 | `THUNK.project.md` | Template placeholder | Intended | High | - | Becomes `THUNK.md` | - |
| T05 | `VALIDATION_CRITERIA.project.md` | Template placeholder | Intended | High | - | Becomes `VALIDATION_CRITERIA.md` | - |
| T06 | `RALPH.md` | Missing in current | Unknown | Med | Low | Ralph identity doc? | Decide |
| T07 | `SKILL_TEMPLATE.md` | Missing in current | Intended | High | Low | Template for skills (brain has in skills/) | Keep missing |
| T08 | `rules/AC.rules` | Different location | Intended | High | Med | Template has sample; brain uses root `rules/` | Keep |
| T09 | `rules/MANUAL_APPROVALS.rules` | Different location | Intended | High | Low | Same pattern as AC.rules | Keep |
| **WORKERS-ONLY FILES** | | | | | | | |
| W01 | `AGENTS.md` | Not templated | Intended | High | Med | Brain-specific agent guide | Keep |
| W02 | `NEURONS.md` | Not templated | Intended | High | Med | Brain-specific repo map | Keep |
| W03 | `THOUGHTS.md` | Not templated | Intended | High | Low | Brain-specific strategy | Keep |
| W04 | `THUNK.md` | Instance of template | Intended | High | - | Active log (from .project.md) | Keep |
| W05 | `VALIDATION_CRITERIA.md` | Instance of template | Intended | High | - | Active criteria (from .project.md) | Keep |
| W06 | `PROMPT_cerebras.md` | Not templated | Unknown | Med | Med | Cerebras-specific prompt variant | Decide |
| W07 | `cleanup_plan.sh` | Not templated | Intended | Med | Low | Brain maintenance script | Keep |
| W08 | `new-project.sh` | Not templated | Unintended | High | High | **Should be templated** | Add-to-templates |
| W09 | `ralph.sh` | Not templated | Unknown | Med | Med | Wrapper script? | Decide |
| W10 | `render_ac_status.sh` | Not templated | Unknown | Low | Low | AC rendering utility | Decide |
| W11 | `sync_completions_to_cortex.sh` | Not templated | Intended | Med | Low | Brain-specific cortex sync | Keep |
| W12 | `config/non_cacheable_tools.txt` | Not templated | Unintended | Med | Med | Cache config - should template | Add-to-templates |
| W13 | `.maintenance/*` | Not templated | Intended | High | Low | Brain-specific maintenance | Keep |
| W14 | `.verify/agents.sha256` | Not templated | Unintended | High | Med | Template init script now creates this | Fixed |
| W15 | `.verify/protected_changes.log` | Not templated | Intended | Med | Low | Runtime log | Keep |

---

## 4. Detailed Findings

### 4.1 Missing but Should Be Added (templates → current)

**None identified.** Template files that are "missing" in current are either:

- Placeholder files (`.project.md`) that become instance files
- Different location by design (AC.rules at root)

### 4.2 Missing and Should Stay Missing (intentional)

| File | Reason |
|------|--------|
| `.markdownlint.yaml` in workers/ | Brain uses root-level config |
| `SKILL_TEMPLATE.md` in workers/ | Lives in `skills/self-improvement/` |
| `rules/AC.rules` in workers/ | Brain uses `rules/AC.rules` at root |

### 4.3 Added and Should Be Templated (current → templates)

#### W08: `new-project.sh` (HIGH PRIORITY)

**What:** 664-line bootstrap script for creating new projects with Ralph infrastructure.

**Why it matters:** This is THE tool for starting new projects. Without it in templates, new projects can't easily bootstrap themselves.

**Suggested action:** Copy to `templates/ralph/new-project.sh` with path adjustments for generic use.

#### W12: `config/non_cacheable_tools.txt`

**What:** 12-line config listing tools that shouldn't be cached.

**Why it matters:** Caching system depends on this. New projects need it.

**Suggested action:** Create `templates/ralph/config/non_cacheable_tools.txt` with sensible defaults.

### 4.4 Added but Should Be Removed (unwanted current-only)

**None identified.** All workers-only files serve a purpose.

### 4.5 Modified: Should Backport to Template

#### D06: `cerebras_agent.py`

**Changes in current:**

- `DEFAULT_MAX_TURNS`: 25 → 15 (safer default)
- Added `MAX_CONTEXT_CHARS = 50000` (context management)
- Added `MAX_TOOL_RESULT_CHARS = 4000` (truncation)
- Added `KEEP_RECENT_TURNS = 6`, `SUMMARIZE_AFTER_TURN = 3`
- +150 lines of context management logic

**Why backport:** These are battle-tested improvements that prevent token explosion.

#### D07: `current_ralph_tasks.sh`

**Changes in current:**

- +94 lines of improved parsing logic
- Better state tracking for task extraction

**Why backport:** Generic improvements to task display.

#### D11: `loop.sh` (PARTIAL)

**Backport these:**

- `stage_scoped_changes()` function - smart staging that avoids noise
- Protected file hash co-staging logic
- `CACHE_MODE` default change (`off` → `use`)

**Keep brain-specific:**

- Hardcoded paths like `workers/IMPLEMENTATION_PLAN.md`
- Brain-specific denylist patterns

#### D15: `verifier.sh` (PARTIAL)

**Template already has:** New path logic (RALPH_PROJECT_ROOT, SCRIPT_DIR-relative)

**Backport from current:**

- Caching system for verifier checks
- Cache key generation with AC.rules hash

### 4.6 Modified: Template is Correct (keep template version)

#### D15: `verifier.sh` ROOT/path logic

**Template version is correct** - we just fixed this today. The template now:

- Uses `RALPH_PROJECT_ROOT` env var if set
- Defaults to `$SCRIPT_DIR/..` (one level up)
- Finds AC.rules relative to SCRIPT_DIR

**Current (workers) version has:** `$SCRIPT_DIR/../..` which only works for `workers/ralph/` structure.

**Action:** The template path logic should NOT be overwritten by current. Instead, current should be updated to match template (but keep caching features).

---

## 5. Template Update Plan

### Phase 1: High Priority (do first)

1. **Add `new-project.sh` to templates**
   - Copy from `workers/ralph/new-project.sh`
   - Adjust hardcoded brain paths to be generic
   - Test with a fresh project

2. **Add `config/non_cacheable_tools.txt` to templates**
   - Copy from `workers/ralph/config/`
   - Verify defaults are sensible for new projects

3. **Backport `cerebras_agent.py` improvements**
   - Copy context management constants
   - Copy context trimming logic
   - Keep generic (no brain-specific code)

### Phase 2: Medium Priority

4. **Backport `loop.sh` staging improvements**
   - Extract `stage_scoped_changes()` function
   - Make denylist patterns configurable or generic
   - Keep `CACHE_MODE=use` default

5. **Backport `verifier.sh` caching**
   - Add cache lookup/store logic
   - Ensure it works with template's path logic (don't revert path fix!)

6. **Backport `current_ralph_tasks.sh` parsing improvements**
   - Diff carefully, extract generic improvements only

### Phase 3: Decisions Needed

7. **Decide: `RALPH.md`** - Is this needed? What's its purpose?
   - Question: Is this a duplicate of README.md or distinct?

8. **Decide: `PROMPT_cerebras.md`** - Should this be templated?
   - Question: Do other projects need Cerebras-specific prompts?

9. **Decide: `ralph.sh` wrapper** - What does this do?
   - Question: Is this a convenience wrapper worth templating?

10. **Decide: `render_ac_status.sh`** - Utility value?
    - Question: Is this brain-specific or generally useful?

### Dependencies

```text
Phase 1 items are independent - can be done in parallel
Phase 2.4 (loop.sh) should come before 2.5 (verifier.sh) - similar patterns
Phase 3 decisions can happen anytime
```

---

## 6. Questions for Resolution

| ID | Question | Resolves |
|----|----------|----------|
| Q1 | What is `RALPH.md` for? Is it distinct from README.md? | T06 |
| Q2 | Should `PROMPT_cerebras.md` be templated for Cerebras-using projects? | W06 |
| Q3 | What does `ralph.sh` do? Is it a wrapper worth templating? | W09 |
| Q4 | Is `render_ac_status.sh` generally useful or brain-specific? | W10 |
| Q5 | Should `pr-batch.sh` changes be backported? (path/logic changes unclear) | D12 |
| Q6 | Are `HUMAN_REQUIRED.md` changes intentional improvements or drift? | D03 |

---

**Acceptance Checklist:**

- [x] All files inventoried (templates: 30, workers: 40+)
- [x] Every modified file has semantic summary
- [x] Unknown items isolated with resolution questions (6 questions)
- [x] High-impact drifts identified (5 items)
- [x] Actionable update plan with phases and dependencies
