# AI Integration Audit (Project)

This folder contains runnable assets for the AI Integration Audit workflow.

> Note: The *methodology* lives under `skills/projects/ai_integration_audit/` as markdown-only skills.

## Contents

- `generator/` — reference generator scaffold
- `client_template/ai-integration-client-template/` — copyable client repo scaffold (standalone)

## Quick Start (generator)

```bash
python3 projects/ai_integration_audit/generator/auditgen.py \
  --company "Example Co" \
  --research-provider stub \
  --out tmp_rovodev_audit_out
```

## Quick Start (client template)

```bash
# Copy the template somewhere else (recommended)
cp -r projects/ai_integration_audit/client_template/ai-integration-client-template /tmp/client-audit

# Run inside the copied folder
cd /tmp/client-audit
bash scripts/run_from_company.sh "Example Co"
```

## Spinning this out into a new standalone repo

Suggested approach:

1. Copy `projects/ai_integration_audit/client_template/ai-integration-client-template/` into a new empty git repo
2. Rename it to the client/business name
3. Commit and use as the delivery workspace for that client

If you want this to be a general template repo (not client-specific), create a new repository containing:

- `auditgen/` (generator)
- `client/` (inputs)
- `outputs/` (generated)
- `scripts/`
- `requirements.txt`

## Notes

- `research-provider stub` requires no network and produces placeholder research.
- `research-provider chromium` (client template) requires Playwright + Chromium install.
