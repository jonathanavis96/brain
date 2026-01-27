"""Tests for SQLite index builder."""

import sqlite3
import tempfile
from unittest.mock import patch

import pytest

from app.index import (
    IndexRebuildError,
    RebuildDiagnostics,
    _create_schema,
    _extract_edges,
    get_index_path,
    rebuild_index,
)


class TestIndexPath:
    """Tests for index path resolution."""

    def test_get_index_path_structure(self):
        """Index path should be at app/brain-map/.local/index.db."""
        index_path = get_index_path()
        assert index_path.name == "index.db"
        assert index_path.parent.name == ".local"
        assert "brain-map" in str(index_path)


class TestSchemaCreation:
    """Tests for SQLite schema creation."""

    def test_create_schema_creates_tables(self):
        """Schema creation should create nodes, edges, and nodes_fts tables."""
        with tempfile.NamedTemporaryFile(suffix=".db") as tmp:
            conn = sqlite3.connect(tmp.name)
            _create_schema(conn)

            cursor = conn.cursor()
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            )
            tables = [row[0] for row in cursor.fetchall()]

            assert "nodes" in tables
            assert "edges" in tables
            assert "nodes_fts" in tables

            conn.close()

    def test_create_schema_has_indexes(self):
        """Schema should include indexes for common query patterns."""
        with tempfile.NamedTemporaryFile(suffix=".db") as tmp:
            conn = sqlite3.connect(tmp.name)
            _create_schema(conn)

            cursor = conn.cursor()
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name"
            )
            indexes = [row[0] for row in cursor.fetchall()]

            assert "idx_nodes_type" in indexes
            assert "idx_nodes_status" in indexes
            assert "idx_edges_source" in indexes
            assert "idx_edges_target" in indexes

            conn.close()

    def test_create_schema_is_idempotent(self):
        """Schema creation should be idempotent (can run multiple times)."""
        with tempfile.NamedTemporaryFile(suffix=".db") as tmp:
            conn = sqlite3.connect(tmp.name)
            _create_schema(conn)
            _create_schema(conn)  # Should not fail

            cursor = conn.cursor()
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            )
            tables = [row[0] for row in cursor.fetchall()]

            assert "nodes" in tables
            conn.close()


class TestEdgeExtraction:
    """Tests for edge extraction from frontmatter."""

    def test_extract_edges_empty_relationships(self):
        """Empty relationships list should return no edges."""
        frontmatter = {"relationships": []}
        edges = _extract_edges(frontmatter, "node_1")
        assert edges == []

    def test_extract_edges_missing_relationships(self):
        """Missing relationships field should return no edges."""
        frontmatter = {}
        edges = _extract_edges(frontmatter, "node_1")
        assert edges == []

    def test_extract_edges_single_relationship(self):
        """Single relationship should extract one edge."""
        frontmatter = {"relationships": [{"target": "node_2", "type": "depends_on"}]}
        edges = _extract_edges(frontmatter, "node_1")
        assert edges == [("node_1", "node_2", "depends_on")]

    def test_extract_edges_multiple_relationships(self):
        """Multiple relationships should extract multiple edges."""
        frontmatter = {
            "relationships": [
                {"target": "node_2", "type": "depends_on"},
                {"target": "node_3", "type": "related_to"},
                {"target": "node_4", "type": "blocks"},
            ]
        }
        edges = _extract_edges(frontmatter, "node_1")
        assert len(edges) == 3
        assert ("node_1", "node_2", "depends_on") in edges
        assert ("node_1", "node_3", "related_to") in edges
        assert ("node_1", "node_4", "blocks") in edges

    def test_extract_edges_default_type(self):
        """Missing type should default to 'related_to'."""
        frontmatter = {"relationships": [{"target": "node_2"}]}
        edges = _extract_edges(frontmatter, "node_1")
        assert edges == [("node_1", "node_2", "related_to")]

    def test_extract_edges_missing_target(self):
        """Relationships without target should be skipped."""
        frontmatter = {
            "relationships": [
                {"type": "depends_on"},  # No target
                {"target": "node_2", "type": "related_to"},
            ]
        }
        edges = _extract_edges(frontmatter, "node_1")
        assert edges == [("node_1", "node_2", "related_to")]


class TestRebuildDiagnostics:
    """Tests for RebuildDiagnostics."""

    def test_diagnostics_initialization(self):
        """Diagnostics should initialize with zero counts."""
        diag = RebuildDiagnostics()
        assert diag.notes_discovered == 0
        assert diag.notes_indexed == 0
        assert diag.notes_skipped == 0
        assert diag.errors == []
        assert diag.warnings == []

    def test_diagnostics_add_error(self):
        """Should be able to add errors."""
        diag = RebuildDiagnostics()
        diag.add_error("test.md", "Test error")
        assert len(diag.errors) == 1
        assert diag.errors[0]["filepath"] == "test.md"
        assert diag.errors[0]["message"] == "Test error"

    def test_diagnostics_add_warning(self):
        """Should be able to add warnings."""
        diag = RebuildDiagnostics()
        diag.add_warning("test.md", "Test warning")
        assert len(diag.warnings) == 1
        assert diag.warnings[0]["filepath"] == "test.md"
        assert diag.warnings[0]["message"] == "Test warning"

    def test_diagnostics_to_dict(self):
        """Should convert to dictionary format."""
        diag = RebuildDiagnostics()
        diag.notes_discovered = 5
        diag.notes_indexed = 3
        diag.notes_skipped = 2
        diag.add_error("err.md", "Error")
        diag.add_warning("warn.md", "Warning")

        result = diag.to_dict()
        assert result["notes_discovered"] == 5
        assert result["notes_indexed"] == 3
        assert result["notes_skipped"] == 2
        assert len(result["errors"]) == 1
        assert len(result["warnings"]) == 1


class TestRebuildIndex:
    """Tests for index rebuild functionality."""

    def test_rebuild_index_with_valid_notes(self, tmp_path):
        """Rebuild should succeed with valid notes."""
        # Create mock notes
        notes_dir = tmp_path / "notes"
        notes_dir.mkdir()

        note_content = """---
id: test_concept_001
type: Concept
title: Test Concept
created_at: 2026-01-27T00:00:00Z
updated_at: 2026-01-27T00:00:00Z
tags:
  - test
status: active
---

# Test Concept

This is a test concept.
"""
        (notes_dir / "test.md").write_text(note_content)

        # Mock discover_notes and load_note_content
        with patch("app.index.discover_notes") as mock_discover, patch(
            "app.index.load_note_content"
        ) as mock_load, patch("app.index.get_index_path") as mock_path:
            mock_discover.return_value = ["notes/test.md"]
            mock_load.return_value = note_content
            test_db = tmp_path / "test.db"
            mock_path.return_value = test_db

            diagnostics = rebuild_index()

            assert diagnostics.notes_discovered == 1
            assert diagnostics.notes_indexed == 1
            assert diagnostics.notes_skipped == 0
            assert len(diagnostics.errors) == 0
            assert test_db.exists()

            # Verify database content
            conn = sqlite3.connect(str(test_db))
            cursor = conn.cursor()
            cursor.execute("SELECT id, type, title FROM nodes")
            row = cursor.fetchone()
            assert row[0] == "test_concept_001"
            assert row[1] == "Concept"
            assert row[2] == "Test Concept"
            conn.close()

    def test_rebuild_index_duplicate_ids_raises_error(self, tmp_path):
        """Rebuild should fail with duplicate node IDs."""
        note1 = """---
id: duplicate_id
type: Concept
title: First Note
created_at: 2026-01-27T00:00:00Z
updated_at: 2026-01-27T00:00:00Z
tags: []
status: active
---
Content 1
"""
        note2 = """---
id: duplicate_id
type: TaskContract
title: Second Note
created_at: 2026-01-27T00:00:00Z
updated_at: 2026-01-27T00:00:00Z
tags: []
status: active
acceptance_criteria:
  - AC1
---
Content 2
"""

        with patch("app.index.discover_notes") as mock_discover, patch(
            "app.index.load_note_content"
        ) as mock_load, patch("app.index.get_index_path") as mock_path:
            mock_discover.return_value = ["note1.md", "note2.md"]
            mock_load.side_effect = [note1, note2]
            test_db = tmp_path / "test.db"
            mock_path.return_value = test_db

            with pytest.raises(IndexRebuildError) as exc_info:
                rebuild_index()

            assert "Duplicate node ID" in str(exc_info.value)
            assert "duplicate_id" in str(exc_info.value)

    def test_rebuild_index_skips_invalid_frontmatter(self, tmp_path):
        """Rebuild should skip notes with invalid frontmatter."""
        valid_note = """---
id: valid_001
type: Concept
title: Valid Note
created_at: 2026-01-27T00:00:00Z
updated_at: 2026-01-27T00:00:00Z
tags: []
status: active
---
Content
"""
        invalid_note = """---
id: invalid_001
type: InvalidType
title: Invalid Note
created_at: 2026-01-27T00:00:00Z
updated_at: 2026-01-27T00:00:00Z
tags: []
status: active
---
Content
"""

        with patch("app.index.discover_notes") as mock_discover, patch(
            "app.index.load_note_content"
        ) as mock_load, patch("app.index.get_index_path") as mock_path:
            mock_discover.return_value = ["valid.md", "invalid.md"]
            mock_load.side_effect = [valid_note, invalid_note]
            test_db = tmp_path / "test.db"
            mock_path.return_value = test_db

            diagnostics = rebuild_index()

            assert diagnostics.notes_discovered == 2
            assert diagnostics.notes_indexed == 1
            assert diagnostics.notes_skipped == 1
            assert len(diagnostics.errors) == 1

    def test_rebuild_index_preserves_old_index_on_failure(self, tmp_path):
        """Failed rebuild should preserve existing index."""
        # Create existing index
        old_index = tmp_path / "index.db"
        old_index.write_text("old index content")

        duplicate_note = """---
id: dup_id
type: Concept
title: Note
created_at: 2026-01-27T00:00:00Z
updated_at: 2026-01-27T00:00:00Z
tags: []
status: active
---
Content
"""

        with patch("app.index.discover_notes") as mock_discover, patch(
            "app.index.load_note_content"
        ) as mock_load, patch("app.index.get_index_path") as mock_path:
            mock_discover.return_value = ["note1.md", "note2.md"]
            mock_load.return_value = duplicate_note
            mock_path.return_value = old_index

            with pytest.raises(IndexRebuildError):
                rebuild_index()

            # Old index should still exist
            assert old_index.exists()
            assert old_index.read_text() == "old index content"

    def test_rebuild_index_with_relationships(self, tmp_path):
        """Rebuild should extract and store relationships."""
        note_content = """---
id: node_with_rels
type: TaskContract
title: Task with relationships
created_at: 2026-01-27T00:00:00Z
updated_at: 2026-01-27T00:00:00Z
tags: []
status: active
acceptance_criteria:
  - AC1
relationships:
  - target: dependency_1
    type: depends_on
  - target: related_2
    type: related_to
---
Content
"""

        with patch("app.index.discover_notes") as mock_discover, patch(
            "app.index.load_note_content"
        ) as mock_load, patch("app.index.get_index_path") as mock_path:
            mock_discover.return_value = ["task.md"]
            mock_load.return_value = note_content
            test_db = tmp_path / "test.db"
            mock_path.return_value = test_db

            diagnostics = rebuild_index()

            assert diagnostics.notes_indexed == 1

            # Verify edges were created
            conn = sqlite3.connect(str(test_db))
            cursor = conn.cursor()
            cursor.execute(
                "SELECT source_id, target_id, relationship_type FROM edges ORDER BY target_id"
            )
            edges = cursor.fetchall()
            assert len(edges) == 2
            assert edges[0] == ("node_with_rels", "dependency_1", "depends_on")
            assert edges[1] == ("node_with_rels", "related_2", "related_to")
            conn.close()

    def test_rebuild_index_deterministic_ordering(self, tmp_path):
        """Multiple rebuilds should produce identical results."""
        notes = [
            """---
id: note_a
type: Concept
title: Note A
created_at: 2026-01-27T00:00:00Z
updated_at: 2026-01-27T00:00:00Z
tags: []
status: active
---
Content A
""",
            """---
id: note_b
type: Concept
title: Note B
created_at: 2026-01-27T00:00:00Z
updated_at: 2026-01-27T00:00:00Z
tags: []
status: active
---
Content B
""",
        ]

        with patch("app.index.discover_notes") as mock_discover, patch(
            "app.index.load_note_content"
        ) as mock_load, patch("app.index.get_index_path") as mock_path:
            mock_discover.return_value = ["a.md", "b.md"]
            mock_load.side_effect = notes * 2  # Two rebuilds
            test_db = tmp_path / "test.db"
            mock_path.return_value = test_db

            # First rebuild
            rebuild_index()
            conn1 = sqlite3.connect(str(test_db))
            cursor1 = conn1.cursor()
            cursor1.execute("SELECT id FROM nodes ORDER BY id")
            ids1 = [row[0] for row in cursor1.fetchall()]
            conn1.close()

            # Second rebuild
            rebuild_index()
            conn2 = sqlite3.connect(str(test_db))
            cursor2 = conn2.cursor()
            cursor2.execute("SELECT id FROM nodes ORDER BY id")
            ids2 = [row[0] for row in cursor2.fetchall()]
            conn2.close()

            assert ids1 == ids2
