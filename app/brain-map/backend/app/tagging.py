"""Auto-tagging suggestions using keyword extraction.

This module provides tag suggestions for nodes based on text analysis.
Uses simple keyword extraction with term frequency scoring.
"""

import re
from collections import Counter
from typing import List


# Common English stopwords to filter out
STOPWORDS = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
    "all",
    "each",
    "every",
    "both",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "s",
    "t",
}


def extract_keywords(text: str, max_keywords: int = 10) -> List[str]:
    """Extract keywords from text using term frequency.

    Args:
        text: Text content to analyze.
        max_keywords: Maximum number of keywords to return.

    Returns:
        List of keyword strings, sorted by relevance.
    """
    if not text or not text.strip():
        return []

    # Normalize text: lowercase and extract words
    text_lower = text.lower()

    # Extract words (alphanumeric sequences, including hyphens and underscores)
    words = re.findall(r"\b[a-z0-9_-]+\b", text_lower)

    # Filter stopwords and short words
    filtered_words = [word for word in words if word not in STOPWORDS and len(word) > 2]

    # Count term frequency
    word_counts = Counter(filtered_words)

    # Get top keywords by frequency
    top_keywords = [word for word, _count in word_counts.most_common(max_keywords)]

    return top_keywords


def suggest_tags(title: str, body: str, existing_tags: List[str] = None) -> List[str]:
    """Suggest tags for a node based on title and body text.

    Args:
        title: Node title.
        body: Node body text (markdown).
        existing_tags: Tags already assigned to the node.

    Returns:
        List of suggested tag strings (excluding existing tags).
    """
    existing_tags = existing_tags or []
    existing_tags_lower = {tag.lower() for tag in existing_tags}

    # Weight title keywords higher (appear twice in combined text)
    combined_text = f"{title} {title} {body}"

    # Extract keywords
    keywords = extract_keywords(combined_text, max_keywords=15)

    # Filter out existing tags (case-insensitive)
    suggestions = [
        keyword for keyword in keywords if keyword not in existing_tags_lower
    ]

    # Return top 5 suggestions
    return suggestions[:5]
