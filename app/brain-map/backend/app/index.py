"""SQLite index builder for Brain Map backend.

This module provides deterministic index rebuild with atomic publish behavior.
The index is a derived artifact and must not be committed to version control.
"""

import sqlite3
import tempfile
from pathlib import Path
from typing import Dict, List, Tuple, Set
import json
from datetime import datetime

from app.frontmatter import parse_and_validate, ValidationError
from app.notes import discover_notes, get_notes_root, load_note_content


def get_index_path() -> Path:
    """Return the canonical index database path.

    Returns:
        Path to app/brain-map/.local/index.db
    """
    notes_root = get_notes_root()
    local_dir = notes_root.parent / ".local"
    return local_dir / "index.db"


def _create_schema(conn: sqlite3.Connection) -> None:
    """Create SQLite schema for the index.

    Args:
        conn: SQLite database connection.
    """
    cursor = conn.cursor()

    # Nodes table: stores parsed frontmatter and metadata
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS nodes (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            filepath TEXT NOT NULL UNIQUE,
            created_at TEXT,
            modified_at TEXT,
            tags TEXT,
            status TEXT,
            priority TEXT,
            context TEXT,
            acceptance_criteria TEXT,
            frontmatter_json TEXT NOT NULL
        )
    """)

    # Edges table: stores relationships between nodes
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS edges (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            PRIMARY KEY (source_id, target_id, relationship_type),
            FOREIGN KEY (source_id) REFERENCES nodes(id),
            FOREIGN KEY (target_id) REFERENCES nodes(id)
        )
    """)

    # Full-text search virtual table for nodes
    cursor.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS nodes_fts USING fts5(
            id UNINDEXED,
            title,
            tags,
            content
        )
    """)

    # Indexes for common query patterns
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_id)")

    conn.commit()


def _extract_edges(frontmatter: Dict, node_id: str) -> List[Tuple[str, str, str]]:
    """Extract edges from frontmatter relationships field.

    Args:
        frontmatter: Parsed frontmatter dictionary.
        node_id: Source node ID.

    Returns:
        List of (source_id, target_id, relationship_type) tuples.
    """
    edges = []
    relationships = frontmatter.get("relationships", [])

    for rel in relationships:
        target = rel.get("target")
        rel_type = rel.get("type", "related_to")
        if target:
            edges.append((node_id, target, rel_type))

    return edges


class IndexRebuildError(Exception):
    """Raised when index rebuild encounters a fatal error."""


class RebuildDiagnostics:
    """Diagnostics for index rebuild operations."""

    def __init__(self):
        self.notes_discovered = 0
        self.notes_indexed = 0
        self.notes_skipped = 0
        self.errors: List[Dict[str, str]] = []
        self.warnings: List[Dict[str, str]] = []

    def add_error(self, filepath: str, message: str) -> None:
        """Add an error diagnostic."""
        self.errors.append({"filepath": filepath, "message": message})

    def add_warning(self, filepath: str, message: str) -> None:
        """Add a warning diagnostic."""
        self.warnings.append({"filepath": filepath, "message": message})

    def to_dict(self) -> Dict:
        """Convert diagnostics to dictionary."""
        return {
            "notes_discovered": self.notes_discovered,
            "notes_indexed": self.notes_indexed,
            "notes_skipped": self.notes_skipped,
            "errors": self.errors,
            "warnings": self.warnings,
        }


def rebuild_index() -> RebuildDiagnostics:
    """Rebuild the SQLite index from markdown notes with atomic publish.

    This function:
    1. Discovers all markdown notes
    2. Parses frontmatter and validates against schema
    3. Builds a temporary index database
    4. Detects duplicate IDs (hard error)
    5. Atomically swaps temp index to published location on success

    Returns:
        RebuildDiagnostics with rebuild statistics and any errors/warnings.

    Raises:
        IndexRebuildError: If rebuild fails (duplicate IDs or fatal errors).
    """
    diagnostics = RebuildDiagnostics()

    # Discover all notes
    note_paths = discover_notes()
    diagnostics.notes_discovered = len(note_paths)

    if diagnostics.notes_discovered == 0:
        diagnostics.add_warning("", "No notes discovered in notes directory")

    # Track seen IDs for duplicate detection
    seen_ids: Dict[str, str] = {}

    # Create temporary database
    temp_db_fd, temp_db_path = tempfile.mkstemp(suffix=".db")
    try:
        # Build index in temporary database
        conn = sqlite3.connect(temp_db_path)
        _create_schema(conn)

        cursor = conn.cursor()

        for note_path in note_paths:
            try:
                # Load and parse note
                content = load_note_content(note_path)
                frontmatter, body, warnings = parse_and_validate(content)

                node_id = frontmatter["id"]

                # Duplicate ID detection (hard error)
                if node_id in seen_ids:
                    error_msg = (
                        f"Duplicate node ID '{node_id}' found in:\n"
                        f"  - {seen_ids[node_id]}\n"
                        f"  - {note_path}"
                    )
                    diagnostics.add_error("", error_msg)
                    conn.close()
                    raise IndexRebuildError(f"Duplicate node ID detected: {node_id}")

                seen_ids[node_id] = note_path

                # Insert node into database
                import json

                # Convert datetime objects to strings for JSON serialization
                created_at = frontmatter.get("created_at")
                if created_at and not isinstance(created_at, str):
                    created_at = created_at.isoformat()

                modified_at = frontmatter.get("modified_at")
                if modified_at and not isinstance(modified_at, str):
                    modified_at = modified_at.isoformat()

                updated_at = frontmatter.get("updated_at")
                if updated_at and not isinstance(updated_at, str):
                    updated_at = updated_at.isoformat()

                # Prepare frontmatter for JSON serialization (convert datetimes)
                frontmatter_serializable = frontmatter.copy()
                for key in ["created_at", "modified_at", "updated_at"]:
                    if key in frontmatter_serializable and not isinstance(
                        frontmatter_serializable[key], str
                    ):
                        frontmatter_serializable[key] = frontmatter_serializable[
                            key
                        ].isoformat()

                cursor.execute(
                    """
                    INSERT INTO nodes (
                        id, type, title, filepath, created_at, modified_at,
                        tags, status, priority, context, acceptance_criteria,
                        frontmatter_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        node_id,
                        frontmatter["type"],
                        frontmatter["title"],
                        note_path,
                        created_at
                        or updated_at,  # Fall back to updated_at if created_at missing
                        modified_at
                        or updated_at,  # Fall back to updated_at if modified_at missing
                        json.dumps(frontmatter.get("tags", [])),
                        frontmatter.get("status"),
                        frontmatter.get("priority"),
                        frontmatter.get("context"),
                        json.dumps(frontmatter.get("acceptance_criteria", []))
                        if frontmatter.get("acceptance_criteria")
                        else None,
                        json.dumps(frontmatter_serializable),
                    ),
                )

                # Insert into FTS table (use body content for search)
                body_content = body.strip() if body else ""
                cursor.execute(
                    """
                    INSERT INTO nodes_fts (id, title, tags, content)
                    VALUES (?, ?, ?, ?)
                """,
                    (
                        node_id,
                        frontmatter["title"],
                        " ".join(frontmatter.get("tags", [])),
                        body_content[:5000],  # Limit content length for FTS
                    ),
                )

                # Extract and insert edges
                edges = _extract_edges(frontmatter, node_id)
                for source_id, target_id, rel_type in edges:
                    cursor.execute(
                        """
                        INSERT OR IGNORE INTO edges (source_id, target_id, relationship_type)
                        VALUES (?, ?, ?)
                    """,
                        (source_id, target_id, rel_type),
                    )

                # Record warnings if any
                for warning in warnings:
                    diagnostics.add_warning(note_path, warning)

                diagnostics.notes_indexed += 1

            except (ValidationError, FileNotFoundError, ValueError) as e:
                diagnostics.add_error(note_path, str(e))
                diagnostics.notes_skipped += 1
                continue

        conn.commit()
        conn.close()

        # If we got here, rebuild succeeded - atomically publish
        index_path = get_index_path()
        index_path.parent.mkdir(parents=True, exist_ok=True)

        # Atomic swap: move temp to target (overwrites existing)
        Path(temp_db_path).replace(index_path)

    finally:
        # Clean up temp file if it still exists
        try:
            Path(temp_db_path).unlink(missing_ok=True)
        except Exception:
            pass

    return diagnostics


def get_index_connection() -> sqlite3.Connection:
    """Get a connection to the published index database.

    Returns:
        SQLite connection to the index.

    Raises:
        FileNotFoundError: If index does not exist (needs rebuild).
    """
    index_path = get_index_path()
    if not index_path.exists():
        raise FileNotFoundError(
            f"Index not found at {index_path}. Run rebuild_index() first."
        )

    conn = sqlite3.connect(str(index_path))
    conn.row_factory = sqlite3.Row  # Enable dictionary-like access
    return conn


def _compute_clustering_coefficient(
    node_id: str, edges: Set[Tuple[str, str]], node_neighbors: Dict[str, Set[str]]
) -> float:
    """Compute clustering coefficient for a node.

    ClusterCoeff(v) = (actual_edges_between_neighbors) / (possible_edges_between_neighbors)

    Args:
        node_id: Node to compute coefficient for.
        edges: All edges as (source, target) tuples.
        node_neighbors: Pre-computed neighbor sets for all nodes.

    Returns:
        Clustering coefficient in [0.0, 1.0], or 0.0 if node has < 2 neighbors.
    """
    neighbors = node_neighbors.get(node_id, set())
    k = len(neighbors)

    # Need at least 2 neighbors to have clustering
    if k < 2:
        return 0.0

    # Count edges between neighbors
    actual_edges = 0
    for u in neighbors:
        for v in neighbors:
            if u < v:  # Count each edge once
                if (u, v) in edges or (v, u) in edges:
                    actual_edges += 1

    # Maximum possible edges between k neighbors: k*(k-1)/2
    possible_edges = k * (k - 1) // 2

    return actual_edges / possible_edges if possible_edges > 0 else 0.0


def _compute_density_metrics(
    conn: sqlite3.Connection, node_ids: Set[str], alpha: float = 0.7
) -> Dict[str, float]:
    """Compute density heat for nodes in current graph snapshot.

    Args:
        conn: SQLite connection to index database.
        node_ids: Set of node IDs to compute metrics for.
        alpha: Weight for degree component (default 0.7).

    Returns:
        Dict mapping node_id -> density_heat in [0.0, 1.0].
    """
    if not node_ids:
        return {}

    cursor = conn.cursor()

    # Fetch all edges involving these nodes
    placeholders = ",".join("?" * len(node_ids))
    edges_sql = f"""
        SELECT source_id, target_id
        FROM edges
        WHERE source_id IN ({placeholders}) AND target_id IN ({placeholders})
    """
    cursor.execute(edges_sql, list(node_ids) + list(node_ids))
    edge_rows = cursor.fetchall()

    # Build edge set for clustering coefficient
    edges_set = set()
    for row in edge_rows:
        src, tgt = row["source_id"], row["target_id"]
        edges_set.add((src, tgt))

    # Build neighbor sets (undirected graph)
    node_neighbors: Dict[str, Set[str]] = {nid: set() for nid in node_ids}
    for src, tgt in edges_set:
        if src in node_ids and tgt in node_ids:
            node_neighbors[src].add(tgt)
            node_neighbors[tgt].add(src)

    # Compute degree for each node
    degrees = {nid: len(neighbors) for nid, neighbors in node_neighbors.items()}
    max_degree = max(degrees.values()) if degrees else 1

    # Compute density heat for each node
    density_metrics = {}
    for node_id in node_ids:
        degree = degrees.get(node_id, 0)
        degree_normalized = degree / max_degree if max_degree > 0 else 0.0

        clustering_coeff = _compute_clustering_coefficient(
            node_id, edges_set, node_neighbors
        )

        # Weighted combination
        density_heat = alpha * degree_normalized + (1 - alpha) * clustering_coeff
        density_metrics[node_id] = density_heat

    return density_metrics


def _compute_task_heat(
    conn: sqlite3.Connection,
    node_ids: Set[str],
    depth: int = 2,
    weight_open: float = 0.5,
    weight_blocked: float = 0.3,
    weight_recent: float = 0.2,
) -> Dict[str, float]:
    """Compute task heat for nodes based on TaskContract neighborhood.

    Args:
        conn: SQLite connection to index database.
        node_ids: Set of node IDs to compute metrics for.
        depth: Maximum traversal depth for neighborhood (default 2).
        weight_open: Weight for open tasks component (default 0.5).
        weight_blocked: Weight for blocked tasks component (default 0.3).
        weight_recent: Weight for recent task updates component (default 0.2).

    Returns:
        Dict mapping node_id -> task_heat in [0.0, 1.0].
    """
    from datetime import datetime, timezone

    if not node_ids:
        return {}

    cursor = conn.cursor()

    # Build adjacency list for BFS traversal (only task-related relationship types)
    # Per spec: follow "implements", "depends_on", "blocks" relationships
    task_rel_types = ("implements", "depends_on", "blocks")
    placeholders_rel = ",".join("?" * len(task_rel_types))

    # Fetch all edges in the graph (for neighborhood traversal)
    edges_sql = f"""
        SELECT source_id, target_id, relationship_type
        FROM edges
        WHERE relationship_type IN ({placeholders_rel})
    """
    cursor.execute(edges_sql, list(task_rel_types))
    edge_rows = cursor.fetchall()

    # Build adjacency list (bidirectional for neighborhood)
    adjacency: Dict[str, Set[str]] = {}
    for row in edge_rows:
        src, tgt = row["source_id"], row["target_id"]
        if src not in adjacency:
            adjacency[src] = set()
        if tgt not in adjacency:
            adjacency[tgt] = set()
        adjacency[src].add(tgt)
        adjacency[tgt].add(src)  # Treat as undirected for neighborhood

    # Fetch all TaskContract nodes with their status and modified_at
    cursor.execute(
        """
        SELECT id, status, modified_at
        FROM nodes
        WHERE type = 'TaskContract'
    """
    )
    task_rows = cursor.fetchall()

    # Build TaskContract lookup
    task_contracts = {}
    for row in task_rows:
        task_id = row["id"]
        status = row["status"]
        modified_at_str = row["modified_at"]

        # Check if task is recent (updated within 7 days)
        is_recent = False
        if modified_at_str:
            try:
                modified_at = datetime.fromisoformat(
                    modified_at_str.replace("Z", "+00:00")
                )
                days_old = (
                    datetime.now(timezone.utc) - modified_at
                ).total_seconds() / 86400.0
                is_recent = days_old <= 7.0
            except (ValueError, TypeError):
                pass

        task_contracts[task_id] = {
            "status": status,
            "is_recent": is_recent,
        }

    # For each node, compute its task neighborhood
    task_heat_metrics = {}

    for node_id in node_ids:
        # BFS to find TaskContract neighbors within depth
        visited = {node_id}
        current_layer = {node_id}
        associated_tasks = set()

        for _ in range(depth):
            if not current_layer:
                break

            next_layer = set()
            for current_node in current_layer:
                neighbors = adjacency.get(current_node, set())
                for neighbor in neighbors:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        next_layer.add(neighbor)

                        # Check if neighbor is a TaskContract
                        if neighbor in task_contracts:
                            associated_tasks.add(neighbor)

            current_layer = next_layer

        # Count open, blocked, and recent tasks
        open_count = 0
        blocked_count = 0
        recent_count = 0

        for task_id in associated_tasks:
            task_info = task_contracts[task_id]
            status = task_info["status"]

            # Open tasks: planned | active | blocked
            if status in ("planned", "active", "blocked"):
                open_count += 1

            # Blocked tasks
            if status == "blocked":
                blocked_count += 1

            # Recent tasks (updated within 7 days)
            if task_info["is_recent"]:
                recent_count += 1

        # Normalize counts (find global max for normalization)
        # For now, use per-node normalization against max seen
        # This is a simplification; ideally we'd compute max across all nodes first
        max_tasks = len(associated_tasks) if associated_tasks else 1

        open_normalized = open_count / max_tasks if max_tasks > 0 else 0.0
        blocked_normalized = blocked_count / max_tasks if max_tasks > 0 else 0.0
        recent_normalized = recent_count / max_tasks if max_tasks > 0 else 0.0

        # Compute task heat using weighted formula
        task_heat = (
            weight_open * open_normalized
            + weight_blocked * blocked_normalized
            + weight_recent * recent_normalized
        )

        task_heat_metrics[node_id] = task_heat

    return task_heat_metrics


def get_graph_snapshot(
    type_filter: List[str] | None = None,
    status_filter: List[str] | None = None,
    tags_filter: List[str] | None = None,
    tags_mode: str = "all",
    updated_since: str | None = None,
    updated_within_days: int | None = None,
    include_rel_types: List[str] | None = None,
    exclude_rel_types: List[str] | None = None,
    limit: int = 100,
    offset: int = 0,
) -> Tuple[List[Dict], List[Dict], int]:
    """Get graph snapshot with nodes and edges for rendering.

    Args:
        type_filter: Filter by node types.
        status_filter: Filter by node statuses.
        tags_filter: Filter by tags.
        tags_mode: Tag matching mode ("all" or "any").
        updated_since: ISO8601 timestamp filter (nodes updated after this).
        updated_within_days: Filter nodes updated within N days.
        include_rel_types: Include only these relationship types.
        exclude_rel_types: Exclude these relationship types.
        limit: Maximum nodes to return.
        offset: Number of nodes to skip.

    Returns:
        Tuple of (nodes list, edges list, total node count).
        Nodes include metrics placeholders (density, recency, task).
        Edges are filtered based on include/exclude relationship types.
        Ordering follows spec: nodes by type/title/id, edges by from/type/to.

    Raises:
        FileNotFoundError: If index does not exist.
    """
    import json
    from datetime import datetime, timedelta, timezone

    conn = get_index_connection()
    cursor = conn.cursor()

    # Build WHERE clauses for nodes
    where_clauses = []
    params = []

    # Type filter
    if type_filter:
        placeholders = ",".join("?" * len(type_filter))
        where_clauses.append(f"type IN ({placeholders})")
        params.extend(type_filter)

    # Status filter
    if status_filter:
        placeholders = ",".join("?" * len(status_filter))
        where_clauses.append(f"status IN ({placeholders})")
        params.extend(status_filter)

    # Tags filter
    if tags_filter:
        if tags_mode == "all":
            # All tags must be present
            for tag in tags_filter:
                where_clauses.append("tags LIKE ?")
                params.append(f'%"{tag}"%')
        else:
            # Any tag matches
            tag_conditions = " OR ".join(["tags LIKE ?"] * len(tags_filter))
            where_clauses.append(f"({tag_conditions})")
            params.extend([f'%"{tag}"%' for tag in tags_filter])

    # Updated since filter
    if updated_since:
        where_clauses.append("modified_at >= ?")
        params.append(updated_since)

    # Updated within days filter
    if updated_within_days is not None:
        cutoff = (
            datetime.now(timezone.utc) - timedelta(days=updated_within_days)
        ).isoformat()
        where_clauses.append("modified_at >= ?")
        params.append(cutoff)

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

    # Count total nodes matching filters
    count_sql = f"SELECT COUNT(*) as total FROM nodes {where_sql}"
    cursor.execute(count_sql, params)
    total = cursor.fetchone()["total"]

    # Fetch nodes with deterministic ordering: type, title (case-insensitive), id
    nodes_sql = f"""
        SELECT
            id, type, title, filepath, created_at, modified_at,
            tags, status, priority, context, acceptance_criteria, frontmatter_json
        FROM nodes
        {where_sql}
        ORDER BY type ASC, LOWER(title) ASC, id ASC
        LIMIT ? OFFSET ?
    """
    nodes_params = params + [limit, offset]
    cursor.execute(nodes_sql, nodes_params)
    node_rows = cursor.fetchall()

    # Build nodes list with metrics placeholders
    nodes = []
    node_ids = set()
    now = datetime.now(timezone.utc)
    node_rows_list = []
    for row in node_rows:
        node_id = row["id"]
        node_ids.add(node_id)

        # Compute recency heat (0.0 = very old, 1.0 = very recent)
        # Spec formula: RecencyHeat(v) = exp(-λ * Δ_days(v))
        # where λ = ln(2) / H, and H = 7 days (spec default)
        modified_at_str = row["modified_at"]
        recency_heat = None
        if modified_at_str:
            try:
                import math

                modified_at = datetime.fromisoformat(
                    modified_at_str.replace("Z", "+00:00")
                )
                days_old = (now - modified_at).total_seconds() / 86400.0
                # Half-life H = 7 days means heat decays to 0.5 after 7 days
                half_life_days = 7.0
                lambda_decay = math.log(2.0) / half_life_days
                recency_heat = math.exp(-lambda_decay * days_old)
            except (ValueError, TypeError):
                recency_heat = None

        node_rows_list.append((row, recency_heat))

    # Compute density metrics for all nodes in this snapshot
    density_metrics = _compute_density_metrics(conn, node_ids)

    # Compute task heat metrics for all nodes in this snapshot
    task_heat_metrics = _compute_task_heat(conn, node_ids)

    # Build final nodes list with all metrics
    for row, recency_heat in node_rows_list:
        node_id = row["id"]

        # Extract position from frontmatter_json if available
        position = None
        if row["frontmatter_json"]:
            try:
                frontmatter_data = json.loads(row["frontmatter_json"])
                if "position" in frontmatter_data:
                    position = frontmatter_data["position"]
            except (json.JSONDecodeError, KeyError):
                pass

        node_dict = {
            "id": node_id,
            "type": row["type"],
            "title": row["title"],
            "status": row["status"],
            "tags": json.loads(row["tags"]) if row["tags"] else [],
            "created_at": row["created_at"],
            "updated_at": row[
                "modified_at"
            ],  # Spec uses updated_at, DB has modified_at
            "source_path": row["filepath"],
            "metrics": {
                "density": density_metrics.get(node_id),
                "recency": recency_heat,
                "task": task_heat_metrics.get(node_id),
            },
        }

        # Add position if available
        if position:
            node_dict["position"] = position

        nodes.append(node_dict)

    # Fetch edges for the filtered nodes
    # Edges are deterministic by: from (source_id), type (relationship_type), to (target_id)
    edges = []
    if node_ids:
        # Build edge query with relationship type filters
        edge_where = []
        edge_params = []

        # Only include edges where both source and target are in the filtered node set
        placeholders = ",".join("?" * len(node_ids))
        edge_where.append(f"source_id IN ({placeholders})")
        edge_params.extend(node_ids)
        edge_where.append(f"target_id IN ({placeholders})")
        edge_params.extend(node_ids)

        # Relationship type filters
        if include_rel_types:
            rel_placeholders = ",".join("?" * len(include_rel_types))
            edge_where.append(f"relationship_type IN ({rel_placeholders})")
            edge_params.extend(include_rel_types)

        if exclude_rel_types:
            rel_placeholders = ",".join("?" * len(exclude_rel_types))
            edge_where.append(f"relationship_type NOT IN ({rel_placeholders})")
            edge_params.extend(exclude_rel_types)

        edge_where_sql = " AND ".join(edge_where)

        edges_sql = f"""
            SELECT source_id, target_id, relationship_type
            FROM edges
            WHERE {edge_where_sql}
            ORDER BY source_id ASC, relationship_type ASC, target_id ASC
        """
        cursor.execute(edges_sql, edge_params)
        edge_rows = cursor.fetchall()

        for row in edge_rows:
            edges.append(
                {
                    "from": row["source_id"],
                    "to": row["target_id"],
                    "type": row["relationship_type"],
                    "created_at": None,  # Not stored in current schema
                }
            )

    conn.close()
    return nodes, edges, total


def search_nodes(
    query: str,
    type_filter: List[str] | None = None,
    status_filter: List[str] | None = None,
    tags_filter: List[str] | None = None,
    tags_mode: str = "all",
    updated_since: str | None = None,
    updated_within_days: int | None = None,
    limit: int = 50,
    offset: int = 0,
) -> Tuple[List[Dict], int]:
    """Search nodes using FTS5 with filters and pagination.

    Args:
        query: Search query string for FTS5.
        type_filter: Filter by node types.
        status_filter: Filter by node statuses.
        tags_filter: Filter by tags.
        tags_mode: Tag matching mode ("all" or "any").
        updated_since: ISO8601 timestamp filter (nodes updated after this).
        updated_within_days: Filter nodes updated within N days.
        limit: Maximum results to return.
        offset: Number of results to skip.

    Returns:
        Tuple of (results list, total count).
        Each result is a dict with node fields plus "score".

    Raises:
        FileNotFoundError: If index does not exist.
    """
    import json
    from datetime import datetime, timedelta, timezone

    conn = get_index_connection()
    cursor = conn.cursor()

    # Build WHERE clauses
    where_clauses = []
    params = []

    # FTS5 search
    where_clauses.append("nodes_fts.id = nodes.id")
    where_clauses.append("nodes_fts MATCH ?")
    params.append(query)

    # Type filter
    if type_filter:
        placeholders = ",".join("?" * len(type_filter))
        where_clauses.append(f"nodes.type IN ({placeholders})")
        params.extend(type_filter)

    # Status filter
    if status_filter:
        placeholders = ",".join("?" * len(status_filter))
        where_clauses.append(f"nodes.status IN ({placeholders})")
        params.extend(status_filter)

    # Tags filter
    if tags_filter:
        if tags_mode == "all":
            # All tags must be present
            for tag in tags_filter:
                where_clauses.append("nodes.tags LIKE ?")
                params.append(f'%"{tag}"%')
        else:
            # Any tag matches
            tag_conditions = " OR ".join(["nodes.tags LIKE ?"] * len(tags_filter))
            where_clauses.append(f"({tag_conditions})")
            params.extend([f'%"{tag}"%' for tag in tags_filter])

    # Updated since filter
    if updated_since:
        where_clauses.append("nodes.modified_at >= ?")
        params.append(updated_since)

    # Updated within days filter
    if updated_within_days is not None:
        cutoff = (
            datetime.now(timezone.utc) - timedelta(days=updated_within_days)
        ).isoformat()
        where_clauses.append("nodes.modified_at >= ?")
        params.append(cutoff)

    where_sql = " AND ".join(where_clauses)

    # Count total results
    count_sql = f"""
        SELECT COUNT(*) as total
        FROM nodes_fts, nodes
        WHERE {where_sql}
    """
    cursor.execute(count_sql, params)
    total = cursor.fetchone()["total"]

    # Fetch paginated results with stable ordering
    # Order by: rank (relevance) descending, then id ascending for tie-breaking
    search_sql = f"""
        SELECT
            nodes.id,
            nodes.type,
            nodes.title,
            nodes.filepath,
            nodes.created_at,
            nodes.modified_at,
            nodes.tags,
            nodes.status,
            nodes.priority,
            nodes.context,
            nodes.acceptance_criteria,
            nodes.frontmatter_json,
            rank as score
        FROM nodes_fts, nodes
        WHERE {where_sql}
        ORDER BY rank, nodes.id ASC
        LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])

    cursor.execute(search_sql, params)
    rows = cursor.fetchall()

    results = []
    for row in rows:
        result = {
            "id": row["id"],
            "type": row["type"],
            "title": row["title"],
            "filepath": row["filepath"],
            "created_at": row["created_at"],
            "modified_at": row["modified_at"],
            "tags": json.loads(row["tags"]) if row["tags"] else [],
            "status": row["status"],
            "priority": row["priority"],
            "context": row["context"],
            "acceptance_criteria": json.loads(row["acceptance_criteria"])
            if row["acceptance_criteria"]
            else None,
            "score": abs(row["score"]),  # FTS5 rank is negative, make positive
        }
        results.append(result)

    conn.close()
    return results, total


def get_node(node_id: str) -> dict | None:
    """
    Retrieve a single node by ID from the index.

    Args:
        node_id: Node identifier

    Returns:
        Node dict with metadata, or None if not found

    Raises:
        FileNotFoundError: If index doesn't exist
    """
    conn = get_index_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, title, type, status, tags, priority, context,
               created_at, modified_at, filepath, acceptance_criteria,
               frontmatter_json
        FROM nodes
        WHERE id = ?
        """,
        (node_id,),
    )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row["id"],
        "title": row["title"],
        "type": row["type"],
        "status": row["status"],
        "tags": json.loads(row["tags"]) if row["tags"] else [],
        "priority": row["priority"],
        "created_at": row["created_at"],
        "updated_at": row["modified_at"],
        "source_path": row["filepath"],
        "acceptance_criteria": json.loads(row["acceptance_criteria"])
        if row["acceptance_criteria"]
        else None,
        "context": row["context"],
    }


def extract_subgraph(
    selection: list[str],
    depth: int,
    include_rel_types: list[str] | None = None,
    exclude_rel_types: list[str] | None = None,
) -> tuple[list[dict], list[dict]]:
    """
    Extract a subgraph starting from selected nodes.

    Performs breadth-first traversal up to specified depth, respecting
    relationship type filters.

    Args:
        selection: Starting node IDs
        depth: Maximum traversal depth (0 = selection only)
        include_rel_types: Only follow these relationship types (None = all)
        exclude_rel_types: Never follow these relationship types (None = none)

    Returns:
        Tuple of (nodes_list, edges_list)

    Raises:
        FileNotFoundError: If index doesn't exist
    """
    conn = get_index_connection()
    conn.row_factory = sqlite3.Row

    # Track visited nodes and edges
    visited_nodes = set(selection)
    visited_edges = set()
    current_layer = set(selection)

    # BFS traversal
    for _ in range(depth):
        if not current_layer:
            break

        next_layer = set()

        # Find outbound edges from current layer
        placeholders = ",".join("?" * len(current_layer))
        query = f"""
            SELECT source_id, target_id, relationship_type
            FROM edges
            WHERE source_id IN ({placeholders})
        """

        params = list(current_layer)

        # Apply relationship filters
        if include_rel_types:
            rel_placeholders = ",".join("?" * len(include_rel_types))
            query += f" AND relationship_type IN ({rel_placeholders})"
            params.extend(include_rel_types)

        if exclude_rel_types:
            rel_placeholders = ",".join("?" * len(exclude_rel_types))
            query += f" AND relationship_type NOT IN ({rel_placeholders})"
            params.extend(exclude_rel_types)

        cursor = conn.cursor()
        cursor.execute(query, params)

        for row in cursor.fetchall():
            edge_tuple = (row["source_id"], row["target_id"], row["relationship_type"])
            visited_edges.add(edge_tuple)

            # Add target to next layer if not visited
            if row["target_id"] not in visited_nodes:
                visited_nodes.add(row["target_id"])
                next_layer.add(row["target_id"])

        current_layer = next_layer

    # Fetch all node data
    nodes = []
    if visited_nodes:
        placeholders = ",".join("?" * len(visited_nodes))
        cursor = conn.cursor()
        cursor.execute(
            f"""
            SELECT id, title, type, status, tags, priority, context,
                   created_at, modified_at, filepath, acceptance_criteria,
                   frontmatter_json
            FROM nodes
            WHERE id IN ({placeholders})
            ORDER BY type ASC, title ASC, id ASC
            """,
            list(visited_nodes),
        )

        for row in cursor.fetchall():
            nodes.append(
                {
                    "id": row["id"],
                    "title": row["title"],
                    "type": row["type"],
                    "status": row["status"],
                    "tags": json.loads(row["tags"]) if row["tags"] else [],
                    "priority": row["priority"],
                    "created_at": row["created_at"],
                    "updated_at": row["modified_at"],
                    "source_path": row["filepath"],
                    "acceptance_criteria": json.loads(row["acceptance_criteria"])
                    if row["acceptance_criteria"]
                    else None,
                    "context": row["context"],
                }
            )

    # Format edges
    edges = [
        {
            "from": edge[0],
            "to": edge[1],
            "type": edge[2],
        }
        for edge in sorted(visited_edges)
    ]

    conn.close()
    return nodes, edges


def _topological_sort(nodes: list[dict], edges: list[dict]) -> list[str]:
    """
    Perform topological sort on nodes using Kahn's algorithm.

    Returns a stable ordering of node IDs respecting dependencies.
    If cycles exist, remaining nodes are sorted lexicographically.

    Args:
        nodes: List of node dicts with 'id' field
        edges: List of edge dicts with 'from' and 'to' fields

    Returns:
        List of node IDs in topological order
    """
    # Build adjacency list and in-degree map
    adjacency = {node["id"]: [] for node in nodes}
    in_degree = {node["id"]: 0 for node in nodes}

    for edge in edges:
        source, target = edge["from"], edge["to"]
        if source in adjacency and target in in_degree:
            adjacency[source].append(target)
            in_degree[target] += 1

    # Find all nodes with in-degree 0 (no dependencies)
    queue = sorted([nid for nid, deg in in_degree.items() if deg == 0])
    result = []

    while queue:
        # Pop node with smallest ID (for determinism)
        current = queue.pop(0)
        result.append(current)

        # Reduce in-degree for neighbors
        for neighbor in sorted(adjacency[current]):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                # Insert in sorted position for determinism
                queue.append(neighbor)
                queue.sort()

    # If not all nodes processed, there are cycles
    # Add remaining nodes in lexicographic order
    remaining = sorted([nid for nid in in_degree if in_degree[nid] > 0])
    result.extend(remaining)

    return result


def calculate_betweenness_centrality(
    adjacency_dict: dict[str, list[str]],
) -> dict[str, float]:
    """Calculate betweenness centrality using Brandes' algorithm.

    Betweenness centrality measures how often a node appears on shortest
    paths between other nodes. High betweenness indicates bridge nodes
    that connect different clusters.

    Args:
        adjacency_dict: Graph as {node_id: [neighbor_id, ...]}.

    Returns:
        Dictionary mapping node_id to betweenness score.
    """
    from collections import deque

    nodes = list(adjacency_dict.keys())
    betweenness = {node: 0.0 for node in nodes}

    # For each node as source
    for source in nodes:
        # BFS to find shortest paths
        stack = []
        paths = {node: [] for node in nodes}  # predecessors
        sigma = {node: 0.0 for node in nodes}  # number of shortest paths
        sigma[source] = 1.0
        dist = {node: -1 for node in nodes}
        dist[source] = 0

        queue = deque([source])

        while queue:
            v = queue.popleft()
            stack.append(v)

            for w in adjacency_dict.get(v, []):
                # First time we see w?
                if dist[w] < 0:
                    queue.append(w)
                    dist[w] = dist[v] + 1

                # Shortest path to w via v?
                if dist[w] == dist[v] + 1:
                    sigma[w] += sigma[v]
                    paths[w].append(v)

        # Accumulation: back-propagate dependencies
        delta = {node: 0.0 for node in nodes}

        while stack:
            w = stack.pop()
            for v in paths[w]:
                delta[v] += (sigma[v] / sigma[w]) * (1.0 + delta[w])

            if w != source:
                betweenness[w] += delta[w]

    # Normalize (undirected graph, divide by 2)
    for node in betweenness:
        betweenness[node] /= 2.0

    return betweenness


def calculate_degree_centrality(adjacency_dict: dict[str, list[str]]) -> dict[str, int]:
    """Calculate degree centrality (fallback for betweenness).

    Degree centrality is simply the count of edges connected to each node.
    Simpler but less accurate than betweenness for bridge detection.

    Args:
        adjacency_dict: Graph as {node_id: [neighbor_id, ...]}.

    Returns:
        Dictionary mapping node_id to degree count.
    """
    return {node: len(neighbors) for node, neighbors in adjacency_dict.items()}


def get_bridge_nodes(top_n: int = 5, use_degree_fallback: bool = False) -> list[dict]:
    """Identify bridge nodes using betweenness centrality.

    Bridge nodes are those that connect disparate clusters in the graph.
    Returns the top N nodes by betweenness centrality score.

    Args:
        top_n: Number of top bridge nodes to return (default 5).
        use_degree_fallback: Use degree centrality instead of betweenness.

    Returns:
        List of bridge node dictionaries with metadata and scores.

    Raises:
        FileNotFoundError: If index database doesn't exist.
    """
    conn = get_index_connection()
    cursor = conn.cursor()

    # Build adjacency list (treat as undirected)
    cursor.execute("SELECT source_id, target_id FROM edges")
    edge_rows = cursor.fetchall()

    adjacency = {}
    for row in edge_rows:
        src, tgt = row["source_id"], row["target_id"]

        if src not in adjacency:
            adjacency[src] = []
        if tgt not in adjacency:
            adjacency[tgt] = []

        adjacency[src].append(tgt)
        adjacency[tgt].append(src)  # Undirected

    # Calculate centrality scores
    if use_degree_fallback:
        scores = calculate_degree_centrality(adjacency)
    else:
        scores = calculate_betweenness_centrality(adjacency)

    # Get top N nodes by score
    sorted_nodes = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n]

    # Fetch node metadata
    bridge_nodes = []
    for node_id, score in sorted_nodes:
        cursor.execute(
            """
            SELECT id, title, type, status, created_at, modified_at
            FROM nodes
            WHERE id = ?
        """,
            (node_id,),
        )
        row = cursor.fetchone()

        if row:
            bridge_nodes.append(
                {
                    "id": row["id"],
                    "title": row["title"],
                    "type": row["type"],
                    "status": row["status"],
                    "created_at": row["created_at"],
                    "updated_at": row["modified_at"],
                    "betweenness_score": score,
                }
            )

    conn.close()
    return bridge_nodes


def get_stale_nodes(threshold_days: int = 90) -> list[dict]:
    """Identify stale nodes that haven't been updated recently.

    Stale nodes are those with modified_at (updated_at) older than
    threshold_days. Useful for identifying notes that may need review.

    Args:
        threshold_days: Number of days after which a node is considered stale (default 90).

    Returns:
        List of stale node dictionaries with metadata and days_old.

    Raises:
        FileNotFoundError: If index database doesn't exist.
    """
    from datetime import datetime, timedelta, timezone

    conn = get_index_connection()
    cursor = conn.cursor()

    # Calculate cutoff timestamp
    cutoff = datetime.now(timezone.utc) - timedelta(days=threshold_days)
    cutoff_iso = cutoff.isoformat()

    # Query nodes older than threshold
    cursor.execute(
        """
        SELECT id, title, type, status, created_at, modified_at
        FROM nodes
        WHERE modified_at < ?
        ORDER BY modified_at ASC
    """,
        (cutoff_iso,),
    )

    rows = cursor.fetchall()

    # Build stale nodes list with days_old metric
    stale_nodes = []
    now = datetime.now(timezone.utc)

    for row in rows:
        modified_at_str = row["modified_at"]
        days_old = None

        if modified_at_str:
            try:
                modified_at = datetime.fromisoformat(
                    modified_at_str.replace("Z", "+00:00")
                )
                days_old = (now - modified_at).total_seconds() / 86400.0
            except (ValueError, TypeError):
                pass

        stale_nodes.append(
            {
                "id": row["id"],
                "title": row["title"],
                "type": row["type"],
                "status": row["status"],
                "created_at": row["created_at"],
                "updated_at": row["modified_at"],
                "days_old": round(days_old, 1) if days_old else None,
            }
        )

    conn.close()
    return stale_nodes


def get_activity_data(days: int = 90) -> list[dict]:
    """Get daily activity data (creates + updates) for the last N days.

    Aggregates node creation and update events by date to support
    activity calendar visualization (GitHub-style contribution graph).

    Args:
        days: Number of days to look back (default 90).

    Returns:
        List of dicts with date (YYYY-MM-DD) and count (int).

    Raises:
        FileNotFoundError: If index database doesn't exist.
    """
    from datetime import datetime, timezone, timedelta

    conn = get_index_connection()
    cursor = conn.cursor()

    # Calculate date threshold
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    start_iso = start_date.isoformat()

    # Query for created_at dates
    cursor.execute(
        """
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM nodes
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
    """,
        (start_iso,),
    )

    creates = {row["date"]: row["count"] for row in cursor.fetchall()}

    # Query for modified_at dates (excluding same-day creates)
    cursor.execute(
        """
        SELECT DATE(modified_at) as date, COUNT(*) as count
        FROM nodes
        WHERE modified_at >= ?
          AND DATE(modified_at) != DATE(created_at)
        GROUP BY DATE(modified_at)
    """,
        (start_iso,),
    )

    updates = {row["date"]: row["count"] for row in cursor.fetchall()}

    # Merge creates and updates
    all_dates = set(creates.keys()) | set(updates.keys())
    activity = []
    for date in sorted(all_dates):
        activity.append(
            {
                "date": date,
                "count": creates.get(date, 0) + updates.get(date, 0),
            }
        )

    conn.close()
    return activity


def calculate_connected_components(adjacency: dict[str, set[str]]) -> tuple[int, int]:
    """Calculate number and size of connected components using DFS.

    Args:
        adjacency: Graph as {node_id: {neighbor_ids}}.

    Returns:
        Tuple of (num_components, largest_component_size).
    """
    visited = set()
    num_components = 0
    largest_size = 0

    def dfs(node: str, component: set[str]) -> None:
        """Depth-first search to find connected component."""
        if node in visited:
            return
        visited.add(node)
        component.add(node)
        for neighbor in adjacency.get(node, set()):
            dfs(neighbor, component)

    for node in adjacency:
        if node not in visited:
            component = set()
            dfs(node, component)
            num_components += 1
            largest_size = max(largest_size, len(component))

    return num_components, largest_size


def get_orphan_nodes() -> list[dict]:
    """
    Identify orphan nodes (nodes with zero in-degree and out-degree).

    An orphan node has no incoming or outgoing edges in the graph.

    Returns:
        List of node dicts with basic metadata (id, title, type, status, tags, created_at, updated_at).
        Results are ordered deterministically by type, title, id.

    Raises:
        FileNotFoundError: If index doesn't exist.
    """
    conn = get_index_connection()
    cursor = conn.cursor()

    # Find all nodes that don't appear in edges table (neither as source nor target)
    query = """
        SELECT n.id, n.title, n.type, n.status, n.tags, n.created_at, n.modified_at
        FROM nodes n
        WHERE n.id NOT IN (
            SELECT DISTINCT source_id FROM edges
            UNION
            SELECT DISTINCT target_id FROM edges
        )
        ORDER BY n.type ASC, LOWER(n.title) ASC, n.id ASC
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    orphans = []
    for row in rows:
        orphans.append(
            {
                "id": row["id"],
                "title": row["title"],
                "type": row["type"],
                "status": row["status"],
                "tags": json.loads(row["tags"]) if row["tags"] else [],
                "created_at": row["created_at"],
                "updated_at": row["modified_at"],
            }
        )

    conn.close()
    return orphans


def get_graph_metrics() -> dict:
    """Calculate comprehensive graph health metrics.

    Computes:
    - node_count: Total number of nodes
    - edge_count: Total number of edges
    - avg_degree: Average edges per node
    - orphan_count: Nodes with zero edges
    - num_components: Number of connected components
    - largest_component_size: Size of largest connected component

    Returns:
        Dictionary with graph metrics.

    Raises:
        FileNotFoundError: If index database doesn't exist.
    """
    conn = get_index_connection()
    cursor = conn.cursor()

    # Count total nodes
    cursor.execute("SELECT COUNT(*) as count FROM nodes")
    node_count = cursor.fetchone()["count"]

    # Count total edges
    cursor.execute("SELECT COUNT(*) as count FROM edges")
    edge_count = cursor.fetchone()["count"]

    # Build adjacency list for component analysis (undirected)
    cursor.execute("SELECT source_id, target_id FROM edges")
    edge_rows = cursor.fetchall()

    adjacency = {}
    degree_sum = 0

    # Initialize all nodes with empty adjacency
    cursor.execute("SELECT id FROM nodes")
    for row in cursor.fetchall():
        adjacency[row["id"]] = set()

    # Populate adjacency and count degrees
    for row in edge_rows:
        src, tgt = row["source_id"], row["target_id"]
        if src in adjacency:
            adjacency[src].add(tgt)
        if tgt in adjacency:
            adjacency[tgt].add(src)

    # Calculate average degree
    degree_sum = sum(len(neighbors) for neighbors in adjacency.values())
    avg_degree = degree_sum / node_count if node_count > 0 else 0.0

    # Count orphans (nodes with degree 0)
    orphan_count = sum(1 for neighbors in adjacency.values() if len(neighbors) == 0)

    # Calculate connected components
    num_components, largest_component_size = calculate_connected_components(adjacency)

    conn.close()

    return {
        "node_count": node_count,
        "edge_count": edge_count,
        "avg_degree": round(avg_degree, 2),
        "orphan_count": orphan_count,
        "num_components": num_components,
        "largest_component_size": largest_component_size,
    }


def generate_plan_markdown(
    nodes: list[dict],
    edges: list[dict],
    selection: list[str],
) -> str:
    """
    Generate deterministic markdown plan from subgraph.

    Creates agent-readable implementation plan with:
    - Selected nodes (prominently marked)
    - Topologically sorted task ordering
    - Cycle detection and explicit reporting
    - Dependency graph visualization
    - Acceptance criteria extraction
    - Relationship mapping

    Args:
        nodes: List of node dicts
        edges: List of edge dicts
        selection: Original selection IDs (for prominence marking)

    Returns:
        Markdown string suitable for agent consumption
    """
    lines = [
        "# Implementation Plan (Generated)",
        "",
        f"**Generated at:** {datetime.now().isoformat()}",
        f"**Selected nodes:** {len(selection)}",
        f"**Total nodes in subgraph:** {len(nodes)}",
        f"**Total edges:** {len(edges)}",
        "",
        "---",
        "",
    ]

    # Run cycle detection on dependency relationships
    depends_on_edges = [e for e in edges if e["type"] == "depends_on"]

    # Build in-memory cycle detection (no database connection)
    # Extract unique node IDs from edges
    node_ids_in_graph = set()
    for edge in depends_on_edges:
        node_ids_in_graph.add(edge["from"])
        node_ids_in_graph.add(edge["to"])

    # Build adjacency list for cycle detection
    adjacency: dict[str, list[str]] = {nid: [] for nid in node_ids_in_graph}
    for edge in depends_on_edges:
        adjacency[edge["from"]].append(edge["to"])

    # Detect cycles using DFS
    from app.dependency_analysis import CycleDetectionResult

    cycle_result = CycleDetectionResult()

    # Detect self-loops
    for edge in depends_on_edges:
        if edge["from"] == edge["to"]:
            cycle_result.self_loops.append(edge["from"])
            cycle_result.has_cycles = True

    # DFS-based cycle detection
    WHITE, GRAY, BLACK = 0, 1, 2
    state = {node: WHITE for node in node_ids_in_graph}
    parent = {node: None for node in node_ids_in_graph}

    def extract_cycle(current: str, back_target: str) -> list[str]:
        """Extract cycle path from DFS traversal."""
        cycle = [back_target]
        node = current
        while node != back_target and node is not None:
            cycle.append(node)
            node = parent.get(node)
        cycle.reverse()
        return cycle

    def dfs_visit(node: str) -> None:
        """Visit node and detect cycles via back edges."""
        state[node] = GRAY
        for neighbor in adjacency.get(node, []):
            if state[neighbor] == WHITE:
                parent[neighbor] = node
                dfs_visit(neighbor)
            elif state[neighbor] == GRAY:
                # Back edge detected - cycle found
                cycle = extract_cycle(node, neighbor)
                cycle_result.cycles.append(cycle)
                cycle_result.has_cycles = True
        state[node] = BLACK

    # Run DFS from all unvisited nodes
    for node in node_ids_in_graph:
        if state[node] == WHITE:
            dfs_visit(node)

    # Report cycles if detected
    if cycle_result.has_cycles:
        lines.append("## ⚠️ Dependency Cycles Detected")
        lines.append("")
        lines.append(
            f"**Warning:** {len(cycle_result.cycles)} dependency cycle(s) found. "
            "Tasks in cycles cannot be strictly ordered and may need manual review."
        )
        lines.append("")

        for i, cycle in enumerate(cycle_result.cycles, 1):
            # Find node titles for cycle display
            cycle_titles = []
            for node_id in cycle:
                node = next((n for n in nodes if n["id"] == node_id), None)
                title = node["title"] if node else node_id
                cycle_titles.append(title)

            cycle_path = " → ".join(cycle_titles + [cycle_titles[0]])
            lines.append(f"{i}. **Cycle {i}:** {cycle_path}")

        lines.append("")
        lines.append("---")
        lines.append("")

    # Compute topological ordering for task execution
    sorted_node_ids = _topological_sort(nodes, depends_on_edges)
    node_order = {nid: idx for idx, nid in enumerate(sorted_node_ids)}

    # Section 1: Execution Order (topologically sorted)
    lines.append("## Execution Order")
    lines.append("")
    lines.append(
        "Tasks ordered by dependencies (topological sort on `depends_on` relationships):"
    )
    lines.append("")

    selection_set = set(selection)

    for idx, node_id in enumerate(sorted_node_ids, 1):
        node = next((n for n in nodes if n["id"] == node_id), None)
        if not node:
            continue

        # Mark selected nodes prominently
        marker = "🎯 " if node_id in selection_set else ""
        lines.append(f"{idx}. {marker}**{node['title']}** (`{node['id']}`)")

        # Show immediate dependencies
        deps = [e["from"] for e in depends_on_edges if e["to"] == node_id]
        if deps:
            dep_titles = []
            for dep_id in deps:
                dep_node = next((n for n in nodes if n["id"] == dep_id), None)
                dep_title = dep_node["title"] if dep_node else dep_id
                dep_titles.append(dep_title)
            lines.append(f"   - **Depends on:** {', '.join(dep_titles)}")

    lines.append("")
    lines.append("---")
    lines.append("")

    # Section 2: Selected Nodes (starting points with full details)
    lines.append("## Selected Nodes (Details)")
    lines.append("")

    # Sort selected nodes by topological order
    selected_nodes = [n for n in nodes if n["id"] in selection_set]
    selected_nodes.sort(key=lambda n: node_order.get(n["id"], float("inf")))

    for node in selected_nodes:
        lines.append(f"### {node['title']} ({node['type']})")
        lines.append("")
        lines.append(f"- **ID:** `{node['id']}`")
        lines.append(f"- **Status:** {node['status']}")
        if node.get("priority"):
            lines.append(f"- **Priority:** {node['priority']}")
        if node.get("tags"):
            lines.append(f"- **Tags:** {', '.join(node['tags'])}")

        # Show dependency information
        deps = [e["from"] for e in depends_on_edges if e["to"] == node["id"]]
        if deps:
            lines.append("")
            lines.append("**Dependencies:**")
            lines.append("")
            for dep_id in deps:
                dep_node = next((n for n in nodes if n["id"] == dep_id), None)
                dep_title = dep_node["title"] if dep_node else dep_id
                lines.append(f"- {dep_title} (`{dep_id}`)")

        # Show reverse dependencies (what depends on this)
        dependents = [e["to"] for e in depends_on_edges if e["from"] == node["id"]]
        if dependents:
            lines.append("")
            lines.append("**Blocks:**")
            lines.append("")
            for dependent_id in dependents:
                dependent_node = next(
                    (n for n in nodes if n["id"] == dependent_id), None
                )
                dependent_title = (
                    dependent_node["title"] if dependent_node else dependent_id
                )
                lines.append(f"- {dependent_title} (`{dependent_id}`)")

        if node.get("acceptance_criteria"):
            lines.append("")
            lines.append("**Acceptance Criteria:**")
            lines.append("")
            for criterion in node["acceptance_criteria"]:
                lines.append(f"- {criterion}")
        lines.append("")

    # Section 3: Related Nodes (discovered via traversal)
    related_nodes = [n for n in nodes if n["id"] not in selection_set]

    if related_nodes:
        lines.append("## Related Nodes")
        lines.append("")

        # Sort by topological order
        related_nodes.sort(key=lambda n: node_order.get(n["id"], float("inf")))

        for node in related_nodes:
            lines.append(f"### {node['title']} ({node['type']})")
            lines.append("")
            lines.append(f"- **ID:** `{node['id']}`")
            lines.append(f"- **Status:** {node['status']}")
            if node.get("priority"):
                lines.append(f"- **Priority:** {node['priority']}")

            # Show dependency information
            deps = [e["from"] for e in depends_on_edges if e["to"] == node["id"]]
            if deps:
                lines.append("")
                lines.append("**Dependencies:**")
                lines.append("")
                for dep_id in deps:
                    dep_node = next((n for n in nodes if n["id"] == dep_id), None)
                    dep_title = dep_node["title"] if dep_node else dep_id
                    lines.append(f"- {dep_title} (`{dep_id}`)")

            if node.get("acceptance_criteria"):
                lines.append("")
                lines.append("**Acceptance Criteria:**")
                lines.append("")
                for criterion in node["acceptance_criteria"]:
                    lines.append(f"- {criterion}")
            lines.append("")

    # Section 4: Relationship Graph (all relationship types)
    if edges:
        lines.append("## Relationship Graph")
        lines.append("")

        # Group edges by type
        edges_by_type = {}
        for edge in edges:
            edge_type = edge["type"]
            if edge_type not in edges_by_type:
                edges_by_type[edge_type] = []
            edges_by_type[edge_type].append(edge)

        for rel_type in sorted(edges_by_type.keys()):
            lines.append(f"### {rel_type}")
            lines.append("")

            for edge in edges_by_type[rel_type]:
                # Find node titles for readability
                from_node = next((n for n in nodes if n["id"] == edge["from"]), None)
                to_node = next((n for n in nodes if n["id"] == edge["to"]), None)

                from_title = from_node["title"] if from_node else edge["from"]
                to_title = to_node["title"] if to_node else edge["to"]

                lines.append(f"- **{from_title}** → **{to_title}**")

            lines.append("")

    # Section 5: Summary Statistics
    lines.append("## Summary")
    lines.append("")

    status_counts = {}
    type_counts = {}

    for node in nodes:
        status = node["status"]
        node_type = node["type"]

        status_counts[status] = status_counts.get(status, 0) + 1
        type_counts[node_type] = type_counts.get(node_type, 0) + 1

    lines.append("**By Status:**")
    lines.append("")
    for status in sorted(status_counts.keys()):
        lines.append(f"- {status}: {status_counts[status]}")
    lines.append("")

    lines.append("**By Type:**")
    lines.append("")
    for node_type in sorted(type_counts.keys()):
        lines.append(f"- {node_type}: {type_counts[node_type]}")
    lines.append("")

    lines.append("**Dependencies:**")
    lines.append("")
    lines.append(f"- Total `depends_on` edges: {len(depends_on_edges)}")
    lines.append(f"- Cycles detected: {len(cycle_result.cycles)}")
    lines.append("")

    return "\n".join(lines)
