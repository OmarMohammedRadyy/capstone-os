# Backend, Domain Services & Jobs

## Application Services
Examples:
- CreateProject
- InviteMember
- TransitionTask
- CloseSprint
- RequestMilestoneApproval
- ResolveFeedback
- UploadDocumentVersion
- FreezeSubmission
- RecomputeProjectHealth

## Transaction Boundaries
A use-case owns its transaction. Example FreezeSubmission validates requirements, creates snapshot/artifact references, updates status, emits activity/audit atomically.

## Repositories
Thin adapters around ORM for complex domain persistence. Avoid generic repository abstraction for every table if it reduces clarity.

## Domain Events
Internal events: `task.completed`, `feedback.created`, `milestone.approved`, `submission.frozen`. Consumers create notification/activity and schedule analytics updates.

## Jobs
Job fields: id, type, payload, status, attempts, run_after, locked_at, error_summary, idempotency_key.

## Retry
Exponential backoff for transient email/storage/integration failures. Domain validation errors are not retried.

## Scheduled Jobs
- Due-soon reminders daily.
- Daily health snapshot.
- Notification digest.
- Cleanup expired invites/sessions.

## File Flow
Request upload → permission/size/type validation → temporary/signed upload → checksum/scan → commit DocumentVersion → event.

## Service Boundaries
Health module reads normalized aggregates; it must not mutate task/milestone records. Notification failure never rolls back a valid core domain action.
