#!/usr/bin/env python3
"""
Extract quiz scenarios from skill markdown files.

Parses skill files for problem/scenario sections and their solutions,
outputting JSON for use in interactive quiz tools.
"""

import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Optional


def extract_section(content: str, header_pattern: str) -> Optional[str]:
    """
    Extract content between a header and the next header of same or higher level.

    Args:
        content: Full markdown content
        header_pattern: Regex pattern for the section header (e.g., r'^## When to Use')

    Returns:
        Section content without the header, or None if not found
    """
    # Find the section start
    match = re.search(header_pattern, content, re.MULTILINE | re.IGNORECASE)
    if not match:
        return None

    start_pos = match.end()

    # Find next header of same or higher level
    # If section is "## Foo", look for next ^##? (could be # or ##)
    header_level = len(re.match(r"^(#+)", match.group()).group(1))
    next_header_pattern = rf"^#{{{1},{header_level}}} "

    remaining_content = content[start_pos:]
    next_match = re.search(next_header_pattern, remaining_content, re.MULTILINE)

    if next_match:
        section_content = remaining_content[: next_match.start()]
    else:
        section_content = remaining_content

    return section_content.strip()


def parse_skill_file(file_path: Path) -> Optional[Dict[str, str]]:
    """
    Parse a skill markdown file for quiz-worthy content.

    Extracts:
    - "When to Use" / "When to Use It" sections as scenarios
    - "Problem" sections as scenarios
    - "Quick Reference" as solution hints
    - "Purpose" as solution context

    Args:
        file_path: Path to the skill markdown file

    Returns:
        Dict with 'skill', 'scenario', 'solution' keys, or None if no valid scenario
    """
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"Error reading {file_path}: {e}", file=sys.stderr)
        return None

    # Try to find scenario content (problem statement)
    scenario = None
    for pattern in [r"^## When to Use", r"^## Problem", r"^## Overview"]:
        scenario = extract_section(content, pattern)
        if scenario:
            break

    if not scenario:
        return None

    # Try to find solution content (what to do about it)
    solution = None
    for pattern in [r"^## Quick Reference$", r"^## Details$", r"^## Purpose$"]:
        solution = extract_section(content, pattern)
        if solution:
            break

    if not solution:
        return None

    # Truncate if too long (quiz should be quick)
    if len(scenario) > 800:
        scenario = scenario[:800] + "..."
    if len(solution) > 1200:
        solution = solution[:1200] + "..."

    # Use absolute path, then make relative to current directory if possible
    try:
        skill_path = file_path.relative_to(Path.cwd())
    except ValueError:
        skill_path = file_path

    return {"skill": str(skill_path), "scenario": scenario, "solution": solution}


def extract_scenarios(skill_dir: Path = Path("skills")) -> List[Dict[str, str]]:
    """
    Extract all quiz scenarios from skill files.

    Args:
        skill_dir: Root directory containing skill files (default: skills/)

    Returns:
        List of scenario dicts with 'skill', 'scenario', 'solution' keys
    """
    scenarios = []

    # Find all markdown files in skills directory
    for md_file in skill_dir.rglob("*.md"):
        # Skip index files and READMEs (usually just lists)
        if md_file.name.lower() in ["index.md", "readme.md", "summary.md"]:
            continue

        result = parse_skill_file(md_file)
        if result:
            scenarios.append(result)

    return scenarios


def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        target_path = Path(sys.argv[1])
    else:
        target_path = Path("skills")

    if not target_path.exists():
        print(f"Error: Path '{target_path}' does not exist", file=sys.stderr)
        sys.exit(1)

    # If single file, parse just that file
    if target_path.is_file():
        result = parse_skill_file(target_path)
        scenarios = [result] if result else []
    else:
        # If directory, extract from all files in directory
        scenarios = extract_scenarios(target_path)

    # Output JSON
    print(json.dumps(scenarios, indent=2, ensure_ascii=False))

    # Print stats to stderr
    print(f"\nExtracted {len(scenarios)} quiz scenarios", file=sys.stderr)


if __name__ == "__main__":
    main()
