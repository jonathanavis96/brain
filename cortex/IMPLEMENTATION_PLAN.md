# Cortex Implementation Plan

**Purpose:** Task Contracts for Ralph workers. Each contract defines an atomic task with clear goals and acceptance criteria.

**Workflow:**

1. Cortex creates/updates Task Contracts here
2. Ralph's `loop.sh` syncs this file via `sync_cortex_plan.sh`
3. Ralph works through tasks, marking them complete
4. Cortex reviews progress and creates new contracts

---

## Current Status

**Last Updated:** 2026-01-25 23:00:00  
**Progress:** Added 7 new "outside-the-box" phases (14-20) with 27 tasks total. Focus on meta-tooling, analytics, and self-improvement.

**Active Phases:**

- Phase 14: THUNK Dedup Bug Fix (3 tasks) - **HIGH** data integrity fix
- Phase 15: Skill Dependency Graph (4 tasks) - **HIGH** reveals hidden structure
- Phase 16: Anti-Patterns Library (6 tasks) - **HIGH** learning from failures
- Phase 17: Brain Analytics Dashboard (5 tasks) - MEDIUM meta-observation
- Phase 18: Skill Freshness Detection (4 tasks) - MEDIUM proactive maintenance
- Phase 19: Cross-Project Pattern Mining (3 tasks) - MEDIUM feedback loop
- Phase 20: Interactive Skill Quiz (4 tasks) - LOW knowledge retention
- Phase 9C: Task Optimization (11 tasks) - batching & decomposition
- Phase 0-Warn: Verifier Warnings (2 tasks) - human intervention required

---

## Completed Phases

See `workers/ralph/THUNK.md` for complete task history (550+ completed tasks).

**Completed:** Phases 0-5, 6 (Housekeeping), 7 (Gap Radar), 8 (Playbooks), X (Structured Logging)

---

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

## Phase 0-Warn: Verifier Warnings

**Goal:** Resolve verifier warnings from latest run.

**Status:** 0 warnings present - require HUMAN INTERVENTION (protected file changes).


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

- [ ] **14.1.1** Add idempotency check to `cortex/cleanup_cortex_plan.sh` [HIGH]
  - **Goal:** Prevent duplicate task entries when archiving
  - **AC:** Running `cleanup_cortex_plan.sh` twice on same completed tasks produces no duplicates
  - **Implementation:** Before appending, check `grep -q "| $task_id |" "$THUNK_FILE"`

### Phase 14.2: Cleanup Existing Data

- [ ] **14.2.1** Create `tools/thunk_dedup.sh` one-time cleanup script [HIGH]
  - **Goal:** Remove duplicate entries from existing THUNK.md
  - **AC:** Script is idempotent, preserves first occurrence of each task ID, outputs count of removed duplicates
  - **Implementation:** `awk '!seen[$2]++'` on task ID column

- [ ] **14.2.2** Run dedup on `workers/ralph/THUNK.md` [MEDIUM]
  - **Goal:** Clean existing data
  - **AC:** THUNK.md row count equals unique task ID count
  - **Depends:** 14.2.1

---

## Phase 15: Skill Dependency Graph

**Goal:** Visualize relationships between skill files to identify foundational skills, orphans, and clusters.

**Problem:** 90 skill files exist with implicit cross-references but no way to see the dependency structure.

**Priority:** HIGH (reveals hidden structure, 2 hr effort)

### Phase 15.1: Link Extraction

- [ ] **15.1.1** Create `tools/skill_graph/extract_links.py` [HIGH]
  - **Goal:** Parse all `skills/**/*.md` for internal markdown links
  - **AC:** Outputs JSON with `{source: "file.md", targets: ["other.md", ...]}` for each skill
  - **Implementation:** Regex for `\[.*\]\((.*\.md)\)`, resolve relative paths

### Phase 15.2: Graph Generation

- [ ] **15.2.1** Create `tools/skill_graph/generate_graph.py` [MEDIUM]
  - **Goal:** Convert link JSON to DOT format graph
  - **AC:** Valid DOT output that renders in Graphviz/online tools
  - **Depends:** 15.1.1

- [ ] **15.2.2** Create `tools/skill_graph/skill_graph.sh` wrapper [LOW]
  - **Goal:** One-command pipeline: extract → generate → output
  - **AC:** `bash tools/skill_graph/skill_graph.sh` outputs valid DOT to stdout
  - **Depends:** 15.1.1, 15.2.1

### Phase 15.3: Documentation

- [ ] **15.3.1** Create `tools/skill_graph/README.md` [LOW]
  - **Goal:** Document usage, output format, rendering options
  - **AC:** README explains how to render DOT (graphviz, online tools like viz-js.com)
  - **Depends:** 15.2.2

---

## Phase 16: Anti-Patterns Library

**Goal:** Document common mistakes to avoid, complementing the "how to do X" skills with "mistakes to avoid" knowledge.

**Problem:** Learning from failures is often more memorable than learning patterns. No anti-pattern documentation exists.

**Priority:** HIGH (high learning value, 1.5 hr effort)

### Phase 16.1: Create Anti-Patterns Directory

- [ ] **16.1.1** Create `skills/domains/anti-patterns/README.md` [HIGH]
  - **Goal:** Establish anti-patterns directory with format guidelines
  - **AC:** README defines anti-pattern format: name, bad code, why wrong, fix, frequency rating

### Phase 16.2: Shell Anti-Patterns

- [ ] **16.2.1** Create `skills/domains/anti-patterns/shell-anti-patterns.md` [HIGH]
  - **Goal:** Document 5+ common bash mistakes from ShellCheck history
  - **AC:** File has 5+ anti-patterns with SC codes, bad/good examples
  - **Sources:** SC2034 (unused var), SC2155 (declare+assign), SC2086 (unquoted), SC2181 ($? check), SC1091 (source)

### Phase 16.3: Other Anti-Patterns

- [ ] **16.3.1** Create `skills/domains/anti-patterns/markdown-anti-patterns.md` [MEDIUM]
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
