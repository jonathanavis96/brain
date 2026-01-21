# React Best Practices Hotlist

## Purpose

This hotlist contains the **8-12 most commonly applicable rules** from the full rule set. Agents should consult this list first before diving into the complete INDEX or individual rule files.

## Selection Criteria

Rules were selected based on:
- **Frequency** - How often the pattern applies in typical React/Next.js development
- **Impact** - Performance improvement potential
- **Common mistakes** - Patterns that developers frequently get wrong
- **Broad applicability** - Useful across many component types and scenarios

---

## 🔥 Top Priority Rules

### 1. `async-parallel.md` - Parallel Data Fetching
**Why**: Eliminates waterfalls, often the #1 performance bottleneck in React apps. Apply whenever multiple data sources are needed.

### 2. `rerender-memo.md` - Strategic Memoization
**Why**: Prevents expensive re-renders in child components. Essential for any non-trivial component tree with frequent parent updates.

### 3. `bundle-dynamic-imports.md` - Dynamic Imports
**Why**: Reduces initial bundle size significantly. Apply to routes, modals, tabs, and conditionally rendered heavy components.

### 4. `rerender-dependencies.md` - Minimize Hook Dependencies
**Why**: Reduces unnecessary effect runs and re-renders. Common source of performance bugs in useEffect/useMemo/useCallback.

### 5. `rendering-hoist-jsx.md` - Hoist Static JSX
**Why**: Prevents recreating identical objects on every render. Simple fix with immediate impact on re-render performance.

### 6. `server-parallel-fetching.md` - Server Parallel Fetching
**Why**: Critical for Next.js Server Components. Eliminates sequential data fetching on the server, reducing TTFB.

### 7. `bundle-barrel-imports.md` - Avoid Barrel Imports
**Why**: Prevents importing entire libraries when only small parts are needed. Common mistake with lodash, date-fns, icons, etc.

### 8. `rerender-derived-state.md` - Compute During Render
**Why**: Prevents state synchronization bugs and unnecessary renders. Often over-engineered with useState/useEffect when simple computation suffices.

### 9. `async-suspense-boundaries.md` - Strategic Suspense Boundaries
**Why**: Improves perceived performance by showing partial content faster. Essential for good UX in Server Component apps.

### 10. `rendering-conditional-render.md` - Conditional Rendering
**Why**: Prevents expensive component mounting when not visible. Applies to tabs, accordions, modals, and any conditional UI.

---

## Quick Reference by Scenario

### 📥 Fetching Data?
→ Check: `async-parallel.md`, `server-parallel-fetching.md`, `async-suspense-boundaries.md`

### 🐌 Slow Renders?
→ Check: `rerender-memo.md`, `rendering-hoist-jsx.md`, `rerender-derived-state.md`

### 📦 Large Bundle?
→ Check: `bundle-dynamic-imports.md`, `bundle-barrel-imports.md`, `bundle-defer-third-party.md`

### 🔄 Too Many Re-renders?
→ Check: `rerender-dependencies.md`, `rerender-memo.md`, `rerender-transitions.md`

### ⚡ Next.js Server Components?
→ Check: `server-parallel-fetching.md`, `async-suspense-boundaries.md`, `server-cache-react.md`

---

## When to Go Deeper

If none of these hotlist rules address your specific scenario, consult:
1. **[INDEX.md](./INDEX.md)** - Full categorized rule list
2. **[react-performance-guidelines.md](./react-performance-guidelines.md)** - Comprehensive guide with examples
3. **`rules/` directory** - Individual rule files for deep dives

---

## Anti-Pattern: Don't Do This

❌ **Don't scan all 45 rules looking for solutions**
- Token-inefficient and slow
- Most problems are covered by these 10 rules

✅ **Do use this hierarchical approach**
1. Check HOTLIST first
2. If not covered, scan INDEX categories
3. Only then read specific rule files
