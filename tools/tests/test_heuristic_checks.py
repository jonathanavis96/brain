#!/usr/bin/env python3
"""
Test suite for semantic_reviewer.py heuristic checks

Tests the non-LLM checks using fixture files.
"""

import os
import sys
import unittest

# Add tools directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from semantic_reviewer import SemanticReviewer


class TestHeuristicChecks(unittest.TestCase):
    """Test heuristic (non-LLM) checks"""

    def setUp(self):
        """Set up test fixtures"""
        self.reviewer = SemanticReviewer(provider="none")
        self.fixtures_dir = os.path.join(os.path.dirname(__file__), "fixtures")

    def test_markdown_fence_detection(self):
        """Test MD040 detection in markdown files"""
        test_file = os.path.join(self.fixtures_dir, "test_md040.md")

        findings = self.reviewer._check_markdown_fences(test_file)

        # Should find 2 bare code fences (lines with just ```)
        self.assertEqual(len(findings), 2, "Should detect 2 MD040 violations")

        # Check first finding
        self.assertEqual(findings[0].severity, "warning")
        self.assertEqual(findings[0].category, "style")
        self.assertIn("MD040", findings[0].message)

        # Check that line numbers are captured
        self.assertIsNotNone(findings[0].line_number)
        self.assertIsNotNone(findings[1].line_number)

    def test_unused_variable_detection(self):
        """Test unused variable detection in shell scripts"""
        test_file = os.path.join(self.fixtures_dir, "test_unused_var.sh")

        findings = self.reviewer._check_unused_variables(test_file)

        # Should find 2 unused variables
        self.assertEqual(len(findings), 2, "Should detect 2 unused variables")

        # Check findings contain expected variable names
        messages = [f.message for f in findings]
        self.assertTrue(
            any("UNUSED_VAR" in msg for msg in messages), "Should detect UNUSED_VAR"
        )
        self.assertTrue(
            any("ANOTHER_UNUSED" in msg for msg in messages),
            "Should detect ANOTHER_UNUSED",
        )

        # Should NOT flag used variables (check exact match to avoid substring match)
        self.assertFalse(
            any("'USED_VAR'" in msg for msg in messages), "Should not flag USED_VAR"
        )
        self.assertFalse(
            any("'USED_VAR2'" in msg for msg in messages), "Should not flag USED_VAR2"
        )

    def test_heuristic_checks_integration(self):
        """Test that _run_heuristic_checks combines both checks"""
        test_files = [
            os.path.join(self.fixtures_dir, "test_md040.md"),
            os.path.join(self.fixtures_dir, "test_unused_var.sh"),
        ]

        # Capture output by redirecting stdout
        import io
        from contextlib import redirect_stdout

        f = io.StringIO()
        with redirect_stdout(f):
            result = self.reviewer._run_heuristic_checks(test_files)

        output = f.getvalue()

        # Should exit successfully
        self.assertEqual(result, 0)

        # Should report findings
        self.assertIn("findings from heuristic checks:", output)
        self.assertIn("MD040", output)
        self.assertIn("unused", output.lower())

    def test_nonexistent_file_handling(self):
        """Test that nonexistent files are handled gracefully"""
        result = self.reviewer._run_heuristic_checks(["nonexistent_file.md"])

        # Should not crash, should return 0
        self.assertEqual(result, 0)

    def test_non_target_file_skipping(self):
        """Test that non-.md and non-.sh files are skipped"""
        # Create a temporary non-target file
        import tempfile

        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("```\nsome content\n```\n")
            temp_file = f.name

        try:
            findings_md = self.reviewer._check_markdown_fences(temp_file)
            findings_sh = self.reviewer._check_unused_variables(temp_file)

            # Markdown check should skip .txt files (returns empty)
            # Shell check should skip .txt files
            self.assertEqual(
                len(findings_sh), 0, ".txt file should not be checked as shell"
            )
        finally:
            os.unlink(temp_file)


if __name__ == "__main__":
    unittest.main()
