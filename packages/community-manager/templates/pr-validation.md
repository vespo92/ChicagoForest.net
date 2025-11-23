# PR Validation Report ✅

This PR has been automatically validated by **Agent 17: Ambassador**.

## Ownership Analysis

| Field | Value |
|-------|-------|
| **Owning Agent** | {{#if owningAgent}}Agent {{owningAgent}}: {{owningAgentName}}{{else}}Multiple/None{{/if}} |
| **Files Changed** | {{fileCount}} |
| **Additions** | +{{additions}} |
| **Deletions** | -{{deletions}} |

## Validation Status: {{#if valid}}✅ PASSED{{else}}⚠️ ISSUES FOUND{{/if}}

{{#if issues}}
### Issues Detected

{{#each issues}}
- ⚠️ {{this}}
{{/each}}

### Recommendations

{{#if crossAgentViolation}}
Consider splitting this PR into separate PRs for each agent's domain to maintain clean ownership boundaries.
{{/if}}

{{#if largePR}}
Large PRs are harder to review. Consider breaking this into smaller, focused PRs.
{{/if}}

{{#if missingTests}}
Please add tests for your changes. This project requires 80% test coverage.
{{/if}}
{{else}}
All validation checks passed! 🎉
{{/if}}

## Changed Files by Agent

{{#each agentFiles}}
### Agent {{@key}}: {{name}}
{{#each files}}
- `{{this}}`
{{/each}}

{{/each}}

## Commit Convention

Please ensure your commits follow the convention:
```
{{commitType}}(agent-{{owningAgent}}): {{commitDescription}}
```

---

*Automated validation by Agent 17: Ambassador - Community Management*

**Note:** This is automated analysis. Human reviewers should also check code quality and correctness.
