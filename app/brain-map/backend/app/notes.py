"""Note discovery and loading for Brain Map backend.

This module provides deterministic markdown note discovery from the
canonical notes directory (app/brain-map/notes/).
"""

import os
from pathlib import Path
from typing import List


def get_notes_root() -> Path:
    """Return the canonical notes directory path.

    Returns:
        Path to app/brain-map/notes/ relative to repository root.
    """
    # Backend is at app/brain-map/backend/app/notes.py
    # Notes root is at app/brain-map/notes/
    backend_app_dir = Path(__file__).parent
    notes_root = backend_app_dir.parent.parent / "notes"
    return notes_root.resolve()


def discover_notes() -> List[str]:
    """Discover all markdown notes recursively from notes root.

    Returns:
        Sorted list of repo-root-relative paths to .md files.
        Order is deterministic (lexicographic sort).
    """
    notes_root = get_notes_root()

    if not notes_root.exists():
        return []

    # Find repository root (contains .git directory)
    repo_root = _find_repo_root(notes_root)

    markdown_files = []

    # Recursively walk the notes directory
    for root, _dirs, files in os.walk(notes_root):
        for file in files:
            if file.endswith(".md"):
                full_path = Path(root) / file
                # Convert to repo-relative path
                try:
                    relative_path = full_path.relative_to(repo_root)
                    markdown_files.append(str(relative_path))
                except ValueError:
                    # Path is not relative to repo_root, use absolute
                    markdown_files.append(str(full_path))

    # Sort for deterministic ordering
    markdown_files.sort()

    return markdown_files


def _find_repo_root(start_path: Path) -> Path:
    """Find the repository root by walking up until .git is found.

    Args:
        start_path: Path to start searching from.

    Returns:
        Path to repository root.

    Raises:
        RuntimeError: If no .git directory found.
    """
    current = start_path.resolve()

    while current != current.parent:
        if (current / ".git").exists():
            return current
        current = current.parent

    raise RuntimeError(f"No .git directory found above {start_path}")


def load_note_content(repo_relative_path: str) -> str:
    """Load raw content of a note file.

    Args:
        repo_relative_path: Repository-relative path to note file.

    Returns:
        Raw file content as string.

    Raises:
        FileNotFoundError: If file does not exist.
    """
    notes_root = get_notes_root()
    repo_root = _find_repo_root(notes_root)

    full_path = repo_root / repo_relative_path

    if not full_path.exists():
        raise FileNotFoundError(f"Note not found: {repo_relative_path}")

    return full_path.read_text(encoding="utf-8")
