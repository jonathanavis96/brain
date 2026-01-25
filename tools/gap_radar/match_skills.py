#!/usr/bin/env python3
"""
Gap Radar - Skills Coverage Matcher

Matches error codes from extracted errors against skills that cover them.
Input: JSON from extract_errors.sh or extract_from_logs.sh
Output: JSON with coverage information (error_code, covered, skill)
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional


def load_skills_index(brain_root: Path) -> Dict[str, str]:
    """
    Parse skills/index.md to build error code → skill file mappings.

    Returns:
        Dict mapping error code (e.g., "SC2155") to skill file path
    """
    index_path = brain_root / "skills" / "index.md"
    if not index_path.exists():
        print(f"Error: skills/index.md not found at {index_path}", file=sys.stderr)
        return {}

    mappings = {}

    # Hard-coded mappings based on skill descriptions
    # These will be replaced by HTML comment tags in Phase 7.2.2
    skill_patterns = {
        # Shell patterns
        r"SC2034|SC2155|SC2086": "domains/languages/shell/variable-patterns.md",
        r"SC\d+": "domains/languages/shell/common-pitfalls.md",
        # Markdown patterns
        r"MD040|MD032|MD024|MD036|MD050": "domains/code-quality/markdown-patterns.md",
        # Python patterns
        r"ImportError|AttributeError|TypeError|NameError": "domains/languages/python/python-patterns.md",
    }

    for pattern, skill_file in skill_patterns.items():
        # Check if skill file exists
        skill_path = brain_root / "skills" / skill_file
        if skill_path.exists():
            mappings[pattern] = skill_file

    return mappings


def find_skill_for_error(
    error_code: str, skill_mappings: Dict[str, str]
) -> Optional[str]:
    """
    Find the skill file that covers a given error code.

    Args:
        error_code: Error code like "SC2155", "MD040", "ImportError"
        skill_mappings: Dict from load_skills_index()

    Returns:
        Skill file path if covered, None otherwise
    """
    for pattern, skill_file in skill_mappings.items():
        if re.search(pattern, error_code):
            return skill_file
    return None


def match_errors_to_skills(
    errors: List[Dict], skill_mappings: Dict[str, str]
) -> List[Dict]:
    """
    Match a list of errors to their covering skills.

    Args:
        errors: List of error dicts with at least {"error_code": "..."}
        skill_mappings: Dict from load_skills_index()

    Returns:
        List of dicts with added "covered" (bool) and "skill" (str or null) fields
    """
    results = []
    for error in errors:
        error_code = error.get("error_code", "")
        skill_file = find_skill_for_error(error_code, skill_mappings)

        result = {
            **error,
            "covered": skill_file is not None,
            "skill": skill_file if skill_file else None,
        }
        results.append(result)

    return results


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: match_skills.py <errors.json>", file=sys.stderr)
        print("", file=sys.stderr)
        print(
            "Reads error JSON from extract_errors.sh or extract_from_logs.sh",
            file=sys.stderr,
        )
        print("and outputs JSON with coverage information.", file=sys.stderr)
        sys.exit(1)

    input_file = Path(sys.argv[1])
    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}", file=sys.stderr)
        sys.exit(1)

    # Find brain root (assuming tools/gap_radar/match_skills.py location)
    brain_root = Path(__file__).parent.parent.parent

    # Load skills mappings
    skill_mappings = load_skills_index(brain_root)
    if not skill_mappings:
        print(
            "Warning: No skill mappings found. All errors will show as uncovered.",
            file=sys.stderr,
        )

    # Load input errors
    try:
        with input_file.open() as f:
            errors = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {input_file}: {e}", file=sys.stderr)
        sys.exit(1)

    if not isinstance(errors, list):
        print(
            f"Error: Expected JSON array, got {type(errors).__name__}", file=sys.stderr
        )
        sys.exit(1)

    # Match errors to skills
    results = match_errors_to_skills(errors, skill_mappings)

    # Output results
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
