# RollFlow Analysis Report

**Generated:** 2026-01-25T19:03:06.306540
**Run ID:** N/A

## Summary

- **Total tool calls:** 1731
- **Pass rate:** 98.8%
- **Fail rate:** 0.0%

## Data Sources

- **RovoDev tool calls:** 1589 (bash, grep, open_files, etc.)
- **Shell marker calls:** 142 (fix-markdown, pre-commit, verifier)

## Tool Breakdown

| Tool | Calls | Avg Duration | Total Time | Pass | Fail |
|------|-------|--------------|------------|------|------|
| `bash` | 965 | 753ms | 723.8s | 961 | 0 |
| `find_and_replace_code` | 199 | 586ms | 110.2s | 188 | 0 |
| `update_todo` | 138 | 670ms | 91.9s | 137 | 0 |
| `expand_code_chunks` | 122 | 211ms | 25.1s | 119 | 0 |
| `open_files` | 84 | 366ms | 30.4s | 83 | 0 |
| `unknown` | 46 | 162386ms | 7469.7s | 46 | 0 |
| `grep` | 40 | 414ms | 16.6s | 40 | 0 |
| `create_file` | 37 | 485ms | 17.9s | 37 | 0 |
| `fix-markdown` | 32 | 6487ms | 207.6s | 32 | 0 |
| `pre-commit` | 32 | 11849ms | 379.2s | 32 | 0 |
| `verifier` | 32 | 2025ms | 64.8s | 32 | 0 |
| `expand_folder` | 4 | 568ms | 2.3s | 4 | 0 |

## Cache Advice

- **Potential skips:** 42
- **Estimated time saved:** 287.8s

## Slowest Tool Calls

| Tool | Duration |
|------|----------|
| `unknown` | 633.0s |
| `unknown` | 618.3s |
| `unknown` | 460.3s |
| `unknown` | 420.2s |
| `unknown` | 410.4s |
| `unknown` | 282.2s |
| `unknown` | 276.5s |
| `unknown` | 264.0s |
| `unknown` | 253.7s |
| `unknown` | 246.8s |
