# React Best Practices Index

## Overview

This directory contains **45 performance optimization rules** for React and Next.js applications, sourced from Vercel Engineering guidelines. Rules are organized by category for efficient agent lookup.

## When to Consult These Rules

Agents should reference these guidelines when:
- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size, load times, or rendering performance
- Investigating re-render or hydration problems

## Rule Categories

### 🔄 Async & Waterfall Elimination (7 rules)
Patterns for parallel data fetching and eliminating sequential dependencies.

- `async-api-routes.md` - Parallel API route operations
- `async-defer-await.md` - Deferring awaits for parallelism
- `async-dependencies.md` - Breaking async dependency chains
- `async-parallel.md` - Parallel data fetching patterns
- `async-suspense-boundaries.md` - Strategic Suspense boundary placement

### 📦 Bundle Optimization (5 rules)
Techniques for reducing bundle size and improving code splitting.

- `bundle-barrel-imports.md` - Avoiding barrel file imports
- `bundle-conditional.md` - Conditional component loading
- `bundle-defer-third-party.md` - Deferring third-party scripts
- `bundle-dynamic-imports.md` - Dynamic imports for code splitting
- `bundle-preload.md` - Preloading critical resources

### 🖥️ Server Performance (4 rules)
Server-side optimization patterns for Next.js and React Server Components.

- `server-cache-lru.md` - LRU caching strategies
- `server-cache-react.md` - React cache() API usage
- `server-parallel-fetching.md` - Parallel server-side fetching
- `server-serialization.md` - Efficient data serialization

### 💻 Client-Side Data Fetching (2 rules)
Optimizing client-side data operations.

- `client-event-listeners.md` - Efficient event listener patterns
- `client-swr-dedup.md` - SWR deduplication strategies

### 🔁 Re-render Optimization (6 rules)
Preventing unnecessary component re-renders.

- `rerender-defer-reads.md` - Deferring reads to prevent cascading renders
- `rerender-dependencies.md` - Minimizing hook dependencies
- `rerender-derived-state.md` - Computing values during render vs state
- `rerender-lazy-state-init.md` - Lazy initialization of expensive state
- `rerender-memo.md` - Strategic memo/useMemo/useCallback usage
- `rerender-transitions.md` - Using transitions for non-urgent updates

### 🎨 Rendering & DOM (7 rules)
DOM manipulation and rendering performance.

- `rendering-activity.md` - Activity detection patterns
- `rendering-animate-svg-wrapper.md` - SVG animation optimization
- `rendering-conditional-render.md` - Conditional rendering patterns
- `rendering-content-visibility.md` - CSS content-visibility optimization
- `rendering-hoist-jsx.md` - Hoisting static JSX
- `rendering-hydration-no-flicker.md` - Preventing hydration flicker
- `rendering-svg-precision.md` - SVG precision optimization

### ⚡ JavaScript Micro-Optimizations (12 rules)
Low-level JavaScript performance patterns.

- `js-batch-dom-css.md` - Batching DOM and CSS operations
- `js-cache-function-results.md` - Function result caching
- `js-cache-property-access.md` - Caching property lookups
- `js-cache-storage.md` - LocalStorage/SessionStorage caching
- `js-combine-iterations.md` - Combining array iterations
- `js-early-exit.md` - Early exit patterns
- `js-hoist-regexp.md` - Hoisting RegExp objects
- `js-index-maps.md` - Using index maps for lookups
- `js-length-check-first.md` - Length checks before iteration
- `js-min-max-loop.md` - Math.min/max outside loops
- `js-set-map-lookups.md` - Set/Map for O(1) lookups
- `js-tosorted-immutable.md` - Immutable sorting with toSorted()

### 🔬 Advanced Patterns (2 rules)
Advanced React patterns for specific scenarios.

- `advanced-event-handler-refs.md` - Event handler ref patterns
- `advanced-use-latest.md` - useLatest hook pattern

### 📋 Meta Files (2 files)
Template and section definitions for rule creation.

- `_template.md` - Template for creating new rules
- `_sections.md` - Standard sections for rule documentation

## Additional Resources

- **[HOTLIST.md](./HOTLIST.md)** - Quick reference of most commonly applicable rules
- **[react-performance-guidelines.md](./react-performance-guidelines.md)** - Comprehensive guide with detailed examples

## Usage Tips for Agents

1. **Start with the HOTLIST** - Contains the 8-12 most frequently applicable rules
2. **Use category prefixes** - Rules are named with category prefixes for easy filtering
3. **Reference specific rules** - Link to individual rule files when providing guidance
4. **Don't read all rules** - Only expand rules relevant to the current task
5. **Check _template.md** - If creating new rules or understanding rule structure
