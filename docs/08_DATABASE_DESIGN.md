# Database Design

## Database
PostgreSQL, UUID primary keys, timestamptz, soft-delete only where product requires restoration. Prefer explicit status over silent deletion.

## Core Tables
users, sessions, projects, project_members, project_invites, phases, milestones, milestone_evidence, sprints, tasks, task_assignees, task_dependencies, task_checklist_items, task_comments, labels, task_labels, meetings, meeting_attendees, meeting_actions, feedback, documents, document_versions, decisions, decision_options, risks, issues, health_snapshots, contribution_snapshots, notifications, notification_preferences, submissions, submission_requirements, submission_artifacts, defense_plans, defense_sections, defense_checklist_items, activity_events, audit_logs.

## Representative Fields
### projects
id, slug, title, code, abstract, academic_year, department, status, start_at, end_at, supervisor_user_id, created_by, created_at, updated_at.

### project_members
project_id, user_id, role, responsibility_title, joined_at, active.
Unique(project_id,user_id).

### tasks
id, project_id, sprint_id?, milestone_id?, parent_task_id?, title, description, status, priority, estimate_points?, due_at?, blocked_reason?, created_by, created_at, updated_at, completed_at?.

### feedback
id, project_id, author_id, assignee_id?, target_type, target_id, category, severity, title, body, status, due_at?, verified_at?.

### document_versions
id, document_id, version_number, storage_key, original_name, mime_type, byte_size, checksum_sha256, uploaded_by, created_at.

### activity_events
append-only event feed for product timeline.

### audit_logs
append-only security/administrative record with actor, action, entity, before/after redacted payload, ip_hash or request metadata according to privacy policy.

## Indexing
- project_id on every project-scoped table.
- composite indexes for (project_id,status), (project_id,due_at), (project_id,created_at desc).
- trigram/full-text index for global search fields as required.
- unique indexes for slug, invite token hash, document version per document.

## Data Integrity
- Foreign keys.
- Check constraints for probability/impact/score ranges.
- Transactional sequence for document versions.
- Never store raw invite/reset tokens; store hashes.
