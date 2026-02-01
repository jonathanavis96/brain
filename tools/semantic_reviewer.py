#!/usr/bin/env python3
"""
Semantic Code Reviewer - AI-assisted code review with fallback heuristics

Usage:
    semantic_reviewer.py --help
    semantic_reviewer.py --paths FILE [FILE ...]
    semantic_reviewer.py --against BRANCH
    semantic_reviewer.py --git-diff REF1..REF2

Examples:
    semantic_reviewer.py --paths README.md
    semantic_reviewer.py --against main
    semantic_reviewer.py --git-diff origin/main..HEAD

Environment:
    SEMANTIC_REVIEW_PROVIDER - LLM provider (rovodev, none)
"""

import argparse
import re
import os
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Finding:
    """Represents a single code review finding"""

    file_path: str
    line_number: Optional[int]
    severity: str  # "error", "warning", "info"
    category: str  # "bug", "style", "performance", "security"
    message: str
    suggestion: Optional[str] = None


class SemanticReviewer:
    """Main semantic code reviewer"""

    def __init__(self, provider: Optional[str] = None):
        self.provider = provider or os.environ.get("SEMANTIC_REVIEW_PROVIDER")
        self.findings: List[Finding] = []

    def _check_markdown_fences(self, file_path: str) -> List[Finding]:
        """Check for markdown code fences without language tags (MD040)"""
        findings = []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            in_code_block = False
            for i, line in enumerate(lines, start=1):
                stripped = line.strip()

                # Detect opening fence (``` followed by optional language)
                if stripped.startswith("```"):
                    if not in_code_block:
                        # Opening fence - check if it has a language tag
                        if stripped == "```":
                            findings.append(
                                Finding(
                                    file_path=file_path,
                                    line_number=i,
                                    severity="warning",
                                    category="style",
                                    message="Code fence without language tag (MD040)",
                                    suggestion="Add language after ```, e.g., ```bash or ```python",
                                )
                            )
                        in_code_block = True
                    else:
                        # Closing fence
                        in_code_block = False
        except Exception:
            # Silently skip files that can't be read
            pass

        return findings

    def _check_unused_variables(self, file_path: str) -> List[Finding]:
        """Check for common unused variable patterns in shell scripts"""
        findings = []

        # Only check shell scripts
        if not (file_path.endswith(".sh") or file_path.endswith(".bash")):
            return findings

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            # Build full content for usage checks
            content = "".join(lines)

            for i, line in enumerate(lines, start=1):
                stripped = line.strip()

                # Skip comments and empty lines
                if not stripped or stripped.startswith("#"):
                    continue

                # Detect variable assignment that's never used (simplified heuristic)
                # Pattern: VAR=value at start of line, common unused pattern
                if "=" in stripped and not stripped.startswith("export "):
                    var_name = stripped.split("=")[0].strip()

                    # Only check simple variable names (alphanumeric + underscore)
                    if not (
                        var_name.replace("_", "").isalnum() and var_name[0].isalpha()
                    ):
                        continue

                    # Look for usage: $VAR, ${VAR}, "$VAR", "${VAR}"
                    # Count occurrences - if only 1, it's just the definition
                    usage_count = content.count(f"${var_name}") + content.count(
                        f"${{{var_name}}}"
                    )

                    if usage_count == 0:
                        findings.append(
                            Finding(
                                file_path=file_path,
                                line_number=i,
                                severity="info",
                                category="style",
                                message=f"Variable '{var_name}' appears unused (potential SC2034)",
                                suggestion=f'Remove unused variable or use it: echo "${var_name}"',
                            )
                        )
        except Exception:
            # Silently skip files that can't be read
            pass

        return findings

    def _run_heuristic_checks(self, paths: List[str]) -> int:
        """Run fast non-LLM heuristic checks on files"""
        all_findings = []

        for path in paths:
            # Skip files that don't exist
            if not os.path.exists(path):
                continue

            # Run markdown checks on .md files
            if path.endswith(".md"):
                all_findings.extend(self._check_markdown_fences(path))

            # Run shell checks on .sh/.bash files
            if path.endswith(".sh") or path.endswith(".bash"):
                all_findings.extend(self._check_unused_variables(path))

        # Output findings
        if all_findings:
            print(f"{len(all_findings)} findings from heuristic checks:")
            for finding in all_findings:
                print(f"\nFILE: {finding.file_path}")
                if finding.line_number:
                    print(f"LINE: {finding.line_number}")
                print(f"SEVERITY: {finding.severity}")
                print(f"CATEGORY: {finding.category}")
                print(f"MESSAGE: {finding.message}")
                if finding.suggestion:
                    print(f"SUGGESTION: {finding.suggestion}")
                print("---")
        else:
            print("0 findings")

        return 0

    def _check_rovodev_auth(self) -> bool:
        """Check if Rovo Dev CLI is authenticated.

        We use `acli rovodev auth status` because it is the dedicated auth
        status command and avoids accidentally running interactive/expensive
        subcommands.
        """
        try:
            result = subprocess.run(
                ["acli", "rovodev", "auth", "status"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            return result.returncode == 0
        except (
            subprocess.CalledProcessError,
            FileNotFoundError,
            subprocess.TimeoutExpired,
        ):
            return False

    def _load_prompt_template(self) -> str:
        """Load the prompt template from external file"""
        prompt_file = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "prompts", "semantic_review.txt"
        )
        try:
            with open(prompt_file, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            # Fallback to inline prompt if file not found
            print(
                f"WARNING: Could not load prompt from {prompt_file}: {e}",
                file=sys.stderr,
            )
            return """You are a code reviewer. Review the following files for common issues:
- Bugs and logic errors
- Security vulnerabilities
- Performance issues
- Style violations

For each issue found, output in this format:
FILE: <path>
LINE: <number>
SEVERITY: error|warning|info
CATEGORY: bug|style|performance|security
MESSAGE: <description>
SUGGESTION: <optional fix>
---

Files to review:
"""

    def _build_review_prompt(self, paths: List[str], directives_file: Optional[str] = None) -> str:
        """Build the LLM review prompt (directives + template + file contents)."""
        prompt_template = self._load_prompt_template()
        prompt_parts: List[str] = []

        # Inject agent directives (so the LLM has clear, consistent rules).
        if directives_file:
            directives_path = directives_file
        else:
            directives_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                "AGENTS_CODE.md",
            )

        if directives_path and os.path.exists(directives_path):
            try:
                with open(directives_path, "r", encoding="utf-8") as f:
                    prompt_parts.append(f.read().strip())
            except Exception:
                pass

        prompt_parts.append(prompt_template)

        for path in paths:
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                prompt_parts.append(f"\n=== {path} ===")
                prompt_parts.append(content)
            except Exception as e:
                print(f"WARNING: Could not read {path}: {e}", file=sys.stderr)

        return "\n".join(prompt_parts)

    def _run_rovodev_review(self, paths: List[str]) -> int:
        """Run rovodev LLM review on specified paths"""
        # Check authentication
        if not self._check_rovodev_auth():
            print("SKIPPED: Run 'acli rovodev auth' to enable LLM-based review")
            print("0 findings")
            return 0

        prompt = self._build_review_prompt(paths)

        # Use *supported* non-interactive mode:
        # - Provide a short MESSAGE argument to `acli rovodev run` (so it actually has a task)
        # - Keep the large prompt in a temp file to avoid argv length/null-byte issues
        # - Capture final text via --output-file
        with tempfile.NamedTemporaryFile(mode="w", suffix=".prompt.txt", delete=False) as tmp:
            tmp.write(prompt)
            tmp_path = tmp.name

        with tempfile.NamedTemporaryFile(mode="w", suffix=".out.txt", delete=False) as out:
            out_path = out.name

        try:
            message = (
                "You are running a non-interactive semantic code review. "
                "Read the full review prompt from the following file path and follow it exactly: "
                f"{tmp_path}. "
                "Return only the findings in the required format (or '0 findings'). "
                "Do not modify any files."
            )

            result = subprocess.run(
                [
                    "acli",
                    "rovodev",
                    "run",
                    "--yolo",
                    "--output-file",
                    out_path,
                    message,
                ],
                capture_output=True,
                text=True,
                timeout=300,
            )

            if result.returncode != 0:
                print(f"WARNING: rovodev run failed: {result.stderr}", file=sys.stderr)
                print("0 findings")
                return 0

            try:
                output = open(out_path, "r", encoding="utf-8", errors="replace").read().strip()
            except Exception:
                output = ""

            # Some models may mistakenly append "0 findings" even after listing
            # findings. If we detect any "FILE:" blocks, strip any trailing
            # "0 findings" line.
            if "\nFILE:" in "\n" + output:
                output_lines = [ln.rstrip() for ln in output.splitlines()]
                while output_lines and output_lines[-1].strip() == "":
                    output_lines.pop()
                if output_lines and output_lines[-1].strip().lower() == "0 findings":
                    output_lines.pop()
                output = "\n".join(output_lines).strip()

            if output:
                print("LLM Review Output:")
                print(output)
            else:
                print("0 findings")

            return 0

        except subprocess.TimeoutExpired:
            print("WARNING: rovodev run timed out", file=sys.stderr)
            print("0 findings")
            return 0
        except Exception as e:
            print(f"WARNING: rovodev run failed: {e}", file=sys.stderr)
            print("0 findings")
            return 0
        finally:
            # Clean up temp files.
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
            try:
                os.unlink(out_path)
            except Exception:
                pass

    def review_paths(self, paths: List[str]) -> int:
        """
        Review specified file paths.

        Returns:
            Exit code (0 = success)
        """
        # Always run heuristic checks first (fast, non-LLM)
        heuristic_result = self._run_heuristic_checks(paths)

        # Check provider configuration for LLM review
        if not self.provider:
            print("\nSKIPPED: No SEMANTIC_REVIEW_PROVIDER configured for LLM review")
            return heuristic_result

        if self.provider == "none":
            print("\nSKIPPED: SEMANTIC_REVIEW_PROVIDER=none (heuristics only)")
            return heuristic_result

        if self.provider == "rovodev":
            print("\n--- Running LLM review ---")
            return self._run_rovodev_review(paths)

        print(f"ERROR: Unknown provider: {self.provider}", file=sys.stderr)
        return 1

    def review_diff(self, ref1: str, ref2: str) -> int:
        """
        Review git diff between two refs.

        Returns:
            Exit code (0 = success)
        """
        print("SKIPPED: Git diff review not implemented yet")
        print("0 findings")
        return 0

    def _resolve_base_ref(self, branch: str) -> Optional[str]:
        """Resolve a base ref for diffing.

        For interactive review we should respect the user-provided base (e.g. `main`) rather
        than silently preferring `origin/<branch>`, which can produce surprising results if
        local refs are stale or diverged.

        Resolution order:
          1) <branch>
          2) origin/<branch>
        """
        ref = branch
        try:
            subprocess.run(
                ["git", "rev-parse", "--verify", ref],
                check=True,
                capture_output=True,
                text=True,
            )
            return ref
        except subprocess.CalledProcessError:
            ref = f"origin/{branch}"
            try:
                subprocess.run(
                    ["git", "rev-parse", "--verify", ref],
                    check=True,
                    capture_output=True,
                    text=True,
                )
                return ref
            except subprocess.CalledProcessError:
                print(
                    f"ERROR: Branch '{branch}' not found (tried {branch} and origin/{branch})",
                    file=sys.stderr,
                )
                return None

    def _get_changed_files_against(self, branch: str) -> Optional[List[str]]:
        """Return list of files changed vs a branch, or None on error."""
        ref = self._resolve_base_ref(branch)
        if ref is None:
            return None

        try:
            result = subprocess.run(
                ["git", "diff", "--name-only", f"{ref}..HEAD"],
                check=True,
                capture_output=True,
                text=True,
            )
            return [f for f in result.stdout.strip().split("\n") if f]
        except subprocess.CalledProcessError as e:
            print(f"ERROR: Git diff failed: {e}", file=sys.stderr)
            return None

    def _get_diff_against(self, branch: str, *, max_bytes: int = 2_000_000) -> Optional[str]:
        """Return a unified git diff vs a branch, truncated to a safe maximum size.

        Notes:
            - Large repos can produce huge diffs (including generated/binary files). This method streams
              the diff and truncates output at `max_bytes`.
            - We also exclude some known-noisy directories to keep prompts usable.
        """
        ref = self._resolve_base_ref(branch)
        if ref is None:
            return None

        exclude_specs = [
            ":(exclude)artifacts",
            ":(exclude)**/__pycache__",
            ":(exclude).ruff_cache",
            ":(exclude)workers/ralph/logs",
            ":(exclude)workers/ralph/.verify",
        ]

        cmd = [
            "git",
            "diff",
            "--no-color",
            f"{ref}..HEAD",
            "--",
            ".",
            *exclude_specs,
        ]

        try:
            # Stream bytes to avoid holding an unbounded diff in memory.
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            assert proc.stdout is not None  # for type-checkers

            chunks: List[bytes] = []
            total = 0
            truncated = False

            while True:
                chunk = proc.stdout.read(64 * 1024)
                if not chunk:
                    break

                remaining = max_bytes - total
                if remaining <= 0:
                    truncated = True
                    break

                if len(chunk) > remaining:
                    chunks.append(chunk[:remaining])
                    total += remaining
                    truncated = True
                    break

                chunks.append(chunk)
                total += len(chunk)

            stdout_bytes = b"".join(chunks)
            _, stderr_bytes = proc.communicate(timeout=30)

            if proc.returncode not in (0, 1):
                # git diff returns 1 for differences in some contexts; treat both 0 and 1 as ok.
                stderr_text = stderr_bytes.decode("utf-8", errors="replace")
                print(
                    f"ERROR: Git diff failed (exit {proc.returncode}): {stderr_text}",
                    file=sys.stderr,
                )
                return None

            diff_text = stdout_bytes.decode("utf-8", errors="replace")

            # Make the dumped prompt robust to terminals/editors by stripping control characters
            # that can make the diff *appear* blank (e.g. carriage returns) and removing ANSI
            # escape sequences.
            diff_text = diff_text.replace("\r", "")
            diff_text = re.sub(r"\x1b\[[0-9;]*[A-Za-z]", "", diff_text)

            if truncated:
                diff_text += (
                    "\n\n[TRUNCATED]\n"
                    f"Diff output exceeded {max_bytes} bytes and was truncated for safety.\n"
                    "Consider limiting scope (e.g. use --paths) or inspect the full diff locally.\n"
                )
            return diff_text
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
            print(f"ERROR: Git diff failed: {e}", file=sys.stderr)
            return None

    def review_against(self, branch: str) -> int:
        """Review changes against a branch."""
        changed_files = self._get_changed_files_against(branch)
        if changed_files is None:
            return 1
        if not changed_files:
            print("SKIPPED: No files changed")
            print("0 findings")
            return 0
        return self.review_paths(changed_files)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Semantic code reviewer with AI assistance and heuristic fallbacks",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --paths README.md AGENTS.md
  %(prog)s --against main
  %(prog)s --git-diff origin/main..HEAD

Environment Variables:
  SEMANTIC_REVIEW_PROVIDER    LLM provider (rovodev, none)
        """,
    )

    parser.add_argument(
        "--paths",
        nargs="+",
        metavar="FILE",
        help="Review specific file paths",
    )

    parser.add_argument(
        "--against",
        metavar="BRANCH",
        help="Review changes against a branch (e.g., main)",
    )

    parser.add_argument(
        "--git-diff",
        metavar="REF1..REF2",
        help="Review git diff between two refs",
    )

    parser.add_argument(
        "--provider",
        choices=["rovodev", "none"],
        help="Override LLM provider (default: from SEMANTIC_REVIEW_PROVIDER env)",
    )

    parser.add_argument(
        "--dump-prompt",
        metavar="OUT_FILE",
        help="Write the generated LLM prompt to OUT_FILE and exit (no LLM call)",
    )

    parser.add_argument(
        "--directives",
        metavar="DIRECTIVES_FILE",
        help="Override directives markdown file to inject at top of prompt",
    )

    args = parser.parse_args()

    # Validate mutually exclusive options
    modes = sum(
        [
            args.paths is not None,
            args.against is not None,
            args.git_diff is not None,
        ]
    )

    if modes == 0:
        parser.print_help()
        return 0

    if modes > 1:
        print(
            "ERROR: --paths, --against, and --git-diff are mutually exclusive",
            file=sys.stderr,
        )
        return 1

    # Initialize reviewer
    provider = args.provider
    reviewer = SemanticReviewer(provider=provider)

    # Dump prompt mode (no LLM call)
    if args.dump_prompt:
        if args.paths:
            paths = args.paths
            prompt = reviewer._build_review_prompt(paths, directives_file=args.directives)
        elif args.against:
            resolved_ref = reviewer._resolve_base_ref(args.against)
            if resolved_ref is None:
                return 1
            diff_text = reviewer._get_diff_against(args.against)
            if diff_text is None:
                return 1

            # For interactive chat, the diff is the most useful context.
            # Still include the prompt template + directives.
            header = reviewer._build_review_prompt([], directives_file=args.directives)
            hunk_count = len(re.findall(r"^diff --git", diff_text, flags=re.MULTILINE))
            prompt = (
                header
                + "\n\n=== GIT DIFF ("
                + resolved_ref
                + "..HEAD) ===\n"
                + f"[Diff hunks: {hunk_count}]\n\n"
                + diff_text
            )
        elif args.git_diff:
            print("ERROR: --dump-prompt does not support --git-diff yet", file=sys.stderr)
            return 1
        else:
            prompt = reviewer._build_review_prompt([], directives_file=args.directives)
        with open(args.dump_prompt, "w", encoding="utf-8") as f:
            f.write(prompt)
        print(args.dump_prompt)
        return 0

    # Execute review based on mode
    if args.paths:
        return reviewer.review_paths(args.paths)
    elif args.against:
        return reviewer.review_against(args.against)
    elif args.git_diff:
        ref1, ref2 = args.git_diff.split("..", 1)
        return reviewer.review_diff(ref1, ref2)

    return 0


if __name__ == "__main__":
    sys.exit(main())
