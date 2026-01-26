# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-26 03:58:00

**Current Status:** Phase 21 (Token Efficiency) is NEXT priority. Phase 21.2 complete (PROMPT.md rules), Phase 21.1 (thunk-parse enhancements) ready to start.

**Active Phases:**

- **Phase 0-Warn: Verifier Warnings (🔴 URGENT - 1 task)**
- **Phase 21: Token Efficiency & Tool Consolidation (⚡ NEXT - 6/10 tasks complete)**
- Phase CR-6: CodeRabbit PR6 Fixes (✅ COMPLETED)
- Phase POST-CR6: Prevention Systems (✅ COMPLETED - all 7 tasks)
- Phase 10: RovoDev Parser & Observability (✅ COMPLETED - all 3 tasks)
- Phase 11: Thread Persistence & Search (✅ COMPLETED - all 4 tasks)
- Phase 12: Observability Improvements (🔄 IN PROGRESS - 1/4 tasks complete)
- Phases 13-20: Meta-tooling & Self-improvement (queued)

<!-- Cortex adds new Task Contracts below this line -->


---

## Phase 0-Warn: Verifier Warnings

**Goal:** Fix markdown lint errors that could not be auto-fixed.

- [x] **WARN.MD056.THUNK** Fix MD056 (table column count) in workers/ralph/THUNK.md line 780
  - **Issue:** Line 780 has 9 columns (expected 5) due to unescaped pipes in description text: `tail THUNK.md | grep | awk`
  - **AC:** `markdownlint workers/ralph/THUNK.md` passes (no MD056 errors)

---

## Phase CR-6: CodeRabbit PR6 Fixes

**Goal:** Fix remaining CodeRabbit issues before merging PR6.

**Reference:** `docs/CODERABBIT_ISSUES_TRACKER.md`

**Status:** All 11 Ralph-fixable issues identified. Ready for BUILD phase execution.

### Major Issues (Ralph Can Fix)

- [x] **CR-6.1** Fix LOGS_DIR reference in templates/ralph/loop.sh - ✅ FIXED
- [x] **CR-6.2** Fix brain-event flag parsing - ✅ FIXED
- [x] **CR-6.3** Fix THUNK.md table column count (MD056) - ✅ FIXED (2026-01-26)
- [x] **CR-6.4** Verify shfmt config in shell/README.md matches .pre-commit-config.yaml - ✅ VERIFIED (docs match config)
- [x] **CR-6.5** Review code-review-patterns.md line 286 code example - ✅ VERIFIED (no issues)
- [x] **CR-6.6** Review README.md line 326 documentation - ✅ VERIFIED (only 1 Contributing section)
- [x] **CR-6.7** Fix observability-patterns.md code examples - ✅ VERIFIED (no hardcoded secrets)
- [x] **CR-6.8** Fix TypeScript README links - ✅ FIXED (file created)
- [x] **CR-6.9** Fix deployment-patterns.md import time - ✅ FIXED
- [x] **CR-6.10** Fix JavaScript examples (userId, Jest flag) - ✅ VERIFIED (userId defined, Jest flags correct)
- [x] **CR-6.11** Fix archive header parsing in current_ralph_tasks.sh - ✅ FIXED (THUNK #773)

### Human Required (Hash/Protected Files)

**Note:** These require human intervention after Ralph prepares fixes:

- [x] **CR-6.H1** Update SHA256 hashes after all fixes
  - Run hash regeneration for all `.verify/` directories
  - **Files:** `.verify/`, `workers/ralph/.verify/`, `templates/ralph/.verify/`
  - **Updated:** agents.sha256 (root + workers/ralph), loop.sha256 (templates/ralph), prompt.sha256 (templates/ralph)

---

## Notes

- **Protected files (loop.sh, verifier.sh, PROMPT.md):** Ralph can prepare fixes but human must update hashes
- **Hash regeneration:** Already handled by human - C1-C8 issues resolved
- **egg-info cleanup (G1):** Already fixed - directory removed and added to .gitignore
- **Reference:** See `docs/CODERABBIT_ISSUES_TRACKER.md` for complete issue list

## Phase POST-CR6: Post-CodeRabbit Prevention Systems

**Goal:** Address systemic issues identified by CodeRabbit analysis to prevent future issues.

**Reference:** `docs/CODERABBIT_ISSUES_TRACKER.md` - Prevention Systems section

**Rationale:** CodeRabbit identified 50+ issues across PR5 and PR6 with significant recurring patterns. These prevention systems will catch issues before PR creation.

### High Priority Prevention

- [x] **POST-CR6.1** Implement hash validation pre-commit hook - Completed 2026-01-26 (THUNK #818)
  - **Goal:** Prevent SHA256 hash mismatches (8 instances in PR5, 1 in PR6)
  - **Implementation:** Pre-commit hook that validates all `.verify/*.sha256` files match targets
  - **Files:** `.git/hooks/pre-commit` or `.pre-commit-config.yaml`
  - **AC:** Hook blocks commits when hash mismatches detected
  - **Priority:** HIGH (recurring critical issue)

- [x] **POST-CR6.2** Create shell script unit test framework
  - **Goal:** Catch logic bugs in shell scripts (4 bugs in PR5, 3 in PR6)
  - **Implementation:** Setup bats-core framework, write tests for bin/brain-event flag parsing
  - **Files:** `tests/unit/`, `.pre-commit-config.yaml`
  - **AC:** `bats tests/unit/*.bats` runs successfully
  - **Priority:** HIGH (recurring logic bugs)

- [x] **POST-CR6.6** Expand semantic code review skill - Completed 2026-01-26 (THUNK #820)
  - **Goal:** Document patterns for LLM-based code review (complementing pre-commit)
  - **Implementation:** Expand `skills/domains/code-quality/code-review-patterns.md`
  - **Coverage:** Regex capture groups, dead code detection, variable scope, security
  - **AC:** Skill includes comprehensive checklist and examples
  - **Priority:** HIGH (already partially done in CR-4.1, needs expansion)

### Medium Priority Prevention

- [x] **POST-CR6.3** Implement documentation link validation - Completed 2026-01-26 (THUNK #821)
  - **Goal:** Prevent broken internal links (10 documentation issues across PRs)
  - **Implementation:** Script that validates all `[text](path)` links resolve to existing files
  - **Files:** `tools/validate_links.sh`, `.pre-commit-config.yaml`
  - **AC:** Script detects broken links in README.md, skills/, docs/
  - **Priority:** MEDIUM (recurring but non-breaking)

- [x] **POST-CR6.4** Create code example validation system - Completed 2026-01-26 (THUNK #822)
  - **Goal:** Ensure code examples are runnable (8 broken examples in PR5, 2 in PR6)
  - **Implementation:** Extract code blocks from markdown, validate syntax, check imports/variables
  - **Files:** `tools/validate_examples.py`, `.pre-commit-config.yaml`
  - **AC:** Script identifies missing imports, undefined variables, syntax errors
  - **Priority:** MEDIUM (quality issue, not functional)

- [x] **POST-CR6.7** Document prevention system architecture - Completed 2026-01-26 (THUNK #824)
  - **Goal:** Explain how prevention layers work together
  - **Implementation:** Create `docs/QUALITY_GATES.md`
  - **Coverage:** Pre-commit hooks → verifier → CodeRabbit → human review
  - **AC:** Document shows what each layer catches, with examples
  - **Priority:** MEDIUM (helps maintainers understand system)

### Low Priority Prevention

- [x] **POST-CR6.5** Implement documentation-config sync validation
  - **Goal:** Keep README.md in sync with actual config files
  - **Implementation:** Script that compares documented flags/settings with real configs
  - **Files:** `tools/validate_doc_sync.sh`
  - **AC:** Script catches shell/README.md shfmt config mismatch (CR-6.4 type issues)
  - **Priority:** LOW (infrequent)

---

## Phase 10: RovoDev Parser & Observability

**Goal:** Build parser for RovoDev's ANSI tool output to enable complete tool visibility.

**Context:** RovoDev emits tool calls in logs (`⬡ Calling <tool>:` / `⬢ Called <tool>:`), but rollflow_analyze doesn't parse this format yet.

### Phase 10.1: RovoDev Parser

- [x] **10.1.1** Create RovoDev ANSI parser in `tools/rollflow_analyze/src/rollflow_analyze/parsers/` - Completed 2026-01-26 (THUNK #827)
  - **Goal:** Parse RovoDev tool output format from logs
  - **Input format:** `⬡ Calling <tool>:` (start), `⬢ Called <tool>:` (end), optional `N seconds` duration
  - **Output:** ToolCall objects matching existing model
  - **AC:** Parser extracts tool_name, start/end markers, duration from sample log
  - **Test:** Add test file with sample RovoDev output

- [x] **10.1.2** Integrate RovoDev parser into rollflow_analyze pipeline - Completed 2026-01-26 (THUNK #827)
  - **Goal:** Unified parsing across :::MARKER::: and RovoDev formats
  - **AC:** `rollflow_analyze` reports include RovoDev tool calls
  - **Depends on:** 10.1.1

### Phase 10.2: Documentation

- [x] **10.2.1** Update docs/events.md with RovoDev format section - Completed 2026-01-26 (THUNK #827)
  - **Goal:** Document RovoDev's tool output format alongside :::MARKER::: format
  - **AC:** events.md has "RovoDev Format" section with examples

---

## Phase 11: Thread Persistence & Search

**Goal:** Enable searchable, queryable thread storage for agent work history.

**Context:** THUNK.md is append-only markdown; rollflow_cache is SQLite. Need unified search across both.

**Research:** `cortex/docs/research/thread-persistence-research.md`

### Phase 11.1: Documentation & Skills

- [x] **11.1.1** Create `skills/domains/ralph/thread-search-patterns.md`
  - **Goal:** Document search patterns for THUNK, git, and cache
  - **AC:** Skill includes grep patterns for THUNK.md, git log examples, sqlite queries
  - **Priority:** HIGH

- [x] **11.1.2** Build THUNK.md parser (Python script)
  - **Goal:** Extract structured data from THUNK.md markdown table
  - **Output:** JSON or SQLite with thunk_num, task_id, priority, description, date
  - **AC:** Parser handles current THUNK format (800+ entries), outputs valid JSON
  - **Priority:** MEDIUM

### Phase 11.2: Tooling

- [x] **11.1.3** Create SQLite schema for unified thread storage - Completed 2026-01-26 (THUNK #830)
  - **Goal:** Single database for threads, work_items, tool_executions
  - **Schema:** See `cortex/docs/research/thread-persistence-research.md` Section 3.2
  - **AC:** Schema created with FTS5 index on descriptions
  - **Priority:** MEDIUM

- [x] **11.2.1** Build `bin/brain-search` CLI tool
  - **Goal:** Quick lookups across THUNK, git, cache
  - **Usage:** `brain-search "shellcheck"` → shows matching tasks, commits, tool calls
  - **AC:** CLI returns results from at least 2 sources (THUNK + git)
  - **Priority:** LOW

---

## Phase 12: Observability Improvements

**Goal:** Formalize event schemas and improve observability tooling.

**Context:** Brain has multiple event formats (:::MARKER:::, JSONL, RovoDev ANSI). Need unified documentation and tooling.

**Research:** `cortex/docs/research/agent-observability-research.md`

### Phase 12.1: Documentation & Skills

- [x] **12.1.1** Create `skills/domains/infrastructure/agent-observability-patterns.md`
  - **Goal:** Document how to add observability to new tools/scripts
  - **AC:** Skill covers marker emission, JSONL events, log correlation
  - **Priority:** HIGH

- [x] **12.1.2** Create `docs/MARKER_SCHEMA.md` - formal spec for all markers
  - **Goal:** Single source of truth for :::MARKER::: format
  - **Content:** All marker types, fields, examples, versioning policy
  - **AC:** Schema doc covers all markers in loop.sh, includes validation rules
  - **Priority:** HIGH

### Phase 12.2: Tooling

- [x] **12.2.1** Add real-time event watcher `bin/brain-event --watch`
  - **Goal:** Live tail of events with filtering
  - **Usage:** `brain-event --watch --filter="phase_end"`
  - **AC:** Watcher shows new events in real-time from state/events.jsonl
  - **Priority:** LOW

- [x] **12.2.2** Create cross-run aggregation queries for cache.sqlite
  - **Goal:** Query patterns for analyzing tool performance across runs
  - **Output:** Add to `skills/domains/ralph/cache-debugging.md`
  - **AC:** At least 5 useful queries documented (slowest tools, fail rates, etc.)
  - **Priority:** LOW

---

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

- [x] **9C.0.3** Document RovoDev tool instrumentation limitation
  - **Goal:** Clarify that RovoDev's native tools bypass shell wrapper
  - **AC:** `artifacts/optimization_hints.md` has "Limitations" section explaining tool visibility gap
  - **Note:** RovoDev bash/grep/find_and_replace_code don't go through `log_tool_start()`

### Phase 9C.1: Batching Infrastructure

- [x] **9C.1.1** Enhance `cortex/snapshot.sh` with batching hints
  - **Goal:** Show "⚡ Batching opportunities: X" when ≥3 similar pending tasks detected
  - **AC:** Snapshot output shows batching hints section when opportunities exist
  - **Detection:** Same error code (MDxxx, SCxxxx), same directory prefix, same file type

  - **Goal:** Document `[S/M/L]` complexity convention for task estimation
  - **AC:** PROMPT_REFERENCE.md has "Task Complexity" section with realistic time estimates (S=2-3min, M=5-10min, L=10-20min)

### Phase 9C.2: Apply Batching to Current Backlog

- [x] **9C.2.1** Create batch task template in `templates/ralph/PROMPT.md`
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

- [x] **9C.2.B2** BATCH: Update skills documentation (combines 7.2.1, 7.2.2)
  - **Scope:** `skills/index.md` + `skills/SUMMARY.md`
  - **Steps:**
    1. Scan `skills/domains/` and `skills/playbooks/` for all files
    2. Update `skills/index.md` with any missing entries
    3. Update `skills/SUMMARY.md` error reference and playbooks section
  - **AC:** Both index files list all current skills, SUMMARY includes playbooks
  - **Replaces:** 7.2.1, 7.2.2

- [x] **9C.2.B3** BATCH: Improve onboarding docs (combines 7.1.1, 7.1.2)
  - **Scope:** Root `README.md` + new `CONTRIBUTING.md`
  - **Steps:**
    1. Enhance README.md onboarding flow (quick start, navigation)
    2. Create CONTRIBUTING.md with guidelines
    3. Cross-link between files
  - **AC:** README has clear onboarding, CONTRIBUTING.md exists
  - **Replaces:** 7.1.1, 7.1.2

### Phase 9C.3: Decomposition Detection

- [x] **9C.3.1** Add duration tracking to `current_ralph_tasks.sh` footer
  - **Goal:** Show when current task exceeds 2x median (⚠️ warning)
  - **AC:** Footer shows "⚠️ Current task exceeding median" when appropriate

- [x] **9C.3.2** Create decomposition checklist in `skills/playbooks/`
  - **Goal:** Playbook for breaking down oversized tasks
  - **AC:** `skills/playbooks/decompose-large-tasks.md` exists with decision criteria

### Phase 9C.4: Validation

- [x] **9C.4.1** Validate batching recommendations against next 5 iterations
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

- [x] **16.3.2** Create `skills/domains/anti-patterns/ralph-anti-patterns.md` [MEDIUM]
  - **Goal:** Document patterns that break the Ralph loop
  - **AC:** File has 5+ anti-patterns specific to Ralph execution
  - **Sources:** Protected file edits, infinite loops, missing AC, batching too many tasks

- [x] **16.3.3** Create `skills/domains/anti-patterns/documentation-anti-patterns.md` [LOW]
  - **Goal:** Document common documentation mistakes
  - **AC:** File has 5+ anti-patterns: stale links, missing examples, wall of text, etc.

### Phase 16.4: Index Updates

- [x] **16.4.1** Update `skills/index.md` and `skills/SUMMARY.md` with anti-patterns [LOW]
  - **Goal:** Index the new anti-patterns directory
  - **AC:** Both files list anti-patterns section with all new files
  - **Depends:** 16.1.1-16.3.3

---

## Phase 17: Brain Analytics Dashboard

**Goal:** Visualize Brain's growth, velocity, and health metrics over time.

**Problem:** 1098 commits, 765 THUNK entries, 119 skill commits but no way to visualize the learning trajectory.

**Priority:** MEDIUM (high novelty, 3 hr effort)

### Phase 17.1: Metrics Collection

- [x] **17.1.1** Create `tools/brain_dashboard/collect_metrics.sh` [HIGH]
  - **Goal:** Gather metrics from git, THUNK, skills/ into JSON
  - **AC:** Outputs JSON with: task_velocity (by week), skills_growth (by week), commit_frequency (by day), stale_skills (mtime > 30d)
  - **Sources:** `git log --format`, THUNK.md parsing, `find -mtime`

### Phase 17.2: Dashboard Generation

- [x] **17.2.1** Create `tools/brain_dashboard/generate_dashboard.py` [HIGH]
  - **Goal:** Generate static HTML dashboard from metrics JSON
  - **AC:** Self-contained HTML with inline CSS, no external dependencies
  - **Depends:** 17.1.1

- [x] **17.2.2** Create dashboard HTML template with charts [MEDIUM]
  - **Goal:** Visual charts for each metric type
  - **AC:** Dashboard shows: line chart (velocity), bar chart (skills growth), list (stale files)
  - **Implementation:** Use simple inline SVG or ASCII-based charts for zero dependencies
  - **Depends:** 17.2.1

### Phase 17.3: Integration

- [x] **17.3.1** Create `tools/brain_dashboard/README.md` [LOW]
  - **Goal:** Document usage and metrics explained
  - **AC:** README shows command to generate and how to interpret metrics

- [x] **17.3.2** Add dashboard generation to `cortex/snapshot.sh` (optional) [LOW]
  - **Goal:** Auto-regenerate dashboard on snapshot
  - **AC:** `artifacts/dashboard.html` updated when snapshot runs
  - **Depends:** 17.2.2

---

## Phase 18: Skill Freshness Decay Detection

**Goal:** Automatically flag stale skills that may need review/update.

**Problem:** Some of the 90 skills may reference outdated APIs or deprecated patterns. No way to detect staleness.

**Priority:** MEDIUM (proactive maintenance, 45 min effort)

### Phase 18.1: Freshness Scanner

- [x] **18.1.1** Create `tools/skill_freshness.sh` [HIGH]
  - **Goal:** List all skills with age and flag stale ones
  - **AC:** Output shows all 90 skills with days since modified, flags those > threshold
  - **Implementation:** `find skills/ -name "*.md" -printf '%T@ %p\n'`, calculate age

- [x] **18.1.2** Add `--days N` threshold flag [MEDIUM]
  - **Goal:** Configurable staleness threshold (default 90 days)
  - **AC:** `--days 30` flags skills older than 30 days
  - **Depends:** 18.1.1

- [x] **18.1.3** Add CI-friendly exit code [LOW]
  - **Goal:** Exit 1 if any skills exceed threshold (for CI integration)
  - **AC:** Exit code reflects staleness status
  - **Depends:** 18.1.1

### Phase 18.2: Integration

- [x] **18.2.1** Add freshness summary to `skills/SUMMARY.md` [LOW]
  - **Goal:** Show freshness status in skills overview
  - **AC:** SUMMARY.md has "Freshness Status" section (can be manually updated or scripted)
  - **Depends:** 18.1.1

---

## Phase 19: Cross-Project Pattern Mining

**Goal:** Create feedback loop from sibling projects back to Brain by identifying repeated patterns that could become skills.

**Problem:** Brain helps other projects but doesn't learn from their commit history.

**Priority:** MEDIUM (high novelty, 2.5 hr effort)

### Phase 19.1: Commit Analysis

- [x] **19.1.1** Create `tools/pattern_miner/mine_patterns.sh` [HIGH]
  - **Goal:** Scan sibling project git logs for repeated commit patterns
  - **AC:** Discovers repos in `~/code/*/`, extracts commit messages from last 90 days
  - **Implementation:** `for repo in ~/code/*/; do git -C "$repo" log --oneline --since="90 days ago"; done`

- [x] **19.1.2** Create `tools/pattern_miner/analyze_commits.py` [HIGH]
  - **Goal:** Group commits by keyword similarity, suggest potential skills
  - **AC:** Outputs suggestions with frequency: "CORS configuration (5 mentions) → suggest: api-cors-patterns.md"
  - **Depends:** 19.1.1

### Phase 19.2: Documentation

- [x] **19.2.1** Create `tools/pattern_miner/README.md` [LOW]
  - **Goal:** Document usage and how to act on suggestions
  - **AC:** README explains output format and workflow for creating new skills from suggestions
  - **Depends:** 19.1.2

---

## Phase 20: Interactive Skill Quiz

**Goal:** Test knowledge retention by quizzing on skill content.

**Problem:** 90 skill files exist but no way to verify agents/humans internalized the knowledge.

**Priority:** LOW (high novelty but lower urgency, 2 hr effort)

### Phase 20.1: Scenario Extraction

- [x] **20.1.1** Create `tools/skill_quiz/extract_scenarios.py` [MEDIUM]
  - **Goal:** Parse skill files for "When to Use" or "Problem" sections
  - **AC:** Outputs JSON with `{skill: "file.md", scenario: "text", solution: "text"}`
  - **Implementation:** Regex for section headers, extract content between headers

### Phase 20.2: Quiz Interface

- [x] **20.2.1** Create `tools/skill_quiz/quiz.sh` interactive wrapper [MEDIUM]
  - **Goal:** Terminal-based quiz that presents scenarios and checks answers
  - **AC:** Randomly selects skill, shows scenario, accepts user input, reveals answer
  - **Depends:** 20.1.1

- [x] **20.2.2** Add score tracking across rounds [LOW]
  - **Goal:** Track score during quiz session
  - **AC:** Shows "Score: X/Y" after each round
  - **Depends:** 20.2.1

### Phase 20.3: Documentation

- [x] **20.3.1** Create `tools/skill_quiz/README.md` [LOW]
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

- [x] **21.1.1** Rename `bin/thunk-parse` → `tools/thunk_parser.py` [MEDIUM]
  - **Goal:** Consolidate with other Python tools, follow naming convention
  - **AC:** `python3 tools/thunk_parser.py --help` works, old `bin/thunk-parse` removed
  - **Update:** Symlink `bin/thunk-parse` → `tools/thunk_parser.py` for backward compat
  - **Completed:** 2026-01-26 (commit 933e246)

- [x] **21.1.2** Add `--query-id` option to thunk_parser.py [HIGH]
  - **Goal:** Query THUNK by original task ID (e.g., "11.1.3")
  - **Usage:** `python3 tools/thunk_parser.py --query-id "11.1.3" --json`
  - **AC:** Returns JSON entry if found, empty if not
  - **Token savings:** Replaces `grep "11.1.3" THUNK.md` with structured query
  - **Completed:** 2026-01-26

- [x] **21.1.3** Add `--last-id` option to thunk_parser.py [HIGH]
  - **Goal:** Get last THUNK entry number for appends
  - **Usage:** `python3 tools/thunk_parser.py --last-id`
  - **AC:** Prints integer (e.g., "830")
  - **Token savings:** Replaces `tail THUNK.md | grep | awk`
  - **Completed:** 2026-01-26

- [x] **21.1.4** Add `--search` option with keyword matching [MEDIUM]
  - **Goal:** Search THUNK entries by keyword
  - **Usage:** `python3 tools/thunk_parser.py --search "shellcheck" --limit 5`
  - **AC:** Returns matching entries as JSON
  - **Token savings:** Structured alternative to grep

### Phase 21.2: Token Efficiency Policy for PROMPT.md

- [x] **21.2.1** Add "Read Budget" section to `workers/ralph/PROMPT.md` [HIGH]
  - **Goal:** Explicit rules preventing broad file loading
  - **Content:** Hard rules (no THUNK.md opens, no IMPL_PLAN opens without line slice)
  - **AC:** PROMPT.md has "Read Budget" section with allowed/forbidden patterns
  - **Reference:** Use `docs/TOOLS.md` for CLI alternatives
  - **Completed:** 2026-01-26 (commit 9b087a7)

- [x] **21.2.2** Add "Required Startup Procedure" to PROMPT.md [MEDIUM]
  - **Goal:** Ralph uses cheap commands first before any file reads
  - **Content:** Step A (grep for task), Step B (ensure thunk DB exists)
  - **AC:** PROMPT.md has startup procedure that minimizes reads
  - **Completed:** 2026-01-26 (commit 9b087a7)

- [x] **21.2.3** Update `templates/ralph/PROMPT.md` with same changes [MEDIUM]
  - **Goal:** Keep templates in sync
  - **AC:** Template matches workers/ralph/PROMPT.md token efficiency sections
  - **Depends:** 21.2.1, 21.2.2
  - **Completed:** 2026-01-26 (commit 9b087a7)

### Phase 21.3: Documentation Updates

- [x] **21.3.1** Update `skills/domains/ralph/thread-search-patterns.md` [MEDIUM]
  - **Goal:** Reference CLI tools instead of raw grep/sed
  - **AC:** Skill doc links to `docs/TOOLS.md`, shows CLI examples first
  - **Completed:** 2026-01-26 (commit c546cd5)

- [x] **21.3.2** Update `NEURONS.md` to reference `docs/TOOLS.md` [LOW]
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

### Phase 22.2: THUNK.md Table Column Count Fixes

- [x] **22.2.1** Fix MD056 (table column count) in `workers/ralph/THUNK.md` [HIGH]
  - **Goal:** Fix table rows with incorrect column counts
  - **Errors:** Lines 788, 789, 791 (pipe characters in description text causing column count mismatch)
  - **AC:** `markdownlint workers/ralph/THUNK.md` passes (no MD056 errors)
  - **Completed:** 2026-01-26

- [x] **22.2.2.1** Fix MD056 in `workers/ralph/THUNK.md` lines 788-789 (escape pipes) [HIGH]
  - **Issue:** Lines 788-789 have unescaped pipe characters in description text causing too many columns (7 actual vs 5 expected)
  - **Fix:** Escape pipes with backslash (e.g., `collect_metrics.sh \| generate`)
  - **AC:** `markdownlint workers/ralph/THUNK.md` passes (no MD056 errors on lines 788-789)
  - **Completed:** 2026-01-26 (commit pending)

- [x] **22.2.2.2** Fix MD056 in `workers/ralph/THUNK.md` lines 791-799 (add missing column) [HIGH]
  - **Issue:** Lines 791-799 are missing the 5th column (Completed date), causing too few columns (4 actual vs 5 expected)
  - **Fix:** Add missing `| 2026-01-26 |` column to end of each row
  - **AC:** `markdownlint workers/ralph/THUNK.md` passes (no MD056 errors on lines 791-799)
  - **Completed:** 2026-01-26 (commit pending)

---
