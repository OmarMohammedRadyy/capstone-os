# Project Health Engine

## Objective
Produce an explainable 0–100 project health score and status. This is decision support, not an opaque AI score.

## Components and Default Weights
- Milestone Schedule Health: 30%
- Task Execution Health: 20%
- Supervisor Feedback Health: 15%
- Risk/Issue Health: 15%
- Documentation/Submission Readiness: 10%
- Team Workload Balance: 10%

Weights configurable by project template, sum=100.

## Example Formula
`overall = Σ(componentScore × weight)` rounded to integer.

### Schedule Score
Start 100. Penalize overdue incomplete milestones based on severity/days, cap penalty 60. Add smaller penalty for milestones due soon with insufficient completion.

### Task Score
Combination of overdue ratio, blocked ratio, sprint completion vs elapsed time, and review queue age.

### Feedback Score
100 minus weighted open blocking/important feedback and overdue feedback penalties.

### Risk Score
Map active risk exposure to normalized penalty; critical open issue adds separate bounded penalty.

### Readiness Score
Required current artifacts/checklist completion for upcoming submission.

### Workload Balance
Use assigned workload distribution and concentration, not hours tracked. Score lower only when one member is overloaded relative to team and due-soon work.

## Status Bands
90–100 Excellent
75–89 On Track
60–74 Needs Attention
40–59 At Risk
0–39 Critical

## Explainability Contract
API returns:
```json
{
  "score": 78,
  "status": "ON_TRACK",
  "components": [{"key":"schedule","score":70,"weight":0.3}],
  "drivers": [{"type":"warning","messageKey":"health.overdueMilestones","entityIds":["..."]}],
  "calculatedAt":"..."
}
```

## Snapshots
Daily + event-triggered snapshot when major milestone/submission changes. Never rewrite historical snapshots.

## Guardrails
- No AI black box.
- No hidden contribution punishment.
- Missing data is reported as confidence/readiness gap rather than fabricated score.
