# Hypothesis → Survey Generator (Adaptive Intake)

## Why This Exists

A survey should *not* be a static questionnaire. It should validate hypotheses from research and collect only what can’t be inferred.

This skill defines how to produce a **business-specific**, branching survey from:

- an OSINT dossier
- a set of hypothesized workflows
- a target “first agent portfolio” (draft)

## When to Use It

Use after OSINT research and before final opportunity scoring.

## Details

### Inputs

- OSINT dossier (facts + hypotheses + unknowns)
- Target functions in scope (e.g., Support, Sales, Ops)
- Constraints (compliance, tools allowed, budget, timeline)

### Survey Design Rules

1. **Ask for numbers and artifacts, not opinions**
   - Good: “How many inbound tickets/week?”
   - Bad: “Is support busy?”

2. **Every question must map to a decision**
   - If you can’t say what you’ll do with the answer, cut the question.

3. **Branching follows risk + volume**
   - High-volume or high-risk areas get deeper follow-ups.

4. **Minimize cognitive load**
   - Default to multiple-choice + short numeric fields
   - Save open text for “top 3 pain points” and “show us examples”

### Core Survey Sections (always include)

- Company basics (confirm OSINT facts)
- Tool stack + data locations
- Volumes (tickets/leads/invoices/etc.)
- Process maturity (SOPs exist? where?)
- Constraints (security, PII, approvals)
- Success metrics (what “better” means)
- Artifact uploads (sanitized examples)

### Dynamic Follow-Ups (generation pattern)

For each hypothesized workflow, generate follow-ups using this template:

- **Trigger:** What starts the workflow?
- **Inputs:** What data/documents are used?
- **Decision points:** What choices are made?
- **Exceptions:** What causes escalation?
- **Outputs:** What must be produced?
- **Quality bar:** What makes it “good”?
- **SLA:** How fast?
- **Owner:** Who is responsible/approver?

Example: Support triage

- Categories? % of top 5 categories?
- Current macros? KB exists? Where?
- Escalation triggers?
- Refund policy link?
- Systems: Zendesk/Intercom/Freshdesk?

### Output Format

Generate one of:

- Markdown survey (`survey.generated.md`)
- Form schema (JSON for Typeform/Google Forms)

Include:

- Section order
- Question IDs (stable)
- Branch logic rules
- “Why we ask” notes (optional for internal use)

### Completion Criteria

Done when:

- Survey questions cover all unknowns that affect scoring and deployment
- Each question maps to a decision or constraint
- Branch logic is explicit
