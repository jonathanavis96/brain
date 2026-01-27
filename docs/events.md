# Brain Event Markers

Provider-neutral event markers emitted by the Ralph loop for external tooling.

## Overview

The Brain repository emits lightweight, machine-readable event markers during loop execution. These markers are written to `state/events.jsonl` and can be consumed by external tools (monitoring, calibration, analytics) without any coupling to specific providers or services.

## File Location

```text
brain/state/events.jsonl
```

- **Format:** JSONL (one JSON object per line)
- **Behavior:** Append-only
- **Persistence:** Local to repo, not committed (in `.gitignore`)

## Event Schema

Each line is a JSON object with these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ts` | string | Yes | ISO8601 UTC timestamp (e.g., `2026-01-24T12:30:00Z`) |
| `event` | string | Yes | Event type (see below) |
| `iter` | integer | No | Iteration number |
| `phase` | string | No | Phase name (`plan`, `build`, `custom`, etc.) |
| `status` | string | No | `ok` or `fail` (for `*_end` and `error` events) |
| `msg` | string | No | Short message (max 200 chars, for `error` events) |
| `code` | integer | No | Exit code (for `error` events) |
| `workspace` | string | Yes | Absolute path to repo root |
| `pid` | integer | Yes | Process ID |
| `runner` | string | No | Runner label (e.g., `rovodev`, `opencode`) |

## Event Types

| Event | When Emitted | Key Fields |
|-------|--------------|------------|
| `iteration_start` | Beginning of each iteration | `iter` |
| `iteration_end` | End of successful iteration | `iter`, `status=ok` |
| `phase_start` | Before running a phase | `iter`, `phase` |
| `phase_end` | After phase completes | `iter`, `phase`, `status`, `code` (if failed) |
| `error` | On unexpected loop exit | `iter`, `status=fail`, `code`, `msg` |

## Example Events

```json
{"ts":"2026-01-24T12:30:00Z","event":"iteration_start","iter":1,"workspace":"/home/user/brain","pid":12345,"runner":"rovodev"}
{"ts":"2026-01-24T12:30:01Z","event":"phase_start","iter":1,"phase":"plan","workspace":"/home/user/brain","pid":12345,"runner":"rovodev"}
{"ts":"2026-01-24T12:35:00Z","event":"phase_end","iter":1,"phase":"plan","status":"ok","workspace":"/home/user/brain","pid":12345,"runner":"rovodev"}
{"ts":"2026-01-24T12:35:01Z","event":"phase_start","iter":1,"phase":"build","workspace":"/home/user/brain","pid":12345,"runner":"rovodev"}
{"ts":"2026-01-24T12:40:00Z","event":"phase_end","iter":1,"phase":"build","status":"ok","workspace":"/home/user/brain","pid":12345,"runner":"rovodev"}
{"ts":"2026-01-24T12:40:05Z","event":"iteration_end","iter":1,"status":"ok","workspace":"/home/user/brain","pid":12345,"runner":"rovodev"}
```

### Error Example

```json
{"ts":"2026-01-24T12:45:00Z","event":"error","iter":2,"status":"fail","msg":"verifier failed","code":44,"workspace":"/home/user/brain","pid":12345,"runner":"rovodev"}
```

## CLI Usage

The `bin/brain-event` script can be used directly:

```bash
# Emit iteration start
bin/brain-event --event iteration_start --iter 1

# Emit phase events
bin/brain-event --event phase_start --iter 1 --phase BUILD
bin/brain-event --event phase_end --iter 1 --phase BUILD --status ok

# Emit error
bin/brain-event --event error --iter 1 --status fail --code 1 --msg "something went wrong"
```

## Consuming Events

### Parse with jq

```bash
# Get all iteration_start events
jq 'select(.event == "iteration_start")' state/events.jsonl

# Get failed phases
jq 'select(.event == "phase_end" and .status == "fail")' state/events.jsonl

# Count iterations today
jq -s '[.[] | select(.event == "iteration_start")] | length' state/events.jsonl
```

### Parse with Python

```python
import json
from pathlib import Path

events_file = Path("state/events.jsonl")
if events_file.exists():
    for line in events_file.read_text().splitlines():
        event = json.loads(line)
        if event["event"] == "iteration_end":
            print(f"Iteration {event['iter']} completed")
```

## Design Principles

1. **Provider-neutral:** No references to specific services, accounts, or credentials
2. **Best-effort:** Event emission never fails the loop; errors are silently ignored
3. **Standalone:** Brain works identically with or without event consumers
4. **Append-only:** Safe for concurrent reads; no deduplication attempted
5. **Lightweight:** Minimal overhead; simple JSON format

## RovoDev Format

RovoDev emits tool call events in its internal logs (`~/.config/acli/rovodev/logs/` or `~/.rovodev/logs/`). These logs capture ALL tool invocations made by the agent.

### Log Format

RovoDev logs are structured text with two key patterns:

1. **Tool call start** (DEBUG level):

   ```text
   2026-01-25 17:10:05.978 | DEBUG    | Model response tool call: {"tool_name": "bash", "args": "...", "tool_call_id": "toolu_..."}
   ```

2. **Tool call end** (DEBUG level):

   ```text
   2026-01-25 17:10:06.033 | DEBUG    | Model request part: {"tool_name": "bash", "content": "...", "tool_call_id": "..."}
   ```

3. **Tool call summary** (INFO level):

   ```text
   2026-01-25 17:10:05.978 | INFO     | Model response tool call: bash
   ```

### Parsing RovoDev Logs

The `rollflow_analyze` tool includes a RovoDev parser:

```bash
# Parse RovoDev logs (auto-detects location)
cd tools/rollflow_analyze || exit
PYTHONPATH=src python3 -m rollflow_analyze

# Specify custom log directory
PYTHONPATH=src python3 -m rollflow_analyze --rovodev-logs /path/to/logs

# Disable RovoDev parsing
PYTHONPATH=src python3 -m rollflow_analyze --rovodev-logs none
```

### Extracted Data

From RovoDev logs, the parser extracts:

- **Tool name**: `bash`, `grep`, `open_files`, `find_and_replace_code`, etc.
- **Start timestamp**: When the tool was called
- **End timestamp**: When the tool returned (if available)
- **Duration**: Calculated from start/end timestamps
- **Arguments**: Extracted from JSON (simplified for display)
- **Tool call ID**: RovoDev's internal identifier (e.g., `toolu_bdrk_...`)

### Example Tool Calls

Common tools captured from RovoDev logs:

| Tool | Description | Args Example |
|------|-------------|--------------|
| `bash` | Shell command execution | `git status` |
| `grep` | Code search | `pattern: "def main"` |
| `open_files` | File viewing | `files: ["README.md", "setup.py"]` |
| `find_and_replace_code` | Code editing | `file: src/main.py` |
| `expand_code_chunks` | View specific code sections | `file: src/parser.py` |

### Comparison: JSONL vs RovoDev

| Feature | JSONL Events | RovoDev Logs |
|---------|--------------|--------------|
| **Scope** | Loop lifecycle (iterations, phases) | Individual tool calls |
| **Location** | `state/events.jsonl` | `~/.config/acli/rovodev/logs/` |
| **Format** | JSONL (one event per line) | Structured text logs |
| **Granularity** | Iteration-level | Tool-level |
| **Use case** | Track loop progress | Debug tool usage |

## Integration Notes

External tools can:

- **Watch the file** for new events (e.g., `tail -f state/events.jsonl`)
- **Parse periodically** to aggregate metrics
- **Correlate with other logs** using `ts` and `iter` fields
- **Parse RovoDev logs** to get complete tool visibility (see `rollflow_analyze` tool)

The `runner` field, when present, indicates which tool executed the loop (e.g., `rovodev`, `opencode`). This is optional and may be omitted or set to `unknown`.
