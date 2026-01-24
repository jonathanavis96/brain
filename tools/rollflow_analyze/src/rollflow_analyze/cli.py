"""Command-line interface for RollFlow log analyzer."""

import argparse
import sys
from pathlib import Path


def create_parser() -> argparse.ArgumentParser:
    """Create argument parser for CLI."""
    parser = argparse.ArgumentParser(
        prog="rollflow_analyze",
        description="Analyze RollFlow/Ralph loop logs for tool call metrics and cache advice.",
    )
    parser.add_argument(
        "--log-dir",
        type=Path,
        required=True,
        help="Directory containing log files to analyze",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("artifacts/rollflow_reports/latest.json"),
        help="Output path for JSON report (default: artifacts/rollflow_reports/latest.json)",
    )
    parser.add_argument(
        "--cache-db",
        type=Path,
        default=Path("artifacts/rollflow_cache/cache.sqlite"),
        help="Path to SQLite cache database (default: artifacts/rollflow_cache/cache.sqlite)",
    )
    parser.add_argument(
        "--parser",
        choices=["marker", "heuristic", "auto"],
        default="auto",
        help="Parser to use: marker (explicit markers), heuristic (regex patterns), auto (try marker first)",
    )
    parser.add_argument(
        "--config",
        type=Path,
        help="Path to patterns config file for heuristic parser",
    )
    parser.add_argument(
        "--markdown",
        action="store_true",
        help="Also output a markdown summary alongside JSON",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose output",
    )
    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s 0.1.0",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    """Main entry point for CLI."""
    parser = create_parser()
    args = parser.parse_args(argv)

    # Validate log directory exists
    if not args.log_dir.exists():
        print(f"Error: Log directory not found: {args.log_dir}", file=sys.stderr)
        return 1

    if not args.log_dir.is_dir():
        print(f"Error: Not a directory: {args.log_dir}", file=sys.stderr)
        return 1

    # TODO: Implement analysis pipeline
    # 1. Select parser (marker vs heuristic)
    # 2. Stream through log files
    # 3. Build report with aggregates
    # 4. Update cache DB
    # 5. Write output

    print(f"[NOT IMPLEMENTED] Would analyze logs in: {args.log_dir}")
    print(f"[NOT IMPLEMENTED] Would write report to: {args.out}")

    return 2  # Exit code 2 = not implemented


if __name__ == "__main__":
    sys.exit(main())
