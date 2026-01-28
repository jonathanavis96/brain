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

### Archived on 2026-01-27 12:59:42

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 0.W.3 | - [x] **0.W.3** Fix MD056 in workers/ralph/THUNK.md lines 931-932 |

### Archived on 2026-01-27 13:51:24 (Phase 25 acceptance criteria)

**Phase 25: Brain Map (MVP-first)** - All acceptance criteria verified complete via manual testing and THUNK evidence.

#### Phase 25.1: MVP

**Scaffolding & Discovery:**

- [x] Backend can be started: `cd app/brain-map/backend && python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- [x] Health endpoint: `curl -s http://localhost:8000/health | jq .` returns `{"status":"ok"}`
- [x] Frontend starts: `cd app/brain-map/frontend && npm install && npm run dev -- --host 0.0.0.0 --port 5173`
- [x] Markdown-first notes exist under `app/brain-map/notes/` (4 files discovered)
- [x] Notes treated as canonical source of truth
- [x] Recursive discovery with deterministic ordering (repo-root-relative paths)
- [x] Non-markdown files ignored (README.txt excluded)

**Search & API:**

- [x] Search endpoint: `curl -s "http://localhost:8000/search?q=brain&limit=5&offset=0" | jq .`
- [x] Returns ranked results with scores and stable tie-breaking
- [x] Supports filters: `type/status/tags/recency` with `limit` and `offset`

**Node CRUD:**

- [x] `POST /node` returns 201 with created id and source_path
- [x] Duplicate id conflicts return 409 with canonical error
- [x] System never corrupts markdown files (atomic writes)
- [x] `PUT /node/{id}` - attempt to change id rejected (400 validation error)
- [x] Unknown id returns 404
- [x] Atomic write guarantees preserved

**Generate Plan:**

- [x] `POST /generate-plan` returns deterministic markdown output
- [x] Same inputs + same index produce identical output (stable ordering)
- [x] Unknown selection id returns 404
- [x] Writing respects atomic file write
- [x] Graph traversal ordering deterministic (topological sort)

**Frontend UI:**

- [x] Editing title persists to disk (markdown file) and updates `updated_at`
- [x] UI surfaces validation errors using canonical error shape
- [x] Ctrl+K opens search palette
- [x] Selecting result focuses and selects the node
- [x] Recency heat toggle changes node rendering
- [x] Recently updated nodes appear hotter
- [x] User can select nodes and generate plan
- [x] Markdown preview matches backend response

#### Phase 25.2: V1

- [x] **25.2.1** Backend: compute and return recency heat deterministically
- [x] **25.2.2** Backend: density heat (degree + clustering coefficient) with caching
- [x] **25.2.3** Backend: task heat based on TaskContract neighborhood
- [x] **25.2.4** Frontend: hotspots / insights panel (top N)
- [x] **25.2.5** Frontend: filtering controls (type/status/tags/recency)
- [x] **25.2.6** Backend: file watcher + incremental reindex

#### Phase 25.3: V2

- [x] **25.3.1** Frontend: semantic zoom + clustering (supernodes)
- [x] **25.3.2** Backend: dependency analysis (cycles, critical path hints)
- [x] **25.3.3** Plan generator improvements (toposort, richer dependency sections)

### Archived on 2026-01-27 14:15:16

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | WARN.MD031.workers-impl | - [x] **WARN.MD031.workers-impl** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md |
| 2026-01-27 | WARN.MD031.cortex-impl | - [x] **WARN.MD031.cortex-impl** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md |
| 2026-01-27 | 29.2.1 | - [x] **29.2.1** Add `labelRenderedSizeThreshold: 8` to Sigma config in `GraphView.jsx` line 231-237 to auto-hide labels when nodes < 8px on screen. AC: When zoomed out, only large nodes show labels; when zoomed in, all labels visible. Verification: Manual test zoom behavior. If Blocked: Try threshold 6-12 |
| 2026-01-27 | 29.3.1 | - [x] **29.3.1** Make Hotspots collapsible - Wrap Hotspots section in `InsightsPanel.jsx` lines ~45-80 with `<details open><summary style={{cursor:'pointer'}}>🔥 Hotspots</summary>...</details>`. AC: User can click to collapse/expand. Verification: Manual test collapse → form fields fully visible. If Blocked: Move Hotspots to bottom of panel |
| 2026-01-27 | 30.1.1 | - [x] **30.1.1** Refactor cluster rebuild to use `showClusters` boolean |
| 2026-01-27 | 30.2.1 | - [x] **30.2.1** Add "Fit to Screen" button |
| 2026-01-27 | 30.2.2 | - [x] **30.2.2** Add zoom controls (+/- buttons) |

### Archived on 2026-01-27 16:11:07

| Date | Task ID | Description |
|------|---------|-------------|

### Archived on 2026-01-27 16:34:58

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 30.2.3 | - [x] **30.2.3** Add minimap or breadcrumb indicator |
| 2026-01-27 | 30.3.1 | - [x] **30.3.1** Implement hover-only label mode - Custom label reducer that renders labels only for `data.highlighted` or `data.hovered` nodes, add enterNode/leaveNode handlers to set hovered attribute. AC: Labels appear only on hover. Verification: Mouse over to label appears; move away to disappears. If Blocked: Lower priority; 29.2.1 threshold sufficient |
| 2026-01-27 | 30.3.2 | - [x] **30.3.2** Zoom-based label sizing - Set `labelSize: Math.max(10, Math.min(16, 12 * zoomLevel))` to scale font size with zoom level. AC: Labels grow/shrink as user zooms in/out. Verification: Zoom in → bigger labels; zoom out → smaller labels. If Blocked: Skip; static size fine for MVP |
| 2026-01-27 | 30.4.1 | - [x] **30.4.1** Fix `InsightsPanel` positioning (remove `position: fixed`) |
| 2026-01-27 | 30.4.2 | - [x] **30.4.2** Add proper scrolling to right panel |

### Archived on 2026-01-27 17:35:36

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 34.1.1 | - [x] **34.1.1** Create `bin/discord-post` with stdin input and chunking |
| 2026-01-27 | 34.1.2 | - [x] **34.1.2** Add `generate_iteration_summary` function to `loop.sh` |
| 2026-01-27 | - [x] MVP complete: Discord posts after every iteration | - [x] MVP complete: Discord posts after every iteration |
| 2026-01-27 | - [x] Long summaries chunk correctly (≤2000 chars per message) | - [x] Long summaries chunk correctly (≤2000 chars per message) |
| 2026-01-27 | - [x] Missing/invalid webhook doesn't crash loop | - [x] Missing/invalid webhook doesn't crash loop |
| 2026-01-27 | - [x] Dry-run mode works for testing | - [x] Dry-run mode works for testing |
| 2026-01-27 | 31.1.1 | - [x] **31.1.1** Enforce canonical `type` + `status` enums end-to-end - Backend validation: `type ∈ {Inbox, Concept, System, Decision, TaskContract, Artifact}` and `status ∈ {idea, planned, active, blocked, done, archived}` with clear 400 errors; frontend dropdowns use exact values; node creation defaults: `type=Inbox`, `status=idea` when omitted. AC: Creating/updating node with invalid type/status returns 400 with allowed values; UI only allows allowed values. Verification: Try POST invalid type → 400; Quick Add shows dropdowns with exact enums. If Blocked: Add frontend dropdowns first, backend validation second |

### Archived on 2026-01-27 17:39:10

| Date | Task ID | Description |
|------|---------|-------------|

### Archived on 2026-01-27 17:56:12

| Date | Task ID | Description |
|------|---------|-------------|

### Archived on 2026-01-27 18:03:55

| Date | Task ID | Description |
|------|---------|-------------|

### Archived on 2026-01-27 18:40:00

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 34.1.3 | - [x] **34.1.3** Integrate Discord posting after `:::ITER_END:::` marker |
| 2026-01-27 | 34.1.4 | - [x] **34.1.4** Add manual verification tests |
| 2026-01-27 | 34.2.1 | - [x] **34.2.1** Add loop start notification |
| 2026-01-27 | 34.2.2 | - [x] **34.2.2** Add loop completion notification |
| 2026-01-27 | 34.2.3 | - [x] **34.2.3** Add verifier failure alerts |

### Archived on 2026-01-27 19:02:31

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 0.1.1 | - [x] **0.1.1** Fix MD032 errors in skills/domains/infrastructure/secrets-management.md |
| 2026-01-27 | 0.2.1 | - [x] **0.2.1** Fix MD046 code-block-style errors in workers/IMPLEMENTATION_PLAN.md |
| 2026-01-27 | 0.2.2 | - [x] **0.2.2** Fix MD007 ul-indent errors in workers/IMPLEMENTATION_PLAN.md |
| 2026-01-27 | 0.2.3 | - [x] **0.2.3** Fix MD032 blanks-around-lists errors in workers/IMPLEMENTATION_PLAN.md |
| 2026-01-27 | 34.3.1 | - [x] **34.3.1** Copy `bin/discord-post` to `templates/ralph/bin/` |
| 2026-01-27 | 34.3.2 | - [x] **34.3.2** Add Discord integration to `templates/ralph/loop.sh` |
| 2026-01-27 | 34.4.1 | - [x] **34.4.1** Update `workers/ralph/README.md` with Discord setup |
| 2026-01-27 | 34.4.2 | - [x] **34.4.2** Add Discord integration to skills |

### Archived on 2026-01-27 19:34:46

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | - [x] V1 milestones: Start/end/error notifications - Implemented in loop.sh (start, completion, verifier failures) | - [x] V1 milestones: Start/end/error notifications - Implemented in loop.sh (start, completion, verifier failures) |
| 2026-01-27 | - [x] Templates updated with Discord integration - templates/ralph/bin/discord-post and loop.sh updated | - [x] Templates updated with Discord integration - templates/ralph/bin/discord-post and loop.sh updated |
| 2026-01-27 | - [x] Documentation complete - README.md, discord-webhook-patterns.md, secrets-management.md | - [x] Documentation complete - README.md, discord-webhook-patterns.md, secrets-management.md |
| 2026-01-27 | 31.1.2 | - [x] **31.1.2** Implement Inbox-first capture defaults + "Promote" action in node detail - Quick Add defaults to Inbox/idea unless user chooses; Node Detail panel adds "Promote" button that converts `type: Inbox → {Concept\|System\|Decision\|TaskContract\|Artifact}` without changing `id` and preserves existing fields. AC: Promote does not change id; type updates in markdown frontmatter; graph refresh shows new type color. Verification: Create Inbox node, promote to Concept, refresh → same id, new type. If Blocked: Implement promotion as a "Type" dropdown change gated by `currentType===Inbox` |
| 2026-01-27 | 31.1.3 | - [x] **31.1.3** Bulk triage for Inbox - Add left sidebar filter preset "Inbox" (type=Inbox) + sort-by-recency; add multi-action bar for selected Inbox nodes: Promote (choose target type), Archive (status=archived). AC: User can filter to Inbox, select multiple, and promote/archive in one action. Verification: Filter Inbox → select 3 → archive → nodes now have status archived and disappear from default view. If Blocked: Start with single-node promote/archive actions |
| 2026-01-27 | 31.1.4 | - [x] **31.1.4** Relationship editor in Node Detail panel (typed, directional) - Add UI to view outbound and inbound relationships for the selected node; add "Add relationship" control: choose relation type, search-by-title (autocomplete), store target by `id`; backend updates frontmatter relationships; graph refresh renders edge with type label/color. AC: Can add relationship from detail panel without drag-to-link; inbound/outbound lists show correct nodes. Verification: Add relationship A -[blocks]-> B from panel → edge appears; open B → inbound shows A. If Blocked: Implement outbound-only editor first, inbound list computed from graph |
| 2026-01-27 | 31.1.5 | - [x] **31.1.5** Multi-select (Shift-click) + bulk operations hook - Implement shift-click multi-select in graph; selection list shown in side panel; add "Generate plan from selection" button (can call existing plan endpoint later, or just collect IDs now). AC: User can select multiple nodes; selection persists until cleared; list of selected IDs visible. Verification: Shift-click 5 nodes → selection count updates; click Clear → selection resets. If Blocked: Implement multi-select in sidebar list first (without graph shift-click) |
| 2026-01-27 | 31.1.6 | - [x] **31.1.6** Heat overlay: multi-metric toggle + legend - UI toggle for heat metric: density/recency/task; add legend explaining color/halo intensity scale; ensure node halo/glow reflects selected metric. AC: Switching metric changes halo intensity; legend visible and updates labels. Verification: Toggle metric → node halos change; legend shows 0..1 scale and metric description. If Blocked: Legend-only first, then add density/task toggles once metrics are wired |
| 2026-01-27 | 31.1.7 | - [x] **31.1.7** (Optional) Priority + risk fields - Add `priority ∈ {P0,P1,P2,P3}` and `risk ∈ {low,medium,high}` validation + dropdowns; persist in frontmatter and show in filters. AC: Dropdowns present and values validated. Verification: Set priority P0 → saved to markdown. If Blocked: Defer to Phase 32 |
| 2026-01-27 | 31.2.1 | - [x] **31.2.1** Replace InsightsPanel with QuickAddPanel - Create new `QuickAddPanel.jsx` component with form fields (Title, Body, Type, Status, Tags), replace InsightsPanel in App.jsx right sidebar. AC: Right panel shows Quick Add form. Verification: Load app → see create form on right. If Blocked: Keep both panels, add mode toggle |
| 2026-01-27 | 31.2.2 | - [x] **31.2.2** Implement Quick Add form with Enter key support - Title input (required, Enter → focus Body), Body textarea (required, Ctrl/Cmd+Enter → submit), Type dropdown (optional, default "note"), Status input (optional, default "active"), Tags input (optional, comma-separated). AC: Press Enter in Title → focuses Body; Ctrl+Enter in Body → creates node. Verification: Fill form, Ctrl+Enter → node created. If Blocked: Use button-only submission |
| 2026-01-27 | 31.2.3 | - [x] **31.2.3** Add "Click to Place" mode - Button activates click-to-place mode, cursor changes to crosshair, click on graph → POST `/node` with title/body/position, place node at clicked coordinates. AC: Click button → cursor changes; click graph → node appears at click location. Verification: Click to Place → click graph → node placed exactly there. If Blocked: Use center placement only |

### Archived on 2026-01-27 19:56:31

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 31.2.4 | - [x] **31.2.4** Add "Drag to Place" mode - Drag ghost node icon from Quick Add form onto graph, drop to place node at drop coordinates. AC: Drag ghost → shows preview; drop → creates node at drop location. Verification: Drag icon onto graph → node appears where dropped. If Blocked: Click to Place only |
| 2026-01-27 | 31.2.5 | - [x] **31.2.5** Add collapsible right sidebar - Small tab on right edge with collapse/expand icon, clicking collapses sidebar to edge (graph expands), clicking tab reopens. AC: Tab toggle works. Verification: Click tab → sidebar collapses; click again → reopens. If Blocked: Always visible (no collapse) |
| 2026-01-27 | 31.2.6 | - [x] **31.2.6** Add swipe gesture for mobile sidebar collapse - On mobile (<768px), swipe right-to-left on sidebar → collapses it, swipe left-to-right on collapsed tab → opens. AC: Swipe gestures work on mobile. Verification: Test on mobile → swipe collapses sidebar. If Blocked: Desktop tab-only, mobile uses hamburger menu |
| 2026-01-27 | 31.2.7 | - [x] **31.2.7** Clear form after node creation - After successful POST, clear Title/Body/Tags fields, show success toast "Node created", focus Title input for next note. AC: Form clears after create. Verification: Create node → form resets, ready for next. If Blocked: Manual clear only |
| 2026-01-27 | 31.2.8 | - [x] **31.2.8** Improve field labels - Change "ID" to "Node ID (auto-generated)", "Title" to "Note Title", "Body" to "Note Content (Markdown)", "Type" to "Node Type (optional)", "Status" to "Task Status (optional)", "Tags" to "Tags (comma-separated)". AC: Labels are clear and descriptive. Verification: Read form → labels self-explanatory. If Blocked: Tooltips instead |
| 2026-01-27 | 31.3.1 | - [x] **31.3.1** Enable Sigma drag mode - Set `sigma.setSetting('enableCameraMovement', false)` when dragging node, add `dragNode` and `dropNode` event handlers to GraphView.jsx. AC: User can click-drag node to new position. Verification: Drag node → position updates in real-time. If Blocked: Check Sigma docs for drag event API |
| 2026-01-27 | 31.3.2 | - [x] **31.3.2** Persist node positions to frontmatter - On `dropNode` event, POST to new `/node/{id}/position` endpoint with `{x, y}` coords, backend writes to markdown frontmatter `position: {x: 123, y: 456}`. AC: Reload page → node stays in dragged position. Verification: Drag node, refresh browser, node is in same spot. If Blocked: Store in localStorage as temporary solution |

### Archived on 2026-01-27 20:18:00

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 31.3.3 | - [x] **31.3.3** Add "Lock Layout" toggle - Button in top-right controls to switch between manual (draggable) and auto-layout (ForceAtlas2) modes. AC: Toggle on → nodes lockable; toggle off → force-directed layout resumes. Verification: Lock layout, drag nodes, unlock, nodes animate back to force positions. If Blocked: Default to manual mode only |
| 2026-01-27 | 31.3.4 | - [x] **31.3.4** Load saved positions on graph render - Backend includes `position` in `/graph` response, frontend uses saved coords if present (skip random x/y). AC: Nodes with saved positions render at those coords; unsaved nodes use force layout. Verification: Mix of saved/unsaved nodes renders correctly. If Blocked: All-or-nothing (either all manual or all auto) |
| 2026-01-27 | 31.4.1 | - [x] **31.4.1** Detect drag-for-link gesture - On node mousedown, check if Shift key held → enter link mode (show dashed line following cursor). AC: Shift+drag from node shows link preview line. Verification: Shift+drag → dashed line appears; release Shift → cancels. If Blocked: Use right-click drag as alternative trigger |
| 2026-01-27 | 31.4.2 | - [x] **31.4.2** Highlight link target on hover - During link drag, detect when cursor over another node → highlight target with glow effect. AC: Hover over target node → visual feedback. Verification: Drag link line over multiple nodes → each highlights. If Blocked: Skip hover feedback; just support drop |
| 2026-01-27 | 31.4.3 | - [x] **31.4.3** Create link on drop - On drop over target node, POST to `/node/{source_id}` with updated `links: [target_id]` array, backend updates source markdown frontmatter. AC: Drop creates link, graph refreshes showing new edge. Verification: Shift+drag node A to B → edge appears, markdown updated. If Blocked: Show "Link created" modal with undo button |
| 2026-01-27 | 31.4.4 | - [x] **31.4.4** Visual feedback for link creation - Toast notification on success ("Link created: A → B"), error handling for self-links or duplicates. AC: Success toast shows for 3 seconds. Verification: Create link → toast appears; try duplicate → error message. If Blocked: Console.log only |
| 2026-01-27 | 31.5.1 | - [x] **31.5.1** Implement dark theme CSS variables - Create theme object with light/dark palettes (background, text, panels, borders, node colors), apply via CSS-in-JS or style props. AC: Dark theme renders correctly (readable text, good contrast). Verification: Toggle theme → colors switch. If Blocked: Start with dark-only, add toggle later |
| 2026-01-27 | 31.5.2 | - [x] **31.5.2** Add theme toggle button - Sun/moon icon in header (top-right), onClick toggles theme and saves to localStorage. AC: Toggle persists across sessions. Verification: Set dark mode, refresh → still dark. If Blocked: Use browser `prefers-color-scheme` detection only |
| 2026-01-27 | 31.5.3 | - [x] **31.5.3** Adjust node colors for dark mode - Slightly desaturate node type colors for dark backgrounds (task green, concept blue, etc. → darker shades). AC: Node colors readable on dark canvas. Verification: Dark mode → all node types distinguishable. If Blocked: Keep light-mode colors, just change canvas background |

### Archived on 2026-01-27 20:45:33

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 31.5.4 | - [x] **31.5.4** Set dark mode as default - Initialize theme state to 'dark', show light mode as opt-in. AC: First load shows dark mode. Verification: Fresh browser session → dark mode active. If Blocked: Respect `prefers-color-scheme` instead of forcing dark |
| 2026-01-27 | 31.6.1 | - [x] **31.6.1** Move Hotspots component from InsightsPanel to FilterPanel - Cut Hotspots section from `InsightsPanel.jsx` lines 58-235, paste into `FilterPanel.jsx` after Recency dropdown (after line 157). AC: Hotspots appear in left sidebar below filters. Verification: Open app → Hotspots in left panel. If Blocked: Create duplicate initially, remove from right later |
| 2026-01-27 | 31.6.2 | - [x] **31.6.2** Style Hotspots for left sidebar - Match FilterPanel styling (compact, no wide padding), limit to top 5 hotspots with "Show more" expansion. AC: Hotspots fit naturally in left sidebar width (300px). Verification: Hotspots list doesn't overflow or break layout. If Blocked: Use accordion/collapse to save space |
| 2026-01-27 | 31.6.3 | - [x] **31.6.3** Update InsightsPanel layout - Remove empty space where Hotspots were, ensure form fields (ID, Title, Type, Status, Tags, Body) take full height. AC: Right panel shows node details only. Verification: Select node → right panel shows form fields cleanly. If Blocked: Keep old layout, hide Hotspots section |
| 2026-01-27 | 31.7.1 | - [x] **31.7.1** Add touch event handlers - Implement pinch-to-zoom (two-finger pinch), pan (single-finger drag on canvas), tap-to-select (single tap on node). AC: Pinch zoom works on mobile. Verification: Test on phone/tablet simulator → gestures work. If Blocked: Desktop-only for now, document mobile as Phase 34 |
| 2026-01-27 | 31.7.2 | - [x] **31.7.2** Optimize layout for mobile screens - Media queries for <768px width: collapse sidebars, show hamburger menu, make graph full-screen. AC: Mobile layout usable (no horizontal scroll). Verification: Resize browser to 375px width → UI adapts. If Blocked: Min-width warning ("Desktop recommended") |
| 2026-01-27 | 31.7.3 | - [x] **31.7.3** Add mobile-friendly controls - Larger touch targets (48px min), floating action buttons for zoom/fit-to-screen, bottom sheet for node details. AC: Controls tappable on mobile without precision. Verification: Tap controls on phone → no mis-taps. If Blocked: Increase button size only |
| 2026-01-27 | 31.7.4 | - [x] **31.7.4** Handle long-press for context menu - Long-press node → show context menu (Edit, Delete, Create Link, View Details). AC: Long-press triggers menu. Verification: Long-press node on mobile → menu appears. If Blocked: Skip context menu, use double-tap to edit |
| 2026-01-27 | 32.1.1 | - [x] **32.1.1** Add "Find Path" mode - Toolbar button activates path-finding mode, prompts "Select start node, then end node". AC: Click Find Path → mode activates. Verification: Button shows "active" state. If Blocked: Use command palette (Ctrl+P) instead |

### Archived on 2026-01-27 23:05:15

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 32.1.2 | - [x] **32.1.2** Implement shortest path algorithm - Backend endpoint `/path?from={id}&to={id}` returns shortest path using BFS/Dijkstra on edge graph. AC: Returns array of node IDs in path order. Verification: Request path between known nodes → correct path returned. If Blocked: Use graphology `shortestPath()` client-side |
| 2026-01-27 | 32.1.3 | - [x] **32.1.3** Highlight path on graph - Render path nodes with glow effect, edges in path with bright color (e.g., cyan), fade non-path elements. AC: Path visually distinct. Verification: Find path → highlighted nodes/edges clear. If Blocked: Just zoom to fit path nodes |
| 2026-01-27 | 32.1.4 | - [x] **32.1.4** Show path metadata - Display path length, intermediate nodes, estimated "semantic distance" (based on edge weights). AC: Path info panel shows details. Verification: Find path → see "4 hops via Node X, Y, Z". If Blocked: Just show node count |
| 2026-01-27 | 32.2.1 | - [x] **32.2.1** Implement auto-tagging suggestions - Backend analyzes node body text, suggests tags using keyword extraction (TF-IDF or simple regex). AC: API endpoint `/node/{id}/suggest-tags` returns tag array. Verification: Request suggestions for sample note → relevant tags returned. If Blocked: Use predefined tag dictionary matching |
| 2026-01-27 | 32.2.2 | - [x] **32.2.2** Orphan node detection - Backend identifies nodes with zero edges (in/out degree = 0), returns list via `/insights/orphans`. AC: Orphans endpoint works. Verification: Create isolated node → appears in orphans list. If Blocked: Client-side filter (graph.nodes.filter(n => graph.degree(n) === 0)) |

### Archived on 2026-01-27 23:12:54

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 0.1 | - [x] **0.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md:43 (Expected: 2; Actual: 3) |
| 2026-01-27 | 0.2 | - [x] **0.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md:44 (Expected: 2; Actual: 4) |
| 2026-01-27 | 0.3 | - [x] **0.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md:45 (Expected: 2; Actual: 5) |
| 2026-01-27 | 0.4 | - [x] **0.4** Fix MD012 in workers/IMPLEMENTATION_PLAN.md:51 (Expected: 2; Actual: 3) |
| 2026-01-27 | 32.2.3 | - [x] **32.2.3** Bridge node identification - Calculate betweenness centrality (nodes that connect disparate clusters), highlight top 5 in UI. AC: Bridge nodes marked with icon. Verification: Manually create bridge topology → correct nodes identified. If Blocked: Skip betweenness, use degree centrality (most connected) |

### Archived on 2026-01-27 23:27:28

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 32.2.4 | - [x] **32.2.4** Stale note alerts - Flag nodes with `updated_at > 90 days`, show in insights panel with "Update recommended". AC: Stale nodes listed. Verification: Create old note → appears in stale list. If Blocked: Use recency metric already implemented |
| 2026-01-27 | 32.3.1 | - [x] **32.3.1** Add "Save View" button - Captures current filter state + zoom + camera position, stores in localStorage with user-defined name. AC: Save View → prompts for name → saved. Verification: Save view "My Project" → appears in views list. If Blocked: Save filters only (not camera state) |
| 2026-01-27 | 32.3.2 | - [x] **32.3.2** Create Views dropdown in header - List of saved views, click to load (applies filters, restores camera). AC: Dropdown shows saved views. Verification: Load saved view → graph state restored. If Blocked: Use bookmarks panel in sidebar |
| 2026-01-27 | 32.3.3 | - [x] **32.3.3** Implement view sharing - "Share View" generates URL with encoded filter params (e.g., `/graph?view=base64encodedstate`). AC: Copy link, open in new tab → same view. Verification: Share link to another user → they see same filtered graph. If Blocked: Copy filter JSON to clipboard |
| 2026-01-27 | 32.3.4 | - [x] **32.3.4** Add default views - Preset views: "All Tasks", "Blocked Items", "Recent Activity (7d)", "Orphans". AC: Default views available on first load. Verification: Fresh session → 4 default views shown. If Blocked: Just document filter examples in help |

### Archived on 2026-01-27 23:33:17

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 32.4.1 | - [x] **32.4.1** Create filter chip UI - Drag-and-drop chips for filter criteria (Type=task, Status=blocked, Tags contains X, Recency=7d). AC: Filter chips render in panel. Verification: Add chips → filter updates. If Blocked: Use form inputs only (existing FilterPanel) |
| 2026-01-27 | 32.4.2 | - [x] **32.4.2** Implement AND/OR logic - Support complex queries: "(Type=task OR Type=decision) AND Status=active". AC: Boolean logic works. Verification: Build complex filter → correct nodes shown. If Blocked: AND-only logic (all conditions must match) |

### Archived on 2026-01-27 23:38:02

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 32.4.3 | - [x] **32.4.3** Add filter preview count - Show "X nodes match" before applying filter. AC: Preview count updates as chips change. Verification: Adjust filter → count updates live. If Blocked: Apply-then-count (no preview) |

### Archived on 2026-01-28 00:09:23

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-28 | 32.4.4 | - [x] **32.4.4** Save filter as named view - "Save as View" button in query builder creates reusable saved view. AC: Query builder state saved. Verification: Build complex query → save → reload → works. If Blocked: Manual JSON export |
| 2026-01-28 | 33.1.1 | - [x] **33.1.1** Add timeline scrubber component - Slider at bottom of graph showing date range (earliest to latest `created_at`), drag to filter nodes by date. AC: Scrubber renders with correct date range. Verification: Drag slider → nodes fade in/out. If Blocked: Use discrete buttons (Today, This Week, This Month, All Time) |
| 2026-01-28 | 33.1.2 | - [x] **33.1.2** Implement time-based filtering - As scrubber moves, filter nodes where `created_at <= selected_date`, animate nodes appearing/disappearing. AC: Time travel works. Verification: Scrub to past date → older nodes hidden. If Blocked: Show all nodes, just highlight time-filtered subset |
| 2026-01-28 | 33.1.3 | - [x] **33.1.3** Add "Play" animation - Auto-advance scrubber from start to end (1 second per week), show graph growing over time. AC: Play button animates timeline. Verification: Click Play → graph evolves. If Blocked: Manual scrub only |
| 2026-01-28 | 33.1.4 | - [x] **33.1.4** Activity heatmap calendar - GitHub-style contribution calendar showing days with most creates/updates. AC: Calendar renders with activity data. Verification: Click date → filters graph to that day. If Blocked: Skip calendar, use histogram chart |
| 2026-01-28 | 33.2.1 | - [x] **33.2.1** Add Comments tab to InsightsPanel - New tab (next to Details tab) showing threaded comments for selected node. AC: Tab switcher works. Verification: Click Comments → shows comment list. If Blocked: Single comment field (no threading) |
| 2026-01-28 | 33.2.2 | - [x] **33.2.2** Backend: Store comments in frontmatter - `comments: [{author, text, timestamp, replies: [...]}]` array in markdown. POST to `/node/{id}/comments`. AC: Comments persisted. Verification: Add comment → markdown updated. If Blocked: Use separate JSON file per node |
| 2026-01-28 | 33.2.3 | - [x] **33.2.3** Frontend: Render comment threads - Show comments in nested list, reply button adds to thread. AC: Threading works. Verification: Reply to comment → indented reply shown. If Blocked: Flat list (no replies) |
| 2026-01-28 | 33.2.4 | - [x] **33.2.4** Add mentions (@username) - Detect `@username` in comment text, notify mentioned user (if multi-user setup). AC: Mentions highlighted. Verification: Type @alice → suggestion appears. If Blocked: Plain text only |

### Archived on 2026-01-28 00:36:07

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-28 | 33.3.1 | - [x] **33.3.1** Export graph as PNG - Button in header "Export → PNG", renders current graph view to canvas, downloads as image file. AC: PNG export works. Verification: Click Export PNG → file downloads. If Blocked: Use screenshot library (html2canvas) |
| 2026-01-28 | 33.3.2 | - [x] **33.3.2** Export graph as SVG - Vector format export for high-quality prints/presentations. AC: SVG export works. Verification: Open SVG in Inkscape → editable vectors. If Blocked: PNG-only for MVP |
| 2026-01-28 | 33.3.3 | - [x] **33.3.3** Export as GraphML/GEXF - Standard graph formats for Gephi/Cytoscape import. AC: GraphML file valid. Verification: Import into Gephi → graph loads. If Blocked: Export JSON only |
| 2026-01-28 | 33.3.4 | - [x] **33.3.4** Markdown table export - Export filtered nodes as markdown table (ID, Title, Type, Status, Tags). AC: Table export works. Verification: Open in markdown editor → table renders. If Blocked: CSV export instead |
| 2026-01-28 | 33.4.1 | - [x] **33.4.1** Add "Present" button - Enters full-screen mode, hides UI panels, shows graph + navigation controls only. AC: Presentation mode toggles. Verification: Click Present → full-screen graph. If Blocked: Just hide sidebars (not true full-screen) |
| 2026-01-28 | 33.4.2 | - [x] **33.4.2** Keyboard navigation - Arrow keys navigate between connected nodes (follow edges), space bar zooms to focused node. AC: Keyboard nav works. Verification: Press Right → moves to connected node. If Blocked: Click-only navigation |

### Archived on 2026-01-28 10:18:54

| Date | Task ID | Description |
|------|---------|-------------|

### Archived on 2026-01-28 10:42:25

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-28 | 33.4.3 | - [x] **33.4.3** Slide-style transitions - Smooth camera animations between nodes, optional fade-in for node details. AC: Transitions smooth. Verification: Navigate nodes → camera pans smoothly. If Blocked: Instant jumps |
| 2026-01-28 | 33.4.4 | - [x] **33.4.4** Presenter notes - Optional notes field in node frontmatter (`presenter_notes: "..."`), shows in overlay during presentation. AC: Notes display. Verification: Add presenter notes → shows in present mode. If Blocked: Just show node body |
| 2026-01-28 | 33.5.1 | - [x] **33.5.1** Calculate graph metrics - Backend computes: node count, edge count, avg degree, orphan count, largest connected component, cluster count. AC: Metrics endpoint `/metrics`. Verification: Request metrics → JSON with stats. If Blocked: Client-side calculation |
| 2026-01-28 | 33.5.2 | - [x] **33.5.2** Graph health dashboard - Panel showing metrics + health score (0-100 based on connectivity), color-coded indicators. AC: Dashboard renders. Verification: Open dashboard → see metrics. If Blocked: Just show raw numbers |

### Archived on 2026-01-28 11:29:48

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-28 | 33.5.3 | - [x] **33.5.3** Actionable suggestions - "Link these 3 orphans", "Update 5 stale notes", "Merge duplicate tags". AC: Suggestions displayed. Verification: Graph with issues → suggestions appear. If Blocked: Manual review only |

### Archived on 2026-01-28 12:13:25

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-28 | WARN.MD032.workers-impl-69 | - [x] **WARN.MD032.workers-impl-69** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 69 - Add blank line before list |
| 2026-01-28 | WARN.MD031.workers-impl-81 | - [x] **WARN.MD031.workers-impl-81** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 81 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.workers-impl-92 | - [x] **WARN.MD031.workers-impl-92** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 92 - Add blank line after code fence |
| 2026-01-28 | WARN.MD031.workers-impl-97 | - [x] **WARN.MD031.workers-impl-97** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 97 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.workers-impl-126 | - [x] **WARN.MD031.workers-impl-126** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 126 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.workers-impl-156 | - [x] **WARN.MD031.workers-impl-156** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 156 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.workers-impl-186 | - [x] **WARN.MD031.workers-impl-186** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 186 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.workers-impl-188 | - [x] **WARN.MD031.workers-impl-188** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 188 - Add blank line after code fence |
| 2026-01-28 | WARN.MD031.workers-impl-192 | - [x] **WARN.MD031.workers-impl-192** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 192 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.workers-impl-220 | - [x] **WARN.MD031.workers-impl-220** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 220 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.workers-impl-224 | - [x] **WARN.MD031.workers-impl-224** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 224 - Add blank line after code fence |
| 2026-01-28 | WARN.MD032.workers-impl-260 | - [x] **WARN.MD032.workers-impl-260** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 260 - Add blank line before list |
| 2026-01-28 | WARN.MD032.workers-impl-265 | - [x] **WARN.MD032.workers-impl-265** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 265 - Add blank line before list |
| 2026-01-28 | WARN.MD032.cortex-impl-69 | - [x] **WARN.MD032.cortex-impl-69** Fix MD032/blanks-around-lists in cortex/IMPLEMENTATION_PLAN.md line 69 - Add blank line before list |
| 2026-01-28 | WARN.MD031.cortex-impl-81 | - [x] **WARN.MD031.cortex-impl-81** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 81 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.cortex-impl-92 | - [x] **WARN.MD031.cortex-impl-92** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 92 - Add blank line after code fence |
| 2026-01-28 | WARN.MD031.cortex-impl-97 | - [x] **WARN.MD031.cortex-impl-97** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 97 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.cortex-impl-126 | - [x] **WARN.MD031.cortex-impl-126** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 126 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.cortex-impl-156 | - [x] **WARN.MD031.cortex-impl-156** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 156 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.cortex-impl-186 | - [x] **WARN.MD031.cortex-impl-186** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 186 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.cortex-impl-188 | - [x] **WARN.MD031.cortex-impl-188** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 188 - Add blank line after code fence |
| 2026-01-28 | WARN.MD031.cortex-impl-192 | - [x] **WARN.MD031.cortex-impl-192** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 192 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.cortex-impl-220 | - [x] **WARN.MD031.cortex-impl-220** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 220 - Add blank line before code fence |
| 2026-01-28 | WARN.MD031.cortex-impl-224 | - [x] **WARN.MD031.cortex-impl-224** Fix MD031/blanks-around-fences in cortex/IMPLEMENTATION_PLAN.md line 224 - Add blank line after code fence |
| 2026-01-28 | WARN.MD032.cortex-impl-260 | - [x] **WARN.MD032.cortex-impl-260** Fix MD032/blanks-around-lists in cortex/IMPLEMENTATION_PLAN.md line 260 - Add blank line before list |
| 2026-01-28 | WARN.MD032.cortex-impl-265 | - [x] **WARN.MD032.cortex-impl-265** Fix MD032/blanks-around-lists in cortex/IMPLEMENTATION_PLAN.md line 265 - Add blank line before list |
| 2026-01-28 | WARN.MD022.workers-impl-101 | - [x] **WARN.MD022.workers-impl-101** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 101 - Add blank line after "## DRY-RUN ANALYSIS" |
| 2026-01-28 | WARN.MD022.workers-impl-105 | - [x] **WARN.MD022.workers-impl-105** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 105 - Add blank line after "### Summary" |
| 2026-01-28 | WARN.MD032.workers-impl-111 | - [x] **WARN.MD032.workers-impl-111** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 111 - Add blank line before numbered list |
| 2026-01-28 | WARN.MD032.workers-impl-121 | - [x] **WARN.MD032.workers-impl-121** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 121 - Add blank line before bullet list |
| 2026-01-28 | WARN.MD022.workers-impl-137 | - [x] **WARN.MD022.workers-impl-137** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 137 - Add blank line after "### Files to Modify" |
| 2026-01-28 | WARN.MD032.workers-impl-138 | - [x] **WARN.MD032.workers-impl-138** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 138 - Add blank line before list |
| 2026-01-28 | WARN.MD022.workers-impl-142 | - [x] **WARN.MD022.workers-impl-142** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 142 - Add blank line after "### Verification Commands" |
| 2026-01-28 | WARN.MD031.workers-impl-143 | - [x] **WARN.MD031.workers-impl-143** Fix MD031/blanks-around-fences in workers/IMPLEMENTATION_PLAN.md line 143 - Add blank line before code fence |
| 2026-01-28 | WARN.MD022.workers-impl-148 | - [x] **WARN.MD022.workers-impl-148** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 148 - Add blank line after "### Risks & Dependencies" |
| 2026-01-28 | WARN.MD032.workers-impl-149 | - [x] **WARN.MD032.workers-impl-149** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 149 - Add blank line before list |
| 2026-01-28 | WARN.MD022.workers-impl-154 | - [x] **WARN.MD022.workers-impl-154** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 154 - Add blank line after "### Time Estimate" |
| 2026-01-28 | WARN.MD032.workers-impl-155 | - [x] **WARN.MD032.workers-impl-155** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 155 - Add blank line before list |
| 2026-01-28 | WARN.MD022.workers-impl-160 | - [x] **WARN.MD022.workers-impl-160** Fix MD022/blanks-around-headings in workers/IMPLEMENTATION_PLAN.md line 160 - Add blank line after "### Next Steps" |
| 2026-01-28 | WARN.MD032.workers-impl-161 | - [x] **WARN.MD032.workers-impl-161** Fix MD032/blanks-around-lists in workers/IMPLEMENTATION_PLAN.md line 161 - Add blank line before numbered list |

### Archived on 2026-01-28 15:59:13

- [x] **1.2**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 15:59:13
  - **Block:**

### Archived on 2026-01-28 16:09:27

- [x] **1.3**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:09:27
  - **Block:**

- [x] **1.4**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:09:27
  - **Block:**

### Archived on 2026-01-28 16:33:36

- [x] **1.5**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:33:36
  - **Block:**

### Archived on 2026-01-28 16:39:08

- [x] **WARN.MD012.workers/PLAN_DONE.md**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:39:08
  - **Block:**

### Archived on 2026-01-28 16:49:05

- [x] **0.W.MD012.workers/PLAN_DONE.md**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:49:05
  - **Block:**

- [x] **1.6**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:49:05
  - **Block:**

- [x] **1.7**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:49:05
  - **Block:**

- [x] **1.8**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:49:05
  - **Block:**

### Archived on 2026-01-28 16:49:18

- [x] **0.W.MD012.workers/PLAN_DONE.md**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:49:18
  - **Block:**

- [x] **1.6**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:49:18
  - **Block:**

- [x] **1.7**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:49:18
  - **Block:**

- [x] **1.8**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:49:18
  - **Block:**

### Archived on 2026-01-28 16:53:52

- [x] **0.W.MD012.workers/PLAN_DONE.md**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 16:53:52
  - **Block:**

### Archived on 2026-01-28 17:19:52

- [x] **1.9**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 17:19:52
  - **Block:**

- [x] **1.10**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 17:19:52
  - **Block:**

- [x] **1.11**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 17:19:52
  - **Block:**

- [x] **1.10**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 17:19:52
  - **Block:**

- [x] **1.11**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 17:19:52
  - **Block:**

- [x] **36.1.1**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 17:19:52
  - **Block:**

### Archived on 2026-01-28 19:06:12

- [x] **0-Lint.1.1**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 19:06:12
  - **Block:**

- [x] **36.1.2**
  - **Archived From:** workers/IMPLEMENTATION_PLAN.md
  - **Archived At:** 2026-01-28 19:06:12
  - **Block:**
