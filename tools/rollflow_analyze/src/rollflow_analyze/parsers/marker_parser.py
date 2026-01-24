"""Parser for logs with explicit START/END markers."""

from __future__ import annotations

import re
from dataclasses import replace
from datetime import datetime
from pathlib import Path
from typing import Iterator

from ..models import ToolCall, ToolStatus

MARKER_PREFIXES = ("::RUN::", "::ITER::", "::TOOL_CALL_START::", "::TOOL_CALL_END::")

RE_RUN = re.compile(r"^::RUN::\s+(?P<kv>.+)$")
RE_ITER = re.compile(r"^::ITER::\s+(?P<kv>.+)$")
RE_START = re.compile(r"^::TOOL_CALL_START::\s+(?P<kv>.+)$")
RE_END = re.compile(r"^::TOOL_CALL_END::\s+(?P<kv>.+)$")


def _parse_kv_blob(kv_blob: str) -> dict[str, str]:
    """Parse space-separated key=value pairs.

    Example: 'id=abc name=rovodev key=123 ts=... git=...'
    """
    out: dict[str, str] = {}
    for part in kv_blob.strip().split():
        if "=" not in part:
            continue
        k, v = part.split("=", 1)
        out[k.strip()] = v.strip()
    return out


def _read_marker_block(lines: list[str], i: int) -> tuple[str, int]:
    """Read a marker block that may span multiple lines.

    Marker blocks can be split across multiple lines (e.g. ts=... on next line).
    We treat consecutive non-empty lines that do NOT start with another marker
    as part of the same block.

    Returns: (block_text, next_index)
    """
    first = lines[i].rstrip("\n")
    buf = [first]
    j = i + 1
    while j < len(lines):
        nxt = lines[j].rstrip("\n")
        if not nxt:
            break
        if any(nxt.startswith(p) for p in MARKER_PREFIXES):
            break
        # continuation line (like "ts=..." wrapped to next line)
        buf.append(nxt.strip())
        j += 1
    return " ".join(buf), j


def _parse_timestamp(ts_str: str | None) -> datetime | None:
    """Parse ISO timestamp string."""
    if not ts_str:
        return None
    try:
        return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


def _safe_int(v: str | None) -> int | None:
    """Safely convert string to int."""
    if v is None:
        return None
    try:
        return int(v)
    except (ValueError, TypeError):
        return None


def _status_from_str(s: str | None) -> ToolStatus:
    """Convert status string to ToolStatus enum."""
    if s == "PASS":
        return ToolStatus.PASS
    if s == "FAIL":
        return ToolStatus.FAIL
    return ToolStatus.UNKNOWN


class MarkerParser:
    """Parse logs containing explicit tool call markers."""

    def __init__(self):
        """Initialize marker parser."""
        self._current_run_id: str | None = None
        self._current_iter_id: str | None = None

    def parse_file(self, path: Path) -> Iterator[ToolCall]:
        """Parse a single log file for tool calls.

        Args:
            path: Path to log file

        Yields:
            ToolCall objects for each complete START/END pair
        """
        text = path.read_text(errors="replace")
        lines = text.splitlines(keepends=True)

        # Active tool calls by id
        active: dict[str, ToolCall] = {}

        # Rolling excerpt buffer for unknown/missing END
        rolling_tail: list[str] = []

        for idx in range(len(lines)):
            line = lines[idx].rstrip("\n")

            # Update rolling tail (for error excerpts)
            if line and not line.startswith("::"):
                rolling_tail.append(line)
                if len(rolling_tail) > 50:
                    rolling_tail.pop(0)

            if not line.startswith("::"):
                continue

            # Handle multi-line marker blocks
            if not any(line.startswith(p) for p in MARKER_PREFIXES):
                continue

            block, _next_i = _read_marker_block(lines, idx)

            if block.startswith("::RUN::"):
                m = RE_RUN.match(block)
                if m:
                    kv = _parse_kv_blob(m.group("kv"))
                    self._current_run_id = kv.get("id", self._current_run_id)
                continue

            if block.startswith("::ITER::"):
                m = RE_ITER.match(block)
                if m:
                    kv = _parse_kv_blob(m.group("kv"))
                    self._current_iter_id = kv.get("id", self._current_iter_id)
                    self._current_run_id = kv.get("run_id", self._current_run_id)
                continue

            if block.startswith("::TOOL_CALL_START::"):
                m = RE_START.match(block)
                if not m:
                    continue
                kv = _parse_kv_blob(m.group("kv"))

                call_id = kv.get("id")
                if not call_id:
                    continue

                tc = ToolCall(
                    id=call_id,
                    tool_name=kv.get("name", "unknown"),
                    status=ToolStatus.UNKNOWN,
                    exit_code=None,
                    start_ts=_parse_timestamp(kv.get("ts")),
                    end_ts=None,
                    duration_ms=None,
                    cache_key=kv.get("key"),
                    args_excerpt=None,
                    error_excerpt=None,
                    log_file=str(path),
                    line_range=(idx + 1, idx + 1),  # Will update end on END marker
                    run_id=self._current_run_id,
                    iter_id=self._current_iter_id,
                )
                active[call_id] = tc
                continue

            if block.startswith("::TOOL_CALL_END::"):
                m = RE_END.match(block)
                if not m:
                    continue
                kv = _parse_kv_blob(m.group("kv"))
                call_id = kv.get("id")
                if not call_id:
                    continue

                tc = active.pop(call_id, None)
                if not tc:
                    # End without start; emit a synthetic record for visibility
                    yield ToolCall(
                        id=call_id,
                        tool_name="unknown",
                        status=_status_from_str(kv.get("status")),
                        exit_code=_safe_int(kv.get("exit")),
                        start_ts=None,
                        end_ts=_parse_timestamp(kv.get("ts")),
                        duration_ms=_safe_int(kv.get("duration_ms")),
                        cache_key=kv.get("key"),
                        args_excerpt=None,
                        error_excerpt=kv.get("err"),
                        log_file=str(path),
                        line_range=(idx + 1, idx + 1),
                        run_id=self._current_run_id,
                        iter_id=self._current_iter_id,
                    )
                    continue

                status = _status_from_str(kv.get("status"))
                exit_code = _safe_int(kv.get("exit"))
                duration_ms = _safe_int(kv.get("duration_ms"))
                err = kv.get("err")

                # If FAIL and err missing, pull a short tail excerpt
                error_excerpt = err
                if status == ToolStatus.FAIL and not error_excerpt and rolling_tail:
                    error_excerpt = "\n".join(rolling_tail[-10:])

                # Update line_range end
                start_line = tc.line_range[0] if tc.line_range else idx + 1

                tc2 = replace(
                    tc,
                    status=status,
                    exit_code=exit_code,
                    duration_ms=duration_ms,
                    end_ts=_parse_timestamp(kv.get("ts")),
                    error_excerpt=error_excerpt,
                    line_range=(start_line, idx + 1),
                )
                yield tc2

        # Yield any active calls that never ended
        for tc in active.values():
            yield replace(
                tc,
                status=ToolStatus.UNKNOWN,
                error_excerpt="\n".join(rolling_tail[-10:]) if rolling_tail else None,
            )


def parse_file(path: Path) -> Iterator[ToolCall]:
    """Convenience function to parse a file."""
    parser = MarkerParser()
    yield from parser.parse_file(path)


def parse_dir(log_dir: Path) -> Iterator[ToolCall]:
    """Parse all files in a directory."""
    for p in sorted(log_dir.rglob("*")):
        if p.is_file():
            yield from parse_file(p)
