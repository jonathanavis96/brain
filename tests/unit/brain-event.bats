#!/usr/bin/env bats
# Unit tests for bin/brain-event flag parsing

setup() {
  export BRAIN_EVENT="$BATS_TEST_DIRNAME/../../bin/brain-event"
  export DEBUG=0
}

# Test: Flag parsing doesn't consume next option when value missing
@test "brain-event: --event flag without value doesn't consume --iter" {
  # This should NOT treat "--iter" as the event value
  run "$BRAIN_EVENT" --event --iter 1 --phase build

  # Should succeed (no error exit)
  [ "$status" -eq 0 ]

  # Should NOT emit event (no valid event provided)
  # EVENT would be empty, so script exits silently at line 152
  [ -z "$output" ]
}

@test "brain-event: --event with valid value processes correctly" {
  run "$BRAIN_EVENT" --event iteration_start --iter 1 --phase plan

  # Should succeed
  [ "$status" -eq 0 ]

  # Should emit event JSON
  [[ "$output" =~ "iteration_start" ]]
}

@test "brain-event: all flags can be missing values without consuming next flag" {
  run "$BRAIN_EVENT" --event --iter --phase --status --msg --code

  # Should exit cleanly (no crash)
  [ "$status" -eq 0 ]

  # No output (no valid event)
  [ -z "$output" ]
}

@test "brain-event: flag value not starting with -- is consumed" {
  run "$BRAIN_EVENT" --event myevent --iter 5

  # Should succeed
  [ "$status" -eq 0 ]

  # Should contain event data
  [[ "$output" =~ "myevent" ]]
}

@test "brain-event: mixed scenario with some missing values" {
  run "$BRAIN_EVENT" --event test_event --iter --phase build --status pass

  # Should succeed
  [ "$status" -eq 0 ]

  # Should contain the values that were provided
  [[ "$output" =~ "test_event" ]]
  [[ "$output" =~ "build" ]]
  [[ "$output" =~ "pass" ]]
}

@test "brain-event: empty string value is accepted" {
  run "$BRAIN_EVENT" --event "" --iter 1

  # Should exit cleanly (empty event = no valid event)
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}
