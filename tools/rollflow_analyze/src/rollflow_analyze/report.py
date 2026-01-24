"""Report generation for RollFlow analysis."""

import json
from dataclasses import asdict
from datetime import datetime
from pathlib import Path
from typing import Any

from .models import Aggregates, CacheAdvice, Report, ToolCall, ToolStatus


def _serialize_value(obj: Any) -> Any:
    """Serialize special types for JSON output."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, ToolStatus):
        return obj.value
    if isinstance(obj, Path):
        return str(obj)
    return obj


def _to_json_dict(obj: Any) -> Any:
    """Recursively convert dataclass to JSON-serializable dict."""
    if hasattr(obj, "__dataclass_fields__"):
        return {k: _to_json_dict(v) for k, v in asdict(obj).items()}
    if isinstance(obj, list):
        return [_to_json_dict(item) for item in obj]
    if isinstance(obj, dict):
        return {k: _to_json_dict(v) for k, v in obj.items()}
    return _serialize_value(obj)


def build_report(tool_calls: list[ToolCall], run_id: str | None = None) -> Report:
    """Build a complete report from tool calls.

    Args:
        tool_calls: List of parsed tool calls
        run_id: Optional run identifier

    Returns:
        Complete Report with aggregates and cache advice
    """
    # TODO: Implement aggregates calculation
    # TODO: Implement cache advice calculation
    return Report(
        run_id=run_id,
        tool_calls=tool_calls,
        aggregates=Aggregates(),
        cache_advice=CacheAdvice(),
    )


def write_json_report(report: Report, output_path: Path) -> None:
    """Write report as JSON to file.

    Args:
        report: Report to serialize
        output_path: Path to write JSON file
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_dict = _to_json_dict(report)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(report_dict, f, indent=2)


def write_markdown_summary(report: Report, output_path: Path) -> None:
    """Write report as markdown summary.

    Args:
        report: Report to summarize
        output_path: Path to write markdown file
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    lines = [
        "# RollFlow Analysis Report",
        "",
        f"**Generated:** {report.generated_at.isoformat()}",
        f"**Run ID:** {report.run_id or 'N/A'}",
        "",
        "## Summary",
        "",
        f"- **Total tool calls:** {report.aggregates.total_calls}",
        f"- **Pass rate:** {report.aggregates.pass_rate:.1%}",
        f"- **Fail rate:** {report.aggregates.fail_rate:.1%}",
        "",
        "## Cache Advice",
        "",
        f"- **Potential skips:** {report.cache_advice.potential_skips}",
        f"- **Estimated time saved:** {report.cache_advice.estimated_time_saved_ms}ms",
        "",
    ]

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
