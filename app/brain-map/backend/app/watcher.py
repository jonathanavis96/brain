"""File system watcher for automatic index rebuilding.

This module implements a file watcher that monitors markdown files in the notes
directory and triggers incremental index rebuilds when files change.

Uses watchfiles for efficient file system monitoring with debouncing to batch
rapid changes.
"""

import asyncio
import logging
from pathlib import Path
from typing import Callable, Set
from watchfiles import awatch, Change

from app.notes import get_notes_root
from app.index import rebuild_index, IndexRebuildError

logger = logging.getLogger(__name__)


class FileWatcher:
    """File system watcher for markdown notes with debounce logic."""

    def __init__(
        self,
        debounce_seconds: float = 2.0,
        on_rebuild: Callable[[], None] | None = None,
    ):
        """Initialize file watcher.

        Args:
            debounce_seconds: Wait time after last change before rebuilding (default 2.0).
            on_rebuild: Optional callback to invoke after successful rebuild.
        """
        self.debounce_seconds = debounce_seconds
        self.on_rebuild = on_rebuild
        self._watch_task: asyncio.Task | None = None
        self._stop_event = asyncio.Event()

    async def start(self) -> None:
        """Start watching the notes directory for changes."""
        if self._watch_task is not None:
            logger.warning("File watcher already running")
            return

        notes_root = get_notes_root()
        logger.info(f"Starting file watcher on {notes_root}")

        self._stop_event.clear()
        self._watch_task = asyncio.create_task(self._watch_loop(notes_root))

    async def stop(self) -> None:
        """Stop the file watcher gracefully."""
        if self._watch_task is None:
            return

        logger.info("Stopping file watcher")
        self._stop_event.set()

        try:
            await asyncio.wait_for(self._watch_task, timeout=5.0)
        except asyncio.TimeoutError:
            logger.warning("File watcher did not stop gracefully, cancelling")
            self._watch_task.cancel()
            try:
                await self._watch_task
            except asyncio.CancelledError:
                pass

        self._watch_task = None

    async def _watch_loop(self, watch_path: Path) -> None:
        """Main watch loop that monitors file changes.

        Args:
            watch_path: Root directory to watch for changes.
        """
        pending_changes: Set[tuple[Change, str]] = set()
        debounce_timer: asyncio.Task | None = None

        try:
            # Watch for .md file changes only
            async for changes in awatch(
                watch_path,
                stop_event=self._stop_event,
                watch_filter=lambda change, path: path.endswith(".md"),
            ):
                # Accumulate changes
                pending_changes.update(changes)

                # Cancel existing timer if any
                if debounce_timer and not debounce_timer.done():
                    debounce_timer.cancel()
                    try:
                        await debounce_timer
                    except asyncio.CancelledError:
                        pass

                # Start new debounce timer
                debounce_timer = asyncio.create_task(
                    self._debounce_and_rebuild(pending_changes)
                )
                pending_changes = set()  # Reset for next batch

        except asyncio.CancelledError:
            logger.info("Watch loop cancelled")
            raise
        except Exception as e:
            logger.error(f"Watch loop error: {e}", exc_info=True)

    async def _debounce_and_rebuild(self, changes: Set[tuple[Change, str]]) -> None:
        """Wait for debounce period, then rebuild index.

        Args:
            changes: Set of file changes that triggered rebuild.
        """
        try:
            await asyncio.sleep(self.debounce_seconds)

            # Log what triggered the rebuild
            change_summary = self._summarize_changes(changes)
            logger.info(f"Rebuilding index after changes: {change_summary}")

            # Run rebuild in executor to avoid blocking event loop
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._rebuild_with_logging)

            if self.on_rebuild:
                self.on_rebuild()

        except asyncio.CancelledError:
            logger.debug("Rebuild cancelled (newer changes detected)")
            raise

    def _rebuild_with_logging(self) -> None:
        """Execute rebuild with error handling and logging."""
        try:
            diagnostics = rebuild_index()
            logger.info(
                f"Index rebuilt: {diagnostics.notes_indexed} notes indexed, "
                f"{diagnostics.notes_skipped} skipped"
            )

            if diagnostics.errors:
                logger.warning(
                    f"Rebuild completed with {len(diagnostics.errors)} errors"
                )
                for error in diagnostics.errors[:5]:  # Log first 5 errors
                    logger.warning(f"  {error['filepath']}: {error['message']}")

        except IndexRebuildError as e:
            logger.error(f"Index rebuild failed: {e}")
        except Exception as e:
            logger.error(f"Unexpected error during rebuild: {e}", exc_info=True)

    def _summarize_changes(self, changes: Set[tuple[Change, str]]) -> str:
        """Create human-readable summary of file changes.

        Args:
            changes: Set of (Change, path) tuples.

        Returns:
            Summary string like "2 modified, 1 added".
        """
        counts = {Change.added: 0, Change.modified: 0, Change.deleted: 0}

        for change_type, path in changes:
            if change_type in counts:
                counts[change_type] += 1

        parts = []
        if counts[Change.added]:
            parts.append(f"{counts[Change.added]} added")
        if counts[Change.modified]:
            parts.append(f"{counts[Change.modified]} modified")
        if counts[Change.deleted]:
            parts.append(f"{counts[Change.deleted]} deleted")

        return ", ".join(parts) if parts else "no changes"
