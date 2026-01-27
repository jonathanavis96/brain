"""Tests for task heat metric computation."""

import sqlite3
from datetime import datetime, timedelta, timezone

from app.index import _compute_task_heat


def test_task_heat_empty_graph():
    """Test task heat with no nodes."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE edges (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE nodes (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            status TEXT,
            modified_at TEXT
        )
    """)

    result = _compute_task_heat(conn, set())
    assert result == {}


def test_task_heat_single_isolated_node():
    """Test task heat with single node, no TaskContracts nearby."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE edges (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE nodes (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            status TEXT,
            modified_at TEXT
        )
    """)

    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("concept1", "Concept", None),
    )

    result = _compute_task_heat(conn, {"concept1"})
    assert result == {"concept1": 0.0}


def test_task_heat_direct_neighbor_task():
    """Test task heat with direct neighbor TaskContract (depth 1)."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE edges (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE nodes (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            status TEXT,
            modified_at TEXT
        )
    """)

    # Create a concept and a direct TaskContract neighbor
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("concept1", "Concept", None),
    )
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("task1", "TaskContract", "active"),
    )

    # Edge: concept1 implements task1
    cursor.execute(
        "INSERT INTO edges (source_id, target_id, relationship_type) VALUES (?, ?, ?)",
        ("concept1", "task1", "implements"),
    )

    result = _compute_task_heat(conn, {"concept1"})
    # Should find 1 open task (active) at depth 1
    # open_normalized = 1/1 = 1.0
    # task_heat = 0.5 * 1.0 + 0.3 * 0.0 + 0.2 * 0.0 = 0.5
    assert "concept1" in result
    assert result["concept1"] == 0.5


def test_task_heat_depth_2_traversal():
    """Test task heat with TaskContract at depth 2."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE edges (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE nodes (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            status TEXT,
            modified_at TEXT
        )
    """)

    # Create chain: concept1 -> feature1 -> task1
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("concept1", "Concept", None),
    )
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("feature1", "Feature", None),
    )
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("task1", "TaskContract", "planned"),
    )

    # Edges: concept1 -> feature1 -> task1
    cursor.execute(
        "INSERT INTO edges (source_id, target_id, relationship_type) VALUES (?, ?, ?)",
        ("concept1", "feature1", "depends_on"),
    )
    cursor.execute(
        "INSERT INTO edges (source_id, target_id, relationship_type) VALUES (?, ?, ?)",
        ("feature1", "task1", "implements"),
    )

    result = _compute_task_heat(conn, {"concept1"}, depth=2)
    # Should find 1 open task (planned) at depth 2
    # open_normalized = 1/1 = 1.0
    # task_heat = 0.5 * 1.0 + 0.3 * 0.0 + 0.2 * 0.0 = 0.5
    assert "concept1" in result
    assert result["concept1"] == 0.5


def test_task_heat_multiple_status_types():
    """Test task heat with multiple TaskContract statuses."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE edges (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE nodes (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            status TEXT,
            modified_at TEXT
        )
    """)

    # Create a concept with 3 TaskContract neighbors
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("concept1", "Concept", None),
    )
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("task1", "TaskContract", "active"),
    )
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("task2", "TaskContract", "blocked"),
    )
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("task3", "TaskContract", "completed"),
    )

    # Edges: concept1 -> tasks
    cursor.execute(
        "INSERT INTO edges (source_id, target_id, relationship_type) VALUES (?, ?, ?)",
        ("concept1", "task1", "implements"),
    )
    cursor.execute(
        "INSERT INTO edges (source_id, target_id, relationship_type) VALUES (?, ?, ?)",
        ("concept1", "task2", "blocks"),
    )
    cursor.execute(
        "INSERT INTO edges (source_id, target_id, relationship_type) VALUES (?, ?, ?)",
        ("concept1", "task3", "depends_on"),
    )

    result = _compute_task_heat(conn, {"concept1"})
    # Should find:
    # - 2 open tasks (active, blocked)
    # - 1 blocked task
    # - 0 recent tasks (no modified_at)
    # Total associated tasks: 3 (including completed)
    # open_normalized = 2/3 = 0.667
    # blocked_normalized = 1/3 = 0.333
    # recent_normalized = 0/3 = 0.0
    # task_heat = 0.5 * 0.667 + 0.3 * 0.333 + 0.2 * 0.0 = 0.333 + 0.1 = 0.433
    assert "concept1" in result
    assert abs(result["concept1"] - 0.433) < 0.01


def test_task_heat_recent_updates():
    """Test task heat with recent task updates."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE edges (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE nodes (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            status TEXT,
            modified_at TEXT
        )
    """)

    # Create tasks with different ages
    now = datetime.now(timezone.utc)
    recent_date = now - timedelta(days=3)  # Within 7 days
    old_date = now - timedelta(days=30)  # Outside 7 days

    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("concept1", "Concept", None),
    )
    cursor.execute(
        "INSERT INTO nodes (id, type, status, modified_at) VALUES (?, ?, ?, ?)",
        ("task1", "TaskContract", "active", recent_date.isoformat()),
    )
    cursor.execute(
        "INSERT INTO nodes (id, type, status, modified_at) VALUES (?, ?, ?, ?)",
        ("task2", "TaskContract", "planned", old_date.isoformat()),
    )

    # Edges
    cursor.execute(
        "INSERT INTO edges (source_id, target_id, relationship_type) VALUES (?, ?, ?)",
        ("concept1", "task1", "implements"),
    )
    cursor.execute(
        "INSERT INTO edges (source_id, target_id, relationship_type) VALUES (?, ?, ?)",
        ("concept1", "task2", "depends_on"),
    )

    result = _compute_task_heat(conn, {"concept1"})
    # Should find:
    # - 2 open tasks (both active/planned)
    # - 0 blocked tasks
    # - 1 recent task (task1 updated 3 days ago)
    # Total: 2 tasks
    # open_normalized = 2/2 = 1.0
    # blocked_normalized = 0/2 = 0.0
    # recent_normalized = 1/2 = 0.5
    # task_heat = 0.5 * 1.0 + 0.3 * 0.0 + 0.2 * 0.5 = 0.5 + 0.1 = 0.6
    assert "concept1" in result
    assert abs(result["concept1"] - 0.6) < 0.01


def test_task_heat_respects_relationship_types():
    """Test that task heat only follows implements/depends_on/blocks relationships."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE edges (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE nodes (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            status TEXT,
            modified_at TEXT
        )
    """)

    # Create concept with tasks connected via different relationship types
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("concept1", "Concept", None),
    )
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("task1", "TaskContract", "active"),
    )
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("task2", "TaskContract", "active"),
    )

    # Valid relationship (should be included)
    cursor.execute(
        "INSERT INTO edges (source_id, target_id, relationship_type) VALUES (?, ?, ?)",
        ("concept1", "task1", "implements"),
    )

    # Invalid relationship type (should be excluded)
    cursor.execute(
        "INSERT INTO edges (source_id, target_id, relationship_type) VALUES (?, ?, ?)",
        ("concept1", "task2", "related_to"),
    )

    result = _compute_task_heat(conn, {"concept1"})
    # Should only find task1 (via implements)
    # open_normalized = 1/1 = 1.0
    # task_heat = 0.5 * 1.0 = 0.5
    assert "concept1" in result
    assert result["concept1"] == 0.5


def test_task_heat_bidirectional_neighborhood():
    """Test that neighborhood traversal is bidirectional (undirected graph)."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE edges (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE nodes (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            status TEXT,
            modified_at TEXT
        )
    """)

    # Create: task1 -> concept1 (reverse direction from usual)
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("concept1", "Concept", None),
    )
    cursor.execute(
        "INSERT INTO nodes (id, type, status) VALUES (?, ?, ?)",
        ("task1", "TaskContract", "active"),
    )

    # Edge goes FROM task TO concept (should still find task as neighbor)
    cursor.execute(
        "INSERT INTO edges (source_id, target_id, relationship_type) VALUES (?, ?, ?)",
        ("task1", "concept1", "implements"),
    )

    result = _compute_task_heat(conn, {"concept1"})
    # Should find task1 even though edge points TO concept1 (bidirectional)
    assert "concept1" in result
    assert result["concept1"] == 0.5
