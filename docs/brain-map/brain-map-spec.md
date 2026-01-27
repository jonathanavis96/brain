# Brain Map System — Canonical Specification

## Table of contents

- [Why this exists](#why-this-exists)
- [Scope, assumptions, and constraints](#scope-assumptions-and-constraints)
- [Explicit non-goals](#explicit-non-goals)
- [Core entities and relationships](#core-entities-and-relationships)
  - [Node types](#node-types)
  - [Node fields](#node-fields)
  - [Relationship types](#relationship-types)
- [Node identity & stability rules (critical)](#node-identity--stability-rules-critical)
  - [Identity rules](#identity-rules)
  - [Rename and migration behavior](#rename-and-migration-behavior)
  - [Duplicate and invalid identity handling](#duplicate-and-invalid-identity-handling)
- [Inbox / scratchpad capture mode](#inbox--scratchpad-capture-mode)
  - [Capture requirements](#capture-requirements)
  - [Promotion flow](#promotion-flow)
  - [Expected messiness](#expected-messiness)
- [A) Product spec](#a-product-spec)
  - [User stories](#user-stories)
- [B) UX / GUI plan](#b-ux--gui-plan)
  - [Main screens](#main-screens)
  - [Graph interactions](#graph-interactions)
  - [Neuron-like look and feel guidance](#neuron-like-look-and-feel-guidance)
- [C) Hotspots / heat metrics](#c-hotspots--heat-metrics)
  - [Metric 1: density heat](#metric-1-density-heat)
  - [Metric 2: recency heat](#metric-2-recency-heat)
  - [Metric 3: task heat](#metric-3-task-heat)
  - [Visual encoding rules](#visual-encoding-rules)
- [D) Data model + storage](#d-data-model--storage)
  - [Markdown source-of-truth format](#markdown-source-of-truth-format)
  - [SQLite index model](#sqlite-index-model)
  - [Tradeoffs and recommendation](#tradeoffs-and-recommendation)
- [E) Auto-generating implementation plans (agent output)](#e-auto-generating-implementation-plans-agent-output)
  - [Deterministic plan-generation pipeline](#deterministic-plan-generation-pipeline)
  - [Output templates (authoritative)](#output-templates-authoritative)
- [Agent ingestion contract](#agent-ingestion-contract)
  - [Authority and trust boundaries](#authority-and-trust-boundaries)
  - [No inference and no scope expansion](#no-inference-and-no-scope-expansion)
  - [Guardrails and enforcement](#guardrails-and-enforcement)
- [Failure & recovery model](#failure--recovery-model)
  - [Index rebuild behavior](#index-rebuild-behavior)
  - [Markdown parse failures](#markdown-parse-failures)
  - [UI/backend failure behavior](#uibackend-failure-behavior)
  - [Markdown corruption prevention guarantees](#markdown-corruption-prevention-guarantees)
- [F) Step-by-step build plan (phased)](#f-step-by-step-build-plan-phased)
  - [MVP](#mvp)
  - [V1](#v1)
  - [V2](#v2)
- [G) Ralph task breakdown (atomic)](#g-ralph-task-breakdown-atomic)
  - [Task sizing and independence rules](#task-sizing-and-independence-rules)
  - [Required task metadata](#required-task-metadata)
  - [Verification expectations](#verification-expectations)
- [Appendix: Frontmatter & Link Schema (Canonical)](#appendix-frontmatter--link-schema-canonical)
  - [Frontmatter keys (canonical)](#frontmatter-keys-canonical)
  - [Allowed enums and defaults](#allowed-enums-and-defaults)
  - [Relationship encoding (canonical)](#relationship-encoding-canonical)
  - [ID rules (precise)](#id-rules-precise)
  - [Deterministic validation rules](#deterministic-validation-rules)
  - [Migration / compatibility](#migration--compatibility)
  - [Canonical note examples (by node type)](#canonical-note-examples-by-node-type)
    - [Inbox](#inbox)
    - [Concept](#concept)
    - [System](#system)
    - [Decision (ADR)](#decision-adr)
    - [TaskContract](#taskcontract)
    - [Artifact](#artifact)
- [What changed vs previous draft](#what-changed-vs-previous-draft)

## Why this exists

The Brain repository is growing faster than human working memory. The Brain Map system is a local-first GUI that turns rapidly captured ideas, systems, tasks, and their relationships into a visual and searchable “neuron network” and can deterministically generate agent-readable implementation planning output.

This document is the canonical design reference for humans and agents. It is intentionally explicit and deterministic to reduce ambiguity, prevent scope creep, and enable reliable execution by builders (Ralph) under manager guidance (Cortex + Human).

## Scope, assumptions, and constraints

### Hard assumptions (fixed for this specification)

- **UI:** Vite + React
- **Graph rendering:** sigma.js + graphology
- **Backend:** FastAPI
- **Runtime:** WSL2 (backend runs in WSL2; UI accessed via browser)
- **Storage:** Markdown-first (source of truth) + SQLite index (derived)

### High-level goals

- Visual, neuron-like graph layout with zoom and clustering.
- Fast global search (fuzzy + full-text).
- Heat indicators (“hot zones”) driven by explicit, computable metrics.
- Low-friction idea capture (Inbox/Scratchpad).
- Deterministic plan generation for agent execution.

### Key constraints

- **Local-first:** must work offline and keep data in-repo.
- **Repo-friendly:** Markdown is the canonical data store, designed for git diffs and review.
- **Deterministic outputs:** plan generation and identity rules must be stable and testable.
- **No code in this spec:** this is a design reference, not an implementation.

## Explicit non-goals

The Brain Map system is intentionally **not**:

- A real-time collaborative editor (no Google Docs-style multi-user cursors).
- A full project-management replacement (not Jira, not Linear, not Asana).
- A generic “second brain” clone (not trying to replicate Obsidian/Notion feature parity).
- A universal knowledge ingestion pipeline (no requirement to ingest arbitrary file types beyond defined Markdown nodes).
- A long-running hosted service (no always-on cloud backend required for core functionality).
- An AI-autonomous decision maker (agents execute explicitly defined tasks; they do not invent requirements).

## Core entities and relationships

This section defines the domain model the GUI and backend must expose.

### Node types

The system uses a constrained set of node types to keep the graph legible and agent-ingestible.

- **Concept**: an idea, pattern, hypothesis, or technique.
- **System**: a coherent subsystem or component with a boundary.
- **Decision (ADR)**: an architectural decision record.
- **TaskContract**: a single, atomic unit of work suitable for an agent iteration.
- **Artifact**: any produced output (file, report, dashboard, script output, external URL).

### Node fields

All node types share a common required field set.

#### Required fields (all nodes)

- `id` (string): immutable stable identifier. See [Node identity & stability rules (critical)](#node-identity--stability-rules-critical).
- `title` (string): human-readable title.
- `type` (enum): `Concept | System | Decision | TaskContract | Artifact | Inbox`.
  - Note: Inbox is a first-class capture type; see [Inbox / scratchpad capture mode](#inbox--scratchpad-capture-mode).
- `status` (enum): `idea | planned | active | blocked | done | archived`.
- `tags` (list of strings).
- `created_at` (ISO8601 string, timezone-aware).
- `updated_at` (ISO8601 string, timezone-aware).

#### Optional fields

- `priority` (enum or number): recommended `P0 | P1 | P2 | P3`.
- `risk` (enum): `low | medium | high`.
- `owner` (string): recommended values: `Human | Cortex | Ralph | Other`.
- `source_links` (list): repo paths or URLs.
- `acceptance_criteria` (list of strings): especially important for `TaskContract` and `System`.
- `notes` (string): freeform additional context.

### Relationship types

Relationships are typed and directional (unless otherwise stated). Relationship types are part of the canonical schema.

- `implements` (A implements B)
- `depends_on` (A depends on B)
- `blocks` (A blocks B)
- `validated_by` (A validated_by Artifact/Test)
- `replaces` (A replaces B)
- `related_to` (treated as symmetric in the UI; stored as two directed edges or a single canonical undirected record)

Relationship records must minimally contain:

- `from_id`
- `to_id`
- `type` (one of the above)
- `created_at`

## Node identity & stability rules (critical)

Node identity is the foundation of graph stability, linking, and plan generation. These rules are mandatory.

### Identity rules

1. **`id` is immutable once created.**
   - Once a node exists, its `id` must never change.
   - All references (links, edges, plans) use `id` as the authoritative key.

2. **`title` may change without changing identity.**
   - Renaming a node title is a common operation and must not affect linking.

3. **Filename may change without changing identity.**
   - Markdown files are storage artifacts and may be reorganized.
   - The indexer must treat file path as metadata (`source_path`), not identity.

4. **Links resolve by `id`, not filename or title.**
   - Relationship frontmatter (or equivalent) must reference other nodes by `id`.
   - UI search may locate by title/tags/content, but saving relationships always persists by `id`.

5. **Duplicate `id` values are a hard error at index time.**
   - The indexer must fail the indexing operation when duplicates exist.
   - The previous known-good index must remain available (see [Failure & recovery model](#failure--recovery-model)).

6. **`id` generation must be deterministic or explicitly recorded.**
   - If generated from title (slug), it must be created once and then frozen.
   - If UUID-based, it must be written once into frontmatter and then frozen.

### Rename and migration behavior

This section defines expected behavior when titles and filenames change.

#### Title rename behavior

- A title rename updates `title` and `updated_at` only.
- The node `id` remains unchanged.
- All inbound/outbound relationships remain valid because they are id-based.
- Search index updates accordingly.

#### File rename and relocation behavior

- Moving or renaming a Markdown file updates only `source_path` (in the derived index).
- The indexer must discover nodes by scanning all configured note directories, not by relying on a single canonical path.
- If a node file is moved, the indexer must still find it and preserve the same `id`.

#### Migration guarantees

- **Guarantee:** As long as a node’s `id` remains present in exactly one Markdown note, links to that node remain valid across renames and moves.
- **Guarantee:** Generated plans and relationships remain stable because they are keyed by `id`.
- **Non-guarantee:** If the user manually edits `id` in a note, that is treated as creating a different identity; migration is not automatic.

### Duplicate and invalid identity handling

#### Duplicate ids

- Index-time duplicates are a **hard error**.
- The indexer must:
  - emit a clear error listing all conflicting `source_path` locations,
  - refuse to publish a new index,
  - preserve the last known-good index.

#### Missing ids

- Missing `id` in a note is an index-time error.
- Auto-fixing missing ids is permitted only if explicitly invoked by the user (to avoid surprising identity creation). Default behavior is “fail loudly.”

#### Broken references (missing target id)

- An edge referencing a missing `to_id` is not a hard index failure by default.
- It must be recorded as a “broken link” diagnostic surfaced in the UI.
- Plan generation must either:
  - exclude broken references, or
  - include them explicitly in a “Missing dependencies” section.

## Inbox / scratchpad capture mode

The Brain Map must support a low-friction capture workflow for rapidly entering ideas without enforcing full structure up front.

### Capture requirements

Inbox nodes are first-class nodes with `type: Inbox`.

**Minimal required fields for Inbox nodes:**

- `id`
- `title`
- `type: Inbox`
- `status: idea`
- `created_at`
- `updated_at`

Everything else is optional in Inbox mode.

Inbox capture must be optimized for speed:

- One action to create an Inbox node.
- Title can be rough.
- Body can be messy.
- Tags optional.
- Relationships optional.

### Promotion flow

Promotion converts an Inbox node into a structured node type without changing identity.

Promotion rules:

1. **Promotion does not change `id`.**
2. Promotion updates:
   - `type` (Inbox → Concept/System/Decision/TaskContract/Artifact)
   - optional structured fields (`tags`, `acceptance_criteria`, etc.)
   - `updated_at`
3. Promotion may optionally:
   - add relationships to existing nodes by `id`.

Promotion triggers (non-exclusive):

- Manual: user presses “Promote” in the UI and selects target type.
- Assisted: UI suggests likely type based on tags/body keywords, but user confirms.

Promotion outcomes:

- The node now participates fully in filters, metrics, and plan generation.
- If promoted to TaskContract, `acceptance_criteria` becomes strongly recommended.

### Expected messiness

Inbox nodes are expected to be:

- incomplete
- redundant
- poorly titled
- missing relationships
- temporary

The UI must support bulk triage:

- filter by `type: Inbox`
- sort by recency
- quick promote
- quick archive

Inbox mode is a pressure valve: it enables fast capture without requiring immediate taxonomy correctness.

## A) Product spec

### User stories

#### Capture idea quickly

- Create a new node in under 10 seconds.
- Default to Inbox capture mode unless user explicitly chooses a structured type.

#### Link to existing nodes

- Add typed relationships from the node detail panel.
- Relationship selection uses search-by-title but stores `to_id`.

#### View brain graph

- Render a neuron-like graph of nodes and links.
- Provide smooth pan/zoom and a clear selected-node state.

#### Find hotspots

- Surface dense clusters and active areas with a heat overlay.
- Provide ranked hotspot insights.

#### Zoom levels (project → subsystem → concept → task)

- Provide semantic zoom behavior:
  - zoomed out: show clustered “supernodes”
  - zoom in: expand clusters into constituent nodes

#### Generate agent plan from selection

- Select nodes in the graph and generate a deterministic plan.
- Output is a Markdown document suitable for human review and agent ingestion.

## B) UX / GUI plan

### Main screens

1. **Graph View (neuron-style)**
   - Primary canvas (sigma.js WebGL rendering)
   - Heat overlay toggle and legend
   - Filter controls (type/status/tags/recency)

2. **Node Detail Panel (right side)**
   - Editable node fields
   - Relationship editor (inbound/outbound)
   - Quick actions: “Promote”, “Archive”, “Generate plan from selection”

3. **Search Palette (Ctrl+K style)**
   - Fuzzy search across `title`, `tags`, and indexed content
   - Jump-to-node behavior (focus camera + select node)

4. **Hotspots / Insights panel**
   - Ranked list of hotspots by chosen heat metric
   - Click hotspot to focus and highlight the corresponding cluster/subgraph

5. **Generate Plan wizard**
   - Select nodes (from current selection or via search)
   - Choose neighborhood depth (N) and relationship filters
   - Preview generated Markdown and export to file

### Graph interactions

- Click node → opens node detail panel
- Shift-click nodes → multi-select
- Expand/collapse neighbors:
  - Expand: reveal immediate neighbors by relationship type filters
  - Collapse: hide non-selected neighborhood
- Zoom levels:
  - semantic clustering at low zoom
  - expand clusters at higher zoom
- Filters:
  - by node `type`
  - by `status`
  - by `tags`
  - by recency (e.g., updated in last X days)
- Heat overlay:
  - toggle between density/recency/task
  - optionally display a combined heat score

### Neuron-like look and feel guidance

The visual design should evoke a biological neural map without sacrificing clarity.

- **Layout:** force-directed layout with clustering (graphology + ForceAtlas2 or equivalent).
- **Edges:** curved, synapse-like links; directional hinting is subtle.
- **Clusters:** gentle grouping and spacing; clusters can be highlighted with a soft hull.
- **Heat:** halo/glow intensity around nodes; optional diffuse “heat fog” overlay for clusters.
- **Interaction:** hover highlights neighborhood; selection increases contrast.

## C) Hotspots / heat metrics

Heat metrics must be explicit, computable, and stable. All heat scores are normalized to the range 0..1 for visual mapping.

### Metric 1: density heat

Goal: highlight structural hubs and dense neighborhoods.

Definitions (computed on the current graph snapshot):

- `deg(v) = indeg(v) + outdeg(v)`
- Local clustering coefficient (undirected approximation):
  - Let `N(v)` be neighbors, `k = |N(v)|`
  - Let `E(N(v))` be edges among neighbors
  - `cc(v) = 0` if `k < 2`, else `2*|E(N(v))| / (k*(k-1))`

Density heat:

- `DensityHeat(v) = w1 * norm(deg(v)) + w2 * norm(cc(v))`
- Recommended weights: `w1 = 0.7`, `w2 = 0.3`

Normalization guidance:

- `norm(x)` should be computed using robust scaling (e.g., percentile-based) to prevent a single super-hub from flattening all other heat.

### Metric 2: recency heat

Goal: highlight what has been touched recently.

Let:

- `t_now` = current time
- `Δ_days(v) = (t_now - updated_at(v))` in days

Exponential decay:

- `RecencyHeat(v) = exp(-λ * Δ_days(v))`

Choose λ by half-life H:

- `λ = ln(2) / H`
- Recommended default: `H = 7 days`

### Metric 3: task heat

Goal: show execution pressure (open work, blocked work, recent churn).

For any node `v`, define a neighborhood rule for task association:

- Associated TaskContracts are:
  - direct neighbors of `v`, or
  - nodes reachable within depth `N_task` following relationship types `implements`, `depends_on`, `blocks`
- Recommended default: `N_task = 2`

Compute:

- `open_tasks(v)`: count TaskContract nodes with status in `planned | active | blocked`
- `blocked_tasks(v)`: count TaskContract nodes with status `blocked`
- `recent_task_updates(v)`: count TaskContract nodes updated within the last 7 days

Task heat:

- `TaskHeat(v) = a*norm(open_tasks) + b*norm(blocked_tasks) + c*norm(recent_task_updates)`
- Recommended weights: `a = 0.5`, `b = 0.3`, `c = 0.2`

### Visual encoding rules

Heat must be readable without destroying graph legibility.

- **Primary encoding:** node halo/glow intensity maps to selected heat metric (0..1).
- **Secondary encoding (optional):** node radius maps to a selected structural measure (degree) or combined heat.
- **Edge encoding:** edge thickness scales with average endpoint heat:
  - `EdgeWidth(u, v) = base + scale * (Heat(u) + Heat(v)) / 2`
- **Cluster overlay (optional):** a soft, blurred hull around clusters with opacity = average cluster heat.

## D) Data model + storage

### Markdown source-of-truth format

Markdown notes are the canonical source of truth. The system must read and write nodes as Markdown with frontmatter.

Storage objectives:

- Human-editable
- Git-diff friendly
- Identity-stable under rename/move
- Validatable by deterministic rules

Canonical note requirements:

- Frontmatter must include required fields.
- Relationships reference other nodes by `id`.

### SQLite index model

SQLite is a derived index used for:

- fast global search
- graph query performance (neighbors, subgraphs)
- caching computed metrics

Minimum index tables:

- `nodes`
  - `id` (primary key)
  - `title`, `type`, `status`
  - `tags_json`
  - `created_at`, `updated_at`
  - `body_md`
  - `source_path`
- `edges`
  - `id` (primary key)
  - `from_id`, `to_id`, `rel_type`
  - `created_at`
- `nodes_fts` (FTS5)
  - indexed fields: `title`, `tags`, `body_md`

The index is rebuildable from Markdown at any time.

### Tradeoffs and recommendation

- **Markdown-first + SQLite index (recommended):** best fit for repo workflows, reviewability, and deterministic rebuild.
- **DB-first:** simpler runtime but worse for git and human readability.

This specification mandates Markdown-first + SQLite index.

## E) Auto-generating implementation plans (agent output)

### Deterministic plan-generation pipeline

Plan generation must be deterministic given:

- selected node id set S
- current indexed graph snapshot G
- generation parameters P (depth, filters)

Pipeline:

1. **Selection:** user selects one or more nodes in the GUI.
2. **Subgraph extraction:** gather nodes and edges within depth N using BFS/DFS over allowed relationship types.
3. **Classification:** partition extracted nodes by type (System/Concept/Decision/TaskContract/Artifact/Inbox).
4. **Dependency ordering:** attempt a deterministic ordering for nodes connected by `depends_on`.
   - If cycles exist, record them explicitly.
5. **Document assembly:** render a Markdown plan using the authoritative templates below.
6. **Export:** write the generated plan to a user-selected path in the repo.

Determinism requirements:

- Node ordering must be stable (e.g., sort by `type` then `id`).
- Edge ordering must be stable.
- Any non-deterministic layout or UI-only state must not affect plan output.

### Output templates (authoritative)

The system generates two primary outputs.

1. **Implementation Plan document** (for human review and possible direct agent ingestion)
2. **Task Contract set** (for agent execution in later phases)

This specification defines the templates but does not produce concrete Task Contracts yet.

#### Implementation Plan template

```markdown
## Brain Map Generated Plan: <title>
GeneratedAt: <ISO8601>
SourceSelection: [<node_id_1>, <node_id_2>, ...]
SubgraphDepth: <N>
RelationshipFilter: <list>

### Scope
- Primary goal: <1–2 sentences>
- In scope:
  - <bullet list>
- Out of scope:
  - <bullet list>

### Dependencies (ordered)
1. <dep node id> — <why>
2. ...

### Deliverables
- <file paths / artifacts expected>
- <UI behaviors expected>

### Verification
- <commands to run>
- <manual checks>

### Guardrails (Do Not Do)
- Do not modify protected files: <list>
- Do not expand scope beyond: <explicit list>
- Do not refactor unrelated code.
```

#### Task Contract template (format-only)

```markdown
- [ ] **<phase>.<task_number>** <short task title>
  - **Goal:** <single sentence>
  - **Inputs:** <node ids, files, assumptions>
  - **Outputs:** <files created/changed, artifacts produced>
  - **Files likely to touch:** `<path>`, `<path>`
  - **AC:**
    - [ ] <verifiable acceptance criteria>
    - [ ] <verifiable acceptance criteria>
  - **Verification:**
    - `command ...`
    - <manual check>
  - **Risk notes:** <what could go wrong + mitigation>
  - **If Blocked:** <fallback steps>
```

## Agent ingestion contract

This section defines how generated plans are consumed by agents and how authority is enforced.

### Authority and trust boundaries

- **Human** is the ultimate authority on goals, priorities, and scope.
- **Cortex** is the planner/architect: translates intent into explicit constraints, acceptance criteria, and deterministic plan structure.
- **Ralph** is the builder/executor: implements only what is explicitly requested and verified.

Generated plan documents are treated as **authoritative** for execution.

### No inference and no scope expansion

Agents must follow these rules when executing from generated output:

1. **No inference of missing requirements.**
   - If a required detail is missing or ambiguous, the agent must stop and request clarification.

2. **No scope expansion beyond explicit acceptance criteria.**
   - The agent must not “helpfully” add features, refactors, or improvements not listed.

3. **No substitution of design choices.**
   - If the plan specifies stack choices or architectural decisions, the agent must implement them as written.

4. **No silent changes to identity rules or storage formats.**
   - The node identity and storage contracts are foundational; changes require explicit human approval.

### Guardrails and enforcement

- Generated plan outputs must include a “Do Not Do” section that enumerates:
  - protected files and boundaries
  - scope exclusions
  - refactor prohibitions unless explicitly listed
- Execution workflows should include verification steps and explicit stop conditions.

## Failure & recovery model

The system must fail safely. The canonical data is Markdown; the system must never corrupt it.

### Index rebuild behavior

- The SQLite index is **derived** and can be rebuilt at any time.
- Rebuild should be:
  - deterministic
  - idempotent
  - safe in the presence of partial failures

Index publish rule:

- The indexer builds a new index in a temporary location.
- The new index is only “published” (swapped into place) if the entire rebuild succeeds.
- If rebuild fails, the last known-good index remains available.

### Markdown parse failures

Parse failures must be surfaced clearly.

- A note with invalid frontmatter is treated as an index-time error.
- The indexer must emit diagnostics including:
  - file path
  - error type (missing required field, invalid enum, invalid YAML)
  - line/column when available

Behavior policy:

- Structural identity violations (duplicate id, missing id) are hard failures.
- Non-fatal issues (broken references) are recorded as diagnostics.

### UI/backend failure behavior

The UI must degrade gracefully.

- If backend is unavailable:
  - UI shows a clear “Backend offline” state.
  - UI disables write actions.
  - UI may offer a reconnect action.

- If index is missing:
  - backend triggers a rebuild or instructs the user to rebuild.
  - UI shows a “No index available” state with guidance.

- If index rebuild fails:
  - UI continues to operate using last known-good index.
  - UI shows warnings and links to diagnostics.

### Markdown corruption prevention guarantees

Markdown files are the source of truth; the system must never corrupt them.

Guarantees:

- All writes are atomic:
  - write to a temporary file
  - fsync when feasible
  - rename/replace original
- The system must preserve:
  - existing frontmatter keys it does not understand (round-trip safety)
  - Markdown body content
- On write failure, the original file must remain unchanged.

## F) Step-by-step build plan (phased)

### MVP

MVP must be minimal but usable.

Required MVP capabilities:

- Graph GUI rendering from stored nodes and links.
- Node create/edit (writes Markdown source of truth).
- Fast search (global, fuzzy).
- Basic hotspot metric (at least recency).
- Plan generation for selected nodes (deterministic), even if simplistic.

MVP shape:

- Backend:
  - index Markdown → SQLite
  - API endpoints: graph, node read/write, search, generate plan
- Frontend:
  - sigma.js graph view
  - node detail panel
  - Ctrl+K search palette
  - heat toggle
  - minimal generate-plan wizard

### V1

V1 is the daily-driver version.

- Clustering + semantic zoom (supernodes).
- Multi-metric heat (density + recency + task).
- Hotspots/Insights panel.
- Generate Plan wizard with depth/filters + preview and export.
- File watcher for auto reindex.

### V2

V2 adds advanced “brain intelligence.”

- Stable layout caching.
- Community detection clustering.
- Change-rate heat based on repo activity (where feasible).
- Dependency analysis (cycles, critical path hints).
- Plan generator enhancements:
  - deterministic toposort
  - task sizing heuristics
  - explicit stop conditions and guardrails injected.

## G) Ralph task breakdown (atomic)

This section defines how work is decomposed into atomic, mergeable tasks for Ralph.

This specification intentionally does not enumerate concrete Task Contracts yet; it defines the requirements that any future task breakdown must satisfy.

### Task sizing and independence rules

A Ralph task must be:

- **Atomic:** completable in a single iteration.
- **Independently mergeable:** minimal coupling to other tasks.
- **Verifiable:** includes explicit acceptance criteria and verification steps.
- **Bounded:** explicit “do not do” constraints.

A task must avoid:

- multi-week refactors
- unrelated improvements
- ambiguous acceptance criteria (“make it better”)

### Required task metadata

Every task must include:

- Title
- Goal
- Inputs
- Outputs
- Files likely to touch
- Acceptance Criteria (verifiable)
- Verification commands/checks
- Risk notes
- If Blocked fallback instructions

### Verification expectations

Tasks should prefer verification that is:

- local and deterministic
- executable via CLI (tests, linters)
- minimal manual steps, clearly described

## Appendix: Frontmatter & Link Schema (Canonical)

This appendix defines the canonical Markdown frontmatter schema and relationship encoding used by the Brain Map system.

Goals:

- Unambiguous, deterministic parsing and validation.
- Stable identity under title/filename changes.
- Git-friendly notes that are human-editable.
- A schema that supports future evolution without breaking existing notes.

Non-goals (appendix-level):

- This appendix does not define code, parser implementations, or UI widgets.

### Frontmatter keys (canonical)

All Brain Map notes are Markdown files with a required YAML frontmatter block.

#### Required keys (all node types)

- `id` (string): stable node id.
- `title` (string): human-readable title.
- `type` (string enum): node type.
- `status` (string enum): node lifecycle status.
- `tags` (list of strings): may be empty.
- `created_at` (string): ISO8601 timestamp with timezone.
- `updated_at` (string): ISO8601 timestamp with timezone.

#### Optional keys (all node types)

- `priority` (string enum): `P0 | P1 | P2 | P3`.
- `risk` (string enum): `low | medium | high`.
- `owner` (string): e.g., `Human`, `Cortex`, `Ralph`.
- `source_links` (list of strings): URLs or repo paths.
- `acceptance_criteria` (list of strings): required for `TaskContract`, recommended for `System`.
- `links` (list): relationship records (see [Relationship encoding (canonical)](#relationship-encoding-canonical)).
- `schema_version` (integer): optional; defaults to `1` if omitted.

#### Reserved keys

- Keys listed above are reserved by the Brain Map system.
- The system must not repurpose reserved keys for different meaning across schema versions.

#### Unknown keys

- Unknown keys are allowed and must round-trip safely.
- Unknown keys must be preserved when the system writes a note.

### Allowed enums and defaults

#### `type` enum (canonical)

Allowed:

- `Inbox`
- `Concept`
- `System`
- `Decision`
- `TaskContract`
- `Artifact`

Defaults:

- When creating a note via “fast capture”, default `type: Inbox`.

#### `status` enum (canonical)

Allowed:

- `idea`
- `planned`
- `active`
- `blocked`
- `done`
- `archived`

Defaults:

- For new Inbox capture: `status: idea`.

#### `priority` enum

Allowed: `P0 | P1 | P2 | P3`.

Default:

- If omitted, treat as unspecified (do not assume P2).

#### `risk` enum

Allowed: `low | medium | high`.

Default:

- If omitted, treat as unspecified.

### Relationship encoding (canonical)

Relationships are stored in frontmatter as an array under the `links` key.

This specification intentionally chooses **frontmatter-only** link storage. Inline link syntax (e.g., `[[id]]`) may be supported for display convenience later, but it is not canonical for indexing or identity.

#### Canonical edge record

Each item in the `links` array is a mapping with required keys:

- `to` (string): target node id.
- `type` (string enum): relationship type.

Optional edge metadata keys:

- `title` (string): optional cached display title of the target at time of linking.
  - This is for human readability only.
  - Indexing must resolve by `to` (id), not by this title.
- `note` (string): optional human explanation.
- `created_at` (string ISO8601): optional; if omitted, indexer may treat as unknown.

Relationship `type` enum (canonical):

- `implements`
- `depends_on`
- `blocks`
- `validated_by`
- `replaces`
- `related_to`

#### Direction rules

- All edges are stored as outgoing edges from the current note.
  - Example: in node A, `links: [{to: B, type: depends_on}]` means “A depends_on B”.
- `related_to` is treated as symmetric in UI.
  - Canonical storage rule: store it as a single directed edge exactly as written.
  - UI may optionally materialize the reverse direction for visualization.

#### How titles are used/displayed

- UI should display the resolved target node title if available.
- If the target node is missing, UI may fall back to `links[].title` if present.
- The system must not use `links[].title` to resolve identity.

### ID rules (precise)

ID rules are strict because links resolve by `id`.

#### Format

Canonical id format is UUID v4 (lowercase) with a `bm_` prefix:

- `bm_<uuid-v4>`
- Example: `bm_550e8400-e29b-41d4-a716-446655440000`

Rationale:

- avoids collisions during fast capture
- remains stable under renames
- is filesystem-safe and URL-safe

#### Generation method

- IDs are generated exactly once at node creation.
- ID generation is UI/backend responsibility (not user-typed in normal flow).
- When importing legacy notes missing `id`, the system must not silently generate ids unless the user explicitly triggers a migration/import action.

#### Immutability

- Once created, `id` must not change.
- If a user manually edits `id`, the system treats it as a different identity and reports it as a likely migration error.

#### Collisions

- UUID collisions are treated as practically impossible.
- Nevertheless, duplicate ids are a hard index error.

#### Rename behavior

- Changing `title` or filename does not change `id`.
- Links remain valid because they reference ids.

### Deterministic validation rules

Validation must be deterministic and must classify findings as **hard errors** (index build fails) or **warnings** (index builds but diagnostics are surfaced).

#### Required fields per type

All types require the global required keys:

- `id`, `title`, `type`, `status`, `tags`, `created_at`, `updated_at`

Type-specific requirements:

- `Inbox`:
  - no additional required keys
- `Concept`:
  - no additional required keys
- `System`:
  - recommended: `acceptance_criteria` (warning if missing once status is `planned` or beyond)
- `Decision`:
  - recommended: `source_links` (warning if missing)
- `TaskContract`:
  - required: `acceptance_criteria` (hard error if missing)
- `Artifact`:
  - required: at least one of:
    - `source_links` non-empty, or
    - a Markdown body containing a clear artifact description (hard error if both empty)

#### Hard errors (must fail index build)

- Duplicate `id` across notes.
- Missing required keys.
- Invalid enum values (`type`, `status`, `priority`, `risk`, relationship `type`).
- Invalid YAML frontmatter (unparseable).
- `links` not an array.
- Any `links[]` record missing required keys `to` or `type`.
- `TaskContract` missing `acceptance_criteria`.

#### Warnings (index builds, but diagnostics are emitted)

- Broken links: `links[].to` references an id not present in the index.
- Timestamp anomalies:
  - `updated_at` earlier than `created_at`.
- Empty `tags` list is allowed (not a warning).
- Unknown fields are allowed (not a warning).
- `System` with status `planned|active|blocked` missing `acceptance_criteria`.
- `Decision` missing `source_links`.

#### Duplicate id handling (explicit)

- Duplicate ids are a hard error.
- Error output must list:
  - the duplicated `id`
  - every file path containing it
- The system must not “pick one.”

#### Unknown fields handling

- Unknown frontmatter keys must be preserved on write.
- Unknown keys must not cause failure.

### Migration / compatibility

Schema evolution must not break old notes.

Compatibility rules:

- The parser must be tolerant of unknown fields.
- The parser must treat `schema_version` as:
  - default `1` if missing
  - a hint for future migrations
- When adding new required fields in future versions:
  - do so by introducing a new `schema_version`
  - treat missing new fields as warnings for older versions, not hard errors
  - provide an explicit migration tool/workflow (user-invoked) to upgrade notes

### Canonical note examples (by node type)

The following examples are canonical reference notes. They demonstrate required fields, optional fields, and relationship encoding.

#### Inbox

```markdown
---
id: bm_550e8400-e29b-41d4-a716-446655440000
title: "idea: plan generator should warn on broken deps"
type: Inbox
status: idea
tags: []
created_at: 2026-01-27T02:00:00+00:00
updated_at: 2026-01-27T02:00:00+00:00
schema_version: 1
links: []
---

Messy notes allowed here. This is a scratchpad capture.

- maybe connect to existing plan generator later
- might be a warning not a hard error
```

#### Concept

```markdown
---
id: bm_11111111-1111-4111-8111-111111111111
title: "Heat metrics: density vs recency vs task pressure"
type: Concept
status: planned
tags:
  - brain-map
  - metrics
created_at: 2026-01-20T10:00:00+00:00
updated_at: 2026-01-27T02:00:00+00:00
schema_version: 1
links:
  - to: bm_22222222-2222-4222-8222-222222222222
    type: related_to
    title: "Graph clustering and semantic zoom"
    note: "Metrics should work at both node and cluster level."
---

Define and compare heat metrics and their visual encodings.
```

#### System

```markdown
---
id: bm_33333333-3333-4333-8333-333333333333
title: "Brain Map backend: Markdown indexer + API"
type: System
status: active
tags:
  - brain-map
  - backend
owner: Ralph
risk: medium
acceptance_criteria:
  - "Index rebuild is deterministic and atomic (publish only on success)."
  - "FTS search returns results for title, tags, and body."
created_at: 2026-01-22T09:00:00+00:00
updated_at: 2026-01-27T02:00:00+00:00
schema_version: 1
links:
  - to: bm_44444444-4444-4444-8444-444444444444
    type: depends_on
    title: "Frontmatter schema validation rules"
---

This System node describes the backend boundary: parsing, indexing, and API.
```

#### Decision (ADR)

```markdown
---
id: bm_55555555-5555-4555-8555-555555555555
title: "ADR: Markdown-first source of truth with SQLite derived index"
type: Decision
status: done
tags:
  - brain-map
  - adr
  - storage
owner: Cortex
source_links:
  - docs/brain-map/brain-map-spec.md
created_at: 2026-01-21T12:00:00+00:00
updated_at: 2026-01-27T02:00:00+00:00
schema_version: 1
links:
  - to: bm_33333333-3333-4333-8333-333333333333
    type: implements
    title: "Brain Map backend: Markdown indexer + API"
---

## Context

We need git-friendly, reviewable source of truth.

## Decision

Use Markdown notes as canonical data; SQLite is a derived performance index.

## Consequences

- Index rebuilds must be deterministic.
- Write path must preserve unknown fields.
```

#### TaskContract

```markdown
---
id: bm_66666666-6666-4666-8666-666666666666
title: "Implement deterministic index publish/swap"
type: TaskContract
status: planned
tags:
  - brain-map
  - backend
priority: P0
owner: Ralph
risk: high
acceptance_criteria:
  - "Indexer builds index in a temp location and only swaps into place on success."
  - "On failure, last known-good index remains usable."
  - "Diagnostics include duplicate id file paths when present."
created_at: 2026-01-27T02:00:00+00:00
updated_at: 2026-01-27T02:00:00+00:00
schema_version: 1
links:
  - to: bm_33333333-3333-4333-8333-333333333333
    type: implements
    title: "Brain Map backend: Markdown indexer + API"
---

Task contract nodes represent atomic work units. The real task contract for Ralph execution is generated later.
```

#### Artifact

```markdown
---
id: bm_77777777-7777-4777-8777-777777777777
title: "Brain Map UI prototype screenshot"
type: Artifact
status: active
tags:
  - brain-map
  - ui
source_links:
  - artifacts/brain-map/ui-prototype-2026-01-27.png
created_at: 2026-01-27T02:00:00+00:00
updated_at: 2026-01-27T02:00:00+00:00
schema_version: 1
links:
  - to: bm_88888888-8888-4888-8888-888888888888
    type: validated_by
    title: "Graph view acceptance criteria"
    note: "Use as a visual baseline for neuron-like styling."
---

A visual artifact used to validate UI look-and-feel.
```

## What changed vs previous draft

This canonical spec adds and fully specifies the following mandatory sections as first-class requirements:

- Node Identity & Stability Rules (critical)
- Inbox / Scratchpad Capture Mode
- Explicit Non-Goals
- Failure & Recovery Model
- Agent Ingestion Contract
- Appendix added: Frontmatter & Link Schema (Canonical)
