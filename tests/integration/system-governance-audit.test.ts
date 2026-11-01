import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

// Mock next/headers cookies store for auth/session functions
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  })),
}));

import { prisma } from "@/server/db/prisma";
import { login, register } from "@/server/services/auth";
import {
  createProject,
  createProjectInviteWithCredentials,
  acceptProjectInvite,
  updateProjectSettings,
} from "@/server/services/projects";
import {
  createTask,
  updateTask,
  deleteTask,
  addTaskDependency,
} from "@/server/services/tasks";
import {
  createMilestone,
  requestMilestoneApproval,
  approveMilestone,
} from "@/server/services/milestones";
import {
  createFeedback,
  resolveFeedback,
  verifyFeedback,
} from "@/server/services/feedback";
import {
  createSubmission,
  completeRequirement,
  freezeSubmission,
  unfreezeSubmission,
} from "@/server/services/submissions";
import { createDecision } from "@/server/services/decisions";
import { createRisk } from "@/server/services/risks";
import { calculateProjectHealth } from "@/server/services/health";
import {
  ProjectRole,
  SystemRole,
  MilestoneStatus,
  TaskStatus,
  FeedbackSeverity,
  FeedbackCategory,
  FeedbackTargetType,
  FeedbackStatus,
  RequirementType,
  SubmissionStatus,
  DecisionStatus,
} from "@/generated/prisma";
import type { User, Project } from "@/generated/prisma";

describe("Capstone OS — Comprehensive System Governance & Multi-Role Logic Audit", () => {
  const runId = Date.now().toString().slice(-6);
  const passwordValid = "Capstone2026!StrictAuth";

  let leaderUser: User;
  let supervisorUser: User;
  let studentA: User;
  let studentB: User;
  let outsiderUser: User;
  let testProject: Project;
  let isolatedProject: Project;

  beforeAll(async () => {
    // 1. Provision Test Users
    const resLeader = await register(
      `leader.${runId}@audit.univ.edu`,
      `Leader ${runId}`,
      passwordValid,
      "ar"
    );
    leaderUser = resLeader.user;

    const resSupervisor = await register(
      `supervisor.${runId}@audit.univ.edu`,
      `Dr. Supervisor ${runId}`,
      passwordValid,
      "ar"
    );
    supervisorUser = resSupervisor.user;

    const resStudentA = await register(
      `studentA.${runId}@audit.univ.edu`,
      `Student Alpha ${runId}`,
      passwordValid,
      "ar"
    );
    studentA = resStudentA.user;

    const resStudentB = await register(
      `studentB.${runId}@audit.univ.edu`,
      `Student Beta ${runId}`,
      passwordValid,
      "ar"
    );
    studentB = resStudentB.user;

    const resOutsider = await register(
      `outsider.${runId}@audit.univ.edu`,
      `Outsider ${runId}`,
      passwordValid,
      "ar"
    );
    outsiderUser = resOutsider.user;

    // 2. Create Primary Graduation Project
    testProject = await createProject(leaderUser, {
      title: `Graduation Project Audit System ${runId}`,
      code: `GPA-${runId}`,
      academicYear: "2025-2026",
      department: "Software Engineering & Computer Science",
      startDate: new Date("2025-10-01"),
      endDate: new Date("2026-06-30"),
      createDefaultPhases: true,
      supervisorId: supervisorUser.id,
    });

    // Add Student A and Student B as Project Members
    await prisma.projectMember.createMany({
      data: [
        {
          projectId: testProject.id,
          userId: studentA.id,
          role: ProjectRole.STUDENT,
          responsibilityTitle: "Frontend Architect",
          capacityPoints: 35,
        },
        {
          projectId: testProject.id,
          userId: studentB.id,
          role: ProjectRole.STUDENT,
          responsibilityTitle: "Backend Architect",
          capacityPoints: 35,
        },
      ],
    });

    // 3. Create Isolated Secondary Project for IDOR testing
    isolatedProject = await createProject(outsiderUser, {
      title: `Isolated Beta Project ${runId}`,
      code: `ISO-${runId}`,
      academicYear: "2025-2026",
      department: "Data Engineering",
      startDate: new Date("2025-10-01"),
      endDate: new Date("2026-06-30"),
      createDefaultPhases: true,
    });
  });

  afterAll(async () => {
    // Project records are preserved with append-only audit trail
  });

  // =========================================================================
  // DOMAIN 1: AUTHENTICATION, PASSWORD SECURITY & LOCKOUT DEFENSE
  // =========================================================================
  describe("Domain 1: Authentication, Argon2id & Brute-Force Lockout", () => {
    it("1.1: should hash passwords using Argon2id with high cryptographic entropy", async () => {
      expect(leaderUser.passwordHash).toBeDefined();
      expect(leaderUser.passwordHash).toMatch(/^\$argon2id\$/);
    });

    it("1.2: should authenticate successfully with valid credentials", async () => {
      const loginRes = await login(leaderUser.email, passwordValid, "127.0.0.1", "Audit-Bot/1.0");
      expect(loginRes.user.id).toBe(leaderUser.id);
      expect(loginRes.user.failedLogins).toBe(0);
    });

    it("1.3: should enforce account lockout after exactly 5 consecutive failed attempts", async () => {
      const victim = await register(
        `lockout.target.${runId}@audit.univ.edu`,
        "Lockout Target",
        passwordValid,
        "ar"
      );

      // Perform 5 failed attempts
      for (let i = 1; i <= 5; i++) {
        await expect(
          login(victim.user.email, "WrongPassword#123", "127.0.0.1")
        ).rejects.toThrow(/Invalid email or password/);
      }

      // Check DB state for lockedUntil
      const updatedVictim = await prisma.user.findUniqueOrThrow({
        where: { id: victim.user.id },
      });
      expect(updatedVictim.failedLogins).toBe(5);
      expect(updatedVictim.lockedUntil).not.toBeNull();
      expect(updatedVictim.lockedUntil!.getTime()).toBeGreaterThan(Date.now());

      // 6th attempt must be blocked by rate limiting lockout
      await expect(
        login(victim.user.email, passwordValid, "127.0.0.1")
      ).rejects.toThrow(/temporarily locked/);
    });
  });

  // =========================================================================
  // DOMAIN 2: PROJECT PHASES & GRADUATION LIFECYCLE INITIALIZATION
  // =========================================================================
  describe("Domain 2: Project Lifecycle & 10 Default Graduation Phases", () => {
    it("2.1: should automatically instantiate all 10 graduation phases in sequential order", async () => {
      const phases = await prisma.phase.findMany({
        where: { projectId: testProject.id },
        orderBy: { order: "asc" },
      });

      expect(phases).toHaveLength(10);
      expect(phases[0]?.order).toBe(1);
      expect(phases[0]?.status).toBe("IN_PROGRESS");
      expect(phases[9]?.order).toBe(10);
      expect(phases[9]?.status).toBe("NOT_STARTED");
    });

    it("2.2: should automatically initialize defense plan and assign creator as TEAM_LEADER", async () => {
      const defensePlan = await prisma.defensePlan.findUnique({
        where: { projectId: testProject.id },
      });
      expect(defensePlan).toBeDefined();

      const leaderMembership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: testProject.id, userId: leaderUser.id },
        },
      });
      expect(leaderMembership).toBeDefined();
      expect(leaderMembership?.role).toBe(ProjectRole.TEAM_LEADER);
    });
  });

  // =========================================================================
  // DOMAIN 3: ACADEMIC INVITATION & PRE-PROVISIONING ENGINE
  // =========================================================================
  describe("Domain 3: Academic Invitations & Direct Account Pre-Provisioning", () => {
    it("3.1: should pre-provision an account with credentials when inviting a new academic supervisor", async () => {
      const inviteEmail = `prof.external.${runId}@partner.edu`;
      const customPassword = "ProfSecure@2026";

      const inviteResult = await createProjectInviteWithCredentials(leaderUser, testProject.id, {
        email: inviteEmail,
        name: "Prof. External Examiner",
        role: ProjectRole.SUPERVISOR,
        responsibilityTitle: "External Reviewer",
        password: customPassword,
      });

      expect(inviteResult.token).toBeDefined();
      expect(inviteResult.credentials.isNewAccount).toBe(true);
      expect(inviteResult.credentials.password).toBe(customPassword);

      // Verify user was pre-created in database with active hash
      const preUser = await prisma.user.findUnique({
        where: { email: inviteEmail },
      });
      expect(preUser).toBeDefined();
      expect(preUser?.passwordHash).toMatch(/^\$argon2id\$/);

      // Accept invite using the pre-created user
      const acceptResult = await acceptProjectInvite(preUser!, inviteResult.token);
      expect(acceptResult.membership.role).toBe(ProjectRole.SUPERVISOR);
      expect(acceptResult.membership.active).toBe(true);
    });

    it("3.2: should reject cross-user invitation theft (IDOR prevention on invites)", async () => {
      const targetedEmail = `targeted.${runId}@partner.edu`;
      const inviteResult = await createProjectInviteWithCredentials(leaderUser, testProject.id, {
        email: targetedEmail,
        name: "Targeted Member",
        role: ProjectRole.STUDENT,
      });

      // Outsider tries to accept an invitation addressed to someone else
      await expect(
        acceptProjectInvite(outsiderUser, inviteResult.token)
      ).rejects.toThrow(/addressed specifically to/);
    });
  });

  // =========================================================================
  // DOMAIN 4: AGILE BOARD, TASKS, CIRCULAR DEPENDENCY & ASSIGNEE BARRIERS
  // =========================================================================
  describe("Domain 4: Tasks, Agile Board Governance & Circular Cycle Blocking", () => {
    let task1Id: string;
    let task2Id: string;

    it("4.1: should allow Student to create a task assigned to Student A", async () => {
      const task = await createTask(studentA, {
        projectId: testProject.id,
        title: "Build Responsive Navigation Bar",
        description: "Develop the header component with RTL support",
        estimatePoints: 5,
        assigneeIds: [studentA.id],
      });

      expect(task).toBeDefined();
      expect(task.title).toBe("Build Responsive Navigation Bar");
      task1Id = task.id;
    });

    it("4.2: should PREVENT Student from deleting a task (Only Team Leader can delete)", async () => {
      await expect(
        deleteTask(studentA, task1Id)
      ).rejects.toThrow(/Only Team Leaders can delete tasks/);
    });

    it("4.3: should enforce Assignee-Only edit restriction for Student members", async () => {
      // Student B attempts to edit Student A's task -> FORBIDDEN
      await expect(
        updateTask(studentB, task1Id, { title: "Tampered by Student B" })
      ).rejects.toThrow(/You can only edit tasks assigned to you/);

      // Student A (Assignee) updates task -> SUCCEEDS
      const updated = await updateTask(studentA, task1Id, {
        title: "Build Responsive Navigation Bar (Updated)",
      });
      expect(updated.title).toBe("Build Responsive Navigation Bar (Updated)");
    });

    it("4.4: should require a blockedReason when moving a task to BLOCKED status", async () => {
      await expect(
        updateTask(studentA, task1Id, { status: TaskStatus.BLOCKED })
      ).rejects.toThrow(/requires a blocked_reason/);

      const blockedTask = await updateTask(studentA, task1Id, {
        status: TaskStatus.BLOCKED,
        blockedReason: "Waiting for design system token exports",
      });
      expect(blockedTask.status).toBe(TaskStatus.BLOCKED);
      expect(blockedTask.blockedReason).toBe("Waiting for design system token exports");
    });

    it("4.5: should detect and reject circular task dependencies (DFS cycle detection)", async () => {
      const task2 = await createTask(leaderUser, {
        projectId: testProject.id,
        title: "Configure CI/CD Pipeline",
        estimatePoints: 8,
      });
      task2Id = task2.id;

      // task1 depends on task2
      await addTaskDependency(studentA, task1Id, task2Id);

      // Attempting to make task2 depend on task1 creates a direct cycle -> MUST FAIL
      await expect(
        addTaskDependency(leaderUser, task2Id, task1Id)
      ).rejects.toThrow(/Cycle dependency detected/);
    });
  });

  // =========================================================================
  // DOMAIN 5: MILESTONE GOVERNANCE & SUPERVISORY STAGE-GATES
  // =========================================================================
  describe("Domain 5: Milestone Stage-Gates & Sovereign Supervisor Approval", () => {
    let milestoneId: string;

    it("5.1: should allow Team Leader to establish project milestones", async () => {
      const milestone = await createMilestone(leaderUser, {
        projectId: testProject.id,
        title: "Architectural Baseline Sign-off",
        objective: "Validate core domain boundaries and database schema integrity",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        requiresApproval: true,
      });

      expect(milestone).toBeDefined();
      expect(milestone.status).toBe(MilestoneStatus.NOT_STARTED);
      milestoneId = milestone.id;
    });

    it("5.2: should allow Student to request approval with submission notes", async () => {
      const requested = await requestMilestoneApproval(
        studentA,
        milestoneId,
        "All architectural diagrams and DB migrations are complete and ready for review."
      );
      expect(requested.status).toBe(MilestoneStatus.AWAITING_APPROVAL);
    });

    it("5.3: should PREVENT Student or Team Leader from self-approving milestone (Supervisor sovereign gate)", async () => {
      // Student self-approval attempt -> FORBIDDEN
      await expect(
        approveMilestone(studentA, milestoneId, "Student self-signoff")
      ).rejects.toThrow(/Only an Academic Supervisor can approve milestones/);

      // Team Leader self-approval attempt -> FORBIDDEN
      await expect(
        approveMilestone(leaderUser, milestoneId, "Leader self-signoff")
      ).rejects.toThrow(/Only an Academic Supervisor can approve milestones/);
    });

    it("5.4: should allow Academic Supervisor to formally approve milestone", async () => {
      const approved = await approveMilestone(
        supervisorUser,
        milestoneId,
        "Approved: Architecture meets departmental criteria."
      );

      expect(approved.status).toBe(MilestoneStatus.COMPLETED);
      expect(approved.approvedAt).not.toBeNull();
    });
  });

  // =========================================================================
  // DOMAIN 6: SUPERVISOR FEEDBACK & REMEDIATION LIFECYCLE
  // =========================================================================
  describe("Domain 6: Supervisor Feedback, Remediation & Verification Cycle", () => {
    let feedbackId: string;

    it("6.1: should PREVENT Student from creating supervisory feedback", async () => {
      await expect(
        createFeedback(studentA, {
          projectId: testProject.id,
          category: FeedbackCategory.TECHNICAL,
          severity: FeedbackSeverity.BLOCKING,
          title: "Unauthorized Student Feedback",
          body: "Trying to issue feedback as student",
          targetType: FeedbackTargetType.PROJECT,
        })
      ).rejects.toThrow(/Only Academic Supervisors can create feedback items/);
    });

    it("6.2: should allow Academic Supervisor to issue critical feedback", async () => {
      const fb = await createFeedback(supervisorUser, {
        projectId: testProject.id,
        category: FeedbackCategory.TECHNICAL,
        severity: FeedbackSeverity.BLOCKING,
        title: "Missing CSRF Protection in API Endpoints",
        body: "Ensure all state-modifying actions enforce CSRF tokens or SameSite cookie policies.",
        targetType: FeedbackTargetType.PROJECT,
        assigneeId: studentB.id,
      });

      expect(fb).toBeDefined();
      expect(fb.status).toBe(FeedbackStatus.OPEN);
      expect(fb.severity).toBe(FeedbackSeverity.BLOCKING);
      feedbackId = fb.id;
    });

    it("6.3: should allow Assignee Student to resolve feedback with proof note and URL", async () => {
      const resolved = await resolveFeedback(
        studentB,
        feedbackId,
        "Implemented SameSite=Lax and Anti-CSRF header verification on all POST actions.",
        undefined,
        "https://github.com/example/pr/42"
      );

      expect(resolved.status).toBe(FeedbackStatus.AWAITING_VERIFICATION);
      expect(resolved.resolutionNote).toContain("Implemented SameSite=Lax");
    });

    it("6.4: should PREVENT Student from verifying/closing feedback (Supervisor sovereign gate)", async () => {
      await expect(
        verifyFeedback(studentB, feedbackId, "Student verifying own fix")
      ).rejects.toThrow(/Only an Academic Supervisor can verify feedback/);
    });

    it("6.5: should allow Supervisor to verify and formally close feedback", async () => {
      const verified = await verifyFeedback(
        supervisorUser,
        feedbackId,
        "Verified: Security posture confirmed."
      );

      expect(verified.status).toBe(FeedbackStatus.VERIFIED);
      expect(verified.verifiedAt).not.toBeNull();
      expect(verified.verifiedById).toBe(supervisorUser.id);
    });
  });

  // =========================================================================
  // DOMAIN 7: SUBMISSION FREEZING & CRYPTOGRAPHIC ARTIFACT INTEGRITY
  // =========================================================================
  describe("Domain 7: Submissions, Mandatory Gatekeepers & Cryptographic Freeze", () => {
    let submissionId: string;
    let reqDocId: string;
    let reqUrlId: string;

    it("7.1: should allow Team Leader to create a submission deadline with mandatory items", async () => {
      const submission = await createSubmission(leaderUser, {
        projectId: testProject.id,
        title: "Interim System Thesis & Working Prototype",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        requirements: [
          {
            type: RequirementType.DOCUMENT,
            title: "System Architecture Specification (PDF)",
            required: true,
          },
          {
            type: RequirementType.URL,
            title: "Demonstrator URL",
            required: true,
          },
          {
            type: RequirementType.URL,
            title: "Optional User Manual Video",
            required: false,
          },
        ],
      });

      expect(submission).toBeDefined();
      expect(submission.status).toBe(SubmissionStatus.PREPARING);
      submissionId = submission.id;

      const reqs = await prisma.submissionRequirement.findMany({
        where: { submissionId },
      });
      expect(reqs).toHaveLength(3);
      reqDocId = reqs.find((r) => r.type === RequirementType.DOCUMENT)!.id;
      reqUrlId = reqs.find((r) => r.type === RequirementType.URL && r.required)!.id;
    });

    it("7.2: should PREVENT freezing when mandatory requirements are unfulfilled", async () => {
      await expect(
        freezeSubmission(leaderUser, submissionId)
      ).rejects.toThrow(/mandatory requirement\(s\) are incomplete/);
    });

    it("7.3: should complete requirements and reject Student attempt to freeze", async () => {
      // Complete mandatory requirements
      await completeRequirement(studentA, reqDocId, true, undefined, "https://docs.univ.edu/arch.pdf");
      await completeRequirement(studentB, reqUrlId, true, undefined, "https://staging.capstone.internal");

      // Student attempts to freeze -> FORBIDDEN
      await expect(
        freezeSubmission(studentA, submissionId)
      ).rejects.toThrow(/Only Team Leaders can freeze submissions/);
    });

    it("7.4: should allow Team Leader to freeze submission, creating immutable snapshot sequence #1", async () => {
      const snapshot = await freezeSubmission(leaderUser, submissionId);

      expect(snapshot.sequence).toBe(1);
      expect(snapshot.readiness).toBeGreaterThanOrEqual(66);

      const artifacts = await prisma.submissionArtifact.findMany({
        where: { snapshotId: snapshot.id },
      });
      expect(artifacts.length).toBeGreaterThan(0);

      const updatedSubmission = await prisma.submission.findUniqueOrThrow({
        where: { id: submissionId },
      });
      expect(updatedSubmission.status).toBe(SubmissionStatus.FROZEN);
    });

    it("7.5: should PREVENT Student from unfreezing submission (Supervisor sovereign gate)", async () => {
      await expect(
        unfreezeSubmission(studentA, submissionId, "Student trying to edit again")
      ).rejects.toThrow(/Only an Academic Supervisor can authorize unfreezing/);
    });

    it("7.6: should allow Academic Supervisor to unfreeze submission with revision reason", async () => {
      const unfrozen = await unfreezeSubmission(
        supervisorUser,
        submissionId,
        "Please update the database indexing section in Section 4.2."
      );

      expect(unfrozen.status).toBe(SubmissionStatus.PREPARING);
      expect(unfrozen.frozenAt).toBeNull();
    });
  });

  // =========================================================================
  // DOMAIN 8: ARCHITECTURAL DECISIONS (ADR) & RISK MATRIX
  // =========================================================================
  describe("Domain 8: Architectural Decision Records (ADR) & Risk Exposure", () => {
    it("8.1: should create ADR with atomic auto-incrementing number and revision snapshot", async () => {
      const adr = await createDecision(studentA, {
        projectId: testProject.id,
        title: "Adopt PostgreSQL 18 with Checked Constraints",
        context: "High relational integrity required for multi-role academic governance.",
        chosenOption: "Self-managed PostgreSQL 18",
        rationale: "Strict CHECK constraints for health weights and ACID transactions.",
        consequences: "Requires local and cloud PostgreSQL 18 instance maintenance.",
        options: [
          { title: "PostgreSQL 18", pros: "ACID, Native JSON, strict checks", cons: "Ops overhead" },
          { title: "NoSQL / MongoDB", pros: "Schema flexibility", cons: "Lack of relational integrity" },
        ],
      });

      expect(adr).toBeDefined();
      expect(adr.number).toBe(1);
      expect(adr.status).toBe(DecisionStatus.ACCEPTED);

      // Verify revision 1 was created
      const rev = await prisma.decisionRevision.findUnique({
        where: { decisionId_revision: { decisionId: adr.id, revision: 1 } },
      });
      expect(rev).toBeDefined();
    });

    it("8.2: should calculate Risk severity exposure (Probability × Impact)", async () => {
      const risk = await createRisk(leaderUser, {
        projectId: testProject.id,
        title: "API Third-party Deprecation Risk",
        probability: 4,
        impact: 5,
        mitigation: "Create abstraction adapter layer.",
      });

      expect(risk).toBeDefined();
      expect(risk.probability).toBe(4);
      expect(risk.impact).toBe(5);
      // Risk exposure = 4 * 5 = 20
    });

    it("8.3: should reject out-of-range risk probabilities (< 1 or > 5)", async () => {
      await expect(
        createRisk(leaderUser, {
          projectId: testProject.id,
          title: "Invalid Risk Bounds",
          probability: 7,
          impact: 3,
        })
      ).rejects.toThrow(/Probability and impact must be integer values between 1 and 5/);
    });
  });

  // =========================================================================
  // DOMAIN 9: EXPLAINABLE HEALTH ENGINE & DATABASE CHECK CONSTRAINTS
  // =========================================================================
  describe("Domain 9: 6-Dimension Health Engine & Strict Weight Sum Validation", () => {
    it("9.1: should compute deterministic health score across all 6 dimensions with explainable drivers", async () => {
      const health = await calculateProjectHealth(testProject.id, "audit-suite");

      expect(health.score).toBeGreaterThanOrEqual(0);
      expect(health.score).toBeLessThanOrEqual(100);
      expect(["EXCELLENT", "ON_TRACK", "NEEDS_ATTENTION", "AT_RISK", "CRITICAL"]).toContain(
        health.status
      );

      // Verify 6 components exist
      expect(health.components).toHaveProperty("schedule");
      expect(health.components).toHaveProperty("tasks");
      expect(health.components).toHaveProperty("feedback");
      expect(health.components).toHaveProperty("risks");
      expect(health.components).toHaveProperty("readiness");
      expect(health.components).toHaveProperty("workload");

      // Verify weights sum to 100
      const weightSum =
        health.weights.schedule +
        health.weights.tasks +
        health.weights.feedback +
        health.weights.risks +
        health.weights.readiness +
        health.weights.workload;
      expect(weightSum).toBe(100);
    });

    it("9.2: should REJECT project weight modifications when weights sum is not exactly 100", async () => {
      await expect(
        updateProjectSettings(leaderUser, testProject.id, {
          weightSchedule: 20,
          weightTasks: 20,
          weightFeedback: 20,
          weightRisk: 20,
          weightReadiness: 10,
          weightWorkload: 9, // Sum = 99 -> INVALID
        })
      ).rejects.toThrow(/must sum to exactly 100/);
    });

    it("9.3: should ACCEPT project weight modifications when weights sum is exactly 100", async () => {
      const updated = await updateProjectSettings(leaderUser, testProject.id, {
        weightSchedule: 25,
        weightTasks: 25,
        weightFeedback: 15,
        weightRisk: 15,
        weightReadiness: 10,
        weightWorkload: 10, // Sum = 100 -> VALID
      });

      expect(updated.weightSchedule).toBe(25);
      expect(updated.weightWorkload).toBe(10);
    });
  });

  // =========================================================================
  // DOMAIN 10: CROSS-PROJECT ISOLATION (IDOR) & IMMUTABLE AUDIT TRAIL
  // =========================================================================
  describe("Domain 10: Cross-Project Isolation & Immutable Audit Logging", () => {
    it("10.1: should PREVENT members of Project Alpha from managing or modifying Project Beta (IDOR Protection)", async () => {
      // Student A (from Project Alpha) tries to create a task in Isolated Project Beta -> FORBIDDEN
      await expect(
        createTask(studentA, {
          projectId: isolatedProject.id,
          title: "Intrusion Task Attempt",
        })
      ).rejects.toThrow(/You must be an active project member to create tasks/);

      // Leader of Project Alpha tries to modify Isolated Project Beta settings -> FORBIDDEN
      await expect(
        updateProjectSettings(leaderUser, isolatedProject.id, {
          title: "Hijacked Project Title",
        })
      ).rejects.toThrow(/Only team leaders or administrators can update project settings/);
    });

    it("10.2: should maintain an append-only audit log trail for governance operations", async () => {
      const logs = await prisma.auditLog.findMany({
        where: { projectId: testProject.id },
        orderBy: { createdAt: "desc" },
      });

      expect(logs.length).toBeGreaterThan(0);
      const actions = logs.map((l) => l.action);

      // Verify key governance actions were recorded
      expect(actions).toContain("PROJECT_INVITE_CREATED");
      expect(actions).toContain("PROJECT_SETTINGS_UPDATED");
    });
  });
});
