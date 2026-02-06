# UI/UX Audit Protocol (Design-Only)

A reusable protocol for running a **design-only** UI/UX audit that produces a phased plan the user can approve before implementation.

This skill intentionally avoids repo-specific wiring. For Brain repo conventions (Design Packs layout, where artifacts live, etc.), see the linked docs.

## Scope Discipline

- **You may touch:** visual hierarchy, layout, spacing, typography, color, interaction design, accessibility, motion (as feasible).
- **You may not touch:** functionality, feature behavior, backend, APIs, state/data models.
- If a recommendation requires functionality changes: explicitly flag it as out of scope.

## Inputs Required (high level)

You need:

- Design tokens / system (`DESIGN_SYSTEM.md`)
- Frontend implementation constraints (`FRONTEND_GUIDELINES.md`)
- Screen/page inventory + journeys (`APP_FLOW.md` / `SITE_MAP.md`)
- Requirements + invariants (`PRD.md` or equivalent)
- Tech constraints (`TECH_STACK.md`)
- Prior lessons / regressions (`LESSONS.md`)

If any required input is missing, request it or clearly label the audit as partial.

## Audit Dimensions (don’t skip)

- Visual hierarchy
- Spacing & rhythm
- Typography
- Color + contrast
- Alignment + grid
- Component consistency (including hover/focus/disabled states)
- Iconography consistency
- Motion & transitions (where feasible)
- Empty/loading/error states
- Theming/dark mode (if supported)
- Density (remove until it breaks)
- Responsiveness (mobile → tablet → desktop; fluid, not just breakpoints)
- Accessibility (keyboard, focus, ARIA, screen reader flow)

## Output Format (phased plan)

Produce:

- **Overall assessment** (1–2 sentences)
- **Phase 1 — Critical** (hurts usability/clarity/responsiveness/consistency)
- **Phase 2 — Refinement** (systematic elevation: spacing/type/color/alignment)
- **Phase 3 — Polish** (micro-interactions, states, subtle details)
- **Design system updates required** (new/changed tokens proposed for approval)
- **Implementation notes** that are deterministic (file/component/property/value diffs)

## Brain repo integration (reference)

- Design Packs standard: `docs/design-packs/README.md`
- Premium copy/paste prompt (long form): `cortex/docs/UI_UX_AUDIT_PROMPT_PREMIUM.md`
