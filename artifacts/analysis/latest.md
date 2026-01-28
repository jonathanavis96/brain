# RollFlow Analysis Report

> **⚠️ HISTORICAL DOCUMENT** - This is a historical analysis from 2026-01-26. For current metrics, run `tools/rollflow_analyze/` or see [artifacts/analysis/](.) for newer reports.

**Generated:** 2026-01-26T12:08:49.274795
**Run ID:** N/A

## Summary

- **Total tool calls:** 4072
- **Pass rate:** 98.8%
- **Fail rate:** 0.0%

## Data Sources

- **RovoDev tool calls:** 3195 (bash, grep, open_files, etc.)
- **Shell marker calls:** 877 (fix-markdown, pre-commit, verifier)

## Tool Breakdown

| Tool | Calls | Avg Duration | Total Time | Pass | Fail |
|------|-------|--------------|------------|------|------|
| `bash` | 2102 | 1047ms | 2194.4s | 2095 | 0 |
| `rovodev-session` | 481 | 130552ms | 62795.5s | 481 | 0 |
| `find_and_replace_code` | 369 | 761ms | 257.9s | 339 | 0 |
| `update_todo` | 238 | 450ms | 107.0s | 238 | 0 |
| `expand_code_chunks` | 189 | 212ms | 39.2s | 185 | 0 |
| `open_files` | 170 | 193ms | 31.6s | 164 | 0 |
| `fix-markdown` | 132 | 7496ms | 989.5s | 132 | 0 |
| `pre-commit` | 132 | 13525ms | 1785.2s | 132 | 0 |
| `verifier` | 132 | 2025ms | 267.2s | 131 | 1 |
| `grep` | 77 | 364ms | 28.0s | 77 | 0 |
| `create_file` | 46 | 453ms | 20.8s | 46 | 0 |
| `expand_folder` | 3 | 609ms | 1.8s | 3 | 0 |
| `mcp__atlassian__get_tool_schema` | 1 | 172ms | 0.2s | 1 | 0 |

## Cache Advice

- **Potential skips:** 60
- **Estimated time saved:** 418.8s

## Slowest Tool Calls

| Tool | Duration |
|------|----------|
| `rovodev-session` | 633.0s |
| `rovodev-session` | 618.3s |
| `rovodev-session` | 544.7s |
| `rovodev-session` | 460.3s |
| `rovodev-session` | 449.9s |
| `rovodev-session` | 438.1s |
| `rovodev-session` | 435.7s |
| `rovodev-session` | 420.2s |
| `rovodev-session` | 420.2s |
| `rovodev-session` | 417.8s |
