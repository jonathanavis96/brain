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
   - `brain/workers/IMPLEMENTATION_PLAN.md`

## Relationship to Skills

- Repo-local workflow + canonical artifacts live under `brain/docs/`.
- Broad reusable patterns live under `brain/skills/`.
