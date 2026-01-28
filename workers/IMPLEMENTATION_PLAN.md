# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-28 10:15:00

**Current Status:** Phase 33 nearly complete (14/20 tasks done), focusing on remaining polish features

**Recent Completions:**

- **Phase 28: Template Maintenance (✅ COMPLETED)** - Audited templates for drift, verified no critical issues
- **Phase 27: Skills Knowledge Base Expansion (✅ COMPLETED)** - Reviewed GAP_BACKLOG, promoted semantic code review skill
- **Phase 26: Environment & Testing Infrastructure (✅ COMPLETED)** - Brain Map testing setup and documentation
- **Phase 25: Brain Map (✅ COMPLETED)** - Full MVP with backend API, frontend UI, comprehensive tests
- **Phase 24: Template Drift Alignment (✅ COMPLETED)**
- **Phase 23: Loop Efficiency & Correctness Fixes (✅ COMPLETED)**

**Active Focus:**

- Phase 0-Warn: Markdown lint errors (MD032, MD007, MD046)
- Phase 31: Brain Map V2 Core Interactions (node dragging, drag-to-link, dark mode, mobile)
- Phase 32: Brain Map V2 Discovery & Intelligence (path finder, AI insights, saved views)
- Phase 33: Brain Map V2 Polish & Power Features (temporal viz, collaboration, export)

<!-- Cortex adds new Task Contracts below this line -->

## Phase 0-Warn: Verifier Warnings

**Purpose:** Auto-detected markdown lint issues requiring manual fixes.

- [ ] **WARN.MD032.workers-impl-69** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 69 - Add blank line before list
- [ ] **WARN.MD031.workers-impl-81** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 81 - Add blank line before code fence
- [ ] **WARN.MD031.workers-impl-92** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 92 - Add blank line after code fence
- [ ] **WARN.MD031.workers-impl-97** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 97 - Add blank line before code fence
- [ ] **WARN.MD031.workers-impl-126** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 126 - Add blank line before code fence
- [ ] **WARN.MD031.workers-impl-156** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 156 - Add blank line before code fence
- [ ] **WARN.MD031.workers-impl-186** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 186 - Add blank line before code fence
- [ ] **WARN.MD031.workers-impl-188** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 188 - Add blank line after code fence
- [ ] **WARN.MD031.workers-impl-192** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 192 - Add blank line before code fence
- [ ] **WARN.MD031.workers-impl-220** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 220 - Add blank line before code fence
- [ ] **WARN.MD031.workers-impl-224** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 224 - Add blank line after code fence
- [ ] **WARN.MD032.workers-impl-260** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 260 - Add blank line before list
- [ ] **WARN.MD032.workers-impl-265** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 265 - Add blank line before list
- [ ] **WARN.MD032.cortex-impl-69** Fix MD032/blanks-around-lists in cortex/IMPLEMENTATION_PLAN.md line 69 - Add blank line before list
- [ ] **WARN.MD031.cortex-impl-81** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 81 - Add blank line before code fence
- [ ] **WARN.MD031.cortex-impl-92** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 92 - Add blank line after code fence
- [ ] **WARN.MD031.cortex-impl-97** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 97 - Add blank line before code fence
- [ ] **WARN.MD031.cortex-impl-126** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 126 - Add blank line before code fence
- [ ] **WARN.MD031.cortex-impl-156** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 156 - Add blank line before code fence
- [ ] **WARN.MD031.cortex-impl-186** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 186 - Add blank line before code fence
- [ ] **WARN.MD031.cortex-impl-188** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 188 - Add blank line after code fence
- [ ] **WARN.MD031.cortex-impl-192** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 192 - Add blank line before code fence
- [ ] **WARN.MD031.cortex-impl-220** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 220 - Add blank line before code fence
- [ ] **WARN.MD031.cortex-impl-224** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 224 - Add blank line after code fence
- [ ] **WARN.MD032.cortex-impl-260** Fix MD032/blanks-around-lists in cortex/IMPLEMENTATION_PLAN.md line 260 - Add blank line before list
- [ ] **WARN.MD032.cortex-impl-265** Fix MD032/blanks-around-lists in cortex/IMPLEMENTATION_PLAN.md line 265 - Add blank line before list
- [ ] **WARN.MD022.workers-impl-101** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 101 - Add blank line after "## DRY-RUN ANALYSIS"
- [ ] **WARN.MD022.workers-impl-105** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 105 - Add blank line after "### Summary"
- [ ] **WARN.MD032.workers-impl-111** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 111 - Add blank line before numbered list
- [ ] **WARN.MD032.workers-impl-121** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 121 - Add blank line before bullet list
- [ ] **WARN.MD022.workers-impl-137** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 137 - Add blank line after "### Files to Modify"
- [ ] **WARN.MD032.workers-impl-138** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 138 - Add blank line before list
- [ ] **WARN.MD022.workers-impl-142** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 142 - Add blank line after "### Verification Commands"
- [ ] **WARN.MD031.workers-impl-143** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 143 - Add blank line before code fence
- [ ] **WARN.MD022.workers-impl-148** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 148 - Add blank line after "### Risks & Dependencies"
- [ ] **WARN.MD032.workers-impl-149** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 149 - Add blank line before list
- [ ] **WARN.MD022.workers-impl-154** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 154 - Add blank line after "### Time Estimate"
- [ ] **WARN.MD032.workers-impl-155** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 155 - Add blank line before list
- [ ] **WARN.MD022.workers-impl-160** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 160 - Add blank line after "### Next Steps"
- [ ] **WARN.MD032.workers-impl-161** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 161 - Add blank line before numbered list

## Phase 33: Brain Map V2 - Polish & Power Features 🚀

**Context:** Advanced users need temporal visualization, collaboration tools, and export options for real-world knowledge management workflows.

**Goal:** Production-ready features for teams and power users.

**Success Criteria:**

- Timeline scrubber shows graph evolution over time
- Users can comment on nodes (threaded discussions)
- Export graph as PNG/SVG/GraphML
- Presentation mode for demos
- Graph health metrics & suggestions

---

### Task 33.1: Temporal Visualization


---

### Task 33.2: Collaboration (Comments)


---

### Task 33.3: Export & Integration


---

### Task 33.4: Presentation Mode


---

### Task 33.5: Graph Health Metrics


- [ ] **33.5.4** Trend tracking - Store metrics snapshots daily, show chart of graph growth over time. AC: Trend chart renders. Verification: View trend → line chart shows growth. If Blocked: Current metrics only (no history)

**Discoveries & Notes (DRY-RUN Analysis - 2026-01-28):**

---

## DRY-RUN ANALYSIS: Markdown Lint Fixes (First Unchecked Task)
**Analysis Date:** 2026-01-28  
**Task Analyzed:** WARN.MD032.workers-impl-69 (and batch of 13 similar warnings)

### Summary
First unchecked task in Phase 0-Warn is fixing MD032/blanks-around-lists at line 69. Analysis reveals this is part of a batch of **13 markdown lint warnings** in workers/IMPLEMENTATION_PLAN.md that should be fixed together in ONE iteration per the CROSS-FILE BATCHING rule.

### Pattern Analysis

**Issue Types Found:**
1. **MD032/blanks-around-lists** (3 instances): Missing blank line before lists at lines 69, 260, 265
2. **MD031/blanks-around-fences** (10 instances): Missing blank lines around code fences
   - Before fence: lines 81, 97, 126, 156, 186, 192, 220
   - After fence: lines 92, 188, 224

**Root Cause:** Code blocks and lists lack proper spacing per markdown best practices.

### Implementation Strategy

**Approach:** Bottom-to-top line insertion using find_and_replace_code
- Fix order: line 265 → 260 → 224 → 220 → 192 → 188 → 186 → 156 → 126 → 97 → 92 → 81 → 69
- Bottom-to-top prevents line number shifts during sequential fixes

**Example Fix Pattern:**

```markdown
# BEFORE (line 69):
---
- [ ] **33.5.4** Trend tracking...

# AFTER:
---

- [ ] **33.5.4** Trend tracking...
```

### Files to Modify
- `workers/IMPLEMENTATION_PLAN.md` - Add blank lines at 13 locations
- `workers/ralph/THUNK.md` - Append completion entry
- `workers/IMPLEMENTATION_PLAN.md` Phase 0-Warn section - Mark 13 warnings `[x]`

### Verification Commands
```bash
markdownlint workers/IMPLEMENTATION_PLAN.md
# Expected: No MD031 or MD032 errors remain
```

### Risks & Dependencies
- **Risk:** Context matching fails if surrounding text is non-unique (mitigate with specific context)
- **Risk:** Line numbers shift after first fix (mitigated by bottom-to-top order)
- **Dependency:** All 13 warnings in same file = ONE iteration per BATCHING rule
- **Note:** Similar issues exist in cortex/IMPLEMENTATION_PLAN.md but "Cortex.* warnings are Cortex's responsibility, not Ralph's" - IGNORE per AGENTS.md

### Time Estimate
- Analysis: ✅ Complete (this document)
- Implementation: ~8-10 find_and_replace_code calls
- Verification: 1 markdownlint call
- **Total: 1 BUILD iteration**

### Next Steps (when not in dry-run)
1. Apply 13 fixes bottom-to-top
2. Verify: `markdownlint workers/IMPLEMENTATION_PLAN.md`
3. Stage: `git add -A` (includes IMPLEMENTATION_PLAN.md + THUNK.md + this file)
4. Mark all 13 warnings `[x]` in Phase 0-Warn section
5. Output: `:::BUILD_READY:::`

---

**Current State:**

- Backend has `get_graph_metrics()` in `app/brain-map/backend/app/index.py` (lines 1557-1651)
- Returns: node_count, edge_count, avg_degree, orphan_count, num_components, largest_component_size
- Frontend `InsightsPanel.jsx` fetches from `/metrics` endpoint and displays current snapshot only
- No historical data storage exists - metrics are computed on-demand from current graph state
- Database: SQLite index at `app/brain-map/.local/index.db` (nodes, edges tables)
- Frontend uses graphology for graph layout, no chart library currently installed

**Implementation Approach:**

**Backend Changes (app/brain-map/backend/app/):**

1. **Create new table for metrics history** (`index.py` schema update):

   ```sql
   CREATE TABLE IF NOT EXISTS metrics_snapshots (
       snapshot_date TEXT PRIMARY KEY,
       node_count INTEGER NOT NULL,
       edge_count INTEGER NOT NULL,
       avg_degree REAL NOT NULL,
       orphan_count INTEGER NOT NULL,
       num_components INTEGER NOT NULL,
       largest_component_size INTEGER NOT NULL,
       created_at TEXT NOT NULL
   )
   ```

   - Add to `_create_schema()` function
   - Index on `snapshot_date` for efficient queries

2. **New function: `save_metrics_snapshot()`** (index.py):

   ```python
   def save_metrics_snapshot() -> dict:
       """Save current graph metrics as daily snapshot.
       
       Returns snapshot with date key. Idempotent - overwrites existing
       snapshot for same date (YYYY-MM-DD).
       """
       metrics = get_graph_metrics()
       conn = get_index_connection()
       cursor = conn.cursor()
       
       snapshot_date = datetime.now(timezone.utc).date().isoformat()
       cursor.execute("""
           INSERT OR REPLACE INTO metrics_snapshots
           (snapshot_date, node_count, edge_count, avg_degree, 
            orphan_count, num_components, largest_component_size, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       """, (snapshot_date, metrics['node_count'], metrics['edge_count'],
             metrics['avg_degree'], metrics['orphan_count'],
             metrics['num_components'], metrics['largest_component_size'],
             datetime.now(timezone.utc).isoformat()))
       
       conn.commit()
       conn.close()
       
       return {**metrics, 'snapshot_date': snapshot_date}
   ```

3. **New function: `get_metrics_trend(days=30)`** (index.py):

   ```python
   def get_metrics_trend(days: int = 30) -> list[dict]:
       """Get historical metrics snapshots for trend analysis.
       
       Args:
           days: Number of days to retrieve (default 30)
           
       Returns:
           List of snapshot dicts ordered by date ascending
       """
       conn = get_index_connection()
       cursor = conn.cursor()
       
       cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).date().isoformat()
       
       cursor.execute("""
           SELECT snapshot_date, node_count, edge_count, avg_degree,
                  orphan_count, num_components, largest_component_size
           FROM metrics_snapshots
           WHERE snapshot_date >= ?
           ORDER BY snapshot_date ASC
       """, (cutoff_date,))
       
       rows = cursor.fetchall()
       conn.close()
       
       return [dict(row) for row in rows]
   ```

4. **New API endpoint** (main.py):

   ```python
   @app.get("/metrics/trend")
   async def get_metrics_trend_endpoint(days: int = 30) -> dict:
       """Get historical metrics trend.
       
       Query params:
           days: Number of days of history (default 30, max 365)
       
       Returns:
           {"snapshots": [...], "count": N}
       """
       from app.index import get_metrics_trend
       
       # Clamp days to reasonable range
       days = max(1, min(days, 365))
       
       try:
           snapshots = get_metrics_trend(days)
           return {"snapshots": snapshots, "count": len(snapshots)}
       except FileNotFoundError:
           raise HTTPException(status_code=503, detail="Index not available")
   ```

5. **Automatic snapshot on rebuild** (index.py `rebuild_index()`):
   - Add call to `save_metrics_snapshot()` at end of successful rebuild
   - Ensures daily snapshot when index rebuilds (watcher triggers this)

**Frontend Changes (app/brain-map/frontend/):**

1. **Install chart library** (package.json):

   ```bash
   npm install recharts
   ```

   - Recharts: React charting library, good for line charts, responsive

2. **New component: `TrendChart.jsx`**:

   ```jsx
   import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
   
   export default function TrendChart({ trendData }) {
     if (!trendData || trendData.length === 0) {
       return <div>No trend data available. Snapshots accumulate daily.</div>
     }
     
     return (
       <ResponsiveContainer width="100%" height={300}>
         <LineChart data={trendData}>
           <CartesianGrid strokeDasharray="3 3" />
           <XAxis dataKey="snapshot_date" />
           <YAxis />
           <Tooltip />
           <Legend />
           <Line type="monotone" dataKey="node_count" stroke="#8884d8" name="Nodes" />
           <Line type="monotone" dataKey="edge_count" stroke="#82ca9d" name="Edges" />
           <Line type="monotone" dataKey="orphan_count" stroke="#ff7300" name="Orphans" />
         </LineChart>
       </ResponsiveContainer>
     )
   }
   ```

3. **Update InsightsPanel.jsx**:
   - Add state: `const [trendData, setTrendData] = useState([])`
   - Add fetch in useEffect:

     ```jsx
     const trendResponse = await fetch('http://localhost:8001/metrics/trend?days=30')
     const trendJson = await trendResponse.json()
     setTrendData(trendJson.snapshots)
     ```

   - Add tab or section for "Trend" chart
   - Render `<TrendChart trendData={trendData} />`

**Risks & Dependencies:**

1. **Schema migration**: Adding table to existing index.db requires rebuild
   - Solution: Schema changes in `_create_schema()` use `CREATE TABLE IF NOT EXISTS`
   - First rebuild after change will create table automatically

2. **Empty trend data initially**: No historical data until snapshots accumulate
   - Mitigation: Frontend shows "No trend data" message, graceful degradation
   - Alternative: Seed with current snapshot immediately

3. **Snapshot frequency**: Spec says "daily" but no automatic trigger exists
   - Option A: Call `save_metrics_snapshot()` at end of `rebuild_index()` (chosen)
   - Option B: Add cron job or background task (more complex)
   - Option C: Manual trigger via API endpoint (requires human action)

4. **Chart library choice**: Recharts vs alternatives (Chart.js, Victory)
   - Recharts: React-first, declarative, good for this use case
   - Already using React, minimal bundle size impact

5. **Data retention**: No automatic cleanup of old snapshots
   - Could add later: DELETE snapshots older than 1 year
   - Low priority - disk usage is minimal

**Files to Modify:**

- `app/brain-map/backend/app/index.py` (schema, 2 new functions, snapshot call in rebuild)
- `app/brain-map/backend/app/main.py` (new `/metrics/trend` endpoint)
- `app/brain-map/frontend/package.json` (add recharts dependency)
- `app/brain-map/frontend/src/TrendChart.jsx` (NEW FILE - chart component)
- `app/brain-map/frontend/src/InsightsPanel.jsx` (fetch trend data, render chart)

**Estimated Complexity:**

- Backend: ~80 lines (schema + 2 functions + endpoint)
- Frontend: ~60 lines (new component + integration)
- Total: Medium complexity, straightforward implementation

**Acceptance Criteria Verification:**

- AC: "Trend chart renders" → Test by opening metrics tab, verify chart displays
- Verification: "View trend → line chart shows growth" → Add nodes, rebuild, check next day's snapshot shows increased count

---

## Dependencies (Phase 31+)

**Phase 31 (Core Interactions):**

- 31.1.1 → 31.1.2 → 31.1.3 (enums/defaults → promote → bulk triage)
- 31.1.1 → 31.1.4 (enums/defaults → relationship editor)
- 31.1.5 → 31.1.3 (multi-select → bulk triage actions)
- 31.1.6 depends on heat metric availability (recency exists; density/task may require backend wiring)
- 31.3.1 → 31.3.2 → 31.3.3 → 31.3.4 (drag → persist → toggle → load)
- 31.4.1 → 31.4.2 → 31.4.3 → 31.4.4 (detect drag → highlight → create → feedback)
- 31.5.1 → 31.5.2 → 31.5.3 → 31.5.4 (theme vars → toggle → adjust colors → default dark)
- 31.6.1 → 31.6.2 → 31.6.3 (move hotspots → style → cleanup)
- 31.7.1 → 31.7.2 → 31.7.3 → 31.7.4 (touch events → layout → controls → long-press)

**Phase 32 (Discovery & Intelligence):**

- 32.1.1 → 32.1.2 → 32.1.3 → 32.1.4 (path mode → algorithm → highlight → metadata)
- 32.2.1-32.2.4 independent (AI insights)
- 32.3.1 → 32.3.2 → 32.3.3 → 32.3.4 (save → dropdown → share → defaults)
- 32.4.1 → 32.4.2 → 32.4.3 → 32.4.4 (chips → logic → preview → save)

**Phase 33 (Polish & Power):**

- 33.1.1 → 33.1.2 → 33.1.3 → 33.1.4 (scrubber → filter → play → calendar)
- 33.2.1 → 33.2.2 → 33.2.3 → 33.2.4 (comments tab → backend → frontend → mentions)
- 33.3.1-33.3.4 independent (export formats)
- 33.4.1 → 33.4.2 → 33.4.3 → 33.4.4 (present mode → keyboard → transitions → notes)
- 33.5.1 → 33.5.2 → 33.5.3 → 33.5.4 (metrics → dashboard → suggestions → trends)

**Critical paths (re-ranked):**

- **P0 (Spec-critical):** 31.1.1 (type/status enums + defaults) → 31.1.2 (Inbox-first + Promote) → 31.1.4 (relationship editor). These unlock correct schema + low-friction capture/triage.
- **P0 (Core interaction):** 31.1.x (dragging + persistence), 31.2.x (drag-to-link), 31.3.x (dark mode), 31.5.x (mobile)
- **P1 (Workflow power):** 31.1.3 (bulk triage), 31.1.5 (multi-select), 31.1.6 (heat legend + multi-metric toggle)
- **P2 (Discovery/Polish):** 32.1.x (path finder), 32.3.x (saved views), 33.1.x (temporal viz), 33.3.x (export)

---

---

## Phase 35: Skills & Knowledge Base Maintenance

**Context:** Brain repository skills need periodic review and updates based on recent discoveries, tool usage patterns, and emerging best practices.

**Goal:** Keep skills knowledge base current, well-organized, and maximally useful for agents.

**Success Criteria:**

- GAP_BACKLOG items reviewed and promoted or archived
- Skills docs updated with recent learnings
- New domains/patterns documented as needed
- Skills index remains accurate

---

### Task 35.1: Skills Review & Updates

- [ ] **35.1.1** Review GAP_BACKLOG.md entries - Assess all P1/P2 items for promotion to skills or archival. AC: All entries have status (Promoted/Archived/Keep). Verification: GAP_BACKLOG has no undecided entries older than 30 days.

- [ ] **35.1.2** Update code-quality skills - Incorporate semantic review patterns, bulk edit best practices from recent work. AC: Updated skills reflect current practices. Verification: Review skills/domains/code-quality/*.md for completeness.

- [ ] **35.1.3** Enhance Ralph operational patterns - Document PLAN mode governance rules, THUNK tracking patterns, discovery defer rules. AC: Ralph patterns comprehensive. Verification: skills/domains/ralph/*.md covers all loop.sh modes.

- [ ] **35.1.4** Frontend skills expansion - Add React/Vue component patterns, state management best practices for web projects referencing brain. AC: Frontend domain has 5+ skill docs. Verification: ls skills/domains/frontend/*.md shows growth.

---

### Task 35.2: Template Maintenance

- [ ] **35.2.1** Audit template drift - Compare templates/ralph/ with workers/ralph/ for useful features to propagate. AC: Drift report generated. Verification: Documented differences in TEMPLATE_DRIFT_REPORT.md.

- [ ] **35.2.2** Sync beneficial features - Propagate general-purpose features from workers to templates. AC: Templates updated. Verification: git diff shows template updates.

- [ ] **35.2.3** Update bootstrap scripts - Ensure new-project.sh, setup.sh reflect latest patterns. AC: Scripts work for new projects. Verification: Test bootstrap in clean directory.

---

### Task 35.3: Documentation Quality

- [ ] **35.3.1** Link validation - Run validate_links.sh and fix broken internal links. AC: All links valid. Verification: bash tools/validate_links.sh returns 0 errors.

- [ ] **35.3.2** Example validation - Verify code examples in skills docs are complete and runnable. AC: Examples pass validation. Verification: python3 tools/validate_examples.py skills/ succeeds.

- [ ] **35.3.3** Update NEURONS.md - Ensure repository map reflects current structure. AC: NEURONS.md accurate. Verification: All directories listed, descriptions current.

- [ ] **35.3.4** Refresh skills/SUMMARY.md - Update error reference, domain list, examples. AC: SUMMARY current. Verification: Manual review of skills/SUMMARY.md.
