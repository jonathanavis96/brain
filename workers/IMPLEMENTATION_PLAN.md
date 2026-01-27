# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-27 18:40:00

**Current Status:** Phase 0-Warn active (markdown lint fixes), Phase 31-33 (Brain Map V2 power features)

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

## Phase 32: Brain Map V2 - Discovery & Intelligence 🧠

**Context:** Power users need advanced navigation, AI insights, and saved views for complex knowledge graphs.

**Goal:** Add intelligence layer - path finding, auto-suggestions, visual query builder.

**Success Criteria:**

- User can find shortest path between any 2 nodes
- AI suggests tags, detects orphans, identifies bridge nodes
- User can save/load filtered views
- Visual query builder for complex filters

---

### Task 32.1: Path Finder


- [x] **32.1.2** Implement shortest path algorithm - Backend endpoint `/path?from={id}&to={id}` returns shortest path using BFS/Dijkstra on edge graph. AC: Returns array of node IDs in path order. Verification: Request path between known nodes → correct path returned. If Blocked: Use graphology `shortestPath()` client-side

- [x] **32.1.3** Highlight path on graph - Render path nodes with glow effect, edges in path with bright color (e.g., cyan), fade non-path elements. AC: Path visually distinct. Verification: Find path → highlighted nodes/edges clear. If Blocked: Just zoom to fit path nodes

- [x] **32.1.4** Show path metadata - Display path length, intermediate nodes, estimated "semantic distance" (based on edge weights). AC: Path info panel shows details. Verification: Find path → see "4 hops via Node X, Y, Z". If Blocked: Just show node count

---

### Task 32.2: AI-Powered Insights

- [x] **32.2.1** Implement auto-tagging suggestions - Backend analyzes node body text, suggests tags using keyword extraction (TF-IDF or simple regex). AC: API endpoint `/node/{id}/suggest-tags` returns tag array. Verification: Request suggestions for sample note → relevant tags returned. If Blocked: Use predefined tag dictionary matching

- [x] **32.2.2** Orphan node detection - Backend identifies nodes with zero edges (in/out degree = 0), returns list via `/insights/orphans`. AC: Orphans endpoint works. Verification: Create isolated node → appears in orphans list. If Blocked: Client-side filter (graph.nodes.filter(n => graph.degree(n) === 0))

- [ ] **32.2.3** Bridge node identification - Calculate betweenness centrality (nodes that connect disparate clusters), highlight top 5 in UI. AC: Bridge nodes marked with icon. Verification: Manually create bridge topology → correct nodes identified. If Blocked: Skip betweenness, use degree centrality (most connected)

- [ ] **32.2.4** Stale note alerts - Flag nodes with `updated_at > 90 days`, show in insights panel with "Update recommended". AC: Stale nodes listed. Verification: Create old note → appears in stale list. If Blocked: Use recency metric already implemented

---

### Task 32.3: Saved Views & Bookmarks

- [ ] **32.3.1** Add "Save View" button - Captures current filter state + zoom + camera position, stores in localStorage with user-defined name. AC: Save View → prompts for name → saved. Verification: Save view "My Project" → appears in views list. If Blocked: Save filters only (not camera state)

- [ ] **32.3.2** Create Views dropdown in header - List of saved views, click to load (applies filters, restores camera). AC: Dropdown shows saved views. Verification: Load saved view → graph state restored. If Blocked: Use bookmarks panel in sidebar

- [ ] **32.3.3** Implement view sharing - "Share View" generates URL with encoded filter params (e.g., `/graph?view=base64encodedstate`). AC: Copy link, open in new tab → same view. Verification: Share link to another user → they see same filtered graph. If Blocked: Copy filter JSON to clipboard

- [ ] **32.3.4** Add default views - Preset views: "All Tasks", "Blocked Items", "Recent Activity (7d)", "Orphans". AC: Default views available on first load. Verification: Fresh session → 4 default views shown. If Blocked: Just document filter examples in help

---

### Task 32.4: Visual Query Builder

- [ ] **32.4.1** Create filter chip UI - Drag-and-drop chips for filter criteria (Type=task, Status=blocked, Tags contains X, Recency=7d). AC: Filter chips render in panel. Verification: Add chips → filter updates. If Blocked: Use form inputs only (existing FilterPanel)

- [ ] **32.4.2** Implement AND/OR logic - Support complex queries: "(Type=task OR Type=decision) AND Status=active". AC: Boolean logic works. Verification: Build complex filter → correct nodes shown. If Blocked: AND-only logic (all conditions must match)

- [ ] **32.4.3** Add filter preview count - Show "X nodes match" before applying filter. AC: Preview count updates as chips change. Verification: Adjust filter → count updates live. If Blocked: Apply-then-count (no preview)

- [ ] **32.4.4** Save filter as named view - "Save as View" button in query builder creates reusable saved view. AC: Query builder state saved. Verification: Build complex query → save → reload → works. If Blocked: Manual JSON export

---

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

- [ ] **33.1.1** Add timeline scrubber component - Slider at bottom of graph showing date range (earliest to latest `created_at`), drag to filter nodes by date. AC: Scrubber renders with correct date range. Verification: Drag slider → nodes fade in/out. If Blocked: Use discrete buttons (Today, This Week, This Month, All Time)

- [ ] **33.1.2** Implement time-based filtering - As scrubber moves, filter nodes where `created_at <= selected_date`, animate nodes appearing/disappearing. AC: Time travel works. Verification: Scrub to past date → older nodes hidden. If Blocked: Show all nodes, just highlight time-filtered subset

- [ ] **33.1.3** Add "Play" animation - Auto-advance scrubber from start to end (1 second per week), show graph growing over time. AC: Play button animates timeline. Verification: Click Play → graph evolves. If Blocked: Manual scrub only

- [ ] **33.1.4** Activity heatmap calendar - GitHub-style contribution calendar showing days with most creates/updates. AC: Calendar renders with activity data. Verification: Click date → filters graph to that day. If Blocked: Skip calendar, use histogram chart

---

### Task 33.2: Collaboration (Comments)

- [ ] **33.2.1** Add Comments tab to InsightsPanel - New tab (next to Details tab) showing threaded comments for selected node. AC: Tab switcher works. Verification: Click Comments → shows comment list. If Blocked: Single comment field (no threading)

- [ ] **33.2.2** Backend: Store comments in frontmatter - `comments: [{author, text, timestamp, replies: [...]}]` array in markdown. POST to `/node/{id}/comments`. AC: Comments persisted. Verification: Add comment → markdown updated. If Blocked: Use separate JSON file per node

- [ ] **33.2.3** Frontend: Render comment threads - Show comments in nested list, reply button adds to thread. AC: Threading works. Verification: Reply to comment → indented reply shown. If Blocked: Flat list (no replies)

- [ ] **33.2.4** Add mentions (@username) - Detect `@username` in comment text, notify mentioned user (if multi-user setup). AC: Mentions highlighted. Verification: Type @alice → suggestion appears. If Blocked: Plain text only

---

### Task 33.3: Export & Integration

- [ ] **33.3.1** Export graph as PNG - Button in header "Export → PNG", renders current graph view to canvas, downloads as image file. AC: PNG export works. Verification: Click Export PNG → file downloads. If Blocked: Use screenshot library (html2canvas)

- [ ] **33.3.2** Export graph as SVG - Vector format export for high-quality prints/presentations. AC: SVG export works. Verification: Open SVG in Inkscape → editable vectors. If Blocked: PNG-only for MVP

- [ ] **33.3.3** Export as GraphML/GEXF - Standard graph formats for Gephi/Cytoscape import. AC: GraphML file valid. Verification: Import into Gephi → graph loads. If Blocked: Export JSON only

- [ ] **33.3.4** Markdown table export - Export filtered nodes as markdown table (ID, Title, Type, Status, Tags). AC: Table export works. Verification: Open in markdown editor → table renders. If Blocked: CSV export instead

---

### Task 33.4: Presentation Mode

- [ ] **33.4.1** Add "Present" button - Enters full-screen mode, hides UI panels, shows graph + navigation controls only. AC: Presentation mode toggles. Verification: Click Present → full-screen graph. If Blocked: Just hide sidebars (not true full-screen)

- [ ] **33.4.2** Keyboard navigation - Arrow keys navigate between connected nodes (follow edges), space bar zooms to focused node. AC: Keyboard nav works. Verification: Press Right → moves to connected node. If Blocked: Click-only navigation

- [ ] **33.4.3** Slide-style transitions - Smooth camera animations between nodes, optional fade-in for node details. AC: Transitions smooth. Verification: Navigate nodes → camera pans smoothly. If Blocked: Instant jumps

- [ ] **33.4.4** Presenter notes - Optional notes field in node frontmatter (`presenter_notes: "..."`), shows in overlay during presentation. AC: Notes display. Verification: Add presenter notes → shows in present mode. If Blocked: Just show node body

---

### Task 33.5: Graph Health Metrics

- [ ] **33.5.1** Calculate graph metrics - Backend computes: node count, edge count, avg degree, orphan count, largest connected component, cluster count. AC: Metrics endpoint `/metrics`. Verification: Request metrics → JSON with stats. If Blocked: Client-side calculation

- [ ] **33.5.2** Graph health dashboard - Panel showing metrics + health score (0-100 based on connectivity), color-coded indicators. AC: Dashboard renders. Verification: Open dashboard → see metrics. If Blocked: Just show raw numbers

- [ ] **33.5.3** Actionable suggestions - "Link these 3 orphans", "Update 5 stale notes", "Merge duplicate tags". AC: Suggestions displayed. Verification: Graph with issues → suggestions appear. If Blocked: Manual review only

- [ ] **33.5.4** Trend tracking - Store metrics snapshots daily, show chart of graph growth over time. AC: Trend chart renders. Verification: View trend → line chart shows growth. If Blocked: Current metrics only (no history)

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
