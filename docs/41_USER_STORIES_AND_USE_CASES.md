# User Stories & Use Cases

## Student Stories
- As a student, I want one view of everything assigned to me so I know what to do next.
- I want to see why the project health changed so I can act on the real cause.
- I want to link evidence to completed work so contribution is verifiable.
- I want supervisor feedback linked to the exact artifact so context is not lost.

## Team Leader Stories
- I want to convert the academic plan into milestones and tasks.
- I want to detect overdue/blocking work before it threatens a submission.
- I want to rebalance upcoming workload without tracking private screen time.
- I want to freeze exact file versions for each submission.

## Supervisor Stories
- I want a concise project status without opening every task.
- I want to comment on a specific milestone/document and verify fixes.
- I want to approve/reject milestone evidence with an audit trail.

## Admin Stories — Phase 2
- I want to see which projects are at risk across a cohort.
- I want to publish shared deadlines/templates.

## Critical Use Case UC-01 — Resolve Supervisor Feedback
Precondition: supervisor and student are project members.
1. Supervisor creates Blocking feedback on SRS v3.
2. System notifies owner and health engine records driver.
3. Student opens feedback, performs linked task, uploads SRS v4.
4. Student marks Resolved and attaches v4 as evidence.
5. Status becomes Awaiting Verification.
6. Supervisor verifies or reopens with reason.
Postcondition: complete trace from feedback → work → evidence → verification.

## UC-02 — Freeze Submission
1. Leader opens submission.
2. System checks every mandatory requirement.
3. Missing items block freeze with actionable list.
4. When ready, leader confirms freeze.
5. System transaction creates snapshot and exact document-version references.
6. Activity + audit events emitted.
7. UI shows immutable frozen package.

## UC-03 — Health Deterioration
1. Milestone becomes overdue and two tasks blocked.
2. Recompute job updates component scores.
3. Overview changes status and lists concrete drivers.
4. Leader navigates from driver directly to affected records.
