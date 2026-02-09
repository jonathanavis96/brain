# LLM Tooling Stub (for Real OSINT)

This repo intentionally ships only a `stub` research provider so it is runnable without network access.

To achieve the desired behavior (company name → public research → filled intake + survey + scored opportunities), implement a real provider with:

- Search (web) to find the official website
- Crawling/scraping key pages (home, pricing, case studies, FAQ, security/privacy)
- Extraction into structured facts
- Hypothesis generation
- Source list (URLs + access time)

## Expected Provider Contract

See `skills/projects/ai_integration_audit/generator/research_providers.py`.

Your provider must return a `ResearchDossier` including:

- `guessed_website`
- `facts` (key/value)
- `hypotheses`
- `unknowns`
- `sources`

## Research Quality Rules

Follow `skills/domains/code-quality/research-patterns.md`:

- Time-box first pass
- CRAAP-check sources
- Triangulate key claims
- Preserve traceability
