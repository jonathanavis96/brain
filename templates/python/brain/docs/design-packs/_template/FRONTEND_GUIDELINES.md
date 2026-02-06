# FRONTEND_GUIDELINES

## What this file is

A **wiring diagram** for how UI is implemented in this repo:

- where components live
- how styling works
- how tokens are referenced
- what conventions are “hard rules” vs preferences

This is the doc that prevents “pretty but unmergeable” audit suggestions.

## Setup (how to start)

1. Describe the frontend architecture in **one paragraph**.
2. List the styling system (CSS modules/Tailwind/styled-components/etc).
3. Document where the token source-of-truth is (link to the file).

## Ask the user (minimum interview)

- What frontend framework + router are you using?
- How are components organized (by feature, by layer, by route)?
- How is state managed (local, Redux/Zustand, server-state lib)?
- What’s the accessibility baseline and what’s already tested?
- Any performance budgets (bundle size, LCP targets)?

## Required sections (layout contract)

### 1) Project structure (UI)

- Component directory structure
- Page/screen structure (if applicable)
- Shared UI primitives (buttons, inputs, modals)

### 2) Styling + theming

- Styling approach
- How to do responsive design
- Light/dark mode approach (or explicitly “no dark mode”)

### 3) Token usage rules

- Where tokens live
- How components reference tokens
- What is forbidden (inline styles, hardcoded hex, ad-hoc spacing)

### 4) Accessibility requirements

- Keyboard navigation + focus states
- Color contrast expectations
- ARIA patterns used in the codebase

## Completeness checklist

- [ ] A new contributor can add a component using the documented patterns
- [ ] The token source-of-truth is linked
- [ ] Accessibility rules are explicit (not implied)
