"""Parser for logs with explicit START/END markers."""

import re
from datetime import datetime
from pathlib import Path
from typing import Iterator

from ..models import ToolCall, ToolStatus

# Marker patterns
START_PATTERN = re.compile(
    r"::TOOL_CALL_START::\s+"
    r"id=(?P<id>\S+)\s+"
    r"name=(?P<name>\S+)\s+"
    r"key=(?P<key>\S+)\s+"
    r"ts=(?P<ts>\S+)"
    r"(?:\s+git=(?P<git>\S+))?"
)

END_PATTERN = re.compile(
    r"::TOOL_CALL_END::\s+"
    r"id=(?P<id>\S+)\s+"
    r"status=(?P<status>PASS|FAIL)\s+"
    r"exit=(?P<exit>\d+)\s+"
    r"duration_ms=(?P<duration>\d+)"
    r"(?:\s+err=(?P<err>.+))?"
)

RUN_PATTERN = re.compile(r"::RUN::\s+id=(?P<id>\S+)\s+ts=(?P<ts>\S+)")
ITER_PATTERN = re.compile(
    r"::ITER::\s+id=(?P<id>\S+)\s+run_id=(?P<run_id>\S+)\s+ts=(?P<ts>\S+)"
)


class MarkerParser:
    """Parse logs containing explicit tool call markers."""

    def __init__(self):
        """Initialize marker parser."""
        self._pending: dict[str, ToolCall] = {}
        self._current_run_id: str | None = None
        self._current_iter_id: str | None = None

    def parse_file(self, log_path: Path) -> Iterator[ToolCall]:
        """Parse a single log file for tool calls.

        Args:
            log_path: Path to log file

        Yields:
            ToolCall objects for each complete START/END pair
        """
        with open(log_path, "r", encoding="utf-8", errors="replace") as f:
            for line_num, line in enumerate(f, 1):
                yield from self._parse_line(line, log_path, line_num)

        # Yield any incomplete calls (missing END)
        for call in self._pending.values():
            call.status = ToolStatus.UNKNOWN
            yield call
        self._pending.clear()

    def _parse_line(
        self, line: str, log_path: Path, line_num: int
    ) -> Iterator[ToolCall]:
        """Parse a single line for markers.

        Args:
            line: Log line to parse
            log_path: Source file path
            line_num: Line number in file

        Yields:
            Completed ToolCall objects
        """
        # Check for RUN marker
        if match := RUN_PATTERN.search(line):
            self._current_run_id = match.group("id")
            return

        # Check for ITER marker
        if match := ITER_PATTERN.search(line):
            self._current_iter_id = match.group("id")
            return

        # Check for START marker
        if match := START_PATTERN.search(line):
            call_id = match.group("id")
            self._pending[call_id] = ToolCall(
                id=call_id,
                tool_name=match.group("name"),
                cache_key=match.group("key"),
                start_ts=self._parse_timestamp(match.group("ts")),
                log_file=str(log_path),
                line_range=(line_num, line_num),
                run_id=self._current_run_id,
                iter_id=self._current_iter_id,
            )
            return

        # Check for END marker
        if match := END_PATTERN.search(line):
            call_id = match.group("id")
            if call_id in self._pending:
                call = self._pending.pop(call_id)
                call.status = ToolStatus[match.group("status")]
                call.exit_code = int(match.group("exit"))
                call.duration_ms = int(match.group("duration"))
                call.end_ts = datetime.now()  # TODO: Parse from marker if available
                call.error_excerpt = match.group("err")
                if call.line_range:
                    call.line_range = (call.line_range[0], line_num)
                yield call

    @staticmethod
    def _parse_timestamp(ts_str: str) -> datetime | None:
        """Parse ISO timestamp string."""
        try:
            return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            return None
