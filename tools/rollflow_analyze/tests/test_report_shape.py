"""Tests for report generation and shape validation."""

import json
from pathlib import Path

from rollflow_analyze.models import ToolCall, ToolStatus
from rollflow_analyze.report import build_report, write_json_report


class TestReportShape:
    """Test suite for report generation."""

    def test_empty_report_shape(self, tmp_path: Path):
        """Test that empty report has correct structure."""
        report = build_report([])
        output_path = tmp_path / "report.json"
        write_json_report(report, output_path)

        with open(output_path) as f:
            data = json.load(f)

        # Check required top-level keys
        assert "generated_at" in data
        assert "tool_calls" in data
        assert "aggregates" in data
        assert "cache_advice" in data

        # Check aggregates structure
        agg = data["aggregates"]
        assert "total_calls" in agg
        assert "pass_count" in agg
        assert "fail_count" in agg
        assert "pass_rate" in agg
        assert "fail_rate" in agg

        # Check cache_advice structure
        cache = data["cache_advice"]
        assert "reusable_pass_calls" in cache
        assert "potential_skips" in cache
        assert "estimated_time_saved_ms" in cache

    def test_report_with_calls(self, tmp_path: Path):
        """Test report with actual tool calls."""
        calls = [
            ToolCall(
                id="t1",
                tool_name="lint",
                status=ToolStatus.PASS,
                exit_code=0,
                duration_ms=100,
                cache_key="key1",
            ),
            ToolCall(
                id="t2",
                tool_name="test",
                status=ToolStatus.FAIL,
                exit_code=1,
                duration_ms=5000,
                cache_key="key2",
                error_excerpt="AssertionError",
            ),
        ]

        report = build_report(calls, run_id="run-123")
        output_path = tmp_path / "report.json"
        write_json_report(report, output_path)

        with open(output_path) as f:
            data = json.load(f)

        assert data["run_id"] == "run-123"
        assert len(data["tool_calls"]) == 2

        # Check tool call serialization
        tc1 = data["tool_calls"][0]
        assert tc1["id"] == "t1"
        assert tc1["tool_name"] == "lint"
        assert tc1["status"] == "PASS"
        assert tc1["exit_code"] == 0

        tc2 = data["tool_calls"][1]
        assert tc2["status"] == "FAIL"
        assert tc2["error_excerpt"] == "AssertionError"

    def test_report_json_valid(self, tmp_path: Path):
        """Test that output is valid JSON."""
        calls = [
            ToolCall(
                id="special-chars-!@#",
                tool_name="test",
                status=ToolStatus.PASS,
                error_excerpt="Quote: \"test\" and 'test'",
            )
        ]

        report = build_report(calls)
        output_path = tmp_path / "report.json"
        write_json_report(report, output_path)

        # Should not raise
        with open(output_path) as f:
            data = json.load(f)

        assert data["tool_calls"][0]["id"] == "special-chars-!@#"


# TODO: Add golden test with sample log + expected output
