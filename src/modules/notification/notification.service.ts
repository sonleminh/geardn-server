import { Injectable } from '@nestjs/common';
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
  async listForUser(userId: number, query: ListNotificationsDto): Promise<{ items: UserNotification[]; nextCursor: string | null }> {
    const where: Prisma.NotificationRecipientWhereInput = {
      userId,
      ...(query.isRead !== undefined ? { isRead: query.isRead } : {}),
      ...(query.type ? { notification: { type: query.type } } : {}),
    };

    const take: number = query.limit ?? 20;
    const recipients = await this.prisma.notificationRecipient.findMany({
      where,
      include: { notification: true },
      orderBy: { notification: { createdAt: 'desc' } },
      take,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const items: UserNotification[] = recipients.map((r) => ({
      id: r.id,
      notificationId: r.notificationId,
      isRead: r.isRead,
      readAt: r.readAt,
      type: r.notification.type,
      title: r.notification.title,
      body: r.notification.body ?? null,
      data: (r.notification.data as Prisma.JsonValue) ?? null,
      createdAt: r.notification.createdAt,
    }));

    const nextCursor: string | null = recipients.length === take ? recipients[recipients.length - 1].id : null;
    return { items, nextCursor };
  }

  /**
   * Get unread notifications count for a user.
   */
  async unreadCount(userId: number): Promise<{ unread: number }> {
    const unread: number = await this.prisma.notificationRecipient.count({
      where: { userId, isRead: false },
    });
    return { unread };
  }

  /**
   * Mark a notification recipient as read for the given user.
   */
  async markRead(recipientId: string, userId: number): Promise<{ success: boolean }> {
    const result = await this.prisma.notificationRecipient.updateMany({
      where: { id: recipientId, userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: result.count > 0 };
  }
}

