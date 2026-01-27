# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-27 15:05:00

**Current Status:** Phase 31-33 active (Brain Map V2 power features)

**Recent Completions:**

- **Phase 28: Template Maintenance (✅ COMPLETED)** - Audited templates for drift, verified no critical issues
- **Phase 27: Skills Knowledge Base Expansion (✅ COMPLETED)** - Reviewed GAP_BACKLOG, promoted semantic code review skill
- **Phase 26: Environment & Testing Infrastructure (✅ COMPLETED)** - Brain Map testing setup and documentation
- **Phase 25: Brain Map (✅ COMPLETED)** - Full MVP with backend API, frontend UI, comprehensive tests
- **Phase 24: Template Drift Alignment (✅ COMPLETED)**
- **Phase 23: Loop Efficiency & Correctness Fixes (✅ COMPLETED)**

**Active Focus:**

- Phase 31: Brain Map V2 Core Interactions (node dragging, drag-to-link, dark mode, mobile)
- Phase 32: Brain Map V2 Discovery & Intelligence (path finder, AI insights, saved views)
- Phase 33: Brain Map V2 Polish & Power Features (temporal viz, collaboration, export)

<!-- Cortex adds new Task Contracts below this line -->

## Phase 0-Lint: Markdown Lint Fixes

**Context:** Auto-fix could not resolve these markdown errors. Manual fixes required.

**Goal:** All markdown files pass `markdownlint` with zero errors.

**Tasks:**



- [ ] **0.L.3** Fix MD046 in workers/IMPLEMENTATION_PLAN.md lines 40, 55
  - **Issue:** Indented code blocks should be fenced
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD046 errors)

- [ ] **0.L.4** Fix MD007 in workers/IMPLEMENTATION_PLAN.md lines 46-48, 77-79, 90-92
  - **Issue:** Unordered list indentation (Expected: 0; Actual: 2)
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD007 errors)

- [ ] **0.L.5** Fix MD005 in workers/IMPLEMENTATION_PLAN.md line 94
  - **Issue:** Inconsistent indentation for list items at the same level
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD005 errors)

---

## Phase 30: Brain Map UX Refinements (2 hours) 🎨

**Context:** After Phase 29 quick wins, polish the graph navigation and rendering for production quality.

**Goal:** Professional graph UX with proper navigation controls, smart label rendering, and clean layout.

**Success Criteria:**

- User never "loses" position in graph (fit-to-screen button or minimap)
- Labels render intelligently (hover-only mode, zoom-based sizing)
- Inspector layout is clean (no overlapping panels)

---

### Task 30.1: Proper cluster mode switching

- [ ] **30.1.1** Refactor cluster rebuild to use `showClusters` boolean - Use `useMemo` to derive `showClusters` from `zoomLevel < 0.5`, then use in useEffect deps instead of raw zoomLevel. AC: Graph rebuild fires only when boolean flips. Verification: Console.log fires only at threshold crossing. If Blocked: 29.1.2 already handles this; skip if satisfied

---

### Task 30.2: Navigation controls (fit-to-screen + reset)



- [ ] **30.2.3** Add minimap or breadcrumb indicator
  - **Goal:** Show user where they are in the graph when panned away from center
  - **Options:**
    - **Minimap:** Small thumbnail of full graph with viewport indicator (requires canvas overlay)
    - **Breadcrumb:** "Viewing: Cluster X / Node Y" indicator (simpler)
    - **Center distance:** "50m from center" indicator (cheapest)
  - **Recommendation:** Start with breadcrumb (show selected node path)
  - **AC:** User can see current location context even when panned far from origin
  - **Verification:** Pan away → indicator shows "Viewing: Node ABC" or similar
  - **If Blocked:** Skip for MVP; reconsider if user testing shows disorientation

---

### Task 30.3: Smart label rendering

- [ ] **30.3.1** Implement hover-only label mode - Custom label reducer that renders labels only for `data.highlighted || data.hovered` nodes, add enterNode/leaveNode handlers to set hovered attribute. AC: Labels appear only on hover. Verification: Mouse over → label appears; move away → disappears. If Blocked: Lower priority; 29.2.1 threshold sufficient

- [ ] **30.3.2** Zoom-based label sizing - Set `labelSize: Math.max(10, Math.min(16, 12 * zoomLevel))` to scale font size with zoom level. AC: Labels grow/shrink as user zooms in/out. Verification: Zoom in → bigger labels; zoom out → smaller labels. If Blocked: Skip; static size fine for MVP

---

### Task 30.4: Inspector layout cleanup

- [ ] **30.4.1** Fix `InsightsPanel` positioning (remove `position: fixed`)
  - **Goal:** Make Insights panel part of natural document flow (no overlay)
  - **File:** `app/brain-map/frontend/src/InsightsPanel.jsx` line 45
  - **Change:** Remove `position: fixed` and adjust `App.jsx` layout to use flexbox properly
  - **Implementation:**
    - In `InsightsPanel.jsx`: Remove `position: fixed, top, right, width` (let parent control sizing)
    - In `App.jsx`: Ensure right column uses `display: flex, flexDirection: column` and panels use `flex: 1`
  - **AC:** Hotspots and form fields never overlap; both scroll naturally within right panel
  - **Verification:** Resize window → panels stay in column; no overlapping elements
  - **If Blocked:** 29.3.1 collapsible is sufficient; skip layout refactor

- [ ] **30.4.2** Add proper scrolling to right panel
  - **Goal:** Long Hotspots lists or node bodies scroll within panel (don't push form fields off screen)
  - **Implementation:** Add `overflow-y: auto` and `max-height` to scrollable sections
  - **AC:** Hotspots list with 20+ items scrolls within panel; form fields always visible below
  - **Verification:** Add 20 fake hotspot entries → list scrolls; form fields still visible
  - **If Blocked:** Lower priority; most graphs won't have 20+ hotspots

---

## Task Dependencies

**Phase 29 (parallel execution allowed):**

- 29.1.1 → 29.1.2 (derived state depends on removing zoomLevel from deps)
- 29.2.1 independent
- 29.3.1 independent

**Phase 30:**

- 30.1.1 depends on 29.1.2 (or supersedes it)
- 30.2.1-30.2.3 independent (navigation controls)
- 30.3.1-30.3.2 independent (label rendering)
- 30.4.1 → 30.4.2 (layout refactor before scroll tuning)

**Critical path:** 29.1.1 → 29.1.2 → 30.2.1 (zoom fix → fit-to-screen button)

---

## Phase 31: Brain Map V2 - Core Interactions 🔥

**Context:** User testing feedback - need node dragging, drag-to-link edge creation, dark mode, and mobile support for production use.

**Goal:** Transform Brain Map from static visualization to interactive knowledge graph editor.

**Success Criteria:**

- User can drag nodes to custom positions (persisted to frontmatter)
- User can drag from node A to node B to create link
- Dark mode by default with theme toggle
- Hotspots moved to left sidebar (below Recency filter)
- Mobile/tablet touch support (pinch-zoom, pan, tap)

---

### Task 31.1: Spec Gap Closure (Inbox, Promotion, Enums, Relationship Editor, Multi-Select, Heat Legend)

**Context:** Spec gaps discovered vs current V2 plan. These are required for V1 usability and schema correctness.

**Goal:** Add the missing workflow primitives (Inbox capture/promote/triage), strict enums (type/status), relationship editor UI, multi-select, and heat legend/multi-metric toggle.

- [ ] **31.1.1** Enforce canonical `type` + `status` enums end-to-end - Backend validation: `type ∈ {Inbox, Concept, System, Decision, TaskContract, Artifact}` and `status ∈ {idea, planned, active, blocked, done, archived}` with clear 400 errors; frontend dropdowns use exact values; node creation defaults: `type=Inbox`, `status=idea` when omitted. AC: Creating/updating node with invalid type/status returns 400 with allowed values; UI only allows allowed values. Verification: Try POST invalid type → 400; Quick Add shows dropdowns with exact enums. If Blocked: Add frontend dropdowns first, backend validation second

- [ ] **31.1.2** Implement Inbox-first capture defaults + "Promote" action in node detail - Quick Add defaults to Inbox/idea unless user chooses; Node Detail panel adds "Promote" button that converts `type: Inbox → {Concept|System|Decision|TaskContract|Artifact}` without changing `id` and preserves existing fields. AC: Promote does not change id; type updates in markdown frontmatter; graph refresh shows new type color. Verification: Create Inbox node, promote to Concept, refresh → same id, new type. If Blocked: Implement promotion as a "Type" dropdown change gated by `currentType===Inbox`

- [ ] **31.1.3** Bulk triage for Inbox - Add left sidebar filter preset "Inbox" (type=Inbox) + sort-by-recency; add multi-action bar for selected Inbox nodes: Promote (choose target type), Archive (status=archived). AC: User can filter to Inbox, select multiple, and promote/archive in one action. Verification: Filter Inbox → select 3 → archive → nodes now have status archived and disappear from default view. If Blocked: Start with single-node promote/archive actions (no bulk) and add bulk next

- [ ] **31.1.4** Relationship editor in Node Detail panel (typed, directional) - Add UI to view outbound and inbound relationships for the selected node; add "Add relationship" control: choose relation type, search-by-title (autocomplete), store target by `id`; backend updates frontmatter relationships; graph refresh renders edge with type label/color. AC: Can add relationship from detail panel without drag-to-link; inbound/outbound lists show correct nodes. Verification: Add relationship A -[blocks]-> B from panel → edge appears; open B → inbound shows A. If Blocked: Implement outbound-only editor first, inbound list computed from graph

- [ ] **31.1.5** Multi-select (Shift-click) + bulk operations hook - Implement shift-click multi-select in graph; selection list shown in side panel; add "Generate plan from selection" button (can call existing plan endpoint later, or just collect IDs now). AC: User can select multiple nodes; selection persists until cleared; list of selected IDs visible. Verification: Shift-click 5 nodes → selection count updates; click Clear → selection resets. If Blocked: Implement multi-select in sidebar list first (without graph shift-click)

- [ ] **31.1.6** Heat overlay: multi-metric toggle + legend - UI toggle for heat metric: density/recency/task; add legend explaining color/halo intensity scale; ensure node halo/glow reflects selected metric. AC: Switching metric changes halo intensity; legend visible and updates labels. Verification: Toggle metric → node halos change; legend shows 0..1 scale and metric description. If Blocked: Legend-only first, then add density/task toggles once metrics are wired

- [ ] **31.1.7** (Optional) Priority + risk fields - Add `priority ∈ {P0,P1,P2,P3}` and `risk ∈ {low,medium,high}` validation + dropdowns; persist in frontmatter and show in filters. AC: Dropdowns present and values validated. Verification: Set priority P0 → saved to markdown. If Blocked: Defer to Phase 32

---


### Task 31.2: Quick Add Node Creation

- [ ] **31.2.1** Replace InsightsPanel with QuickAddPanel - Create new `QuickAddPanel.jsx` component with form fields (Title, Body, Type, Status, Tags), replace InsightsPanel in App.jsx right sidebar. AC: Right panel shows Quick Add form. Verification: Load app → see create form on right. If Blocked: Keep both panels, add mode toggle

- [ ] **31.2.2** Implement Quick Add form with Enter key support - Title input (required, Enter → focus Body), Body textarea (required, Ctrl/Cmd+Enter → submit), Type dropdown (optional, default "note"), Status input (optional, default "active"), Tags input (optional, comma-separated). AC: Press Enter in Title → focuses Body; Ctrl+Enter in Body → creates node. Verification: Fill form, Ctrl+Enter → node created. If Blocked: Use button-only submission

- [ ] **31.2.3** Add "Click to Place" mode - Button activates click-to-place mode, cursor changes to crosshair, click on graph → POST `/node` with title/body/position, place node at clicked coordinates. AC: Click button → cursor changes; click graph → node appears at click location. Verification: Click to Place → click graph → node placed exactly there. If Blocked: Use center placement only

- [ ] **31.2.4** Add "Drag to Place" mode - Drag ghost node icon from Quick Add form onto graph, drop to place node at drop coordinates. AC: Drag ghost → shows preview; drop → creates node at drop location. Verification: Drag icon onto graph → node appears where dropped. If Blocked: Click to Place only

- [ ] **31.2.5** Add collapsible right sidebar - Small tab on right edge with collapse/expand icon, clicking collapses sidebar to edge (graph expands), clicking tab reopens. AC: Tab toggle works. Verification: Click tab → sidebar collapses; click again → reopens. If Blocked: Always visible (no collapse)

- [ ] **31.2.6** Add swipe gesture for mobile sidebar collapse - On mobile (<768px), swipe right-to-left on sidebar → collapses it, swipe left-to-right on collapsed tab → opens. AC: Swipe gestures work on mobile. Verification: Test on mobile → swipe collapses sidebar. If Blocked: Desktop tab-only, mobile uses hamburger menu

- [ ] **31.2.7** Clear form after node creation - After successful POST, clear Title/Body/Tags fields, show success toast "Node created", focus Title input for next note. AC: Form clears after create. Verification: Create node → form resets, ready for next. If Blocked: Manual clear only

- [ ] **31.2.8** Improve field labels - Change "ID" to "Node ID (auto-generated)", "Title" to "Note Title", "Body" to "Note Content (Markdown)", "Type" to "Node Type (optional)", "Status" to "Task Status (optional)", "Tags" to "Tags (comma-separated)". AC: Labels are clear and descriptive. Verification: Read form → labels self-explanatory. If Blocked: Tooltips instead

---


### Task 31.3: Node Dragging & Position Persistence

- [ ] **31.3.1** Enable Sigma drag mode - Set `sigma.setSetting('enableCameraMovement', false)` when dragging node, add `dragNode` and `dropNode` event handlers to GraphView.jsx. AC: User can click-drag node to new position. Verification: Drag node → position updates in real-time. If Blocked: Check Sigma docs for drag event API

- [ ] **31.3.2** Persist node positions to frontmatter - On `dropNode` event, POST to new `/node/{id}/position` endpoint with `{x, y}` coords, backend writes to markdown frontmatter `position: {x: 123, y: 456}`. AC: Reload page → node stays in dragged position. Verification: Drag node, refresh browser, node is in same spot. If Blocked: Store in localStorage as temporary solution

- [ ] **31.3.3** Add "Lock Layout" toggle - Button in top-right controls to switch between manual (draggable) and auto-layout (ForceAtlas2) modes. AC: Toggle on → nodes lockable; toggle off → force-directed layout resumes. Verification: Lock layout, drag nodes, unlock, nodes animate back to force positions. If Blocked: Default to manual mode only

- [ ] **31.3.4** Load saved positions on graph render - Backend includes `position` in `/graph` response, frontend uses saved coords if present (skip random x/y). AC: Nodes with saved positions render at those coords; unsaved nodes use force layout. Verification: Mix of saved/unsaved nodes renders correctly. If Blocked: All-or-nothing (either all manual or all auto)

---

### Task 31.4: Drag-to-Link Edge Creation

- [ ] **31.4.1** Detect drag-for-link gesture - On node mousedown, check if Shift key held → enter link mode (show dashed line following cursor). AC: Shift+drag from node shows link preview line. Verification: Shift+drag → dashed line appears; release Shift → cancels. If Blocked: Use right-click drag as alternative trigger

- [ ] **31.4.2** Highlight link target on hover - During link drag, detect when cursor over another node → highlight target with glow effect. AC: Hover over target node → visual feedback. Verification: Drag link line over multiple nodes → each highlights. If Blocked: Skip hover feedback; just support drop

- [ ] **31.4.3** Create link on drop - On drop over target node, POST to `/node/{source_id}` with updated `links: [target_id]` array, backend updates source markdown frontmatter. AC: Drop creates link, graph refreshes showing new edge. Verification: Shift+drag node A to B → edge appears, markdown updated. If Blocked: Show "Link created" modal with undo button

- [ ] **31.4.4** Visual feedback for link creation - Toast notification on success ("Link created: A → B"), error handling for self-links or duplicates. AC: Success toast shows for 3 seconds. Verification: Create link → toast appears; try duplicate → error message. If Blocked: Console.log only

---

### Task 31.5: Dark Mode & Theme System

- [ ] **31.5.1** Implement dark theme CSS variables - Create theme object with light/dark palettes (background, text, panels, borders, node colors), apply via CSS-in-JS or style props. AC: Dark theme renders correctly (readable text, good contrast). Verification: Toggle theme → colors switch. If Blocked: Start with dark-only, add toggle later

- [ ] **31.5.2** Add theme toggle button - Sun/moon icon in header (top-right), onClick toggles theme and saves to localStorage. AC: Toggle persists across sessions. Verification: Set dark mode, refresh → still dark. If Blocked: Use browser `prefers-color-scheme` detection only

- [ ] **31.5.3** Adjust node colors for dark mode - Slightly desaturate node type colors for dark backgrounds (task green, concept blue, etc. → darker shades). AC: Node colors readable on dark canvas. Verification: Dark mode → all node types distinguishable. If Blocked: Keep light-mode colors, just change canvas background

- [ ] **31.5.4** Set dark mode as default - Initialize theme state to 'dark', show light mode as opt-in. AC: First load shows dark mode. Verification: Fresh browser session → dark mode active. If Blocked: Respect `prefers-color-scheme` instead of forcing dark

---

### Task 31.6: Move Hotspots to Left Sidebar

- [ ] **31.6.1** Move Hotspots component from InsightsPanel to FilterPanel - Cut Hotspots section from `InsightsPanel.jsx` lines 58-235, paste into `FilterPanel.jsx` after Recency dropdown (after line 157). AC: Hotspots appear in left sidebar below filters. Verification: Open app → Hotspots in left panel. If Blocked: Create duplicate initially, remove from right later

- [ ] **31.6.2** Style Hotspots for left sidebar - Match FilterPanel styling (compact, no wide padding), limit to top 5 hotspots with "Show more" expansion. AC: Hotspots fit naturally in left sidebar width (300px). Verification: Hotspots list doesn't overflow or break layout. If Blocked: Use accordion/collapse to save space

- [ ] **31.6.3** Update InsightsPanel layout - Remove empty space where Hotspots were, ensure form fields (ID, Title, Type, Status, Tags, Body) take full height. AC: Right panel shows node details only. Verification: Select node → right panel shows form fields cleanly. If Blocked: Keep old layout, hide Hotspots section

---

### Task 31.7: Mobile & Touch Support

- [ ] **31.7.1** Add touch event handlers - Implement pinch-to-zoom (two-finger pinch), pan (single-finger drag on canvas), tap-to-select (single tap on node). AC: Pinch zoom works on mobile. Verification: Test on phone/tablet simulator → gestures work. If Blocked: Desktop-only for now, document mobile as Phase 34

- [ ] **31.7.2** Optimize layout for mobile screens - Media queries for <768px width: collapse sidebars, show hamburger menu, make graph full-screen. AC: Mobile layout usable (no horizontal scroll). Verification: Resize browser to 375px width → UI adapts. If Blocked: Min-width warning ("Desktop recommended")

- [ ] **31.7.3** Add mobile-friendly controls - Larger touch targets (48px min), floating action buttons for zoom/fit-to-screen, bottom sheet for node details. AC: Controls tappable on mobile without precision. Verification: Tap controls on phone → no mis-taps. If Blocked: Increase button size only

- [ ] **31.7.4** Handle long-press for context menu - Long-press node → show context menu (Edit, Delete, Create Link, View Details). AC: Long-press triggers menu. Verification: Long-press node on mobile → menu appears. If Blocked: Skip context menu, use double-tap to edit

---

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

- [ ] **32.1.1** Add "Find Path" mode - Toolbar button activates path-finding mode, prompts "Select start node, then end node". AC: Click Find Path → mode activates. Verification: Button shows "active" state. If Blocked: Use command palette (Ctrl+P) instead

- [ ] **32.1.2** Implement shortest path algorithm - Backend endpoint `/path?from={id}&to={id}` returns shortest path using BFS/Dijkstra on edge graph. AC: Returns array of node IDs in path order. Verification: Request path between known nodes → correct path returned. If Blocked: Use graphology `shortestPath()` client-side

- [ ] **32.1.3** Highlight path on graph - Render path nodes with glow effect, edges in path with bright color (e.g., cyan), fade non-path elements. AC: Path visually distinct. Verification: Find path → highlighted nodes/edges clear. If Blocked: Just zoom to fit path nodes

- [ ] **32.1.4** Show path metadata - Display path length, intermediate nodes, estimated "semantic distance" (based on edge weights). AC: Path info panel shows details. Verification: Find path → see "4 hops via Node X, Y, Z". If Blocked: Just show node count

---

### Task 32.2: AI-Powered Insights

- [ ] **32.2.1** Implement auto-tagging suggestions - Backend analyzes node body text, suggests tags using keyword extraction (TF-IDF or simple regex). AC: API endpoint `/node/{id}/suggest-tags` returns tag array. Verification: Request suggestions for sample note → relevant tags returned. If Blocked: Use predefined tag dictionary matching

- [ ] **32.2.2** Orphan node detection - Backend identifies nodes with zero edges (in/out degree = 0), returns list via `/insights/orphans`. AC: Orphans endpoint works. Verification: Create isolated node → appears in orphans list. If Blocked: Client-side filter (graph.nodes.filter(n => graph.degree(n) === 0))

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
