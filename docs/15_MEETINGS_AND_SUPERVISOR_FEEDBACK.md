# Meetings & Supervisor Feedback

## Meeting Entity
Type: Team / Supervisor / Department / Rehearsal.
Fields: title, scheduled_at, duration, location/link, agenda, attendees, notes, summary, created_by.

## Meeting Lifecycle
Draft → Scheduled → Completed → Archived.

## Meeting Notes Structure
- Agenda.
- Discussion notes.
- Decisions.
- Action items.
- Questions for later.

## Action Item Conversion
One click creates Task while keeping source meeting link and original text.

## Supervisor Feedback
Feedback must be actionable, traceable and verifiable.
Fields: category, severity, title, detail, target entity, assignee, due date, status, evidence, verification.

## Categories
Requirements, UI/UX, Technical, Documentation, Research, Presentation, Scope, Other.

## Severity
Note, Important, Blocking.

## Workflow
Open → In Progress → Resolved → Awaiting Verification → Verified.
Supervisor may Reopen with reason.

## UX
Feedback inbox resembles issue review rather than chat. A right-side detail panel can show linked artifact and history.

## Metrics
Open feedback count, blocking feedback, median resolution time, reopened count. These inform project health but must not dominate it.
