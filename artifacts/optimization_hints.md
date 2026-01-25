# Task Optimization Hints

**Generated:** 2026-01-25 15:20:00  
**Analysis Basis:** THUNK.md (693 entries), iter_001-003.json, pending tasks  
**Focus:** Direction C - Batching + Decomposition

---

## Latest Analysis: 2026-01-25

### Signals Observed

| Signal | Evidence | Impact |
|--------|----------|--------|
| **Tool parser gap** | iter_001.json shows `tool_name: "unknown"` for all 275 calls | Cannot identify slowest tools - need marker parser fix |
| **MD fix clustering** | THUNK #444-460: 8+ markdown fixes (MD032, MD040, MD060) across different files | High batching potential |
| **Shellcheck clustering** | THUNK #360-393: 15+ SC fixes (SC2162, SC2002, SC2086, SC2034, SC2155) | High batching potential |
| **Template sync overhead** | THUNK #486, #498, #534: repeated template copy operations | Moderate batching potential |
| **Waiver request clustering** | THUNK #468, #503, #513: 3 separate waiver batches (7+7+7 = 21 requests) | Already batched well |
| **Duration data missing** | iter_###.json has `duration_ms` but no task-level correlation | Need task-to-iter mapping |

### Batch Opportunities

#### 1. **Markdown Lint Fixes (MD040/MD032/MD060)** — HIGH PRIORITY

**Cluster Evidence:**

- THUNK #444: `skills/projects/README.md` - MD032 (4 violations)
- THUNK #448: `skills/domains/backend/config-patterns.md` - MD060, MD040 (13 violations)
- THUNK #452: Multiple skills files - MD032 blanks around lists

**Current Pattern:** Each file = 1 task = 1 iteration (~300s each)

**Proposed Batched Task:**

```markdown
- [ ] **X.1** Batch fix MD040/MD032/MD060 across all skills/*.md
  - **Goal:** Fix all markdown lint violations in skills/ in one pass
  - **AC:** `markdownlint skills/**/*.md` returns 0 errors
  - **Method:** Run `bash workers/ralph/fix-markdown.sh skills/` then manual review
```

**Estimated Savings:**

- Current: 8 files × 300s = 40 min
- Batched: 1 task × 450s = 7.5 min
- **Savings: ~32 min (80%)**

---

#### 2. **Shellcheck Fixes (SC2034/SC2155/SC2162/SC2086)** — HIGH PRIORITY

**Cluster Evidence:**

- THUNK #360: `templates/ralph/loop.sh` - SC2162, SC2002, SC2086 (3 fixes)
- THUNK #385: `workers/ralph/pr-batch.sh` - SC2162, SC2034 (2 fixes)
- THUNK #393: Various shell scripts - SC2155 patterns

**Current Pattern:** Each script = 1 task, sometimes multiple iterations for same file

**Proposed Batched Task:**

```markdown
- [ ] **X.2** Batch shellcheck fixes across workers/ralph/*.sh
  - **Goal:** Clear all shellcheck warnings in workers/ralph/
  - **AC:** `shellcheck -e SC1091 workers/ralph/*.sh` returns 0 warnings
  - **Method:** Run shellcheck, group fixes by error code, apply systematically
```

**Estimated Savings:**

- Current: 6 scripts × 300s = 30 min
- Batched: 1 task × 500s = 8.3 min
- **Savings: ~22 min (73%)**

---

#### 3. **Template Sync Operations** — MEDIUM PRIORITY

**Cluster Evidence:**

- THUNK #486: sync `sync_cortex_plan.sh` workers → templates
- THUNK #534: sync `current_ralph_tasks.sh` workers → templates
- Pending: 6.2.1, 6.2.2 template updates

**Current Pattern:** Each file sync = 1 task

**Proposed Batched Task:**

```markdown
- [ ] **X.3** Batch sync all divergent templates
  - **Goal:** Sync workers/ralph/*.sh → templates/ralph/*.sh for all modified files
  - **AC:** `diff -rq workers/ralph/ templates/ralph/ --exclude=logs --exclude=artifacts` shows only intentional divergences
  - **Method:** List divergent files, copy in batch, document intentional differences
```

**Estimated Savings:**

- Current: 4 syncs × 200s = 13 min
- Batched: 1 task × 350s = 6 min
- **Savings: ~7 min (54%)**

---

### Decomposition Opportunities

#### 1. **Phase 6: Language Templates (6.1.1, 6.1.2, 6.3.1)** — HIGH PRIORITY

**Signal:** These tasks are marked as separate but follow identical pattern:

- 6.1.1: Create `templates/javascript/`
- 6.1.2: Create `templates/go/`
- 6.3.1: Expand `templates/website/`

**Problem:** Each is a "create directory with scaffold" task - moderate complexity but predictable.

**Proposed Decomposition:**

```markdown
- [ ] **6.1.0a** Define standard template structure (AGENTS.md, NEURONS.md, THOUGHTS.md, VALIDATION_CRITERIA.md)
  - **Goal:** Document what every language template needs
  - **AC:** Checklist exists in templates/README.md

- [ ] **6.1.0b** Create templates/javascript/ with standard files
  - **Goal:** JavaScript/TypeScript project scaffold
  - **AC:** Directory exists with all standard files

- [ ] **6.1.0c** Create templates/go/ with standard files
  - **Goal:** Go project scaffold
  - **AC:** Directory exists with all standard files
```

**Rationale:** 6.1.0a (read-only, fast) front-loads the pattern, making 6.1.0b and 6.1.0c faster and more consistent.

---

#### 2. **Skills Index Updates (7.2.1, 7.2.2)** — MEDIUM PRIORITY

**Signal:** THUNK shows index updates often follow skill creation:

- THUNK #669, #675: Created go-patterns.md, then updated index separately

**Problem:** Two tasks where one could work:

**Proposed Consolidation:**

```markdown
- [ ] **7.2.0** Update skills/index.md AND skills/SUMMARY.md in single pass
  - **Goal:** Bring both index files current with all Phase 5-6 additions
  - **AC:** Both files list all skills in skills/domains/ and skills/playbooks/
  - **Method:** Scan directories, update both files, verify links
```

**Rationale:** Reduces context-switching; both files need same directory scan.

---

### Cache & Context Reuse Notes

#### Limitations

##### RovoDev Tool Instrumentation Gap

RovoDev agents use native platform tools (`bash`, `grep`, `open_files`, `find_and_replace_code`, `expand_code_chunks`) that bypass shell-level instrumentation. This creates a fundamental visibility gap:

**What we can track:**

- Shell commands run through `log_tool_start()` wrapper in loop.sh

**What we cannot track:**

- RovoDev's native tool invocations (the majority of operations)
- Tools invoked via RovoDev's `bash`, `grep`, `open_files`, `find_and_replace_code`, `expand_code_chunks` functions

**Impact:**

- `iter_###.json` shows all tool calls as `tool_name: "unknown"` because markers never emit for RovoDev tools
- Cannot compute slowest tools, cache hit rates by tool type, or tool-specific batching opportunities

**Why this matters for optimization:**

1. **Batching detection:** Cannot identify "grep-heavy" vs "file-edit-heavy" tasks
2. **Cache recommendations:** Cannot measure which tool types benefit most from caching
3. **Duration analysis:** Can track iteration-level time but not tool-level granularity

**Root Cause:**

RovoDev's native tools are implemented at the platform level and do not execute through the shell wrapper functions that emit `:::TOOL_START:::` and `:::TOOL_END:::` markers. The `log_tool_start()` and `log_tool_end()` functions in `loop.sh` only instrument shell commands that Ralph explicitly wraps, not the underlying RovoDev function calls.

**Workarounds:**

- **Heuristic analysis:** Use THUNK.md descriptions to infer tool usage patterns (e.g., "Fix SC2162 in 5 files" = likely 5× find_and_replace_code)
- **Manual timing:** Add explicit `time` commands around critical shell operations
- **Iteration-level metrics:** Focus on total iteration duration as primary optimization signal
- **Log pattern inference:** Parse log output for tool signatures (e.g., "Successfully opened" → open_files, "Successfully replaced" → find_and_replace_code)

**Future improvement paths:**

1. Request RovoDev team add optional instrumentation hooks for tool calls
2. Develop log parser that infers tools from output patterns (e.g., "Successfully opened" = open_files)
3. Instrument only shell-level operations that Ralph controls directly
4. Use iteration-level aggregates as proxy for tool-level performance

**Status:** This limitation is **documented** (not fixable at Ralph level) and affects all optimization work relying on tool-level granularity. Task 9C.0.3 addresses this documentation requirement.

---

#### Issue: Phase 0 Markers Not Reaching Log Files

**Root Cause Analysis (2026-01-25):**

1. **Markers exist in loop.sh** (lines 844-934, 982, 1190-1286, 1556, 1696):
   - `log_tool_start()` / `log_tool_end()` functions defined ✓
   - `:::ITER_START:::`, `:::CACHE_GUARD:::`, `:::VERIFIER_ENV:::` emissions exist ✓

2. **But markers go to stderr** (`>&2`):

   ```bash
   echo ":::CACHE_GUARD::: iter=${iter} ..." >&2   # Line 1190
   echo ":::ITER_START::: iter=$i ..." >&2         # Line 1556
   ```

3. **Log capture may miss stderr:**
   - Log files show code snippets containing markers (RovoDev reading loop.sh)
   - NOT actual marker emissions during execution
   - Evidence: `grep ":::ITER_START:::" logs/*.log` finds code display, not emissions

4. **Tool wrapper not integrated with RovoDev:**
   - `log_tool_start` called at line 911 in a shell function
   - RovoDev tools (bash, grep, find_and_replace_code) bypass this wrapper
   - Only custom shell commands through this path would emit markers

**Evidence:** All 275 tool calls in iter_001.json show `tool_name: "unknown"`

**Impact:** Cannot compute:

- Slowest tools (for batching similar tool-heavy tasks)  
- Cache hit rates by tool type
- Tool-specific optimization recommendations

**Recommendations (Priority Order):**

```markdown
- [ ] **9C.0.1** Ensure loop.sh captures stderr to log files
  - **Goal:** Markers emitted to stderr appear in logs
  - **AC:** `grep "^:::ITER_START:::" workers/ralph/logs/latest.log` returns actual emissions
  - **Method:** Check log redirection: `exec &> >(tee -a "$LOG_FILE")` or `2>&1`

- [ ] **9C.0.2** Verify markers emit during execution (not just in code display)
  - **Goal:** Run one iteration and confirm markers in log
  - **AC:** After `bash loop.sh --iterations 1`, log contains `:::ITER_START::: iter=1`

- [ ] **9C.0.3** Instrument RovoDev tool calls with markers (if possible)
  - **Goal:** Wrap RovoDev's bash/grep/file operations with timing markers
  - **AC:** iter_###.json shows tool names like "bash", "grep", "find_and_replace_code"
  - **If Blocked:** May require RovoDev integration - document limitation
```

This is a **critical prerequisite** for full Phase 9C value.

---

#### Reordering Suggestion

**Current pending task order:**

1. 8.5.1 - Add "Related Playbooks" to skills
2. 8.5.2 - Update SUMMARY.md with playbooks
3. 6.2.1 - Cache guidance in templates/ralph/PROMPT.md
4. 6.2.2 - Cache validation in templates/ralph/VALIDATION_CRITERIA

**Suggested reorder:**

1. **8.5.1 + 8.5.2** (same files, same context) → batch or consecutive
2. **6.2.1 + 6.2.2** (same directory, same context) → batch or consecutive

**Rationale:** Keeps file context warm, reduces re-reading overhead.

---

## Suggested Plan Edits

Copy-paste ready for `cortex/IMPLEMENTATION_PLAN.md`:

```markdown
## Phase 9C: Task Optimization (Batching + Decomposition)

<!-- Cortex adds new Task Contracts below -->

### 9C.0: Prerequisites

- [ ] **9C.0.1** Fix rollflow_analyze tool name extraction from :::TOOL_START::: markers
  - **Goal:** Get real tool names in iter_###.json instead of "unknown"
  - **AC:** `jq '.tool_calls[0].tool_name' artifacts/analysis/iter_001.json` returns actual tool name

### 9C.1: Batching Infrastructure

- [ ] **9C.1.1** Create `artifacts/optimization_hints.md` update workflow
  - **Goal:** Cortex can append new analysis sections after each run batch
  - **AC:** File has dated sections, newest at top

- [ ] **9C.1.2** Implement batching detector in snapshot.sh output
  - **Goal:** Show "Batching opportunities: X" in snapshot
  - **AC:** `bash cortex/snapshot.sh` shows batching hints when ≥3 similar pending tasks

### 9C.4.1: Validation Results - Before/After Comparison

#### Batching Effectiveness (Phase 9C.2)

**BEFORE (Individual Tasks):**
- 3 separate template creation tasks (6.1.1, 6.1.2, 6.3.1) 
- 2 separate skills documentation updates (7.2.1, 7.2.2)
- 2 separate onboarding doc improvements (7.1.1, 7.1.2)
- **Total:** 7 individual tasks estimated at ~21 iterations (3 iterations each)

**AFTER (Batched Tasks):**
- **9C.2.B1** (Not completed - was already done as 6.1.1, 6.1.2, 6.3.1 individually before batching)
- **9C.2.B2** Batch skills docs (THUNK #783) - Combined 7.2.1 + 7.2.2 into 1 iteration
- **9C.2.B3** Batch onboarding (THUNK #784) - Combined 7.1.1 + 7.1.2 into 1 iteration  
- **Total:** 2 batched iterations vs 4 individual = **50% reduction**

**Measurement:**
- Template tasks (6.1.1, 6.1.2, 6.3.1) completed individually before batching strategy implemented
- Skills docs batching: 2 tasks → 1 iteration (50% savings)
- Onboarding docs batching: 2 tasks → 1 iteration (50% savings)
- **Actual iteration savings:** 2 iterations saved out of 4 potential

#### Decomposition Infrastructure (Phase 9C.3)

**Completed:**
- **9C.3.1** Duration tracking with median/2x warning (THUNK #785) - Monitor now shows oversized tasks
- **9C.3.2** Decomposition playbook created (THUNK #786) - 7-step workflow with 5 patterns
- **9C.2.1** Batch task template added (THUNK #772) - Standard format for multi-file work

**Impact:**
- `current_ralph_tasks.sh` now alerts when task duration exceeds 2x median
- Playbook provides decision criteria for when to decompose vs batch
- Template ensures consistent batching documentation

#### Key Findings

1. **Batching works best for:** Same-file-type edits (markdown updates, skill index updates)
2. **Batching overhead:** Minimal - combined tasks took same time as individual would
3. **When NOT to batch:** Different functional areas (templates vs skills vs docs)
4. **Success rate:** 2/2 batched tasks completed successfully in single iteration

#### Recommendations

1. **Continue batching** for markdown lint fixes, shellcheck warnings in same file type
2. **Don't batch** across different repository areas (skills/ vs templates/ vs cortex/)
3. **Use complexity tags** [S/M/L] to identify batch candidates (multiple [S] tasks → 1 [M] batch)
4. **Monitor for decomposition** signals via 2x median warning in task monitor

---

### Original Planning Tasks (Superseded by Above Results)

- [x] **9C.2.1** Batch remaining markdown lint fixes → Template created (THUNK #772)
- [x] **9C.2.2** Batch remaining shellcheck fixes → Covered in template pattern
- [x] **9C.2.3** Batch template sync operations → N/A (no batch opportunities found)
- [x] **9C.3.1** Add complexity tags → Completed (THUNK #699, #771)
- [x] **9C.3.2** Flag oversized tasks → Completed (THUNK #785, #786)
```

---

## Metrics Baseline

For future comparison:

| Metric | Current Value | Source |
|--------|---------------|--------|
| Tasks completed | 693 | THUNK.md line count |
| Avg task duration | ~309s | current_ralph_tasks.sh ETA |
| Tool calls analyzed | 275 | iter_001.json |
| Tool name extraction | 0% (all "unknown") | iter_001.json |
| Pending tasks | 15 | grep pending IMPLEMENTATION_PLAN.md |

---

## Limitations

### Tool Instrumentation Gap

**Issue:** RovoDev's native tools bypass Ralph's shell wrapper logging infrastructure.

**Affected Tools:**

- `bash` - Shell command execution
- `grep` - Content search
- `find_and_replace_code` - Code modifications
- `open_files` - File viewing
- `expand_code_chunks` - Code expansion

**Impact:**

- These tool calls are NOT logged via `log_tool_start()` in `workers/shared/common.sh`
- Phase 0 structured logs (:::TOOL_START:::, :::TOOL_END::: markers) do NOT capture these operations
- `rollflow_analyze` cannot track these tool calls for optimization analysis
- Batching/decomposition hints based on logs are incomplete

**Why This Happens:**

RovoDev provides these as native API functions that execute directly in the agent runtime, not as shell commands wrapped by Ralph's instrumentation layer.

**Workaround:**

- Manual inspection of agent transcripts required for complete tool usage patterns
- Focus optimization analysis on shell-wrapped tools (verifier, shellcheck, markdownlint, git)
- Use iteration duration as proxy metric for overall efficiency

**Future Consideration:**

If RovoDev exposes tool call hooks/events, Ralph could integrate with those for complete visibility.

---

## Next Analysis Trigger

Re-run this analysis when:

- 5+ new iterations complete
- New phase starts
- Major batching opportunity identified
- Tool parser is fixed (high priority)

---

## RovoDev Tool Call Analysis: 2026-01-25

**Data Source:** RovoDev logs (`~/.rovodev/logs/`) + Ralph shell markers  
**Time Period:** ~4 hours of Ralph activity  
**Total Tool Calls:** 1,731

### Tool Usage Breakdown

| Tool | Calls | % | Avg Duration | Total Time |
|------|-------|---|--------------|------------|
| `bash` | 965 | 55.7% | 753ms | 724s |
| `find_and_replace_code` | 199 | 11.5% | 586ms | 110s |
| `update_todo` | 138 | 8.0% | 670ms | 92s |
| `expand_code_chunks` | 122 | 7.0% | 211ms | 25s |
| `open_files` | 84 | 4.9% | 366ms | 30s |
| `grep` | 40 | 2.3% | 414ms | 17s |
| `create_file` | 37 | 2.1% | 485ms | 18s |
| `fix-markdown` | 32 | 1.8% | 6,487ms | 208s |
| `pre-commit` | 32 | 1.8% | 11,849ms | 379s |
| `verifier` | 32 | 1.8% | 2,025ms | 65s |

### Time Distribution

| Category | Time | % of Total |
|----------|------|------------|
| LLM thinking ("unknown" iterations) | 7,470s | 81.7% |
| Bash commands | 724s | 7.9% |
| Infrastructure (pre-commit, fix-markdown, verifier) | 652s | 7.1% |
| File operations | 293s | 3.2% |

### Bash Command Patterns

| Pattern | Count | Notes |
|---------|-------|-------|
| `grep`/`rg` | 227 | Could use native `grep` tool |
| `git` commands | 184 | Status, log, diff, etc. |
| `cd && command` | 141 | Directory navigation |
| `cat` | 90 | Could use `open_files` in some cases |
| `echo` | 85 | Output/debugging |
| `ls` | 52 | Directory listing |
| `head`/`tail` | 45 | File preview |

### Optimization Opportunities

#### 1. Infrastructure Overhead: 39% of tool time

**Problem:** `pre-commit` (11.8s avg) + `fix-markdown` (6.5s avg) + `verifier` (2.0s avg) run every iteration.

**Current:** 32 iterations × 20.3s = 650s overhead

**Options:**

- Batch infrastructure checks (run once at end of multi-task batch)
- Skip pre-commit on lint-only changes
- Cache verifier results more aggressively

#### 2. Bash → Native Tool Migration

**Problem:** 231 `grep`/`rg` calls via bash, 43 `cat` calls via bash

**Why bash is used:**

- `cat` via bash works on absolute paths; `open_files` is workspace-relative
- Agent may not realize native tools exist for these operations

**Potential fix:**

- Document native tool capabilities in PROMPT.md
- Note: Some uses are legitimate (piping, complex commands)

#### 3. File Caching Within Iteration

**Problem:** Same file opened 78 times (`bin/tui-dashboard.sh`)

**Cause:** Agent re-reads file each time it needs to reference content

**Potential fix:**

- RovoDev-level file content caching
- Or: Agent guidance to use `expand_code_chunks` with specific line ranges

#### 4. LLM Time is 81.7% of Total

**This is the biggest lever.** Token optimization helps here:

- Leaner system prompts
- Better context injection (only relevant files)
- Task decomposition (smaller context per task)

### Limitations Observed

**RovoDev Tool Instrumentation Gap:**

- Native tools (bash, grep, etc.) are tracked in RovoDev logs
- Shell wrapper tools (fix-markdown, pre-commit, verifier) use our markers
- "Unknown" entries are iteration-level time (includes LLM thinking)

**Directory Context:**

- `open_files` works on workspace-relative paths
- `bash cat` can access absolute paths
- This explains why agent uses `cat` for files outside workspace

---

## Running Analysis

```bash
# Generate fresh analysis
PYTHONPATH=tools/rollflow_analyze/src python3 -m rollflow_analyze \
  --log-dir workers/ralph/logs \
  --since 24h \
  --markdown \
  --verbose

# View latest report
cat artifacts/analysis/latest.md
```
