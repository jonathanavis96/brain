"""Generate human-readable review packs from analysis reports."""

from pathlib import Path

from .models import Report, ToolCall, ToolStatus


def write_review_pack(report: Report, output_path: Path) -> None:
    """Generate comprehensive markdown review pack from report.

    Args:
        report: Report to format
        output_path: Path to write markdown review pack
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    lines = _build_review_pack_lines(report)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def _build_review_pack_lines(report: Report) -> list[str]:
    """Build all sections of the review pack.

    Args:
        report: Report to format

    Returns:
        List of lines to write
    """
    lines = []

    # Header
    lines.extend(_header_section(report))
    lines.append("")

    # Executive Summary
    lines.extend(_executive_summary_section(report))
    lines.append("")

    # Performance Analysis
    lines.extend(_performance_section(report))
    lines.append("")

    # Cache Optimization
    lines.extend(_cache_section(report))
    lines.append("")

    # Failures (if any)
    if report.aggregates.fail_count > 0:
        lines.extend(_failures_section(report))
        lines.append("")

    # Tool Breakdown
    lines.extend(_tool_breakdown_section(report))
    lines.append("")

    return lines


def _header_section(report: Report) -> list[str]:
    """Generate header section."""
    return [
        "# RollFlow Review Pack",
        "",
        f"**Generated:** {report.generated_at.isoformat()}",
        f"**Run ID:** {report.run_id or 'N/A'}",
        f"**Total Tool Calls:** {report.aggregates.total_calls}",
    ]


def _executive_summary_section(report: Report) -> list[str]:
    """Generate executive summary section."""
    agg = report.aggregates
    cache = report.cache_advice

    # Calculate health score (0-100)
    health_score = int(agg.pass_rate * 100)

    # Determine status emoji
    if health_score == 100:
        status_emoji = "✅"
        status_text = "Excellent"
    elif health_score >= 95:
        status_emoji = "✅"
        status_text = "Good"
    elif health_score >= 80:
        status_emoji = "⚠️"
        status_text = "Needs Attention"
    else:
        status_emoji = "❌"
        status_text = "Critical"

    lines = [
        "## Executive Summary",
        "",
        f"**Status:** {status_emoji} {status_text} ({health_score}% success rate)",
        "",
        "### Quick Stats",
        "",
        f"- **Pass Rate:** {agg.pass_rate:.1%} ({agg.pass_count}/{agg.total_calls})",
        f"- **Fail Rate:** {agg.fail_rate:.1%} ({agg.fail_count}/{agg.total_calls})",
        f"- **Unknown:** {agg.unknown_count}",
    ]

    # Cache savings
    if cache.potential_skips > 0:
        time_saved_sec = cache.estimated_time_saved_ms / 1000
        lines.extend(
            [
                "",
                "### Cache Opportunity",
                "",
                f"- **Potential skips:** {cache.potential_skips} duplicate calls",
                f"- **Time savings:** {time_saved_sec:.1f}s",
            ]
        )

    return lines


def _performance_section(report: Report) -> list[str]:
    """Generate performance analysis section."""
    agg = report.aggregates

    lines = [
        "## Performance Analysis",
        "",
        "### Slowest Tools",
        "",
    ]

    if agg.slowest_tools:
        lines.append("| Tool | Duration |")
        lines.append("|------|----------|")
        for tool_name, duration_ms in agg.slowest_tools[:10]:
            duration_sec = duration_ms / 1000
            lines.append(f"| `{tool_name}` | {duration_sec:.2f}s |")

        # Attach log excerpt for slowest tool call
        slowest_calls = [tc for tc in report.tool_calls if tc.duration_ms is not None]
        if slowest_calls:
            slowest_call = max(slowest_calls, key=lambda tc: tc.duration_ms or 0)
            lines.extend(
                [
                    "",
                    "#### Slowest Tool Call Details",
                    "",
                    f"**Tool:** `{slowest_call.tool_name}` | **Duration:** {(slowest_call.duration_ms or 0) / 1000:.2f}s",
                    "",
                ]
            )
            log_excerpt = _extract_log_excerpt(slowest_call, context_lines=5)
            if log_excerpt:
                lines.append("<details>")
                lines.append("<summary>📋 Log Excerpt</summary>")
                lines.append("")
                lines.append("```text")
                lines.append(log_excerpt)
                lines.append("```")
                lines.append("")
                lines.append("</details>")
                lines.append("")
    else:
        lines.append("*No timing data available*")

    # Flakiest tools
    if agg.flakiest_tools:
        lines.extend(
            [
                "",
                "### Flaky Tools (Both PASS and FAIL)",
                "",
            ]
        )
        for tool_name in agg.flakiest_tools:
            lines.append(f"- `{tool_name}` ⚠️")

    return lines


def _cache_section(report: Report) -> list[str]:
    """Generate cache optimization section."""
    cache = report.cache_advice

    lines = [
        "## Cache Optimization",
        "",
        f"- **Reusable PASS calls:** {cache.reusable_pass_calls}",
        f"- **Potential skips:** {cache.potential_skips}",
        f"- **Estimated time saved:** {cache.estimated_time_saved_ms / 1000:.1f}s",
    ]

    if cache.duplicate_keys:
        lines.extend(
            [
                "",
                "### Top Duplicate Cache Keys",
                "",
            ]
        )
        # Show first 10 duplicate keys
        for i, key in enumerate(cache.duplicate_keys[:10], 1):
            # Truncate long keys
            display_key = key if len(key) <= 60 else f"{key[:57]}..."
            lines.append(f"{i}. `{display_key}`")

        if len(cache.duplicate_keys) > 10:
            lines.append(f"*... and {len(cache.duplicate_keys) - 10} more*")

    return lines


def _failures_section(report: Report) -> list[str]:
    """Generate failures section."""
    agg = report.aggregates

    lines = [
        "## ❌ Failures",
        "",
        f"**Total failures:** {agg.fail_count}",
        "",
    ]

    if agg.top_failures_by_tool:
        lines.extend(
            [
                "### Failures by Tool",
                "",
                "| Tool | Count |",
                "|------|-------|",
            ]
        )
        for tool_name, count in agg.top_failures_by_tool.items():
            lines.append(f"| `{tool_name}` | {count} |")

    # Find failed tool calls with error excerpts
    failed_calls = [tc for tc in report.tool_calls if tc.status == ToolStatus.FAIL]

    if failed_calls:
        lines.extend(
            [
                "",
                "### Recent Failures",
                "",
            ]
        )

        for i, tc in enumerate(failed_calls[:5], 1):
            lines.append(f"#### Failure {i}: {tc.tool_name}")
            lines.append("")
            if tc.error_excerpt:
                lines.append("```text")
                lines.append(tc.error_excerpt)
                lines.append("```")
            else:
                lines.append(f"*Exit code: {tc.exit_code}*")
            lines.append("")

            # Attach log excerpt if available
            log_excerpt = _extract_log_excerpt(tc, context_lines=10)
            if log_excerpt:
                lines.append("<details>")
                lines.append("<summary>📋 Log Excerpt</summary>")
                lines.append("")
                lines.append("```text")
                lines.append(log_excerpt)
                lines.append("```")
                lines.append("")
                lines.append("</details>")
                lines.append("")

        if len(failed_calls) > 5:
            lines.append(f"*... and {len(failed_calls) - 5} more failures*")

    return lines


def _extract_log_excerpt(tool_call: ToolCall, context_lines: int = 10) -> str | None:
    """Extract log excerpt around a tool call.

    Args:
        tool_call: Tool call with log_file and line_range
        context_lines: Number of lines before/after to include

    Returns:
        Filtered log excerpt or None if not available
    """
    if not tool_call.log_file or not tool_call.line_range:
        return None

    try:
        log_path = Path(tool_call.log_file)
        if not log_path.exists():
            return None

        start_line, end_line = tool_call.line_range

        # Calculate context window
        excerpt_start = max(1, start_line - context_lines)
        excerpt_end = end_line + context_lines

        # Read log file and extract lines
        with open(log_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        # Convert to 0-indexed
        excerpt_start_idx = excerpt_start - 1
        excerpt_end_idx = min(len(lines), excerpt_end)

        # Extract relevant lines
        excerpt_lines = lines[excerpt_start_idx:excerpt_end_idx]

        # Filter out ANSI escape codes for cleaner output
        cleaned_lines = []
        for line in excerpt_lines:
            # Remove ANSI escape sequences
            import re

            clean_line = re.sub(r"\x1b\[[0-9;]*[a-zA-Z]", "", line)
            clean_line = re.sub(r"\x1b\][^\x07]*\x07", "", clean_line)
            cleaned_lines.append(clean_line.rstrip())

        # Build excerpt with line numbers
        result = []
        for i, line in enumerate(cleaned_lines, start=excerpt_start):
            # Highlight the actual tool call line
            if start_line <= i <= end_line:
                result.append(f"{i:6d} >>> {line}")
            else:
                result.append(f"{i:6d}     {line}")

        return "\n".join(result)

    except Exception:
        return None


def _tool_breakdown_section(report: Report) -> list[str]:
    """Generate tool breakdown section."""
    # Group tool calls by tool name
    tool_stats: dict[str, dict[str, int]] = {}

    for tc in report.tool_calls:
        if tc.tool_name not in tool_stats:
            tool_stats[tc.tool_name] = {
                "total": 0,
                "pass": 0,
                "fail": 0,
                "unknown": 0,
            }

        tool_stats[tc.tool_name]["total"] += 1
        if tc.status == ToolStatus.PASS:
            tool_stats[tc.tool_name]["pass"] += 1
        elif tc.status == ToolStatus.FAIL:
            tool_stats[tc.tool_name]["fail"] += 1
        else:
            tool_stats[tc.tool_name]["unknown"] += 1

    lines = [
        "## Tool Breakdown",
        "",
        "| Tool | Total | Pass | Fail | Success Rate |",
        "|------|-------|------|------|--------------|",
    ]

    # Sort by total calls descending
    sorted_tools = sorted(tool_stats.items(), key=lambda x: x[1]["total"], reverse=True)

    for tool_name, stats in sorted_tools:
        total = stats["total"]
        pass_count = stats["pass"]
        fail_count = stats["fail"]
        success_rate = (pass_count / total * 100) if total > 0 else 0

        lines.append(
            f"| `{tool_name}` | {total} | {pass_count} | {fail_count} | {success_rate:.1f}% |"
        )

    return lines
