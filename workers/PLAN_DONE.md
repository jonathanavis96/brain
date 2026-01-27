# PLAN_DONE - Archived Completed Tasks

Completed tasks from `workers/IMPLEMENTATION_PLAN.md` are archived here.

---

## Archived on 2026-01-26 (Set 1)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 23.1.1 | - [x] **23.1.1** Fix `sync_completions_to_cortex.sh` unbound variable **[HIGH]** |
| 2026-01-26 | 23.1.2 | - [x] **23.1.2** Untrack rollflow cache sqlite files and ensure ignored **[HIGH]** |
| 2026-01-26 | 23.2.1 | - [x] **23.2.1** Replace `git add -A` with scoped staging allowlist/denylist **[HIGH]**<br>- [x] `git add -A` no longer used<br>- [x] Core files always staged (IMPLEMENTATION_PLAN.md, THUNK.md)<br>- [x] Artifacts excluded by default<br>- [x] Cortex copies excluded by default<br>- [x] Cache files excluded by default<br>- [x] Hash regenerated in all `.verify/` directories |
| 2026-01-26 | 23.3.1 | - [x] **23.3.1** Make `cortex/snapshot.sh` avoid regenerating dashboard/metrics by default **[MEDIUM]** |
| 2026-01-26 | 23.3.2 | - [x] **23.3.2** Pass changed `.md` files to fix-markdown instead of scanning repo root **[MEDIUM]** |
| 2026-01-26 | 23.4.1 | - [x] **23.4.1** Add PROMPT instruction: check THUNK before re-validating tasks **[LOW]** |
| 2026-01-26 | 9C.0.3 | - [x] **9C.0.3** Document RovoDev tool instrumentation limitation |
| 2026-01-26 | 9C.1.1 | - [x] **9C.1.1** Enhance `cortex/snapshot.sh` with batching hints |
| 2026-01-26 | 9C.1.2 | - [x] **9C.1.2** Document `[S/M/L]` complexity convention for task estimation |
| 2026-01-26 | 9C.2.1 | - [x] **9C.2.1** Create batch task template in `templates/ralph/PROMPT.md` |
| 2026-01-26 | 9C.2.2 | - [x] **9C.2.2** BATCH: Create missing language templates (javascript, go, website) |
| 2026-01-26 | 9C.2.B2 | - [x] **9C.2.B2** BATCH: Update skills documentation (combines 7.2.1, 7.2.2) |
| 2026-01-26 | 9C.2.B3 | - [x] **9C.2.B3** BATCH: Improve onboarding docs (combines 7.1.1, 7.1.2) |
| 2026-01-26 | 9C.3.1 | - [x] **9C.3.1** Add duration tracking to `current_ralph_tasks.sh` footer |
| 2026-01-26 | 9C.3.2 | - [x] **9C.3.2** Create decomposition checklist in `skills/playbooks/` |
| 2026-01-26 | 22.2.3 | - [x] **22.2.3** Fix MD056 in workers/ralph/THUNK.md line 801 (escape pipes) |

### Archived on 2026-01-26 (Set 2)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 24.1.1 | - [x] **24.1.1** Find exact emitter of "Session termination failed: 404" **[HIGH]** |
| 2026-01-26 | 24.1.2 | - [x] **24.1.2** Trace session lifecycle and termination call path **[HIGH]** |
| 2026-01-26 | 24.1.3 | - [x] **24.1.3** Capture minimal reproduction log snippet **[HIGH]** |
| 2026-01-26 | 24.1.4 | - [x] **24.1.4** Classify 404 as harmless-noise vs actionable-bug **[HIGH]** |
| 2026-01-26 | 24.2.1 | - [x] **24.2.1** Instrument emitter with contextual info **[MEDIUM]** |
| 2026-01-26 | 24.2.2 | - [x] **24.2.2** Add dedupe/throttle for repeated identical errors **[MEDIUM]** |
| 2026-01-26 | 24.2.3 | - [x] **24.2.3** Add DEBUG/VERBOSE toggle for full error output **[LOW]** |
| 2026-01-26 | 24.3.1 | - [x] **24.3.1** FIX IF: Double-termination / already-cleaned session **[MEDIUM]** |
| 2026-01-26 | 24.3.2 | - [x] **24.3.2** FIX IF: Stale/invalid session ID **[MEDIUM]** |
| 2026-01-26 | 24.3.4 | - [x] **24.3.4** FIX IF: External best-effort cleanup (expected 404) **[MEDIUM]** |

### Archived on 2026-01-26 (Set 3)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 24.3.3 | - [x] **24.3.3** FIX IF: Wrong endpoint/path **[MEDIUM]** |
| 2026-01-26 | 24.4.1 | - [x] **24.4.1** Document PLAN-ONLY boundary rules in AGENTS.md **[HIGH]** |
| 2026-01-26 | 24.4.2 | - [x] **24.4.2** Add PLAN-ONLY guard function to shared lib **[MEDIUM]** |
| 2026-01-26 | 24.4.4 | - [x] **24.4.4** Add acceptance test proving PLAN-ONLY mode is respected **[HIGH]** |
| 2026-01-26 | - [x] Emitter identified and documented in THUNK | - [x] Emitter identified and documented in THUNK |
| 2026-01-26 | - [x] Root cause classified as HARMLESS-NOISE or ACTIONABLE-BUG with evidence | - [x] Root cause classified as HARMLESS-NOISE or ACTIONABLE-BUG with evidence |
| 2026-01-26 | - [x] Appropriate fix branch completed (one of 24.3.1-24.3.4) | - [x] Appropriate fix branch completed (one of 24.3.1-24.3.4) |
| 2026-01-26 | - [x] Spam reduced: normal runs show 1 contextual message + suppressed summary | - [x] Spam reduced: normal runs show 1 contextual message + suppressed summary |
| 2026-01-26 | - [x] PLAN-ONLY guardrails documented and implemented | - [x] PLAN-ONLY guardrails documented and implemented |
| 2026-01-26 | - [x] Guard function tested: blocks forbidden actions, allows reads | - [x] Guard function tested: blocks forbidden actions, allows reads |
| 2026-01-26 | 23.2.3 | - [x] **23.2.3** Fix cleanup_plan.sh to reliably locate workers/IMPLEMENTATION_PLAN.md **[HIGH]** |
| 2026-01-26 | 21.3.3 | - [x] **21.3.3** Add tools reference to `skills/index.md` [LOW] |
| 2026-01-26 | 22.3.1 | - [x] **22.3.1** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 159 |
| 2026-01-26 | 22.3.2 | - [x] **22.3.2** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 241 |
| 2026-01-26 | 22.3.3 | - [x] **22.3.3** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 295 |
| 2026-01-26 | 22.4.1 | - [x] **22.4.1** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 159 |
| 2026-01-26 | 22.4.2 | - [x] **22.4.2** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 241 |
| 2026-01-26 | 22.4.3 | - [x] **22.4.3** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 295 |

### Archived on 2026-01-26 (Set 4)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 23.2.2 | - [x] **23.2.2** End-of-loop cleanup when no unchecked tasks remain **[MEDIUM]** |
| 2026-01-26 | 9C.4.1 | - [x] **9C.4.1** Validate batching recommendations against next 5 iterations |
| 2026-01-26 | 22.4B.1 | - [x] **22.4B.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 261 |
| 2026-01-26 | 22.4B.2 | - [x] **22.4B.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 290 |
| 2026-01-26 | 22.4B.3 | - [x] **22.4B.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 315 |
| 2026-01-26 | 22.4B.4 | - [x] **22.4B.4** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 319 |
| 2026-01-26 | 22.4B.5 | - [x] **22.4B.5** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 320 |
| 2026-01-26 | 22.4B.6 | - [x] **22.4B.6** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 321 |
| 2026-01-26 | 22.4B.7 | - [x] **22.4B.7** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 325 |
| 2026-01-26 | 22.4C.1 | - [x] **22.4C.1** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 261 |
| 2026-01-26 | 22.4C.2 | - [x] **22.4C.2** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 290 |
| 2026-01-26 | 22.4C.3 | - [x] **22.4C.3** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 315 |
| 2026-01-26 | 22.4C.4 | - [x] **22.4C.4** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 319 |
| 2026-01-26 | 22.4C.5 | - [x] **22.4C.5** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 320 |
| 2026-01-26 | 22.4C.6 | - [x] **22.4C.6** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 321 |
| 2026-01-26 | 22.4C.7 | - [x] **22.4C.7** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 325 |
| 2026-01-26 | 22.5.1 | - [x] **22.5.1** Fix MD024 in cortex/PLAN_DONE.md line 186 |
| 2026-01-26 | 22.5.2 | - [x] **22.5.2** Fix MD024 in cortex/PLAN_DONE.md line 210 |
| 2026-01-26 | 22.5.3 | - [x] **22.5.3** Fix MD024 in cortex/PLAN_DONE.md line 221 |
| 2026-01-26 | 22.6.1 | - [x] **22.6.1** Fix MD001 in workers/PLAN_DONE.md (line numbers refer to file state at the time of the original issue) |
| 2026-01-26 | 22.7.1 | - [x] **22.7.1** Fix MD024 in cortex/PLAN_DONE.md line 186 |
| 2026-01-26 | 22.7.2 | - [x] **22.7.2** Fix MD024 in cortex/PLAN_DONE.md line 210 |
| 2026-01-26 | 22.7.3 | - [x] **22.7.3** Fix MD024 in cortex/PLAN_DONE.md line 221 |
| 2026-01-26 | 22.8.1 | - [x] **22.8.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md lines 31-33 |
| 2026-01-26 | 22.8.2 | - [x] **22.8.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md lines 39-40 |

### Archived on 2026-01-27

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 22.8.3 | - [x] **22.8.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 48 |
| 2026-01-27 | 22.9.1 | - [x] **22.9.1** Fix MD055/MD056 in workers/ralph/THUNK.md lines 815-828 |
| 2026-01-27 | 22.10.1 | - [x] **22.10.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 32 |
| 2026-01-27 | 22.10.2 | - [x] **22.10.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 111 |
| 2026-01-27 | 22.10.3 | - [x] **22.10.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 112 |
| 2026-01-27 | 22.10.4 | - [x] **22.10.4** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 116 |
| 2026-01-27 | 22.10.5 | - [x] **22.10.5** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 117 |
| 2026-01-27 | 22.11.1 | - [x] **22.11.1** Fix MD024 in workers/PLAN_DONE.md line 49 |

### Archived on 2026-01-27 (Batch 2)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 0.L.1 | - [x] **0.L.1** Fix MD024 in cortex/PLAN_DONE.md (duplicate heading "Archived on 2026-01-26") |
| 2026-01-27 | 0.L.2 | - [x] **0.L.2** Fix MD056 table column count errors in TEMPLATE_DRIFT_REPORT.md |
| 2026-01-27 | 0.L.3 | - [x] **0.L.3** Fix MD032 blank line errors in TEMPLATE_DRIFT_REPORT.md |
| 2026-01-27 | 0.L.4 | - [x] **0.L.4** Fix MD009 trailing spaces in TEMPLATE_DRIFT_REPORT.md |
| 2026-01-27 | 0.L.5 | - [x] **0.L.5** Fix MD040 missing language in TEMPLATE_DRIFT_REPORT.md |

### Archived on 2026-01-27 (Batch 3)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 0.L.6 | - [x] **0.L.6** Fix MD056 table column count errors in workers/ralph/THUNK.md |
| 2026-01-27 | 0.L.7 | - [x] **0.L.7** Fix MD012 in workers/IMPLEMENTATION_PLAN.md lines 25-28 |
| 2026-01-27 | 0.L.8 | - [x] **0.L.8** Fix MD024 in workers/PLAN_DONE.md line 109 |
| 2026-01-27 | - [x] Backend can be started in WSL2 and serves `GET /health` successfully. | - [x] Backend can be started in WSL2 and serves `GET /health` successfully. |
| 2026-01-27 | 25.1.1 | - [x] **25.1.1** Scaffold Brain Map app workspace (frontend + backend skeleton) |
| 2026-01-27 | 25.1.2 | - [x] **25.1.2** Define Markdown note discovery + loading (scan notes root) |
| 2026-01-27 | 25.1.3 | - [x] **25.1.3** Implement canonical frontmatter parser and validator |
| 2026-01-27 |     - [x] Required keys enforced per type. |     - [x] Required keys enforced per type. |
| 2026-01-27 |     - [x] Invalid enums are hard errors. |     - [x] Invalid enums are hard errors. |
| 2026-01-27 |     - [x] `TaskContract` without `acceptance_criteria` is a hard error. |     - [x] `TaskContract` without `acceptance_criteria` is a hard error. |
| 2026-01-27 |     - [x] Unknown fields are preserved (round-trip safety policy documented in tests). |     - [x] Unknown fields are preserved (round-trip safety policy documented in tests). |
| 2026-01-27 | 25.1.4 | - [x] **25.1.4** Build SQLite schema and deterministic index rebuild |
| 2026-01-27 |     - [x] Index rebuild is deterministic and idempotent. |     - [x] Index rebuild is deterministic and idempotent. |
| 2026-01-27 |     - [x] Duplicate ids are a hard error and prevent publishing a new index. |     - [x] Duplicate ids are a hard error and prevent publishing a new index. |
| 2026-01-27 |     - [x] Last known-good index remains usable if rebuild fails. |     - [x] Last known-good index remains usable if rebuild fails. |
| 2026-01-27 | 25.1.5 | - [x] **25.1.5** Implement `/search` endpoint using the index (fast global search) |

### Archived on 2026-01-27 (Batch 4)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | WARN.MD046.workers/IMPLEMENTATION_PLAN.md | - [x] **WARN.MD046.workers/IMPLEMENTATION_PLAN.md** - Fix MD046/code-block-style at line 49 (Expected: fenced; Actual: indented) |
| 2026-01-27 | WARN.MD007.workers/IMPLEMENTATION_PLAN.md | - [x] **WARN.MD007.workers/IMPLEMENTATION_PLAN.md** - Fix MD007/ul-indent errors at lines 52-75 (unordered list indentation) |
| 2026-01-27 | WARN.MD032.workers/IMPLEMENTATION_PLAN.md | - [x] **WARN.MD032.workers/IMPLEMENTATION_PLAN.md** - Fix MD032/blanks-around-lists at line 52 (lists should be surrounded by blank lines) |
| 2026-01-27 | WARN.MD005.workers/IMPLEMENTATION_PLAN.md | - [x] **WARN.MD005.workers/IMPLEMENTATION_PLAN.md** - Fix MD005/list-indent errors at lines 77-238 (inconsistent indentation for list items) |
| 2026-01-27 | WARN.MD012.workers/IMPLEMENTATION_PLAN.md | - [x] **WARN.MD012.workers/IMPLEMENTATION_PLAN.md** - Fix MD012/no-multiple-blanks at line 68 (Expected: 2; Actual: 3) |
| 2026-01-27 | WARN.MD024.workers/PLAN_DONE.md | - [x] **WARN.MD024.workers/PLAN_DONE.md** - Fix MD024/no-duplicate-heading at line 119 (Multiple headings with same content "Archived on 2026-01-27") |
| 2026-01-27 | - [x] Markdown-first notes exist under `app/brain-map/notes/` and are treated as the canonical source of truth. | - [x] Markdown-first notes exist under `app/brain-map/notes/` and are treated as the canonical source of truth. |
| 2026-01-27 | - [x] A deterministic index rebuild can be run that produces a local SQLite index at `app/brain-map/.local/index.db`. | - [x] A deterministic index rebuild can be run that produces a local SQLite index at `app/brain-map/.local/index.db`. |
| 2026-01-27 | - [x] Frontend dev server starts and serves on port 5173 (or documented override). | - [x] Frontend dev server starts and serves on port 5173 (or documented override). |
| 2026-01-27 | - [x] Backend dev server starts and serves on port 8000 (or documented override). | - [x] Backend dev server starts and serves on port 8000 (or documented override). |
| 2026-01-27 | - [x] `GET /health` returns 200 with expected JSON shape. | - [x] `GET /health` returns 200 with expected JSON shape. |
| 2026-01-27 | 25.1.6 | - [x] **25.1.6** Implement `/graph` endpoint (graph snapshot for UI) |
| 2026-01-27 |     - [x] Nodes/edges returned in deterministic order. |     - [x] Nodes/edges returned in deterministic order. |
| 2026-01-27 |     - [x] Filters and pagination behave as specified. |     - [x] Filters and pagination behave as specified. |
| 2026-01-27 |     - [x] `metrics` object present for each node (`density/recency/task` present as float or null). |     - [x] `metrics` object present for each node (`density/recency/task` present as float or null). |
| 2026-01-27 | 25.1.7 | - [x] **25.1.7** Implement `/node/{id}` read endpoint |
| 2026-01-27 | 25.1.8 | - [x] **25.1.8** Implement node create (`POST /node`) with markdown-first write + reindex |
| 2026-01-27 | 25.1.9 | - [x] **25.1.9** Implement node update (`PUT /node/{id}`) with atomic write + reindex |
| 2026-01-27 | 25.1.10 | - [x] **25.1.10** Implement `/generate-plan` endpoint (deterministic markdown + optional write) |

### Archived on 2026-01-27 (Batch 5 - Morning)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | - [x] Backend exposes MVP API endpoints as specified in `docs/brain-map/brain-map-spec.md`: | - [x] Backend exposes MVP API endpoints as specified in `docs/brain-map/brain-map-spec.md`: |
| 2026-01-27 |   - [x] `GET /graph` |   - [x] `GET /graph` |
| 2026-01-27 |   - [x] `GET /node/{id}` |   - [x] `GET /node/{id}` |
| 2026-01-27 |   - [x] `POST /node` |   - [x] `POST /node` |
| 2026-01-27 |   - [x] `PUT /node/{id}` |   - [x] `PUT /node/{id}` |
| 2026-01-27 |   - [x] `GET /search` |   - [x] `GET /search` |
| 2026-01-27 |   - [x] `POST /generate-plan` |   - [x] `POST /generate-plan` |
| 2026-01-27 | - [x] UI can be started and loaded in a Windows browser and calls the backend successfully. | - [x] UI can be started and loaded in a Windows browser and calls the backend successfully. |
| 2026-01-27 | - [x] UI renders a graph view (sigma.js) from `GET /graph`. | - [x] UI renders a graph view (sigma.js) from `GET /graph`. |
| 2026-01-27 | - [x] UI supports selecting a node and viewing/editing details (via `GET /node/{id}` + `PUT /node/{id}`). | - [x] UI supports selecting a node and viewing/editing details (via `GET /node/{id}` + `PUT /node/{id}`). |
| 2026-01-27 | - [x] UI supports fast search (Ctrl+K) via `GET /search`. | - [x] UI supports fast search (Ctrl+K) via `GET /search`. |
| 2026-01-27 | - [x] UI supports basic recency heat overlay (even if simple). | - [x] UI supports basic recency heat overlay (even if simple). |
| 2026-01-27 | - [x] UI supports generating a plan from selected nodes and shows returned markdown (via `POST /generate-plan`). | - [x] UI supports generating a plan from selected nodes and shows returned markdown (via `POST /generate-plan`). |
| 2026-01-27 | - [x] Notes are discovered recursively. | - [x] Notes are discovered recursively. |
| 2026-01-27 | - [x] Non-markdown files are ignored. | - [x] Non-markdown files are ignored. |
| 2026-01-27 | - [x] Discovery order is deterministic (sorted by repo-root-relative path). | - [x] Discovery order is deterministic (sorted by repo-root-relative path). |
| 2026-01-27 | 25.1.11 | - [x] **25.1.11** Frontend: Graph view rendering from `/graph` (sigma.js) |
| 2026-01-27 |     - [x] Graph renders with at least dozens of nodes without freezing. |     - [x] Graph renders with at least dozens of nodes without freezing. |
| 2026-01-27 |     - [x] Clicking a node selects it and triggers node detail fetch. |     - [x] Clicking a node selects it and triggers node detail fetch. |
| 2026-01-27 | 25.1.12 | - [x] **25.1.12** Frontend: Node detail panel (read + edit + save) |
| 2026-01-27 | 25.1.13 | - [x] **25.1.13** Frontend: Search palette (Ctrl+K) via `/search` |

### Archived on 2026-01-27 (Batch 6)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | WARN.MD024.workers/PLAN_DONE.md-line140 | - [x] **WARN.MD024.workers/PLAN_DONE.md-line140** Fix MD024/no-duplicate-heading in workers/PLAN_DONE.md:140 |
| 2026-01-27 | WARN.MD024.workers/PLAN_DONE.md-line164 | - [x] **WARN.MD024.workers/PLAN_DONE.md-line164** Fix MD024/no-duplicate-heading in workers/PLAN_DONE.md:164 |
| 2026-01-27 | WARN.MD056.workers/ralph/THUNK.md-line864 | - [x] **WARN.MD056.workers/ralph/THUNK.md-line864** Fix MD056/table-column-count in workers/ralph/THUNK.md:864 |
| 2026-01-27 | WARN.MD056.workers/ralph/THUNK.md-line865 | - [x] **WARN.MD056.workers/ralph/THUNK.md-line865** Fix MD056/table-column-count in workers/ralph/THUNK.md:865 |
| 2026-01-27 | WARN.MD056.workers/ralph/THUNK.md-line866 | - [x] **WARN.MD056.workers/ralph/THUNK.md-line866** Fix MD056/table-column-count in workers/ralph/THUNK.md:866 |
| 2026-01-27 | WARN.MD056.workers/ralph/THUNK.md-line867 | - [x] **WARN.MD056.workers/ralph/THUNK.md-line867** Fix MD056/table-column-count in workers/ralph/THUNK.md:867 |
| 2026-01-27 | WARN.MD056.workers/ralph/THUNK.md-line868 | - [x] **WARN.MD056.workers/ralph/THUNK.md-line868** Fix MD056/table-column-count in workers/ralph/THUNK.md:868 |
| 2026-01-27 | - [x] Supports `type/status/tags/updated_since/updated_within_days` filters. | - [x] Supports `type/status/tags/updated_since/updated_within_days` filters. |
| 2026-01-27 |   - [x] Supports `limit` and `offset`. |   - [x] Supports `limit` and `offset`. |
| 2026-01-27 |   - [x] Stable tie-break ordering for equal scores. |   - [x] Stable tie-break ordering for equal scores. |
| 2026-01-27 | 25.1.14 | - [x] **25.1.14** Frontend: Basic recency heat overlay toggle |
| 2026-01-27 | 25.1.15 | - [x] **25.1.15** Frontend: Generate plan wizard (minimal) using `/generate-plan` |
| 2026-01-27 | 25.2.1 | - [x] **25.2.1** Backend: compute and return recency heat deterministically |
| 2026-01-27 | 25.2.2 | - [x] **25.2.2** Backend: density heat (degree + clustering coefficient) with caching |
| 2026-01-27 | 25.2.3 | - [x] **25.2.3** Backend: task heat based on TaskContract neighborhood |
| 2026-01-27 | 25.2.4 | - [x] **25.2.4** Frontend: hotspots / insights panel (top N) |

### Archived on 2026-01-27 (Batch 7)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 25.2.5 | - [x] **25.2.5** Frontend: filtering controls (type/status/tags/recency) |
| 2026-01-27 | 25.2.6 | - [x] **25.2.6** Backend: file watcher + incremental reindex |
| 2026-01-27 | 25.3.1 | - [x] **25.3.1** Frontend: semantic zoom + clustering (supernodes) |
| 2026-01-27 | 25.3.2 | - [x] **25.3.2** Backend: dependency analysis (cycles, critical path hints) |
| 2026-01-27 | 25.3.3 | - [x] **25.3.3** Plan generator improvements (toposort, richer dependency sections) |

### Archived on 2026-01-27 (Batch 8)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 0.1.IMPL_PLAN.117 | - [x] **0.1.IMPL_PLAN.117** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 117 |
| 2026-01-27 | 0.2.IMPL_PLAN.118 | - [x] **0.2.IMPL_PLAN.118** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 118 |
| 2026-01-27 | 0.3.IMPL_PLAN.122 | - [x] **0.3.IMPL_PLAN.122** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 122 |
| 2026-01-27 | 0.4.IMPL_PLAN.123 | - [x] **0.4.IMPL_PLAN.123** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 123 |
| 2026-01-27 | 0.5.IMPL_PLAN.164 | - [x] **0.5.IMPL_PLAN.164** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 164 |
| 2026-01-27 | 0.6.IMPL_PLAN.165 | - [x] **0.6.IMPL_PLAN.165** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 165 |
| 2026-01-27 | 0.7.PLAN_DONE.211 | - [x] **0.7.PLAN_DONE.211** Fix MD024 in workers/PLAN_DONE.md line 211 |
| 2026-01-27 | 0.8.THUNK.897 | - [x] **0.8.THUNK.897** Fix MD056 in workers/ralph/THUNK.md line 897 |
| 2026-01-27 | 0.9.THUNK.898 | - [x] **0.9.THUNK.898** Fix MD056 in workers/ralph/THUNK.md line 898 |
| 2026-01-27 | 0.10.THUNK.899 | - [x] **0.10.THUNK.899** Fix MD056 in workers/ralph/THUNK.md line 899 |
| 2026-01-27 | 24.5.1 | - [x] **24.5.1** Decide + (if approved) template `render_ac_status.sh` |
| 2026-01-27 | 24.6.1 | - [x] **24.6.1** Align model-header single-source-of-truth + prompt batching rule across canonical files |
| 2026-01-27 | 24.7.1 | - [x] **24.7.1** Backport `loop.sh` scoped staging improvements into templates (without Brain-specific paths) |
| 2026-01-27 | 24.8.1 | - [x] **24.8.1** Backport verifier caching into templates without regressing A1 root/path logic |

### Archived on 2026-01-27 (Batch 9)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 26.1 | - [x] **26.1** Setup Python virtual environment for Brain Map backend |
| 2026-01-27 |   - [x] Unknown id returns 404 with canonical error shape. |   - [x] Unknown id returns 404 with canonical error shape. |
| 2026-01-27 |   - [x] Response includes `node` and `body_md` fields. |   - [x] Response includes `node` and `body_md` fields. |
| 2026-01-27 | 24.9.1 | - [x] **24.9.1** Backport `current_ralph_tasks.sh` parsing improvements into templates |

### Archived on 2026-01-27 (Batch 10)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 26.2 | - [x] **26.2** Verify all Brain Map backend tests pass |
| 2026-01-27 | 26.3 | - [x] **26.3** Add Brain Map test running to verifier (optional check) |

### Archived on 2026-01-27 (Batch 11)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 26.4 | - [x] **26.4** Document Brain Map development workflow |
| 2026-01-27 | 27.1 | - [x] **27.1** Review GAP_BACKLOG for P0/P1 items ready for promotion |
| 2026-01-27 | 27.2 | - [x] **27.2** Promote "Custom Semantic Code Review Tool (LLM-Based Linting)" gap |
| 2026-01-27 | 28.1 | - [x] **28.1** Audit templates for post-Phase-24 drift |

### Archived on 2026-01-27 (Batch 12)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | WARN.MD056.workers/ralph/THUNK.md.921 | - [x] **WARN.MD056.workers/ralph/THUNK.md.921** - Fix MD056/table-column-count in workers/ralph/THUNK.md line 921 (Expected: 5; Actual: 3) |
| 2026-01-27 | WARN.MD056.workers/ralph/THUNK.md.926 | - [x] **WARN.MD056.workers/ralph/THUNK.md.926** - Fix MD056/table-column-count in workers/ralph/THUNK.md line 926 (Expected: 5; Actual: 6) |
| 2026-01-27 | WARN.MD056.workers/ralph/THUNK.md.928 | - [x] **WARN.MD056.workers/ralph/THUNK.md.928** - Fix MD056/table-column-count in workers/ralph/THUNK.md line 928 (Expected: 5; Actual: 7) |

### Archived on 2026-01-27 12:40:49

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | WARN.MD024.cortex/PLAN_DONE.md | - [x] **WARN.MD024.cortex/PLAN_DONE.md** - Fix MD024/no-duplicate-heading in cortex/PLAN_DONE.md line 323 |
