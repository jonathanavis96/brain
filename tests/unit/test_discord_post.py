"""bin/discord-post --dry-run: payload content must equal the input text."""

import http.server
import json
import shutil
import subprocess
import threading
import time
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / "bin" / "discord-post"

pytestmark = pytest.mark.skipif(shutil.which("jq") is None, reason="jq not installed")


def _payloads(text: str, *args: str):
    result = subprocess.run(
        ["bash", str(SCRIPT), "--dry-run", *args],
        input=text,
        capture_output=True,
        text=True,
        timeout=30,
        env={"PATH": "/usr/bin:/bin"},
    )
    assert result.returncode == 0, result.stderr
    # Each chunk is printed as a header line followed by pretty JSON.
    blocks = result.stdout.split("=== DRY RUN: Chunk ")[1:]
    return [json.loads(b.split("===\n", 1)[1])["content"] for b in blocks]


class _Handler(http.server.BaseHTTPRequestHandler):
    mode = "429"

    def do_POST(self):  # noqa: N802
        if self.mode == "hang":
            time.sleep(5)
            return
        self.send_response(429)
        self.end_headers()
        self.wfile.write(b'{"message": "rate limited"}')

    def log_message(self, *args):
        pass


def _post_to_local(mode: str):
    _Handler.mode = mode
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), _Handler)
    server.daemon_threads = True
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        start = time.monotonic()
        result = subprocess.run(
            ["bash", str(SCRIPT)],
            input="hello",
            capture_output=True,
            text=True,
            timeout=30,
            env={
                "PATH": "/usr/bin:/bin",
                "DISCORD_WEBHOOK_URL": f"http://127.0.0.1:{server.server_port}/hook",
                "DISCORD_TIMEOUT": "1",
            },
        )
        return result, time.monotonic() - start
    finally:
        server.shutdown()
        server.server_close()


def test_http_error_is_reported_not_silent():
    result, _ = _post_to_local("429")
    assert result.returncode == 0
    assert "Failed to send chunk 1/1" in result.stderr


def test_hung_webhook_times_out():
    result, elapsed = _post_to_local("hang")
    assert result.returncode == 0
    assert "Failed to send chunk 1/1" in result.stderr
    assert elapsed < 4


def test_backslash_sequences_are_sent_verbatim():
    text = r"path C:\new\table and regex \d+\t and \\server" + "\nsecond line"
    assert _payloads(text) == [text + "\n"]


def test_chunk_prefix_still_has_real_newlines():
    text = "a" * 30 + "\n" + "b\\n" * 10
    contents = _payloads(text, "--max-length", "32")
    assert contents[0].startswith("[Part 1/2]\n\n" + "a" * 30)
    assert contents[1] == "[Part 2/2]\n\n" + "b\\n" * 10 + "\n"
