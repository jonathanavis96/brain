#!/usr/bin/env python3
"""
Cerebras Agentic Runner - Lean Edition

Token-efficient agentic loop for Cerebras's fast inference.
Optimized for minimal context: ~5K tokens base instead of ~30K.

Design principles:
1. STATELESS - No history accumulation; rebuild context each turn
2. LEAN TOOLS - Minimal tool schemas (~50 lines vs ~300)
3. NO DUPLICATE INJECTION - loop.sh injects AGENTS.md, we don't
4. DIFF-ONLY - Send changes, not full files

Usage:
    python3 cerebras_agent.py --prompt <file> --model <model> [--max-turns 15]

Environment:
    CEREBRAS_API_KEY: Required API key from cloud.cerebras.ai
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path

# Try requests, fall back to urllib
try:
    import requests

    HAS_REQUESTS = True
except ImportError:
    import urllib.request
    import urllib.error

    HAS_REQUESTS = False


# =============================================================================
# Configuration
# =============================================================================

CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions"
DEFAULT_MODEL = "qwen-3-32b"
DEFAULT_MAX_TURNS = (
    24  # Hard cap for token budget (24 allows read→implement→verify→commit cycle)
)
DEFAULT_MAX_TOKENS = 16384
DEFAULT_TEMPERATURE = 0.2

# Rate limits
MAX_RETRIES = 5
INITIAL_BACKOFF = 5

# Context files that trigger gist-then-prune (paths end with these)
CONTEXT_FILES = ("AGENTS.md", "NEURONS.md", "THOUGHTS.md")
CONTEXT_SIZE_THRESHOLD = 1500  # chars - trigger gist if read is larger


# =============================================================================
# Minimal Tool Definitions (~50 lines vs ~300)
# =============================================================================

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "bash",
            "description": "Run shell command",
            "parameters": {
                "type": "object",
                "properties": {"command": {"type": "string"}},
                "required": ["command"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read file (<100 lines)",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "required": ["path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "head_file",
            "description": "First N lines",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "lines": {"type": "integer", "default": 50},
                },
                "required": ["path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "tail_file",
            "description": "Last N lines",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "lines": {"type": "integer", "default": 20},
                },
                "required": ["path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "grep",
            "description": "Search pattern",
            "parameters": {
                "type": "object",
                "properties": {
                    "pattern": {"type": "string"},
                    "path": {"type": "string", "default": "."},
                    "include": {"type": "string", "default": ""},
                },
                "required": ["pattern"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Write file",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                },
                "required": ["path", "content"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "patch_file",
            "description": "Find/replace in file",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "find": {"type": "string"},
                    "replace": {"type": "string"},
                },
                "required": ["path", "find", "replace"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "append_file",
            "description": "Append to file",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                },
                "required": ["path", "content"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_dir",
            "description": "List directory",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string", "default": "."}},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "git_status",
            "description": "Branch + status + recent commits",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "git_commit",
            "description": "Stage and commit (auto-retries pre-commit)",
            "parameters": {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "files": {"type": "string", "default": "."},
                },
                "required": ["message"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "diff",
            "description": "Show unstaged changes",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string", "default": "."}},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "think",
            "description": "Scratchpad for reasoning",
            "parameters": {
                "type": "object",
                "properties": {"thought": {"type": "string"}},
                "required": ["thought"],
            },
        },
    },
]


# =============================================================================
# ANSI Colors (minimal)
# =============================================================================


class S:
    """Styles."""

    R = "\033[0m"  # Reset
    B = "\033[1m"  # Bold
    RED = "\033[31m"
    GRN = "\033[32m"
    YEL = "\033[33m"
    CYN = "\033[36m"
    GRY = "\033[90m"


def pr(msg: str, style: str = ""):
    """Print with optional style."""
    print(f"{style}{msg}{S.R}" if style else msg)


# =============================================================================
# Tool Execution
# =============================================================================


@dataclass
class ToolResult:
    success: bool
    output: str
    error: str = ""


def run_bash(cmd: str, cwd: str = None, timeout: int = 300) -> ToolResult:
    """Execute bash command."""
    try:
        r = subprocess.run(
            ["bash", "-c", cmd],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd,
        )
        out = r.stdout[:8000] if len(r.stdout) > 8000 else r.stdout
        err = r.stderr[:2000] if len(r.stderr) > 2000 else r.stderr
        output = (
            out + (f"\n[stderr]: {err}" if err else "") + f"\n[exit: {r.returncode}]"
        )
        return ToolResult(r.returncode == 0, output.strip())
    except subprocess.TimeoutExpired:
        return ToolResult(False, "", f"Timeout after {timeout}s")
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_read_file(path: str, cwd: str = None) -> ToolResult:
    """Read entire file."""
    try:
        p = Path(cwd or ".") / path
        if not p.exists():
            return ToolResult(False, "", f"Not found: {path}")
        content = p.read_text(encoding="utf-8", errors="replace")
        if len(content) > 20000:
            content = content[:20000] + "\n... (truncated)"
        return ToolResult(True, f"[{content.count(chr(10))+1} lines]\n{content}")
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_head_file(path: str, lines: int = 50, cwd: str = None) -> ToolResult:
    """Read first N lines."""
    try:
        p = Path(cwd or ".") / path
        if not p.exists():
            return ToolResult(False, "", f"Not found: {path}")
        with open(p, "r", encoding="utf-8", errors="replace") as f:
            result = []
            for i, line in enumerate(f):
                if i >= lines:
                    break
                result.append(line.rstrip("\n"))
        return ToolResult(True, f"[{len(result)} lines]\n" + "\n".join(result))
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_tail_file(path: str, lines: int = 20, cwd: str = None) -> ToolResult:
    """Read last N lines."""
    try:
        p = Path(cwd or ".") / path
        if not p.exists():
            return ToolResult(False, "", f"Not found: {path}")
        all_lines = p.read_text(encoding="utf-8", errors="replace").split("\n")
        selected = all_lines[-lines:] if len(all_lines) > lines else all_lines
        return ToolResult(
            True,
            f"[last {len(selected)} of {len(all_lines)} lines]\n" + "\n".join(selected),
        )
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_grep(
    pattern: str, path: str = ".", include: str = "", cwd: str = None
) -> ToolResult:
    """Search for pattern."""
    try:
        cmd = ["grep", "-rn", "--color=never"]
        if include:
            cmd.extend(["--include", include])
        cmd.extend(["-E", pattern, path])
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30, cwd=cwd)
        if not r.stdout.strip():
            return ToolResult(True, "[0 matches]")
        lines = r.stdout.strip().split("\n")
        if len(lines) > 50:
            return ToolResult(
                True,
                f"[{len(lines)} matches]\n"
                + "\n".join(lines[:50])
                + "\n... (truncated)",
            )
        return ToolResult(True, f"[{len(lines)} matches]\n" + r.stdout.strip())
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_write_file(path: str, content: str, cwd: str = None) -> ToolResult:
    """Write file."""
    try:
        p = Path(cwd or ".") / path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        return ToolResult(True, f"[wrote {len(content)} bytes to {path}]")
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_patch_file(path: str, find: str, replace: str, cwd: str = None) -> ToolResult:
    """Find/replace in file."""
    try:
        p = Path(cwd or ".") / path
        if not p.exists():
            return ToolResult(False, "", f"Not found: {path}")
        content = p.read_text(encoding="utf-8")
        if find not in content:
            return ToolResult(
                False,
                "",
                f"Pattern not found. Use head_file {path} to see actual content.",
            )
        count = content.count(find)
        p.write_text(content.replace(find, replace), encoding="utf-8")
        return ToolResult(True, f"[patched {count} occurrence(s)]")
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_append_file(path: str, content: str, cwd: str = None) -> ToolResult:
    """Append to file."""
    try:
        p = Path(cwd or ".") / path
        p.parent.mkdir(parents=True, exist_ok=True)
        if not content.endswith("\n"):
            content += "\n"
        with open(p, "a", encoding="utf-8") as f:
            f.write(content)
        return ToolResult(True, f"[appended {len(content)} chars]")
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_list_dir(path: str = ".", cwd: str = None) -> ToolResult:
    """List directory."""
    try:
        p = Path(cwd or ".") / path
        if not p.exists():
            return ToolResult(False, "", f"Not found: {path}")
        entries = []
        for e in sorted(p.iterdir())[:100]:
            if e.is_dir():
                entries.append(f"{e.name}/")
            else:
                entries.append(e.name)
        return ToolResult(True, "\n".join(entries))
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_git_status(cwd: str = None) -> ToolResult:
    """Git status, branch, recent commits."""
    try:
        w = cwd or "."
        branch = (
            subprocess.run(
                ["git", "branch", "--show-current"],
                capture_output=True,
                text=True,
                cwd=w,
                timeout=10,
            ).stdout.strip()
            or "(detached)"
        )
        status = (
            subprocess.run(
                ["git", "status", "--short"],
                capture_output=True,
                text=True,
                cwd=w,
                timeout=10,
            ).stdout.strip()
            or "(clean)"
        )
        log = subprocess.run(
            ["git", "log", "--oneline", "-3"],
            capture_output=True,
            text=True,
            cwd=w,
            timeout=10,
        ).stdout.strip()
        return ToolResult(
            True, f"Branch: {branch}\n\nStatus:\n{status}\n\nRecent:\n{log}"
        )
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_git_commit(message: str, files: str = ".", cwd: str = None) -> ToolResult:
    """Stage and commit with pre-commit retry."""
    try:
        w = cwd or "."
        # Stage
        r = subprocess.run(
            ["git", "add"] + files.split(),
            capture_output=True,
            text=True,
            cwd=w,
            timeout=30,
        )
        if r.returncode != 0:
            return ToolResult(False, "", f"git add failed: {r.stderr}")
        # Commit with retry
        for attempt in range(2):
            r = subprocess.run(
                ["git", "commit", "-m", message],
                capture_output=True,
                text=True,
                cwd=w,
                timeout=60,
            )
            if r.returncode == 0:
                return ToolResult(True, f"[committed]\n{r.stdout.strip()}")
            if "nothing to commit" in r.stdout.lower():
                return ToolResult(True, "[nothing to commit]")
            if (
                "files were modified by this hook" in (r.stdout + r.stderr)
                and attempt == 0
            ):
                subprocess.run(
                    ["git", "add", "-A"], capture_output=True, cwd=w, timeout=30
                )
                continue
            return ToolResult(False, "", f"git commit failed: {r.stderr or r.stdout}")
        return ToolResult(False, "", "commit failed after retry")
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_diff(path: str = ".", cwd: str = None) -> ToolResult:
    """Show unstaged changes."""
    try:
        cmd = ["git", "diff"] + ([path] if path != "." else [])
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30, cwd=cwd)
        diff = r.stdout.strip()
        if not diff:
            return ToolResult(True, "[no changes]")
        lines = diff.split("\n")
        if len(lines) > 100:
            return ToolResult(
                True, "\n".join(lines[:100]) + f"\n... ({len(lines)-100} more lines)"
            )
        return ToolResult(True, diff)
    except Exception as e:
        return ToolResult(False, "", str(e))


def run_think(thought: str, cwd: str = None) -> ToolResult:
    """Scratchpad - just acknowledge."""
    return ToolResult(True, f"[thought: {len(thought)} chars]")


def execute_tool(name: str, args: dict, cwd: str = None) -> ToolResult:
    """Dispatch tool execution."""
    handlers = {
        "bash": lambda: run_bash(args.get("command", ""), cwd),
        "read_file": lambda: run_read_file(args.get("path", ""), cwd),
        "head_file": lambda: run_head_file(
            args.get("path", ""), args.get("lines", 50), cwd
        ),
        "tail_file": lambda: run_tail_file(
            args.get("path", ""), args.get("lines", 20), cwd
        ),
        "grep": lambda: run_grep(
            args.get("pattern", ""), args.get("path", "."), args.get("include", ""), cwd
        ),
        "write_file": lambda: run_write_file(
            args.get("path", ""), args.get("content", ""), cwd
        ),
        "patch_file": lambda: run_patch_file(
            args.get("path", ""), args.get("find", ""), args.get("replace", ""), cwd
        ),
        "append_file": lambda: run_append_file(
            args.get("path", ""), args.get("content", ""), cwd
        ),
        "list_dir": lambda: run_list_dir(args.get("path", "."), cwd),
        "git_status": lambda: run_git_status(cwd),
        "git_commit": lambda: run_git_commit(
            args.get("message", ""), args.get("files", "."), cwd
        ),
        "diff": lambda: run_diff(args.get("path", "."), cwd),
        "think": lambda: run_think(args.get("thought", ""), cwd),
    }
    if name in handlers:
        return handlers[name]()
    return ToolResult(False, "", f"Unknown tool: {name}")


# =============================================================================
# Cerebras Client
# =============================================================================


class CerebrasClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.total_tokens = 0
        self.current_turn = 0
        self.current_model = ""

    def chat(self, messages: list, model: str, tools: list = None) -> dict:
        """Call Cerebras API with retry."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": DEFAULT_MAX_TOKENS,
            "temperature": DEFAULT_TEMPERATURE,
        }
        if tools:
            payload["tools"] = tools

        backoff = INITIAL_BACKOFF
        for attempt in range(MAX_RETRIES):
            try:
                if HAS_REQUESTS:
                    r = requests.post(
                        CEREBRAS_API_URL, headers=headers, json=payload, timeout=120
                    )
                    if r.status_code == 429:
                        pr(f"  Rate limited, waiting {backoff}s...", S.YEL)
                        time.sleep(backoff)
                        backoff = min(backoff * 2, 60)
                        continue
                    if r.status_code == 422:
                        # 422 = bad request, don't retry - log and fail fast
                        pr(f"  422 Error - Response: {r.text[:500]}", S.RED)
                        pr(
                            f"  Messages: {len(messages)}, roles: {[m.get('role') for m in messages]}",
                            S.RED,
                        )
                        for i, m in enumerate(messages):
                            if m.get("role") == "assistant" and m.get("tool_calls"):
                                pr(
                                    f"    msg[{i}] tool_calls: {[tc['id'][:15] for tc in m['tool_calls']]}",
                                    S.YEL,
                                )
                            if m.get("role") == "tool":
                                pr(
                                    f"    msg[{i}] tool result for: {m.get('tool_call_id', 'unknown')[:15]}",
                                    S.YEL,
                                )
                        raise ValueError(f"422 Unprocessable Entity: {r.text[:200]}")
                    r.raise_for_status()
                    data = r.json()
                else:
                    req = urllib.request.Request(
                        CEREBRAS_API_URL,
                        data=json.dumps(payload).encode(),
                        headers=headers,
                        method="POST",
                    )
                    with urllib.request.urlopen(req, timeout=120) as resp:
                        data = json.loads(resp.read().decode())

                # Track usage (prompt + completion = total)
                if "usage" in data:
                    usage = data["usage"]
                    prompt_tok = usage.get("prompt_tokens", 0)
                    completion_tok = usage.get("completion_tokens", 0)
                    total = usage.get("total_tokens", 0)
                    cached = usage.get("cached_tokens", 0)
                    self.total_tokens += total
                    self.current_model = model
                    # Debug: show per-call breakdown with model and turn
                    cache_str = f" cached={cached}" if cached else ""
                    pr(
                        f"  [turn={self.current_turn} model={model} p={prompt_tok} c={completion_tok} t={total}{cache_str} cum={self.total_tokens}]",
                        S.GRY,
                    )
                return data

            except Exception as e:
                if attempt < MAX_RETRIES - 1:
                    pr(f"  Retry {attempt+1}: {e}", S.YEL)
                    time.sleep(backoff)
                    backoff = min(backoff * 2, 60)
                else:
                    raise


# =============================================================================
# Agent (Stateless Design)
# =============================================================================


class Agent:
    """
    Token-efficient agent with gist-then-prune architecture.

    Flow:
    1. Tiny base prompt (~200 tokens) + task header
    2. Agent reads AGENTS.md/NEURONS.md via tools (lazy loading)
    3. After large context reads, agent writes STATE summary
    4. Raw reads are pruned, keeping only the STATE gist
    5. Hard cap at 8 turns for budget discipline
    """

    def __init__(self, client: CerebrasClient, model: str, cwd: str = None):
        self.client = client
        self.model = model
        self.cwd = cwd
        self.messages = []
        self._context_read_ids = []  # tool_call_ids for large context reads
        self._needs_state = False
        self._state_written = False
        self._state_content = None  # Single-slot STATE storage
        self._context_files_read = set()  # Track which context files have been read
        self._verifier_failed = (
            False  # Escape hatch: allow rereads after verifier FAIL/WARN
        )

    def _is_context_file_read(
        self, tool_name: str, args: dict, output_len: int
    ) -> bool:
        """Check if this tool call read a large context file."""
        if tool_name not in ("read_file", "head_file"):
            return False
        path = args.get("path", "")
        if not any(path.endswith(cf) for cf in CONTEXT_FILES):
            return False
        return output_len > CONTEXT_SIZE_THRESHOLD

    def _get_context_file_name(self, path: str) -> str | None:
        """Extract context file name from path."""
        for cf in CONTEXT_FILES:
            if path.endswith(cf):
                return cf
        return None

    def _should_block_reread(self, tool_name: str, args: dict) -> str | None:
        """Check if this read should be blocked (already have STATE for it).

        Allows reread if:
        - verifier_failed flag is set (FAIL/WARN condition)
        - No STATE exists yet
        - File hasn't been read before
        """
        if tool_name not in ("read_file", "head_file"):
            return None
        path = args.get("path", "")
        cf = self._get_context_file_name(path)
        # Allow reread if verifier failed or no STATE exists
        if self._verifier_failed:
            return None  # Escape hatch: allow reread after verifier failure
        if cf and cf in self._context_files_read and self._state_content:
            return cf
        return None

    def _prune_context_reads(self, messages: list) -> list:
        """Remove large context file reads, keeping everything else."""
        if not self._context_read_ids:
            return messages
        pruned = []
        skip_ids = set(self._context_read_ids)
        for msg in messages:
            if msg.get("role") == "tool" and msg.get("tool_call_id") in skip_ids:
                pr("  [pruned context read]", S.GRY)
                continue
            if msg.get("role") == "assistant" and msg.get("tool_calls"):
                filtered = [tc for tc in msg["tool_calls"] if tc["id"] not in skip_ids]
                if filtered:
                    pruned.append({**msg, "tool_calls": filtered})
                elif msg.get("content"):
                    pruned.append({"role": "assistant", "content": msg["content"]})
                continue
            pruned.append(msg)
        self._context_read_ids = []
        return pruned

    def _prune_messages(self, messages: list, keep_recent: int = 8) -> list:
        """Prune old messages while keeping tool_call/tool_result pairs intact."""
        if len(messages) <= keep_recent + 2:
            return messages
        base = messages[:2]  # system + user
        rest = messages[2:]
        cut_idx = max(0, len(rest) - keep_recent)
        # Find safe cut point (not mid tool-pair)
        while cut_idx < len(rest):
            msg = rest[cut_idx]
            if msg.get("role") == "assistant" and not msg.get("tool_calls"):
                break
            if msg.get("role") == "user":
                break
            cut_idx += 1
        pruned = base + rest[cut_idx:]
        pr(f"  [pruned {len(messages) - len(pruned)} messages]", S.GRY)
        return pruned

    def run(self, prompt: str, max_turns: int = DEFAULT_MAX_TURNS) -> bool:
        """Run agent loop with gist-then-prune architecture."""
        pr(f"\n{'─'*60}", S.CYN)
        pr(f"Cerebras Agent | Model: {self.model} | Max turns: {max_turns}", S.CYN)
        pr(f"{'─'*60}", S.CYN)

        # Detect verifier FAIL/WARN from prompt header (escape hatch for rereads)
        # Uses machine marker #@VERIFIER: to avoid matching documentation text
        if re.search(r"(?m)^#@VERIFIER:\s*(FAIL|WARN)\s*$", prompt):
            self._verifier_failed = True
            pr("  [verifier FAIL/WARN - context rereads allowed]", S.YEL)

        # TINY base prompt - agent reads context via tools (lazy loading)
        self.messages = [
            {
                "role": "system",
                "content": (
                    "You are Ralph, an expert software engineer. "
                    "Read AGENTS.md/NEURONS.md for context if needed. "
                    "After reading large files, use think() to write a STATE summary, "
                    "then proceed with the task efficiently."
                ),
            },
            {"role": "user", "content": prompt},
        ]

        for turn in range(max_turns):
            pr(f"\n── Turn {turn+1}/{max_turns} ──", S.GRY)
            self.client.current_turn = turn + 1

            # Call API
            try:
                response = self.client.chat(self.messages, self.model, TOOLS)
            except Exception as e:
                pr(f"API Error: {e}", S.RED)
                return False

            choice = response.get("choices", [{}])[0]
            message = choice.get("message", {})
            content = message.get("content", "")
            tool_calls = message.get("tool_calls", [])

            # Print response
            if content:
                pr(content)

            # Check for completion
            if content and (
                ":::COMPLETE:::" in content
                or ":::BUILD_READY:::" in content
                or ":::PLAN_READY:::" in content
            ):
                pr(f"\n✓ Agent completed ({self.client.total_tokens} tokens)", S.GRN)
                return True

            # Process tool calls
            if tool_calls:
                self.messages.append(message)
                tool_results = []

                for tc in tool_calls:
                    name = tc["function"]["name"]
                    try:
                        args = json.loads(tc["function"]["arguments"])
                    except json.JSONDecodeError:
                        args = {}

                    pr(
                        f"  → {name}({', '.join(f'{k}={repr(v)[:30]}' for k,v in args.items())})",
                        S.GRY,
                    )

                    # Block reread of context files if we already have STATE
                    blocked_file = self._should_block_reread(name, args)
                    if blocked_file:
                        output = f"[BLOCKED: {blocked_file} already read. Use existing STATE.]"
                        pr(f"    ⊘ {output}", S.YEL)
                        tool_results.append(
                            {
                                "role": "tool",
                                "tool_call_id": tc["id"],
                                "content": output,
                            }
                        )
                        continue

                    result = execute_tool(name, args, self.cwd)

                    # Truncate large results
                    output = (
                        result.output
                        if len(result.output) < 4000
                        else result.output[:4000] + "\n...(truncated)"
                    )
                    if result.error:
                        output = f"ERROR: {result.error}"
                        pr(f"    ✗ {result.error[:100]}", S.RED)
                    elif result.output:
                        pr(f"    ✓ {result.output[:100]}...", S.GRY)

                    # Track large context file reads for later pruning
                    if self._is_context_file_read(name, args, len(result.output)):
                        self._context_read_ids.append(tc["id"])
                        self._needs_state = True
                        # Track which context file was read
                        cf = self._get_context_file_name(args.get("path", ""))
                        if cf:
                            self._context_files_read.add(cf)
                        pr("    [context file - will prune after STATE]", S.YEL)

                    # Detect STATE summary in think() - single-slot storage
                    # Lenient detection: explicit "STATE:" OR planning-like content
                    is_state_think = False
                    if name == "think":
                        thought = args.get("thought", "")
                        thought_lower = thought.lower()[:200]
                        # Explicit STATE marker (preferred)
                        if "state:" in thought_lower or "state =" in thought_lower:
                            is_state_think = True
                        # Heuristic: planning/iteration thoughts count as state
                        elif any(
                            kw in thought_lower
                            for kw in [
                                "starting iteration",
                                "next step",
                                "task=",
                                "task =",
                                "goal:",
                                "12.",  # Task IDs like 12.4.1
                                "implement",
                                "will edit",
                                "will modify",
                            ]
                        ):
                            is_state_think = True
                    if is_state_think:
                        # Replace existing STATE (single-slot, not append)
                        self._state_content = args.get("thought", "")
                        self._state_written = True
                        # Don't add STATE tool result to messages - we store it separately
                        # Just add a minimal acknowledgment
                        tool_results.append(
                            {
                                "role": "tool",
                                "tool_call_id": tc["id"],
                                "content": "[STATE saved]",
                            }
                        )
                        pr(
                            "    [STATE saved - single-slot, not accumulating]",
                            S.GRN,
                        )
                    else:
                        tool_results.append(
                            {
                                "role": "tool",
                                "tool_call_id": tc["id"],
                                "content": output,
                            }
                        )

                self.messages.extend(tool_results)

                # If STATE was written, prune the raw context reads
                if self._state_written and self._context_read_ids:
                    self.messages = self._prune_context_reads(self.messages)
                    self._needs_state = False

                # If agent needs to write STATE, inject reminder
                if self._needs_state and not self._state_written:
                    self.messages.append(
                        {
                            "role": "user",
                            "content": "[Write a STATE summary (≤300 words) using think(), then continue.]",
                        }
                    )
                    self._needs_state = False  # Only remind once

                # Standard pruning for message count (configurable via env)
                prune_at = int(os.getenv("CEREBRAS_PRUNE_AT", "28"))
                keep_recent = int(os.getenv("CEREBRAS_KEEP_LAST", "16"))
                if len(self.messages) > prune_at:
                    self.messages = self._prune_messages(self.messages, keep_recent)
                    # Re-inject persistent state after pruning to prevent amnesia
                    if self._state_content:
                        state_msg = {
                            "role": "system",
                            "content": (
                                "PERSISTENT_STATE (do not re-read context files):\n"
                                f"{self._state_content}\n"
                                "Proceed from this state. Do not restart reconnaissance."
                            ),
                        }
                        # Insert after system prompt (position 1)
                        self.messages.insert(1, state_msg)
                        pr("    [re-injected persistent state after prune]", S.GRN)

            elif not content:
                pr("Empty response", S.YEL)
                self.messages.append({"role": "assistant", "content": "(no response)"})

            # Check finish reason
            if choice.get("finish_reason") == "stop" and not tool_calls:
                pr(f"\n✓ Agent stopped ({self.client.total_tokens} tokens)", S.GRN)
                return True

        pr(f"\n⚠ Max turns reached ({self.client.total_tokens} tokens)", S.YEL)
        return False


# =============================================================================
# Main
# =============================================================================


def main():
    parser = argparse.ArgumentParser(description="Cerebras Agent - Lean Edition")
    parser.add_argument("-p", "--prompt", required=True, help="Prompt file")
    parser.add_argument(
        "-m", "--model", default=DEFAULT_MODEL, help=f"Model (default: {DEFAULT_MODEL})"
    )
    parser.add_argument(
        "-t", "--max-turns", type=int, default=DEFAULT_MAX_TURNS, help="Max turns"
    )
    parser.add_argument("-c", "--cwd", default=None, help="Working directory")
    parser.add_argument(
        "-o", "--output", default=None, help="Output file for transcript"
    )
    args = parser.parse_args()

    # Check API key
    api_key = os.environ.get("CEREBRAS_API_KEY")
    if not api_key:
        pr("✗ CEREBRAS_API_KEY not set", S.RED)
        pr("  Get your key at: https://cloud.cerebras.ai")
        sys.exit(1)

    # Read prompt
    prompt_path = Path(args.prompt)
    if not prompt_path.exists():
        pr(f"✗ Prompt not found: {args.prompt}", S.RED)
        sys.exit(1)
    prompt = prompt_path.read_text(encoding="utf-8")

    # Setup output tee
    original_stdout = sys.stdout
    output_file = None
    if args.output:

        class Tee:
            def __init__(self, *writers):
                self.writers = writers

            def write(self, data):
                for w in self.writers:
                    w.write(data)
                    w.flush()

            def flush(self):
                for w in self.writers:
                    w.flush()

        output_file = open(args.output, "w", encoding="utf-8")
        sys.stdout = Tee(original_stdout, output_file)

    try:
        client = CerebrasClient(api_key)
        agent = Agent(client, args.model, args.cwd)
        success = agent.run(prompt, args.max_turns)
        sys.exit(0 if success else 1)
    finally:
        if output_file:
            sys.stdout = original_stdout
            output_file.close()


if __name__ == "__main__":
    main()
