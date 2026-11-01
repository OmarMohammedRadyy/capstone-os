# Data Dictionary & Canonical Enums

## IDs
UUID v7/v4 according to library support; consistency more important than novelty. External slugs are human-friendly but never authorization boundaries.

## Canonical Enums
### ProjectStatus
PLANNING, ACTIVE, AT_RISK, PAUSED, COMPLETED, ARCHIVED

### ProjectRole
STUDENT, TEAM_LEADER, SUPERVISOR, DEPARTMENT_ADMIN

### TaskStatus
BACKLOG, READY, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE, CANCELLED

### Priority
CRITICAL, HIGH, MEDIUM, LOW

### MilestoneStatus
NOT_STARTED, ON_TRACK, AT_RISK, BLOCKED, AWAITING_APPROVAL, COMPLETED

### FeedbackStatus
OPEN, IN_PROGRESS, RESOLVED, AWAITING_VERIFICATION, VERIFIED

### FeedbackSeverity
NOTE, IMPORTANT, BLOCKING

### RiskStatus
OPEN, MITIGATING, MONITORING, CLOSED, MATERIALIZED

### IssueStatus
OPEN, INVESTIGATING, FIXING, MONITORING, RESOLVED, CLOSED

### SubmissionStatus
DRAFT, PREPARING, READY, FROZEN, SUBMITTED, ACCEPTED, CHANGES_REQUESTED

### NotificationChannel
IN_APP, EMAIL

## Time Fields
Use `*_at` for timestamp, `*_date` only for date-only academic dates. `created_at/updated_at` on mutable entities.

## Text Limits (initial)
Titles 200 chars, short labels 60, descriptions 20k, comments 10k, rich notes 50k; enforce both client guidance and server validation. Revisit via ADR if real needs differ.

## File Metadata
Original filename retained for display after sanitization; storage key generated and unrelated to user input.

## Money
Not needed in MVP; do not introduce billing schema.
