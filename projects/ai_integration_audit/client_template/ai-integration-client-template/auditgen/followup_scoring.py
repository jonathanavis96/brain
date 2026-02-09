"""Second-pass scoring from follow-up intake answers.

Goal:
- take the tool-agnostic follow-up intake answers
- populate opportunity scores with reasonable heuristics
- make ranking useful quickly

This is intentionally conservative and should be treated as a starting point.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class FollowupSignals:
    tickets_per_week: int | None
    leads_per_week: int | None
    invoices_per_month: int | None
    pii_present: bool | None
    compliance: list[str]


def parse_followup_answers(data: dict[str, Any]) -> FollowupSignals:
    # Accept either flat dict or {sections:[...]} style answers.
    flat = dict(data)

    if "sections" in data and isinstance(data["sections"], list):
        for sec in data["sections"]:
            if not isinstance(sec, dict):
                continue
            for q in sec.get("questions", []) or []:
                if isinstance(q, dict) and "id" in q and "answer" in q:
                    flat[str(q["id"])] = q["answer"]

    def as_int(v: Any) -> int | None:
        try:
            if v is None or v == "":
                return None
            return int(v)
        except Exception:
            return None

    def as_bool(v: Any) -> bool | None:
        if v is None or v == "":
            return None
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            if v.strip().lower() in {"true", "yes", "y", "1"}:
                return True
            if v.strip().lower() in {"false", "no", "n", "0"}:
                return False
        return None

    compliance = flat.get("compliance")
    if compliance is None:
        compliance_list: list[str] = []
    elif isinstance(compliance, list):
        compliance_list = [str(x) for x in compliance]
    else:
        compliance_list = [str(compliance)]

    return FollowupSignals(
        tickets_per_week=as_int(flat.get("tickets_per_week")),
        leads_per_week=as_int(flat.get("leads_per_week")),
        invoices_per_month=as_int(flat.get("invoices_per_month")),
        pii_present=as_bool(flat.get("pii_present")),
        compliance=[c for c in compliance_list if c and c != "None"],
    )


def _band(v: int | None, *, low: int, high: int) -> int | None:
    if v is None:
        return None
    if v < low:
        return 1
    if v < high:
        return 3
    return 5


def score_opportunity(opportunity_id: str, signals: FollowupSignals) -> dict[str, int | None]:
    """Return a scores dict matching the generator schema."""

    # Conservative defaults.
    risk = 2 if signals.pii_present else 1
    if signals.compliance:
        risk = max(risk, 3)

    # Generic ease/data readiness are unknown without tool stack; keep mid.
    ease = 3
    data_readiness = 3
    time_to_value = 3

    impact: int | None = None

    if opportunity_id.startswith("support"):
        impact = _band(signals.tickets_per_week, low=20, high=100)
        time_to_value = 4
        ease = 4
    elif opportunity_id.startswith("sales"):
        impact = _band(signals.leads_per_week, low=10, high=50)
        time_to_value = 4
        ease = 4
    elif opportunity_id.startswith("ops"):
        impact = _band(signals.invoices_per_month, low=30, high=200)
        time_to_value = 3
        ease = 3
        risk = max(risk, 2)

    return {
        "impact": impact,
        "ease": ease,
        "data_readiness": data_readiness,
        "risk": risk,
        "time_to_value": time_to_value,
    }
