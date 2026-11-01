-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('USER', 'DEPARTMENT_ADMIN', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'AT_RISK', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('STUDENT', 'TEAM_LEADER', 'SUPERVISOR', 'DEPARTMENT_ADMIN');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('BACKLOG', 'READY', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('PLANNED', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "SprintScopeChangeType" AS ENUM ('ADDED', 'REMOVED', 'CARRIED_IN', 'CARRIED_OUT');

-- CreateEnum
CREATE TYPE "PhaseStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PhaseProgressStrategy" AS ENUM ('MILESTONES', 'TASKS');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('NOT_STARTED', 'ON_TRACK', 'AT_RISK', 'BLOCKED', 'AWAITING_APPROVAL', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MilestoneApprovalAction" AS ENUM ('REQUESTED', 'APPROVED', 'CHANGES_REQUESTED', 'REOPENED');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('TEAM', 'SUPERVISOR', 'DEPARTMENT', 'REHEARSAL');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('INVITED', 'PRESENT', 'ABSENT', 'EXCUSED');

-- CreateEnum
CREATE TYPE "ActionItemStatus" AS ENUM ('OPEN', 'DONE');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'AWAITING_VERIFICATION', 'VERIFIED');

-- CreateEnum
CREATE TYPE "FeedbackSeverity" AS ENUM ('NOTE', 'IMPORTANT', 'BLOCKING');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('REQUIREMENTS', 'UI_UX', 'TECHNICAL', 'DOCUMENTATION', 'RESEARCH', 'PRESENTATION', 'SCOPE', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackTargetType" AS ENUM ('PROJECT', 'MILESTONE', 'TASK', 'DOCUMENT', 'SUBMISSION', 'SCREEN');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('PROPOSAL', 'SRS', 'RESEARCH', 'UI_UX', 'ARCHITECTURE', 'DATABASE', 'TESTING', 'REPORT', 'PRESENTATION', 'DEMO_ASSET', 'ADMINISTRATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'CLEAN', 'SKIPPED', 'INFECTED');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'SUPERSEDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('OPEN', 'MITIGATING', 'MONITORING', 'CLOSED', 'MATERIALIZED');

-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('TECHNICAL', 'SCHEDULE', 'SCOPE', 'TEAM', 'EXTERNAL', 'QUALITY', 'OTHER');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'FIXING', 'MONITORING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'PREPARING', 'READY', 'FROZEN', 'SUBMITTED', 'ACCEPTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "RequirementType" AS ENUM ('CHECKLIST', 'DOCUMENT', 'URL', 'DECLARATION', 'REVIEWER_APPROVAL');

-- CreateEnum
CREATE TYPE "SubmissionEventType" AS ENUM ('CREATED', 'FROZEN', 'UNFROZEN', 'SUBMITTED', 'ACCEPTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "DefenseSectionStatus" AS ENUM ('NOT_STARTED', 'DRAFTING', 'READY');

-- CreateEnum
CREATE TYPE "DefenseChecklistCategory" AS ENUM ('MATERIALS', 'DEMO', 'EQUIPMENT', 'SCRIPT', 'REHEARSAL');

-- CreateEnum
CREATE TYPE "DefenseQuestionStatus" AS ENUM ('DRAFT', 'PREPARED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('ASSIGNMENT', 'MENTION', 'DEADLINE', 'FEEDBACK', 'MILESTONE', 'SUBMISSION', 'DOCUMENT', 'INVITE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "EmailFrequency" AS ENUM ('INSTANT', 'DAILY_DIGEST', 'OFF');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "system_role" "SystemRole" NOT NULL DEFAULT 'USER',
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en',
    "theme" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'Africa/Cairo',
    "email_verified_at" TIMESTAMPTZ(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_project_id" UUID,
    "failed_logins" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(3),
    "last_login_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(3),
    "ip_hash" CHAR(64),
    "user_agent" VARCHAR(300),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "abstract" VARCHAR(20000),
    "academic_year" VARCHAR(20) NOT NULL,
    "department" VARCHAR(120) NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'Africa/Cairo',
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en',
    "supervisor_user_id" UUID,
    "created_by" UUID NOT NULL,
    "task_sequence" INTEGER NOT NULL DEFAULT 0,
    "decision_sequence" INTEGER NOT NULL DEFAULT 0,
    "weight_schedule" INTEGER NOT NULL DEFAULT 30,
    "weight_tasks" INTEGER NOT NULL DEFAULT 20,
    "weight_feedback" INTEGER NOT NULL DEFAULT 15,
    "weight_risk" INTEGER NOT NULL DEFAULT 15,
    "weight_readiness" INTEGER NOT NULL DEFAULT 10,
    "weight_workload" INTEGER NOT NULL DEFAULT 10,
    "status_before_archive" "ProjectStatus",
    "archived_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "ProjectRole" NOT NULL,
    "responsibility_title" VARCHAR(60),
    "capacity_points" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMPTZ(3),

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_invites" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "email" VARCHAR(254),
    "role" "ProjectRole" NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "max_uses" INTEGER NOT NULL DEFAULT 1,
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "revoked_at" TIMESTAMPTZ(3),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phases" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(20000),
    "order" INTEGER NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "status" "PhaseStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress_strategy" "PhaseProgressStrategy" NOT NULL DEFAULT 'MILESTONES',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "phase_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "objective" VARCHAR(20000),
    "acceptance_criteria" VARCHAR(20000),
    "owner_id" UUID,
    "due_date" DATE NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "approved_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestone_approvals" (
    "id" UUID NOT NULL,
    "milestone_id" UUID NOT NULL,
    "action" "MilestoneApprovalAction" NOT NULL,
    "actor_id" UUID NOT NULL,
    "comment" VARCHAR(10000),
    "feedback_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milestone_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestone_evidence" (
    "id" UUID NOT NULL,
    "milestone_id" UUID NOT NULL,
    "document_version_id" UUID,
    "url" VARCHAR(2000),
    "note" VARCHAR(2000),
    "added_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milestone_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprints" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "goal" VARCHAR(2000),
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "SprintStatus" NOT NULL DEFAULT 'PLANNED',
    "planned_capacity" INTEGER,
    "risk_notes" VARCHAR(5000),
    "baseline_points" INTEGER,
    "baseline_task_count" INTEGER,
    "completed_points" INTEGER,
    "completed_task_count" INTEGER,
    "carried_over_count" INTEGER,
    "retrospective" VARCHAR(20000),
    "started_at" TIMESTAMPTZ(3),
    "closed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprint_scope_changes" (
    "id" UUID NOT NULL,
    "sprint_id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "type" "SprintScopeChangeType" NOT NULL,
    "after_start" BOOLEAN NOT NULL,
    "points" INTEGER,
    "actor_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sprint_scope_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "sprint_id" UUID,
    "milestone_id" UUID,
    "parent_task_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(20000),
    "acceptance_criteria" VARCHAR(20000),
    "status" "TaskStatus" NOT NULL DEFAULT 'BACKLOG',
    "status_before_block" "TaskStatus",
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "estimate_points" INTEGER,
    "due_at" TIMESTAMPTZ(3),
    "blocked_reason" VARCHAR(2000),
    "created_by" UUID NOT NULL,
    "reviewed_by" UUID,
    "source_action_id" UUID,
    "started_at" TIMESTAMPTZ(3),
    "in_review_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "first_completed_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_assignees" (
    "task_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_assignees_pkey" PRIMARY KEY ("task_id","user_id")
);

-- CreateTable
CREATE TABLE "task_dependencies" (
    "task_id" UUID NOT NULL,
    "depends_on_task_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("task_id","depends_on_task_id")
);

-- CreateTable
CREATE TABLE "task_checklist_items" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "done_at" TIMESTAMPTZ(3),
    "done_by" UUID,

    CONSTRAINT "task_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "body" VARCHAR(10000) NOT NULL,
    "edited_at" TIMESTAMPTZ(3),
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comment_mentions" (
    "comment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "task_comment_mentions_pkey" PRIMARY KEY ("comment_id","user_id")
);

-- CreateTable
CREATE TABLE "labels" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "color" VARCHAR(20) NOT NULL DEFAULT 'slate',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_labels" (
    "task_id" UUID NOT NULL,
    "label_id" UUID NOT NULL,

    CONSTRAINT "task_labels_pkey" PRIMARY KEY ("task_id","label_id")
);

-- CreateTable
CREATE TABLE "task_attachments" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "document_version_id" UUID NOT NULL,
    "added_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "type" "MeetingType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "scheduled_at" TIMESTAMPTZ(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "location" VARCHAR(500),
    "agenda" VARCHAR(50000),
    "notes" VARCHAR(50000),
    "summary" VARCHAR(5000),
    "open_questions" VARCHAR(20000),
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_attendees" (
    "meeting_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "attendance" "AttendanceStatus" NOT NULL DEFAULT 'INVITED',

    CONSTRAINT "meeting_attendees_pkey" PRIMARY KEY ("meeting_id","user_id")
);

-- CreateTable
CREATE TABLE "meeting_actions" (
    "id" UUID NOT NULL,
    "meeting_id" UUID NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "owner_id" UUID,
    "due_date" DATE,
    "status" "ActionItemStatus" NOT NULL DEFAULT 'OPEN',
    "completed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "assignee_id" UUID,
    "target_type" "FeedbackTargetType" NOT NULL,
    "milestone_id" UUID,
    "task_id" UUID,
    "document_id" UUID,
    "document_version_id" UUID,
    "submission_id" UUID,
    "screen_ref" VARCHAR(200),
    "category" "FeedbackCategory" NOT NULL,
    "severity" "FeedbackSeverity" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" VARCHAR(20000) NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'OPEN',
    "due_date" DATE,
    "resolution_note" VARCHAR(10000),
    "evidence_document_version_id" UUID,
    "evidence_url" VARCHAR(2000),
    "resolved_at" TIMESTAMPTZ(3),
    "verified_at" TIMESTAMPTZ(3),
    "verified_by" UUID,
    "reopen_count" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_events" (
    "id" UUID NOT NULL,
    "feedback_id" UUID NOT NULL,
    "from_status" "FeedbackStatus",
    "to_status" "FeedbackStatus" NOT NULL,
    "actor_id" UUID NOT NULL,
    "note" VARCHAR(10000),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(20000),
    "category" "DocumentCategory" NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "owner_id" UUID,
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "current_version_id" UUID,
    "version_sequence" INTEGER NOT NULL DEFAULT 0,
    "archived_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "storage_key" VARCHAR(300) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "checksum_sha256" CHAR(64) NOT NULL,
    "note" VARCHAR(2000),
    "scan_status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "context" VARCHAR(20000) NOT NULL,
    "chosen_option" VARCHAR(2000),
    "rationale" VARCHAR(20000),
    "consequences" VARCHAR(20000),
    "status" "DecisionStatus" NOT NULL DEFAULT 'PROPOSED',
    "owner_id" UUID,
    "decided_at" DATE,
    "meeting_id" UUID,
    "superseded_by_id" UUID,
    "impacted_modules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_options" (
    "id" UUID NOT NULL,
    "decision_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "pros" VARCHAR(5000),
    "cons" VARCHAR(5000),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "decision_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_revisions" (
    "id" UUID NOT NULL,
    "decision_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "editor_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risks" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(20000),
    "category" "RiskCategory" NOT NULL DEFAULT 'OTHER',
    "probability" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "owner_id" UUID,
    "mitigation" VARCHAR(10000),
    "contingency" VARCHAR(10000),
    "trigger" VARCHAR(2000),
    "status" "RiskStatus" NOT NULL DEFAULT 'OPEN',
    "closed_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(20000),
    "severity" "IssueSeverity" NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "is_blocker" BOOLEAN NOT NULL DEFAULT false,
    "owner_id" UUID,
    "risk_id" UUID,
    "detected_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "root_cause" VARCHAR(10000),
    "resolution" VARCHAR(10000),
    "resolved_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_tasks" (
    "issue_id" UUID NOT NULL,
    "task_id" UUID NOT NULL,

    CONSTRAINT "issue_tasks_pkey" PRIMARY KEY ("issue_id","task_id")
);

-- CreateTable
CREATE TABLE "health_snapshots" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "confidence" INTEGER NOT NULL,
    "schedule_score" INTEGER,
    "tasks_score" INTEGER,
    "feedback_score" INTEGER,
    "risk_score" INTEGER,
    "readiness_score" INTEGER,
    "workload_score" INTEGER,
    "drivers" JSONB NOT NULL,
    "trigger" VARCHAR(60) NOT NULL,
    "calculated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_snapshots" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "period_start" TIMESTAMPTZ(3) NOT NULL,
    "period_end" TIMESTAMPTZ(3) NOT NULL,
    "completed_tasks" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "reviews" INTEGER NOT NULL,
    "docs_versions" INTEGER NOT NULL,
    "decisions_owned" INTEGER NOT NULL,
    "feedback_resolved" INTEGER NOT NULL,
    "actions_completed" INTEGER NOT NULL,
    "milestones_owned" INTEGER NOT NULL,
    "ownership_weight" INTEGER NOT NULL,
    "computed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contribution_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID,
    "category" "NotificationCategory" NOT NULL,
    "type" VARCHAR(60) NOT NULL,
    "params" JSONB NOT NULL,
    "href" VARCHAR(500),
    "read_at" TIMESTAMPTZ(3),
    "archived_at" TIMESTAMPTZ(3),
    "emailed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "in_app" BOOLEAN NOT NULL DEFAULT true,
    "email" "EmailFrequency" NOT NULL DEFAULT 'INSTANT',
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(20000),
    "deadline" TIMESTAMPTZ(3) NOT NULL,
    "owner_id" UUID,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "requires_supervisor_approval" BOOLEAN NOT NULL DEFAULT true,
    "frozen_at" TIMESTAMPTZ(3),
    "frozen_by" UUID,
    "submitted_at" TIMESTAMPTZ(3),
    "decided_at" TIMESTAMPTZ(3),
    "decision_note" VARCHAR(10000),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_requirements" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "type" "RequirementType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(2000),
    "required" BOOLEAN NOT NULL DEFAULT true,
    "document_category" "DocumentCategory",
    "document_version_id" UUID,
    "url" VARCHAR(2000),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMPTZ(3),
    "completed_by" UUID,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "submission_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_snapshots" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "readiness" INTEGER NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "superseded_at" TIMESTAMPTZ(3),

    CONSTRAINT "submission_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_artifacts" (
    "id" UUID NOT NULL,
    "snapshot_id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "requirement_id" UUID,
    "label" VARCHAR(200) NOT NULL,
    "requirement_type" "RequirementType" NOT NULL,
    "document_version_id" UUID,
    "url" VARCHAR(2000),
    "checksum_sha256" CHAR(64),
    "completed" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_events" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "type" "SubmissionEventType" NOT NULL,
    "actor_id" UUID NOT NULL,
    "note" VARCHAR(10000),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defense_plans" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "defense_at" TIMESTAMPTZ(3),
    "location" VARCHAR(500),
    "demo_script" VARCHAR(50000),
    "backup_plan" VARCHAR(20000),
    "build_url" VARCHAR(2000),
    "assets_frozen_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "defense_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defense_sections" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "owner_id" UUID,
    "duration_minutes" INTEGER NOT NULL DEFAULT 3,
    "status" "DefenseSectionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" VARCHAR(5000),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "defense_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defense_checklist_items" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "category" "DefenseChecklistCategory" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "owner_id" UUID,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "done_at" TIMESTAMPTZ(3),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "defense_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defense_questions" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "question" VARCHAR(1000) NOT NULL,
    "answer_notes" VARCHAR(10000),
    "owner_id" UUID,
    "status" "DefenseQuestionStatus" NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "defense_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defense_assets" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "document_version_id" UUID NOT NULL,
    "owner_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "defense_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_events" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "actor_id" UUID,
    "type" VARCHAR(60) NOT NULL,
    "entity_type" VARCHAR(40) NOT NULL,
    "entity_id" UUID NOT NULL,
    "params" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" VARCHAR(80) NOT NULL,
    "entity_type" VARCHAR(40) NOT NULL,
    "entity_id" VARCHAR(64),
    "project_id" UUID,
    "request_id" VARCHAR(64),
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "ip_hash" CHAR(64),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "type" VARCHAR(60) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "run_after" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "error_summary" VARCHAR(2000),
    "idempotency_key" VARCHAR(200),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "key" VARCHAR(200) NOT NULL,
    "user_id" UUID NOT NULL,
    "scope" VARCHAR(80) NOT NULL,
    "response" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" VARCHAR(80) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_by" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_system_role_idx" ON "users"("system_role");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_academic_year_idx" ON "projects"("academic_year");

-- CreateIndex
CREATE INDEX "projects_supervisor_user_id_idx" ON "projects"("supervisor_user_id");

-- CreateIndex
CREATE INDEX "project_members_user_id_active_idx" ON "project_members"("user_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_invites_token_hash_key" ON "project_invites"("token_hash");

-- CreateIndex
CREATE INDEX "project_invites_project_id_created_at_idx" ON "project_invites"("project_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "phases_project_id_order_idx" ON "phases"("project_id", "order");

-- CreateIndex
CREATE INDEX "milestones_project_id_status_idx" ON "milestones"("project_id", "status");

-- CreateIndex
CREATE INDEX "milestones_project_id_due_date_idx" ON "milestones"("project_id", "due_date");

-- CreateIndex
CREATE INDEX "milestones_phase_id_idx" ON "milestones"("phase_id");

-- CreateIndex
CREATE UNIQUE INDEX "milestone_approvals_feedback_id_key" ON "milestone_approvals"("feedback_id");

-- CreateIndex
CREATE INDEX "milestone_approvals_milestone_id_created_at_idx" ON "milestone_approvals"("milestone_id", "created_at");

-- CreateIndex
CREATE INDEX "milestone_evidence_milestone_id_idx" ON "milestone_evidence"("milestone_id");

-- CreateIndex
CREATE INDEX "sprints_project_id_status_idx" ON "sprints"("project_id", "status");

-- CreateIndex
CREATE INDEX "sprint_scope_changes_sprint_id_created_at_idx" ON "sprint_scope_changes"("sprint_id", "created_at");

-- CreateIndex
CREATE INDEX "sprint_scope_changes_task_id_idx" ON "sprint_scope_changes"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_source_action_id_key" ON "tasks"("source_action_id");

-- CreateIndex
CREATE INDEX "tasks_project_id_status_idx" ON "tasks"("project_id", "status");

-- CreateIndex
CREATE INDEX "tasks_project_id_due_at_idx" ON "tasks"("project_id", "due_at");

-- CreateIndex
CREATE INDEX "tasks_project_id_created_at_idx" ON "tasks"("project_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "tasks_sprint_id_idx" ON "tasks"("sprint_id");

-- CreateIndex
CREATE INDEX "tasks_milestone_id_idx" ON "tasks"("milestone_id");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_project_id_number_key" ON "tasks"("project_id", "number");

-- CreateIndex
CREATE INDEX "task_assignees_user_id_idx" ON "task_assignees"("user_id");

-- CreateIndex
CREATE INDEX "task_dependencies_depends_on_task_id_idx" ON "task_dependencies"("depends_on_task_id");

-- CreateIndex
CREATE INDEX "task_checklist_items_task_id_order_idx" ON "task_checklist_items"("task_id", "order");

-- CreateIndex
CREATE INDEX "task_comments_task_id_created_at_idx" ON "task_comments"("task_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "labels_project_id_name_key" ON "labels"("project_id", "name");

-- CreateIndex
CREATE INDEX "task_labels_label_id_idx" ON "task_labels"("label_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_attachments_task_id_document_version_id_key" ON "task_attachments"("task_id", "document_version_id");

-- CreateIndex
CREATE INDEX "meetings_project_id_scheduled_at_idx" ON "meetings"("project_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "meetings_project_id_status_idx" ON "meetings"("project_id", "status");

-- CreateIndex
CREATE INDEX "meeting_attendees_user_id_idx" ON "meeting_attendees"("user_id");

-- CreateIndex
CREATE INDEX "meeting_actions_meeting_id_idx" ON "meeting_actions"("meeting_id");

-- CreateIndex
CREATE INDEX "meeting_actions_owner_id_status_idx" ON "meeting_actions"("owner_id", "status");

-- CreateIndex
CREATE INDEX "feedback_project_id_status_idx" ON "feedback"("project_id", "status");

-- CreateIndex
CREATE INDEX "feedback_project_id_created_at_idx" ON "feedback"("project_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "feedback_assignee_id_status_idx" ON "feedback"("assignee_id", "status");

-- CreateIndex
CREATE INDEX "feedback_milestone_id_idx" ON "feedback"("milestone_id");

-- CreateIndex
CREATE INDEX "feedback_document_id_idx" ON "feedback"("document_id");

-- CreateIndex
CREATE INDEX "feedback_events_feedback_id_created_at_idx" ON "feedback_events"("feedback_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "documents_current_version_id_key" ON "documents"("current_version_id");

-- CreateIndex
CREATE INDEX "documents_project_id_category_idx" ON "documents"("project_id", "category");

-- CreateIndex
CREATE INDEX "documents_project_id_created_at_idx" ON "documents"("project_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_storage_key_key" ON "document_versions"("storage_key");

-- CreateIndex
CREATE INDEX "document_versions_uploaded_by_idx" ON "document_versions"("uploaded_by");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_document_id_version_number_key" ON "document_versions"("document_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "decisions_superseded_by_id_key" ON "decisions"("superseded_by_id");

-- CreateIndex
CREATE INDEX "decisions_project_id_status_idx" ON "decisions"("project_id", "status");

-- CreateIndex
CREATE INDEX "decisions_project_id_created_at_idx" ON "decisions"("project_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "decisions_project_id_number_key" ON "decisions"("project_id", "number");

-- CreateIndex
CREATE INDEX "decision_options_decision_id_order_idx" ON "decision_options"("decision_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "decision_revisions_decision_id_revision_key" ON "decision_revisions"("decision_id", "revision");

-- CreateIndex
CREATE INDEX "risks_project_id_status_idx" ON "risks"("project_id", "status");

-- CreateIndex
CREATE INDEX "issues_project_id_status_idx" ON "issues"("project_id", "status");

-- CreateIndex
CREATE INDEX "issue_tasks_task_id_idx" ON "issue_tasks"("task_id");

-- CreateIndex
CREATE INDEX "health_snapshots_project_id_calculated_at_idx" ON "health_snapshots"("project_id", "calculated_at" DESC);

-- CreateIndex
CREATE INDEX "contribution_snapshots_project_id_computed_at_idx" ON "contribution_snapshots"("project_id", "computed_at" DESC);

-- CreateIndex
CREATE INDEX "contribution_snapshots_project_id_user_id_idx" ON "contribution_snapshots"("project_id", "user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_archived_at_created_at_idx" ON "notifications"("user_id", "archived_at", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_category_key" ON "notification_preferences"("user_id", "category");

-- CreateIndex
CREATE INDEX "submissions_project_id_status_idx" ON "submissions"("project_id", "status");

-- CreateIndex
CREATE INDEX "submissions_project_id_deadline_idx" ON "submissions"("project_id", "deadline");

-- CreateIndex
CREATE INDEX "submission_requirements_submission_id_order_idx" ON "submission_requirements"("submission_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "submission_snapshots_submission_id_sequence_key" ON "submission_snapshots"("submission_id", "sequence");

-- CreateIndex
CREATE INDEX "submission_artifacts_snapshot_id_idx" ON "submission_artifacts"("snapshot_id");

-- CreateIndex
CREATE INDEX "submission_artifacts_submission_id_idx" ON "submission_artifacts"("submission_id");

-- CreateIndex
CREATE INDEX "submission_events_submission_id_created_at_idx" ON "submission_events"("submission_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "defense_plans_project_id_key" ON "defense_plans"("project_id");

-- CreateIndex
CREATE INDEX "defense_sections_plan_id_order_idx" ON "defense_sections"("plan_id", "order");

-- CreateIndex
CREATE INDEX "defense_checklist_items_plan_id_order_idx" ON "defense_checklist_items"("plan_id", "order");

-- CreateIndex
CREATE INDEX "defense_questions_plan_id_order_idx" ON "defense_questions"("plan_id", "order");

-- CreateIndex
CREATE INDEX "defense_assets_plan_id_idx" ON "defense_assets"("plan_id");

-- CreateIndex
CREATE INDEX "activity_events_project_id_created_at_idx" ON "activity_events"("project_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_events_project_id_entity_type_entity_id_idx" ON "activity_events"("project_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "activity_events_project_id_actor_id_idx" ON "activity_events"("project_id", "actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_project_id_created_at_idx" ON "audit_logs"("project_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_idempotency_key_key" ON "jobs"("idempotency_key");

-- CreateIndex
CREATE INDEX "jobs_status_run_after_idx" ON "jobs"("status", "run_after");

-- CreateIndex
CREATE INDEX "idempotency_keys_created_at_idx" ON "idempotency_keys"("created_at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_supervisor_user_id_fkey" FOREIGN KEY ("supervisor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_invites" ADD CONSTRAINT "project_invites_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_invites" ADD CONSTRAINT "project_invites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phases" ADD CONSTRAINT "phases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_approvals" ADD CONSTRAINT "milestone_approvals_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_approvals" ADD CONSTRAINT "milestone_approvals_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_approvals" ADD CONSTRAINT "milestone_approvals_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_evidence" ADD CONSTRAINT "milestone_evidence_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_evidence" ADD CONSTRAINT "milestone_evidence_document_version_id_fkey" FOREIGN KEY ("document_version_id") REFERENCES "document_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_evidence" ADD CONSTRAINT "milestone_evidence_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_scope_changes" ADD CONSTRAINT "sprint_scope_changes_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "sprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_scope_changes" ADD CONSTRAINT "sprint_scope_changes_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_scope_changes" ADD CONSTRAINT "sprint_scope_changes_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "sprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_source_action_id_fkey" FOREIGN KEY ("source_action_id") REFERENCES "meeting_actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_depends_on_task_id_fkey" FOREIGN KEY ("depends_on_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_checklist_items" ADD CONSTRAINT "task_checklist_items_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_checklist_items" ADD CONSTRAINT "task_checklist_items_done_by_fkey" FOREIGN KEY ("done_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comment_mentions" ADD CONSTRAINT "task_comment_mentions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "task_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comment_mentions" ADD CONSTRAINT "task_comment_mentions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_labels" ADD CONSTRAINT "task_labels_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_labels" ADD CONSTRAINT "task_labels_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_document_version_id_fkey" FOREIGN KEY ("document_version_id") REFERENCES "document_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_actions" ADD CONSTRAINT "meeting_actions_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_actions" ADD CONSTRAINT "meeting_actions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_document_version_id_fkey" FOREIGN KEY ("document_version_id") REFERENCES "document_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_evidence_document_version_id_fkey" FOREIGN KEY ("evidence_document_version_id") REFERENCES "document_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_events" ADD CONSTRAINT "feedback_events_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_events" ADD CONSTRAINT "feedback_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "document_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_superseded_by_id_fkey" FOREIGN KEY ("superseded_by_id") REFERENCES "decisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_options" ADD CONSTRAINT "decision_options_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "decisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_revisions" ADD CONSTRAINT "decision_revisions_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "decisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_revisions" ADD CONSTRAINT "decision_revisions_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "risks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_tasks" ADD CONSTRAINT "issue_tasks_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_tasks" ADD CONSTRAINT "issue_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_snapshots" ADD CONSTRAINT "health_snapshots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_snapshots" ADD CONSTRAINT "contribution_snapshots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_frozen_by_fkey" FOREIGN KEY ("frozen_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_requirements" ADD CONSTRAINT "submission_requirements_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_requirements" ADD CONSTRAINT "submission_requirements_document_version_id_fkey" FOREIGN KEY ("document_version_id") REFERENCES "document_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_requirements" ADD CONSTRAINT "submission_requirements_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_snapshots" ADD CONSTRAINT "submission_snapshots_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_snapshots" ADD CONSTRAINT "submission_snapshots_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_artifacts" ADD CONSTRAINT "submission_artifacts_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "submission_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_artifacts" ADD CONSTRAINT "submission_artifacts_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_artifacts" ADD CONSTRAINT "submission_artifacts_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "submission_requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_artifacts" ADD CONSTRAINT "submission_artifacts_document_version_id_fkey" FOREIGN KEY ("document_version_id") REFERENCES "document_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_events" ADD CONSTRAINT "submission_events_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_events" ADD CONSTRAINT "submission_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defense_plans" ADD CONSTRAINT "defense_plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defense_sections" ADD CONSTRAINT "defense_sections_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "defense_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defense_sections" ADD CONSTRAINT "defense_sections_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defense_checklist_items" ADD CONSTRAINT "defense_checklist_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "defense_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defense_checklist_items" ADD CONSTRAINT "defense_checklist_items_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defense_questions" ADD CONSTRAINT "defense_questions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "defense_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defense_questions" ADD CONSTRAINT "defense_questions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defense_assets" ADD CONSTRAINT "defense_assets_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "defense_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defense_assets" ADD CONSTRAINT "defense_assets_document_version_id_fkey" FOREIGN KEY ("document_version_id") REFERENCES "document_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defense_assets" ADD CONSTRAINT "defense_assets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ───────────────── Hand-written integrity, append-only & search objects ─────────────────

-- Trigram extension for global search (docs/08 "trigram/full-text index for global search fields")
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CHECK constraints (docs/08 Data Integrity)
ALTER TABLE "projects" ADD CONSTRAINT "projects_weights_sum_chk"
  CHECK ("weight_schedule" + "weight_tasks" + "weight_feedback" + "weight_risk" + "weight_readiness" + "weight_workload" = 100);
ALTER TABLE "projects" ADD CONSTRAINT "projects_weights_range_chk"
  CHECK ("weight_schedule" BETWEEN 0 AND 100 AND "weight_tasks" BETWEEN 0 AND 100 AND "weight_feedback" BETWEEN 0 AND 100
     AND "weight_risk" BETWEEN 0 AND 100 AND "weight_readiness" BETWEEN 0 AND 100 AND "weight_workload" BETWEEN 0 AND 100);
ALTER TABLE "projects" ADD CONSTRAINT "projects_dates_chk" CHECK ("end_date" >= "start_date");
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_dates_chk" CHECK ("end_date" >= "start_date");
ALTER TABLE "phases" ADD CONSTRAINT "phases_dates_chk" CHECK ("end_date" IS NULL OR "start_date" IS NULL OR "end_date" >= "start_date");
ALTER TABLE "risks" ADD CONSTRAINT "risks_probability_chk" CHECK ("probability" BETWEEN 1 AND 5);
ALTER TABLE "risks" ADD CONSTRAINT "risks_impact_chk" CHECK ("impact" BETWEEN 1 AND 5);
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_estimate_chk" CHECK ("estimate_points" IS NULL OR "estimate_points" BETWEEN 0 AND 100);
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_blocked_reason_chk" CHECK ("status" <> 'BLOCKED' OR "blocked_reason" IS NOT NULL);
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_no_self_chk" CHECK ("task_id" <> "depends_on_task_id");
ALTER TABLE "health_snapshots" ADD CONSTRAINT "health_snapshots_score_chk" CHECK ("score" BETWEEN 0 AND 100 AND "confidence" BETWEEN 0 AND 100);
ALTER TABLE "project_invites" ADD CONSTRAINT "project_invites_uses_chk" CHECK ("max_uses" >= 1 AND "use_count" >= 0 AND "use_count" <= "max_uses");
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_size_chk" CHECK ("byte_size" > 0);
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_duration_chk" CHECK ("duration_minutes" BETWEEN 5 AND 1440);
ALTER TABLE "defense_sections" ADD CONSTRAINT "defense_sections_duration_chk" CHECK ("duration_minutes" BETWEEN 0 AND 240);
ALTER TABLE "milestone_evidence" ADD CONSTRAINT "milestone_evidence_ref_chk" CHECK ("document_version_id" IS NOT NULL OR "url" IS NOT NULL OR "note" IS NOT NULL);
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_capacity_chk" CHECK ("capacity_points" IS NULL OR "capacity_points" >= 0);
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_capacity_chk" CHECK ("planned_capacity" IS NULL OR "planned_capacity" >= 0);

-- Only one active sprint per project
CREATE UNIQUE INDEX "sprints_one_active_per_project" ON "sprints" ("project_id") WHERE "status" = 'ACTIVE';

-- Append-only enforcement for history tables (docs/09 relationship rules, docs/29 audit record)
CREATE OR REPLACE FUNCTION capstone_forbid_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Table % is append-only', TG_TABLE_NAME USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "audit_logs_append_only" BEFORE UPDATE OR DELETE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION capstone_forbid_mutation();
CREATE TRIGGER "activity_events_append_only" BEFORE UPDATE ON "activity_events"
  FOR EACH ROW EXECUTE FUNCTION capstone_forbid_mutation();
CREATE TRIGGER "health_snapshots_append_only" BEFORE UPDATE ON "health_snapshots"
  FOR EACH ROW EXECUTE FUNCTION capstone_forbid_mutation();
CREATE TRIGGER "decision_revisions_append_only" BEFORE UPDATE OR DELETE ON "decision_revisions"
  FOR EACH ROW EXECUTE FUNCTION capstone_forbid_mutation();
CREATE TRIGGER "submission_artifacts_append_only" BEFORE UPDATE ON "submission_artifacts"
  FOR EACH ROW EXECUTE FUNCTION capstone_forbid_mutation();

-- Document versions are immutable binaries: only scan_status may change after insert.
CREATE OR REPLACE FUNCTION capstone_document_version_immutable() RETURNS trigger AS $$
BEGIN
  IF NEW.document_id IS DISTINCT FROM OLD.document_id OR NEW.version_number IS DISTINCT FROM OLD.version_number
     OR NEW.storage_key IS DISTINCT FROM OLD.storage_key OR NEW.checksum_sha256 IS DISTINCT FROM OLD.checksum_sha256
     OR NEW.byte_size IS DISTINCT FROM OLD.byte_size OR NEW.mime_type IS DISTINCT FROM OLD.mime_type
     OR NEW.original_name IS DISTINCT FROM OLD.original_name OR NEW.uploaded_by IS DISTINCT FROM OLD.uploaded_by THEN
    RAISE EXCEPTION 'document_versions rows are immutable' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "document_versions_immutable" BEFORE UPDATE ON "document_versions"
  FOR EACH ROW EXECUTE FUNCTION capstone_document_version_immutable();

-- Trigram indexes for global search (title-first ranking; docs/20)
CREATE INDEX "tasks_title_trgm" ON "tasks" USING gin ("title" gin_trgm_ops);
CREATE INDEX "milestones_title_trgm" ON "milestones" USING gin ("title" gin_trgm_ops);
CREATE INDEX "feedback_title_trgm" ON "feedback" USING gin ("title" gin_trgm_ops);
CREATE INDEX "documents_title_trgm" ON "documents" USING gin ("title" gin_trgm_ops);
CREATE INDEX "documents_tags_gin" ON "documents" USING gin ("tags");
CREATE INDEX "meetings_title_trgm" ON "meetings" USING gin ("title" gin_trgm_ops);
CREATE INDEX "decisions_title_trgm" ON "decisions" USING gin ("title" gin_trgm_ops);
CREATE INDEX "risks_title_trgm" ON "risks" USING gin ("title" gin_trgm_ops);
CREATE INDEX "issues_title_trgm" ON "issues" USING gin ("title" gin_trgm_ops);
