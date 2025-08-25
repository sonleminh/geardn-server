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
  async listForUser(userId: number, query: ListNotificationsDto) {
    // : Promise<{ items: UserNotification[]; nextCursor: string | null }>
    const cutoff = new Date(); // t0
    const limit = Math.min(Number(query.limit ?? 20), 50);
    const cursorId = query.cursor ? Number(query.cursor) : undefined;

    const rows = await this.prisma.notification.findMany({
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(cursorId ? { cursor: { id: String(cursorId) }, skip: 1 } : {}),
    });

    const items = rows.slice(0, limit);
    const nextCursor = rows.length > limit ? items[items.length - 1].id : null;

    return { items, nextCursor, cutoff };
  }

  /**
   * Get unread notifications count for a user.
   */
  async unreadCount(userId: number): Promise<{ count: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const unread: number = await this.prisma.notification.count({
      where: { createdAt: { gt: user.lastReadNotificationsAt ?? new Date(0) } },
    });
    return { count: unread };
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
