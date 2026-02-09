"""Client-facing report generation for the audit scaffold."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class RankedOpportunity:
    id: str
    title: str
    function: str
    low_hanging_score: int | None
    strategic_score: int | None
    risk_tier: int | None


def _fmt_score(v: int | None) -> str:
    return str(v) if v is not None else "(unscored)"


def render_executive_report(
    *,
    company_name: str,
    website: str | None,
    opportunities: list[RankedOpportunity],
    assumptions: list[str],
    next_steps: list[str],
    roadmap_30_60_90: str,
) -> str:
    # If scores exist, show ranked quick wins and strategic bets.
    quick_wins = [o for o in opportunities if o.low_hanging_score is not None]
    quick_wins = sorted(quick_wins, key=lambda o: o.low_hanging_score or -999, reverse=True)[:5]

    strategic = [o for o in opportunities if o.strategic_score is not None]
    strategic = sorted(strategic, key=lambda o: o.strategic_score or -999, reverse=True)[:5]

    # Always show a “starter portfolio” to demonstrate value even when unscored.
    starter_portfolio = opportunities[:5]

    lines: list[str] = [
        f"# AI Integration Opportunity Report: {company_name}",
        "",
        "## Snapshot",
        f"- Website: {website or '(unknown)'}",
        "",
        "## Recommended Starter Portfolio (safe defaults)",
        "These are common high-value, low-risk workflows to pilot in **shadow/approval mode**.",
    ]

    if starter_portfolio:
        for o in starter_portfolio:
            lines.append(
                "- "
                + o.title
                + f" (function: {o.function}, risk tier: {o.risk_tier}, low-hanging: {_fmt_score(o.low_hanging_score)})"
            )
    else:
        lines.append("- (No opportunities generated yet.)")

    lines.extend(
        [
            "",
            "## Prioritization (once scored)",
            "We rank opportunities using:",
            "- Low-hanging fruit = (Ease + Data readiness + Time-to-value) − Risk",
            "- Strategic = Impact − Risk",
        ]
    )

    lines.extend(["", "### Top Quick Wins (scored)"])
    if quick_wins:
        for o in quick_wins:
            lines.append(
                f"- {o.title} (low-hanging: {o.low_hanging_score}, risk tier: {o.risk_tier})"
            )
    else:
        lines.append("- (No scored opportunities yet. Complete follow-up intake and assign scores.)")

    lines.extend(["", "### Top Strategic Bets (scored)"])
    if strategic:
        for o in strategic:
            lines.append(f"- {o.title} (strategic: {o.strategic_score}, risk tier: {o.risk_tier})")
    else:
        lines.append("- (No scored opportunities yet. Strategic bets emerge after data/integration review.)")

    lines.extend(
        [
            "",
            "## Value You Can Expect (estimate bands)",
            "Typical early wins come from:",
            "- reducing time-to-first-response (Support)",
            "- improving lead response time and CRM hygiene (Sales)",
            "- eliminating manual copy/paste and exception chasing (Ops)",
            "",
            "We convert this into quantified ROI once we have volumes + samples.",
        ]
    )

    lines.extend(["", "## Assumptions / What We Still Need", *[f"- {a}" for a in assumptions]])
    lines.extend(["", "## Next Steps", *[f"- {s}" for s in next_steps]])

    lines.extend(
        [
            "",
            "## 30/60/90 Roadmap",
            roadmap_30_60_90.strip(),
            "",
            "## What You Get",
            "- A prioritized backlog of AI automations/agents",
            "- Initial agent specifications + integration plan",
            "- A rollout plan (shadow → approval → limited autonomy)",
            "- Training + SOP updates so the team can own it",
        ]
    )

    return "\n".join(lines)


def followup_intake_form_schema() -> dict[str, Any]:
    """Tool-agnostic follow-up intake schema.

    This is the second pass after research. It should gather the missing fields
    required to score opportunities and finalize specs.
    """

    return {
        "title": "AI Integration Follow-up Intake",
        "intro": "This form collects the minimum details needed to quantify ROI and finalize an AI automation plan.",
        "sections": [
            {
                "id": "volumes",
                "title": "Volumes",
                "questions": [
                    {"id": "tickets_per_week", "type": "number", "prompt": "Support tickets per week"},
                    {"id": "leads_per_week", "type": "number", "prompt": "New leads per week"},
                    {"id": "invoices_per_month", "type": "number", "prompt": "Invoices per month"},
                    {
                        "id": "top_categories",
                        "type": "multiline",
                        "prompt": "Top 5 ticket/lead categories (and rough %)",
                    },
                ],
            },
            {
                "id": "stack",
                "title": "Tool Stack",
                "questions": [
                    {"id": "email", "type": "text", "prompt": "Email (Google/Microsoft/other)"},
                    {"id": "crm", "type": "text", "prompt": "CRM (e.g., HubSpot/Salesforce)"},
                    {"id": "helpdesk", "type": "text", "prompt": "Helpdesk (e.g., Zendesk/Intercom)"},
                    {"id": "kb", "type": "text", "prompt": "Knowledge base location (Notion/Confluence/Drive)"},
                    {"id": "chat", "type": "text", "prompt": "Chat (Slack/Teams/other)"},
                ],
            },
            {
                "id": "constraints",
                "title": "Constraints & Approval",
                "questions": [
                    {
                        "id": "compliance",
                        "type": "multi_select",
                        "prompt": "Compliance constraints",
                        "options": ["None", "GDPR", "SOC2", "HIPAA", "PCI", "Other"],
                    },
                    {"id": "pii_present", "type": "boolean", "prompt": "Is customer PII present in tickets/emails?"},
                    {
                        "id": "approval_roles",
                        "type": "multiline",
                        "prompt": "Who must approve: (1) customer messages (2) refunds/credits (3) workflow changes?",
                    },
                ],
            },
            {
                "id": "artifacts",
                "title": "Artifacts (sanitized examples)",
                "questions": [
                    {
                        "id": "samples",
                        "type": "upload",
                        "prompt": "Provide 10–30 anonymized examples (tickets/emails/invoices/calls) + any SOPs/policies",
                    }
                ],
            },
        ],
    }
