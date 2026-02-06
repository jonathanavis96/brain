# DESIGN_SYSTEM

## What this file is

The canonical **visual language + token system** for the project.

**Rule of thumb:** if a UI value is visible (color, size, radius, spacing, shadow), it should come
from a token defined here.

## Setup (how to start)

1. Pick where tokens live in code (examples):
   - CSS variables (e.g. `src/styles/tokens.css`)
   - Tailwind config (e.g. `tailwind.config.js`)
   - Theme object (e.g. `theme.ts`)
2. Decide the naming scheme once (and stick to it):
   - Colors: `--color-surface-1`, `--color-text-muted`, `--color-semantic-danger`
   - Spacing: `--space-1..--space-10`
   - Radius: `--radius-sm/md/lg`
3. Record the scheme here **before** implementing new UI work.

## Ask the user (minimum interview)

- Do you have an existing brand palette / typography guidance?
- Light mode only, or light + dark?
- Any accessibility requirements (WCAG level, contrast constraints)?
- Which UI elements are “must not change” visually (brand anchors)?
- Do you prefer a compact or spacious layout density?

## Required sections (layout contract)

### 1) Token sets

- **Colors**
  - Surfaces/backgrounds
  - Text
  - Borders/dividers
  - Semantic (success/warn/error/info)
- **Typography**
  - Font families
  - Scale (sizes/line-height/weights)
- **Spacing + layout**
  - Spacing scale
  - Container widths / breakpoints
- **Radii + shadows**
  - Radii scale
  - Shadow scale
- **Motion (if applicable)**
  - Durations/easings
  - Reduced motion rules

### 2) Token rules

- “No hardcoded values” policy (define allowed exceptions)
- How to introduce a new token (review step)
- Deprecation policy (how old tokens get removed)

## Completeness checklist

- [ ] Tokens exist for the common UI primitives (surface/text/border/semantic)
- [ ] There is a clear naming scheme and it matches the code
- [ ] Dark mode behavior is specified (even if it’s “not supported”)
- [ ] Accessibility constraints are stated (contrast, focus visibility)
