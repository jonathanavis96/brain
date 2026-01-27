#!/usr/bin/env python3
"""
analyze_commits.py - Group commits by keyword similarity and suggest skills

Part of Brain self-improvement: analyze patterns from mine_patterns.sh to
discover recurring themes that could become new skills.

Usage:
    bash mine_patterns.sh | python3 analyze_commits.py
    bash mine_patterns.sh 30 | python3 analyze_commits.py --min-freq 3
"""

import sys
import re
from collections import defaultdict
from typing import Dict, List, Tuple
import argparse


# Keywords to extract from commit messages
# Organized by category for better skill suggestions
KEYWORD_PATTERNS = {
    "technology": [
        r"\b(docker|kubernetes|k8s|helm|terraform|ansible)\b",
        r"\b(react|vue|angular|svelte|nextjs)\b",
        r"\b(postgres|mysql|mongodb|redis|elasticsearch)\b",
        r"\b(graphql|rest|api|grpc|websocket)\b",
        r"\b(aws|azure|gcp|cloud|lambda)\b",
        r"\b(nginx|apache|caddy|traefik)\b",
    ],
    "operation": [
        r"\b(fix|bug|error|issue|crash|fail)\b",
        r"\b(refactor|cleanup|simplify|optimize)\b",
        r"\b(add|create|implement|feature)\b",
        r"\b(update|upgrade|migrate|bump)\b",
        r"\b(test|testing|coverage|spec)\b",
        r"\b(deploy|deployment|ci|cd|pipeline)\b",
        r"\b(security|auth|authentication|authorization)\b",
        r"\b(performance|cache|caching|speed)\b",
        r"\b(logging|monitoring|observability|metrics)\b",
    ],
    "domain": [
        r"\b(cors|csrf|xss|injection)\b",
        r"\b(rate.?limit|throttle|quota)\b",
        r"\b(validation|sanitize|escape)\b",
        r"\b(retry|timeout|backoff|circuit.?breaker)\b",
        r"\b(pagination|cursor|offset|limit)\b",
        r"\b(webhook|callback|event)\b",
        r"\b(email|notification|alert)\b",
        r"\b(file.?upload|storage|s3|blob)\b",
    ],
}


def extract_keywords(message: str) -> List[Tuple[str, str]]:
    """Extract keywords from commit message.

    Returns list of (category, keyword) tuples.
    """
    message_lower = message.lower()
    keywords = []

    for category, patterns in KEYWORD_PATTERNS.items():
        for pattern in patterns:
            matches = re.findall(pattern, message_lower, re.IGNORECASE)
            for match in matches:
                keywords.append((category, match))

    return keywords


def normalize_keyword(keyword: str) -> str:
    """Normalize keyword variations to canonical form."""
    # Common normalizations
    normalizations = {
        "k8s": "kubernetes",
        "nextjs": "next.js",
        "rate limit": "rate-limit",
        "rate limiting": "rate-limit",
        "circuit breaker": "circuit-breaker",
        "file upload": "file-upload",
    }

    normalized = keyword.lower().strip()
    return normalizations.get(normalized, normalized)


def suggest_skill_name(keyword: str, category: str) -> str:
    """Suggest a skill filename based on keyword and category."""
    # Map categories to skill domains
    domain_map = {
        "technology": "languages",  # or infrastructure
        "operation": "code-quality",
        "domain": "backend",  # or infrastructure
    }

    domain = domain_map.get(category, "backend")
    keyword_slug = keyword.replace(" ", "-").replace(".", "-")

    return f"skills/domains/{domain}/{keyword_slug}-patterns.md"


def analyze_commits(lines: List[str], min_frequency: int = 2) -> Dict[str, List[str]]:
    """Analyze commit messages and group by keyword frequency.

    Args:
        lines: Raw commit message lines from mine_patterns.sh
        min_frequency: Minimum frequency to include in suggestions

    Returns:
        Dictionary mapping keywords to example commit messages
    """
    keyword_commits = defaultdict(list)
    keyword_categories = {}

    for line in lines:
        line = line.strip()
        if not line:
            continue

        keywords = extract_keywords(line)
        for category, keyword in keywords:
            normalized = normalize_keyword(keyword)
            keyword_commits[normalized].append(line)
            keyword_categories[normalized] = category

    # Filter by minimum frequency
    frequent_keywords = {
        kw: commits
        for kw, commits in keyword_commits.items()
        if len(commits) >= min_frequency
    }

    return frequent_keywords, keyword_categories


def format_suggestions(
    keyword_data: Dict[str, List[str]],
    keyword_categories: Dict[str, str],
    max_examples: int = 3,
) -> str:
    """Format analysis results as skill suggestions.

    Args:
        keyword_data: Dictionary mapping keywords to commit messages
        keyword_categories: Dictionary mapping keywords to categories
        max_examples: Maximum example commits to show per keyword

    Returns:
        Formatted output string
    """
    output = []
    output.append("=" * 80)
    output.append("PATTERN ANALYSIS - Skill Suggestions")
    output.append("=" * 80)
    output.append("")

    # Sort by frequency (descending)
    sorted_keywords = sorted(
        keyword_data.items(), key=lambda x: len(x[1]), reverse=True
    )

    for keyword, commits in sorted_keywords:
        category = keyword_categories.get(keyword, "unknown")
        frequency = len(commits)
        skill_path = suggest_skill_name(keyword, category)

        output.append(f"Keyword: {keyword.upper()}")
        output.append(f"Frequency: {frequency} mentions")
        output.append(f"Category: {category}")
        output.append(f"Suggested skill: {skill_path}")
        output.append("")

        # Show example commits
        output.append("Example commits:")
        for i, commit in enumerate(commits[:max_examples], 1):
            # Truncate long messages
            commit_short = commit[:100] + "..." if len(commit) > 100 else commit
            output.append(f"  {i}. {commit_short}")

        if len(commits) > max_examples:
            output.append(f"  ... and {len(commits) - max_examples} more")

        output.append("")
        output.append("-" * 80)
        output.append("")

    # Summary
    output.append(f"SUMMARY: Found {len(sorted_keywords)} recurring patterns")
    output.append(
        f"Total commits analyzed: {sum(len(c) for c in keyword_data.values())}"
    )
    output.append("")

    return "\n".join(output)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Analyze commit patterns and suggest skills",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  bash mine_patterns.sh | python3 analyze_commits.py
  bash mine_patterns.sh 30 | python3 analyze_commits.py --min-freq 3
  bash mine_patterns.sh | python3 analyze_commits.py --max-examples 5
""",
    )
    parser.add_argument(
        "--min-freq",
        type=int,
        default=2,
        help="Minimum frequency to include keyword (default: 2)",
    )
    parser.add_argument(
        "--max-examples",
        type=int,
        default=3,
        help="Maximum example commits to show (default: 3)",
    )

    args = parser.parse_args()

    # Read commits from stdin
    lines = sys.stdin.readlines()

    if not lines:
        print(
            "Error: No input provided. Pipe output from mine_patterns.sh",
            file=sys.stderr,
        )
        print(
            "Example: bash mine_patterns.sh | python3 analyze_commits.py",
            file=sys.stderr,
        )
        sys.exit(1)

    # Analyze
    keyword_data, keyword_categories = analyze_commits(lines, args.min_freq)

    if not keyword_data:
        print(
            f"No patterns found with minimum frequency {args.min_freq}", file=sys.stderr
        )
        print("Try lowering --min-freq value", file=sys.stderr)
        sys.exit(0)

    # Output results
    output = format_suggestions(keyword_data, keyword_categories, args.max_examples)
    print(output)


if __name__ == "__main__":
    main()
