#!/usr/bin/env python3
"""extract_links.py - Extract internal markdown links from skill files

Parses all skills/**/*.md files for internal markdown links and outputs JSON
showing the dependency graph between skill files.

Usage:
    python3 tools/skill_graph/extract_links.py [--output OUTPUT.json]

Output Format:
    [
        {
            "source": "skills/domains/code-quality/testing-patterns.md",
            "targets": [
                "skills/domains/backend/error-handling-patterns.md",
                "skills/domains/code-quality/code-hygiene.md"
            ]
        },
        ...
    ]
"""

import argparse
import json
import re
from pathlib import Path
from typing import List, Dict


def find_skill_files(brain_root: Path) -> List[Path]:
    """Find all markdown files in skills/ directory."""
    skills_dir = brain_root / "skills"
    if not skills_dir.exists():
        raise FileNotFoundError(f"Skills directory not found: {skills_dir}")

    # Find all .md files recursively
    md_files = list(skills_dir.rglob("*.md"))
    return sorted(md_files)


def extract_markdown_links(file_path: Path, brain_root: Path) -> List[str]:
    """Extract internal markdown links from a file.

    Returns list of resolved absolute paths (relative to brain_root).
    """
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}")
        return []

    # Regex for markdown links: [text](url)
    # Capture the URL part, excluding anchors (#section)
    link_pattern = r"\[([^\]]+)\]\(([^)]+)\)"
    links = []

    for match in re.finditer(link_pattern, content):
        url = match.group(2)

        # Skip external links (http://, https://, mailto:, etc.)
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", url):
            continue

        # Remove anchor fragments (#section)
        url = url.split("#")[0]

        # Skip empty links (pure anchors like [text](#section))
        if not url:
            continue

        # Resolve relative path from the source file's directory
        source_dir = file_path.parent
        target_path = (source_dir / url).resolve()

        # Only include if target is within brain_root
        try:
            relative_target = target_path.relative_to(brain_root)
            links.append(str(relative_target))
        except ValueError:
            # Target is outside brain_root, skip it
            continue

    return links


def build_link_graph(brain_root: Path) -> List[Dict[str, any]]:
    """Build dependency graph of skill files."""
    skill_files = find_skill_files(brain_root)
    graph = []

    for skill_file in skill_files:
        # Get relative path from brain_root
        try:
            relative_source = skill_file.relative_to(brain_root)
        except ValueError:
            continue

        # Extract links from this file
        targets = extract_markdown_links(skill_file, brain_root)

        # Only include files that have links
        if targets:
            graph.append(
                {
                    "source": str(relative_source),
                    "targets": sorted(list(set(targets))),  # Remove duplicates, sort
                }
            )

    return graph


def main():
    parser = argparse.ArgumentParser(
        description="Extract internal markdown links from skill files"
    )
    parser.add_argument(
        "--output", "-o", help="Output JSON file (default: stdout)", default=None
    )

    args = parser.parse_args()

    # Find brain root (tools/skill_graph/../../)
    script_dir = Path(__file__).parent
    brain_root = (script_dir / "../..").resolve()

    # Build link graph
    graph = build_link_graph(brain_root)

    # Output
    json_output = json.dumps(graph, indent=2)

    if args.output:
        output_path = Path(args.output)
        output_path.write_text(json_output, encoding="utf-8")
        print(f"Link graph written to {args.output}", flush=True)
        print(f"Found {len(graph)} skill files with links", flush=True)
    else:
        print(json_output)


if __name__ == "__main__":
    main()
