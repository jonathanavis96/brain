# Design Docs (Project-Local)

This folder contains **project-local design prompts and protocols** used for design-only audits.

## Contents

- `UI_UX_AUDIT_PROMPT_PREMIUM.md` — premium UI/UX audit prompt + protocol (design-only)

## How to use

- Run a design-only audit session (no implementation).
- Use the Design Packs as inputs:
  - `brain/docs/design-packs/<pack-name>/DESIGN_SYSTEM.md`
  - `brain/docs/design-packs/<pack-name>/FRONTEND_GUIDELINES.md`
  - `brain/docs/design-packs/<pack-name>/APP_FLOW.md` (or `SITE_MAP.md` for websites)
  - `brain/docs/design-packs/<pack-name>/TECH_STACK.md`

Audit outputs should be saved under:

```text
brain/artifacts/design-audits/<pack-name>/<YYYY-MM-DD_HHMMSS>.md
```
