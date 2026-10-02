"""Gap radar must not crash on malformed entries in its JSON input."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "gap_radar"))

import coverage_report  # noqa: E402
import match_skills  # noqa: E402

MAPPINGS = {r"SC\d+": "domains/languages/shell/common-pitfalls.md"}


def test_match_skips_non_dict_entries_and_numeric_codes():
    errors = [
        {"error_code": "SC2086", "file": "a.sh"},
        None,
        "SC2034",
        {"error_code": 404},
        {"file": "no-code.sh"},
    ]
    results = match_skills.match_errors_to_skills(errors, MAPPINGS)
    codes = [(r.get("error_code"), r["covered"]) for r in results]
    assert codes == [("SC2086", True), ("404", False), ("", False)]


def test_coverage_stats_tolerate_missing_error_code():
    results = [
        {"error_code": "SC2086", "covered": True},
        {"covered": False},
        {"error_code": "MD040", "covered": False},
    ]
    stats = coverage_report.calculate_coverage_stats(results)
    assert stats["total"] == 3
    assert stats["uncovered"] == 2
    assert dict(stats["top_uncovered"]) == {"unknown": 1, "MD040": 1}
    report = coverage_report.generate_markdown_report(stats, results)
    assert "`unknown`" in report
