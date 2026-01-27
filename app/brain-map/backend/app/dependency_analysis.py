"""Dependency analysis utilities for Brain Map.

Provides cycle detection and critical path analysis for relationship graphs.
"""

from typing import Dict, List, Set
import sqlite3


class CycleDetectionResult:
    """Result of cycle detection analysis."""

    def __init__(self):
        self.has_cycles = False
        self.cycles: List[List[str]] = []  # List of cycles, each is a list of node IDs
        self.self_loops: List[str] = []  # Nodes with self-referencing edges

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "has_cycles": self.has_cycles,
            "cycles": self.cycles,
            "self_loops": self.self_loops,
            "cycle_count": len(self.cycles),
            "self_loop_count": len(self.self_loops),
        }


def detect_cycles(
    conn: sqlite3.Connection, relationship_types: List[str] | None = None
) -> CycleDetectionResult:
    """Detect cycles in the dependency graph.

    Uses depth-first search to detect cycles in the directed graph formed by
    relationship edges. Focuses on 'depends_on' relationships by default.

    Args:
        conn: SQLite connection to index database.
        relationship_types: Relationship types to analyze (default: ['depends_on']).

    Returns:
        CycleDetectionResult with detected cycles and diagnostics.
    """
    if relationship_types is None:
        relationship_types = ["depends_on"]

    result = CycleDetectionResult()
    cursor = conn.cursor()

    # Fetch all edges of specified types
    placeholders = ",".join("?" * len(relationship_types))
    edges_sql = f"""
        SELECT source_id, target_id, relationship_type
        FROM edges
        WHERE relationship_type IN ({placeholders})
    """
    cursor.execute(edges_sql, relationship_types)
    edge_rows = cursor.fetchall()

    # Build adjacency list
    adjacency: Dict[str, List[str]] = {}
    all_nodes: Set[str] = set()

    for row in edge_rows:
        source = row["source_id"]
        target = row["target_id"]

        # Detect self-loops
        if source == target:
            result.self_loops.append(source)
            result.has_cycles = True
            continue

        all_nodes.add(source)
        all_nodes.add(target)

        if source not in adjacency:
            adjacency[source] = []
        adjacency[source].append(target)

    # DFS-based cycle detection
    # Track node states: WHITE (unvisited), GRAY (in current path), BLACK (finished)
    WHITE = 0
    GRAY = 1
    BLACK = 2

    state: Dict[str, int] = {node: WHITE for node in all_nodes}
    parent: Dict[str, str | None] = {node: None for node in all_nodes}

    def dfs_visit(node: str) -> None:
        """Visit node and detect cycles via back edges."""
        state[node] = GRAY

        neighbors = adjacency.get(node, [])
        for neighbor in neighbors:
            if state[neighbor] == WHITE:
                parent[neighbor] = node
                dfs_visit(neighbor)
            elif state[neighbor] == GRAY:
                # Back edge detected - we have a cycle
                cycle = _extract_cycle(node, neighbor, parent)
                result.cycles.append(cycle)
                result.has_cycles = True

        state[node] = BLACK

    # Run DFS from all unvisited nodes
    for node in all_nodes:
        if state[node] == WHITE:
            dfs_visit(node)

    return result


def _extract_cycle(
    current: str, back_target: str, parent: Dict[str, str | None]
) -> List[str]:
    """Extract cycle path from DFS traversal data.

    Args:
        current: Current node where back edge was detected.
        back_target: Target of back edge (node in GRAY state).
        parent: Parent pointers from DFS traversal.

    Returns:
        List of node IDs forming the cycle (in order).
    """
    cycle = [back_target]
    node = current

    # Walk back up the parent chain until we reach back_target
    while node != back_target and node is not None:
        cycle.append(node)
        node = parent.get(node)

    # Add back_target again to close the cycle
    cycle.append(back_target)

    # Reverse to get proper order (from back_target -> ... -> back_target)
    cycle.reverse()

    return cycle


def get_dependency_diagnostics(
    conn: sqlite3.Connection, node_ids: List[str] | None = None
) -> Dict:
    """Get comprehensive dependency diagnostics for nodes.

    Analyzes dependency relationships and provides:
    - Cycle detection
    - Incoming/outgoing dependency counts
    - Critical path hints (nodes with most dependencies)

    Args:
        conn: SQLite connection to index database.
        node_ids: Specific nodes to analyze (None = all nodes).

    Returns:
        Dictionary with diagnostics including cycles, dependency counts, and hints.
    """
    cursor = conn.cursor()

    # Detect cycles in depends_on relationships
    cycle_result = detect_cycles(conn, ["depends_on"])

    # Count incoming and outgoing dependencies
    if node_ids:
        placeholders = ",".join("?" * len(node_ids))
        incoming_sql = f"""
            SELECT target_id as node_id, COUNT(*) as count
            FROM edges
            WHERE relationship_type = 'depends_on'
              AND target_id IN ({placeholders})
            GROUP BY target_id
        """
        outgoing_sql = f"""
            SELECT source_id as node_id, COUNT(*) as count
            FROM edges
            WHERE relationship_type = 'depends_on'
              AND source_id IN ({placeholders})
            GROUP BY source_id
        """
        params = node_ids
    else:
        incoming_sql = """
            SELECT target_id as node_id, COUNT(*) as count
            FROM edges
            WHERE relationship_type = 'depends_on'
            GROUP BY target_id
        """
        outgoing_sql = """
            SELECT source_id as node_id, COUNT(*) as count
            FROM edges
            WHERE relationship_type = 'depends_on'
            GROUP BY source_id
        """
        params = []

    # Get incoming dependencies (blockers)
    cursor.execute(incoming_sql, params)
    incoming_deps = {row["node_id"]: row["count"] for row in cursor.fetchall()}

    # Get outgoing dependencies (blocked tasks)
    cursor.execute(outgoing_sql, params)
    outgoing_deps = {row["node_id"]: row["count"] for row in cursor.fetchall()}

    # Identify critical path hints (nodes with high dependency counts)
    critical_nodes = []
    all_dep_nodes = set(incoming_deps.keys()) | set(outgoing_deps.keys())

    for node_id in all_dep_nodes:
        incoming_count = incoming_deps.get(node_id, 0)
        outgoing_count = outgoing_deps.get(node_id, 0)
        total_count = incoming_count + outgoing_count

        # Consider nodes with 3+ total dependencies as critical
        if total_count >= 3:
            critical_nodes.append(
                {
                    "node_id": node_id,
                    "incoming_dependencies": incoming_count,
                    "outgoing_dependencies": outgoing_count,
                    "total_dependencies": total_count,
                }
            )

    # Sort critical nodes by total dependencies (descending)
    critical_nodes.sort(key=lambda x: x["total_dependencies"], reverse=True)

    return {
        "cycles": cycle_result.to_dict(),
        "dependency_counts": {
            "incoming": incoming_deps,
            "outgoing": outgoing_deps,
        },
        "critical_path_hints": critical_nodes,
    }
