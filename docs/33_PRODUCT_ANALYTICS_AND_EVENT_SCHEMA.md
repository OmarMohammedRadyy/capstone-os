# Product Analytics & Event Schema

## Purpose
Understand whether the product helps teams deliver projects; not behavioral surveillance.

## Events
project_created, member_invited, invite_accepted, task_created, task_completed, sprint_started, sprint_closed, milestone_submitted, milestone_approved, feedback_created, feedback_verified, document_version_uploaded, risk_created, submission_frozen, submission_submitted, defense_check_completed.

## Event Properties
Event name, timestamp, actor pseudonymous id, project id, entity type/id, app version, safe contextual properties. No document bodies/comments.

## Funnel Examples
Project created → team invited → first milestone → first sprint → submission frozen.

## Product KPIs
Weekly active projects, overdue ratio, feedback closure rate, milestone on-time rate, submission readiness, defense readiness, feature adoption.

## Distinguish
Product analytics ≠ contribution analytics ≠ audit logs. Each has separate purpose and retention.
