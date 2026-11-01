import { prisma } from "@/server/db/prisma";
import { NotificationCategory } from "@/generated/prisma";
import type { Notification } from "@/generated/prisma";

export interface CreateNotificationInput {
  userId: string;
  projectId?: string | null;
  category: NotificationCategory;
  type: string;
  params: Record<string, unknown>;
  href?: string | null;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      projectId: input.projectId || null,
      category: input.category,
      type: input.type,
      params: input.params as object,
      href: input.href || null,
    },
  });
}

export async function getUserNotifications(
  userId: string,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: {
      userId,
      archivedAt: null,
      ...(unreadOnly && { readAt: null }),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

