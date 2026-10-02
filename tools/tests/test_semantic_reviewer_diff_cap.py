"""_get_diff_against must stop reading once max_bytes is reached."""

import io

from tools import semantic_reviewer
from tools.semantic_reviewer import SemanticReviewer

TOTAL = 4_000_000
CAP = 100_000


class FakeProc:
    """Bounded stand-in for `git diff` whose communicate() drains stdout like the real one."""

    def __init__(self):
        self.stdout = io.BytesIO(b"diff line\n" * (TOTAL // 10))
        self.returncode = None
        self.killed = False

    def kill(self):
        self.killed = True
        self.returncode = -9

    def wait(self, timeout=None):
        return self.returncode

    def communicate(self, timeout=None):
        rest = b"" if self.stdout.closed else self.stdout.read()
        if self.returncode is None:
            self.returncode = 0
        return rest, b""


def test_truncated_diff_does_not_drain_rest_of_output(monkeypatch):
    procs = []

    def fake_popen(cmd, *args, **kwargs):
        procs.append(FakeProc())
        return procs[-1]

    monkeypatch.setattr(semantic_reviewer.subprocess, "Popen", fake_popen)
    reviewer = SemanticReviewer()
    monkeypatch.setattr(reviewer, "_resolve_base_ref", lambda branch: "base")

    # Record how far stdout was read before it was closed or abandoned.
    proc_holder = {}
    real_fake_popen = fake_popen

    def tracking_popen(cmd, *args, **kwargs):
        proc = real_fake_popen(cmd, *args, **kwargs)
        real_close = proc.stdout.close

        def close():
            proc_holder["pos_at_close"] = proc.stdout.tell()
            real_close()

        proc.stdout.close = close
        return proc

    monkeypatch.setattr(semantic_reviewer.subprocess, "Popen", tracking_popen)

    diff = reviewer._get_diff_against("main", max_bytes=CAP)

    assert diff is not None
    assert "[TRUNCATED]" in diff
    assert diff.startswith("diff line\n")
    proc = procs[-1]
    consumed = proc_holder.get("pos_at_close", None)
    if consumed is None:
        consumed = proc.stdout.tell()
    # One 64 KiB read past the cap is allowed; draining the rest is the bug.
    assert consumed <= CAP + 64 * 1024, consumed
    assert proc.killed
