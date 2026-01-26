# RollFlow Review Pack

**Generated:** 2026-01-26T11:22:04.398954
**Run ID:** N/A
**Total Tool Calls:** 3617

## Executive Summary

**Status:** ✅ Good (98% success rate)

### Quick Stats

- **Pass Rate:** 98.7% (3570/3617)
- **Fail Rate:** 0.0% (1/3617)
- **Unknown:** 46

### Cache Opportunity

- **Potential skips:** 60 duplicate calls
- **Time savings:** 418.8s

## Performance Analysis

### Slowest Tools

| Tool | Duration |
|------|----------|
| `unknown` | 633.01s |
| `unknown` | 618.30s |
| `unknown` | 544.67s |
| `unknown` | 460.27s |
| `unknown` | 438.14s |
| `unknown` | 435.73s |
| `unknown` | 420.24s |
| `unknown` | 420.16s |
| `unknown` | 417.80s |
| `unknown` | 410.40s |

#### Slowest Tool Call Details

**Tool:** `unknown` | **Duration:** 633.01s

<details>
<summary>📋 Log Excerpt</summary>

```text
 23540     ────────────────────────────────────────────────────────────
 23541     [?25hSession context: ▮▮▮▮▮▮▮▮▮▮ 72.3K/200K
 23542     
 23543     
 23544     Script done on 2026-01-25 16:51:12+02:00 [COMMAND_EXIT_CODE="0"]
 23545 >>> :::TOOL_END::: id=393c4892-d9cf-4a73-894b-5219d9f29d5f result=PASS exit=0 duration_ms=633012 ts=2026-01-25T14:51:12Z
 23546     :::VERIFIER_ENV::: iter=4 ts=1769352672 run_id=1769352672-9402
 23547     :::PHASE_END::: iter=4 phase=build status=ok run_id=run-1769351460-9402 ts=1769352681055
 23548     :::ITER_END::: iter=4 run_id=run-1769351460-9402 ts=1769352681109
```

</details>


### Flaky Tools (Both PASS and FAIL)

- `verifier` ⚠️

## Cache Optimization

- **Reusable PASS calls:** 335
- **Potential skips:** 60
- **Estimated time saved:** 418.8s

### Top Duplicate Cache Keys

1. `fix-markdown|18eeb35`
2. `pre-commit|18eeb35`
3. `verifier-pre-build|18eeb35`
4. `fix-markdown|058804c`
5. `pre-commit|058804c`
6. `verifier-pre-build|058804c`
7. `fix-markdown|e574978`
8. `pre-commit|e574978`
9. `verifier-pre-build|e574978`
10. `fix-markdown|4e28fec`
*... and 8 more*

## ❌ Failures

**Total failures:** 1

### Failures by Tool

| Tool | Count |
|------|-------|
| `verifier` | 1 |

### Recent Failures

#### Failure 1: verifier

```text
interrupted
```

<details>
<summary>📋 Log Excerpt</summary>

```text
     1     :::ITER_START::: iter=2 run_id=run-1769386893-8658 ts=1769386997774
     2     :::CACHE_CONFIG::: mode=use scope=verify,read exported=1 iter=2 ts=1769386997788
     3     :::TOOL_START::: id=c70e2844-c31b-46be-a498-c31435c50280 tool=fix-markdown cache_key=fix-markdown|a4755b0 git_sha=a4755b0 ts=2026-01-26T00:23:17Z
     4     :::TOOL_END::: id=c70e2844-c31b-46be-a498-c31435c50280 result=PASS exit=0 duration_ms=7963 ts=2026-01-26T00:23:25Z
     5     :::TOOL_START::: id=bf7b7fcf-1bc9-4904-8b1a-9badd71230ab tool=pre-commit cache_key=pre-commit|a4755b0 git_sha=a4755b0 ts=2026-01-26T00:23:25Z
     6     :::TOOL_END::: id=bf7b7fcf-1bc9-4904-8b1a-9badd71230ab result=PASS exit=0 duration_ms=7122 ts=2026-01-26T00:23:32Z
     7 >>> :::TOOL_START::: id=cd1c8da7-c1b9-4d31-9378-cb575e3d27c1 tool=verifier cache_key=verifier-pre-build|a4755b0 git_sha=a4755b0 ts=2026-01-26T00:23:32Z
     8 >>> :::TOOL_END::: id=cd1c8da7-c1b9-4d31-9378-cb575e3d27c1 result=FAIL exit=130 duration_ms=1268 reason=interrupted ts=2026-01-26T00:23:34Z
```

</details>


## Tool Breakdown

| Tool | Total | Pass | Fail | Success Rate |
|------|-------|------|------|--------------|
| `bash` | 1954 | 1947 | 0 | 99.6% |
| `find_and_replace_code` | 343 | 314 | 0 | 91.5% |
| `update_todo` | 229 | 229 | 0 | 100.0% |
| `unknown` | 225 | 225 | 0 | 100.0% |
| `expand_code_chunks` | 182 | 178 | 0 | 97.8% |
| `open_files` | 166 | 160 | 0 | 96.4% |
| `fix-markdown` | 132 | 132 | 0 | 100.0% |
| `pre-commit` | 132 | 132 | 0 | 100.0% |
| `verifier` | 132 | 131 | 1 | 99.2% |
| `grep` | 72 | 72 | 0 | 100.0% |
| `create_file` | 46 | 46 | 0 | 100.0% |
| `expand_folder` | 3 | 3 | 0 | 100.0% |
| `mcp__atlassian__get_tool_schema` | 1 | 1 | 0 | 100.0% |
