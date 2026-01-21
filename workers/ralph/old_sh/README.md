# Archived Scripts

This directory contains scripts that are no longer actively used but retained for historical reference.

## Contents

### brain-doctor.sh
**Status:** Superseded by verifier.sh  
**Purpose:** Comprehensive health checks on brain repository structure  
**Last Updated:** 2026-01-16  
**Why Archived:**
- Replaced by `verifier.sh` (rules/AC.rules-based validation)
- `verifier.sh` provides more targeted, gate-based checks
- brain-doctor.sh still references deprecated `kb/` paths (line 223)
- Checks for features no longer in active use

**Historical Value:** Reference for comprehensive diagnostic patterns

### test-bootstrap.sh
**Status:** Deprecated - testing now manual  
**Purpose:** Automated tests for new-project.sh and generator scripts  
**Last Updated:** 2026-01-18  
**Why Archived:**
- Bootstrap generators now stable and well-tested
- Manual validation sufficient (AGENTS.md task 6.1 completed)
- Contains kb→skills migration artifacts (THUNK #78)
- Creates test artifacts in /tmp that may persist

**Historical Value:** Test patterns for bootstrap infrastructure

### test-rovodev-integration.sh
**Status:** Obsolete - feature not implemented  
**Purpose:** Test OpenCode integration with RovoDev (planned feature)  
**Last Updated:** 2026-01-17  
**Why Archived:**
- Tests integration features that were never implemented
- References non-existent files (`.opencode/schemas/rovodev-response.json`)
- CodeRabbit review flagged multiple issues (S-1 through S-4)
- No current plans to implement this integration

**Historical Value:** None - safe to delete if cleanup needed

## Maintenance Policy

**Retention:** Keep archived scripts unless they consume significant space or create confusion.

**Cleanup Criteria:**
- No references in active documentation
- No historical learning value
- More than 6 months since last reference in git history

**Review Date:** 2026-07-19 (6 months from archive documentation)

## See Also
- `verifier.sh` - Current validation system
- `rules/AC.rules` - Acceptance criteria source of truth
- `VALIDATION_CRITERIA.md` - Manual validation procedures
