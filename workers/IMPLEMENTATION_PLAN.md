# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-26 02:30:00

**Current Status:** Phase 21 (Token Efficiency) is NEXT priority. Phase 21.2 complete (PROMPT.md rules), Phase 21.1 (thunk-parse enhancements) ready to start.

**Active Phases:**

- **Phase 21: Token Efficiency & Tool Consolidation (⚡ NEXT - 6/10 tasks complete)**
- Phase CR-6: CodeRabbit PR6 Fixes (✅ COMPLETED)
- Phase POST-CR6: Prevention Systems (✅ COMPLETED - all 7 tasks)
- Phase 10: RovoDev Parser & Observability (✅ COMPLETED - all 3 tasks)
- Phase 11: Thread Persistence & Search (✅ COMPLETED - all 4 tasks)
- Phase 12: Observability Improvements (🔄 IN PROGRESS - 1/4 tasks complete)
- Phases 13-20: Meta-tooling & Self-improvement (queued)

<!-- Cortex adds new Task Contracts below this line -->


## Phase 9C: Task Optimization (Batching + Decomposition)

**Goal:** Use Phase 0 structured logs to identify batching and decomposition opportunities, reducing task overhead and improving iteration success rate.

**Artifacts:** `artifacts/optimization_hints.md` (analysis output)

### Phase 9C.0: Prerequisites (Marker Pipeline Fix)

- [ ] **9C.0.3** Document RovoDev tool instrumentation limitation
  - **Goal:** Clarify that RovoDev's native tools bypass shell wrapper
  - **AC:** `artifacts/optimization_hints.md` has "Limitations" section explaining tool visibility gap
  - **Note:** RovoDev bash/grep/find_and_replace_code don't go through `log_tool_start()`

### Phase 9C.1: Batching Infrastructure

- [ ] **9C.1.1** Enhance `cortex/snapshot.sh` with batching hints
  - **Goal:** Show "⚡ Batching opportunities: X" when ≥3 similar pending tasks detected
  - **AC:** Snapshot output shows batching hints section when opportunities exist
  - **Detection:** Same error code (MDxxx, SCxxxx), same directory prefix, same file type

  - **Goal:** Document `[S/M/L]` complexity convention for task estimation
  - **AC:** PROMPT_REFERENCE.md has "Task Complexity" section with realistic time estimates (S=2-3min, M=5-10min, L=10-20min)

### Phase 9C.2: Apply Batching to Current Backlog

- [ ] **9C.2.1** Create batch task template in `templates/ralph/PROMPT.md`
  - **Goal:** Standard format for batched tasks with multi-file scope
  - **AC:** Template shows batch task example with glob patterns and verification

  - **Scope:** Create `templates/javascript/`, `templates/go/`, `templates/website/`
  - **Steps:**
    1. Define standard template structure (AGENTS.md, NEURONS.md, VALIDATION_CRITERIA.md)
    2. Create all three directories with standard files in one pass
    3. **Templates contain pointers to brain skills, NOT duplicated content**
    4. Verify each directory has required files
  - **AC:** All three template directories exist with standard structure and skill references
  - **Replaces:** 6.1.1, 6.1.2, 6.3.1
  - **Status:** 6.1.1 and 6.1.2 complete, 6.3.1 pending

- [ ] **9C.2.B2** BATCH: Update skills documentation (combines 7.2.1, 7.2.2)
  - **Scope:** `skills/index.md` + `skills/SUMMARY.md`
  - **Steps:**
    1. Scan `skills/domains/` and `skills/playbooks/` for all files
    2. Update `skills/index.md` with any missing entries
    3. Update `skills/SUMMARY.md` error reference and playbooks section
  - **AC:** Both index files list all current skills, SUMMARY includes playbooks
  - **Replaces:** 7.2.1, 7.2.2

- [ ] **9C.2.B3** BATCH: Improve onboarding docs (combines 7.1.1, 7.1.2)
  - **Scope:** Root `README.md` + new `CONTRIBUTING.md`
  - **Steps:**
    1. Enhance README.md onboarding flow (quick start, navigation)
    2. Create CONTRIBUTING.md with guidelines
    3. Cross-link between files
  - **AC:** README has clear onboarding, CONTRIBUTING.md exists
  - **Replaces:** 7.1.1, 7.1.2

### Phase 9C.3: Decomposition Detection

- [ ] **9C.3.1** Add duration tracking to `current_ralph_tasks.sh` footer
  - **Goal:** Show when current task exceeds 2x median (⚠️ warning)
  - **AC:** Footer shows "⚠️ Current task exceeding median" when appropriate

- [ ] **9C.3.2** Create decomposition checklist in `skills/playbooks/`
  - **Goal:** Playbook for breaking down oversized tasks
  - **AC:** `skills/playbooks/decompose-large-tasks.md` exists with decision criteria

### Phase 9C.4: Validation

- [ ] **9C.4.1** Validate batching recommendations against next 5 iterations
  - **Goal:** Measure if batched tasks reduce total time vs individual tasks
  - **AC:** Update `artifacts/optimization_hints.md` with before/after comparison

**Phase AC:**

- `artifacts/optimization_hints.md` updates from iter artifacts
- ≥3 batching opportunities identified with evidence
- ≥2 decomposition opportunities documented

---

---

## Recurring: Performance Monitoring

**Goal:** Continuously scan logs and identify performance optimization opportunities.

**Frequency:** Every 5 Ralph iterations (or when Cortex reviews progress)

**Process:**

1. **Scan iteration logs** in `artifacts/rollflow_cache/` for:
   - Tasks exceeding 10 minutes (decomposition candidates)
   - Repeated similar errors (skill gap candidates)
   - Multiple file edits in same directory (batching candidates)

2. **Update `artifacts/optimization_hints.md`** with:
   - New batching opportunities discovered
   - Decomposition recommendations
   - Skill gaps to fill

3. **Check gap radar output** from `bin/gap-radar --dry-run`:
   - New error patterns not covered by skills
   - Promote significant gaps to SKILL_BACKLOG.md

**Trigger:** Cortex should run `bash cortex/snapshot.sh` which shows batching hints when ≥3 similar tasks detected.

**AC:** `artifacts/optimization_hints.md` updated at least every 5 iterations with actionable insights.

---

## Phase 21: Token Efficiency & Tool Consolidation ⚡ NEXT

**Goal:** Reduce Ralph's token usage by providing structured query tools and enforcing lean context loading.

**Problem:** Ralph often opens large files (THUNK.md, IMPLEMENTATION_PLAN.md) when targeted queries would suffice. This wastes tokens and slows iterations.

**Priority:** HIGH (directly improves iteration speed and cost)

**Status:** ACTIVE - Start here

### Phase 21.1: Enhance thunk-parse with Query Capabilities

  - **Goal:** Consolidate with other Python tools, follow naming convention
  - **AC:** `python3 tools/thunk_parser.py --help` works, old `bin/thunk-parse` removed
  - **Update:** Symlink `bin/thunk-parse` → `tools/thunk_parser.py` for backward compat

  - **Goal:** Query THUNK by original task ID (e.g., "11.1.3")
  - **Usage:** `python3 tools/thunk_parser.py --query-id "11.1.3" --json`
  - **AC:** Returns JSON entry if found, empty if not
  - **Token savings:** Replaces `grep "11.1.3" THUNK.md` with structured query

  - **Goal:** Get last THUNK entry number for appends
  - **Usage:** `python3 tools/thunk_parser.py --last-id`
  - **AC:** Prints integer (e.g., "830")
  - **Token savings:** Replaces `tail THUNK.md | grep | awk`

  - **Goal:** Search THUNK entries by keyword
  - **Usage:** `python3 tools/thunk_parser.py --search "shellcheck" --limit 5`
  - **AC:** Returns matching entries as JSON
  - **Token savings:** Structured alternative to grep

### Phase 21.2: Token Efficiency Policy for PROMPT.md

- **Goal:** Explicit rules preventing broad file loading
- **Content:** Hard rules (no THUNK.md opens, no IMPL_PLAN opens without line slice)
- **AC:** PROMPT.md has "Read Budget" section with allowed/forbidden patterns
- **Reference:** Use `docs/TOOLS.md` for CLI alternatives
- **Completed:** 2026-01-26 (commit 9b087a7)

- **Goal:** Ralph uses cheap commands first before any file reads
- **Content:** Step A (grep for task), Step B (ensure thunk DB exists)
- **AC:** PROMPT.md has startup procedure that minimizes reads
- **Completed:** 2026-01-26 (commit 9b087a7)

- **Goal:** Keep templates in sync
- **AC:** Template matches workers/ralph/PROMPT.md token efficiency sections
- **Depends:** 21.2.1, 21.2.2
- **Completed:** 2026-01-26 (commit 9b087a7)

### Phase 21.3: Documentation Updates

- **Goal:** Reference CLI tools instead of raw grep/sed
- **AC:** Skill doc links to `docs/TOOLS.md`, shows CLI examples first
- **Completed:** 2026-01-26 (commit c546cd5)

- **Goal:** Easy discovery of tools reference
- **AC:** NEURONS.md has link in appropriate section
- **Completed:** 2026-01-26 (commit c546cd5)

- [ ] **21.3.3** Add tools reference to `skills/index.md` [LOW]
  - **Goal:** Include tools in searchable skills index
  - **AC:** Index has entry pointing to `docs/TOOLS.md`

---

## Phase 22: Markdown Lint Fixes

**Goal:** Fix manual markdown lint errors that auto-fix cannot resolve.

**Reference:** Markdown lint errors from pre-commit hook output.

**Priority:** HIGH (blocks clean pre-commit runs)

### Phase 22.1: RALPH LOOP FULL EXAMPLE.md Fixes

- [ ] **22.1.1** Fix MD012 (multiple blank lines) in `cortex/docs/RALPH LOOP FULL EXAMPLE.md` [HIGH]
  - **Goal:** Remove excessive blank lines (max 2 consecutive)
  - **Errors:** Lines 24, 133, 134, 315, 316, 382, 383, 434
  - **AC:** `markdownlint "cortex/docs/RALPH LOOP FULL EXAMPLE.md"` shows no MD012 errors

- [ ] **22.1.2** Fix MD046 (code block style) in `cortex/docs/RALPH LOOP FULL EXAMPLE.md` [HIGH]
  - **Goal:** Convert indented code blocks to fenced blocks with language tags
  - **Errors:** Lines 28, 42, 56, 86, 248, 268, 286, 292, 309, 367, 376, 416
  - **AC:** `markdownlint "cortex/docs/RALPH LOOP FULL EXAMPLE.md"` shows no MD046 errors

- [ ] **22.1.3** Fix MD038 (spaces in code spans) in `cortex/docs/RALPH LOOP FULL EXAMPLE.md` [HIGH]
  - **Goal:** Remove leading/trailing spaces in inline code spans
  - **Errors:** Lines 140, 145, 152, 166, 181, 188, 191
  - **AC:** `markdownlint "cortex/docs/RALPH LOOP FULL EXAMPLE.md"` shows no MD038 errors

- [ ] **22.1.4** Fix MD023/MD007/MD032 (heading/list formatting) in `cortex/docs/RALPH LOOP FULL EXAMPLE.md` [MEDIUM]
  - **Goal:** Fix heading indentation and list formatting issues
  - **Errors:** MD023 lines 439, 445; MD007 lines 441, 443, 444; MD032 lines 441, 443, 444
  - **AC:** `markdownlint "cortex/docs/RALPH LOOP FULL EXAMPLE.md"` shows no MD023/MD007/MD032 errors

- [ ] **22.1.5** Fix MD003/MD022 (heading style) in `cortex/docs/RALPH LOOP FULL EXAMPLE.md` [MEDIUM]
  - **Goal:** Convert setext headings to ATX style and fix blank lines around headings
  - **Errors:** MD003 lines 445, 449; MD022 lines 445, 449
  - **AC:** `markdownlint "cortex/docs/RALPH LOOP FULL EXAMPLE.md"` shows no MD003/MD022 errors

---
