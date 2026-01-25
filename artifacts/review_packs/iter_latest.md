# RollFlow Review Pack

**Generated:** 2026-01-25T18:46:07.591341
**Run ID:** N/A
**Total Tool Calls:** 460

## Executive Summary

**Status:** ✅ Excellent (100% success rate)

### Quick Stats

- **Pass Rate:** 100.0% (460/460)
- **Fail Rate:** 0.0% (0/460)
- **Unknown:** 0

### Cache Opportunity

- **Potential skips:** 42 duplicate calls
- **Time savings:** 287.8s

## Performance Analysis

### Slowest Tools

| Tool | Duration |
|------|----------|
| `unknown` | 633.01s |
| `unknown` | 618.30s |
| `unknown` | 544.67s |
| `unknown` | 460.27s |
| `unknown` | 449.86s |
| `unknown` | 420.24s |
| `unknown` | 410.40s |
| `unknown` | 382.47s |
| `unknown` | 381.10s |
| `unknown` | 377.50s |

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


## Cache Optimization

- **Reusable PASS calls:** 54
- **Potential skips:** 42
- **Estimated time saved:** 287.8s

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

## Tool Breakdown

| Tool | Total | Pass | Fail | Success Rate |
|------|-------|------|------|--------------|
| `unknown` | 364 | 364 | 0 | 100.0% |
| `fix-markdown` | 32 | 32 | 0 | 100.0% |
| `pre-commit` | 32 | 32 | 0 | 100.0% |
| `verifier` | 32 | 32 | 0 | 100.0% |
