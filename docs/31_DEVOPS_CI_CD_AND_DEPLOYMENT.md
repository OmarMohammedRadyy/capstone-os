# DevOps, CI/CD & Deployment

## Environments
Local, Preview/PR, Staging, Production.

## Local
Docker Compose: app, PostgreSQL, object storage (MinIO), optional Redis/mail catcher.

## CI Pipeline
1. Install pinned dependencies.
2. Typecheck.
3. Lint/format check.
4. Unit tests.
5. Integration tests with ephemeral PostgreSQL.
6. Build.
7. E2E smoke.
8. Dependency/secret scan.

## CD
Main → staging automatic. Production requires tagged release/manual approval. Run DB migration before traffic switch with compatibility plan.

## Containers
Non-root user, multi-stage image, minimal runtime dependencies, healthcheck, immutable image tag by commit SHA.

## Database Migration
- Migration files committed.
- Backup before destructive changes.
- Expand/contract for risky schema changes.
- Never edit already-applied production migration.

## Deployment Options
A) Managed: Vercel-compatible web + managed PostgreSQL + S3-compatible storage.
B) VPS/University server: Docker Compose/Reverse Proxy + PostgreSQL + MinIO + backup target.

## Backups
Daily DB backup + object storage policy; restore drill before final launch. Define RPO/RTO for chosen hosting.

## TLS
HTTPS only in production; HSTS after domain verified.
