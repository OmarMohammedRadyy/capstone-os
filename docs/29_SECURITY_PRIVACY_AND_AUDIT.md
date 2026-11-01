# Security, Privacy & Audit

## Threat Model Highlights
Account takeover, IDOR/project data leakage, malicious file upload, CSRF, XSS, SQL injection, brute force, invite abuse, privilege escalation, sensitive logs, broken object authorization.

## Controls
- Server-side authz on every project/entity operation.
- Parameterized ORM queries.
- Output escaping; sanitize any rich text with strict allowlist.
- CSP in production.
- CSRF-safe mutation strategy.
- Rate limiting on auth, invites, search abuse, uploads.
- Password hashing using modern memory-hard or approved library defaults.
- MFA-ready architecture (optional MVP).
- Secure session rotation/revocation.

## File Security
Allowlist, content sniffing, max sizes, malware scan hook, random storage keys, private bucket, signed short-lived downloads, no execution.

## Secrets
Environment/secret manager only. `.env.example` contains names, never values.

## Privacy
Minimize personal data. Do not log file contents, passwords, tokens or sensitive feedback bodies. Define retention/export/delete policy.

## Audit Events
Login anomalies, role changes, member removal, project archive, official document change, submission freeze/unfreeze/submit, admin actions.

## Audit Record
actor_id, action, entity_type/id, project_id, timestamp, request_id, safe before/after diff, metadata. Append-only from application perspective.

## Security Testing
Dependency scanning, secret scanning, SAST, authorization integration tests, upload abuse tests, OWASP checklist before release.
