"""Heuristic parser for logs without explicit markers."""

import re
import uuid
from pathlib import Path
from typing import Iterator

from ..models import ToolCall, ToolStatus

# Default patterns for common log formats
DEFAULT_PATTERNS = {
    # Tool invocation patterns
    "tool_start": [
        r"Running tool[:\s]+(?P<name>\w+)",
        r"Executing[:\s]+(?P<name>\w+)",
        r"\[TOOL\]\s+(?P<name>\w+)\s+started",
        r">>> (?P<name>\w+)",
    ],
    # Success patterns
    "tool_pass": [
        r"Tool\s+\w+\s+completed successfully",
        r"\[PASS\]",
        r"exit\s*(?:code)?[:\s]*0\b",
        r"✓|✔|PASSED|SUCCESS",
    ],
    # Failure patterns
    "tool_fail": [
        r"Tool\s+\w+\s+failed",
        r"\[FAIL\]",
        r"exit\s*(?:code)?[:\s]*[1-9]\d*",
        r"✗|✘|FAILED|ERROR",
        r"Traceback \(most recent call last\)",
    ],
    # Exit code extraction
    "exit_code": [
        r"exit\s*(?:code)?[:\s]*(?P<code>\d+)",
        r"returned\s+(?P<code>\d+)",
    ],
    # Error message extraction
    "error_msg": [
        r"(?:Error|Exception)[:\s]+(?P<msg>.+?)(?:\n|$)",
        r"FATAL[:\s]+(?P<msg>.+?)(?:\n|$)",
    ],
}


class HeuristicParser:
    """Parse logs using regex heuristics when markers aren't available."""

    def __init__(self, patterns: dict | None = None):
        """Initialize heuristic parser.

        Args:
            patterns: Custom patterns dict, or None for defaults
        """
        self.patterns = patterns or DEFAULT_PATTERNS
        self._compiled = self._compile_patterns()

    def _compile_patterns(self) -> dict[str, list[re.Pattern]]:
        """Compile regex patterns."""
        compiled = {}
        for category, pattern_list in self.patterns.items():
            compiled[category] = [re.compile(p, re.IGNORECASE) for p in pattern_list]
        return compiled

    def parse_file(self, log_path: Path) -> Iterator[ToolCall]:
        """Parse a log file using heuristic patterns.

        Args:
            log_path: Path to log file

        Yields:
            ToolCall objects detected heuristically
        """
        current_tool: ToolCall | None = None
        start_line = 0

        with open(log_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        for line_num, line in enumerate(lines, 1):
            # Look for tool start
            tool_name = self._match_tool_start(line)
            if tool_name:
                # Yield previous tool if exists
                if current_tool:
                    current_tool.line_range = (start_line, line_num - 1)
                    yield current_tool

                # Start new tool
                current_tool = ToolCall(
                    id=str(uuid.uuid4()),
                    tool_name=tool_name,
                    log_file=str(log_path),
                )
                start_line = line_num
                continue

            # Look for status indicators
            if current_tool:
                if self._match_pass(line):
                    current_tool.status = ToolStatus.PASS
                elif self._match_fail(line):
                    current_tool.status = ToolStatus.FAIL

                # Try to extract exit code
                exit_code = self._extract_exit_code(line)
                if exit_code is not None:
                    current_tool.exit_code = exit_code

                # Try to extract error message
                error_msg = self._extract_error(line)
                if error_msg and not current_tool.error_excerpt:
                    current_tool.error_excerpt = error_msg[:200]

        # Yield final tool
        if current_tool:
            current_tool.line_range = (start_line, len(lines))
            yield current_tool

    def _match_tool_start(self, line: str) -> str | None:
        """Check if line matches tool start pattern."""
        for pattern in self._compiled.get("tool_start", []):
            if match := pattern.search(line):
                return match.group("name")
        return None

    def _match_pass(self, line: str) -> bool:
        """Check if line indicates success."""
        return any(p.search(line) for p in self._compiled.get("tool_pass", []))

    def _match_fail(self, line: str) -> bool:
        """Check if line indicates failure."""
        return any(p.search(line) for p in self._compiled.get("tool_fail", []))

    def _extract_exit_code(self, line: str) -> int | None:
        """Extract exit code from line."""
        for pattern in self._compiled.get("exit_code", []):
            if match := pattern.search(line):
                return int(match.group("code"))
        return None

    def _extract_error(self, line: str) -> str | None:
        """Extract error message from line."""
        for pattern in self._compiled.get("error_msg", []):
            if match := pattern.search(line):
                return match.group("msg")
        return None
