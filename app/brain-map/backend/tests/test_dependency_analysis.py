"""Tests for dependency analysis module."""

import sqlite3
import tempfile
from pathlib import Path

import pytest

from app.dependency_analysis import (
    detect_cycles,
    get_dependency_diagnostics,
)


@pytest.fixture
def temp_db():
    """Create a temporary test database."""
    fd, path = tempfile.mkstemp(suffix=".db")
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row

    # Create schema
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE nodes (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            status TEXT,
            tags TEXT,
            created_at TEXT,
            modified_at TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE edges (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            PRIMARY KEY (source_id, target_id, relationship_type)
        )
    """)
    conn.commit()

    yield conn

    conn.close()
    Path(path).unlink(missing_ok=True)


def test_detect_cycles_no_cycles(temp_db):
    """Test cycle detection with acyclic graph."""
    cursor = temp_db.cursor()

    # Create simple acyclic graph: A -> B -> C
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_a", "task_b", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_b", "task_c", "depends_on")
    )
    temp_db.commit()

    result = detect_cycles(temp_db)

    assert not result.has_cycles
    assert len(result.cycles) == 0
    assert len(result.self_loops) == 0


def test_detect_cycles_self_loop(temp_db):
    """Test detection of self-referencing edge."""
    cursor = temp_db.cursor()

    # Create self-loop: A -> A
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_a", "task_a", "depends_on")
    )
    temp_db.commit()

    result = detect_cycles(temp_db)

    assert result.has_cycles
    assert len(result.self_loops) == 1
    assert "task_a" in result.self_loops


def test_detect_cycles_simple_cycle(temp_db):
    """Test detection of simple two-node cycle."""
    cursor = temp_db.cursor()

    # Create cycle: A -> B -> A
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_a", "task_b", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_b", "task_a", "depends_on")
    )
    temp_db.commit()

    result = detect_cycles(temp_db)

    assert result.has_cycles
    assert len(result.cycles) == 1

    # Cycle should contain both nodes
    cycle = result.cycles[0]
    assert "task_a" in cycle
    assert "task_b" in cycle
    # Cycle should start and end with same node
    assert cycle[0] == cycle[-1]


def test_detect_cycles_complex_cycle(temp_db):
    """Test detection of longer cycle."""
    cursor = temp_db.cursor()

    # Create cycle: A -> B -> C -> D -> B
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_a", "task_b", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_b", "task_c", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_c", "task_d", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_d", "task_b", "depends_on")
    )
    temp_db.commit()

    result = detect_cycles(temp_db)

    assert result.has_cycles
    assert len(result.cycles) == 1

    # Cycle should contain B, C, D (but not necessarily A)
    cycle = result.cycles[0]
    assert "task_b" in cycle
    assert "task_c" in cycle
    assert "task_d" in cycle


def test_detect_cycles_multiple_cycles(temp_db):
    """Test detection of multiple independent cycles."""
    cursor = temp_db.cursor()

    # Cycle 1: A -> B -> A
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_a", "task_b", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_b", "task_a", "depends_on")
    )

    # Cycle 2: C -> D -> C
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_c", "task_d", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_d", "task_c", "depends_on")
    )

    temp_db.commit()

    result = detect_cycles(temp_db)

    assert result.has_cycles
    assert len(result.cycles) == 2


def test_detect_cycles_relationship_type_filter(temp_db):
    """Test cycle detection respects relationship type filter."""
    cursor = temp_db.cursor()

    # Cycle with depends_on
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_a", "task_b", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_b", "task_a", "depends_on")
    )

    # Cycle with different relationship type
    cursor.execute("INSERT INTO edges VALUES (?, ?, ?)", ("task_c", "task_d", "blocks"))
    cursor.execute("INSERT INTO edges VALUES (?, ?, ?)", ("task_d", "task_c", "blocks"))

    temp_db.commit()

    # Test with depends_on only
    result = detect_cycles(temp_db, ["depends_on"])
    assert result.has_cycles
    assert len(result.cycles) == 1

    # Test with blocks only
    result = detect_cycles(temp_db, ["blocks"])
    assert result.has_cycles
    assert len(result.cycles) == 1

    # Test with both
    result = detect_cycles(temp_db, ["depends_on", "blocks"])
    assert result.has_cycles
    assert len(result.cycles) == 2


def test_get_dependency_diagnostics_empty_graph(temp_db):
    """Test diagnostics with empty graph."""
    diagnostics = get_dependency_diagnostics(temp_db)

    assert not diagnostics["cycles"]["has_cycles"]
    assert len(diagnostics["cycles"]["cycles"]) == 0
    assert len(diagnostics["dependency_counts"]["incoming"]) == 0
    assert len(diagnostics["dependency_counts"]["outgoing"]) == 0
    assert len(diagnostics["critical_path_hints"]) == 0


def test_get_dependency_diagnostics_with_dependencies(temp_db):
    """Test diagnostics with complex dependency graph."""
    cursor = temp_db.cursor()

    # Create graph:
    # A depends_on B, C, D (A has 3 incoming)
    # B depends_on E (B has 1 incoming, 1 outgoing)
    # E blocks nothing (E has 0 incoming, 1 outgoing)
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_a", "task_b", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_a", "task_c", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_a", "task_d", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_b", "task_e", "depends_on")
    )
    temp_db.commit()

    diagnostics = get_dependency_diagnostics(temp_db)

    # Check dependency counts
    incoming = diagnostics["dependency_counts"]["incoming"]
    outgoing = diagnostics["dependency_counts"]["outgoing"]

    assert incoming.get("task_b") == 1
    assert incoming.get("task_c") == 1
    assert incoming.get("task_d") == 1
    assert incoming.get("task_e") == 1

    assert outgoing.get("task_a") == 3
    assert outgoing.get("task_b") == 1

    # Check critical path hints (task_a has 3 total deps)
    critical = diagnostics["critical_path_hints"]
    assert len(critical) >= 1

    # task_a should be in critical hints
    task_a_hint = next((h for h in critical if h["node_id"] == "task_a"), None)
    assert task_a_hint is not None
    assert task_a_hint["outgoing_dependencies"] == 3
    assert task_a_hint["total_dependencies"] == 3


def test_get_dependency_diagnostics_with_cycles(temp_db):
    """Test diagnostics includes cycle detection."""
    cursor = temp_db.cursor()

    # Create cycle: A -> B -> A
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_a", "task_b", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_b", "task_a", "depends_on")
    )
    temp_db.commit()

    diagnostics = get_dependency_diagnostics(temp_db)

    assert diagnostics["cycles"]["has_cycles"]
    assert diagnostics["cycles"]["cycle_count"] == 1


def test_cycle_detection_result_to_dict(temp_db):
    """Test CycleDetectionResult serialization."""
    cursor = temp_db.cursor()

    # Create self-loop and regular cycle
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_x", "task_x", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_a", "task_b", "depends_on")
    )
    cursor.execute(
        "INSERT INTO edges VALUES (?, ?, ?)", ("task_b", "task_a", "depends_on")
    )
    temp_db.commit()

    result = detect_cycles(temp_db)
    result_dict = result.to_dict()

    assert result_dict["has_cycles"]
    assert result_dict["cycle_count"] == 1
    assert result_dict["self_loop_count"] == 1
    assert isinstance(result_dict["cycles"], list)
    assert isinstance(result_dict["self_loops"], list)
