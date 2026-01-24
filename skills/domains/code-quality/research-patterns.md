# Skill: research-patterns

## 1) Intent (1 sentence)

Enable agents to systematically gather, evaluate, and synthesize information from multiple sources to make well-informed decisions.

## 2) Type

Procedure / Knowledge

## 3) Trigger Conditions (When to use)

Use this skill when ANY of these are true:

- Need to learn about an unfamiliar technology, API, or concept
- Evaluating multiple solutions or approaches to a problem
- Verifying claims or assumptions before implementation
- Gathering requirements or understanding domain context
- Debugging an issue where the root cause is unclear

## 4) Non-Goals (What NOT to do)

- Don't spend excessive time researching when a quick prototype would answer the question faster
- Don't trust a single source without verification
- Don't research indefinitely - set a time/iteration budget
- Don't ignore existing codebase patterns in favor of external "best practices"

## 5) Inputs Required (and how to confirm)

The agent must gather/confirm:

- **Research question** - Clear, specific question to answer (confirm: can you explain it in one sentence?)
- **Scope boundaries** - What's in/out of scope (confirm: list 2-3 things explicitly out of scope)
- **Success criteria** - How will you know research is complete? (confirm: define the deliverable)
- **Time budget** - Maximum iterations/time to spend (confirm: set explicit limit)

## 6) Files / Sources to Study (DON'T SKIP)

Study these before acting:

- Existing codebase for similar patterns (`grep`, `find`)
- Project documentation (README, AGENTS.md, THOUGHTS.md)
- Official documentation for technologies involved
- Wikipedia summaries for foundational concepts

Rules:

- Don't assume not implemented. Confirm with repo search.
- Prefer existing repo conventions/patterns over inventing new ones.

## 7) Procedure (LLM Playbook)

Follow in order:

### Step 1: Define the Question

- Write down the specific question in one sentence
- Identify what type of answer you need:
  - **Factual**: "What is X?" → Look for authoritative sources
  - **Procedural**: "How do I X?" → Look for tutorials, docs, examples
  - **Evaluative**: "Should I use X or Y?" → Look for comparisons, trade-offs
  - **Diagnostic**: "Why is X happening?" → Look for error docs, Stack Overflow, issues

### Step 2: Search Locally First

Before going external:

```bash
# Search codebase for existing patterns
grep -r "pattern" /path/to/repo
find /path/to/repo -name "*.md" | xargs grep -l "topic"

# Check project docs
cat README.md AGENTS.md THOUGHTS.md 2>/dev/null | grep -i "topic"
```

### Step 3: Gather External Sources

Use multiple source types for triangulation:

| Source Type | Best For | How to Access |
|-------------|----------|---------------|
| Official docs | Authoritative API/syntax info | `curl -s https://docs.example.com/api` |
| Wikipedia API | Foundational concepts | `curl -s "https://en.wikipedia.org/api/rest_v1/page/summary/Topic"` |
| GitHub raw | Code examples, READMEs | `curl -s https://raw.githubusercontent.com/user/repo/main/file` |
| Stack Overflow | Common problems/solutions | Search via web or API |

### Step 4: Evaluate Sources (CRAAP Test)

For each source, quickly assess:

| Criterion | Question | Red Flag |
|-----------|----------|----------|
| **C**urrency | When was it published/updated? | >3 years old for fast-moving tech |
| **R**elevance | Does it answer YOUR question? | Generic advice, different context |
| **A**uthority | Who wrote it? What credentials? | Anonymous, no citations |
| **A**ccuracy | Can claims be verified elsewhere? | Contradicts official docs |
| **P**urpose | Why was it written? | Marketing, biased vendor content |

### Step 5: Triangulate (Cross-Verify)

- **Minimum 2-3 sources** for important decisions
- Look for **consensus** - if sources agree, confidence is higher
- Note **contradictions** - investigate why sources disagree
- Weight sources by authority (official docs > blog posts > forums)

### Step 6: Synthesize and Document

- Summarize findings in your own words
- Note confidence level (high/medium/low)
- List sources consulted
- Identify remaining unknowns

### Step 7: Decide or Escalate

- If confident: Proceed with implementation
- If uncertain: Prototype to validate
- If blocked: Document what you learned and escalate with specific questions

## 8) Output / Deliverables

This skill is complete when these exist:

- Clear answer to the research question (or documented "unknown")
- Confidence level stated (high/medium/low)
- Sources listed (for traceability)
- Next action identified

## 9) Quick Reference Tables

### At a Glance

| Concept | Description | Example |
|---------|-------------|---------|
| Triangulation | Verify claims with 2-3 independent sources | Official docs + tutorial + Stack Overflow |
| CRAAP test | Evaluate source reliability (Currency, Relevance, Authority, Accuracy, Purpose) | "Is this 2019 blog post still accurate for v3.0?" |
| Time-boxing | Set explicit research time limits | "Max 3 iterations on this question" |
| Local-first | Search codebase before external sources | `grep -r "auth" .` before Googling |
| Confidence levels | Rate certainty of findings | High (3+ sources agree), Medium (2 sources), Low (1 source or contradictions) |

### Common Mistakes

| ❌ Don't | ✅ Do | Why |
|----------|-------|-----|
| Trust the first result | Cross-verify with 2-3 sources | Single sources may be outdated or wrong |
| Research indefinitely | Set a time/iteration budget | Diminishing returns after initial findings |
| Ignore existing code | Search codebase first | Repo may already have the pattern you need |
| Copy-paste without understanding | Understand the "why" before using | Blind copying leads to subtle bugs |
| Use only one source type | Mix official docs, examples, discussions | Different perspectives reveal different insights |
| Skip source evaluation | Apply CRAAP test quickly | Not all sources are equally reliable |

### Source Quality Hierarchy

| Tier | Source Type | Trust Level |
|------|-------------|-------------|
| 1 | Official documentation | High - authoritative |
| 2 | Reputable books, RFCs, specs | High - peer-reviewed |
| 3 | Well-maintained GitHub repos | Medium-High - community vetted |
| 4 | Stack Overflow (high-voted) | Medium - crowd-verified |
| 5 | Blog posts, tutorials | Medium-Low - verify claims |
| 6 | AI-generated content | Low - always verify |
| 7 | Random forum posts | Low - use as leads only |

## 10) Gotchas / Failure Modes

Common ways the agent fails here:

| Failure Mode | Mitigation |
|--------------|------------|
| Analysis paralysis - researching forever | Set explicit iteration budget (e.g., "max 5 iterations") |
| Confirmation bias - only finding sources that agree | Actively search for counterarguments |
| Recency bias - assuming newest is best | Evaluate if older, stable solutions work better |
| Authority fallacy - trusting big names blindly | Verify claims even from reputable sources |
| Copy-paste errors - using code without adaptation | Understand the code, adapt to your context |
| Outdated information - using old docs | Check version numbers and publish dates |
| Scope creep - research expanding beyond original question | Re-read original question frequently |

## 11) Minimal Example (repo-specific)

**Context:**
Need to understand how to implement rate limiting for an API endpoint.

**Steps taken:**

1. **Define question:** "What's the best pattern for rate limiting HTTP API endpoints in Python?"

2. **Search locally:**

   ```bash
   grep -r "rate" . --include="*.py"
   grep -r "throttle" . --include="*.py"
   # Found: No existing rate limiting in codebase
   ```

3. **Gather external sources:**
   - Official Flask-Limiter docs (authority: high)
   - Wikipedia "Rate limiting" summary (foundational concept)
   - GitHub example repos using Flask-Limiter

4. **Evaluate (CRAAP):**
   - Flask-Limiter docs: Current (updated 2024), Relevant (exact use case), Authority (maintainers), Accurate (matches code behavior)

5. **Triangulate:**
   - 3 sources agree on token bucket algorithm as default
   - Redis backend recommended for distributed systems

6. **Synthesize:**
   - Use Flask-Limiter with Redis backend
   - Token bucket algorithm, 100 req/min default
   - Confidence: High (official docs + 2 tutorials agree)

7. **Decision:** Proceed with implementation using Flask-Limiter

**Result:**
Clear implementation path with high confidence, documented sources for future reference.

---

## Research Commands Quick Reference

```bash
# Wikipedia summary (quick concept lookup)
curl -s "https://en.wikipedia.org/api/rest_v1/page/summary/TOPIC" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('extract',''))"

# GitHub raw file fetch
curl -s "https://raw.githubusercontent.com/USER/REPO/BRANCH/FILE"

# Search codebase for patterns
grep -r "pattern" --include="*.py" --include="*.md" .
find . -name "*.md" -exec grep -l "topic" {} \;

# Check file modification dates
git log -1 --format="%ai" -- path/to/file
```

---

## See Also

- [token-efficiency.md](token-efficiency.md) - Balance research depth with token costs
- [testing-patterns.md](testing-patterns.md) - Validate research findings through tests
- [code-consistency.md](code-consistency.md) - Ensure research findings match existing patterns
