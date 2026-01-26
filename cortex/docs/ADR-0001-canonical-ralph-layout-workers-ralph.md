# ADR-0001: Canonical Ralph layout is `workers/ralph/`

Date: 2026-01-26 23:02:15
Status: Accepted
Owners: Jono (Cortex), Ralph (forensics)

## Context

We have drift between:

- templates assuming `project/ralph/` (single-level), and
- Brain using `project/workers/ralph/` (two-level)

Multiple scripts/docs in Brain reference `workers/IMPLEMENTATION_PLAN.md`, `workers/ralph/THUNK.md`,
and other workers-root paths. Supporting both layouts via auto-detect would require branching logic
across scripts and docs and still leaves ambiguity about the canonical “source of truth”.

## Decision

Templates MUST treat `workers/ralph/` as the canonical layout (A1).

When backporting, prefer aligning templates to Brain’s layout rather than preserving older `ralph/`
assumptions.

## Consequences

- Templates will scaffold repos into `workers/ralph/`.
- Any hardcoded `ralph/` paths in templates must be updated to `workers/ralph/`.
- Scripts and docs must avoid Brain-only relative paths (no `../../brain/...` style references).
- Utilities that depend on verifier outputs (e.g. `.verify/latest.txt`) should be located under the
  canonical workers layout.

## Classification rules for drift

Use this decision tree to classify drift items:

- If a difference affects **boot / correctness / stability** → template it (or template a safe default).
- If a difference is **convenience tooling** → template it if layout-agnostic and not brain-specific.
- If a difference is **brain-only workflow glue** → keep brain-only and explicitly mark as intentional.
- If intent is unknown → list it with a concrete question to resolve before backporting.

## Resolved follow-ups (initial set)

These were resolved during the template drift review that motivated this ADR:

- `RALPH.md`: keep the concept, but rewrite to match the `workers/ralph/` layout and generic paths.
- `PROMPT_cerebras.md`: template as an optional variant; scripts must fall back to `PROMPT.md` if missing.
- `ralph.sh` wrapper: template as a per-repo convenience entrypoint (not a global single-project link).
- `render_ac_status.sh`: treat as an optional utility; consider templating after A1 path normalization.
- `HUMAN_REQUIRED.md`: update template paths to `workers/ralph/`.
- `pr-batch.sh`: keep placeholder branch approach in templates; don’t hardcode Brain’s branch name.
