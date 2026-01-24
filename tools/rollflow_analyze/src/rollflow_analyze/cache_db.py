"""Cache database interface for RollFlow analysis."""

import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Iterator, Optional

from .models import ToolCall, ToolStatus


class CacheDB:
    """SQLite-based cache for tool call results."""

    def __init__(self, db_path: Path):
        """Initialize cache database.

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        """Create tables if they don't exist."""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)

        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS pass_cache (
                    cache_key TEXT PRIMARY KEY,
                    tool_name TEXT NOT NULL,
                    last_pass_ts TEXT NOT NULL,
                    last_duration_ms INTEGER,
                    meta_json TEXT
                );

                CREATE TABLE IF NOT EXISTS fail_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cache_key TEXT NOT NULL,
                    tool_name TEXT NOT NULL,
                    ts TEXT NOT NULL,
                    exit_code INTEGER,
                    err_hash TEXT,
                    err_excerpt TEXT
                );

                CREATE INDEX IF NOT EXISTS idx_fail_log_key ON fail_log(cache_key);
                CREATE INDEX IF NOT EXISTS idx_fail_log_tool ON fail_log(tool_name);
                """
            )

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        """Context manager for database connection."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    def upsert_pass(self, tool_call: ToolCall) -> None:
        """Record a passing tool call in cache.

        Args:
            tool_call: Tool call with PASS status
        """
        if tool_call.status != ToolStatus.PASS:
            raise ValueError("Can only cache PASS results")
        if not tool_call.cache_key:
            raise ValueError("Tool call must have cache_key")

        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO pass_cache
                (cache_key, tool_name, last_pass_ts, last_duration_ms, meta_json)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    tool_call.cache_key,
                    tool_call.tool_name,
                    (tool_call.end_ts or datetime.now()).isoformat(),
                    tool_call.duration_ms,
                    None,  # TODO: Add metadata support
                ),
            )

    def log_fail(self, tool_call: ToolCall) -> None:
        """Log a failing tool call (does NOT cache).

        Args:
            tool_call: Tool call with FAIL status
        """
        if tool_call.status != ToolStatus.FAIL:
            raise ValueError("Can only log FAIL results")

        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO fail_log
                (cache_key, tool_name, ts, exit_code, err_hash, err_excerpt)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    tool_call.cache_key,
                    tool_call.tool_name,
                    (tool_call.end_ts or datetime.now()).isoformat(),
                    tool_call.exit_code,
                    None,  # TODO: Compute error hash
                    tool_call.error_excerpt,
                ),
            )

    def lookup_pass(self, cache_key: str) -> Optional[dict]:
        """Check if a cache key has a passing result.

        Args:
            cache_key: The cache key to look up

        Returns:
            Dict with cache entry if found, None otherwise
        """
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM pass_cache WHERE cache_key = ?", (cache_key,)
            ).fetchone()

            if row:
                return dict(row)
            return None

    def get_stats(self) -> dict:
        """Get cache statistics.

        Returns:
            Dict with cache stats (pass_count, fail_count, etc.)
        """
        with self._connect() as conn:
            pass_count = conn.execute("SELECT COUNT(*) FROM pass_cache").fetchone()[0]
            fail_count = conn.execute("SELECT COUNT(*) FROM fail_log").fetchone()[0]

            return {
                "pass_cache_entries": pass_count,
                "fail_log_entries": fail_count,
            }
