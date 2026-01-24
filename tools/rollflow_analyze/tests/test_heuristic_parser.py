"""Tests for heuristic parser."""

from pathlib import Path
import pytest

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

    def test_load_yaml_config(self, tmp_path: Path):
        """Test loading patterns from YAML config file."""
        config_file = tmp_path / "patterns.yaml"
        config_file.write_text(
            """
tool_start:
  - 'CUSTOM_START:\\s+(?P<name>\\w+)'

tool_pass:
  - 'CUSTOM_PASS'

tool_fail:
  - 'CUSTOM_FAIL'
"""
        )

        log_file = tmp_path / "test.log"
        log_file.write_text("CUSTOM_START: mytool\nCUSTOM_PASS\n")

        parser = HeuristicParser(config_path=config_file)
        calls = list(parser.parse_file(log_file))

        assert len(calls) == 1
        assert calls[0].tool_name == "mytool"
        assert calls[0].status == ToolStatus.PASS

    def test_config_overrides_defaults(self, tmp_path: Path):
        """Test that config patterns override defaults but keep unspecified ones."""
        config_file = tmp_path / "patterns.yaml"
        config_file.write_text(
            """
tool_pass:
  - 'CUSTOM_SUCCESS'
"""
        )

        log_file = tmp_path / "test.log"
        log_file.write_text("Running tool: test\nCUSTOM_SUCCESS\n")

        parser = HeuristicParser(config_path=config_file)
        calls = list(parser.parse_file(log_file))

        # Should use default tool_start but custom tool_pass
        assert len(calls) == 1
        assert calls[0].tool_name == "test"
        assert calls[0].status == ToolStatus.PASS

    def test_invalid_config_schema(self, tmp_path: Path):
        """Test that invalid config raises ValueError."""
        config_file = tmp_path / "patterns.yaml"
        config_file.write_text("not_a_dict_but_a_string")

        with pytest.raises(ValueError, match="Config must be a dict"):
            HeuristicParser(config_path=config_file)

    def test_invalid_pattern_category(self, tmp_path: Path):
        """Test that unknown category raises ValueError."""
        config_file = tmp_path / "patterns.yaml"
        config_file.write_text(
            """
unknown_category:
  - 'pattern'
"""
        )

        with pytest.raises(ValueError, match="Unknown pattern category"):
            HeuristicParser(config_path=config_file)

    def test_invalid_regex_pattern(self, tmp_path: Path):
        """Test that invalid regex raises ValueError."""
        config_file = tmp_path / "patterns.yaml"
        config_file.write_text(
            """
tool_start:
  - '(?P<invalid'
"""
        )

        with pytest.raises(ValueError, match="Invalid regex"):
            HeuristicParser(config_path=config_file)

    def test_auto_load_config_fallback(self, tmp_path: Path):
        """Test that parser falls back to defaults when no config exists."""
        # Change to a directory without patterns.yaml
        import os

        old_cwd = os.getcwd()
        try:
            os.chdir(tmp_path)
            parser = HeuristicParser()
            # Should use defaults without error
            assert parser.patterns is not None
        finally:
            os.chdir(old_cwd)


# TODO: Add more edge case tests
# - No tool detected
# - Ambiguous status
# - Very large files (streaming)
