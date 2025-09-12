import { Processor, WorkerHost } from '@nestjs/bullmq';
import { RealtimePublisher } from '../realtime/realtime.publisher';
import { Job } from 'bullmq';
import { Outbox, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Processor('outbox-sync')
export class NotificationsProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private rt: RealtimePublisher,
  ) {
    super();
  }

  isJsonObject = (v: Prisma.JsonValue): v is Prisma.JsonObject =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

  async process(job: Job<Outbox>): Promise<void> {
    const evt = job.data;
    const { eventType, payload } = evt;

    let resourceType: string | undefined;
    let resourceId: number | undefined;

    if (this.isJsonObject(payload)) {
      const rt = payload['resourceType'];
      const rid = payload['resourceId'];
      resourceType = typeof rt === 'string' ? rt : undefined;
      resourceId = typeof rid === 'number' ? rid : undefined;
    }

    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const notification = await this.prisma.notification.create({
      data: {
        type: eventType as any,
        title: this.buildTitle(eventType, payload),
        data: payload as any,
        resourceType,
        resourceId,
        recipients: {
          createMany: { data: admins.map((a) => ({ userId: a.id })) },
        },
      },
    });

    console.log('notification', notification);

    // realtime
    await this.rt.publish(notification);

    // đánh dấu outbox
    await this.prisma.outbox.update({
      where: { id: evt.id },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });
  }

  private buildTitle(t: string, p: any): string {
    if (t === 'ORDER_CREATED') return `Đơn mới #${p.orderCode}`;
    if (t === 'RETURN_REQUEST_CREATED') return `Yêu cầu hoàn đơn #${p.orderId}`;
    if (t === 'STOCK_LOW') return `Tạo att mới ${p.name}`;
    return t;
  }
}
