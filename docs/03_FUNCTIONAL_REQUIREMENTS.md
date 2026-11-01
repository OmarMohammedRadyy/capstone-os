# Functional Requirements

## FR-01 Authentication
- Register/login/logout.
- Email verification optional حسب بيئة الجامعة.
- Password reset.
- Session management.
- Invite-based join to project.

## FR-02 Project Workspace
- Create project: title, code, academic year, department, abstract, start/end dates, supervisor.
- Unique slug.
- Archive/restore.
- Status: Planning, Active, At Risk, Paused, Completed, Archived.

## FR-03 Team
- Invite by email/link.
- Roles and responsibility areas.
- Capacity indicator.
- Member profile with assigned/completed items.

## FR-04 Tasks
- CRUD, status, priority, assignee(s), due date, estimate, labels, dependencies, checklist, attachments, comments.
- Board/List/My Work views.
- Filters, search, bulk edit.
- Blocked reason.

## FR-05 Sprints
- Create sprint, dates, goal, scope.
- Add/remove tasks.
- Start/close sprint.
- Carry-over unfinished work with history.

## FR-06 Roadmap & Milestones
- Phase timeline.
- Milestone criteria, owner, due date, status.
- Evidence attachments.
- Supervisor approval workflow.

## FR-07 Meetings
- Schedule/log meeting.
- Agenda, attendees, notes, decisions, action items.
- Convert action item → task.

## FR-08 Supervisor Feedback
- Feedback title/body/category/severity.
- Link to milestone/task/document/screen.
- Owner, target date, status Open/In Progress/Resolved/Verified.
- Supervisor verification.

## FR-09 Documents
- Folders/tags/categories metadata.
- Upload/download.
- Version history.
- Mark official/final.
- Link document version to submission or feedback.

## FR-10 Decisions
- Decision record: context, options, decision, rationale, owner, date, impacted modules.
- Immutable history of edits.

## FR-11 Risks & Issues
- Risk probability × impact, mitigation, owner, trigger.
- Issues with severity, blocker flag, resolution.

## FR-12 Project Health
- Composite score with transparent breakdown.
- Trend over time.
- Explain drivers and alerts.

## FR-13 Contribution Analytics
- Data from tasks, reviews, documents, meetings/action ownership, decisions.
- No keystroke/activity surveillance.

## FR-14 Notifications
- In-app notification center.
- Preferences by event type.
- Digest mode optional.

## FR-15 Activity Timeline
- Event feed across workspace.
- Filter by entity/member/date.

## FR-16 Submission Center
- Submission definition, deadline, required checklist, required files, owner.
- Readiness percentage.
- Submit snapshot / lock package.

## FR-17 Defense Mode
- Final readiness checklist.
- Presentation sections and owners.
- Demo plan, backup plan, jury questions bank, equipment checklist.
- Read-only presentation-friendly status view.

## FR-18 Search
Global search across tasks, docs metadata, decisions, meetings, feedback, risks.

## FR-19 Export
PDF/CSV/JSON where applicable; audit-safe project summary.
