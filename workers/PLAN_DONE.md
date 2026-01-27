# PLAN_DONE - Archived Completed Tasks

Completed tasks from `workers/IMPLEMENTATION_PLAN.md` are archived here.

---

## Archived on 2026-01-26 (Set 1)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 23.1.1 | - [x] **23.1.1** Fix `sync_completions_to_cortex.sh` unbound variable **[HIGH]** |
| 2026-01-26 | 23.1.2 | - [x] **23.1.2** Untrack rollflow cache sqlite files and ensure ignored **[HIGH]** |
| 2026-01-26 | 23.2.1 | - [x] **23.2.1** Replace `git add -A` with scoped staging allowlist/denylist **[HIGH]**<br>- [x] `git add -A` no longer used<br>- [x] Core files always staged (IMPLEMENTATION_PLAN.md, THUNK.md)<br>- [x] Artifacts excluded by default<br>- [x] Cortex copies excluded by default<br>- [x] Cache files excluded by default<br>- [x] Hash regenerated in all `.verify/` directories |
| 2026-01-26 | 23.3.1 | - [x] **23.3.1** Make `cortex/snapshot.sh` avoid regenerating dashboard/metrics by default **[MEDIUM]** |
| 2026-01-26 | 23.3.2 | - [x] **23.3.2** Pass changed `.md` files to fix-markdown instead of scanning repo root **[MEDIUM]** |
| 2026-01-26 | 23.4.1 | - [x] **23.4.1** Add PROMPT instruction: check THUNK before re-validating tasks **[LOW]** |
| 2026-01-26 | 9C.0.3 | - [x] **9C.0.3** Document RovoDev tool instrumentation limitation |
| 2026-01-26 | 9C.1.1 | - [x] **9C.1.1** Enhance `cortex/snapshot.sh` with batching hints |
| 2026-01-26 | 9C.1.2 | - [x] **9C.1.2** Document `[S/M/L]` complexity convention for task estimation |
| 2026-01-26 | 9C.2.1 | - [x] **9C.2.1** Create batch task template in `templates/ralph/PROMPT.md` |
| 2026-01-26 | 9C.2.2 | - [x] **9C.2.2** BATCH: Create missing language templates (javascript, go, website) |
| 2026-01-26 | 9C.2.B2 | - [x] **9C.2.B2** BATCH: Update skills documentation (combines 7.2.1, 7.2.2) |
| 2026-01-26 | 9C.2.B3 | - [x] **9C.2.B3** BATCH: Improve onboarding docs (combines 7.1.1, 7.1.2) |
| 2026-01-26 | 9C.3.1 | - [x] **9C.3.1** Add duration tracking to `current_ralph_tasks.sh` footer |
| 2026-01-26 | 9C.3.2 | - [x] **9C.3.2** Create decomposition checklist in `skills/playbooks/` |
| 2026-01-26 | 22.2.3 | - [x] **22.2.3** Fix MD056 in workers/ralph/THUNK.md line 801 (escape pipes) |

### Archived on 2026-01-26 (Set 2)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 24.1.1 | - [x] **24.1.1** Find exact emitter of "Session termination failed: 404" **[HIGH]** |
| 2026-01-26 | 24.1.2 | - [x] **24.1.2** Trace session lifecycle and termination call path **[HIGH]** |
| 2026-01-26 | 24.1.3 | - [x] **24.1.3** Capture minimal reproduction log snippet **[HIGH]** |
| 2026-01-26 | 24.1.4 | - [x] **24.1.4** Classify 404 as harmless-noise vs actionable-bug **[HIGH]** |
| 2026-01-26 | 24.2.1 | - [x] **24.2.1** Instrument emitter with contextual info **[MEDIUM]** |
| 2026-01-26 | 24.2.2 | - [x] **24.2.2** Add dedupe/throttle for repeated identical errors **[MEDIUM]** |
| 2026-01-26 | 24.2.3 | - [x] **24.2.3** Add DEBUG/VERBOSE toggle for full error output **[LOW]** |
| 2026-01-26 | 24.3.1 | - [x] **24.3.1** FIX IF: Double-termination / already-cleaned session **[MEDIUM]** |
| 2026-01-26 | 24.3.2 | - [x] **24.3.2** FIX IF: Stale/invalid session ID **[MEDIUM]** |
| 2026-01-26 | 24.3.4 | - [x] **24.3.4** FIX IF: External best-effort cleanup (expected 404) **[MEDIUM]** |

### Archived on 2026-01-26 (Set 3)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 24.3.3 | - [x] **24.3.3** FIX IF: Wrong endpoint/path **[MEDIUM]** |
| 2026-01-26 | 24.4.1 | - [x] **24.4.1** Document PLAN-ONLY boundary rules in AGENTS.md **[HIGH]** |
| 2026-01-26 | 24.4.2 | - [x] **24.4.2** Add PLAN-ONLY guard function to shared lib **[MEDIUM]** |
| 2026-01-26 | 24.4.4 | - [x] **24.4.4** Add acceptance test proving PLAN-ONLY mode is respected **[HIGH]** |
| 2026-01-26 | - [x] Emitter identified and documented in THUNK | - [x] Emitter identified and documented in THUNK |
| 2026-01-26 | - [x] Root cause classified as HARMLESS-NOISE or ACTIONABLE-BUG with evidence | - [x] Root cause classified as HARMLESS-NOISE or ACTIONABLE-BUG with evidence |
| 2026-01-26 | - [x] Appropriate fix branch completed (one of 24.3.1-24.3.4) | - [x] Appropriate fix branch completed (one of 24.3.1-24.3.4) |
| 2026-01-26 | - [x] Spam reduced: normal runs show 1 contextual message + suppressed summary | - [x] Spam reduced: normal runs show 1 contextual message + suppressed summary |
| 2026-01-26 | - [x] PLAN-ONLY guardrails documented and implemented | - [x] PLAN-ONLY guardrails documented and implemented |
| 2026-01-26 | - [x] Guard function tested: blocks forbidden actions, allows reads | - [x] Guard function tested: blocks forbidden actions, allows reads |
| 2026-01-26 | 23.2.3 | - [x] **23.2.3** Fix cleanup_plan.sh to reliably locate workers/IMPLEMENTATION_PLAN.md **[HIGH]** |
| 2026-01-26 | 21.3.3 | - [x] **21.3.3** Add tools reference to `skills/index.md` [LOW] |
| 2026-01-26 | 22.3.1 | - [x] **22.3.1** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 159 |
| 2026-01-26 | 22.3.2 | - [x] **22.3.2** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 241 |
| 2026-01-26 | 22.3.3 | - [x] **22.3.3** Fix MD032 in cortex/IMPLEMENTATION_PLAN.md line 295 |
| 2026-01-26 | 22.4.1 | - [x] **22.4.1** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 159 |
| 2026-01-26 | 22.4.2 | - [x] **22.4.2** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 241 |
| 2026-01-26 | 22.4.3 | - [x] **22.4.3** Fix MD032 in workers/IMPLEMENTATION_PLAN.md line 295 |

### Archived on 2026-01-26 (Set 4)

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-26 | 23.2.2 | - [x] **23.2.2** End-of-loop cleanup when no unchecked tasks remain **[MEDIUM]** |
| 2026-01-26 | 9C.4.1 | - [x] **9C.4.1** Validate batching recommendations against next 5 iterations |
| 2026-01-26 | 22.4B.1 | - [x] **22.4B.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 261 |
| 2026-01-26 | 22.4B.2 | - [x] **22.4B.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 290 |
| 2026-01-26 | 22.4B.3 | - [x] **22.4B.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 315 |
| 2026-01-26 | 22.4B.4 | - [x] **22.4B.4** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 319 |
| 2026-01-26 | 22.4B.5 | - [x] **22.4B.5** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 320 |
| 2026-01-26 | 22.4B.6 | - [x] **22.4B.6** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 321 |
| 2026-01-26 | 22.4B.7 | - [x] **22.4B.7** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 325 |
| 2026-01-26 | 22.4C.1 | - [x] **22.4C.1** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 261 |
| 2026-01-26 | 22.4C.2 | - [x] **22.4C.2** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 290 |
| 2026-01-26 | 22.4C.3 | - [x] **22.4C.3** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 315 |
| 2026-01-26 | 22.4C.4 | - [x] **22.4C.4** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 319 |
| 2026-01-26 | 22.4C.5 | - [x] **22.4C.5** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 320 |
| 2026-01-26 | 22.4C.6 | - [x] **22.4C.6** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 321 |
| 2026-01-26 | 22.4C.7 | - [x] **22.4C.7** Fix MD012 in cortex/IMPLEMENTATION_PLAN.md line 325 |
| 2026-01-26 | 22.5.1 | - [x] **22.5.1** Fix MD024 in cortex/PLAN_DONE.md line 186 |
| 2026-01-26 | 22.5.2 | - [x] **22.5.2** Fix MD024 in cortex/PLAN_DONE.md line 210 |
| 2026-01-26 | 22.5.3 | - [x] **22.5.3** Fix MD024 in cortex/PLAN_DONE.md line 221 |
| 2026-01-26 | 22.6.1 | - [x] **22.6.1** Fix MD001 in workers/PLAN_DONE.md (line numbers refer to file state at the time of the original issue) |
| 2026-01-26 | 22.7.1 | - [x] **22.7.1** Fix MD024 in cortex/PLAN_DONE.md line 186 |
| 2026-01-26 | 22.7.2 | - [x] **22.7.2** Fix MD024 in cortex/PLAN_DONE.md line 210 |
| 2026-01-26 | 22.7.3 | - [x] **22.7.3** Fix MD024 in cortex/PLAN_DONE.md line 221 |
| 2026-01-26 | 22.8.1 | - [x] **22.8.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md lines 31-33 |
| 2026-01-26 | 22.8.2 | - [x] **22.8.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md lines 39-40 |

### Archived on 2026-01-27

| Date | Task ID | Description |
|------|---------|-------------|
| 2026-01-27 | 22.8.3 | - [x] **22.8.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 48 |
| 2026-01-27 | 22.9.1 | - [x] **22.9.1** Fix MD055/MD056 in workers/ralph/THUNK.md lines 815-828 |
| 2026-01-27 | 22.10.1 | - [x] **22.10.1** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 32 |
| 2026-01-27 | 22.10.2 | - [x] **22.10.2** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 111 |
| 2026-01-27 | 22.10.3 | - [x] **22.10.3** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 112 |
| 2026-01-27 | 22.10.4 | - [x] **22.10.4** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 116 |
| 2026-01-27 | 22.10.5 | - [x] **22.10.5** Fix MD012 in workers/IMPLEMENTATION_PLAN.md line 117 |
| 2026-01-27 | 22.11.1 | - [x] **22.11.1** Fix MD024 in workers/PLAN_DONE.md line 49 |
