#!/usr/bin/env python3
"""
Gap Radar - Coverage Report Generator

Generates coverage summary from matched errors (output of match_skills.py).
Shows total errors, coverage percentage, and top uncovered error codes.
Output is markdown-formatted for inclusion in GAP_BACKLOG.md or standalone reports.
"""

import json
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Dict, List


def calculate_coverage_stats(results: List[Dict]) -> Dict:
    """
    Calculate coverage statistics from matched results.

    Args:
        results: List of dicts from match_skills.py with "covered" field

    Returns:
        Dict with stats: total, covered, uncovered, coverage_pct, top_uncovered
    """
    total = len(results)
    covered = sum(1 for r in results if r.get("covered", False))
    uncovered = total - covered

    coverage_pct = (covered / total * 100) if total > 0 else 0.0

    # Count uncovered error codes
    uncovered_codes = [r["error_code"] for r in results if not r.get("covered", False)]
    top_uncovered = Counter(uncovered_codes).most_common(10)

    return {
        "total": total,
        "covered": covered,
        "uncovered": uncovered,
        "coverage_pct": coverage_pct,
        "top_uncovered": top_uncovered,
    }


def generate_markdown_report(stats: Dict, results: List[Dict]) -> str:
    """
    Generate markdown-formatted coverage report.

    Args:
        stats: Coverage statistics from calculate_coverage_stats()
        results: Full matched results for detail sections

    Returns:
        Markdown string ready for output
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    report = f"""# Gap Radar Coverage Report

**Generated:** {timestamp}

## Summary

| Metric | Value |
| ------ | ----- |
| Total Errors | {stats['total']} |
| Covered by Skills | {stats['covered']} |
| Uncovered | {stats['uncovered']} |
| Coverage % | {stats['coverage_pct']:.1f}% |

"""

    if stats["top_uncovered"]:
        report += """## Top Uncovered Error Codes

These error codes appear most frequently but are not covered by any skill:

| Error Code | Count | Example File |
| ---------- | ----- | ------------ |
"""
        for error_code, count in stats["top_uncovered"]:
            # Find first example file for this error code
            example = next(
                (
                    r.get("file", "N/A")
                    for r in results
                    if r["error_code"] == error_code
                ),
                "N/A",
            )
            report += f"| `{error_code}` | {count} | `{example}` |\n"
        report += "\n"

    # Add coverage breakdown by category
    report += """## Coverage by Category

"""
    categories = {}
    for result in results:
        error_code = result["error_code"]
        # Categorize by prefix (SC, MD, E, F, etc.)
        if error_code.startswith("SC"):
            category = "ShellCheck"
        elif error_code.startswith("MD"):
            category = "Markdownlint"
        elif error_code.startswith(("E", "F", "W")):
            category = "Python (Pylint/Flake8)"
        else:
            category = "Other"

        if category not in categories:
            categories[category] = {"total": 0, "covered": 0}

        categories[category]["total"] += 1
        if result.get("covered", False):
            categories[category]["covered"] += 1

    report += "| Category | Covered | Total | Coverage % |\n"
    report += "| -------- | ------- | ----- | ---------- |\n"
    for category, counts in sorted(categories.items()):
        pct = counts["covered"] / counts["total"] * 100 if counts["total"] > 0 else 0.0
        report += (
            f"| {category} | {counts['covered']} | {counts['total']} | {pct:.1f}% |\n"
        )

    report += "\n"

    # Add recommendations section
    if stats["uncovered"] > 0:
        report += """## Recommendations

Based on this analysis, consider creating skills for the following:

"""
        # Group uncovered by category
        uncovered_by_category = {}
        for result in results:
            if not result.get("covered", False):
                error_code = result["error_code"]
                if error_code.startswith("SC"):
                    category = "Shell"
                elif error_code.startswith("MD"):
                    category = "Markdown"
                elif error_code.startswith(("E", "F", "W")):
                    category = "Python"
                else:
                    category = "Other"

                if category not in uncovered_by_category:
                    uncovered_by_category[category] = []
                uncovered_by_category[category].append(error_code)

        for category, codes in sorted(uncovered_by_category.items()):
            unique_codes = sorted(set(codes))[:5]  # Top 5 per category
            report += f"- **{category}:** {', '.join(f'`{c}`' for c in unique_codes)}\n"

        report += "\n"

    return report


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: coverage_report.py <matched_errors.json>", file=sys.stderr)
        print("", file=sys.stderr)
        print(
            "Reads JSON from match_skills.py and generates markdown coverage report.",
            file=sys.stderr,
        )
        sys.exit(1)

    input_file = Path(sys.argv[1])
    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}", file=sys.stderr)
        sys.exit(1)

    # Load matched results
    try:
        with input_file.open() as f:
            results = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {input_file}: {e}", file=sys.stderr)
        sys.exit(1)

    if not isinstance(results, list):
        print(
            f"Error: Expected JSON array, got {type(results).__name__}", file=sys.stderr
        )
        sys.exit(1)

    if not results:
        print("Warning: No errors to analyze (empty input)", file=sys.stderr)
        print("\n# Gap Radar Coverage Report\n\n**Status:** No errors found\n")
        sys.exit(0)

    # Calculate stats and generate report
    stats = calculate_coverage_stats(results)
    report = generate_markdown_report(stats, results)

    print(report)


if __name__ == "__main__":
    main()
