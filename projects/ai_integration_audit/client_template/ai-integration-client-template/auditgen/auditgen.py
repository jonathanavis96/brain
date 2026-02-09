"""AI Integration Audit Generator (reference implementation).

This is a dependency-light scaffold intended to demonstrate the workflow:

Input options:

1) Provide `--intake <json>` (manual intake)
2) Provide `--company "<name>"` (company-name-only bootstrapping via a research provider)
3) Provide `--followup <json>` (second-pass answers to auto-score + rerank)

Outputs:

- `company_dossier.md` (+ `company_dossier.json`)
- `survey.generated.md`
- `opportunities.json` (scored + derived scores)
- `opportunity_cards/` (one JSON per opportunity)
- `agent_specs/` (one JSON per recommended agent)
- `plan_30_60_90.md`
- `client_report.md`
- `followup_intake_form.json`

Notes:

- The default research provider is a deterministic stub to keep this runnable.
- Real OSINT requires an LLM + browsing/tools and must be implemented as a provider.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from followup_scoring import parse_followup_answers, score_opportunity
from reporting import RankedOpportunity, followup_intake_form_schema, render_executive_report
from research_providers import ResearchDossier, get_provider
from scoring import OpportunityScores, derived_low_hanging, derived_strategic


@dataclass(frozen=True)
class Intake:
    company_name: str
    website: str
    industry: str | None
    size: str | None
    primary_functions: list[str]
    constraints: dict[str, Any]
    hypotheses: list[str]


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_intake(path: Path) -> Intake:
    data = json.loads(path.read_text(encoding="utf-8"))

    return Intake(
        company_name=str(data["company_name"]),
        website=str(data.get("website", "")),
        industry=data.get("industry"),
        size=data.get("size"),
        primary_functions=list(data.get("primary_functions", [])),
        constraints=dict(data.get("constraints", {})),
        hypotheses=list(data.get("hypotheses", [])),
    )


def intake_from_dossier(dossier: ResearchDossier) -> Intake:
    # Keep it intentionally minimal; the follow-up intake is where we gather specifics.
    return Intake(
        company_name=dossier.company_name,
        website=dossier.guessed_website or "",
        industry=dossier.facts.get("industry"),
        size=dossier.facts.get("size"),
        primary_functions=["Support", "Sales", "Operations"],
        constraints={},
        hypotheses=list(dossier.hypotheses),
    )


def ensure_out_dir(out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")


def dossier_to_markdown(dossier: ResearchDossier) -> str:
    lines: list[str] = [
        f"# Company Dossier: {dossier.company_name}",
        "",
        f"Generated: {dossier.generated_at}",
        "",
        "## What We Found (public research)",
        f"- Website (guessed): {dossier.guessed_website or '(unknown)'}",
        "",
        "### Facts",
    ]

    if dossier.facts:
        for k, v in sorted(dossier.facts.items()):
            lines.append(f"- {k}: {v}")
    else:
        lines.append("- (none)")

    lines.extend(["", "### Hypotheses to Validate"])
    if dossier.hypotheses:
        lines.extend([f"- {h}" for h in dossier.hypotheses])
    else:
        lines.append("- (none)")

    lines.extend(["", "### Unknowns (survey targets)"])
    if dossier.unknowns:
        lines.extend([f"- {u}" for u in dossier.unknowns])
    else:
        lines.append("- (none)")

    lines.extend(["", "## Sources (traceability)"])
    if dossier.sources:
        for s in dossier.sources:
            label = f" ({s.label})" if s.label else ""
            lines.append(f"- {s.url}{label} — accessed {s.accessed_at}")
            if s.notes:
                lines.append(f"  - Notes: {s.notes}")
    else:
        lines.append("- (none)")

    return "\n".join(lines)


def generate_survey(intake: Intake) -> str:
    lines: list[str] = [
        "# Discovery Survey (Generated)",
        "",
        f"Company: {intake.company_name}",
        f"Generated: {_utc_now_iso()}",
        "",
        "## Section A: Confirm Basics (from research)",
        f"- A1. Is this website correct? ({intake.website or '(unknown)'})",
        "- A2. What are your top 3 offers/services?",
        "",
        "## Section B: Tool Stack + Data",
        "- B1. What tools do you use for CRM/helpdesk/accounting/docs?",
        "- B2. Where is your knowledge base/SOPs stored?",
        "",
        "## Section C: Volumes (numbers)",
        "- C1. Tickets/week?",
        "- C2. Leads/week?",
        "- C3. Invoices/month?",
        "",
        "## Section D: Constraints",
        "- D1. Any compliance constraints? (GDPR/SOC2/HIPAA/PCI)",
        "- D2. Is customer PII present in tickets/emails?",
        "- D3. Who must approve process changes?",
        "",
        "## Section E: Artifacts",
        "- E1. Share 10–30 anonymized examples (tickets/emails/invoices).",
        "",
        "# Dynamic Follow-Ups (generated from hypotheses)",
    ]

    if not intake.hypotheses:
        lines.append("(No hypotheses provided; add to intake to generate.)")
        return "\n".join(lines)

    for idx, hypothesis in enumerate(intake.hypotheses, start=1):
        lines.extend(
            [
                "",
                f"## H{idx}: {hypothesis}",
                "- Trigger: what starts this workflow?",
                "- Inputs: what systems/docs are used?",
                "- Decision points: what choices are made?",
                "- Exceptions: when does it escalate?",
                "- Output: what must be produced?",
                "- SLA: how fast is it needed?",
            ]
        )

    return "\n".join(lines)


def opportunity_from_function(func: str) -> dict[str, Any]:
    # Starter opportunities are intentionally generic; follow-up intake should refine.
    if func.lower() == "support":
        return {
            "id": "support_triage_drafting",
            "function": "Support",
            "title": "Support: triage + draft replies",
            "problem": "Repetitive inbound tickets slow time-to-first-response",
            "proposed_solution": "AI-assisted classification + response drafting with KB citations (approval gate)",
            "risk_tier": 1,
        }
    if func.lower() == "sales":
        return {
            "id": "sales_lead_enrichment_first_touch",
            "function": "Sales",
            "title": "Sales: lead enrichment + first-touch draft",
            "problem": "Slow lead response time and inconsistent qualification notes",
            "proposed_solution": "Enrich lead + draft personalized outreach; write notes to CRM (approval gate)",
            "risk_tier": 1,
        }
    if func.lower() == "operations":
        return {
            "id": "ops_doc_intake_exception_routing",
            "function": "Operations",
            "title": "Ops: document intake + exception routing",
            "problem": "Manual data entry and exception handling for invoices/forms",
            "proposed_solution": "Extract fields + validate; route exceptions to owner (approval for payments)",
            "risk_tier": 2,
        }

    return {
        "id": f"{func.lower().replace(' ', '_')}_starter",
        "function": func,
        "title": f"{func}: starter opportunity",
        "problem": "(fill from follow-up intake)",
        "proposed_solution": "(agent/automation description)",
        "risk_tier": 1,
    }


def attach_scores(opportunity: dict[str, Any], *, followup: dict[str, Any] | None = None) -> dict[str, Any]:
    """Attach score placeholders and derived scores.

    If follow-up answers are provided, apply heuristic scoring.
    """

    out = dict(opportunity)
    out.setdefault(
        "scores",
        {
            "impact": None,
            "ease": None,
            "data_readiness": None,
            "risk": None,
            "time_to_value": None,
        },
    )

    if followup is not None:
        signals = parse_followup_answers(followup)
        out["scores"] = score_opportunity(str(out.get("id")), signals)

    scores = OpportunityScores(
        impact=out.get("scores", {}).get("impact"),
        ease=out.get("scores", {}).get("ease"),
        data_readiness=out.get("scores", {}).get("data_readiness"),
        risk=out.get("scores", {}).get("risk"),
        time_to_value=out.get("scores", {}).get("time_to_value"),
    )

    out["derived_scores"] = {
        "low_hanging": derived_low_hanging(scores),
        "strategic": derived_strategic(scores),
    }
    return out


def rank_opportunities(opportunities: list[dict[str, Any]]) -> list[RankedOpportunity]:
    ranked: list[RankedOpportunity] = []
    for o in opportunities:
        derived = o.get("derived_scores") or {}
        ranked.append(
            RankedOpportunity(
                id=str(o.get("id")),
                title=str(o.get("title")),
                function=str(o.get("function")),
                low_hanging_score=derived.get("low_hanging"),
                strategic_score=derived.get("strategic"),
                risk_tier=o.get("risk_tier"),
            )
        )

    # Primary rank: low-hanging (quick wins). Secondary: strategic.
    def sort_key(r: RankedOpportunity) -> tuple[int, int]:
        lh = r.low_hanging_score if r.low_hanging_score is not None else -999
        st = r.strategic_score if r.strategic_score is not None else -999
        return (lh, st)

    return sorted(ranked, key=sort_key, reverse=True)


def agent_spec_for_opportunity(opportunity: dict[str, Any]) -> dict[str, Any]:
    # Minimal mapping. A real implementation would expand based on client tools/policies.
    opp_id = str(opportunity.get("id"))
    return {
        "id": opp_id + "_agent_v1",
        "opportunity_id": opp_id,
        "job_to_be_done": str(opportunity.get("proposed_solution")),
        "autonomy_level": "L1",
        "triggers": ["(define trigger based on system events)"],
        "inputs": ["(define based on integrations + artifacts)"],
        "tools": ["(helpdesk/crm/docs APIs)"] ,
        "outputs": ["(draft, classification, routed task)"] ,
        "human_in_the_loop": {"approval_required": True, "who_approves": "(role)"},
        "guardrails": ["(policy citations)", "(no irreversible actions without approval)"],
        "evaluation": {
            "test_set": "(10-50 anonymized real examples)",
            "pass_fail": ["Correct routing", "Correct citations", "Tone compliance"],
        },
        "metrics": ["time_saved", "rewrite_rate", "error_rate"],
    }


def generate_plan_30_60_90(company_name: str) -> str:
    return "\n".join(
        [
            f"# 30/60/90 Plan: {company_name}",
            "",
            f"Generated: {_utc_now_iso()}",
            "",
            "## Days 0–30 (Quick wins + foundations)",
            "- Confirm research dossier + complete follow-up intake",
            "- Ship 1–2 low-risk workflows in shadow/approval mode",
            "- Define metrics and QA process",
            "",
            "## Days 31–60 (Scale + deepen integrations)",
            "- Expand to 3–5 workflows",
            "- Improve KB coverage and policy citations",
            "- Add monitoring + alerts",
            "",
            "## Days 61–90 (Operationalize + handover)",
            "- Raise autonomy where safe",
            "- Training + SOP updates",
            "- Establish owner + maintenance cadence",
        ]
    )


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="AI Integration Audit Generator (scaffold)")

    src = p.add_mutually_exclusive_group(required=True)
    src.add_argument("--intake", help="Path to intake JSON")
    src.add_argument("--company", help="Company name (company-name-only bootstrapping)")
    src.add_argument("--followup", help="Path to follow-up answers JSON (second pass: auto-score + rerank)")

    p.add_argument(
        "--base-intake",
        help="Optional base intake JSON to preserve company name/context in follow-up mode",
    )

    p.add_argument("--research-provider", default="stub", help="Research provider (default: stub)")
    p.add_argument("--out", required=True, help="Output directory")

    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    out_dir = Path(args.out)
    ensure_out_dir(out_dir)

    dossier: ResearchDossier | None = None
    followup: dict[str, Any] | None = None

    if args.intake:
        intake = load_intake(Path(args.intake))
    elif args.followup:
        followup = json.loads(Path(args.followup).read_text(encoding="utf-8"))

        base_path = Path(args.base_intake) if args.base_intake else Path("client/intake.json")
        if base_path.exists():
            intake = load_intake(base_path)
        else:
            intake = Intake(
                company_name="(unknown)",
                website="",
                industry=None,
                size=None,
                primary_functions=["Support", "Sales", "Operations"],
                constraints={},
                hypotheses=[],
            )
    else:
        provider = get_provider(str(args.research_provider))
        dossier = provider.research(str(args.company))
        intake = intake_from_dossier(dossier)

    # Dossier outputs (if we have one)
    if dossier is not None:
        write_file(out_dir / "company_dossier.md", dossier_to_markdown(dossier))
        write_json(out_dir / "company_dossier.json", asdict(dossier))
    else:
        # Keep file present for consistency
        write_file(
            out_dir / "company_dossier.md",
            dossier_to_markdown(
                ResearchDossier(
                    company_name=intake.company_name,
                    guessed_website=intake.website or None,
                    facts={"note": "No research provider was used; dossier derived from intake only."},
                    hypotheses=intake.hypotheses,
                    unknowns=[],
                    sources=[],
                )
            ),
        )

    # Survey
    write_file(out_dir / "survey.generated.md", generate_survey(intake))

    # Opportunities
    base_opps = [opportunity_from_function(f) for f in (intake.primary_functions or [])]
    opps = [attach_scores(o, followup=followup) for o in base_opps]

    write_json(
        out_dir / "opportunities.json",
        {
            "company": intake.company_name,
            "generated": _utc_now_iso(),
            "opportunities": opps,
        },
    )

    # One-per-file opportunity cards + agent specs
    for o in opps:
        write_json(out_dir / "opportunity_cards" / f"{o['id']}.json", o)
        write_json(out_dir / "agent_specs" / f"{o['id']}_agent_v1.json", agent_spec_for_opportunity(o))

    # Report + plan + follow-up intake
    ranked = rank_opportunities(opps)
    assumptions = []
    if dossier is not None:
        assumptions = dossier.unknowns
    assumptions.extend(
        [
            "Provide workflow volumes and top ticket/lead categories",
            "Provide tool stack and permission constraints",
            "Provide 10–30 anonymized samples for evaluation",
        ]
    )

    roadmap = generate_plan_30_60_90(intake.company_name)

    report = render_executive_report(
        company_name=intake.company_name,
        website=intake.website or (dossier.guessed_website if dossier else None),
        opportunities=ranked,
        assumptions=assumptions,
        next_steps=[
            "Complete follow-up intake form",
            "Select 1–2 quick wins for a 7–14 day pilot",
            "Run in shadow/approval mode and measure time saved + quality",
        ],
        roadmap_30_60_90=roadmap,
    )
    write_file(out_dir / "client_report.md", report)

    write_file(out_dir / "plan_30_60_90.md", roadmap)
    write_json(out_dir / "followup_intake_form.json", followup_intake_form_schema())

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
