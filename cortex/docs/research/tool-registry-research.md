# Research: Tool Registry in Brain

**Research Question:** How does Brain manage tool definitions, permissions, and caching policies—and what would a formal registry enable?

**Scope:** Tool definitions, cacheability rules, permission gating, discovery
**Out of Scope:** MCP protocol details, external tool marketplaces
**Success Criteria:** Map current tool patterns → propose registry schema → identify implementation path
**Confidence:** High (based on codebase analysis)

---

## 1. Current State

### 1.1 Tool Categories in Brain

Brain interacts with multiple tool types:

| Category | Examples | Instrumented? | Cacheable? |
|----------|----------|---------------|------------|
| **Shell wrappers** | `run_tool()` in loop.sh | ✅ Yes | ✅ Configurable |
| **RovoDev native** | `bash`, `grep`, `open_files`, `find_and_replace_code` | ❌ No | N/A |
| **Verifier checks** | AC checks in `verifier.sh` | ✅ Partial | ❌ No |
| **MCP tools** | Atlassian, etc. | ❌ No | N/A |

### 1.2 Shell Tool Wrapper (`run_tool()`)

**Location:** `workers/ralph/loop.sh` (lines 865-940)

**Capabilities:**

- Emits `:::TOOL_START:::` and `:::TOOL_END:::` markers
- Tracks `duration_ms`, `exit_code`, `cache_key`
- Supports cache lookup via `lookup_cache_pass()`
- Handles failure with trap-based cleanup

**Signature:**

```bash
run_tool <tool_name> <cache_key> <command...>
```

### 1.3 Cacheability Rules

**Location:** `workers/ralph/loop.sh` - `is_non_cacheable()` function

**Current Non-Cacheable Tools:**

```bash
is_non_cacheable() {
  local tool_name="$1"
  case "$tool_name" in
    git_status|git_diff|git_log|ls|cat|head|tail|date|pwd|env)
      return 0  # Non-cacheable
      ;;
    *)
      return 1  # Cacheable
      ;;
  esac
}
```

**Logic:** Read-only/volatile commands are non-cacheable; modifying commands can be cached on success.

### 1.4 Cache Guard System

**Location:** `workers/ralph/loop.sh` - cache guard logic

**Modes:**

| Mode | Behavior |
|------|----------|
| `off` | No caching |
| `verify` | Verify-only (read cache, don't write) |
| `read` | Read from cache, skip verified tools |
| `use` | Full caching (read + write) |

**Environment:** `CACHE_MODE`, `CACHE_SCOPE` exported to agent.

### 1.5 Verifier as Tool-Like Checks

**Location:** `workers/ralph/verifier.sh`

**Structure:** Each AC rule is a function that returns 0 (pass) or non-zero (fail).

```bash
check_ac_syntax() {
  # Returns 0 if syntax valid, 1 otherwise
}
```

**Not registered:** Verifier checks are hardcoded, not in a registry.

---

## 2. Gap Analysis

### 2.1 What Works Well

| Capability | Maturity | Notes |
|------------|----------|-------|
| Shell tool wrapping | ✅ Mature | run_tool() is robust |
| Cache key generation | ✅ Mature | Deterministic keys |
| Duration tracking | ✅ Mature | Accurate timing |
| Non-cacheable detection | ⚠️ Hardcoded | Works but not extensible |

### 2.2 Gaps

| Gap | Severity | Description |
|-----|----------|-------------|
| **G1: No tool registry** | HIGH | Tools defined implicitly, not declared |
| **G2: RovoDev tools unmanaged** | HIGH | Native tools bypass all governance |
| **G3: Hardcoded cacheability** | MEDIUM | `case` statement, not config |
| **G4: No permission model** | MEDIUM | All tools have same access |
| **G5: No tool discovery** | LOW | Can't list available tools |
| **G6: No tool versioning** | LOW | No way to track tool changes |

---

## 3. Proposed Registry Schema

### 3.1 YAML-Based Tool Registry

**Location:** `config/tool-registry.yaml` (proposed)

```yaml
# Tool Registry Schema v1
version: 1

tools:
  # Shell-wrapped tools (run via run_tool())
  shellcheck:
    type: shell
    command: "shellcheck -e SC1091 {file}"
    cacheable: true
    cache_key_inputs: [file, git_sha]
    timeout_ms: 30000
    tags: [lint, shell]

  markdownlint:
    type: shell
    command: "markdownlint {file}"
    cacheable: true
    cache_key_inputs: [file, git_sha]
    timeout_ms: 30000
    tags: [lint, markdown]

  git_status:
    type: shell
    command: "git status --porcelain"
    cacheable: false
    reason: "Volatile - changes with working tree"
    tags: [git, read-only]

  # RovoDev native tools (documented but not managed)
  bash:
    type: rovodev_native
    managed: false
    note: "Executes in agent runtime, not instrumented"

  grep:
    type: rovodev_native
    managed: false
    note: "Executes in agent runtime, not instrumented"

  # Verifier checks
  ac_syntax:
    type: verifier
    function: check_ac_syntax
    severity: error
    tags: [governance]

# Tool groups for batch operations
groups:
  lint_all:
    tools: [shellcheck, markdownlint, ruff]
    parallel: true

  pre_commit:
    tools: [lint_all, ac_syntax]
    sequential: true

# Permission policies (future)
policies:
  protected_files:
    deny_tools: [find_and_replace_code]
    paths: ["workers/ralph/loop.sh", "verifier.sh", "rules/AC.rules"]
    override: waiver_required
```

### 3.2 SQLite Registry (Runtime)

```sql
CREATE TABLE tools (
    name TEXT PRIMARY KEY,
    type TEXT NOT NULL,              -- shell, rovodev_native, verifier, mcp
    command TEXT,
    cacheable INTEGER DEFAULT 1,
    cache_key_pattern TEXT,
    timeout_ms INTEGER DEFAULT 30000,
    managed INTEGER DEFAULT 1,       -- 0 for rovodev_native
    tags TEXT,                       -- JSON array
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE tool_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name TEXT REFERENCES tools(name),
    invocation_ts TEXT NOT NULL,
    cache_key TEXT,
    cache_hit INTEGER,
    duration_ms INTEGER,
    exit_code INTEGER,
    iter INTEGER,
    run_id TEXT
);

CREATE TABLE tool_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_name TEXT NOT NULL,
    tool_name TEXT REFERENCES tools(name),
    action TEXT NOT NULL,            -- allow, deny, require_waiver
    path_pattern TEXT,
    condition TEXT                   -- JSON condition
);
```

---

## 4. Future State Vision

### 4.1 Short-Term (Documentation + Patterns)

**Goal:** Document current tools, create extensible config.

1. **Tool Catalog Doc** - List all known tools with cacheability
2. **Cacheability Config** - Move from `case` to YAML/env config
3. **Tool Wrapper Patterns** - `skills/domains/ralph/tool-wrapper-patterns.md`

### 4.2 Medium-Term (Registry Implementation)

**Goal:** Centralized tool management.

1. **YAML Registry** - Declarative tool definitions
2. **Registry Loader** - Parse YAML, validate, expose to loop.sh
3. **Tool Discovery CLI** - `bin/brain-tools list`, `bin/brain-tools info <name>`
4. **Dynamic Cacheability** - Read from registry, not hardcoded

### 4.3 Long-Term (Governance + Gating)

**Goal:** Policy-based tool access control.

1. **Permission Model** - Tools gated by path, phase, or condition
2. **Waiver Integration** - Protected file changes require approval
3. **Tool Versioning** - Track tool definition changes
4. **MCP Tool Registration** - External tools registered same as internal

---

## 5. Implementation Patterns

### 5.1 Migrate Cacheability to Config

**Current (hardcoded):**

```bash
is_non_cacheable() {
  case "$tool_name" in
    git_status|git_diff|...) return 0 ;;
    *) return 1 ;;
  esac
}
```

**Proposed (config-driven):**

```bash
# Load from config/non_cacheable_tools.txt
NON_CACHEABLE_TOOLS=$(cat "$ROOT/config/non_cacheable_tools.txt" 2>/dev/null | tr '\n' '|')

is_non_cacheable() {
  local tool_name="$1"
  [[ "$tool_name" =~ ^($NON_CACHEABLE_TOOLS)$ ]]
}
```

### 5.2 Tool Discovery Function

```bash
list_tools() {
  echo "=== Shell-Wrapped Tools ==="
  grep -E "^  [a-z_]+:" config/tool-registry.yaml | sed 's/://g'
  
  echo ""
  echo "=== RovoDev Native (unmanaged) ==="
  echo "bash, grep, open_files, find_and_replace_code, expand_code_chunks"
}
```

### 5.3 Permission Check Pattern

```bash
check_tool_permission() {
  local tool_name="$1"
  local target_path="$2"
  
  # Check if path is protected
  if is_protected_path "$target_path"; then
    if [[ "$tool_name" == "find_and_replace_code" ]]; then
      echo "ERROR: $tool_name denied on protected path: $target_path"
      return 1
    fi
  fi
  return 0
}
```

---

## 6. Recommendations

### 6.1 Immediate Actions (No Code)

| Action | Owner | Deliverable |
|--------|-------|-------------|
| Document tool categories | Ralph | Section in AGENTS.md or new doc |
| List non-cacheable tools | Ralph | `config/non_cacheable_tools.txt` |
| Create tool patterns skill | Ralph | `skills/domains/ralph/tool-wrapper-patterns.md` |

### 6.2 Phase A Implementation (Loom Delta)

From `cortex/docs/loom_brain_feature_deltas.md`:

1. **Tool Registry Spec** → YAML schema above
2. **Gating Model** → Permission policies
3. **Reference Implementation** → Config-driven cacheability

### 6.3 Decision Points

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Registry format | YAML vs JSON vs TOML | **YAML** - human-readable, supports comments |
| Storage | File vs SQLite | **File for config, SQLite for runtime** |
| RovoDev tools | Manage vs Document | **Document** - can't control runtime |
| Permission model | RBAC vs ABAC vs Simple | **Simple** (path-based) first, ABAC later |

---

## 7. Sources

| Source | Relevance | Trust |
|--------|-----------|-------|
| `workers/ralph/loop.sh` - `run_tool()` | Primary - tool wrapper | High |
| `workers/ralph/loop.sh` - `is_non_cacheable()` | Primary - cacheability | High |
| `workers/ralph/verifier.sh` | Supporting - check patterns | High |
| `artifacts/optimization_hints.md` | Supporting - RovoDev limitation | High |
| Loom feature deltas | Context - inspiration | Medium |

---

## 8. Next Steps

1. **Extract non-cacheable list** to config file
2. **Create tool-wrapper-patterns.md** skill
3. **Prototype YAML registry** with 5-10 common tools
4. **Design permission model** for protected files

---

*Research completed: 2026-01-25*
*Confidence: High*
