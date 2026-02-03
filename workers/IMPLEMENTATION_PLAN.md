# Implementation Plan - Brain Repository

**Last Updated:** 2026-02-02 17:26:15

**Current Status:** Fresh cycle - maintenance and continuous improvement tasks

**Execution Order (Ralph):**

1. Phase 0-Quick: Immediate quality improvements
2. Phase 1: Self-improvement system maintenance
3. Phase 2: Skills documentation enhancement
4. Phase 3: Tooling and automation improvements

<!-- Cortex adds new Task Contracts below this line -->

---

## Phase 0-Quick: Immediate Quality Improvements

- [x] **0.1** Run verifier and address any warnings/failures
  - **Steps:**
    1. Verifier status already injected in header - check for WARN/FAIL items
    2. If warnings exist, create Phase 0-Warn section and batch by fix type
    3. If all passing, proceed to next phase
  - **AC:** Verifier shows all [PASS] or warnings are tracked
  - **Priority:** High
  - **Estimated Time:** [S] 2-5 minutes

- [x] **0.2** Review and update skills/SUMMARY.md index
  - **Steps:**
    1. Count total skills: `find skills/domains -name "*.md" -type f | wc -l`
    2. Check for new skills not listed in SUMMARY.md
    3. Verify all domain categories are represented
    4. Update skill counts if changed
  - **AC:** SUMMARY.md accurately reflects current skill count and organization
  - **Priority:** Medium
  - **Estimated Time:** [S] 3-5 minutes

## Phase 1: Self-Improvement System Maintenance

- [x] **1.1** Review GAP_BACKLOG.md for stale entries
  - **Steps:**
    1. Read `skills/self-improvement/GAP_BACKLOG.md`
    2. Identify entries older than 30 days with status "Identified"
    3. For each: assess if still relevant, should be promoted, or archived
    4. Update statuses or add review notes
  - **AC:** All GAP_BACKLOG entries have recent review notes or updated status
  - **Priority:** Medium
  - **Estimated Time:** [M] 8-12 minutes

- [x] **1.2** Check SKILL_BACKLOG.md promotion queue
  - **Steps:**
    1. Read `skills/self-improvement/SKILL_BACKLOG.md`
    2. Identify any "Pending" items
    3. For first pending item: create skill file following SKILL_TEMPLATE.md
    4. Update SKILL_BACKLOG status to "Done" and add link
    5. Update skills/SUMMARY.md to include new skill
  - **AC:** One pending skill promoted to full skill file, or backlog confirmed empty
  - **Priority:** Medium
  - **Estimated Time:** [L] 15-20 minutes

## Phase 2: Skills Documentation Enhancement

- [x] **2.1** Audit skills/domains/ralph/ for completeness
  - **Steps:**
    1. List all skills: `ls skills/domains/ralph/*.md`
    2. Check each for: examples, anti-patterns, validation commands
    3. Identify 1-2 skills that need enhancement
    4. Add missing sections (use ralph-patterns.md as model)
  - **AC:** All ralph domain skills have examples and validation commands
  - **Priority:** Low
  - **Estimated Time:** [M] 10-15 minutes

- [x] **2.2** Verify skill cross-references are valid
  - **Steps:**
    1. Extract all `[link](path/to/file.md)` from skills/*.md
    2. Verify each target file exists
    3. Check for broken relative paths
    4. Fix any broken links found
  - **AC:** All internal skill links resolve to existing files
  - **Priority:** Medium
  - **Estimated Time:** [S] 5-8 minutes

- [x] **2.3** Add real-world examples to top 3 most-used skills
  - **Steps:**
    1. Check workers/ralph/THUNK.md for frequently referenced skills
    2. Identify top 3 by mention count: `rg "skills/domains" workers/ralph/THUNK.md | sort | uniq -c | sort -rn | head -3`
    3. For each: add a "Real-World Example" section with actual brain repo use case
    4. Reference specific commits or THUNK entries where pattern was applied
  - **AC:** Top 3 skills have concrete examples from brain repo history
  - **Priority:** Low
  - **Estimated Time:** [L] 15-20 minutes

## Phase 3: Tooling and Automation Improvements

- [x] **3.1** Review bin/ tools for documentation gaps
  - **Steps:**
    1. List all bin/ scripts: `ls -1 bin/`
    2. For each: check if usage/help text is clear
    3. Verify each has entry in docs/TOOLS.md
    4. Add missing documentation
  - **AC:** All bin/ tools documented in docs/TOOLS.md with usage examples
  - **Priority:** Medium
  - **Estimated Time:** [M] 10-12 minutes

- [x] **3.2** Enhance brain-search tool with fuzzy matching
  - **Steps:**
    1. Read current implementation: `cat bin/brain-search`
    2. Add fzf-based fuzzy search option (if fzf available)
    3. Preserve exact match as default behavior
    4. Add --fuzzy flag for approximate matching
    5. Update inline help text
  - **AC:** brain-search supports --fuzzy flag for approximate matching
  - **Priority:** Low
  - **Estimated Time:** [M] 12-15 minutes

- [x] **3.3** Create skill-suggest tool for task planning
  - **Steps:**
    1. Design: Input task description, output relevant skills from skills/
    2. Implementation: Use rg to search skill content for keywords
    3. Score results by keyword density + domain relevance
    4. Output top 3-5 matching skills with paths
    5. Add to bin/ as executable script
  - **AC:** `bin/skill-suggest "fix shell script"` returns relevant skill paths
  - **Priority:** Low
  - **Estimated Time:** [L] 20-25 minutes

## Phase 4: Template Maintenance

- [x] **4.1** Audit templates/ for consistency with brain repo
  - **Steps:**
    1. List all templates: `find templates/ -name "*.md" -o -name "*.sh" | head -20`
    2. Compare template structure to actual workers/ralph/ implementation
    3. Identify any drift or missing features
    4. Document findings in workers/ralph/THUNK.md
  - **AC:** Template vs implementation comparison complete, gaps documented
  - **Priority:** Low
  - **Estimated Time:** [M] 10-15 minutes

- [x] **4.2** Update templates/ralph/PROMPT.md with latest patterns
  - **Steps:**
    1. Compare templates/ralph/PROMPT.md to workers/ralph/PROMPT.md
    2. Identify improvements made to workers/ralph/PROMPT.md since last sync
    3. Port applicable improvements to template (maintain template generality)
    4. Test template validity with validation script if available
  - **AC:** Template PROMPT.md includes latest proven patterns from workers/ralph/
  - **Priority:** Medium
  - **Estimated Time:** [M] 12-18 minutes

## Phase 5: Skill-Suggest Recommendations (Agreed Reference Set)

> Source: `bin/skill-suggest` runs validated on 2026-02-03. These are the skill files we agreed are relevant; keep them here as a quick “what to read first” index when planning/triaging similar work.

- [ ] **5.1** Cache + shell-script bug work: review key shell patterns
  - **Skills:**
    - `skills/domains/languages/shell/variable-patterns.md`
    - `skills/domains/languages/shell/validation-patterns.md`
  - **AC:** Reviewer/implementer confirms these patterns were consulted before proposing a fix.
  - **If Blocked:** If the task is time-critical, at least scan the “Common pitfalls” sections and proceed.

- [ ] **5.2** Docs + lint + broken-link work: review markdown + documentation anti-patterns
  - **Skills:**
    - `skills/domains/anti-patterns/markdown-anti-patterns.md`
    - `skills/domains/anti-patterns/documentation-anti-patterns.md`
  - **AC:** Proposed doc edits explicitly avoid the listed anti-patterns (esp. unlabeled fences, broken relative paths).
  - **If Blocked:** Skim headings only; come back for deeper reading after the first pass fix.

- [ ] **5.3** React graph viz performance work: review frontend performance patterns
  - **Skills:**
    - `skills/domains/frontend/react-patterns.md`
    - `skills/domains/frontend/accessibility-patterns.md`
    - `skills/domains/frontend/README.md`
  - **AC:** Proposed changes include at least one concrete performance tactic (memoization, reducing rebuild triggers, profiling).
  - **If Blocked:** Focus on React patterns first; treat a11y as follow-up unless UI behavior changes.

- [ ] **5.4** Cross-cutting workflow guardrails (template sync + debugging)
  - **Skills/Playbooks:**
    - `skills/playbooks/safe-template-sync.md`
    - `skills/playbooks/investigate-test-failures.md`
    - `skills/domains/code-quality/test-coverage-patterns.md`
    - `skills/domains/ralph/ralph-patterns.md`
  - **AC:** Any changes that touch templates or tests follow the playbook steps (or explicitly justify deviations).
  - **If Blocked:** Use the safe-template-sync playbook as the minimum bar.

---

**Legend:**

- `[ ]` = TODO
- `[~]` = IN_PROGRESS
- `[?]` = PROPOSED_DONE (pending verifier)
- `[x]` = VERIFIED_DONE

**Time Estimates:**

- [S] Small: 2-5 minutes
- [M] Medium: 8-15 minutes
- [L] Large: 15-25 minutes
