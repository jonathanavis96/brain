"""Tests for search endpoint and search_nodes function."""

import json
import sqlite3
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.index import search_nodes, _create_schema
from app.main import app


@pytest.fixture
def test_index_db(monkeypatch):
    """Create a temporary test index database with sample data."""
    # Create temp database
    temp_db_fd, temp_db_path = tempfile.mkstemp(suffix=".db")
    temp_path = Path(temp_db_path)

    # Monkeypatch get_index_path to return temp path
    monkeypatch.setattr("app.index.get_index_path", lambda: temp_path)

    # Create schema
    conn = sqlite3.connect(str(temp_path))
    _create_schema(conn)

    # Insert sample nodes
    cursor = conn.cursor()
    sample_nodes = [
        {
            "id": "bm_001",
            "type": "concept",
            "title": "Brain Map Architecture",
            "filepath": "notes/brain_map.md",
            "created_at": "2026-01-20T10:00:00Z",
            "modified_at": "2026-01-25T10:00:00Z",
            "tags": json.dumps(["architecture", "design"]),
            "status": "active",
            "priority": "high",
            "context": None,
            "acceptance_criteria": None,
            "frontmatter_json": "{}",
            "content": "This document describes the brain map architecture and design patterns.",
        },
        {
            "id": "bm_002",
            "type": "task",
            "title": "Implement Search Endpoint",
            "filepath": "notes/tasks/search.md",
            "created_at": "2026-01-21T10:00:00Z",
            "modified_at": "2026-01-26T10:00:00Z",
            "tags": json.dumps(["backend", "search"]),
            "status": "in_progress",
            "priority": "high",
            "context": None,
            "acceptance_criteria": None,
            "frontmatter_json": "{}",
            "content": "Build fast search using FTS5 for the brain map backend.",
        },
        {
            "id": "bm_003",
            "type": "concept",
            "title": "Graph Visualization",
            "filepath": "notes/graph_viz.md",
            "created_at": "2026-01-22T10:00:00Z",
            "modified_at": "2026-01-23T10:00:00Z",
            "tags": json.dumps(["frontend", "visualization"]),
            "status": "active",
            "priority": "medium",
            "context": None,
            "acceptance_criteria": None,
            "frontmatter_json": "{}",
            "content": "Graph visualization using sigma.js for the frontend.",
        },
    ]

    for node in sample_nodes:
        cursor.execute(
            """
            INSERT INTO nodes (
                id, type, title, filepath, created_at, modified_at,
                tags, status, priority, context, acceptance_criteria,
                frontmatter_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                node["id"],
                node["type"],
                node["title"],
                node["filepath"],
                node["created_at"],
                node["modified_at"],
                node["tags"],
                node["status"],
                node["priority"],
                node["context"],
                node["acceptance_criteria"],
                node["frontmatter_json"],
            ),
        )

        cursor.execute(
            """
            INSERT INTO nodes_fts (id, title, tags, content)
            VALUES (?, ?, ?, ?)
        """,
            (
                node["id"],
                node["title"],
                " ".join(json.loads(node["tags"])),
                node["content"],
            ),
        )

    conn.commit()
    conn.close()

    yield temp_path

    # Cleanup
    temp_path.unlink(missing_ok=True)


def test_search_nodes_basic(test_index_db):
    """Test basic search functionality."""
    results, total = search_nodes("brain")

    assert total == 2
    assert len(results) == 2
    assert results[0]["id"] in ["bm_001", "bm_002"]


def test_search_nodes_with_type_filter(test_index_db):
    """Test search with type filter."""
    results, total = search_nodes("brain", type_filter=["concept"])

    assert total == 1
    assert len(results) == 1
    assert results[0]["id"] == "bm_001"
    assert results[0]["type"] == "concept"


def test_search_nodes_with_status_filter(test_index_db):
    """Test search with status filter."""
    results, total = search_nodes("search", status_filter=["in_progress"])

    assert total == 1
    assert len(results) == 1
    assert results[0]["id"] == "bm_002"
    assert results[0]["status"] == "in_progress"


def test_search_nodes_with_tags_all_mode(test_index_db):
    """Test search with tags filter in 'all' mode."""
    results, total = search_nodes("brain", tags_filter=["architecture", "design"])

    assert total == 1
    assert len(results) == 1
    assert results[0]["id"] == "bm_001"


def test_search_nodes_with_tags_any_mode(test_index_db):
    """Test search with tags filter in 'any' mode."""
    results, total = search_nodes(
        "map", tags_filter=["backend", "frontend"], tags_mode="any"
    )

    # Should match nodes with either backend OR frontend tags
    assert total >= 1
    # Verify at least one result has one of the requested tags
    assert any(
        "backend" in result["tags"] or "frontend" in result["tags"]
        for result in results
    )


def test_search_nodes_pagination(test_index_db):
    """Test search pagination."""
    # Get first page
    results_p1, total = search_nodes("brain", limit=1, offset=0)
    assert len(results_p1) == 1
    assert total == 2

    # Get second page
    results_p2, _ = search_nodes("brain", limit=1, offset=1)
    assert len(results_p2) == 1

    # Ensure different results
    assert results_p1[0]["id"] != results_p2[0]["id"]


def test_search_nodes_stable_ordering(test_index_db):
    """Test that search results have stable ordering."""
    results_1, _ = search_nodes("brain")
    results_2, _ = search_nodes("brain")

    # Same query should return same order
    assert [r["id"] for r in results_1] == [r["id"] for r in results_2]


def test_search_nodes_updated_within_days(test_index_db):
    """Test search with updated_within_days filter."""
    # Should return nodes updated in last 5 days (bm_001 and bm_002)
    results, total = search_nodes("map", updated_within_days=5)

    assert total >= 1


def test_search_endpoint_success(test_index_db):
    """Test search endpoint returns 200 with valid query."""
    client = TestClient(app)
    response = client.get("/search?q=brain")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "page" in data
    assert data["page"]["limit"] == 50
    assert data["page"]["offset"] == 0


def test_search_endpoint_missing_query():
    """Test search endpoint returns 400 when query is missing."""
    client = TestClient(app)
    response = client.get("/search")

    assert response.status_code == 422  # FastAPI validation error


def test_search_endpoint_empty_query(test_index_db):
    """Test search endpoint returns 400 when query is empty."""
    client = TestClient(app)
    response = client.get("/search?q=")

    assert response.status_code == 400


def test_search_endpoint_with_filters(test_index_db):
    """Test search endpoint with multiple filters."""
    client = TestClient(app)
    response = client.get(
        "/search?q=brain&type=concept&status=active&limit=10&offset=0"
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) >= 1


def test_search_endpoint_invalid_tags_mode(test_index_db):
    """Test search endpoint returns 400 for invalid tags_mode."""
    client = TestClient(app)
    response = client.get("/search?q=brain&tags_mode=invalid")

    assert response.status_code == 400


def test_search_endpoint_no_index(monkeypatch, tmp_path):
    """Test search endpoint returns 503 when index doesn't exist."""
    # Monkeypatch to point to non-existent index
    monkeypatch.setattr("app.index.get_index_path", lambda: tmp_path / "nonexistent.db")

    client = TestClient(app)
    response = client.get("/search?q=test")

    assert response.status_code == 503
    data = response.json()
    assert "INDEX_UNAVAILABLE" in str(data)
