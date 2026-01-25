"""Data models for RollFlow log analysis."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class ToolStatus(Enum):
    """Status of a tool call."""

    PASS = "PASS"
    FAIL = "FAIL"
    UNKNOWN = "UNKNOWN"


class ToolSource(Enum):
    """Source of the tool call data."""

    SHELL_MARKER = "shell_marker"  # From loop.sh markers (fix-markdown, verifier, etc.)
    ROVODEV = "rovodev"  # From RovoDev logs (bash, grep, open_files, etc.)
    HEURISTIC = "heuristic"  # Inferred from log patterns


@dataclass
class ToolCall:
    """Represents a single tool call extracted from logs."""

    id: str
    tool_name: str
    status: ToolStatus = ToolStatus.UNKNOWN
    source: ToolSource = ToolSource.HEURISTIC
    exit_code: Optional[int] = None
    start_ts: Optional[datetime] = None
    end_ts: Optional[datetime] = None
    duration_ms: Optional[int] = None
    cache_key: Optional[str] = None
    args_excerpt: Optional[str] = None
    error_excerpt: Optional[str] = None
    log_file: Optional[str] = None
    line_range: Optional[tuple[int, int]] = None
    run_id: Optional[str] = None
    iter_id: Optional[str] = None


@dataclass
class Iteration:
    """Represents a single Ralph iteration with all its tool calls."""

    iter_num: int
    run_id: Optional[str] = None
    phase: Optional[str] = None  # "plan" or "build"
    start_ts: Optional[datetime] = None
    end_ts: Optional[datetime] = None
    duration_ms: Optional[int] = None
    tool_calls: list[ToolCall] = field(default_factory=list)
    task_id: Optional[str] = None
    commit_sha: Optional[str] = None

    @property
    def tool_count(self) -> int:
        return len(self.tool_calls)

    @property
    def tool_breakdown(self) -> dict[str, int]:
        """Count of calls per tool type."""
        counts: dict[str, int] = {}
        for tc in self.tool_calls:
            counts[tc.tool_name] = counts.get(tc.tool_name, 0) + 1
        return counts


@dataclass
class CacheAdvice:
    """Cache optimization recommendations."""

    reusable_pass_calls: int = 0
    potential_skips: int = 0
    estimated_time_saved_ms: int = 0
    duplicate_keys: list[str] = field(default_factory=list)


@dataclass
class Aggregates:
    """Aggregate statistics for tool calls."""

    total_calls: int = 0
    pass_count: int = 0
    fail_count: int = 0
    unknown_count: int = 0
    pass_rate: float = 0.0
    fail_rate: float = 0.0
    top_failures_by_tool: dict[str, int] = field(default_factory=dict)
    slowest_tools: list[tuple[str, int]] = field(default_factory=list)
    flakiest_tools: list[str] = field(default_factory=list)


@dataclass
class ToolBreakdown:
    """Breakdown of tool usage statistics."""

    tool_name: str
    total_calls: int = 0
    total_duration_ms: int = 0
    avg_duration_ms: float = 0.0
    min_duration_ms: Optional[int] = None
    max_duration_ms: Optional[int] = None
    pass_count: int = 0
    fail_count: int = 0


@dataclass
class Report:
    """Complete analysis report."""

    generated_at: datetime = field(default_factory=datetime.now)
    run_id: Optional[str] = None
    tool_calls: list[ToolCall] = field(default_factory=list)
    iterations: list[Iteration] = field(default_factory=list)
    aggregates: Aggregates = field(default_factory=Aggregates)
    cache_advice: CacheAdvice = field(default_factory=CacheAdvice)
    tool_breakdown: list[ToolBreakdown] = field(default_factory=list)

    # RovoDev-specific stats
    rovodev_tool_calls: int = 0
    shell_marker_calls: int = 0
