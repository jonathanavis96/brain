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

## Phase 0-Warn: Verifier Warnings

- [ ] **WARN.MD031.workers-impl** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md
  - **AC:** `markdownlint workers/IMPLEMENTATION_PLAN.md` passes (no MD031 errors)
  - **Context:** 16 instances of code blocks missing blank lines before/after (lines 54, 68, 81, 90, 103, 116, 142, 146, 158, 178, 186, 192, 215, 234, 242, 244)

- [ ] **WARN.MD031.cortex-impl** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md
  - **AC:** `markdownlint cortex/IMPLEMENTATION_PLAN.md` passes (no MD031 errors)
  - **Context:** 16 instances of code blocks missing blank lines before/after (same line numbers as workers/)

## Phase 30: Brain Map UX Refinements (2 hours) 🎨

**Context:** After Phase 29 quick wins, polish the graph navigation and rendering for production quality.

**Goal:** Professional graph UX with proper navigation controls, smart label rendering, and clean layout.

**Success Criteria:**

- User never "loses" position in graph (fit-to-screen button or minimap)
- Labels render intelligently (hover-only mode, zoom-based sizing)
- Inspector layout is clean (no overlapping panels)

---

### Task 30.1: Proper cluster mode switching

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

- [x] **30.2.1** Add "Fit to Screen" button
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

- [x] **30.2.2** Add zoom controls (+/- buttons)
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
