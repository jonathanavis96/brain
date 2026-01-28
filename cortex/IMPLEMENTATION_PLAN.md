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

- [ ] **33.1.1** Timeline scrubber UI - Add slider component at bottom of canvas, shows date range from oldest to newest note. AC: Slider renders. Verification: Open Brain Map → slider visible at bottom. If Blocked: Show date range text only

- [ ] **33.1.2** Filter graph by date - Backend endpoint `/index?before=YYYY-MM-DD` returns nodes/edges created before specified date. AC: Endpoint works. Verification: Request with date → returns filtered graph. If Blocked: Client-side date filtering

- [ ] **33.1.3** Animate timeline playback - "Play" button advances scrubber forward in time, nodes fade in as they appear. AC: Play button works. Verification: Click play → scrubber moves, graph updates. If Blocked: Manual scrubber only

- [ ] **33.1.4** Activity calendar integration - Click calendar date → scrubber jumps to that date, graph filters. AC: Calendar integration works. Verification: Click ActivityCalendar date → scrubber updates. If Blocked: Separate controls

---

### Task 33.2: Collaboration (Comments)

- [ ] **33.2.1** Comments tab in InsightsPanel - Add "Comments" tab next to "Details", shows threaded discussion for selected node. AC: Tab renders. Verification: Select node → Comments tab appears. If Blocked: Read-only comment display

- [ ] **33.2.2** Comments backend - Backend stores comments in `notes/{id}.comments.json`, endpoints: `GET/POST /notes/{id}/comments`. AC: Endpoints work. Verification: POST comment → appears in GET. If Blocked: Frontmatter-only comments

- [ ] **33.2.3** Comment posting UI - Text area + "Post Comment" button, shows author/timestamp, supports markdown. AC: Can post comments. Verification: Write comment → submit → appears in list. If Blocked: Plain text only

- [ ] **33.2.4** @mentions autocomplete - Type `@` in comment → shows node name suggestions, creates backlink. AC: Mentions work. Verification: Type `@test` → suggestions appear. If Blocked: Manual [[wikilinks]]

---

### Task 33.3: Export & Integration

- [ ] **33.3.1** Export as PNG - "Export → PNG" button captures canvas as image file, downloads to user. AC: PNG export works. Verification: Click export → downloads valid PNG. If Blocked: Screenshot instructions

- [ ] **33.3.2** Export as SVG - "Export → SVG" button generates vector graphic, preserves node positions/colors. AC: SVG export works. Verification: Click export → downloads valid SVG. If Blocked: PNG only

- [ ] **33.3.3** Export as GraphML - "Export → GraphML" button generates XML format compatible with Gephi/Cytoscape. AC: GraphML export works. Verification: Import in Gephi → graph loads. If Blocked: JSON export

- [ ] **33.3.4** Import from Obsidian - Upload Obsidian vault ZIP → backend parses markdown, creates nodes. AC: Import works. Verification: Upload test vault → nodes appear. If Blocked: Manual copy-paste

---

### Task 33.4: Presentation Mode

- [ ] **33.4.1** Presentation mode toggle - "Present Mode" button in header, hides panels, shows only canvas + selected node. AC: Mode toggles. Verification: Click Present → panels hide. If Blocked: Fullscreen canvas

- [ ] **33.4.2** Keyboard navigation - Arrow keys navigate between connected nodes, ESC exits mode, Space toggles node body. AC: Keys work. Verification: Present mode → arrow keys navigate. If Blocked: Click navigation

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
