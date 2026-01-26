#!/usr/bin/env python3
"""
THUNK.md Parser - Extract structured data from THUNK.md markdown tables

Usage:
    thunk-parse [--format json|sqlite] [--output FILE] [THUNK_FILE]

Examples:
    thunk-parse workers/ralph/THUNK.md
    thunk-parse --format json --output thunk.json workers/ralph/THUNK.md
    thunk-parse --format sqlite --output thunk.db workers/ralph/THUNK.md
"""

import argparse
import json
import re
import sqlite3
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Optional


@dataclass
class ThunkEntry:
    """Represents a single THUNK entry"""

    thunk_num: int
    original_id: str
    priority: str
    description: str
    completed: str
    era: str = ""


class ThunkParser:
    """Parser for THUNK.md markdown table format"""

    # Regex patterns
    ERA_PATTERN = re.compile(r"^## Era \d+: (.+)$")
    TABLE_HEADER_PATTERN = re.compile(
        r"^\| THUNK # \| Original # \| Priority \| Description \| Completed \|"
    )
    TABLE_ROW_PATTERN = re.compile(
        r"^\| (\d+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|"
    )

    def __init__(self, thunk_file: Path):
        self.thunk_file = thunk_file
        self.entries: List[ThunkEntry] = []
        self.current_era = ""

    def parse(self) -> List[ThunkEntry]:
        """Parse THUNK.md and extract all entries"""
        with open(self.thunk_file, "r", encoding="utf-8") as f:
            in_table = False

            for line in f:
                line = line.rstrip()

                # Check for era header
                era_match = self.ERA_PATTERN.match(line)
                if era_match:
                    self.current_era = era_match.group(1)
                    in_table = False
                    continue

                # Check for table header
                if self.TABLE_HEADER_PATTERN.match(line):
                    in_table = True
                    continue

                # Check for table separator
                if in_table and line.startswith("|---"):
                    continue

                # Parse table row
                if in_table:
                    row_match = self.TABLE_ROW_PATTERN.match(line)
                    if row_match:
                        entry = ThunkEntry(
                            thunk_num=int(row_match.group(1)),
                            original_id=row_match.group(2).strip(),
                            priority=row_match.group(3).strip(),
                            description=row_match.group(4).strip(),
                            completed=row_match.group(5).strip(),
                            era=self.current_era,
                        )
                        self.entries.append(entry)
                    elif line and not line.startswith("|"):
                        # End of table
                        in_table = False

        return self.entries


class ThunkExporter:
    """Export THUNK entries to various formats"""

    @staticmethod
    def to_json(entries: List[ThunkEntry], output_file: Optional[Path] = None) -> str:
        """Export entries to JSON format"""
        data = [asdict(entry) for entry in entries]
        json_str = json.dumps(data, indent=2, ensure_ascii=False)

        if output_file:
            output_file.write_text(json_str, encoding="utf-8")

        return json_str

    @staticmethod
    def to_sqlite(entries: List[ThunkEntry], db_file: Path):
        """Export entries to SQLite database"""
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        # Create table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS thunk_entries (
                thunk_num INTEGER PRIMARY KEY,
                original_id TEXT NOT NULL,
                priority TEXT NOT NULL,
                description TEXT NOT NULL,
                completed TEXT NOT NULL,
                era TEXT NOT NULL
            )
        """)

        # Create FTS5 virtual table for full-text search
        cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS thunk_search USING fts5(
                thunk_num,
                original_id,
                description,
                era,
                content=thunk_entries,
                content_rowid=thunk_num
            )
        """)

        # Insert entries
        cursor.executemany(
            """INSERT OR REPLACE INTO thunk_entries
               (thunk_num, original_id, priority, description, completed, era)
               VALUES (?, ?, ?, ?, ?, ?)""",
            [
                (
                    e.thunk_num,
                    e.original_id,
                    e.priority,
                    e.description,
                    e.completed,
                    e.era,
                )
                for e in entries
            ],
        )

        # Populate FTS5 index
        cursor.execute("""
            INSERT INTO thunk_search(thunk_search) VALUES('rebuild')
        """)

        conn.commit()
        conn.close()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Parse THUNK.md and extract structured data",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "thunk_file",
        nargs="?",
        default="workers/ralph/THUNK.md",
        help="Path to THUNK.md file (default: workers/ralph/THUNK.md)",
    )
    parser.add_argument(
        "--format",
        choices=["json", "sqlite"],
        default="json",
        help="Output format (default: json)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        help="Output file path (default: stdout for json, thunk.db for sqlite)",
    )
    parser.add_argument(
        "--stats", action="store_true", help="Print statistics instead of data"
    )
    parser.add_argument(
        "--query-id",
        type=str,
        help="Query THUNK by original task ID (e.g., '11.1.3')",
    )
    parser.add_argument(
        "--last-id",
        action="store_true",
        help="Print the last THUNK entry number (for appends)",
    )

    args = parser.parse_args()

    # Parse THUNK.md
    thunk_file = Path(args.thunk_file)
    if not thunk_file.exists():
        print(f"Error: File not found: {thunk_file}", file=sys.stderr)
        return 1

    thunk_parser = ThunkParser(thunk_file)
    entries = thunk_parser.parse()

    if not entries:
        print(f"Warning: No entries found in {thunk_file}", file=sys.stderr)
        return 0

    # Print last ID if requested
    if args.last_id:
        last_entry = max(entries, key=lambda e: e.thunk_num)
        print(last_entry.thunk_num)
        return 0

    # Query by ID if requested
    if args.query_id:
        matching_entries = [e for e in entries if e.original_id == args.query_id]
        if matching_entries:
            json_data = ThunkExporter.to_json(matching_entries, None)
            print(json_data)
        else:
            # Return empty JSON array if not found
            print("[]")
        return 0

    # Print statistics if requested
    if args.stats:
        total = len(entries)
        eras = len(set(e.era for e in entries))
        priorities = {}
        for entry in entries:
            priorities[entry.priority] = priorities.get(entry.priority, 0) + 1

        print(f"Total entries: {total}")
        print(f"Eras: {eras}")
        print("Priorities:")
        for priority, count in sorted(priorities.items()):
            print(f"  {priority}: {count}")
        return 0

    # Export data
    if args.format == "json":
        output_file = args.output
        json_data = ThunkExporter.to_json(entries, output_file)
        if not output_file:
            print(json_data)
    elif args.format == "sqlite":
        output_file = args.output or Path("thunk.db")
        ThunkExporter.to_sqlite(entries, output_file)
        print(f"Exported {len(entries)} entries to {output_file}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
