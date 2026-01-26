#!/usr/bin/env python3
"""Generate static HTML dashboard from brain metrics JSON.

Usage:
    python3 generate_dashboard.py --input metrics.json --output dashboard.html
    python3 generate_dashboard.py < metrics.json > dashboard.html
"""

import argparse
import json
import sys
from datetime import datetime
from typing import Any, Dict, List


def generate_svg_line_chart(
    data: List[Dict[str, Any]],
    width: int = 800,
    height: int = 300,
    value_key: str = "count",
    label_key: str = "week",
) -> str:
    """Generate SVG line chart for time series data."""
    if not data:
        return f'<svg width="{width}" height="{height}"><text x="50%" y="50%" text-anchor="middle">No data available</text></svg>'

    # Extract values with flexible keys
    values = [item.get(value_key, item.get("count", 0)) for item in data]
    labels = [
        item.get(label_key, item.get("week", item.get("date", ""))) for item in data
    ]

    if not values:
        return f'<svg width="{width}" height="{height}"><text x="50%" y="50%" text-anchor="middle">No data available</text></svg>'

    max_val = max(values) if values else 1
    min_val = min(values) if values else 0
    value_range = max_val - min_val if max_val != min_val else 1

    # Chart dimensions
    padding = 60
    chart_width = width - 2 * padding
    chart_height = height - 2 * padding

    # Generate points
    points = []
    for i, val in enumerate(values):
        x = padding + (i / max(len(values) - 1, 1)) * chart_width
        y = padding + chart_height - ((val - min_val) / value_range) * chart_height
        points.append(f"{x:.1f},{y:.1f}")

    polyline = " ".join(points)

    # Generate SVG
    svg = f"""<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Grid lines -->
  <line x1="{padding}" y1="{padding}" x2="{padding}" y2="{height - padding}" stroke="#ccc" stroke-width="1"/>
  <line x1="{padding}" y1="{height - padding}" x2="{width - padding}" y2="{height - padding}" stroke="#ccc" stroke-width="1"/>

  <!-- Data line -->
  <polyline points="{polyline}" fill="none" stroke="#2563eb" stroke-width="2"/>

  <!-- Data points -->
"""
    for i, val in enumerate(values):
        x = padding + (i / max(len(values) - 1, 1)) * chart_width
        y = padding + chart_height - ((val - min_val) / value_range) * chart_height
        svg += f'  <circle cx="{x:.1f}" cy="{y:.1f}" r="4" fill="#2563eb"/>\n'

    # Labels (show first, middle, last)
    label_indices = (
        [0, len(labels) // 2, len(labels) - 1]
        if len(labels) > 2
        else range(len(labels))
    )
    for i in label_indices:
        if i < len(labels):
            x = padding + (i / max(len(values) - 1, 1)) * chart_width
            svg += f'  <text x="{x:.1f}" y="{height - padding + 20}" text-anchor="middle" font-size="12">{labels[i]}</text>\n'

    # Y-axis labels
    svg += f'  <text x="{padding - 10}" y="{padding}" text-anchor="end" font-size="12">{max_val}</text>\n'
    svg += f'  <text x="{padding - 10}" y="{height - padding}" text-anchor="end" font-size="12">{min_val}</text>\n'

    svg += "</svg>"
    return svg


def generate_svg_bar_chart(
    data: List[Dict[str, Any]],
    width: int = 800,
    height: int = 300,
    value_key: str = "count",
    label_key: str = "week",
) -> str:
    """Generate SVG bar chart for categorical data."""
    if not data:
        return f'<svg width="{width}" height="{height}"><text x="50%" y="50%" text-anchor="middle">No data available</text></svg>'

    values = [item.get(value_key, item.get("count", 0)) for item in data]
    labels = [
        item.get(label_key, item.get("week", item.get("date", ""))) for item in data
    ]

    if not values:
        return f'<svg width="{width}" height="{height}"><text x="50%" y="50%" text-anchor="middle">No data available</text></svg>'

    max_val = max(values) if values else 1

    # Chart dimensions
    padding = 60
    chart_width = width - 2 * padding
    chart_height = height - 2 * padding
    bar_width = chart_width / len(values) * 0.8

    # Generate SVG
    svg = f"""<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Grid lines -->
  <line x1="{padding}" y1="{padding}" x2="{padding}" y2="{height - padding}" stroke="#ccc" stroke-width="1"/>
  <line x1="{padding}" y1="{height - padding}" x2="{width - padding}" y2="{height - padding}" stroke="#ccc" stroke-width="1"/>

  <!-- Bars -->
"""
    for i, val in enumerate(values):
        x = (
            padding
            + (i / len(values)) * chart_width
            + (chart_width / len(values) - bar_width) / 2
        )
        bar_height = (val / max_val) * chart_height if max_val > 0 else 0
        y = padding + chart_height - bar_height
        svg += f'  <rect x="{x:.1f}" y="{y:.1f}" width="{bar_width:.1f}" height="{bar_height:.1f}" fill="#10b981"/>\n'

        # Value label on top of bar
        svg += f'  <text x="{x + bar_width/2:.1f}" y="{y - 5:.1f}" text-anchor="middle" font-size="12">{val}</text>\n'

    # X-axis labels
    label_indices = (
        [0, len(labels) // 2, len(labels) - 1]
        if len(labels) > 2
        else range(len(labels))
    )
    for i in label_indices:
        if i < len(labels):
            x = (
                padding
                + (i / len(values)) * chart_width
                + chart_width / len(values) / 2
            )
            svg += f'  <text x="{x:.1f}" y="{height - padding + 20}" text-anchor="middle" font-size="12">{labels[i]}</text>\n'

    svg += "</svg>"
    return svg


def generate_stale_files_list(data: List[Dict[str, Any]]) -> str:
    """Generate HTML list of stale files."""
    if not data:
        return "<p>No stale files found (all files modified within 30 days).</p>"

    html = "<ul>\n"
    for item in data[:20]:  # Limit to top 20
        path = item.get("path", "unknown")
        days = item.get("days_since_modified", 0)
        html += f"  <li><code>{path}</code> - {days} days old</li>\n"

    if len(data) > 20:
        html += f"  <li><em>... and {len(data) - 20} more</em></li>\n"

    html += "</ul>\n"
    return html


def generate_commit_frequency_table(data: List[Dict[str, Any]]) -> str:
    """Generate HTML table for commit frequency."""
    if not data:
        return "<p>No commit data available.</p>"

    html = """<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Commits</th>
    </tr>
  </thead>
  <tbody>
"""
    for item in data[:14]:  # Show last 2 weeks
        date = item.get("date", "unknown")
        count = item.get("commits", item.get("count", 0))
        html += f"    <tr><td>{date}</td><td>{count}</td></tr>\n"

    html += "  </tbody>\n</table>\n"
    return html


def generate_dashboard_html(metrics: Dict[str, Any]) -> str:
    """Generate complete HTML dashboard."""
    task_velocity = metrics.get("task_velocity", [])
    skills_growth = metrics.get("skills_growth", [])
    commit_frequency = metrics.get("commit_frequency", [])
    stale_skills = metrics.get("stale_skills", [])

    # Calculate summary stats
    total_tasks = sum(item.get("count", 0) for item in task_velocity)
    total_skills_added = sum(
        item.get("skills_added", item.get("count", 0)) for item in skills_growth
    )
    total_commits = sum(
        item.get("commits", item.get("count", 0)) for item in commit_frequency
    )
    stale_count = len(stale_skills)

    generated_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brain Repository Dashboard</title>
  <style>
    * {{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f3f4f6;
      color: #1f2937;
      padding: 2rem;
    }}
    .container {{
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 2rem;
    }}
    h1 {{
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #111827;
    }}
    .subtitle {{
      color: #6b7280;
      margin-bottom: 2rem;
    }}
    .stats-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }}
    .stat-card {{
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 1.5rem;
    }}
    .stat-label {{
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }}
    .stat-value {{
      font-size: 2rem;
      font-weight: bold;
      color: #111827;
    }}
    .chart-section {{
      margin-bottom: 3rem;
    }}
    h2 {{
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #111827;
    }}
    .chart-container {{
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 1rem;
      overflow-x: auto;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
    }}
    th, td {{
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }}
    th {{
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }}
    ul {{
      list-style: none;
      padding: 0;
    }}
    li {{
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }}
    li:last-child {{
      border-bottom: none;
    }}
    code {{
      background: #f3f4f6;
      padding: 0.125rem 0.25rem;
      border-radius: 3px;
      font-size: 0.875rem;
    }}
    .footer {{
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
    }}
  </style>
</head>
<body>
  <div class="container">
    <h1>🧠 Brain Repository Dashboard</h1>
    <p class="subtitle">Generated on {generated_time}</p>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Tasks Completed</div>
        <div class="stat-value">{total_tasks}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Skills Added</div>
        <div class="stat-value">{total_skills_added}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Commits (30d)</div>
        <div class="stat-value">{total_commits}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Stale Skills</div>
        <div class="stat-value">{stale_count}</div>
      </div>
    </div>

    <div class="chart-section">
      <h2>📈 Task Velocity (Weekly)</h2>
      <div class="chart-container">
        {generate_svg_line_chart(task_velocity, value_key="count", label_key="week")}
      </div>
    </div>

    <div class="chart-section">
      <h2>🌱 Skills Growth (Weekly)</h2>
      <div class="chart-container">
        {generate_svg_bar_chart(skills_growth, value_key="skills_added", label_key="week")}
      </div>
    </div>

    <div class="chart-section">
      <h2>💻 Commit Frequency (Last 30 Days)</h2>
      <div class="chart-container">
        {generate_commit_frequency_table(commit_frequency)}
      </div>
    </div>

    <div class="chart-section">
      <h2>⚠️ Stale Skills (Not Modified in 30+ Days)</h2>
      <div class="chart-container">
        {generate_stale_files_list(stale_skills)}
      </div>
    </div>

    <div class="footer">
      Generated by tools/brain_dashboard/generate_dashboard.py
    </div>
  </div>
</body>
</html>
"""
    return html


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate HTML dashboard from brain metrics JSON"
    )
    parser.add_argument(
        "--input",
        type=str,
        help="Input JSON file (default: stdin)",
        default=None,
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Output HTML file (default: stdout)",
        default=None,
    )

    args = parser.parse_args()

    # Read input
    try:
        if args.input:
            with open(args.input, "r", encoding="utf-8") as f:
                metrics = json.load(f)
        else:
            metrics = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input - {e}", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print(f"Error: Input file not found - {args.input}", file=sys.stderr)
        sys.exit(1)

    # Validate metrics structure
    required_keys = [
        "task_velocity",
        "skills_growth",
        "commit_frequency",
        "stale_skills",
    ]
    missing_keys = [key for key in required_keys if key not in metrics]
    if missing_keys:
        print(f"Warning: Missing keys in metrics: {missing_keys}", file=sys.stderr)
        # Add empty lists for missing keys
        for key in missing_keys:
            metrics[key] = []

    # Generate HTML
    html = generate_dashboard_html(metrics)

    # Write output
    try:
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"Dashboard generated: {args.output}", file=sys.stderr)
        else:
            print(html)
    except IOError as e:
        print(f"Error: Could not write output - {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
