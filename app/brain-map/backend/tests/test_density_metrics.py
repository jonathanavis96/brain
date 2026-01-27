"""Tests for density metric computation."""

import sqlite3

from app.index import _compute_density_metrics, _compute_clustering_coefficient


def test_density_metrics_empty_graph():
    """Test density metrics with no nodes."""
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

    result = _compute_density_metrics(conn, set())
    assert result == {}


def test_density_metrics_single_node():
    """Test density metrics with single isolated node."""
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

    result = _compute_density_metrics(conn, {"node1"})
    assert result == {"node1": 0.0}


def test_density_metrics_two_connected_nodes():
    """Test density metrics with two connected nodes."""
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
    cursor.execute("INSERT INTO edges VALUES ('node1', 'node2', 'references')")

    result = _compute_density_metrics(conn, {"node1", "node2"})

    # Both nodes have degree 1, max_degree = 1, so degree_normalized = 1.0
    # Clustering coefficient = 0.0 (need at least 2 neighbors)
    # density = 0.7 * 1.0 + 0.3 * 0.0 = 0.7
    assert result["node1"] == 0.7
    assert result["node2"] == 0.7


def test_density_metrics_triangle():
    """Test density metrics with triangle graph (perfect clustering)."""
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
    cursor.execute("INSERT INTO edges VALUES ('a', 'b', 'references')")
    cursor.execute("INSERT INTO edges VALUES ('b', 'c', 'references')")
    cursor.execute("INSERT INTO edges VALUES ('a', 'c', 'references')")

    result = _compute_density_metrics(conn, {"a", "b", "c"})

    # All nodes have degree 2, max_degree = 2, so degree_normalized = 1.0
    # Clustering coefficient = 1.0 (all neighbors are connected)
    # density = 0.7 * 1.0 + 0.3 * 1.0 = 1.0
    assert result["a"] == 1.0
    assert result["b"] == 1.0
    assert result["c"] == 1.0


def test_density_metrics_star():
    """Test density metrics with star graph (low clustering)."""
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
    # Center node connected to 3 periphery nodes
    cursor.execute("INSERT INTO edges VALUES ('center', 'a', 'references')")
    cursor.execute("INSERT INTO edges VALUES ('center', 'b', 'references')")
    cursor.execute("INSERT INTO edges VALUES ('center', 'c', 'references')")

    result = _compute_density_metrics(conn, {"center", "a", "b", "c"})

    # Center: degree 3, degree_normalized = 1.0, clustering = 0.0
    # Periphery: degree 1, degree_normalized = 1/3, clustering = 0.0
    assert result["center"] == 0.7  # 0.7 * 1.0 + 0.3 * 0.0
    assert abs(result["a"] - 0.7 / 3) < 0.001
    assert abs(result["b"] - 0.7 / 3) < 0.001
    assert abs(result["c"] - 0.7 / 3) < 0.001


def test_clustering_coefficient_isolated():
    """Test clustering coefficient for isolated node."""
    coeff = _compute_clustering_coefficient("a", set(), {"a": set()})
    assert coeff == 0.0


def test_clustering_coefficient_single_neighbor():
    """Test clustering coefficient with single neighbor."""
    edges = {("a", "b")}
    neighbors = {"a": {"b"}, "b": {"a"}}
    coeff = _compute_clustering_coefficient("a", edges, neighbors)
    assert coeff == 0.0


def test_clustering_coefficient_triangle():
    """Test clustering coefficient in perfect triangle."""
    edges = {("a", "b"), ("b", "c"), ("a", "c")}
    neighbors = {"a": {"b", "c"}, "b": {"a", "c"}, "c": {"a", "b"}}
    coeff = _compute_clustering_coefficient("a", edges, neighbors)
    assert coeff == 1.0


def test_clustering_coefficient_partial():
    """Test clustering coefficient with partial connectivity."""
    # Node a has neighbors b, c, d
    # Only b-c are connected (1 out of 3 possible edges)
    edges = {("a", "b"), ("a", "c"), ("a", "d"), ("b", "c")}
    neighbors = {"a": {"b", "c", "d"}, "b": {"a", "c"}, "c": {"a", "b"}, "d": {"a"}}
    coeff = _compute_clustering_coefficient("a", edges, neighbors)
    # Possible edges: 3 * 2 / 2 = 3 (b-c, b-d, c-d)
    # Actual edges: 1 (b-c)
    assert abs(coeff - 1.0 / 3.0) < 0.001


def test_density_determinism():
    """Test that density metrics are deterministic across rebuilds."""
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
    cursor.execute("INSERT INTO edges VALUES ('a', 'b', 'references')")
    cursor.execute("INSERT INTO edges VALUES ('b', 'c', 'references')")
    cursor.execute("INSERT INTO edges VALUES ('a', 'c', 'references')")
    cursor.execute("INSERT INTO edges VALUES ('c', 'd', 'references')")

    node_ids = {"a", "b", "c", "d"}

    # Run multiple times and verify identical results
    result1 = _compute_density_metrics(conn, node_ids)
    result2 = _compute_density_metrics(conn, node_ids)
    result3 = _compute_density_metrics(conn, node_ids)

    assert result1 == result2 == result3
