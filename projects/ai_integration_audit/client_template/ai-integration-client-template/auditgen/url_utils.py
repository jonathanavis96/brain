"""Small URL helpers (stdlib only)."""

from __future__ import annotations

from urllib.parse import urljoin, urlparse


def same_origin(base_url: str, other_url: str) -> bool:
    try:
        b = urlparse(base_url)
        o = urlparse(other_url)
    except Exception:
        return False

    if not b.scheme or not b.netloc:
        return False
    if not o.scheme or not o.netloc:
        return False

    return (b.scheme, b.netloc) == (o.scheme, o.netloc)


def absolutize(base_url: str, href: str) -> str:
    return urljoin(base_url, href)
