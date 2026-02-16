# Web Research Patterns

## Overview

Practical patterns for web browsing and data extraction using `tools/seleniumbase_lab/web_fetch.py`. This tool renders JavaScript-heavy pages (via SeleniumBase/Selenium) and extracts structured data.

**When to use:**

- Researching technologies, libraries, or patterns not yet documented in `skills/`
- Gathering structured data from websites (documentation, examples, pricing pages)
- Investigating user-reported issues requiring external context
- Validating assumptions about external services/APIs
- Building datasets for analysis or decision-making

**Related skills:**

- [research-patterns.md](research-patterns.md) - General research methodology
- [research-cheatsheet.md](research-cheatsheet.md) - Quick reference for research

---

## Setup

**Prerequisites:**

- Python 3.9+ and venv
- Chrome/Chromium browser installed (tool runs headless by default)

**Activate the SeleniumBase environment:**

```bash
source tools/seleniumbase_lab/.venv/bin/activate
```

**Note:** If the venv doesn't exist, create it:

```bash
python3 -m venv tools/seleniumbase_lab/.venv
source tools/seleniumbase_lab/.venv/bin/activate
pip install -r tools/seleniumbase_lab/requirements.txt
```

---

## Common Patterns

### Pattern 1: Quick Title Check

**Use case:** Verify a URL is reachable and extract the page title.

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://example.com --title
```

**Output:**

```text
Example Domain
```

---

### Pattern 2: Structured Research Record

**Use case:** Capture a page's title, full body text, and all links in a single JSON payload.

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://example.com --research > /tmp/research.json
```

**Output schema:**

```json
{
  "url": "https://example.com",
  "final_url": "https://example.com/",
  "title": "Example Domain",
  "text": "Example Domain\nThis domain is for use in illustrative examples...",
  "links": [
    "https://www.iana.org/domains/example"
  ]
}
```

**When to use:**

- First-pass exploration of a new site
- Building a knowledge graph of related pages
- Extracting text for summarization or analysis

---

### Pattern 3: Extract Specific Content (CSS Selectors)

**Use case:** Pull specific data from a page (headings, links, attributes).

```bash
# Extract first <h1> text
python3 tools/seleniumbase_lab/web_fetch.py https://example.com --text "h1"

# Extract href from first <a> tag
python3 tools/seleniumbase_lab/web_fetch.py https://example.com --attr "a@href"

# Extract all links (de-duplicated, absolute URLs)
python3 tools/seleniumbase_lab/web_fetch.py https://example.com --links
```

**Advanced selector examples:**

```bash
# Extract pricing from a specific element
python3 tools/seleniumbase_lab/web_fetch.py https://example.com/pricing --text "span.price"

# Extract download URL
python3 tools/seleniumbase_lab/web_fetch.py https://example.com/download --attr "a.download-btn@href"
```

---

### Pattern 4: Handle JavaScript-Rendered Content

**Use case:** Wait for dynamic content to load before extracting.

**Wait for a specific CSS selector to appear:**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://spa-app.com \
  --wait-for-css "div.content-loaded" \
  --research > /tmp/spa_research.json
```

**Wait a fixed time (seconds):**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://example.com \
  --wait-seconds 3 \
  --text "h1"
```

**When to use:**

- Single-page applications (SPAs) that render content via JavaScript
- Lazy-loaded content (infinite scroll, on-demand data)
- Pages with AJAX-driven updates

---

### Pattern 5: Capture Screenshots + HTML

**Use case:** Archive a page's visual state and rendered DOM.

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://example.com \
  --screenshot-out artifacts/example_screenshot.png \
  --html-out /tmp/example.html
```

**Combine with title output:**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://example.com \
  --screenshot-out artifacts/screenshot.png \
  --title
```

**When to use:**

- Documenting UI state for bug reports
- Archiving marketing pages before redesigns
- Visual regression testing baselines

---

### Pattern 6: Crawl Multiple Pages

**Use case:** Follow links and extract structured data from up to N pages.

**Basic crawl (same-domain only):**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://example.com \
  --crawl 10 \
  --crawl-out /tmp/crawl.jsonl
```

**Output format:** JSONL (one JSON object per visited page, same schema as `--research`).

**Example JSONL:**

```jsonl
{"url": "https://example.com", "final_url": "https://example.com/", "title": "Home", "text": "...", "links": [...]}
{"url": "https://example.com/about", "final_url": "https://example.com/about", "title": "About", "text": "...", "links": [...]}
```

**Advanced crawl options:**

```bash
# Allow cross-domain links
python3 tools/seleniumbase_lab/web_fetch.py https://example.com \
  --crawl 20 \
  --allow-cross-domain \
  --crawl-out /tmp/crawl_any_domain.jsonl

# Limit links enqueued per page (prevent runaway crawls)
python3 tools/seleniumbase_lab/web_fetch.py https://example.com \
  --crawl 50 \
  --max-links-per-page 10 \
  --crawl-out /tmp/crawl_limited.jsonl
```

**When to use:**

- Building a sitemap or content inventory
- Gathering documentation from multi-page guides
- Competitive analysis (pricing pages, feature lists)

**Safety notes:**

- Default: same-domain only (prevents accidental external crawls)
- Use `--max-links-per-page` to cap queue growth
- Respect robots.txt and Terms of Service

---

### Pattern 7: Pipe to Other Tools (JSONL Processing)

**Use case:** Feed extracted data into jq, Python scripts, or databases.

**Count crawled pages:**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://example.com --crawl 10 | wc -l
```

**Extract titles from JSONL:**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://example.com --crawl 5 | \
  jq -r '.title'
```

**Filter links containing "docs":**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://example.com --links | \
  grep 'docs'
```

---

## Anti-Patterns

### ❌ Don't: Run without activating venv

**Why it fails:**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://example.com
# ModuleNotFoundError: No module named 'seleniumbase'
```

**Fix:**

```bash
source tools/seleniumbase_lab/.venv/bin/activate
python3 tools/seleniumbase_lab/web_fetch.py https://example.com
```

---

### ❌ Don't: Use `--crawl` without output limits on large sites

**Risk:** Unbounded crawls can run for hours and generate gigabytes of data.

**Fix:**

```bash
# Set reasonable limits
python3 tools/seleniumbase_lab/web_fetch.py https://large-site.com \
  --crawl 100 \
  --max-links-per-page 15 \
  --crawl-out /tmp/crawl.jsonl
```

---

### ❌ Don't: Ignore robots.txt or Terms of Service

**Risk:** Legal/ethical issues, IP bans.

**Fix:**

- Check `https://example.com/robots.txt` before crawling
- Respect `Disallow:` directives
- Add delays if needed (future: `--delay-seconds` flag)

---

### ❌ Don't: Assume static content (use waits for JS-heavy pages)

**Problem:**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://spa-app.com --text "h1"
# Output: (empty or wrong content)
```

**Fix:**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://spa-app.com \
  --wait-for-css "h1" \
  --text "h1"
```

---

## Decision Tree

```text
Need to fetch web content?
├─ Static HTML page?
│  └─ Use curl or wget (faster, simpler)
│
├─ JavaScript-rendered content?
│  └─ Use web_fetch.py
│
├─ Need structured data extraction?
│  ├─ Single page → --research
│  └─ Multiple pages → --crawl N --crawl-out file.jsonl
│
├─ Need visual state?
│  └─ --screenshot-out path.png
│
└─ Building a dataset?
   └─ --crawl + JSONL processing (jq, Python, DB)
```

---

## Examples (Real-World Use Cases)

### Example 1: Research a new JavaScript framework

**Goal:** Extract documentation links and main concepts from the homepage.

```bash
source tools/seleniumbase_lab/.venv/bin/activate
python3 tools/seleniumbase_lab/web_fetch.py https://vuejs.org \
  --wait-for-css "main" \
  --research > /tmp/vuejs_research.json

cat /tmp/vuejs_research.json | jq '.links[] | select(contains("guide"))'
```

---

### Example 2: Audit competitor pricing

**Goal:** Capture pricing page screenshots and extract pricing tier text.

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://competitor.com/pricing \
  --screenshot-out artifacts/competitor_pricing.png \
  --text "div.pricing-tiers"
```

---

### Example 3: Build a documentation sitemap

**Goal:** Crawl a docs site and extract all page titles + URLs.

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://docs.example.com \
  --crawl 50 \
  --max-links-per-page 20 \
  --crawl-out /tmp/docs_sitemap.jsonl

cat /tmp/docs_sitemap.jsonl | jq -r '[.url, .title] | @tsv'
```

---

### Example 4: Validate external API documentation

**Goal:** Check if an API endpoint is documented at a specific URL.

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://api-docs.example.com/v2/users \
  --text "h1" \
  --links | grep '/v2/users'
```

---

## Troubleshooting

### Issue: `ModuleNotFoundError: No module named 'seleniumbase'`

**Cause:** Virtual environment not activated.

**Fix:**

```bash
source tools/seleniumbase_lab/.venv/bin/activate
```

---

### Issue: `WebDriverException: chrome not found`

**Cause:** Chrome/Chromium not installed.

**Fix (Ubuntu/WSL):**

```bash
wget -qO /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt update
sudo apt install -y /tmp/chrome.deb
```

---

### Issue: Timeout when loading page

**Cause:** Page takes longer than default timeout (30s).

**Fix:**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://slow-site.com \
  --timeout 60 \
  --title
```

---

### Issue: Empty output for JS-rendered content

**Cause:** Content loaded after initial page load.

**Fix:**

```bash
python3 tools/seleniumbase_lab/web_fetch.py https://spa-app.com \
  --wait-for-css "div.content" \
  --research
```

---

## Reference

**Tool location:** `tools/seleniumbase_lab/web_fetch.py`

**Full help:**

```bash
source tools/seleniumbase_lab/.venv/bin/activate
python3 tools/seleniumbase_lab/web_fetch.py --help
```

**Common flags:**

| Flag | Purpose | Example |
|------|---------|---------|
| `--title` | Print page title | `--title` |
| `--research` | JSON record (title/text/links) | `--research > file.json` |
| `--text "CSS"` | Extract text from selector | `--text "h1"` |
| `--attr "CSS@ATTR"` | Extract attribute | `--attr "a@href"` |
| `--links` | Print all links | `--links` |
| `--html` | Print rendered HTML | `--html > page.html` |
| `--screenshot-out PATH` | Save screenshot | `--screenshot-out /tmp/page.png` |
| `--crawl N` | Crawl N pages | `--crawl 10 --crawl-out file.jsonl` |
| `--wait-for-css "CSS"` | Wait for element | `--wait-for-css "main"` |
| `--wait-seconds N` | Fixed delay (seconds) | `--wait-seconds 3` |

---

## Related

- [research-patterns.md](research-patterns.md) - General research methodology
- [research-cheatsheet.md](research-cheatsheet.md) - Quick reference
- [token-efficiency.md](token-efficiency.md) - Optimize token usage when processing extracted data
- `tools/seleniumbase_lab/README.md` - Tool-specific documentation
