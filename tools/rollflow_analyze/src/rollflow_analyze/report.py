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
    aggregates = _calculate_aggregates(tool_calls)
    cache_advice = _calculate_cache_advice(tool_calls)

    return Report(
        run_id=run_id,
        tool_calls=tool_calls,
        aggregates=aggregates,
        cache_advice=cache_advice,
    )


def _calculate_aggregates(tool_calls: list[ToolCall]) -> Aggregates:
    """Calculate aggregate statistics from tool calls.

    Args:
        tool_calls: List of tool calls to analyze

    Returns:
        Aggregates with pass/fail rates, top failures, slowest tools
    """
    total_calls = len(tool_calls)
    pass_count = sum(1 for tc in tool_calls if tc.status == ToolStatus.PASS)
    fail_count = sum(1 for tc in tool_calls if tc.status == ToolStatus.FAIL)
    unknown_count = sum(1 for tc in tool_calls if tc.status == ToolStatus.UNKNOWN)

    pass_rate = pass_count / total_calls if total_calls > 0 else 0.0
    fail_rate = fail_count / total_calls if total_calls > 0 else 0.0

    # Count failures by tool
    failure_counts: dict[str, int] = {}
    for tc in tool_calls:
        if tc.status == ToolStatus.FAIL:
            failure_counts[tc.tool_name] = failure_counts.get(tc.tool_name, 0) + 1

    # Sort by failure count descending, take top 10
    top_failures_by_tool = dict(
        sorted(failure_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    )

    # Find slowest tools (with valid duration)
    tools_with_duration = [
        (tc.tool_name, tc.duration_ms)
        for tc in tool_calls
        if tc.duration_ms is not None
    ]
    slowest_tools = sorted(tools_with_duration, key=lambda x: x[1], reverse=True)[:10]

    # Find flakiest tools (tools with both PASS and FAIL)
    tool_statuses: dict[str, set[ToolStatus]] = {}
    for tc in tool_calls:
        if tc.tool_name not in tool_statuses:
            tool_statuses[tc.tool_name] = set()
        tool_statuses[tc.tool_name].add(tc.status)

    flakiest_tools = [
        tool_name
        for tool_name, statuses in tool_statuses.items()
        if ToolStatus.PASS in statuses and ToolStatus.FAIL in statuses
    ]

    return Aggregates(
        total_calls=total_calls,
        pass_count=pass_count,
        fail_count=fail_count,
        unknown_count=unknown_count,
        pass_rate=pass_rate,
        fail_rate=fail_rate,
        top_failures_by_tool=top_failures_by_tool,
        slowest_tools=slowest_tools,
        flakiest_tools=flakiest_tools,
    )


def _calculate_cache_advice(tool_calls: list[ToolCall]) -> CacheAdvice:
    """Calculate cache optimization recommendations.

    Args:
        tool_calls: List of tool calls to analyze

    Returns:
        CacheAdvice with potential skips and time savings
    """
    # Group PASS calls by cache_key
    cache_key_calls: dict[str, list[ToolCall]] = {}
    for tc in tool_calls:
        if tc.status == ToolStatus.PASS and tc.cache_key:
            if tc.cache_key not in cache_key_calls:
                cache_key_calls[tc.cache_key] = []
            cache_key_calls[tc.cache_key].append(tc)

    # Find duplicate keys (keys with more than 1 PASS call)
    duplicate_keys = [key for key, calls in cache_key_calls.items() if len(calls) > 1]

    # Count potential skips (all duplicate calls except the first)
    potential_skips = sum(
        len(calls) - 1 for calls in cache_key_calls.values() if len(calls) > 1
    )

    # Estimate time saved (sum of durations for skippable calls)
    estimated_time_saved_ms = 0
    for key in duplicate_keys:
        calls = cache_key_calls[key]
        # Skip first call (cache population), sum rest
        for tc in calls[1:]:
            if tc.duration_ms is not None:
                estimated_time_saved_ms += tc.duration_ms

    # Count reusable PASS calls (unique cache keys with PASS)
    reusable_pass_calls = len(
        [key for key, calls in cache_key_calls.items() if len(calls) >= 1]
    )

    return CacheAdvice(
        reusable_pass_calls=reusable_pass_calls,
        potential_skips=potential_skips,
        estimated_time_saved_ms=estimated_time_saved_ms,
        duplicate_keys=duplicate_keys,
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
