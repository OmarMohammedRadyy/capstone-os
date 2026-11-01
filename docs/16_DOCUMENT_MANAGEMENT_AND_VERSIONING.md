# Document Management & Versioning

## Purpose
Manage project artifacts without pretending to replace Google Docs/Git. The system owns metadata, versions, evidence and submission snapshots.

## Document Fields
Title, category, tags, status, owner, description, official flag, current_version_id.

## Categories
Proposal, SRS, Research, UI/UX, Architecture, Database, Testing, Report, Presentation, Demo Asset, Administrative, Other.

## Versioning
Upload creates immutable DocumentVersion: version number, file metadata, SHA-256 checksum, uploader, timestamp, storage key.

## Rules
- Never overwrite an existing version binary.
- `current_version_id` may change.
- Mark Final/Official is reversible only with audit event.
- Submission snapshots point to exact version IDs.

## Upload Security
Allowlist MIME/extensions, size cap, server-side MIME validation, generated storage keys, antivirus scanning integration point, no direct public bucket URLs.

## Storage
S3-compatible object storage. Local development may use MinIO.

## Preview
PDF/images browser preview where safe; office files may download or use future conversion worker.

## Search
Search metadata and extracted text only if extraction feature is enabled later; MVP must search titles/tags/categories reliably.

## Retention
Archived project documents remain according to deployment policy. Destructive deletion requires Admin policy and audit trail.
