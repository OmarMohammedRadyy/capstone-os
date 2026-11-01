# Decisions, Risks & Issues

## Decision Log
A decision is not a comment. It records:
- Context.
- Options considered.
- Chosen option.
- Rationale.
- Consequences/trade-offs.
- Owner/date.
- Related entities.

### Decision Status
Proposed, Accepted, Superseded, Rejected.
Superseding creates link to new decision; never erase old rationale.

## Risk Register
Fields: title, description, category, probability 1–5, impact 1–5, exposure=probability×impact, owner, mitigation, contingency, trigger, status.

### Risk Bands
1–4 Low, 5–9 Moderate, 10–15 High, 16–25 Critical. Bands configurable.

## Issues
An issue has already happened. Fields: severity, status, owner, detected_at, root cause, resolution, linked tasks/risks.

## Issue Status
Open, Investigating, Fixing, Monitoring, Resolved, Closed.

## UI
Risk matrix 5×5, sortable register, issue list, decision timeline. No decorative 3D charts.

## Health Impact
Only Open risks/issues contribute. Critical blockers have capped but meaningful penalty to avoid a single record driving score to zero without context.
