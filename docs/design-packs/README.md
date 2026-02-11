# Design Packs (Cross-Project Standard)

A **Design Pack** is a small set of canonical documents that give a UI/UX “design auditor” enough context to critique and plan improvements **without changing functionality**.

This Brain repo defines the standard so it can be reused across projects.

## Goals

- Provide a consistent home for design context: `docs/design-packs/<pack-name>/`
- Make design audits repeatable and reviewable (plan first, implement after approval)
- Prevent visual drift by forcing all design changes through `DESIGN_SYSTEM.md` tokens
- Support different project types (apps vs websites vs component libraries)

## Non-Goals

- This is not a replacement for a PRD.
- This does not introduce a new requirement to maintain “perfect documentation” before shipping.
- This does not change how implementation is done (Ralph/build agents still implement).

## Directory Convention

All design packs live here:

```text
docs/
  design-packs/
    README.md
    <pack-name>/
      ...pack files...
```

Pack names should be short, stable identifiers, e.g.:

- `website-template`
- `docs-site`

## Pack Types (flow inventory varies by type)

A “flow inventory” is required, but the artifact name depends on the project type.

### App Pack (multi-screen product UI)

**Required files:**

- `DESIGN_SYSTEM.md` — tokens and visual language (typography, spacing, colors, radii, shadows)
- `FRONTEND_GUIDELINES.md` — how UI is implemented (styling approach, component boundaries)
- `APP_FLOW.md` — screen/route inventory + user journeys (the flow inventory)
- `TECH_STACK.md` — constraints (animation libs, theming, CSS/tooling limitations)

**Optional (recommended) files:**

- `PRD.md` — functional requirements / must-not-change behaviors
- `LESSONS.md` — prior design mistakes/corrections to avoid regressions

### Website Pack (marketing site)

**Required files:**

- `DESIGN_SYSTEM.md`
- `FRONTEND_GUIDELINES.md`
- `SITE_MAP.md` — page inventory + primary actions (the flow inventory)
- `TECH_STACK.md`

**Optional:** `PRD.md`, `LESSONS.md`

### Library Pack (component library / design system)

**Required files:**

- `DESIGN_SYSTEM.md`
- `FRONTEND_GUIDELINES.md`
- `TECH_STACK.md`

**No flow inventory required** (since there are no screens/pages).

## Cortex “--design” mode (documented convention)

`--design` is an **intent flag**: the session is a design-only audit and planning session.

Example invocation:

```bash
# If installed to ~/bin via ./scripts/setup.sh
cortex --design

# Or directly:
bash cortex/cortex.bash --design
```

- Cortex/auditor **does not implement changes**.
- Output is a phased plan for review and approval.
- After approval, Cortex may translate approved items into Ralph task contracts in `/workers/IMPLEMENTATION_PLAN.md`.

### Outputs

Design audit outputs should be stored as artifacts (not mixed into skills):

```text
artifacts/
  design-audits/
    <pack-name>/
      <YYYY-MM-DD_HHMMSS>.md
```

### Approval + execution

- Approval is tracked via checkboxes in `/workers/IMPLEMENTATION_PLAN.md`.
- Ralph/build agents execute only the approved phase items.
- After each phase is implemented, re-review before continuing.

## Template Integration

Project templates should ship with a starter pack skeleton at:

- `docs/design-packs/_template/` (or `_template-app/`, `_template-website/` if you prefer)

New projects copy/rename the template folder to their pack name.

## Relationship to Skills

- **Skills** (under `skills/`) describe reusable patterns like “how to run a UI/UX audit.”
- **Design Packs** (under `docs/design-packs/`) hold project-specific design context.

## Required inputs (mirrors the premium audit prompt)

A complete Design Pack should make these inputs available (as files, not tribal knowledge):

1. `DESIGN_SYSTEM.md` — tokens and visual language (colors, typography, spacing, radii, shadows)
2. `FRONTEND_GUIDELINES.md` — implementation constraints (component structure, styling, state)
3. Flow inventory
   - App: `APP_FLOW.md` (screens/routes + journeys)
   - Website: `SITE_MAP.md` (pages + primary actions)
4. `PRD.md` (optional but recommended) — requirements + must-not-change behaviors
5. `TECH_STACK.md` — constraints (theming, motion, responsiveness, tooling)
6. `LESSONS.md` (optional but recommended) — regressions, mistakes, prior decisions

Progress/completion context should come from:

- `workers/ralph/THUNK.md` — append-only completion log

## See Also

- `cortex/docs/UI_UX_AUDIT_PROMPT_PREMIUM.md` — premium audit prompt + protocol (copy/paste)
- `workers/IMPLEMENTATION_PLAN.md` — task contracts and approval state
- `workers/ralph/THUNK.md` — append-only completion log
