# Brain Map — Implementation Plan (Ralph Tasks)

## Table of contents

- [MVP cutline checklist](#mvp-cutline-checklist)
- [Phase: MVP](#phase-mvp)
- [Phase: V1](#phase-v1)
- [Phase: V2](#phase-v2)
- [Task dependency notes](#task-dependency-notes)

## MVP cutline checklist

MVP is considered "done" when all items below are true:

- [ ] Backend can be started in WSL2 and serves `GET /health` successfully.
- [ ] Markdown-first notes exist under `app/brain-map/notes/` and are treated as the canonical source of truth.
- [ ] A deterministic index rebuild can be run that produces a local SQLite index at `app/brain-map/.local/index.db`.
- [ ] Backend exposes MVP API endpoints as specified in `docs/brain-map/brain-map-spec.md`:
  - [ ] `GET /graph`
  - [ ] `GET /node/{id}`
  - [ ] `POST /node`
  - [ ] `PUT /node/{id}`
  - [ ] `GET /search`
  - [ ] `POST /generate-plan`
- [ ] UI can be started and loaded in a Windows browser and calls the backend successfully.
- [ ] UI renders a graph view (sigma.js) from `GET /graph`.
- [ ] UI supports selecting a node and viewing/editing details (via `GET /node/{id}` + `PUT /node/{id}`).
- [ ] UI supports fast search (Ctrl+K) via `GET /search`.
- [ ] UI supports basic recency heat overlay (even if simple).
- [ ] UI supports generating a plan from selected nodes and shows returned markdown (via `POST /generate-plan`).

## Phase: MVP

> Ordering intent: scaffolding → parsing/indexing → API → UI integration → UX polish.

- [ ] **MVP.1** Scaffold Brain Map app workspace (frontend + backend skeleton)
  - **Goal:** Create the canonical directory structure under `app/brain-map/` and ensure both frontend and backend can run in dev mode.
  - **Inputs:**
    - Canonical repo layout in `docs/brain-map/brain-map-spec.md`.
    - Stack assumptions: Vite+React (frontend), FastAPI (backend).
  - **Outputs:**
    - `app/brain-map/frontend/` (Vite+React project scaffold)
    - `app/brain-map/backend/` (FastAPI project scaffold)
    - `app/brain-map/notes/` (empty or sample placeholder)
    - `app/brain-map/generated/` (empty)
    - `app/brain-map/.local/` remains runtime-only (do not commit contents)
  - **Files likely to touch:**
    - `app/brain-map/frontend/**`
    - `app/brain-map/backend/**`
    - `.gitignore` (if needed to ignore `app/brain-map/.local/`)
  - **AC:**
    - [ ] Frontend dev server starts and serves on port 5173 (or documented override).
    - [ ] Backend dev server starts and serves on port 8000 (or documented override).
    - [ ] `GET /health` returns 200 with expected JSON shape.
  - **Verification:**
    - `cd app/brain-map/backend && <run backend dev command>`
    - `curl -s http://localhost:8000/health | jq .`
    - `cd app/brain-map/frontend && <run frontend dev command>`
  - **Risk notes:** repo toolchain differences (uv/poetry/pip). Keep minimal.
  - **If Blocked:** If Python packaging is unclear, start with `requirements.txt` + `python -m venv` and document.

- [ ] **MVP.2** Define Markdown note discovery + loading (scan notes root)
  - **Goal:** Implement deterministic note discovery under `app/brain-map/notes/` (recursive) and load raw note content for parsing.
  - **Inputs:**
    - Canonical notes location: `app/brain-map/notes/`
    - Frontmatter schema from the spec appendix.
  - **Outputs:**
    - Backend capability to list discovered `.md` files and load their bytes/text.
  - **Files likely to touch:**
    - `app/brain-map/backend/**`
  - **AC:**
    - [ ] Notes are discovered recursively.
    - [ ] Non-markdown files are ignored.
    - [ ] Discovery order is deterministic (sorted by repo-root-relative path).
  - **Verification:**
    - Add a few sample notes under `app/brain-map/notes/` and verify discovery output via a temporary CLI route or test.
  - **Risk notes:** Path handling under WSL2; enforce repo-root-relative paths.
  - **If Blocked:** Add minimal unit test coverage to prove deterministic ordering.

- [ ] **MVP.3** Implement canonical frontmatter parser and validator
  - **Goal:** Parse YAML frontmatter and markdown body, validate against canonical schema, and surface deterministic errors.
  - **Inputs:**
    - Appendix: “Frontmatter & Link Schema (Canonical)”
    - Node Identity & Stability Rules
  - **Outputs:**
    - Parsed node objects and outgoing links.
    - Validation diagnostics (hard errors vs warnings).
  - **Files likely to touch:**
    - `app/brain-map/backend/**`
  - **AC:**
    - [ ] Required keys enforced per type.
    - [ ] Invalid enums are hard errors.
    - [ ] `TaskContract` without `acceptance_criteria` is a hard error.
    - [ ] Unknown fields are preserved (round-trip safety policy documented in tests).
  - **Verification:**
    - `pytest -q` (or equivalent)
  - **Risk notes:** YAML edge cases; use a strict YAML loader.
  - **If Blocked:** Start with strict hard-error handling; add warnings in a second pass.

- [ ] **MVP.4** Build SQLite schema and deterministic index rebuild
  - **Goal:** Build a derived SQLite index at `app/brain-map/.local/index.db` from Markdown notes, with deterministic rebuild and atomic publish behavior.
  - **Inputs:**
    - Derived index policy: must not be committed
    - Failure & recovery model: build temp index then swap on success
  - **Outputs:**
    - SQLite index DB with `nodes`, `edges`, and `nodes_fts` tables.
    - Index rebuild diagnostics.
  - **Files likely to touch:**
    - `app/brain-map/backend/**`
  - **AC:**
    - [ ] Index rebuild is deterministic and idempotent.
    - [ ] Duplicate ids are a hard error and prevent publishing a new index.
    - [ ] Last known-good index remains usable if rebuild fails.
  - **Verification:**
    - `pytest -q`
    - Manual: introduce a duplicate id and confirm rebuild fails without destroying existing index.
  - **Risk notes:** FTS5 availability; confirm and document fallback if needed.
  - **If Blocked:** If FTS5 is unavailable, ship MVP with a simpler search and add FTS in V1.

- [ ] **MVP.5** Implement `/search` endpoint using the index (fast global search)
  - **Goal:** Provide fast search across title/tags/body with filters and pagination per spec.
  - **Inputs:**
    - Graph Query Contracts: `GET /search`
    - Filtering/pagination rules
  - **Outputs:**
    - Working `GET /search?q=...` endpoint returning stable result ordering.
  - **Files likely to touch:**
    - `app/brain-map/backend/**`
  - **AC:**
    - [ ] Supports `type/status/tags/updated_since/updated_within_days` filters.
    - [ ] Supports `limit` and `offset`.
    - [ ] Stable tie-break ordering for equal scores.
  - **Verification:**
    - `curl -s "http://localhost:8000/search?q=brain&limit=5&offset=0" | jq .`
  - **Risk notes:** Relevance scoring variability; document deterministic tie-breakers.
  - **If Blocked:** Implement simple substring search on title/tags for MVP, keeping API shape identical.

- [ ] **MVP.6** Implement `/graph` endpoint (graph snapshot for UI)
  - **Goal:** Provide `GET /graph` per spec including nodes, edges, metrics placeholders, filtering, pagination, and deterministic ordering.
  - **Inputs:**
    - Graph Query Contracts: `GET /graph`
    - Metrics requirements: include `recency` at minimum (or `null` if not yet computed)
  - **Outputs:**
    - JSON graph snapshot suitable for sigma.js rendering.
  - **Files likely to touch:**
    - `app/brain-map/backend/**`
  - **AC:**
    - [ ] Nodes/edges returned in deterministic order.
    - [ ] Filters and pagination behave as specified.
    - [ ] `metrics` object present for each node (`density/recency/task` present as float or null).
  - **Verification:**
    - `curl -s "http://localhost:8000/graph?limit=100&offset=0" | jq .page`
  - **Risk notes:** Graph pagination can truncate edges; document behavior (MVP may return partial graph).
  - **If Blocked:** For MVP, ignore pagination for `/graph` but keep parameters accepted and documented.

- [ ] **MVP.7** Implement `/node/{id}` read endpoint
  - **Goal:** Provide `GET /node/{id}` returning node metadata + markdown body as specified.
  - **Inputs:**
    - Graph Query Contracts: `GET /node/{id}`
  - **Outputs:**
    - Node detail JSON including `links` as stored.
  - **Files likely to touch:**
    - `app/brain-map/backend/**`
  - **AC:**
    - [ ] Unknown id returns 404 with canonical error shape.
    - [ ] Response includes `node` and `body_md` fields.
  - **Verification:**
    - `curl -s http://localhost:8000/node/<id> | jq .`
  - **Risk notes:** storing body separately from frontmatter; ensure round-trip.
  - **If Blocked:** Return `body_md` empty string in MVP, but preserve schema.

- [ ] **MVP.8** Implement node create (`POST /node`) with markdown-first write + reindex
  - **Goal:** Create new node file under `app/brain-map/notes/` using canonical frontmatter rules; trigger reindex.
  - **Inputs:**
    - ID rules: backend generates `bm_<uuid>` if omitted
    - Atomic write + reindex contract
  - **Outputs:**
    - New markdown note created.
    - Reindex performed and published on success.
  - **Files likely to touch:**
    - `app/brain-map/backend/**`
    - `app/brain-map/notes/**` (new files)
  - **AC:**
    - [ ] Returns 201 with created id and source_path.
    - [ ] Duplicate id conflicts return 409 with canonical error.
    - [ ] System never corrupts markdown files.
  - **Verification:**
    - `curl -s -X POST http://localhost:8000/node -H 'Content-Type: application/json' -d '{"title":"Test","type":"Inbox"}' | jq .`
  - **Risk notes:** choosing filenames: must not be identity; ensure deterministic naming strategy.
  - **If Blocked:** Use timestamp-based filename under `app/brain-map/notes/inbox/`.

- [ ] **MVP.9** Implement node update (`PUT /node/{id}`) with atomic write + reindex
  - **Goal:** Update existing markdown note fields/body; enforce immutability of id; trigger reindex.
  - **Inputs:**
    - Node identity rules (id immutable)
    - Optional optimistic concurrency (MAY)
  - **Outputs:**
    - Updated markdown note.
    - Reindexed and published on success.
  - **Files likely to touch:**
    - `app/brain-map/backend/**`
    - `app/brain-map/notes/**`
  - **AC:**
    - [ ] Attempt to change id is rejected (400 validation error).
    - [ ] Unknown id returns 404.
    - [ ] Atomic write guarantees preserved.
  - **Verification:**
    - `curl -s -X PUT http://localhost:8000/node/<id> -H 'Content-Type: application/json' -d '{"title":"Updated"}' | jq .`
  - **Risk notes:** round-tripping unknown frontmatter keys.
  - **If Blocked:** For MVP, do not preserve unknown fields on write but emit a warning and record as technical debt (must be resolved before V1).

- [ ] **MVP.10** Implement `/generate-plan` endpoint (deterministic markdown + optional write)
  - **Goal:** Generate plan markdown deterministically from selection + subgraph rules; optionally write to `app/brain-map/generated/`.
  - **Inputs:**
    - Plan generation template in spec
    - Graph Query Contracts: `POST /generate-plan`
  - **Outputs:**
    - Response includes markdown + written path.
    - File written if requested.
  - **Files likely to touch:**
    - `app/brain-map/backend/**`
    - `app/brain-map/generated/**` (generated output)
  - **AC:**
    - [ ] Same inputs + same index produce identical markdown output (stable ordering).
    - [ ] Unknown selection id returns 404.
    - [ ] Writing respects atomic file write.
  - **Verification:**
    - `curl -s -X POST http://localhost:8000/generate-plan -H 'Content-Type: application/json' -d '{"selection":["<id>"],"depth":2,"output":{"write":false}}' | jq .markdown`
  - **Risk notes:** graph traversal ordering; must sort neighbors deterministically.
  - **If Blocked:** Start with depth=0 (selection-only) but keep request fields; expand traversal next.

- [ ] **MVP.11** Frontend: Graph view rendering from `/graph` (sigma.js)
  - **Goal:** Render the graph snapshot from the backend using sigma.js + graphology; support node selection.
  - **Inputs:**
    - `GET /graph` response contract
  - **Outputs:**
    - Graph canvas with nodes and edges.
    - Click-to-select behavior.
  - **Files likely to touch:**
    - `app/brain-map/frontend/**`
  - **AC:**
    - [ ] Graph renders with at least dozens of nodes without freezing.
    - [ ] Clicking a node selects it and triggers node detail fetch.
  - **Verification:**
    - `cd app/brain-map/frontend && <run frontend dev command>`
    - Manual: load UI and confirm graph renders.
  - **Risk notes:** layout choices; start with basic layout then improve.
  - **If Blocked:** Render nodes in a simple grid layout initially to validate data path.

- [ ] **MVP.12** Frontend: Node detail panel (read + edit + save)
  - **Goal:** Implement right-side detail panel wired to `GET /node/{id}` and `PUT /node/{id}`.
  - **Inputs:**
    - Node response contract including `node` and `body_md`
  - **Outputs:**
    - Editable fields: title/status/tags/body
    - Save operation triggers backend update and refreshes graph.
  - **Files likely to touch:**
    - `app/brain-map/frontend/**`
  - **AC:**
    - [ ] Editing title persists to disk (markdown file) and updates `updated_at`.
    - [ ] UI surfaces validation errors using the canonical error shape.
  - **Verification:**
    - Manual: edit a node, reload UI, confirm persisted.
  - **Risk notes:** form state vs graph state synchronization.
  - **If Blocked:** Force a full graph refresh after save (simpler, slower).

- [ ] **MVP.13** Frontend: Search palette (Ctrl+K) via `/search`
  - **Goal:** Implement global fuzzy search UI to jump to a node and select it.
  - **Inputs:**
    - `GET /search` contract
  - **Outputs:**
    - Ctrl+K palette, results list, selection focuses graph.
  - **Files likely to touch:**
    - `app/brain-map/frontend/**`
  - **AC:**
    - [ ] Ctrl+K opens palette.
    - [ ] Selecting a result focuses and selects the node.
  - **Verification:**
    - Manual.
  - **Risk notes:** keyboard shortcuts in browser.
  - **If Blocked:** Provide a search input field in header as fallback.

- [ ] **MVP.14** Frontend: Basic recency heat overlay toggle
  - **Goal:** Display node recency heat from `metrics.recency` or compute client-side from `updated_at` if backend does not provide yet.
  - **Inputs:**
    - Heat metric definitions in spec
  - **Outputs:**
    - Toggle to enable heat overlay; nodes show halo intensity.
  - **Files likely to touch:**
    - `app/brain-map/frontend/**`
  - **AC:**
    - [ ] Toggle changes node rendering.
    - [ ] Recently updated nodes appear hotter.
  - **Verification:**
    - Manual: edit a node and see its heat increase.
  - **Risk notes:** visual tuning.
  - **If Blocked:** Use node size as a proxy for heat in MVP.

- [ ] **MVP.15** Frontend: Generate plan wizard (minimal) using `/generate-plan`
  - **Goal:** Allow user to generate plan from current selection; show markdown preview.
  - **Inputs:**
    - `POST /generate-plan` contract
  - **Outputs:**
    - Plan modal/panel showing markdown.
  - **Files likely to touch:**
    - `app/brain-map/frontend/**`
  - **AC:**
    - [ ] User can select nodes and generate plan.
    - [ ] Markdown preview matches backend response.
  - **Verification:**
    - Manual.
  - **Risk notes:** selection semantics.
  - **If Blocked:** Start with single-node plan generation.

## Phase: V1

- [ ] **V1.1** Backend: compute and return recency heat deterministically
  - **Goal:** Compute `metrics.recency` server-side using the canonical half-life rule.
  - **Inputs:** heat metric definitions.
  - **Outputs:** `/graph` nodes include numeric `metrics.recency`.
  - **Files likely to touch:** `app/brain-map/backend/**`
  - **AC:** [ ] Values in 0..1 and deterministic.
  - **Verification:** `curl -s http://localhost:8000/graph | jq '.nodes[0].metrics.recency'`
  - **Risk notes:** time-of-now influences determinism; define `t_now` evaluation point clearly.
  - **If Blocked:** Keep client-side computation.

- [ ] **V1.2** Backend: density heat (degree + clustering coefficient) with caching
  - **Goal:** Provide `metrics.density` per node.
  - **Inputs:** density metric definition.
  - **Outputs:** `/graph` nodes include `metrics.density`.
  - **Files likely to touch:** `app/brain-map/backend/**`
  - **AC:** [ ] Deterministic results across rebuilds for identical graph.
  - **Verification:** add tests.
  - **Risk notes:** clustering coefficient performance.
  - **If Blocked:** Degree-only density metric.

- [ ] **V1.3** Backend: task heat based on TaskContract neighborhood
  - **Goal:** Provide `metrics.task` per node.
  - **Inputs:** task heat definition.
  - **Outputs:** `/graph` nodes include `metrics.task`.
  - **Files likely to touch:** `app/brain-map/backend/**`
  - **AC:** [ ] Matches spec neighborhood and weighting.
  - **Verification:** targeted test graph.
  - **Risk notes:** neighborhood traversal.
  - **If Blocked:** Depth=1 only.

- [ ] **V1.4** Frontend: hotspots / insights panel (top N)
  - **Goal:** Show ranked hotspots list by chosen metric; click navigates.
  - **Inputs:** `/graph` metrics.
  - **Outputs:** Insights panel UI.
  - **Files likely to touch:** `app/brain-map/frontend/**`
  - **AC:** [ ] Shows top N; navigation works.
  - **Verification:** manual.
  - **Risk notes:** UX scope creep.
  - **If Blocked:** Simple list in side panel.

- [ ] **V1.5** Frontend: filtering controls (type/status/tags/recency)
  - **Goal:** UI filters mapped to `/graph` query params.
  - **Inputs:** filtering contracts.
  - **Outputs:** filter UI, filtered graph.
  - **Files likely to touch:** `app/brain-map/frontend/**`
  - **AC:** [ ] Filters round-trip to URL/query and apply.
  - **Verification:** manual.
  - **Risk notes:** filter state complexity.
  - **If Blocked:** Provide type/status only.

- [ ] **V1.6** Backend: file watcher + incremental reindex
  - **Goal:** Auto-reindex on markdown file change with debounce.
  - **Inputs:** failure/recovery model.
  - **Outputs:** updated index without manual rebuild.
  - **Files likely to touch:** `app/brain-map/backend/**`
  - **AC:** [ ] Change a note file, index updates within X seconds.
  - **Verification:** manual.
  - **Risk notes:** WSL file watcher reliability.
  - **If Blocked:** manual “rebuild index” endpoint.

## Phase: V2

- [ ] **V2.1** Frontend: semantic zoom + clustering (supernodes)
  - **Goal:** Implement cluster-aware zoom behavior.
  - **Inputs:** graph rendering guidance.
  - **Outputs:** clustered nodes at low zoom.
  - **Files likely to touch:** `app/brain-map/frontend/**`
  - **AC:** [ ] Expand/collapse stable and usable.
  - **Verification:** manual.
  - **Risk notes:** complex UX.
  - **If Blocked:** manual expand/collapse only.

- [ ] **V2.2** Backend: dependency analysis (cycles, critical path hints)
  - **Goal:** Detect depends_on cycles and surface diagnostics.
  - **Inputs:** relationship schema.
  - **Outputs:** diagnostics endpoint or included in plan generation.
  - **Files likely to touch:** `app/brain-map/backend/**`
  - **AC:** [ ] Cycles detected deterministically.
  - **Verification:** tests.
  - **Risk notes:** algorithm correctness.
  - **If Blocked:** Only detect direct self-cycles.

- [ ] **V2.3** Plan generator improvements (toposort, richer dependency sections)
  - **Goal:** Improve plan output deterministically while obeying agent ingestion contract.
  - **Inputs:** plan template + agent ingestion rules.
  - **Outputs:** higher quality markdown with explicit ordering.
  - **Files likely to touch:** `app/brain-map/backend/**`
  - **AC:** [ ] Stable ordering; explicit cycle reporting.
  - **Verification:** golden tests.
  - **Risk notes:** risk of scope creep.
  - **If Blocked:** Keep MVP plan generator.

## Task dependency notes

Lightweight ordering constraints (non-exhaustive):

- MVP.1 must precede all other tasks.
- MVP.2 and MVP.3 must precede MVP.4 (index rebuild).
- MVP.4 must precede MVP.5, MVP.6, MVP.7, MVP.10 (API endpoints relying on index).
- MVP.6 and MVP.7 must precede MVP.11 and MVP.12 (UI data dependencies).
- MVP.5 must precede MVP.13 (search palette).
- MVP.10 must precede MVP.15 (generate plan wizard).
