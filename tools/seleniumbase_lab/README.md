# SeleniumBase Lab (Brain tools)

This is a small, self-contained sandbox for trying SeleniumBase (a batteries-included wrapper around Selenium).

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -U pip
python3 -m pip install -r requirements.txt
```

## Run smoke test

```bash
source .venv/bin/activate
python3 smoke.py
```

## Web fetch CLI (title / HTML / screenshot / extract / crawl)

From this folder:

```bash
source .venv/bin/activate
python3 web_fetch.py https://example.com --title
python3 web_fetch.py https://example.com --json
python3 web_fetch.py https://example.com --html > /tmp/example.stdout.html
python3 web_fetch.py https://example.com --html-out /tmp/example.html
python3 web_fetch.py https://example.com --screenshot-out /tmp/example.png

# Extraction helpers
python3 web_fetch.py https://example.com --text "h1"
python3 web_fetch.py https://example.com --attr "a@href"
python3 web_fetch.py https://example.com --links

# Research preset (structured JSON)
python3 web_fetch.py https://example.com --research > /tmp/example.research.json

# Crawl N pages (JSONL)
python3 web_fetch.py https://example.com --crawl 5 --crawl-out /tmp/example.crawl.jsonl
```

From the repo root (`/brain/`):

```bash
source tools/seleniumbase_lab/.venv/bin/activate
python3 tools/seleniumbase_lab/web_fetch.py https://example.com --title
python3 tools/seleniumbase_lab/web_fetch.py https://example.com --html > /tmp/example.stdout.html
```

### JS-heavy pages

For pages that render content after load:

```bash
python3 web_fetch.py "https://news.ycombinator.com" --wait-seconds 2 --title
python3 web_fetch.py "https://example.com" --wait-for-css "h1" --html-out /tmp/page.html
```

Tip: `--json` prints only metadata (url/final_url/title). Use `--html`/`--html-out` or `--research` to capture rendered content.

### Crawl mode (N pages)

Crawl emits **JSONL** (one JSON object per visited page). By default it only follows **same-domain** links.

```bash
python3 web_fetch.py https://example.com --crawl 5 --crawl-out /tmp/crawl.jsonl
python3 web_fetch.py https://example.com --crawl 5 --allow-cross-domain --crawl-out /tmp/crawl_any_domain.jsonl
```

You can also limit queue growth per page:

```bash
python3 web_fetch.py https://example.com --crawl 20 --max-links-per-page 10 --crawl-out /tmp/crawl.jsonl
```

## Notes

- The smoke test uses **headless** mode and a simple `https://example.com` navigation.
- Browser availability (Chrome/Chromium) is still required on your system.
