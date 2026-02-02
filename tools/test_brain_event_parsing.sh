#!/usr/bin/env bash
# Minimal self-test for bin/brain-event flag parsing.
# Intentionally avoids bats so it can run in any environment.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRAIN_EVENT="$ROOT/bin/brain-event"

if [[ ! -x "$BRAIN_EVENT" ]]; then
  echo "FAIL: bin/brain-event not executable at $BRAIN_EVENT" >&2
  exit 1
fi

# 1) Missing value should not consume next flag (and should not write an event)
workspace_dir="$(mktemp -d)"
mkdir -p "$workspace_dir/state"
: >"$workspace_dir/state/events.jsonl"

out="$($BRAIN_EVENT --workspace "$workspace_dir" --event --iter 1 --phase build)"
if [[ -n "$out" ]]; then
  echo "FAIL: expected no stdout when --event has no value; got: $out" >&2
  exit 1
fi
if [[ -s "$workspace_dir/state/events.jsonl" ]]; then
  echo "FAIL: expected no event lines written when --event has no value" >&2
  exit 1
fi

# 2) Valid value should append an event to the events file (script is silent on stdout)
workspace_dir="$(mktemp -d)"
mkdir -p "$workspace_dir/state"
: >"$workspace_dir/state/events.jsonl"

$BRAIN_EVENT --workspace "$workspace_dir" --event iteration_start --iter 1 --phase plan
last_line="$(tail -n 1 "$workspace_dir/state/events.jsonl" || true)"

if [[ "$last_line" != *"\"event\":\"iteration_start\""* ]]; then
  echo "FAIL: expected last event line to contain event=iteration_start; got: $last_line" >&2
  exit 1
fi

# 3) All flags missing values should not crash
out="$($BRAIN_EVENT --event --iter --phase --status --msg --code)"
if [[ -n "$out" ]]; then
  echo "FAIL: expected no output when event missing; got: $out" >&2
  exit 1
fi

echo "PASS: brain-event flag parsing"
