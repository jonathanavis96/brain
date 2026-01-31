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
        """Check if rovodev is authenticated"""
        try:
            result = subprocess.run(
                ["acli", "rovodev", "usage", "site"],
                capture_output=True,
                text=True,
                timeout=5,
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

    def _run_rovodev_review(self, paths: List[str]) -> int:
        """Run rovodev LLM review on specified paths"""
        # Check authentication
        if not self._check_rovodev_auth():
            print("SKIPPED: Run 'acli rovodev auth' to enable LLM-based review")
            print("0 findings")
            return 0

        # Build prompt
        prompt_template = self._load_prompt_template()
        prompt_parts = [prompt_template]

        for path in paths:
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                prompt_parts.append(f"\n=== {path} ===")
                prompt_parts.append(content)
            except Exception as e:
                print(f"WARNING: Could not read {path}: {e}", file=sys.stderr)

        prompt = "\n".join(prompt_parts)

        # Write prompt to temp file and call rovodev
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as tmp:
            tmp.write(prompt)
            tmp_path = tmp.name

        try:
            result = subprocess.run(
                ["acli", "rovodev", "run", "--yolo"],
                stdin=open(tmp_path, "r"),
                capture_output=True,
                text=True,
                timeout=60,
            )

            if result.returncode != 0:
                print(f"WARNING: rovodev run failed: {result.stderr}", file=sys.stderr)
                print("0 findings")
                return 0

            # Parse output (simplified - just show raw for now)
            output = result.stdout.strip()
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
            os.unlink(tmp_path)

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

    def review_against(self, branch: str) -> int:
        """
        Review changes against a branch.

        Returns:
            Exit code (0 = success)
        """
        import subprocess

        # Prefer origin/branch over local branch
        ref = f"origin/{branch}"
        try:
            subprocess.run(
                ["git", "rev-parse", "--verify", ref],
                check=True,
                capture_output=True,
                text=True,
            )
        except subprocess.CalledProcessError:
            # Fall back to local branch
            ref = branch
            try:
                subprocess.run(
                    ["git", "rev-parse", "--verify", ref],
                    check=True,
                    capture_output=True,
                    text=True,
                )
            except subprocess.CalledProcessError:
                print(
                    f"ERROR: Branch '{branch}' not found (tried origin/{branch} and {branch})",
                    file=sys.stderr,
                )
                return 1

        # Get changed files
        try:
            result = subprocess.run(
                ["git", "diff", "--name-only", f"{ref}..HEAD"],
                check=True,
                capture_output=True,
                text=True,
            )
            changed_files = [f for f in result.stdout.strip().split("\n") if f]

            if not changed_files:
                print("SKIPPED: No files changed")
                print("0 findings")
                return 0

            # Review the changed files
            return self.review_paths(changed_files)

        except subprocess.CalledProcessError as e:
            print(f"ERROR: Git diff failed: {e}", file=sys.stderr)
            return 1


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
