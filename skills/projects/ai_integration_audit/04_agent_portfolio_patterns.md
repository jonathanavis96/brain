# Agent Portfolio Patterns (From Ideas to Shippable Agents)

## Why This Exists

Most “AI agent” failures come from unclear scope, unsafe autonomy, and missing evaluation/guardrails.

This skill defines how to select and specify an initial portfolio that can ship quickly and safely.

## When to Use It

Use after opportunity scoring to pick the first 3–8 agents/automations.

## Details

### Autonomy Levels

- **L0:** No automation (guidelines only)
- **L1:** AI suggestions (human edits/approves)
- **L2:** AI executes with explicit approval gate
- **L3:** AI executes autonomously with monitoring + rollback

Default recommendation: start at **L1/L2**.

### Agent vs Automation Decision

Prefer *automation with AI* when:

- deterministic integration steps exist
- the main “AI part” is classification/extraction/drafting

Prefer *agent* (multi-step reasoning + tool use) when:

- workflow requires dynamic tool selection
- steps vary by context but still follow a pattern

### Agent Spec Template (minimum)

Each agent must have:

- **Job-to-be-done**
- **Trigger(s)** (what starts it)
- **Inputs** (sources + required fields)
- **Tools** (APIs, RPA, browser, email)
- **Steps** (high level)
- **Outputs** (where results go)
- **Human-in-the-loop** gates
- **Guardrails** (policy links, refusal rules, PII handling)
- **Evaluation** (test set, golden outputs, QA checklist)
- **Metrics** (time saved, quality, CSAT impact)

### Evaluation Pattern

- Build a small test set from real artifacts (sanitized)
- Define pass/fail criteria (correct routing? correct policy citations?)
- Run regression checks when prompts/tools change

### Common First-Portfolio Agents

- Support triage + reply drafting with citations
- Lead enrichment + qualification notes
- Meeting notes → CRM updates → follow-ups
- Document intake: extract fields + route exceptions

## Deliverables

Done when:

- Each selected agent has a spec
- Autonomy level and approval gates are explicit
- Evaluation exists before production rollout
