"""Actionable suggestions engine for Brain Map insights.

Analyzes graph health and generates user-friendly suggestions for improvement.
"""

from typing import Dict, List
from datetime import datetime, timezone


def generate_suggestions(
    orphan_nodes: List[Dict] | None = None,
    stale_nodes: List[Dict] | None = None,
    threshold_days: int = 90,
) -> List[Dict]:
    """Generate actionable suggestions based on graph analysis.

    Analyzes orphans, stale notes, and tag patterns to generate user-friendly
    suggestions like "Link these 3 orphans", "Update 5 stale notes", etc.

    Args:
        orphan_nodes: List of orphan nodes from get_orphan_nodes().
        stale_nodes: List of stale nodes from get_stale_nodes().
        threshold_days: Threshold for stale nodes (default 90 days).

    Returns:
        List of suggestion dictionaries with keys:
        - type: Suggestion category ("orphan", "stale", "duplicate_tags")
        - priority: "high", "medium", or "low"
        - title: Short title (e.g., "Link 3 orphan nodes")
        - description: Detailed explanation
        - action: Suggested action
        - nodes: List of node IDs related to this suggestion
    """
    from app.index import get_orphan_nodes, get_stale_nodes, get_index_connection
    import json

    suggestions = []

    # Fetch data if not provided
    if orphan_nodes is None:
        try:
            orphan_nodes = get_orphan_nodes()
        except Exception:
            orphan_nodes = []

    if stale_nodes is None:
        try:
            stale_nodes = get_stale_nodes(threshold_days=threshold_days)
        except Exception:
            stale_nodes = []

    # Suggestion 1: Orphan nodes
    if orphan_nodes:
        orphan_count = len(orphan_nodes)
        orphan_ids = [node["id"] for node in orphan_nodes[:5]]  # Top 5

        if orphan_count >= 10:
            priority = "high"
        elif orphan_count >= 5:
            priority = "medium"
        else:
            priority = "low"

        suggestions.append(
            {
                "type": "orphan",
                "priority": priority,
                "title": f"Link {orphan_count} orphan node{'s' if orphan_count != 1 else ''}",
                "description": f"Found {orphan_count} disconnected node{'s' if orphan_count != 1 else ''} with no relationships. Consider adding links to integrate {'them' if orphan_count != 1 else 'it'} into your knowledge graph.",
                "action": "Review and add relationships to connect these nodes",
                "nodes": orphan_ids,
            }
        )

    # Suggestion 2: Stale nodes
    if stale_nodes:
        stale_count = len(stale_nodes)
        stale_ids = [node["id"] for node in stale_nodes[:5]]  # Top 5 oldest

        if stale_count >= 20:
            priority = "medium"
        elif stale_count >= 10:
            priority = "low"
        else:
            priority = "low"

        suggestions.append(
            {
                "type": "stale",
                "priority": priority,
                "title": f"Update {stale_count} stale note{'s' if stale_count != 1 else ''}",
                "description": f"Found {stale_count} note{'s' if stale_count != 1 else ''} not updated in {threshold_days}+ days. Review for relevance or archive if no longer needed.",
                "action": f"Review nodes older than {threshold_days} days and update or archive",
                "nodes": stale_ids,
            }
        )

    # Suggestion 3: Duplicate/similar tags
    try:
        conn = get_index_connection()
        cursor = conn.cursor()

        # Get all tags and their frequencies
        cursor.execute("SELECT tags FROM nodes WHERE tags IS NOT NULL AND tags != '[]'")
        rows = cursor.fetchall()

        tag_counts: Dict[str, int] = {}
        for row in rows:
            try:
                tags = json.loads(row["tags"])
                for tag in tags:
                    tag_lower = tag.lower()
                    tag_counts[tag_lower] = tag_counts.get(tag_lower, 0) + 1
            except (json.JSONDecodeError, TypeError):
                continue

        # Find potential duplicates (case-insensitive, similar spelling)
        # Simple heuristic: tags that differ only in case or pluralization
        duplicates = {}
        seen_normalized = {}

        for tag, count in tag_counts.items():
            # Normalize: lowercase, remove trailing 's' for basic plural detection
            normalized = tag.rstrip("s") if len(tag) > 1 and tag.endswith("s") else tag

            if normalized in seen_normalized:
                # Found potential duplicate
                original = seen_normalized[normalized]
                if original not in duplicates:
                    duplicates[original] = []
                duplicates[original].append(tag)
            else:
                seen_normalized[normalized] = tag

        # Create suggestion if duplicates found
        if duplicates:
            duplicate_pairs = sum(len(variants) for variants in duplicates.values())

            suggestions.append(
                {
                    "type": "duplicate_tags",
                    "priority": "low",
                    "title": f"Merge {duplicate_pairs} duplicate tag{'s' if duplicate_pairs != 1 else ''}",
                    "description": f"Found {len(duplicates)} tag group{'s' if len(duplicates) != 1 else ''} with potential duplicates (case/plural variations). Standardize tags for better organization.",
                    "action": "Review and consolidate similar tags",
                    "nodes": [],  # Tag-level suggestion, not node-specific
                    "details": {
                        "examples": list(duplicates.items())[:3]
                    },  # Show top 3 examples
                }
            )

        conn.close()

    except Exception:
        # Index might not exist or query failed - skip duplicate tags suggestion
        pass

    # Sort suggestions by priority (high > medium > low)
    priority_order = {"high": 0, "medium": 1, "low": 2}
    suggestions.sort(key=lambda s: priority_order.get(s["priority"], 3))

    return suggestions
