"""Research provider interfaces for company-name-only bootstrapping.

Goal: allow swapping between:

- stub/mock providers (deterministic, no network)
- real providers (LLM + tools) implemented outside this repo

Optionally, a Playwright/Chromium provider can be implemented by downstream
repos to browse JS-heavy sites without API keys.

The generator only requires that a provider returns a `ResearchDossier` with
traceable sources.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Protocol

try:
    from .url_utils import absolutize, same_origin
except ImportError:  # pragma: no cover
    from url_utils import absolutize, same_origin


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


@dataclass
class Source:
    url: str
    label: str | None = None
    accessed_at: str = field(default_factory=utc_now_iso)
    notes: str | None = None


@dataclass
class ResearchDossier:
    company_name: str
    guessed_website: str | None
    facts: dict[str, str]
    hypotheses: list[str]
    unknowns: list[str]
    sources: list[Source]
    generated_at: str = field(default_factory=utc_now_iso)


class ResearchProvider(Protocol):
    name: str

    def research(self, company_name: str) -> ResearchDossier: ...


class StubResearchProvider:
    """Deterministic provider with *no* network calls.

    This exists to keep the scaffold runnable in any environment.
    """

    name = "stub"

    def research(self, company_name: str) -> ResearchDossier:
        normalized = "".join(ch for ch in company_name.lower() if ch.isalnum())
        guessed_site = f"https://{normalized}.com" if normalized else None

        return ResearchDossier(
            company_name=company_name,
            guessed_website=guessed_site,
            facts={
                "note": "This is a stub dossier. Replace with real OSINT + citations.",
                "company_name": company_name,
            },
            hypotheses=[
                "Support tickets are high volume and repetitive",
                "Lead qualification is manual and slow",
            ],
            unknowns=[
                "Official website URL",
                "Current tool stack (CRM/helpdesk/accounting/docs)",
                "Workflow volumes (tickets/leads/invoices)",
                "Compliance constraints (GDPR/SOC2/HIPAA/PCI)",
            ],
            sources=[
                Source(
                    url="(no-source)",
                    label="stub",
                    notes="No public research performed in stub provider",
                )
            ],
        )


class ChromiumResearchProvider:
    """Optional no-API-key research provider using Playwright (Chromium).

    This is only available if Playwright is installed. It can browse JS-heavy
    pages and crawl a small, capped set of high-signal links.
    """

    name = "chromium"

    def research(self, company_name: str) -> ResearchDossier:
        try:
            from playwright.sync_api import sync_playwright
        except Exception as e:  # pragma: no cover
            raise RuntimeError(
                "Playwright is required for the chromium provider. "
                "Install: pip install playwright && playwright install chromium"
            ) from e

        sources: list[Source] = []
        facts: dict[str, str] = {"company_name": company_name}

        search_url = "https://duckduckgo.com/?q=" + re.sub(r"\s+", "+", company_name) + "&t=h_&ia=web"
        sources.append(Source(url=search_url, label="search", notes="DuckDuckGo search query"))

        guessed_site: str | None = None

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            page.goto(search_url, wait_until="domcontentloaded", timeout=60_000)

            links = page.locator("a[data-testid='result-title-a']")
            count = min(5, links.count())
            candidates: list[str] = []
            for i in range(count):
                href = links.nth(i).get_attribute("href")
                if href:
                    candidates.append(href)

            for href in candidates:
                if any(
                    x in href
                    for x in [
                        "linkedin.com",
                        "facebook.com",
                        "instagram.com",
                        "twitter.com",
                        "x.com",
                        "wikipedia.org",
                    ]
                ):
                    continue
                guessed_site = href
                break

            if guessed_site:
                sources.append(Source(url=guessed_site, label="candidate_site", notes="First candidate site from search"))
                page.goto(guessed_site, wait_until="domcontentloaded", timeout=60_000)

                title = page.title()
                if title:
                    facts["page_title"] = title

                homepage_text = page.locator("body").inner_text(timeout=10_000)
                facts["homepage_text_sample"] = (homepage_text or "").strip()[:2000]

                keywords = {
                    "pricing": ["pricing", "plans"],
                    "case_studies": ["case-studies", "case_study", "customers", "customer", "stories"],
                    "faq_help": ["faq", "help", "support", "docs", "knowledge"],
                    "privacy_security": ["privacy", "security"],
                    "terms": ["terms"],
                    "about": ["about"],
                    "contact": ["contact"],
                    "careers": ["careers", "jobs", "join"],
                }

                href_nodes = page.locator("a[href]")
                href_count = min(200, href_nodes.count())
                hrefs: list[str] = []
                for i in range(href_count):
                    href = href_nodes.nth(i).get_attribute("href")
                    if href:
                        hrefs.append(href)

                internal_urls: dict[str, str] = {}
                for href in hrefs:
                    abs_url = absolutize(guessed_site, href)
                    if not same_origin(guessed_site, abs_url):
                        continue
                    lower = abs_url.lower()
                    for label, terms in keywords.items():
                        if label in internal_urls:
                            continue
                        if any(t in lower for t in terms):
                            internal_urls[label] = abs_url

                for label, url in list(internal_urls.items())[:8]:
                    try:
                        page.goto(url, wait_until="domcontentloaded", timeout=60_000)
                        sources.append(Source(url=url, label=label, notes="Crawled from homepage link"))
                        t = page.title()
                        if t:
                            facts[f"{label}_title"] = t
                        txt = page.locator("body").inner_text(timeout=10_000)
                        text_sample = (txt or "").strip()
                        facts[f"{label}_text_sample"] = text_sample[:2000]

                        # Lightweight structured extraction (heuristics):
                        if label in {"contact", "about"}:
                            m = re.search(r"\b(UK|United Kingdom|USA|United States|Australia|Canada|Ireland)\b", text_sample)
                            if m and "location_hint" not in facts:
                                facts["location_hint"] = m.group(0)

                        if label == "careers":
                            tool_hints = []
                            for tool in ["Salesforce", "HubSpot", "Zendesk", "Intercom", "Freshdesk", "Notion", "Confluence", "Slack", "Teams", "Xero", "QuickBooks"]:
                                if tool.lower() in text_sample.lower():
                                    tool_hints.append(tool)
                            if tool_hints:
                                facts["tool_hints_from_careers"] = ", ".join(sorted(set(tool_hints)))

                        if label == "pricing":
                            if any(sym in text_sample for sym in ["$", "£", "€"]):
                                facts["pricing_currency_hint"] = "Contains currency symbols on pricing page"
                    except Exception as e:
                        sources.append(Source(url=url, label=label, notes=f"Failed to crawl: {type(e).__name__}: {e}"))

            browser.close()

        return ResearchDossier(
            company_name=company_name,
            guessed_website=guessed_site,
            facts=facts,
            hypotheses=[
                "Support tickets are high volume and repetitive",
                "Lead qualification is manual and slow",
            ],
            unknowns=[
                "Workflow volumes (tickets/leads/invoices)",
                "Tool stack (CRM/helpdesk/accounting/docs)",
                "SOP/policy locations (KB)",
                "Compliance constraints (GDPR/SOC2/HIPAA/PCI)",
            ],
            sources=sources,
        )


def get_provider(provider_name: str) -> ResearchProvider:
    if provider_name == "stub":
        return StubResearchProvider()
    if provider_name == "chromium":
        return ChromiumResearchProvider()

    raise ValueError(
        "Unknown research provider: " + provider_name + ". Supported: stub, chromium"
    )
