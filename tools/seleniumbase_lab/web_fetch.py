"""SeleniumBase web fetch utility.

This is a small CLI for loading JS-heavy pages (Selenium renders the DOM) and extracting
useful artifacts.

Capabilities:
- Print page title / rendered HTML
- Extract text, attributes, and links using CSS selectors
- Emit a structured "research" JSON record (good for quick data gathering)
- Crawl up to N pages by following links (JSONL output)

Examples (from repo root):

  source tools/seleniumbase_lab/.venv/bin/activate

  # Title / HTML / screenshot
  python3 tools/seleniumbase_lab/web_fetch.py https://example.com --title
  python3 tools/seleniumbase_lab/web_fetch.py https://example.com --html > /tmp/page.html
  python3 tools/seleniumbase_lab/web_fetch.py https://example.com --screenshot-out /tmp/page.png

  # Extraction helpers
  python3 tools/seleniumbase_lab/web_fetch.py https://example.com --text "h1"
  python3 tools/seleniumbase_lab/web_fetch.py https://example.com --attr "a@href"
  python3 tools/seleniumbase_lab/web_fetch.py https://example.com --links

  # Research preset (JSON)
  python3 tools/seleniumbase_lab/web_fetch.py https://example.com --research

  # Crawl N pages (JSONL; one JSON object per visited page)
  python3 tools/seleniumbase_lab/web_fetch.py https://example.com --crawl 5 --crawl-out /tmp/crawl.jsonl

Note:
- Be mindful of target site Terms of Service and robots/policies.
"""

from __future__ import annotations

import argparse
import json
import os
import signal
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urljoin, urlparse

from selenium.webdriver.common.by import By
from seleniumbase import SB


@dataclass(frozen=True)
class ResearchRecord:
    url: str
    final_url: str
    title: str
    text: str
    links: list[str]


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="web_fetch",
        description=(
            "Fetch rendered page data using SeleniumBase (title/html/screenshot/extraction/research/crawl)."
        ),
    )
    p.add_argument("url", help="URL to open")

    p.add_argument("--headed", action="store_true", help="Run with visible browser window")
    p.add_argument(
        "--browser",
        default="chrome",
        choices=["chrome", "edge", "firefox"],
        help="Browser to use (default: chrome)",
    )
    p.add_argument(
        "--timeout",
        type=float,
        default=30.0,
        help="Page-load timeout in seconds (default: 30)",
    )
    p.add_argument(
        "--wait-seconds",
        type=float,
        default=0.0,
        help="Extra fixed sleep after load (default: 0)",
    )
    p.add_argument(
        "--wait-for-css",
        default=None,
        help="Wait until a CSS selector is visible before extracting outputs",
    )

    crawl = p.add_argument_group("crawl")
    crawl.add_argument(
        "--crawl",
        type=int,
        default=0,
        help="Crawl up to N pages by following links (default: 0 = off)",
    )
    crawl.add_argument(
        "--crawl-out",
        type=Path,
        default=None,
        help="Write crawl results as JSONL to this file (default: stdout)",
    )
    crawl.add_argument(
        "--allow-cross-domain",
        action="store_true",
        help="Allow crawl to follow cross-domain links (default: same-domain only)",
    )
    crawl.add_argument(
        "--max-links-per-page",
        type=int,
        default=25,
        help="Max number of links to enqueue per visited page (default: 25)",
    )

    out = p.add_argument_group("outputs")

    # Stdout modes: choose one.
    stdout_mode = out.add_mutually_exclusive_group()
    stdout_mode.add_argument("--title", action="store_true", help="Print page title")
    stdout_mode.add_argument(
        "--json",
        action="store_true",
        help="Print metadata as JSON (url/final_url/title)",
    )
    stdout_mode.add_argument("--html", action="store_true", help="Print rendered HTML to stdout")
    stdout_mode.add_argument(
        "--text",
        metavar="CSS",
        default=None,
        help="Print innerText for first match of CSS selector",
    )
    stdout_mode.add_argument(
        "--attr",
        metavar="CSS@ATTR",
        default=None,
        help="Print attribute for first match (format: 'css@attr', e.g. 'a@href')",
    )
    stdout_mode.add_argument(
        "--links",
        action="store_true",
        help="Print unique absolute links (one per line)",
    )
    stdout_mode.add_argument(
        "--research",
        action="store_true",
        help="Print a structured research JSON record (url/final_url/title/text/links)",
    )

    # File outputs (can be combined with any stdout mode).
    out.add_argument(
        "--html-out",
        type=Path,
        default=None,
        help="Write rendered HTML to this path",
    )
    out.add_argument(
        "--screenshot-out",
        type=Path,
        default=None,
        help="Write screenshot PNG to this path",
    )

    return p


def _ensure_parent_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _write_text(path: Path, text: str) -> None:
    _ensure_parent_dir(path)
    path.write_text(text, encoding="utf-8")


def _normalize_http_url(href: str | None) -> str | None:
    if not href:
        return None
    href = href.strip()
    if not href:
        return None
    if href.startswith("javascript:") or href.startswith("mailto:") or href.startswith("tel:"):
        return None
    parsed = urlparse(href)
    if parsed.scheme and parsed.scheme not in {"http", "https"}:
        return None
    return href


def _extract_links(sb: SB, base_url: str) -> list[str]:
    """Return unique absolute links from the current page."""
    # Prefer a JS snippet because it returns fully-resolved absolute URLs for <a>.href.
    hrefs = sb.driver.execute_script(
        "return Array.from(document.querySelectorAll('a[href]')).map(a => a.href);"
    )
    links: list[str] = []
    seen: set[str] = set()

    if isinstance(hrefs, list):
        for raw in hrefs:
            if not isinstance(raw, str):
                continue
            norm = _normalize_http_url(raw)
            if not norm:
                continue
            abs_url = urljoin(base_url, norm)
            if abs_url not in seen:
                seen.add(abs_url)
                links.append(abs_url)

    return links


def _extract_text(sb: SB, css: str) -> str:
    try:
        return sb.get_text(css) or ""
    except Exception:
        # Fallback to raw Selenium.
        el = sb.driver.find_element(By.CSS_SELECTOR, css)
        return (el.text or "").strip()


def _extract_attr(sb: SB, spec: str) -> str:
    if "@" not in spec:
        raise ValueError("--attr expects format CSS@ATTR (e.g. 'a@href')")
    css, attr = spec.split("@", 1)
    css = css.strip()
    attr = attr.strip()
    if not css or not attr:
        raise ValueError("--attr expects format CSS@ATTR (e.g. 'a@href')")

    el = sb.driver.find_element(By.CSS_SELECTOR, css)
    val = el.get_attribute(attr)
    return (val or "").strip()


def _extract_body_text(sb: SB) -> str:
    # sb.get_text("body") can be huge but is convenient.
    try:
        txt = sb.get_text("body")
        if isinstance(txt, str):
            return txt.strip()
    except Exception:
        pass

    txt2 = sb.driver.execute_script(
        "return document.body ? (document.body.innerText || '') : '';"
    )
    return (txt2 or "").strip() if isinstance(txt2, str) else ""


def _open_and_wait(sb: SB, url: str, args: argparse.Namespace) -> tuple[str, str]:
    sb.driver.set_page_load_timeout(args.timeout)
    sb.open(url)

    if args.wait_for_css:
        sb.wait_for_element_visible(args.wait_for_css, timeout=args.timeout)

    if args.wait_seconds and args.wait_seconds > 0:
        sb.sleep(args.wait_seconds)

    title = sb.get_title() or ""
    final_url = sb.get_current_url() or url
    return title, final_url


def _page_artifacts(sb: SB, url: str, args: argparse.Namespace) -> dict[str, Any]:
    """Returns page artifacts; may include html when needed."""
    title, final_url = _open_and_wait(sb, url, args)

    html: str | None = None
    if args.html or args.html_out:
        html = sb.get_page_source() or ""

    if args.screenshot_out:
        _ensure_parent_dir(args.screenshot_out)
        sb.save_screenshot(str(args.screenshot_out))

    if args.html_out and html is not None:
        _write_text(args.html_out, html)

    return {
        "url": url,
        "final_url": final_url,
        "title": title,
        "html": html,
    }


def _emit_lines(lines: Iterable[str]) -> None:
    for line in lines:
        sys.stdout.write(line)
        if not line.endswith("\n"):
            sys.stdout.write("\n")


def _print_single(sb: SB, args: argparse.Namespace) -> None:
    artifacts = _page_artifacts(sb, args.url, args)

    if args.json:
        payload = {
            "url": artifacts["url"],
            "final_url": artifacts["final_url"],
            "title": artifacts["title"],
        }
        print(json.dumps(payload, ensure_ascii=False))
        return

    if args.html:
        print(artifacts.get("html") or "")
        return

    if args.text is not None:
        print(_extract_text(sb, args.text))
        return

    if args.attr is not None:
        print(_extract_attr(sb, args.attr))
        return

    if args.links:
        links = _extract_links(sb, artifacts["final_url"])
        _emit_lines(links)
        return

    if args.research:
        links = _extract_links(sb, artifacts["final_url"])
        record = ResearchRecord(
            url=artifacts["url"],
            final_url=artifacts["final_url"],
            title=artifacts["title"],
            text=_extract_body_text(sb),
            links=links,
        )
        print(json.dumps(record.__dict__, ensure_ascii=False))
        return

    # Default
    print(artifacts["title"])


def _same_domain(url_a: str, url_b: str) -> bool:
    try:
        return urlparse(url_a).netloc.lower() == urlparse(url_b).netloc.lower()
    except Exception:
        return False


def _crawl(sb: SB, args: argparse.Namespace) -> None:
    to_visit: list[str] = [args.url]
    visited: set[str] = set()

    origin = args.url
    out_fh = None
    try:
        if args.crawl_out is not None:
            _ensure_parent_dir(args.crawl_out)
            out_fh = args.crawl_out.open("w", encoding="utf-8")

        def write_jsonl(obj: dict[str, Any]) -> None:
            line = json.dumps(obj, ensure_ascii=False)
            if out_fh is not None:
                out_fh.write(line + "\n")
            else:
                print(line)

        while to_visit and len(visited) < args.crawl:
            url = to_visit.pop(0)
            if url in visited:
                continue

            title, final_url = _open_and_wait(sb, url, args)
            visited.add(url)

            links = _extract_links(sb, final_url)
            record = ResearchRecord(
                url=url,
                final_url=final_url,
                title=title,
                text=_extract_body_text(sb),
                links=links,
            )
            write_jsonl(record.__dict__)

            # Enqueue next URLs.
            enqueued = 0
            for link in links:
                if enqueued >= args.max_links_per_page:
                    break
                if link in visited or link in to_visit:
                    continue
                if not args.allow_cross_domain and not _same_domain(origin, link):
                    continue
                to_visit.append(link)
                enqueued += 1

    finally:
        if out_fh is not None:
            out_fh.close()


def main(argv: list[str] | None = None) -> int:
    # Make SIGPIPE behave like typical Unix CLIs (silent exit when downstream closes).
    # This prevents noisy "Broken pipe" messages when piping into `head`, etc.
    try:
        signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    except Exception:
        pass

    parser = _build_parser()
    args = parser.parse_args(argv)

    # Default stdout behavior.
    if not any(
        [
            args.title,
            args.json,
            args.html,
            args.text is not None,
            args.attr is not None,
            args.links,
            args.research,
            args.html_out,
            args.screenshot_out,
            args.crawl > 0,
        ]
    ):
        args.title = True

    headless = not args.headed

    try:
        with SB(browser=args.browser, headless=headless) as sb:
            if args.crawl and args.crawl > 0:
                _crawl(sb, args)
            else:
                _print_single(sb, args)
    except BrokenPipeError:
        # Common when piping into commands like `head` that close early.
        try:
            sys.stdout = open(os.devnull, "w")
        except Exception:
            pass
        return 0
    except Exception as e:  # noqa: BLE001 - CLI boundary
        print(f"web_fetch: error: {e}", file=sys.stderr)
        return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
