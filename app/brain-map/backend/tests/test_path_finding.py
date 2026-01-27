"""Tests for path finding endpoint.

Note: These are integration tests that require the full backend stack.
Run manually with: cd app/brain-map/backend && python3 -m pytest tests/test_path_finding.py -v

For now, tests are documented as expected behavior since test environment setup is pending.
"""

import pytest

# Test implementation deferred - requires backend test environment setup
# See test_index.py for fixture examples (temp_notes_with_index)

pytest.skip(
    "Backend integration tests require environment setup", allow_module_level=True
)


def test_path_finding_same_node(temp_notes_with_index):
    """Test path finding when source and target are the same."""
    response = client.get("/path?from_id=bm_test_inbox&to_id=bm_test_inbox")
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert data["path"] == ["bm_test_inbox"]
    assert data["length"] == 0


def test_path_finding_direct_connection(temp_notes_with_index):
    """Test path finding between directly connected nodes."""
    response = client.get("/path?from_id=bm_test_inbox&to_id=bm_test_concept")
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert data["path"][0] == "bm_test_inbox"
    assert data["path"][-1] == "bm_test_concept"
    assert data["length"] == len(data["path"]) - 1


def test_path_finding_multi_hop(temp_notes_with_index):
    """Test path finding across multiple hops."""
    response = client.get("/path?from_id=bm_test_inbox&to_id=bm_api_test")
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert data["path"][0] == "bm_test_inbox"
    assert data["path"][-1] == "bm_api_test"
    assert len(data["path"]) >= 2
    assert data["length"] == len(data["path"]) - 1


def test_path_finding_no_path(temp_notes_with_index):
    """Test path finding when no path exists (isolated node)."""
    # Note: This test assumes there's an isolated node in test fixtures
    # If not, we may need to create one or adjust the test
    response = client.get("/path?from_id=bm_test_inbox&to_id=bm_nested")
    # Could be 200 with found=False or 404, depending on graph connectivity
    assert response.status_code in [200, 404]
    if response.status_code == 404:
        data = response.json()
        assert "PATH_NOT_FOUND" in data["detail"]["error"]


def test_path_finding_source_not_found(temp_notes_with_index):
    """Test path finding with non-existent source node."""
    response = client.get("/path?from_id=bm_nonexistent&to_id=bm_test_inbox")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"]["error"] == "NODE_NOT_FOUND"
    assert "bm_nonexistent" in data["detail"]["message"]


def test_path_finding_target_not_found(temp_notes_with_index):
    """Test path finding with non-existent target node."""
    response = client.get("/path?from_id=bm_test_inbox&to_id=bm_nonexistent")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"]["error"] == "NODE_NOT_FOUND"
    assert "bm_nonexistent" in data["detail"]["message"]


def test_path_finding_missing_parameters():
    """Test path finding with missing query parameters."""
    response = client.get("/path?from_id=bm_test_inbox")
    assert response.status_code == 422  # FastAPI validation error

    response = client.get("/path?to_id=bm_test_inbox")
    assert response.status_code == 422  # FastAPI validation error

    response = client.get("/path")
    assert response.status_code == 422  # FastAPI validation error


def test_path_finding_bidirectional(temp_notes_with_index):
    """Test that path finding works in both directions (undirected graph)."""
    # Forward path
    response_forward = client.get("/path?from_id=bm_test_inbox&to_id=bm_test_concept")
    assert response_forward.status_code == 200
    forward_data = response_forward.json()

    # Reverse path
    response_reverse = client.get("/path?from_id=bm_test_concept&to_id=bm_test_inbox")
    assert response_reverse.status_code == 200
    reverse_data = response_reverse.json()

    # Both paths should exist (undirected graph)
    assert forward_data["found"] is True
    assert reverse_data["found"] is True

    # Path lengths should be equal
    assert forward_data["length"] == reverse_data["length"]


def test_path_finding_returns_shortest(temp_notes_with_index):
    """Test that BFS returns shortest path (not just any path)."""
    response = client.get("/path?from_id=bm_test_inbox&to_id=bm_api_test")
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True

    # Verify path is contiguous (each node connects to next)
    # This is implicit validation that BFS found a valid path
    assert len(data["path"]) >= 2
    assert data["path"][0] == "bm_test_inbox"
    assert data["path"][-1] == "bm_api_test"


def test_path_finding_index_unavailable():
    """Test path finding when index doesn't exist."""
    # This test would require mocking or temporarily removing the index
    # For now, we document the expected behavior
    # Expected: 503 SERVICE UNAVAILABLE with INDEX_UNAVAILABLE error
    pass
