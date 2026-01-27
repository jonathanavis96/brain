# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-27 13:35:00

**Current Status:** Phase 29-30 active (Brain Map UX fixes)

**Recent Completions:**

- **Phase 28: Template Maintenance (✅ COMPLETED)** - Audited templates for drift, verified no critical issues
- **Phase 27: Skills Knowledge Base Expansion (✅ COMPLETED)** - Reviewed GAP_BACKLOG, promoted semantic code review skill
- **Phase 26: Environment & Testing Infrastructure (✅ COMPLETED)** - Brain Map testing setup and documentation
- **Phase 25: Brain Map (✅ COMPLETED)** - Full MVP with backend API, frontend UI, comprehensive tests
- **Phase 24: Template Drift Alignment (✅ COMPLETED)**
- **Phase 23: Loop Efficiency & Correctness Fixes (✅ COMPLETED)**

**Active Focus:**

- Phase 29: Brain Map UX Quick Wins (zoom reset, label density, hotspots overlay)
- Phase 30: Brain Map UX Refinements (proper navigation, custom renderers, layout polish)

<!-- Cortex adds new Task Contracts below this line -->

## Phase 29: Brain Map UX Quick Wins (30 min) 🔥

**Context:** User testing revealed three critical UX bugs blocking usability:

1. **Zoom reset bug** - Graph rebuilds on every zoom tick, resetting camera position
2. **Label spaghetti** - All labels always visible, causing unreadable overlap
3. **Hotspots overlay** - Fixed-position panel covers form input fields

**Goal:** Fast tactical fixes to make the graph navigable and usable.

**Success Criteria:**

- User can zoom out without graph resetting
- Labels readable (auto-hide when nodes too small on screen)
- Hotspots panel doesn't block ID/Title/Type/Status fields

---

### Task 29.1: Fix zoom reset bug

- [ ] **29.1.1** Remove `zoomLevel` from `useEffect` dependency array in `GraphView.jsx`
  - **Goal:** Stop graph rebuild on every zoom event
  - **File:** `app/brain-map/frontend/src/GraphView.jsx` line 282
  - **Change:** Remove `zoomLevel` from deps array: `[filteredData, clusterData, onNodeSelect, expandedClusters, showRecencyHeat]`
  - **AC:** After change, user can scroll wheel zoom in/out without graph resetting position
  - **Verification:** Manual test - zoom out slowly, confirm camera position doesn't jump
  - **If Blocked:** If cluster switching still feels janky, see 30.1.1 for derived state approach

- [ ] **29.1.2** Add derived state for cluster mode toggle
  - **Goal:** Rebuild graph only when crossing cluster threshold (0.5), not on every zoom tick
  - **Implementation:**
    ```jsx
    const [showClusters, setShowClusters] = useState(false)
    
    // In camera 'updated' handler (line 263-266):
    sigma.getCamera().on('updated', () => {
      const ratio = sigma.getCamera().ratio
      setZoomLevel(ratio)
      const shouldCluster = ratio < ZOOM_THRESHOLDS.CLUSTER_VIEW
      if (shouldCluster !== showClusters) {
        setShowClusters(shouldCluster)
      }
    })
    
    // Then use showClusters in deps instead of zoomLevel
    ```
  - **AC:** Graph rebuilds only when crossing 0.5 zoom threshold (cluster mode on/off)
  - **Verification:** Console.log in useEffect - should fire only at 0.5 crossing, not every zoom tick
  - **If Blocked:** Keep 29.1.1 only; this task is optional polish

---

### Task 29.2: Fix label overlap (hide small labels)

- [ ] **29.2.1** Add `labelRenderedSizeThreshold` to Sigma config
  - **Goal:** Auto-hide labels when nodes are too small on screen
  - **File:** `app/brain-map/frontend/src/GraphView.jsx` line 231-237
  - **Change:**
    ```jsx
    const sigma = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      labelRenderedSizeThreshold: 8,  // Hide labels for nodes < 8px
      defaultNodeColor: '#999',
      defaultEdgeColor: '#ccc',
      labelFont: 'system-ui, sans-serif',
      labelSize: 12
    })
    ```
  - **AC:** When zoomed out, only large nodes show labels; when zoomed in, all labels visible
  - **Verification:** Zoom out until nodes are ~5-10px → labels disappear; zoom in → labels reappear
  - **If Blocked:** Try threshold values 6-12 to find sweet spot

---

### Task 29.3: Fix Hotspots panel overlay

- [ ] **29.3.1** Make Hotspots collapsible using `<details>` element
  - **Goal:** User can collapse Hotspots to reveal form fields below
  - **File:** `app/brain-map/frontend/src/InsightsPanel.jsx`
  - **Change:** Wrap Hotspots section (lines ~45-80) in:
    ```jsx
    <details open>
      <summary style={{ 
        cursor: 'pointer', 
        fontWeight: 600, 
        fontSize: '16px',
        padding: '8px 0',
        userSelect: 'none'
      }}>
        🔥 Hotspots
      </summary>
      {/* existing hotspots content */}
    </details>
    ```
  - **AC:** User can click "🔥 Hotspots" to collapse/expand section
  - **Verification:** Manual test - collapse Hotspots → form fields fully visible
  - **If Blocked:** Alternative - move Hotspots to bottom of inspector panel (reorder DOM)

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

- [ ] **30.1.1** Refactor cluster rebuild to use `showClusters` boolean
  - **Goal:** Clean separation between zoom tracking and cluster mode switching
  - **Implementation:** Move cluster decision logic to separate `useMemo`:
    ```jsx
    const showClusters = useMemo(() => {
      return zoomLevel < ZOOM_THRESHOLDS.CLUSTER_VIEW
    }, [zoomLevel])
    ```
  - **AC:** Graph rebuild fires only when `showClusters` boolean flips
  - **Verification:** Add console.log in graph rebuild effect - fires only at 0.5 threshold crossing
  - **If Blocked:** 29.1.2 already handles this; skip if satisfied

---

### Task 30.2: Navigation controls (fit-to-screen + reset)

- [ ] **30.2.1** Add "Fit to Screen" button
  - **Goal:** User can recenter graph if they pan away and lose context
  - **Implementation:** Add button to bottom-right controls (near cluster hint):
    ```jsx
    <button 
      onClick={() => {
        if (sigmaRef.current) {
          sigmaRef.current.getCamera().animatedReset()
        }
      }}
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      🎯 Fit to Screen
    </button>
    ```
  - **AC:** Click button → graph zooms out to show all nodes
  - **Verification:** Pan far away from center → click Fit → all nodes visible
  - **If Blocked:** Use `sigma.getCamera().setState({ x: 0, y: 0, ratio: 1 })` as simpler alternative

- [ ] **30.2.2** Add zoom controls (+/- buttons)
  - **Goal:** Explicit zoom in/out buttons for users without scroll wheel
  - **Implementation:** Add buttons next to Fit button:
    ```jsx
    <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '4px' }}>
      <button onClick={() => sigma.getCamera().animatedZoom({ duration: 300 })}>➕</button>
      <button onClick={() => sigma.getCamera().animatedUnzoom({ duration: 300 })}>➖</button>
      <button onClick={() => sigma.getCamera().animatedReset()}>🎯</button>
    </div>
    ```
  - **AC:** +/- buttons zoom in/out smoothly
  - **Verification:** Click + 3 times → zooms in; click - 3 times → zooms out
  - **If Blocked:** Lower priority; skip if time constrained

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

- [ ] **30.3.1** Implement hover-only label mode
  - **Goal:** Show labels only for hovered/selected nodes (alternative to threshold)
  - **Implementation:** Custom label reducer:
    ```jsx
    const sigma = new Sigma(graph, containerRef.current, {
      // ...
      labelRenderer: (context, data, settings) => {
        if (data.highlighted || data.hovered) {
          // Render label
        }
      }
    })
    
    // Add hover tracking:
    sigma.on('enterNode', ({ node }) => {
      graph.setNodeAttribute(node, 'hovered', true)
      sigma.refresh()
    })
    sigma.on('leaveNode', ({ node }) => {
      graph.setNodeAttribute(node, 'hovered', false)
      sigma.refresh()
    })
    ```
  - **AC:** Labels appear only when mouse hovers over node
  - **Verification:** Move mouse over nodes → labels appear; move away → labels disappear
  - **If Blocked:** Lower priority; 29.2.1 threshold is sufficient for MVP

- [ ] **30.3.2** Zoom-based label sizing
  - **Goal:** Scale label font size proportionally with zoom level
  - **Implementation:**
    ```jsx
    labelSize: Math.max(10, Math.min(16, 12 * zoomLevel))
    ```
  - **AC:** Labels grow/shrink as user zooms in/out
  - **Verification:** Zoom in → labels get bigger; zoom out → labels get smaller
  - **If Blocked:** Skip; static size is fine for MVP

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
