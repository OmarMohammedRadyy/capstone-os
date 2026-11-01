# Tasks, Sprints & Workflow

## Task States
Backlog → Ready → In Progress → In Review → Done.
Additional terminal/exception states: Cancelled, Blocked.

## Transition Rules
- Backlog→Ready requires title + owner/assignment strategy + acceptance criteria where required.
- In Progress→In Review requires assignee update and optional evidence.
- In Review→Done requires reviewer/owner decision according to project policy.
- Any state→Blocked requires blocked_reason.
- Done reopening creates activity event and preserves completed_at history.

## Priority
Critical, High, Medium, Low. Critical should be rare and surfaced on Overview.

## Task Anatomy
Title, description, acceptance criteria, labels, assignees, reporter, priority, status, sprint, milestone, due date, estimate points, checklist, dependencies, attachments, comments, change history.

## Dependencies
`blocks` / `blocked_by`. Prevent self-dependency and detect cycles.

## Sprint Planning
- Goal.
- Start/end.
- Planned capacity.
- Selected tasks.
- Risk notes.
- Start locks baseline scope metric; later additions are marked scope change.

## Sprint Close
Summarize completed/planned points, completion %, carried work, blockers, retrospective notes. Unfinished tasks can move to backlog or next sprint with explicit action.

## Views
Board, List, My Work, Calendar-lite, Sprint view.

## Bulk Actions
Assignee, priority, sprint, label, status where transition is legal.

## Metrics
Throughput, completion ratio, carry-over count, overdue count. Do not use velocity as individual performance ranking.
