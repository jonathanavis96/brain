# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-27 08:45:00

**Current Status:** Phase 24 & 25 COMPLETED. Brain Map MVP implementation complete (verification pending). Ready for Phase 26: Environment & Testing Infrastructure.

**Recent Completions:**

- **Phase 25: Brain Map (✅ COMPLETED - MVP implementation done)**
  - Backend API with all endpoints (health, graph, node CRUD, search, plan generation)
  - Frontend UI with graph view, search, editing
  - Comprehensive test suite (80 tests across 7 test modules)
  - Verification checkboxes are for manual QA (not implementation tasks)
- **Phase 24: Template Drift Alignment (✅ COMPLETED - all tasks)**
- **Phase 23: Loop Efficiency & Correctness Fixes (✅ COMPLETED - 6/6 tasks)**

**Active Focus:**

- Phase 26: Environment & Testing Infrastructure (NEW)
- Skills knowledge base expansion (GAP_BACKLOG promotion)

<!-- Cortex adds new Task Contracts below this line -->

## Phase 25: Brain Map (MVP-first) ✅ COMPLETED

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
