# Marker Schema - Brain Event System

## Overview

The brain repository uses structured markers (format: `:::MARKER_NAME::: key=value ...`) for observability, caching, and analysis. All markers are emitted to stderr and captured in iteration log files.

## Marker Categories

### Iteration Lifecycle

**:::ITER_START:::**

- **Purpose:** Marks beginning of an iteration
- **Emitted by:** `loop.sh`
- **Required fields:**
  - `iter`: Iteration number (integer)
  - `run_id`: Unique run identifier (YYYYMMDD-HHMMSS format)
  - `ts`: Unix timestamp (seconds since epoch)
- **Example:** `:::ITER_START::: iter=5 run_id=20260126-123045 ts=1737891045`

**:::ITER_END:::**

- **Purpose:** Marks end of an iteration
- **Emitted by:** `loop.sh`
- **Required fields:**
  - `iter`: Iteration number (integer)
  - `run_id`: Unique run identifier
  - `ts`: Unix timestamp
- **Example:** `:::ITER_END::: iter=5 run_id=20260126-123045 ts=1737891145`

### Phase Lifecycle

**:::PHASE_START:::**

- **Purpose:** Marks beginning of a phase (PLAN, BUILD, or custom)
- **Emitted by:** `loop.sh`
- **Required fields:**
  - `iter`: Iteration number
  - `phase`: Phase name (`plan`, `build`, or `custom`)
  - `run_id`: Unique run identifier
  - `ts`: Unix timestamp
- **Example:** `:::PHASE_START::: iter=5 phase=build run_id=20260126-123045 ts=1737891050`

**:::PHASE_END:::**

- **Purpose:** Marks end of a phase
- **Emitted by:** `loop.sh`
- **Required fields:**
  - `iter`: Iteration number
  - `phase`: Phase name (`plan`, `build`, or `custom`)
  - `status`: Phase result (`ok` or `fail`)
  - `run_id`: Unique run identifier
  - `ts`: Unix timestamp
- **Optional fields:**
  - `code`: Exit code (present when `status=fail`)
- **Examples:**
  - Success: `:::PHASE_END::: iter=5 phase=build status=ok run_id=20260126-123045 ts=1737891145`
  - Failure: `:::PHASE_END::: iter=5 phase=build status=fail code=1 run_id=20260126-123045 ts=1737891145`

### Agent Signaling

**:::BUILD_READY:::**

- **Purpose:** Agent signals BUILD phase completion
- **Emitted by:** Ralph agent (AI response)
- **Required fields:** None (standalone marker)
- **Example:** `:::BUILD_READY:::`

**:::PLAN_READY:::**

- **Purpose:** Agent signals PLAN phase completion
- **Emitted by:** Ralph agent (AI response)
- **Required fields:** None (standalone marker)
- **Example:** `:::PLAN_READY:::`

**:::COMPLETE:::**

- **Purpose:** Loop signals all tasks completed (RESERVED - agents must not emit)
- **Emitted by:** `loop.sh` only
- **Required fields:** None (standalone marker)
- **Example:** `:::COMPLETE:::`
- **Note:** Agents attempting to emit this marker will trigger a warning

### Tool Execution

**:::TOOL_START:::**

- **Purpose:** Marks beginning of tool execution
- **Emitted by:** `loop.sh` (via `run_tool_with_cache()`)
- **Required fields:**
  - `id`: Unique tool invocation ID (UUID format)
  - `tool`: Tool name (e.g., `bash`, `grep`, `open_files`)
  - `cache_key`: Cache lookup key (SHA256 hash)
  - `git_sha`: Current git commit SHA
  - `ts`: Unix timestamp
- **Example:** `:::TOOL_START::: id=a1b2c3d4 tool=bash cache_key=def456... git_sha=abc123... ts=1737891055`

**:::TOOL_END:::**

- **Purpose:** Marks end of tool execution
- **Emitted by:** `loop.sh` (via `run_tool_with_cache()`)
- **Required fields:**
  - `id`: Tool invocation ID (matches TOOL_START)
  - `result`: Execution result (`PASS`, `FAIL`, or `UNKNOWN`)
  - `exit`: Exit code (integer)
  - `duration_ms`: Execution duration in milliseconds
  - `ts`: Unix timestamp
- **Optional fields:**
  - `reason`: Additional context (e.g., `cache_hit`, `timeout`)
- **Examples:**
  - Normal: `:::TOOL_END::: id=a1b2c3d4 result=PASS exit=0 duration_ms=1234 ts=1737891057`
  - Cache hit: `:::TOOL_END::: id=a1b2c3d4 result=PASS exit=0 duration_ms=15 reason=cache_hit ts=1737891057`

### Cache Operations

**:::CACHE_HIT:::**

- **Purpose:** Tool result retrieved from cache
- **Emitted by:** `loop.sh` (via `log_cache_hit()`)
- **Required fields:**
  - `cache_key`: Cache lookup key (SHA256 hash)
  - `tool`: Tool name
  - `ts`: Unix timestamp
- **Example:** `:::CACHE_HIT::: cache_key=def456... tool=bash ts=1737891055`

**:::CACHE_MISS:::**

- **Purpose:** Tool result not found in cache
- **Emitted by:** `loop.sh` (via `log_cache_miss()`)
- **Required fields:**
  - `cache_key`: Cache lookup key (SHA256 hash)
  - `tool`: Tool name
  - `ts`: Unix timestamp
- **Example:** `:::CACHE_MISS::: cache_key=def456... tool=bash ts=1737891055`

**:::CACHE_CONFIG:::**

- **Purpose:** Documents cache configuration for iteration
- **Emitted by:** `loop.sh`
- **Required fields:**
  - `mode`: Cache mode (`off`, `read`, `write`, or `readwrite`)
  - `scope`: Cache scope (comma-separated: `verify`, `read`, `llm_ro`)
  - `exported`: Whether config is exported to environment (`0` or `1`)
  - `iter`: Iteration number
  - `ts`: Unix timestamp
- **Example:** `:::CACHE_CONFIG::: mode=readwrite scope=verify,read exported=1 iter=5 ts=1737891050`

**:::CACHE_GUARD:::**

- **Purpose:** Documents cache eligibility decision
- **Emitted by:** `loop.sh` (build and plan phases)
- **Required fields:**
  - `iter`: Iteration number
  - `allowed`: Cache allowed (`0` = no, `1` = yes)
  - `reason`: Reason for decision (`pending_tasks`, `no_pending_tasks`, `idempotent_check`)
  - `phase`: Current phase (`build` or `plan`)
  - `ts`: Unix timestamp
- **Examples:**
  - Disallowed: `:::CACHE_GUARD::: iter=5 allowed=0 reason=pending_tasks phase=build ts=1737891050`
  - Allowed: `:::CACHE_GUARD::: iter=5 allowed=1 reason=no_pending_tasks phase=build ts=1737891050`

### Environment & Configuration

**:::VERIFIER_ENV:::**

- **Purpose:** Documents verifier execution environment
- **Emitted by:** `loop.sh` and `verifier.sh`
- **Required fields:**
  - `ts`: Unix timestamp
- **Optional fields (loop.sh):**
  - `iter`: Iteration number
  - `run_id`: Unique run identifier
- **Optional fields (verifier.sh):**
  - `CACHE_MODE`: Cache mode value or `unset`
  - `CACHE_SCOPE`: Cache scope value or `unset`
- **Examples:**
  - From loop.sh: `:::VERIFIER_ENV::: iter=5 ts=1737891100 run_id=20260126-123045`
  - From verifier.sh: `:::VERIFIER_ENV::: CACHE_MODE=readwrite CACHE_SCOPE=verify,read`

## Field Value Formats

### Common Formats

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `iter` | Integer | `5` | 1-based iteration counter |
| `ts` | Integer | `1737891045` | Unix timestamp (seconds since epoch) |
| `run_id` | YYYYMMDD-HHMMSS | `20260126-123045` | Unique per loop.sh invocation |
| `cache_key` | SHA256 hex | `def456abc...` | 64-character hash |
| `git_sha` | Git SHA | `abc123...` | 40-character hash |
| `id` | UUID | `a1b2c3d4-e5f6-...` | Unique tool invocation ID |

### Enumerated Values

| Field | Allowed Values | Notes |
|-------|----------------|-------|
| `phase` | `plan`, `build`, `custom` | Phase type |
| `status` | `ok`, `fail` | Phase completion status |
| `result` | `PASS`, `FAIL`, `UNKNOWN` | Tool execution result |
| `allowed` | `0`, `1` | Boolean (0=false, 1=true) |
| `mode` | `off`, `read`, `write`, `readwrite` | Cache mode |
| `exported` | `0`, `1` | Boolean (0=false, 1=true) |

### Reason Codes

| Marker | Reason | Meaning |
|--------|--------|---------|
| `CACHE_GUARD` | `pending_tasks` | Tasks remain in IMPLEMENTATION_PLAN.md |
| `CACHE_GUARD` | `no_pending_tasks` | All tasks complete |
| `CACHE_GUARD` | `idempotent_check` | PLAN phase (idempotent operations) |
| `TOOL_END` | `cache_hit` | Result retrieved from cache |
| `TOOL_END` | `timeout` | Tool execution exceeded time limit |

## Parsing Rules

### Key-Value Extraction

1. **Format:** `key=value` (no spaces around `=`)
2. **Separation:** Space-delimited
3. **Quoting:** Values with spaces must be quoted (though current markers avoid this)
4. **Order:** Fields may appear in any order (parsers should be order-independent)

### Timestamp Handling

All timestamps are Unix epoch (seconds since 1970-01-01 00:00:00 UTC). Convert to human-readable format:

```bash
date -d "@1737891045"  # Linux
date -r 1737891045     # macOS
```

### ANSI Escape Sequences

Markers may contain ANSI color codes when emitted to terminal. Strip before parsing:

```bash
sed 's/\x1b\[[0-9;]*m//g'
```

## Consumer Tools

| Tool | Purpose | Location |
|------|---------|----------|
| `rollflow_analyze` | Parse markers into structured database | `tools/rollflow_analyze/` |
| `brain-event` | Real-time event monitoring | `bin/brain-event` |
| `marker_parser.py` | Python parser implementation | `tools/rollflow_analyze/src/rollflow_analyze/parsers/` |

## Design Principles

1. **Machine-readable first:** Consistent format enables reliable parsing
2. **Human-readable second:** Key names are descriptive, values are concise
3. **Stderr emission:** Markers go to stderr for separation from tool output
4. **Dual logging:** Also written to iteration log files for persistence
5. **Backwards compatibility:** New fields are optional; parsers ignore unknown keys
6. **No PII:** Markers contain only technical metadata (no user data, secrets)

## Validation

### Required Marker Checks

The `tools/test_cache_guard_marker.sh` script validates CACHE_GUARD markers:

```bash
bash tools/test_cache_guard_marker.sh
```

Checks:

- All 5 CACHE_GUARD emissions have required fields (iter, allowed, reason, phase, ts)
- Field values match expected formats

### Schema Compliance

When adding new markers:

1. **Document here first** - Update this schema before implementation
2. **Choose descriptive names** - Use `NOUN_VERB` pattern (e.g., `CACHE_HIT`, `PHASE_START`)
3. **Use existing fields** - Reuse `iter`, `ts`, `run_id` where applicable
4. **Add validation** - Create test scripts for new markers
5. **Update parsers** - Ensure `rollflow_analyze` and `brain-event` support new markers

## See Also

- **[docs/events.md](events.md)** - Event system design and philosophy
- **[docs/CACHE_DESIGN.md](CACHE_DESIGN.md)** - Cache architecture and marker integration
- **[tools/rollflow_analyze/README.md](../tools/rollflow_analyze/README.md)** - Analysis tool documentation
- **[workers/ralph/loop.sh](../workers/ralph/loop.sh)** - Primary marker emission source

---

**Last Updated:** 2026-01-26  
**Maintainer:** Ralph (brain self-improvement loop)
