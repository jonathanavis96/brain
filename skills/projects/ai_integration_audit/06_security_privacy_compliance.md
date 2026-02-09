# Security, Privacy, Compliance (Client Trust)

## Why This Exists

AI integration projects fail during procurement/security review or cause harm if PII handling and approvals aren’t designed up front.

## When to Use It

Use during intake and before any production deployment.

## Details

### Data Classification

- Identify PII/PHI/PCI presence in artifacts
- Decide what data can be sent to external LLMs vs must remain internal

### Prompt & Tool Safety

- Never embed secrets in prompts
- Redact/avoid unnecessary PII
- Use policy citations for customer-facing answers

### Approval Gates

Require explicit human approval for:

- customer-facing messages (until quality is proven)
- refunds/credits
- contract/legal statements
- any financial action

### Auditability

Capture:

- who approved
- what was sent
- what sources were used
- timestamps + workflow IDs

### Security Questionnaire Starter Answers (patterns)

Maintain a reusable FAQ for:

- data retention
- access controls
- model providers
- logging and incident response

## Deliverables

Done when:

- Data flows are documented
- Approval gates match risk tier
- Audit logging requirements are met
