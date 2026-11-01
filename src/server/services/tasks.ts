import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/lib/errors";
import { recordAuditLog } from "@/server/services/audit";
import { TaskStatus, Priority, ProjectRole, SprintStatus, SprintScopeChangeType } from "@/generated/prisma";
import type { User, Task, TaskComment, TaskChecklistItem } from "@/generated/prisma";

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  acceptanceCriteria?: string;
  status?: TaskStatus;
  priority?: Priority;
  estimatePoints?: number;
  dueAt?: Date | string | null;
  sprintId?: string | null;
  milestoneId?: string | null;
  parentTaskId?: string | null;
  assigneeIds?: string[];
  labelIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  acceptanceCriteria?: string;
  status?: TaskStatus;
  priority?: Priority;
  estimatePoints?: number | null;
  dueAt?: Date | string | null;
  sprintId?: string | null;
  milestoneId?: string | null;
  blockedReason?: string | null;
  assigneeIds?: string[];
  labelIds?: string[];
}

export async function createTask(
  actor: User,
  input: CreateTaskInput
): Promise<Task> {
  // Validate project membership
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: input.projectId, userId: actor.id } },
  });

  if (!member || !member.active) {
    if (actor.systemRole !== "SYSTEM_ADMIN") {
      throw AppError.forbidden("You must be an active project member to create tasks.");
    }
  }

  const initialStatus = input.status || TaskStatus.BACKLOG;

  // Transaction to atomically compute next sequence number and create task with relations
  const task = await prisma.$transaction(async (tx) => {
    const maxTask = await tx.task.findFirst({
      where: { projectId: input.projectId },
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const currentMax = maxTask?.number || 0;

    const proj = await tx.project.findUniqueOrThrow({
      where: { id: input.projectId },
      select: { taskSequence: true },
    });

    const nextNumber = Math.max(proj.taskSequence, currentMax) + 1;

    await tx.project.update({
      where: { id: input.projectId },
      data: { taskSequence: nextNumber },
    });

    const created = await tx.task.create({
      data: {
        projectId: input.projectId,
        number: nextNumber,
        title: input.title.trim(),
        description: input.description?.trim(),
        acceptanceCriteria: input.acceptanceCriteria?.trim(),
        status: initialStatus,
        priority: input.priority || Priority.MEDIUM,
        estimatePoints: input.estimatePoints,
        dueAt: input.dueAt ? new Date(input.dueAt) : null,
        sprintId: input.sprintId || null,
        milestoneId: input.milestoneId || null,
        parentTaskId: input.parentTaskId || null,
        createdById: actor.id,
        startedAt: initialStatus === TaskStatus.IN_PROGRESS ? new Date() : null,
      },
    });

    // Assignees
    if (input.assigneeIds && input.assigneeIds.length > 0) {
      await tx.taskAssignee.createMany({
        data: input.assigneeIds.map((userId) => ({
          taskId: created.id,
          userId,
        })),
        skipDuplicates: true,
      });
    }

    // Labels
    if (input.labelIds && input.labelIds.length > 0) {
      await tx.taskLabel.createMany({
        data: input.labelIds.map((labelId) => ({
          taskId: created.id,
          labelId,
        })),
        skipDuplicates: true,
      });
    }

    // Check if added to an active sprint
    if (input.sprintId) {
      const sprint = await tx.sprint.findUnique({ where: { id: input.sprintId } });
      if (sprint && sprint.status === SprintStatus.ACTIVE) {
        await tx.sprintScopeChange.create({
          data: {
            sprintId: input.sprintId,
            taskId: created.id,
            type: SprintScopeChangeType.ADDED,
            afterStart: true,
            points: input.estimatePoints,
            actorId: actor.id,
          },
        });
      }
    }

    // Activity feed
    await tx.activityEvent.create({
      data: {
        projectId: input.projectId,
        actorId: actor.id,
        type: "TASK_CREATED",
        entityType: "Task",
        entityId: created.id,
        params: { title: created.title, number: created.number },
      },
    });

    return created;
  });

  return task;
}

export async function updateTask(
  actor: User,
  taskId: string,
  input: UpdateTaskInput
): Promise<Task> {
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignees: true },
  });

  if (!existing) {
    throw AppError.notFound("Task not found");
  }

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: existing.projectId, userId: actor.id } },
  });

  if (!member || !member.active) {
    if (actor.systemRole !== "SYSTEM_ADMIN") {
      throw AppError.forbidden("Permission denied.");
    }
  }

  // Permission check: Team Leader can edit anything. Students can update if they are assignee or creating comments/transitions.
  const isAssignee = existing.assignees.some((a) => a.userId === actor.id);
  const isLeader = member?.role === ProjectRole.TEAM_LEADER || actor.systemRole === "SYSTEM_ADMIN";

  if (!isLeader && !isAssignee && member?.role !== ProjectRole.SUPERVISOR) {
    throw AppError.forbidden("You can only edit tasks assigned to you.");
  }

  // Handle transition validation
  const updates: Record<string, unknown> = {};

  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description?.trim();
  if (input.acceptanceCriteria !== undefined) updates.acceptanceCriteria = input.acceptanceCriteria?.trim();
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.estimatePoints !== undefined) updates.estimatePoints = input.estimatePoints;
  if (input.dueAt !== undefined) updates.dueAt = input.dueAt ? new Date(input.dueAt) : null;
  if (input.milestoneId !== undefined) updates.milestoneId = input.milestoneId;

  if (input.status !== undefined && input.status !== existing.status) {
    // Transition rules (docs/13)
    if (input.status === TaskStatus.BLOCKED) {
      if (!input.blockedReason && !existing.blockedReason) {
        throw AppError.badRequest("Moving a task to Blocked requires a blocked_reason.");
      }
      updates.statusBeforeBlock = existing.status;
      updates.blockedReason = input.blockedReason || existing.blockedReason;
    } else {
      if (existing.status === TaskStatus.BLOCKED) {
        updates.blockedReason = null;
      }
    }

    if (input.status === TaskStatus.IN_PROGRESS && !existing.startedAt) {
      updates.startedAt = new Date();
    }

    if (input.status === TaskStatus.IN_REVIEW) {
      updates.inReviewAt = new Date();
    }

    if (input.status === TaskStatus.DONE) {
      updates.completedAt = new Date();
      if (!existing.firstCompletedAt) {
        updates.firstCompletedAt = new Date();
      }
    } else if (existing.status === TaskStatus.DONE) {
      // Reopening task
      updates.completedAt = null;
    }

    updates.status = input.status;
  }

  // Sprint change check
  let sprintChanged = false;
  if (input.sprintId !== undefined && input.sprintId !== existing.sprintId) {
    sprintChanged = true;
    updates.sprintId = input.sprintId;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.task.update({
      where: { id: taskId },
      data: updates,
    });

    // Handle Assignees update if provided
    if (input.assigneeIds !== undefined) {
      await tx.taskAssignee.deleteMany({ where: { taskId } });
      if (input.assigneeIds.length > 0) {
        await tx.taskAssignee.createMany({
          data: input.assigneeIds.map((userId) => ({
            taskId,
            userId,
          })),
          skipDuplicates: true,
        });
      }
    }

    // Handle Labels update if provided
    if (input.labelIds !== undefined) {
      await tx.taskLabel.deleteMany({ where: { taskId } });
      if (input.labelIds.length > 0) {
        await tx.taskLabel.createMany({
          data: input.labelIds.map((labelId) => ({
            taskId,
            labelId,
          })),
          skipDuplicates: true,
        });
      }
    }

    // Handle scope changes if moving out of or into active sprints
    if (sprintChanged) {
      if (existing.sprintId) {
        const oldSprint = await tx.sprint.findUnique({ where: { id: existing.sprintId } });
        if (oldSprint && oldSprint.status === SprintStatus.ACTIVE) {
          await tx.sprintScopeChange.create({
            data: {
              sprintId: existing.sprintId,
              taskId,
              type: SprintScopeChangeType.REMOVED,
              afterStart: true,
              points: existing.estimatePoints,
              actorId: actor.id,
            },
          });
        }
      }
      if (input.sprintId) {
        const newSprint = await tx.sprint.findUnique({ where: { id: input.sprintId } });
        if (newSprint && newSprint.status === SprintStatus.ACTIVE) {
          await tx.sprintScopeChange.create({
            data: {
              sprintId: input.sprintId,
              taskId,
              type: SprintScopeChangeType.ADDED,
              afterStart: true,
              points: existing.estimatePoints,
              actorId: actor.id,
            },
          });
        }
      }
    }

    // Activity log for status transition
    if (input.status && input.status !== existing.status) {
      await tx.activityEvent.create({
        data: {
          projectId: existing.projectId,
          actorId: actor.id,
          type: "TASK_STATUS_CHANGED",
          entityType: "Task",
          entityId: taskId,
          params: {
            title: existing.title,
            number: existing.number,
            from: existing.status,
            to: input.status,
          },
        },
      });
    }

    return res;
  });

  return updated;
}

export async function deleteTask(actor: User, taskId: string): Promise<void> {
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!existing) {
    throw AppError.notFound("Task not found");
  }

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: existing.projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.TEAM_LEADER) &&
    actor.systemRole !== "SYSTEM_ADMIN"
  ) {
    throw AppError.forbidden("Only Team Leaders can delete tasks.");
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "TASK_DELETED",
    entityType: "Task",
    entityId: taskId,
    projectId: existing.projectId,
    before: { title: existing.title, number: existing.number },
  });
}

// ───────────────────────────── Checklists & Comments ─────────────────────────────

export async function addChecklistItem(
  actor: User,
  taskId: string,
  text: string
): Promise<TaskChecklistItem> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw AppError.notFound("Task not found");

  const count = await prisma.taskChecklistItem.count({ where: { taskId } });

  return prisma.taskChecklistItem.create({
    data: {
      taskId,
      text: text.trim(),
      order: count + 1,
    },
  });
}

export async function toggleChecklistItem(
  actor: User,
  itemId: string,
  done: boolean
): Promise<TaskChecklistItem> {
  return prisma.taskChecklistItem.update({
    where: { id: itemId },
    data: {
      done,
      doneAt: done ? new Date() : null,
      doneById: done ? actor.id : null,
    },
  });
}

export async function addTaskComment(
  actor: User,
  taskId: string,
  body: string
): Promise<TaskComment> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw AppError.notFound("Task not found");

  return prisma.taskComment.create({
    data: {
      taskId,
      authorId: actor.id,
      body: body.trim(),
    },
  });
}

// ───────────────────────────── Dependencies ─────────────────────────────

export async function addTaskDependency(
  actor: User,
  taskId: string,
  dependsOnTaskId: string
): Promise<void> {
  if (taskId === dependsOnTaskId) {
    throw AppError.badRequest("A task cannot depend on itself.");
  }

  // Detect cycle dependency (A depends on B, B depends on A)
  const isDirectCycle = await prisma.taskDependency.findUnique({
    where: {
      taskId_dependsOnTaskId: {
        taskId: dependsOnTaskId,
        dependsOnTaskId: taskId,
      },
    },
  });

  if (isDirectCycle) {
    throw AppError.badRequest("Cycle dependency detected: task already blocks the target task.", "CYCLE_DEPENDENCY_DETECTED");
  }

  await prisma.taskDependency.create({
    data: {
      taskId,
      dependsOnTaskId,
    },
  });
}

export async function removeTaskDependency(
  actor: User,
  taskId: string,
  dependsOnTaskId: string
): Promise<void> {
  await prisma.taskDependency.delete({
    where: {
      taskId_dependsOnTaskId: {
        taskId,
        dependsOnTaskId,
      },
    },
  });
}

// ───────────────────────────── Sprints Lifecycle ─────────────────────────────

export async function createSprint(
  actor: User,
  projectId: string,
  name: string,
  startDate: Date | string,
  endDate: Date | string,
  goal?: string,
  plannedCapacity?: number
) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.TEAM_LEADER) &&
    actor.systemRole !== "SYSTEM_ADMIN"
  ) {
    throw AppError.forbidden("Only Team Leaders can manage sprints.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    throw AppError.badRequest("Sprint end date cannot be earlier than start date.");
  }

  return prisma.sprint.create({
    data: {
      projectId,
      name: name.trim(),
      goal: goal?.trim(),
      startDate: start,
      endDate: end,
      plannedCapacity,
      status: SprintStatus.PLANNED,
    },
  });
}

export async function startSprint(actor: User, sprintId: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: { tasks: true },
  });

  if (!sprint) throw AppError.notFound("Sprint not found");

  // Check if another sprint is currently active
  const activeSprint = await prisma.sprint.findFirst({
    where: { projectId: sprint.projectId, status: SprintStatus.ACTIVE },
  });

  if (activeSprint) {
    throw AppError.badRequest("Another sprint is currently active. Please close it first.");
  }

  const baselinePoints = sprint.tasks.reduce((acc, t) => acc + (t.estimatePoints || 0), 0);
  const baselineTaskCount = sprint.tasks.length;

  return prisma.sprint.update({
    where: { id: sprintId },
    data: {
      status: SprintStatus.ACTIVE,
      startedAt: new Date(),
      baselinePoints,
      baselineTaskCount,
    },
  });
}

export async function closeSprint(
  actor: User,
  sprintId: string,
  retrospective?: string,
  carryOverToSprintId?: string | null
) {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: { tasks: true },
  });

  if (!sprint) throw AppError.notFound("Sprint not found");

  const completedTasks = sprint.tasks.filter((t) => t.status === TaskStatus.DONE);
  const uncompletedTasks = sprint.tasks.filter((t) => t.status !== TaskStatus.DONE);

  const completedPoints = completedTasks.reduce((acc, t) => acc + (t.estimatePoints || 0), 0);
  const completedTaskCount = completedTasks.length;
  const carriedOverCount = uncompletedTasks.length;

  await prisma.$transaction(async (tx) => {
    await tx.sprint.update({
      where: { id: sprintId },
      data: {
        status: SprintStatus.CLOSED,
        closedAt: new Date(),
        completedPoints,
        completedTaskCount,
        carriedOverCount,
        retrospective: retrospective?.trim(),
      },
    });

    // Move uncompleted tasks to next sprint or back to backlog
    if (uncompletedTasks.length > 0) {
      for (const t of uncompletedTasks) {
        await tx.task.update({
          where: { id: t.id },
          data: {
            sprintId: carryOverToSprintId || null,
          },
        });

        await tx.sprintScopeChange.create({
          data: {
            sprintId,
            taskId: t.id,
            type: SprintScopeChangeType.CARRIED_OUT,
            afterStart: true,
            points: t.estimatePoints,
            actorId: actor.id,
          },
        });

        if (carryOverToSprintId) {
          await tx.sprintScopeChange.create({
            data: {
              sprintId: carryOverToSprintId,
              taskId: t.id,
              type: SprintScopeChangeType.CARRIED_IN,
              afterStart: false,
              points: t.estimatePoints,
              actorId: actor.id,
            },
          });
        }
      }
    }
  });
}
