# Implementation Plan - Brain Repository Maintenance

## Overview

Ongoing maintenance and improvement tasks for the brain repository. This plan tracks:
- Repository health checks and maintenance
- Skills knowledge base improvements
- Template refinements
- Documentation updates
- Quality of life improvements for Ralph loop

**STATUS:** Active - continuous improvement

---

## HIGH PRIORITY

### Repository Health & Quality

- [x] **1.1** Archive completed THOUGHTS.md (monitor bug fixes) to HISTORY.md
  - Move current monitor bug fix content to HISTORY.md with timestamp
  - Clear THOUGHTS.md for next project iteration
  - Keep structure template intact

- [x] **1.2** Review and consolidate legacy THUNK entries
  - 167 completed tasks in previous era
  - Started new era: "Brain Repository Maintenance"
  - Previous era summarized in THUNK.md

- [x] **1.3** Audit TODOs in new-project.sh
  - Lines 431, 446, 461 have TODO comments for HIGH INTELLIGENCE generators
  - Evaluate: implement generators or remove TODOs
  - Decision: Generators already implemented - removed outdated TODOs

### Skills Knowledge Base

- [x] **2.1** Review GAP_BACKLOG.md entries for promotion
  - 2 entries: "Bash Terminal Control with tput" and "Bash Associative Arrays for Caching"
  - Both marked P2 priority
  - Decision: Keep both as reference (do not meet "recurring" criteria per GAP_CAPTURE_RULES.md)
  - Updated GAP_BACKLOG.md with review notes and status

- [x] **2.2** Verify skills/index.md completeness
  - Cross-reference with actual files in skills/domains/ and skills/projects/
  - Ensure all skill files are indexed
  - Update last modified date
  - Verified: 12 domain files + 2 project files all correctly indexed (no changes needed)

- [x] **2.3** Create skill: Ralph Loop Architecture Deep Dive
  - Expand skills/domains/ralph-patterns.md with more detail
  - Add troubleshooting patterns from recent monitor fixes
  - Include: parser state machines, display strategies, file watching patterns

### Template Improvements

- [x] **3.1** Sync current_ralph_tasks.sh updates to template
  - templates/ralph/current_ralph_tasks.sh is outdated (20KB vs 21.9KB in root)
  - Copy latest version from root
  - Ensure all monitor bug fixes are in template

- [ ] **3.2** Sync thunk_ralph_tasks.sh updates to template
  - templates/ralph/thunk_ralph_tasks.sh is outdated (16KB vs 22.5KB in root)
  - Copy latest version from root
  - Ensure all monitor bug fixes are in template

- [ ] **3.3** Sync loop.sh updates to template
  - templates/ralph/loop.sh is severely outdated (888 bytes vs 21KB in root)
  - Copy latest version from root
  - Verify all recent improvements included

---

## MEDIUM PRIORITY

### Documentation Updates

- [ ] **4.1** Update NEURONS.md with current repository state
  - Verify file counts match reality
  - Update structure diagrams if needed
  - Refresh "I need to..." quick reference

- [ ] **4.2** Create CHANGELOG.md for brain repository
  - Track major changes to templates, skills, and Ralph loop
  - Format: Keep format (date, category, description)
  - Start with 2026-01-18 monitor fixes era

- [ ] **4.3** Document monitor architecture in skills/
  - Create skills/domains/monitoring-patterns.md
  - Include: file watching, display strategies, state management
  - Reference: current_ralph_tasks.sh and thunk_ralph_tasks.sh implementations

### Testing Infrastructure

- [ ] **5.1** Expand test-bootstrap.sh coverage
  - Add tests for monitor scripts in bootstrapped projects
  - Verify templates/ synchronization
  - Test skills/ directory structure validation

- [ ] **5.2** Create test suite for monitor scripts
  - Unit tests for extract_tasks() parser function
  - Integration tests for file watching
  - Display rendering tests (mock tput commands)

---

## LOW PRIORITY

### Quality of Life Improvements

- [ ] **6.1** Add --version flag to loop.sh
  - Display brain repository version
  - Show last commit hash and date
  - Useful for debugging and support

- [ ] **6.2** Implement --stats flag for loop.sh
  - Show iteration count statistics
  - Display THUNK entry count
  - Report current era information

- [ ] **6.3** Create brain-status.sh health check script
  - Verify all required files present
  - Check git status (clean, ahead/behind)
  - Validate skills/ directory structure
  - Report monitor script versions

### Future Enhancements

- [ ] **7.1** Implement HIGH INTELLIGENCE generators (new-project.sh TODOs)
  - Generator for THOUGHTS.md based on project description
  - Generator for NEURONS.md from codebase structure
  - Generator for IMPLEMENTATION_PLAN.md from THOUGHTS.md

- [ ] **7.2** Create interactive skill browser
  - TUI for browsing skills/ directory
  - Search by keyword or category
  - Display skill content without leaving terminal

- [ ] **7.3** Implement skill usage analytics
  - Track which skills are referenced most
  - Identify gaps in coverage
  - Guide skill promotion decisions

---

## Completed (Archive)

All tasks from previous planning iteration (Monitor Bug Fixes) have been completed and logged to THUNK.md (entries #160-166). See HISTORY.md for full project summary.
