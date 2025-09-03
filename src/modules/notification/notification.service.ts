import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';

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
  async getNotifications(userId: number, dto: GetNotificationsDto) {
    const limit = dto.limit ?? 20;
    let createdAtCursor: Date | null = null;
    let idCursor: string | null = null;
    if (dto.cursorId && dto.cursorCreatedAt) {
      createdAtCursor = new Date(dto.cursorCreatedAt);
      idCursor = dto.cursorId;
      if (isNaN(createdAtCursor.getTime())) {
        throw new BadRequestException('Invalid cursorCreatedAt');
      }
    }

    const where: Prisma.NotificationRecipientWhereInput = {
      userId,
      ...(dto.unreadOnly === 'true' ? { isRead: false } : {}),
      ...(dto.type ? { notification: { type: dto.type } } : {}),
      ...(createdAtCursor && idCursor
        ? {
            OR: [
              { createdAt: { lt: createdAtCursor } },
              { createdAt: createdAtCursor, id: { lt: idCursor } },
            ],
          }
        : {}),
    };

    const rows = await this.prisma.notificationRecipient.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        notification: true,
      },
    });

    const hasMore = rows.length > limit;
    const slice = rows.slice(0, limit);

    const items = rows.slice(0, limit).map((r) => ({
      id: r.id,
      type: r.notification.type,
      title: r.notification.title,
      body: r.notification.body,
      data: r.notification.data,
      createdAt: r.createdAt.toISOString(),
      isRead: r.isRead,
    }));

    const last = slice.at(-1);
    return {
      items,
      nextCursorId: hasMore ? last!.id : null,
      nextCursorCreatedAt: hasMore ? last!.createdAt.toISOString() : null,
    };
  }

  /**
   * Get unread notifications count for a user.
   */
  async getStats(
    userId: number,
  ): Promise<{ count: number; unreadCount: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const badgeCount = await this.prisma.notificationRecipient.count({
      where: {
        userId: userId,
        createdAt: { gt: user.lastSeenNotificationsAt ?? new Date(0) },
      },
    });
    const unreadCount = await this.prisma.notificationRecipient.count({
      where: { userId: userId, isRead: false },
    });
    return {
      count: badgeCount,
      unreadCount: unreadCount,
    };
  }

  /**
   * Mark a notification recipient as read for the given user.
   */
  async markSeen(userId: number) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
      },
      data: { lastSeenNotificationsAt: new Date()  },
    });
    return { success: true };
  }
}
