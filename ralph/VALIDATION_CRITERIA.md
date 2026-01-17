# Validation Criteria - Ralph Standard Alignment

Last verified: 2026-01-16 17:45:00

## Purpose

Quality gates and acceptance criteria for the Ralph standard alignment project.
Check these after completing implementation tasks to ensure the system meets requirements.

## Structure Validation

- [ ] Single PROMPT.md exists with conditional logic
- [ ] PROMPT_plan.md archived in old_md/2026-01-16_165336/
- [ ] PROMPT_build.md archived in old_md/2026-01-16_165336/
- [ ] AGENTS.md is ~60 lines
- [ ] AGENTS.md references PROMPT.md (not plan/build)
- [ ] AGENTS.md documents NEURONS.md read via subagent
- [ ] loop.sh uses PROMPT.md for both PLAN_PROMPT and BUILD_PROMPT

## Token Validation

- [ ] PROMPT.md ≤ 2,000 tokens (~8,000 bytes)
- [ ] AGENTS.md ≤ 500 tokens (~2,000 bytes)
- [ ] Total first-load ≤ 2,500 tokens (~10,000 bytes)
- [ ] Actual values documented in IMPLEMENTATION_PLAN.md

## Content Validation

- [ ] PROMPT.md has clear mode detection section
- [ ] PROMPT.md preserves all critical instructions from both originals
- [ ] PROMPT.md maintains "⚠️ ONE TASK ONLY" emphasis from BUILD mode
- [ ] PROMPT.md documents context discovery order
- [ ] AGENTS.md preserves Purpose, Prerequisites, How to Run, Stop Sentinel, Philosophy, Validation, Troubleshooting
- [ ] NEURONS.md header updated with "read via subagent" note

## Functional Validation

- [ ] bash -n loop.sh passes
- [ ] Planning mode test: Ralph does gap analysis, updates plan, NO implementation
- [ ] Building mode test: Ralph implements ONE task, commits, stops
- [ ] NEURONS.md accessed via subagent (check logs)
- [ ] No `:::COMPLETE:::` in planning mode
- [ ] Completion sentinel only when ZERO tasks remain in IMPLEMENTATION_PLAN.md

## Documentation Validation

- [ ] THOUGHTS.md reflects current project goals and success criteria
- [ ] NEURONS.md header updated
- [ ] No dangling references to PROMPT_plan.md or PROMPT_build.md (except in archives and IMPLEMENTATION_PLAN.md)
- [ ] Archive has README.md explaining consolidation

## How to Use This File

**For Ralph (Planning Mode):**
- Review these criteria when analyzing requirements
- Use as reference for quality standards
- Update if new validation criteria are discovered

**For Ralph (Building Mode - Step 4: Validate):**
- Reference relevant validation criteria for current task
- Run validation commands to verify implementation
- Check that your changes don't violate any criteria

**For Manual Verification:**
- Run through checklist after major milestones
- Mark items [x] as they're verified
- Document verification results in IMPLEMENTATION_PLAN.md notes

## Validation Commands

```bash
# File structure
ls -la kb/ templates/ references/ specs/

# Check KB integrity
grep -r "## Why This Exists" kb/domains/ kb/projects/

# React rules unchanged (should be 45)
find references/react-best-practices/rules/ -name "*.md" | wc -l

# Script syntax
bash -n loop.sh

# Check deterministic context files
ls -lh AGENTS.md NEURONS.md PROMPT.md IMPLEMENTATION_PLAN.md VALIDATION_CRITERIA.md

# Token counts
wc -c PROMPT.md AGENTS.md | awk '{printf "%s: %d bytes (~%d tokens)\n", $2, $1, $1/4}'
```
