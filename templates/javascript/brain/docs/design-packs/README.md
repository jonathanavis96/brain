# Design Packs (Project Standard)

This project uses **Design Packs** to store canonical UI/UX context and to run design-only audits
before implementation.

## Where packs live

```text
brain/docs/design-packs/
  README.md
  <pack-name>/
    DESIGN_SYSTEM.md
    FRONTEND_GUIDELINES.md
    APP_FLOW.md
    TECH_STACK.md
    (optional) PRD.md
    (optional) LESSONS.md
```

## How to use

1. Copy `brain/docs/design-packs/_template/` to a new pack folder name:
   - e.g. `brain/docs/design-packs/my-app/`
2. Fill out each file using its built-in **setup + questions + required sections** guidance.
3. Run a design audit session (design-only): produce an audit report under:

```text
brain/artifacts/design-audits/<pack-name>/<YYYY-MM-DD_HHMMSS>.md
```

4. After approval, translate approved items into task contracts in:
   - `workers/IMPLEMENTATION_PLAN.md`

## Required inputs (mirrors the premium audit prompt)

A complete pack should provide:

1. `DESIGN_SYSTEM.md`
2. `FRONTEND_GUIDELINES.md`
3. Flow inventory (`APP_FLOW.md` for apps, `SITE_MAP.md` for websites)
4. `PRD.md` (optional but recommended)
5. `TECH_STACK.md`
6. `LESSONS.md` (optional but recommended)

Progress/completion context should come from:

- `brain/workers/ralph/THUNK.md`

## Relationship to Skills

- Repo-local workflow + canonical artifacts live under `brain/docs/`.
- Broad reusable patterns live under `brain/skills/`.

## See Also

- `brain/docs/design/UI_UX_AUDIT_PROMPT_PREMIUM.md` — premium UI/UX audit prompt + protocol (design-only)
