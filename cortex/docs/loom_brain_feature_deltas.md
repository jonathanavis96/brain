# Loom-to-Brain Feature Deltas (Implementation Guidance)

**Purpose:** Capture Loom-inspired capabilities that are applicable to Brain in its current state, with rationale, use cases, and implementation steps. Cortex should use this to craft an execution plan for Ralph.

**Scope:** These recommendations assume Brain remains a knowledge base + agent workflow system, but can gradually incorporate operational capabilities (proxying, persistence, observability) via docs, patterns, and scaffolds before building full infrastructure.

---

## 1) Server-Side LLM Proxy (API keys stay on server)

### Why this applies to Brain

Brain is designed to help agents operate safely and consistently across projects. Centralizing inference routing reduces secret sprawl and enables stronger governance, which aligns with Brain’s quality-gated approach.

### Use cases

- Multi-project agent fleet using a shared inference gateway.
- Enforcing provider policies and rate limits for all agents.
- Streaming responses for REPL/CLI agents without exposing API keys.

### Steps (Brain-level)

1. Document an **Inference Proxy spec** (provider support, auth model, streaming format).
2. Define a **secrets policy** (where keys live, how they are rotated).
3. Add a **tooling integration guide** for agents to route requests through the proxy.
4. Provide a minimal **reference configuration** (env vars + example request/response schema).

### Deliverables (suggested locations)

- `docs/INFERENCE_PROXY.md` (design + policy)
- `skills/domains/infrastructure/security-patterns.md` (secrets handling)
- `skills/domains/ralph/` (agent integration patterns)

---

## 2) Thread Persistence + Full-Text Search (FTS)

### Why this applies to Brain

Brain emphasizes knowledge reuse and task traceability. Persisted threads make agent decisions auditable, searchable, and reusable—critical for self-improvement loops.

### Use cases

- Searching past agent decisions across projects.
- Rehydrating context for long-running tasks.
- Auditing and debugging agent outputs.

### Steps (Brain-level)

1. Define a **Thread Store schema** (thread metadata, messages, artifacts).
2. Specify **indexing** requirements (FTS5 or equivalent).
3. Provide a **retention policy** (what to keep, for how long).
4. Document **query patterns** for common retrieval use cases.

### Deliverables (suggested locations)

- `docs/THREAD_STORE.md` (schema + indexing)
- `skills/domains/code-quality/` or `skills/domains/infrastructure/` (retrieval patterns)

---

## 3) Remote Execution Environments (Weaver / K8s pods)

### Why this applies to Brain

Brain’s agents often need isolation and reproducibility. Remote execution enables secure tool runs, scalable worker pools, and clean sandboxing.

### Use cases

- Isolating risky tools (file modification, package installs).
- Running build/test pipelines securely.
- Scaling large tasks across multiple environments.

### Steps (Brain-level)

1. Document **execution model** (job lifecycle, pod specs, cleanup).
2. Define **tool access boundaries** (what can run remotely vs locally).
3. Provide **security considerations** (network policy, filesystem isolation).

### Deliverables (suggested locations)

- `docs/REMOTE_EXECUTION.md`
- `skills/domains/infrastructure/security-patterns.md` (sandbox guidance)

---

## 4) Observability Suite (analytics, crash, cron, session health)

### Why this applies to Brain

Brain has quality gates; observability makes failures measurable and discoverable. This directly supports the self-improvement loop by capturing failures and trends.

### Use cases

- Detecting repeated tool failures and surfacing gaps.
- Monitoring long-running agent loops.
- Building confidence in automation by measuring success rates.

### Steps (Brain-level)

1. Define an **event schema** (run_id, task_id, tool name, outcome).
2. Document **logging + tracing** expectations for agents.
3. Establish **health checks** for agent runs and cron schedules.
4. Add a **failure dashboard spec** (even if no UI yet).

### Deliverables (suggested locations)

- `docs/OBSERVABILITY.md`
- `skills/domains/code-quality/testing-patterns.md` (instrumentation patterns)

---

## 5) Auth + ABAC + Feature Flags

### Why this applies to Brain

As Brain scales to multiple projects and users, access control becomes essential. Feature flags provide safe rollout of new skills or agent behaviors.

### Use cases

- Gating experimental skills by team or environment.
- Limiting tool access to approved roles.
- Gradual rollout of new automation features.

### Steps (Brain-level)

1. Define **access policy model** (roles, attributes, scope).
2. Add **feature-flag lifecycle** guidance (create, rollout, retire).
3. Document **audit requirements** for policy changes.

### Deliverables (suggested locations)

- `docs/ACCESS_CONTROL.md`
- `skills/domains/infrastructure/security-patterns.md`

---

## 6) SCIM Provisioning + Git Hosting/Mirroring

### Why this applies to Brain

Enterprise adoption requires provisioning and reliable repo sync. Brain’s value increases when it can stay in sync with organizational repos.

### Use cases

- Auto-provisioning users into agent systems.
- Mirroring project repos to a controlled environment.
- Keeping the Brain repo synchronized with multiple downstream forks.

### Steps (Brain-level)

1. Document **SCIM provisioning flows** (identity lifecycle events).
2. Define **git mirror policies** (who can push, conflict handling).
3. Provide **audit trail** expectations.

### Deliverables (suggested locations)

- `docs/ENTERPRISE_INTEGRATIONS.md`
- `skills/domains/infrastructure/deployment-patterns.md`

---

## 7) Agent State Machine (conversation orchestration)

### Why this applies to Brain

Brain already uses loop-based execution, but a formal state machine improves clarity, observability, and debugging.

### Use cases

- Formalizing PLAN vs BUILD transitions.
- Improved failure recovery by explicit state transitions.
- Consistent handling of interrupts and resumes.

### Steps (Brain-level)

1. Define **states + transitions** (plan, build, verify, rollback).
2. Document **state transition triggers** and failure handling.
3. Provide **state visualization** (diagram or table).

### Deliverables (suggested locations)

- `docs/AGENT_STATE_MACHINE.md`
- `skills/domains/ralph/ralph-patterns.md` (state model reference)

---

## 8) Tool Registry / Execution Framework

### Why this applies to Brain

A unified registry makes tool discovery safer and more consistent across agents. It also allows policy enforcement per tool.

### Use cases

- Listing allowed tools by environment.
- Tagging tools with risk level and required approvals.
- Enforcing consistent input/output schemas.

### Steps (Brain-level)

1. Define **tool schema** (name, description, inputs, outputs, risks).
2. Add **tool gating rules** (which roles can run which tools).
3. Provide **tool discovery** patterns for agents.

### Deliverables (suggested locations)

- `docs/TOOL_REGISTRY.md`
- `skills/domains/ralph/` (execution patterns)

---

# Recommended Prioritization

## Phase A (Highest impact, lowest dependency)

1. Observability suite (event schema + logging patterns)
2. Thread persistence + search (schema + indexing)
3. Tool registry spec (schema + gating)

## Phase B (Platform-level enablers)

4. Server-side LLM proxy
5. Agent state machine

## Phase C (Enterprise + infrastructure)

6. Remote execution environments
7. Auth + ABAC + feature flags
8. SCIM provisioning + git mirroring

---

# Implementation Plan Guidance for Cortex

When creating the implementation plan, focus on **documentation + patterns first**, then incremental scaffolding. The Brain repo’s current strength is knowledge and workflow guidance; these additions should start as documented specs and patterns that Ralph can implement, then evolve into tooling if needed.

**Suggested approach:**

- Create docs/specs first (clear scope, schemas, and workflows).
- Add skills/patterns where applicable.
- Only then consider code or automation scaffolds.
