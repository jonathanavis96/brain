# AI Integration Audit Generator (Scaffold)

## What This Does

This scaffold demonstrates an end-to-end workflow for an AI integration audit:

- company research (via a pluggable provider)
- survey generation (core + hypothesis follow-ups)
- opportunity generation + scoring placeholders
- agent spec scaffolds
- client-facing report + follow-up intake form

## Quick Start

### 1) Company-name-only bootstrapping (stub research)

```bash
python3 -m skills.projects.ai_integration_audit.generator.auditgen \
  --company "Example Co" \
  --research-provider stub \
  --out tmp_rovodev_audit_out
```

### 2) Using an intake JSON

```bash
python3 -m skills.projects.ai_integration_audit.generator.auditgen \
  --intake skills/projects/ai_integration_audit/generator/templates/intake.example.json \
  --out tmp_rovodev_audit_out
```

### 3) Second pass (follow-up answers → auto-score + rerank)

```bash
python3 -m skills.projects.ai_integration_audit.generator.auditgen \
  --followup path/to/followup_answers.json \
  --base-intake path/to/intake.json \
  --out tmp_rovodev_audit_out
```

## Outputs

- `company_dossier.md` (+ `company_dossier.json`)
- `survey.generated.md`
- `opportunities.json`
- `opportunity_cards/*.json`
- `agent_specs/*.json`
- `client_report.md`
- `followup_intake_form.json`
- `plan_30_60_90.md`

## Extending Research

To support real OSINT from **company name only**, implement a provider in `research_providers.py` that:

- finds the company website
- crawls a small set of high-signal pages (pricing, case studies, FAQ/help, privacy/security, terms, about, contact, careers)
- extracts structured facts and returns traceable sources

This repo ships `stub` by default and includes an optional `chromium` provider (requires Playwright).
