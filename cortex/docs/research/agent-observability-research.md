# Research: Agent Observability in Brain

**Research Question:** What observability capabilities does Brain have today, and what gaps exist for production-grade agent monitoring?

**Scope:** Event markers, logging patterns, metrics, tracing
**Out of Scope:** External monitoring services (Datadog, Grafana), alerting systems
**Success Criteria:** Clear map of current state → future state with implementation path
**Confidence:** High (based on codebase analysis)

---

## 1. Current State

### 1.1 Event Marker System (:::MARKER:::)

Brain emits structured markers during loop execution via `emit_marker()` in `workers/ralph/loop.sh`.

**Existing Markers:**

| Marker | Purpose | Fields |
|--------|---------|--------|
| `:::ITER_START:::` | Iteration begins | `iter`, `run_id`, `ts` |
| `:::ITER_END:::` | Iteration completes | `iter`, `run_id`, `ts` |
| `:::PHASE_START:::` | Phase begins (plan/build/custom) | `iter`, `phase`, `run_id`, `ts` |
| `:::PHASE_END:::` | Phase completes | `iter`, `phase`, `status`, `run_id`, `ts`, `code` (if failed) |
| `:::TOOL_START:::` | Shell tool invocation begins | `id`, `tool`, `cache_key`, `git_sha`, `ts` |
| `:::TOOL_END:::` | Shell tool completes | `id`, `result`, `exit`, `duration_ms`, `ts`, `reason` (if skipped) |
| `:::CACHE_HIT:::` | Cache lookup succeeded | `cache_key`, `tool`, `ts` |
| `:::CACHE_MISS:::` | Cache lookup failed | `cache_key`, `tool`, `ts` |
| `:::CACHE_CONFIG:::` | Cache mode for iteration | `mode`, `scope`, `exported`, `iter`, `ts` |
| `:::CACHE_GUARD:::` | Cache guard decision | `iter`, `allowed`, `reason`, `phase`, `ts` |
| `:::VERIFIER_ENV:::` | Verifier context | `iter`, `ts`, `run_id` |

**Location:** Markers are written to stdout during loop execution, captured in log files.

### 1.2 JSONL Event File (docs/events.md)

Brain also has a documented JSONL event schema at `state/events.jsonl`:

```json
{"ts":"2026-01-24T12:30:00Z","event":"iteration_start","iter":1,"workspace":"/home/user/brain","pid":12345,"runner":"rovodev"}
```

**Event Types:** `iteration_start`, `iteration_end`, `phase_start`, `phase_end`, `error`

**CLI Tool:** `bin/brain-event` for manual emission.

### 1.3 Rollflow Analyze (tools/rollflow_analyze/)

Python tool that parses markers and generates reports:

- **Parsers:** `marker_parser.py` (:::MARKER::: format), `heuristic_parser.py` (fallback)
- **Models:** `ToolCall`, `CacheAdvice`, `Aggregates`, `Report`
- **Cache DB:** SQLite with `pass_cache` and `fail_log` tables
- **Output:** Markdown reports in `artifacts/rollflow_reports/`

### 1.4 RovoDev Tool Output (Parseable)

**Discovery:** RovoDev DOES emit tool call information in logs, just in a different format:

```text
⬡ Calling open_files:
⬢ Called open_files:
⬢ Calling bash: 0 seconds
⬢ Called bash:
```

**Format:**

- `⬡/⬢ Calling <tool_name>:` - Tool invocation start
- `⬢ Called <tool_name>:` - Tool invocation end
- Duration sometimes shown inline (e.g., `0 seconds`)

**Current Gap:** rollflow_analyze doesn't parse this format yet - it only parses `:::MARKER:::` markers.

**Opportunity:** Build a parser for RovoDev's ANSI-formatted output to get complete tool visibility.

---

## 2. Gap Analysis

### 2.1 What Works Well

| Capability | Maturity | Notes |
|------------|----------|-------|
| Iteration tracking | ✅ Mature | ITER_START/END reliable |
| Phase tracking | ✅ Mature | PHASE_START/END with status |
| Shell tool timing | ✅ Mature | TOOL_START/END with duration_ms |
| Cache observability | ✅ Mature | HIT/MISS/CONFIG/GUARD markers |
| Report generation | ⚠️ Partial | Works but incomplete data |

### 2.2 Gaps

| Gap | Severity | Description |
|-----|----------|-------------|
| **G1: RovoDev parser missing** | MEDIUM | Tool data exists but not parsed |
| **G2: No centralized event store** | MEDIUM | Markers in logs, not queryable |
| **G3: No real-time streaming** | MEDIUM | Must parse logs post-hoc |
| **G4: No cross-run correlation** | MEDIUM | `run_id` exists but no aggregation |
| **G5: No agent-level metrics** | LOW | Token usage, context size not tracked |
| **G6: No alerting hooks** | LOW | Events exist but no alert triggers |

---

## 3. Future State Vision

### 3.1 Short-Term (Documentation + Patterns)

**Goal:** Formalize what exists, document gaps, enable manual workarounds.

1. **Event Schema Spec** - Publish canonical schema for all markers
2. **Observability Patterns Skill** - `skills/domains/infrastructure/agent-observability-patterns.md`
3. **Manual Instrumentation Guide** - How to add markers to new tools

### 3.2 Medium-Term (Tooling Improvements)

**Goal:** Better data collection and analysis.

1. **Centralized Event Store** - SQLite/JSONL with all events, not just tool calls
2. **RovoDev Hook Integration** - If RovoDev exposes tool hooks, integrate
3. **Real-Time Event Tail** - `bin/brain-event --watch` for live monitoring
4. **Cross-Run Dashboard** - Aggregate metrics across runs

### 3.3 Long-Term (Platform Capabilities)

**Goal:** Production-grade observability for agent fleets.

1. **OpenTelemetry Integration** - Standard traces/spans
2. **Metrics Export** - Prometheus/StatsD compatible
3. **Alerting Framework** - Webhook-based alerts on failures
4. **Multi-Agent Correlation** - Track work across agent instances

---

## 4. Recommendations

### 4.1 Immediate Actions (No Code)

| Action | Owner | Deliverable |
|--------|-------|-------------|
| Document marker schema formally | Ralph | `docs/MARKER_SCHEMA.md` |
| Create observability skill | Ralph | `skills/domains/infrastructure/agent-observability-patterns.md` |
| Add markers to THUNK parsing | Ralph | Enhance current_ralph_tasks.sh |

### 4.2 Phase A Implementation (Loom Delta)

From `cortex/docs/loom_brain_feature_deltas.md`:

1. **Event Schema Spec** → Already partially exists in `docs/events.md`, needs expansion
2. **Structured Logging Guide** → New skill document
3. **Reference Dashboard** → Query examples for JSONL/SQLite

### 4.3 Decision Points

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Event format | JSONL vs SQLite vs Both | **Both** - JSONL for append, SQLite for query |
| Marker format | `:::KEY:::` vs JSON | **Keep :::KEY:::** - grep-friendly, proven |
| Tool instrumentation | Wrapper vs Agent hooks | **Agent hooks** if available, else document limitation |

---

## 5. Sources

| Source | Relevance | Trust |
|--------|-----------|-------|
| `workers/ralph/loop.sh` | Primary - marker definitions | High |
| `docs/events.md` | Primary - JSONL schema | High |
| `tools/rollflow_analyze/` | Primary - parser implementation | High |
| `artifacts/optimization_hints.md` | Supporting - RovoDev limitation | High |
| Loom feature deltas | Context - inspiration | Medium |

---

## 6. Next Steps

1. **Create skill document** with patterns for adding observability
2. **Expand docs/events.md** with complete marker reference
3. **Propose MARKER_SCHEMA.md** for formal specification
4. **Track G1 (RovoDev blindness)** in GAP_BACKLOG.md if not already

---

*Research completed: 2026-01-25*
*Confidence: High*
