"""Tests for marker parser."""

from pathlib import Path

from rollflow_analyze.parsers.marker_parser import MarkerParser
from rollflow_analyze.models import ToolStatus


class TestMarkerParser:
    """Test suite for MarkerParser."""

    def test_parse_complete_pass(self, tmp_path: Path):
        """Test parsing a complete PASS tool call."""
        log_file = tmp_path / "test.log"
        log_file.write_text(
            "::TOOL_CALL_START:: id=abc123 name=shellcheck key=sha256abc ts=2026-01-24T12:00:00\n"
            "Running shellcheck...\n"
            "::TOOL_CALL_END:: id=abc123 status=PASS exit=0 duration_ms=150\n"
        )

        parser = MarkerParser()
        calls = list(parser.parse_file(log_file))

        assert len(calls) == 1
        assert calls[0].id == "abc123"
        assert calls[0].tool_name == "shellcheck"
        assert calls[0].status == ToolStatus.PASS
        assert calls[0].exit_code == 0
        assert calls[0].duration_ms == 150

    def test_parse_complete_fail(self, tmp_path: Path):
        """Test parsing a complete FAIL tool call."""
        log_file = tmp_path / "test.log"
        log_file.write_text(
            "::TOOL_CALL_START:: id=def456 name=pytest key=sha256def ts=2026-01-24T12:00:00\n"
            "Running pytest...\n"
            "::TOOL_CALL_END:: id=def456 status=FAIL exit=1 duration_ms=5000 err=AssertionError\n"
        )

        parser = MarkerParser()
        calls = list(parser.parse_file(log_file))

        assert len(calls) == 1
        assert calls[0].status == ToolStatus.FAIL
        assert calls[0].exit_code == 1
        assert calls[0].error_excerpt == "AssertionError"

    def test_parse_missing_end(self, tmp_path: Path):
        """Test handling of missing END marker."""
        log_file = tmp_path / "test.log"
        log_file.write_text(
            "::TOOL_CALL_START:: id=ghi789 name=build key=sha256ghi ts=2026-01-24T12:00:00\n"
            "Building...\n"
            "# No END marker - process crashed?\n"
        )

        parser = MarkerParser()
        calls = list(parser.parse_file(log_file))

        assert len(calls) == 1
        assert calls[0].status == ToolStatus.UNKNOWN

    def test_parse_interleaved_calls(self, tmp_path: Path):
        """Test parsing interleaved tool calls."""
        log_file = tmp_path / "test.log"
        log_file.write_text(
            "::TOOL_CALL_START:: id=a1 name=lint key=k1 ts=2026-01-24T12:00:00\n"
            "::TOOL_CALL_START:: id=b2 name=test key=k2 ts=2026-01-24T12:00:01\n"
            "::TOOL_CALL_END:: id=b2 status=PASS exit=0 duration_ms=100\n"
            "::TOOL_CALL_END:: id=a1 status=PASS exit=0 duration_ms=200\n"
        )

        parser = MarkerParser()
        calls = list(parser.parse_file(log_file))

        assert len(calls) == 2
        # b2 ends first
        assert calls[0].id == "b2"
        assert calls[1].id == "a1"

    def test_parse_with_run_iter_markers(self, tmp_path: Path):
        """Test parsing with RUN and ITER markers."""
        log_file = tmp_path / "test.log"
        log_file.write_text(
            "::RUN:: id=run-001 ts=2026-01-24T12:00:00\n"
            "::ITER:: id=iter-001 run_id=run-001 ts=2026-01-24T12:00:00\n"
            "::TOOL_CALL_START:: id=t1 name=check key=k1 ts=2026-01-24T12:00:00\n"
            "::TOOL_CALL_END:: id=t1 status=PASS exit=0 duration_ms=50\n"
        )

        parser = MarkerParser()
        calls = list(parser.parse_file(log_file))

        assert len(calls) == 1
        assert calls[0].run_id == "run-001"
        assert calls[0].iter_id == "iter-001"


# TODO: Add more edge case tests
# - Unicode in tool names
# - Very long lines
# - Malformed markers
# - Empty files
