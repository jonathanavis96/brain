"""Tests for tools/thunk_parser.py row parsing."""

from pathlib import Path

from tools.thunk_parser import ThunkParser

HEADER = (
    "## Era 1: Start\n\n"
    "| THUNK # | Original # | Priority | Description | Completed |\n"
    "|---|---|---|---|---|\n"
)


def _parse(tmp_path: Path, rows: str):
    f = tmp_path / "THUNK.md"
    f.write_text(HEADER + rows, encoding="utf-8")
    return ThunkParser(f).parse()


def test_row_with_escaped_pipe_in_description_is_kept(tmp_path):
    entries = _parse(
        tmp_path,
        "| 1 | 1.1 | HIGH | plain | 2026-01-01 |\n"
        "| 2 | 1.2 | HIGH | use `a \\| b` in grep | 2026-01-02 |\n",
    )
    assert [e.thunk_num for e in entries] == [1, 2]
    assert entries[1].description == "use `a | b` in grep"
    assert entries[1].completed == "2026-01-02"


def test_row_with_empty_cell_is_kept(tmp_path):
    entries = _parse(tmp_path, "| 7 |  | MEDIUM | no original id | 2026-01-03 |\n")
    assert len(entries) == 1
    assert entries[0].thunk_num == 7
    assert entries[0].original_id == ""
    assert entries[0].priority == "MEDIUM"
