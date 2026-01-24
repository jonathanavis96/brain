# Implementation Plan - Brain Repository

**Last Updated:** 2026-01-25 01:30:00

**Current Status:** Phase 5 complete (all language READMEs done). Phase 6 ready to execute (template improvements - start with 6.2.x cache docs). Phase 7 queued (documentation). Phase 4 deferred (cache refactoring). Phase X queued (structured logging). All verifier warnings are false positives (7 waiver requests pending human approval).

<!-- Cortex adds new Task Contracts below this line -->

## Phase 0-Warn: Verifier Warnings

**Goal:** Resolve verifier warnings from latest run.

**Status:** All 7 warnings are false positives. Waiver requests created and pending human approval:

- Template.1: thunk_ralph_tasks.sh (files identical, diff bug)
- Hygiene.TemplateSync.1: current_ralph_tasks.sh (files identical, diff bug)
- Hygiene.TemplateSync.2: loop.sh (intentional divergence for brain-specific features)
- Lint.Shellcheck.LoopSh: loop.sh (passes shellcheck with only SC1091 info-level)
- Lint.Shellcheck.VerifierSh: verifier.sh (passes clean)
- Lint.Shellcheck.CurrentRalphTasks: current_ralph_tasks.sh (passes clean)
- Lint.Shellcheck.ThunkRalphTasks: thunk_ralph_tasks.sh (passes clean)

- [x] **WARN.Cortex.FileSizeLimit.SYSTEM_PROMPT** Reduce cortex/CORTEX_SYSTEM_PROMPT.md to 150 lines (currently 161 lines)
- [x] **WARN.Hygiene.TemplateSync.1.current_ralph_tasks** Request waiver for current_ralph_tasks.sh (WVR-2026-01-24-003)
- [x] **WARN.Hygiene.TemplateSync.2.loop** Request waiver for loop.sh (WVR-2026-01-24-002 + others)

## Phase 0: Structured Logging (Cortex-readable)

**Goal:** Add structured markers to loop.sh for better observability.

- [ ] **X.3.4** Add smoke check for CACHE_GUARD marker
- [ ] **X.4.1** Update `:::CACHE_CONFIG:::` to include `iter=` and `ts=`
- [ ] **X.4.2** Update `:::VERIFIER_ENV:::` to include `iter=` and `ts=`
- [ ] **X.2.1** Implement `run_tool()` wrapper with TOOL_START/TOOL_END markers
- [ ] **X.2.2** Route important tool calls through `run_tool()`
- [ ] **X.2.3** Ensure TOOL_END emitted on failure
- [ ] **X.1.1** Emit ITER_START/ITER_END markers
- [ ] **X.1.2** Emit PHASE_START/PHASE_END markers
- [ ] **X.5.1** Update `rollflow_analyze` to parse `:::` markers
- [ ] **X.5.2** Output `artifacts/analysis/iter_###.json`
- [ ] **X.6.1** Generate `artifacts/review_packs/iter_###.md` from JSON
- [ ] **X.6.2** Attach filtered log excerpts

## Phase 4: Shared Cache Library + Cortex Support (Safety Net)

**Goal:** Extract caching into shared infrastructure for waste-prevention + reliability across all runners.

**Rationale:** Caching won't save huge tokens for "new thinking" work, but prevents waste from:

- Reruns after crashes / network / rate-limit issues
- Accidental double-runs
- Retries where input didn't change
- Repeated setup/analysis steps

### Phase 4.1: Extract Cache Functions

- [ ] **4.1.1** Create `workers/shared/cache.sh` with extracted functions
  - Move from loop.sh: cache key generation, lookup/store, log helpers
  - Export interface: `cache_should_use`, `cache_make_key`, `cache_try_load`, `cache_store`
  - Include env parsing for `CACHE_MODE`, `CACHE_SCOPE`, `--force-fresh`
  - **AC:** File exists, functions are callable, shellcheck passes

### Phase 4.2: Refactor loop.sh to Use Shared Library

- [ ] **4.2.1** Update `workers/ralph/loop.sh` to source shared cache library
  - Replace inline cache logic with calls to `workers/shared/cache.sh`
  - Keep exact semantics: `CACHE_MODE`, `CACHE_SCOPE`, BUILD/PLAN blocking
  - **AC:** Before/after run shows identical cache hits/misses

- [ ] **4.2.2** Update `workers/cerebras/loop.sh` to source shared cache library
  - Same refactor as Ralph
  - **AC:** Cerebras caching unchanged behaviorally

### Phase 4.3: Add Cortex Caching

- [ ] **4.3.1** Update `cortex/one-shot.sh` to source shared cache library
  - Add `source workers/shared/cache.sh`
  - Set `AGENT_NAME=cortex` explicitly
  - Wrap `acli rovodev run` call with cache check/store
  - **AC:** Same one-shot twice with no repo changes → Run 1: miss+store, Run 2: hit+skip

### Phase 4.4: Fix Agent Isolation

- [ ] **4.4.1** Replace RUNNER dependency with AGENT_NAME in cache keys
  - Cache key "agent" field uses `AGENT_NAME` not `RUNNER`
  - Fall back sanely if `AGENT_NAME` missing (log warning)
  - **AC:** Ralph/Cortex/Cerebras with identical prompts don't share cache entries

### Phase 4.5: Smoke Test

- [ ] **4.5.1** Create `scripts/test_cache_smoke.sh` for cache correctness
  - Test: same prompt + git state → cache hit on 2nd run
  - Test: change git_sha → cache miss
  - Test: `--force-fresh` → bypass even if entry exists
  - Test: `CACHE_SCOPE=llm_ro` blocked during BUILD/PLAN
  - **AC:** One command verifies caching works for loop.sh and one-shot.sh


## Phase 5: Skills Knowledge Base Expansion

**Goal:** Expand brain skills to cover more domains and improve existing documentation.

**Priority:** Medium - Enhances agent capabilities and reduces knowledge gaps.

### Phase 5.4: Language-Specific Skills (remaining)

- [x] **5.4.2** Create `skills/domains/languages/typescript/README.md`
  - Type system fundamentals
  - Generic patterns and advanced types
  - Integration with JavaScript projects
  - **AC:** README exists with type system section

- [x] **5.4.3** Create `skills/domains/languages/go/README.md`
  - Go idioms and conventions
  - Concurrency patterns (goroutines, channels)
  - Error handling best practices
  - **AC:** README exists with concurrency section

**Phase 5 AC:** skills/ directory has 10+ new skill files covering frontend, testing, DevOps, and language domains

**Phase 5 Status:** ✅ COMPLETE - All tasks done. Phase AC achieved (14+ new skills added including TypeScript and Go READMEs).

## Phase 6: Template Improvements

**Goal:** Enhance project templates with better defaults and more comprehensive coverage.

**Priority:** Medium - Improves new project bootstrapping experience.

**Recommended Next:** Start with 6.2.x tasks (Ralph template enhancements) as they build on recent cache work, then proceed to language templates (6.1.x).

- [ ] **6.2.1** Add cache configuration guidance to `templates/ralph/PROMPT.md`
  - Document CACHE_MODE and CACHE_SCOPE usage
  - Explain --force-fresh and --cache-skip flags
  - Add examples for BUILD/PLAN cache behavior
  - **AC:** PROMPT.md has cache configuration section with examples

- [ ] **6.2.2** Update `templates/ralph/VALIDATION_CRITERIA.project.md` with cache validation
  - Add cache smoke test commands
  - Document expected cache hit/miss patterns
  - Include troubleshooting guidance
  - **AC:** VALIDATION_CRITERIA.md has cache testing section

- [ ] **6.1.1** Create `templates/javascript/` directory with JS/TS project template
  - AGENTS.project.md, NEURONS.project.md, VALIDATION_CRITERIA.project.md
  - package.json template with common scripts
  - ESLint and Prettier configs
  - **AC:** Directory exists with 5+ files

- [ ] **6.1.2** Create `templates/go/` directory with Go project template
  - AGENTS.project.md, NEURONS.project.md, VALIDATION_CRITERIA.project.md
  - go.mod template and project structure
  - golangci-lint config
  - **AC:** Directory exists with 5+ files

- [ ] **6.3.1** Expand `templates/website/` with more comprehensive starter
  - Review existing website skills in skills/domains/websites/
  - Add section-based composition templates
  - Include SEO and analytics guidance
  - **AC:** templates/website/ has enhanced structure

**Phase 6 AC:** templates/ directory has 2 new language templates and enhanced Ralph/website templates

## Phase 7: Documentation and Maintenance

**Goal:** Improve documentation quality and maintain existing files.

**Priority:** Low - Nice-to-have improvements for clarity and completeness.

- [ ] **7.1.1** Enhance root `README.md` with better onboarding flow
- [ ] **7.1.2** Create `CONTRIBUTING.md` with contribution guidelines
- [ ] **7.2.1** Update `skills/index.md` with new skill files from Phase 5
- [ ] **7.2.2** Update `skills/SUMMARY.md` with enhanced error reference
- [ ] **7.3.1** Request AC.rules update for shellcheck regex

**Phase AC:** Documentation improved with better onboarding, all new skills indexed

---

## Completed Phases

See `workers/ralph/THUNK.md` for complete task history (550+ completed tasks).

**Completed:** Phases 0-3, 5 (partial), 8-13, X.3.1-X.3.3, RollFlow Analyzer (12.x)
