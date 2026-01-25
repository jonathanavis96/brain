"""Test parsing of new triple-colon markers from loop.sh."""

from pathlib import Path
from tempfile import NamedTemporaryFile

from rollflow_analyze.parsers.marker_parser import MarkerParser


class TestTripleColonMarkers:
    """Test new :::MARKER::: format from loop.sh."""

    def test_parse_tool_start_end(self):
        """Test :::TOOL_START::: and :::TOOL_END::: parsing."""
        log_content = """\
:::TOOL_START::: id=tool_001 tool=acli_rovodev cache_key=abc123 git_sha=def456 ts=2026-01-25T12:00:00Z
Some log output here
:::TOOL_END::: id=tool_001 result=PASS exit=0 duration_ms=1234 ts=2026-01-25T12:00:01Z
"""
        with NamedTemporaryFile(mode="w", suffix=".log", delete=False) as f:
            f.write(log_content)
            f.flush()
            log_path = Path(f.name)

        try:
            parser = MarkerParser()
            calls = list(parser.parse_file(log_path))

            assert len(calls) == 1
            call = calls[0]
            assert call.id == "tool_001"
            assert call.tool_name == "acli_rovodev"
            assert call.cache_key == "abc123"
            assert call.status.value == "PASS"
            assert call.exit_code == 0
            assert call.duration_ms == 1234
        finally:
            log_path.unlink()

    def test_parse_tool_end_fail(self):
        """Test :::TOOL_END::: with FAIL result."""
        log_content = """\
:::TOOL_START::: id=tool_002 tool=pre-commit cache_key=xyz789 git_sha=abc123 ts=2026-01-25T12:00:00Z
Error: Hook failed
:::TOOL_END::: id=tool_002 result=FAIL exit=1 duration_ms=567 reason=hook_failure ts=2026-01-25T12:00:01Z
"""
        with NamedTemporaryFile(mode="w", suffix=".log", delete=False) as f:
            f.write(log_content)
            f.flush()
            log_path = Path(f.name)

        try:
            parser = MarkerParser()
            calls = list(parser.parse_file(log_path))

            assert len(calls) == 1
            call = calls[0]
            assert call.id == "tool_002"
            assert call.tool_name == "pre-commit"
            assert call.status.value == "FAIL"
            assert call.exit_code == 1
            assert call.duration_ms == 567
            assert call.error_excerpt == "hook_failure"
        finally:
            log_path.unlink()

    def test_parse_iter_start(self):
        """Test :::ITER_START::: updates context."""
        log_content = """\
:::ITER_START::: iter=5 run_id=run_abc123 ts=2026-01-25T12:00:00Z
:::TOOL_START::: id=tool_003 tool=shellcheck cache_key=key123 git_sha=sha456 ts=2026-01-25T12:00:01Z
:::TOOL_END::: id=tool_003 result=PASS exit=0 duration_ms=100 ts=2026-01-25T12:00:02Z
"""
        with NamedTemporaryFile(mode="w", suffix=".log", delete=False) as f:
            f.write(log_content)
            f.flush()
            log_path = Path(f.name)

        try:
            parser = MarkerParser()
            calls = list(parser.parse_file(log_path))

            assert len(calls) == 1
            call = calls[0]
            assert call.iter_id == "5"
            assert call.run_id == "run_abc123"
        finally:
            log_path.unlink()

    def test_parse_mixed_old_and_new_markers(self):
        """Test backward compatibility with old ::TOOL_CALL_START:: markers."""
        log_content = """\
::TOOL_CALL_START:: id=old_001 name=old_tool key=old_key ts=2026-01-25T12:00:00Z
::TOOL_CALL_END:: id=old_001 status=PASS exit=0 duration_ms=50 ts=2026-01-25T12:00:01Z
:::TOOL_START::: id=new_001 tool=new_tool cache_key=new_key git_sha=sha123 ts=2026-01-25T12:00:02Z
:::TOOL_END::: id=new_001 result=PASS exit=0 duration_ms=100 ts=2026-01-25T12:00:03Z
"""
        with NamedTemporaryFile(mode="w", suffix=".log", delete=False) as f:
            f.write(log_content)
            f.flush()
            log_path = Path(f.name)

        try:
            parser = MarkerParser()
            calls = list(parser.parse_file(log_path))

            assert len(calls) == 2

            # Old format call
            old_call = calls[0]
            assert old_call.id == "old_001"
            assert old_call.tool_name == "old_tool"
            assert old_call.status.value == "PASS"

            # New format call
            new_call = calls[1]
            assert new_call.id == "new_001"
            assert new_call.tool_name == "new_tool"
            assert new_call.status.value == "PASS"
        finally:
            log_path.unlink()

    def test_parse_informational_markers(self):
        """Test that informational markers don't break parsing."""
        log_content = """\
:::ITER_START::: iter=1 run_id=run_001 ts=2026-01-25T12:00:00Z
:::PHASE_START::: iter=1 phase=build run_id=run_001 ts=2026-01-25T12:00:01Z
:::CACHE_CONFIG::: mode=auto scope=verify,read exported=1 iter=1 ts=2026-01-25T12:00:02Z
:::CACHE_GUARD::: iter=1 allowed=1 reason=no_pending_tasks phase=BUILD ts=2026-01-25T12:00:03Z
:::VERIFIER_ENV::: iter=1 ts=2026-01-25T12:00:04Z run_id=run_001
:::TOOL_START::: id=tool_004 tool=verifier cache_key=key456 git_sha=sha789 ts=2026-01-25T12:00:05Z
:::CACHE_HIT::: cache_key=key456 tool=verifier ts=2026-01-25T12:00:06Z
:::TOOL_END::: id=tool_004 result=PASS exit=0 duration_ms=10 ts=2026-01-25T12:00:07Z
:::PHASE_END::: iter=1 phase=build status=ok run_id=run_001 ts=2026-01-25T12:00:08Z
:::ITER_END::: iter=1 run_id=run_001 ts=2026-01-25T12:00:09Z
"""
        with NamedTemporaryFile(mode="w", suffix=".log", delete=False) as f:
            f.write(log_content)
            f.flush()
            log_path = Path(f.name)

        try:
            parser = MarkerParser()
            calls = list(parser.parse_file(log_path))

            assert len(calls) == 1
            call = calls[0]
            assert call.id == "tool_004"
            assert call.tool_name == "verifier"
            assert call.status.value == "PASS"
            assert call.iter_id == "1"
            assert call.run_id == "run_001"
        finally:
            log_path.unlink()
