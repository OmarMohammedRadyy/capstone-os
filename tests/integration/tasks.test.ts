import { describe, it, expect } from "vitest";
import { prisma } from "@/server/db/prisma";
import { createProject } from "@/server/services/projects";
import {
  createTask,
  updateTask,
  addTaskDependency,
  addChecklistItem,
  toggleChecklistItem,
} from "@/server/services/tasks";
import { TaskStatus, Priority } from "@/generated/prisma";

describe("Tasks, Board Transitions & Cycle Dependency Detection Integration Tests", () => {
  it("should create tasks, manage checklist, and detect circular dependencies", async () => {
    const actor = (await prisma.user.findFirst())!;
    const project = await createProject(actor, {
      title: `Tasks Test Project ${Date.now()}`,
      code: `TSK-${Date.now().toString().slice(-4)}`,
      academicYear: "2025/2026",
      department: "Computer Science",
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createDefaultPhases: false,
    });

    // 1. Create Task A
    const taskA = await createTask(actor, {
      projectId: project.id,
      title: "Core Authentication Architecture",
      status: TaskStatus.READY,
      priority: Priority.HIGH,
      estimatePoints: 5,
    });
    expect(taskA.number).toBeGreaterThan(0);
    expect(taskA.status).toBe(TaskStatus.READY);

    // 2. Add Checklist item to Task A and complete it
    const item = await addChecklistItem(actor, taskA.id, "Define session TTL and rotation");
    expect(item.done).toBe(false);

    const toggled = await toggleChecklistItem(actor, item.id, true);
    expect(toggled.done).toBe(true);

    // 3. Create Task B
    const taskB = await createTask(actor, {
      projectId: project.id,
      title: "API Gateway Authorization Guards",
      status: TaskStatus.BACKLOG,
      priority: Priority.MEDIUM,
      estimatePoints: 3,
    });

    // 4. Set dependency: Task B depends on Task A (Valid DAG)
    await addTaskDependency(actor, taskB.id, taskA.id);

    const dep = await prisma.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: {
          taskId: taskB.id,
          dependsOnTaskId: taskA.id,
        },
      },
    });
    expect(dep).toBeDefined();

    // 5. Attempt circular dependency: Task A depends on Task B -> MUST throw CYCLE_DEPENDENCY_DETECTED!
    await expect(
      addTaskDependency(actor, taskA.id, taskB.id)
    ).rejects.toThrow(/Cycle dependency detected/i);

    // 6. Transition Task A status
    const updated = await updateTask(actor, taskA.id, {
      status: TaskStatus.DONE,
    });
    expect(updated.status).toBe(TaskStatus.DONE);
    expect(updated.completedAt).toBeDefined();
  });
});
