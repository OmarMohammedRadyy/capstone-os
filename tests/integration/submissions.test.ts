import { describe, it, expect } from "vitest";
import { prisma } from "@/server/db/prisma";
import { createProject } from "@/server/services/projects";
import {
  createSubmission,
  completeRequirement,
  freezeSubmission,
  unfreezeSubmission,
} from "@/server/services/submissions";
import { SubmissionStatus, RequirementType, ProjectRole } from "@/generated/prisma";

describe("Submissions, Immutable Freeze & Supervisor Authorization Integration Tests", () => {
  it("should enforce mandatory requirements, generate immutable snapshot, and support supervisor unfreeze", async () => {
    const leader = (await prisma.user.findFirst())!;
    const supervisor = (await prisma.user.findFirst({ where: { id: { not: leader.id } } }))!;

    const project = await createProject(leader, {
      title: `Submissions Test Project ${Date.now()}`,
      code: `SUB-${Date.now().toString().slice(-4)}`,
      academicYear: "2025/2026",
      department: "Software Engineering",
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      supervisorId: supervisor.id,
      createDefaultPhases: false,
    });

    // 1. Create a submission deadline with mandatory & optional requirements
    const submission = await createSubmission(leader, {
      projectId: project.id,
      title: "Interim Progress Deliverable (Sprint 2)",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      requirements: [
        {
          type: RequirementType.DOCUMENT,
          title: "Architecture & Data Schema Specification",
          required: true,
        },
        {
          type: RequirementType.URL,
          title: "Staging URL for Interactive Preview",
          required: false,
        },
      ],
    });

    expect(submission.status).toBe(SubmissionStatus.PREPARING);

    const reqs = await prisma.submissionRequirement.findMany({
      where: { submissionId: submission.id },
    });
    expect(reqs).toHaveLength(2);
    const mandatoryReq = reqs.find((r) => r.required)!;

    // 2. Freezing MUST fail when mandatory requirement is incomplete
    await expect(
      freezeSubmission(leader, submission.id)
    ).rejects.toThrow(/mandatory requirement/);

    // 3. Complete mandatory requirement
    await completeRequirement(leader, mandatoryReq.id, true);

    // 4. Freezing now succeeds and creates immutable snapshot #1
    const snapshot = await freezeSubmission(leader, submission.id);
    expect(snapshot.sequence).toBe(1);
    expect(snapshot.readiness).toBeGreaterThan(0);

    const updatedSub = await prisma.submission.findUniqueOrThrow({
      where: { id: submission.id },
    });
    expect(updatedSub.status).toBe(SubmissionStatus.FROZEN);
    expect(updatedSub.frozenAt).toBeDefined();

    // 5. Modifying requirement while frozen MUST be rejected
    await expect(
      completeRequirement(leader, mandatoryReq.id, false)
    ).rejects.toThrow(/Cannot modify requirements of a frozen/);

    // 6. Supervisor unfreezes package for revision
    const unfrozen = await unfreezeSubmission(
      supervisor,
      submission.id,
      "Please update data dictionary section in ERD document"
    );
    expect(unfrozen.status).toBe(SubmissionStatus.PREPARING);
    expect(unfrozen.frozenAt).toBeNull();
  });
});

