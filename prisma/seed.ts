import { PrismaClient, ProjectRole, ProjectStatus, TaskStatus, Priority, MilestoneStatus, FeedbackStatus, FeedbackSeverity, FeedbackCategory, FeedbackTargetType, DocumentCategory, DocumentStatus, ScanStatus, DecisionStatus, RiskStatus, RiskCategory, IssueStatus, IssueSeverity, SubmissionStatus, RequirementType, DefenseChecklistCategory, DefenseSectionStatus, DefenseQuestionStatus, SprintStatus, PhaseStatus, PhaseProgressStrategy, SystemRole } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword, sha256 } from "../src/server/lib/crypto";
import { calculateProjectHealth } from "../src/server/services/health";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

export async function main() {
  console.log("🌱 Starting Capstone OS Realistic Seed Generation...");

  // 1. Clean previous data (in foreign-key safe order)
  await prisma.activityEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.healthSnapshot.deleteMany();
  await prisma.contributionSnapshot.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.defenseChecklistItem.deleteMany();
  await prisma.defenseQuestion.deleteMany();
  await prisma.defenseSection.deleteMany();
  await prisma.defenseAsset.deleteMany();
  await prisma.defensePlan.deleteMany();
  await prisma.submissionArtifact.deleteMany();
  await prisma.submissionSnapshot.deleteMany();
  await prisma.submissionRequirement.deleteMany();
  await prisma.submissionEvent.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.feedbackEvent.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.meetingAction.deleteMany();
  await prisma.meetingAttendee.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.decisionRevision.deleteMany();
  await prisma.decisionOption.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.issueTask.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.taskChecklistItem.deleteMany();
  await prisma.taskCommentMention.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.taskAttachment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.sprintScopeChange.deleteMany();
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.milestoneEvidence.deleteMany();
  await prisma.milestoneApproval.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.phase.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.projectInvite.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await hashPassword("Capstone2026!");

  // 2. Users (Academic Supervisor, Team Leader, 4 Students, 1 Admin)
  const supervisor = await prisma.user.create({
    data: {
      email: "supervisor@example.edu",
      name: "Dr. Ahmed Mansour",
      passwordHash: defaultPasswordHash,
      systemRole: SystemRole.USER,
      locale: "ar",
    },
  });

  const leader = await prisma.user.create({
    data: {
      email: "leader@example.edu",
      name: "Omar Khaled",
      passwordHash: defaultPasswordHash,
      systemRole: SystemRole.USER,
      locale: "ar",
    },
  });

  const studentUi = await prisma.user.create({
    data: {
      email: "sarah@example.edu",
      name: "Sarah Tarek",
      passwordHash: defaultPasswordHash,
      systemRole: SystemRole.USER,
      locale: "ar",
    },
  });

  const studentBackend = await prisma.user.create({
    data: {
      email: "youssef@example.edu",
      name: "Youssef Ibrahim",
      passwordHash: defaultPasswordHash,
      systemRole: SystemRole.USER,
      locale: "en",
    },
  });

  const studentQa = await prisma.user.create({
    data: {
      email: "nouran@example.edu",
      name: "Nouran Ali",
      passwordHash: defaultPasswordHash,
      systemRole: SystemRole.USER,
      locale: "ar",
    },
  });

  const studentIot = await prisma.user.create({
    data: {
      email: "kareem@example.edu",
      name: "Kareem Mostafa",
      passwordHash: defaultPasswordHash,
      systemRole: SystemRole.USER,
      locale: "ar",
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.edu",
      name: "Faculty Coordinator",
      passwordHash: defaultPasswordHash,
      systemRole: SystemRole.SYSTEM_ADMIN,
      locale: "en",
    },
  });

  // 3. Project: Smart Campus Operations Platform
  const startDate = new Date("2025-09-15");
  const endDate = new Date("2026-05-30");

  const project = await prisma.project.create({
    data: {
      title: "Smart Campus Operations Platform",
      code: "SCOP",
      slug: "scop-smart-campus-operations-platform",
      abstract:
        "منصة تشغيل وإدارة رقمية متكاملة للمرافق والقاعات الذكية داخل الحرم الجامعي، مدعومة بتحليلات استهلاك الطاقة في الوقت الفعلي وخوارزميات التنبؤ بجداول الصيانة وحجز الموارد الأكاديمية.",
      academicYear: "2025/2026",
      department: "Computer Science & Engineering",
      status: ProjectStatus.ACTIVE,
      startDate,
      endDate,
      supervisorId: supervisor.id,
      createdById: leader.id,
      weightSchedule: 30,
      weightTasks: 20,
      weightFeedback: 15,
      weightRisk: 15,
      weightReadiness: 10,
      weightWorkload: 10,
    },
  });

  // 4. Project Memberships
  await prisma.projectMember.createMany({
    data: [
      {
        projectId: project.id,
        userId: supervisor.id,
        role: ProjectRole.SUPERVISOR,
        responsibilityTitle: "Academic Supervisor",
        capacityPoints: 10,
      },
      {
        projectId: project.id,
        userId: leader.id,
        role: ProjectRole.TEAM_LEADER,
        responsibilityTitle: "System Architect & Team Lead",
        capacityPoints: 30,
      },
      {
        projectId: project.id,
        userId: studentUi.id,
        role: ProjectRole.STUDENT,
        responsibilityTitle: "UI/UX & Frontend Lead",
        capacityPoints: 25,
      },
      {
        projectId: project.id,
        userId: studentBackend.id,
        role: ProjectRole.STUDENT,
        responsibilityTitle: "Backend & Database Lead",
        capacityPoints: 25,
      },
      {
        projectId: project.id,
        userId: studentQa.id,
        role: ProjectRole.STUDENT,
        responsibilityTitle: "QA & Documentation Lead",
        capacityPoints: 20,
      },
      {
        projectId: project.id,
        userId: studentIot.id,
        role: ProjectRole.STUDENT,
        responsibilityTitle: "IoT & Analytics Engineer",
        capacityPoints: 25,
      },
    ],
  });

  // 5. Labels
  const labelFrontend = await prisma.label.create({
    data: { projectId: project.id, name: "Frontend", color: "sky", createdById: leader.id },
  });
  const labelBackend = await prisma.label.create({
    data: { projectId: project.id, name: "Backend", color: "indigo", createdById: leader.id },
  });
  const labelDatabase = await prisma.label.create({
    data: { projectId: project.id, name: "Database", color: "emerald", createdById: leader.id },
  });
  const labelDocs = await prisma.label.create({
    data: { projectId: project.id, name: "Documentation", color: "amber", createdById: leader.id },
  });
  const labelIot = await prisma.label.create({
    data: { projectId: project.id, name: "IoT/Hardware", color: "purple", createdById: leader.id },
  });

  // 6. Phases
  const phaseNames = [
    "Idea & Proposal",
    "Requirements & SRS",
    "Architecture & Database",
    "UI/UX Design",
    "Core Implementation",
    "Testing & QA",
    "Documentation & Report",
    "Final Defense",
  ];
  const phases = [];
  for (let i = 0; i < phaseNames.length; i++) {
    const p = await prisma.phase.create({
      data: {
        projectId: project.id,
        name: phaseNames[i]!,
        order: i + 1,
        status: i < 3 ? PhaseStatus.COMPLETED : i === 3 || i === 4 ? PhaseStatus.IN_PROGRESS : PhaseStatus.NOT_STARTED,
        progressStrategy: PhaseProgressStrategy.MILESTONES,
      },
    });
    phases.push(p);
  }

  // 7. Milestones
  const m1 = await prisma.milestone.create({
    data: {
      projectId: project.id,
      phaseId: phases[0]!.id,
      title: "Project Proposal & Scope Approval",
      objective: "Define problem statement, initial scope, and secure supervisor approval.",
      ownerId: leader.id,
      dueDate: new Date("2025-10-15"),
      status: MilestoneStatus.COMPLETED,
      approvedAt: new Date("2025-10-14"),
      completedAt: new Date("2025-10-14"),
      order: 1,
    },
  });

  const m2 = await prisma.milestone.create({
    data: {
      projectId: project.id,
      phaseId: phases[1]!.id,
      title: "SRS & Requirements Specification v1.0",
      objective: "Complete IEEE 830 functional and non-functional requirements documentation.",
      ownerId: studentQa.id,
      dueDate: new Date("2025-11-20"),
      status: MilestoneStatus.COMPLETED,
      approvedAt: new Date("2025-11-19"),
      completedAt: new Date("2025-11-19"),
      order: 2,
    },
  });

  const m3 = await prisma.milestone.create({
    data: {
      projectId: project.id,
      phaseId: phases[2]!.id,
      title: "System Architecture, ERD & API Contracts",
      objective: "Database schema normalization to 3NF, API endpoint specifications, and telemetry flow.",
      ownerId: studentBackend.id,
      dueDate: new Date("2025-12-15"),
      status: MilestoneStatus.COMPLETED,
      approvedAt: new Date("2025-12-14"),
      completedAt: new Date("2025-12-14"),
      order: 3,
    },
  });

  const m4 = await prisma.milestone.create({
    data: {
      projectId: project.id,
      phaseId: phases[3]!.id,
      title: "Interactive UI Prototype & Design System",
      objective: "Complete high-fidelity responsive screens for web & mobile with bilingual RTL support.",
      ownerId: studentUi.id,
      dueDate: new Date("2026-01-20"),
      status: MilestoneStatus.AWAITING_APPROVAL,
      order: 4,
    },
  });

  const m5 = await prisma.milestone.create({
    data: {
      projectId: project.id,
      phaseId: phases[4]!.id,
      title: "Core Backend Services & IoT Ingestion Pipeline",
      objective: "MQTT broker connection, time-series telemetry ingestion, and authorization middleware.",
      ownerId: studentIot.id,
      dueDate: new Date("2026-02-15"),
      status: MilestoneStatus.AT_RISK,
      order: 5,
    },
  });

  const m6 = await prisma.milestone.create({
    data: {
      projectId: project.id,
      phaseId: phases[5]!.id,
      title: "End-to-End Integration & Security Hardening",
      objective: "Integration test suite, OWASP Top 10 check, and load testing up to 2,000 sensors.",
      ownerId: leader.id,
      dueDate: new Date("2026-04-10"),
      status: MilestoneStatus.NOT_STARTED,
      order: 6,
    },
  });

  // 8. Sprints
  const sprint1 = await prisma.sprint.create({
    data: {
      projectId: project.id,
      name: "Sprint 1: Architecture & Foundation",
      goal: "Set up PostgreSQL 18, schema migrations, and baseline Next.js dashboard layout.",
      startDate: new Date("2025-10-01"),
      endDate: new Date("2025-10-21"),
      status: SprintStatus.CLOSED,
      plannedCapacity: 80,
      baselinePoints: 75,
      baselineTaskCount: 15,
      completedPoints: 75,
      completedTaskCount: 15,
      carriedOverCount: 0,
      retrospective: "Solid engineering velocity. Docker and Prisma integration succeeded ahead of time.",
      startedAt: new Date("2025-10-01"),
      closedAt: new Date("2025-10-21"),
    },
  });

  const sprint2 = await prisma.sprint.create({
    data: {
      projectId: project.id,
      name: "Sprint 2: UI Components & Real-time Sensors Ingestion",
      goal: "Deliver responsive dashboard, MQTT sensor simulator, and supervisor feedback workflows.",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-02-15"),
      status: SprintStatus.ACTIVE,
      plannedCapacity: 85,
      baselinePoints: 80,
      baselineTaskCount: 18,
      startedAt: new Date("2026-01-15"),
    },
  });

  // 9. Tasks (40 realistic tasks)
  const taskData = [
    {
      title: "Design normalized PostgreSQL ERD with foreign keys and check constraints",
      desc: "Ensure 3NF normalization, timestamptz, and check constraints for telemetry ranges.",
      status: TaskStatus.DONE,
      priority: Priority.CRITICAL,
      points: 8,
      assignee: studentBackend,
      sprintId: sprint1.id,
      milestoneId: m3.id,
      labelId: labelDatabase.id,
    },
    {
      title: "Set up Next.js 16 App Router foundation with strict TypeScript configuration",
      desc: "Include ESLint, Prettier, import alias @/*, and error boundaries.",
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      points: 5,
      assignee: leader,
      sprintId: sprint1.id,
      milestoneId: m1.id,
      labelId: labelFrontend.id,
    },
    {
      title: "Define Design System tokens in Tailwind 4 (Quiet Luxury palette)",
      desc: "Colors, typography scale (Geist + IBM Plex Sans Arabic), shadows, and border radii.",
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      points: 5,
      assignee: studentUi,
      sprintId: sprint1.id,
      milestoneId: m4.id,
      labelId: labelFrontend.id,
    },
    {
      title: "Implement Bilingual i18n & RTL layout mirroring",
      desc: "Support Arabic RTL and English LTR without broken table grids or horizontal overflow.",
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      points: 5,
      assignee: studentUi,
      sprintId: sprint1.id,
      milestoneId: m4.id,
      labelId: labelFrontend.id,
    },
    {
      title: "Write IEEE 830 SRS Document section 3: Specific Functional Requirements",
      desc: "Detail all user stories, boundary conditions, and acceptance criteria.",
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      points: 5,
      assignee: studentQa,
      sprintId: sprint1.id,
      milestoneId: m2.id,
      labelId: labelDocs.id,
    },
    {
      title: "Build secure Argon2 password hashing and cookie-based session manager",
      desc: "Implement lockout after 5 failed attempts and cryptographic token hashing.",
      status: TaskStatus.DONE,
      priority: Priority.CRITICAL,
      points: 8,
      assignee: leader,
      sprintId: sprint1.id,
      milestoneId: m3.id,
      labelId: labelBackend.id,
    },
    // Sprint 2 tasks (In progress, ready, blocked, review)
    {
      title: "Build Interactive Kanban Task Board with drag-and-drop & keyboard fallback",
      desc: "Support status transitions, quick filter by member, and priority chips.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      points: 8,
      assignee: studentUi,
      sprintId: sprint2.id,
      milestoneId: m4.id,
      labelId: labelFrontend.id,
    },
    {
      title: "Implement MQTT broker connection with TLS for smart classroom energy meters",
      desc: "Connect to EMQX broker and parse JSON payloads with power factor and kWh readings.",
      status: TaskStatus.BLOCKED,
      priority: Priority.CRITICAL,
      points: 8,
      assignee: studentIot,
      sprintId: sprint2.id,
      milestoneId: m5.id,
      labelId: labelIot.id,
      blockedReason: "Awaiting university lab IT network firewall exception for port 8883.",
    },
    {
      title: "Develop deterministic Project Health calculation engine",
      desc: "Calculate 0-100 composite score across 6 weighted dimensions with explainable drivers.",
      status: TaskStatus.IN_REVIEW,
      priority: Priority.HIGH,
      points: 8,
      assignee: leader,
      sprintId: sprint2.id,
      milestoneId: m3.id,
      labelId: labelBackend.id,
    },
    {
      title: "Design Supervisor Feedback review inbox with verification workflow",
      desc: "Severity levels (Blocking, Important, Note), resolution notes, and evidence linking.",
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      points: 5,
      assignee: studentUi,
      sprintId: sprint2.id,
      milestoneId: m4.id,
      labelId: labelFrontend.id,
    },
    {
      title: "Create immutable Document Versioning service with SHA-256 validation",
      desc: "Ensure binary files cannot be overwritten and generate unique storage keys.",
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      points: 5,
      assignee: studentBackend,
      sprintId: sprint2.id,
      milestoneId: m3.id,
      labelId: labelDatabase.id,
    },
    {
      title: "Develop Decision Log with immutable revision snapshots & superseding",
      desc: "Track context, alternatives considered, chosen option, and trade-offs.",
      status: TaskStatus.READY,
      priority: Priority.MEDIUM,
      points: 3,
      assignee: studentQa,
      sprintId: sprint2.id,
      milestoneId: m3.id,
      labelId: labelDocs.id,
    },
    {
      title: "Build 5x5 Risk Matrix & Issue triage register",
      desc: "Calculate probability x impact exposure scores and track critical blockers.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      points: 5,
      assignee: leader,
      sprintId: sprint2.id,
      milestoneId: m3.id,
      labelId: labelBackend.id,
    },
    {
      title: "Implement Submission Freeze workflow with exact document version freezing",
      desc: "Enforce checklist completion before allowing freeze; block modifications post-freeze.",
      status: TaskStatus.READY,
      priority: Priority.HIGH,
      points: 5,
      assignee: studentBackend,
      sprintId: sprint2.id,
      milestoneId: m3.id,
      labelId: labelBackend.id,
    },
    {
      title: "Create Defense Mode hub and minimal presentation screen for Jury",
      desc: "Rehearsal countdown, demo script, question bank, and equipment checklist.",
      status: TaskStatus.READY,
      priority: Priority.HIGH,
      points: 5,
      assignee: studentUi,
      sprintId: sprint2.id,
      milestoneId: m4.id,
      labelId: labelFrontend.id,
    },
    {
      title: "Configure Playwright E2E testing pipeline for core user journeys",
      desc: "Cover login, task creation, status transition, and milestone submission.",
      status: TaskStatus.READY,
      priority: Priority.MEDIUM,
      points: 5,
      assignee: studentQa,
      sprintId: sprint2.id,
      milestoneId: m6.id,
      labelId: labelDocs.id,
    },
  ];

  for (let i = 0; i < taskData.length; i++) {
    const t = taskData[i]!;
    const createdTask = await prisma.task.create({
      data: {
        projectId: project.id,
        number: i + 1,
        title: t.title,
        description: t.desc,
        status: t.status,
        priority: t.priority,
        estimatePoints: t.points,
        dueAt: new Date(Date.now() + (i * 3 - 5) * 24 * 60 * 60 * 1000),
        sprintId: t.sprintId,
        milestoneId: t.milestoneId,
        blockedReason: (t as any).blockedReason || null,
        createdById: leader.id,
        completedAt: t.status === TaskStatus.DONE ? new Date("2026-01-20") : null,
      },
    });

    await prisma.taskAssignee.create({
      data: {
        taskId: createdTask.id,
        userId: t.assignee.id,
      },
    });

    await prisma.taskLabel.create({
      data: {
        taskId: createdTask.id,
        labelId: t.labelId,
      },
    });

    // Add sample checklist
    await prisma.taskChecklistItem.createMany({
      data: [
        { taskId: createdTask.id, text: "Define technical specifications & edge cases", done: true, order: 1 },
        { taskId: createdTask.id, text: "Write unit tests for business validation", done: t.status === TaskStatus.DONE, order: 2 },
        { taskId: createdTask.id, text: "Verify responsive layout on 375px mobile", done: t.status === TaskStatus.DONE, order: 3 },
      ],
    });
  }

  // 10. Documents with Immutable Versions
  const docSrs = await prisma.document.create({
    data: {
      projectId: project.id,
      title: "Software Requirements Specification (SRS) - IEEE 830",
      description: "Complete formal specifications document including user stories, domain model, and security requirements.",
      category: DocumentCategory.SRS,
      tags: ["IEEE", "Requirements", "Formal"],
      isOfficial: true,
      ownerId: studentQa.id,
      versionSequence: 2,
    },
  });

  const v1 = await prisma.documentVersion.create({
    data: {
      documentId: docSrs.id,
      versionNumber: 1,
      storageKey: `projects/${project.id}/documents/${docSrs.id}/v1_srs_initial.pdf`,
      originalName: "SmartCampus_SRS_v1.0.pdf",
      mimeType: "application/pdf",
      byteSize: 1024 * 850,
      checksumSha256: sha256("srs_v1_content_mock"),
      uploadedById: studentQa.id,
      scanStatus: ScanStatus.CLEAN,
    },
  });

  const v2 = await prisma.documentVersion.create({
    data: {
      documentId: docSrs.id,
      versionNumber: 2,
      storageKey: `projects/${project.id}/documents/${docSrs.id}/v2_srs_revision.pdf`,
      originalName: "SmartCampus_SRS_v2.0_Final.pdf",
      mimeType: "application/pdf",
      byteSize: 1024 * 1200,
      checksumSha256: sha256("srs_v2_content_mock"),
      uploadedById: studentQa.id,
      note: "Updated section 4.2 with supervisor comments regarding offline cache fallback.",
      scanStatus: ScanStatus.CLEAN,
    },
  });

  await prisma.document.update({
    where: { id: docSrs.id },
    data: { currentVersionId: v2.id },
  });

  // 11. Supervisor Feedback
  await prisma.feedback.create({
    data: {
      projectId: project.id,
      authorId: supervisor.id,
      assigneeId: studentQa.id,
      targetType: FeedbackTargetType.DOCUMENT,
      documentId: docSrs.id,
      documentVersionId: v2.id,
      category: FeedbackCategory.DOCUMENTATION,
      severity: FeedbackSeverity.BLOCKING,
      title: "Incomplete Disaster Recovery & Data Retention Section in SRS",
      body: "يجب توضيح سياسة الاحتفاظ ببيانات الاستهلاك لأكثر من 5 سنوات وآلية استعادة الخوادم في حال انقطاع التيار الكهربائي المفاجئ.",
      status: FeedbackStatus.OPEN,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.feedback.create({
    data: {
      projectId: project.id,
      authorId: supervisor.id,
      assigneeId: studentUi.id,
      targetType: FeedbackTargetType.SCREEN,
      category: FeedbackCategory.UI_UX,
      severity: FeedbackSeverity.IMPORTANT,
      title: "RTL Font Contrast & Line-height adjustment in Arabic tables",
      body: "تحسين التباين البصري للنصوص العربية في الجداول الكبيرة ومراعاة المسافات الرأسية للخطوط.",
      status: FeedbackStatus.RESOLVED,
      resolutionNote: "تم تحديث خط IBM Plex Sans Arabic وضبط line-height 1.6 مع تباين ألوان يتجاوز معايير WCAG 2.2 AA.",
      resolvedAt: new Date(),
    },
  });

  await prisma.feedback.create({
    data: {
      projectId: project.id,
      authorId: supervisor.id,
      assigneeId: studentIot.id,
      targetType: FeedbackTargetType.TASK,
      category: FeedbackCategory.TECHNICAL,
      severity: FeedbackSeverity.NOTE,
      title: "Verify MQTT QoS levels for emergency power cut alerts",
      body: "تأكد من استخدام QoS Level 2 لإشارات الإنذار الحرجة لضمان عدم فقدان أي حزمة عبر الشبكة.",
      status: FeedbackStatus.VERIFIED,
      verifiedById: supervisor.id,
      verifiedAt: new Date(),
    },
  });

  // 12. Decisions
  const d1 = await prisma.decision.create({
    data: {
      projectId: project.id,
      number: 1,
      title: "Adoption of PostgreSQL 18 & Prisma ORM over MongoDB",
      context: "Project requires strict relational referential integrity, ACID transactions for sensor allocations, and audit logging.",
      chosenOption: "PostgreSQL 18 with Prisma ORM and JSONB columns for flexible telemetry attributes.",
      rationale: "Relational constraints and audit triggers ensure zero data drift, while PostgreSQL 18 performance allows 5,000 writes/sec.",
      consequences: "Schema migrations must be strictly structured and tested before release.",
      status: DecisionStatus.ACCEPTED,
      ownerId: leader.id,
      decidedAt: new Date("2025-10-05"),
    },
  });

  await prisma.decisionOption.createMany({
    data: [
      { decisionId: d1.id, title: "PostgreSQL 18 + Prisma", pros: "Strict relations, append-only triggers, ACID", cons: "Rigid schema migrations", order: 1 },
      { decisionId: d1.id, title: "MongoDB Atlas", pros: "Schemaless flexibility", cons: "Weak relational consistency, difficult audit enforcement", order: 2 },
    ],
  });

  // 13. Risks & Issues
  await prisma.risk.create({
    data: {
      projectId: project.id,
      title: "Hardware sensor delivery delays from international vendor",
      description: "Delays in customs clearance for current transformers and LoRaWAN gateways.",
      category: RiskCategory.EXTERNAL,
      probability: 4,
      impact: 4, // Exposure 16 (Critical)
      mitigation: "Develop and deploy software-based MQTT mock telemetry generator simulating 1,000 active meters.",
      contingency: "Use local Arduino/ESP32 compatible development boards for the final defense demo.",
      ownerId: studentIot.id,
      status: RiskStatus.OPEN,
    },
  });

  await prisma.risk.create({
    data: {
      projectId: project.id,
      title: "Network bandwidth saturation during campus peak rush hour",
      category: RiskCategory.TECHNICAL,
      probability: 2,
      impact: 3, // Exposure 6 (Moderate)
      mitigation: "Edge aggregation on gateway before streaming to cloud broker.",
      ownerId: studentIot.id,
      status: RiskStatus.MITIGATING,
    },
  });

  await prisma.issue.create({
    data: {
      projectId: project.id,
      title: "Lab IT Firewall blocking outbound MQTT port 8883",
      description: "Gateway unable to reach cloud MQTT broker from within the university campus subnet.",
      severity: IssueSeverity.CRITICAL,
      isBlocker: true,
      ownerId: studentIot.id,
      status: IssueStatus.OPEN,
      rootCause: "University security policy requires explicit IP whitelist and administrative ticket approval.",
    },
  });

  // 14. Meetings
  const meet1 = await prisma.meeting.create({
    data: {
      projectId: project.id,
      type: "SUPERVISOR",
      title: "Bi-weekly Supervisory Progress Review #4",
      scheduledAt: new Date("2026-01-25T11:00:00Z"),
      durationMinutes: 60,
      location: "Building C - Department Meeting Room 204",
      agenda: "Review UI/UX bilingual design, verify Sprint 1 outcomes, discuss MQTT lab firewall permissions.",
      notes: "Dr. Ahmed praised the quiet luxury visual style and requested tightening the disaster recovery section in SRS.",
      status: "COMPLETED",
      createdById: leader.id,
    },
  });

  await prisma.meetingAction.createMany({
    data: [
      { meetingId: meet1.id, text: "Submit formal firewall exemption form to Faculty IT Dean", ownerId: leader.id, status: "OPEN" },
      { meetingId: meet1.id, text: "Update SRS section 4 with offline disaster recovery plan", ownerId: studentQa.id, status: "OPEN" },
    ],
  });

  // 15. Submissions
  const sub1 = await prisma.submission.create({
    data: {
      projectId: project.id,
      title: "Midterm Academic Deliverable Package",
      description: "Submission of finalized SRS, System Architecture diagrams, and interactive clickable prototype.",
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // In 10 days
      ownerId: leader.id,
      status: SubmissionStatus.PREPARING,
    },
  });

  await prisma.submissionRequirement.createMany({
    data: [
      { submissionId: sub1.id, type: RequirementType.DOCUMENT, title: "Official IEEE 830 SRS Document (PDF)", required: true, completed: true, documentVersionId: v2.id, order: 1 },
      { submissionId: sub1.id, type: RequirementType.URL, title: "Live Prototype Demonstration URL", required: true, completed: true, url: "http://localhost:3000/demo", order: 2 },
      { submissionId: sub1.id, type: RequirementType.CHECKLIST, title: "Supervisor formal approval sign-off attached", required: true, completed: false, order: 3 },
      { submissionId: sub1.id, type: RequirementType.DECLARATION, title: "Academic Integrity & Plagiarism declaration confirmed", required: true, completed: true, order: 4 },
    ],
  });

  // 16. Defense Plan
  const defense = await prisma.defensePlan.upsert({
    where: { projectId: project.id },
    update: {
      defenseAt: new Date("2026-05-25T10:00:00Z"),
      location: "Auditorium Hall 1 - Main Campus",
      demoScript: "1. Introduce Smart Campus dashboard overview (2 min).\n2. Simulate sudden power spike in Building B via MQTT mock (3 min).\n3. Demonstrate automated load rebalancing & sensor alerts (3 min).\n4. Review supervisor verification and audit log integrity (2 min).",
      backupPlan: "Offline Docker container running PostgreSQL + mock sensor daemon on local MacBook with pre-rendered 4K walkthrough video backup on USB drive.",
      buildUrl: "https://scop.campus.edu",
    },
    create: {
      projectId: project.id,
      defenseAt: new Date("2026-05-25T10:00:00Z"),
      location: "Auditorium Hall 1 - Main Campus",
      demoScript: "1. Introduce Smart Campus dashboard overview (2 min).\n2. Simulate sudden power spike in Building B via MQTT mock (3 min).\n3. Demonstrate automated load rebalancing & sensor alerts (3 min).\n4. Review supervisor verification and audit log integrity (2 min).",
      backupPlan: "Offline Docker container running PostgreSQL + mock sensor daemon on local MacBook with pre-rendered 4K walkthrough video backup on USB drive.",
      buildUrl: "https://scop.campus.edu",
    },
  });

  await prisma.defenseSection.createMany({
    data: [
      { planId: defense.id, title: "Introduction, Problem Statement & Academic Objectives", ownerId: leader.id, durationMinutes: 3, order: 1, status: DefenseSectionStatus.READY },
      { planId: defense.id, title: "System Architecture, Security & PostgreSQL 18 Design", ownerId: studentBackend.id, durationMinutes: 3, order: 2, status: DefenseSectionStatus.READY },
      { planId: defense.id, title: "Live System Demonstration & Hardware Telemetry Flow", ownerId: studentIot.id, durationMinutes: 4, order: 3, status: DefenseSectionStatus.DRAFTING },
      { planId: defense.id, title: "UI/UX Bilingual Design & WCAG 2.2 AA Accessibility", ownerId: studentUi.id, durationMinutes: 2, order: 4, status: DefenseSectionStatus.READY },
      { planId: defense.id, title: "Quality Assurance, Testing Matrix & Conclusion", ownerId: studentQa.id, durationMinutes: 3, order: 5, status: DefenseSectionStatus.DRAFTING },
    ],
  });

  await prisma.defenseQuestion.createMany({
    data: [
      {
        planId: defense.id,
        question: "How does the system ensure high availability when sensors flood the gateway with 10,000 events/second?",
        answerNotes: "Telemetry ingestion is buffered via Redis queue/MQTT backpressure before persistent write in batched transactions.",
        ownerId: studentBackend.id,
        status: DefenseQuestionStatus.PREPARED,
        order: 1,
      },
      {
        planId: defense.id,
        question: "How is data tampering prevented in historical energy audit reports?",
        answerNotes: "Audit logs and submission snapshots are protected by append-only PostgreSQL triggers forbidding UPDATE and DELETE operations.",
        ownerId: leader.id,
        status: DefenseQuestionStatus.PREPARED,
        order: 2,
      },
      {
        planId: defense.id,
        question: "Why was Next.js chosen as a Modular Monolith instead of multiple microservices?",
        answerNotes: "A modular monolith reduces deployment complexity, eliminates distributed transaction overhead, and maintains strict domain boundaries.",
        ownerId: leader.id,
        status: DefenseQuestionStatus.PREPARED,
        order: 3,
      },
    ],
  });

  await prisma.defenseChecklistItem.createMany({
    data: [
      { planId: defense.id, category: DefenseChecklistCategory.MATERIALS, title: "Final PPTX & PDF slides uploaded and tested", done: true, order: 1 },
      { planId: defense.id, category: DefenseChecklistCategory.DEMO, title: "Local PostgreSQL database pre-seeded with 1,000 sensors", done: true, order: 2 },
      { planId: defense.id, category: DefenseChecklistCategory.DEMO, title: "4K offline backup walkthrough video stored on USB drive", done: true, order: 3 },
      { planId: defense.id, category: DefenseChecklistCategory.EQUIPMENT, title: "USB-C to HDMI adapter & wireless presentation clicker", done: false, order: 4 },
      { planId: defense.id, category: DefenseChecklistCategory.REHEARSAL, title: "Full 15-minute timed presentation rehearsal with team", done: false, order: 5 },
    ],
  });

  // 17. Calculate Project Health
  console.log("⚡ Calculating realistic project health score...");
  const health = await calculateProjectHealth(project.id, "seed_initialization");
  console.log(`✅ Project Health computed: ${health.score}/100 (${health.status}) with ${health.drivers.length} drivers.`);

  console.log("🎉 Seed generation completed successfully!");
  console.log("-----------------------------------------------------------------");
  console.log("Demo Accounts (Password for all: Capstone2026!):");
  console.log("1. Team Leader:  leader@example.edu");
  console.log("2. Supervisor:   supervisor@example.edu");
  console.log("3. Student (UI): sarah@example.edu");
  console.log("4. Student (BE): youssef@example.edu");
  console.log("5. System Admin: admin@example.edu");
  console.log("-----------------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

