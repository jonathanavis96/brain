"""Scoring utilities for opportunity cards."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class OpportunityScores:
    impact: int | None
    ease: int | None
    data_readiness: int | None
    risk: int | None
    time_to_value: int | None


def derived_low_hanging(scores: OpportunityScores) -> int | None:
    if (
        scores.ease is None
        or scores.data_readiness is None
        or scores.time_to_value is None
        or scores.risk is None
    ):
        return None
    return (scores.ease + scores.data_readiness + scores.time_to_value) - scores.risk


def derived_strategic(scores: OpportunityScores) -> int | None:
    if scores.impact is None or scores.risk is None:
        return None
    return scores.impact - scores.risk
