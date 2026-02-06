# TECH_STACK

## What this file is

A constraints document: what’s possible, what’s expensive, and what tools are available.

A design audit that ignores this file tends to propose changes that can’t be implemented.

## Setup (how to start)

1. List the frontend stack (framework, build, styling).
2. List any UI libraries (component libs, icon sets, charts).
3. Record constraints (browser support, perf budgets, accessibility baseline).

## Ask the user (minimum interview)

- What framework + version(s) are you on?
- What’s the build tool and deploy target?
- What styling approach is in use?
- Any motion/animation libraries?
- Any constraints: SSR, legacy browser support, mobile-first?

## Required sections (layout contract)

### 1) Frontend

- Framework
- Routing
- Build tooling
- Styling/theming
- UI libraries
- Icons
- Motion/animation
- Form handling + validation

### 2) Testing

- Unit test stack
- Component test stack
- E2E test stack (if any)

### 3) Constraints

- Performance budgets (if any)
- Accessibility baseline
- Browser/device support
- “Must not change” constraints (behavior, information architecture)

## Completeness checklist

- [ ] All UI-affecting dependencies are listed
- [ ] Constraints are explicit (not tribal knowledge)
