# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-27 07:10:00

**Current Status:** Phase 24 (Template Drift) COMPLETED. Phase 25 (Brain Map MVP) in progress. All current tasks complete - ready for planning.

**Active Phases:**

- **Phase 24: Template Drift Alignment (✅ COMPLETED - all tasks)**
- **Phase 23: Loop Efficiency & Correctness Fixes (✅ COMPLETED - 6/6 tasks)**
- **Phase 25: Brain Map (🔄 IN PROGRESS - MVP implementation)**
- Phase 21: Token Efficiency & Tool Consolidation (1 task remaining)
- Phase CR-6: CodeRabbit PR6 Fixes (✅ COMPLETED)
- Phase POST-CR6: Prevention Systems (✅ COMPLETED - all 7 tasks)
- Phase 10: RovoDev Parser & Observability (✅ COMPLETED - all 3 tasks)
- Phase 11: Thread Persistence & Search (✅ COMPLETED - all 4 tasks)
- Phase 12: Observability Improvements (🔄 IN PROGRESS - 1/4 tasks complete)
- Phases 13-20: Meta-tooling & Self-improvement (queued)

<!-- Cortex adds new Task Contracts below this line -->

## Phase 25: Brain Map (MVP-first)

**Source:** `docs/brain-map/brain-map-implementation-plan.md`


### MVP cutline checklist

MVP is considered "done" when all items below are true:


### Phase 25.1: MVP

> Ordering intent: scaffolding → parsing/indexing → API → UI integration → UX polish.


- **Verification (once scaffolding exists):**
  - Backend: `cd app/brain-map/backend && python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
  - `curl -s http://localhost:8000/health | jq .`
  - Frontend: `cd app/brain-map/frontend && npm install && npm run dev -- --host 0.0.0.0 --port 5173`
- **Risk notes:** repo toolchain differences (uv/poetry/pip). Keep minimal.
- **If Blocked:** If Python packaging is unclear, start with `requirements.txt` + `python -m venv` and document.


- **Verification:**
  - Add a few sample notes under `app/brain-map/notes/` and verify discovery output via a temporary CLI route or test.
- **Risk notes:** Path handling under WSL2; enforce repo-root-relative paths.
- **If Blocked:** Add minimal unit test coverage to prove deterministic ordering.

- **Verification:**
  - `curl -s "http://localhost:8000/search?q=brain&limit=5&offset=0" | jq .`
- **Risk notes:** Relevance scoring variability; document deterministic tie-breakers.
- **If Blocked:** Implement simple substring search on title/tags for MVP, keeping API shape identical.


  - [ ] Unknown id returns 404 with canonical error shape.
  - [ ] Response includes `node` and `body_md` fields.
  - **Verification:**
    - `curl -s http://localhost:8000/node/<id> | jq .`
  - **Risk notes:** storing body separately from frontmatter; ensure round-trip.
  - **If Blocked:** Return `body_md` empty string in MVP, but preserve schema.

    - [ ] Returns 201 with created id and source_path.
    - [ ] Duplicate id conflicts return 409 with canonical error.
    - [ ] System never corrupts markdown files.
  - **Verification:**
    - `curl -s -X POST http://localhost:8000/node -H 'Content-Type: application/json' -d '{"title":"Test","type":"Inbox"}' | jq .`
  - **Risk notes:** choosing filenames: must not be identity; ensure deterministic naming strategy.
  - **If Blocked:** Use timestamp-based filename under `app/brain-map/notes/inbox/`.

    - [ ] Attempt to change id is rejected (400 validation error).
    - [ ] Unknown id returns 404.
    - [ ] Atomic write guarantees preserved.
  - **Verification:**
    - `curl -s -X PUT http://localhost:8000/node/<id> -H 'Content-Type: application/json' -d '{"title":"Updated"}' | jq .`
  - **Risk notes:** round-tripping unknown frontmatter keys.
  - **If Blocked:** For MVP, do not preserve unknown fields on write but emit a warning and record as technical debt (must be resolved before V1).

    - [ ] Same inputs + same index produce identical markdown output (stable ordering).
    - [ ] Unknown selection id returns 404.
    - [ ] Writing respects atomic file write.
  - **Verification:**
    - `curl -s -X POST http://localhost:8000/generate-plan -H 'Content-Type: application/json' -d '{"selection":["<id>"],"depth":2,"output":{"write":false}}' | jq .markdown`
  - **Risk notes:** graph traversal ordering; must sort neighbors deterministically.
  - **If Blocked:** Start with depth=0 (selection-only) but keep request fields; expand traversal next.


    - [ ] Editing title persists to disk (markdown file) and updates `updated_at`.
    - [ ] UI surfaces validation errors using the canonical error shape.
  - **Verification:**
    - Manual: edit a node, reload UI, confirm persisted.
  - **Risk notes:** form state vs graph state synchronization.
  - **If Blocked:** Force a full graph refresh after save (simpler, slower).

    - [ ] Ctrl+K opens palette.
    - [ ] Selecting a result focuses and selects the node.
  - **Verification:**
    - Manual.
  - **Risk notes:** keyboard shortcuts in browser.
  - **If Blocked:** Provide a search input field in header as fallback.

    - [ ] Toggle changes node rendering.
    - [ ] Recently updated nodes appear hotter.
  - **Verification:**
    - Manual: edit a node and see its heat increase.
  - **Risk notes:** visual tuning.
  - **If Blocked:** Use node size as a proxy for heat in MVP.

    - [ ] User can select nodes and generate plan.
    - [ ] Markdown preview matches backend response.
  - **Verification:**
    - Manual.
  - **Risk notes:** selection semantics.
  - **If Blocked:** Start with single-node plan generation.

### Phase 25.2: V1


### Phase 25.3: V2


## Task dependency notes

Lightweight ordering constraints (non-exhaustive):

- 25.1.1 must precede all other tasks.
- 25.1.2 and 25.1.3 must precede 25.1.4 (index rebuild).
- 25.1.4 must precede 25.1.5, 25.1.6, 25.1.7, 25.1.10 (API endpoints relying on index).
- 25.1.6 and 25.1.7 must precede 25.1.11 and 25.1.12 (UI data dependencies).
- 25.1.5 must precede 25.1.13 (search palette).
- 25.1.10 must precede 25.1.15 (generate plan wizard).

---


## Phase 24: Template Drift Alignment (A1)

**Goal:** Align `templates/ralph/` to the accepted canonical Ralph layout `workers/ralph/` (ADR-0001) and backport the highest-impact, lowest-risk drift items from Brain `workers/ralph/` into templates in small, dependency-ordered batches.

**Reference Inputs:**

- `TEMPLATE_DRIFT_REPORT.md`
- `cortex/docs/ADR-0001-canonical-ralph-layout-workers-ralph.md`

**Ordering / Dependencies (execute in order unless noted):**

1. **24.1.1** Normalize template docs to canonical `workers/ralph/` (A1)
2. **24.1.2** Normalize template scripts to canonical `workers/ralph/` (A1)
3. **24.1.3** Audit templates for legacy `ralph/` paths and Brain-only path coupling
4. **24.2.1** Template `new-project.sh` (bootstrapping)
5. **24.3.1** Template `config/non_cacheable_tools.txt` (caching prerequisite)
6. **24.4.1** Backport `cerebras_agent.py` context management (stability)
7. **24.7.1** Backport `loop.sh` scoped staging improvements
8. **24.8.1** Backport `verifier.sh` caching (keep template path logic)
9. **24.9.1** Backport `current_ralph_tasks.sh` parsing improvements

> Notes: 24.5.1 (render_ac_status.sh) and 24.6.1 (model header + prompt batching) are gated by the Decisions Needed section and can be scheduled any time after 24.1.3.

### Phase 24.1: A1 Path Normalization Sweep (dependency-first)


### Phase 24.2: Bootstrapping (new projects must scaffold A1 correctly)


### Phase 24.3: Caching Prerequisites (template parity)


### Phase 24.4: Stability Backports (Cerebras context management)


### Phase 24.5: Utility Adoption (optional)


### Phase 24.6: Consistency (model header + prompt batching rule)


### Phase 24.7: Loop Staging Improvements (backport-partial)


### Phase 24.8: Verifier Caching Backport (keep template path logic)


### Phase 24.9: Observability Convenience (task monitor)

- [x] **24.9.1** Backport `current_ralph_tasks.sh` parsing improvements into templates
  - **Dependencies:** 24.1.3
  - **Goal:** Improve task extraction/state tracking in new projects using the same generic parsing improvements validated in Brain (drift report D07).
  - **Scope:**
    - `templates/ralph/current_ralph_tasks.sh`
  - **Non-goals:**
    - Do not add Brain-specific parsing rules that assume Brain file layouts beyond A1.
  - **Interfaces/Assumptions:**
    - A1 canonical layout.
  - **Steps:**
    1. Diff `workers/ralph/current_ralph_tasks.sh` vs `templates/ralph/current_ralph_tasks.sh`.
    2. Backport generic improvements only.
  - **Acceptance Criteria:**
    - `bash -n templates/ralph/current_ralph_tasks.sh` passes.
    - `rg -n "improved|state|phase|task" templates/ralph/current_ralph_tasks.sh` shows updated parsing logic (exact tokens may differ; reviewer should confirm meaningful diff).

### Decisions Needed (to unblock templating work)

> Ralph should not guess on these; resolve explicitly or use the suggested default to proceed safely.

- **DN-24.1 (`RALPH.md`)**
  - **Resolved:** ✅ Keep `RALPH.md` in templates, but rewrite it to be a short "Ralph identity + layout" doc that points to `README.md` for operational details (ADR-0001).
  - **Why it matters:** Avoid duplicative or misleading documentation in new projects.
  - **Where to inspect:** `templates/ralph/RALPH.md`, `templates/ralph/README.md`

- **DN-24.2 (`PROMPT_cerebras.md`)**
  - **Resolved:** ✅ Do **not** template this under `templates/ralph/`. This is intended to be **Cerebras-only** (i.e., under `workers/cerebras/`).
  - **Why it matters:** Avoid clutter/misleading artifacts in standard Ralph scaffolds while still supporting Cerebras-specific workflows.
  - **Where to inspect:** `workers/cerebras/` (intended home), plus any existing `PROMPT_cerebras.md` references in scripts/docs.
  - **Follow-up:** Update/move/rename as needed so the repo doesn't imply `PROMPT_cerebras.md` is a standard Ralph artifact.

- **DN-24.3 (`ralph.sh` wrapper)**
  - **Resolved:** ✅ Do **not** template `ralph.sh` as a global wrapper/entrypoint.
  - **Why it matters:** Wrapper scripts can become "blessed" commands; templating Brain-specific wrappers creates confusion and coupling.
  - **Where to inspect:** `workers/ralph/ralph.sh`

- **DN-24.4 (`render_ac_status.sh`)**
  - **Resolved (tentative):** ✅ Treat as a potentially general utility; template **only if** it is layout-agnostic and depends only on canonical A1 paths + `.verify/latest.txt` (no Brain-specific assumptions).
  - **Why it matters:** If other projects rely on it, we want it available; but we must avoid templating something brittle.
  - **Where to inspect:** `workers/ralph/render_ac_status.sh`, `.verify/latest.txt` format assumptions

- **DN-24.5 (`pr-batch.sh`)**
  - **Resolved:** ✅ Defer for now (do not backport as part of Phase 24 unless we later identify a strict bug-fix + A1 normalization change).
  - **Why it matters:** Incorrect assumptions about branch naming or paths can break PR automation.
  - **Where to inspect:** `workers/ralph/pr-batch.sh`, `templates/ralph/pr-batch.sh`

- **DN-24.6 (`HUMAN_REQUIRED.md` wording changes)**
  - **Resolved:** ✅ Yes: template changes that are A1 path normalization + clarity improvements.
  - **Why it matters:** This doc controls when humans intervene; wording drift can alter workflow expectations.
  - **Where to inspect:** `workers/ralph/HUMAN_REQUIRED.md`, `templates/ralph/HUMAN_REQUIRED.md`
