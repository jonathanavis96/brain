"""Tests for heuristic parser."""

from pathlib import Path

from rollflow_analyze.parsers.heuristic_parser import HeuristicParser
from rollflow_analyze.models import ToolStatus


class TestHeuristicParser:
    """Test suite for HeuristicParser."""

    def test_parse_simple_pass(self, tmp_path: Path):
        """Test parsing a simple passing tool output."""
        log_file = tmp_path / "test.log"
        log_file.write_text(
            "Running tool: shellcheck\n"
            "Checking files...\n"
            "All checks passed!\n"
            "[PASS]\n"
        )

        parser = HeuristicParser()
        calls = list(parser.parse_file(log_file))

        assert len(calls) == 1
        assert calls[0].tool_name == "shellcheck"
        assert calls[0].status == ToolStatus.PASS

    def test_parse_simple_fail(self, tmp_path: Path):
        """Test parsing a simple failing tool output."""
        log_file = tmp_path / "test.log"
        log_file.write_text(
            "Executing: pytest\n"
            "Running tests...\n"
            "Error: AssertionError in test_foo\n"
            "[FAIL]\n"
            "exit code: 1\n"
        )

        parser = HeuristicParser()
        calls = list(parser.parse_file(log_file))

        assert len(calls) == 1
        assert calls[0].tool_name == "pytest"
        assert calls[0].status == ToolStatus.FAIL
        assert calls[0].exit_code == 1

    def test_parse_multiple_tools(self, tmp_path: Path):
        """Test parsing multiple tool invocations."""
        log_file = tmp_path / "test.log"
        log_file.write_text(
            "Running tool: lint\n"
            "Linting...\n"
            "[PASS]\n"
            "Running tool: test\n"
            "Testing...\n"
            "[PASS]\n"
            "Running tool: build\n"
            "Building...\n"
            "[FAIL]\n"
        )

        parser = HeuristicParser()
        calls = list(parser.parse_file(log_file))

        assert len(calls) == 3
        assert calls[0].tool_name == "lint"
        assert calls[0].status == ToolStatus.PASS
        assert calls[1].tool_name == "test"
        assert calls[1].status == ToolStatus.PASS
        assert calls[2].tool_name == "build"
        assert calls[2].status == ToolStatus.FAIL

    def test_custom_patterns(self, tmp_path: Path):
        """Test using custom patterns."""
        log_file = tmp_path / "test.log"
        log_file.write_text(
            "[CUSTOM] Starting mytool\n" "Working...\n" "[CUSTOM] mytool OK\n"
        )

        custom_patterns = {
            "tool_start": [r"\[CUSTOM\]\s+Starting\s+(?P<name>\w+)"],
            "tool_pass": [r"\[CUSTOM\]\s+\w+\s+OK"],
            "tool_fail": [r"\[CUSTOM\]\s+\w+\s+FAILED"],
            "exit_code": [],
            "error_msg": [],
        }

        parser = HeuristicParser(patterns=custom_patterns)
        calls = list(parser.parse_file(log_file))

        assert len(calls) == 1
        assert calls[0].tool_name == "mytool"
        assert calls[0].status == ToolStatus.PASS

    def test_extract_error_excerpt(self, tmp_path: Path):
        """Test error message extraction."""
        log_file = tmp_path / "test.log"
        log_file.write_text(
            "Running tool: compile\n"
            "Compiling...\n"
            "Error: undefined reference to 'foo'\n"
            "[FAIL]\n"
        )

        parser = HeuristicParser()
        calls = list(parser.parse_file(log_file))

        assert len(calls) == 1
        assert "undefined reference" in calls[0].error_excerpt


# TODO: Add more edge case tests
# - No tool detected
# - Ambiguous status
# - Very large files (streaming)
