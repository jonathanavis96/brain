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

### 9C.2: Apply Batching to Current Backlog

- [ ] **9C.2.1** Batch remaining markdown lint fixes (if any)
  - **Goal:** Single task clears all MD violations
  - **AC:** `markdownlint **/*.md` returns 0 errors

- [ ] **9C.2.2** Batch remaining shellcheck fixes (if any)
  - **Goal:** Single task clears all SC warnings
  - **AC:** `shellcheck -e SC1091 workers/ralph/*.sh templates/ralph/*.sh` returns 0

- [ ] **9C.2.3** Batch template sync operations
  - **Goal:** Single task syncs all divergent templates
  - **AC:** Documented list of intentional divergences, all others synced

### 9C.3: Decomposition Rules

- [ ] **9C.3.1** Add complexity tags to task format
  - **Goal:** Tasks have [S/M/L] complexity hint
  - **AC:** PROMPT_REFERENCE.md documents complexity tagging convention

- [ ] **9C.3.2** Flag oversized tasks in current_ralph_tasks.sh
  - **Goal:** Tasks exceeding 2x median duration show ⚠️
  - **AC:** Monitor footer shows "⚠️ Current task is L-complexity"
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

## Next Analysis Trigger

Re-run this analysis when:

- 5+ new iterations complete
- New phase starts
- Major batching opportunity identified
- Tool parser is fixed (high priority)
