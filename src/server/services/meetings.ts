import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/lib/errors";
import { createTask } from "@/server/services/tasks";
import { MeetingType, MeetingStatus, AttendanceStatus, ActionItemStatus, TaskStatus } from "@/generated/prisma";
import type { User, Meeting, MeetingAction, MeetingAttendee } from "@/generated/prisma";

export interface CreateMeetingInput {
  projectId: string;
  type: MeetingType;
  title: string;
  scheduledAt: Date | string;
  durationMinutes?: number;
  location?: string | null;
  agenda?: string | null;
  attendeeUserIds?: string[];
}

export async function createMeeting(
  actor: User,
  input: CreateMeetingInput
): Promise<Meeting> {
  const meeting = await prisma.$transaction(async (tx) => {
    const m = await tx.meeting.create({
      data: {
        projectId: input.projectId,
        type: input.type,
        title: input.title.trim(),
        scheduledAt: new Date(input.scheduledAt),
        durationMinutes: input.durationMinutes || 60,
        location: input.location?.trim() || null,
        agenda: input.agenda?.trim() || null,
        createdById: actor.id,
        status: MeetingStatus.SCHEDULED,
      },
    });

    if (input.attendeeUserIds && input.attendeeUserIds.length > 0) {
      await tx.meetingAttendee.createMany({
        data: input.attendeeUserIds.map((userId) => ({
          meetingId: m.id,
          userId,
          attendance: AttendanceStatus.INVITED,
        })),
        skipDuplicates: true,
      });
    }

    return m;
  });

  return meeting;
}

export async function updateMeetingMinutes(
  actor: User,
  meetingId: string,
  notes: string,
  summary?: string,
  openQuestions?: string,
  status: MeetingStatus = MeetingStatus.COMPLETED
): Promise<Meeting> {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) throw AppError.notFound("Meeting not found");

  return prisma.meeting.update({
    where: { id: meetingId },
    data: {
      notes: notes.trim(),
      summary: summary?.trim() || null,
      openQuestions: openQuestions?.trim() || null,
      status,
    },
  });
}

export async function updateAttendance(
  actor: User,
  meetingId: string,
  userId: string,
  attendance: AttendanceStatus
): Promise<MeetingAttendee> {
  return prisma.meetingAttendee.upsert({
    where: {
      meetingId_userId: { meetingId, userId },
    },
    update: { attendance },
    create: { meetingId, userId, attendance },
  });
}

export async function addMeetingAction(
  actor: User,
  meetingId: string,
  text: string,
  ownerId?: string | null,
  dueDate?: Date | string | null
): Promise<MeetingAction> {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) throw AppError.notFound("Meeting not found");

  return prisma.meetingAction.create({
    data: {
      meetingId,
      text: text.trim(),
      ownerId: ownerId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: ActionItemStatus.OPEN,
    },
  });
}

export async function convertActionToTask(
  actor: User,
  actionId: string
) {
  const action = await prisma.meetingAction.findUnique({
    where: { id: actionId },
    include: { meeting: true, task: true },
  });

  if (!action) throw AppError.notFound("Action item not found");
  if (action.task) {
    throw AppError.badRequest("This action item has already been converted to a task.");
  }

  // Create new task linked to this action item
  const task = await createTask(actor, {
    projectId: action.meeting.projectId,
    title: action.text,
    description: `Created from action item in meeting: "${action.meeting.title}"`,
    dueAt: action.dueDate,
    assigneeIds: action.ownerId ? [action.ownerId] : [],
    status: TaskStatus.READY,
  });

  // Link sourceActionId
  await prisma.task.update({
    where: { id: task.id },
    data: { sourceActionId: actionId },
  });

  return task;
}

