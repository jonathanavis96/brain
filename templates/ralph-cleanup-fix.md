# Ralph Directory Structure Cleanup

## Problem

The `ralph/` subdirectory in a project should **only contain ralph-specific configuration files** (loop infrastructure and project context), NOT the actual application source code, scripts, config, or state.

### Symptoms

- `ralph/src/` contains application source code
- `ralph/bin/` contains application scripts  
- `ralph/config/` contains application configuration
- `ralph/state/` contains application state/data
- `ralph/logs/` contains application logs
- Duplicate files exist between project root and `ralph/` subdirectory

### Correct Structure

```text
project-root/           ← Working directory for application files
├── src/                ← Application source code HERE
├── bin/                ← Application scripts HERE
├── config/             ← Application config HERE
├── state/              ← Application state/data HERE
├── logs/               ← Application logs HERE
├── docs/               ← Project documentation HERE
├── README.md           ← Project readme
└── ralph/              ← Ralph files ONLY (loop + project context)
    ├── .gitignore
    ├── AGENTS.md       ← Agent guidance
    ├── THOUGHTS.md     ← Project vision
    ├── NEURONS.md      ← Codebase map
    ├── PROMPT.md       ← Loop prompt
    ├── workers/IMPLEMENTATION_PLAN.md  ← Task tracking
    ├── VALIDATION_CRITERIA.md  ← Quality gates
    ├── RALPH.md        ← Loop contract
    ├── workers/ralph/THUNK.md        ← Thunk mode config
    ├── loop.sh         ← Loop runner
    ├── verifier.sh     ← Verification script
    ├── current_ralph_tasks.sh  ← Task runner
    ├── thunk_ralph_tasks.sh    ← Thunk task runner
    └── pr-batch.sh     ← PR batch script
```text

---

## Fix Plan

### 1. [x] Remove test files and temp files

**Why**: Clean up development artifacts
**Actions**:

```bash
rm -f <project>/ralph/src/test_*.py
rm -f <project>/ralph/src/tmp_*.py
rm -rf <project>/ralph/src/__pycache__
```text

### 2. [x] Remove old/legacy documentation

**Why**: Remove outdated reference material that causes confusion
**Actions**:

```bash
rm -f <project>/docs/OLD_*.md
rm -f <project>/docs/LEGACY_*.md
```text

### 3. [x] Move source code from ralph/ to project root

**Why**: Application code belongs at project root, not in ralph/
**Actions**:

```bash
mkdir -p <project>/src
cp <project>/ralph/src/*.py <project>/src/
```text

### 4. [x] Move scripts from ralph/bin/ to project bin/

**Why**: Application scripts belong at project root
**Actions**:

```bash
mkdir -p <project>/bin
cp <project>/ralph/bin/*.sh <project>/bin/
# Also copy any binary tools (chromedriver, etc.)
cp <project>/ralph/bin/chromedriver* <project>/bin/
```text

### 5. [x] Merge and move config from ralph/config/ to project config/

**Why**: Application config belongs at project root
**Actions**:

```bash
mkdir -p <project>/config
cp <project>/ralph/config/* <project>/config/
# Ensure newer files overwrite older duplicates
```text

### 6. [x] Move state from ralph/state/ to project state/

**Why**: Application state/data belongs at project root
**Actions**:

```bash
mkdir -p <project>/state
cp -r <project>/ralph/state/* <project>/state/
```text

### 7. [x] Create logs directory and move logs

**Why**: Application logs belong at project root
**Actions**:

```bash
mkdir -p <project>/logs
cp <project>/ralph/logs/*.txt <project>/logs/
# Don't copy screenshots (too many, can regenerate)
```text

### 8. [x] Move docs from ralph/docs/ to project docs/

**Why**: Project documentation belongs at project root
**Actions**:

```bash
cp <project>/ralph/docs/*.md <project>/docs/
```text

### 9. [x] Clean up ralph/ directory

**Why**: Remove moved content, keep only ralph-specific files
**Actions**:

```bash
rm -rf <project>/ralph/src
rm -rf <project>/ralph/bin
rm -rf <project>/ralph/config
rm -rf <project>/ralph/state
rm -rf <project>/ralph/logs
rm -rf <project>/ralph/docs
```text

### 10. [x] Fix path references in source files

**Why**: Ensure relative paths still work after reorganization
**Actions**:

- Check Python files for `Path(__file__).parent` references
- Update comments mentioning old paths (e.g., "ralph/state/creds" → "state/creds")
- Test scripts to ensure they resolve paths correctly

---

## Verification

After cleanup, verify:

1. **ralph/ only contains ralph files**:

```bash
ls <project>/ralph/
# Should show: .gitignore, AGENTS.md, THOUGHTS.md, NEURONS.md, PROMPT.md,
#              workers/IMPLEMENTATION_PLAN.md, VALIDATION_CRITERIA.md, RALPH.md, workers/ralph/THUNK.md,
#              loop.sh, verifier.sh, current_ralph_tasks.sh, thunk_ralph_tasks.sh, pr-batch.sh
```text

1. **Application code is at project root**:

```bash
ls <project>/src/      # Source code
ls <project>/bin/      # Scripts
ls <project>/config/   # Configuration
ls <project>/state/    # State/data
```text

1. **Scripts work with new paths**:

```bash
cd <project>/bin && ./create-account.sh --dry-run
# Should show correct paths without "ralph/" in them
```text

---

## Notes

- The `ralph/` directory is for **loop infrastructure only** - it tells ralph how to run iterations on this project
- All actual project functionality (source code, scripts, config, data) goes in the **project root**
- This separation allows ralph to be added/removed from a project without affecting the application structure
