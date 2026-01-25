# Unit Tests

This directory contains unit tests for shell scripts using the [bats-core](https://github.com/bats-core/bats-core) framework.

## Installation

### macOS

```bash
brew install bats-core
```

### Ubuntu/Debian

```bash
sudo apt-get install bats
```

### Manual Installation

```bash
git clone https://github.com/bats-core/bats-core.git
cd bats-core
sudo ./install.sh /usr/local
```

## Running Tests

Run all tests:

```bash
bats tests/unit/*.bats
```

Run specific test file:

```bash
bats tests/unit/brain-event.bats
```

Run with verbose output:

```bash
bats -t tests/unit/brain-event.bats
```

## Pre-commit Integration

Tests run automatically via pre-commit hook when shell scripts are modified. If bats is not installed, the hook prints a warning but doesn't fail.

To run manually:

```bash
pre-commit run bats-tests --all-files
```

## Writing Tests

Test files use `.bats` extension. Basic structure:

```bash
#!/usr/bin/env bats

setup() {
  # Run before each test
  export TEST_VAR="value"
}

teardown() {
  # Run after each test (optional)
  rm -f /tmp/test-file
}

@test "description of test" {
  run command arg1 arg2
  
  # Assertions
  [ "$status" -eq 0 ]           # Exit code
  [ "$output" = "expected" ]    # Stdout
  [[ "$output" =~ pattern ]]    # Regex match
}
```

## Test Coverage

Current test coverage:

- `brain-event.bats` - Flag parsing for bin/brain-event (6 tests)

## References

- [bats-core documentation](https://bats-core.readthedocs.io/)
- [bats-core GitHub](https://github.com/bats-core/bats-core)
