import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';

type UserNotification = {
  id: string;
  notificationId: string;
  isRead: boolean;
  readAt: Date | null;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Prisma.JsonValue | null;
  createdAt: Date;
};

/**
 * Service to query and update admin user notifications.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List notifications for a specific user with optional filters and cursor pagination.
   */
  async openNotifications(userId: number, query: ListNotificationsDto) {
    // : Promise<{ items: UserNotification[]; nextCursor: string | null }>
    const limit = Math.min(Number(query.limit ?? 20), 50);
    const result = await this.prisma.$transaction(async (tx) => {
      const t0 = new Date();

      await tx.notificationUser.updateMany({
        where: {
          userId,
          readAt: null,
          notification: { createdAt: { lte: t0 } },
        },
        data: { readAt: t0 },
      });

      const rows = await tx.notificationUser.findMany({
        where: { userId },
        include: { notification: true },
        orderBy: { notificationId: 'desc' },
        take: limit + 1,
        ...(query.cursor
          ? {
              cursor: {
                notificationId_userId: { notificationId: query.cursor, userId },
              },
              skip: 1,
            }
          : {}),
      });

      const items = rows.slice(0, limit).map((r) => ({
        id: r.notificationId,
        title: r.notification.title,
        body: r.notification.body,
        createdAt: r.notification.createdAt,
        read: !!r.readAt,
      }));
      const nextCursor =
        rows.length > limit ? items[items.length - 1].id : null;

      const unread = await tx.notificationUser.count({
        where: { userId, readAt: null },
      });

      return { items, nextCursor, unread, lastReadAt: t0.toISOString() };
    });
    return { data: result };
  }

  /**
   * Get unread notifications count for a user.
   */
  async unreadCount(
    userId: number,
  ): Promise<{ count: number; lastReadNotificationsAt: Date | null }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const unread: number = await this.prisma.notification.count({
      where: { createdAt: { gt: user.lastReadNotificationsAt ?? new Date(0) } },
    });
    return {
      count: unread,
      lastReadNotificationsAt: user.lastReadNotificationsAt,
    };
  }

  /**
   * Mark a notification recipient as read for the given user.
   */
  async markAllRead(userId: number, before: string) {
    const cutoff = new Date(before);
    console.log('co:', cutoff);
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        OR: [
          { lastReadNotificationsAt: null },
          { lastReadNotificationsAt: { lt: cutoff } },
        ],
      },
      data: { lastReadNotificationsAt: cutoff },
    });
    return { success: true };
  }
}
