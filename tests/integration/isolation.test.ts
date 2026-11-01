import { describe, it, expect } from "vitest";
import { prisma } from "@/server/db/prisma";
import { createProject, getProjectBySlug, updateProjectSettings, archiveProject } from "@/server/services/projects";
import { createTask } from "@/server/services/tasks";
import { createDocument } from "@/server/services/documents";
import { SystemRole, ProjectRole, DocumentCategory } from "@/generated/prisma";
import type { User } from "@/generated/prisma";

describe("Cross-Project Isolation & IDOR Protection Integration Tests", () => {
  it("should prevent members of Project Alpha from accessing or modifying Project Beta", async () => {
    // 1. Create User Alpha and Project Alpha
    const userAlpha = await prisma.user.create({
      data: {
        email: `alpha.${Date.now()}@example.edu`,
        name: "Engineer Alpha",
        passwordHash: "hash-alpha",
        systemRole: SystemRole.USER,
      },
    });

    const projectAlpha = await createProject(userAlpha, {
      title: "Project Alpha Aerospace",
      code: `PA-${Date.now().toString().slice(-4)}`,
      academicYear: "2025/2026",
      department: "Aerospace",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createDefaultPhases: false,
    });

    // 2. Create User Beta and Project Beta
    const userBeta = await prisma.user.create({
      data: {
        email: `beta.${Date.now()}@example.edu`,
        name: "Engineer Beta",
        passwordHash: "hash-beta",
        systemRole: SystemRole.USER,
      },
    });

    const projectBeta = await createProject(userBeta, {
      title: "Project Beta Biomedical",
      code: `PB-${Date.now().toString().slice(-4)}`,
      academicYear: "2025/2026",
      department: "Biomedical",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createDefaultPhases: false,
    });

    // 3. User Alpha attempts to access Project Beta by slug -> FORBIDDEN
    await expect(
      getProjectBySlug(projectBeta.slug, userAlpha)
    ).rejects.toThrow(/do not have access to this project/);

    // 4. User Alpha attempts to inject a task into Project Beta -> FORBIDDEN
    await expect(
      createTask(userAlpha, {
        projectId: projectBeta.id,
        title: "Malicious Task Injection",
      })
    ).rejects.toThrow(/must be an active project member/);

    // 5. User Alpha attempts to upload a document into Project Beta -> FORBIDDEN
    await expect(
      createDocument(userAlpha, {
        projectId: projectBeta.id,
        title: "Unauthorized Document",
        category: DocumentCategory.REPORT,
      })
    ).rejects.toThrow(/must be an active project member/);

    // 6. User Alpha attempts to alter Project Beta health weights/settings -> FORBIDDEN
    await expect(
      updateProjectSettings(userAlpha, projectBeta.id, {
        weightSchedule: 20,
        weightTasks: 20,
        weightFeedback: 20,
        weightRisk: 20,
        weightReadiness: 10,
        weightWorkload: 10,
      })
    ).rejects.toThrow(/Only team leaders or administrators/);

    // 7. User Alpha attempts to archive Project Beta -> FORBIDDEN
    await expect(
      archiveProject(userAlpha, projectBeta.id)
    ).rejects.toThrow(/Only team leaders or administrators/);
  });
});

