# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-26 15:45:00

**Current Status:** Phase 23 (Loop Efficiency & Correctness) COMPLETE. All 6/6 tasks done.

**Active Phases:**

- **Phase 23: Loop Efficiency & Correctness Fixes (✅ 6/6 tasks complete)**
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

### Phase 25.1: MVP

> Ordering intent: scaffolding → parsing/indexing → API → UI integration → UX polish.

- [ ] **25.1.1** Scaffold Brain Map app workspace (frontend + backend skeleton)
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
  - **Verification (once scaffolding exists):**
    - Backend: `cd app/brain-map/backend && python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
    - `curl -s http://localhost:8000/health | jq .`
    - Frontend: `cd app/brain-map/frontend && npm install && npm run dev -- --host 0.0.0.0 --port 5173`
  - **Risk notes:** repo toolchain differences (uv/poetry/pip). Keep minimal.
  - **If Blocked:** If Python packaging is unclear, start with `requirements.txt` + `python -m venv` and document.

- [ ] **25.1.2** Define Markdown note discovery + loading (scan notes root)
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

- [ ] **25.1.3** Implement canonical frontmatter parser and validator
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

- [ ] **25.1.4** Build SQLite schema and deterministic index rebuild
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

- [ ] **25.1.5** Implement `/search` endpoint using the index (fast global search)
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

- [ ] **25.1.6** Implement `/graph` endpoint (graph snapshot for UI)
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

- [ ] **25.1.7** Implement `/node/{id}` read endpoint
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

- [ ] **25.1.8** Implement node create (`POST /node`) with markdown-first write + reindex
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

- [ ] **25.1.9** Implement node update (`PUT /node/{id}`) with atomic write + reindex
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

- [ ] **25.1.10** Implement `/generate-plan` endpoint (deterministic markdown + optional write)
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

- [ ] **25.1.11** Frontend: Graph view rendering from `/graph` (sigma.js)
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
  - **Verification (once scaffolding exists):**
    - `cd app/brain-map/frontend && npm install && npm run dev -- --host 0.0.0.0 --port 5173`
    - Manual: load UI and confirm graph renders.
  - **Risk notes:** layout choices; start with basic layout then improve.
  - **If Blocked:** Render nodes in a simple grid layout initially to validate data path.

- [ ] **25.1.12** Frontend: Node detail panel (read + edit + save)
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

- [ ] **25.1.13** Frontend: Search palette (Ctrl+K) via `/search`
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

- [ ] **25.1.14** Frontend: Basic recency heat overlay toggle
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

- [ ] **25.1.15** Frontend: Generate plan wizard (minimal) using `/generate-plan`
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

### Phase 25.2: V1

- [ ] **25.2.1** Backend: compute and return recency heat deterministically
  - **Goal:** Compute `metrics.recency` server-side using the canonical half-life rule.
  - **Inputs:** heat metric definitions.
  - **Outputs:** `/graph` nodes include numeric `metrics.recency`.
  - **Files likely to touch:** `app/brain-map/backend/**`
  - **AC:** [ ] Values in 0..1 and deterministic.
  - **Verification:** `curl -s http://localhost:8000/graph | jq '.nodes[0].metrics.recency'`
  - **Risk notes:** time-of-now influences determinism; define `t_now` evaluation point clearly.
  - **If Blocked:** Keep client-side computation.

- [ ] **25.2.2** Backend: density heat (degree + clustering coefficient) with caching
  - **Goal:** Provide `metrics.density` per node.
  - **Inputs:** density metric definition.
  - **Outputs:** `/graph` nodes include `metrics.density`.
  - **Files likely to touch:** `app/brain-map/backend/**`
  - **AC:** [ ] Deterministic results across rebuilds for identical graph.
  - **Verification:** add tests.
  - **Risk notes:** clustering coefficient performance.
  - **If Blocked:** Degree-only density metric.

- [ ] **25.2.3** Backend: task heat based on TaskContract neighborhood
  - **Goal:** Provide `metrics.task` per node.
  - **Inputs:** task heat definition.
  - **Outputs:** `/graph` nodes include `metrics.task`.
  - **Files likely to touch:** `app/brain-map/backend/**`
  - **AC:** [ ] Matches spec neighborhood and weighting.
  - **Verification:** targeted test graph.
  - **Risk notes:** neighborhood traversal.
  - **If Blocked:** Depth=1 only.

- [ ] **25.2.4** Frontend: hotspots / insights panel (top N)
  - **Goal:** Show ranked hotspots list by chosen metric; click navigates.
  - **Inputs:** `/graph` metrics.
  - **Outputs:** Insights panel UI.
  - **Files likely to touch:** `app/brain-map/frontend/**`
  - **AC:** [ ] Shows top N; navigation works.
  - **Verification:** manual.
  - **Risk notes:** UX scope creep.
  - **If Blocked:** Simple list in side panel.

- [ ] **25.2.5** Frontend: filtering controls (type/status/tags/recency)
  - **Goal:** UI filters mapped to `/graph` query params.
  - **Inputs:** filtering contracts.
  - **Outputs:** filter UI, filtered graph.
  - **Files likely to touch:** `app/brain-map/frontend/**`
  - **AC:** [ ] Filters round-trip to URL/query and apply.
  - **Verification:** manual.
  - **Risk notes:** filter state complexity.
  - **If Blocked:** Provide type/status only.

- [ ] **25.2.6** Backend: file watcher + incremental reindex
  - **Goal:** Auto-reindex on markdown file change with debounce.
  - **Inputs:** failure/recovery model.
  - **Outputs:** updated index without manual rebuild.
  - **Files likely to touch:** `app/brain-map/backend/**`
  - **AC:** [ ] Change a note file, index updates within X seconds.
  - **Verification:** manual.
  - **Risk notes:** WSL file watcher reliability.
  - **If Blocked:** manual “rebuild index” endpoint.

### Phase 25.3: V2

- [ ] **25.3.1** Frontend: semantic zoom + clustering (supernodes)
  - **Goal:** Implement cluster-aware zoom behavior.
  - **Inputs:** graph rendering guidance.
  - **Outputs:** clustered nodes at low zoom.
  - **Files likely to touch:** `app/brain-map/frontend/**`
  - **AC:** [ ] Expand/collapse stable and usable.
  - **Verification:** manual.
  - **Risk notes:** complex UX.
  - **If Blocked:** manual expand/collapse only.

- [ ] **25.3.2** Backend: dependency analysis (cycles, critical path hints)
  - **Goal:** Detect depends_on cycles and surface diagnostics.
  - **Inputs:** relationship schema.
  - **Outputs:** diagnostics endpoint or included in plan generation.
  - **Files likely to touch:** `app/brain-map/backend/**`
  - **AC:** [ ] Cycles detected deterministically.
  - **Verification:** tests.
  - **Risk notes:** algorithm correctness.
  - **If Blocked:** Only detect direct self-cycles.

- [ ] **25.3.3** Plan generator improvements (toposort, richer dependency sections)
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

- [ ] **24.1.1** Normalize template documentation to canonical `workers/ralph/` layout (A1)
  - **Goal:** Update template documentation so all examples and instructions refer to `workers/ralph/` (ADR-0001) and do not assume the legacy `ralph/` root.
  - **Scope:**
    - `templates/ralph/**/*.md`
  - **Non-goals:**
    - Do not modify Brain-only documentation under `workers/`.
    - Do not add dual-layout auto-detection guidance.
  - **Interfaces/Assumptions:**
    - Canonical layout is `workers/ralph/` (ADR-0001).
  - **Steps:**
    1. Search docs for legacy `ralph/` path references.
    2. Replace with `workers/ralph/` where the path refers to the Ralph root.
    3. Ensure docs do not reference Brain-only paths.
  - **Acceptance Criteria:**
    - `rg -n "(^|/)ralph/" templates/ralph/**/*.md` has no matches for layout-root paths (allowlist only if explicitly discussing historical drift).
    - `rg -n "workers/ralph" templates/ralph/**/*.md` shows updated canonical references.

- [ ] **24.1.2** Normalize template scripts to canonical `workers/ralph/` layout (A1)
  - **Goal:** Ensure template scripts operate correctly when installed under `workers/ralph/` and do not hardcode legacy `ralph/` layout paths.
  - **Scope:**
    - `templates/ralph/**/*.sh`
    - `templates/ralph/.verify/*` (only if any path references are embedded in these files)
  - **Non-goals:**
    - Do not add dual-layout auto-detection unless explicitly approved (ADR-0001 selects A1).
  - **Interfaces/Assumptions:**
    - Canonical layout is `workers/ralph/`.
    - Prefer `SCRIPT_DIR`/`BASH_SOURCE`-based root detection and/or `RALPH_PROJECT_ROOT` where appropriate.
  - **Steps:**
    1. Search scripts for hardcoded `ralph/` and other legacy paths.
    2. Update path computations and defaults to align with A1.
    3. Ensure no Brain-only relative paths (e.g., `../../brain/...`) are introduced.
  - **Acceptance Criteria:**
    - `rg -n "(^|/)ralph/" templates/ralph/**/*.sh` has no matches for layout-root paths.
    - `bash -n templates/ralph/*.sh templates/ralph/**/*.sh` passes.

- [ ] **24.1.3** Audit templates for legacy layout strings and Brain-only path coupling
  - **Goal:** Provide a deterministic verification pass that A1 normalization is complete before bootstrapping/caching work proceeds.
  - **Scope:**
    - `templates/ralph/` (entire subtree)
  - **Non-goals:**
    - Do not change Brain files.
  - **Interfaces/Assumptions:**
    - A1 is canonical.
  - **Steps:**
    1. Run repo-wide ripgrep checks for legacy layout markers.
    2. Fix any remaining violations found.
  - **Acceptance Criteria:**
    - `rg -n "(^|/)ralph/" templates/ralph` returns no matches (allowlist only if it is prose that explicitly discusses historical drift).
    - `rg -n "\.{2}/\.{2}/brain|/code/brain|workers/IMPLEMENTATION_PLAN\.md" templates/ralph` returns no matches.

### Phase 24.2: Bootstrapping (new projects must scaffold A1 correctly)

- [ ] **24.2.1** Template `workers/ralph/new-project.sh` bootstrapping script
  - **Dependencies:** 24.1.3 (A1 normalization + audit complete before copying/adjusting)
  - **Goal:** Ensure new projects can bootstrap Ralph using the same tool Brain uses, but without Brain-only assumptions.
  - **Scope:**
    - Add `templates/ralph/new-project.sh` sourced from `workers/ralph/new-project.sh` with template-appropriate path defaults.
    - Update any template docs that reference bootstrapping.
  - **Non-goals:**
    - Do not modify `workers/ralph/new-project.sh` in Brain as part of this task.
    - Do not add Brain repo-specific paths or branch names.
  - **Interfaces/Assumptions:**
    - Script must target canonical layout `workers/ralph/` and operate from an arbitrary repo root.
    - Script must not require files outside the target repo (no brain-relative references).
  - **Steps:**
    1. Copy `workers/ralph/new-project.sh` into `templates/ralph/new-project.sh`.
    2. Replace any Brain-only path assumptions with repo-root-relative detection.
    3. Ensure the script scaffolds `workers/ralph/` layout.
  - **Acceptance Criteria:**
    - `test -f templates/ralph/new-project.sh`
    - `bash -n templates/ralph/new-project.sh` passes.
    - `rg -n "brain" templates/ralph/new-project.sh` returns no Brain-specific path coupling (allowlist: comments that explain generic behavior without referencing this repo).
    - `rg -n "workers/ralph" templates/ralph/new-project.sh` returns matches showing canonical output paths.

### Phase 24.3: Caching Prerequisites (template parity)

- [ ] **24.3.1** Template `config/non_cacheable_tools.txt`
  - **Dependencies:** 24.1.3 (A1 normalization + audit complete)
  - **Goal:** Provide the config file required by caching-aware scripts so new projects work out-of-the-box.
  - **Scope:**
    - Add `templates/ralph/config/non_cacheable_tools.txt` based on `workers/ralph/config/non_cacheable_tools.txt`.
  - **Non-goals:**
    - Do not introduce Brain-only tool names unless they are generally applicable.
  - **Interfaces/Assumptions:**
    - Paths and scripts in templates should reference `workers/ralph/config/non_cacheable_tools.txt` (A1) after Phase 24.1.
  - **Steps:**
    1. Copy file into templates.
    2. Confirm referenced tools are generic.
  - **Acceptance Criteria:**
    - `test -f templates/ralph/config/non_cacheable_tools.txt`
    - `wc -l templates/ralph/config/non_cacheable_tools.txt` is greater than 0.
    - `diff -u workers/ralph/config/non_cacheable_tools.txt templates/ralph/config/non_cacheable_tools.txt` shows either identical content or only justified genericization edits.

### Phase 24.4: Stability Backports (Cerebras context management)

- [ ] **24.4.1** Backport Cerebras agent context-management improvements into templates
  - **Dependencies:** 24.1.3 (A1 normalization + audit complete)
  - **Goal:** Prevent token/context explosion in new projects by templating the battle-tested context-trimming logic from Brain.
  - **Scope:**
    - `templates/ralph/cerebras_agent.py`
    - (Optional) any template docs referencing Cerebras behavior
  - **Non-goals:**
    - Do not add Brain repo-specific defaults (paths, project names, task IDs).
  - **Interfaces/Assumptions:**
    - Drift report D06 describes specific constants and truncation limits to backport.
  - **Steps:**
    1. Diff `workers/ralph/cerebras_agent.py` vs `templates/ralph/cerebras_agent.py`.
    2. Backport only the context management, token/char limits, and summarization heuristics.
    3. Ensure defaults are safe and generic.
  - **Acceptance Criteria:**
    - `python3 -m py_compile templates/ralph/cerebras_agent.py` passes.
    - `rg -n "MAX_CONTEXT_CHARS|MAX_TOOL_RESULT_CHARS|KEEP_RECENT_TURNS|SUMMARIZE_AFTER_TURN" templates/ralph/cerebras_agent.py` finds the expected constants.

### Phase 24.5: Utility Adoption (optional)

- [ ] **24.5.1** Decide + (if approved) template `render_ac_status.sh`
  - **Dependencies:** 24.1.3 (A1 normalization + audit complete), DN-24.4 (decision)
  - **Goal:** Provide an optional utility to render verifier / AC status for humans without breaking canonical layout assumptions.
  - **Scope:**
    - If templated: `templates/ralph/render_ac_status.sh`
    - Update template docs to mention it as optional.
  - **Non-goals:**
    - Do not make the core loop/verifier depend on this utility.
  - **Interfaces/Assumptions:**
    - Must work with canonical `workers/ralph/` layout and `.verify/latest.txt` output location.
  - **Steps:**
    1. Inspect `workers/ralph/render_ac_status.sh` behavior and inputs.
    2. If generally useful, copy into templates and normalize paths per Phase 24.1.
  - **Acceptance Criteria:**
    - (If templated) `test -f templates/ralph/render_ac_status.sh`
    - (If templated) `bash -n templates/ralph/render_ac_status.sh` passes.
    - (If templated) `rg -n "workers/ralph" templates/ralph/render_ac_status.sh` shows canonical path usage.
  - **Risk/Notes:**
    - Gate on Decisions Needed below.

### Phase 24.6: Consistency (model header + prompt batching rule)

- [ ] **24.6.1** Align model-header single-source-of-truth + prompt batching rule across canonical files
  - **Dependencies:** DN resolution on what is authoritative (typically `workers/ralph/`), then apply to templates
  - **Goal:** Ensure the "model header" and "markdown batching" guidance are consistent between the canonical workers implementation and templates to prevent regressions.
  - **Scope:**
    - Inspect and, if needed, align the following pairs:
      - `workers/ralph/PROMPT.md` vs `templates/ralph/PROMPT.md`
      - `workers/ralph/loop.sh` vs `templates/ralph/loop.sh`
  - **Non-goals:**
    - Do not change protected/hash-guarded files without following repo protocol (if hashes are involved, handle via the existing baseline mechanisms).
  - **Interfaces/Assumptions:**
    - Canonical layout A1.
    - Recent fixes referenced in drift context: model header, markdown batching rule, `cleanup_plan.sh`.
  - **Steps:**
    1. Identify the authoritative wording/behavior for the model header and batching rule.
    2. Apply minimal edits to bring the non-authoritative copy in sync.
  - **Acceptance Criteria:**
    - `rg -n "markdown batching" workers/ralph/PROMPT.md templates/ralph/PROMPT.md` shows consistent guidance.
    - `rg -n "model header" workers/ralph/PROMPT.md templates/ralph/PROMPT.md` shows consistent guidance.
  - **Risk/Notes:**
    - May touch protected files in some repos; if blocked, break into a separate task with explicit hash-update steps.

### Phase 24.7: Loop Staging Improvements (backport-partial)

- [ ] **24.7.1** Backport `loop.sh` scoped staging improvements into templates (without Brain-specific paths)
  - **Dependencies:** 24.1.3
  - **Goal:** Improve signal-to-noise in commits by staging only scoped changes, while preserving template path logic and avoiding Brain-only assumptions.
  - **Scope:**
    - `templates/ralph/loop.sh`
  - **Non-goals:**
    - Do not copy Brain-specific denylist patterns or hardcoded file paths (drift report D11).
    - Do not change Brain `workers/ralph/loop.sh` in this task.
  - **Interfaces/Assumptions:**
    - Canonical layout A1 (`workers/ralph/`).
    - Use template-appropriate root detection (ADR-0001).
  - **Steps:**
    1. Diff `workers/ralph/loop.sh` vs `templates/ralph/loop.sh`.
    2. Backport `stage_scoped_changes()` and protected-file co-staging behavior.
    3. Ensure defaults remain safe (notably `CACHE_MODE=use` if applicable).
  - **Acceptance Criteria:**
    - `bash -n templates/ralph/loop.sh` passes.
    - `rg -n "stage_scoped_changes" templates/ralph/loop.sh` finds the function.
    - `rg -n "CACHE_MODE=use" templates/ralph/loop.sh` matches (or documented justified alternative).

### Phase 24.8: Verifier Caching Backport (keep template path logic)

- [ ] **24.8.1** Backport verifier caching into templates without regressing A1 root/path logic
  - **Dependencies:** 24.1.3, 24.3.1, 24.7.1
  - **Goal:** Speed up verifier runs via caching, while preserving the template’s correct root detection (`RALPH_PROJECT_ROOT` / `SCRIPT_DIR` relative) highlighted in drift report D15.
  - **Scope:**
    - `templates/ralph/verifier.sh`
    - `templates/ralph/config/non_cacheable_tools.txt` (must already exist from 24.3.1)
  - **Non-goals:**
    - Do not revert template root detection to Brain’s `$SCRIPT_DIR/../..` behavior.
    - Do not change Brain `workers/ralph/verifier.sh` in this task.
  - **Interfaces/Assumptions:**
    - 24.3.1 complete (config file exists).
    - A1 canonical layout.
  - **Steps:**
    1. Diff caching-related sections from `workers/ralph/verifier.sh`.
    2. Port cache key generation and lookup/store logic.
    3. Confirm root/path logic matches the template’s already-fixed version.
  - **Acceptance Criteria:**
    - `bash -n templates/ralph/verifier.sh` passes.
    - `rg -n "RALPH_PROJECT_ROOT" templates/ralph/verifier.sh` matches.
    - `rg -n "cache" templates/ralph/verifier.sh` shows caching logic present (human review allowed, but must be visible via grep).

### Phase 24.9: Observability Convenience (task monitor)

- [ ] **24.9.1** Backport `current_ralph_tasks.sh` parsing improvements into templates
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
