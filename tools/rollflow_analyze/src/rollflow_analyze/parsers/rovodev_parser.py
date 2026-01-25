"""Parser for RovoDev logs (~/.rovodev/logs/).

Extracts tool calls from RovoDev's internal logging format which captures
ALL tool invocations including bash, grep, open_files, find_and_replace_code, etc.

Log format example:
    2026-01-25 17:10:05.978 | INFO     | Model response tool call: bash
    2026-01-25 17:10:05.978 | DEBUG    | Model response tool call: {"tool_name": "bash", "args": "...", "tool_call_id": "toolu_bdrk_..."}
"""

from __future__ import annotations

import gzip
import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterator, Optional

from ..models import ToolCall, ToolStatus


# Pattern for tool call log lines
# Format: 2026-01-25 17:10:05.978 | DEBUG    | Model response tool call: {"tool_name": ...}
RE_TOOL_CALL = re.compile(
    r"^(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+)\s*\|\s*DEBUG\s*\|\s*"
    r"Model response tool call:\s*(?P<json>\{.+\})$"
)

# Pattern for tool return (completion) log lines
# Format: 2026-01-25 17:10:06.033 | DEBUG    | Model request part: {"tool_name": "bash", "content": "...", "tool_call_id": "..."}
RE_TOOL_RETURN = re.compile(
    r"^(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+)\s*\|\s*DEBUG\s*\|\s*"
    r"Model request part:\s*(?P<json>\{.+\})$"
)

# Pattern for INFO-level tool call summary (simpler, just tool name)
RE_TOOL_CALL_INFO = re.compile(
    r"^(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+)\s*\|\s*INFO\s*\|\s*"
    r"Model response tool call:\s*(?P<tool_name>\w+)$"
)


@dataclass
class RovoDevToolCall:
    """Intermediate representation of a RovoDev tool call."""

    tool_call_id: str
    tool_name: str
    args: str
    start_ts: datetime
    end_ts: Optional[datetime] = None
    response: Optional[str] = None
    duration_ms: Optional[int] = None


def _parse_timestamp(ts_str: str) -> datetime:
    """Parse RovoDev timestamp format: 2026-01-25 17:10:05.978"""
    try:
        return datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S.%f")
    except ValueError:
        # Try without milliseconds
        try:
            return datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            return datetime.now()


def _truncate_args(args: str, max_len: int = 200) -> str:
    """Truncate args for display, preserving useful info."""
    if len(args) <= max_len:
        return args
    return args[:max_len] + "..."


class RovoDevParser:
    """Parser for RovoDev log files.

    Extracts tool calls from RovoDev's internal logging, providing full
    visibility into all tool invocations during agent runs.
    """

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self._pending_calls: dict[str, RovoDevToolCall] = {}

    def parse_file(self, file_path: Path) -> Iterator[ToolCall]:
        """Parse a single RovoDev log file.

        Handles both plain .log files and .log.gz compressed files.
        """
        if self.verbose:
            print(f"  Parsing RovoDev log: {file_path.name}")

        # Handle gzipped files
        if file_path.suffix == ".gz":
            try:
                with gzip.open(
                    file_path, "rt", encoding="utf-8", errors="replace"
                ) as f:
                    yield from self._parse_lines(f, file_path)
            except (gzip.BadGzipFile, OSError) as e:
                if self.verbose:
                    print(f"    Warning: Could not read gzip file: {e}")
                return
        else:
            try:
                with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                    yield from self._parse_lines(f, file_path)
            except OSError as e:
                if self.verbose:
                    print(f"    Warning: Could not read file: {e}")
                return

    def _parse_lines(self, lines, file_path: Path) -> Iterator[ToolCall]:
        """Parse lines from a file-like object."""
        self._pending_calls.clear()
        line_num = 0

        for line in lines:
            line_num += 1
            line = line.rstrip("\n")

            # Try to match tool call (start)
            match = RE_TOOL_CALL.match(line)
            if match:
                try:
                    data = json.loads(match.group("json"))
                    tool_call_id = data.get("tool_call_id", f"unknown_{line_num}")
                    tool_name = data.get("tool_name", "unknown")

                    # Parse args - they might be a JSON string or already parsed
                    args_raw = data.get("args", "")
                    if isinstance(args_raw, str):
                        try:
                            args_parsed = json.loads(args_raw)
                            # Extract the most useful part for display
                            if "command" in args_parsed:
                                args = args_parsed["command"]
                            elif "file_paths" in args_parsed:
                                args = f"files: {args_parsed['file_paths']}"
                            elif "file_path" in args_parsed:
                                args = f"file: {args_parsed['file_path']}"
                            elif "content_pattern" in args_parsed:
                                args = f"pattern: {args_parsed['content_pattern']}"
                            else:
                                args = str(args_parsed)
                        except json.JSONDecodeError:
                            args = args_raw
                    else:
                        args = str(args_raw)

                    self._pending_calls[tool_call_id] = RovoDevToolCall(
                        tool_call_id=tool_call_id,
                        tool_name=tool_name,
                        args=args,
                        start_ts=_parse_timestamp(match.group("timestamp")),
                    )
                except (json.JSONDecodeError, KeyError) as e:
                    if self.verbose:
                        print(
                            f"    Warning: Could not parse tool call at line {line_num}: {e}"
                        )
                continue

            # Try to match tool return (end)
            match = RE_TOOL_RETURN.match(line)
            if match:
                try:
                    data = json.loads(match.group("json"))
                    if data.get("part_kind") == "tool-return":
                        tool_call_id = data.get("tool_call_id", "")
                        end_ts = _parse_timestamp(match.group("timestamp"))

                        if tool_call_id in self._pending_calls:
                            pending = self._pending_calls.pop(tool_call_id)
                            pending.end_ts = end_ts
                            pending.response = data.get("content", "")[
                                :500
                            ]  # Truncate response

                            # Calculate duration
                            if pending.start_ts and pending.end_ts:
                                delta = pending.end_ts - pending.start_ts
                                pending.duration_ms = int(delta.total_seconds() * 1000)

                            # Convert to ToolCall
                            yield ToolCall(
                                id=pending.tool_call_id,
                                tool_name=pending.tool_name,
                                status=ToolStatus.PASS,  # If we got a return, it passed
                                start_ts=pending.start_ts,
                                end_ts=pending.end_ts,
                                duration_ms=pending.duration_ms,
                                args_excerpt=_truncate_args(pending.args),
                                log_file=str(file_path),
                            )
                except (json.JSONDecodeError, KeyError):
                    pass

        # Emit any unclosed calls (may have been interrupted)
        for tool_call_id, pending in self._pending_calls.items():
            yield ToolCall(
                id=pending.tool_call_id,
                tool_name=pending.tool_name,
                status=ToolStatus.UNKNOWN,  # Unknown because no return received
                start_ts=pending.start_ts,
                args_excerpt=_truncate_args(pending.args),
                log_file=str(file_path),
            )

    def parse_directory(
        self, dir_path: Path, since: Optional[datetime] = None
    ) -> Iterator[ToolCall]:
        """Parse all RovoDev logs in a directory.

        Args:
            dir_path: Directory containing RovoDev log files
            since: Only parse logs modified after this datetime
        """
        if not dir_path.exists():
            if self.verbose:
                print(f"Warning: RovoDev logs directory not found: {dir_path}")
            return

        # Find all log files (both .log and .log.gz)
        log_files = list(dir_path.glob("rovodev*.log")) + list(
            dir_path.glob("rovodev*.log.gz")
        )

        if self.verbose:
            print(f"Found {len(log_files)} RovoDev log file(s)")

        # Sort by modification time (oldest first for proper ordering)
        log_files.sort(key=lambda p: p.stat().st_mtime)

        for log_file in log_files:
            # Skip files older than 'since'
            if since:
                mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
                if mtime < since:
                    continue

            yield from self.parse_file(log_file)


def get_rovodev_logs_dir() -> Path:
    """Get the default RovoDev logs directory."""
    return Path.home() / ".rovodev" / "logs"


def parse_rovodev_logs(
    logs_dir: Optional[Path] = None,
    since: Optional[datetime] = None,
    verbose: bool = False,
) -> list[ToolCall]:
    """Convenience function to parse RovoDev logs.

    Args:
        logs_dir: Directory containing logs (default: ~/.rovodev/logs)
        since: Only parse logs modified after this datetime
        verbose: Print progress messages

    Returns:
        List of ToolCall objects extracted from logs
    """
    if logs_dir is None:
        logs_dir = get_rovodev_logs_dir()

    parser = RovoDevParser(verbose=verbose)
    return list(parser.parse_directory(logs_dir, since=since))
