# AI Integration Audit (Project Bundle)

## Why This Exists

This project bundle captures an end-to-end, repeatable workflow for:

1. Researching a company (public OSINT)
2. Generating a *non-obvious* discovery survey (adaptive follow-ups)
3. Scoring and prioritizing AI agent opportunities (quick wins + strategic bets)
4. Producing an implementation plan and initial deployment scaffolding
5. Rolling out and training a client team with adoption metrics

It is designed for a consultant/operator delivery model: **you implement and prove value first**, then transfer ownership via training + SOP updates.

## When to Use It

Use this bundle when you need to quickly onboard a new business and answer:

- What are the best AI automation opportunities for *this* business?
- What can be shipped in 1–2 weeks (“low-hanging fruit”) with minimal risk?
- What data/integrations are required, and what are the guardrails?
- How do we deploy an initial agent portfolio with human-in-the-loop controls?

## Details

### Core Principles

- **Local-first:** Use existing client docs/systems before asking questions.
- **Research-first:** Gather public facts before intake (avoid obvious questions).
- **Triangulation:** Don’t trust single-source claims. Track sources.
- **Traceability:** Every key assertion links to evidence (URL, screenshot, artifact).
- **Human-in-the-loop by default:** Increase autonomy only as confidence increases.
- **Time-to-value:** Prefer workflows that ship value in <2 weeks.

### Contents

- `01_osint_company_research.md`
- `02_hypothesis_to_survey_generator.md`
- `03_opportunity_scoring_model.md`
- `04_agent_portfolio_patterns.md`
- `05_integrations_and_deployment.md`
- `06_security_privacy_compliance.md`
- `07_rollout_training_adoption.md`
- `generator/` (minimal runnable scaffolding)

## Runnable Project Assets

This skill bundle is **markdown-only**. The runnable generator + client template live under:

- `projects/ai_integration_audit/generator/`
- `projects/ai_integration_audit/client_template/`

Example (from repo root):

```bash
python3 projects/ai_integration_audit/generator/auditgen.py \
  --company "Example Co" \
  --research-provider stub \
  --out tmp_rovodev_audit_out
```

## See Also

- `skills/domains/code-quality/research-patterns.md` (CRAAP test, triangulation, time-boxing)
