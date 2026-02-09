# Integrations & Deployment (Automation-First)

## Why This Exists

The fastest client wins come from connecting existing systems (CRM/helpdesk/email/docs) and inserting AI into high-volume workflows with minimal disruption.

This skill defines an integration-first deployment approach.

## When to Use It

Use when turning agent specs into deployable workflows.

## Details

### Integration Strategy

Start with what the business already uses:

- Google Workspace / Microsoft 365
- Slack/Teams
- CRM: HubSpot/Salesforce
- Helpdesk: Zendesk/Intercom/Freshdesk
- Knowledge base: Notion/Confluence
- Accounting: Xero/QBO

### Automation Platforms

Select based on constraints:

- **Zapier/Make:** fastest time-to-value, good for SMB
- **n8n:** more control, self-host option, better for complex flows

### Deployment Pattern (safe default)

1. **Shadow mode:** generate drafts/summaries only (no sending)
2. **Approval mode:** human approves actions
3. **Limited autonomy:** allow low-risk actions to execute
4. **Scale:** expand scope + add monitoring

### Required Operational Pieces

- Logging: capture inputs/outputs and decision metadata
- Alerting: failures, rate limits, tool outages
- Rollback: ability to disable workflows quickly
- Permissions: least privilege service accounts

### Definition of Done for a Deployed Workflow

- Can be run by a non-technical user
- Clear failure messages and retry behavior
- Audit trail exists
- Owner is assigned (who maintains it?)

## Deliverables

Done when:

- Workflows are deployed in shadow/approval mode
- Monitoring and rollback exist
- Client owners can operate it
