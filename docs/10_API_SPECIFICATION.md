# API Specification

## Style
Internal JSON API تحت `/api/v1`. Server Actions يجوز استخدامها للـUI، لكن domain service هو المصدر المشترك للمنطق. Public contracts versioned.

## Response Envelope
```json
{ "data": {}, "meta": {"requestId":"..."} }
```
Errors:
```json
{ "error": {"code":"TASK_NOT_FOUND","message":"...","fields":{}}, "meta":{"requestId":"..."} }
```

## Key Endpoints
### Projects
GET /projects
POST /projects
GET /projects/:projectId
PATCH /projects/:projectId
POST /projects/:projectId/archive

### Members
GET /projects/:id/members
POST /projects/:id/invites
PATCH /projects/:id/members/:userId
DELETE /projects/:id/members/:userId

### Tasks
GET /projects/:id/tasks?status=&assignee=&sprint=&q=
POST /projects/:id/tasks
GET /projects/:id/tasks/:taskId
PATCH /projects/:id/tasks/:taskId
POST /projects/:id/tasks/:taskId/comments
POST /projects/:id/tasks/:taskId/transition

### Sprints / Milestones
CRUD + start/close sprint; approve/reject milestone.

### Feedback
CRUD, resolve, request-verification, verify, reopen.

### Documents
POST init-upload → signed upload/stream → POST complete-upload.
GET versions.
POST mark-official.

### Health
GET /projects/:id/health
GET /projects/:id/health/history
POST /projects/:id/health/recompute (leader/admin internal).

### Submissions
CRUD, readiness, freeze, submit, approve.

## Pagination
Cursor-based for activity/comments/notifications; offset acceptable for bounded admin tables.

## Concurrency
Use updated_at/version field for optimistic concurrency on frequently edited records. Return 409 EDIT_CONFLICT with latest entity.

## Idempotency
Freeze submission, invite send, and external-triggered mutations support idempotency keys.
