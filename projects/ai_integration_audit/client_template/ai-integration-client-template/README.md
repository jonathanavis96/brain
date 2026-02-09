# Client AI Integration Audit (Template Repo)

This is a copyable scaffold for running an AI Integration Audit for a specific business.

## Quick Start

### 1) Create a Python venv (recommended)

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2) Install optional dependencies (only needed for real research)

```bash
pip install -r requirements.txt

# Needed only if you use RESEARCH_PROVIDER=chromium
playwright install chromium
```

### 3) Company-name-only bootstrap

```bash
# Default research provider is stub (no network)
bash scripts/run_from_company.sh "Example Co"

# Use Chromium (Playwright) to browse JS-heavy sites (no API key)
RESEARCH_PROVIDER=chromium bash scripts/run_from_company.sh "Example Co"
```

### 4) Refine using client-provided intake

Edit `client/intake.json`, then:

```bash
bash scripts/run_from_intake.sh
```

### 5) Second pass (follow-up answers → auto-score + rerank)

Fill `client/followup_answers.example.json` (or your own answers file), then:

```bash
python3 auditgen/auditgen.py \
  --followup client/followup_answers.example.json \
  --base-intake client/intake.json \
  --out outputs
```

## Workflow

1. Run research + generator using only the company name
2. Review `outputs/client_report.md`
3. Send the follow-up intake form to the client (`outputs/followup_intake_form.json` mapped to your preferred form tool)
4. Re-run generator with the client-provided intake to refine scores, specs, and roadmap

## Structure

- `auditgen/` — vendored generator (no Brain repo required)
- `client/` — client-specific inputs and artifacts
- `outputs/` — generated survey, report, cards, specs
- `scripts/` — helper scripts

## Notes

- The generator will always run with `RESEARCH_PROVIDER=stub`.
- `RESEARCH_PROVIDER=chromium` requires Playwright and a Chromium install (see above).
- The Chromium research provider is a scaffold. For best results you’ll still want to add:
  - multi-source triangulation
  - extraction from pricing/case-studies/FAQ/security pages
  - better company disambiguation
