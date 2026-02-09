# Opportunity Scoring Model (Quick Wins + Strategic Bets)

## Why This Exists

Without a scoring model, prioritization becomes vibes-driven. This skill provides a simple, defensible way to rank opportunities across any business.

## When to Use It

Use after intake (survey + artifacts) and before selecting the initial agent portfolio.

## Details

### Unit of Analysis: Opportunity Card

Score opportunities at the level of a concrete workflow (not a department):

- “Support: triage + draft replies”
- “Sales: lead enrichment + first-touch email draft”
- “Ops: invoice exception routing”

### Required Fields

Each card must include:

- Problem statement (1–2 sentences)
- Current workflow (who, tools, steps)
- Proposed automation/agent
- Required integrations
- Data sources
- Guardrails (human approval, confidence thresholds)
- Success metrics

### Scoring Dimensions (1–5)

- **Impact:** hours saved, revenue lift, error reduction, SLA improvement
- **Ease:** implementation complexity + change management
- **Data readiness:** access + cleanliness + permissioning
- **Risk:** compliance + customer harm + financial exposure (higher = riskier)
- **Time-to-value:** how quickly meaningful value ships

### Derived Scores

- **Low-hanging fruit score** = (Ease + Data readiness + Time-to-value) − Risk
- **Strategic score** = Impact − Risk

Guidance:

- Low-hanging fruit typically has: Ease ≥ 4, Data readiness ≥ 4, Risk ≤ 2
- Strategic bets typically have: Impact = 5 but require platform work

### Risk Tiers (recommended)

- Tier 1 (Low): internal drafts, routing, classification, summarization
- Tier 2 (Medium): customer comms with approval gate, refunds with review
- Tier 3 (High): autonomous financial actions, legal commitments, compliance-sensitive decisions

### Evidence Requirements (Research Patterns alignment)

For high-impact decisions, record:

- Minimum 2 sources for volume/value claims (triangulation)
- Confidence level for each estimate
- Assumptions list + how to validate quickly

## Deliverables

Done when:

- Opportunities are scored consistently
- Top 5 quick wins are obvious and defensible
- Risks and dependencies are explicit
