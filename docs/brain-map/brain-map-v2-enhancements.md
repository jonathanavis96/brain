# Brain Map V2 Enhancement Proposals

**Date:** 2026-01-27  
**Status:** Proposed features based on user testing feedback

---

## 🎯 User Requests (High Priority)

### 1. **Node Dragging & Manual Positioning**

**Current:** Force-directed layout only (automatic positioning)  
**Requested:** Ability to drag nodes around the canvas and manually arrange them  

**Use cases:**

- Create visual hierarchies (important nodes at top)
- Group related nodes manually
- Clean up messy layouts
- Save preferred arrangement (persist positions to node metadata)

**Implementation approach:**

- Enable Sigma's drag mode: `sigma.setSetting('enableEdgeEvents', true)`
- Add drag handlers: `dragNode`, `dropNode` events
- Store positions in node frontmatter: `position: {x: 123, y: 456}`
- Add "Lock Layout" toggle (manual vs auto-layout modes)

---

### 2. **Drag-to-Link (Create Edges by Dragging)**

**Current:** Links only created via markdown frontmatter (`links: [...]`)  
**Requested:** Drag from one node to another to create a link

**Use cases:**

- Quick connection creation during brainstorming
- Visual relationship mapping
- Bypass markdown editing for simple links

**Implementation approach:**

- Detect drag start on node → show "link mode" indicator
- Track mouse position during drag
- On drop over another node → POST to `/edge` endpoint (new)
- Update source node's markdown `links:` array
- Refresh graph to show new edge

**UI feedback:**

- Dashed line follows cursor during drag
- Target node highlights when hoverable
- Toast notification on success

---

### 3. **Hotspots Panel → Left Sidebar (Below Recency Filter)**

**Current:** Hotspots in right InsightsPanel (overlaps form fields)  
**Requested:** Move to FilterPanel (left sidebar) below "Recency" dropdown

**Rationale:**

- Hotspots are a *filter/discovery tool* (like type/status/tags)
- Right panel should focus on *selected node details*
- Reduces panel clutter

**Implementation:**

- Move Hotspots component from InsightsPanel → FilterPanel
- Place after line 157 (below Recency dropdown)
- Show top 5 hotspots by default (expandable to 10)

---

### 4. **Dark Mode by Default**

**Current:** Light theme only  
**Requested:** Dark background, light text, muted colors

**Design specs:**

- Background: `#1e1e1e` (VS Code dark)
- Canvas: `#252526`
- Text: `#d4d4d4`
- Panels: `#2d2d30`
- Borders: `#3e3e42`
- Node colors: Keep existing palette but slightly desaturate

**Implementation:**

- Add theme toggle button (☀️/🌙) in header
- Store preference in localStorage
- Apply CSS variables for easy theme switching
- Consider prefers-color-scheme detection

---

## 🚀 "Think Outside the Box" Power Features

### 5. **AI-Powered Insights**

- **Auto-tagging:** Suggest tags based on note content (backend: use simple keyword extraction or GPT-4)
- **Orphan detection:** Highlight nodes with 0 connections
- **Bridge nodes:** Identify nodes that connect disparate clusters (betweenness centrality)
- **Stale note alerts:** Nodes not updated in 90+ days

---

### 6. **Graph Manipulation**

#### A. **Path Finder**

- Select 2 nodes → show shortest path between them
- Highlight intermediate nodes/edges
- Use case: "How does Concept A relate to Task B?"

#### B. **Subgraph Extraction**

- Select multiple nodes (Shift+Click) → "Extract Subgraph" button
- Creates new view with only selected nodes + their connections
- Use case: Focus on specific project subset

#### C. **Node Merging**

- Drag node onto another → "Merge nodes?" prompt
- Combines frontmatter, concatenates bodies
- Use case: Dedupe similar notes

---

### 7. **Temporal Visualization**

#### A. **Timeline Scrubber**

- Slider at bottom: drag to show graph state at different dates
- Nodes fade in/out based on creation date
- Use case: See how knowledge graph evolved

#### B. **Activity Heatmap (Calendar View)**

- GitHub-style contribution graph
- Shows days with most edits/new nodes
- Click date → filter graph to that day's changes

---

### 8. **Collaboration Features**

#### A. **Comments on Nodes**

- Click node → "Comments" tab in right panel
- Threaded discussions (like Google Docs comments)
- Backend: `comments: [{author, text, timestamp}]` in frontmatter

#### B. **Change History / Version Control**

- Show git blame for each node
- "View History" → see diffs over time
- Use case: "Who changed this decision?"

---

### 9. **Advanced Filtering**

#### A. **Visual Query Builder**

- "Show me: tasks + linked to concepts + updated in last 7 days"
- Drag-and-drop filter chips (type=task AND recency=7d)

#### B. **Saved Views**

- Save filter + zoom + position state
- Quick access: "My Projects", "Blocked Tasks", "Research Topics"

#### C. **Graph Diff**

- Compare two snapshots (e.g., Monday vs Friday)
- Highlight added/removed nodes and edges

---

### 10. **Export & Integration**

#### A. **Export Options**

- PNG/SVG image of current view
- GraphML/GEXF for Gephi/Cytoscape
- Markdown table (nodes + properties)
- JSON API for external tools

#### B. **Obsidian/Roam/Logseq Compatibility**

- Import notes from other PKM tools
- Detect wikilinks `[[note]]` and backlinks
- Two-way sync

#### C. **Browser Extension**

- Capture web page → create node with URL
- Quick add from anywhere

---

### 11. **Smart Layouts**

#### A. **Hierarchical Layout**

- Tree view (parent → children)
- Use case: Project breakdown, org chart

#### B. **Circular Layout**

- Central node + rings of connected nodes
- Use case: Ego network (show "my tasks" at center)

#### C. **Timeline Layout**

- Nodes arranged left-to-right by creation date
- Use case: Chronological project history

---

### 12. **Gamification / Metrics**

#### A. **Knowledge Score**

- Points for: creating nodes, linking nodes, updating stale notes
- Leaderboard (if multi-user)

#### B. **Completion Badges**

- "Well-Connected" (10+ links)
- "Curator" (updated 20 nodes this week)
- "Explorer" (viewed 100+ nodes)

#### C. **Graph Health Dashboard**

- Metrics: avg connections per node, orphan count, staleness score
- Suggestions: "Link these 3 orphans to improve coherence"

---

### 13. **Presentation Mode**

- Click "Present" → full-screen graph
- Arrow keys navigate between connected nodes
- Auto-zoom to focused node
- Use case: Demo your knowledge base in meetings

---

### 14. **Mobile/Touch Support**

- Pinch-to-zoom
- Two-finger pan
- Long-press for context menu
- Optimized for tablet note-taking

---

## 🎨 Color & Visual Enhancements

### Node Type Colors (Already Implemented)

- Task: Green `#4CAF50`
- Concept: Blue `#2196F3`
- Decision: Orange `#FF9800`
- Question: Purple `#9C27B0`
- Resource: Cyan `#00BCD4`
- Person: Pink `#E91E63`

**Proposed additions:**

- **Idea:** Yellow `#FFEB3B`
- **Goal:** Deep Purple `#673AB7`
- **Note:** Gray `#607D8B`
- **Meeting:** Teal `#009688`

### Edge Styling

- **Dependency:** Solid arrow (A blocks B)
- **Reference:** Dashed line (A mentions B)
- **Parent/Child:** Thick line
- **Weak link:** Dotted line

### Node Size Variations

- Size by: degree (# connections), recency, importance (manual weight)
- Toggle between size modes

---

## 📊 Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| **Node dragging** | 🔥 High | Medium | P0 |
| **Drag-to-link** | 🔥 High | Medium | P0 |
| **Hotspots → left panel** | 🔥 High | Low | P0 |
| **Dark mode** | 🔥 High | Low | P0 |
| Path finder | High | Medium | P1 |
| Saved views | High | Low | P1 |
| AI auto-tagging | Medium | High | P2 |
| Timeline scrubber | Medium | High | P2 |
| Presentation mode | Medium | Medium | P2 |
| Export (PNG/SVG) | Low | Low | P3 |
| Collaboration (comments) | Low | High | P3 |

---

## 🛠️ Implementation Phases

### **Phase 31: Core Interactions (P0)**

1. Node dragging + position persistence
2. Drag-to-link edge creation
3. Hotspots moved to left panel
4. Dark mode + theme toggle

**Effort:** ~1 day (4-6 Ralph iterations)

---

### **Phase 32: Discovery & Navigation (P1)**

1. Path finder (shortest path between 2 nodes)
2. Saved views/bookmarks
3. Advanced filtering (visual query builder)
4. Subgraph extraction

**Effort:** ~2 days (8-10 iterations)

---

### **Phase 33: Intelligence & Polish (P2)**

1. AI-powered suggestions (auto-tags, orphan detection)
2. Timeline scrubber (temporal view)
3. Presentation mode
4. Graph health metrics

**Effort:** ~3 days (12-15 iterations)

---

## 🎬 Next Steps

1. **User review:** Prioritize features from this list
2. **Create Phase 31 tasks:** Break P0 features into Ralph task contracts
3. **Prototype:** Quick mockups for drag-to-link UX
4. **Iterate:** Ship Phase 31 → test → adjust → Phase 32

---

**Feedback welcome!** Which features excite you most?
