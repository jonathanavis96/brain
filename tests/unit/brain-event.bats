#!/usr/bin/env bats
# Unit tests for bin/brain-event flag parsing

setup() {
  export BRAIN_EVENT="$BATS_TEST_DIRNAME/../../bin/brain-event"
  export DEBUG=0

  # Use an isolated workspace so tests don't write to the repo's state/events.jsonl
  export WORKSPACE_DIR
  WORKSPACE_DIR="$(mktemp -d)"
  mkdir -p "$WORKSPACE_DIR/state"
  : >"$WORKSPACE_DIR/state/events.jsonl"
}

teardown() {
  rm -rf "$WORKSPACE_DIR"
}

# Helpers
last_event_line() {
  tail -n 1 "$WORKSPACE_DIR/state/events.jsonl" 2>/dev/null || true
}

# Test: Flag parsing doesn't consume next option when value missing
@test "brain-event: --event flag without value doesn't consume --iter" {
  # This should NOT treat "--iter" as the event value
  run "$BRAIN_EVENT" --workspace "$WORKSPACE_DIR" --event --iter 1 --phase build

  # Should succeed (no error exit)
  [ "$status" -eq 0 ]

  # Script is silent on stdout
  [ -z "$output" ]

  # Should NOT emit event (no valid event provided)
  [ ! -s "$WORKSPACE_DIR/state/events.jsonl" ]
}

@test "brain-event: --event with valid value processes correctly" {
  run "$BRAIN_EVENT" --workspace "$WORKSPACE_DIR" --event iteration_start --iter 1 --phase plan

  # Should succeed
  [ "$status" -eq 0 ]

  # Script is silent on stdout
  [ -z "$output" ]

  # Should write JSON line to events file
  line="$(last_event_line)"
  [[ "$line" =~ '"event":"iteration_start"' ]]
  [[ "$line" =~ '"iter":1' ]]
  [[ "$line" =~ '"phase":"plan"' ]]
}

@test "brain-event: all flags can be missing values without consuming next flag" {
  run "$BRAIN_EVENT" --event --iter --phase --status --msg --code

  # Should exit cleanly (no crash)
  [ "$status" -eq 0 ]

  # No output (no valid event)
  [ -z "$output" ]
}

@test "brain-event: flag value not starting with -- is consumed" {
  run "$BRAIN_EVENT" --workspace "$WORKSPACE_DIR" --event iteration_start --iter 5 --runner myevent

  # Should succeed
  [ "$status" -eq 0 ]

  # Script is silent on stdout
  [ -z "$output" ]

  line="$(last_event_line)"
  [[ "$line" =~ '"event":"iteration_start"' ]]
  [[ "$line" =~ '"iter":5' ]]
  [[ "$line" =~ '"runner":"myevent"' ]]
}

@test "brain-event: mixed scenario with some missing values" {
  # test_event is not a valid event type (should be ignored), but parsing should not crash
  run "$BRAIN_EVENT" --workspace "$WORKSPACE_DIR" --event test_event --iter --phase build --status pass

  # Should succeed
  [ "$status" -eq 0 ]

  # Script is silent on stdout
  [ -z "$output" ]

  # No event should be emitted for unknown event types
  [ ! -s "$WORKSPACE_DIR/state/events.jsonl" ]
}

@test "brain-event: empty string value is accepted" {
  run "$BRAIN_EVENT" --workspace "$WORKSPACE_DIR" --event "" --iter 1

  # Should exit cleanly (empty event = no valid event)
  [ "$status" -eq 0 ]
  [ -z "$output" ]
  [ ! -s "$WORKSPACE_DIR/state/events.jsonl" ]
}
