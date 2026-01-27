"""Tests for orphan node detection functionality."""

import pytest
import sqlite3
from pathlib import Path
import tempfile
import shutil

from app.index import (
    get_orphan_nodes,
    get_index_path,
    rebuild_index,
)
from app.notes import get_notes_root


@pytest.fixture
def temp_notes_dir():
    """Create a temporary notes directory."""
    temp_dir = Path(tempfile.mkdtemp())
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def temp_db(temp_notes_dir, monkeypatch):
    """Create a temporary test database."""
    # Patch get_notes_root to return our temp directory
    monkeypatch.setattr("app.notes.get_notes_root", lambda: temp_notes_dir)
    monkeypatch.setattr("app.index.get_notes_root", lambda: temp_notes_dir)

    # Create .local directory for index
    local_dir = temp_notes_dir.parent / ".local"
    local_dir.mkdir(exist_ok=True)

    db_path = local_dir / "index.db"
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row

    # Create schema
    from app.index import _create_schema

    _create_schema(conn)

    yield conn

    conn.close()
    db_path.unlink(missing_ok=True)


def test_get_orphan_nodes_empty_graph(temp_db):
    """Test orphan detection on empty graph."""
    orphans = get_orphan_nodes()
    assert orphans == []


def test_get_orphan_nodes_single_isolated_node(temp_db):
    """Test orphan detection with single node and no edges."""
    cursor = temp_db.cursor()

    # Insert single node with no edges
    cursor.execute(
        """
        INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "node1",
            "Concept",
            "Isolated Node",
            "isolated.md",
            "2024-01-01T00:00:00Z",
            "2024-01-01T00:00:00Z",
            '["tag1"]',
            "active",
            "{}",
        ),
    )
    temp_db.commit()

    orphans = get_orphan_nodes()
    assert len(orphans) == 1
    assert orphans[0]["id"] == "node1"
    assert orphans[0]["title"] == "Isolated Node"
    assert orphans[0]["type"] == "Concept"
    assert orphans[0]["status"] == "active"
    assert orphans[0]["tags"] == ["tag1"]


def test_get_orphan_nodes_connected_nodes(temp_db):
    """Test orphan detection with connected nodes (no orphans)."""
    cursor = temp_db.cursor()

    # Insert two connected nodes
    cursor.execute(
        """
        INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "node1",
            "Concept",
            "Node A",
            "a.md",
            "2024-01-01T00:00:00Z",
            "2024-01-01T00:00:00Z",
            "[]",
            "active",
            "{}",
        ),
    )
    cursor.execute(
        """
        INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "node2",
            "Concept",
            "Node B",
            "b.md",
            "2024-01-01T00:00:00Z",
            "2024-01-01T00:00:00Z",
            "[]",
            "active",
            "{}",
        ),
    )

    # Add edge connecting them
    cursor.execute(
        """
        INSERT INTO edges (source_id, target_id, relationship_type)
        VALUES (?, ?, ?)
    """,
        ("node1", "node2", "related_to"),
    )
    temp_db.commit()

    orphans = get_orphan_nodes()
    assert orphans == []


def test_get_orphan_nodes_mixed_graph(temp_db):
    """Test orphan detection with mix of connected and isolated nodes."""
    cursor = temp_db.cursor()

    # Insert connected nodes
    cursor.execute(
        """
        INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "node1",
            "Concept",
            "Connected A",
            "a.md",
            "2024-01-01T00:00:00Z",
            "2024-01-01T00:00:00Z",
            "[]",
            "active",
            "{}",
        ),
    )
    cursor.execute(
        """
        INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "node2",
            "Concept",
            "Connected B",
            "b.md",
            "2024-01-01T00:00:00Z",
            "2024-01-01T00:00:00Z",
            "[]",
            "active",
            "{}",
        ),
    )

    # Insert orphan nodes
    cursor.execute(
        """
        INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "orphan1",
            "Inbox",
            "Orphan X",
            "x.md",
            "2024-01-01T00:00:00Z",
            "2024-01-01T00:00:00Z",
            "[]",
            "idea",
            "{}",
        ),
    )
    cursor.execute(
        """
        INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "orphan2",
            "Artifact",
            "Orphan Y",
            "y.md",
            "2024-01-01T00:00:00Z",
            "2024-01-01T00:00:00Z",
            "[]",
            "done",
            "{}",
        ),
    )

    # Add edge connecting node1 and node2
    cursor.execute(
        """
        INSERT INTO edges (source_id, target_id, relationship_type)
        VALUES (?, ?, ?)
    """,
        ("node1", "node2", "depends_on"),
    )
    temp_db.commit()

    orphans = get_orphan_nodes()
    assert len(orphans) == 2

    # Check deterministic ordering (by type, title, id)
    # Artifact comes before Inbox alphabetically
    assert orphans[0]["id"] == "orphan2"
    assert orphans[0]["title"] == "Orphan Y"
    assert orphans[1]["id"] == "orphan1"
    assert orphans[1]["title"] == "Orphan X"


def test_get_orphan_nodes_node_with_incoming_edge_only(temp_db):
    """Test that node with only incoming edges is NOT an orphan."""
    cursor = temp_db.cursor()

    cursor.execute(
        """
        INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "node1",
            "Concept",
            "Source",
            "source.md",
            "2024-01-01T00:00:00Z",
            "2024-01-01T00:00:00Z",
            "[]",
            "active",
            "{}",
        ),
    )
    cursor.execute(
        """
        INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "node2",
            "Concept",
            "Target",
            "target.md",
            "2024-01-01T00:00:00Z",
            "2024-01-01T00:00:00Z",
            "[]",
            "active",
            "{}",
        ),
    )

    # node2 has incoming edge from node1
    cursor.execute(
        """
        INSERT INTO edges (source_id, target_id, relationship_type)
        VALUES (?, ?, ?)
    """,
        ("node1", "node2", "related_to"),
    )
    temp_db.commit()

    orphans = get_orphan_nodes()
    assert orphans == []


def test_get_orphan_nodes_node_with_outgoing_edge_only(temp_db):
    """Test that node with only outgoing edges is NOT an orphan."""
    cursor = temp_db.cursor()

    cursor.execute(
        """
        INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "node1",
            "Concept",
            "Source",
            "source.md",
            "2024-01-01T00:00:00Z",
            "2024-01-01T00:00:00Z",
            "[]",
            "active",
            "{}",
        ),
    )
    cursor.execute(
        """
        INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "node2",
            "Concept",
            "Target",
            "target.md",
            "2024-01-01T00:00:00Z",
            "2024-01-01T00:00:00Z",
            "[]",
            "active",
            "{}",
        ),
    )

    # node1 has outgoing edge to node2
    cursor.execute(
        """
        INSERT INTO edges (source_id, target_id, relationship_type)
        VALUES (?, ?, ?)
    """,
        ("node1", "node2", "related_to"),
    )
    temp_db.commit()

    orphans = get_orphan_nodes()
    assert orphans == []


def test_get_orphan_nodes_ordering(temp_db):
    """Test deterministic ordering of orphan results."""
    cursor = temp_db.cursor()

    # Insert orphans with different types and titles
    orphan_data = [
        ("orphan1", "System", "Alpha System", "alpha.md"),
        ("orphan2", "Concept", "Beta Concept", "beta.md"),
        ("orphan3", "Concept", "Alpha Concept", "alpha_concept.md"),
        ("orphan4", "Inbox", "Zulu Inbox", "zulu.md"),
    ]

    for node_id, node_type, title, filepath in orphan_data:
        cursor.execute(
            """
            INSERT INTO nodes (id, type, title, filepath, created_at, modified_at, tags, status, frontmatter_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                node_id,
                node_type,
                title,
                filepath,
                "2024-01-01T00:00:00Z",
                "2024-01-01T00:00:00Z",
                "[]",
                "active",
                "{}",
            ),
        )
    temp_db.commit()

    orphans = get_orphan_nodes()
    assert len(orphans) == 4

    # Expected order: type ASC, LOWER(title) ASC, id ASC
    # Concept (2 items, ordered by title: "Alpha Concept", "Beta Concept")
    # Inbox (1 item)
    # System (1 item)
    assert orphans[0]["id"] == "orphan3"  # Concept - Alpha Concept
    assert orphans[1]["id"] == "orphan2"  # Concept - Beta Concept
    assert orphans[2]["id"] == "orphan4"  # Inbox - Zulu Inbox
    assert orphans[3]["id"] == "orphan1"  # System - Alpha System
