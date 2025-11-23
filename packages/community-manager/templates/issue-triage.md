# Issue Triage Report 🔍

This issue has been automatically triaged by **Agent 17: Ambassador**.

## Classification

| Field | Value |
|-------|-------|
| **Priority** | {{priority}} |
| **Suggested Labels** | {{labels}} |
| **Assigned Agent** | {{#if agentId}}Agent {{agentId}}: {{agentName}}{{else}}Unassigned{{/if}} |

{{#if relatedIssues}}
## Related Issues

This issue may be related to:
{{#each relatedIssues}}
- #{{this}}
{{/each}}
{{/if}}

{{#if comments}}
## Notes

{{#each comments}}
- {{this}}
{{/each}}
{{/if}}

## Agent Ownership

{{#if agentId}}
This issue appears to relate to **Agent {{agentId}} ({{agentName}})** based on content analysis.

The owning agent has exclusive responsibility for:
{{#each agentPackages}}
- `{{this}}`
{{/each}}
{{else}}
This issue does not clearly map to a specific agent. Community triage may be needed.
{{/if}}

---

*Automated triage by Agent 17: Ambassador - Community Management*

**Note:** This is automated analysis. Human review may reassign priority or labels.
