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


@dataclass
class ToolCall:
    """Represents a single tool call extracted from logs."""

    id: str
    tool_name: str
    status: ToolStatus = ToolStatus.UNKNOWN
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
class Report:
    """Complete analysis report."""

    generated_at: datetime = field(default_factory=datetime.now)
    run_id: Optional[str] = None
    tool_calls: list[ToolCall] = field(default_factory=list)
    aggregates: Aggregates = field(default_factory=Aggregates)
    cache_advice: CacheAdvice = field(default_factory=CacheAdvice)
