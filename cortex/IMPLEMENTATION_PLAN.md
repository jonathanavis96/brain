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


## Phase 13: Tool Registry

**Goal:** Move from implicit tool definitions to declarative registry.

**Context:** Tool cacheability is hardcoded in `case` statement. No discovery or permission model.

**Research:** `cortex/docs/research/tool-registry-research.md`

### Phase 13.1: Documentation & Skills

- [x] **13.1.1** Create `skills/domains/ralph/tool-wrapper-patterns.md`
  - **Goal:** Document run_tool() usage, cache key generation, error handling
  - **AC:** Skill covers wrapper API, cacheability rules, trap-based cleanup
  - **Priority:** HIGH

- [x] **13.1.2** Extract non-cacheable tools to config file
  - **Goal:** Move from hardcoded `case` to `config/non_cacheable_tools.txt`
  - **Change:** Update `is_non_cacheable()` in loop.sh to read from file
  - **AC:** Config file exists, loop.sh reads it, behavior unchanged
  - **Priority:** MEDIUM

### Phase 13.2: Registry Foundation

- [x] **13.2.1** Prototype YAML tool registry schema
  - **Goal:** Define registry format with 10 common tools as examples
  - **Location:** `config/tool-registry.yaml`
  - **Content:** Tool definitions with type, command, cacheable, tags
  - **AC:** Valid YAML with schema documented, covers shellcheck/markdownlint/git tools
  - **Priority:** LOW

---

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

## Phase 14: THUNK.md Deduplication Bug Fix

**Goal:** Fix duplicate entries in THUNK.md and prevent future duplicates from the archive script.

**Problem:** THUNK.md has 765 task rows but only ~500 unique task IDs. The `cleanup_plan.sh --archive` appends tasks without checking if they already exist, causing duplicates when run multiple times.

**Priority:** HIGH (data integrity issue, 30 min effort)

### Phase 14.1: Fix Archive Script

- [x] **14.1.1** Add idempotency check to `cortex/cleanup_cortex_plan.sh` [HIGH]
  - **Goal:** Prevent duplicate task entries when archiving
  - **AC:** Running `cleanup_cortex_plan.sh` twice on same completed tasks produces no duplicates
  - **Implementation:** Before appending, check `grep -q "| $task_id |" "$THUNK_FILE"`

### Phase 14.2: Cleanup Existing Data

- [x] **14.2.1** Create `tools/thunk_dedup.sh` one-time cleanup script [HIGH]
  - **Goal:** Remove duplicate entries from existing THUNK.md
  - **AC:** Script is idempotent, preserves first occurrence of each task ID, outputs count of removed duplicates
  - **Implementation:** `awk '!seen[$2]++'` on task ID column

- [x] **14.2.2** Run dedup on `workers/ralph/THUNK.md` [MEDIUM]
  - **Goal:** Clean existing data
  - **AC:** THUNK.md row count equals unique task ID count
  - **Depends:** 14.2.1

---

## Phase 15: Skill Dependency Graph

**Goal:** Visualize relationships between skill files to identify foundational skills, orphans, and clusters.

**Problem:** 90 skill files exist with implicit cross-references but no way to see the dependency structure.

**Priority:** HIGH (reveals hidden structure, 2 hr effort)

### Phase 15.1: Link Extraction

- [x] **15.1.1** Create `tools/skill_graph/extract_links.py` [HIGH]
  - **Goal:** Parse all `skills/**/*.md` for internal markdown links
  - **AC:** Outputs JSON with `{source: "file.md", targets: ["other.md", ...]}` for each skill
  - **Implementation:** Regex for `\[.*\]\((.*\.md)\)`, resolve relative paths

### Phase 15.2: Graph Generation

- [x] **15.2.1** Create `tools/skill_graph/generate_graph.py` [MEDIUM]
  - **Goal:** Convert link JSON to DOT format graph
  - **AC:** Valid DOT output that renders in Graphviz/online tools
  - **Depends:** 15.1.1

- [x] **15.2.2** Create `tools/skill_graph/skill_graph.sh` wrapper [LOW]
  - **Goal:** One-command pipeline: extract → generate → output
  - **AC:** `bash tools/skill_graph/skill_graph.sh` outputs valid DOT to stdout
  - **Depends:** 15.1.1, 15.2.1

### Phase 15.3: Documentation

- [x] **15.3.1** Create `tools/skill_graph/README.md` [LOW]
  - **Goal:** Document usage, output format, rendering options
  - **AC:** README explains how to render DOT (graphviz, online tools like viz-js.com)
  - **Depends:** 15.2.2

---

## Phase 16: Anti-Patterns Library

**Goal:** Document common mistakes to avoid, complementing the "how to do X" skills with "mistakes to avoid" knowledge.

**Problem:** Learning from failures is often more memorable than learning patterns. No anti-pattern documentation exists.

**Priority:** HIGH (high learning value, 1.5 hr effort)

### Phase 16.1: Create Anti-Patterns Directory

- [x] **16.1.1** Create `skills/domains/anti-patterns/README.md` [HIGH]
  - **Goal:** Establish anti-patterns directory with format guidelines
  - **AC:** README defines anti-pattern format: name, bad code, why wrong, fix, frequency rating

### Phase 16.2: Shell Anti-Patterns

- [x] **16.2.1** Create `skills/domains/anti-patterns/shell-anti-patterns.md` [HIGH]
  - **Goal:** Document 5+ common bash mistakes from ShellCheck history
  - **AC:** File has 5+ anti-patterns with SC codes, bad/good examples
  - **Sources:** SC2034 (unused var), SC2155 (declare+assign), SC2086 (unquoted), SC2181 ($? check), SC1091 (source)

### Phase 16.3: Other Anti-Patterns

- [x] **16.3.1** Create `skills/domains/anti-patterns/markdown-anti-patterns.md` [MEDIUM]
  - **Goal:** Document 5+ markdown formatting mistakes from lint history
  - **AC:** File has 5+ anti-patterns with MD codes, bad/good examples
  - **Sources:** MD040 (code fence lang), MD024 (duplicate headings), MD031 (blank lines)

- [ ] **16.3.2** Create `skills/domains/anti-patterns/ralph-anti-patterns.md` [MEDIUM]
  - **Goal:** Document patterns that break the Ralph loop
  - **AC:** File has 5+ anti-patterns specific to Ralph execution
  - **Sources:** Protected file edits, infinite loops, missing AC, batching too many tasks

- [ ] **16.3.3** Create `skills/domains/anti-patterns/documentation-anti-patterns.md` [LOW]
  - **Goal:** Document common documentation mistakes
  - **AC:** File has 5+ anti-patterns: stale links, missing examples, wall of text, etc.

### Phase 16.4: Index Updates

- [ ] **16.4.1** Update `skills/index.md` and `skills/SUMMARY.md` with anti-patterns [LOW]
  - **Goal:** Index the new anti-patterns directory
  - **AC:** Both files list anti-patterns section with all new files
  - **Depends:** 16.1.1-16.3.3

---

## Phase 17: Brain Analytics Dashboard

**Goal:** Visualize Brain's growth, velocity, and health metrics over time.

**Problem:** 1098 commits, 765 THUNK entries, 119 skill commits but no way to visualize the learning trajectory.

**Priority:** MEDIUM (high novelty, 3 hr effort)

### Phase 17.1: Metrics Collection

- [ ] **17.1.1** Create `tools/brain_dashboard/collect_metrics.sh` [HIGH]
  - **Goal:** Gather metrics from git, THUNK, skills/ into JSON
  - **AC:** Outputs JSON with: task_velocity (by week), skills_growth (by week), commit_frequency (by day), stale_skills (mtime > 30d)
  - **Sources:** `git log --format`, THUNK.md parsing, `find -mtime`

### Phase 17.2: Dashboard Generation

- [ ] **17.2.1** Create `tools/brain_dashboard/generate_dashboard.py` [HIGH]
  - **Goal:** Generate static HTML dashboard from metrics JSON
  - **AC:** Self-contained HTML with inline CSS, no external dependencies
  - **Depends:** 17.1.1

- [ ] **17.2.2** Create dashboard HTML template with charts [MEDIUM]
  - **Goal:** Visual charts for each metric type
  - **AC:** Dashboard shows: line chart (velocity), bar chart (skills growth), list (stale files)
  - **Implementation:** Use simple inline SVG or ASCII-based charts for zero dependencies
  - **Depends:** 17.2.1

### Phase 17.3: Integration

- [ ] **17.3.1** Create `tools/brain_dashboard/README.md` [LOW]
  - **Goal:** Document usage and metrics explained
  - **AC:** README shows command to generate and how to interpret metrics

- [ ] **17.3.2** Add dashboard generation to `cortex/snapshot.sh` (optional) [LOW]
  - **Goal:** Auto-regenerate dashboard on snapshot
  - **AC:** `artifacts/dashboard.html` updated when snapshot runs
  - **Depends:** 17.2.2

---

## Phase 18: Skill Freshness Decay Detection

**Goal:** Automatically flag stale skills that may need review/update.

**Problem:** Some of the 90 skills may reference outdated APIs or deprecated patterns. No way to detect staleness.

**Priority:** MEDIUM (proactive maintenance, 45 min effort)

### Phase 18.1: Freshness Scanner

- [ ] **18.1.1** Create `tools/skill_freshness.sh` [HIGH]
  - **Goal:** List all skills with age and flag stale ones
  - **AC:** Output shows all 90 skills with days since modified, flags those > threshold
  - **Implementation:** `find skills/ -name "*.md" -printf '%T@ %p\n'`, calculate age

- [ ] **18.1.2** Add `--days N` threshold flag [MEDIUM]
  - **Goal:** Configurable staleness threshold (default 90 days)
  - **AC:** `--days 30` flags skills older than 30 days
  - **Depends:** 18.1.1

- [ ] **18.1.3** Add CI-friendly exit code [LOW]
  - **Goal:** Exit 1 if any skills exceed threshold (for CI integration)
  - **AC:** Exit code reflects staleness status
  - **Depends:** 18.1.1

### Phase 18.2: Integration

- [ ] **18.2.1** Add freshness summary to `skills/SUMMARY.md` [LOW]
  - **Goal:** Show freshness status in skills overview
  - **AC:** SUMMARY.md has "Freshness Status" section (can be manually updated or scripted)
  - **Depends:** 18.1.1

---

## Phase 19: Cross-Project Pattern Mining

**Goal:** Create feedback loop from sibling projects back to Brain by identifying repeated patterns that could become skills.

**Problem:** Brain helps other projects but doesn't learn from their commit history.

**Priority:** MEDIUM (high novelty, 2.5 hr effort)

### Phase 19.1: Commit Analysis

- [ ] **19.1.1** Create `tools/pattern_miner/mine_patterns.sh` [HIGH]
  - **Goal:** Scan sibling project git logs for repeated commit patterns
  - **AC:** Discovers repos in `~/code/*/`, extracts commit messages from last 90 days
  - **Implementation:** `for repo in ~/code/*/; do git -C "$repo" log --oneline --since="90 days ago"; done`

- [ ] **19.1.2** Create `tools/pattern_miner/analyze_commits.py` [HIGH]
  - **Goal:** Group commits by keyword similarity, suggest potential skills
  - **AC:** Outputs suggestions with frequency: "CORS configuration (5 mentions) → suggest: api-cors-patterns.md"
  - **Depends:** 19.1.1

### Phase 19.2: Documentation

- [ ] **19.2.1** Create `tools/pattern_miner/README.md` [LOW]
  - **Goal:** Document usage and how to act on suggestions
  - **AC:** README explains output format and workflow for creating new skills from suggestions
  - **Depends:** 19.1.2

---

## Phase 20: Interactive Skill Quiz

**Goal:** Test knowledge retention by quizzing on skill content.

**Problem:** 90 skill files exist but no way to verify agents/humans internalized the knowledge.

**Priority:** LOW (high novelty but lower urgency, 2 hr effort)

### Phase 20.1: Scenario Extraction

- [ ] **20.1.1** Create `tools/skill_quiz/extract_scenarios.py` [MEDIUM]
  - **Goal:** Parse skill files for "When to Use" or "Problem" sections
  - **AC:** Outputs JSON with `{skill: "file.md", scenario: "text", solution: "text"}`
  - **Implementation:** Regex for section headers, extract content between headers

### Phase 20.2: Quiz Interface

- [ ] **20.2.1** Create `tools/skill_quiz/quiz.sh` interactive wrapper [MEDIUM]
  - **Goal:** Terminal-based quiz that presents scenarios and checks answers
  - **AC:** Randomly selects skill, shows scenario, accepts user input, reveals answer
  - **Depends:** 20.1.1

- [ ] **20.2.2** Add score tracking across rounds [LOW]
  - **Goal:** Track score during quiz session
  - **AC:** Shows "Score: X/Y" after each round
  - **Depends:** 20.2.1

### Phase 20.3: Documentation

- [ ] **20.3.1** Create `tools/skill_quiz/README.md` [LOW]
  - **Goal:** Document usage and skill file requirements
  - **AC:** README explains how to run quiz and what makes skills quiz-compatible
  - **Depends:** 20.2.1

---

## Phase 21: Token Efficiency & Tool Consolidation ⚡ NEXT

**Goal:** Reduce Ralph's token usage by providing structured query tools and enforcing lean context loading.

**Problem:** Ralph often opens large files (THUNK.md, IMPLEMENTATION_PLAN.md) when targeted queries would suffice. This wastes tokens and slows iterations.

**Priority:** HIGH (directly improves iteration speed and cost)

**Status:** ACTIVE - Start here

### Phase 21.1: Enhance thunk-parse with Query Capabilities

- [ ] **21.1.1** Rename `bin/thunk-parse` → `tools/thunk_parser.py` [MEDIUM]
  - **Goal:** Consolidate with other Python tools, follow naming convention
  - **AC:** `python3 tools/thunk_parser.py --help` works, old `bin/thunk-parse` removed
  - **Update:** Symlink `bin/thunk-parse` → `tools/thunk_parser.py` for backward compat

- [ ] **21.1.2** Add `--query-id` option to thunk_parser.py [HIGH]
  - **Goal:** Query THUNK by original task ID (e.g., "11.1.3")
  - **Usage:** `python3 tools/thunk_parser.py --query-id "11.1.3" --json`
  - **AC:** Returns JSON entry if found, empty if not
  - **Token savings:** Replaces `grep "11.1.3" THUNK.md` with structured query

- [ ] **21.1.3** Add `--last-id` option to thunk_parser.py [HIGH]
  - **Goal:** Get last THUNK entry number for appends
  - **Usage:** `python3 tools/thunk_parser.py --last-id`
  - **AC:** Prints integer (e.g., "830")
  - **Token savings:** Replaces `tail THUNK.md | grep | awk`

- [ ] **21.1.4** Add `--search` option with keyword matching [MEDIUM]
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
