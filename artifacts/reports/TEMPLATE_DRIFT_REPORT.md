# Template Drift Report - Task 35.2.1 Audit

**Date:** 2026-01-28  
**Task:** 35.2.1 - Audit template drift for Phase 35.2.2 sync planning  
**Previous Audit:** 2026-01-27 (Phase 28.1) - found no critical drift

## Executive Summary

**Verdict:** ⚠️ **Significant improvements found in workers/ralph/**

**Note:** `new-project.sh` is a **brain-only tool; intentionally not templated** (operator workflow). Do not ship it into downstream project templates.

Since the last audit (2026-01-27), several beneficial enhancements have been made to `workers/ralph/` that should be propagated to `templates/ralph/`:

1. **loop.sh:** `.env` file loading support, improved model selection comments
2. **verifier.sh:** Empty stdout regex handling fix, simplified ROOT logic
3. **current_ralph_tasks.sh:** Phase section detection, improved archive marker logic
4. **PROMPT.md:** Path corrections (workers/workers/ references), removed outdated batch task template
5. **Documentation maturity:** workers/ralph/ has comprehensive README.md, AGENTS.md, NEURONS.md

**Action Required:** Phase 35.2.2 should selectively sync these improvements to templates.

**Status:** ✅ **AUDIT COMPLETE** - Ready for Phase 35.2.2 implementation

### Drift Policy Note: `new-project.sh` (Intentional / Brain-only)

`new-project.sh` is a **brain-only tool; intentionally not templated**. It is part of Brain's operator workflow for bootstrapping new repos and should not be shipped into downstream project templates.

## Findings Table

| ID | Item | Intended? | Action | Notes |
|----|------|-----------|--------|-------|
| W08 | `new-project.sh` | Intended | Keep brain-only | Project bootstrapping is an operator workflow; do not ship `new-project.sh` into downstream project templates. |

---

## Added and Should Be Templated

**Policy:** Project bootstrapping is an operator workflow; don't ship `new-project.sh` into downstream project templates.

(Everything listed below is limited to reusable worker/template infrastructure; exclude operator tools.)

---

## Template Update Plan

### Phase 1 (High Priority)

- Sync `loop.sh` `.env` loading support
- Sync `verifier.sh` empty stdout regex handling fix
- Sync `current_ralph_tasks.sh` Phase section detection
- Sync `PROMPT.md` path corrections

---

## Detailed Drift Analysis (2026-01-28 Audit)

### 1. Critical Improvements to Sync (High Priority)

#### 1.1 loop.sh - Environment Variable Loading

**Location:** `loop.sh` lines 30-37  
**Impact:** HIGH - enables per-project configuration via `.env` files

```bash
# workers/ralph/loop.sh HAS this feature (templates/ralph/loop.sh MISSING):
# Load environment variables from .env file (if exists)
if [[ -f "$ROOT/.env" ]]; then
  # shellcheck source=../../.env
  set -a  # Auto-export all variables
  source "$ROOT/.env"
  set +a
fi
```

**Recommendation:** Add to `templates/ralph/loop.sh` - enables projects to set `RALPH_PROJECT_ROOT`, `MODEL_ARG`, etc. via `.env`

#### 1.2 verifier.sh - Empty Stdout Regex Fix

**Location:** `verifier.sh` lines 450-462  
**Impact:** MEDIUM - fixes false negatives when commands produce no output

```bash
# workers/ralph/verifier.sh has robust empty stdout handling:
if [[ -z "$stdout_norm" ]]; then
  if ! echo "" | grep -Eq "$expect_stdout_regex"; then
    pass_check=0
    reasons+=("stdout regex mismatch expected=/$expect_stdout_regex/ got='${stdout_norm}'")
  fi
else
  if ! printf "%s" "$stdout_norm" | grep -Eq "$expect_stdout_regex"; then
    pass_check=0
    reasons+=("stdout regex mismatch expected=/$expect_stdout_regex/ got='${stdout_norm}'")
  fi
fi
```

**Recommendation:** Sync to `templates/ralph/verifier.sh` - prevents grep failures on empty output

#### 1.3 current_ralph_tasks.sh - Phase Section Detection

**Location:** `current_ralph_tasks.sh` lines 136-141, 318-325  
**Impact:** HIGH - correctly parses Phase-based task structure

```bash
# workers/ralph/ has improved Phase detection:
# Matches: "## Phase X: Description" sections
if [[ "$line" =~ ^##[[:space:]]+Phase[[:space:]]+[^:]+:[[:space:]]* ]]; then
  in_task_section=true
fi
```

**Recommendation:** Sync to `templates/ralph/current_ralph_tasks.sh` - essential for Phase-based plans

#### 1.4 PROMPT.md - Path Corrections

**Location:** `PROMPT.md` multiple locations  
**Impact:** MEDIUM - fixes incorrect path references

```markdown
# workers/ralph/PROMPT.md has correct paths:
⚠️ Ralph's tasks are in `workers/IMPLEMENTATION_PLAN.md`, NOT `workers/workers/IMPLEMENTATION_PLAN.md`
2. ✅ workers/ralph/THUNK.md entry (append to current era table)
3. ✅ workers/IMPLEMENTATION_PLAN.md update (mark task `[x]`)
```

**Recommendation:** Sync path corrections to `templates/ralph/PROMPT.md` - prevents confusion

---

### 2. Documentation Files - Special Case

**workers/ralph/ has mature documentation that templates/ lacks:**

| File | workers/ralph/ | templates/ralph/ | Should Template? |
|------|----------------|------------------|------------------|
| `README.md` | 490 lines - Brain-specific overview | 119 lines - Generic template intro | ⚠️ Partial - update template README with better bootstrap examples |
| `AGENTS.md` | Brain-specific operational guide | ❌ Missing | ❌ No - project-specific |
| `NEURONS.md` | Brain repository structure map | ❌ Missing | ❌ No - project-specific |
| `THOUGHTS.md` | Brain strategic vision | ❌ Missing | ❌ No - project-specific |
| `THUNK.md` | Brain task completion log | `.project` template exists | ✅ Template exists |
| `VALIDATION_CRITERIA.md` | Brain-specific criteria | `.project` template exists | ✅ Template exists |

**Recommendation:** Update `templates/ralph/README.md` with clearer bootstrap instructions and monitor examples

---

### 3. Low-Priority Differences (Optional Sync)

#### 3.1 cerebras_agent.py - System Prompt Refactor

**Impact:** LOW - workers/ralph/ loads from external `PROMPT_cerebras.md` file instead of inline prompt

**Recommendation:** DEFER - cerebras agent is experimental, not critical for templates

#### 3.2 README.md - Documentation Completeness

**Impact:** MEDIUM - templates/ralph/README.md is generic, workers/ralph/README.md has rich examples

**Recommendation:** Enhance `templates/ralph/README.md` with:

- Better monitor examples (hotkeys, timeout usage)
- Clearer `.env` configuration examples
- Bootstrap troubleshooting section
| `THOUGHTS.md` | Brain strategic vision | ❌ No (project-specific) |
| `VALIDATION_CRITERIA.md` | Brain validation rules | ❌ No (project-specific) |
| `PROMPT_cerebras.md` | Cerebras agent variant | ❌ No (experimental) |
| `ralph.sh` | Brain convenience wrapper | ❌ No (local tooling) |
| `sync_completions_to_cortex.sh` | Brain-Cortex sync | ❌ Deprecated (not used) |

### 2. Template-Only Files (Expected - Scaffolding)

These exist only in `templates/ralph/` and are used for new project creation:

| File | Purpose | Template? |
|------|---------|-----------|
| `.markdownlint.yaml` | Markdown lint config | ✅ Yes (already templated) |
| `IMPLEMENTATION_PLAN.project.md` | Empty plan scaffold | ✅ Yes (already templated) |
| `PROMPT.project.md` | Prompt template | ✅ Yes (already templated) |
| `RALPH.md` | Ralph documentation template | ✅ Yes (already templated) |
| `SKILL_TEMPLATE.md` | Skill creation template | ✅ Yes (already templated) |
| `THUNK.project.md` | THUNK log template | ✅ Yes (already templated) |
| `VALIDATION_CRITERIA.project.md` | Validation template | ✅ Yes (already templated) |
| `rules/` | AC rules directory | ✅ Yes (already templated) |

### 3. Code Drift Analysis (Legitimate Improvements)

#### 3.1 `loop.sh` Enhancements

**Status:** ✅ Already propagated to template (verified Jan 27)

Key improvements in both template and workers:

- Path context fixes (`workers/ralph/` → relative paths for templates)
- Cortex file denylist (Brain-specific paths)
- Scoped staging function improvements

**Sample diff (context adjustments only):**

```diff
- bash workers/ralph/loop.sh --dry-run
+ bash ralph/loop.sh --dry-run
```

These are **documentation path adjustments** for template context, not functionality drift.

#### 3.2 `current_ralph_tasks.sh` Improvements

**Status:** ✅ Already propagated to template (verified Jan 27)

Enhancements present in both:

- Archive section detection (`## Archive`, `## Era`)
- Phase section parsing (`## Phase X:`)
- Median duration calculation (beyond just average)
- Improved task section boundary detection

**Sample additions (present in both files):**

```bash
# Detect Archive sections - these terminate the current task section
# Note: This is a code snippet example showing variables used in context
while IFS= read -r line; do
  line_upper="${line^^}"
  if [[ "$line_upper" =~ ARCHIVE ]] || [[ "$line" =~ ^##[[:space:]]+Era[[:space:]]+ ]]; then
    in_task_section=false
    continue
  fi
done < input_file.md
```

#### 3.3 `fix-markdown.sh` Improvements

**Status:** ✅ Already propagated to template (verified Jan 27)

Enhancement in workers version:

```bash
# workers/ralph/ (improved)
BEFORE=$(echo "$BEFORE_OUTPUT" | grep -cve '^\s*$' || true)

# templates/ralph/ (older method)
BEFORE=$(echo "$BEFORE_OUTPUT" | grep -c "error" || true)
```

**Recommendation:** ✅ Template already has the improved version

---

## Recommendations Summary

### Immediate Sync (Phase 35.2.2)

1. **loop.sh:** Add `.env` file loading block (lines 30-37 from workers/ralph/)
2. **verifier.sh:** Add empty stdout regex handling (lines 450-462 from workers/ralph/)
3. **current_ralph_tasks.sh:** Update Phase section detection logic (lines 136-141, 318-325 from workers/ralph/)
4. **PROMPT.md:** Fix path references (workers/IMPLEMENTATION_PLAN.md → workers/IMPLEMENTATION_PLAN.md)

### Optional Enhancements

5. **templates/ralph/README.md:** Add monitor examples, `.env` configuration guidance
6. **loop.sh comments:** Improve model selection documentation

### Do NOT Sync

- `AGENTS.md`, `NEURONS.md`, `THOUGHTS.md`, `THUNK.md`, `VALIDATION_CRITERIA.md` - These are project-specific
- `cerebras_agent.py` changes - experimental, not yet stable
- `ralph.sh` - Brain-specific wrapper script

---

## Appendix: Previous Audit Results (2026-01-27)

### 3.4 `PROMPT.md` Path Adjustments (From Previous Audit)

**Status:** ✅ Context-appropriate (not drift)

Differences are Brain-specific path references:

- `workers/workers/IMPLEMENTATION_PLAN.md` vs `workers/IMPLEMENTATION_PLAN.md`
- `workers/ralph/workers/ralph/THUNK.md` vs `workers/ralph/THUNK.md`

These reflect Brain's multi-worker structure and are **appropriate for each context**.

#### 3.5 `README.md` Content Differences

**Status:** ✅ Appropriate (template vs instance documentation)

- **Template README:** Describes the Ralph template system and bootstrap process
- **Workers README:** Describes the Brain repository and its purpose

Both are correct for their respective contexts.

---

## File-by-File Verification

### Scripts with No Functional Drift

All core scripts verified identical in functionality:

| Script | Template | Workers | Status |
|--------|----------|---------|--------|
| `verifier.sh` | ✅ | ✅ | Hash-protected, identical |
| `cleanup_plan.sh` | ✅ | ✅ | Minor comment differences only |
| `init_verifier_baselines.sh` | ✅ | ✅ | Identical |
| `pr-batch.sh` | ✅ | ✅ | Path context only |
| `render_ac_status.sh` | ✅ | ✅ | Identical |
| `sync_workers_plan_to_cortex.sh` | ✅ | ✅ | Copied/renamed |
| `new-project.sh` | ✅ | ✅ | Path context only |
| `cerebras_agent.py` | ✅ | ✅ | Minor version differences |

---

## Identified Improvements Since Phase 24

### Successfully Propagated to Templates ✅

1. **Archive section detection** in `current_ralph_tasks.sh`
   - Prevents task monitor from parsing archived tasks
   - Present in both template and workers

2. **Median duration calculation** in `current_ralph_tasks.sh`
   - More robust duration statistics
   - Present in both template and workers

3. **Improved error counting** in `fix-markdown.sh`
   - Handles empty lines correctly
   - Present in both template and workers

4. **Path flexibility** in `loop.sh`
   - Works from both Brain and new project contexts
   - Present in both template and workers

---

## Recommendations

### No Action Required ✅

All identified differences fall into three categories:

1. **Brain-specific files** - Intentionally not templated
2. **Template scaffolding** - Already properly templated
3. **Legitimate improvements** - Already propagated to templates during Phase 24-26 work

### Monitoring for Future Phases

Continue following the **Template Sync Rule** from `AGENTS.md`:

> **When modifying `workers/ralph/` files, ask:** Is this feature useful ONLY in Brain, or useful in ANY project?
>
> - **Only Brain** → Keep change in `workers/ralph/` only
> - **Any project** → Add to `templates/ralph/` as well

---

## Verification Commands

```bash
# Full drift check (run from brain root)
diff -r templates/ralph/ workers/ralph/ | \
  grep -vc ".verify\|workers/ralph/THUNK.md\|artifacts\|logs\|__pycache__\|\.bak"

# Expected output: ~3,179 lines (mostly context differences)

# Check for Brain-specific files only in workers
grep "^Only in workers/ralph/" drift.txt | \
  grep -v "\.bak\|logs\|artifacts\|__pycache__"

# Expected output: AGENTS.md, NEURONS.md, THOUGHTS.md, etc.
```

---

## Conclusion

✅ **Templates are healthy** - No drift remediation needed.

Phase 24's template alignment successfully brought templates and workers into proper sync. All subsequent changes (Phase 25-27) have either been:

- Brain-specific features (intentionally not templated)
- Improvements already propagated to templates
- Documentation context adjustments (appropriate for each location)

**Next audit recommended:** After Phase 30 or ~50 additional tasks completed.
