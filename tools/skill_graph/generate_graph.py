#!/usr/bin/env python3
"""generate_graph.py - Convert skill link JSON to DOT format graph

Reads JSON output from extract_links.py and generates a Graphviz DOT format
graph showing dependencies between skill files.

Usage:
    python3 tools/skill_graph/generate_graph.py [--input INPUT.json]
    python3 tools/skill_graph/extract_links.py | python3 tools/skill_graph/generate_graph.py

Output:
    Valid DOT format graph to stdout that can be rendered with Graphviz tools

Example:
    python3 tools/skill_graph/extract_links.py | python3 tools/skill_graph/generate_graph.py > skills.dot
    dot -Tpng skills.dot > skills.png
"""

import argparse
import json
import sys
from pathlib import Path
from typing import List, Dict, Set


def sanitize_node_id(path: str) -> str:
    """Convert file path to valid DOT node identifier.

    Removes extensions, replaces special chars with underscores.
    """
    # Remove .md extension
    node_id = path.replace(".md", "")
    # Replace path separators and special chars
    node_id = node_id.replace("/", "_").replace("-", "_").replace(".", "_")
    return node_id


def get_display_label(path: str) -> str:
    """Generate readable label for node from file path.

    Shows just the filename without extension.
    """
    return Path(path).stem


def get_node_color(path: str) -> str:
    """Assign color based on skill category."""
    if "domains/code-quality" in path:
        return "lightblue"
    elif "domains/backend" in path:
        return "lightgreen"
    elif "domains/frontend" in path:
        return "lightyellow"
    elif "domains/infrastructure" in path:
        return "lightcoral"
    elif "domains/languages" in path:
        return "lightgray"
    elif "domains/ralph" in path:
        return "orange"
    elif "domains/marketing" in path:
        return "pink"
    elif "domains/websites" in path:
        return "lavender"
    elif "projects/" in path:
        return "lightcyan"
    elif "playbooks/" in path:
        return "wheat"
    elif "self-improvement/" in path:
        return "palegreen"
    else:
        return "white"


def generate_dot_graph(graph_data: List[Dict[str, any]]) -> str:
    """Convert JSON graph data to DOT format."""
    lines = [
        "digraph skill_dependencies {",
        "  rankdir=LR;",
        "  node [shape=box, style=filled];",
        "  edge [color=gray];",
        "",
    ]

    # Collect all nodes (sources and targets)
    all_nodes: Set[str] = set()
    for entry in graph_data:
        source = entry["source"]
        all_nodes.add(source)
        for target in entry["targets"]:
            all_nodes.add(target)

    # Generate node declarations with colors
    lines.append("  // Node definitions")
    for node_path in sorted(all_nodes):
        node_id = sanitize_node_id(node_path)
        label = get_display_label(node_path)
        color = get_node_color(node_path)
        lines.append(f'  {node_id} [label="{label}", fillcolor={color}];')

    lines.append("")
    lines.append("  // Edges")

    # Generate edges
    for entry in graph_data:
        source = entry["source"]
        source_id = sanitize_node_id(source)

        for target in entry["targets"]:
            target_id = sanitize_node_id(target)
            lines.append(f"  {source_id} -> {target_id};")

    lines.append("}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Convert skill link JSON to DOT format graph"
    )
    parser.add_argument(
        "--input", "-i", help="Input JSON file (default: stdin)", default=None
    )

    args = parser.parse_args()

    # Read JSON input
    if args.input:
        input_path = Path(args.input)
        if not input_path.exists():
            print(f"Error: Input file not found: {args.input}", file=sys.stderr)
            sys.exit(1)
        json_data = input_path.read_text(encoding="utf-8")
    else:
        # Read from stdin
        json_data = sys.stdin.read()

    # Parse JSON
    try:
        graph_data = json.loads(json_data)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)

    # Generate DOT output
    dot_output = generate_dot_graph(graph_data)
    print(dot_output)


if __name__ == "__main__":
    main()
