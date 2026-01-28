# Token Efficiency Analysis - Cortex vs Ralph

**Date:** 2026-01-21 20:30:00  
**Analyzed by:** Cortex

**2026-01-27 note:** Atlassian UI "Session context" meter appears to have increased from ~200K max to ~272K max for the same model/profile (likely a platform-side update). Practical implication: slightly more headroom before truncation, but keep using token-efficient practices to reduce latency and cognitive load.

## Summary Statistics

| Component                    | Lines | Words | Bytes  | Est. Tokens |
| ---------------------------- | ----- | ----- | ------ | ----------- |
| Cortex System Prompt         | 399   | 2,091 | 14,331 | ~3,600      |
| Ralph System Prompt          | 369   | 2,103 | 14,769 | ~3,700      |
| snapshot.sh output           | 140   | ~800  | 4,309  | ~1,100      |
| **Total Cortex Context**     | ~539  | ~2,891| ~18,640| **~4,700**  |
| **Total Ralph Context**      | ~509  | ~2,903| ~19,078| **~4,800**  |

*Note: Token estimates assume ~4 chars per token. Actual may vary by model.*

---

## Current Efficiency Issues

### 🔴 Critical Issues

#### 1. **Cortex: Redundant snapshot.sh calls**

- **Problem:** Cortex calls `bash cortex/snapshot.sh` multiple times per session
- **Cost:** ~1,100 tokens × N calls = wasted tokens
- **Current session:** Called once (efficient), but could be called more
- **Fix:** Cache snapshot output in session, reference cached version

#### 2. **Ralph: No incremental state loading**

- **Problem:** Ralph loads full PROMPT.md (3,700 tokens) every iteration
- **Cost:** 3,700 tokens × 20 iterations = 74,000 tokens per loop
- **Fix:**
  - Load full prompt once
  - Incremental updates: "Last verifier result: PASS" (20 tokens)
  - Save ~70,000 tokens per 20-iteration loop

#### 3. **Both: File re-opening inefficiency**

- **Problem:** Opening same files multiple times (e.g., IMPLEMENTATION_PLAN.md)
- **Cost:** ~500 tokens × multiple opens = wasted tokens
- **Fix:** Reference previously opened content in conversation history

### 🟡 Medium Issues

#### 4. **Cortex: Verbose Task Contracts**

- **Problem:** Task contracts in IMPLEMENTATION_PLAN.md are comprehensive but verbose
- **Example:** Task 0.0 is 42 lines with full context
- **Cost:** ~300 tokens per task × 10 tasks = 3,000 tokens
- **Fix:** Use shorthand format for simple tasks:

  ```markdown
  - [ ] **1.1** Copy SKILL_TEMPLATE → templates/ [AC: file exists, executable]
  ```

  Reserve verbose format for complex/ambiguous tasks

#### 5. **Ralph: NEURONS.md duplication**

- **Problem:** NEURONS.md contains examples that overlap with PROMPT.md
- **Cost:** ~500 tokens of duplication
- **Fix:** NEURONS.md should reference PROMPT.md sections, not repeat them

#### 6. **Both: Example code blocks**

- **Problem:** System prompts include bash/markdown examples
- **Cost:** ~400 tokens across both prompts
- **Fix:** Move examples to separate reference docs, link to them

### 🟢 Low Issues

#### 7. **Cortex: DECISIONS.md growth**

- **Problem:** DECISIONS.md grows over time (currently 265 lines)
- **Cost:** Not loaded by default (good!), but could become large
- **Fix:** Archive old decisions annually

#### 8. **Ralph: Verifier output verbosity**

- **Problem:** `.verify/latest.txt` can be verbose with many rules
- **Cost:** ~200-500 tokens depending on failures
- **Fix:** Already efficient (only loads when needed)

---

## Recommendations

### 🚀 High-Impact Improvements (Priority 1)

#### R1: Implement Incremental State Loading for Ralph

**Impact:** Save ~70,000 tokens per 20-iteration loop

**Implementation:**

1. Modify `loop.sh` to pass minimal state updates:
   - First iteration: Full PROMPT.md
   - Subsequent iterations: Only changes (verifier result, current task)
2. Use conversation history to maintain context

**Estimated savings:** 60-70% of per-iteration token cost

---

#### R2: Cache snapshot.sh Output for Cortex

**Impact:** Save ~1,100 tokens per redundant call

**Implementation:**

1. Run `snapshot.sh` once at start of session
2. Store output in environment variable or temp file
3. Reference cached output instead of re-running

**Estimated savings:** 1,100 tokens × (N-1) redundant calls

---

#### R3: Implement "Compact Task Format" for Simple Tasks

**Impact:** Save ~200 tokens per simple task

**Format:**

```markdown
## Phase 1: Quick Fixes

- [ ] **1.1** Copy SKILL_TEMPLATE → templates/ [AC: exists, exec]
- [ ] **1.2** Fix links in skills/conventions.md [AC: no broken links]
- [ ] **1.3** Update verifier baseline [AC: .verify/ac.sha256 updated]
```text

Reserve verbose format for:

- P1/P0 critical tasks
- Complex tasks with multiple subtasks
- Tasks with ambiguous requirements

**Estimated savings:** 200 tokens × 15 simple tasks = 3,000 tokens

---

### 📊 Medium-Impact Improvements (Priority 2)

#### R4: Deduplicate NEURONS.md and PROMPT.md

**Impact:** Save ~500 tokens in Ralph's context

**Implementation:**

1. Move overlapping content to PROMPT.md (single source of truth)
2. NEURONS.md becomes navigation index:

   ```markdown
   ## Error Handling
   See PROMPT.md "Runtime Error Protocol" section

   Key points:
   - Stop on error (don't continue)
   - Check skills/SUMMARY.md
   - Apply minimum fix
   ```

**Estimated savings:** 500 tokens per Ralph iteration

---

#### R5: Extract Examples to Reference Docs

**Impact:** Save ~400 tokens across both prompts

**Implementation:**

1. Create `cortex/EXAMPLES.md` and `workers/ralph/EXAMPLES.md`
2. Move bash/markdown examples from system prompts
3. Reference: "See EXAMPLES.md for Task Contract templates"

**Estimated savings:** 400 tokens across both agents

---

### 🔧 Low-Impact Improvements (Priority 3)

#### R6: Implement DECISIONS.md Archiving

**Impact:** Prevent future growth (currently not loaded by default)

**Implementation:**

1. Create `cortex/DECISIONS_ARCHIVE.md` annually
2. Move decisions older than 1 year
3. Keep recent decisions in main DECISIONS.md

**Estimated savings:** Prevents future token bloat

---

## Token Budget Recommendations

### Cortex (GPT-5.2)

- **Current:** ~4,700 tokens per session start
- **Target:** ~3,500 tokens (25% reduction)
- **Budget allocation:**
  - System prompt: 2,500 tokens (optimized)
  - Snapshot: 1,000 tokens (cached)
  - Dynamic context: Variable

### Ralph (GPT-5.2-Codex)

- **Current:** ~4,800 tokens per iteration × 20 = 96,000 tokens
- **Target:** ~2,000 tokens per iteration × 20 = 40,000 tokens (58% reduction)
- **Budget allocation:**
  - First iteration: 3,700 tokens (full prompt)
  - Subsequent iterations: 200 tokens (incremental state)
  - Dynamic context: Variable

---

## Implementation Priority

**Phase 1 (Immediate - High ROI):**

1. R1: Incremental state loading for Ralph (~70k tokens saved per loop)
2. R2: Cache snapshot.sh for Cortex (~1k tokens per redundant call)
3. R3: Compact task format (~3k tokens per plan)

**Phase 2 (Next sprint - Medium ROI):**

1. R4: Deduplicate NEURONS.md (~500 tokens per Ralph iteration)
2. R5: Extract examples to reference docs (~400 tokens)

**Phase 3 (Future - Maintenance):**

1. R6: DECISIONS.md archiving (prevents bloat)

---

## Measurement & Validation

After implementing improvements, measure:

1. **Tokens per Cortex session** (target: <3,500)
2. **Tokens per Ralph iteration** (target: <2,000 avg)
3. **Total tokens per 20-iteration loop** (target: <50,000)

Compare against baseline:

- Cortex baseline: 4,700 tokens
- Ralph baseline: 96,000 tokens per loop

**Success criteria:** 40%+ reduction in total token usage

---

## Notes

- **Don't over-optimize:** Some verbosity aids LLM comprehension
- **Test incrementally:** Implement one change at a time, measure impact
- **Monitor quality:** Ensure token reduction doesn't degrade output quality
- **User feedback matters:** If Ralph gets confused with compact format, revert

---

**Next Steps:**

1. Get user approval on recommendations
2. Create tasks for Ralph to implement R1-R3
3. Measure baseline token usage
4. Implement, measure, iterate
