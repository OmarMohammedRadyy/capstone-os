# Environment Configuration & Runbook

## Environment Variables (names only)
`DATABASE_URL`
`APP_URL`
`SESSION_SECRET`
`STORAGE_ENDPOINT`
`STORAGE_BUCKET`
`STORAGE_ACCESS_KEY`
`STORAGE_SECRET_KEY`
`EMAIL_FROM`
`EMAIL_PROVIDER_*`
`REDIS_URL` optional
`ERROR_TRACKING_DSN` optional
`ANALYTICS_*` optional

## Startup
Validate configuration at boot with schema; fail fast for required missing secrets.

## Operational Runbook
### App unavailable
Check readiness → app logs → DB connectivity → storage dependency → recent release; rollback if release-caused.

### DB migration failure
Stop rollout, preserve previous app, inspect migration, restore only if partial state requires and backup verified. Never improvise destructive SQL in production.

### Storage unavailable
Core text workflows may continue if architecture supports; uploads/downloads show explicit degraded state.

### Job backlog
Pause noncritical jobs, inspect provider/worker, retry safely using idempotency.

### Account security incident
Revoke sessions, reset credentials, inspect audit logs, rotate affected secrets, document incident.

## Release Checklist
Backup, migration dry-run, CI green, release notes, smoke test auth/tasks/upload/submission, monitor errors after deploy.
