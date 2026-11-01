# Observability, Error Handling & SLOs

## Correlation
Every request has requestId propagated to logs and error responses.

## Structured Logs
JSON fields: timestamp, level, requestId, userId hash/id where appropriate, projectId, route/action, duration, outcome. Never secrets/file contents.

## Metrics
Request count/latency/errors, DB pool, job queue depth/failures, upload failures, email failures, health recompute age.

## Error Tracking
Capture uncaught server/client errors with release version and source maps protected. Scrub PII.

## SLO Suggestions
- Availability 99.5% monthly.
- p95 key read API <500ms target under agreed load.
- Critical notification job processed within 5 minutes 99% when provider healthy.

## Alerts
High 5xx rate, DB unavailable, storage failures, queue backlog, migration failure, disk usage for self-hosted.

## User Errors
Domain error codes stable and translatable. Technical detail hidden; requestId shown for support.

## Health Endpoints
`/health/live` process check.
`/health/ready` DB/storage dependencies needed to serve traffic.
