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
        default=Path("artifacts/analysis/latest.json"),
        help="Output path for JSON report (default: artifacts/analysis/latest.json)",
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
    from .parsers.marker_parser import MarkerParser
    from .parsers.heuristic_parser import HeuristicParser
    from .report import build_report, write_json_report, write_markdown_summary
    from .models import ToolStatus

    parser = create_parser()
    args = parser.parse_args(argv)

    # Validate log directory exists
    if not args.log_dir.exists():
        print(f"Error: Log directory not found: {args.log_dir}", file=sys.stderr)
        return 1

    if not args.log_dir.is_dir():
        print(f"Error: Not a directory: {args.log_dir}", file=sys.stderr)
        return 1

    if args.verbose:
        print(f"Analyzing logs in: {args.log_dir}")

    # Step 1: Select parser based on mode
    if args.parser == "marker":
        log_parser = MarkerParser()
        if args.verbose:
            print("Using marker parser (explicit START/END markers)")
    elif args.parser == "heuristic":
        log_parser = HeuristicParser(config_path=args.config)
        if args.verbose:
            print("Using heuristic parser (regex patterns)")
    else:  # auto mode
        # Try marker first, fallback to heuristic if no markers found
        log_parser = MarkerParser()
        if args.verbose:
            print("Using auto mode (marker parser, will fallback if needed)")

    # Step 2: Stream through log files and collect tool calls
    tool_calls = []
    log_files = sorted(args.log_dir.rglob("*.log"))

    if not log_files:
        # No .log files, try all files
        log_files = [f for f in sorted(args.log_dir.rglob("*")) if f.is_file()]

    if not log_files:
        print(f"Error: No log files found in {args.log_dir}", file=sys.stderr)
        return 1

    if args.verbose:
        print(f"Found {len(log_files)} log file(s) to process")

    for log_file in log_files:
        if args.verbose:
            print(f"  Processing: {log_file.name}")

        try:
            # Stream parse file (generator-based, memory efficient)
            for tool_call in log_parser.parse_file(log_file):
                tool_calls.append(tool_call)
        except Exception as e:
            print(f"Warning: Failed to parse {log_file}: {e}", file=sys.stderr)
            continue

    if args.verbose:
        print(f"Extracted {len(tool_calls)} tool call(s)")

    # If auto mode and no tool calls found, try heuristic fallback
    if args.parser == "auto" and len(tool_calls) == 0:
        if args.verbose:
            print("No markers found, falling back to heuristic parser")

        log_parser = HeuristicParser(config_path=args.config)
        tool_calls = []

        for log_file in log_files:
            if args.verbose:
                print(f"  Re-processing: {log_file.name}")
            try:
                for tool_call in log_parser.parse_file(log_file):
                    tool_calls.append(tool_call)
            except Exception as e:
                print(f"Warning: Failed to parse {log_file}: {e}", file=sys.stderr)
                continue

    if len(tool_calls) == 0:
        print("Warning: No tool calls found in logs", file=sys.stderr)

    # Step 3: Build report with aggregates and cache advice
    report = build_report(tool_calls, run_id=None)

    if args.verbose:
        print(f"Report generated with {report.aggregates.total_calls} calls")

    # Step 4: Write JSON output
    try:
        write_json_report(report, args.out)
        if args.verbose:
            print(f"JSON report written to: {args.out}")
    except Exception as e:
        print(f"Error writing JSON report: {e}", file=sys.stderr)
        return 1

    # Step 5: Optionally write markdown summary
    if args.markdown:
        md_path = args.out.with_suffix(".md")
        try:
            write_markdown_summary(report, md_path)
            if args.verbose:
                print(f"Markdown summary written to: {md_path}")
        except Exception as e:
            print(f"Error writing markdown summary: {e}", file=sys.stderr)
            return 1

    # Step 6: Update cache DB with PASS/FAIL results
    if args.cache_db:
        try:
            from .cache_db import CacheDB

            cache_db = CacheDB(args.cache_db)
            if args.verbose:
                print(f"Updating cache database: {args.cache_db}")

            # Update cache with PASS results
            pass_count = 0
            fail_count = 0
            for tool_call in tool_calls:
                if tool_call.status == ToolStatus.PASS and tool_call.cache_key:
                    cache_db.upsert_pass(tool_call)
                    pass_count += 1
                elif tool_call.status == ToolStatus.FAIL:
                    cache_db.log_fail(tool_call)
                    fail_count += 1

            if args.verbose:
                print(
                    f"  Cached {pass_count} PASS result(s), logged {fail_count} FAIL(s)"
                )
                stats = cache_db.get_stats()
                print(
                    f"  Cache DB stats: {stats['pass_cache_entries']} entries, {stats['fail_log_entries']} failures"
                )
        except Exception as e:
            print(f"Warning: Failed to update cache DB: {e}", file=sys.stderr)
            # Don't fail the entire run if cache update fails

    return 0


if __name__ == "__main__":
    sys.exit(main())
