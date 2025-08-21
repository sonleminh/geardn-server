import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class OutboxPoller {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('outbox-sync') private q: Queue,
  ) {}

  // chạy mỗi 5s
  @Cron('*/5 * * * * *')
  async run() {
    const batch = await this.prisma.outbox.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    if (!batch.length) return;

    // mark PROCESSING để tránh trùng xử lý nếu nhiều instance
    await this.prisma.outbox.updateMany({
      where: { id: { in: batch.map((b) => b.id) }, status: 'PENDING' },
      data: { status: 'PROCESSED' },
    });

    for (const evt of batch) {
      await this.q.add('publish', evt, { jobId: evt.id }); // idempotent
    }
  }
}
